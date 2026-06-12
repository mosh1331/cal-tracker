// src/components/Dashboard.jsx
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard({ selectedDate }) {
  const { profile, logs, deleteLog } = useApp();
  
  const dailyLogs = logs[selectedDate] || [];
  const targetCalories = profile?.customTarget || profile?.tdee || 2000;
  
  const consumedCalories = dailyLogs.reduce((sum, item) => sum + item.calories, 0);
  const remainingCalories = targetCalories - consumedCalories;
  
  const totals = dailyLogs.reduce((acc, curr) => {
    acc.p += curr.protein || 0;
    acc.c += curr.carbs || 0;
    acc.f += curr.fat || 0;
    return acc;
  }, { p: 0, c: 0, f: 0 });

  const progressPercent = Math.min((consumedCalories / targetCalories) * 100, 100);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Target Progress Panel */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Energy Balance</span>
          <h2 className="text-3xl font-black text-black" style={{color:'red'}}>{consumedCalories} <span className="text-sm font-normal text-gray-400">/ {targetCalories} kcal</span></h2>
          <p className={`text-xs font-medium ${remainingCalories >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {remainingCalories >= 0 ? `${remainingCalories} kcal left under limit` : `${Math.abs(remainingCalories)} kcal limit deficit crossed`}
          </p>
        </div>
        
        {/* Simple Progress Ring Circle */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-indigo-600 transition-all duration-500 ease-out" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span className="absolute text-[11px] font-bold text-gray-700">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Macronutrient Tracking Strips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100/50">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Protein</span>
          <span className="text-base font-bold text-gray-800">{totals.p.toFixed(1)}g</span>
        </div>
        <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100/50">
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Carbs</span>
          <span className="text-base font-bold text-gray-800">{totals.c.toFixed(1)}g</span>
        </div>
        <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100/50">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Fats</span>
          <span className="text-base font-bold text-gray-800">{totals.f.toFixed(1)}g</span>
        </div>
      </div>

      {/* Streamlined Food Journal Records */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Today's Food Journal</h3>
        {dailyLogs.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No structural macro items logged today.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {dailyLogs.map(item => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-gray-800 block">{item.name}</span>
                  <span className="text-[10px] text-gray-400">P:{item.protein}g | C:{item.carbs}g | F:{item.fat}g • {item.timestamp}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">{item.calories} kcal</span>
                  <button onClick={() => deleteLog(selectedDate, item.id)} className="text-rose-500 font-semibold p-1 text-[11px] hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}