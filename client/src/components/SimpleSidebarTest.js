import React, { useState } from 'react';
import { Menu, X, Home, User, Settings } from 'lucide-react';

const SimpleSidebarTest = () => {
  // IMPORTANT: Starts with false (hidden)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* SIDEBAR - HIDDEN BY DEFAULT */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-slate-800 overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white font-bold">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <nav className="space-y-4">
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded w-full">
              <Home className="w-5 h-5" /> Dashboard
            </button>
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded w-full">
              <User className="w-5 h-5" /> Profile
            </button>
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded w-full">
              <Settings className="w-5 h-5" /> Settings
            </button>
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* HEADER WITH MENU BUTTON */}
        <header className="bg-slate-800 p-4 flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/10 rounded hover:bg-white/20"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl">Dashboard</h1>
        </header>

        {/* CONTENT */}
        <main className="p-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-white text-2xl font-bold mb-4">Sidebar Test</h2>
            
            <div className="space-y-4 text-white">
              <p>👋 Welcome to the sidebar test!</p>
              <p>📱 The sidebar is currently: <strong>{sidebarOpen ? 'OPEN' : 'CLOSED'}</strong></p>
              <p>🎯 Press the menu button (☰) in the header to open sidebar</p>
              <p>❌ Press the X button inside sidebar to close it</p>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Toggle Sidebar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleSidebarTest;
