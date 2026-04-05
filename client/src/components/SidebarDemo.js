import React, { useState } from 'react';
import { Menu, X, Home, User, Settings, BarChart3 } from 'lucide-react';

const SidebarDemo = () => {
  // IMPORTANT: Starts with false (COMPLETELY HIDDEN)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* OVERLAY - appears when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR - COMPLETELY HIDDEN BY DEFAULT */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-slate-800 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}>
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white font-bold text-lg">Menu</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-4">
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-lg w-full transition-colors">
              <BarChart3 className="w-5 h-5" /> Dashboard
            </button>
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-lg w-full transition-colors">
              <Home className="w-5 h-5" /> Home
            </button>
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-lg w-full transition-colors">
              <User className="w-5 h-5" /> Profile
            </button>
            <button className="flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-lg w-full transition-colors">
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
          {/* MENU BUTTON - OPENS SIDEBAR */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">Dashboard</h1>
        </header>

        {/* CONTENT */}
        <main className="p-8">
          <div className="bg-slate-800 rounded-lg p-8 max-w-2xl">
            <h2 className="text-white text-3xl font-bold mb-6">Sidebar Behavior Demo</h2>
            
            <div className="space-y-6 text-white">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">📱 Current State:</h3>
                <p className="text-lg">
                  Sidebar is: <span className={`font-bold ${sidebarOpen ? 'text-green-400' : 'text-red-400'}`}>
                    {sidebarOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                  </span>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Main content margin: {sidebarOpen ? 'ml-64 (slid right)' : 'ml-0 (full width)'}
                </p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">🎯 How to Use:</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Sidebar starts <strong>HIDDEN</strong> by default</li>
                  <li>✅ Press the <strong>menu button (☰)</strong> to open sidebar</li>
                  <li>✅ Press the <strong>X button</strong> to close sidebar</li>
                  <li>✅ Click <strong>outside sidebar</strong> to close it</li>
                  <li>✅ Main content slides over when sidebar opens</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Open Sidebar
                </button>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close Sidebar
                </button>
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarDemo;
