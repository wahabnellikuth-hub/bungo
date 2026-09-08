import React from 'react';
import { usePOS } from '../context/POSContext';
import { Download, Trash2 } from 'lucide-react';
import { Order } from '../types';

export const ExportManager: React.FC = () => {
  const { orders, clearAllOrders } = usePOS();

  const handleExport = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const headers = ['Serial No', 'Date', 'Time', 'Customer Name', 'Items', 'Parcel', 'Parcel Charge', 'Total', 'Payment Status', 'Done'];
    
    const rows = orders.map(order => {
      const dateObj = new Date(order.createdAt);
      const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
      const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      
      const itemsStr = order.items.map(i => `${i.name} x${i.quantity}`).join('; ');
      
      const parcelCount = order.items.reduce((sum, item) => sum + item.parcelQuantity, 0);
      const parcelChargeTotal = parcelCount * order.parcelChargeAtOrder;
      
      const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
      const grandTotal = subtotal + parcelChargeTotal;

      const isDone = order.status === 'SUCCESSFUL' ? 'DONE' : 'PENDING';

      return [
        `#${order.serialNumber}`,
        dateStr,
        timeStr,
        `"${order.customerName}"`,
        `"${itemsStr}"`,
        parcelCount.toString(),
        `₹${parcelChargeTotal}`,
        `₹${grandTotal}`,
        order.paymentStatus,
        isDone
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bungo_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section>
      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-3">Export Data</h3>
      <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-center transition-colors">
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 font-medium">Download all order history as a CSV file for Excel or Google Sheets.</p>
        <button 
          onClick={handleExport}
          className="w-full flex items-center justify-center px-4 py-3 bg-stone-800 dark:bg-amber-600 text-white font-bold rounded-xl hover:bg-stone-900 dark:hover:bg-amber-700 transition-colors shadow-sm mb-6"
        >
          <Download size={20} className="mr-2" /> Export Orders
        </button>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-6 mt-2">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium">Danger Zone: Wipe all data to start fresh for a new day.</p>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to completely wipe all orders? Make sure you have exported today's data first!")) {
                clearAllOrders();
              }
            }}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50 transition-colors"
          >
            <Trash2 size={20} className="mr-2" /> Clear All Orders
          </button>
        </div>
      </div>
    </section>
  );
};
