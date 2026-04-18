import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { X, Camera, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const ARVirtualTryOn = ({ product, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [garmentImg, setGarmentImg] = useState(null);

  const productImageUrl = product?.imageUrl || product?.image || '';
  const productName = product?.name || 'Product';

  // ── Load the garment image ──
  useEffect(() => {
    if (!productImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = productImageUrl;
    img.onload = () => setGarmentImg(img);
    img.onerror = () => setError("Could not load garment image.");
  }, [productImageUrl]);

  // ── Initialize MediaPipe Landmarker ──
  useEffect(() => {
    const initLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        
        landmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (err) {
        console.error("Landmarker Error:", err);
        setError("AI initialization failed. Please try a modern browser.");
        setIsLoading(false);
      }
    };

    initLandmarker();

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // ── Start Camera ──
  useEffect(() => {
    if (isLoading || error) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraActive(true);
          };
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Camera access denied. Please allow camera permissions.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoading, error]);

  // ── Processing Loop ──
  useEffect(() => {
    if (!cameraActive || !landmarkerRef.current) return;

    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
        requestRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const landmarker = landmarkerRef.current;

      // Ensure canvas matches video aspect ratio
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // 1. Detect Landmarks
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      // 2. Draw Video Frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 3. Draw Garment Overlay
      if (results.landmarks && results.landmarks.length > 0 && garmentImg) {
        const landmarks = results.landmarks[0];
        overlayGarment(ctx, landmarks, canvas.width, canvas.height);
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    const overlayGarment = (ctx, landmarks, width, height) => {
      // LANDMARK IDs: 
      // 11: Left Shoulder, 12: Right Shoulder
      // 23: Left Hip, 24: Right Hip
      const ls = landmarks[11]; // Left Shoulder
      const rs = landmarks[12]; // Right Shoulder
      const lh = landmarks[23]; // Left Hip
      const rh = landmarks[24]; // Right Hip

      // Check visibility
      if (ls.visibility < 0.5 || rs.visibility < 0.5) return;

      // 1. Center of shoulders (normalized to pixel coords)
      const centerX = (ls.x + rs.x) / 2 * width;
      const centerY = (ls.y + rs.y) / 2 * height;

      // 2. Garment Width (based on shoulder distance)
      const shoulderDist = Math.sqrt(Math.pow(ls.x - rs.x, 2) + Math.pow(ls.y - rs.y, 2)) * width;
      const garmentWidth = shoulderDist * 2.2; // Multiplier to cover shoulders

      // 3. Rotation (angle between shoulders)
      const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x);

      // 4. Height Adjustment (optional, based on shoulder-to-hip distance)
      const garmentHeight = garmentWidth * (garmentImg.height / garmentImg.width);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Fine-tune vertical position so it hangs from shoulders correctly
      // Shift down by about 15% of garment height
      ctx.drawImage(
        garmentImg, 
        -garmentWidth / 2, 
        -garmentHeight * 0.15, 
        garmentWidth, 
        garmentHeight
      );
      
      ctx.restore();
    };

    requestRef.current = requestAnimationFrame(processFrame);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [cameraActive, garmentImg]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 text-white">
        <div className="flex items-center gap-3">
          <Camera className="text-[#00B67A]" />
          <div>
            <h2 className="text-xl font-bold">Live AR Try-On</h2>
            <p className="text-xs opacity-70">{productName}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X />
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <video 
          ref={videoRef} 
          className="hidden" 
          playsInline 
          muted 
        />
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover mirror" 
          style={{ transform: 'scaleX(-1)' }} // Mirror the camera for natural feeling
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
            <Loader2 className="animate-spin text-[#00B67A]" size={48} />
            <p className="font-medium">Initializing AI Vision...</p>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-8 text-center gap-4">
            <AlertCircle className="text-red-500" size={48} />
            <h3 className="text-xl font-bold">Something went wrong</h3>
            <p className="text-sm opacity-80 max-w-xs">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#00B67A] rounded-full font-bold flex items-center gap-2"
            >
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        )}

        {/* Controls Overlay */}
        {!isLoading && !error && cameraActive && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
            <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white text-sm">
              Stand back so your <span className="text-[#00B67A] font-bold">shoulders</span> are visible
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-white/50 text-xs text-center max-w-md">
        <p>This mode uses local computer vision to track your movements. No image data is sent to our servers.</p>
        <p className="mt-2 italic">Tip: Wear fitted clothing for better alignment.</p>
      </div>

      {/* Global Mirror Style */}
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default ARVirtualTryOn;
