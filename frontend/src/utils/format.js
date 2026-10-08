/**
 * Localization and Currency Formatting Utilities for India (INR)
 * E-Commerce Website - Online Shopping Management System
 */

export function formatPrice(amount) {
  const num = Number(amount) || 0;
  const isFractional = Math.abs(num - Math.round(num)) > 0.001;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: isFractional ? 2 : 0,
    maximumFractionDigits: 2
  });
}

export function formatINR(amount) {
  return formatPrice(amount);
}

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh'
];
