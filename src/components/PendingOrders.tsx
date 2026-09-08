import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Play, Edit2, Check, Box } from 'lucide-react';
import clsx from 'clsx';
import { Order } from '../types';

export const PendingOrders: React.FC = () => {
  const { orders, updateOrderPaymentStatus, loadOrderForEdit, completeOrder } = usePOS();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const pendingOrders = orders.filter(o => o.status === 'PENDING').sort((a, b) => a.serialNumber - b.serialNumber);

  if (pendingOrders.length === 0) return null;

  const handleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const calcTotal = (order: Order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
    const parcelTotal = order.items.reduce((sum, item) => sum + item.parcelQuantity, 0) * order.parcelChargeAtOrder;
    return subtotal + parcelTotal;
  };

  const getParcelTotalCount = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.parcelQuantity, 0);
  };

  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold text-stone-800 mb-4 px-2">Pending Orders</h2>
      
      <div className="space-y-3">
        {pendingOrders.map(order => {
          const isExpanded = expandedOrderId === order.id;
          const total = calcTotal(order);
          const parcelCount = getParcelTotalCount(order);

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              
              {/* Summary Row */}
              <div className="flex flex-col sm:flex-row items-center p-4 cursor-pointer hover:bg-stone-50 transition-colors" onClick={() => handleExpand(order.id)}>
                
                <div className="flex-1 flex items-center space-x-3 w-full sm:w-auto mb-3 sm:mb-0">
                  <div className="bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-lg">
                    #{order.serialNumber}
                  </div>
                  <div className="font-bold text-lg text-stone-800 truncate flex-1">
                    {order.customerName}
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="font-bold text-xl text-stone-800">
                    ₹{total}
                  </div>
                  
                  {order.paymentStatus === 'PAID' ? (
                    <div className="text-green-700 bg-green-100 px-3 py-1 rounded font-bold text-sm">
                      PAID
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderPaymentStatus(order.id, 'PAID');
                      }}
                      className="bg-stone-200 text-stone-700 hover:bg-stone-300 px-3 py-1 rounded font-bold text-sm transition-colors whitespace-nowrap"
                    >
                      Mark Paid
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-1 pl-2 border-l border-stone-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        loadOrderForEdit(order.id);
                      }}
                      className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                      title="Edit Order"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      className={clsx(
                        "p-2 rounded-full transition-colors flex items-center justify-center",
                        isExpanded ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                      )}
                    >
                      <Play size={20} className={isExpanded ? "transform rotate-90" : ""} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-stone-50 border-t border-stone-200">
                  
                  <div className="mb-4 space-y-2">
                    {order.items.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-start text-stone-700">
                        <div>
                          <span className="font-bold">{item.name}</span> × {item.quantity}
                          <div className="text-sm text-stone-500 mt-0.5 flex space-x-3">
                            <span>Having: {item.quantity - item.parcelQuantity}</span>
                            {item.parcelQuantity > 0 && (
                              <span className="text-orange-600 font-medium flex items-center">
                                <Box size={14} className="mr-1" /> Take Away: {item.parcelQuantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{item.quantity * item.priceAtOrder}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-3 space-y-1 text-sm font-medium text-stone-600 mb-5">
                    {parcelCount > 0 && (
                      <div className="flex justify-between text-orange-700">
                        <span>Parcel charges ({parcelCount} × ₹{order.parcelChargeAtOrder})</span>
                        <span>₹{parcelCount * order.parcelChargeAtOrder}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-stone-900 pt-1">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {order.paymentStatus === 'NOT_PAID' && (
                      <button 
                        onClick={() => updateOrderPaymentStatus(order.id, 'PAID')}
                        className="flex-1 py-3 bg-stone-200 text-stone-800 font-bold rounded-xl hover:bg-stone-300 transition-colors"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {order.paymentStatus === 'PAID' && (
                       <div className="flex-1 py-3 bg-green-50 text-green-700 font-bold rounded-xl flex items-center justify-center border border-green-200">
                         ✓ PAID
                       </div>
                    )}
                    
                    <button 
                      onClick={() => completeOrder(order.id)}
                      className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <Check size={20} className="mr-2" /> Done
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>
    </section>
  );
};
