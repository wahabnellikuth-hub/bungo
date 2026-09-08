import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { QuantityCounter } from './QuantityCounter';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import clsx from 'clsx';

export const CurrentOrder: React.FC = () => {
  const { activeOrder, updateActiveOrder, startNewOrder, clearActiveOrder, confirmOrder, settings } = usePOS();
  
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);

  if (!activeOrder) {
    return (
      <section className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 text-center">
        <h3 className="text-xl font-bold text-stone-800 mb-4">New Order</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
          <input 
            type="text"
            placeholder="Customer Name"
            value={customerNameInput}
            onChange={(e) => setCustomerNameInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-lg font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customerNameInput.trim()) {
                startNewOrder(customerNameInput.trim());
                setCustomerNameInput('');
              }
            }}
          />
          <button 
            disabled={!customerNameInput.trim()}
            onClick={() => {
              startNewOrder(customerNameInput.trim());
              setCustomerNameInput('');
            }}
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
          >
            <UserPlus size={20} className="mr-2" /> Add Customer
          </button>
        </div>
      </section>
    );
  }

  // Calculate totals
  const itemsWithQuantity = activeOrder.items.filter(item => item.quantity > 0);
  const subtotal = itemsWithQuantity.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
  const totalParcelQuantity = itemsWithQuantity.reduce((sum, item) => sum + item.parcelQuantity, 0);
  const parcelTotal = totalParcelQuantity * activeOrder.parcelChargeAtOrder;
  const grandTotal = subtotal + parcelTotal;

  const handleQuantityChange = (menuItemId: string, qty: number) => {
    const updatedItems = activeOrder.items.map(item => {
      if (item.menuItemId === menuItemId) {
        // Ensure parcel quantity doesn't exceed total quantity
        return { 
          ...item, 
          quantity: qty,
          parcelQuantity: Math.min(item.parcelQuantity, qty)
        };
      }
      return item;
    });
    updateActiveOrder({ ...activeOrder, items: updatedItems });
  };

  const handleParcelQuantityChange = (menuItemId: string, parcelQty: number) => {
    const updatedItems = activeOrder.items.map(item => {
      if (item.menuItemId === menuItemId) {
        return { ...item, parcelQuantity: parcelQty };
      }
      return item;
    });
    updateActiveOrder({ ...activeOrder, items: updatedItems });
  };

  const handleConfirm = () => {
    confirmOrder({
      ...activeOrder,
      items: itemsWithQuantity, // Only save items with quantity > 0
      paymentStatus: paymentStatusChecked ? 'PAID' : 'NOT_PAID'
    });
    setIsReviewing(false);
    setPaymentStatusChecked(false);
  };

  return (
    <section className="mb-6 bg-white p-4 lg:p-6 rounded-2xl shadow-md border border-stone-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-lg text-lg">
            #{activeOrder.serialNumber}
          </div>
          <h2 className="text-2xl font-bold text-stone-800">{activeOrder.customerName}</h2>
        </div>
        
        {!isReviewing && (
          <button 
            onClick={clearActiveOrder}
            className="text-stone-400 hover:text-red-500 transition-colors p-2"
            title="Cancel Order"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Items */}
      {activeOrder.items.length === 0 ? (
        <div className="text-center py-8 text-stone-400 font-medium text-lg">
          Select items from the menu above
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {isReviewing ? (
             itemsWithQuantity.map(item => (
              <QuantityCounter 
                key={item.menuItemId} 
                item={item}
                onChangeQuantity={() => {}}
                onChangeParcelQuantity={() => {}}
                parcelCharge={activeOrder.parcelChargeAtOrder}
                readonly
              />
            ))
          ) : (
            activeOrder.items.map(item => (
              <QuantityCounter 
                key={item.menuItemId} 
                item={item}
                onChangeQuantity={(qty) => handleQuantityChange(item.menuItemId, qty)}
                onChangeParcelQuantity={(pQty) => handleParcelQuantityChange(item.menuItemId, pQty)}
                parcelCharge={activeOrder.parcelChargeAtOrder}
              />
            ))
          )}
        </div>
      )}

      {/* Order Summary & Actions */}
      {itemsWithQuantity.length > 0 && (
        <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
          
          <div className="space-y-2 mb-4 text-stone-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {totalParcelQuantity > 0 && (
              <div className="flex justify-between text-orange-700">
                <span>Parcel Charges ({totalParcelQuantity} × ₹{activeOrder.parcelChargeAtOrder})</span>
                <span>₹{parcelTotal}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-stone-200 text-2xl font-bold text-stone-900">
              <span>TOTAL</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {isReviewing ? (
            <div className="space-y-4 pt-4 border-t border-stone-200">
              
              <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors bg-white hover:bg-stone-50">
                <input 
                  type="checkbox"
                  checked={paymentStatusChecked}
                  onChange={(e) => setPaymentStatusChecked(e.target.checked)}
                  className="w-6 h-6 rounded text-green-600 focus:ring-green-500"
                />
                <span className={clsx("text-lg font-bold", paymentStatusChecked ? "text-green-700" : "text-stone-500")}>
                  {paymentStatusChecked ? "PAID" : "Not Paid"}
                </span>
              </label>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={() => setIsReviewing(false)}
                  className="flex-1 py-4 flex items-center justify-center font-bold text-lg bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" /> Change Order
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-4 flex items-center justify-center font-bold text-lg bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
                >
                  <Check size={20} className="mr-2" /> Confirm Order
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsReviewing(true);
                // Pre-fill payment checkbox if we are editing an already paid order
                setPaymentStatusChecked(activeOrder.paymentStatus === 'PAID');
              }}
              className="w-full py-4 flex items-center justify-center font-bold text-xl bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Submit Order
            </button>
          )}

        </div>
      )}

    </section>
  );
};
