// src/components/Analytics.jsx
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { logs, profile } = useApp();
  
  const targetCalories = profile?.customTarget || profile?.tdee || 2000;
  const bmrBaseline = profile?.bmr || 0;

  // Calculate cumulative stats across all logged history
  let totalDeficit = 0;
  Object.keys(logs).forEach(date => {
    const dailyLogs = logs[date] || [];
    const consumed = dailyLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
    const deficit = targetCalories - consumed;
    
    // Only accumulate positive deficits (days you ate under your target)
    if (deficit > 0) {
      totalDeficit += deficit;
    }
  });

  // 7,700 kcal deficit roughly translates to 1kg of pure body fat oxidized
  const totalFatLoss = (totalDeficit / 7700).toFixed(2);

  // Process last 7 calendar structural tracking segments
  const getLast7Days = () => {
    const trackingDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const stringDate = d.toISOString().split('T')[0];
      trackingDays.push(stringDate);
    }
    return trackingDays;
  };

  const internalDays = getLast7Days();

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Fat Loss Hero Panel */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm text-center">
        <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">
          Total Fat Oxidized
        </span>
        <h2 className="text-5xl font-black tracking-tight">
          {totalFatLoss} <span className="text-xl font-medium text-indigo-300">kg</span>
        </h2>
        <p className="text-xs text-indigo-200 mt-2 max-w-xs mx-auto">
          Estimated systemic lipid tissue burned based on your historical tracking data.
        </p>
      </div>

      {/* Baseline & Deficit Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            BMR Baseline
          </span>
          <span className="text-xl font-black text-gray-800">
            {bmrBaseline} <span className="text-xs font-normal text-gray-400">kcal</span>
          </span>
          <p className="text-[10px] text-gray-400 mt-1 leading-tight">
            Energy required just to stay alive at complete rest.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Deficit
          </span>
          <span className="text-xl font-black text-indigo-600">
            {totalDeficit.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
          </span>
          <p className="text-[10px] text-gray-400 mt-1 leading-tight">
            Net energy shortage accumulated over time.
          </p>
        </div>
      </div>

      {/* 7-Day History Card Stack */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Recent 7-Day Activity Matrix</h3>
        <div className="space-y-2.5">
          {internalDays.map(date => {
            const dayLogs = logs[date] || [];
            const consumed = dayLogs.reduce((sum, item) => sum + item.calories, 0);
            const percent = Math.min((consumed / targetCalories) * 100, 100);
            
            const readableDate = new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={date} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-600">
                  <span>{readableDate}</span>
                  <span className="font-bold text-gray-800">{consumed} / {targetCalories} kcal</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${consumed > targetCalories ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${percent || 1}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}