'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/AuthContext';
import GymBackground from '../../components/GymBackground';
import Navigation from '../../components/Navigation';
import api from '../../utils/api';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface EstimateResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: 'ai' | 'fallback';
  confidence?: number;
}

interface SearchFoodItem {
  _id: string;
  name: string;
  servingSize: number;
}

export default function AICalorieCalculator() {
  const { user } = useAuth();
  
  // Wizard steps: 1 = Name/Ingredients, 2 = Modifiers, 3 = Results & Log
  const [step, setStep] = useState(1);
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  
  // Ingredient search inputs
  const [ingQuery, setIngQuery] = useState('');
  const [ingResults, setIngResults] = useState<SearchFoodItem[]>([]);
  const [ingQty, setIngQty] = useState(100);
  const [ingUnit, setIngUnit] = useState('grams');
  const [searching, setSearching] = useState(false);

  // Modifiers
  const [oilTsp, setOilTsp] = useState(1);
  const [sauceLevel, setSauceLevel] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  const [cookingMethod, setCookingMethod] = useState('fried');

  // Estimation state
  const [estimating, setEstimating] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);

  // Log configurations
  const [logMealType, setLogMealType] = useState('breakfast');
  const [savingCustom, setSavingCustom] = useState(false);
  const [loggingMeal, setLoggingMeal] = useState(false);

  // Search ingredients
  useEffect(() => {
    const searchIngredients = async () => {
      if (!ingQuery.trim()) {
        setIngResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await api.get(`/food/search?q=${ingQuery}`);
        if (res.data.success) {
          setIngResults(res.data.data);
        }
      } catch (err) {
        console.error('Failed to search ingredients:', err);
      } finally {
        setSearching(false);
      }
    };

    const delay = setTimeout(() => {
      searchIngredients();
    }, 300);

    return () => clearTimeout(delay);
  }, [ingQuery]);

  const handleAddIngredient = (name: string, quantity: number, unit: string) => {
    const exists = ingredients.find((i) => i.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setIngredients(
        ingredients.map((i) =>
          i.name.toLowerCase() === name.toLowerCase() ? { ...i, quantity: i.quantity + quantity } : i
        )
      );
    } else {
      setIngredients([...ingredients, { name, quantity, unit }]);
    }
    setIngQuery('');
    setIngResults([]);
  };

  const handleAddManualIngredient = () => {
    if (!ingQuery.trim()) return;
    handleAddIngredient(ingQuery, ingQty, ingUnit);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const handleEstimate = async () => {
    if (ingredients.length === 0 || estimating) return;
    setEstimating(true);
    setStep(3);
    try {
      const payload = {
        ingredients,
        oilTsp,
        sauceLevel,
        cookingMethod,
      };
      const res = await api.post('/custom-food/estimate', payload);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('AI estimation error:', err);
      alert('Failed to estimate calories. Using offline backup calculations.');
    } finally {
      setEstimating(false);
    }
  };

  const handleSaveAsCustomFood = async () => {
    if (!result || !dishName || savingCustom) return;
    setSavingCustom(true);
    try {
      const payload = {
        name: dishName,
        ingredients,
        oilTsp,
        sauceLevel,
        cookingMethod,
      };
      const res = await api.post('/custom-food', payload);
      if (res.data.success) {
        alert('Saved as custom food successfully!');
      }
    } catch (err) {
      console.error('Failed to save custom food:', err);
    } finally {
      setSavingCustom(false);
    }
  };

  const handleLogCustomMeal = async () => {
    if (!result || !dishName || loggingMeal) return;
    setLoggingMeal(true);
    try {
      const payload = {
        mealType: logMealType,
        foodType: 'custom_food',
        foodName: dishName || 'Custom Dish',
        quantity: 1,
        unit: 'servings',
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        fiber: result.fiber,
        oilLevel: oilTsp,
        spiceLevel: 'none',
        aiAdjusted: result.source === 'ai',
      };
      const res = await api.post('/foodlog', payload);
      if (res.data.success) {
        alert('Meal logged successfully!');
      }
    } catch (err) {
      console.error('Failed to log custom meal:', err);
    } finally {
      setLoggingMeal(false);
    }
  };

  return (
    <GymBackground>
      <Navigation />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:px-8 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h2 className="font-barlow text-3xl font-extrabold uppercase tracking-tight text-white">
            AI Calorie Calculator
          </h2>
          <p className="text-xs text-text-secondary">
            Input ingredients and cooking modifiers to estimate total macros using Claude.
          </p>
        </div>

        {/* High-fidelity Stepper Progress Tracker */}
        <div className="relative flex justify-between items-center bg-bg-secondary border border-card-border p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary select-none">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-card-border -translate-y-1/2 -z-10" />
          <div 
            className="absolute top-1/2 left-4 h-0.5 bg-accent-lime -translate-y-1/2 -z-10 transition-all duration-500" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
          
          <div className="flex items-center gap-2 bg-bg-secondary px-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono ${step >= 1 ? 'border-accent-lime bg-accent-lime text-black shadow-[0_0_8px_rgba(204,255,0,0.4)]' : 'border-card-border text-text-secondary'}`}>1</span>
            <span className={step >= 1 ? 'text-white' : ''}>Recipe</span>
          </div>
          <div className="flex items-center gap-2 bg-bg-secondary px-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono ${step >= 2 ? 'border-accent-lime bg-accent-lime text-black shadow-[0_0_8px_rgba(204,255,0,0.4)]' : 'border-card-border text-text-secondary'}`}>2</span>
            <span className={step >= 2 ? 'text-white' : ''}>Modifiers</span>
          </div>
          <div className="flex items-center gap-2 bg-bg-secondary px-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono ${step >= 3 ? 'border-accent-lime bg-accent-lime text-black shadow-[0_0_8px_rgba(204,255,0,0.4)]' : 'border-card-border text-text-secondary'}`}>3</span>
            <span className={step >= 3 ? 'text-white' : ''}>AI Results</span>
          </div>
        </div>

        {/* Step 1 Content: Recipe Build */}
        {step === 1 && (
          <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-5 shadow-xl hover:border-accent-lime/10">
            {/* Dish Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Oats Paneer Chilla, Protein Poha"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="cyber-input w-full"
              />
            </div>

            {/* Ingredients builder */}
            <div className="border-t border-card-border/30 pt-4 mt-2 flex flex-col gap-4">
              <h3 className="font-barlow text-lg font-bold uppercase text-accent-lime tracking-wider">
                Add Ingredients
              </h3>

              {/* Add Ingredient form controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search */}
                <div className="md:col-span-6 relative">
                  <input
                    type="text"
                    placeholder="Search database or type ingredient"
                    value={ingQuery}
                    onChange={(e) => setIngQuery(e.target.value)}
                    className="cyber-input w-full"
                  />
                  
                  {/* Dropdown search matches */}
                  {ingResults.length > 0 && (
                    <div className="absolute top-[100%] left-0 w-full bg-bg-secondary border border-card-border rounded-xl mt-1.5 z-20 max-h-[180px] overflow-y-auto shadow-2xl text-sm">
                      {ingResults.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleAddIngredient(item.name, item.servingSize, 'grams')}
                          className="p-2.5 hover:bg-bg-primary cursor-pointer border-b border-card-border/50 text-white flex justify-between items-center"
                        >
                          <span className="font-bold">{item.name}</span>
                          <span className="text-[10px] font-mono text-text-secondary">+{item.servingSize}g</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Qty */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={ingQty}
                    onChange={(e) => setIngQty(parseInt(e.target.value) || 10)}
                    className="cyber-input w-full text-center font-mono"
                    placeholder="Qty"
                  />
                </div>

                {/* Unit */}
                <div className="md:col-span-2">
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value)}
                    className="cyber-input w-full cursor-pointer"
                  >
                    <option value="grams" className="bg-bg-secondary text-white">grams</option>
                    <option value="ml" className="bg-bg-secondary text-white">ml</option>
                    <option value="pieces" className="bg-bg-secondary text-white">pieces</option>
                    <option value="servings" className="bg-bg-secondary text-white">servings</option>
                  </select>
                </div>

                {/* Add manual button */}
                <button
                  type="button"
                  onClick={handleAddManualIngredient}
                  className="md:col-span-2 btn-cyber-secondary py-2 text-xs"
                >
                  + Add
                </button>
              </div>

              {/* Current ingredients checklist */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] font-bold uppercase text-text-secondary tracking-widest">
                  Recipe Ingredients ({ingredients.length})
                </span>
                
                {ingredients.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-card-border rounded-xl text-xs text-text-secondary uppercase font-bold">
                    Add ingredients to build your recipe.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {ingredients.map((ing, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-bg-primary/40 border border-card-border rounded-xl text-sm"
                      >
                        <span className="font-semibold text-white">{ing.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-text-secondary text-xs uppercase font-semibold">
                            {ing.quantity} {ing.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-text-secondary hover:text-accent-red p-1 cursor-pointer bg-white/5 hover:bg-accent-red/10 rounded"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next step button */}
            <button
              onClick={() => setStep(2)}
              disabled={!dishName.trim() || ingredients.length === 0}
              className="btn-cyber-primary w-full mt-4"
            >
              <span>Continue to Modifiers</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 2 Content: Modifiers */}
        {step === 2 && (
          <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-6 shadow-xl hover:border-accent-orange/10">
            <h3 className="font-barlow text-xl font-bold uppercase tracking-wider text-white border-b border-card-border pb-2">
              Recipe Cooking Modifiers
            </h3>

            {/* Oil Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                <span>Cooking Oil Added</span>
                <span className="text-accent-orange font-mono font-bold">🍳 {oilTsp} tsp (+{oilTsp * 45} kcal)</span>
              </div>
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

            {/* Sauce Level selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Sauce / Gravy Density</label>
              <div className="grid grid-cols-4 gap-2">
                {['none', 'light', 'medium', 'heavy'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSauceLevel(level as any)}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase border tracking-wider transition-all cursor-pointer ${
                      sauceLevel === level
                        ? 'bg-accent-lime border-transparent text-black shadow-[0_0_8px_rgba(204,255,0,0.35)]'
                        : 'border-card-border text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Method selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Cooking Method</label>
              <select
                value={cookingMethod}
                onChange={(e) => setCookingMethod(e.target.value)}
                className="cyber-input w-full cursor-pointer"
              >
                <option value="fried" className="bg-bg-secondary text-white">Deep Fried / Stir Fried</option>
                <option value="steamed" className="bg-bg-secondary text-white">Steamed / Boiled</option>
                <option value="raw" className="bg-bg-secondary text-white">Raw / Fresh</option>
                <option value="grilled" className="bg-bg-secondary text-white">Grilled / Roasted / Tandoor</option>
              </select>
            </div>

            {/* Nav buttons */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-cyber-secondary py-3 text-sm"
              >
                Back to Recipe
              </button>
              <button
                type="button"
                onClick={handleEstimate}
                className="btn-cyber-primary py-3 text-sm"
              >
                <span>Estimate Macros</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 Content: AI Results & Log */}
        {step === 3 && (
          <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col gap-6 shadow-xl hover:border-accent-lime/10">
            <h3 className="font-barlow text-xl font-bold uppercase tracking-wider text-white border-b border-card-border pb-2">
              Nutritional Assessment
            </h3>

            {estimating ? (
              /* Laser scanning container */
              <div className="relative w-full border border-card-border rounded-xl bg-bg-primary/40 p-10 overflow-hidden flex flex-col items-center justify-center">
                <div className="laser-scanner" />
                <div className="w-10 h-10 border-4 border-accent-lime border-t-transparent rounded-full animate-spin mb-4" />
                <span className="font-barlow text-xl font-black uppercase text-white tracking-wider animate-pulse">Calculating Macros</span>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-2">AI Holographic Assessment Scan</span>
              </div>
            ) : !result ? (
              <div className="text-center py-12 text-xs text-accent-red font-bold uppercase tracking-wider">
                Error retrieving estimates. Please try going back and recalculating.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Result Cards Grid */}
                <div className="grid grid-cols-5 gap-2.5 text-center font-mono">
                  <div className="bg-bg-primary/50 border border-card-border rounded-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Calories</span>
                    <div className="text-base font-black text-accent-orange mt-1">{result.calories}</div>
                    <span className="text-[8px] text-text-secondary uppercase font-sans">kcal</span>
                  </div>
                  <div className="bg-bg-primary/50 border border-card-border rounded-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Protein</span>
                    <div className="text-base font-black text-accent-lime mt-1">{result.protein}g</div>
                    <span className="text-[8px] text-text-secondary uppercase font-sans">g</span>
                  </div>
                  <div className="bg-bg-primary/50 border border-card-border rounded-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Carbs</span>
                    <div className="text-base font-black text-white mt-1">{result.carbs}g</div>
                    <span className="text-[8px] text-text-secondary uppercase font-sans">g</span>
                  </div>
                  <div className="bg-bg-primary/50 border border-card-border rounded-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Fat</span>
                    <div className="text-base font-black text-accent-red mt-1">{result.fat}g</div>
                    <span className="text-[8px] text-text-secondary uppercase font-sans">g</span>
                  </div>
                  <div className="bg-bg-primary/50 border border-card-border rounded-xl p-3">
                    <span className="text-[9px] uppercase font-bold text-text-secondary font-sans">Fiber</span>
                    <div className="text-base font-black text-accent-blue mt-1">{result.fiber}g</div>
                    <span className="text-[8px] text-text-secondary uppercase font-sans">g</span>
                  </div>
                </div>

                {/* AI verification indicator */}
                <div className="bg-bg-primary/30 border border-card-border p-3.5 rounded-xl flex items-center justify-between text-xs text-text-secondary font-bold uppercase tracking-wider">
                  <span>Calculation Engine:</span>
                  <span className="font-black text-accent-lime glow-text-lime">
                    {result.source === 'ai' ? 'Claude 3.5 Sonnet ✓' : 'Fallback Engine'}
                  </span>
                </div>

                {/* Logging choices */}
                <div className="border-t border-card-border/30 pt-4 mt-2 flex flex-col gap-4">
                  <h4 className="font-barlow text-lg font-black uppercase tracking-wider text-accent-orange">
                    Save or Log Recipe
                  </h4>

                  <div className="flex flex-col gap-3">
                    {/* Add Log */}
                    <div className="flex gap-2">
                      <select
                        value={logMealType}
                        onChange={(e) => setLogMealType(e.target.value)}
                        className="cyber-input flex-1 cursor-pointer"
                      >
                        <option value="breakfast" className="bg-bg-secondary text-white">Breakfast</option>
                        <option value="lunch" className="bg-bg-secondary text-white">Lunch</option>
                        <option value="dinner" className="bg-bg-secondary text-white">Dinner</option>
                        <option value="snacks" className="bg-bg-secondary text-white">Snacks</option>
                        <option value="pre_workout" className="bg-bg-secondary text-white">Pre-Workout</option>
                        <option value="post_workout" className="bg-bg-secondary text-white">Post-Workout</option>
                      </select>
                      
                      <button
                        onClick={handleLogCustomMeal}
                        disabled={loggingMeal}
                        className="btn-cyber-primary py-3 px-6 text-xs"
                      >
                        {loggingMeal ? 'Logging...' : 'Log Today'}
                      </button>
                    </div>

                    {/* Save catalog */}
                    <button
                      onClick={handleSaveAsCustomFood}
                      disabled={savingCustom}
                      className="btn-cyber-secondary w-full py-3.5 text-xs"
                    >
                      <span>💾 Save to custom foods library</span>
                    </button>
                  </div>
                </div>

                {/* Return button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setResult(null);
                  }}
                  className="mt-2 text-center text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-white hover:underline cursor-pointer"
                >
                  Clear & Calculate Another Recipe
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </GymBackground>
  );
}
