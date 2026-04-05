import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  Bell, 
  User,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Zap,
  Star,
  ChevronRight,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with HIDDEN
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications, setNotifications] = useState(3);

  // Mock data
  const [studentData, setStudentData] = useState({
    gpa: 8.5,
    attendance: 92,
    streak: 15,
    tasks: 8,
    weeklyStudy: 42,
    monthlyStudy: 156,
    prediction: 'Excellent',
    subjects: [
      { name: 'Mathematics', progress: 85, color: 'from-blue-400 to-blue-600', icon: BarChart3 },
      { name: 'Physics', progress: 78, color: 'from-purple-400 to-purple-600', icon: PieChart },
      { name: 'Chemistry', progress: 92, color: 'from-green-400 to-green-600', icon: Activity },
      { name: 'Computer Science', progress: 88, color: 'from-indigo-400 to-indigo-600', icon: Brain }
    ],
    recentActivity: [
      { type: 'study', subject: 'Mathematics', time: '2 hours ago', duration: '2h 15m' },
      { type: 'assignment', subject: 'Physics', time: '5 hours ago', score: '95%' },
      { type: 'attendance', subject: 'Chemistry', time: '1 day ago', status: 'Present' }
    ],
    weeklyProgress: [
      { day: 'Mon', hours: 3.5 },
      { day: 'Tue', hours: 4.2 },
      { day: 'Wed', hours: 2.8 },
      { day: 'Thu', hours: 5.1 },
      { day: 'Fri', hours: 3.9 },
      { day: 'Sat', hours: 6.2 },
      { day: 'Sun', hours: 4.8 }
    ]
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'study', label: 'Study Tracker', icon: Clock },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`} />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gradient-to-r from-white/10 to-white/5 rounded-xl">
            <Icon className="w-5 h-5 text-white/80" />
          </div>
          {change && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div>
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          <div className="text-sm text-white/60">{title}</div>
          {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  const SubjectCard = ({ subject, progress, color, icon: Icon }) => (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-all duration-300`} />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-r ${color} rounded-xl`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
        <div className="text-white font-medium mb-3">{subject}</div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch(activity.type) {
        case 'study': return <Clock className="w-4 h-4" />;
        case 'assignment': return <BookOpen className="w-4 h-4" />;
        case 'attendance': return <Calendar className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
      }
    };

    const getColor = () => {
      switch(activity.type) {
        case 'study': return 'from-blue-400 to-blue-600';
        case 'assignment': return 'from-green-400 to-green-600';
        case 'attendance': return 'from-purple-400 to-purple-600';
        default: return 'from-gray-400 to-gray-600';
      }
    };

    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
        <div className={`p-2 bg-gradient-to-r ${getColor()} rounded-lg`}>
          <div className="text-white">{getIcon()}</div>
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">{activity.subject}</div>
          <div className="text-sm text-white/60">
            {activity.duration || activity.score || activity.status} • {activity.time}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white/40 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white/20 rounded-full animate-spin" />
          </div>
          <div className="text-white/60 animate-pulse">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Glassmorphism Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-black/20 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 overflow-hidden`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <div className="text-white font-medium">Student</div>
                    <div className="text-xs text-white/60">Premium Plan</div>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              )}
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === item.id 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 flex-1`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8 p-8 pb-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <Menu className="w-5 h-5 text-white/80" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, Student! 👋
                </h1>
                <div className="text-white/60">
                  You're performing <span className="text-green-400 font-medium">10% above average</span> this semester 🚀
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
                <Bell className="w-5 h-5 text-white/80" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white font-medium flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
                <div className="text-right">
                  <div className="text-white font-medium">Student</div>
                  <div className="text-xs text-white/60">Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Current GPA" 
              value={studentData.gpa.toFixed(1)} 
              change={5.2}
              icon={Target}
              color="from-blue-400 to-blue-600"
              subtitle="Top 15% of class"
            />
            <MetricCard 
              title="Attendance" 
              value={`${studentData.attendance}%`} 
              change={2.1}
              icon={Calendar}
              color="from-green-400 to-green-600"
              subtitle="Great consistency!"
            />
            <MetricCard 
              title="Study Streak" 
              value={`${studentData.streak} days`} 
              change={3}
              icon={Zap}
              color="from-yellow-400 to-orange-500"
              subtitle="Keep it up!"
            />
            <MetricCard 
              title="Pending Tasks" 
              value={studentData.tasks} 
              change={-2}
              icon={BookOpen}
              color="from-purple-400 to-purple-600"
              subtitle="Due this week"
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Subject Progress */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Subject Progress</h2>
                  <button className="text-white/60 hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentData.subjects.map((subject, index) => (
                    <SubjectCard key={index} {...subject} />
                  ))}
                </div>
              </div>

              {/* Weekly Study Chart */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Weekly Study Hours</h2>
                  <span className="text-sm text-green-400 font-medium">
                    +15% from last week
                  </span>
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  {studentData.weeklyProgress.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-white/10 rounded-t-lg relative">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${(day.hours / 6.2) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/60 mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Performance Prediction */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Performance Prediction</h2>
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-white mb-2">
                    {studentData.prediction}
                  </div>
                  <div className="text-white/60">
                    Based on current trends
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Top 20% performance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Improving trajectory</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>On track for honors</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {studentData.recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
                <button className="w-full mt-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
