import React, { useState, useEffect, useRef } from 'react';

const ProgressiveImage = ({ src, alt, className, fallbackSrc = 'https://picsum.photos/seed/product1/300/400.jpg', ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blurred Fast-Load Placeholder */}
      <div className={`absolute inset-0 bg-gray-50 overflow-hidden transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <img
          src={fallbackSrc}
          alt="loading"
          className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>
      
      {/* Actual image that fades in */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-700 ease-out flex-shrink-0 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
        {...props}
      />
    </div>
  );
};

export default ProgressiveImage;
