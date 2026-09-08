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
      isParcel ? "bg-orange-50 border-orange-200" : "bg-stone-50 border-stone-200"
    )}>
      
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-stone-800">{item.name}</h4>
          <div className="text-stone-500 font-medium">₹{item.priceAtOrder}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-stone-800">₹{subtotal}</div>
        </div>
      </div>

      {!readonly && (
        <div className="flex items-center justify-between mt-2">
          
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
            <button 
              onClick={() => onChangeQuantity(Math.max(0, item.quantity - 1))}
              disabled={item.quantity === 0}
              className="p-3 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed active:bg-stone-200"
            >
              <Minus size={24} />
            </button>
            <div className="w-12 text-center font-bold text-2xl text-stone-800">
              {item.quantity}
            </div>
            <button 
              onClick={() => onChangeQuantity(item.quantity + 1)}
              className="p-3 text-stone-600 hover:bg-stone-100 active:bg-stone-200"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Parcel Controls */}
          {item.quantity > 0 && (
            <div className="flex flex-col items-end">
              <label className="flex items-center space-x-2 text-stone-700 font-medium cursor-pointer mb-1">
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
                  className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="flex items-center"><Box size={16} className="mr-1" /> Parcel</span>
              </label>
              
              {isParcel && item.quantity > 1 && (
                <div className="flex items-center space-x-2 text-sm bg-orange-100 rounded px-2 py-1">
                  <span className="font-medium text-orange-800">Qty:</span>
                  <select 
                    value={item.parcelQuantity} 
                    onChange={(e) => onChangeParcelQuantity(Number(e.target.value))}
                    className="bg-transparent font-bold text-orange-900 outline-none"
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
          <div className="text-stone-600">Qty: {item.quantity}</div>
          {item.parcelQuantity > 0 && (
            <div className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded flex items-center">
              <Box size={14} className="mr-1" /> {item.parcelQuantity} Parcel (+₹{item.parcelQuantity * parcelCharge})
            </div>
          )}
        </div>
      )}

    </div>
  );
};
