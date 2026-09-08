import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Settings } from '../types';
import { Plus, Trash2, Edit2, Check, X, Lock, Unlock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, menuItems, setMenuItems } = usePOS();
  
  const [parcelChargeInput, setParcelChargeInput] = useState(settings.parcelCharge.toString());
  const [businessDateInput, setBusinessDateInput] = useState(settings.businessDate || '');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  
  const handleSaveSettings = () => {
    const parsed = parseFloat(parcelChargeInput);
    if (!isNaN(parsed) && parsed >= 0) {
      updateSettings({ ...settings, parcelCharge: parsed, businessDate: businessDateInput });
    }
  };

  const startEdit = (id: string, name: string, price: number) => {
    setEditingItemId(id);
    setEditItemName(name);
    setEditItemPrice(price.toString());
  };

  const saveEdit = (id: string) => {
    const price = parseFloat(editItemPrice);
    if (!editItemName.trim() || isNaN(price) || price < 0) return;

    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, name: editItemName.trim(), price } : item
    ));
    setEditingItemId(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const addNewItem = () => {
    const newItem = {
      id: uuidv4(),
      name: 'New Item',
      price: 0,
      isLocked: false
    };
    setMenuItems([...menuItems, newItem]);
    startEdit(newItem.id, newItem.name, newItem.price);
  };

  const toggleLock = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isLocked: !item.isLocked } : item
    ));
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Menu Management */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Menu Items</h3>
          <button 
            onClick={addNewItem}
            className="flex items-center text-sm bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/70 border border-transparent dark:border-amber-900/50 px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            <Plus size={16} className="mr-1" /> Add Item
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map(item => (
            <div key={item.id} className="bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between transition-colors">
              
              {editingItemId === item.id ? (
                <div className="flex-1 flex flex-col space-y-2">
                  <input 
                    type="text" 
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="px-2 py-1 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 rounded focus:outline-none focus:border-amber-500"
                    placeholder="Name"
                  />
                  <div className="flex space-x-2">
                    <input 
                      type="number" 
                      value={editItemPrice}
                      onChange={(e) => setEditItemPrice(e.target.value)}
                      className="w-20 px-2 py-1 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 rounded focus:outline-none focus:border-amber-500"
                      placeholder="Price"
                      min="0"
                    />
                    <button onClick={() => saveEdit(item.id)} className="p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50"><Check size={18}/></button>
                    <button onClick={cancelEdit} className="p-1 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded hover:bg-stone-300 dark:hover:bg-stone-700"><X size={18}/></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-bold text-stone-800 dark:text-stone-300 flex items-center">
                      {item.name}
                      {item.isLocked && <Lock size={14} className="ml-2 text-stone-400 dark:text-stone-500" />}
                    </div>
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-500">₹{item.price}</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => toggleLock(item.id)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                      title={item.isLocked ? "Unlock item" : "Lock item"}
                    >
                      {item.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button 
                      onClick={() => startEdit(item.id, item.name, item.price)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                      title="Edit item"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}
          {menuItems.length === 0 && (
            <div className="text-center text-stone-500 py-4 text-sm font-medium">No menu items found.</div>
          )}
        </div>
      </section>

      {/* General Settings (Date and Parcel) */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">Other Settings</h3>
          <button 
            onClick={handleSaveSettings}
            className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 transition-colors">
          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-1">Business Date Override</label>
            <input 
              type="date" 
              value={businessDateInput}
              onChange={(e) => setBusinessDateInput(e.target.value)}
              className="w-full max-w-[180px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500/50"
            />
            <p className="text-xs text-stone-500 mt-2">Leave empty to update based on system clock automatically.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-1">Parcel Charge (₹)</label>
            <input 
              type="number" 
              value={parcelChargeInput}
              onChange={(e) => setParcelChargeInput(e.target.value)}
              className="w-full max-w-[120px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500/50"
              min="0"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
