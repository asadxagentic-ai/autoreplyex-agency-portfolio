import React from 'react';

interface BrandLogo {
  name: string;
  src: string;
  gradient: string;
}

const BRAND_LOGOS: BrandLogo[] = [
  {
    name: 'Procure',
    src: 'https://svgl.app/library/procure.svg',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
  },
  {
    name: 'Shopify',
    src: 'https://svgl.app/library/shopify.svg',
    gradient: 'linear-gradient(135deg, #eab308 0%, #fef08a 100%)',
  },
  {
    name: 'Blender',
    src: 'https://svgl.app/library/blender.svg',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
  },
  {
    name: 'Figma',
    src: 'https://svgl.app/library/figma.svg',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
  },
  {
    name: 'Spotify',
    src: 'https://svgl.app/library/spotify.svg',
    gradient: 'linear-gradient(135deg, #db2777 0%, #ef4444 100%)',
  },
  {
    name: 'Lottielab',
    src: 'https://svgl.app/library/lottielab.svg',
    gradient: 'linear-gradient(135deg, #ca8a04 0%, #22c55e 100%)',
  },
  {
    name: 'Google Cloud',
    src: 'https://svgl.app/library/google-cloud.svg',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #93c5fd 100%)',
  },
  {
    name: 'Bing',
    src: 'https://svgl.app/library/bing.svg',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
  },
];

function LogoCard({ logo, idSuffix }: { logo: BrandLogo; idSuffix: string }) {
  return (
    <div
      id={`marquee-card-${logo.name.toLowerCase().replace(/\s+/g, '-')}-${idSuffix}`}
      className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden cursor-pointer select-none"
    >
      {/* Absolute gradient overlay scaling down and fading in on hover */}
      <div
        className="absolute inset-0 transition-all duration-500 scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-none"
        style={{ background: logo.gradient }}
      />
      {/* Logo Image inverting on hover */}
      <img
        src={logo.src}
        alt={logo.name}
        className="relative z-10 max-h-9 max-w-[84px] object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert pointer-events-none"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function NewsSection() {
  return (
    <section id="news-section" className="w-full py-16 px-4 md:px-8 bg-[#f9fafb]">
      {/* =========================================================================
          SEAMLESS MARQUEE LOGO SCROLLER COMPONENT
          ========================================================================= */}
      <div
        id="marquee-scroller-container"
        className="w-full max-w-[1400px] mx-auto overflow-hidden relative select-none py-2"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused]">
          {/* Render list twice inline to ensure seamless continuous loop */}
          {BRAND_LOGOS.map((logo: BrandLogo, idx: number) => (
            <LogoCard key={`logo-first-${idx}`} logo={logo} idSuffix={`a-${idx}`} />
          ))}
          {BRAND_LOGOS.map((logo: BrandLogo, idx: number) => (
            <LogoCard key={`logo-second-${idx}`} logo={logo} idSuffix={`b-${idx}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
