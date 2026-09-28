import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Clock,
  MessageSquareOff,
  Repeat,
  Layers,
  UserX,
  Zap,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AutoReplyLogo from './AutoReplyLogo';

interface PainPointItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PAIN_POINTS: PainPointItem[] = [
  {
    id: 'pain-01',
    number: '01',
    title: 'Slow Replies',
    description: 'Delayed queues frustrate buyers and kill conversion before deals close.',
    icon: Clock,
  },
  {
    id: 'pain-02',
    number: '02',
    title: 'Missed Messages',
    description: 'Inquiries slip through shift handoffs, off-hour gaps, and traffic spikes.',
    icon: MessageSquareOff,
  },
  {
    id: 'pain-03',
    number: '03',
    title: 'Repetitive Work',
    description: 'Agents waste hours repeatedly answering the same recurring questions.',
    icon: Repeat,
  },
  {
    id: 'pain-04',
    number: '04',
    title: 'Multiple Inboxes',
    description: 'Fragmented channels create scattered context and sluggish handoffs.',
    icon: Layers,
  },
  {
    id: 'pain-05',
    number: '05',
    title: 'Lost Customers',
    description: 'Slow, inconsistent responses drive frustrated shoppers to competitors.',
    icon: UserX,
  },
];

// Unified connector definitions:
// - Center connector (pain-03): strictly straight and completely static in both collapsed and expanded states
// - Outer connectors (pain-01, 02, 04, 05): strictly straight by default, then smoothly morph into unique organic
//   hand-drawn curves routing cleanly through available whitespace to card perimeter when active/expanded
// - Seamless morphing using matching cubic Bézier structures so SVG morphing has zero jitter or deformation
// - Smooth 500-700ms easing (0.6s) with attached undistorted arrowhead and preserved stroke styling
interface ConnectorDefinition {
  id: string;
  collapsedPath: string;
  collapsedTip: { x: number; y: number; angle: number };
  expandedPath: string;
  expandedTip: { x: number; y: number; angle: number };
}

const DESKTOP_CONNECTORS: Record<string, ConnectorDefinition> = {
  'pain-01': {
    id: 'pain-01',
    // Straight diagonal from hub left exit (490, 440) to Card 01 collapsed edge (250, 274)
    // Structured as 3 cubic Bézier segments matching the expanded organic curve for smooth deformation-free morphing
    collapsedPath:
      'M 490 440 C 430 398 370 357 370 357 C 330 329 330 329 330 329 C 290 302 270 288 250 274',
    collapsedTip: { x: 250, y: 274, angle: -145 },
    // Expanded: Morphs into a unique organic loop that sweeps through open whitespace below Card 01,
    // terminating cleanly at the right boundary of the expanded card (250, 312) with zero overlap
    expandedPath:
      'M 490 440 C 435 505 355 495 345 435 C 335 375 405 370 415 420 C 395 470 310 405 250 312',
    expandedTip: { x: 250, y: 312, angle: -125 },
  },
  'pain-02': {
    id: 'pain-02',
    // Straight diagonal from hub top-left (515, 395) to Card 02 bottom (350, 144)
    collapsedPath:
      'M 515 395 C 460 311 405 228 405 228 C 385 197 385 197 385 197 C 365 167 355 152 350 144',
    collapsedTip: { x: 350, y: 144, angle: -123 },
    // Expanded: Morphs into an organic S-curve loop that sweeps through left whitespace and terminates
    // cleanly at the card's lower boundary (340, 204)
    expandedPath:
      'M 515 395 C 475 340 435 305 455 260 C 475 220 515 245 490 285 C 455 330 380 265 340 204',
    expandedTip: { x: 340, y: 204, angle: -124 },
  },
  'pain-03': {
    id: 'pain-03',
    // Strictly straight vertical vector with zero curvature, completely static in both collapsed & expanded states
    collapsedPath: 'M 570 375 L 570 106',
    collapsedTip: { x: 570, y: 106, angle: -90 },
    expandedPath: 'M 570 375 L 570 106',
    expandedTip: { x: 570, y: 106, angle: -90 },
  },
  'pain-04': {
    id: 'pain-04',
    // Straight diagonal from hub top-right (625, 395) to Card 04 bottom (790, 144)
    collapsedPath:
      'M 625 395 C 680 311 735 228 735 228 C 755 197 755 197 755 197 C 775 167 785 152 790 144',
    collapsedTip: { x: 790, y: 144, angle: -57 },
    // Expanded: Morphs into an organic S-curve wave looping through right whitespace and terminating
    // cleanly at the card's lower boundary (800, 204)
    expandedPath:
      'M 625 395 C 665 340 705 305 685 260 C 665 220 625 245 650 285 C 685 330 760 265 800 204',
    expandedTip: { x: 800, y: 204, angle: -56 },
  },
  'pain-05': {
    id: 'pain-05',
    // Straight diagonal from hub right exit (650, 440) to Card 05 collapsed edge (890, 274)
    collapsedPath:
      'M 650 440 C 710 398 770 357 770 357 C 810 329 810 329 810 329 C 850 302 870 288 890 274',
    collapsedTip: { x: 890, y: 274, angle: -35 },
    // Expanded: Morphs into a unique organic loop that sweeps through open whitespace below Card 05,
    // terminating cleanly at the left boundary of the expanded card (890, 312) with zero overlap
    expandedPath:
      'M 650 440 C 705 505 785 495 795 435 C 805 375 735 370 725 420 C 745 470 830 405 890 312',
    expandedTip: { x: 890, y: 312, angle: -55 },
  },
};

// Unified desktop connector component: renders body and arrowhead as a single synchronized animated object
// with smooth 600ms easing curve (500–700ms) and zero jitter
interface UnifiedDesktopConnectorProps {
  config: ConnectorDefinition;
  isExpanded: boolean;
  isActive: boolean;
}

function UnifiedDesktopConnector({ config, isExpanded, isActive }: UnifiedDesktopConnectorProps) {
  const currentPath = isExpanded ? config.expandedPath : config.collapsedPath;
  const currentTip = isExpanded ? config.expandedTip : config.collapsedTip;

  const strokeColor = isActive ? '#151515' : 'rgba(0,0,0,0.30)';
  const strokeWidth = isActive ? 2.25 : 1.75;
  const headColor = isActive ? '#151515' : '#4b5563';

  // Smooth 600ms cubic-bezier transition matching 500-700ms specification
  const connectorTransition = {
    duration: 0.6,
    ease: [0.25, 1, 0.35, 1] as [number, number, number, number],
  };

  return (
    <g id={`desktop-connector-${config.id}`}>
      {/* Connector line body: smoothly morphs between straight and organic curve */}
      <motion.path
        animate={{
          d: currentPath,
          stroke: strokeColor,
          strokeWidth,
        }}
        transition={connectorTransition}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Permanently attached, undistorted arrowhead traveling continuously with the path endpoint */}
      <motion.path
        d="M -8 -4.5 L 2 0 L -8 4.5 L -5.5 0 Z"
        animate={{
          x: currentTip.x,
          y: currentTip.y,
          rotate: currentTip.angle,
          fill: headColor,
          stroke: headColor,
        }}
        transition={connectorTransition}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  );
}

export default function PainPointsSection() {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleToggleCard = useCallback((id: string) => {
    setActiveCardId((prev: string | null) => (prev === id ? null : id));
  }, []);

  const activeCardIdRef = useRef<string | null>(null);
  activeCardIdRef.current = activeCardId;

  // Smooth mouse movement physics for the hub & cards
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseCoordsRef = useRef({ targetX: 0, targetY: 0, currX: 0, currY: 0 });
  const animIdRef = useRef<number>(0);

  // Parallax elements
  const hubRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    // When card-03 is open, freeze parallax coordinate updates so the canvas remains completely steady
    if (activeCardIdRef.current === 'pain-03') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseCoordsRef.current.targetX = x;
    mouseCoordsRef.current.targetY = y;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseCoordsRef.current.targetX = 0;
    mouseCoordsRef.current.targetY = 0;
  }, []);

  useEffect(() => {
    const loop = () => {
      const coords = mouseCoordsRef.current;
      coords.currX += (coords.targetX - coords.currX) * 0.08;
      coords.currY += (coords.targetY - coords.currY) * 0.08;

      if (hubRef.current) {
        const hubX = coords.currX * 14;
        const hubY = coords.currY * 10;
        hubRef.current.style.transform = `translate3d(${hubX}px, ${hubY}px, 0)`;
      }

      if (cardsContainerRef.current) {
        const cX = coords.currX * -10;
        const cY = coords.currY * -8;
        cardsContainerRef.current.style.transform = `translate3d(${cX}px, ${cY}px, 0)`;
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animIdRef.current);
  }, []);

  const effectiveActiveId = hoveredCardId || activeCardId;

  return (
    <section
      id="pain-points-section"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#EFEFEF] pt-8 sm:pt-12 lg:pt-14 pb-14 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-black/[0.06]"
    >
      {/* Anchor point for How It Works */}
      <div id="how-it-works" className="absolute top-0 left-0" />
      {/* Background Architectural Grid Pattern & Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Soft Radial Center Lighting */}
        <div className="absolute left-1/2 bottom-1/4 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-t from-white/80 via-white/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* =========================================================================
            HEADER SECTION: Clean Grotesk Typography & Context
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-black/[0.08] shadow-sm mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] text-gray-800 uppercase">
              THE BOTTLENECKS // PAIN POINTS
            </span>
          </div>

          <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-bold tracking-[-0.035em] leading-[1.08] text-gray-900">
            Manual support is breaking <br className="hidden sm:inline" />
            <span className="relative inline-block">
              your bottom line.
              <span className="absolute left-0 bottom-1 w-full h-[6px] bg-[#C8FF00]/60 -z-10 rounded-sm" />
            </span>
          </h2>

          <p className="mt-3.5 text-[15px] sm:text-[17px] text-gray-700 leading-relaxed max-w-xl mx-auto">
            When customer queues pile up, response velocity collapses and buyers quietly disappear.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 text-[12px] sm:text-[13px] text-gray-500 font-mono">
            <Sparkles size={13} className="text-gray-900 shrink-0" />
            <span>Stop losing sales to slow replies — grow your business 24/7 on autopilot</span>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP RADIAL ARCHITECTURE (Zero Overlap, Even Radial Arc)
            ========================================================================= */}
        <div className="hidden lg:block relative w-full max-w-[1140px] mx-auto min-h-[560px] select-none">
          
          {/* SVG Connecting Arrows */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1140 560"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle orbital background arcs & engineering details */}
            <path
              d="M 170 300 A 420 420 0 0 1 970 300"
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="1.5"
              strokeDasharray="5 7"
              fill="none"
            />
            <path
              d="M 270 360 A 320 320 0 0 1 870 360"
              stroke="rgba(0,0,0,0.07)"
              strokeWidth="1"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle
              cx="570"
              cy="460"
              r="190"
              stroke="rgba(0,0,0,0.05)"
              strokeWidth="1"
              strokeDasharray="3 5"
              fill="none"
            />

            {/* 5 Unified Animated Connectors (Body + Arrowhead preserved as a single synchronized object) */}
            <UnifiedDesktopConnector
              config={DESKTOP_CONNECTORS['pain-01']}
              isExpanded={activeCardId === 'pain-01'}
              isActive={effectiveActiveId === 'pain-01'}
            />
            <UnifiedDesktopConnector
              config={DESKTOP_CONNECTORS['pain-02']}
              isExpanded={activeCardId === 'pain-02'}
              isActive={effectiveActiveId === 'pain-02'}
            />
            <UnifiedDesktopConnector
              config={DESKTOP_CONNECTORS['pain-03']}
              isExpanded={activeCardId === 'pain-03'}
              isActive={effectiveActiveId === 'pain-03'}
            />
            <UnifiedDesktopConnector
              config={DESKTOP_CONNECTORS['pain-04']}
              isExpanded={activeCardId === 'pain-04'}
              isActive={effectiveActiveId === 'pain-04'}
            />
            <UnifiedDesktopConnector
              config={DESKTOP_CONNECTORS['pain-05']}
              isExpanded={activeCardId === 'pain-05'}
              isActive={effectiveActiveId === 'pain-05'}
            />
          </svg>

          {/* Dynamic Parallax Cards Layer - Guaranteed in front of SVG connectors */}
          <div ref={cardsContainerRef} className="absolute inset-0 pointer-events-none z-20">
            {/* 01 CARD: Slow Replies (Left) */}
            <div
              id="pain-card-01"
              onMouseEnter={() => setHoveredCardId('pain-01')}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleToggleCard('pain-01')}
              className={`pointer-events-auto absolute left-4 top-[230px] w-[230px] transition-all duration-300 cursor-pointer ${
                effectiveActiveId === 'pain-01' ? 'scale-[1.03] z-30' : 'hover:scale-[1.015] z-20'
              }`}
            >
              <PainCardContent
                item={PAIN_POINTS[0]}
                isActive={effectiveActiveId === 'pain-01'}
                isExpanded={activeCardId === 'pain-01'}
              />
            </div>

            {/* 02 CARD: Missed Messages (Top-Left) */}
            <div
              id="pain-card-02"
              onMouseEnter={() => setHoveredCardId('pain-02')}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleToggleCard('pain-02')}
              className={`pointer-events-auto absolute left-[170px] top-[50px] w-[230px] transition-all duration-300 cursor-pointer ${
                effectiveActiveId === 'pain-02' ? 'scale-[1.03] z-30' : 'hover:scale-[1.015] z-20'
              }`}
            >
              <PainCardContent
                item={PAIN_POINTS[1]}
                isActive={effectiveActiveId === 'pain-02'}
                isExpanded={activeCardId === 'pain-02'}
              />
            </div>

            {/* 04 CARD: Multiple Inboxes (Top-Right) */}
            <div
              id="pain-card-04"
              onMouseEnter={() => setHoveredCardId('pain-04')}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleToggleCard('pain-04')}
              className={`pointer-events-auto absolute right-[170px] top-[50px] w-[230px] transition-all duration-300 cursor-pointer ${
                effectiveActiveId === 'pain-04' ? 'scale-[1.03] z-30' : 'hover:scale-[1.015] z-20'
              }`}
            >
              <PainCardContent
                item={PAIN_POINTS[3]}
                isActive={effectiveActiveId === 'pain-04'}
                isExpanded={activeCardId === 'pain-04'}
              />
            </div>

            {/* 05 CARD: Lost Customers (Right) */}
            <div
              id="pain-card-05"
              onMouseEnter={() => setHoveredCardId('pain-05')}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleToggleCard('pain-05')}
              className={`pointer-events-auto absolute right-4 top-[230px] w-[230px] transition-all duration-300 cursor-pointer ${
                effectiveActiveId === 'pain-05' ? 'scale-[1.03] z-30' : 'hover:scale-[1.015] z-20'
              }`}
            >
              <PainCardContent
                item={PAIN_POINTS[4]}
                isActive={effectiveActiveId === 'pain-05'}
                isExpanded={activeCardId === 'pain-05'}
              />
            </div>
          </div>

          {/* 03 CARD: Repetitive Work (Top-Center) - Completely Fixed Stationary Position
              Locked top-center anchor at (570px, 10px). Zero parallax, zero translate, zero scale, zero downward shift.
              Only its content expands/collapses vertically. */}
          <div
            id="pain-card-03"
            onMouseEnter={() => setHoveredCardId('pain-03')}
            onMouseLeave={() => setHoveredCardId(null)}
            onClick={() => handleToggleCard('pain-03')}
            style={{ transform: 'none' }}
            className={`pointer-events-auto absolute left-[455px] top-[10px] w-[230px] cursor-pointer ${
              activeCardId === 'pain-03' ? 'z-30' : 'z-20 hover:z-30'
            }`}
          >
            <PainCardContent
              item={PAIN_POINTS[2]}
              isActive={effectiveActiveId === 'pain-03'}
              isExpanded={activeCardId === 'pain-03'}
            />
          </div>

          {/* =========================================================================
              CENTRAL CIRCULAR AI-SUPPORT HUB
              ========================================================================= */}
          <div
            id="ai-support-hub"
            ref={hubRef}
            className="absolute left-1/2 bottom-[24px] -translate-x-1/2 z-30 flex flex-col items-center select-none"
          >
            {/* Concentric Rings */}
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              {/* Outer orbit */}
              <div className="absolute inset-0 rounded-full border border-black/[0.08] animate-[spin_40s_linear_infinite]" />
              {/* Dashed orbit */}
              <div className="absolute inset-2.5 rounded-full border border-dashed border-black/[0.12]" />
              {/* Glowing Aura */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[#C8FF00]/40 via-white to-white shadow-[0_16px_40px_rgba(0,0,0,0.06)]" />

              {/* Elevated Core Circular Dome */}
              <div className="relative w-[140px] h-[140px] rounded-full bg-white border border-black/[0.08] shadow-[0_14px_32px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-3 text-center transition-transform duration-300 hover:scale-[1.04] cursor-pointer group">
                {/* Central Icon */}
                <div className="w-11 h-11 rounded-xl bg-white border border-black/[0.08] p-1.5 flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <AutoReplyLogo
                    className="w-full h-full object-contain select-none"
                  />
                </div>

                <span className="text-[13px] font-bold text-gray-900 tracking-tight leading-none">
                  AI Support Hub
                </span>

                <span className="text-[10px] font-mono text-gray-500 mt-1">
                  Continuous Triage
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            RESPONSIVE MOBILE / TABLET VIEW (< 1024px)
            ========================================================================= */}
        <div className="lg:hidden space-y-4">
          {/* Mobile Central Hub Card */}
          <div
            id="mobile-ai-support-hub"
            className="w-full bg-white rounded-[22px] p-5 sm:p-6 border border-black/[0.08] shadow-[0_10px_28px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative z-20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-black/[0.08] p-2 flex items-center justify-center shrink-0 shadow-sm">
                <AutoReplyLogo
                  className="w-full h-full object-contain select-none"
                />
              </div>
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 tracking-tight">
                  Central AI-Support Hub
                </h3>
                <p className="text-[12px] sm:text-[13px] text-gray-600 mt-0.5">
                  Continuous autonomous resolution across all customer vectors.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f0ed] text-[11px] font-mono font-medium text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
              <span>Automated Dispatch</span>
            </div>
          </div>

          {/* Mobile / Tablet Connector Bus - Layered strictly behind cards, with smooth 600ms easing */}
          <div className="relative w-full h-10 flex items-center justify-center pointer-events-none z-10 overflow-visible">
            <svg
              className="w-full max-w-sm h-full overflow-visible"
              viewBox="0 0 320 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Branch - to Left Cards (01, 02) */}
              <g id="mobile-connector-left">
                <motion.path
                  animate={{
                    d:
                      activeCardId === 'pain-01' || activeCardId === 'pain-02'
                        ? 'M 160 0 C 130 8 75 22 46 36'
                        : 'M 160 0 C 135 6 95 18 55 34',
                    stroke:
                      activeCardId === 'pain-01' || activeCardId === 'pain-02'
                        ? '#151515'
                        : 'rgba(0,0,0,0.30)',
                    strokeWidth:
                      activeCardId === 'pain-01' || activeCardId === 'pain-02' ? 2.25 : 1.75,
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <motion.path
                  d="M -7 -4 L 1.5 0 L -7 4 L -5 0 Z"
                  animate={{
                    x: activeCardId === 'pain-01' || activeCardId === 'pain-02' ? 46 : 55,
                    y: activeCardId === 'pain-01' || activeCardId === 'pain-02' ? 36 : 34,
                    rotate: activeCardId === 'pain-01' || activeCardId === 'pain-02' ? 140 : 148,
                    fill:
                      activeCardId === 'pain-01' || activeCardId === 'pain-02'
                        ? '#151515'
                        : '#4b5563',
                    stroke:
                      activeCardId === 'pain-01' || activeCardId === 'pain-02'
                        ? '#151515'
                        : '#4b5563',
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </g>

              {/* Center Straight Arrow - to Card 03: Strictly straight and static */}
              <g id="mobile-connector-center">
                <motion.path
                  d="M 160 0 L 160 34"
                  animate={{
                    stroke: activeCardId === 'pain-03' ? '#151515' : 'rgba(0,0,0,0.30)',
                    strokeWidth: activeCardId === 'pain-03' ? 2.25 : 1.75,
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeLinecap="round"
                />
                <motion.path
                  d="M -7 -4 L 1.5 0 L -7 4 L -5 0 Z"
                  animate={{
                    x: 160,
                    y: 34,
                    rotate: 90,
                    fill: activeCardId === 'pain-03' ? '#151515' : '#4b5563',
                    stroke: activeCardId === 'pain-03' ? '#151515' : '#4b5563',
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </g>

              {/* Right Branch - to Right Cards (04, 05) */}
              <g id="mobile-connector-right">
                <motion.path
                  animate={{
                    d:
                      activeCardId === 'pain-04' || activeCardId === 'pain-05'
                        ? 'M 160 0 C 190 8 245 22 274 36'
                        : 'M 160 0 C 185 6 225 18 265 34',
                    stroke:
                      activeCardId === 'pain-04' || activeCardId === 'pain-05'
                        ? '#151515'
                        : 'rgba(0,0,0,0.30)',
                    strokeWidth:
                      activeCardId === 'pain-04' || activeCardId === 'pain-05' ? 2.25 : 1.75,
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <motion.path
                  d="M -7 -4 L 1.5 0 L -7 4 L -5 0 Z"
                  animate={{
                    x: activeCardId === 'pain-04' || activeCardId === 'pain-05' ? 274 : 265,
                    y: activeCardId === 'pain-04' || activeCardId === 'pain-05' ? 36 : 34,
                    rotate: activeCardId === 'pain-04' || activeCardId === 'pain-05' ? 40 : 32,
                    fill:
                      activeCardId === 'pain-04' || activeCardId === 'pain-05'
                        ? '#151515'
                        : '#4b5563',
                    stroke:
                      activeCardId === 'pain-04' || activeCardId === 'pain-05'
                        ? '#151515'
                        : '#4b5563',
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.35, 1] as [number, number, number, number] }}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          {/* Mobile 5 Numbered Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-20">
            {PAIN_POINTS.map((item: PainPointItem) => (
              <div
                key={item.id}
                id={`mobile-${item.id}`}
                onClick={() => handleToggleCard(item.id)}
                className="cursor-pointer relative z-20"
              >
                <PainCardContent
                  item={item}
                  isActive={activeCardId === item.id}
                  isExpanded={activeCardId === item.id}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// Subcomponent for each of the 5 numbered cards
interface PainCardContentProps {
  item: PainPointItem;
  isActive: boolean;
  isExpanded: boolean;
}

function PainCardContent({ item, isActive, isExpanded }: PainCardContentProps) {
  const IconComponent = item.icon;

  return (
    <div
      className={`relative z-20 w-full rounded-[20px] p-4 sm:p-4.5 transition-[border-color,box-shadow,background-color] duration-200 border bg-white ${
        isActive || isExpanded
          ? 'border-black/[0.22] shadow-[0_16px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 z-30'
          : 'border-black/[0.06] shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:border-black/[0.14]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`w-7 h-7 rounded-lg font-mono text-[12px] font-bold flex items-center justify-center transition-colors duration-200 ${
            isActive || isExpanded
              ? 'bg-[#151515] text-[#C8FF00]'
              : 'bg-[#f0f0ed] text-gray-800'
          }`}
        >
          {item.number}
        </span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
            isActive || isExpanded ? 'bg-[#C8FF00] text-gray-900' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <IconComponent size={13} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 tracking-tight leading-snug">
          {item.title}
        </h3>
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-200 shrink-0 ${
            isExpanded
              ? 'bg-[#151515] text-[#C8FF00]'
              : 'bg-gray-100 text-gray-500'
          }`}
          aria-hidden="true"
        >
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="desc"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { type: 'spring', damping: 26, stiffness: 280, mass: 0.8 },
                opacity: { duration: 0.35, delay: 0.08 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { type: 'spring', damping: 28, stiffness: 320, mass: 0.8 },
                opacity: { duration: 0.2 },
              },
            }}
            className="overflow-hidden"
          >
            <p className="pt-2.5 text-[12px] text-gray-600 leading-relaxed border-t border-black/[0.05] mt-2.5">
              {item.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
