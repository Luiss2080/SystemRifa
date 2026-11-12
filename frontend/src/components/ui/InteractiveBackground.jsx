import { useEffect, useRef } from 'react';

const PARTICLE_COLORS = [
  'rgba(16, 185, 129, 0.42)', // emerald-500
  'rgba(20, 184, 166, 0.36)', // teal-500
  'rgba(5, 150, 105, 0.32)',  // emerald-600
  'rgba(245, 158, 11, 0.28)', // amber-500 acento
];

/**
 * Fondo interactivo global de la web:
 * combina degradado atmosférico emerald/teal, blobs flotantes, anillos geométricos sutiles,
 * trama de puntos arquitectónica, halo reactivo al puntero y red de constelación en canvas.
 */
export function InteractiveBackground() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = {
      x: width * 0.5,
      y: height * 0.35,
      targetX: width * 0.5,
      targetY: height * 0.35,
      active: false,
    };

    const count = Math.min(54, Math.max(24, Math.floor((width * height) / 30000)));
    const nodes = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.7 + (idx % 3) * 0.85,
      color: PARTICLE_COLORS[idx % PARTICLE_COLORS.length],
    }));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      }
    }

    resize();

    if (prefersReducedMotion) {
      drawStatic();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    let rafId = 0;

    function onPointerMove(e) {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function tick() {
      pointer.x += (pointer.targetX - pointer.x) * 0.1;
      pointer.y += (pointer.targetY - pointer.y) * 0.1;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pointer.x - 300}px, ${pointer.y - 300}px, 0)`;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];

        if (pointer.active) {
          const dxp = pointer.x - a.x;
          const dyp = pointer.y - a.y;
          const distP = Math.hypot(dxp, dyp);
          if (distP > 1 && distP < 200) {
            const pull = (1 - distP / 200) * 0.015;
            a.vx += (dxp / distP) * pull;
            a.vy += (dyp / distP) * pull;
          }
        }

        const speed = Math.hypot(a.vx, a.vy);
        if (speed > 0.72) {
          a.vx = (a.vx / speed) * 0.72;
          a.vy = (a.vy / speed) * 0.72;
        }

        a.x += a.vx;
        a.y += a.vy;

        if (a.x < -12) a.x = width + 12;
        if (a.x > width + 12) a.x = -12;
        if (a.y < -12) a.y = height + 12;
        if (a.y > height + 12) a.y = -12;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 145) {
            const alpha = (1 - dist / 145) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const dxp = a.x - pointer.x;
          const dyp = a.y - pointer.y;
          const distP = Math.hypot(dxp, dyp);
          if (distP < 175) {
            const alpha = (1 - distP / 175) * 0.3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(13, 148, 136, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.15;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/45 to-teal-50/50 select-none"
    >
      {/* Blobs atmosféricos armonizados con emerald / teal / amber */}
      <div className="animate-float-slow absolute -top-28 -left-24 h-[26rem] w-[26rem] rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="animate-float-slower absolute top-1/4 -right-24 h-[30rem] w-[30rem] rounded-full bg-teal-300/22 blur-3xl" />
      <div className="animate-float-slow absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl" />

      {/* Anillos orbitales arquitectónicos sutiles */}
      <svg
        className="absolute -top-32 -right-32 h-[560px] w-[560px] text-emerald-600/[0.06]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="185" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="200" cy="200" r="135" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      <svg
        className="absolute -bottom-36 -left-36 h-[520px] w-[520px] text-teal-600/[0.055]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="125" stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" />
      </svg>

      {/* Patrón sutil de puntos arquitectónicos */}
      <div className="bg-dot-matrix absolute inset-0 opacity-45" />

      {/* Halo interactivo siguiendo el cursor */}
      <div
        ref={glowRef}
        className="absolute h-[600px] w-[600px] rounded-full bg-radial from-emerald-400/20 via-teal-300/10 to-transparent blur-2xl transition-opacity duration-300 will-change-transform"
      />

      {/* Red dinámica de nodos y enlaces */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
