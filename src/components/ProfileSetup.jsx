// src/components/ProfileSetup.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfileSetup({ onSaveSuccess }) {
  const { profile, updateProfile } = useApp();
  const [formData, setFormData] = useState({
    weight: profile?.weight || '',
    height: profile?.height || '',
    age: profile?.age || '',
    gender: profile?.gender || 'male',
    activityLevel: profile?.activityLevel || 'sedentary',
    customTarget: profile?.customTarget || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      age: parseInt(formData.age),
      customTarget: formData.customTarget ? parseInt(formData.customTarget) : null
    });
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm max-w-md mx-auto border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Body Profile Metrics</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gender</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-2 px-4 rounded-xl font-medium border text-sm transition-all ${formData.gender === 'male' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-600'}`}
              onClick={() => setFormData({ ...formData, gender: 'male' })}
            >
              Male
            </button>
            <button
              type="button"
              className={`py-2 px-4 rounded-xl font-medium border text-sm transition-all ${formData.gender === 'female' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-600'}`}
              onClick={() => setFormData({ ...formData, gender: 'female' })}
            >
              Female
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Weight (kg)</label>
            <input
              type="number" required step="0.1" value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Height (cm)</label>
            <input
              type="number" required value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Age</label>
            <input
              type="number" required value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Activity Tier</label>
          <select
            value={formData.activityLevel}
            onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="sedentary">Sedentary (Desk work)</option>
            <option value="light">Light Activity (1-3 days/week)</option>
            <option value="moderate">Moderate Activity (3-5 days/week)</option>
            <option value="active">High Active (6-7 days/week)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Custom Target Calories (Optional)</label>
          <input
            type="number" placeholder="Defaults to TDEE baseline" value={formData.customTarget}
            onChange={(e) => setFormData({ ...formData, customTarget: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button type="submit" className="w-full bg-gray-900 text-white font-medium p-3.5 rounded-xl text-sm transition-all shadow-sm hover:bg-gray-800">
          Save Metric Profile
        </button>
      </form>
    </div>
  );
}