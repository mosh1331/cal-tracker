// src/utils/calculations.js

export const calculateBMR = (weight, height, age, gender) => {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseInt(age);

  if (!w || !h || !a) return 0;

  if (gender === 'male') {
    return 10 * w + 6.25 * h - 5 * a + 5;
  } else {
    return 10 * w + 6.25 * h - 5 * a - 161;
  }
};

export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

export const calculateCumulativeFatLoss = (logs, profile) => {
  if (!profile || !logs) return 0;
  
  let totalDeficit = 0;
  const dates = Object.keys(logs);

  dates.forEach(date => {
    const dailyLogs = logs[date] || [];
    const consumed = dailyLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
    
    // Use custom target if set, otherwise fallback to calculated TDEE
    const target = profile.customTarget || profile.tdee || 2000;
    const deficit = target - consumed;
    
    if (deficit > 0) {
      totalDeficit += deficit;
    }
  });

  // 7700 calories roughly equals 1kg of fat loss
  const fatLossKg = totalDeficit / 7700;
  return parseFloat(fatLossKg.toFixed(2));
};