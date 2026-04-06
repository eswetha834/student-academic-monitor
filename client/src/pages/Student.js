import { useEffect, useState, useMemo } from "react";
import api from "../api";
import {
  Trophy, BookOpen, Clock, Download,
  User, LogOut, ChevronRight,
  LayoutDashboard,
  Star, Brain,
  Moon, Sun, Quote, Send, Menu, CalendarDays,
  GraduationCap, Mail, Hash, School, RefreshCcw,
  BarChart3, AlertTriangle, TrendingUp, TrendingDown, Info
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart as ReBarChart, Bar
} from "recharts";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Student = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ subject: "", target: "", deadline: "", current: "" });
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [quote, setQuote] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [studySessions, setStudySessions] = useState([]);
  const [newSession, setNewSession] = useState({ subject: "", duration: "", topics: "", progress: "" });
  const [editableAlerts, setEditableAlerts] = useState({});

  const theme = {
    bg: darkMode ? "#0f172a" : "#f8fafc",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    subText: darkMode ? "#94a3b8" : "#64748b",
    card: darkMode ? "#1e293b" : "#ffffff",
    border: darkMode ? "#334155" : "#e8ecf1",
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        setStudentId(res.data._id);
        setStudentName(res.data.name);
        setStudentEmail(res.data.email);
        setDepartment(res.data.department || "Computer Science");
        setSemester(res.data.semester || "6th");
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get("/stats/student");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchMarks = async () => {
      try {
        const res = await api.get("/marks");
        setMarks(res.data);
      } catch (error) {
        console.error("Error fetching marks:", error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance");
        setAttendance(res.data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchGoals = async () => {
      try {
        const res = await api.get("/goals");
        setGoals(res.data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    const fetchTeachers = async () => {
      try {
        const res = await api.get("/teachers");
        setTeachers(res.data);
      } catch (e) {
        console.error("Error fetching teachers:", e);
        setTeachers([
          { _id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.johnson@university.edu', department: 'Computer Science' },
          { _id: '2', name: 'Prof. Michael Chen', email: 'michael.chen@university.edu', department: 'Mathematics' },
          { _id: '3', name: 'Dr. Emily Davis', email: 'emily.davis@university.edu', department: 'Physics' },
        ]);
      }
    };

    const fetchStudySessions = async () => {
      try {
        const res = await api.get("/study-sessions");
        setStudySessions(res.data);
      } catch (error) {
        console.error("Error fetching study sessions:", error);
      }
    };

    fetchStudentData();
    fetchStats();
    fetchMarks();
    fetchAttendance();
    fetchEvents();
    fetchGoals();
    fetchTeachers();
    fetchStudySessions();
  }, []);

  const fetchPerformancePrediction = async () => {
    setLoadingPrediction(true);
    try {
      const response = await api.get(`/students/${studentId}/prediction`);
      setPrediction(response.data);
    } catch (error) {
      console.error('❌ Error fetching prediction:', error);
      setPrediction({
        student: {
          id: studentId,
          name: studentName,
          currentGPA: 3.2,
          totalCredits: 90,
          completedCourses: 30,
          attendanceRate: 85,
          studyHours: 25,
          weakSubjects: ['Mathematics', 'Physics']
        },
        prediction: {
          predictedScore: 78,
          confidence: 85,
          factors: {
            attendance: 0.3,
            studyHours: 0.25,
            pastPerformance: 0.35,
            subjectDifficulty: 0.1
          },
          recommendation: "Focus on improving attendance and increasing daily study hours by 2-3 hours to achieve better results."
        }
      });
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Performance Prediction" && !prediction) {
      fetchPerformancePrediction();
    }
  }, [activeTab]);

  const addGoal = async () => {
    if (!newGoal.subject || !newGoal.target || !newGoal.deadline) return;
    
    try {
      const goalData = {
        ...newGoal,
        studentId,
        current: parseInt(newGoal.current) || 0,
        target: parseInt(newGoal.target),
        deadline: new Date(newGoal.deadline),
        createdAt: new Date()
      };
      
      const response = await api.post("/goals", goalData);
      setGoals([...goals, response.data]);
      setNewGoal({ subject: "", target: "", deadline: "", current: "" });
    } catch (error) {
      console.error("Error adding goal:", error);
      const fallbackGoal = {
        id: Date.now().toString(),
        ...newGoal,
        current: parseInt(newGoal.current) || 0,
        target: parseInt(newGoal.target),
        deadline: new Date(newGoal.deadline),
        createdAt: new Date()
      };
      setGoals([...goals, fallbackGoal]);
      setNewGoal({ subject: "", target: "", deadline: "", current: "" });
    }
  };

  const updateGoalProgress = async (goalId, increment) => {
    try {
      await api.patch(`/goals/${goalId}`, { increment });
      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, current: Math.min(goal.current + increment, goal.target) }
          : goal
      ));
    } catch (error) {
      console.error("Error updating goal:", error);
      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, current: Math.min(goal.current + increment, goal.target) }
          : goal
      ));
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  };

  const sendMessage = async () => {
    if (!msgText || !selectedTeacher) return;
    
    try {
      const newMessage = {
        senderName: studentName,
        text: msgText,
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, newMessage]);
      await api.post("/messages", { receiverId: selectedTeacher._id, text: msgText });
      setMsgText('');
      
      setTimeout(() => {
        const teacherResponse = {
          senderName: selectedTeacher.name,
          text: "Thank you for your message. I'll get back to you soon with detailed feedback.",
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, teacherResponse]);
      }, 1500);
      
    } catch (e) {
      console.error("Error sending message:", e);
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
    doc.setFontSize(20);
    doc.text('Student Performance Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${studentName}`, 20, 40);
    doc.text(`Email: ${studentEmail}`, 20, 50);
    doc.text(`Department: ${department}`, 20, 60);
    doc.text(`Semester: ${semester}`, 20, 70);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 80);
    
    doc.setFontSize(14);
    doc.text('Academic Summary', 20, 100);
    doc.setFontSize(12);
    doc.text(`Current GPA: ${stats.currentGpa || 'N/A'}`, 20, 115);
    doc.text(`Total Credits: ${stats.totalCredits || 'N/A'}`, 20, 125);
    doc.text(`Rank: ${stats.rank || 'N/A'} out of ${stats.totalStudents || 'N/A'}`, 20, 135);
    doc.text(`Predicted GPA: ${stats.predictedGpa || 'N/A'}`, 20, 145);
    
    if (marks.length > 0) {
      doc.setFontSize(14);
      doc.text('Subject-wise Performance', 20, 165);
      
      const tableData = marks.map(mark => [
        mark.subject || 'N/A',
        mark.marks?.toString() || 'N/A',
        mark.grade || 'N/A'
      ]);
      
      autoTable(doc, {
        head: [['Subject', 'Marks', 'Grade']],
        body: tableData,
        startY: 175,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      });
    }
    
    if (stats.weakSubjects && stats.weakSubjects.length > 0) {
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 200;
      doc.setFontSize(14);
      doc.text('Areas for Improvement', 20, finalY);
      doc.setFontSize(12);
      
      stats.weakSubjects.forEach((subject, index) => {
        doc.text(`${index + 1}. ${subject.name}: ${subject.score} marks - ${subject.recommendation}`, 20, finalY + 15 + (index * 10));
      });
    }
    
    if (stats.assignedTeacher) {
      const teacherY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : 240;
      doc.setFontSize(14);
      doc.text('Assigned Teacher', 20, teacherY);
      doc.setFontSize(12);
      doc.text(`Name: ${stats.assignedTeacher.name || 'N/A'}`, 20, teacherY + 15);
      doc.text(`Email: ${stats.assignedTeacher.email || 'N/A'}`, 20, teacherY + 25);
      doc.text(`Department: ${stats.assignedTeacher.department || 'N/A'}`, 20, teacherY + 35);
    }
    
    doc.save(`student-report-${studentName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const avgMarksPct = useMemo(() => {
    if (!marks.length) return 0;
    const total = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
    return Math.round(total / marks.length);
  }, [marks]);

  const attendanceOverall = useMemo(() => {
    if (!marks.length) return 0;
    const total = marks.reduce((sum, m) => sum + (Number(m.attendance) || 0), 0);
    return Math.round(total / marks.length);
  }, [marks]);

  const letterGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    return "F";
  };

  const performanceAlerts = useMemo(() => {
    const alerts = [];
    
    // Low performance alerts
    if (avgMarksPct < 60) {
      alerts.push({
        type: 'critical',
        title: 'Critical: Academic Performance',
        message: 'Your average marks are below 60%. Immediate action required.',
        icon: AlertTriangle,
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.08)',
        action: 'View Marks'
      });
    } else if (avgMarksPct < 75) {
      alerts.push({
        type: 'warning',
        title: 'Performance Alert',
        message: 'Your average marks are below 75%. Focus on improvement.',
        icon: TrendingDown,
        color: '#d97706',
        bgColor: 'rgba(217, 119, 6, 0.08)',
        action: 'Study Plan'
      });
    }

    // Attendance alerts
    if (attendanceOverall < 75) {
      alerts.push({
        type: 'critical',
        title: 'Attendance Warning',
        message: 'Your attendance is below 75%. This may affect your grades.',
        icon: AlertTriangle,
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.08)',
        action: 'View Attendance'
      });
    } else if (attendanceOverall < 85) {
      alerts.push({
        type: 'warning',
        title: 'Attendance Alert',
        message: 'Your attendance is below 85%. Try to maintain better attendance.',
        icon: Info,
        color: '#d97706',
        bgColor: 'rgba(217, 119, 6, 0.08)',
        action: 'Improve Attendance'
      });
    }

    // Subject-specific alerts - Enhanced with detailed analysis
    const lowPerformingSubjects = marks.filter(m => Number(m.marks) < 60);
    const averagePerformingSubjects = marks.filter(m => Number(m.marks) >= 60 && Number(m.marks) < 75);
    const excellentSubjects = marks.filter(m => Number(m.marks) >= 85);
    
    // Individual alerts for each low-performing subject
    lowPerformingSubjects.forEach(subject => {
      const marksValue = Number(subject.marks);
      const attendanceValue = Number(subject.attendance) || 0;
      
      alerts.push({
        type: 'critical',
        title: `${subject.subject} Needs Immediate Attention`,
        message: `Score: ${marksValue}% (${letterGrade(marksValue)}). Attendance: ${attendanceValue}%. This subject requires urgent focus to improve your overall performance.`,
        icon: AlertTriangle,
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.08)',
        action: 'View Marks',
        subjectName: subject.subject,
        subjectMarks: marksValue,
        subjectAttendance: attendanceValue
      });
    });

    // Alerts for average-performing subjects that need improvement
    averagePerformingSubjects.forEach(subject => {
      const marksValue = Number(subject.marks);
      const attendanceValue = Number(subject.attendance) || 0;
      
      alerts.push({
        type: 'warning',
        title: `Improve ${subject.subject} Performance`,
        message: `Current: ${marksValue}% (${letterGrade(marksValue)}). With focused effort, you can reach excellence in this subject.`,
        icon: TrendingDown,
        color: '#d97706',
        bgColor: 'rgba(217, 119, 6, 0.08)',
        action: 'Study Plan',
        subjectName: subject.subject,
        subjectMarks: marksValue,
        subjectAttendance: attendanceValue
      });
    });

    // Celebration for excellent subjects
    if (excellentSubjects.length > 0) {
      alerts.push({
        type: 'success',
        title: 'Outstanding Subject Performance!',
        message: `Excellent work in ${excellentSubjects.length} subject(s): ${excellentSubjects.map(s => s.subject).join(', ')}. Keep up the great performance!`,
        icon: TrendingUp,
        color: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.08)',
        action: 'View Progress'
      });
    }

    // Overall subject performance summary
    if (lowPerformingSubjects.length > 0 || averagePerformingSubjects.length > 0) {
      const totalSubjectsNeedingFocus = lowPerformingSubjects.length + averagePerformingSubjects.length;
      alerts.push({
        type: 'info',
        title: 'Subject Focus Summary',
        message: `Out of ${marks.length} subjects: ${excellentSubjects.length} excellent, ${averagePerformingSubjects.length} need improvement, ${lowPerformingSubjects.length} need urgent focus.`,
        icon: Info,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.08)',
        action: 'Focus Areas'
      });
    }

    // Positive alerts - More flexible criteria
    if (avgMarksPct >= 85) {
      alerts.push({
        type: 'success',
        title: 'Excellent Academic Performance!',
        message: `Outstanding work! Your average marks of ${avgMarksPct}% are exceptional.`,
        icon: TrendingUp,
        color: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.08)',
        action: 'View Progress'
      });
    } else if (avgMarksPct >= 75) {
      alerts.push({
        type: 'success',
        title: 'Good Performance!',
        message: `Great job! Your average marks of ${avgMarksPct}% are solid. Keep it up!`,
        icon: TrendingUp,
        color: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.08)',
        action: 'View Progress'
      });
    }

    // Attendance-specific positive alert
    if (attendanceOverall >= 90) {
      alerts.push({
        type: 'success',
        title: 'Excellent Attendance!',
        message: `Perfect! Your attendance of ${attendanceOverall}% is outstanding.`,
        icon: TrendingUp,
        color: '#059669',
        bgColor: 'rgba(5, 150, 105, 0.08)',
        action: 'View Attendance'
      });
    }

    // Combined excellence alert (both marks and attendance are excellent)
    if (avgMarksPct >= 85 && attendanceOverall >= 90) {
      // Add this as a special achievement alert
      const existingExcellenceAlert = alerts.find(a => a.title.includes('Excellent Academic Performance'));
      if (existingExcellenceAlert) {
        existingExcellenceAlert.title = 'Perfect Performance!';
        existingExcellenceAlert.message = `Outstanding! ${avgMarksPct}% marks and ${attendanceOverall}% attendance - you're excelling in all areas!`;
      }
    }

    // Goal progress alerts
    const goalsInProgress = goals.filter(g => g.current && g.target && (Number(g.current) / Number(g.target)) < 0.5);
    if (goalsInProgress.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Goal Progress Reminder',
        message: `${goalsInProgress.length} goal(s) need more attention to reach targets.`,
        icon: Info,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.08)',
        action: 'Update Goals'
      });
    }

    return alerts.slice(0, 3); // Show max 3 alerts
  }, [avgMarksPct, attendanceOverall, marks, goals]);

  const chartData = useMemo(() => {
    return marks.map(m => ({
      subject: m.subject,
      marks: Number(m.marks) || 0,
      attendance: Number(m.attendance) || 0
    }));
  }, [marks]);

  useEffect(() => {
    const quotes = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "Education is the most powerful weapon which you can use to change the world.",
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [studentId]);

  useEffect(() => {
    if (selectedTeacher) {
      const fetchChatHistory = async () => {
        try {
          const res = await api.get(`/messages/${selectedTeacher._id}`);
          setChatHistory(res.data);
        } catch (e) {
          console.error("Error fetching chat history:", e);
          const selectedTeacherName = selectedTeacher?.name || 'Teacher';
          setChatHistory([
            { 
              senderName: selectedTeacherName, 
              text: "Hello! I'm here to help you with your academic journey. Feel free to ask any questions.", 
              timestamp: new Date(Date.now() - 86400000) 
            }
          ]);
        }
      };
      fetchChatHistory();
    }
  }, [selectedTeacher]);

  const addStudySession = async () => {
    if (!newSession.subject || !newSession.duration || !newSession.topics) return;
    
    try {
      const sessionData = {
        ...newSession,
        studentId,
        duration: parseInt(newSession.duration),
        progress: parseInt(newSession.progress) || 0,
        date: new Date(),
        createdAt: new Date()
      };
      
      const response = await api.post("/study-sessions", sessionData);
      setStudySessions([...studySessions, response.data]);
      setNewSession({ subject: "", duration: "", topics: "", progress: "" });
    } catch (error) {
      console.error("Error adding study session:", error);
      const fallbackSession = {
        id: Date.now().toString(),
        ...newSession,
        duration: parseInt(newSession.duration),
        progress: parseInt(newSession.progress) || 0,
        date: new Date(),
        createdAt: new Date()
      };
      setStudySessions([...studySessions, fallbackSession]);
      setNewSession({ subject: "", duration: "", topics: "", progress: "" });
    }
  };

  const updateSessionProgress = async (sessionId, increment) => {
    try {
      await api.patch(`/study-sessions/${sessionId}`, { increment });
      setStudySessions(studySessions.map(session => 
        session.id === sessionId 
          ? { ...session, progress: Math.min(session.progress + increment, 100) }
          : session
      ));
    } catch (error) {
      console.error("Error updating session:", error);
      setStudySessions(studySessions.map(session => 
        session.id === sessionId 
          ? { ...session, progress: Math.min(session.progress + increment, 100) }
          : session
      ));
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/study-sessions/${sessionId}`);
      setStudySessions(studySessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
      setStudySessions(studySessions.filter(session => session.id !== sessionId));
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: theme.text, fontWeight: "600" }}>Loading your academic dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", maxWidth: "100%", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "900" }}>Academic Monitor</h1>
                <p style={{ margin: 0, fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Student Portal</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                background: theme.bg,
                color: theme.text,
                cursor: "pointer",
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={20} color="#6b7280" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>{studentName}</p>
                <p style={{ margin: 0, fontSize: "12px", color: theme.subText, fontWeight: "600" }}>{department}</p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#ef4444",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              data-sidebar-toggle="true"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: window.innerWidth <= 768 ? "flex" : "none",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "none",
                background: theme.card,
                color: theme.text,
                cursor: "pointer",
                marginLeft: "8px",
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="student-shell" style={{ display: "flex", flex: 1, minHeight: 0, alignItems: "stretch" }}>
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className="student-sidebar"
          style={{
            position: window.innerWidth <= 768 ? "fixed" : "relative",
            top: window.innerWidth <= 768 ? "0" : "auto",
            left: window.innerWidth <= 768 ? (isSidebarOpen ? "0" : "-260px") : "auto",
            height: window.innerWidth <= 768 ? "100vh" : "auto",
            zIndex: window.innerWidth <= 768 ? 1001 : "auto",
            width: "260px",
            background: theme.card,
            borderRight: `1px solid ${theme.border}`,
            padding: "24px 16px",
            overflowY: "auto",
            transition: "left 0.3s ease",
            display: window.innerWidth <= 768 && !isSidebarOpen ? "none" : "block",
          }}
        >
          <p style={{ margin: "0 0 12px 0", fontSize: "11px", fontWeight: "800", color: theme.subText, textTransform: "uppercase", letterSpacing: "0.06em" }}>Menu</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={BookOpen} label="Marks" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={CalendarDays} label="Attendance" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={Trophy} label="Goal Tracker" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={AlertTriangle} label="Performance Alerts" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={Send} label="Chat with Teacher" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={Clock} label="Daily Study Tracker" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={BarChart3} label="Performance Prediction" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />
          <SidebarItem icon={User} label="Profile" activeTab={activeTab} setActiveTab={setActiveTab} closeSidebar={() => setIsSidebarOpen(false)} />

          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: `1px solid ${theme.border}` }}>
            <button
              onClick={downloadReport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                maxWidth: "300px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
        </aside>

        <main
          className="student-main"
          style={{
            flex: 1,
            padding: "32px",
            overflowY: "auto",
            background: theme.bg,
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "900", letterSpacing: "-0.02em" }}>{activeTab}</h1>
            <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#ffffff", fontWeight: "600" }}>
              {activeTab === "Dashboard" && (
                <>
                  Welcome back, <span style={{ color: "#60a5fa" }}>{studentName}</span> · Predicted GPA {stats.predictedGpa}
                </>
              )}
              {activeTab !== "Dashboard" && "Manage your academic journey"}
            </p>
          </div>

          {activeTab === "Dashboard" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div
                style={{
                  background: theme.card,
                  borderRadius: "20px",
                  padding: "28px",
                  border: `1px solid ${theme.border}`,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "24px",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>Current GPA</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "32px", fontWeight: "900", color: "#3b82f6" }}>{stats.currentGpa || "N/A"}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Target: {stats.targetGpa || "4.0"}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>Rank</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "32px", fontWeight: "900", color: "#10b981" }}>#{stats.rank || "N/A"}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Out of {stats.totalStudents || "N/A"} students</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>Attendance</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "32px", fontWeight: "900", color: attendanceOverall >= 75 ? "#10b981" : "#ef4444" }}>{attendanceOverall}%</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Target: 95%</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: theme.subText, textTransform: "uppercase" }}>Credits</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "32px", fontWeight: "900", color: "#8b5cf6" }}>{stats.totalCredits || "N/A"}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Completed</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Avg marks", value: `${avgMarksPct}%`, icon: Star, accent: "#2563eb", light: "#eff6ff" },
                  { label: "Study hours/week", value: stats.weeklyStudyHours || "25", icon: Clock, accent: "#10b981", light: "#f0fdf4" },
                  { label: "Goals completed", value: `${goals.filter(g => g.current >= g.target).length}/${goals.length}`, icon: Trophy, accent: "#f59e0b", light: "#fffbeb" },
                  { label: "Assignments", value: stats.assignmentsCompleted || "12/15", icon: BookOpen, accent: "#8b5cf6", light: "#f5f3ff" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      background: theme.card,
                      borderRadius: "16px",
                      padding: "20px",
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: stat.light, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <stat.icon size={24} color={stat.accent} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: theme.subText, fontWeight: "700" }}>{stat.label}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900" }}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
                <div style={{ display: "grid", gap: "24px" }}>
                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Marks overview</h3>
                      <button style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: theme.bg, color: theme.text, fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>View all</button>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", maxWidth: "100%", tableLayout: "fixed" }}>
                        <thead>
                          <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: theme.subText, borderBottom: `2px solid ${theme.border}` }}>
                            <th style={{ padding: "10px 8px" }}>Subject</th>
                            <th style={{ padding: "10px 8px" }}>Marks</th>
                            <th style={{ padding: "10px 8px" }}>Grade</th>
                            <th style={{ padding: "10px 8px" }}>Attendance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.slice(0, 5).map((m) => {
                            const mc = Number(m.marks) || 0;
                            const bg = mc >= 75 ? "rgba(16,185,129,0.08)" : mc >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";
                            return (
                              <tr key={m._id} style={{ background: bg, borderBottom: `1px solid ${theme.border}` }}>
                                <td style={{ padding: "14px 12px", fontWeight: "800" }}>{m.subject}</td>
                                <td style={{ padding: "14px 12px", fontWeight: "900", color: mc >= 75 ? "#059669" : mc >= 60 ? "#d97706" : "#dc2626" }}>{mc}%</td>
                                <td style={{ padding: "14px 12px", fontWeight: "900" }}>{letterGrade(mc)}</td>
                                <td style={{ padding: "14px 12px", fontWeight: "700" }}>{m.attendance ?? 0}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <h3 style={{ margin: "0 0 18px 0", fontSize: "17px", fontWeight: "800" }}>Performance trend</h3>
                    <div style={{ height: "260px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                          <XAxis dataKey="subject" stroke={theme.subText} />
                          <YAxis stroke={theme.subText} />
                          <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}` }} />
                          <Area type="monotone" dataKey="marks" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                          <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Attendance by subject</h3>
                      <button style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: theme.bg, color: theme.text, fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Details</button>
                    </div>
                    <div style={{ height: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                          <XAxis dataKey="subject" stroke={theme.subText} />
                          <YAxis stroke={theme.subText} />
                          <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}` }} />
                          <Bar dataKey="attendance" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "20px", alignContent: "start" }}>
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
              </div>
            </div>
          )}

          {activeTab === "Performance Alerts" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>
                      Performance Alerts - {studentName}
                    </h2>
                    <p style={{ margin: "0", color: theme.subText, fontWeight: "600", fontSize: "14px" }}>
                      Real-time monitoring of your academic performance and attendance
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                </div>

                {performanceAlerts.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "linear-gradient(145deg, #f0fdf4, #eff6ff)",
                    borderRadius: "16px",
                    border: `2px solid ${theme.border}`
                  }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px"
                    }}>
                      <TrendingUp size={40} color="white" />
                    </div>
                    <h3 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedAlerts = { ...editableAlerts };
                        updatedAlerts['excellent-title'] = e.target.innerText;
                        setEditableAlerts(updatedAlerts);
                      }}
                      style={{ 
                        margin: "0 0 8px 0", 
                        fontSize: "20px", 
                        fontWeight: "800", 
                        color: "#059669",
                        outline: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "rgba(5, 150, 105, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {editableAlerts['excellent-title'] || 'Excellent Performance!'}
                    </h3>
                    <p 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedAlerts = { ...editableAlerts };
                        updatedAlerts['excellent-message'] = e.target.innerText;
                        setEditableAlerts(updatedAlerts);
                      }}
                      style={{ 
                        margin: "0 0 16px 0", 
                        fontSize: "16px", 
                        color: theme.text, 
                        lineHeight: "1.5",
                        outline: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = `${theme.border}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {editableAlerts['excellent-message'] || 'Great job! Your academic performance is on track. Keep up the excellent work!'}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginTop: "24px" }}>
                      <div style={{ background: "white", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "900", color: "#10b981" }}>{avgMarksPct}%</p>
                        <p style={{ margin: "0", fontSize: "12px", color: theme.subText, fontWeight: "600" }}>Average Marks</p>
                      </div>
                      <div style={{ background: "white", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "900", color: "#3b82f6" }}>{attendanceOverall}%</p>
                        <p style={{ margin: "0", fontSize: "12px", color: theme.subText, fontWeight: "600" }}>Attendance</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "16px" }}>
                    {performanceAlerts.map((alert, index) => (
                      <div
                        key={index}
                        style={{
                          background: alert.bgColor,
                          borderRadius: "16px",
                          padding: "24px",
                          border: `2px solid ${alert.color}30`,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "20px",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <div style={{ 
                          width: "56px", 
                          height: "56px", 
                          borderRadius: "14px", 
                          background: alert.color, 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${alert.color}40`
                        }}>
                          <alert.icon size={28} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                              const updatedAlerts = { ...editableAlerts };
                              updatedAlerts[`${index}-title`] = e.target.innerText;
                              setEditableAlerts(updatedAlerts);
                            }}
                            style={{ 
                              margin: "0 0 8px 0", 
                              fontSize: "18px", 
                              fontWeight: "800", 
                              color: alert.color,
                              outline: "none",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = `${alert.color}10`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                            }}
                          >
                            {editableAlerts[`${index}-title`] || alert.title}
                          </h3>
                          <p 
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => {
                              const updatedAlerts = { ...editableAlerts };
                              updatedAlerts[`${index}-message`] = e.target.innerText;
                              setEditableAlerts(updatedAlerts);
                            }}
                            style={{ 
                              margin: "0 0 16px 0", 
                              fontSize: "15px", 
                              color: theme.text, 
                              lineHeight: "1.5",
                              fontWeight: "500",
                              outline: "none",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = `${theme.border}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                            }}
                          >
                            {editableAlerts[`${index}-message`] || alert.message}
                          </p>
                          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <button
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: `2px solid ${alert.color}`,
                                background: alert.color,
                                color: "white",
                                fontSize: "13px",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = "transparent";
                                e.target.style.color = alert.color;
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = alert.color;
                                e.target.style.color = "white";
                              }}
                              onClick={() => {
                                // Handle different alert actions
                                if (alert.action === "View Progress") {
                                  setActiveTab("Dashboard");
                                } else if (alert.action === "View Marks") {
                                  setActiveTab("Marks");
                                } else if (alert.action === "View Attendance") {
                                  setActiveTab("Attendance");
                                } else if (alert.action === "Study Plan") {
                                  setActiveTab("Goal Tracker");
                                } else if (alert.action === "Focus Areas") {
                                  setActiveTab("Marks");
                                } else if (alert.action === "Update Goals") {
                                  setActiveTab("Goal Tracker");
                                } else if (alert.action === "Improve Attendance") {
                                  setActiveTab("Attendance");
                                }
                              }}
                            >
                              {alert.action}
                            </button>
                            <button
                              style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: `2px solid ${theme.border}`,
                                background: "transparent",
                                color: theme.text,
                                fontSize: "13px",
                                fontWeight: "700",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = theme.bg;
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = "transparent";
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Performance Summary */}
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>Performance Summary</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <div style={{ background: theme.bg, padding: "16px", borderRadius: "12px" }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: theme.subText, fontWeight: "700" }}>Average Marks</p>
                      <p style={{ margin: "0", fontSize: "24px", fontWeight: "900", color: avgMarksPct >= 75 ? "#10b981" : avgMarksPct >= 60 ? "#d97706" : "#dc2626" }}>
                        {avgMarksPct}%
                      </p>
                    </div>
                    <div style={{ background: theme.bg, padding: "16px", borderRadius: "12px" }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: theme.subText, fontWeight: "700" }}>Attendance</p>
                      <p style={{ margin: "0", fontSize: "24px", fontWeight: "900", color: attendanceOverall >= 85 ? "#10b981" : attendanceOverall >= 75 ? "#d97706" : "#dc2626" }}>
                        {attendanceOverall}%
                      </p>
                    </div>
                    <div style={{ background: theme.bg, padding: "16px", borderRadius: "12px" }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: theme.subText, fontWeight: "700" }}>Alert Status</p>
                      <p style={{ margin: "0", fontSize: "24px", fontWeight: "900", color: performanceAlerts.length === 0 ? "#10b981" : performanceAlerts.some(a => a.type === 'critical') ? "#dc2626" : "#d97706" }}>
                        {performanceAlerts.length === 0 ? "Clear" : performanceAlerts.some(a => a.type === 'critical') ? "Critical" : "Warning"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Focus Analysis Section */}
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "800" }}>Subject Focus Analysis</h3>
                
                <div style={{ display: "grid", gap: "16px" }}>
                  {/* Critical Subjects */}
                  {(() => {
                    const criticalSubjects = marks.filter(m => Number(m.marks) < 60);
                    if (criticalSubjects.length > 0) {
                      return (
                        <div style={{
                          background: "rgba(220, 38, 38, 0.08)",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "2px solid rgba(220, 38, 38, 0.2)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <AlertTriangle size={20} color="#dc2626" />
                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#dc2626" }}>
                              Critical Subjects ({criticalSubjects.length})
                            </h4>
                          </div>
                          <div style={{ display: "grid", gap: "8px" }}>
                            {criticalSubjects.map((subject, index) => (
                              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.5)", padding: "8px 12px", borderRadius: "8px" }}>
                                <span style={{ fontWeight: "700", color: theme.text }}>{subject.subject}</span>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#dc2626" }}>{subject.marks}%</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>({letterGrade(Number(subject.marks))})</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>Att: {subject.attendance}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Improvement Needed */}
                  {(() => {
                    const improvementSubjects = marks.filter(m => Number(m.marks) >= 60 && Number(m.marks) < 75);
                    if (improvementSubjects.length > 0) {
                      return (
                        <div style={{
                          background: "rgba(217, 119, 6, 0.08)",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "2px solid rgba(217, 119, 6, 0.2)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <TrendingDown size={20} color="#d97706" />
                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#d97706" }}>
                              Needs Improvement ({improvementSubjects.length})
                            </h4>
                          </div>
                          <div style={{ display: "grid", gap: "8px" }}>
                            {improvementSubjects.map((subject, index) => (
                              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.5)", padding: "8px 12px", borderRadius: "8px" }}>
                                <span style={{ fontWeight: "700", color: theme.text }}>{subject.subject}</span>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#d97706" }}>{subject.marks}%</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>({letterGrade(Number(subject.marks))})</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>Att: {subject.attendance}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Excellent Subjects */}
                  {(() => {
                    const excellentSubjects = marks.filter(m => Number(m.marks) >= 85);
                    if (excellentSubjects.length > 0) {
                      return (
                        <div style={{
                          background: "rgba(5, 150, 105, 0.08)",
                          borderRadius: "12px",
                          padding: "16px",
                          border: "2px solid rgba(5, 150, 105, 0.2)"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                            <TrendingUp size={20} color="#059669" />
                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#059669" }}>
                              Excellent Performance ({excellentSubjects.length})
                            </h4>
                          </div>
                          <div style={{ display: "grid", gap: "8px" }}>
                            {excellentSubjects.map((subject, index) => (
                              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.5)", padding: "8px 12px", borderRadius: "8px" }}>
                                <span style={{ fontWeight: "700", color: theme.text }}>{subject.subject}</span>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "900", color: "#059669" }}>{subject.marks}%</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>({letterGrade(Number(subject.marks))})</span>
                                  <span style={{ fontSize: "12px", color: theme.subText }}>Att: {subject.attendance}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* All Subjects Summary */}
                  <div style={{ background: theme.bg, borderRadius: "12px", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: theme.text }}>All Subjects Overview</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                      {marks.map((subject, index) => {
                        const markValue = Number(subject.marks);
                        const color = markValue >= 85 ? "#059669" : markValue >= 75 ? "#10b981" : markValue >= 60 ? "#d97706" : "#dc2626";
                        return (
                          <div key={index} style={{ textAlign: "center", padding: "8px", borderRadius: "8px", background: "white" }}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "11px", fontWeight: "700", color: theme.subText }}>{subject.subject}</p>
                            <p style={{ margin: 0, fontSize: "16px", fontWeight: "900", color }}>{markValue}%</p>
                            <p style={{ margin: 0, fontSize: "10px", color: theme.subText }}>{letterGrade(markValue)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Marks" && (
            <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: "0 0 4px 0", fontWeight: "900" }}>Subject marks</h2>
              <p style={{ margin: "0 0 24px 0", color: theme.subText, fontWeight: "600", fontSize: "14px" }}>Color-coded: green ≥75%, amber 60–74%, red &lt;60%</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px", maxWidth: "100%", tableLayout: "fixed" }}>
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

          {activeTab === "Goal Tracker" && (
            <div style={{ display: "grid", gap: "24px" }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        📝 Current Progress
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 65"
                        value={newGoal.current}
                        onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
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
                  <button
                    type="button"
                    onClick={addGoal}
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    ✨ Add Goal
                  </button>
                </div>
              </div>

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
                          fontWeight: "700" 
                        }}>
                          ✅ ACHIEVED
                        </div>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "900", color: theme.text }}>
                            {goal.subject}
                          </h4>
                          <p style={{ margin: 0, fontSize: "14px", color: theme.subText, fontWeight: "600" }}>
                            Target: {goal.target}% • Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "28px", fontWeight: "900", color: isCompleted ? "#10b981" : "#3b82f6" }}>
                            {Math.round(progress)}%
                          </div>
                          <div style={{ fontSize: "12px", color: theme.subText, fontWeight: "600" }}>
                            {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Due today" : "Overdue"}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ 
                          height: "16px", 
                          borderRadius: "8px", 
                          background: theme.border, 
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <div style={{ 
                            width: `${Math.min(progress, 100)}%`, 
                            height: "100%", 
                            background: isCompleted ? "#10b981" : progress >= 75 ? "#3b82f6" : progress >= 50 ? "#f59e0b" : "#ef4444",
                            borderRadius: "8px",
                            transition: "width 0.3s ease"
                          }}></div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", color: theme.subText, fontWeight: "600" }}>
                          <span>Current: {goal.current}%</span>
                          <span>Target: {goal.target}%</span>
                        </div>
                      </div>
                      
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

          {activeTab === "Chat with Teacher" && (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", minHeight: "480px" }}>
              <div style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, fontWeight: "800" }}>Faculty Members</div>
                <div style={{ overflowY: "auto", maxHeight: "400px" }}>
                  {teachers.map((teacher) => (
                    <button
                      key={teacher._id}
                      onClick={() => setSelectedTeacher(teacher)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        background: selectedTeacher?._id === teacher._id ? "#3b82f620" : "transparent",
                        color: theme.text,
                        textAlign: "left",
                        cursor: "pointer",
                        borderBottom: `1px solid ${theme.border}`,
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "14px" }}>{teacher.name}</div>
                      <div style={{ fontSize: "12px", color: theme.subText, fontWeight: "600" }}>{teacher.department}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: theme.card, borderRadius: "20px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column" }}>
                {selectedTeacher ? (
                  <>
                    <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, fontWeight: "800" }}>
                      Chat with {selectedTeacher.name}
                    </div>
                    <div style={{ flex: 1, padding: "16px", overflowY: "auto", maxHeight: "300px" }}>
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} style={{ marginBottom: "16px" }}>
                          <div style={{ fontSize: "12px", color: theme.subText, fontWeight: "600", marginBottom: "4px" }}>
                            {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                          <div style={{ padding: "10px 14px", borderRadius: "12px", background: msg.senderName === studentName ? "#3b82f620" : theme.bg, maxWidth: "80%" }}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "16px", borderTop: `1px solid ${theme.border}` }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={msgText}
                          onChange={(e) => setMsgText(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            background: theme.bg,
                            color: theme.text,
                            fontSize: "14px"
                          }}
                        />
                        <button
                          onClick={sendMessage}
                          style={{
                            padding: "10px 16px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#3b82f6",
                            color: "white",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "32px", textAlign: "center", color: theme.subText }}>
                    Select a teacher to start chatting
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Daily Study Tracker" && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "24px", fontWeight: "900" }}>📅 Daily Study Tracker</h2>
                <p style={{ margin: "0 0 24px 0", color: theme.subText, fontWeight: "600" }}>
                  Track your daily study sessions and monitor your learning progress
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                  <div style={{ textAlign: "center", padding: "20px", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: "#10b981", marginBottom: "8px" }}>
                      {studySessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length}
                    </div>
                    <div style={{ fontSize: "14px", color: "#065f46", fontWeight: "700" }}>Today's Sessions</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "20px", background: "#eff6ff", borderRadius: "16px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: "#3b82f6", marginBottom: "8px" }}>
                      {studySessions.reduce((total, s) => total + (s.duration || 0), 0)}h
                    </div>
                    <div style={{ fontSize: "14px", color: "#1e40af", fontWeight: "700" }}>Total Study Hours</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "20px", background: "#fef3c7", borderRadius: "16px", border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: "#f59e0b", marginBottom: "8px" }}>
                      {studySessions.length > 0 ? Math.round(studySessions.reduce((total, s) => total + (s.progress || 0), 0) / studySessions.length) : 0}%
                    </div>
                    <div style={{ fontSize: "14px", color: "#92400e", fontWeight: "700" }}>Average Progress</div>
                  </div>
                </div>

                <div style={{ background: theme.bg, padding: "20px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>➕ Add Study Session</h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                          📚 Subject
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Mathematics"
                          value={newSession.subject}
                          onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: `2px solid ${theme.border}`,
                            background: theme.card,
                            color: theme.text,
                            fontSize: "14px",
                            fontWeight: "600"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                          ⏱️ Duration (hours)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 2"
                          value={newSession.duration}
                          onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: `2px solid ${theme.border}`,
                            background: theme.card,
                            color: theme.text,
                            fontSize: "14px",
                            fontWeight: "600"
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        📝 Topics Covered
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Calculus, Algebra, Geometry"
                        value={newSession.topics}
                        onChange={(e) => setNewSession({ ...newSession, topics: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: `2px solid ${theme.border}`,
                          background: theme.card,
                          color: theme.text,
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                        📊 Initial Progress (%)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 25"
                        value={newSession.progress}
                        onChange={(e) => setNewSession({ ...newSession, progress: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: `2px solid ${theme.border}`,
                          background: theme.card,
                          color: theme.text,
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addStudySession}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      ✨ Add Session
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ background: theme.card, borderRadius: "20px", padding: "28px", border: `1px solid ${theme.border}` }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800" }}>📋 Today's Study Sessions</h3>
                
                {studySessions.filter(session => new Date(session.date).toDateString() === new Date().toDateString()).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: theme.subText }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                    <p style={{ fontSize: "16px", fontWeight: "700" }}>No study sessions today</p>
                    <p style={{ fontSize: "14px", marginTop: "8px" }}>Add your first study session to get started!</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "16px" }}>
                    {studySessions
                      .filter(session => new Date(session.date).toDateString() === new Date().toDateString())
                      .map((session) => {
                        const progress = session.progress || 0;
                        const isCompleted = progress >= 100;
                        
                        return (
                          <div key={session.id} style={{
                            background: theme.bg,
                            borderRadius: "16px",
                            padding: "20px",
                            border: `1px solid ${theme.border}`,
                            position: "relative"
                          }}>
                            {isCompleted && (
                              <div style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "#10b981",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}>
                                ✅ Completed
                              </div>
                            )}
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                              <div>
                                <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "900", color: theme.text }}>
                                  {session.subject}
                                </h4>
                                <p style={{ margin: 0, fontSize: "14px", color: theme.subText, fontWeight: "600" }}>
                                  ⏱️ {session.duration} hours • 📝 {session.topics}
                                </p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "24px", fontWeight: "900", color: isCompleted ? "#10b981" : "#3b82f6" }}>
                                  {progress}%
                                </div>
                                <div style={{ fontSize: "12px", color: theme.subText, fontWeight: "600" }}>
                                  Progress
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ marginBottom: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: theme.subText }}>Progress</span>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: theme.subText }}>{progress}%</span>
                              </div>
                              <div style={{ 
                                height: "8px", 
                                borderRadius: "4px", 
                                background: theme.border, 
                                overflow: "hidden" 
                              }}>
                                <div style={{ 
                                  width: `${progress}%`, 
                                  height: "100%", 
                                  background: isCompleted ? "#10b981" : progress >= 75 ? "#3b82f6" : progress >= 50 ? "#f59e0b" : "#ef4444",
                                  borderRadius: "4px",
                                  transition: "width 0.3s ease"
                                }}></div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                onClick={() => updateSessionProgress(session.id, 5)}
                                disabled={isCompleted}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
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
                                +5%
                              </button>
                              <button
                                onClick={() => deleteSession(session.id)}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  border: "none",
                                  background: "#ef4444",
                                  color: "white",
                                  fontWeight: "700",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease"
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>📊 Weekly Progress</h3>
                  <div style={{ height: "200px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={studySessions.slice(-7).map(s => ({
                        date: new Date(s.date).toLocaleDateString('en', { weekday: 'short' }),
                        hours: s.duration || 0
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                        <XAxis dataKey="date" stroke={theme.subText} />
                        <YAxis stroke={theme.subText} />
                        <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}` }} />
                        <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: theme.card, borderRadius: "20px", padding: "24px", border: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>📈 Subject Distribution</h3>
                  <div style={{ height: "200px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={Object.entries(
                        studySessions.reduce((acc, session) => {
                          acc[session.subject] = (acc[session.subject] || 0) + (session.duration || 0);
                          return acc;
                        }, {})
                      ).map(([subject, hours]) => ({ subject, hours }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                        <XAxis dataKey="subject" stroke={theme.subText} />
                        <YAxis stroke={theme.subText} />
                        <Tooltip contentStyle={{ background: theme.card, border: `1px solid ${theme.border}` }} />
                        <Bar dataKey="hours" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Performance Prediction" && prediction && (
            <div style={{ display: "grid", gap: "24px" }}>
              <div style={{
                borderRadius: "20px",
                padding: "32px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                background: theme.card
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "900" }}>🔮 Performance Prediction</h2>
                    <p style={{ margin: 0, fontSize: "14px", color: theme.subText, fontWeight: "600" }}>
                      AI-powered analysis of your academic performance
                    </p>
                  </div>
                  <button
                    onClick={fetchPerformancePrediction}
                    disabled={loadingPrediction}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#3b82f6",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: loadingPrediction ? "not-allowed" : "pointer",
                      opacity: loadingPrediction ? 0.6 : 1
                    }}
                  >
                    <RefreshCcw size={16} className={loadingPrediction ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                  <div style={{ textAlign: "center", padding: "24px", background: "#f0fdf4", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#10b981", marginBottom: "8px" }}>
                      {prediction.prediction.predictedScore}%
                    </div>
                    <div style={{ fontSize: "14px", color: "#065f46", fontWeight: "700" }}>Predicted Score</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "24px", background: "#eff6ff", borderRadius: "16px", border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#3b82f6", marginBottom: "8px" }}>
                      {prediction.prediction.confidence}%
                    </div>
                    <div style={{ fontSize: "14px", color: "#1e40af", fontWeight: "700" }}>Confidence Level</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "24px", background: "#fef3c7", borderRadius: "16px", border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#f59e0b", marginBottom: "8px" }}>
                      {prediction.student.currentGPA}
                    </div>
                    <div style={{ fontSize: "14px", color: "#92400e", fontWeight: "700" }}>Current GPA</div>
                  </div>
                </div>

                <div style={{
                  padding: "20px",
                  background: prediction.prediction.predictedScore >= 75 ? "#f0fdf4" : prediction.prediction.predictedScore >= 60 ? "#fffbeb" : "#fef2f2",
                  borderRadius: "12px",
                  border: `1px solid ${prediction.prediction.predictedScore >= 75 ? "#bbf7d0" : prediction.prediction.predictedScore >= 60 ? "#fde68a" : "#fecaca"}`,
                  marginBottom: "24px"
                }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800", color: prediction.prediction.predictedScore >= 75 ? "#065f46" : prediction.prediction.predictedScore >= 60 ? "#92400e" : "#991b1b" }}>
                    💡 Recommendation
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: prediction.prediction.predictedScore >= 75 ? "#065f46" : prediction.prediction.predictedScore >= 60 ? "#92400e" : "#991b1b", fontWeight: "600", lineHeight: "1.6" }}>
                    {prediction.prediction.recommendation}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "24px" }}>
                  <div style={{
                    background: theme.card,
                    borderRadius: "16px",
                    padding: "20px",
                    border: `1px solid ${theme.border}`
                  }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>📊 Performance Factors</h4>
                    <div style={{ display: "grid", gap: "12px" }}>
                      {Object.entries(prediction.prediction.factors).map(([key, value]) => (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", fontWeight: "700" }}>
                            <span style={{ color: theme.subText, textTransform: "capitalize" }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span style={{ color: theme.text }}>{Math.round(value * 100)}%</span>
                          </div>
                          <div style={{ height: "8px", borderRadius: "4px", background: theme.border, overflow: "hidden" }}>
                            <div style={{ 
                              width: `${value * 100}%`, 
                              height: "100%", 
                              background: "#3b82f6",
                              borderRadius: "4px"
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    background: theme.card,
                    borderRadius: "16px",
                    padding: "20px",
                    border: `1px solid ${theme.border}`
                  }}>
                    <h4 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>📈 Academic Stats</h4>
                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Total Credits</span>
                        <span style={{ fontSize: "13px", fontWeight: "800" }}>{prediction.student.totalCredits}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Completed Courses</span>
                        <span style={{ fontSize: "13px", fontWeight: "800" }}>{prediction.student.completedCourses}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                        <span style={{ fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Attendance Rate</span>
                        <span style={{ fontSize: "13px", fontWeight: "800" }}>{prediction.student.attendanceRate}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                        <span style={{ fontSize: "13px", color: theme.subText, fontWeight: "600" }}>Study Hours/Week</span>
                        <span style={{ fontSize: "13px", fontWeight: "800" }}>{prediction.student.studyHours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Profile" && (
            <div style={{ background: theme.card, borderRadius: "20px", padding: "32px", border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "900" }}>Profile Settings</h2>
              
              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                      👤 Full Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `2px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                      📧 Email Address
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `2px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                      🏫 Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `2px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: theme.text }}>
                      📚 Semester
                    </label>
                    <input
                      type="text"
                      value={semester}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: `2px solid ${theme.border}`,
                        background: theme.bg,
                        color: theme.text,
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "800", color: "#065f46" }}>📊 Academic Summary</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>Current GPA</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900", color: "#065f46" }}>{stats.currentGpa || "N/A"}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>Total Credits</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900", color: "#065f46" }}>{stats.totalCredits || "N/A"}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>Rank</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900", color: "#065f46" }}>#{stats.rank || "N/A"}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#065f46", fontWeight: "600", textTransform: "uppercase" }}>Attendance</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900", color: "#065f46" }}>{attendanceOverall}%</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={downloadReport}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Download size={16} />
                    Download Report
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
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
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) {
          .student-shell { 
            padding-left: 0;
          }
          .student-main {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

function SidebarItem({ icon: Icon, label, activeTab, setActiveTab, closeSidebar }) {
  const isActive = activeTab === label;
  const handleClick = () => {
    setActiveTab(label);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768 && closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "12px 14px",
        marginBottom: "6px",
        borderRadius: "14px",
        border: "none",
        background: isActive ? "#2563eb20" : "transparent",
        color: isActive ? "#2563eb" : undefined,
        fontWeight: isActive ? "800" : "600",
        cursor: "pointer",
        fontSize: "14px",
        transition: "all 0.2s",
      }}
    >
      <Icon size={20} />
      {label}
    </button>
  );
}

export default Student;
