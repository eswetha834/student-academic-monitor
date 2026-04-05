import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Brain, Target, Calendar, TrendingUp, CheckCircle, AlertCircle, Clock, Award, Activity } from 'lucide-react';
import ProfessionalLayout from '../components/layout/ProfessionalLayout';
import '../styles/professional-dashboard.css';

const ProfessionalStudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with HIDDEN

  // Professional data structure
  const [data] = useState({
    // AI Prediction with impressive data
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
      },
      insights: [
        "You're performing 21% above class average",
        "Consistent improvement over 3 semesters",
        "Strong analytical thinking skills detected"
      ]
    },
    
    // KPI Metrics with visual hierarchy
    kpis: [
      { 
        label: 'Current GPA', 
        value: 8.5, 
        change: 0.3, 
        trend: 'up',
        icon: Target,
        color: 'from-blue-500 to-blue-700',
        description: 'Top 15% of class'
      },
      { 
        label: 'Attendance', 
        value: '95%', 
        change: 2.1, 
        trend: 'up',
        icon: Calendar,
        color: 'from-green-500 to-green-700',
        description: 'Excellent consistency'
      },
      { 
        label: 'Confidence', 
        value: '92%', 
        change: 5.4, 
        trend: 'up',
        icon: Brain,
        color: 'from-purple-500 to-purple-700',
        description: 'AI calculated'
      },
      { 
        label: 'Trend', 
        value: '+12%', 
        change: 12, 
        trend: 'up',
        icon: TrendingUp,
        color: 'from-orange-500 to-orange-700',
        description: 'Growth rate'
      }
    ],
    
    // Professional chart data
    performanceData: [
      { month: 'Jan', score: 7.8, target: 8.0, average: 7.2 },
      { month: 'Feb', score: 8.1, target: 8.0, average: 7.3 },
      { month: 'Mar', score: 8.3, target: 8.0, average: 7.4 },
      { month: 'Apr', score: 8.5, target: 8.0, average: 7.5 },
      { month: 'May', score: 8.7, target: 8.0, average: 7.6 }
    ],
    
    subjectData: [
      { name: 'Mathematics', value: 85, color: '#3B82F6', grade: 'A-' },
      { name: 'Physics', value: 78, color: '#8B5CF6', grade: 'B+' },
      { name: 'Chemistry', value: 92, color: '#10B981', grade: 'A' },
      { name: 'Computer Science', value: 88, color: '#F59E0B', grade: 'A-' }
    ],
    
    // Professional insights
    insights: [
      {
        type: 'success',
        title: 'Excellent Progress',
        description: 'Your GPA has increased by 0.3 points this semester, placing you in the top 15% of your class.',
        action: 'View detailed report',
        icon: CheckCircle,
        metrics: ['+0.3 GPA', 'Top 15%', '3 semesters improvement']
      },
      {
        type: 'warning',
        title: 'Focus Opportunity',
        description: 'Physics performance shows room for improvement. Additional practice could boost your overall GPA.',
        action: 'Get study resources',
        icon: AlertCircle,
        metrics: ['78% current', 'Target: 85%', '+7% needed']
      },
      {
        type: 'info',
        title: 'Optimal Study Pattern',
        description: 'Your evening study sessions (6-9 PM) show 40% better retention than morning sessions.',
        action: 'Optimize schedule',
        icon: Clock,
        metrics: ['40% better', 'Evening peak', '6-9 PM optimal']
      }
    ],
    
    // Professional recommendations
    recommendations: [
      {
        priority: 'high',
        title: 'Complete Physics Assignment',
        description: 'Due in 2 days - worth 15% of final grade. Current progress: 65%',
        action: 'Continue now',
        deadline: '2 days',
        impact: 'High'
      },
      {
        priority: 'medium',
        title: 'Review Calculus Concepts',
        description: 'Focus on derivatives and integrals for upcoming test. 3 chapters remaining.',
        action: 'Schedule study time',
        deadline: '1 week',
        impact: 'Medium'
      },
      {
        priority: 'low',
        title: 'Join Study Group',
        description: 'Collaborative learning shows 25% better retention. Physics group meets Thursdays.',
        action: 'Find groups',
        deadline: 'Flexible',
        impact: 'Low'
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <span className="text-green-400">↑</span>;
      case 'down': return <span className="text-red-400">↓</span>;
      default: return <span className="text-gray-400">→</span>;
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
      <ProfessionalLayout title="Professional Dashboard" subtitle="AI-Powered Academic Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white/60">Loading professional analytics...</div>
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout 
      title="Professional Dashboard" 
      subtitle="AI-Powered Academic Analytics"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {/* AI Prediction Banner - IMPRESSIVE */}
      <div className="mb-8 ai-prediction-banner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Performance Prediction</h2>
              <p className="text-white/80 mb-3">Advanced machine learning analysis of your academic patterns</p>
              <div className="flex gap-6">
                {data.prediction.insights.map((insight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white mb-2">{data.prediction.score}</div>
            <div className="text-white/80">Predicted GPA</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-400 text-sm">{getTrendIcon(data.prediction.trend)}</span>
              <span className="text-white/60 text-sm">{data.prediction.confidence}% confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row - VISUAL HIERARCHY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data.kpis.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <kpi.icon className="w-6 h-6 text-white/80" />
              </div>
              <div className="kpi-trend">
                {getTrendIcon(kpi.trend)}
                <span className={kpi.change > 0 ? 'trend-up' : 'trend-down'}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}
                </span>
              </div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="text-white/40 text-xs mt-1">{kpi.description}</div>
          </div>
        ))}
      </div>

      {/* Big Highlight Card - DEPTH AND WOW FACTOR */}
      <div className="mb-8 highlight-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-white mb-4">Predicted Performance Analysis</h3>
            <div className="flex items-baseline gap-6 mb-6">
              <span className="text-6xl font-bold text-white">{data.prediction.score}</span>
              <span className="text-2xl text-white/80">GPA</span>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                <span className="text-green-400">↑</span>
                <span className="text-green-400 text-sm font-medium">+{data.prediction.score - data.prediction.comparison.classAverage} vs average</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-white/60 text-sm mb-2">Confidence Level</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full h-3" style={{ width: `${data.prediction.confidence}%` }}></div>
                  </div>
                  <span className="text-white font-bold">{data.prediction.confidence}%</span>
                </div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-2">Performance Factors</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white/80">Attendance: {data.prediction.factors.attendance}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-white/80">Assignments: {data.prediction.factors.assignments}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-white/60 text-xs">Class Average</div>
                <div className="text-white font-bold">{data.prediction.comparison.classAverage}</div>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-white/60 text-xs">Last Semester</div>
                <div className="text-white font-bold">{data.prediction.comparison.lastSemester}</div>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <div className="text-white/60 text-xs">Target</div>
                <div className="text-white font-bold">{data.prediction.comparison.target}</div>
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="ml-8">
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="url(#gradient)" 
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - data.prediction.confidence / 100)}`}
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
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

      {/* Charts Section - REAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Performance Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.performanceData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px'
                }}
              />
              <Area type="monotone" dataKey="average" stroke="#10B981" fillOpacity={1} fill="url(#colorAverage)" strokeWidth={2} />
              <Area type="monotone" dataKey="score" stroke="#3B82F6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white/60">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white/60">Class Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white/60">Target</span>
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Subject Performance Distribution</h3>
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
                  borderRadius: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {data.subjectData.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                  <span className="text-white/80 text-sm">{subject.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">{subject.value}%</span>
                  <span className="text-white/60 text-xs ml-1">({subject.grade})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Insights */}
        <div className="chart-container">
          <h3 className="chart-title">AI-Powered Insights</h3>
          <div className="space-y-4">
            {data.insights.map((insight, index) => (
              <div 
                key={index}
                className="insight-card"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start gap-4">
                  <div className={`insight-icon insight-${insight.type}`}>
                    <insight.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                    <p className="text-white/70 text-sm mb-3">{insight.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {insight.metrics.map((metric, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                          {metric}
                        </span>
                      ))}
                    </div>
                    <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="chart-container">
          <h3 className="chart-title">Personalized Recommendations</h3>
          <div className="space-y-4">
            {data.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card recommendation-${rec.priority}`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-semibold">{rec.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.priority} priority
                    </span>
                    <span className="text-white/60 text-xs">{rec.deadline}</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-4">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">Impact: {rec.impact}</span>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors">
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProfessionalLayout>
  );
};

export default ProfessionalStudentDashboard;
