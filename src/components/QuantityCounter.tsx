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

  return (
    <div className={clsx(
      "p-4 rounded-xl border transition-colors flex flex-col space-y-3",
      isParcel ? "bg-amber-900/30 border-amber-900/50" : "bg-stone-900 border-stone-800"
    )}>
      
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-stone-200">{item.name}</h4>
          <div className="text-stone-500 font-medium">₹{item.priceAtOrder}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-stone-200">₹{subtotal}</div>
        </div>
      </div>

      {!readonly && (
        <div className="flex items-center justify-between mt-2">
          
          {/* Quantity Controls */}
          <div className="flex items-center bg-stone-800 border border-stone-700 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => onChangeQuantity(Math.max(0, item.quantity - 1))}
              disabled={item.quantity === 0}
              className="p-3 text-stone-400 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed active:bg-stone-600"
            >
              <Minus size={24} />
            </button>
            <div className="w-12 text-center font-bold text-2xl text-stone-200">
              {item.quantity}
            </div>
            <button 
              onClick={() => onChangeQuantity(item.quantity + 1)}
              className="p-3 text-stone-400 hover:bg-stone-700 active:bg-stone-600"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Parcel Controls */}
          {item.quantity > 0 && (
            <div className="flex flex-col items-end">
              <label className="flex items-center space-x-2 text-stone-400 font-medium cursor-pointer mb-1 hover:text-stone-300">
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
                  className="w-5 h-5 rounded border-stone-700 bg-stone-800 text-orange-500 focus:ring-orange-500/50 focus:ring-offset-stone-900"
                />
                <span className="flex items-center"><Box size={16} className="mr-1" /> Parcel</span>
              </label>
              
              {isParcel && item.quantity > 1 && (
                <div className="flex items-center space-x-2 text-sm bg-orange-900/30 rounded px-2 py-1 border border-orange-900/50">
                  <span className="font-medium text-orange-400">Qty:</span>
                  <select 
                    value={item.parcelQuantity} 
                    onChange={(e) => onChangeParcelQuantity(Number(e.target.value))}
                    className="bg-transparent font-bold text-orange-300 outline-none"
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
          <div className="text-stone-400">Qty: {item.quantity}</div>
          {item.parcelQuantity > 0 && (
            <div className="text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded flex items-center border border-orange-900/50">
              <Box size={14} className="mr-1" /> {item.parcelQuantity} Parcel (+₹{item.parcelQuantity * parcelCharge})
            </div>
          )}
        </div>
      )}

    </div>
  );
};
