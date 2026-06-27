'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';

interface DaySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface WorkoutStats {
  totalSessions: number;
  totalCaloriesBurned: number;
  totalDurationMinutes: number;
  totalSetsLogged: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  const [weeklyData, setWeeklyData] = useState<DaySummary[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [weeklyRes, workoutRes] = await Promise.all([
        api.get(`/foodlog/stats/weekly?date=${todayStr}`),
        api.get('/workout/stats'),
      ]);

      if (weeklyRes.data.success) {
        setWeeklyData(weeklyRes.data.data);
      }
      if (workoutRes.data.success) {
        setWorkoutStats(workoutRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  // Compute maximum calories to scale SVG charts
  const maxCalories = weeklyData.length > 0 
    ? Math.max(...weeklyData.map(d => d.calories), 2000) 
    : 2000;

  // Compute average metrics for stats grid
  const avgCalories = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length)
    : 0;
  const avgProtein = weeklyData.length > 0
    ? Math.round((weeklyData.reduce((sum, d) => sum + d.protein, 0) / weeklyData.length) * 10) / 10
    : 0;
  const avgCarbs = weeklyData.length > 0
    ? Math.round((weeklyData.reduce((sum, d) => sum + d.carbs, 0) / weeklyData.length) * 10) / 10
    : 0;
  const avgFat = weeklyData.length > 0
    ? Math.round((weeklyData.reduce((sum, d) => sum + d.fat, 0) / weeklyData.length) * 10) / 10
    : 0;

  // Compute spline curves for hybrid line-bar SVG chart
  const barWidth = 40;
  const spacing = 80;
  const chartPoints = weeklyData.map((day, idx) => {
    const x = 70 + idx * spacing + barWidth / 2;
    const barHeight = Math.max(10, (day.calories / maxCalories) * 150);
    const y = 180 - barHeight;
    return `${x},${y}`;
  });

  const linePath = chartPoints.length > 0 ? `M ${chartPoints.join(' L ')}` : '';
  const areaPath = chartPoints.length > 0 
    ? `M 90 180 L ${chartPoints.join(' L ')} L ${70 + (chartPoints.length - 1) * spacing + barWidth / 2} 180 Z` 
    : '';

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6 md:gap-8">
        {/* Title */}
        <div>
          <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
            Performance Analytics
          </h2>
          <p className="text-xs text-text-secondary">
            7-day history metrics of nutrition balance and workout aggregates.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-accent-lime border-t-transparent rounded-full animate-spin" />
              <span className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary">Loading statistics splits...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Workout Summary Grid cards with glows */}
            {workoutStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-card-border hover:border-accent-lime/30 hover:scale-[1.02] flex flex-col gap-1 text-center shadow-lg transition-all">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Gym Sessions</span>
                  <div className="font-mono text-2xl font-black text-accent-lime mt-1 glow-text-lime">{workoutStats.totalSessions}</div>
                  <span className="text-[8px] text-text-secondary uppercase mt-0.5 font-bold">completed splits</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border hover:border-accent-blue/30 hover:scale-[1.02] flex flex-col gap-1 text-center shadow-lg transition-all">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Total Active Time</span>
                  <div className="font-mono text-2xl font-black text-white mt-1 glow-text-blue">{workoutStats.totalDurationMinutes} min</div>
                  <span className="text-[8px] text-text-secondary uppercase mt-0.5 font-bold">time under load</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border hover:border-accent-orange/30 hover:scale-[1.02] flex flex-col gap-1 text-center shadow-lg transition-all">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Calories Burned</span>
                  <div className="font-mono text-2xl font-black text-accent-orange mt-1 glow-text-orange">{workoutStats.totalCaloriesBurned} kcal</div>
                  <span className="text-[8px] text-text-secondary uppercase mt-0.5 font-bold">metabolic burn</span>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border hover:border-accent-red/30 hover:scale-[1.02] flex flex-col gap-1 text-center shadow-lg transition-all">
                  <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Total Sets</span>
                  <div className="font-mono text-2xl font-black text-accent-red mt-1">{workoutStats.totalSetsLogged}</div>
                  <span className="text-[8px] text-text-secondary uppercase mt-0.5 font-bold">volume sets logged</span>
                </div>
              </div>
            )}

            {/* Weekly Caloric Intake Bar Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-card-border hover:border-accent-lime/10 shadow-xl">
              <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary mb-6">
                7-Day Calorie Intake Trend
              </h3>

              {weeklyData.length === 0 ? (
                <div className="text-center py-12 text-xs text-text-secondary uppercase font-bold tracking-wider">No calorie data to chart yet.</div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {/* SVG Chart Container */}
                  <div className="relative w-full h-[220px]">
                    <svg className="w-full h-full" viewBox="0 0 700 220" preserveAspectRatio="none">
                      <defs>
                        {/* Area Spline Gradient */}
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ccff00" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
                        </linearGradient>
                        
                        {/* Spline Line Glow */}
                        <filter id="splineGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Grid Lines */}
                      {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
                        const y = 180 - ratio * 150;
                        const value = Math.round(maxCalories * ratio);
                        return (
                          <g key={index}>
                            <line
                              x1="50"
                              y1={y}
                              x2="680"
                              y2={y}
                              stroke="rgba(255,255,255,0.04)"
                              strokeWidth="1.5"
                              strokeDasharray="4"
                            />
                            <text
                              x="10"
                              y={y + 4}
                              fill="rgba(255,255,255,0.3)"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="start"
                              fontWeight="bold"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Translucent area spline chart underlay */}
                      {areaPath && (
                        <path d={areaPath} fill="url(#areaGrad)" />
                      )}

                      {/* Spline line connecting the peaks */}
                      {linePath && (
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="#ccff00" 
                          strokeWidth="2.5" 
                          opacity="0.8"
                          filter="url(#splineGlow)"
                        />
                      )}

                      {/* Bars */}
                      {weeklyData.map((day, idx) => {
                        const x = 70 + idx * spacing;
                        const barHeight = Math.max(10, (day.calories / maxCalories) * 150);
                        const y = 180 - barHeight;

                        return (
                          <g key={day.date} className="group cursor-pointer">
                            <defs>
                              <linearGradient id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ccff00" stopOpacity="0.75" />
                                <stop offset="100%" stopColor="#ff6600" stopOpacity="0.2" />
                              </linearGradient>
                            </defs>
                            
                            {/* Bar rect */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="6"
                              fill={`url(#barGrad-${idx})`}
                              className="group-hover:opacity-100 transition-all duration-300 opacity-90"
                              stroke="rgba(204,255,0,0.1)"
                              strokeWidth="1"
                            />
                            
                            {/* Peak value circle node */}
                            <circle
                              cx={x + barWidth / 2}
                              cy={y}
                              r="3.5"
                              fill="#ccff00"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            
                            {/* Value label on top of bar */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 8}
                              fill="#ffffff"
                              fontSize="9"
                              fontWeight="black"
                              fontFamily="monospace"
                              textAnchor="middle"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {day.calories}
                            </text>

                            {/* Date Label under bar */}
                            <text
                              x={x + barWidth / 2}
                              y="202"
                              fill="rgba(255,255,255,0.5)"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="uppercase tracking-wide"
                            >
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </text>
                          </g>
                        );
                      })}
                      {/* Base Line */}
                      <line x1="50" y1="180" x2="680" y2="180" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Averages Summary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily averages */}
              <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-4 shadow-xl">
                <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary border-b border-card-border pb-2">
                  7-Day Macro Averages
                </h3>
                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-text-secondary font-medium font-sans">Daily Energy Intake:</span>
                    <span className="text-accent-orange font-bold">{avgCalories} kcal / day</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-text-secondary font-medium font-sans">Daily Protein Intake:</span>
                    <span className="text-accent-lime font-bold">{avgProtein}g / day</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-text-secondary font-medium font-sans">Daily Carbohydrate Intake:</span>
                    <span className="text-white font-bold">{avgCarbs}g / day</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-text-secondary font-medium font-sans">Daily Fat Intake:</span>
                    <span className="text-accent-red font-bold">{avgFat}g / day</span>
                  </div>
                </div>
              </div>

              {/* Macro Distribution Donut representation */}
              <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col items-center justify-center shadow-xl">
                <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-text-secondary border-b border-card-border pb-2 w-full mb-4">
                  Weekly Balance Share
                </h3>

                {avgCalories === 0 ? (
                  <div className="text-center py-6 text-xs text-text-secondary uppercase font-bold">No intake data recorded.</div>
                ) : (
                  <div className="flex items-center gap-6">
                    {/* Semi visual bar share representation */}
                    <div className="flex flex-col gap-2.5 w-44 text-xs font-bold uppercase">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-accent-lime">
                          <span>Protein</span>
                          <span className="font-mono">{Math.round((avgProtein * 4 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-primary/60 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-lime rounded-full" style={{ width: `${(avgProtein * 4 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-white">
                          <span>Carbs</span>
                          <span className="font-mono">{Math.round((avgCarbs * 4 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-primary/60 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${(avgCarbs * 4 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100}%` }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-accent-red">
                          <span>Fat</span>
                          <span className="font-mono">{Math.round((avgFat * 9 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-primary/60 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-red rounded-full" style={{ width: `${(avgFat * 9 / (avgProtein * 4 + avgCarbs * 4 + avgFat * 9)) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="w-[1px] h-24 bg-card-border" />

                    <div className="text-[10px] text-text-secondary flex flex-col gap-1.5">
                      <span className="font-black uppercase tracking-wider text-white">Caloric Splits</span>
                      <p className="max-w-[150px] leading-relaxed">
                        Displays the relative calorie contribution of each macro group (Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </GymBackground>
  );
}
