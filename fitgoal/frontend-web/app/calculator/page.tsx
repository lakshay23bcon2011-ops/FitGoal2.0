'use client';

import React, { useEffect, useState, useRef } from 'react';
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

const POPULAR_RAW_MATERIALS: SearchFoodItem[] = [
  // Dairy
  { _id: 'raw_paneer', name: 'Raw Paneer (Cottage Cheese)', servingSize: 100 },
  { _id: 'raw_milk', name: 'Full Cream Cow Milk', servingSize: 100 },
  { _id: 'toned_milk', name: 'Toned Milk (Low Fat)', servingSize: 100 },
  { _id: 'skimmed_milk', name: 'Skimmed Milk', servingSize: 100 },
  { _id: 'desi_ghee', name: 'Desi Ghee (Clarified Butter)', servingSize: 10 },
  { _id: 'butter', name: 'Butter (Makkhan)', servingSize: 10 },
  { _id: 'fresh_cream', name: 'Fresh Milk Cream (Malai)', servingSize: 100 },
  { _id: 'greek_yogurt', name: 'Greek Yogurt (Plain)', servingSize: 100 },
  { _id: 'hung_curd', name: 'Hung Curd', servingSize: 100 },
  { _id: 'khoya', name: 'Khoya / Mawa', servingSize: 100 },
  { _id: 'cheese_slice', name: 'Cheese Slice', servingSize: 20 },
  { _id: 'mozzarella', name: 'Mozzarella Cheese', servingSize: 100 },

  // Pulses & Legumes (Dals)
  { _id: 'moong_dal', name: 'Raw Yellow Moong Dal', servingSize: 100 },
  { _id: 'green_moong_whole', name: 'Raw Whole Green Moong (Sabut Moong)', servingSize: 100 },
  { _id: 'toor_dal', name: 'Raw Toor / Arhar Dal', servingSize: 100 },
  { _id: 'chana_dal', name: 'Raw Chana Dal', servingSize: 100 },
  { _id: 'masoor_dal', name: 'Raw Masoor Dal', servingSize: 100 },
  { _id: 'urad_dal', name: 'Raw Urad Dal', servingSize: 100 },
  { _id: 'rajma', name: 'Raw Rajma (Red Kidney Beans)', servingSize: 100 },
  { _id: 'kabuli_chana', name: 'Raw White Chickpeas (Kabuli Chana)', servingSize: 100 },
  { _id: 'black_chana', name: 'Raw Black Chana (Kala Chana)', servingSize: 100 },
  { _id: 'soybean', name: 'Raw Soybeans', servingSize: 100 },
  { _id: 'lobia', name: 'Raw Lobia (Black Eyed Peas)', servingSize: 100 },
  { _id: 'sprouted_moong', name: 'Sprouted Moong', servingSize: 100 },

  // Grains & Cereals
  { _id: 'basmati_rice', name: 'Raw Basmati Rice', servingSize: 100 },
  { _id: 'brown_rice', name: 'Raw Brown Rice', servingSize: 100 },
  { _id: 'rolled_oats', name: 'Rolled Oats / Raw Oats', servingSize: 100 },
  { _id: 'poha', name: 'Raw Poha (Flattened Rice)', servingSize: 100 },
  { _id: 'sooji', name: 'Raw Sooji / Semolina', servingSize: 100 },
  { _id: 'sabudana', name: 'Raw Sabudana (Tapioca Pearls)', servingSize: 100 },
  { _id: 'dalia', name: 'Raw Dalia (Broken Wheat)', servingSize: 100 },
  { _id: 'quinoa', name: 'Raw Quinoa', servingSize: 100 },
  { _id: 'ragi_grain', name: 'Raw Ragi (Finger Millet)', servingSize: 100 },
  { _id: 'bajra_grain', name: 'Raw Bajra (Pearl Millet)', servingSize: 100 },
  { _id: 'jowar_grain', name: 'Raw Jowar (Sorghum)', servingSize: 100 },
  { _id: 'sweet_corn', name: 'Sweet Corn (Raw Kernels)', servingSize: 100 },

  // Flours
  { _id: 'wheat_atta', name: 'Whole Wheat Flour (Gehun ka Atta)', servingSize: 100 },
  { _id: 'besan', name: 'Besan (Gram Flour)', servingSize: 100 },
  { _id: 'maida', name: 'Maida (All-Purpose Flour)', servingSize: 100 },
  { _id: 'ragi_atta', name: 'Ragi Flour (Ragi Atta)', servingSize: 100 },
  { _id: 'bajra_atta', name: 'Bajra Flour (Bajra Atta)', servingSize: 100 },
  { _id: 'jowar_atta', name: 'Jowar Flour (Jowar Atta)', servingSize: 100 },
  { _id: 'rice_flour', name: 'Rice Flour (Chawal ka Atta)', servingSize: 100 },
  { _id: 'multigrain_atta', name: 'Multigrain Atta', servingSize: 100 },
  { _id: 'corn_flour', name: 'Corn Flour / Cornstarch', servingSize: 100 },

  // Spices & Seasonings
  { _id: 'cooking_oil', name: 'Cooking Oil (Mustard / Refined)', servingSize: 10 },
  { _id: 'olive_oil', name: 'Olive Oil (Extra Virgin)', servingSize: 10 },
  { _id: 'turmeric', name: 'Turmeric Powder (Haldi)', servingSize: 5 },
  { _id: 'red_chilli', name: 'Red Chilli Powder', servingSize: 5 },
  { _id: 'coriander_powder', name: 'Coriander Powder (Dhaniya Powder)', servingSize: 5 },
  { _id: 'jeera', name: 'Cumin Seeds (Jeera)', servingSize: 5 },
  { _id: 'garam_masala', name: 'Garam Masala', servingSize: 5 },
  { _id: 'ginger_garlic_paste', name: 'Ginger Garlic Paste', servingSize: 10 },
  { _id: 'raw_ginger', name: 'Raw Ginger (Adrak)', servingSize: 10 },
  { _id: 'raw_garlic', name: 'Raw Garlic (Lahsun)', servingSize: 10 },
  { _id: 'raw_onion', name: 'Raw Onion', servingSize: 100 },
  { _id: 'raw_tomato', name: 'Raw Tomato', servingSize: 100 },
  { _id: 'green_chillies', name: 'Green Chillies', servingSize: 20 },
  { _id: 'white_sugar', name: 'Sugar (White)', servingSize: 10 },
  { _id: 'jaggery', name: 'Jaggery (Gur)', servingSize: 10 },
  { _id: 'honey', name: 'Honey', servingSize: 10 },

  // Proteins, Meats, Eggs, Nuts & Seeds
  { _id: 'chicken_breast', name: 'Raw Chicken Breast', servingSize: 100 },
  { _id: 'whole_egg', name: 'Whole Egg (Raw)', servingSize: 50 },
  { _id: 'egg_white', name: 'Egg White (Raw)', servingSize: 33 },
  { _id: 'tofu', name: 'Tofu (Soy Paneer)', servingSize: 100 },
  { _id: 'soya_chunks', name: 'Raw Soya Chunks', servingSize: 100 },
  { _id: 'whey_protein', name: 'Whey Protein Powder', servingSize: 30 },
  { _id: 'raw_almonds', name: 'Raw Almonds (Badam)', servingSize: 20 },
  { _id: 'raw_cashews', name: 'Raw Cashews (Kaju)', servingSize: 20 },
  { _id: 'walnuts', name: 'Walnuts (Akhrot)', servingSize: 20 },
  { _id: 'chia_seeds', name: 'Chia Seeds', servingSize: 15 },
  { _id: 'flax_seeds', name: 'Flax Seeds (Alsi)', servingSize: 15 },
  { _id: 'raw_peanuts', name: 'Raw Peanuts (Groundnuts)', servingSize: 20 }
];

export default function AICalorieCalculator() {
  const { user } = useAuth();
  
  // Wizard steps: 1 = Name/Ingredients, 2 = Modifiers, 3 = Results & Log
  const [step, setStep] = useState(1);
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  
  // Ingredient search inputs
  const [ingQuery, setIngQuery] = useState('');
  const [ingResults, setIngResults] = useState<SearchFoodItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ingQty, setIngQty] = useState<number | ''>(100);
  const [ingUnit, setIngUnit] = useState('grams');
  const [searching, setSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  // Click outside & Escape key listeners to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        setShowDropdown(false);
        return;
      }
      setSearching(true);
      
      const termLower = ingQuery.trim().toLowerCase();
      const localMatches = POPULAR_RAW_MATERIALS.filter(item =>
        item.name.toLowerCase().includes(termLower)
      );

      try {
        const res = await api.get(`/food/search?q=${ingQuery}`);
        if (res.data.success && res.data.data.length > 0) {
          const merged = [...localMatches];
          res.data.data.forEach((item: SearchFoodItem) => {
            if (!merged.some(m => m.name.toLowerCase() === item.name.toLowerCase())) {
              merged.push(item);
            }
          });
          setIngResults(merged.slice(0, 25));
          setShowDropdown(merged.length > 0);
        } else {
          setIngResults(localMatches.slice(0, 25));
          setShowDropdown(localMatches.length > 0);
        }
      } catch (err) {
        console.error('Failed to search ingredients:', err);
        setIngResults(localMatches.slice(0, 25));
        setShowDropdown(localMatches.length > 0);
      } finally {
        setSearching(false);
      }
    };

    const delay = setTimeout(() => {
      searchIngredients();
    }, 150);

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
    setShowDropdown(false);
  };

  const handleAddManualIngredient = () => {
    if (!ingQuery.trim()) return;
    const validQty = typeof ingQty === 'number' && ingQty > 0 ? ingQty : 100;
    handleAddIngredient(ingQuery, validQty, ingUnit);
    setShowDropdown(false);
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
                <div className="md:col-span-6 relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search database or type ingredient"
                    value={ingQuery}
                    onFocus={() => {
                      if (ingResults.length > 0) setShowDropdown(true);
                    }}
                    onChange={(e) => {
                      setIngQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="cyber-input w-full"
                  />
                  
                  {/* Dropdown search matches */}
                  {showDropdown && ingResults.length > 0 && (
                    <div className="absolute top-[100%] left-0 w-full bg-bg-secondary border border-card-border rounded-xl mt-1.5 z-30 max-h-[220px] overflow-y-auto shadow-2xl text-sm">
                      <div className="flex justify-between items-center px-3 py-1.5 border-b border-card-border/60 bg-bg-primary/90 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <span>Database Ingredients</span>
                        <button
                          type="button"
                          onClick={() => setShowDropdown(false)}
                          className="text-text-secondary hover:text-white cursor-pointer px-1 py-0.5"
                        >
                          ✕ Close
                        </button>
                      </div>
                      {ingResults.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setIngQuery(item.name);
                            setIngQty(item.servingSize);
                            setShowDropdown(false);
                            setTimeout(() => {
                              qtyInputRef.current?.focus();
                              qtyInputRef.current?.select();
                            }, 50);
                          }}
                          className="p-2.5 hover:bg-bg-primary cursor-pointer border-b border-card-border/50 text-white flex justify-between items-center transition-colors"
                        >
                          <span className="font-bold">{item.name}</span>
                          <span className="text-[10px] font-mono text-accent-lime font-bold">Select ({item.servingSize}g)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Qty */}
                <div className="md:col-span-2">
                  <input
                    ref={qtyInputRef}
                    type="number"
                    min="1"
                    value={ingQty}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setIngQty('');
                      } else {
                        const parsed = parseInt(val, 10);
                        setIngQty(isNaN(parsed) ? '' : parsed);
                      }
                    }}
                    onBlur={() => {
                      if (ingQty === '' || ingQty <= 0) {
                        setIngQty(100);
                      }
                    }}
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
