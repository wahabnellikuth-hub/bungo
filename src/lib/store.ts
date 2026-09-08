import localforage from 'localforage';
import { MenuItem, Order, Settings } from '../types';

localforage.config({
  name: 'BungoPOS',
  storeName: 'pos_data'
});

export const defaultMenuItems: MenuItem[] = [
  { id: '1', name: 'Choco-Crumble', price: 89, isLocked: false },
  { id: '2', name: 'Chocolate Brownie', price: 99, isLocked: false },
  { id: '3', name: 'Nutella Bun', price: 109, isLocked: false },
  { id: '4', name: 'Dark Choco Bun', price: 119, isLocked: false },
];

export const defaultSettings: Settings = {
  parcelCharge: 10,
  businessDate: '',
};

export const loadData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const value = await localforage.getItem<T>(key);
    return value !== null ? value : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key}`, err);
    return defaultValue;
  }
};

export const saveData = async <T>(key: string, value: T): Promise<void> => {
  try {
    await localforage.setItem(key, value);
  } catch (err) {
    console.error(`Error saving ${key}`, err);
  }
};
