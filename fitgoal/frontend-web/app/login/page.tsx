'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [goal, setGoal] = useState<'bulk' | 'cut' | 'maintain'>('maintain');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          age,
          weight,
          height,
          gender,
          goal,
          activityLevel,
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GymBackground>
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen relative">
        {/* Glow backdrop ring */}
        <div className="absolute w-[400px] h-[400px] bg-accent-lime/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="glass-panel w-full max-w-xl rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden border border-card-border hover:border-accent-lime/20 shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            {/* Gym Style Logo Icon */}
            <div className="w-14 h-14 rounded-2xl bg-bg-secondary border border-card-border flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-accent-lime filter drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
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
            </div>
            <h1 className="font-barlow text-4xl font-black tracking-tight text-white uppercase leading-none">
              FIT<span className="text-accent-lime glow-text-lime">GOAL</span>
            </h1>
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mt-1.5 max-w-xs">
              {isLogin
                ? 'Sign in to access your fitness tracker & AI tools'
                : 'Create your gym-aesthetic fitness profile today'}
            </p>
          </div>

          {/* Tab selectors */}
          <div className="flex bg-bg-secondary border border-card-border p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                isLogin 
                  ? 'bg-accent-lime text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                !isLogin 
                  ? 'bg-accent-lime text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]' 
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold rounded-xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Standard Credentials */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cyber-input w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cyber-input w-full font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cyber-input w-full font-mono"
              />
            </div>

            {/* Profile configuration (Registration only) */}
            {!isLogin && (
              <div className="border-t border-card-border pt-4 mt-2 flex flex-col gap-4">
                <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-accent-lime">
                  Body Metrics & Fitness Goals
                </h3>

                {/* Age, Weight, Height Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary">Age</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                      className="cyber-input w-full text-center font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary font-sans">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="300"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 70)}
                      className="cyber-input w-full text-center font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary font-sans">Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
                      className="cyber-input w-full text-center font-mono"
                    />
                  </div>
                </div>

                {/* Gender, Goal Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary">Gender</label>
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary">Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as any)}
                      className="cyber-input w-full cursor-pointer"
                    >
                      <option value="cut" className="bg-bg-secondary text-white">Fat Loss (Cut)</option>
                      <option value="maintain" className="bg-bg-secondary text-white">Maintain</option>
                      <option value="bulk" className="bg-bg-secondary text-white">Muscle Gain (Bulk)</option>
                    </select>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-widest uppercase text-text-secondary">Activity Level</label>
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-cyber-primary mt-4 w-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Create Profile & Start</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </GymBackground>
  );
}
