'use client';

import React from 'react';

interface MacroRingProps {
  target: number;
  consumed: number;
  size?: number;
  strokeWidth?: number;
}

export default function MacroRing({
  target = 2000,
  consumed = 0,
  size = 200,
  strokeWidth = 14,
}: MacroRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (consumed / target) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  const remaining = Math.max(0, target - consumed);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG Donut Ring */}
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          {/* Cyber Gradation */}
          <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6600" /> {/* Burn Orange */}
            <stop offset="60%" stopColor="#e5ff00" />
            <stop offset="100%" stopColor="#ccff00" /> {/* Cyber Lime */}
          </linearGradient>
          
          {/* Neon Glow Filter */}
          <filter id="calorieGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track Circle */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Outer Glow Circle Layer */}
        {percentage > 0 && (
          <circle
            stroke="url(#calorieGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            opacity="0.45"
            filter="url(#calorieGlow)"
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Main Solid Progress Circle */}
        <circle
          stroke="url(#calorieGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center text log */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-4xl font-extrabold tracking-tighter text-white glow-text-orange">
          {remaining}
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mt-0.5">
          kcal left
        </span>
        <span className="text-[9px] font-semibold text-accent-lime/60 mt-1 uppercase tracking-wide">
          Goal: {target}
        </span>
      </div>
    </div>
  );
}
