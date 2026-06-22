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

    // --- New States for the Adjustment Popup Modal ---
    const [showModal, setShowModal] = useState(false);
    const [modalWeight, setModalWeight] = useState('');
    const [baseNutrition, setBaseNutrition] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        weight: 0
    });

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

    const triggerAiEstimation = async () => {
        if (!name) return alert('Enter a food item description first.');
        setIsAiLoading(true);

        const apiKey = import.meta.env.VITE_CALORIE_NINJA_API_KEY;

        if (!apiKey) {
            alert('API Key error: VITE_CALORIE_NINJA_API_KEY is missing from your .env file.');
            setIsAiLoading(false);
            return;
        }

        try {
            const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Calorie Ninja HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Calorie Ninja API response:', data);

            if (!data.items || data.items.length === 0) {
                alert('Could not resolve nutritional data for that description. Try specifying quantities (e.g., "100g rice").');
                setIsAiLoading(false);
                return;
            }

            // Accumulate baseline metrics AND baseline weights from the API response
            const calculatedNutrition = data.items.reduce((totals, item) => {
                totals.calories += item.calories || 0;
                totals.protein += item.protein_g || 0;
                totals.carbs += item.carbohydrates_total_g || 0;
                totals.fat += item.fat_total_g || 0;
                totals.weight += item.serving_size_g || 0; 
                return totals;
            }, { calories: 0, protein: 0, carbs: 0, fat: 0, weight: 0 });

            // Store baseline calculations and open adjustment modal
            setBaseNutrition(calculatedNutrition);
            setModalWeight(Math.round(calculatedNutrition.weight).toString());
            setShowModal(true);

        } catch (error) {
            console.error('Calorie Ninja API integration error:', error);
            alert('Failed to connect to the nutritional engine. Please double-check your connection or enter macros manually.');
        } finally {
            setIsAiLoading(false);
        }
    };

    // Calculate dynamic values for modal preview on-the-fly
    const targetWeight = parseFloat(modalWeight) || 0;
    const scaleFactor = baseNutrition.weight > 0 ? targetWeight / baseNutrition.weight : 0;

    const liveCalories = Math.round(baseNutrition.calories * scaleFactor);
    const liveProtein = parseFloat((baseNutrition.protein * scaleFactor).toFixed(1));
    const liveCarbs = parseFloat((baseNutrition.carbs * scaleFactor).toFixed(1));
    const liveFat = parseFloat((baseNutrition.fat * scaleFactor).toFixed(1));

    const handleAcceptAiData = () => {
        setCalories(liveCalories.toString());
        setProtein(liveProtein.toString());
        setCarbs(liveCarbs.toString());
        setFat(liveFat.toString());
        setShowModal(false);
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
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto relative">
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
                            type="button" onClick={triggerAiEstimation} disabled={isAiLoading}
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

            {/* --- Portion Adjustment Popup Modal --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 transform transition-all scale-100">
                        <div className="mb-4">
                            <h4 className="text-base font-bold text-gray-800">Adjust Consumed Amount</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Scale macros based on actual weight consumed.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Grams Eaten (g)</label>
                                <input
                                    type="number"
                                    value={modalWeight}
                                    onChange={(e) => setModalWeight(e.target.value)}
                                    placeholder="e.g., 150"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                                />
                            </div>

                            {/* Live Recalculation Metrics Box */}
                            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/60 grid grid-cols-4 gap-2 text-center">
                                <div>
                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase">Kcal</span>
                                    <span className="text-sm font-bold text-indigo-900">{liveCalories}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase">Prot</span>
                                    <span className="text-sm font-bold text-indigo-900">{liveProtein}g</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase">Carb</span>
                                    <span className="text-sm font-bold text-indigo-900">{liveCarbs}g</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-indigo-400 uppercase">Fat</span>
                                    <span className="text-sm font-bold text-indigo-900">{liveFat}g</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptAiData}
                                className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}