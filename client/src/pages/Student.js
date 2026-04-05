
import { useEffect, useState, useMemo } from "react";
import api from "../api";
import {
  Trophy, BookOpen, Clock, Download,
  Bell, User, LogOut, ChevronRight,
  LayoutDashboard,
  Star, Brain,
  Moon, Sun, Quote, Send, Menu, CalendarDays,
  GraduationCap, Mail, Hash, School, RefreshCcw,
  BarChart3
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart as ReBarChart, Bar
} from "recharts";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import StudentMarksTab from './StudentMarksTab';

function letterGrade(marks) {
  const m = Number(marks);
  if (m >= 90) return "A";
  if (m >= 80) return "B";
  if (m >= 70) return "C";
  if (m >= 60) return "D";
  return "F";
}

function performanceLevel(avgPct, attPct) {
  const a = Number(avgPct) || 0;
  const t = Number(attPct) || 0;
  if (a >= 85 && t >= 80) return { label: "Excellent", sub: "Outstanding work", color: "#10b981", bg: "#ecfdf5", icon: "🌟" };
  if (a >= 70 && t >= 75) return { label: "Good", sub: "Keep up the momentum", color: "#2563eb", bg: "#eff6ff", icon: "👍" };
  if (a >= 55 || t >= 60) return { label: "Satisfactory", sub: "Room to grow", color: "#f59e0b", bg: "#fffbeb", icon: "📘" };
  return { label: "Needs Improvement", sub: "Focus on weak areas", color: "#ef4444", bg: "#fef2f2", icon: "⚠" };
}

export default function Student() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [stats, setStats] = useState({
    gpa: "0.00",
    attendance: "0",
    rank: "N/A",
    totalStudents: "0",
    predictedGpa: "0.00",
    weakSubjects: [],
    studyTime: [],
    goals: { targetGpa: 9.0, targetAttendance: 95 },
    notes: [],
    badges: [],
    focusSubjects: [],
  });
  const [goals, setGoals] = useState([
    { id: 1, subject: 'Mathematics', target: 90, current: 75, deadline: '2024-05-15' },
    { id: 2, subject: 'Physics', target: 85, current: 68, deadline: '2024-05-20' },
    { id: 3, subject: 'Chemistry', target: 80, current: 82, deadline: '2024-05-18' }
  ]);
  const [newGoal, setNewGoal] = useState({ subject: '', target: '', deadline: '' });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  // 🧠 Performance Prediction States
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const addGoal = () => {
    if (newGoal.subject && newGoal.target && newGoal.deadline) {
      const newId = Math.max(...goals.map(g => g.id), 0) + 1;
      setGoals([...goals, {
        id: newId,
        subject: newGoal.subject,
        target: Number(newGoal.target),
        current: 0,
        deadline: newGoal.deadline
      }]);
      setNewGoal({ subject: '', target: '', deadline: '' });
    }
  };

  const updateGoalProgress = (goalId, increment) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, current: Math.min(g.target, g.current + increment) }
        : g
    ));
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  // 🧠 Performance Prediction Function
  const fetchPerformancePrediction = async () => {
    setLoadingPrediction(true);
    try {
      const response = await api.get(`/students/${studentId}/prediction`);
      setPrediction(response.data);
    } catch (error) {
      console.error('❌ Error fetching prediction:', error);
      // Fallback prediction for demo
      setPrediction({
        student: {
          id: studentId,
          name: studentName,
          currentGPA: 7.5,
          currentAttendance: 78,
          totalMarks: marks.length
        },
        prediction: {
          predictedScore: 82,
          confidence: 78,
          trend: 'improving',
          trendPercent: 12,
          recommendation: 'Good performance expected. Continue current study habits.',
          factors: {
            recentAverage: 79,
            overallAverage: 76,
            attendanceImpact: 'neutral',
            dataPoints: marks.length
          }
        },
        generatedAt: new Date().toISOString()
      });
    } finally {
      setLoadingPrediction(false);
    }
  };
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [msgText, setMsgText] = useState("");

  const [quote, setQuote] = useState("Success is the sum of small efforts repeated daily.");

  const studentId = localStorage.getItem("userId");
  const studentName = localStorage.getItem("name") || "Student";
  const studentEmail = localStorage.getItem("email") || "";
  const rollNumber = localStorage.getItem("rollNumber") || "—";
  const department = localStorage.getItem("department") || "—";
  const semester = localStorage.getItem("semester") || "—";

  useEffect(() => {
    fetchData();
    fetchInitialChatData();
    const quotes = [
      "Success is not final, failure is not fatal.",
      "The only way to do great work is to love what you do.",
      "Your future is created by what you do today, not tomorrow.",
      "Hard work beats talent when talent doesn't work hard.",
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [studentId]);

  // 🧠 Fetch prediction when Performance Prediction tab is opened
  useEffect(() => {
    if (activeTab === "Performance Prediction" && !prediction) {
      fetchPerformancePrediction();
    }
  }, [activeTab]);

  const fetchData = async () => {
    if (!studentId) return;
    
    console.log('🔄 Starting data fetch for student:', studentId);
    
    try {
      const [marksRes, anncRes, statsRes, eventsRes, notifRes] = await Promise.all([
        api.get(`/student-marks/${studentId}`),
        api.get("/announcements"),
        api.get(`/student-dashboard/${studentId}`),
        api.get("/calendar-events"),
        api.get("/notifications?limit=25").catch(() => ({ data: { notifications: [] } })),
      ]);
      
      const allMarks = marksRes.data || [];
      console.log('📊 All marks fetched successfully:', {
        total: allMarks.length,
        subjects: [...new Set(allMarks.map(m => m.subject))],
        dateRange: {
          earliest: allMarks.length > 0 ? Math.min(...allMarks.map(m => new Date(m.date))) : null,
          latest: allMarks.length > 0 ? Math.max(...allMarks.map(m => new Date(m.date))) : null
        }
      });
      
      setMarks(allMarks);
      setAnnouncements(anncRes.data);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setNotifList(notifRes.data?.notifications || []);
      
      console.log('✅ All student data loaded successfully');
    } catch (err) {
      console.error("❌ Error fetching student data:", err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        url: `/student-marks/${studentId}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
  };

  const fetchInitialChatData = async () => {
    try {
      const res = await api.get("/faculty");
      setTeachers(res.data);
      console.log("Real faculty loaded:", res.data);
    } catch (e) {
      console.error("Error fetching teachers:", e);
      // Fallback to sample data matching real faculty
      setTeachers([
        { _id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@university.edu', department: 'Computer Science' },
        { _id: '2', name: 'Prof. Michael Chen', email: 'michael.chen@university.edu', department: 'Mathematics' },
        { _id: '3', name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@university.edu', department: 'Physics' },
        { _id: '4', name: 'Prof. David Kim', email: 'david.kim@university.edu', department: 'Chemistry' },
        { _id: '5', name: 'Dr. Lisa Anderson', email: 'lisa.anderson@university.edu', department: 'Biology' }
      ]);
    }
  };

  const fetchChatHistory = async (teacherId) => {
    try {
      const res = await api.get(`/messages/history/${teacherId}`);
      setChatHistory(res.data);
    } catch (e) {
      console.error("Error fetching chat history:", e);
      // Fallback to realistic sample messages
      const selectedTeacherName = selectedTeacher?.name || 'Teacher';
      setChatHistory([
        { 
          senderName: selectedTeacherName, 
          text: `Hello! I'm ${selectedTeacherName}. How can I help you with your studies today?`, 
          timestamp: new Date(Date.now() - 7200000) 
        },
        { 
          senderName: studentName, 
          text: `Hi ${selectedTeacherName}, I need help with understanding the recent assignment`, 
          timestamp: new Date(Date.now() - 3600000) 
        },
        { 
          senderName: selectedTeacherName, 
          text: 'Of course! Which specific topic or concept are you struggling with? I can provide additional resources or schedule a meeting.', 
          timestamp: new Date(Date.now() - 1800000) 
        }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!msgText || !selectedTeacher) return;
    
    try {
      // Add message to local chat immediately for better UX
      const newMessage = {
        senderName: studentName,
        text: msgText,
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, newMessage]);
      
      // Send to server
      await api.post("/messages", { receiverId: selectedTeacher._id, text: msgText });
      setMsgText('');
      
      // Simulate teacher response for demo
      setTimeout(() => {
        const teacherResponse = {
          senderName: selectedTeacher.name,
          text: 'Thanks for your message! I\'ll get back to you soon with detailed help.',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, teacherResponse]);
      }, 1500);
      
    } catch (e) {
      console.error("Error sending message:", e);
      // Still add the message locally even if API fails
      const newMessage = {
        senderName: studentName,
        text: msgText,
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, newMessage]);
      setMsgText('');
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Student Performance Report', 20, 20);
    
    // Student Info
    doc.setFontSize(12);
    doc.text(`Name: ${user?.name || 'N/A'}`, 20, 40);
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, 50);
    doc.text(`Department: ${user?.department || 'N/A'}`, 20, 60);
    doc.text(`Semester: ${user?.semester || 'N/A'}`, 20, 70);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Academic Summary
    doc.setFontSize(14);
    doc.text('Academic Summary', 20, 100);
    doc.setFontSize(12);
    doc.text(`GPA: ${stats.gpa || 'N/A'}`, 20, 115);
    doc.text(`Attendance: ${stats.attendance || 'N/A'}%`, 20, 125);
    doc.text(`Rank: ${stats.rank || 'N/A'} out of ${stats.totalStudents || 'N/A'}`, 20, 135);
    doc.text(`Predicted GPA: ${stats.predictedGpa || 'N/A'}`, 20, 145);
    
    // Marks Table
    if (marks.length > 0) {
      doc.setFontSize(14);
      doc.text('Subject-wise Performance', 20, 165);
      
      const tableData = marks.map(mark => [
        mark.subject || 'N/A',
        mark.marks?.toString() || 'N/A',
        letterGrade(mark.marks) || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Subject', 'Marks', 'Grade']],
        body: tableData,
        startY: 175,
      });
    }
    
    // Weak Subjects
    if (stats.weakSubjects && stats.weakSubjects.length > 0) {
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
      doc.setFontSize(14);
      doc.text('Areas for Improvement', 20, finalY);
      doc.setFontSize(12);
      
      stats.weakSubjects.forEach((subject, index) => {
        doc.text(`${index + 1}. ${subject.name}: ${subject.score} marks - ${subject.recommendation}`, 20, finalY + 15 + (index * 10));
      });
    }
    
    // Assigned Teacher
    if (stats.assignedTeacher) {
      const teacherY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : 240;
      doc.setFontSize(14);
      doc.text('Assigned Teacher', 20, teacherY);
      doc.setFontSize(12);
      doc.text(`Name: ${stats.assignedTeacher.name || 'N/A'}`, 20, teacherY + 15);
      doc.text(`Email: ${stats.assignedTeacher.email || 'N/A'}`, 20, teacherY + 25);
      doc.text(`Department: ${stats.assignedTeacher.department || 'N/A'}`, 20, teacherY + 35);
    }
    
    // Save the PDF
    doc.save(`student-report-${user?.name || 'student'}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const avgMarksPct = useMemo(() => {
    if (!marks.length) return 0;
    const sum = marks.reduce((a, m) => a + Number(m.marks || 0), 0);
    return Math.round(sum / marks.length);
  }, [marks]);

  const attendanceOverall = useMemo(() => Number(stats.attendance) || 0, [stats.attendance]);

  const perf = useMemo(() => performanceLevel(avgMarksPct, attendanceOverall), [avgMarksPct, attendanceOverall]);

  const chartMarksData = useMemo(() => {
    return marks.map((m, i) => ({
      name: m.subject?.slice(0, 12) || `S${i + 1}`,
      marks: Number(m.marks) || 0,
      attendance: Number(m.attendance) || 0,
    }));
  }, [marks]);

  const theme = {
    bg: darkMode ? "#0f172a" : "#f4f6f9",
    card: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#1e293b",
    subText: darkMode ? "#94a3b8" : "#64748b",
    border: darkMode ? "#334155" : "#e8ecf1",
  };

  

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: theme.text,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: darkMode ? "rgba(0, 0, 0, 0.55)" : "rgba(15, 23, 42, 0.45)",
            zIndex: 99,
          }}
        />
      )}

      {/* ——— Top bar ——— */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "14px 24px",
          background: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              cursor: "pointer",
              color: theme.text,
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "900", fontSize: "16px", letterSpacing: "-0.02em" }}>Academic Monitor</p>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: theme.subText }}>Student portal</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "12px",
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              fontWeight: "800",
              fontSize: "14px",
            }}
          >
            <User size={18} color="#2563eb" />
            {studentName}
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("Notifications")}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Profile")}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              background: theme.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Profile"
          >
            <User size={20} />
          </button>
          <button
            onClick={handleRefresh}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: theme.text,
              fontSize: "13px",
            }}
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={downloadReport}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: theme.text,
              fontSize: "13px",
            }}
          >
            <Download size={16} /> PDF
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: darkMode ? "#450a0a" : "#fff1f1",
              border: `1px solid ${darkMode ? "#7f1d1d" : "#fecaca"}`,
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "800",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="student-shell" style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "stretch" }}>
        {/* Sidebar */}
        <aside
          className="student-sidebar"
          style={{
            width: sidebarOpen ? "260px" : "0",
            flexShrink: 0,
            background: theme.card,
            borderRight: `1px solid ${theme.border}`,
            padding: sidebarOpen ? "24px 18px" : "0",
            position: "fixed",
            left: 0,
            top: "70px",
            height: "calc(100vh - 70px)",
            zIndex: 100,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
            overflowY: "auto",
            opacity: sidebarOpen ? 1 : 0,
          }}
        >
          <p style={{ margin: "0 0 12px 0", fontSize: "11px", fontWeight: "800", color: theme.subText, textTransform: "uppercase", letterSpacing: "0.06em" }}>Menu</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={BookOpen} label="Marks" />
          <SidebarItem icon={CalendarDays} label="Attendance" />
          <SidebarItem icon={Trophy} label="Goal Tracker" />
          <SidebarItem icon={Send} label="Chat with Teacher" />
          <SidebarItem icon={Clock} label="Daily Study Tracker" />
          <SidebarItem icon={BarChart3} label="Performance Prediction" />
          <SidebarItem icon={User} label="Profile" />

          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${theme.border}` }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                borderRadius: "14px",
                border: "none",
                background: theme.bg,
                color: theme.text,
                fontWeight: "800",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />} {darkMode ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px",
                borderRadius: "14px",
                border: "1px solid #fecaca",
                background: "#fff1f1",
                color: "#ef4444",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main
          className="student-main"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "28px 24px 48px",
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", letterSpacing: "-0.02em" }}>{activeTab}</h1>
            <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: theme.subText, fontWeight: "600" }}>
              {activeTab === "Dashboard" && (
                <>
                  Welcome back, <span style={{ color: "#2563eb" }}>{studentName}</span> · Predicted GPA {stats.predictedGpa}
                </>
              )}
              {activeTab !== "Dashboard" && "Manage your academic journey"}
            </p>
          </div>

          {/* ========== DASHBOARD ========== */}
          {activeTab === "Dashboard" && (
            <div style={{ display: "grid", gap: "24px" }}>
              {/* Profile summary */}
              <div
                style={{
                  background: theme.card,
                  borderRadius: "20px",
                  padding: "24px 28px",
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "24px",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "18px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      fontWeight: "900",
                    }}
                  >
                    {studentName.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>{studentName}</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "10px", fontSize: "13px", color: theme.subText, fontWeight: "600" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Hash size={14} /> Roll: {rollNumber}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <School size={14} /> {department}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <BookOpen size={14} /> Sem {semester}
                      </span>
                      {studentEmail && (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={14} /> {studentEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderRadius: "16px",
                    background: perf.bg,
                    border: `1px solid ${perf.color}33`,
                    textAlign: "center",
                    minWidth: "200px",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: "800", color: perf.color }}>
                    {perf.icon} Performance
                  </p>
                  <p style={{ margin: "6px 0 0 0", fontSize: "20px", fontWeight: "900", color: theme.text }}>{perf.label}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.subText, fontWeight: "600" }}>{perf.sub}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Avg marks", value: `${avgMarksPct}%`, icon: Star, accent: "#2563eb", light: "#eff6ff" },
                  { label: "Attendance", value: `${attendanceOverall}%`, icon: Clock, accent: "#10b981", light: "#ecfdf5" },
                  { label: "Subjects", value: String(marks.length || 0), icon: BookOpen, accent: "#8b5cf6", light: "#f5f3ff" },
                  { label: "Rank", value: `#${stats.rank}`, icon: Trophy, accent: "#f59e0b", light: "#fffbeb" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: theme.card,
                      borderRadius: "18px",
                      padding: "20px",
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: s.light, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>
                        <s.icon size={18} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>{s.label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "26px", fontWeight: "900" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                <div style={{ display: "grid", gap: "24px" }}>
                  {/* Marks table preview */}
                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Marks overview</h3>
                      <button type="button" onClick={() => setActiveTab("Marks")} style={{ border: "none", background: "transparent", color: "#2563eb", fontWeight: "800", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                        View all <ChevronRight size={16} />
                      </button>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                          <tr style={{ textAlign: "left", color: theme.subText, fontSize: "12px", fontWeight: "800" }}>
                            <th style={{ padding: "10px 8px" }}>Subject</th>
                            <th style={{ padding: "10px 8px" }}>Marks</th>
                            <th style={{ padding: "10px 8px" }}>Grade</th>
                            <th style={{ padding: "10px 8px" }}>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.slice(0, 6).map((m) => {
                            const mc = Number(m.marks) || 0;
                            const bg = mc >= 75 ? "rgba(16,185,129,0.08)" : mc >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
                            return (
                              <tr key={m._id} style={{ background: bg, borderBottom: `1px solid ${theme.border}` }}>
                                <td style={{ padding: "14px 12px", fontWeight: "800" }}>{m.subject}</td>
                                <td style={{ padding: "14px 12px", fontWeight: "600", color: theme.subText }}>{m.examType || "—"}</td>
                                <td style={{ padding: "14px 12px", fontWeight: "900", color: mc >= 75 ? "#059669" : mc >= 60 ? "#d97706" : "#dc2626" }}>{mc}%</td>
                                <td style={{ padding: "14px 12px", fontWeight: "900" }}>{letterGrade(mc)}</td>
                                <td style={{ padding: "14px 12px", fontWeight: "700" }}>{m.attendance ?? 0}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {marks.length === 0 && <p style={{ color: theme.subText, fontWeight: "600", margin: "16px 0 0 0" }}>No marks recorded yet.</p>}
                    </div>
                  </div>

                  {/* Performance chart */}
                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: "0 0 18px 0", fontSize: "17px", fontWeight: "800" }}>Performance trend</h3>
                    <div style={{ height: "260px" }}>
                      <ResponsiveContainer>
                        <AreaChart data={chartMarksData.length ? chartMarksData : [{ name: "-", marks: 0 }]}>
                          <defs>
                            <linearGradient id="stuG" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={0.6} />
                          <XAxis dataKey="name" tick={{ fill: theme.subText, fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: theme.subText, fontSize: 11 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="marks" stroke="#2563eb" strokeWidth={4} fill="url(#stuG)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Attendance bars */}
                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Attendance by subject</h3>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "#2563eb" }}>Overall {attendanceOverall}%</span>
                    </div>
                    <div style={{ display: "grid", gap: "14px" }}>
                      {marks.map((m) => {
                        const pct = Math.min(100, Math.max(0, Number(m.attendance) || 0));
                        const barColor = pct >= 80 ? "#10b981" : pct >= 75 ? "#3b82f6" : "#ef4444";
                        return (
                          <div key={m._id}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", fontWeight: "700" }}>
                              <span>{m.subject}</span>
                              <span style={{ color: theme.subText }}>{pct}%</span>
                            </div>
                            <div style={{ height: "10px", borderRadius: "6px", background: theme.bg, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "6px", transition: "width 0.4s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                      {marks.length === 0 && <p style={{ color: theme.subText, fontWeight: "600" }}>No subject-wise attendance yet.</p>}
                    </div>
                  </div>
                </div>

                {/* Notifications + quote */}
                <div style={{ display: "grid", gap: "20px", alignContent: "start" }}>
                  <div style={{ background: theme.card, borderRadius: "20px", padding: "22px", border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Bell size={18} color="#2563eb" /> Notifications
                    </h3>
                    <div style={{ display: "grid", gap: "10px", maxHeight: "280px", overflowY: "auto" }}>
                      {notifList.slice(0, 6).map((n) => (
                        <div key={n._id} style={{ padding: "12px 14px", borderRadius: "12px", background: theme.bg, border: `1px solid ${theme.border}`, fontSize: "13px" }}>
                          <p style={{ margin: 0, fontWeight: "800" }}>{n.title}</p>
                          <p style={{ margin: "6px 0 0 0", color: theme.subText, fontWeight: "600", lineHeight: 1.4 }}>{n.message}</p>
                        </div>
                      ))}
                      {attendanceOverall < 75 && (
                        <div style={{ padding: "12px 14px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "13px", color: "#b91c1c", fontWeight: "700" }}>
                          ⚠ Attendance below 75% — meet your faculty advisor.
                        </div>
                      )}
                      {announcements.slice(0, 2).map((a) => (
                        <div key={a._id} style={{ padding: "12px 14px", borderRadius: "12px", background: "#eff6ff", fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>
                          📢 {a.text?.slice(0, 120) || "Announcement"}
                        </div>
                      ))}
                <div style={{ 
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                  color: "white", 
                  padding: "24px", 
                  borderRadius: "20px", 
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)"
                }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "8px" }}>🎯</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", opacity: 0.9 }}>Total Goals</div>
                    <div style={{ fontSize: "32px", fontWeight: "900", marginTop: "8px" }}>{goals.length}</div>
                  </div>
                </div>
                
                <div style={{ 
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
                  color: "white", 
                  padding: "24px", 
                  borderRadius: "20px", 
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)"
                }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "8px" }}>✅</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", opacity: 0.9 }}>Completed</div>
                    <div style={{ fontSize: "32px", fontWeight: "900", marginTop: "8px" }}>
                      {goals.filter(g => g.current >= g.target).length}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
                  color: "white", 
                  padding: "24px", 
                  borderRadius: "20px", 
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)"
                }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "8px" }}>🚀</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", opacity: 0.9 }}>In Progress</div>
                    <div style={{ fontSize: "32px", fontWeight: "900", marginTop: "8px" }}>
                      {goals.filter(g => g.current < g.target && g.current > 0).length}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                  color: "white", 
                  padding: "24px", 
                  borderRadius: "20px", 
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 25px rgba(139, 92, 246, 0.2)"
                }}>
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "48px", fontWeight: "900", marginBottom: "8px" }}>📈</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", opacity: 0.9 }}>Success Rate</div>
                    <div style={{ fontSize: "32px", fontWeight: "900", marginTop: "8px" }}>
                      {goals.length > 0 ? Math.round((goals.filter(g => g.current >= g.target).length / goals.length) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Goal */}
              <div style={{ 
                background: theme.card, 
                borderRadius: "24px", 
                padding: "32px", 
                border: `1px solid ${theme.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "900", background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  🎯 Set New Academic Goal
                </h3>
                <div style={{ display: "grid", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        📚 Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mathematics"
                        value={newGoal.subject}
                        onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: `2px solid ${theme.border}`,
                          background: theme.bg,
                          color: theme.text,
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        🎯 Target Score
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 90"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          border: `2px solid ${theme.border}`,
                          background: theme.bg,
                          color: theme.text,
                          fontSize: "14px",
                          fontWeight: "600",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                      📅 Deadline
                    </label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "16px",
                        borderRadius: "12px",
                        border: `2px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                    />
                  </div>
                      ))}
                      {notifList.length === 0 && announcements.length === 0 && attendanceOverall >= 75 && (
                        <p style={{ color: theme.subText, fontSize: "13px", fontWeight: "600", margin: 0 }}>You’re all caught up.</p>
                      )}
                    </div>
                    <button type="button" onClick={() => setActiveTab("Notifications")} style={{ marginTop: "14px", width: "100%", padding: "10px", borderRadius: "12px", border: `1px solid ${theme.border}`, background: theme.bg, fontWeight: "800", cursor: "pointer", color: theme.text }}>
                      All notifications
                    </button>
                  </div>
                  <div style={{ background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)", color: "white", borderRadius: "20px", padding: "22px", position: "relative", overflow: "hidden" }}>
                    <Quote size={80} style={{ position: "absolute", right: "-10px", bottom: "-10px", opacity: 0.12 }} />
                    <p style={{ fontSize: "11px", fontWeight: "800", color: "#93c5fd", textTransform: "uppercase", marginBottom: "8px" }}>Daily spark</p>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", lineHeight: 1.5, fontStyle: "italic" }}>&quot;{quote}&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
                    }}
                  >
                    ✨ Add Goal
                  </button>
                </div>
              </div>

              {/* Goals List */}
              <div style={{ display: "grid", gap: "20px" }}>
                {goals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  const isCompleted = progress >= 100;
                  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={goal.id} style={{ 
                      background: theme.card, 
                      borderRadius: "20px", 
                      padding: "28px", 
                      border: `2px solid ${isCompleted ? '#10b981' : theme.border}`,
                      boxShadow: isCompleted ? "0 8px 32px rgba(16, 185, 129, 0.15)" : "0 8px 32px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      {isCompleted && (
                        <div style={{ 
                          position: "absolute", 
                          top: "12px", 
                          right: "12px", 
                          background: "#10b981", 
                          color: "white", 
                          padding: "6px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          fontWeight: "800",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          ✅ ACHIEVED
                        </div>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "900", color: theme.text }}>
                            📚 {goal.subject}
                          </h4>
                          <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: theme.subText }}>
                            <span style={{ fontWeight: "700" }}>📊 Progress: {goal.current}/{goal.target}</span>
                            <span style={{ fontWeight: "700" }}>📅 Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "32px", fontWeight: "900", color: isCompleted ? "#10b981" : "#2563eb", marginBottom: "4px" }}>
                            {Math.round(progress)}%
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: theme.subText }}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ 
                          height: "12px", 
                          borderRadius: "8px", 
                          background: theme.border, 
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: "100%",
                            background: isCompleted 
                              ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                              : progress > 50 
                                ? "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"
                                : "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                            borderRadius: "8px",
                            transition: "width 0.5s ease",
                            position: "relative"
                          }}>
                            {isCompleted && (
                              <div style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                right: "0",
                                bottom: "0",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: "8px"
                              }}></div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          onClick={() => updateGoalProgress(goal.id, 5)}
                          disabled={isCompleted}
                          style={{
                            padding: "12px 20px",
                            borderRadius: "12px",
                            border: "none",
                            background: isCompleted ? "#94a3b8" : "#10b981",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: isCompleted ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            opacity: isCompleted ? 0.6 : 1
                          }}
                        >
                          ⚡ +5%
                        </button>
                        <button
                          onClick={() => updateGoalProgress(goal.id, 10)}
                          disabled={isCompleted}
                          style={{
                            padding: "12px 20px",
                            borderRadius: "12px",
                            border: "none",
                            background: isCompleted ? "#94a3b8" : "#3b82f6",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: isCompleted ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            opacity: isCompleted ? 0.6 : 1
                          }}
                        >
                          🚀 +10%
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          style={{
                            padding: "12px 20px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#ef4444",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========== MARKS TAB ========== */}
          {activeTab === "Marks" && (
            <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>Subject marks</h2>
              <p style={{ margin: "0 0 24px 0", color: theme.subText, fontWeight: "600", fontSize: "14px" }}>Color-coded: green ≥75%, amber 60–74%, red &lt;60%</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
                  <thead>
                    <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: theme.subText, borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: "14px 12px" }}>Subject</th>
                      <th style={{ padding: "14px 12px" }}>Exam</th>
                      <th style={{ padding: "14px 12px" }}>Marks</th>
                      <th style={{ padding: "14px 12px" }}>Grade</th>
                      <th style={{ padding: "14px 12px" }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => {
                      const mc = Number(m.marks) || 0;
                      const bg = mc >= 75 ? "rgba(16,185,129,0.08)" : mc >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
                      return (
                        <tr key={m._id} style={{ background: bg, borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: "14px 12px", fontWeight: "800" }}>{m.subject}</td>
                          <td style={{ padding: "14px 12px", fontWeight: "600", color: theme.subText }}>{m.examType || "—"}</td>
                          <td style={{ padding: "14px 12px", fontWeight: "900", color: mc >= 75 ? "#059669" : mc >= 60 ? "#d97706" : "#dc2626" }}>{mc}%</td>
                          <td style={{ padding: "14px 12px", fontWeight: "900" }}>{letterGrade(mc)}</td>
                          <td style={{ padding: "14px 12px", fontWeight: "700" }}>{m.attendance ?? 0}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {marks.length === 0 && <p style={{ textAlign: "center", padding: "40px", color: theme.subText, fontWeight: "700" }}>No marks recorded.</p>}
              </div>
            </div>
          )}

          {/* ========== ATTENDANCE TAB ========== */}
          {activeTab === "Attendance" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>Overall attendance</p>
                <p style={{ margin: "6px 0 0 0", fontSize: "48px", fontWeight: "900", color: attendanceOverall >= 75 ? "#10b981" : "#ef4444" }}>{attendanceOverall}%</p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: theme.subText, fontWeight: "600" }}>Target: {stats.goals?.targetAttendance || 95}%</p>
              </div>
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontWeight: "800" }}>Subject-wise</h3>
                <div style={{ display: "grid", gap: "16px" }}>
                  {marks.map((m) => {
                    const pct = Math.min(100, Math.max(0, Number(m.attendance) || 0));
                    const barColor = pct >= 80 ? "#10b981" : pct >= 75 ? "#3b82f6" : "#ef4444";
                    return (
                      <div key={m._id}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "700" }}>
                          <span>{m.subject}</span>
                          <span style={{ color: theme.subText }}>{pct}%</span>
                        </div>
                        <div style={{ height: "12px", borderRadius: "8px", background: theme.bg, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "8px" }} />
                        </div>
                      </div>
                    );
                  })}
                  {marks.length === 0 && <p style={{ color: theme.subText }}>No attendance data.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ========== NOTIFICATIONS TAB ========== */}
          {activeTab === "Notifications" && (
            <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: "0 0 20px 0", fontWeight: "900" }}>All notifications</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {notifList.map((n) => (
                  <div key={n._id} style={{ padding: "16px 18px", borderRadius: "14px", background: theme.bg, border: `1px solid ${theme.border}` }}>
                    <p style={{ margin: 0, fontWeight: "800" }}>{n.title}</p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: theme.subText, fontWeight: "600" }}>{n.message}</p>
                  </div>
                ))}
                {events.length > 0 &&
                  events.slice(0, 5).map((ev) => (
                    <div key={ev._id} style={{ padding: "16px 18px", borderRadius: "14px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <p style={{ margin: 0, fontWeight: "800", color: "#1e40af" }}>📅 {ev.title}</p>
                      <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#1e3a8a" }}>{ev.type} · {ev.date}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========== CHAT WITH TEACHER ========== */}
          {/* {activeTab === "Chat with Teacher" && (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", minHeight: "480px" }}>
              <div style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, fontWeight: "800" }}>Faculty Members</div>
                <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                  {teachers.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        setSelectedTeacher(t);
                        fetchChatHistory(t._id);
                      }}
                      style={{
                        padding: "14px 16px",
                        cursor: "pointer",
                        background: selectedTeacher?._id === t._id ? theme.bg : "transparent",
                        fontWeight: "700",
                        borderBottom: `1px solid ${theme.border}`,
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "800"
                        }}>
                          {t.name.charAt(0)}
                        </div>
                        <span>{t.name}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: theme.subText, fontWeight: "600" }}>
                        {t.department || t.email || 'Faculty'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column" }}>
                {selectedTeacher ? (
                  <>
                    <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, background: theme.bg }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: "800"
                        }}>
                          {selectedTeacher.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "16px" }}>{selectedTeacher.name}</div>
                          <div style={{ fontSize: "12px", color: theme.subText, fontWeight: "600" }}>
                            {selectedTeacher.department || selectedTeacher.email || 'Faculty Member'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {chatHistory.map((msg, i) => (
                        <div key={i} style={{ alignSelf: msg.senderName === studentName ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: "16px",
                              background: msg.senderName === studentName ? "#2563eb" : theme.bg,
                              color: msg.senderName === studentName ? "white" : theme.text,
                              fontWeight: "600",
                              fontSize: "14px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}
                          >
                            {msg.text}
                          </div>
                          <div style={{ 
                            fontSize: "11px", 
                            color: theme.subText, 
                            fontWeight: "600",
                            marginTop: "4px",
                            textAlign: msg.senderName === studentName ? "right" : "left"
                          }}>
                            {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "10px" }}>
                      <input
                        placeholder="Type your message..."
                        style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <button type="button" onClick={handleSendMessage} style={{ background: "#2563eb", color: "white", border: "none", padding: "12px 18px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Send size={18} /> Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: theme.subText, fontWeight: "700", flexDirection: "column", gap: "16px" }}>
                    <div style={{ fontSize: "48px", opacity: 0.3 }}>💬</div>
                    <div>Select a faculty member to start chatting</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>Choose from the available teachers on the left</div>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* ========== DAILY STUDY TRACKER ========== */}
          {activeTab === "Daily Study Tracker" && (
            <div style={{ display: "grid", gap: "24px" }}>
              {/* Study Summary */}
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "24px", fontWeight: "900" }}>📅 Daily Study Tracker</h2>
                <p style={{ margin: "0 0 24px 0", color: theme.subText, fontWeight: "600" }}>
                  Track your study hours and daily progress
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                  <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", padding: "20px", borderRadius: "16px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800" }}>⏰ Today's Hours</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>4.5h</p>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", padding: "20px", borderRadius: "16px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800" }}>📚 Tasks Done</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>8/12</p>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", padding: "20px", borderRadius: "16px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800" }}>🔥 Streak</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>7 days</p>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "white", padding: "20px", borderRadius: "16px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800" }}>📊 Weekly Avg</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "900" }}>3.8h</p>
                  </div>
                </div>

                {/* Add Study Session */}
                <div style={{ background: theme.bg, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>➕ Add Study Session</h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                          Subject
                        </label>
                        <select style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: `1px solid ${theme.border}`,
                          background: theme.card,
                          color: theme.text,
                          fontSize: "14px"
                        }}>
                          <option>Mathematics</option>
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Computer Science</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          placeholder="2.5"
                          style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: `1px solid ${theme.border}`,
                            background: theme.card,
                            color: theme.text,
                            fontSize: "14px"
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        Topics Covered
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Calculus, Algebra problems"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "12px",
                          border: `1px solid ${theme.border}`,
                          background: theme.card,
                          color: theme.text,
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    <button
                      style={{
                        padding: "14px 24px",
                        borderRadius: "12px",
                        border: "none",
                        background: "#2563eb",
                        color: "white",
                        fontWeight: "800",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Add Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Sessions */}
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800" }}>📋 Today's Study Sessions</h3>
                
                <div style={{ display: "grid", gap: "16px" }}>
                  {[
                    { subject: "Mathematics", duration: "2.5h", topics: "Calculus, Derivatives", time: "9:00 AM", completed: true },
                    { subject: "Physics", duration: "1.5h", topics: "Newton's Laws", time: "12:00 PM", completed: true },
                    { subject: "Chemistry", duration: "1h", topics: "Organic Compounds", time: "3:00 PM", completed: false },
                  ].map((session, index) => (
                    <div key={index} style={{
                      background: theme.bg,
                      padding: "20px",
                      borderRadius: "16px",
                      border: `1px solid ${theme.border}`,
                      position: "relative"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: theme.text }}>
                            {session.subject}
                          </h4>
                          <p style={{ margin: 0, fontSize: "14px", color: theme.subText }}>
                            {session.duration} • {session.time}
                          </p>
                        </div>
                        <div style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "800",
                          background: session.completed ? "#10b98120" : "#f59e0b20",
                          color: session.completed ? "#059669" : "#d97706"
                        }}>
                          {session.completed ? "✅ Completed" : "⏳ In Progress"}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: "12px" }}>
                        <p style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: "700", color: theme.subText }}>Topics Covered</p>
                        <p style={{ margin: 0, fontSize: "14px", color: theme.text }}>{session.topics}</p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: theme.subText }}>Progress</span>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: session.completed ? "#10b981" : "#f59e0b" }}>
                            {session.completed ? "100%" : "75%"}
                          </span>
                        </div>
                        <div style={{
                          height: "8px",
                          borderRadius: "4px",
                          background: theme.border,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: session.completed ? "100%" : "75%",
                            height: "100%",
                            background: session.completed ? "#10b981" : "#3b82f6",
                            borderRadius: "4px",
                            transition: "width 0.3s ease"
                          }}></div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => updateGoalProgress(session.id, 5)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#10b981",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => deleteGoal(session.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#ef4444",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>📊 Weekly Progress</h3>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: theme.subText, width: "40px" }}>{day}</span>
                        <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: theme.border, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.random() * 80 + 20}%`,
                            height: "100%",
                            background: index < 5 ? "#10b981" : "#3b82f6",
                            borderRadius: "4px"
                          }}></div>
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: theme.text, width: "40px" }}>
                          {Math.floor(Math.random() * 4 + 1)}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>🎯 Study Goals</h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.text }}>Daily Target</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#3b82f6" }}>4.5/5 hours</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "4px", background: theme.border, overflow: "hidden" }}>
                        <div style={{ width: "90%", height: "100%", background: "#3b82f6", borderRadius: "4px" }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.text }}>Weekly Target</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#10b981" }}>26/35 hours</span>
                      </div>
                      <div style={{ height: "8px", borderRadius: "4px", background: theme.border, overflow: "hidden" }}>
                        <div style={{ width: "74%", height: "100%", background: "#10b981", borderRadius: "4px" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== PERFORMANCE PREDICTION ========== */}
          {activeTab === "Performance Prediction" && (
            <>
              <div style={{
                borderRadius: "20px",
                padding: "32px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "24px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800", color: theme.text }}>Current Performance</h3>
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: theme.bg, borderRadius: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.subText }}>Current GPA</span>
                        <span style={{ fontSize: "18px", fontWeight: "900", color: "#3b82f6" }}>{prediction.student.currentGPA}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: theme.bg, borderRadius: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.subText }}>Attendance</span>
                        <span style={{ fontSize: "18px", fontWeight: "900", color: prediction.student.currentAttendance >= 75 ? "#10b981" : "#ef4444" }}>
                          {prediction.student.currentAttendance}%
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: theme.bg, borderRadius: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.subText }}>Total Marks</span>
                        <span style={{ fontSize: "18px", fontWeight: "900", color: "#8b5cf6" }}>{prediction.student.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800", color: theme.text }}>Predicted Performance</h3>
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        borderRadius: "16px",
                        color: "white"
                      }}>
                        <span style={{ fontSize: "14px", fontWeight: "700" }}>Predicted Score</span>
                        <span style={{ fontSize: "32px", fontWeight: "900" }}>{prediction.prediction.predictedScore}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: theme.bg, borderRadius: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.subText }}>Confidence</span>
                        <span style={{
                          fontSize: "18px",
                          fontWeight: "900",
                          color: prediction.prediction.confidence >= 80 ? "#10b981" : prediction.prediction.confidence >= 60 ? "#f59e0b" : "#ef4444"
                        }}>
                          {prediction.prediction.confidence}%
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: theme.bg, borderRadius: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: theme.subText }}>Trend</span>
                        <span style={{
                          fontSize: "16px",
                          fontWeight: "900",
                          color: prediction.prediction.trend === 'improving' ? "#10b981" : prediction.prediction.trend === 'declining' ? "#ef4444" : "#6b7280"
                        }}>
                          {prediction.prediction.trend === 'improving' ? '📈 Improving' : prediction.prediction.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Recommendation */}
                <div style={{
                  padding: "20px",
                  background: prediction.prediction.predictedScore >= 75 ? "#f0fdf4" : prediction.prediction.predictedScore >= 60 ? "#fffbeb" : "#fef2f2",
                  borderRadius: "16px",
                  border: `1px solid ${prediction.prediction.predictedScore >= 75 ? "#bbf7d0" : prediction.prediction.predictedScore >= 60 ? "#fde68a" : "#fecaca"}`
                }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "800", color: theme.text }}>🎯 Recommendation</h4>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", lineHeight: 1.5, color: theme.text }}>
                    {prediction.prediction.recommendation}
                  </p>
                </div>
                {/* Detailed Analysis and Generated Info */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "24px" }}>
                  <div style={{
                    background: theme.card,
                    borderRadius: "16px",
                    padding: "24px",
                    border: `1px solid ${theme.border}`
                  }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: theme.text }}>📊 Prediction Factors</h4>
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: theme.subText }}>Recent Average</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: theme.text }}>{prediction.prediction.factors.recentAverage}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: theme.subText }}>Overall Average</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: theme.text }}>{prediction.prediction.factors.overallAverage}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: theme.subText }}>Data Points</span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: theme.text }}>{prediction.prediction.factors.dataPoints}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: theme.subText }}>Attendance Impact</span>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color: prediction.prediction.factors.attendanceImpact === 'positive' ? "#10b981" : prediction.prediction.factors.attendanceImpact === 'negative' ? "#ef4444" : "#6b7280"
                        }}>
                          {prediction.prediction.factors.attendanceImpact === 'positive' ? '🟢 Positive' : prediction.prediction.factors.attendanceImpact === 'negative' ? '🔴 Negative' : '🟡 Neutral'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: theme.card,
                    borderRadius: "16px",
                    padding: "24px",
                    border: `1px solid ${theme.border}`
                  }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: theme.text }}>📈 Trend Analysis</h4>
                    <div style={{ display: "grid", gap: "16px" }}>
                      <div style={{
                        padding: "16px",
                        background: prediction.prediction.trend === 'improving' ? "#dcfce7" : prediction.prediction.trend === 'declining' ? "#fee2e2" : "#f3f4f6",
                        borderRadius: "12px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "8px" }}>
                          {prediction.prediction.trend === 'improving' ? '📈' : prediction.prediction.trend === 'declining' ? '📉' : '➡️'}
                        </div>
                        <div style={{ fontSize: "18px", fontWeight: "800", color: theme.text }}>
                          {prediction.prediction.trendPercent > 0 ? '+' : ''}{prediction.prediction.trendPercent}%
                        </div>
                      </div>
                      <div style={{ padding: "16px", background: theme.bg, borderRadius: "12px" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: theme.subText, lineHeight: 1.5 }}>
                          Based on your last {Math.min(3, prediction.prediction.factors.dataPoints)} assessments, your performance is showing a {prediction.prediction.trend} trend.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "16px",
                  background: theme.bg,
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: theme.subText,
                  fontWeight: "600",
                  marginTop: "24px"
                }}>
                  🔮 Generated on {new Date(prediction.generatedAt).toLocaleString()} using AI analysis
                </div>
              </div>
            </>

          {/* ========== MARKS TAB ========== */}
          {/* <StudentMarksTab activeTab={activeTab} /> */}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .student-shell { 
            padding-left: 0; /* Remove fixed padding */
          }
          .student-main {
            margin-left: 0; /* Remove fixed margin */
          }
        }
      `}</style>
    </div>
  );
}
