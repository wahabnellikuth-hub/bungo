import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export const MenuSection: React.FC = () => {
  const { menuItems, setMenuItems, activeOrder, updateActiveOrder, settings } = usePOS();
  const [lockMode, setLockMode] = useState(false);

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (lockMode) {
      // Toggle lock status
      const updated = menuItems.map(m => m.id === item.id ? { ...m, isLocked: !m.isLocked } : m);
      setMenuItems(updated);
      return;
    }

    if (!activeOrder) return; // Cannot order without customer
    
    // Only allow adding if not locked
    if (item.isLocked) return;

    // Check if item already in order, if not add it with qty 1
    const existingItem = activeOrder.items.find(i => i.menuItemId === item.id);
    if (!existingItem) {
      const newItem = {
        menuItemId: item.id,
        name: item.name,
        priceAtOrder: item.price,
        quantity: 1,
        parcelQuantity: 0,
      };
      updateActiveOrder({
        ...activeOrder,
        items: [...activeOrder.items, newItem]
      });
    } else {
      // If already added, do nothing here. The quantity counter handles the rest.
      // We could also optionally increment quantity here, but requirement 6 says:
      // "When the user clicks a menu item, immediately open a quantity counter for that item."
      // Since all selected items show their counter in the CurrentOrder component,
      // adding it to the list with qty=1 is correct. If it's already there, just let them use the counter.
    }
  };

  return (
    <section className="mb-6 bg-stone-900 p-4 lg:p-6 rounded-2xl shadow-sm border border-stone-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-stone-200">Available Items</h2>
        <button 
          onClick={() => setLockMode(!lockMode)}
          className={clsx(
            "p-2 rounded-lg transition-colors flex items-center space-x-2",
            lockMode ? "bg-amber-900/50 text-amber-400 font-bold" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          )}
        >
          {lockMode ? <Lock size={20} /> : <Unlock size={20} />}
          {lockMode && <span>Lock Mode ON</span>}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {menuItems.map(item => {
          const isDisabled = !lockMode && (!activeOrder || item.isLocked);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={isDisabled && !lockMode}
              className={clsx(
                "relative flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-200 min-h-[100px]",
                lockMode ? "border-2 border-dashed border-amber-600 hover:bg-amber-900/20 cursor-pointer" :
                isDisabled ? "opacity-50 cursor-not-allowed bg-stone-800 text-stone-500 border border-stone-700" : 
                "bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700 hover:border-stone-600 shadow-sm active:scale-95"
              )}
            >
              <span className="font-bold text-lg leading-tight mb-1">{item.name}</span>
              <span className={clsx("font-medium", isDisabled && !lockMode ? "text-stone-500" : "text-amber-400")}>₹{item.price}</span>
              
              {item.isLocked && (
                <div className="absolute top-2 right-2 text-stone-500">
                  <Lock size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {!activeOrder && !lockMode && (
        <div className="mt-4 text-center text-stone-500 font-medium">
          Please add a customer to start ordering.
        </div>
      )}
    </section>
  );
};
