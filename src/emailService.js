import emailjs from '@emailjs/browser'

const SERVICE_ID = 'service_1fryqxp'
const TEMPLATE_ID = 'hgo9p1i'
const PUBLIC_KEY = 'SJXJURq0Xdoi3Y7Sg'

export async function sendEmail(to, subject, message) {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: to,
      subject: subject,
      message: message
    }, PUBLIC_KEY)
    console.log('Email sent successfully')
  } catch (err) {
    console.error('Email failed:', err)
  }
}

export function applicationSubmittedEmail(studentName, jobTitle, company) {
  return {
    subject: `Application Submitted — ${jobTitle} at ${company}`,
    message: `Hi ${studentName},\n\nYour application for ${jobTitle} at ${company} has been successfully submitted.\n\nThe employer will review your application and update your status. You will receive an email when there is an update.\n\nGood luck!\n\nCareerBridge Team`
  }
}

export function statusUpdatedEmail(studentName, jobTitle, company, newStatus) {
  const messages = {
    interview: `Hi ${studentName},\n\nCongratulations! You have been invited for an interview at ${company} for the position of ${jobTitle}.\n\nLog in to CareerBridge to see the interview details.\n\nGood luck!\n\nCareerBridge Team`,
    offer: `Hi ${studentName},\n\nAmazing news! You have received a job offer from ${company} for the position of ${jobTitle}. Congratulations!\n\nLog in to CareerBridge to view the full details.\n\nCareerBridge Team`,
    rejected: `Hi ${studentName},\n\nThank you for your interest in ${jobTitle} at ${company}. Unfortunately your application was not successful this time.\n\nKeep applying — the right opportunity is out there!\n\nCareerBridge Team`
  }
  const subjects = {
    interview: `🎯 Interview Invitation — ${jobTitle} at ${company}`,
    offer: `🏆 Job Offer Received — ${jobTitle} at ${company}`,
    rejected: `📋 Application Update — ${jobTitle} at ${company}`
  }
  return {
    subject: subjects[newStatus] || `Application Update — ${jobTitle}`,
    message: messages[newStatus] || messages.rejected
  }
}

export function interviewScheduledEmail(studentName, jobTitle, company, date, time, location, notes) {
  return {
    subject: `📅 Interview Scheduled — ${jobTitle} at ${company}`,
    message: `Hi ${studentName},\n\nYour interview for ${jobTitle} at ${company} has been scheduled.\n\nInterview Details:\n📅 Date: ${new Date(date).toLocaleDateString('en', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}\n⏰ Time: ${time}\n📍 Location: ${location}${notes ? `\n📝 Notes: ${notes}` : ''}\n\nGood luck with your interview!\n\nCareerBridge Team`
  }
}