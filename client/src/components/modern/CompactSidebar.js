import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  User, 
  ChevronRight, 
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const CompactSidebar = ({ activeSection, onSectionChange, notifications = 0, sidebarOpen, setSidebarOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-400 to-blue-600' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, color: 'from-green-400 to-green-600' },
    { id: 'study', label: 'Study Tracker', icon: Clock, color: 'from-purple-400 to-purple-600' },
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'from-orange-400 to-orange-600' },
    { id: 'profile', label: 'Profile', icon: User, color: 'from-indigo-400 to-indigo-600' }
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-black/20 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 z-50 overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center relative">
              <User className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            {sidebarOpen && (
              <div className="animate-fadeInUp">
                <div className="text-white font-medium">Student</div>
                <div className="text-xs text-white/60">Premium Plan</div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full group relative overflow-hidden`}
          >
            <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
              ${activeSection === item.id 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}>
              {/* Hover Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeSection === item.id ? `bg-gradient-to-r ${item.color}` : ''}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
                
                {/* Active Indicator */}
                {activeSection === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        {/* Notifications */}
        <button className="relative w-full mb-3 p-3 hover:bg-white/10 rounded-xl transition-colors group">
          <Bell className="w-5 h-5 text-white/80 mx-auto" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white font-medium flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-white/80 mx-auto" />
          </button>
          
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 animate-fadeInUp">
              <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                <User className="w-4 h-4 text-white/80" />
                <span className="text-white text-sm">Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-white/80" />
                <span className="text-white text-sm">Settings</span>
              </button>
              <div className="border-t border-white/10 my-1"></div>
              <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactSidebar;
