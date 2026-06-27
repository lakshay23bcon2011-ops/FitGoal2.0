'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If no user is logged in, do not render navigation
  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Meals', path: '/meals' },
    { name: 'Food Database', path: '/food' },
    { name: 'AI Calculator', path: '/calculator' },
    { name: 'Workout', path: '/workout' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-card-border px-4 py-3.5 md:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* High-Fidelity Custom Vector SVG Logo */}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-accent-lime filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform duration-300">
            {/* Shield outer boundary */}
            <path d="M12 2L3 7v6c0 5.52 4.48 10 9 10s9-4.48 9-10V7l-9-5z" fill="rgba(0, 229, 255, 0.1)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            {/* Dumbbell bar */}
            <rect x="11" y="7" width="2" height="10" rx="1" fill="currentColor" />
            {/* Left plates */}
            <rect x="7" y="9" width="3" height="6" rx="1.5" fill="currentColor" />
            <rect x="5" y="10" width="2" height="4" rx="1" fill="currentColor" />
            {/* Right plates */}
            <rect x="14" y="9" width="3" height="6" rx="1.5" fill="currentColor" />
            <rect x="17" y="10" width="2" height="4" rx="1" fill="currentColor" />
          </svg>
          <span className="font-barlow text-2xl font-black tracking-tight text-white">
            FIT<span className="text-accent-lime glow-text-lime">GOAL</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 pb-1 border-b-2 ${
                  isActive
                    ? 'text-accent-lime border-accent-lime glow-text-lime'
                    : 'text-text-secondary border-transparent hover:text-white hover:border-accent-lime/40'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side stats + actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Flame Streak Widget */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-orange/10 rounded-full text-accent-orange border border-accent-orange/20 text-xs font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(255,102,0,0.1)]">
            {/* Flame SVG */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
              <path d="M12 2c-3.13 0-5.71 2.37-6 5.43.08-.03.17-.06.26-.06.63 0 1.2.35 1.49.92C8.38 9.54 9.61 10 11 10c1.66 0 3 1.34 3 3s-1.34 3-3 3c-.28 0-.55-.04-.8-.11-.47-.14-.94-.03-1.31.29-.68.58-.69 1.63-.04 2.22C10.02 19.5 11.23 20 12.5 20c3.59 0 6.5-2.91 6.5-6.5C19 8.5 14.5 4 12 2zm-1.8 13.9c.12-.21.19-.46.19-.73a1.44 1.44 0 0 0-1.44-1.44c-.31 0-.6.1-.84.28-.27.2-.67.14-.88-.13a.625.625 0 0 1 .13-.88c.55-.41 1.21-.63 1.9-.63 1.76 0 3.19 1.43 3.19 3.19 0 .61-.17 1.18-.47 1.67-.18.3-.57.39-.87.21-.29-.18-.39-.56-.21-.86z" />
            </svg>
            Streak: 12d
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-card-border">
            <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">{user.name}</span>
            <button
              onClick={logout}
              className="text-[10px] font-black tracking-widest uppercase text-accent-red hover:text-white border border-accent-red/25 hover:bg-accent-red/10 rounded-lg px-3 py-1.5 transition-all duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none hover:text-accent-lime transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-bg-secondary/95 border-b border-card-border p-4 flex flex-col gap-4 backdrop-blur-xl animate-fade-in shadow-2xl">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold tracking-wider uppercase transition-colors py-1.5 ${
                    isActive ? 'text-accent-lime glow-text-lime' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User profile & actions (mobile) */}
          <div className="flex items-center justify-between border-t border-card-border pt-4 mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white font-mono uppercase">{user.name}</span>
              <span className="text-xs text-text-secondary">{user.email}</span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="text-[10px] font-black tracking-widest uppercase text-accent-red border border-accent-red/20 bg-accent-red/5 px-3.5 py-2 rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
