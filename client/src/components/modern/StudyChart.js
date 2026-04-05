import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const StudyChart = ({ data, height = 250, animated = true }) => {
  const maxValue = Math.max(...data.map(d => d.hours));
  const averageValue = data.reduce((sum, d) => sum + d.hours, 0) / data.length;

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-white/80" />
          <h3 className="text-lg font-semibold text-white">Study Hours</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-medium">
            +15% from last week
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 flex items-end justify-between gap-2 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        {data.map((item, index) => {
          const percentage = (item.hours / maxValue) * 100;
          const isToday = index === data.length - 1;
          
          return (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center gap-2 group"
            >
              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end">
                <div 
                  className={`w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500 ${
                    animated ? 'animate-fadeInUp' : ''
                  } ${isToday ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}`}
                  style={{ 
                    height: `${percentage}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
                
                {/* Hover Value */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.hours}h
                </div>
              </div>
              
              {/* Day Label */}
              <span className={`text-xs text-white/60 ${isToday ? 'text-white font-medium' : ''}`}>
                {item.day}
              </span>
            </div>
          );
        })}
        
        {/* Average Line */}
        <div 
          className="absolute left-4 right-4 border-t-2 border-dashed border-white/20"
          style={{ 
            bottom: `${(averageValue / maxValue) * 100}%`,
            pointerEvents: 'none'
          }}
        >
          <div className="absolute -left-8 -top-2 text-xs text-white/60 bg-black/60 px-1 rounded">
            Avg: {averageValue.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
        <span>Total: {data.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hours</span>
        <span>Average: {averageValue.toFixed(1)} hours/day</span>
      </div>
    </div>
  );
};

export default StudyChart;
