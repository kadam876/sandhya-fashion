import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import {
  X, Upload, RefreshCw, Download, Sparkles, Clipboard,
  AlertCircle, CheckCircle2, Camera
} from 'lucide-react';

const ARVirtualTryOn = lazy(() => import('./ARVirtualTryOn'));

import { API_BASE_URL } from '../config';

/**
 * AI Virtual Try-On
 * Calls backend proxy → HuggingFace Kolors Virtual Try-On
 * (Direct browser calls to HF are blocked by CORS — token lives on backend only)
 */

// Backend proxy endpoint — never call HF directly from the browser
const TRYON_API = `${API_BASE_URL}/tryon/generate`;

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function resizeImage(dataUrl, maxSize = 512) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      // quality 0.75 keeps size small
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = dataUrl;
  });
}

function fetchGarmentAsDataUrl(url) {
  // Don't append cache-buster to data: URIs
  if (url.startsWith('data:')) return Promise.resolve(url);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('CORS'));
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Main component ─────────────────────────────────────────────────────────
const VirtualTryOn = ({ product, onClose }) => {
  const [step, setStep]               = useState('upload');
  const [isARActive, setIsARActive]   = useState(false);
  const [userPhoto, setUserPhoto]     = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [pasteHint, setPasteHint]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [statusText, setStatusText]   = useState('');
  const [engine, setEngine]           = useState('standard'); // 'standard' (HF) or 'gemini'

  const fileInputRef  = useRef(null);
  const timerRef      = useRef(null);

  const productImageUrl = product?.imageUrl || product?.image || '';
  const productName     = product?.name || 'Product';

  // ── Load photo ─────────────────────────────────────────────────────────────
  const loadPhoto = useCallback((dataUrl) => {
    setUserPhoto(dataUrl);
    setStep('upload');
  }, []);

  // ── Global Ctrl+V ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => loadPhoto(ev.target.result);
          reader.readAsDataURL(file);
          setPasteHint(true);
          setTimeout(() => setPasteHint(false), 2500);
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadPhoto]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleClickPaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          const reader = new FileReader();
          reader.onload = (ev) => loadPhoto(ev.target.result);
          reader.readAsDataURL(blob);
          setPasteHint(true);
          setTimeout(() => setPasteHint(false), 2500);
          return;
        }
      }
    } catch { /* permission denied */ }
  };

  // ── Fake progress ──────────────────────────────────────────────────────────
  const startProgress = () => {
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += p < 30 ? 5 : p < 60 ? 2 : p < 80 ? 0.8 : 0.1;
      setProgress(Math.min(p, 88));
    }, engine === 'gemini' ? 400 : 700); // Gemini is faster
  };

  // ── AI generation ──────────────────────────────────────────────────────────
  const generateTryOn = async () => {
    if (!userPhoto || !productImageUrl) return;

    setStep('generating');
    setErrorMsg('');
    startProgress();
    setStatusText(engine === 'gemini' ? 'Connecting to Gemini Pro…' : 'Preparing images…');

    try {
      const resizedPerson = await resizeImage(userPhoto, engine === 'gemini' ? 1024 : 768);
      setStatusText(engine === 'gemini' ? 'Gemini is processing…' : 'Loading garment…');

      if (!resizedPerson || resizedPerson === 'data:,') {
        throw new Error('Failed to process your photo. Please try a different image.');
      }

      let garmentPayload;
      if (productImageUrl.startsWith('data:')) {
        let garmentDataUrl = await resizeImage(productImageUrl, engine === 'gemini' ? 1024 : 768);
        garmentPayload = { garmentImage: garmentDataUrl };
      } else {
        garmentPayload = { garmentUrl: productImageUrl };
      }

      const payload = {
        personImage: resizedPerson,
        ...garmentPayload,
      };

      const endpoint = engine === 'gemini' ? `${API_BASE_URL}/tryon/gemini` : TRYON_API;

      let res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Space sleeping (cold start) — wait and retry (only for HF)
      if (res.status === 503 && engine === 'standard') {
        setStatusText('Space is waking up, retrying in 20s…');
        await new Promise((r) => setTimeout(r, 20000));
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        if (res.status === 401) throw new Error('HF token not configured on the server. Contact the admin.');
        if (res.status === 429) throw new Error('Rate limit reached. Wait a minute and try again.');
        if (res.status === 404) throw new Error('Try-On space not found. It may have been moved or renamed.');
        throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
      }

      setStatusText('Processing result…');
      const json = await res.json();

      console.log('[TryOn] raw response:', JSON.stringify(json).slice(0, 500));

      // Gradio returns { data: [ { path: "/tmp/gradio/..." } ] } or { data: [ "data:image/..." ] }
      const out = json?.data?.[0];
      let resultDataUrl =
        (typeof out === 'string' ? out : null) ||
        out?.url ||
        out?.path && `https://kwai-kolors-kolors-virtual-try-on.hf.space/file=${out.path}` ||
        json?.result_image ||
        json?.output_image ||
        json?.url;

      // Relative /file= paths
      if (resultDataUrl && resultDataUrl.startsWith('/file=')) {
        resultDataUrl = `https://kwai-kolors-kolors-virtual-try-on.hf.space${resultDataUrl}`;
      }
      // Bare path (no leading slash)
      if (resultDataUrl && !resultDataUrl.startsWith('http') && !resultDataUrl.startsWith('data:')) {
        resultDataUrl = `https://kwai-kolors-kolors-virtual-try-on.hf.space/file=${resultDataUrl}`;
      }

      if (!resultDataUrl) throw new Error('No image returned from the AI model. Please try again.');

      clearInterval(timerRef.current);
      setProgress(100);
      setResultImage(resultDataUrl);
      setStep('result');

    } catch (err) {
      clearInterval(timerRef.current);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setStep('upload');
    setUserPhoto(null);
    setResultImage(null);
    setErrorMsg('');
    setProgress(0);
    setStatusText('');
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `tryon-${productName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  if (isARActive) {
    return (
      <Suspense fallback={
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-[#00B67A]/20 border-t-[#00B67A] rounded-full animate-spin"></div>
          <p className="mt-4 text-white font-bold">Preparing AI Vision...</p>
        </div>
      }>
        <ARVirtualTryOn product={product} onClose={() => setIsARActive(false)} />
      </Suspense>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#00B67A]" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Virtual Try-On</h2>
              <p className="text-xs text-gray-400 truncate max-w-[220px]">{productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Paste toast */}
        {pasteHint && (
          <div className="mx-5 mt-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={14} /> Photo pasted!
          </div>
        )}

        <div className="p-5 space-y-4">

          {/* ── UPLOAD / ERROR step ── */}
          {(step === 'upload' || step === 'error') && (
            <>
              {/* Garment chip */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <img src={productImageUrl} alt={productName}
                  className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  onError={(e) => { e.target.src = 'https://picsum.photos/seed/p/100/100'; }} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{productName}</p>
                  <p className="text-xs text-gray-400">Garment to try on</p>
                </div>
              </div>

              {/* Error */}
              {step === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-sm text-red-700">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Generation failed</p>
                    <p className="mt-0.5 text-xs">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Photo preview */}
              {userPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={userPhoto} alt="Your photo" className="w-full max-h-72 object-cover" />
                  <button onClick={() => setUserPhoto(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                    <X size={14} />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    Your photo
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Paste zone */}
                  <button type="button" onClick={handleClickPaste}
                    className="w-full border-2 border-dashed border-purple-300 bg-purple-50/40 rounded-2xl p-5 text-center hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <Clipboard size={28} className="mx-auto text-purple-400 mb-2" />
                    <p className="font-semibold text-purple-700 text-sm">Paste your photo</p>
                    <p className="text-xs text-purple-500 mt-1">
                      Press <kbd className="bg-purple-100 border border-purple-200 rounded px-1.5 py-0.5 font-mono text-[11px]">Ctrl+V</kbd> anywhere, or click here
                    </p>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div
                    className="border-2 border-dashed border-[#00B67A] rounded-2xl p-7 text-center cursor-pointer hover:bg-green-50/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload size={32} className="mx-auto text-[#00B67A] mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Drop photo or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">JPG · PNG · WEBP</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Live AR Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsARActive(true)}
                    className="w-full bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-5 text-center hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group"
                  >
                    <div className="relative mx-auto w-10 h-10 mb-2">
                       <Camera size={32} className="text-blue-500 absolute inset-0" />
                       <Sparkles size={16} className="text-blue-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <p className="font-semibold text-blue-700 text-sm">Try with Live Camera (AR)</p>
                    <p className="text-xs text-blue-500 mt-1">Instant magic • No photo needed</p>
                  </button>
                </div>
              )}

              {/* Engine Selection */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select AI Engine</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEngine('standard')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      engine === 'standard' 
                      ? 'border-[#00B67A] bg-green-50 text-[#00B67A]' 
                      : 'border-transparent bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <RefreshCw size={18} className={engine === 'standard' ? 'animate-spin-slow' : ''} />
                    <span className="text-xs font-bold">Standard AI</span>
                  </button>
                  <button
                    onClick={() => setEngine('gemini')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      engine === 'gemini' 
                      ? 'border-purple-500 bg-purple-50 text-purple-600' 
                      : 'border-transparent bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Sparkles size={18} />
                    <span className="text-xs font-bold">Gemini Pro</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center italic">
                  {engine === 'gemini' 
                    ? 'Gemini Pro: Best for high resolution and realistic lighting.' 
                    : 'Standard: Fast and optimized for garment transfer.'}
                </p>
              </div>

              {/* Generate button */}
              {userPhoto && (
                <button onClick={generateTryOn}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
                    engine === 'gemini'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100'
                    : 'bg-[#00B67A] hover:bg-[#009c68] text-white shadow-green-100'
                  }`}>
                  <Sparkles size={18} />
                  {engine === 'gemini' ? 'Generate with Gemini' : 'Generate AI Try-On'}
                </button>
              )}

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800">
                <p className="font-semibold text-sm mb-1">Tips for best results</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Front-facing photo with good lighting</li>
                  <li>Plain background works best</li>
                  <li>Full-body or upper-body photos</li>
                  <li>Wear fitted clothing in your photo</li>
                </ul>
              </div>
            </>
          )}

          {/* ── GENERATING step ── */}
          {step === 'generating' && (
            <div className="py-8 text-center space-y-6">
              {/* Animated icon */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-green-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#00B67A] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-[#00B67A]" />
                </div>
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">AI is generating your look…</p>
                <p className="text-sm text-gray-500 mt-1">{statusText}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-[#00B67A] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">This usually takes 20–60 seconds</p>

              <button onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto">
                <X size={14} /> Cancel
              </button>
            </div>
          )}

          {/* ── RESULT step ── */}
          {step === 'result' && resultImage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <p className="font-semibold text-sm">
                  Here's how <span className="text-[#00B67A]">{productName}</span> looks on you!
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center">
                <img src={resultImage} alt="AI try-on result" className="max-w-full max-h-[480px] object-contain" />
              </div>

              <div className="flex gap-3">
                <button onClick={reset}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 font-medium">
                  <RefreshCw size={14} /> Try Again
                </button>
                <button onClick={handleDownload}
                  className="flex-1 bg-[#00B67A] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#009c68] transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Save Photo
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">AI-generated preview — actual fit may vary.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
