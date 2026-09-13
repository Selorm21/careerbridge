// src/components/ImageUploader.jsx
import React, { useState, useRef } from 'react';
import {
  UploadCloud, Image as ImageIcon, X, CheckCircle2,
  Link2, AlertCircle, RefreshCw
} from 'lucide-react';
import { compressImage, formatBytes } from '../lib/imageUtils';

export default function ImageUploader({ imageAttachment, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [imageType, setImageType] = useState(imageAttachment?.type || 'flyer');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || !files[0]) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setErrorMsg('');
    setCompressing(true);

    try {
      const result = await compressImage(file, 1400, 1400, 0.84);
      onChange({
        url: result.dataUrl,
        type: imageType,
        originalName: file.name,
        size: result.size,
        dimensions: result.width ? `${result.width}x${result.height}` : 'Vector',
        format: result.format,
      });
    } catch (err) {
      console.error('Failed to process image:', err);
      setErrorMsg('Failed to process image. Please try another file.');
    } finally {
      setCompressing(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setErrorMsg('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setErrorMsg('');
    onChange({
      url: urlInput.trim(),
      type: imageType,
      originalName: 'Web Image Attachment',
      size: null,
      format: 'url',
    });
  };

  const handleRemove = () => {
    onChange(null);
    setUrlInput('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeChange = (type) => {
    setImageType(type);
    if (imageAttachment) onChange({ ...imageAttachment, type });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-brand-500" />
          Job Image / Promotional Flyer
          <span className="text-xs font-normal text-slate-400">(Recommended)</span>
        </label>

        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          {[
            { id: 'flyer', label: 'Job Flyer (3:4)' },
            { id: 'banner', label: 'Banner (16:9)' },
            { id: 'logo', label: 'Logo (1:1)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                imageType === t.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {!imageAttachment && (
        <div className="flex items-center gap-4 text-xs font-semibold border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 pb-1 -mb-2 border-b-2 transition-all ${
              activeTab === 'upload' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 pb-1 -mb-2 border-b-2 transition-all ${
              activeTab === 'url' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Paste Image Link
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {imageAttachment ? (
        <div className="relative border border-slate-200 rounded-2xl bg-slate-50/50 p-4 overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative rounded-xl overflow-hidden bg-slate-200 border border-slate-200 shadow-inner flex-shrink-0 w-36 h-28 sm:w-44 sm:h-32 flex items-center justify-center">
              <img
                src={imageAttachment.url}
                alt="Job attachment preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider">
                {imageAttachment.type}
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900 truncate">
                  {imageAttachment.originalName || 'Job flyer attached'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {imageAttachment.dimensions && (
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {imageAttachment.dimensions}
                  </span>
                )}
                {imageAttachment.size && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    Optimized: {formatBytes(imageAttachment.size)}
                  </span>
                )}
                <span className="text-slate-400 capitalize">Type: {imageAttachment.type}</span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-brand-500 bg-brand-50/50 scale-[1.01]' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/70 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 mx-auto flex items-center justify-center shadow-inner">
              {compressing ? <RefreshCw className="w-7 h-7 animate-spin text-brand-600" /> : <UploadCloud className="w-7 h-7" />}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {compressing ? 'Optimizing image...' : 'Click to upload flyer, banner, or logo'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Drag and drop your company flyer or job poster here
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="bg-slate-100 px-2 py-0.5 rounded">PNG</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">JPG</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">WEBP</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded">SVG</span>
              <span>· Max 10MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/company-job-flyer.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition shadow-sm"
            >
              Attach
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Paste any publicly accessible image link for your company recruitment poster or banner.
          </p>
        </div>
      )}
    </div>
  );
}