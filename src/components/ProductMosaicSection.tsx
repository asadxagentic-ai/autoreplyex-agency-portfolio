import React, { useCallback, useEffect, useRef, useState } from 'react';

interface BarDeflection {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

interface ChipRepulsionState {
  x: number;
  y: number;
  rot: number;
  scale: number;
  vx: number;
  vy: number;
  vRot: number;
  vScale: number;
  targetX: number;
  targetY: number;
  targetRot: number;
  targetScale: number;
}

export default function ProductMosaicSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animationState, setAnimationState] = useState<'pending' | 'running' | 'done'>('pending');

  // Interactive state and refs for Connect card chips cursor repulsion physics
  const connectCardRef = useRef<HTMLDivElement>(null);
  const chipsBoxRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  const chipPhysicsRef = useRef<{
    chips: ChipRepulsionState[];
    boxTilt: { x: number; y: number; vx: number; vy: number; targetX: number; targetY: number };
    rAFId: number;
    isHovered: boolean;
  }>({
    chips: Array.from({ length: 6 }, () => ({
      x: 0,
      y: 0,
      rot: 0,
      scale: 1,
      vx: 0,
      vy: 0,
      vRot: 0,
      vScale: 0,
      targetX: 0,
      targetY: 0,
      targetRot: 0,
      targetScale: 1,
    })),
    boxTilt: { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    rAFId: 0,
    isHovered: false,
  });

  // Interactive state for Chart hover & spring deflection
  const insightsCardRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Spring physics offsets for each bar [MON ... SUN]
  const [barOffsets, setBarOffsets] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const deflectionsRef = useRef<BarDeflection[]>([
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
    { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 },
  ]);

  const animFrameIdRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef(false);

  // Smooth spring physics loop (stiffness = 0.14, damping = 0.76)
  const runPhysicsLoop = () => {
    let hasMotion = false;
    const defs = deflectionsRef.current;
    const stiffness = 0.14;
    const damping = 0.76;

    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      const ax = (d.targetX - d.x) * stiffness;
      const ay = (d.targetY - d.y) * stiffness;

      d.vx = (d.vx + ax) * damping;
      d.vy = (d.vy + ay) * damping;

      d.x += d.vx;
      d.y += d.vy;

      if (
        Math.abs(d.targetX - d.x) > 0.05 ||
        Math.abs(d.targetY - d.y) > 0.05 ||
        Math.abs(d.vx) > 0.05 ||
        Math.abs(d.vy) > 0.05
      ) {
        hasMotion = true;
      } else {
        d.x = d.targetX;
        d.y = d.targetY;
        d.vx = 0;
        d.vy = 0;
      }
    }

    setBarOffsets(defs.map((d: { x: number; y: number }) => ({ x: d.x, y: d.y })));

    if (hasMotion) {
      animFrameIdRef.current = requestAnimationFrame(runPhysicsLoop);
    } else {
      isLoopRunningRef.current = false;
      animFrameIdRef.current = null;
    }
  };

  const triggerPhysics = () => {
    if (!isLoopRunningRef.current) {
      isLoopRunningRef.current = true;
      animFrameIdRef.current = requestAnimationFrame(runPhysicsLoop);
    }
  };

  // Cursor proximity handler with gentle repelling spring physics & magnetic resistance
  const handleInsightsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const radius = 130; // proximity detection radius in pixels
    const maxRepel = 22; // max gentle repulsion in pixels

    barRefs.current.forEach((el: HTMLDivElement | null, index: number) => {
      if (!el || !deflectionsRef.current[index]) return;
      const rect = el.getBoundingClientRect();
      const elemCenterX = rect.left + rect.width / 2;
      const elemCenterY = rect.top + rect.height / 2;

      const dx = elemCenterX - mouseX;
      const dy = elemCenterY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius && dist > 0.01) {
        // Smooth magnetic resistance falloff: (1 - dist/radius)^2
        const force = Math.pow(1 - dist / radius, 1.8);
        const nx = dx / dist;
        const ny = dy / dist;

        // Subtle lateral deflection with gentle vertical compression resistance
        deflectionsRef.current[index].targetX = nx * force * maxRepel;
        deflectionsRef.current[index].targetY = ny * force * (maxRepel * 0.65);
      } else {
        deflectionsRef.current[index].targetX = 0;
        deflectionsRef.current[index].targetY = 0;
      }
    });

    triggerPhysics();
  };

  const handleInsightsMouseLeave = () => {
    deflectionsRef.current.forEach((d: { targetX: number; targetY: number }) => {
      d.targetX = 0;
      d.targetY = 0;
    });
    triggerPhysics();
  };

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const renderChipFrame = useCallback(() => {
    const s = chipPhysicsRef.current;
    if (chipsBoxRef.current) {
      const bt = s.boxTilt;
      chipsBoxRef.current.style.transform = `translate3d(calc(${bt.x.toFixed(2)} * var(--u)), calc(${bt.y.toFixed(2)} * var(--u)), 0)`;
    }

    s.chips.forEach((c: { x: number; y: number; rot: number; scale: number }, idx: number) => {
      const el = chipRefs.current[idx];
      if (!el) return;
      const isSlack = idx === 5;
      const baseRot = isSlack ? -20 : 0;
      const rot = baseRot + c.rot;

      el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${c.scale.toFixed(3)})`;

      const repelling = Math.hypot(c.x, c.y);
      if (repelling > 0.4) {
        const shadowDist = (isSlack ? 8 : 4) + repelling * 0.35;
        const shadowBlur = (isSlack ? 18 : 12) + repelling * 0.55;
        const shadowAlpha = 0.05 + (repelling / 28) * 0.08;
        const ringAlpha = (isSlack ? 0.052 : 0.047) + (repelling / 28) * 0.025;
        el.style.boxShadow = `0 0 0 calc(${isSlack ? 3.2 : 3} * var(--u)) rgba(0, 0, 0, ${ringAlpha.toFixed(3)}), 0 calc(${shadowDist.toFixed(1)} * var(--u)) calc(${shadowBlur.toFixed(1)} * var(--u)) rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`;
      } else {
        el.style.boxShadow = '';
      }
    });
  }, []);

  const startChipPhysicsLoop = useCallback(() => {
    if (chipPhysicsRef.current.rAFId) return;

    const tick = () => {
      const s = chipPhysicsRef.current;
      let hasMotion = false;
      const stiffness = 0.125;
      const damping = 0.77;

      // Box tilt physics
      const bt = s.boxTilt;
      const axBt = (bt.targetX - bt.x) * stiffness;
      const ayBt = (bt.targetY - bt.y) * stiffness;
      bt.vx = (bt.vx + axBt) * damping;
      bt.vy = (bt.vy + ayBt) * damping;
      bt.x += bt.vx;
      bt.y += bt.vy;

      if (Math.hypot(bt.targetX - bt.x, bt.targetY - bt.y) > 0.02 || Math.hypot(bt.vx, bt.vy) > 0.02) {
        hasMotion = true;
      } else if (!s.isHovered) {
        bt.x = 0;
        bt.y = 0;
        bt.vx = 0;
        bt.vy = 0;
      }

      // Individual chips repulsion physics
      for (let i = 0; i < s.chips.length; i++) {
        const c = s.chips[i];
        const ax = (c.targetX - c.x) * stiffness;
        const ay = (c.targetY - c.y) * stiffness;
        const aRot = (c.targetRot - c.rot) * stiffness;
        const aScale = (c.targetScale - c.scale) * stiffness;

        c.vx = (c.vx + ax) * damping;
        c.vy = (c.vy + ay) * damping;
        c.vRot = (c.vRot + aRot) * damping;
        c.vScale = (c.vScale + aScale) * damping;

        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vRot;
        c.scale += c.vScale;

        const diff = Math.hypot(c.targetX - c.x, c.targetY - c.y) + Math.abs(c.targetRot - c.rot) + Math.abs(c.targetScale - c.scale);
        const vel = Math.hypot(c.vx, c.vy) + Math.abs(c.vRot) + Math.abs(c.vScale);

        if (diff > 0.02 || vel > 0.02) {
          hasMotion = true;
        } else if (!s.isHovered) {
          c.x = 0;
          c.y = 0;
          c.rot = 0;
          c.scale = 1;
          c.vx = 0;
          c.vy = 0;
          c.vRot = 0;
          c.vScale = 0;
        }
      }

      renderChipFrame();

      if (hasMotion || s.isHovered) {
        s.rAFId = requestAnimationFrame(tick);
      } else {
        s.rAFId = 0;
      }
    };

    chipPhysicsRef.current.rAFId = requestAnimationFrame(tick);
  }, [renderChipFrame]);

  const handleConnectMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!connectCardRef.current) return;
    const rect = connectCardRef.current.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

    chipPhysicsRef.current.boxTilt.targetX = normX * 8;
    chipPhysicsRef.current.boxTilt.targetY = normY * 5;
    chipPhysicsRef.current.isHovered = true;

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const radius = 140; // Proximity detection radius in pixels
    const maxRepel = 28; // Max repulsion distance in pixels

    chipRefs.current.forEach((el: HTMLDivElement | null, index: number) => {
      const chipState = chipPhysicsRef.current.chips[index];
      if (!el || !chipState) return;

      const chipRect = el.getBoundingClientRect();
      const chipCenterX = chipRect.left + chipRect.width / 2;
      const chipCenterY = chipRect.top + chipRect.height / 2;

      const rawDx = chipCenterX - mouseX;
      const rawDy = chipCenterY - mouseY;
      const dist = Math.hypot(rawDx, rawDy);

      if (dist < radius) {
        const dx = dist < 0.001 ? 0.1 : rawDx;
        const dy = dist < 0.001 ? -1 : rawDy;
        const safeDist = Math.max(1, dist);

        // Smoothstep falloff curve for organic repulsion physics
        const t = 1 - safeDist / radius;
        const force = t * t * (3 - 2 * t);
        const nx = dx / safeDist;
        const ny = dy / safeDist;

        chipState.targetX = nx * force * maxRepel;
        chipState.targetY = ny * force * maxRepel;
        chipState.targetRot = nx * force * 7.5;
        chipState.targetScale = 1 + force * 0.04;
      } else {
        chipState.targetX = 0;
        chipState.targetY = 0;
        chipState.targetRot = 0;
        chipState.targetScale = 1;
      }
    });

    startChipPhysicsLoop();
  };

  const handleConnectMouseLeave = () => {
    chipPhysicsRef.current.isHovered = false;
    chipPhysicsRef.current.boxTilt.targetX = 0;
    chipPhysicsRef.current.boxTilt.targetY = 0;
    chipPhysicsRef.current.chips.forEach((c: { targetX: number; targetY: number; targetRot: number; targetScale: number }) => {
      c.targetX = 0;
      c.targetY = 0;
      c.targetRot = 0;
      c.targetScale = 1;
    });

    startChipPhysicsLoop();
  };

  useEffect(() => {
    renderChipFrame();
    return () => {
      if (chipPhysicsRef.current.rAFId) {
        cancelAnimationFrame(chipPhysicsRef.current.rAFId);
      }
    };
  }, [renderChipFrame]);

  // Interactive state and refs for Automate card cursor-driven 3D layered-card movement
  const automateCardRef = useRef<HTMLDivElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const wfPillRef = useRef<HTMLDivElement>(null);
  const aiPillRef = useRef<HTMLDivElement>(null);

  const automateAnimRef = useRef({
    currentDisplacement: 0,
    targetDisplacement: 0,
    velocity: 0,
    rAFId: 0,
    isHovered: false,
  });

  const renderAutomateFrame = useCallback((disp: number) => {
    const MAX_DISP = 48; // Max horizontal displacement in var(--u)
    const frontX = disp;
    const backX = -disp;

    // Separation progress (0 -> 1) as cards physically move in opposite directions
    const separation = Math.min(1, Math.abs(disp) / MAX_DISP);

    if (frontCardRef.current) {
      frontCardRef.current.style.transform = `rotate(4.23deg) translate3d(calc(${frontX.toFixed(2)} * var(--u)), 0, calc(18 * var(--u)))`;
      const shadowSpread = Math.abs(disp) * 0.35;
      frontCardRef.current.style.boxShadow = `0 calc(${(14 + shadowSpread).toFixed(1)} * var(--u)) calc(${(32 + shadowSpread * 1.2).toFixed(1)} * var(--u)) rgba(55, 70, 35, ${(0.16 + separation * 0.08).toFixed(3)})`;
    }

    if (backCardRef.current) {
      backCardRef.current.style.transform = `rotate(-7.02deg) translate3d(calc(${backX.toFixed(2)} * var(--u)), 0, calc(-8 * var(--u)))`;
      const shadowSpread = Math.abs(disp) * 0.2;
      backCardRef.current.style.boxShadow = `0 calc(${(10 + shadowSpread).toFixed(1)} * var(--u)) calc(${(24 + shadowSpread).toFixed(1)} * var(--u)) rgba(55, 70, 35, ${(0.12 + separation * 0.04).toFixed(3)})`;
    }

    if (wfPillRef.current) {
      wfPillRef.current.style.transform = `rotate(-1.2deg) translate3d(calc(${(frontX * 0.45).toFixed(2)} * var(--u)), 0, calc(24 * var(--u)))`;
    }

    if (aiPillRef.current) {
      aiPillRef.current.style.transform = `rotate(-1deg) translate3d(calc(${(backX * 0.4).toFixed(2)} * var(--u)), 0, calc(10 * var(--u)))`;
    }
  }, []);

  const startAutomateLoop = useCallback(() => {
    if (automateAnimRef.current.rAFId) return;

    const tick = () => {
      const s = automateAnimRef.current;
      const diff = s.targetDisplacement - s.currentDisplacement;

      // Spring-based interpolation: ~400ms response time, critically damped, fluid acceleration & deceleration
      s.velocity += diff * 0.09;
      s.velocity *= 0.74;
      s.currentDisplacement += s.velocity;

      // Settle check when returning to rest and cursor has left
      if (!s.isHovered && Math.abs(s.currentDisplacement) < 0.01 && Math.abs(s.velocity) < 0.01) {
        s.currentDisplacement = 0;
        s.velocity = 0;
        s.targetDisplacement = 0;
        s.rAFId = 0;
        renderAutomateFrame(0);
        return;
      }

      renderAutomateFrame(s.currentDisplacement);
      s.rAFId = requestAnimationFrame(tick);
    };

    automateAnimRef.current.rAFId = requestAnimationFrame(tick);
  }, [renderAutomateFrame]);

  const handleAutomateMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // On touch/mobile devices, disable cursor-following behavior
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer || !automateCardRef.current) return;

    const rect = automateCardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;

    // Continuously calculate distance from section center (-1 to +1)
    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width * 0.46)));
    
    // Capped movement range: approximately 35-60px (48 in var(--u))
    const MAX_DISP = 48;
    // Cursor toward RIGHT side (normX > 0) -> front card moves RIGHT (+), rear card moves LEFT (-)
    // Cursor toward LEFT side (normX < 0) -> front card moves LEFT (-), rear card moves RIGHT (+)
    // Cursor near CENTER (normX ≈ 0) -> cards remain close to original stacked positions
    automateAnimRef.current.targetDisplacement = normX * MAX_DISP;
    automateAnimRef.current.isHovered = true;

    startAutomateLoop();
  };

  const handleAutomateMouseLeave = () => {
    automateAnimRef.current.isHovered = false;
    automateAnimRef.current.targetDisplacement = 0;
    startAutomateLoop();
  };

  useEffect(() => {
    return () => {
      if (automateAnimRef.current.rAFId) {
        cancelAnimationFrame(automateAnimRef.current.rAFId);
      }
    };
  }, []);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationState('done');
      return;
    }

    let failSafeTimer: ReturnType<typeof setTimeout>;
    let endTimer: ReturnType<typeof setTimeout>;

    // Intersection Observer to trigger entrance animation when section enters viewport
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          observer.disconnect();

          // Wait for fonts ready or 700ms max
          const fontsPromise = (document as any).fonts ? (document as any).fonts.ready : Promise.resolve();
          const timeoutPromise = new Promise((resolve: (value?: unknown) => void) => setTimeout(resolve, 700));

          Promise.race([fontsPromise, timeoutPromise]).then(() => {
            setAnimationState('running');
            // After 1850ms, remove entrance-run and settle to pure static styles
            endTimer = setTimeout(() => {
              setAnimationState('done');
            }, 1850);
          });
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    failSafeTimer = setTimeout(() => {
      setAnimationState('done');
    }, 4000);

    return () => {
      observer.disconnect();
      clearTimeout(failSafeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  const motionClass =
    animationState === 'pending'
      ? 'motion-pending'
      : animationState === 'running'
      ? 'entrance-run'
      : '';

  return (
    <section
      ref={sectionRef}
      id="product-mosaic-section"
      className="mosaic-section relative w-full bg-[#f0f0f0] text-[#141414] min-h-screen py-10 sm:py-16 flex items-center justify-center overflow-hidden"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <style>{`
        /* Scoped root scale knob */
        .mosaic-section {
          --u: min(calc(95vw / 1374), calc(94vh / 666));
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        /* Desktop stage grid */
        .mosaic-stage {
          width: calc(1374 * var(--u));
          height: calc(666 * var(--u));
          display: grid;
          grid-template-columns: calc(339 * var(--u)) calc(627 * var(--u)) calc(388 * var(--u));
          grid-template-rows: calc(149 * var(--u)) calc(343 * var(--u)) calc(156 * var(--u));
          column-gap: calc(10 * var(--u));
          row-gap: calc(9 * var(--u));
        }

        /* Card chrome */
        .mosaic-card {
          border-radius: calc(22 * var(--u));
          border: calc(1.6 * var(--u)) solid rgba(255, 255, 255, 0.92);
          overflow: hidden;
          box-shadow: 0 calc(2 * var(--u)) calc(16 * var(--u)) rgba(24, 30, 45, 0.045);
          position: relative;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.35s ease;
        }

        .mosaic-card:hover {
          transform: translateY(calc(-4 * var(--u)));
          box-shadow: 0 calc(12 * var(--u)) calc(28 * var(--u)) rgba(24, 30, 45, 0.09), 0 calc(2 * var(--u)) calc(6 * var(--u)) rgba(24, 30, 45, 0.04);
          border-color: rgba(255, 255, 255, 1);
        }

        /* Card 1: Notif */
        .mosaic-notif {
          grid-column: 1;
          grid-row: 1;
          background: radial-gradient(120% 140% at 92% 100%, rgba(255, 236, 246, 0.95) 0%, rgba(255, 236, 246, 0) 62%),
                      linear-gradient(135deg, #f9d9e9 0%, #fbdfec 55%, #fce6f1 100%);
          padding: calc(37 * var(--u)) calc(12 * var(--u)) 0 calc(11 * var(--u));
        }

        .mosaic-toast-wrap {
          position: relative;
          height: calc(70 * var(--u));
        }

        .mosaic-toast-ledge {
          position: absolute;
          left: calc(24 * var(--u));
          right: calc(20 * var(--u));
          top: calc(55 * var(--u));
          height: calc(23 * var(--u));
          border-radius: calc(14 * var(--u));
          background: linear-gradient(100deg, #e6e6e6 0%, #e6e3e2 42%, #e5d6d6 74%, #e4cdcf 100%);
          box-shadow: 0 calc(3 * var(--u)) calc(9 * var(--u)) rgba(120, 80, 100, 0.09);
        }

        .mosaic-toast {
          position: absolute;
          inset: 0;
          height: calc(70 * var(--u));
          border-radius: calc(16 * var(--u));
          background: linear-gradient(105deg, #ffffff 34%, #fdeee5 78%, #fce8dd 100%);
          box-shadow: 0 calc(3 * var(--u)) calc(10 * var(--u)) rgba(122, 86, 106, 0.10);
          display: flex;
          align-items: center;
          padding: 0 calc(12 * var(--u)) 0 calc(13 * var(--u));
          gap: calc(11 * var(--u));
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }

        .mosaic-toast:hover {
          transform: translateY(calc(-2 * var(--u))) scale(1.02);
          box-shadow: 0 calc(6 * var(--u)) calc(16 * var(--u)) rgba(122, 86, 106, 0.16);
        }

        /* Card 2: Connect */
        .mosaic-connect {
          grid-column: 1;
          grid-row: 2 / span 2;
          background: linear-gradient(180deg, #fcfdfd 0%, #f4f7f9 30%, #e2ebef 66%, #cedce4 100%);
          padding: calc(32 * var(--u)) 0 0 calc(20 * var(--u));
          perspective: 1000px;
        }

        .mosaic-chips-box {
          position: absolute;
          left: calc(11 * var(--u));
          right: calc(16 * var(--u));
          bottom: calc(13 * var(--u));
          display: flex;
          flex-direction: column;
          gap: calc(8 * var(--u));
          z-index: 2;
          will-change: transform;
        }

        .mosaic-chip-row {
          display: flex;
          gap: calc(14 * var(--u));
        }

        .mosaic-chip-row.r2 {
          padding-left: calc(10 * var(--u));
        }

        .mosaic-chip {
          height: calc(42 * var(--u));
          display: inline-flex;
          align-items: center;
          gap: calc(10 * var(--u));
          padding: 0 calc(17 * var(--u));
          border-radius: 9999px;
          background: linear-gradient(180deg, rgba(247, 253, 255, 0.97) 0%, rgba(240, 250, 254, 0.93) 100%);
          box-shadow: 0 0 0 calc(3 * var(--u)) rgba(0, 0, 0, 0.047), 0 calc(2 * var(--u)) calc(6 * var(--u)) rgba(0, 0, 0, 0.04);
          backdrop-filter: blur(calc(7 * var(--u)));
          -webkit-backdrop-filter: blur(calc(7 * var(--u)));
          font-size: calc(18 * var(--u));
          font-weight: 500;
          letter-spacing: -0.018em;
          color: #131313;
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          will-change: transform, box-shadow;
          transition: box-shadow 0.25s ease, background 0.25s ease;
        }

        .mosaic-chip:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(245, 252, 255, 1) 100%);
        }

        .mosaic-chip-slack {
          position: absolute;
          right: calc(6 * var(--u));
          bottom: calc(124 * var(--u));
          transform: rotate(-20deg);
          z-index: 3;
          box-shadow: 0 0 0 calc(3.2 * var(--u)) rgba(0, 0, 0, 0.052), 0 calc(4 * var(--u)) calc(10 * var(--u)) rgba(0, 0, 0, 0.06);
          cursor: pointer;
          user-select: none;
          will-change: transform, box-shadow;
          transition: box-shadow 0.28s ease, background 0.28s ease;
        }

        .mosaic-chip-slack:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 252, 255, 1) 100%);
        }

        /* Card 3: Automate */
        .mosaic-automate {
          grid-column: 2;
          grid-row: 1 / span 2;
          background: radial-gradient(90% 70% at 6% 0%, rgba(226, 236, 200, 0.9) 0%, rgba(226, 236, 200, 0) 70%),
                      linear-gradient(168deg, #e2ebc9 0%, #e9f0c4 48%, #f0f4b8 78%, #f3f5b0 100%);
        }

        .mosaic-copy-pad {
          position: relative;
          z-index: 3;
          padding: calc(37 * var(--u)) 0 0 calc(45 * var(--u));
        }

        .mosaic-illo {
          position: absolute;
          inset: 0;
          width: calc(627 * var(--u));
          height: calc(501 * var(--u));
          z-index: 2;
          pointer-events: none;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .mosaic-win {
          position: absolute;
          border-radius: calc(11 * var(--u));
          border: calc(3 * var(--u)) solid #fff;
          overflow: hidden;
          box-shadow: 0 calc(12 * var(--u)) calc(28 * var(--u)) rgba(64, 74, 44, 0.16);
          will-change: transform, box-shadow;
        }

        .mosaic-win-titlebar {
          height: calc(13.4 * var(--u));
          background: #242424;
          display: flex;
          align-items: center;
          gap: calc(4.6 * var(--u));
          padding-left: calc(4.9 * var(--u));
        }

        .mosaic-dot {
          width: calc(6 * var(--u));
          height: calc(6 * var(--u));
          border-radius: 50%;
          background: linear-gradient(150deg, #fff 0%, #f6f6f6 50%, #dcdcdc 100%);
        }

        .mosaic-win-back {
          left: calc(121.2 * var(--u));
          top: calc(245.2 * var(--u));
          width: calc(324 * var(--u));
          height: calc(250 * var(--u));
          transform: rotate(-7.02deg);
          transform-origin: center center;
          z-index: 1;
        }

        .mosaic-win-back .mosaic-win-body {
          width: 100%;
          height: calc(100% - calc(13.4 * var(--u)));
          background: #eaefcd;
          display: flex;
        }

        .mosaic-win-back .mosaic-strip {
          width: 23.7%;
          height: 100%;
          background: #bfd0ac;
        }

        .mosaic-win-front {
          left: calc(180.4 * var(--u));
          top: calc(283.3 * var(--u));
          width: calc(322 * var(--u));
          height: calc(250 * var(--u));
          transform: rotate(4.23deg);
          border-bottom: 0;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          box-shadow: 0 calc(14 * var(--u)) calc(32 * var(--u)) rgba(64, 74, 44, 0.18);
          transform-origin: center center;
          z-index: 3;
        }

        .mosaic-win-front .mosaic-win-body {
          width: 100%;
          height: calc(100% - calc(13.4 * var(--u)));
          background: #f9edfb;
          display: flex;
        }

        .mosaic-win-front .mosaic-strip {
          width: 16%;
          height: 100%;
          background: #e8d6fb;
        }

        .mosaic-pill-wf {
          position: absolute;
          left: calc(395 * var(--u));
          top: calc(349 * var(--u));
          height: calc(30 * var(--u));
          display: flex;
          align-items: center;
          gap: calc(7 * var(--u));
          padding: 0 calc(14 * var(--u)) 0 calc(6 * var(--u));
          border-radius: 9999px;
          background: #fff;
          box-shadow: 0 0 0 calc(2.8 * var(--u)) rgba(0, 0, 0, 0.045);
          transform: rotate(-1.2deg);
          font-size: calc(11.5 * var(--u));
          font-weight: 600;
          letter-spacing: -0.014em;
          color: #151515;
          white-space: nowrap;
          will-change: transform;
        }

        .mosaic-tick-disc {
          width: calc(20 * var(--u));
          height: calc(20 * var(--u));
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, rgba(255, 255, 255, 0) 50%),
                      linear-gradient(145deg, #e6f3df 0%, #cfe0bd 47%, #b9cfa5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mosaic-pill-ai {
          position: absolute;
          left: calc(68 * var(--u));
          top: calc(404 * var(--u));
          width: calc(144 * var(--u));
          height: calc(52 * var(--u));
          border-radius: calc(10 * var(--u));
          background: #fff;
          box-shadow: 0 0 0 calc(2.8 * var(--u)) rgba(0, 0, 0, 0.045);
          display: flex;
          align-items: center;
          gap: calc(9 * var(--u));
          padding: 0 calc(16 * var(--u));
          transform: rotate(-1deg);
          will-change: transform;
        }

        .mosaic-skeleton-col {
          display: flex;
          flex-direction: column;
          gap: calc(8 * var(--u));
          flex: 1;
        }

        .mosaic-skeleton-line {
          height: calc(6.5 * var(--u));
          border-radius: 9999px;
          background: #d8d8d7;
        }

        /* Card 4: Insights */
        .mosaic-insights {
          grid-column: 3;
          grid-row: 1 / span 2;
          background: radial-gradient(115% 70% at 22% 0%, #fdf2e5 0%, rgba(253, 242, 229, 0) 68%),
                      linear-gradient(180deg, #f9f1e8 0%, #f7efe6 100%);
          padding: calc(29 * var(--u)) calc(25 * var(--u)) calc(23 * var(--u)) calc(21 * var(--u));
          display: flex;
          flex-direction: column;
        }

        .mosaic-insights-tag {
          align-self: flex-start;
          height: calc(31 * var(--u));
          padding: 0 calc(17 * var(--u));
          border-radius: 9999px;
          margin-left: calc(4 * var(--u));
          background: linear-gradient(100deg, #ffffff 18%, #fdeadb 100%);
          border: calc(1.2 * var(--u)) solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 calc(3 * var(--u)) calc(9 * var(--u)) rgba(160, 120, 80, 0.09);
          font-size: calc(12 * var(--u));
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #111111;
          display: inline-flex;
          align-items: center;
        }

        .mosaic-chart {
          margin-top: auto;
          height: calc(294 * var(--u));
          display: flex;
          align-items: flex-end;
          gap: calc(13 * var(--u));
        }

        .mosaic-chart-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          cursor: pointer;
          will-change: transform;
          transform-origin: bottom center;
        }

        .mosaic-bar {
          width: 100%;
          border-radius: calc(7 * var(--u));
          display: flex;
          justify-content: center;
          padding-top: calc(9 * var(--u));
          box-sizing: border-box;
          transform-origin: bottom center;
          transition: filter 0.25s ease, box-shadow 0.25s ease;
        }

        .mosaic-bar.quiet {
          background: #e9e3da;
        }

        .mosaic-bar.quiet .mosaic-bar-label {
          color: #a1978a;
          font-size: calc(13 * var(--u));
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .mosaic-bar.special {
          background: linear-gradient(180deg, #f2b705 0%, #e7b208 26%, #a8a422 52%, #6a8f33 76%, #3d7a3e 100%);
          box-shadow: 0 calc(4 * var(--u)) calc(12 * var(--u)) rgba(150, 120, 20, 0.20);
        }

        .mosaic-bar.special .mosaic-bar-label {
          color: #ffffff;
          font-size: calc(13 * var(--u));
          font-weight: 600;
        }

        /* Chart col hover & interactive states */
        .mosaic-chart-col:hover .mosaic-bar.quiet {
          background: #e2d9cd;
          filter: drop-shadow(0 calc(6 * var(--u)) calc(10 * var(--u)) rgba(130, 100, 70, 0.16));
        }

        .mosaic-chart-col:hover .mosaic-bar.quiet .mosaic-bar-label {
          color: #4a4035;
          font-weight: 700;
        }

        .mosaic-chart-col:hover .mosaic-bar.special {
          box-shadow: 0 calc(8 * var(--u)) calc(18 * var(--u)) rgba(150, 120, 20, 0.35);
          filter: brightness(1.05);
        }

        .mosaic-chart-col:hover .mosaic-day-label {
          color: #111111;
          font-weight: 700;
        }

        /* Floating dynamic tooltip on bar hover */
        .mosaic-bar-tooltip {
          position: absolute;
          top: calc(-32 * var(--u));
          background: #18181b;
          color: #ffffff;
          font-size: calc(11 * var(--u));
          font-weight: 600;
          padding: calc(3 * var(--u)) calc(8 * var(--u));
          border-radius: calc(6 * var(--u));
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
          box-shadow: 0 calc(4 * var(--u)) calc(10 * var(--u)) rgba(0, 0, 0, 0.18);
          animation: tooltip-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mosaic-bar-tooltip::after {
          content: '';
          position: absolute;
          bottom: calc(-4 * var(--u));
          left: 50%;
          transform: translateX(-50%);
          border-left: calc(4 * var(--u)) solid transparent;
          border-right: calc(4 * var(--u)) solid transparent;
          border-top: calc(4 * var(--u)) solid #18181b;
        }

        @keyframes tooltip-pop {
          0% {
            opacity: 0;
            transform: translateY(calc(5 * var(--u))) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mosaic-day-label {
          font-size: calc(10.4 * var(--u));
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #a79c8e;
          margin-top: calc(10 * var(--u));
          transition: color 0.2s ease, font-weight 0.2s ease;
        }

        /* Card 5: Search */
        .mosaic-search {
          grid-column: 2 / span 2;
          grid-row: 3;
          background: linear-gradient(103deg, #eae9f5 0%, #e2e0f1 34%, #cfcdea 72%, #c2c0e6 100%);
          display: flex;
          align-items: center;
          padding-left: calc(46 * var(--u));
          padding-right: calc(25 * var(--u));
        }

        .mosaic-bar-search {
          margin-left: auto;
          width: calc(612 * var(--u));
          height: calc(64 * var(--u));
          border-radius: 9999px;
          background: #ffffff;
          box-shadow: 0 calc(4 * var(--u)) calc(14 * var(--u)) rgba(70, 66, 120, 0.10);
          display: flex;
          align-items: center;
          padding: 0 calc(22 * var(--u)) 0 calc(10 * var(--u));
          gap: calc(16 * var(--u));
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: text;
        }

        .mosaic-bar-search:hover {
          transform: translateY(calc(-2 * var(--u)));
          box-shadow: 0 calc(8 * var(--u)) calc(22 * var(--u)) rgba(70, 66, 120, 0.16);
        }

        .mosaic-mag-circle {
          width: calc(44 * var(--u));
          height: calc(44 * var(--u));
          border-radius: 50%;
          background: #f1f1f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease, background-color 0.25s ease;
        }

        .mosaic-bar-search:hover .mosaic-mag-circle {
          transform: scale(1.05);
          background: #e6e6f0;
        }

        /* =========================================
           ENTRANCE ANIMATION SYSTEM
           ========================================= */
        @keyframes panel-settle {
          0% {
            opacity: 0;
            transform: translateY(calc(12 * var(--u))) scale(0.988);
            clip-path: inset(3% round calc(22 * var(--u)));
          }
          62% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            clip-path: inset(0% round calc(22 * var(--u)));
          }
        }

        @keyframes type-unmask {
          0% {
            opacity: 0;
            transform: translateY(calc(16 * var(--u)));
            clip-path: inset(0 0 96% 0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            clip-path: inset(0 0 0% 0);
          }
        }

        @keyframes content-rise {
          0% {
            opacity: 0;
            transform: translateY(calc(9 * var(--u)));
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes interface-settle {
          0% {
            opacity: 0;
            transform: translateY(calc(16 * var(--u))) scale(0.975);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes detail-settle {
          0% {
            opacity: 0;
            transform: translateY(calc(8 * var(--u))) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toast-arrive {
          0% {
            opacity: 0;
            transform: translateY(calc(10 * var(--u))) scale(0.982);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chip-row-arrive {
          0% {
            opacity: 0;
            transform: translateY(calc(11 * var(--u)));
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chart-unmask {
          0% {
            opacity: 0;
            transform: translateY(calc(10 * var(--u)));
            clip-path: inset(100% 0 0 0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes search-resolve {
          0% {
            opacity: 0;
            transform: translateX(calc(12 * var(--u))) scale(0.975, 1);
            transform-origin: right center;
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1, 1);
            transform-origin: right center;
          }
        }

        /* While motion-pending */
        .mosaic-section.motion-pending .mosaic-card {
          opacity: 0;
          visibility: hidden;
        }

        /* While entrance-run */
        .mosaic-section.entrance-run .mosaic-card {
          will-change: opacity, transform, scale, clip-path;
          animation-fill-mode: backwards;
        }

        .mosaic-section.entrance-run .mosaic-automate {
          animation: panel-settle 0.82s cubic-bezier(0.16, 1, 0.3, 1) 0.04s backwards;
        }
        .mosaic-section.entrance-run .mosaic-notif {
          animation: panel-settle 0.66s cubic-bezier(0.16, 1, 0.3, 1) 0.10s backwards;
        }
        .mosaic-section.entrance-run .mosaic-insights {
          animation: panel-settle 0.74s cubic-bezier(0.16, 1, 0.3, 1) 0.14s backwards;
        }
        .mosaic-section.entrance-run .mosaic-connect {
          animation: panel-settle 0.74s cubic-bezier(0.16, 1, 0.3, 1) 0.20s backwards;
        }
        .mosaic-section.entrance-run .mosaic-search {
          animation: panel-settle 0.68s cubic-bezier(0.16, 1, 0.3, 1) 0.28s backwards;
        }

        .mosaic-section.entrance-run .anim-automate-h2 {
          animation: type-unmask 0.78s cubic-bezier(0.22, 1, 0.36, 1) 0.20s backwards;
        }
        .mosaic-section.entrance-run .anim-automate-sub {
          animation: content-rise 0.54s cubic-bezier(0.16, 1, 0.3, 1) 0.48s backwards;
        }
        .mosaic-section.entrance-run .mosaic-win-back {
          animation: interface-settle 0.84s cubic-bezier(0.16, 1, 0.3, 1) 0.42s backwards;
        }
        .mosaic-section.entrance-run .mosaic-win-front {
          animation: interface-settle 0.94s cubic-bezier(0.16, 1, 0.3, 1) 0.50s backwards;
        }
        .mosaic-section.entrance-run .mosaic-pill-ai {
          animation: detail-settle 0.60s cubic-bezier(0.16, 1, 0.3, 1) 0.72s backwards;
        }
        .mosaic-section.entrance-run .mosaic-pill-wf {
          animation: detail-settle 0.58s cubic-bezier(0.16, 1, 0.3, 1) 0.78s backwards;
        }
        .mosaic-section.entrance-run .mosaic-toast-wrap {
          animation: toast-arrive 0.62s cubic-bezier(0.16, 1, 0.3, 1) 0.38s backwards;
        }
        .mosaic-section.entrance-run .anim-connect-h2 {
          animation: type-unmask 0.64s cubic-bezier(0.22, 1, 0.36, 1) 0.54s backwards;
        }
        .mosaic-section.entrance-run .anim-connect-sub {
          animation: content-rise 0.48s cubic-bezier(0.16, 1, 0.3, 1) 0.73s backwards;
        }
        .mosaic-section.entrance-run .mosaic-chip-row.r1 {
          animation: chip-row-arrive 0.62s cubic-bezier(0.16, 1, 0.3, 1) 0.86s backwards;
        }
        .mosaic-section.entrance-run .mosaic-chip-row.r2 {
          animation: chip-row-arrive 0.62s cubic-bezier(0.16, 1, 0.3, 1) 0.91s backwards;
        }
        .mosaic-section.entrance-run .mosaic-chip-row.r3 {
          animation: chip-row-arrive 0.62s cubic-bezier(0.16, 1, 0.3, 1) 0.96s backwards;
        }
        .mosaic-section.entrance-run .mosaic-chip-slack {
          animation: detail-settle 0.58s cubic-bezier(0.16, 1, 0.3, 1) 1.02s backwards;
        }
        .mosaic-section.entrance-run .mosaic-insights-tag {
          animation: content-rise 0.46s cubic-bezier(0.16, 1, 0.3, 1) 0.44s backwards;
        }
        .mosaic-section.entrance-run .anim-insights-h2 {
          animation: type-unmask 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.56s backwards;
        }
        .mosaic-section.entrance-run .anim-insights-sub {
          animation: content-rise 0.44s cubic-bezier(0.16, 1, 0.3, 1) 0.75s backwards;
        }
        .mosaic-section.entrance-run .mosaic-chart {
          animation: chart-unmask 0.86s cubic-bezier(0.16, 1, 0.3, 1) 0.72s backwards;
        }
        .mosaic-section.entrance-run .anim-search-h2 {
          animation: type-unmask 0.56s cubic-bezier(0.22, 1, 0.36, 1) 0.72s backwards;
        }
        .mosaic-section.entrance-run .mosaic-bar-search {
          animation: search-resolve 0.70s cubic-bezier(0.16, 1, 0.3, 1) 0.88s backwards;
        }

        /* =========================================
           RESPONSIVE: TABLET
           ========================================= */
        @media (min-width: 701px) and (max-width: 1040px) and (max-aspect-ratio: 3/2) {
          .mosaic-section {
            --u: min(calc(95vw / 1025), calc(94vh / 918));
          }
          .mosaic-stage {
            width: calc(1025 * var(--u));
            height: calc(918 * var(--u));
            grid-template-columns: calc(627 * var(--u)) calc(388 * var(--u));
            grid-template-rows: calc(505 * var(--u)) calc(194 * var(--u)) calc(201 * var(--u));
          }
          .mosaic-automate {
            grid-column: 1;
            grid-row: 1;
            height: calc(501 * var(--u));
          }
          .mosaic-notif {
            grid-column: 1;
            grid-row: 2;
          }
          .mosaic-search {
            grid-column: 1;
            grid-row: 3;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            padding: calc(20 * var(--u)) calc(25 * var(--u));
          }
          .mosaic-bar-search {
            margin-left: 0;
            width: 100%;
            margin-top: calc(18 * var(--u));
          }
          .mosaic-insights {
            grid-column: 2;
            grid-row: 1;
          }
          .mosaic-connect {
            grid-column: 2;
            grid-row: 2 / span 2;
          }
        }

        /* =========================================
           RESPONSIVE: MOBILE (max-width: 700px)
           ========================================= */
        @media (max-width: 700px) {
          .mosaic-section {
            --u: calc((min(100vw, 560px) - 30px) / 375);
            display: block;
            min-height: auto;
            overflow-y: visible;
            padding: 24px 0;
          }
          .mosaic-stage {
            width: calc(375 * var(--u));
            height: auto;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            row-gap: calc(13 * var(--u));
          }
          .mosaic-notif {
            height: calc(149 * var(--u));
          }
          .mosaic-connect {
            height: calc(508 * var(--u));
          }
          .mosaic-insights {
            height: calc(500 * var(--u));
          }
          .mosaic-automate {
            height: calc(298 * var(--u));
          }
          .mosaic-illo {
            transform: scale(0.5981);
            transform-origin: 0 0;
          }
          .mosaic-search {
            flex-direction: column;
            align-items: flex-start;
            padding: calc(24 * var(--u)) calc(20 * var(--u));
          }
          .mosaic-bar-search {
            margin-left: 0;
            width: 100%;
            height: calc(58 * var(--u));
            margin-top: calc(16 * var(--u));
          }
          /* Mobile entrance rules: only notif, connect, automate hide */
          .mosaic-section.motion-pending .mosaic-insights,
          .mosaic-section.motion-pending .mosaic-search {
            opacity: 1 !important;
            visibility: visible !important;
          }
        }
      `}</style>

      {/* 1374 × 666 Reference Stage */}
      <div
        className={`mosaic-stage ${motionClass}`}
        role="main"
        aria-label="Product feature overview"
      >
        {/* =========================================
            CARD 1: NOTIFICATION (.notif)
            ========================================= */}
        <div
          className="mosaic-card mosaic-notif notif"
          role="region"
          aria-label="Automation notification"
        >
          <div className="mosaic-toast-wrap toast-wrap">
            <div className="mosaic-toast-ledge" />
            <div className="mosaic-toast">
              {/* Sparkle icon SVG 27×27 */}
              <svg
                width="calc(27 * var(--u))"
                height="calc(27 * var(--u))"
                viewBox="0 0 24 24"
                className="shrink-0"
                aria-hidden="true"
              >
                <mask id="toast-sparkle-mask">
                  <rect width="24" height="24" fill="white" />
                  <path
                    d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                    fill="black"
                  />
                </mask>
                <circle cx="12" cy="12" r="12" fill="#0d0d0d" mask="url(#toast-sparkle-mask)" />
                <path
                  d="M12 3C12 7.97 7.97 12 3 12C7.97 12 12 16.03 12 21C12 16.03 16.03 12 21 12C16.03 12 12 7.97 12 3Z"
                  fill="#0d0d0d"
                />
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 'calc(11.2 * var(--u))',
                    fontWeight: 800,
                    letterSpacing: '-0.012em',
                    lineHeight: 1.1,
                    color: '#0d0d0d',
                  }}
                >
                  Automation completed!
                </span>
                <span
                  style={{
                    fontSize: 'calc(10 * var(--u))',
                    fontWeight: 400,
                    lineHeight: 1.28,
                    letterSpacing: '-0.005em',
                    color: '#2b2b2b',
                    maxWidth: 'calc(118 * var(--u))',
                    marginTop: 'calc(3.6 * var(--u))',
                  }}
                >
                  Weekly client report sent automatically
                </span>
              </div>

              <span
                style={{
                  fontSize: 'calc(7.4 * var(--u))',
                  fontWeight: 500,
                  color: '#8b8489',
                  alignSelf: 'flex-start',
                  marginTop: 'calc(12 * var(--u))',
                  letterSpacing: '0.005em',
                  marginLeft: 'auto',
                }}
              >
                2:34 PM
              </span>
            </div>
          </div>
        </div>

        {/* =========================================
            CARD 2: CONNECT YOUR TOOLS (.connect)
            ========================================= */}
        <div
          ref={connectCardRef}
          className="mosaic-card mosaic-connect connect"
          role="region"
          aria-label="Integrations"
          onMouseMove={handleConnectMouseMove}
          onMouseLeave={handleConnectMouseLeave}
        >
          <h2
            className="anim-connect-h2"
            style={{
              fontSize: 'calc(28 * var(--u))',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.028em',
              color: '#0c0c0c',
              margin: 0,
            }}
          >
            Connect your
            <br />
            Tools Now.
          </h2>

          <p
            className="anim-connect-sub"
            style={{
              marginTop: 'calc(14 * var(--u))',
              fontSize: 'calc(17 * var(--u))',
              fontWeight: 400,
              lineHeight: 1.3,
              letterSpacing: '-0.013em',
              color: '#1c1c1c',
              margin: 0,
            }}
          >
            120+ integrations available
          </p>

          <div
            ref={chipsBoxRef}
            className="mosaic-chips-box"
          >
            {/* Row 1: Microsoft Teams */}
            <div className="mosaic-chip-row r1">
              <div
                ref={(el) => {
                  chipRefs.current[0] = el;
                }}
                id="mosaic-chip-teams"
                className="mosaic-chip"
              >
                {/* MS Teams Avatar SVG */}
                <svg
                  width="calc(21 * var(--u))"
                  height="calc(21 * var(--u))"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="16.5" cy="7.5" r="3.5" fill="#5059C9" />
                  <path
                    d="M16.5 13C13.5 13 11 15 11 18H22C22 15 19.5 13 16.5 13Z"
                    fill="#5059C9"
                  />
                  <rect x="2" y="5" width="10" height="14" rx="2" fill="#7B83EB" />
                  <path
                    d="M7 8.5V15.5M4.5 8.5H9.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Microsoft Teams</span>
              </div>
            </div>

            {/* Row 2: Notion + GitHub */}
            <div className="mosaic-chip-row r2">
              <div
                ref={(el) => {
                  chipRefs.current[1] = el;
                }}
                id="mosaic-chip-notion"
                className="mosaic-chip"
              >
                {/* Notion SVG */}
                <svg
                  width="calc(21 * var(--u))"
                  height="calc(21 * var(--u))"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="2.5"
                    y="2.5"
                    width="19"
                    height="19"
                    rx="3.5"
                    fill="#ffffff"
                    stroke="#111111"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M7 6.5L14 6.5M7 6.5V17.5M7 17.5L16.5 6.5M16.5 6.5V17.5"
                    stroke="#111111"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Notion</span>
              </div>

              <div
                ref={(el) => {
                  chipRefs.current[2] = el;
                }}
                id="mosaic-chip-github"
                className="mosaic-chip"
              >
                {/* GitHub Octocat SVG */}
                <svg
                  width="calc(21 * var(--u))"
                  height="calc(21 * var(--u))"
                  viewBox="0 0 24 24"
                  fill="#0d0d0d"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </div>
            </div>

            {/* Row 3: Google Drive + Figma */}
            <div className="mosaic-chip-row r3">
              <div
                ref={(el) => {
                  chipRefs.current[3] = el;
                }}
                id="mosaic-chip-gdrive"
                className="mosaic-chip"
              >
                {/* Official Google Drive 6-color triangle SVG */}
                <svg
                  width="calc(21 * var(--u))"
                  height="calc(21 * var(--u))"
                  viewBox="0 0 87.3 78"
                  aria-hidden="true"
                >
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                  <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l6.9 11.95z" fill="#ea4335" />
                  <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z" fill="#00832d" />
                  <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc" />
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
                <span>Google Drive</span>
              </div>

              <div
                ref={(el) => {
                  chipRefs.current[4] = el;
                }}
                id="mosaic-chip-figma"
                className="mosaic-chip"
              >
                {/* Official Figma 5-color logo SVG */}
                <svg
                  width="calc(21 * var(--u))"
                  height="calc(21 * var(--u))"
                  viewBox="0 0 38 57"
                  aria-hidden="true"
                >
                  <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1abcfe" />
                  <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0acf83" />
                  <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#ff7262" />
                  <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#f24e1e" />
                  <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#a259ff" />
                </svg>
                <span>Figma</span>
              </div>
            </div>
          </div>

          {/* Floating Slack Chip */}
          <div
            ref={(el) => {
              chipRefs.current[5] = el;
            }}
            id="mosaic-chip-slack"
            className="mosaic-chip mosaic-chip-slack chip-slack"
          >
            {/* Official 4-color Slack SVG */}
            <svg
              width="calc(21 * var(--u))"
              height="calc(21 * var(--u))"
              viewBox="0 0 122.8 122.8"
              aria-hidden="true"
            >
              <path d="M25.8 77.6a12.9 12.9 0 1 1-12.9-12.9h12.9v12.9zm6.5 0a12.9 12.9 0 1 1 25.8 0v32.3a12.9 12.9 0 1 1-25.8 0V77.6z" fill="#E01E5A" />
              <path d="M45.2 25.8a12.9 12.9 0 1 1 12.9-12.9v12.9H45.2zm0 6.5a12.9 12.9 0 1 1 0 25.8H12.9a12.9 12.9 0 1 1 0-25.8h32.3z" fill="#36C5F0" />
              <path d="M97 45.2a12.9 12.9 0 1 1 12.9 12.9H97V45.2zm-6.5 0a12.9 12.9 0 1 1-25.8 0V12.9a12.9 12.9 0 1 1 25.8 0v32.3z" fill="#2EB67D" />
              <path d="M77.6 97a12.9 12.9 0 1 1-12.9 12.9V97h12.9zm0-6.5a12.9 12.9 0 1 1 0-25.8h32.3a12.9 12.9 0 1 1 0 25.8H77.6z" fill="#ECB22E" />
            </svg>
            <span>Slack</span>
          </div>
        </div>

        {/* =========================================
            CARD 3: AUTOMATE YOUR WORK (.automate)
            ========================================= */}
        <div
          ref={automateCardRef}
          className="mosaic-card mosaic-automate automate"
          role="region"
          aria-label="Automate your work"
          onMouseMove={handleAutomateMouseMove}
          onMouseLeave={handleAutomateMouseLeave}
        >
          <div className="mosaic-copy-pad">
            <h2
              className="anim-automate-h2"
              style={{
                fontSize: 'calc(35 * var(--u))',
                fontWeight: 800,
                lineHeight: 1.43,
                letterSpacing: '-0.03em',
                color: '#15201a',
                margin: 0,
              }}
            >
              <span style={{ color: '#5f8b3e' }}>Automate</span> your work.
              <br />
              Focus on what matters.
            </h2>

            <p
              className="anim-automate-sub"
              style={{
                marginTop: 'calc(13 * var(--u))',
                fontSize: 'calc(17 * var(--u))',
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: '-0.014em',
                color: '#1e2a1b',
                margin: 0,
              }}
            >
              AI-powered workflows that save teams hours every week.
            </p>
          </div>

          {/* Illustration layer with 3D depth and layered separation */}
          <div className="mosaic-illo illo">
            {/* Back Window - smoothly glides horizontally in opposite direction */}
            <div
              ref={backCardRef}
              className="mosaic-win mosaic-win-back win-back"
            >
              <div className="mosaic-win-titlebar">
                <div className="mosaic-dot" />
                <div className="mosaic-dot" />
                <div className="mosaic-dot" />
              </div>
              <div className="mosaic-win-body">
                <div className="mosaic-strip" />
              </div>
            </div>

            {/* Front Window - smoothly glides horizontally opposite to rear card */}
            <div
              ref={frontCardRef}
              className="mosaic-win mosaic-win-front win-front"
            >
              <div className="mosaic-win-titlebar">
                <div className="mosaic-dot" />
                <div className="mosaic-dot" />
                <div className="mosaic-dot" />
              </div>
              <div className="mosaic-win-body">
                <div className="mosaic-strip" />
              </div>
            </div>

            {/* "Workflow Automated" Pill */}
            <div
              ref={wfPillRef}
              className="mosaic-pill-wf pill-wf"
            >
              <div className="mosaic-tick-disc">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1.5 4.2L3.8 6.5L8.5 1.5"
                    stroke="#161616"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span>Workflow Automated</span>
            </div>

            {/* AI Sparkle Card */}
            <div
              ref={aiPillRef}
              className="mosaic-pill-ai pill-ai"
            >
              {/* Dual 4-point sparkle SVG 23×23 */}
              <svg
                width="calc(23 * var(--u))"
                height="calc(23 * var(--u))"
                viewBox="0 0 24 24"
                fill="#eff4e6"
                stroke="#4f7433"
                className="shrink-0"
              >
                <path
                  d="M10 2C10 6 6 10 2 10C6 10 10 14 10 18C10 14 14 10 18 10C14 10 10 6 10 2Z"
                  strokeWidth="2.2"
                />
                <path
                  d="M17 14C17 16 15 18 13 18C15 18 17 20 17 22C17 20 19 18 21 18C19 18 17 16 17 14Z"
                  strokeWidth="2.25"
                />
              </svg>
              <div className="mosaic-skeleton-col">
                <div className="mosaic-skeleton-line" style={{ width: '85%' }} />
                <div className="mosaic-skeleton-line" style={{ width: '55%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            CARD 4: PRODUCTIVITY INSIGHTS (.insights)
            ========================================= */}
        <div
          ref={insightsCardRef}
          className="mosaic-card mosaic-insights insights"
          role="region"
          aria-label="Productivity insights"
          onMouseMove={handleInsightsMouseMove}
          onMouseLeave={handleInsightsMouseLeave}
        >
          <div className="mosaic-insights-tag tag">
            Productivity Insights
          </div>

          <h2
            className="anim-insights-h2"
            style={{
              marginTop: 'calc(22 * var(--u))',
              fontSize: 'calc(37 * var(--u))',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1,
              color: '#0b0b0b',
              margin: 0,
            }}
          >
            48 hours
          </h2>

          <p
            className="anim-insights-sub"
            style={{
              marginTop: 'calc(12 * var(--u))',
              fontSize: 'calc(14.5 * var(--u))',
              fontWeight: 400,
              letterSpacing: '-0.012em',
              color: '#1d1d1d',
              margin: 0,
            }}
          >
            saved this week!
          </p>

          {/* Bar chart with magnetic cursor deflection */}
          <div
            className="mosaic-chart chart"
            role="img"
            aria-label="Hours saved per day: Monday 2, Tuesday 6, Wednesday 12, Thursday 20, Friday 31, Saturday 40, Sunday 48"
          >
            {/* MON: 2h (43.2) */}
            <div
              ref={(el) => {
                barRefs.current[0] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(0)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[0].x}px, ${barOffsets[0].y}px, 0) scale(${
                  hoveredBarIndex === 0 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 0 && (
                <div className="mosaic-bar-tooltip">2 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(43.2 * var(--u))' }}>
                <span className="mosaic-bar-label">2h</span>
              </div>
              <span className="mosaic-day-label">MON</span>
            </div>

            {/* TUE: 6h (80.9) */}
            <div
              ref={(el) => {
                barRefs.current[1] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(1)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[1].x}px, ${barOffsets[1].y}px, 0) scale(${
                  hoveredBarIndex === 1 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 1 && (
                <div className="mosaic-bar-tooltip">6 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(80.9 * var(--u))' }}>
                <span className="mosaic-bar-label">6h</span>
              </div>
              <span className="mosaic-day-label">TUE</span>
            </div>

            {/* WED: 12h (131.7) */}
            <div
              ref={(el) => {
                barRefs.current[2] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(2)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[2].x}px, ${barOffsets[2].y}px, 0) scale(${
                  hoveredBarIndex === 2 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 2 && (
                <div className="mosaic-bar-tooltip">12 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(131.7 * var(--u))' }}>
                <span className="mosaic-bar-label">12h</span>
              </div>
              <span className="mosaic-day-label">WED</span>
            </div>

            {/* THU: 20h (165.5) */}
            <div
              ref={(el) => {
                barRefs.current[3] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(3)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[3].x}px, ${barOffsets[3].y}px, 0) scale(${
                  hoveredBarIndex === 3 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 3 && (
                <div className="mosaic-bar-tooltip">20 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(165.5 * var(--u))' }}>
                <span className="mosaic-bar-label">20h</span>
              </div>
              <span className="mosaic-day-label">THU</span>
            </div>

            {/* FRI: 31h (203.2) */}
            <div
              ref={(el) => {
                barRefs.current[4] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(4)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[4].x}px, ${barOffsets[4].y}px, 0) scale(${
                  hoveredBarIndex === 4 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 4 && (
                <div className="mosaic-bar-tooltip">31 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(203.2 * var(--u))' }}>
                <span className="mosaic-bar-label">31h</span>
              </div>
              <span className="mosaic-day-label">FRI</span>
            </div>

            {/* SAT: 40h (235.2) */}
            <div
              ref={(el) => {
                barRefs.current[5] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(5)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[5].x}px, ${barOffsets[5].y}px, 0) scale(${
                  hoveredBarIndex === 5 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 5 && (
                <div className="mosaic-bar-tooltip">40 hours saved</div>
              )}
              <div className="mosaic-bar quiet" style={{ height: 'calc(235.2 * var(--u))' }}>
                <span className="mosaic-bar-label">40h</span>
              </div>
              <span className="mosaic-day-label">SAT</span>
            </div>

            {/* SUN: 48h (265) - Special Gradient */}
            <div
              ref={(el) => {
                barRefs.current[6] = el;
              }}
              className="mosaic-chart-col"
              onMouseEnter={() => setHoveredBarIndex(6)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              style={{
                transform: `translate3d(${barOffsets[6].x}px, ${barOffsets[6].y}px, 0) scale(${
                  hoveredBarIndex === 6 ? 1.05 : 1
                })`,
              }}
            >
              {hoveredBarIndex === 6 && (
                <div className="mosaic-bar-tooltip">48 hours saved! ⭐</div>
              )}
              <div className="mosaic-bar special" style={{ height: 'calc(265 * var(--u))' }}>
                <span className="mosaic-bar-label">48h</span>
              </div>
              <span className="mosaic-day-label">SUN</span>
            </div>
          </div>
        </div>

        {/* =========================================
            CARD 5: SEARCH (.search)
            ========================================= */}
        <div
          className="mosaic-card mosaic-search search"
          role="region"
          aria-label="Search"
        >
          <h2
            className="anim-search-h2"
            style={{
              fontSize: 'calc(23 * var(--u))',
              fontWeight: 800,
              lineHeight: 1.39,
              letterSpacing: '-0.028em',
              color: '#0d0d10',
              margin: 0,
            }}
          >
            Find anything
            <br />
            instantly
          </h2>

          <div className="mosaic-bar-search bar-search">
            {/* Search Glass Icon */}
            <div className="mosaic-mag-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7.1" stroke="#121212" strokeWidth="2.2" />
                <path d="M16.5 16.5L21 21" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            <span
              style={{
                fontSize: 'calc(16.5 * var(--u))',
                fontWeight: 400,
                letterSpacing: '-0.015em',
                color: '#8c8c99',
                flex: 1,
              }}
            >
              Search tasks, docs, workflows...
            </span>

            {/* Mic SVG 16×20 */}
            <svg
              width="calc(16 * var(--u))"
              height="calc(20 * var(--u))"
              viewBox="0 0 16 20"
              fill="none"
              className="shrink-0"
            >
              {/* Capsule */}
              <rect x="4.5" y="1" width="7" height="11" rx="3.5" fill="#141414" />
              {/* U arc */}
              <path
                d="M2 8.5C2 12.0899 4.68629 15 8 15C11.3137 15 14 12.0899 14 8.5"
                stroke="#141414"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Stem */}
              <path d="M8 15V18.5" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
              {/* Base */}
              <path d="M4.5 18.5H11.5" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
