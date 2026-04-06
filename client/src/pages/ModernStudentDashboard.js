import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  User,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Zap,
  Star,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Menu
} from 'lucide-react';

// Import modern components
import MetricCard from '../components/modern/MetricCard';
import ProgressRing from '../components/modern/ProgressRing';
import StudyChart from '../components/modern/StudyChart';
import CompactSidebar from '../components/modern/CompactSidebar';

const ModernStudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with HIDDEN
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Enhanced mock data with more details
  const [studentData, setStudentData] = useState({
    gpa: 8.5,
    attendance: 92,
    streak: 15,
    tasks: 8,
    weeklyStudy: 42,
    monthlyStudy: 156,
    prediction: 'Excellent',
    rank: 12,
    totalStudents: 180,
    subjects: [
      { 
        name: 'Mathematics', 
        progress: 85, 
        color: 'from-blue-400 to-blue-600', 
        icon: BarChart3,
        grade: 'A-',
        credits: 4,
        trend: 'up'
      },
      { 
        name: 'Physics', 
        progress: 78, 
        color: 'from-purple-400 to-purple-600', 
        icon: PieChart,
        grade: 'B+',
        credits: 4,
        trend: 'stable'
      },
      { 
        name: 'Chemistry', 
        progress: 92, 
        color: 'from-green-400 to-green-600', 
        icon: Activity,
        grade: 'A',
        credits: 3,
        trend: 'up'
      },
      { 
        name: 'Computer Science', 
        progress: 88, 
        color: 'from-indigo-400 to-indigo-600', 
        icon: Brain,
        grade: 'A-',
        credits: 4,
        trend: 'up'
      }
    ],
    recentActivity: [
      { 
        type: 'study', 
        subject: 'Mathematics', 
        time: '2 hours ago', 
        duration: '2h 15m',
        score: null,
        status: null,
        color: 'from-blue-400 to-blue-600'
      },
      { 
        type: 'assignment', 
        subject: 'Physics', 
        time: '5 hours ago', 
        score: '95%',
        status: null,
        duration: null,
        color: 'from-green-400 to-green-600'
      },
      { 
        type: 'attendance', 
        subject: 'Chemistry', 
        time: '1 day ago', 
        status: 'Present',
        score: null,
        duration: null,
        color: 'from-purple-400 to-purple-600'
      },
      { 
        type: 'quiz', 
        subject: 'Computer Science', 
        time: '2 days ago', 
        score: '88%',
        status: null,
        duration: null,
        color: 'from-indigo-400 to-indigo-600'
      }
    ],
    weeklyProgress: [
      { day: 'Mon', hours: 3.5, goal: 4 },
      { day: 'Tue', hours: 4.2, goal: 4 },
      { day: 'Wed', hours: 2.8, goal: 4 },
      { day: 'Thu', hours: 5.1, goal: 4 },
      { day: 'Fri', hours: 3.9, goal: 4 },
      { day: 'Sat', hours: 6.2, goal: 6 },
      { day: 'Sun', hours: 4.8, goal: 6 }
    ],
    upcomingDeadlines: [
      { title: 'Math Assignment', subject: 'Mathematics', date: '2024-03-28', priority: 'high' },
      { title: 'Physics Lab Report', subject: 'Physics', date: '2024-03-30', priority: 'medium' },
      { title: 'Chemistry Quiz', subject: 'Chemistry', date: '2024-04-02', priority: 'low' }
    ],
    achievements: [
      { title: 'Study Streak', value: '15 days', icon: Zap, color: 'from-yellow-400 to-orange-500' },
      { title: 'Perfect Attendance', value: 'This month', icon: Award, color: 'from-green-400 to-green-600' },
      { title: 'Top Performer', value: 'Math', icon: Star, color: 'from-purple-400 to-purple-600' }
    ]
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch(activity.type) {
        case 'study': return <Clock className="w-4 h-4" />;
        case 'assignment': return <BookOpen className="w-4 h-4" />;
        case 'attendance': return <Calendar className="w-4 h-4" />;
        case 'quiz': return <Target className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
      }
    };

    return (
      <div className="group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 rounded-xl transition-all duration-300" />
        <div className="relative flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
          <div className={`p-3 bg-gradient-to-r ${activity.color} rounded-lg`}>
            <div className="text-white">{getIcon()}</div>
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{activity.subject}</div>
            <div className="text-sm text-white/60">
              {activity.duration || activity.score || activity.status} • {activity.time}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const SubjectCard = ({ subject, index }) => (
    <div 
      className="group relative cursor-pointer hover-lift"
      onClick={() => setSelectedSubject(subject)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-all duration-300`} />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-r ${subject.color} rounded-xl`}>
            <subject.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{subject.progress}%</div>
            <div className="text-xs text-white/60">Grade: {subject.grade}</div>
          </div>
        </div>
        <div className="text-white font-medium mb-3">{subject.name}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>{subject.credits} credits</span>
            {subject.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {subject.trend === 'stable' && <div className="w-3 h-3 bg-yellow-400 rounded-full" />}
          </div>
          <ProgressRing percentage={subject.progress} size={60} />
        </div>
      </div>
    </div>
  );

  const DeadlineCard = ({ deadline }) => {
    const getPriorityColor = () => {
      switch(deadline.priority) {
        case 'high': return 'from-red-400 to-red-600';
        case 'medium': return 'from-yellow-400 to-orange-500';
        case 'low': return 'from-green-400 to-green-600';
        default: return 'from-gray-400 to-gray-600';
      }
    };

    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 rounded-xl transition-all duration-300" />
        <div className="relative p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className={`p-2 bg-gradient-to-r ${getPriorityColor()} rounded-lg`}>
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{deadline.title}</div>
              <div className="text-xs text-white/60">{deadline.subject}</div>
              <div className="text-xs text-white/40 mt-1">{deadline.date}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/10 border-t-white/40 rounded-full animate-spin" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-white/20 rounded-full animate-spin" />
          </div>
          <div className="text-white/60 animate-pulse text-lg">Loading your academic dashboard...</div>
          <div className="text-white/40 text-sm animate-pulse">Preparing your insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <CompactSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

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
                <h1 className="text-4xl font-bold text-white mb-2 animate-fadeInUp">
                  Welcome back, Student! 👋
                </h1>
                <div className="text-lg text-white/80 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                You're performing <span className="text-green-400 font-semibold">10% above average</span> this semester 🚀
              </div>
              <div className="text-sm text-white/60 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Ranked {studentData.rank} of {studentData.totalStudents} students • Keep up the great work!
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">Student</div>
                  <div className="text-xs text-green-400">Online</div>
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
              trend="up"
            />
            <MetricCard 
              title="Attendance" 
              value={`${studentData.attendance}%`} 
              change={2.1}
              icon={Calendar}
              color="from-green-400 to-green-600"
              subtitle="Great consistency!"
              trend="up"
            />
            <MetricCard 
              title="Study Streak" 
              value={`${studentData.streak} days`} 
              change={3}
              icon={Zap}
              color="from-yellow-400 to-orange-500"
              subtitle="Keep it up!"
              trend="up"
            />
            <MetricCard 
              title="Pending Tasks" 
              value={studentData.tasks} 
              change={-2}
              icon={BookOpen}
              color="from-purple-400 to-purple-600"
              subtitle="Due this week"
              trend="down"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - 2 columns */}
            <div className="xl:col-span-2 space-y-8">
              {/* Subject Progress */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Subject Progress</h2>
                  <button className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentData.subjects.map((subject, index) => (
                    <SubjectCard key={index} subject={subject} index={index} />
                  ))}
                </div>
              </div>

              {/* Weekly Study Chart */}
              <StudyChart data={studentData.weeklyProgress} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Performance Prediction */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Performance Prediction</h2>
                </div>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-white mb-3">
                    {studentData.prediction}
                  </div>
                  <div className="text-white/80 mb-4">
                    Based on current trends
                  </div>
                  <div className="space-y-3">
                    {studentData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-white/80">
                        <div className={`p-2 bg-gradient-to-r ${achievement.color} rounded-lg`}>
                          <achievement.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-xs text-white/60">{achievement.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Upcoming Deadlines</h2>
                  <button className="text-white/60 hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {studentData.upcomingDeadlines.map((deadline, index) => (
                    <DeadlineCard key={index} deadline={deadline} />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-3">
                  {studentData.recentActivity.slice(0, 4).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300">
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

export default ModernStudentDashboard;
