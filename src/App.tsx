import React, { useState } from 'react';
import { usePOS } from './context/POSContext';
import { Settings as SettingsIcon, ChevronLeft } from 'lucide-react';
import { MenuSection } from './components/MenuSection';
import { CurrentOrder } from './components/CurrentOrder';
import { PendingOrders } from './components/PendingOrders';
import { SuccessfulOrders } from './components/SuccessfulOrders';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportManager } from './components/ExportManager';

function App() {
  const { isLoaded, settings } = usePOS();
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-stone-950 text-stone-400 font-medium">Loading Bungo POS...</div>;
  }

  return (
    <div className="h-screen bg-stone-950 overflow-y-auto text-stone-200 scrollbar-hide">
      <div className="max-w-5xl w-full mx-auto p-4 lg:p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-500 tracking-tight">
            {activeTab === 'main' ? 'Bungo' : 'Settings & Export'}
          </h1>
          
          {activeTab === 'main' ? (
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-stone-400 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
                {(() => {
                  const d = settings?.businessDate ? new Date(settings.businessDate) : new Date();
                  const day = d.toLocaleDateString('en-US', { day: '2-digit' });
                  const weekDay = d.toLocaleDateString('en-US', { weekday: 'short' });
                  return `${day}, ${weekDay}`;
                })()}
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-3 bg-stone-800 rounded-xl shadow-sm text-stone-300 hover:bg-stone-700 transition-colors border border-stone-700"
                title="Settings & Export"
              >
                <SettingsIcon size={24} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('main')}
              className="flex items-center px-4 py-2 bg-stone-800 text-stone-200 rounded-xl font-bold hover:bg-stone-700 transition-colors border border-stone-700"
            >
              <ChevronLeft size={20} className="mr-1" /> Back to Ordering (Info)
            </button>
          )}
        </header>

        {/* Content Area */}
        {activeTab === 'main' ? (
          <div className="space-y-6">
            <MenuSection />
            <CurrentOrder />
            <PendingOrders />
            <SuccessfulOrders />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-800">
              <SettingsPanel />
            </div>
            <div className="bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-800">
              <ExportManager />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;
