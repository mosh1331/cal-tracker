// src/App.jsx
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import FoodLogger from './components/FoodLogger';
import Analytics from './components/Analytics';
import ProfileSetup from './components/ProfileSetup';

function AppContent() {
  const { profile } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Enforce profile setup configuration route if data structure does not exist
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-10 px-4 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Calorie Sandbox PWA</h1>
          <p className="text-xs text-gray-500 mt-1">Configure metabolic values to unlock operational tracking.</p>
        </div>
        <ProfileSetup onSaveSuccess={() => setActiveTab('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-800 pb-24">
      {/* App Header Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-black tracking-tight text-gray-900 uppercase">CalTracker PWA</h1>
        <input 
          type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-100 p-1.5 rounded-lg text-xs font-bold focus:outline-none text-gray-700"
        />
      </header>

      {/* Workspace Display Routing Matrix */}
      <main className="max-w-md mx-auto p-4 transition-all">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <Dashboard selectedDate={selectedDate} />
            <FoodLogger selectedDate={selectedDate} />
          </div>
        )}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'profile' && (
          <ProfileSetup onSaveSuccess={() => alert('Metrics calibrated successfully')} />
        )}
      </main>

      {/* Fixed Mobile Nav Bar Viewport */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2.5 px-6 flex justify-around items-center z-30 shadow-xl max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold tracking-wide transition-all ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold tracking-wide transition-all ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span>🔥</span>
          <span>Analytics</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold tracking-wide transition-all ${activeTab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <span>👤</span>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}