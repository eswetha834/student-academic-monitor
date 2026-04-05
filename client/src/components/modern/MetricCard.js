import React from 'react';
import { LucideIcon } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  subtitle, 
  loading = false,
  trend 
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  };

  const getChangeColor = () => {
    if (!change) return 'text-white/60';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="relative group">
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group hover-lift">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`} />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 smooth-transition">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-xl">
            <Icon className="w-5 h-5 text-white/80" />
          </div>
          <div className="flex items-center gap-2">
            {change !== undefined && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span>
            )}
            {trend && (
              <span className="text-lg">
                {getTrendIcon()}
              </span>
            )}
          </div>
        </div>
        
        <div>
          <div className="text-3xl font-bold text-white mb-1 animate-fadeInUp">
            {value}
          </div>
          <div className="text-sm text-white/60 mb-1">{title}</div>
          {subtitle && (
            <div className="text-xs text-white/40 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

export default MetricCard;
