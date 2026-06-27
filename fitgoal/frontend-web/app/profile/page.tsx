'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [goal, setGoal] = useState<'bulk' | 'cut' | 'maintain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

  // Custom targets overrides
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [targetProtein, setTargetProtein] = useState<number>(120);
  const [targetCarbs, setTargetCarbs] = useState<number>(200);
  const [targetFat, setTargetFat] = useState<number>(65);
  const [targetWater, setTargetWater] = useState<number>(3000);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize fields with current user state
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || 25);
      setWeight(user.weight || 70);
      setHeight(user.height || 170);
      setGender(user.gender || 'male');
      setGoal(user.goal || 'maintain');
      setActivityLevel(user.activityLevel || 'moderate');
      
      setTargetCalories(user.targetCalories || 2000);
      setTargetProtein(user.targetProtein || 120);
      setTargetCarbs(user.targetCarbs || 200);
      setTargetFat(user.targetFat || 65);
      setTargetWater(user.targetWater || 3000);
    }
  }, [user]);

  // Mifflin-St Jeor TDEE Calculator
  const getCalculatedTDEE = () => {
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    const bmr = gender === 'male' ? baseBMR + 5 : gender === 'female' ? baseBMR - 161 : baseBMR - 80;
    
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));
    
    let target = tdee;
    if (goal === 'bulk') target += 400;
    else if (goal === 'cut') target -= 450;
    
    return {
      bmr: Math.round(bmr),
      tdee,
      recommendedCalories: Math.max(1200, target),
    };
  };

  const { bmr, tdee, recommendedCalories } = getCalculatedTDEE();

  const handleApplyRecommended = () => {
    setTargetCalories(recommendedCalories);
    const recommendedProtein = Math.round(weight * 2.0);
    setTargetProtein(recommendedProtein);
    const recommendedFat = Math.round((recommendedCalories * 0.25) / 9);
    setTargetFat(recommendedFat);
    const recommendedCarbs = Math.max(50, Math.round((recommendedCalories - (recommendedProtein * 4 + recommendedFat * 9)) / 4));
    setTargetCarbs(recommendedCarbs);
    const recommendedWater = Math.max(3000, Math.round(weight * 35));
    setTargetWater(recommendedWater);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateProfile({
        name,
        age,
        weight,
        height,
        gender,
        goal,
        activityLevel,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        targetWater,
      });
      setSuccessMsg('Profile and targets saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update profile settings:', err);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
            User Profile Settings
          </h2>
          <p className="text-xs text-text-secondary">
            Manage your physical metrics, fitness goals, and customize macro targets.
          </p>
        </div>

        {successMsg && (
          <div className="px-4 py-3 bg-accent-lime/10 border border-accent-lime/25 text-accent-lime text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-[0_0_15px_rgba(204,255,0,0.15)] animate-pulse-glow">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Body Metrics */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-accent-lime/10 flex flex-col gap-4 shadow-xl">
            <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-accent-lime border-b border-card-border pb-2">
              Body Metrics
            </h3>

            <div className="flex flex-col gap-4 text-xs font-bold text-text-secondary">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-widest text-[9px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cyber-input w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-widest text-[9px]">Age (Years)</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="cyber-input w-full font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-widest text-[9px]">Current Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="30"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                  className="cyber-input w-full font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-widest text-[9px]">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
                  className="cyber-input w-full font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="uppercase tracking-widest text-[9px]">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="cyber-input w-full cursor-pointer"
                >
                  <option value="male" className="bg-bg-secondary text-white">Male</option>
                  <option value="female" className="bg-bg-secondary text-white">Female</option>
                  <option value="other" className="bg-bg-secondary text-white">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Goals & Metabolic Preview */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-accent-orange/10 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-4">
              <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-accent-lime border-b border-card-border pb-2">
                Fitness Intent
              </h3>

              <div className="flex flex-col gap-4 text-xs font-bold text-text-secondary">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-[9px]">Primary Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="cyber-input w-full cursor-pointer"
                  >
                    <option value="cut" className="bg-bg-secondary text-white">Fat Loss (Cut)</option>
                    <option value="maintain" className="bg-bg-secondary text-white">Maintain Weight</option>
                    <option value="bulk" className="bg-bg-secondary text-white">Muscle Gain (Bulk)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-[9px]">Active Frequency</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                    className="cyber-input w-full cursor-pointer"
                  >
                    <option value="sedentary" className="bg-bg-secondary text-white">Sedentary (Desk Job)</option>
                    <option value="light" className="bg-bg-secondary text-white">Lightly Active (1-2 workouts/wk)</option>
                    <option value="moderate" className="bg-bg-secondary text-white">Moderately Active (3-5 workouts/wk)</option>
                    <option value="active" className="bg-bg-secondary text-white">Active (Daily workouts)</option>
                    <option value="very_active" className="bg-bg-secondary text-white">Very Active (Heavy sports/athletics)</option>
                  </select>
                </div>
              </div>

              {/* TDEE Stats display - Spec Sheet style */}
              <div className="mt-4 pt-4 border-t border-card-border/30 flex flex-col gap-2.5 text-xs text-text-secondary">
                <div className="flex justify-between items-baseline">
                  <span>Basal Metabolic Rate (BMR):</span>
                  <span className="font-mono text-white font-bold">{bmr} kcal</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span>Total Daily Energy Exp (TDEE):</span>
                  <span className="font-mono text-white font-bold">{tdee} kcal</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-dashed border-card-border/30 pt-2.5 mt-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">Suggested Intake:</span>
                  <span className="font-mono text-accent-lime font-black text-sm glow-text-lime">{recommendedCalories} kcal</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyRecommended}
              className="btn-cyber-secondary w-full py-2.5 mt-6 text-[10px]"
            >
              ⚡ Apply Suggested Values
            </button>
          </div>

          {/* Column 3: Caloric Targets Calibration */}
          <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-accent-red/10 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-4">
              <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-accent-lime border-b border-card-border pb-2">
                Targets Calibration
              </h3>

              <div className="flex flex-col gap-3.5 text-xs font-bold text-text-secondary">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-[9px]">Target Calories (kcal)</label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(parseInt(e.target.value) || 1200)}
                    className="cyber-input w-full font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-[8px] font-sans">Protein (g)</label>
                    <input
                      type="number"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                      className="cyber-input w-full font-mono text-center px-1"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-[8px] font-sans">Carbs (g)</label>
                    <input
                      type="number"
                      value={targetCarbs}
                      onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                      className="cyber-input w-full font-mono text-center px-1"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase tracking-widest text-[8px] font-sans">Fat (g)</label>
                    <input
                      type="number"
                      value={targetFat}
                      onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                      className="cyber-input w-full font-mono text-center px-1"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-widest text-[9px]">Target Water (ml)</label>
                  <input
                    type="number"
                    step="250"
                    value={targetWater}
                    onChange={(e) => setTargetWater(parseInt(e.target.value) || 3000)}
                    className="cyber-input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-cyber-primary w-full mt-6"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Profile Targets</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </GymBackground>
  );
}
