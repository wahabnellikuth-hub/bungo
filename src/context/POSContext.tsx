import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem, Order, Settings } from '../types';
import { defaultMenuItems, defaultSettings, loadData, saveData } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';
import { collection, doc, setDoc, onSnapshot, writeBatch, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const isLoaded = menuLoaded && settingsLoaded && ordersLoaded;

  useEffect(() => {
    // Load local active order first (kept local to device)
    loadData<Order | null>('activeOrder', null).then(loadedActiveOrder => {
      setActiveOrderState(loadedActiveOrder);
    });

    // Subscribe to Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'appData', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<Settings>;
        setSettingsState({ ...defaultSettings, ...data });
      } else {
        setSettingsState(defaultSettings);
        setDoc(doc(db, 'appData', 'settings'), defaultSettings);
      }
      setSettingsLoaded(true);
    });

    // Subscribe to Menu Items
    const unsubscribeMenu = onSnapshot(doc(db, 'appData', 'menuItems'), (docSnap) => {
      if (docSnap.exists()) {
        setMenuItemsState(docSnap.data().items as MenuItem[]);
      } else {
        setMenuItemsState(defaultMenuItems);
        setDoc(doc(db, 'appData', 'menuItems'), { items: defaultMenuItems });
      }
      setMenuLoaded(true);
    });

    // Subscribe to Orders (Optimized to load only recent orders for faster startup)
    const ordersQuery = query(
      collection(db, 'orders'), 
      orderBy('createdAt', 'desc'), 
      limit(150)
    );
    
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const loadedOrders: Order[] = [];
      snapshot.forEach(doc => loadedOrders.push(doc.data() as Order));
      loadedOrders.sort((a, b) => a.serialNumber - b.serialNumber);
      setOrdersState(loadedOrders);
      setOrdersLoaded(true);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, []);

  const setMenuItems = (items: MenuItem[]) => {
    setDoc(doc(db, 'appData', 'menuItems'), { items });
  };

  const updateSettings = (newSettings: Settings) => {
    setDoc(doc(db, 'appData', 'settings'), newSettings);
  };

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    saveData('activeOrder', order); // Keep active order local
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
    setDoc(doc(db, 'orders', order.id), confirmedOrder);
    setActiveOrder(null);
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDoc(doc(db, 'orders', orderId), { ...order, status: 'SUCCESSFUL', completedAt: Date.now() }, { merge: true });
    }
  };

  const undoCompleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDoc(doc(db, 'orders', orderId), { ...order, status: 'PENDING' }, { merge: true });
    }
  };

  const clearAllOrders = async () => {
    const batch = writeBatch(db);
    orders.forEach(order => {
      batch.delete(doc(db, 'orders', order.id));
    });
    await batch.commit();
    setActiveOrder(null);
  };

  const updateOrderPaymentStatus = (orderId: string, status: 'PAID' | 'NOT_PAID') => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDoc(doc(db, 'orders', orderId), { ...order, paymentStatus: status, paymentUpdatedAt: Date.now() }, { merge: true });
    }
    
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder({ ...activeOrder, paymentStatus: status, paymentUpdatedAt: Date.now() });
    }
  };

  const editOrder = (order: Order) => {
    setDoc(doc(db, 'orders', order.id), order);
  };

  const loadOrderForEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
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

