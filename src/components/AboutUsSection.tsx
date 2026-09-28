import React, { useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Radio,
  Cpu,
  FileText,
  Globe,
  Star,
  Activity,
} from 'lucide-react';
import RollButton from './RollButton';

type CardId =
  | 'topMetric'
  | 'leftCardTop'
  | 'leftCardBottom'
  | 'rightCard'
  | 'neuralCard'
  | 'sentimentCard'
  | 'edgeNodeCard';

interface CardPhysicsState {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  currentLift: number;
  isHovered: boolean;
  baseRot: number;
  baseZIndex: number;
  hoverZIndex: number;
  ref: React.RefObject<HTMLDivElement | null>;
}

export default function AboutUsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Independent card refs
  const topMetricRef = useRef<HTMLDivElement>(null);
  const leftCardTopRef = useRef<HTMLDivElement>(null);
  const leftCardBottomRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const neuralCardRef = useRef<HTMLDivElement>(null);
  const sentimentCardRef = useRef<HTMLDivElement>(null);
  const edgeNodeCardRef = useRef<HTMLDivElement>(null);

  const animFrameIdRef = useRef<number>(0);

  // Independent animation and physics state for each card
  const cardsPhysicsRef = useRef<Record<CardId, CardPhysicsState>>({
    topMetric: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: topMetricRef,
    },
    leftCardTop: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: leftCardTopRef,
    },
    leftCardBottom: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: leftCardBottomRef,
    },
    rightCard: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: rightCardRef,
    },
    neuralCard: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: neuralCardRef,
    },
    sentimentCard: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: sentimentCardRef,
    },
    edgeNodeCard: {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      currentLift: 0,
      isHovered: false,
      baseRot: 0,
      baseZIndex: 10,
      hoverZIndex: 30,
      ref: edgeNodeCardRef,
    },
  });

  const renderCardsFrame = useCallback(() => {
    const cards = cardsPhysicsRef.current;
    (Object.keys(cards) as CardId[]).forEach((id) => {
      const c = cards[id];
      const el = c.ref.current;
      if (!el) return;

      const lift = c.currentLift;
      // Independent shift & tilt relative to the hovered card
      const tx = c.currentX * 10;
      const ty = c.currentY * 8 - lift * 8;
      const rotY = c.currentX * 6.5;
      const rotX = -c.currentY * 6.5;
      const rotZ = c.baseRot + c.currentX * 1.2;
      const scale = 1 + lift * 0.022;

      const shadowY = 16 + lift * 16;
      const shadowBlur = 38 + lift * 22;
      const shadowOpacity = 0.06 + lift * 0.07;

      el.style.transform = `perspective(900px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${(lift * 16).toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.style.boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0,0,0,${shadowOpacity.toFixed(3)})`;
      el.style.zIndex = c.isHovered ? `${c.hoverZIndex}` : `${c.baseZIndex}`;
    });
  }, []);

  const startPhysicsLoop = useCallback(() => {
    if (animFrameIdRef.current) return;

    const tick = () => {
      const cards = cardsPhysicsRef.current;
      let anyActive = false;

      (Object.keys(cards) as CardId[]).forEach((id) => {
        const c = cards[id];
        const dx = c.targetX - c.currentX;
        const dy = c.targetY - c.currentY;
        const targetLift = c.isHovered ? 1 : 0;
        const dLift = targetLift - c.currentLift;

        // Smooth spring lerp
        c.currentX += dx * 0.12;
        c.currentY += dy * 0.12;
        c.currentLift += dLift * 0.12;

        const isCardMoving =
          Math.abs(dx) > 0.001 ||
          Math.abs(dy) > 0.001 ||
          Math.abs(dLift) > 0.001 ||
          c.isHovered;

        if (isCardMoving) {
          anyActive = true;
        }
      });

      renderCardsFrame();

      if (anyActive) {
        animFrameIdRef.current = requestAnimationFrame(tick);
      } else {
        animFrameIdRef.current = 0;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
  }, [renderCardsFrame]);

  const handleCardMouseMove = (id: CardId, e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardsPhysicsRef.current[id];
    const el = card.ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));

    card.targetX = normX;
    card.targetY = normY;
    card.isHovered = true;

    startPhysicsLoop();
  };

  const handleCardMouseEnter = (id: CardId, e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardsPhysicsRef.current[id];
    card.isHovered = true;
    handleCardMouseMove(id, e);
  };

  const handleCardMouseLeave = (id: CardId) => {
    const card = cardsPhysicsRef.current[id];
    card.isHovered = false;
    card.targetX = 0;
    card.targetY = 0;
    startPhysicsLoop();
  };

  useEffect(() => {
    renderCardsFrame();
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [renderCardsFrame]);

  return (
    <section
      id="about-us-section"
      ref={containerRef}
      className="relative w-full bg-[#EFEFEF] pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-10 lg:pb-12 overflow-hidden border-b border-black/[0.04]"
      aria-label="About AutoReplyX Support"
    >
      {/* Background Architectural Grid Pattern & Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Soft Ambient Radial Light */}
        <div className="absolute right-12 top-1/3 w-[600px] h-[500px] bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: EVENLY DISTRIBUTED BALANCED SHOWCASE
              ========================================================================= */}
          <div className="lg:col-span-7 flex items-center justify-center select-none py-2">
            <div className="w-full max-w-[650px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
              
              {/* STACK 1: LEFT COLUMN CARDS */}
              <div className="flex flex-col gap-5 sm:gap-6 w-full">
                {/* CARD 1: GLOBAL EDGE CLUSTER */}
                <div
                  id="about-card-edge-cluster"
                  ref={edgeNodeCardRef}
                  onMouseMove={(e) => handleCardMouseMove('edgeNodeCard', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('edgeNodeCard', e)}
                  onMouseLeave={() => handleCardMouseLeave('edgeNodeCard')}
                  className="relative w-full bg-white rounded-[22px] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.06)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Globe size={13} className="text-gray-900" />
                      <span className="text-[11px] font-bold text-gray-900 tracking-tight">Global Edge Net</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#2f5c15] bg-[#eef7e6] px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2f5c15] animate-ping" /> 38 PoPs
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 pt-1 border-t border-black/[0.04]">
                    <span>HND: 18ms</span>
                    <span>FRA: 22ms</span>
                    <span>IAD: 12ms</span>
                  </div>
                </div>

                {/* CARD 2: AI LIVE CHAT RESOLUTION */}
                <div
                  id="about-card-chat-resolution"
                  ref={leftCardTopRef}
                  onMouseMove={(e) => handleCardMouseMove('leftCardTop', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('leftCardTop', e)}
                  onMouseLeave={() => handleCardMouseLeave('leftCardTop')}
                  className="relative w-full bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.06)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                      <span className="text-[12px] font-semibold text-gray-900">WhatsApp Inbound</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-700 bg-black/[0.04] px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>

                  {/* Customer Query */}
                  <div className="bg-[#f5f5f3] rounded-2xl rounded-tl-sm p-3 mb-2 text-[12px] text-gray-800 leading-snug">
                    Can I upgrade 15 team licenses to Enterprise without interrupting workflows?
                  </div>

                  {/* AI Instant Resolution */}
                  <div className="bg-[#151515] text-white rounded-2xl rounded-tr-sm p-3 text-[12px] leading-snug shadow-sm">
                    <div className="flex items-center gap-1.5 text-[#C8FF00] font-mono text-[10px] font-bold mb-1">
                      <Zap size={11} className="fill-current" />
                      <span>AutoReplyX Instant Action</span>
                    </div>
                    Zero downtime needed. We've applied volume discounting and issued pro-rated seats.
                  </div>

                  {/* Top-Right Badge: 0s Delay */}
                  <div
                    className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#151515] text-white flex items-center gap-1.5 shadow-sm border border-black/10 z-20"
                  >
                    <span className="text-[10px] font-bold tracking-tight text-[#C8FF00]">
                      ⚡ 0s DELAY
                    </span>
                  </div>
                </div>

                {/* CARD 3: WORKFLOW NODE */}
                <div
                  id="about-card-workflow-node"
                  ref={leftCardBottomRef}
                  onMouseMove={(e) => handleCardMouseMove('leftCardBottom', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('leftCardBottom', e)}
                  onMouseLeave={() => handleCardMouseLeave('leftCardBottom')}
                  className="relative w-full bg-white rounded-[22px] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.05)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-gray-700 uppercase tracking-wider">
                      Workflow Node
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2f5c15] bg-[#eef7e6] px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900">
                    Omnichannel State Sync
                  </div>
                  <p className="text-[11px] text-gray-700 mt-0.5">
                    Synchronized across Slack, Intercom, Email & WhatsApp in real time.
                  </p>
                </div>

                {/* CARD 4: REAL-TIME CSAT & SENTIMENT PULSE */}
                <div
                  id="about-card-sentiment-pulse"
                  ref={sentimentCardRef}
                  onMouseMove={(e) => handleCardMouseMove('sentimentCard', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('sentimentCard', e)}
                  onMouseLeave={() => handleCardMouseLeave('sentimentCard')}
                  className="relative w-full bg-white rounded-[22px] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.06)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  {/* Top Pill Badge */}
                  <div className="absolute -top-3 right-4 bg-[#C8FF00] text-gray-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1 border border-black/[0.06]">
                    <Star size={10} className="fill-current text-gray-900" />
                    <span>4.98 CSAT</span>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gray-700">Sentiment Pulse</span>
                    <span className="text-[10px] font-mono text-[#2f5c15] font-semibold">+98.6 Delight</span>
                  </div>

                  <div className="w-full bg-[#f0f0ed] h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-[#2f5c15] h-full w-[96%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-600">
                    <span className="flex items-center gap-1">
                      <Activity size={10} className="text-gray-900" /> 0 escalations
                    </span>
                    <span className="font-mono text-gray-900 font-semibold">100% Target</span>
                  </div>
                </div>
              </div>

              {/* STACK 2: RIGHT COLUMN CARDS */}
              <div className="flex flex-col gap-5 sm:gap-6 w-full">
                {/* CARD 5: TOP STAT METRIC */}
                <div
                  id="about-card-top-metric"
                  ref={topMetricRef}
                  onMouseMove={(e) => handleCardMouseMove('topMetric', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('topMetric', e)}
                  onMouseLeave={() => handleCardMouseLeave('topMetric')}
                  className="relative w-full bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.07)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#C8FF00] shadow-[0_0_10px_#C8FF00]" />
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-900 uppercase">
                          24/7 AI SUPPORT
                        </span>
                      </div>
                      <div className="text-[24px] sm:text-[28px] font-bold text-gray-900 tracking-tight leading-none">
                        99.4%
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-gray-700 mt-1 leading-snug">
                        Autonomous resolution with zero human intervention.
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#C8FF00] flex items-center justify-center text-gray-900 shrink-0 font-bold text-[12px] shadow-sm">
                      ↗
                    </div>
                  </div>

                  {/* Avatars & channel dots */}
                  <div className="mt-3.5 pt-3 border-t border-black/[0.05] flex items-center justify-between">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#151515] text-white text-[9px] font-bold ring-2 ring-white">
                        AI
                      </span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#C8FF00] text-gray-900 text-[9px] font-bold ring-2 ring-white">
                        99
                      </span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#36C5F0] text-white text-[9px] font-bold ring-2 ring-white">
                        #
                      </span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#25D366] text-white text-[9px] font-bold ring-2 ring-white">
                        W
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-700 font-medium">
                      0.38s avg reply
                    </span>
                  </div>
                </div>

                {/* CARD 6: NEURAL KNOWLEDGE GROUNDING */}
                <div
                  id="about-card-neural-grounding"
                  ref={neuralCardRef}
                  onMouseMove={(e) => handleCardMouseMove('neuralCard', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('neuralCard', e)}
                  onMouseLeave={() => handleCardMouseLeave('neuralCard')}
                  className="relative w-full bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_20px_48px_rgba(0,0,0,0.07)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  {/* Pill badge */}
                  <div className="absolute -top-3 left-4 bg-[#151515] text-[#C8FF00] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] animate-pulse" />
                    <span>VECTOR GROUNDING</span>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 tracking-tight">
                        Neural Context Engine
                      </div>
                      <p className="text-[11px] text-gray-700 leading-snug mt-0.5">
                        Sub-second retrieval across verified policies.
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#f0f0ed] flex items-center justify-center text-gray-900 shrink-0">
                      <Cpu size={12} />
                    </div>
                  </div>

                  {/* Verified file match preview */}
                  <div className="p-2 rounded-xl bg-[#f9f9f8] border border-black/[0.03] flex items-center justify-between text-[10px] mb-2">
                    <span className="flex items-center gap-1.5 text-gray-800 font-mono truncate max-w-[160px]">
                      <FileText size={11} className="text-gray-500 shrink-0" />
                      sla_refund_terms.md
                    </span>
                    <span className="font-mono text-[#2f5c15] font-semibold">0.994 Cosine</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-black/[0.04]">
                    <span className="flex items-center gap-1 text-gray-600">
                      <ShieldCheck size={11} className="text-[#2f5c15]" /> Zero Hallucination
                    </span>
                    <span className="font-mono text-gray-900">0.11s Retrieval</span>
                  </div>
                </div>

                {/* CARD 7: OMNICHANNEL STREAM */}
                <div
                  id="about-card-omnichannel-stream"
                  ref={rightCardRef}
                  onMouseMove={(e) => handleCardMouseMove('rightCard', e)}
                  onMouseEnter={(e) => handleCardMouseEnter('rightCard', e)}
                  onMouseLeave={() => handleCardMouseLeave('rightCard')}
                  className="relative w-full bg-white rounded-[22px] p-4 sm:p-5 shadow-[0_22px_50px_rgba(0,0,0,0.07)] border border-black/[0.05] cursor-pointer transition-colors duration-200 hover:border-black/[0.12]"
                  style={{ willChange: 'transform, box-shadow' }}
                >
                  {/* Overlapping top-right badge */}
                  <div
                    className="absolute -top-3 right-4 bg-[#C8FF00] text-gray-900 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm border border-black/[0.08] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                    <span>12+ CHANNELS</span>
                  </div>

                  {/* Channel Icons Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
                    <span className="text-[12px] font-bold text-gray-900 tracking-tight">
                      Unified Inbox Stream
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#f0f0ed] flex items-center justify-center text-[10px] font-bold text-gray-700">
                        S
                      </span>
                      <span className="w-5 h-5 rounded-md bg-[#f0f0ed] flex items-center justify-center text-[10px] font-bold text-gray-700">
                        W
                      </span>
                      <span className="w-5 h-5 rounded-md bg-[#f0f0ed] flex items-center justify-center text-[10px] font-bold text-gray-700">
                        @
                      </span>
                    </div>
                  </div>

                  {/* Message breakdown item */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-700">Payload Resolution</span>
                      <span className="font-mono text-gray-900 font-semibold">1,492 / hr</span>
                    </div>
                    <div className="w-full bg-[#f0f0ed] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#151515] h-full w-[88%] rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-700 pt-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#36C5F0]" /> Intercom & Slack
                      </span>
                      <span className="font-mono text-gray-900">0.42s avg latency</span>
                    </div>
                  </div>

                  {/* Bottom Mini KPI Pill inside Card */}
                  <div className="mt-3.5 pt-2.5 border-t border-black/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio size={12} className="text-[#C8FF00] animate-pulse" />
                      <span className="text-[11px] font-medium text-gray-800">
                        Auto-escalation Guard
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#2f5c15] font-semibold bg-[#eef7e6] px-2 py-0.5 rounded-full">
                      100% Active
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: EDITORIAL CONTENT & HIGHLIGHTS
              ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/[0.08] shadow-sm w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C8FF00] shadow-[0_0_8px_#C8FF00]" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-800">
                Next-Gen Support Infrastructure
              </span>
            </div>

            {/* Editorial Heading */}
            <h2 className="text-[34px] sm:text-[42px] lg:text-[48px] font-bold text-gray-900 tracking-tight leading-[1.08] mb-5">
              Support that never sleeps.
            </h2>

            {/* High-contrast Body Copy */}
            <p className="text-[15px] sm:text-[16px] text-gray-700 leading-relaxed mb-8 max-w-[500px]">
              AutoReplyX powers your customer operations 24/7 with zero latency. Seamlessly resolving complex tickets, executing workflows, and escalating edge cases directly to the right engineer when needed.
            </p>

            {/* Feature Points with visual contrast */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C8FF00] flex items-center justify-center shrink-0 mt-0.5 text-gray-900">
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                    Sub-second Omnichannel Routing
                  </h4>
                  <p className="text-[13px] text-gray-700 mt-0.5">
                    Tickets from WhatsApp, Slack, Intercom, and Email are triaged into an actionable event stream instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C8FF00] flex items-center justify-center shrink-0 mt-0.5 text-gray-900">
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                    Context-Aware Autonomous Answers
                  </h4>
                  <p className="text-[13px] text-gray-700 mt-0.5">
                    Connects directly to your internal docs, CRM, and order logs to provide precise, personalized solutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C8FF00] flex items-center justify-center shrink-0 mt-0.5 text-gray-900">
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                    Deterministic Human Safeguards
                  </h4>
                  <p className="text-[13px] text-gray-700 mt-0.5">
                    High-stakes actions require verified token confirmations, eliminating hallucinations and ensuring safety.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Row & Reference-Inspired Ratings Card */}
            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
              
              {/* Roll CTA Button */}
              <RollButton
                id="about-explore-button"
                text="Explore the platform"
                variant="dark"
                size="md"
                onClick={() => {
                  document.getElementById('pain-points-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Rating Card (Inspired by Reference's "Best ratings" card at bottom right) */}
              <div className="bg-white rounded-[16px] px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-black/[0.06] flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                    SLA Confidence
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[15px] font-bold text-gray-900">4.9/5</span>
                    <div className="flex text-[#C8FF00] text-[13px] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                      ★★★★★
                    </div>
                  </div>
                </div>
                <div className="h-7 w-[1px] bg-black/[0.08]" />
                <div className="text-[11px] text-gray-700 font-medium leading-tight">
                  <span className="font-semibold text-gray-900 block">1,200+ Teams</span>
                  powered worldwide
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
