import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  User, 
  Bell, 
  Settings,
  Award,
  Brain,
  Target,
  Activity,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProfessionalDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);

  // Mock data with professional structure
  const [data, setData] = useState({
    // AI Prediction Data
    prediction: {
      score: 8.7,
      confidence: 92,
      trend: 'up',
      factors: {
        attendance: 95,
        assignments: 88,
        participation: 90,
        extraCredit: 85
      },
      comparison: {
        classAverage: 7.2,
        lastSemester: 8.1,
        target: 9.0
      }
    },
    
    // KPI Metrics
    kpis: [
      { 
        label: 'Current GPA', 
        value: 8.5, 
        change: 0.3, 
        trend: 'up',
        icon: Target,
        color: 'from-blue-500 to-blue-700'
      },
      { 
        label: 'Attendance', 
        value: '95%', 
        change: 2.1, 
        trend: 'up',
        icon: Calendar,
        color: 'from-green-500 to-green-700'
      },
      { 
        label: 'Confidence', 
        value: '92%', 
        change: 5.4, 
        trend: 'up',
        icon: Brain,
        color: 'from-purple-500 to-purple-700'
      },
      { 
        label: 'Trend', 
        value: '+12%', 
        change: 12, 
        trend: 'up',
        icon: TrendingUp,
        color: 'from-orange-500 to-orange-700'
      }
    ],
    
    // Chart Data
    performanceData: [
      { month: 'Jan', score: 7.8, target: 8.0 },
      { month: 'Feb', score: 8.1, target: 8.0 },
      { month: 'Mar', score: 8.3, target: 8.0 },
      { month: 'Apr', score: 8.5, target: 8.0 },
      { month: 'May', score: 8.7, target: 8.0 }
    ],
    
    subjectData: [
      { name: 'Mathematics', value: 85, color: '#3B82F6' },
      { name: 'Physics', value: 78, color: '#8B5CF6' },
      { name: 'Chemistry', value: 92, color: '#10B981' },
      { name: 'CS', value: 88, color: '#F59E0B' }
    ],
    
    // Insights
    insights: [
      {
        type: 'success',
        title: 'Excellent Progress',
        description: 'Your GPA has increased by 0.3 points this semester',
        action: 'View detailed report',
        icon: CheckCircle
      },
      {
        type: 'warning',
        title: 'Focus Opportunity',
        description: 'Physics performance could improve with more practice',
        action: 'Get study resources',
        icon: AlertCircle
      },
      {
        type: 'info',
        title: 'Study Pattern',
        description: 'Your evening study sessions are most effective',
        action: 'Optimize schedule',
        icon: Clock
      }
    ],
    
    recommendations: [
      {
        priority: 'high',
        title: 'Complete Physics Assignment',
        description: 'Due in 2 days - 15% of final grade',
        action: 'Start now'
      },
      {
        priority: 'medium',
        title: 'Review Math Concepts',
        description: 'Focus on calculus for upcoming test',
        action: 'Schedule study time'
      },
      {
        priority: 'low',
        title: 'Join Study Group',
        description: 'Collaborative learning improves retention',
        action: 'Find groups'
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-green-500/50 bg-green-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/60">Loading professional dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M0 40L40 0H20L0 20M40 40V20L20 40"/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-800/95 backdrop-blur-xl border-r border-white/10 overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Academic Monitor</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard' },
              { icon: Calendar, label: 'Attendance' },
              { icon: Clock, label: 'Study Tracker' },
              { icon: TrendingUp, label: 'Performance' },
              { icon: User, label: 'Profile' },
              { icon: Settings, label: 'Settings' }
            ].map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
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
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-white/60" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Professional Dashboard</h1>
                <p className="text-white/60 text-sm">AI-Powered Academic Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-white/60" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <div>
                  <div className="text-white font-medium text-sm">Student</div>
                  <div className="text-white/60 text-xs">Premium</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* AI Prediction Banner */}
          <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">AI Performance Prediction</h2>
                  <p className="text-white/60">Based on your current academic patterns</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white mb-1">{data.prediction.score}</div>
                <div className="text-sm text-white/60">Predicted GPA</div>
              </div>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {data.kpis.map((kpi, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <kpi.icon className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend)}
                      <span className={`text-sm font-medium ${
                        kpi.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                  <div className="text-sm text-white/60">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Big Highlight Card */}
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Predicted Performance</h3>
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-5xl font-bold text-white">{data.prediction.score}</span>
                    <span className="text-xl text-white/80">GPA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-white/60 text-sm mb-1">Confidence Level</div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white rounded-full h-2" style={{ width: `${data.prediction.confidence}%` }}></div>
                        </div>
                        <span className="text-white font-medium">{data.prediction.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm mb-1">vs Class Average</div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{data.prediction.comparison.classAverage}</span>
                        <span className="text-green-400">+{data.prediction.score - data.prediction.comparison.classAverage}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-white/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{data.prediction.confidence}%</div>
                      <div className="text-xs text-white/80">Confidence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Line Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 6 }} />
                  <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Subject Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {data.subjectData.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                    <span className="text-white/60 text-sm">{subject.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Insights */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">AI Insights</h3>
              <div className="space-y-4">
                {data.insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-500/20' :
                        insight.type === 'warning' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        <insight.icon className={`w-5 h-5 ${
                          insight.type === 'success' ? 'text-green-400' :
                          insight.type === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                        <p className="text-white/60 text-sm mb-2">{insight.description}</p>
                        <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                          {insight.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recommendations</h3>
              <div className="space-y-4">
                {data.recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{rec.description}</p>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
