// src/components/CalendarPopup.jsx
import React, { useState } from 'react';

export default function CalendarPopup({ isOpen, onClose, logs, targetCalories }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    if (!isOpen) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get list of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Calculate grid helpers
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl border border-gray-100 flex flex-col">
                
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h4 className="text-base font-bold text-gray-800">{monthNames[month]} {year}</h4>
                        <p className="text-[11px] text-gray-400">Daily calorie budgets remaining</p>
                    </div>
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg transition text-gray-600 font-bold text-xs px-2.5">&larr;</button>
                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg transition text-gray-600 font-bold text-xs px-2.5">&rarr;</button>
                    </div>
                </div>

                {/* Weekday Indicator Labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Main Calendar Matrix Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {/* Prefix Padding blanks */}
                    {blanksArray.map(blank => (
                        <div key={`blank-${blank}`} className="aspect-square bg-gray-50/40 rounded-xl" />
                    ))}

                    {/* Active Month Core Days */}
                    {daysArray.map(day => {
                        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayLogs = logs[dateString] || [];
                        const consumed = dayLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
                        const left = targetCalories - consumed;
                        const hasTracked = dayLogs.length > 0;

                        return (
                            <div 
                                key={`day-${day}`} 
                                className={`aspect-square p-1 rounded-xl flex flex-col justify-between border ${
                                    hasTracked ? 'bg-indigo-50/40 border-indigo-100' : 'bg-gray-50/60 border-gray-100'
                                }`}
                            >
                                <span className="text-xs font-bold text-gray-700">{day}</span>
                                <span className={`text-[8px] font-bold tracking-tighter truncate block ${
                                    left < 0 ? 'text-rose-500' : left === targetCalories ? 'text-gray-400' : 'text-emerald-600'
                                }`}>
                                    {left < 0 ? `${left}` : `+${left}`}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Modal Actions */}
                <button 
                    onClick={onClose}
                    className="mt-5 w-full py-2.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                    Close Calendar View
                </button>
            </div>
        </div>
    );
}