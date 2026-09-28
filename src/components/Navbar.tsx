import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import AutoReplyLogo from './AutoReplyLogo';

interface NavItem {
  id: string;
  label: string;
  targetId: string;
}

// Nav items ordered strictly according to their vertical order on the page:
// 1. About Us (#about-us-section)
// 2. Features / Product Mosaic (#product-mosaic-section)
// 3. How It Works / Pain Points (#pain-points-section)
// 4. Platforms (#multi-platform-section)
// 5. Merged FAQ & Contact (#faq-section)
const NAV_ITEMS: NavItem[] = [
  { id: 'about', label: 'About', targetId: 'about-us-section' },
  { id: 'features', label: 'Features', targetId: 'product-mosaic-section' },
  { id: 'how-it-works', label: 'How It Works', targetId: 'pain-points-section' },
  { id: 'platforms', label: 'Platforms', targetId: 'multi-platform-section' },
  { id: 'faq-contact', label: 'FAQ & Contact', targetId: 'faq-section' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [bubbleRect, setBubbleRect] = useState<{ left: number; width: number; opacity: number } | null>(null);

  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isScrollLockedRef = useRef<boolean>(false);
  const scrollLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeIdRef = useRef<string | null>(null);

  // Keep activeId ref in sync
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Position and measure the subtle liquid-glass active bubble inside the nav track
  const updateBubblePosition = useCallback(() => {
    if (!activeId) {
      setBubbleRect((prev) => (prev ? { ...prev, opacity: 0 } : null));
      return;
    }

    const activeEl = itemRefs.current[activeId];
    if (activeEl) {
      setBubbleRect({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeId]);

  useEffect(() => {
    updateBubblePosition();
  }, [activeId, updateBubblePosition]);

  // Recalculate bubble coordinates on resize or container changes
  useEffect(() => {
    const handleResize = () => {
      updateBubblePosition();
    };
    window.addEventListener('resize', handleResize);

    if (navTrackRef.current) {
      const observer = new ResizeObserver(() => {
        updateBubblePosition();
      });
      observer.observe(navTrackRef.current);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [updateBubblePosition]);

  // Active section scroll detection strictly adhering to document sequence
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Do not overwrite active item while a user-initiated smooth scroll is animating
      if (isScrollLockedRef.current) return;

      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // If at top of the page (Hero section), no nav item is active
      if (scrollY < 200) {
        setActiveId(null);
        return;
      }

      // If at the bottom of the page, activate the merged FAQ & Contact
      if (windowHeight + scrollY >= docHeight - 120) {
        setActiveId('faq-contact');
        return;
      }

      // Probe Y position in viewport for section detection
      const probeY = scrollY + 160;

      let foundId: string | null = null;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.targetId);
        if (el) {
          const bodyRect = document.body.getBoundingClientRect().top;
          const elRect = el.getBoundingClientRect().top;
          const top = elRect - bodyRect;
          if (probeY >= top - 70) {
            foundId = item.id;
            break;
          }
        }
      }

      if (foundId !== activeIdRef.current) {
        setActiveId(foundId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler with lock to prevent intermediate triggers
  const handleNavClick = (item: NavItem) => {
    setMobileMenuOpen(false);
    setActiveId(item.id);

    // Lock scroll spy updates during animated navigation
    isScrollLockedRef.current = true;
    if (scrollLockTimeoutRef.current) {
      clearTimeout(scrollLockTimeoutRef.current);
    }

    const targetEl = document.getElementById(item.targetId);
    if (targetEl) {
      const navOffset = 88;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetEl.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = Math.max(0, elementPosition - navOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      const unlock = () => {
        isScrollLockedRef.current = false;
        window.removeEventListener('scrollend', unlock);
      };

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', unlock, { once: true });
      }
      scrollLockTimeoutRef.current = setTimeout(unlock, 950);
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCtaClick = () => {
    setMobileMenuOpen(false);
    const targetEl = document.getElementById('cta-section') || document.getElementById('faq-section');
    if (targetEl) {
      const navOffset = 88;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetEl.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* Fixed Sticky Header Ingress */}
      <header
        id="main-navigation"
        className="fixed top-2.5 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        {/*
            Transparent navbar container directly integrated into the page
            No large background panel, no surrounding container blur, no floating background panel
        */}
        <nav
          id="navbar-pill"
          className="pointer-events-auto relative w-full max-w-[1240px] px-1 sm:px-2 py-1.5 flex items-center justify-between select-none bg-transparent border-0 shadow-none"
        >
          {/* =========================================================================
              LEFT: Brand Pod with subtle liquid-glass pill
              ========================================================================= */}
          <div className="flex items-center">
            <a
              id="navbar-logo"
              href="#"
              onClick={scrollToTop}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/75 hover:bg-white/90 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all duration-200 outline-none focus:outline-none group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="AutoReply Ex Home"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 border border-neutral-200/60 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
                <AutoReplyLogo className="w-full h-full object-contain" />
              </div>

              {/* Brand Typography */}
              <div className="flex items-center tracking-tight">
                <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900 group-hover:text-black transition-colors">
                  AutoReply
                </span>
                <span className="text-[14px] sm:text-[15px] font-black text-[#F26522] ml-1">
                  Ex
                </span>
              </div>
            </a>
          </div>

          {/* =========================================================================
              CENTER: Subtle Liquid-Glass Interactive Nav Track
              ========================================================================= */}
          <div
            ref={navTrackRef}
            id="nav-items-track"
            className="hidden lg:flex items-center relative p-1 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)] z-10"
          >
            {/* The Smoothly Sliding Subtle Liquid-Glass Active Bubble */}
            {bubbleRect && (
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1.5px_1px_rgba(255,255,255,0.95)] border border-white/90 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  left: `${bubbleRect.left}px`,
                  width: `${bubbleRect.width}px`,
                  opacity: bubbleRect.opacity,
                }}
              >
                {/* Subtle top specular sheen */}
                <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
              </div>
            )}

            {/* Nav Item Buttons in Exact Page Order */}
            {NAV_ITEMS.map((item: NavItem) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  id={`nav-link-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`relative z-10 px-3.5 py-1.5 rounded-full text-[13px] flex items-center justify-center cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 active:bg-transparent focus:bg-transparent transition-colors duration-200 ${
                    isActive
                      ? 'font-semibold text-neutral-950'
                      : 'font-medium text-neutral-600 hover:text-neutral-950 hover:bg-white/40'
                  }`}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              RIGHT: Subtle Liquid-Glass Autopilot Beacon & Action Button
              ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Autopilot Liquid-Glass Beacon */}
            <div
              id="navbar-status-badge"
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 text-neutral-700 text-[11px] font-semibold tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F26522] shadow-[0_0_6px_rgba(242,101,34,0.35)]" />
              <span>24/7 Autopilot</span>
            </div>

            {/* High-Contrast "Get Started" CTA Button with Subtle Liquid Sheen */}
            <button
              id="nav-cta-call"
              type="button"
              onClick={handleCtaClick}
              className="relative overflow-hidden group/btn bg-neutral-900 hover:bg-[#F26522] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:shadow-[0_6px_20px_rgba(242,101,34,0.35)] hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5 shrink-0 outline-none focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <span className="relative z-10">Get Started</span>
              <ArrowUpRight
                size={14}
                className="relative z-10 opacity-85 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200"
              />
            </button>

            {/* Mobile Glass Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen((prev: boolean) => !prev)}
              className="lg:hidden w-9 h-9 rounded-full bg-white/80 hover:bg-white/95 backdrop-blur-md border border-white/85 text-neutral-800 flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all outline-none focus:outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          MOBILE LIQUID-GLASS DRAWER
          ========================================================================= */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-50 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          id="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
        />

        {/* Sheet Drawer */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex justify-center">
          <div
            id="mobile-menu-sheet"
            className={`w-full max-w-[460px] bg-white/95 backdrop-blur-xl border border-white/90 rounded-[24px] p-5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center p-1">
                  <AutoReplyLogo className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center tracking-tight">
                  <span className="text-[14px] font-bold text-neutral-900">AutoReply</span>
                  <span className="text-[14px] font-black text-[#F26522] ml-0.5">Ex</span>
                </div>
              </div>

              {/* Status Beacon */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" />
                <span>Active</span>
              </div>
            </div>

            {/* Drawer Links in Exact Page Order */}
            <nav className="flex flex-col gap-1.5 py-4">
              {NAV_ITEMS.map((item: NavItem) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] transition-colors outline-none focus:outline-none ${
                      isActive
                        ? 'font-semibold text-neutral-950 bg-neutral-100 border border-neutral-200/80'
                        : 'font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 border border-transparent'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="flex items-center gap-1.5 text-xs text-neutral-800 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        <span>Current</span>
                      </span>
                    ) : (
                      <ArrowUpRight size={14} className="text-neutral-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer CTA */}
            <div className="pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full bg-neutral-900 hover:bg-[#F26522] text-white rounded-xl py-3 px-5 font-semibold text-[14px] flex items-center justify-between transition-colors shadow-sm cursor-pointer outline-none focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span>Get Started with AutoReply Ex</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
