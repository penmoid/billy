// src/utils/numberUtils.js

export const formatNumber = (number) => {
  return Number(number).toLocaleString('en-US');
};

export const formatCurrency = (number) => {
  if (isNaN(number)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0, // No decimal places
    maximumFractionDigits: 0  // No decimal places
  }).format(number);
};
