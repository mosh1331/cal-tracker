// src/components/Analytics.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CalendarPopup from './CalenderPopup';

export default function Analytics() {
    const { logs, profile } = useApp();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    const [weekStartAnchor, setWeekStartAnchor] = useState(() => {
        return localStorage.getItem('cal_week_start_anchor') || null;
    });

    const targetCalories = profile?.customTarget || profile?.tdee || 2000;
    const bmrBaseline = profile?.bmr || 0;

    const getTrackingWeekDays = () => {
        const trackingDays = [];
        if (weekStartAnchor) {
            const baseDate = new Date(weekStartAnchor);
            for (let i = 0; i < 7; i++) {
                const d = new Date(baseDate);
                d.setDate(baseDate.getDate() + i);
                trackingDays.push(d.toISOString().split('T')[0]);
            }
        } else {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                trackingDays.push(d.toISOString().split('T')[0]);
            }
        }
        return trackingDays;
    };

    const internalDays = getTrackingWeekDays();

    // --- UPDATED LOGIC HERE ---
    // Only calculate dynamic stats for days that have at least one log entry
    let totalDeficit = 0;
    internalDays.forEach(date => {
        const dailyLogs = logs[date] || [];
        
        // Guard Clause: Only process days that actually have tracking data
        if (dailyLogs.length > 0) {
            const consumed = dailyLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
            const deficit = bmrBaseline - consumed;

            if (deficit > 0) {
                totalDeficit += deficit;
            }
        }
    });

    const progressPercent = Math.min((totalDeficit / 7700) * 100, 100);

    const handleResetWeekAnchor = () => {
        const confirmReset = window.confirm(
            "Are you sure you want to reset the weekly metrics view? This aligns 'Today' as Day 1 of your visual dashboard and recalculates weekly summaries without removing past entries."
        );
        
        if (confirmReset) {
            const todayStr = new Date().toISOString().split('T')[0];
            localStorage.setItem('cal_week_start_anchor', todayStr);
            setWeekStartAnchor(todayStr);
        }
    };

    const handleClearResetAnchor = () => {
        localStorage.removeItem('cal_week_start_anchor');
        setWeekStartAnchor(null);
    };

    return (
        <div className="space-y-4 max-w-md mx-auto">
            {/* Fat Loss Hero Panel */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm text-center relative overflow-hidden">
                <div className="flex w-full justify-center items-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-indigo-500 transition-all duration-500 ease-out" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-gray-100">{Math.round(progressPercent)}%</span>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">
                    Cals need to burn 1kg FAT (Active Tracking Days)
                </span>
                <h2 className="text-5xl font-black tracking-tight">
                    {totalDeficit} / 7700 kcal
                </h2>
            </div>

            {/* Functional Menu Utility Buttons */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsCalendarOpen(true)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold p-2.5 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                    📅 View Calendar Budgets
                </button>
                
                <button 
                    onClick={handleResetWeekAnchor}
                    className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold p-2.5 rounded-xl hover:bg-indigo-100 transition shadow-sm"
                >
                    🔄 Reset Week
                </button>

                {weekStartAnchor && (
                    <button 
                        onClick={handleClearResetAnchor}
                        className="bg-gray-50 border border-gray-200 text-gray-400 text-xs font-semibold px-2.5 rounded-xl hover:bg-gray-100 transition"
                        title="Revert back to standard rolling days view"
                    >
                        ✕ Clear Anchor
                    </button>
                )}
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
                        Active Weekly Deficit
                    </span>
                    <span className="text-xl font-black text-indigo-600">
                        {totalDeficit.toLocaleString()} <span className="text-xs font-normal text-gray-400">kcal</span>
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                        Net energy shortage accumulated across days containing meal data.
                    </p>
                </div>
            </div>

            {/* 7-Day History Card Stack */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-800">
                        {weekStartAnchor ? "Anchored Week Activity Matrix" : "Recent 7-Day Activity Matrix"}
                    </h3>
                    {weekStartAnchor && (
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium mt-0.5 inline-block">
                            Cycle started on: {new Date(weekStartAnchor).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                </div>
                
                <div className="space-y-2.5">
                    {internalDays.map(date => {
                        const dayLogs = logs[date] || [];
                        const consumed = dayLogs.reduce((sum, item) => sum + item.calories, 0);
                        const percent = Math.min((consumed / targetCalories) * 100, 100);

                        const readableDate = new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

                        return (
                            <div key={date} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-medium text-gray-600">
                                    <span>{readableDate}</span>
                                    {dayLogs.length > 0 ? (
                                        <span className={`text-[8px] font-bold ${bmrBaseline - consumed >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {bmrBaseline - consumed >= 0 ? `+${bmrBaseline - consumed}` : `${bmrBaseline - consumed}`} Deficit
                                        </span>
                                    ) : (
                                        <span className="text-[8px] font-semibold text-gray-400 italic">
                                            No Entries
                                        </span>
                                    )}
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

            <CalendarPopup 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
                logs={logs} 
                targetCalories={targetCalories} 
            />
        </div>
    );
}