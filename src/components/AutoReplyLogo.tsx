import React, { useState } from 'react';

interface AutoReplyLogoProps {
  className?: string;
  size?: number | string;
  id?: string;
  alt?: string;
}

// Candidate paths for direct uploaded image files
const LOGO_CANDIDATES = [
  '/logo.png',
  '/logo.jpeg',
  '/logo.jpg',
  '/WhatsApp Image 2026-09-20 at 1.44.17 AM.jpeg',
  '/logo.svg',
];

export default function AutoReplyLogo({
  className = '',
  size,
  id,
  alt = 'AutoReply Ex Logo',
}: AutoReplyLogoProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  const handleError = () => {
    if (candidateIndex < LOGO_CANDIDATES.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

  const styleObj: React.CSSProperties = {};
  if (size !== undefined) {
    const pixelVal = typeof size === 'number' ? `${size}px` : size;
    styleObj.width = pixelVal;
    styleObj.height = pixelVal;
  }

  return (
    <img
      id={id}
      src={LOGO_CANDIDATES[candidateIndex]}
      alt={alt}
      onError={handleError}
      className={`object-contain select-none ${className}`}
      style={styleObj}
      referrerPolicy="no-referrer"
      loading="eager"
    />
  );
}
