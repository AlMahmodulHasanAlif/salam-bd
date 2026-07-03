import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import logo from "../assets/SalamBDLogo.png";
import LSlider from "./Lslider";
import { Link } from "react-router";

/* ─────────────────────────────────────────────
   Custom YouTube Player  (zero native YouTube UI)
   Uses YouTube IFrame API + fully custom controls
───────────────────────────────────────────────*/
function CustomVideoPlayer() {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const volumeBarRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // browsers require muted autoplay
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0); // 0-100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hideControlsTimer = useRef(null);

  const VIDEO_ID = "cUOJE5w1cS8";

  /* ── Load YouTube IFrame API once ── */
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayer;
    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  function initPlayer() {
    playerRef.current = new window.YT.Player("yt-player-iframe", {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (e) => {
          setReady(true);
          setDuration(e.target.getDuration());
          e.target.setVolume(80);
          e.target.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
            setDuration(e.target.getDuration());
            startProgressTracking();
          } else {
            setPlaying(false);
            stopProgressTracking();
          }
        },
      },
    });
  }

  function startProgressTracking() {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      const ct = playerRef.current.getCurrentTime();
      const dur = playerRef.current.getDuration();
      if (dur > 0) {
        setProgress((ct / dur) * 100);
        setCurrentTime(ct);
        // buffered
        const ytFrac = playerRef.current.getVideoLoadedFraction?.() ?? 0;
        setBuffered(ytFrac * 100);
      }
    }, 300);
  }

  function stopProgressTracking() {
    clearInterval(progressIntervalRef.current);
  }

  useEffect(() => () => stopProgressTracking(), []);

  /* ── Controls visibility ── */
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  /* ── Helpers ── */
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    playerRef.current?.setVolume(val);
    if (val === 0) {
      playerRef.current?.mute();
      setMuted(true);
    } else {
      playerRef.current?.unMute();
      setMuted(false);
    }
  };

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    playerRef.current.seekTo(ratio * duration, true);
    setProgress(ratio * 100);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  /* ── Volume bar vertical drag ── */
  const volumePct = muted ? 0 : volume;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-emerald-900/40 shadow-2xl shadow-emerald-950/50 group select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      {/* ── YouTube iframe (invisible controls) ── */}
      <div
        id="yt-player-iframe"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* ── Thumbnail fallback while loading ── */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <img
            src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
            alt="Loading…"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* ── Click-to-play overlay (transparent, above iframe) ── */}
      <div
        className="absolute inset-0 z-20"
        onClick={togglePlay}
        style={{ cursor: showControls ? "pointer" : "none" }}
      />

      {/* ── Centre play/pause flash ── */}
      {!playing && ready && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center shadow-xl shadow-emerald-900/50">
            <svg
              className="w-8 h-8 text-emerald-400 ml-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* ── CONTROLS BAR ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-500 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none rounded-b-2xl" />

        <div className="relative px-4 pb-4 pt-2 flex flex-col gap-2">
          {/* ── Progress bar ── */}
          <div
            className="relative w-full h-1.5 rounded-full bg-white/10 cursor-pointer group/seek"
            onClick={handleSeek}
          >
            {/* buffered */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-white/20 transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
            {/* played */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            {/* scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50 border-2 border-white opacity-0 group-hover/seek:opacity-100 transition-opacity duration-200"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>

          {/* ── Bottom row ── */}
          <div className="flex items-center justify-between gap-3">
            {/* Left cluster */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-emerald-600/70 border border-white/10 hover:border-emerald-500/50 transition-all duration-200 text-white"
              >
                {playing ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 ml-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume cluster */}
              <div
                className="flex items-center gap-2 relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                {/* Mute button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 text-white"
                >
                  {muted || volumePct === 0 ? (
                    <svg
                      className="w-4 h-4 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volumePct < 50 ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                {/* Horizontal volume slider */}
                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 ${
                    showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volumePct}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 cursor-pointer accent-emerald-400"
                    style={{
                      background: `linear-gradient(to right, #10b981 ${volumePct}%, rgba(255,255,255,0.15) ${volumePct}%)`,
                      borderRadius: "9999px",
                    }}
                  />
                </div>

                {/* Volume % label */}
                {showVolumeSlider && (
                  <span className="text-xs text-gray-400 w-6 text-right tabular-nums">
                    {volumePct}
                  </span>
                )}
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 tabular-nums hidden sm:block">
                {fmt(currentTime)} <span className="text-white/30">/</span>{" "}
                {fmt(duration)}
              </span>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-2">
              {/* Islamic badge */}

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 text-white"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Hero
───────────────────────────────────────────────*/
export default function Lhero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-start overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="absolute px-10 top-0 left-0 right-0 z-50 backdrop-blur-md bg-emerald-950/50 border-b border-white/5">
        <div className="mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <Link to="/" className="flex items-center gap-2 select-none">
              <img
                src={logo}
                alt="Salam BD Logo"
                className="h-10 md:h-15 w-auto"
              />
            </Link>
          </div>
          <button
            onClick={() =>
              document
                .getElementById("order-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm md:text-base px-5 py-2 md:px-6 md:py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-emerald-900/30 hover:scale-105"
          >
            অর্ডার করুন
          </button>
        </div>
      </nav>

      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#064e3b33_0%,_transparent_50%)] animate-pulse duration-[6000ms]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#78350f11_0%,_transparent_50%)]" />

      {/* Bismillah watermark */}
      <div className="absolute text-[10rem] md:text-[14rem] font-arabic text-emerald-900/5">
        ﷽
      </div>

      {/* ── Main Content ── */}
      <div className="relative max-w-5xl mx-auto px-4 pt-25 pb-8 text-center items-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-4xl font-extrabold text-white leading-tight mb-4"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
            Plug In Quran
          </span>
          <div className="text-2xl md:text-3xl font-semibold text-gray-300">
            ডিজিটাল কুরআন স্পিকার
          </div>
        </motion.h1>

        <motion.div
          className="w-full sm:w-auto bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm rounded-2xl px-8 py-4 text-center flex items-center justify-center min-w-[260px] shadow-lg shadow-emerald-950/50"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-2xl md:text-4xl font-black text-amber-400 whitespace-nowrap">
            ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি
          </span>
        </motion.div>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-200 text-md md:text-lg md:text-xl mx-auto mb-8 mt-4 md:hidden "
        >
          "যখন কুরআন তিলাওয়াত করা হয়, <br /> তখন তা মনোযোগ দিয়ে শোন এবং নীরব
          থাকো,
          <br /> যাতে তোমাদের প্রতি রহমত করা হয়।"
          <br />
          (সূরা আল-আ'রাফ ৭:২০৪)।
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-gray-200 text-md md:text-lg md:text-xl mx-auto mb-8 mt-4 hidden md:block "
        >
          "যখন কুরআন তিলাওয়াত করা হয়, <br /> তখন তা মনোযোগ দিয়ে শোন এবং নীরব
          থাকো, যাতে তোমাদের প্রতি রহমত করা হয়।" (সূরা আল-আ'রাফ ৭:২০৪)।
        </motion.p>

        {/* ── Custom Video Player ── */}
        <motion.div
          id="video"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-7xl mb-10"
        >
          <CustomVideoPlayer />
        </motion.div>

        <LSlider />

        {/* Price Boxes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-10"
        >
          <div className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center flex items-center justify-center min-w-[220px]">
            <span className="text-white text-2xl md:text-3xl font-semibold line-through whitespace-nowrap">
              পূর্বের মূল্য 1290৳
            </span>
          </div>
          <motion.div
            className="w-full sm:w-auto bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm rounded-2xl px-8 py-4 text-center flex items-center justify-center min-w-[260px] shadow-lg shadow-emerald-950/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-3xl md:text-4xl font-black text-amber-400 whitespace-nowrap">
              অফার মূল্য 990৳
            </span>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          {[
            { icon: "🛡️", text: "৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি" },
            { icon: "🚚", text: "সারা বাংলাদেশে হোম ডেলিভারি" },
            { icon: "💳", text: "ক্যাশ অন ডেলিভারি" },
          ].map((badge) => (
            <span
              key={badge.text}
              className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-200 text-sm px-3 py-1.5 rounded-full"
            >
              <span>{badge.icon}</span> {badge.text}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="w-full sm:w-auto"
        >
          <button
            onClick={() =>
              document
                .getElementById("order-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="group relative inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-xl shadow-emerald-900/50 hover:shadow-emerald-700/60 hover:scale-105 w-full sm:w-auto"
          >
            <span>🛒</span> এখনই অর্ডার করুন
            <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              HOT
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
