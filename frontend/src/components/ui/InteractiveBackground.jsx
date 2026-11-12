import { useEffect, useRef } from 'react';

const PARTICLE_COLORS = [
  'rgba(16, 185, 129, 0.35)', // emerald-500
  'rgba(20, 184, 166, 0.32)', // teal-500
  'rgba(14, 165, 233, 0.28)', // sky-500
  'rgba(99, 102, 241, 0.26)', // indigo-500
];

/**
 * Fondo interactivo global: combina gradiente ambiental, trama arquitectónica sutil,
 * halo reactivo al puntero y red de partículas en canvas a 60fps.
 * Respeta prefers-reduced-motion y usa pointer-events-none para no interferir con la UI.
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

    const count = Math.min(46, Math.max(20, Math.floor((width * height) / 36000)));
    const nodes = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: 1.8 + (idx % 3) * 0.9,
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
      pointer.x += (pointer.targetX - pointer.x) * 0.09;
      pointer.y += (pointer.targetY - pointer.y) * 0.09;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pointer.x - 280}px, ${pointer.y - 280}px, 0)`;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];

        if (pointer.active) {
          const dxp = pointer.x - a.x;
          const dyp = pointer.y - a.y;
          const distP = Math.hypot(dxp, dyp);
          if (distP > 1 && distP < 190) {
            const pull = (1 - distP / 190) * 0.014;
            a.vx += (dxp / distP) * pull;
            a.vy += (dyp / distP) * pull;
          }
        }

        // Límite suave de velocidad para mantener movimiento fluido y sereno
        const speed = Math.hypot(a.vx, a.vy);
        if (speed > 0.75) {
          a.vx = (a.vx / speed) * 0.75;
          a.vy = (a.vy / speed) * 0.75;
        }

        a.x += a.vx;
        a.y += a.vy;

        if (a.x < -10) a.x = width + 10;
        if (a.x > width + 10) a.x = -10;
        if (a.y < -10) a.y = height + 10;
        if (a.y > height + 10) a.y = -10;

        // Conexiones entre partículas cercanas
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 135) {
            const alpha = (1 - dist / 135) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Conexión reactiva directa hacia el cursor
        if (pointer.active) {
          const dxp = a.x - pointer.x;
          const dyp = a.y - pointer.y;
          const distP = Math.hypot(dxp, dyp);
          if (distP < 165) {
            const alpha = (1 - distP / 165) * 0.28;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.1;
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/40 to-sky-50/50 select-none"
    >
      {/* Blobs ambientales suaves */}
      <div className="animate-float-slow absolute -top-28 -left-24 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="animate-float-slower absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-3xl" />
      <div className="animate-float-slow absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl" />

      {/* Patrón sutil de puntos arquitectónicos */}
      <div className="bg-dot-matrix absolute inset-0 opacity-45" />

      {/* Halo interactivo siguiendo el cursor */}
      <div
        ref={glowRef}
        className="absolute h-[560px] w-[560px] rounded-full bg-radial from-emerald-400/20 via-teal-300/10 to-transparent blur-2xl transition-opacity duration-300 will-change-transform"
      />

      {/* Red dinámica de nodos y enlaces */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

