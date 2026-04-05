import React, { useState } from 'react';
import { Menu, X, BarChart3, Calendar, Clock, TrendingUp, User, Settings } from 'lucide-react';

const CollapsibleSidebarDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // STARTS HIDDEN

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Attendance' },
    { icon: Clock, label: 'Study Tracker' },
    { icon: TrendingUp, label: 'Performance' },
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar - HIDDEN BY DEFAULT */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-800/95 backdrop-blur-xl border-r border-white/10 overflow-hidden`}>
        <div className="p-6 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* MENU BUTTON - OPENS SIDEBAR */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-white/60" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Professional Dashboard</h1>
                <p className="text-white/60 text-sm">Press the menu button to show sidebar</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Sidebar Behavior Demo</h2>
            
            <div className="space-y-4 text-white/80">
              <p>✅ Sidebar starts HIDDEN by default</p>
              <p>✅ Press the Menu button (☰) to OPEN sidebar</p>
              <p>✅ Press the X button to CLOSE sidebar</p>
              <p>✅ Main content slides over when sidebar opens</p>
            </div>

            <div className="mt-8 p-4 bg-white/10 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Current State:</h3>
              <p className="text-white/60">Sidebar is: <span className="text-white font-bold">{sidebarOpen ? 'OPEN' : 'CLOSED'}</span></p>
              <p className="text-white/60">Main content margin: <span className="text-white font-bold">{sidebarOpen ? 'ml-64' : 'ml-0'}</span></p>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Toggle Sidebar (Current: {sidebarOpen ? 'Open' : 'Closed'})
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CollapsibleSidebarDemo;
