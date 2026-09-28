import React from 'react';
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';

export default function TestimonialsSection() {
  return (
    <section id="testimonials-section" className="w-full py-20 px-4 md:px-8 bg-[#f9fafb] overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center">
          <div
            id="testimonials-badge"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/70 shadow-xs mb-4 select-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#F26522]" />
            <span className="text-[12px] font-semibold tracking-wide text-slate-700 uppercase">
              Wall of Love
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0a1b33] tracking-tight">
            Loved by forward-thinking teams
          </h2>

          <p className="font-sans text-sm sm:text-base text-slate-500 mt-4 max-w-lg leading-relaxed">
            See how founders, operators, and engineering leads streamline operations and deliver unforgettable customer experiences.
          </p>
        </div>

        {/* Testimonials Interactive Carousel Container */}
        <div className="w-full rounded-[36px] bg-white border border-slate-200/60 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
          <StaggerTestimonials />
        </div>
      </div>
    </section>
  );
}
