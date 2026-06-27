'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';

interface LoggedFood {
  _id: string;
  foodName: string;
  mealType: string;
  foodType: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  oilLevel: number;
  spiceLevel: string;
}

interface IndianFood {
  _id: string;
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isVegetarian: boolean;
}

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'pre_workout', name: 'Pre-Workout' },
  { id: 'post_workout', name: 'Post-Workout' },
];

export default function MealsPage() {
  const { user, loading: authLoading } = useAuth();
  
  const [logs, setLogs] = useState<LoggedFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breakfast');
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndianFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<IndianFood | null>(null);

  // Log configurations
  const [quantity, setQuantity] = useState<number>(100);
  const [oilTsp, setOilTsp] = useState<number>(0);
  const [spiceLevel, setSpiceLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [savingLog, setSavingLog] = useState(false);

  const fetchTodayLogs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.get(`/foodlog?date=${todayStr}`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayLogs();
  }, [user]);

  // Search
  useEffect(() => {
    const searchFoods = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await api.get(`/food/search?q=${searchQuery}`);
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) {
        console.error('Failed to search foods:', err);
      } finally {
        setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchFoods();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDeleteLog = async (id: string) => {
    try {
      const res = await api.delete(`/foodlog/${id}`);
      if (res.data.success) {
        setLogs(logs.filter(log => log._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete log entry:', err);
    }
  };

  const handleSelectFood = (food: IndianFood) => {
    setSelectedFood(food);
    setQuantity(food.servingSize);
    setOilTsp(0);
    setSpiceLevel('none');
  };

  const handleLogFood = async () => {
    if (!selectedFood || savingLog) return;
    setSavingLog(true);
    try {
      const ratio = quantity / selectedFood.servingSize;
      const oilCalories = oilTsp * 45;
      const oilFat = oilTsp * 5;

      const calories = Math.round(selectedFood.calories * ratio + oilCalories);
      const protein = Math.round((selectedFood.protein * ratio) * 10) / 10;
      const carbs = Math.round((selectedFood.carbs * ratio) * 10) / 10;
      const fat = Math.round((selectedFood.fat * ratio + oilFat) * 10) / 10;
      const fiber = Math.round((selectedFood.fiber * ratio) * 10) / 10;

      const payload = {
        mealType: activeTab,
        foodType: 'indian_food',
        foodId: selectedFood._id,
        foodName: selectedFood.name,
        quantity,
        unit: 'grams',
        calories,
        protein,
        carbs,
        fat,
        fiber,
        oilLevel: oilTsp,
        spiceLevel,
        aiAdjusted: false,
      };

      const res = await api.post('/foodlog', payload);
      if (res.data.success) {
        setLogs([...logs, res.data.data]);
        setDrawerOpen(false);
        setSelectedFood(null);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Failed to log food item:', err);
    } finally {
      setSavingLog(false);
    }
  };

  const activeLogs = logs.filter(log => log.mealType === activeTab);

  const subtotal = activeLogs.reduce(
    (acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (authLoading) return null;

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6 relative">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
              Daily Meal Tracker
            </h2>
            <p className="text-xs text-text-secondary">
              Review and log meals across workout intervals.
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-cyber-primary text-xs px-4 py-2.5"
          >
            {/* Salad bowl plus */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Food</span>
          </button>
        </div>

        {/* Meal segments selector */}
        <div className="flex overflow-x-auto gap-2 bg-bg-secondary border border-card-border p-1.5 rounded-xl scrollbar-none shadow-inner">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === type.id
                  ? 'bg-accent-lime text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* List of items logged */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subtotals card */}
          <div className="glass-panel rounded-2xl p-5 border border-card-border hover:border-accent-lime/10 self-start flex flex-col gap-4 shadow-xl">
            <h3 className="font-barlow text-base font-bold uppercase tracking-wider text-text-secondary border-b border-card-border pb-2">
              Segment Summary
            </h3>
            <div className="flex flex-col gap-3 font-mono">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-medium font-sans">Calories</span>
                <span className="font-bold text-accent-orange">{subtotal.calories} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-medium font-sans">Protein</span>
                <span className="font-bold text-accent-lime">{subtotal.protein.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-medium font-sans">Carbs</span>
                <span className="font-bold text-white">{subtotal.carbs.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-medium font-sans">Fat</span>
                <span className="font-bold text-accent-red">{subtotal.fat.toFixed(1)}g</span>
              </div>
            </div>
          </div>

          {/* Logs List card */}
          <div className="md:col-span-2 flex flex-col gap-3">
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 w-full bg-bg-secondary/40 border border-card-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activeLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-card-border rounded-2xl text-center bg-bg-secondary/10">
                <span className="text-xs text-text-secondary font-bold">No meals recorded here for today.</span>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="mt-2 text-xs font-extrabold uppercase text-accent-lime hover:underline cursor-pointer tracking-wider"
                >
                  Log meal now
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeLogs.map((log) => (
                  <div
                    key={log._id}
                    className="glass-panel p-4 rounded-xl flex items-center justify-between border border-card-border hover:border-accent-lime/30 hover:scale-[1.01] transition-all shadow-md"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-white tracking-wide">{log.foodName}</span>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                          {log.quantity} {log.unit}
                        </span>
                        {log.oilLevel > 0 && (
                          <span className="text-[9px] bg-accent-orange/15 text-accent-orange border border-accent-orange/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                            🍳 {log.oilLevel} tsp oil
                          </span>
                        )}
                        {log.spiceLevel && log.spiceLevel !== 'none' && (
                          <span className="text-[9px] bg-accent-red/15 text-accent-red border border-accent-red/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                            🌶️ {log.spiceLevel} spice
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Calories & Macros */}
                      <div className="flex flex-col items-end font-mono">
                        <span className="font-bold text-accent-orange text-base leading-none">{log.calories} kcal</span>
                        <span className="text-[9px] text-text-secondary font-semibold mt-1">
                          P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                        </span>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        className="text-text-secondary hover:text-accent-red p-1.5 transition-colors cursor-pointer bg-white/5 hover:bg-accent-red/10 rounded-lg"
                        title="Remove logged item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide-out Drawer Panel Console */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-bg-secondary/95 border-l border-card-border p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto backdrop-blur-xl">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-card-border pb-3">
                  <h3 className="font-barlow text-xl font-black uppercase tracking-wider text-white">
                    Add {MEAL_TYPES.find(t => t.id === activeTab)?.name} Log
                  </h3>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setSelectedFood(null);
                      setSearchQuery('');
                    }}
                    className="text-text-secondary hover:text-white cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!selectedFood ? (
                  /* Search Database view */
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Indian database (e.g. Dosa, Roti)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="cyber-input w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-[450px] overflow-y-auto pr-1">
                      {searching ? (
                        <div className="text-center py-6 text-xs font-bold uppercase tracking-wider text-text-secondary animate-pulse">Searching catalog...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-6 text-xs text-text-secondary font-bold uppercase tracking-wider">
                          {searchQuery ? 'No food matches' : 'Type to search the Indian Database'}
                        </div>
                      ) : (
                        searchResults.map((food) => (
                          <div
                            key={food._id}
                            onClick={() => handleSelectFood(food)}
                            className="p-3 bg-bg-primary/40 hover:bg-bg-primary/95 border border-card-border rounded-xl flex justify-between items-center cursor-pointer hover:border-accent-lime/30 transition-all text-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-white leading-tight">{food.name}</span>
                              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-0.5">
                                {food.category} • {food.servingSize}g serving
                              </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-accent-orange">{food.calories}</span>
                              <span className="text-[9px] uppercase text-text-secondary font-black">kcal</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* Log Item Configuration View */
                  <div className="flex flex-col gap-5 border border-card-border p-4 rounded-xl bg-bg-primary/20">
                    <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                      <span className="font-bold text-white">{selectedFood.name}</span>
                      <button
                        onClick={() => setSelectedFood(null)}
                        className="text-xs uppercase text-accent-lime font-black hover:underline cursor-pointer tracking-wider"
                      >
                        Change
                      </button>
                    </div>

                    {/* Weight (Grams) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex justify-between">
                        <span>Quantity (grams)</span>
                        <span className="font-mono text-white font-bold">{quantity}g</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                        className="cyber-input w-full font-mono"
                      />
                    </div>

                    {/* Oil slider (Teaspoons) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex justify-between">
                        <span>Oil Added</span>
                        <span className="text-accent-orange font-mono font-bold">🍳 {oilTsp} tsp (+{oilTsp * 45} kcal)</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={oilTsp}
                        onChange={(e) => setOilTsp(parseFloat(e.target.value))}
                        className="accent-accent-lime w-full h-1 bg-bg-primary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Spice Level selection */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Spice Level</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: 'None' },
                          { id: 'low', label: '🌶️ Low' },
                          { id: 'medium', label: '🌶️🌶️ Med' },
                          { id: 'high', label: '🌶️🌶️🌶️ Hot' }
                        ].map((level) => (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setSpiceLevel(level.id as any)}
                            className={`py-2 rounded-lg text-[10px] font-black uppercase border tracking-wider transition-all cursor-pointer ${
                              spiceLevel === level.id
                                ? 'bg-accent-lime border-transparent text-black shadow-[0_0_8px_rgba(204,255,0,0.35)]'
                                : 'border-card-border text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedFood && (
                <button
                  onClick={handleLogFood}
                  disabled={savingLog}
                  className="btn-cyber-primary w-full mt-6"
                >
                  {savingLog ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Record Meal</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </GymBackground>
  );
}
