// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateBMR, calculateTDEE } from '../utils/calculations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cal_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('cal_food_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [dictionary, setDictionary] = useState(() => {
    const saved = localStorage.getItem('cal_food_dictionary');
    return saved ? JSON.parse(saved) : [
      { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Whole Egg', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
      { name: 'White Rice (100g cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      { name: 'Sweet Milk Bun', calories: 280, protein: 7, carbs: 48, fat: 6 }
    ];
  });

  useEffect(() => {
    if (profile) localStorage.setItem('cal_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cal_food_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('cal_food_dictionary', JSON.stringify(dictionary));
  }, [dictionary]);

  const updateProfile = (data) => {
    const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    setProfile({ ...data, bmr, tdee, customTarget: data.customTarget || tdee });
  };

  const logFood = (date, foodItem) => {
    const updatedLogs = { ...logs };
    if (!updatedLogs[date]) updatedLogs[date] = [];
    
    const newLogItem = {
      id: Date.now().toString(),
      ...foodItem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updatedLogs[date] = [...updatedLogs[date], newLogItem];
    setLogs(updatedLogs);

    // Save to library dictionary if unique
    const exists = dictionary.some(item => item.name.toLowerCase() === foodItem.name.toLowerCase());
    if (!exists) {
      setDictionary(prev => [...prev, {
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat
      }]);
    }
  };

  const deleteLog = (date, id) => {
    const updatedLogs = { ...logs };
    if (updatedLogs[date]) {
      updatedLogs[date] = updatedLogs[date].filter(item => item.id !== id);
      if (updatedLogs[date].length === 0) delete updatedLogs[date];
      setLogs(updatedLogs);
    }
  };

  return (
    <AppContext.Provider value={{ profile, logs, dictionary, updateProfile, logFood, deleteLog }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);