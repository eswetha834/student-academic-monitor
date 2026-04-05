import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, BookOpen } from 'lucide-react';
import StudentMarksDisplay from '../components/StudentMarksDisplay';

const AllMarksPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M0 40L40 0H20L0 20M40 40V20L20 40"/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

      {/* Overlay - appears when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - COMPLETELY HIDDEN BY DEFAULT */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-slate-800/95 backdrop-blur-xl border-r border-white/10 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}>
        <div className="p-6 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Academic Monitor</h2>
              <p className="text-xs text-white/60">Marks & Performance</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { icon: BookOpen, label: 'All Marks', active: true },
              { icon: BookOpen, label: 'Dashboard' },
              { icon: BookOpen, label: 'Performance' },
              { icon: BookOpen, label: 'Profile' },
            ].map((item, index) => (
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
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 flex-1`}>
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-white/60" />
              </button>
              <div className="flex items-center gap-3">
                <ArrowLeft className="w-5 h-5 text-white/60" />
                <div>
                  <h1 className="text-2xl font-bold text-white">All Marks</h1>
                  <p className="text-white/60 text-sm">Complete academic records</p>
                </div>
              </div>
            </div>
          </header>

        {/* Marks Display Component */}
        <StudentMarksDisplay />
      </div>
    </div>
  );
};

export default AllMarksPage;
