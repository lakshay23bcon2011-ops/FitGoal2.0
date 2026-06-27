'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';

interface FoodItem {
  _id: string;
  name: string;
  nameHindi?: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isJain: boolean;
}

const CATEGORIES = [
  { id: '', name: 'All' },
  { id: 'north', name: 'North Indian' },
  { id: 'south', name: 'South Indian' },
  { id: 'street_food', name: 'Street Food' },
  { id: 'sweets', name: 'Sweets' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'rice', name: 'Rice' },
  { id: 'breads', name: 'Breads' },
  { id: 'dal', name: 'Dal' },
  { id: 'sabzi', name: 'Sabzi' },
  { id: 'snacks', name: 'Snacks' },
];

export default function FoodDatabase() {
  const { user } = useAuth();
  
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isJain, setIsJain] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal states
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [logMealType, setLogMealType] = useState('breakfast');
  const [logQuantity, setLogQuantity] = useState(100);
  const [loggingItem, setLoggingItem] = useState(false);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      let url = `/food?page=${page}&limit=12&search=${search}&category=${category}`;
      if (isVeg) url += '&vegetarian=true';
      if (isVegan) url += '&vegan=true';
      if (isJain) url += '&jain=true';

      const res = await api.get(url);
      if (res.data.success) {
        setFoods(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to fetch food list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, isVeg, isVegan, isJain]);

  useEffect(() => {
    fetchFoods();
  }, [page, search, category, isVeg, isVegan, isJain]);

  const handleQuickLog = async () => {
    if (!selectedFood || loggingItem) return;
    setLoggingItem(true);
    try {
      const ratio = logQuantity / selectedFood.servingSize;
      
      const payload = {
        mealType: logMealType,
        foodType: 'indian_food',
        foodId: selectedFood._id,
        foodName: selectedFood.name,
        quantity: logQuantity,
        unit: 'grams',
        calories: Math.round(selectedFood.calories * ratio),
        protein: Math.round((selectedFood.protein * ratio) * 10) / 10,
        carbs: Math.round((selectedFood.carbs * ratio) * 10) / 10,
        fat: Math.round((selectedFood.fat * ratio) * 10) / 10,
        fiber: Math.round((selectedFood.fiber * ratio) * 10) / 10,
        oilLevel: 0,
        spiceLevel: 'none',
        aiAdjusted: false,
      };

      const res = await api.post('/foodlog', payload);
      if (res.data.success) {
        setSelectedFood(null);
        alert('Meal logged successfully!');
      }
    } catch (err) {
      console.error('Failed to log food from catalog:', err);
    } finally {
      setLoggingItem(false);
    }
  };

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
            Indian Food Database
          </h2>
          <p className="text-xs text-text-secondary">
            Explore macros and calorie densities of over 200+ authentic Indian items.
          </p>
        </div>

        {/* Filter controls */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-accent-lime/10 flex flex-col gap-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="w-full md:flex-1">
              <input
                type="text"
                placeholder="Search food by name (e.g. Biryani, Chapati)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cyber-input w-full"
              />
            </div>
            
            {/* Dietary Checkboxes */}
            <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-text-secondary self-start md:self-auto">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="cyber-checkbox"
                />
                <span>Veg Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVegan}
                  onChange={(e) => setIsVegan(e.target.checked)}
                  className="cyber-checkbox"
                />
                <span>Vegan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isJain}
                  onChange={(e) => setIsJain(e.target.checked)}
                  className="cyber-checkbox"
                />
                <span>Jain</span>
              </label>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none border-t border-card-border/30 pt-3.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  category === cat.id
                    ? 'bg-accent-lime text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                    : 'bg-bg-primary/40 border border-card-border text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Database Stats info */}
        <div className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
          Showing <span className="text-white font-mono">{foods.length}</span> of{' '}
          <span className="text-white font-mono">{totalCount}</span> registered Indian dishes.
        </div>

        {/* Food Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-44 w-full bg-bg-secondary/40 border border-card-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-card-border rounded-2xl bg-bg-secondary/10">
            <span className="text-xs uppercase font-bold tracking-wider text-text-secondary">No matching foods found in the database.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {foods.map((food) => {
              const totalMacros = (food.protein + food.carbs + food.fat) || 1;
              const pPercent = (food.protein / totalMacros) * 100;
              const cPercent = (food.carbs / totalMacros) * 100;
              const fPercent = (food.fat / totalMacros) * 100;

              return (
                <div
                  key={food._id}
                  onClick={() => setSelectedFood(food)}
                  className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col justify-between hover:border-accent-lime/30 hover:scale-[1.02] shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-white group-hover:text-accent-lime transition-colors leading-tight tracking-wide">
                        {food.name}
                      </h3>
                      {/* Veg / Non-Veg Glowing Badges */}
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        food.isVegetarian
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]'
                      }`}>
                        {food.isVegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                      {food.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4">
                    {/* Color-coded Macro Ratio Bar */}
                    <div className="h-1.5 w-full bg-bg-primary rounded-full overflow-hidden flex mb-3">
                      <div className="bg-accent-lime h-full" style={{ width: `${pPercent}%` }} title="Protein" />
                      <div className="bg-white h-full" style={{ width: `${cPercent}%` }} title="Carbs" />
                      <div className="bg-accent-red h-full" style={{ width: `${fPercent}%` }} title="Fat" />
                    </div>

                    <div className="pt-2 border-t border-card-border/30 flex justify-between items-baseline">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-text-secondary font-bold">Per {food.servingSize}g</span>
                        <div className="flex items-baseline gap-0.5 mt-0.5 font-mono">
                          <span className="text-base font-black text-accent-orange leading-none">{food.calories}</span>
                          <span className="text-[9px] uppercase text-text-secondary font-black">kcal</span>
                        </div>
                      </div>

                      {/* Nutrient splits labels */}
                      <div className="flex gap-1.5 text-[9px] font-bold font-mono">
                        <span className="text-accent-lime">P: {food.protein}g</span>
                        <span className="text-white">C: {food.carbs}g</span>
                        <span className="text-accent-red">F: {food.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-bg-secondary border border-card-border text-text-secondary hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-30 cursor-pointer"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-bg-secondary border border-card-border text-text-secondary hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Details and Quick Log Console Modal */}
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-card-border relative max-h-[90vh] overflow-y-auto shadow-2xl hover:border-accent-lime/20">
              {/* Close button */}
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 text-text-secondary hover:text-white cursor-pointer bg-white/5 p-1 rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Title info */}
              <div className="border-b border-card-border pb-4 mb-4 mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-barlow text-2xl font-black uppercase text-white leading-tight">
                    {selectedFood.name}
                  </h3>
                  {selectedFood.nameHindi && (
                    <span className="text-sm font-bold text-text-secondary font-sans">
                      ({selectedFood.nameHindi})
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center mt-1.5">
                  <span className="text-xs uppercase font-bold text-accent-lime tracking-wide">
                    {selectedFood.category.replace('_', ' ')}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-card-border" />
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">
                    Serving: {selectedFood.servingSize}g
                  </span>
                </div>
              </div>

              {/* Macros values grid */}
              <div className="grid grid-cols-5 gap-2.5 mb-6 text-center font-mono">
                <div className="bg-bg-primary/50 border border-card-border/50 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Calories</span>
                  <div className="text-sm font-black text-accent-orange mt-0.5">{selectedFood.calories}</div>
                </div>
                <div className="bg-bg-primary/50 border border-card-border/50 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Protein</span>
                  <div className="text-sm font-black text-accent-lime mt-0.5">{selectedFood.protein}g</div>
                </div>
                <div className="bg-bg-primary/50 border border-card-border/50 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Carbs</span>
                  <div className="text-sm font-black text-white mt-0.5">{selectedFood.carbs}g</div>
                </div>
                <div className="bg-bg-primary/50 border border-card-border/50 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Fat</span>
                  <div className="text-sm font-black text-accent-red mt-0.5">{selectedFood.fat}g</div>
                </div>
                <div className="bg-bg-primary/50 border border-card-border/50 rounded-xl p-2.5">
                  <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Fiber</span>
                  <div className="text-sm font-black text-accent-blue mt-0.5">{selectedFood.fiber}g</div>
                </div>
              </div>

              {/* Quick Logging Panel inside modal */}
              <div className="border-t border-card-border/30 pt-4 flex flex-col gap-4">
                <h4 className="font-barlow text-lg font-black uppercase tracking-wider text-accent-lime">
                  Log This Item Today
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select segment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Meal Segment</label>
                    <select
                      value={logMealType}
                      onChange={(e) => setLogMealType(e.target.value)}
                      className="cyber-input w-full cursor-pointer"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks</option>
                      <option value="pre_workout">Pre-Workout</option>
                      <option value="post_workout">Post-Workout</option>
                    </select>
                  </div>

                  {/* Quantity input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Weight (grams)</label>
                    <input
                      type="number"
                      min="1"
                      value={logQuantity}
                      onChange={(e) => setLogQuantity(parseInt(e.target.value) || 100)}
                      className="cyber-input w-full font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  onClick={handleQuickLog}
                  disabled={loggingItem}
                  className="btn-cyber-primary w-full mt-2"
                >
                  {loggingItem ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Add to Daily Log</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </GymBackground>
  );
}
