import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem, Order, Settings } from '../types';
import { defaultMenuItems, defaultSettings, loadData, saveData } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

interface POSContextType {
  menuItems: MenuItem[];
  settings: Settings;
  orders: Order[];
  activeOrder: Order | null;
  
  // Actions
  setMenuItems: (items: MenuItem[]) => void;
  updateSettings: (settings: Settings) => void;
  
  startNewOrder: (customerName: string) => void;
  updateActiveOrder: (order: Order) => void;
  clearActiveOrder: () => void;
  
  confirmOrder: (order: Order) => void;
  completeOrder: (orderId: string) => void;
  updateOrderPaymentStatus: (orderId: string, status: 'PAID' | 'NOT_PAID') => void;
  editOrder: (order: Order) => void;
  loadOrderForEdit: (orderId: string) => void;
  undoCompleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  
  isLoaded: boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>([]);
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const loadedMenuItems = await loadData<MenuItem[]>('menuItems', defaultMenuItems);
      const loadedSettings = await loadData<Settings>('settings', defaultSettings);
      const loadedOrders = await loadData<Order[]>('orders', []);
      const loadedActiveOrder = await loadData<Order | null>('activeOrder', null);
      
      setMenuItemsState(loadedMenuItems);
      setSettingsState(loadedSettings);
      setOrdersState(loadedOrders);
      setActiveOrderState(loadedActiveOrder);
      setIsLoaded(true);
    };
    initData();
  }, []);

  const setMenuItems = (items: MenuItem[]) => {
    setMenuItemsState(items);
    saveData('menuItems', items);
  };

  const updateSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
    saveData('settings', newSettings);
  };

  const setOrders = (newOrders: Order[]) => {
    setOrdersState(newOrders);
    saveData('orders', newOrders);
  };

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    saveData('activeOrder', order);
  };

  const getNextSerialNumber = () => {
    if (orders.length === 0 && !activeOrder) return 1;
    let max = 0;
    orders.forEach(o => { if (o.serialNumber > max) max = o.serialNumber; });
    if (activeOrder && activeOrder.serialNumber > max) max = activeOrder.serialNumber;
    return max + 1;
  };

  const getOrderTimestamp = () => {
    const now = new Date();
    if (settings.businessDate) {
      const [y, m, d] = settings.businessDate.split('-').map(Number);
      return new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()).getTime();
    }
    return now.getTime();
  };

  const startNewOrder = (customerName: string) => {
    const newOrder: Order = {
      id: uuidv4(),
      serialNumber: getNextSerialNumber(),
      customerName,
      items: [],
      parcelChargeAtOrder: settings.parcelCharge,
      status: 'DRAFT',
      paymentStatus: 'NOT_PAID',
      createdAt: getOrderTimestamp(),
    };
    setActiveOrder(newOrder);
  };

  const updateActiveOrder = (order: Order) => {
    setActiveOrder(order);
  };

  const clearActiveOrder = () => {
    setActiveOrder(null);
  };

  const confirmOrder = (order: Order) => {
    const confirmedOrder: Order = { ...order, status: 'PENDING' };
    const existingIndex = orders.findIndex(o => o.id === order.id);
    let newOrders = [...orders];
    if (existingIndex >= 0) {
      newOrders[existingIndex] = confirmedOrder;
    } else {
      newOrders.push(confirmedOrder);
    }
    setOrders(newOrders);
    setActiveOrder(null);
  };

  const completeOrder = (orderId: string) => {
    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'SUCCESSFUL' as const, completedAt: Date.now() };
      }
      return o;
    });
    setOrders(newOrders);
  };

  const undoCompleteOrder = (orderId: string) => {
    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'PENDING' as const };
      }
      return o;
    });
    setOrders(newOrders);
  };

  const clearAllOrders = () => {
    setOrders([]);
    setActiveOrder(null);
  };

  const updateOrderPaymentStatus = (orderId: string, status: 'PAID' | 'NOT_PAID') => {
    const newOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, paymentStatus: status, paymentUpdatedAt: Date.now() };
      }
      return o;
    });
    setOrders(newOrders);
    
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder({ ...activeOrder, paymentStatus: status, paymentUpdatedAt: Date.now() });
    }
  };

  const editOrder = (order: Order) => {
    const newOrders = orders.map(o => o.id === order.id ? order : o);
    setOrders(newOrders);
  };

  const loadOrderForEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // Put it back to DRAFT or keep it PENDING? The requirements say:
      // "After editing, the order should remain in Pending Orders unless the user completes it."
      // But it needs to be the active order while editing.
      // We can just load it into activeOrder.
      setActiveOrder(order);
    }
  };

  return (
    <POSContext.Provider value={{
      menuItems,
      settings,
      orders,
      activeOrder,
      setMenuItems,
      updateSettings,
      startNewOrder,
      updateActiveOrder,
      clearActiveOrder,
      confirmOrder,
      completeOrder,
      updateOrderPaymentStatus,
      editOrder,
      loadOrderForEdit,
      undoCompleteOrder,
      clearAllOrders,
      isLoaded,
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
