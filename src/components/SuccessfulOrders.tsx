import React from 'react';
import { usePOS } from '../context/POSContext';
import { Check, RotateCcw } from 'lucide-react';
import type { Order } from '../types';

export const SuccessfulOrders: React.FC = () => {
  const { orders, updateOrderPaymentStatus, undoCompleteOrder } = usePOS();

  const successfulOrders = orders
    .filter(o => o.status === 'SUCCESSFUL')
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  if (successfulOrders.length === 0) return null;

  const calcTotal = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
    const parcelTotal = order.items.reduce((sum, item) => sum + item.parcelQuantity, 0) * order.parcelChargeAtOrder;
    return subtotal + parcelTotal;
  };

  return (
    <section className="mb-6 opacity-80 hover:opacity-100 transition-opacity">
      <h2 className="text-xl font-bold text-stone-400 mb-4 px-2">Successful Orders</h2>
      
      <div className="space-y-2">
        {successfulOrders.map(order => {
          const total = calcTotal(order);

          return (
            <div key={order.id} className="bg-stone-950 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center p-3 sm:p-4">
              
              <div className="flex-1 flex items-center space-x-3 w-full sm:w-auto mb-3 sm:mb-0">
                <div className="text-stone-400 font-bold px-2 py-1 bg-stone-800 rounded">
                  #{order.serialNumber}
                </div>
                <div className="font-bold text-stone-300 truncate">
                  {order.customerName}
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="font-bold text-stone-300">
                  ₹{total}
                </div>
                
                {order.paymentStatus === 'PAID' ? (
                  <div className="text-emerald-500 font-bold text-sm">
                    PAID
                  </div>
                ) : (
                  <button 
                    onClick={() => updateOrderPaymentStatus(order.id, 'PAID')}
                    className="bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-200 border border-stone-700 px-3 py-1 rounded font-bold text-sm transition-colors whitespace-nowrap"
                  >
                    Mark Paid
                  </button>
                )}
                
                <div className="flex items-center space-x-2 pl-2 border-l border-stone-800">
                  <span className="flex items-center text-emerald-600 font-bold">
                    <Check size={18} className="mr-1" /> DONE
                  </span>
                  <button 
                    onClick={() => undoCompleteOrder(order.id)}
                    className="p-1.5 text-stone-600 hover:text-amber-500 hover:bg-stone-800 rounded transition-colors"
                    title="Undo Complete"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
