'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/AuthContext';
import GymBackground from '../components/GymBackground';
import Navigation from '../components/Navigation';
import MacroRing from '../components/MacroRing';
import api from '../utils/api';

interface DailyStats {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface LoggedFood {
  _id: string;
  foodName: string;
  mealType: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  
  // Dashboard states
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [recentFoods, setRecentFoods] = useState<LoggedFood[]>([]);
  const [waterToday, setWaterToday] = useState({ totalAmountMl: 0, targetWaterMl: 3000, percentage: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [waterLogging, setWaterLogging] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const todayStr = new Date().toISOString().split('T')[0];

      // Fetch stats, foods list, and water log
      const [statsRes, foodsRes, waterRes] = await Promise.all([
        api.get(`/foodlog/stats/daily?date=${todayStr}`),
        api.get(`/foodlog?date=${todayStr}`),
        api.get(`/water/today?date=${todayStr}`),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (foodsRes.data.success) {
        setRecentFoods(foodsRes.data.data.slice(-5).reverse()); // Take latest 5 logged items
      }
      if (waterRes.data.success) {
        setWaterToday(waterRes.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleQuickAddWater = async (amount: number) => {
    if (waterLogging) return;
    setWaterLogging(true);
    try {
      const res = await api.post('/water/log', { amount });
      if (res.data.success) {
        // Refetch water
        const todayStr = new Date().toISOString().split('T')[0];
        const waterRes = await api.get(`/water/today?date=${todayStr}`);
        if (waterRes.data.success) {
          setWaterToday(waterRes.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to log water:', err);
    } finally {
      setWaterLogging(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-bg-primary text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-lime border-t-transparent rounded-full animate-spin" />
          <span className="font-barlow text-xl uppercase tracking-wider font-bold">Loading FitGoal Profile...</span>
        </div>
      </div>
    );
  }

  // Fallbacks if data fails to fetch
  const targetCalories = stats?.targets.calories || user.targetCalories || 2000;
  const consumedCalories = stats?.consumed.calories || 0;
  const targetProtein = stats?.targets.protein || user.targetProtein || 120;
  const consumedProtein = stats?.consumed.protein || 0;
  const targetCarbs = stats?.targets.carbs || user.targetCarbs || 200;
  const consumedCarbs = stats?.consumed.carbs || 0;
  const targetFat = stats?.targets.fat || user.targetFat || 65;
  const consumedFat = stats?.consumed.fat || 0;
  const targetFiber = 30; // standard fiber target
  const consumedFiber = stats?.consumed.fiber || 0;

  const macroData = [
    { name: 'Protein', consumed: consumedProtein, target: targetProtein, color: 'bg-accent-lime', glow: 'shadow-[0_0_10px_rgba(204,255,0,0.3)]', suffix: 'g' },
    { name: 'Carbs', consumed: consumedCarbs, target: targetCarbs, color: 'bg-accent-orange', glow: 'shadow-[0_0_10px_rgba(255,102,0,0.3)]', suffix: 'g' },
    { name: 'Fat', consumed: consumedFat, target: targetFat, color: 'bg-accent-red', glow: 'shadow-[0_0_10px_rgba(255,45,85,0.3)]', suffix: 'g' },
    { name: 'Fiber', consumed: consumedFiber, target: targetFiber, color: 'bg-accent-blue', glow: 'shadow-[0_0_10px_rgba(0,229,255,0.3)]', suffix: 'g' },
  ];

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8 md:py-10 flex flex-col gap-6 md:gap-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-barlow text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
              Welcome back, <span className="text-accent-lime glow-text-lime">{user.name}</span>
            </h2>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mt-0.5">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Streak Banner */}
          <div className="flex items-center gap-3 glass-panel px-4 py-2.5 rounded-xl border border-card-border hover:border-accent-orange/30 shadow-[0_0_15px_rgba(0,0,0,0.4)] self-start transition-all">
            <div className="text-accent-orange animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-barlow text-lg font-black uppercase text-white leading-none">🔥 0 Day Streak</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent-orange mt-0.5">Keep grinding!</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calorie Ring Box */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-card-border hover:border-accent-orange/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-4 self-start">
              Calorie Balance
            </h3>
            {loadingStats ? (
              <div className="w-[200px] h-[200px] rounded-full border-4 border-dashed border-card-border animate-spin flex items-center justify-center" />
            ) : (
              <MacroRing target={targetCalories} consumed={consumedCalories} size={200} />
            )}
            <div className="flex justify-between w-full mt-6 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-text-secondary text-[10px] uppercase font-black tracking-widest">Target</span>
                <span className="font-mono text-white font-bold text-base mt-0.5">{targetCalories} kcal</span>
              </div>
              <div className="w-[1px] bg-card-border" />
              <div className="flex flex-col items-center">
                <span className="text-text-secondary text-[10px] uppercase font-black tracking-widest">Consumed</span>
                <span className="font-mono text-accent-lime font-bold text-base mt-0.5 glow-text-lime">{consumedCalories} kcal</span>
              </div>
            </div>
          </div>

          {/* Macro Tracker Box */}
          <div className="glass-panel rounded-2xl p-6 border border-card-border hover:border-accent-lime/20 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-4">
              Macros Tracker
            </h3>
            <div className="flex flex-col gap-4">
              {macroData.map((macro) => {
                const percentage = Math.min(100, Math.round((macro.consumed / macro.target) * 100));
                return (
                  <div key={macro.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold tracking-wide uppercase">
                      <span className="text-white">{macro.name}</span>
                      <span className="text-text-secondary font-mono">
                        {macro.consumed.toFixed(1)} / {macro.target} {macro.suffix}
                      </span>
                    </div>
                    {/* Custom progress bar with glows */}
                    <div className="h-2.5 w-full bg-bg-secondary border border-card-border rounded-full overflow-hidden">
                      <div
                        className={`h-full ${macro.color} ${macro.glow} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Water Tracker Box - Liquid Waves */}
          <div className="glass-panel rounded-2xl p-6 border border-card-border hover:border-accent-blue/20 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-2">
              Hydration
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center my-4">
              {/* cybernetic water glass */}
              <div className="cyber-glass-container">
                <div
                  className="wave-liquid"
                  style={{ height: `${Math.min(100, waterToday.percentage)}%` }}
                >
                  <div className="wave-bubble" />
                  <div className="wave-bubble-second" />
                </div>
                {/* Center Percentage display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-white font-mono text-xl font-extrabold tracking-tighter glow-text-blue">
                    {waterToday.percentage}%
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-white mt-4 uppercase tracking-widest">
                {waterToday.totalAmountMl} / {waterToday.targetWaterMl} ml
              </span>
            </div>

            {/* Quick adds */}
            <div className="grid grid-cols-3 gap-2">
              {[250, 500, 750].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAddWater(amount)}
                  disabled={waterLogging}
                  className="bg-bg-secondary hover:bg-accent-blue hover:text-black border border-card-border hover:border-transparent text-text-secondary hover:shadow-[0_0_10px_rgba(0,229,255,0.4)] text-[10px] font-black uppercase py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  +{amount}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Operations & Recent Foods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Operations */}
          <div className="glass-panel rounded-2xl p-6 border border-card-border flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div>
              <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-3">
                Quick Operations
              </h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Log items directly, seed workout templates, or calculate dish macros with Claude 3.5 Sonnet.
              </p>
            </div>
            
            {/* Redesigned Gym Action Cards with Dumbbell, Salad bowl, and AI chip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/meals"
                className="glass-card hover:neon-border-lime rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer border border-card-border shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-lime/10 text-accent-lime flex items-center justify-center group-hover:bg-accent-lime group-hover:text-black transition-all shadow-[0_0_10px_rgba(204,255,0,0.05)] group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  {/* Detailed Salad / Meal Bowl SVG */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2c-.55 0-1 .45-1 1v1.1C6.26 4.65 2.5 8.87 2.5 14c0 4.42 3.58 8 8 8h3c4.42 0 8-3.58 8-8 0-5.13-3.76-9.35-8.5-9.9V3c0-.55-.45-1-1-1zm-6.5 12c0-2.83 1.83-5.23 4.4-6.07C9.52 9.07 9 10.47 9 12c0 2.21 1.79 4 4 4 .28 0 .54-.04.8-.11C13.2 17.5 11.23 18.5 9 18.5c-3.03 0-5.5-2.47-5.5-5.5zm11.1 4.93C15.6 19.57 14.6 20 13.5 20h-3c-1.38 0-2.63-.56-3.53-1.47 1.34-.84 2.53-2.03 3.37-3.37.91.9 1.46 2.15 1.46 3.53a.75.75 0 0 0 1.5 0c0-1.83-.87-3.46-2.22-4.5.38-.1.78-.19 1.2-.23C15.02 13.33 16.5 15.48 16.6 18.93z" />
                  </svg>
                </div>
                <span className="font-barlow font-bold text-xs uppercase tracking-wider text-text-secondary group-hover:text-white transition-colors">Log Meals</span>
              </Link>

              <Link
                href="/calculator"
                className="glass-card hover:neon-border-orange rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer border border-card-border shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 text-accent-orange flex items-center justify-center group-hover:bg-accent-orange group-hover:text-black transition-all shadow-[0_0_10px_rgba(255,102,0,0.05)] group-hover:shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                  {/* AI Scanner / processor SVG */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M9 9h6v6H9z" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                  </svg>
                </div>
                <span className="font-barlow font-bold text-xs uppercase tracking-wider text-text-secondary group-hover:text-white transition-colors">AI Calculator</span>
              </Link>

              <Link
                href="/workout"
                className="glass-card hover:neon-border-lime rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer border border-card-border shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-lime/10 text-accent-lime flex items-center justify-center group-hover:bg-accent-lime group-hover:text-black transition-all shadow-[0_0_10px_rgba(204,255,0,0.05)] group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                  {/* Gym Dumbbell SVG */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.5 5h2v14h-2V5zm10 0h2v14h-2V5zM2.5 9h2v6h-2V9zm18 0h2v6h-2V9zM8.5 11h8v2h-8v-2z" />
                  </svg>
                </div>
                <span className="font-barlow font-bold text-xs uppercase tracking-wider text-text-secondary group-hover:text-white transition-colors">Train Hard</span>
              </Link>
            </div>
          </div>

          {/* Today's Logged Foods */}
          <div className="glass-panel rounded-2xl p-6 border border-card-border flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-4 flex justify-between items-center">
              <span>Today&apos;s Logged Meals</span>
              <Link href="/meals" className="text-xs font-bold uppercase text-accent-lime hover:underline tracking-wider">
                View All
              </Link>
            </h3>

            {recentFoods.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center border border-dashed border-card-border rounded-xl">
                <span className="text-xs text-text-secondary font-semibold">No meals logged for today.</span>
                <Link
                  href="/food"
                  className="mt-2 text-xs font-bold uppercase text-accent-lime hover:underline tracking-wider"
                >
                  + Add Food
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[190px] pr-1">
                {recentFoods.map((food) => (
                  <div
                    key={food._id}
                    className="flex justify-between items-center p-3 bg-bg-secondary/40 border border-card-border rounded-xl hover:border-accent-lime/20 transition-all text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white leading-tight">{food.foodName}</span>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-0.5">
                        {food.mealType} • {food.quantity} {food.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-bold text-accent-orange text-base leading-none">{food.calories}</span>
                        <span className="text-[9px] uppercase text-text-secondary font-black">kcal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </GymBackground>
  );
}
