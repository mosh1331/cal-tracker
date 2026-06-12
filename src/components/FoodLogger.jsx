// src/components/FoodLogger.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FoodLogger({ selectedDate }) {
  const { dictionary, logFood } = useApp();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredDictionary = dictionary.filter(item =>
    item.name.toLowerCase().includes(name.toLowerCase())
  );

  const handleSelectFromDict = (item) => {
    setName(item.name);
    setCalories(item.calories);
    setProtein(item.protein);
    setCarbs(item.carbs);
    setFat(item.fat);
    setShowDropdown(false);
  };

  const triggerMockAiEstimation = async () => {
    if (!name) return alert('Enter a food name first for AI calibration');
    setIsAiLoading(true);
    
    // Simulating sandbox LLM operational latency
    await new Promise(resolve => setTimeout(resolve, 900));

    const standardDictionary = {
      'chicken': { c: 165, p: 31, ch: 0, f: 3.6 },
      'egg': { c: 70, p: 6, ch: 0.5, f: 5 },
      'rice': { c: 130, p: 2.5, ch: 28, f: 0.3 },
      'bun': { c: 280, p: 7, ch: 48, f: 6 },
      'milk': { c: 60, p: 3.2, ch: 4.8, f: 3.25 },
      'banana': { c: 89, p: 1.1, ch: 23, f: 0.3 }
    };

    const key = Object.keys(standardDictionary).find(k => name.toLowerCase().includes(k));
    if (key) {
      const match = standardDictionary[key];
      setCalories(match.c);
      setProtein(match.p);
      setCarbs(match.ch);
      setFat(match.f);
    } else {
      // Procedural numeric generation fallback if item isn't index matched
      setCalories(Math.floor(Math.random() * 250) + 100);
      setProtein(Math.floor(Math.random() * 15) + 2);
      setCarbs(Math.floor(Math.random() * 35) + 5);
      setFat(Math.floor(Math.random() * 10) + 1);
    }
    setIsAiLoading(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !calories) return;
    
    logFood(selectedDate, {
      name,
      calories: parseInt(calories),
      protein: protein ? parseFloat(protein) : 0,
      carbs: carbs ? parseFloat(carbs) : 0,
      fat: fat ? parseFloat(fat) : 0
    });

    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Track Meal</h3>
      <form onSubmit={handleSave} className="space-y-3">
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Item Description</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text" required placeholder="e.g., Grilled Chicken Breast" value={name}
                onChange={(e) => { setName(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
              {showDropdown && name && filteredDictionary.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {filteredDictionary.map((item, idx) => (
                    <button
                      key={idx} type="button" onClick={() => handleSelectFromDict(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs border-b last:border-b-0 border-gray-100 block"
                    >
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="text-gray-400 block">{item.calories} kcal | P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button" onClick={triggerMockAiEstimation} disabled={isAiLoading}
              className="px-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 font-semibold text-xs tracking-wide hover:bg-indigo-100 transition-all"
            >
              {isAiLoading ? 'Estimating...' : '✨ AI Assist'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Kcal</label>
            <input
              type="number" required value={calories} onChange={(e) => setCalories(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Protein</label>
            <input
              type="number" step="0.1" placeholder="g" value={protein} onChange={(e) => setProtein(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Carbs</label>
            <input
              type="number" step="0.1" placeholder="g" value={carbs} onChange={(e) => setCarbs(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Fat</label>
            <input
              type="number" step="0.1" placeholder="g" value={fat} onChange={(e) => setFat(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white font-medium p-3 rounded-xl text-sm hover:bg-indigo-700 transition-all shadow-sm">
          Log Entry
        </button>
      </form>
    </div>
  );
}