import React from 'react';
import { OrderItem } from '../types';
import { Minus, Plus, Box } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  item: OrderItem;
  onChangeQuantity: (qty: number) => void;
  onChangeParcelQuantity: (parcelQty: number) => void;
  parcelCharge: number;
  readonly?: boolean;
}

export const QuantityCounter: React.FC<Props> = ({ 
  item, 
  onChangeQuantity, 
  onChangeParcelQuantity,
  parcelCharge,
  readonly = false
}) => {
  const subtotal = item.quantity * item.priceAtOrder;
  const isParcel = item.parcelQuantity > 0;
  const hasAny = isParcel;

  return (
    <div className={clsx(
      "flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 rounded-xl border transition-colors",
      hasAny ? "bg-amber-50 dark:bg-stone-800 border-amber-200 dark:border-stone-700" : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
    )}>
      
      <div className="flex-1 w-full mb-3 sm:mb-0">
        <div className="font-bold text-lg text-stone-800 dark:text-stone-200">{item.name}</div>
        <div className="text-amber-700 dark:text-amber-400 font-medium">₹{item.priceAtOrder}</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg text-stone-800 dark:text-stone-200">₹{subtotal}</div>
      </div>

      {!readonly && (
        <div className="flex items-center justify-between mt-2">
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-4 bg-stone-100 dark:bg-stone-900 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
            <button 
              onClick={() => onChangeQuantity(Math.max(0, item.quantity - 1))}
              disabled={item.quantity === 0}
              className="p-2 sm:p-3 rounded-md bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <Minus size={20} />
            </button>
            <div className="w-8 text-center font-bold text-xl text-stone-800 dark:text-stone-200">
              {item.quantity}
            </div>
            <button 
              onClick={() => onChangeQuantity(item.quantity + 1)}
              className="p-2 sm:p-3 rounded-md bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-sm transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Parcel Controls */}
          {item.quantity > 0 && (
            <div className="flex flex-col items-end">
              <label className="flex items-center space-x-2 text-stone-500 dark:text-stone-400 font-medium cursor-pointer mb-1 hover:text-stone-700 dark:hover:text-stone-300">
                <input 
                  type="checkbox" 
                  checked={isParcel}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChangeParcelQuantity(item.quantity); // Default all to parcel
                    } else {
                      onChangeParcelQuantity(0);
                    }
                  }}
                  className="w-5 h-5 rounded border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-500 focus:ring-orange-500 dark:focus:ring-orange-500/50 focus:ring-offset-white dark:focus:ring-offset-stone-900 transition-colors"
                />
                <span className="flex items-center"><Box size={16} className="mr-1" /> Parcel</span>
              </label>
              
              {isParcel && item.quantity > 1 && (
                <div className="flex items-center space-x-2 text-sm bg-orange-50 dark:bg-orange-900/30 rounded px-2 py-1 border border-orange-200 dark:border-orange-900/50 transition-colors">
                  <span className="font-medium text-orange-700 dark:text-orange-400">Qty:</span>
                  <select 
                    value={item.parcelQuantity} 
                    onChange={(e) => onChangeParcelQuantity(Number(e.target.value))}
                    className="bg-transparent font-bold text-orange-800 dark:text-orange-300 outline-none"
                  >
                    {Array.from({ length: item.quantity + 1 }).map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {readonly && (
        <div className="flex justify-between items-center text-sm font-medium mt-1">
          <div className="text-stone-500 dark:text-stone-400">Qty: {item.quantity}</div>
          {item.parcelQuantity > 0 && (
            <div className="text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded flex items-center border border-orange-200 dark:border-orange-900/50 transition-colors">
              <Box size={14} className="mr-1" /> {item.parcelQuantity} Parcel (+₹{item.parcelQuantity * parcelCharge})
            </div>
          )}
        </div>
      )}

    </div>
  );
};
