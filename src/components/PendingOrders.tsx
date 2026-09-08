import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Play, Edit2, Check, Box, Eye } from 'lucide-react';
import clsx from 'clsx';
import { Order } from '../types';

export const PendingOrders: React.FC = () => {
  const { orders, updateOrderPaymentStatus, loadOrderForEdit, completeOrder } = usePOS();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showItemCounts, setShowItemCounts] = useState(false);

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

  const itemSummary = pendingOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.name]) {
        acc[item.name] = { having: 0, parcel: 0 };
      }
      acc[item.name].having += (item.quantity - item.parcelQuantity);
      acc[item.name].parcel += item.parcelQuantity;
    });
    return acc;
  }, {} as Record<string, { having: number; parcel: number }>);

  const itemSummaryEntries = Object.entries(itemSummary);

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4 px-2 relative">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-500">Pending Orders</h2>
        <button 
          onClick={() => setShowItemCounts(!showItemCounts)}
          className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1"
          title="View Item Counts"
        >
          <Eye size={20} />
        </button>
        {showItemCounts && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl rounded-xl z-10 p-3 max-h-80 overflow-y-auto">
            <div className="font-bold text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-800 pb-2 mb-2">Item Counts</div>
            {itemSummaryEntries.length > 0 ? (
              itemSummaryEntries.map(([name, counts]) => (
                <div key={name} className="text-sm py-1.5 border-b last:border-0 border-stone-100 dark:border-stone-800/50 flex justify-between items-start gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300 break-words flex-1">{name}</span>
                  <span className="text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    {counts.having > 0 ? `${counts.having.toString().padStart(2, '0')}(🍽️)` : ''}
                    {counts.having > 0 && counts.parcel > 0 ? ', ' : ''}
                    {counts.parcel > 0 ? `${counts.parcel.toString().padStart(2, '0')}(📦)` : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-stone-500 dark:text-stone-400">No items</div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {pendingOrders.map(order => {
          const isExpanded = expandedOrderId === order.id;
          const total = calcTotal(order);
          const parcelCount = getParcelTotalCount(order);

          return (
            <div key={order.id} className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
              
              {/* Summary Row */}
              <div className="flex flex-col sm:flex-row items-center p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors" onClick={() => handleExpand(order.id)}>
                
                <div className="flex-1 flex items-center space-x-3 w-full sm:w-auto mb-3 sm:mb-0">
                  <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 font-bold px-3 py-1.5 rounded-lg">
                    #{order.serialNumber}
                  </div>
                  <div className="font-bold text-lg text-stone-800 dark:text-stone-200 truncate flex-1">
                    {order.customerName}
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="font-bold text-xl text-stone-800 dark:text-stone-200">
                    ₹{total}
                  </div>
                  
                  {order.paymentStatus === 'PAID' ? (
                    <div className="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded font-bold text-sm border border-transparent dark:border-emerald-900/50">
                      PAID
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderPaymentStatus(order.id, 'PAID');
                      }}
                      className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent dark:border-stone-700 px-3 py-1 rounded font-bold text-sm transition-colors whitespace-nowrap animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)] dark:shadow-[0_0_8px_rgba(239,68,68,0.5)] border-red-200 dark:border-red-900/50"
                    >
                      Mark Paid
                    </button>
                  )}
                  
                  <div className="flex items-center space-x-1 pl-2 border-l border-stone-200 dark:border-stone-800">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        loadOrderForEdit(order.id);
                      }}
                      className="p-2 text-stone-400 dark:text-stone-500 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                      title="Edit Order"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      className={clsx(
                        "p-2 rounded-full transition-colors flex items-center justify-center",
                        isExpanded ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-500" : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-400"
                      )}
                    >
                      <Play size={20} className={isExpanded ? "transform rotate-90" : ""} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 transition-colors">
                  
                  <div className="mb-4 space-y-2">
                    {order.items.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-start text-stone-700 dark:text-stone-300">
                        <div>
                          <span className="font-bold text-stone-900 dark:text-stone-200">{item.name}</span> × {item.quantity}
                          <div className="text-sm text-stone-500 mt-0.5 flex space-x-3">
                            <span>Having: {item.quantity - item.parcelQuantity}</span>
                            {item.parcelQuantity > 0 && (
                              <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center bg-orange-100 dark:bg-orange-900/20 px-1.5 rounded">
                                <Box size={14} className="mr-1" /> Take Away: {item.parcelQuantity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-medium text-stone-800 dark:text-stone-300">
                          ₹{item.quantity * item.priceAtOrder}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-1 text-sm font-medium text-stone-600 dark:text-stone-400 mb-5">
                    {parcelCount > 0 && (
                      <div className="flex justify-between text-orange-700 dark:text-orange-400">
                        <span>Parcel charges ({parcelCount} × ₹{order.parcelChargeAtOrder})</span>
                        <span>₹{parcelCount * order.parcelChargeAtOrder}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-stone-900 dark:text-stone-200 pt-1">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {order.paymentStatus === 'NOT_PAID' && (
                      <button 
                        onClick={() => updateOrderPaymentStatus(order.id, 'PAID')}
                        className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {order.paymentStatus === 'PAID' && (
                       <div className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
                         ✓ PAID
                       </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        if (order.paymentStatus === 'NOT_PAID') {
                          alert('Please mark the order as paid before completing it.');
                          return;
                        }
                        completeOrder(order.id);
                      }}
                      disabled={order.paymentStatus === 'NOT_PAID'}
                      className={clsx(
                        "flex-1 py-3 font-bold rounded-xl transition-colors flex items-center justify-center shadow-sm",
                        order.paymentStatus === 'NOT_PAID' 
                          ? "bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-not-allowed" 
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      )}
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
