/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HeroSection from './components/HeroSection';
import AboutUsSection from './components/AboutUsSection';
import ProductMosaicSection from './components/ProductMosaicSection';
import PainPointsSection from './components/PainPointsSection';
import MultiPlatformSection from './components/MultiPlatformSection';
import NewsSection from './components/NewsSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaFaqFooterSection from './components/CtaFaqFooterSection';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#f9fafb] text-gray-900 antialiased selection:bg-[#F26522] selection:text-white">
      {/* SECTION 1: HERO */}
      <HeroSection />

      {/* SECTION 2: ABOUT US (ASV COMPOSITION) */}
      <AboutUsSection />

      {/* SECTION 3: PRODUCT MOSAIC */}
      <ProductMosaicSection />

      {/* SECTION 4: PAIN POINTS (RADIAL HUB & 5 KEY VECTORS) */}
      <PainPointsSection />

      {/* SECTION 5: MULTI-PLATFORM SUPPORT */}
      <MultiPlatformSection />

      {/* SECTION 6: NEWS / FOUNDATION OF THE NEW DIGITAL EPOCH */}
      <NewsSection />

      {/* SECTION 7: TESTIMONIALS */}
      <TestimonialsSection />

      {/* SECTION 8: CTA + FAQ + FOOTER */}
      <CtaFaqFooterSection />
    </div>
  );
}

