import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Use the caller's JWT so RLS enforces that this employer owns the job
    // and can see these applications/profiles. Do NOT use the service role
    // key here.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // 1. Fetch the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company, description, skills, location, type")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({
          error: "Job not found or you don't have access to it",
          details: jobError?.message ?? null,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Fetch applications for this job with candidate profile info
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(
        "id, status, created_at, profiles(id, full_name, university, course, graduation_year, skills, bio, verified)",
      )
      .eq("job_id", job_id);

    if (appsError) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch applications",
          details: appsError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!applications || applications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, ranked: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Build the candidate list for the prompt
    const candidatesForPrompt = applications.map((app) => ({
      application_id: app.id,
      name: app.profiles?.full_name ?? "Unknown",
      university: app.profiles?.university ?? "Not provided",
      course: app.profiles?.course ?? "Not provided",
      graduation_year: app.profiles?.graduation_year ?? "Not provided",
      skills: app.profiles?.skills ?? "Not provided",
      bio: app.profiles?.bio ?? "Not provided",
      verified: app.profiles?.verified ?? false,
    }));

    const prompt = `You are helping an employer rank job candidates. Score each candidate from 0-100 based on fit for this specific job, using their skills, course/university background, and bio.

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Type: ${job.type}
Description: ${job.description}
Required skills: ${job.skills}

CANDIDATES:
${JSON.stringify(candidatesForPrompt, null, 2)}

Return ONLY a JSON array (no markdown, no code fences, no extra text) with one object per candidate in this exact shape, sorted best-fit first:
[
  {
    "application_id": "the application_id from the input",
    "score": 0-100 integer,
    "reasoning": "one short sentence explaining the score, mentioning specific matched or missing skills"
  }
]`;

    // Scale output budget with candidate count so larger applicant pools
    // don't get truncated.
    const maxOutputTokens = Math.min(
      8192,
      1024 + candidatesForPrompt.length * 150,
    );

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiData);
      return new Response(
        JSON.stringify({
          error: "Gemini API request failed",
          details: geminiData,
        }),
        {
          status: geminiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "finishReason:",
      geminiData?.candidates?.[0]?.finishReason,
      "raw:",
      JSON.stringify(geminiData),
    );

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return new Response(
        JSON.stringify({
          error: "Gemini returned no text",
          finishReason: geminiData?.candidates?.[0]?.finishReason ?? null,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Strip markdown code fences if the model added them despite instructions
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let ranked;
    try {
      ranked = JSON.parse(cleaned);
    } catch (parseErr) {
      return new Response(
        JSON.stringify({
          error: "Could not parse Gemini's ranking output",
          raw: rawText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 4. Merge the AI scores back with the original application/profile data
    const appsById = new Map(applications.map((a) => [a.id, a]));
    const merged = ranked
      .map((r: { application_id: string; score: number; reasoning: string }) => {
        const app = appsById.get(r.application_id);
        if (!app) return null;
        return {
          application_id: app.id,
          score: r.score,
          reasoning: r.reasoning,
          status: app.status,
          profile: app.profiles,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    return new Response(
      JSON.stringify({ success: true, job: { id: job.id, title: job.title }, ranked: merged }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});