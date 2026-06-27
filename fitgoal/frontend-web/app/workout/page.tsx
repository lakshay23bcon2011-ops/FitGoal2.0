'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';

interface SearchExerciseItem {
  _id: string;
  name: string;
  category: string;
  met: number;
  muscleGroups: string[];
}

interface SetLog {
  reps?: number;
  weight?: number;
  rpe?: number;
  duration?: number; // seconds
  distance?: number; // meters
  heartRate?: number;
}

interface ExerciseLogEntry {
  exerciseId: string;
  exerciseName: string;
  category: string;
  sets: SetLog[];
}

interface LoggedWorkoutSession {
  _id: string;
  sessionName: string;
  totalCaloriesBurned: number;
  duration: number;
  date: string;
  mood: string;
}

export default function WorkoutPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'log' | 'ai'>('log');
  const [history, setHistory] = useState<LoggedWorkoutSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // LOG WORKOUT STATES
  const [sessionName, setSessionName] = useState('Push Day');
  const [duration, setDuration] = useState<number>(60); // minutes
  const [mood, setMood] = useState<'terrible' | 'bad' | 'okay' | 'good' | 'great'>('good');
  const [loggedExercises, setLoggedExercises] = useState<ExerciseLogEntry[]>([]);
  
  // Exercise Search
  const [exQuery, setExQuery] = useState('');
  const [exResults, setExResults] = useState<SearchExerciseItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // AI WORKOUT PLANNER STATES
  const [aiGoal, setAiGoal] = useState<'bulk' | 'cut' | 'maintain'>('maintain');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [timePerSession, setTimePerSession] = useState(45);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['dumbbell', 'bodyweight']);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const fetchWorkoutHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/workout');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load workout logs:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
      setAiGoal(user.goal || 'maintain');
    }
  }, [user]);

  // Search exercises
  useEffect(() => {
    const searchExercises = async () => {
      if (!exQuery.trim()) {
        setExResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await api.get(`/exercise/search?q=${exQuery}`);
        if (res.data.success) {
          setExResults(res.data.data);
        }
      } catch (err) {
        console.error('Exercise search failed:', err);
      } finally {
        setSearching(false);
      }
    };

    const delay = setTimeout(() => {
      searchExercises();
    }, 300);

    return () => clearTimeout(delay);
  }, [exQuery]);

  const handleAddExerciseToLog = (ex: SearchExerciseItem) => {
    const isStrength = ex.category === 'strength';
    const initialSet: SetLog = isStrength 
      ? { reps: 10, weight: 10, rpe: 8 }
      : { duration: 600, distance: 1000, heartRate: 130 };

    setLoggedExercises([
      ...loggedExercises,
      {
        exerciseId: ex._id,
        exerciseName: ex.name,
        category: ex.category,
        sets: [initialSet]
      }
    ]);
    setExQuery('');
    setExResults([]);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const entry = loggedExercises[exerciseIndex];
    const isStrength = entry.category === 'strength';
    const lastSet = entry.sets[entry.sets.length - 1];
    
    const newSet: SetLog = isStrength
      ? { 
          reps: lastSet?.reps || 10, 
          weight: lastSet?.weight || 10, 
          rpe: lastSet?.rpe || 8 
        }
      : { 
          duration: lastSet?.duration || 600, 
          distance: lastSet?.distance || 1000, 
          heartRate: lastSet?.heartRate || 130 
        };

    const updated = [...loggedExercises];
    updated[exerciseIndex].sets.push(newSet);
    setLoggedExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...loggedExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, idx) => idx !== setIndex);
    
    if (updated[exerciseIndex].sets.length === 0) {
      setLoggedExercises(loggedExercises.filter((_, idx) => idx !== exerciseIndex));
    } else {
      setLoggedExercises(updated);
    }
  };

  const handleSetFieldChange = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetLog,
    val: number
  ) => {
    const updated = [...loggedExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: val
    };
    setLoggedExercises(updated);
  };

  const handleSaveWorkout = async () => {
    if (loggedExercises.length === 0 || savingWorkout) return;
    setSavingWorkout(true);
    try {
      const payload = {
        sessionName,
        duration,
        mood,
        exercises: loggedExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets
        }))
      };
      
      const res = await api.post('/workout', payload);
      if (res.data.success) {
        setLoggedExercises([]);
        setSessionName('Push Day');
        setDuration(60);
        fetchWorkoutHistory();
        alert('Workout logged successfully!');
      }
    } catch (err) {
      console.error('Failed to log workout session:', err);
    } finally {
      setSavingWorkout(false);
    }
  };

  const handleGenerateAIPlan = async () => {
    setGeneratingPlan(true);
    setAiPlan(null);
    try {
      const payload = {
        goal: aiGoal,
        experience,
        daysPerWeek,
        timePerSession,
        equipment: selectedEquipment
      };
      const res = await api.post('/workout/plan/generate', payload);
      if (res.data.success) {
        setAiPlan(res.data.data);
      }
    } catch (err) {
      console.error('AI plan generation error:', err);
      alert('Failed to generate AI plan. Please check backend keys.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleToggleEquipment = (eq: string) => {
    if (selectedEquipment.includes(eq)) {
      setSelectedEquipment(selectedEquipment.filter(item => item !== eq));
    } else {
      setSelectedEquipment([...selectedEquipment, eq]);
    }
  };

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
              Gym Training Logs
            </h2>
            <p className="text-xs text-text-secondary">
              Record daily strength and cardio, or ask Claude for custom training templates.
            </p>
          </div>

          {/* Stepper/Tab selectors */}
          <div className="flex bg-bg-secondary border border-card-border p-1 rounded-xl shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'log'
                  ? 'bg-accent-lime text-black shadow-[0_0_8px_rgba(204,255,0,0.3)]'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              Log Workout
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-accent-lime text-black shadow-[0_0_8px_rgba(204,255,0,0.3)]'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              AI Planner
            </button>
          </div>
        </div>

        {/* LOG WORKOUT TAB CONTENT */}
        {activeTab === 'log' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Logging Form */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Session Meta configuration */}
              <div className="glass-panel p-5 rounded-2xl border border-card-border grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Routine Name</label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="cyber-input w-full"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Duration (mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="cyber-input w-full font-mono text-center"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">Session Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as any)}
                    className="cyber-input w-full uppercase font-bold cursor-pointer"
                  >
                    <option value="great" className="bg-bg-secondary text-white">Great 😁</option>
                    <option value="good" className="bg-bg-secondary text-white">Good 🙂</option>
                    <option value="okay" className="bg-bg-secondary text-white">Okay 😐</option>
                    <option value="bad" className="bg-bg-secondary text-white">Bad 🙁</option>
                    <option value="terrible" className="bg-bg-secondary text-white">Terrible 😫</option>
                  </select>
                </div>
              </div>

              {/* Add Exercise Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search exercises to log (e.g. Bench Press, Squat, Running)..."
                  value={exQuery}
                  onChange={(e) => setExQuery(e.target.value)}
                  className="cyber-input w-full"
                />

                {exResults.length > 0 && (
                  <div className="absolute top-[100%] left-0 w-full bg-bg-secondary border border-card-border rounded-xl mt-1.5 z-20 max-h-[220px] overflow-y-auto shadow-2xl text-sm">
                    {exResults.map((ex) => (
                      <div
                        key={ex._id}
                        onClick={() => handleAddExerciseToLog(ex)}
                        className="p-3 hover:bg-bg-primary cursor-pointer border-b border-card-border/50 text-white flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{ex.name}</span>
                          <span className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5">{ex.muscleGroups.join(', ')}</span>
                        </div>
                        <span className="text-[9px] bg-accent-lime/10 text-accent-lime border border-accent-lime/20 rounded px-2 py-0.5 font-bold uppercase tracking-wider">
                          {ex.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Exercise List */}
              {loggedExercises.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-card-border rounded-2xl bg-bg-secondary/10">
                  <span className="text-xs uppercase font-bold text-text-secondary tracking-wider">No exercises added to this session yet.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {loggedExercises.map((entry, exIdx) => (
                    <div
                      key={entry.exerciseId}
                      className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col gap-3 shadow-md hover:border-accent-lime/10"
                    >
                      <div className="flex justify-between items-center border-b border-card-border/30 pb-2.5">
                        <div>
                          <h4 className="font-bold text-white leading-tight tracking-wide">{entry.exerciseName}</h4>
                          <span className="text-[9px] text-text-secondary uppercase font-bold tracking-widest mt-1 block">
                            {entry.category} split
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setLoggedExercises(loggedExercises.filter((_, idx) => idx !== exIdx));
                          }}
                          className="text-[10px] uppercase text-accent-red font-black hover:underline cursor-pointer tracking-widest bg-accent-red/5 px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Sets list */}
                      <div className="flex flex-col gap-2">
                        {entry.sets.map((set, setIdx) => (
                          <div key={setIdx} className="grid grid-cols-12 gap-2 items-center text-xs">
                            <span className="col-span-1 font-mono font-bold text-text-secondary text-center">
                              #{setIdx + 1}
                            </span>
                            
                            {entry.category === 'strength' ? (
                              <>
                                {/* Weight */}
                                <div className="col-span-4 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2">
                                  <input
                                    type="number"
                                    value={set.weight || 0}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">kg</span>
                                </div>
                                
                                {/* Reps */}
                                <div className="col-span-4 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2">
                                  <input
                                    type="number"
                                    value={set.reps || 0}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">reps</span>
                                </div>

                                {/* RPE */}
                                <div className="col-span-2 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2" title="RPE (Rate of Perceived Exertion)">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={set.rpe || 8}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'rpe', parseInt(e.target.value) || 8)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">rpe</span>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Duration */}
                                <div className="col-span-4 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2">
                                  <input
                                    type="number"
                                    value={set.duration || 0}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'duration', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">sec</span>
                                </div>
                                
                                {/* Distance */}
                                <div className="col-span-4 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2">
                                  <input
                                    type="number"
                                    value={set.distance || 0}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'distance', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">m</span>
                                </div>

                                {/* Heart rate */}
                                <div className="col-span-2 flex items-center bg-bg-primary/60 border border-card-border/60 rounded-xl px-2" title="Avg Heart Rate">
                                  <input
                                    type="number"
                                    value={set.heartRate || 130}
                                    onChange={(e) => handleSetFieldChange(exIdx, setIdx, 'heartRate', parseInt(e.target.value) || 120)}
                                    className="w-full bg-transparent border-none py-2 text-white focus:outline-none text-center font-mono text-xs"
                                  />
                                  <span className="text-[9px] text-text-secondary font-black uppercase">hr</span>
                                </div>
                              </>
                            )}

                            {/* Delete Set */}
                            <button
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="col-span-1 text-text-secondary hover:text-accent-red flex items-center justify-center cursor-pointer bg-white/5 hover:bg-accent-red/10 p-1.5 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Set trigger */}
                      <button
                        onClick={() => handleAddSet(exIdx)}
                        className="bg-bg-primary/40 hover:bg-bg-primary/95 border border-card-border text-[9px] uppercase font-black tracking-widest py-2 rounded-xl text-text-secondary hover:text-white transition-all cursor-pointer mt-1"
                      >
                        + Add Set
                      </button>
                    </div>
                  ))}

                  {/* Save session trigger */}
                  <button
                    onClick={handleSaveWorkout}
                    disabled={savingWorkout}
                    className="btn-cyber-primary w-full mt-2"
                  >
                    {savingWorkout ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Complete Workout & Log</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Workout History list */}
            <div className="flex flex-col gap-4">
              <h3 className="font-barlow text-xl font-bold uppercase tracking-wider text-text-secondary">
                Session History
              </h3>

              {loadingHistory ? (
                <div className="text-center py-6 text-xs font-bold uppercase tracking-wider text-text-secondary animate-pulse">Loading logs...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-card-border rounded-2xl text-xs text-text-secondary uppercase font-bold bg-bg-secondary/10">
                  No completed sessions registered.
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {history.map((session) => (
                    <div
                      key={session._id}
                      className="glass-panel p-4 rounded-2xl border border-card-border flex flex-col gap-2 hover:border-accent-lime/20 hover:scale-[1.01] transition-all text-sm shadow-md"
                    >
                      <div className="flex justify-between items-start border-b border-card-border/30 pb-2">
                        <div>
                          <span className="font-bold text-white tracking-wide">{session.sessionName}</span>
                          <span className="text-[10px] text-text-secondary font-semibold font-mono block mt-0.5">
                            {new Date(session.date).toLocaleDateString()} • {session.duration}m
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-accent-lime bg-accent-lime/10 border border-accent-lime/20 px-2 py-0.5 rounded">
                          {session.mood}
                        </span>
                      </div>
                      
                      {/* Calorie burn estimate */}
                      <div className="flex justify-between items-baseline text-xs mt-1">
                        <span className="text-text-secondary font-bold uppercase tracking-wider text-[9px]">Burned:</span>
                        <div className="flex items-baseline gap-0.5 font-mono">
                          <span className="text-accent-orange font-black text-sm">
                            {session.totalCaloriesBurned}
                          </span>
                          <span className="text-[9px] uppercase text-text-secondary font-black">kcal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI WORKOUT PLANNER TAB CONTENT */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Setup Card */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col gap-4 self-start shadow-xl">
              <h3 className="font-barlow text-lg font-bold uppercase tracking-wider text-accent-lime border-b border-card-border pb-2">
                Planner Setup
              </h3>

              <div className="flex flex-col gap-3 text-xs">
                {/* Goal */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-text-secondary tracking-wider text-[9px]">Training Goal</label>
                  <select
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value as any)}
                    className="cyber-input w-full cursor-pointer"
                  >
                    <option value="cut" className="bg-bg-secondary text-white">Fat Loss (Cut)</option>
                    <option value="maintain" className="bg-bg-secondary text-white">Maintain</option>
                    <option value="bulk" className="bg-bg-secondary text-white">Muscle Gain (Bulk)</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-text-secondary tracking-wider text-[9px]">Experience Level</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                    className="cyber-input w-full cursor-pointer"
                  >
                    <option value="beginner" className="bg-bg-secondary text-white">Beginner</option>
                    <option value="intermediate" className="bg-bg-secondary text-white">Intermediate</option>
                    <option value="advanced" className="bg-bg-secondary text-white">Advanced (Gym Beast)</option>
                  </select>
                </div>

                {/* Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-text-secondary tracking-wider text-[9px]">Days per Week</label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(parseInt(e.target.value) || 3)}
                    className="cyber-input w-full font-mono text-center"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-text-secondary tracking-wider text-[9px]">Duration (mins)</label>
                  <input
                    type="number"
                    min="20"
                    max="180"
                    value={timePerSession}
                    onChange={(e) => setTimePerSession(parseInt(e.target.value) || 45)}
                    className="cyber-input w-full font-mono text-center"
                  />
                </div>

                {/* Equipment Checkboxes */}
                <div className="flex flex-col gap-1.5 border-t border-card-border/30 pt-3 mt-1">
                  <label className="font-bold uppercase text-text-secondary tracking-wider text-[9px]">Equipment Available</label>
                  <div className="flex flex-col gap-2 text-xs text-white">
                    {['bodyweight', 'dumbbell', 'barbell', 'cables', 'machines', 'kettlebell'].map((eq) => (
                      <label key={eq} className="flex items-center gap-2.5 cursor-pointer select-none capitalize">
                        <input
                          type="checkbox"
                          checked={selectedEquipment.includes(eq)}
                          onChange={() => handleToggleEquipment(eq)}
                          className="cyber-checkbox"
                        />
                        <span>{eq}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateAIPlan}
                disabled={generatingPlan}
                className="btn-cyber-primary w-full mt-4"
              >
                {generatingPlan ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Split Plan</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* AI Output Display Card */}
            <div className="md:col-span-2">
              {generatingPlan ? (
                /* Laser scanner active loader */
                <div className="relative w-full border border-card-border rounded-xl bg-bg-primary/40 p-10 overflow-hidden flex flex-col items-center justify-center py-28 shadow-xl">
                  <div className="laser-scanner" />
                  <div className="w-10 h-10 border-4 border-accent-lime border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="font-barlow text-xl font-black uppercase text-white tracking-wider animate-pulse">Building Training Splits</span>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-2">AI Holographic Workout Assessment</span>
                </div>
              ) : !aiPlan ? (
                <div className="border border-dashed border-card-border rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2.5 bg-bg-secondary/10">
                  <span className="text-accent-lime animate-pulse-slow">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.5 5h2v14h-2V5zm10 0h2v14h-2V5zM2.5 9h2v6h-2V9zm18 0h2v6h-2V9zM8.5 11h8v2h-8v-2z" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold uppercase text-white tracking-wider mt-2">
                    No active training plan
                  </span>
                  <span className="text-xs text-text-secondary max-w-xs leading-relaxed">
                    Configure parameters on the left side console and trigger plan generation splits.
                  </span>
                </div>
              ) : (
                /* Tactical split plan card */
                <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-5 shadow-xl hover:border-accent-lime/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-accent-lime/10 text-accent-lime text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl border-l border-b border-card-border">AI GENERATED DOCKET</div>
                  
                  <h3 className="font-barlow text-2xl font-black uppercase text-accent-lime tracking-tight border-b border-card-border pb-2 flex justify-between items-baseline mt-2">
                    <span>Your Custom Split Plan</span>
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">
                      Goal: {aiGoal}
                    </span>
                  </h3>
                  
                  <div className="text-xs text-text-secondary leading-relaxed max-h-[500px] overflow-y-auto pr-1">
                    {aiPlan.rawPlan ? (
                      <pre className="font-mono text-[11px] whitespace-pre-wrap text-white bg-bg-primary/80 border border-card-border p-4 rounded-xl shadow-inner">
                        {aiPlan.rawPlan}
                      </pre>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {Object.entries(aiPlan).map(([dayKey, dayVal]: [string, any]) => (
                          <div key={dayKey} className="border border-card-border/50 rounded-xl p-4 bg-bg-primary/20 flex flex-col gap-2 shadow-inner">
                            <h4 className="font-barlow text-base font-bold uppercase text-white tracking-wide flex justify-between">
                              <span className="text-accent-lime">{dayKey.replace('_', ' ')}</span>
                              {dayVal.focus && (
                                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Focus: {dayVal.focus}</span>
                              )}
                            </h4>
                            <div className="flex flex-col gap-1.5 mt-2 text-xs text-white">
                              {dayVal.exercises && Array.isArray(dayVal.exercises) ? (
                                dayVal.exercises.map((ex: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center border-b border-card-border/20 pb-1.5">
                                    <span className="font-semibold text-white/90">{ex.name}</span>
                                    <span className="font-mono text-text-secondary text-[10px] uppercase font-bold">{ex.sets} sets × {ex.reps || ex.duration}</span>
                                  </div>
                                ))
                              ) : (
                                <pre className="font-mono text-[10px] whitespace-pre-wrap text-text-secondary">
                                  {JSON.stringify(dayVal, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </GymBackground>
  );
}
