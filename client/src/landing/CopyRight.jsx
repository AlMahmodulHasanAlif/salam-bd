import React from "react";

export default function Copyright() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-white/10 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-3">
        
        {/* Left side */}
        <p className="text-sm text-white/60">
          © {year} <span className="text-white font-medium">SalamBD</span>. All rights reserved.
        </p>

      </div>
    </footer>
  );
}