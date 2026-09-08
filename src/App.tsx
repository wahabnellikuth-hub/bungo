import React, { useState } from 'react';
import { usePOS } from './context/POSContext';
import { Settings as SettingsIcon, ChevronLeft, Sun, Moon } from 'lucide-react';
import { MenuSection } from './components/MenuSection';
import { CurrentOrder } from './components/CurrentOrder';
import { PendingOrders } from './components/PendingOrders';
import { SuccessfulOrders } from './components/SuccessfulOrders';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportManager } from './components/ExportManager';

function App() {
  const { isLoaded, settings, updateSettings } = usePOS();
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');

  React.useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-stone-100 dark:bg-stone-950 text-stone-500 dark:text-stone-400 font-medium">Loading Bungo POS...</div>;
  }

  return (
    <div className="h-screen bg-stone-100 dark:bg-stone-950 overflow-y-auto text-stone-800 dark:text-stone-200 scrollbar-hide transition-colors duration-200">
      <div className="max-w-5xl w-full mx-auto p-4 lg:p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-500 tracking-tight">
            {activeTab === 'main' ? 'Bungo' : 'Settings & Export'}
          </h1>
          
          {activeTab === 'main' ? (
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-stone-500 dark:text-stone-400 bg-stone-200 dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-transparent dark:border-stone-700">
                {(() => {
                  const d = settings?.businessDate ? new Date(settings.businessDate) : new Date();
                  const day = d.toLocaleDateString('en-US', { day: '2-digit' });
                  const weekDay = d.toLocaleDateString('en-US', { weekday: 'short' });
                  return `${day}, ${weekDay}`;
                })()}
              </div>
              <button 
                onClick={() => updateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700"
                title="Toggle Theme"
              >
                {settings.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700"
                title="Settings & Export"
              >
                <SettingsIcon size={24} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => updateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700"
                title="Toggle Theme"
              >
                {settings.theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button 
                onClick={() => setActiveTab('main')}
                className="flex items-center px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-bold hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors border border-transparent dark:border-stone-700 h-[48px]"
              >
                <ChevronLeft size={20} className="mr-1" /> Back
              </button>
            </div>
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
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-200">
              <SettingsPanel />
            </div>
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 transition-colors duration-200">
              <ExportManager />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default App;
