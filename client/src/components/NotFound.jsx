// src/pages/NotFound.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router";

const NotFound = () => {
  const ref = useRef();

  useEffect(() => {
    let frame;
    let t = 0;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.0003,
      dy: (Math.random() - 0.5) * 0.0003,
      o: Math.random() * 0.35 + 0.08,
    }));

    const draw = () => {
      t += 0.008;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x = (p.x + p.dx + 1) % 1;
        p.y = (p.y + p.dy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Particle canvas */}
      <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Decorative ring */}
      <div className="absolute w-[520px] h-[520px] rounded-full border border-white/5 animate-[spin_40s_linear_infinite]" />
      <div className="absolute w-[360px] h-[360px] rounded-full border border-white/5 animate-[spin_28s_linear_infinite_reverse]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">

        {/* 404 */}
        <div className="relative select-none mb-2">
          <p
            className="text-[9rem] sm:text-[13rem] font-black leading-none tracking-tighter text-white/5 absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            404
          </p>
          <p className="text-[9rem] sm:text-[13rem] font-black leading-none tracking-tighter text-white relative">
            404
          </p>
        </div>


        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-white/50 text-base max-w-sm mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="group relative inline-flex items-center gap-2.5 bg-white text-green-900 font-semibold text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
};

export default NotFound;