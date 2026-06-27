'use client';

import React from 'react';

export default function GymBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-bg-primary text-text-primary overflow-hidden flex flex-col">
      {/* Radial glows for cyber-gym spotlight depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-lime/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-accent-orange/5 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[35%] h-[35%] rounded-full bg-accent-blue/5 blur-[150px] pointer-events-none" />

      {/* Cyber/Tech Grid Overlay with linear spotlight fading */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" 
        style={{
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)'
        }}
      />

      {/* Floating Gym SVGs - Left and Right Margins */}
      
      {/* Kettlebell - Top Left */}
      <div className="absolute top-[15%] left-[5%] opacity-3.5 animate-float-slow pointer-events-none hidden lg:block text-accent-lime">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a5 5 0 0 0-5 5v3h10V7a5 5 0 0 0-5-5z" />
          <path d="M6 10h12a3 3 0 0 1 3 3v5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-5a3 3 0 0 1 3-3z" />
          <circle cx="12" cy="16" r="2" />
        </svg>
      </div>

      {/* Dumbbell - Top Right */}
      <div className="absolute top-[20%] right-[8%] opacity-3.5 animate-float-medium pointer-events-none hidden md:block text-accent-orange">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h2v14H6V5zm10 0h2v14h-2V5zM2 9h2v6H2V9zm18 0h2v6h-2V9zM8 11h8v2H8v-2z" />
        </svg>
      </div>

      {/* Water Drop - Bottom Left */}
      <div className="absolute bottom-[25%] left-[7%] opacity-3 animate-float-medium pointer-events-none hidden lg:block text-accent-blue">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
        </svg>
      </div>

      {/* Barbell Weight Plate - Bottom Right */}
      <div className="absolute bottom-[20%] right-[10%] opacity-3.5 animate-float-slow pointer-events-none hidden md:block text-accent-lime">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </div>

      {/* Apple (Nutrition) - Mid Right */}
      <div className="absolute top-[45%] right-[4%] opacity-2.5 animate-float-slow pointer-events-none hidden xl:block text-accent-red">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2c.5 0 1 .5 1 1v1.5c1.8.2 3.2 1.4 3.8 3 1-.3 2 .2 2.5 1.2s.2 2.2-.8 2.8c.4 1.3.2 2.8-.5 4-1 1.7-2.8 2.5-4.7 2.5a6.4 6.4 0 0 1-2.3-.5 6.4 6.4 0 0 1-2.3.5C6.8 18 5 17.2 4 15.5c-.7-1.2-1-2.7-.6-4-.9-.6-1.3-1.8-.8-2.8s1.5-1.5 2.5-1.2c.6-1.6 2-2.8 3.8-3V3c0-.5.5-1 1-1z" />
          <path d="M12 2c0 2-1 3-3 3" />
        </svg>
      </div>

      {/* Main Content container */}
      <div className="relative z-10 flex flex-col flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
