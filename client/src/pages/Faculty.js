import { useEffect, useState, useMemo } from "react";
import api from "../api";
import { getSidebarAwareContainerProps, getResponsiveInputProps } from "../utils/responsiveUtils";
import {
  Users, TrendingUp, AlertCircle, CheckCircle, Search, Star, Eye, Edit2, Calendar, BookOpen, FileText, Settings, AlertTriangle,
  BarChart3, Menu, X, GraduationCap, LogOut, Plus, Upload, Download, Trash2, ClipboardList, FolderOutput, CheckCircle2, User, Brain, MessageCircle, Send, Trophy,
  Filter, Target, Award, Activity, Zap, MessageSquare, PieChart, LineChart, BarChart, Clock, Download as DownloadIcon
} from "lucide-react";
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, Cell, PieChart as RechartsPieChart, Pie, AreaChart, Area
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Faculty() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departmentsAvailable, setDepartmentsAvailable] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [toasts, setToasts] = useState([]);

  // Performance Prediction States
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);

  // Advanced Filter States
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [marksRange, setMarksRange] = useState({ min: 0, max: 100 });
  const [attendanceRange, setAttendanceRange] = useState({ min: 0, max: 100 });
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // AI Suggestions States
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Student Comparison States
  const [comparisonStudents, setComparisonStudents] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonChartData, setComparisonChartData] = useState([]);

  // Leaderboard States
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('marks'); // marks, attendance, cgpa

  // Activity Tracking States
  const [activityLog, setActivityLog] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Performance Insights
  const [performanceInsights, setPerformanceInsights] = useState({
    topPerformers: [],
    weakStudents: [],
    averagePerformers: [],
    attendanceWarning: [],
    improvementTrend: []
  });

  const facultyName = localStorage.getItem("name") || "Faculty";
  const facultyEmail = localStorage.getItem("email") || "";

  const [stats, setStats] = useState({
    totalStudents: 0,
    avgMarksPercent: 0,
    pendingAssignments: 0,
    attendanceAvg: 0,
    weakStudentsCount: 0,
  });

  // Management States
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Modal/Form States
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  // Forms
  const [materialData, setMaterialData] = useState({ title: '', subject: '', type: 'PDF' });
  const [gradeData, setGradeData] = useState({ studentId: '', studentName: '', studentEmail: '', subject: '', marks: '', attendance: '', suggestion: '', examType: 'Internal' });
  const [focusData, setFocusData] = useState({ subject: '', reason: '' });
  const [perfStats, setPerfStats] = useState([]);

  // Chat States
  const [chatStudents, setChatStudents] = useState([]);
  const [selectedChatStudent, setSelectedChatStudent] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [materialFile, setMaterialFile] = useState(null);

  // Check user role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'teacher') {
      window.location.href = '/login';
      return;
    }
    fetchFacultyData();
  }, []);

  useEffect(() => {
    if (activeTab === "Chat" || activeTab === "Chat with Students") {
      fetchChatStudents();
    }
  }, [activeTab]);

  // Build leaderboard when students or leaderboardType changes
  useEffect(() => {
    if (students.length > 0) {
      buildLeaderboard();
    }
  }, [students, leaderboardType]);

  // Build comparison chart when comparison students change
  useEffect(() => {
    if (comparisonStudents.length > 1) {
      buildComparisonChart();
    } else {
      setComparisonChartData([]);
    }
  }, [comparisonStudents]);

  const buildComparisonChart = async () => {
    try {
      const subjects = new Set();
      const studentMarksMap = {};

      // Fetch marks for all comparison students
      for (const student of comparisonStudents) {
        const res = await api.get(`/faculty/student-marks/${student._id}`);
        const marks = res.data.marks || [];
        
        studentMarksMap[student._id] = {};
        marks.forEach(mark => {
          subjects.add(mark.subject);
          studentMarksMap[student._id][mark.subject] = mark.marks;
        });
      }

      // Build chart data
      const chartData = Array.from(subjects).map(subject => {
        const dataPoint = { subject };
        comparisonStudents.forEach((student, index) => {
          dataPoint[`student${index + 1}`] = studentMarksMap[student._id]?.[subject] || 0;
        });
        return dataPoint;
      });

      setComparisonChartData(chartData.length > 0 ? chartData : []);
    } catch (err) {
      console.error('Error building comparison chart:', err);
      setComparisonChartData([]);
    }
  };

  const fetchFacultyData = async () => {
    try {
      const res = await api.get('/faculty/dashboard-data');
      console.log("Dashboard data response:", res.data);
      
      // Properly handle the response structure
      const studentsData = res.data.students || [];
      const statsData = res.data.stats || stats;
      
      setStudents(studentsData);
      setStats(statsData);

      // Extract unique departments
      const depts = [...new Set(studentsData?.map(s => s.department) || [])];
      setDepartmentsAvailable(depts);
      
      console.log("Loaded students:", studentsData.length);
      console.log("Stats:", statsData);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      showToast('Error loading data', 'error');
    }
  };

  const fetchChatStudents = async () => {
    try {
      const res = await api.get('/faculty/chat-students');
      setChatStudents(res.data || []);
    } catch (err) {
      console.error('Error fetching chat students:', err);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      // Fetch student dashboard data including marks records
      const res = await api.get(`/student-dashboard/${studentId}`);
      const records = res.data.records || [];
      setStudentMarks(records);

      // Optionally update selected student info with dashboard summary
      setSelectedStudent((prev) => {
        if (prev && prev._id === studentId) {
          return { ...prev, ...res.data };
        }
        const studentFromList = students.find((s) => s._id === studentId);
        return studentFromList ? { ...studentFromList, ...res.data } : { ...res.data, _id: studentId };
      });
    } catch (err) {
      console.error('Error fetching student details:', err);
      showToast('Error loading student details', 'error');
    }
  };

  const generatePredictions = async () => {
    setLoadingPredictions(true);
    try {
      const res = await api.get('/faculty/predictions');
      setPredictions(res.data.predictions || []);
      showToast('Predictions generated successfully', 'success');
    } catch (err) {
      const backendMessage = err.response?.data?.msg || err.response?.data?.message || err.message || 'Error generating predictions';
      console.error('Error generating predictions:', err.response?.data || err.message || err);
      showToast(backendMessage, 'error');
    } finally {
      setLoadingPredictions(false);
    }
  };

  const generateAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await api.post('/faculty/ai-suggestions');
      setAiSuggestions(res.data.suggestions || []);
      showToast('AI suggestions generated', 'success');
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      showToast('Error generating suggestions', 'error');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const buildLeaderboard = () => {
    let sorted = [...students];

    if (leaderboardType === 'marks') {
      sorted.sort((a, b) => (b.averageMarks || 0) - (a.averageMarks || 0));
    } else if (leaderboardType === 'attendance') {
      sorted.sort((a, b) => (b.attendancePercent || 0) - (a.attendancePercent || 0));
    } else if (leaderboardType === 'cgpa') {
      sorted.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
    }

    setLeaderboard(sorted.slice(0, 10));
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           student.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [students, searchQuery, departmentFilter]);

  const menuItems = [
    { id: "Dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "Students", icon: Users, label: "View Students" },
    { id: "Performance", icon: TrendingUp, label: "Performance View" },
    { id: "Predictions", icon: Brain, label: "Predictions" },
    { id: "Marks", icon: Edit2, label: "Add/Update Marks" },
    { id: "Attendance", icon: Calendar, label: "Attendance" },
    { id: "Chat", icon: MessageCircle, label: "Chat with Students" },
    { id: "Reports", icon: FileText, label: "Reports & Insights" },
    { id: "Comparison", icon: BarChart, label: "Student Comparison" },
    { id: "Leaderboard", icon: Trophy, label: "Leaderboard" },
    { id: "Activity", icon: Activity, label: "Activity Tracking" },
  ];

  const renderDashboard = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Faculty Dashboard Overview</h2>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Users size={24} color="#3b82f6" />
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Total Students</p>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TrendingUp size={24} color="#10b981" />
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Avg Marks</p>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>{stats.avgMarksPercent}%</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar size={24} color="#f59e0b" />
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Avg Attendance</p>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>{stats.attendanceAvg}%</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Need Attention</p>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>{stats.weakStudentsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
          <button
            onClick={() => setActiveTab("Predictions")}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            <Brain size={18} />
            Generate Predictions
          </button>
          <button
            onClick={() => setActiveTab("Marks")}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            <Edit2 size={18} />
            Update Marks
          </button>
          <button
            onClick={() => setActiveTab("Attendance")}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            <Calendar size={18} />
            Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab("Chat")}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#8b5cf6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            <MessageCircle size={18} />
            Chat with Students
          </button>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Assigned Students</h2>

      {/* Search and Filter */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", maxWidth: "100%" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            {...getResponsiveInputProps({
              padding: "12px 12px 12px 40px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px"
            })}
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", minWidth: "150px", maxWidth: "200px", boxSizing: "border-box" }}
        >
          <option value="all">All Departments</option>
          {departmentsAvailable.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Students List */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>Students ({filteredStudents.length})</h3>
        </div>
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {filteredStudents.map(student => (
            <div key={student._id} style={{ padding: "15px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, color: "#1e293b" }}>{student.name}</h4>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{student.email}</p>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{student.department} - Semester {student.semester}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(student);
                  fetchStudentDetails(student._id);
                  setActiveTab("Performance");
                }}
                style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Student Performance</h2>

      {/* Student Selector */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#64748b", marginBottom: "10px", fontWeight: "600" }}>Select a student:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {students.slice(0, 10).map(student => (
            <button
              key={student._id}
              onClick={() => {
                setSelectedStudent(student);
                fetchStudentDetails(student._id);
              }}
              style={{
                padding: "8px 16px",
                border: selectedStudent?._id === student._id ? "2px solid #3b82f6" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: selectedStudent?._id === student._id ? "#eff6ff" : "white",
                color: selectedStudent?._id === student._id ? "#3b82f6" : "#374151",
                cursor: "pointer",
                fontWeight: selectedStudent?._id === student._id ? "600" : "400"
              }}
            >
              {student.name}
            </button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>{selectedStudent.name}'s Performance</h3>
          </div>

          {/* Performance Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              <h4 style={{ marginBottom: "15px", color: "#1e293b" }}>Marks Overview</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={studentMarks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#3b82f6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              <h4 style={{ marginBottom: "15px", color: "#1e293b" }}>Attendance Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={studentMarks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Marks Table */}
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: 0, color: "#1e293b" }}>Detailed Marks</h4>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Subject</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Marks</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Attendance</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map((mark, index) => (
                    <tr key={index}>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{mark.subject}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{mark.marks}%</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{mark.attendance}%</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: mark.marks >= 80 ? "#dcfce7" : mark.marks >= 60 ? "#fef3c7" : "#fee2e2",
                          color: mark.marks >= 80 ? "#166534" : mark.marks >= 60 ? "#92400e" : "#991b1b"
                        }}>
                          {mark.marks >= 80 ? "A" : mark.marks >= 60 ? "B" : "C"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPredictions = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Performance Predictions</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={generatePredictions}
          disabled={loadingPredictions}
          style={{
            padding: "12px 24px",
            background: loadingPredictions ? "#9ca3af" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loadingPredictions ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Brain size={18} />
          {loadingPredictions ? "Generating..." : "Generate Predictions"}
        </button>
      </div>

      {predictions.length > 0 && (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>🤖 AI Prediction Results & Focus Areas</h3>
          </div>
          
          {/* Summary Stats */}
          <div style={{ padding: "20px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
              <div style={{ textAlign: "center", padding: "15px", background: "white", borderRadius: "8px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#3b82f6" }}>{predictions.length}</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Total Students</div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", background: "white", borderRadius: "8px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#10b981" }}>
                  {predictions.filter(p => p.prediction.predictedScore >= 75).length}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>High Performers</div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", background: "white", borderRadius: "8px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#f59e0b" }}>
                  {predictions.filter(p => p.prediction.predictedScore < 50).length}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Need Attention</div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", background: "white", borderRadius: "8px" }}>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#8b5cf6" }}>
                  {predictions.filter(p => p.prediction.trend === 'improving').length}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Improving</div>
              </div>
            </div>
          </div>

          {/* AI Teacher Focus Recommendations */}
          <div style={{ padding: "20px", background: "#f0f9ff", borderBottom: "1px solid #e5e7eb" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#1e40af", display: "flex", alignItems: "center", gap: "8px" }}>
              🎯 AI-Generated Teacher Focus Areas
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {(() => {
                const weakSubjects = {};
                const atRiskStudents = [];
                const highPerformers = [];
                
                predictions.forEach(prediction => {
                  // Collect weak subjects
                  if (prediction.student.weakSubjects) {
                    prediction.student.weakSubjects.forEach(subject => {
                      weakSubjects[subject] = (weakSubjects[subject] || 0) + 1;
                    });
                  }
                  
                  // Categorize students
                  if (prediction.prediction.predictedScore < 50) atRiskStudents.push(prediction.student.name);
                  if (prediction.prediction.predictedScore >= 75) highPerformers.push(prediction.student.name);
                });

                const sortedWeakSubjects = Object.entries(weakSubjects)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5);

                return (
                  <>
                    <div style={{ background: "white", padding: "18px", borderRadius: "12px", border: "2px solid #fecaca", boxShadow: "0 2px 8px rgba(254, 202, 202, 0.1)" }}>
                      <h5 style={{ margin: "0 0 12px 0", color: "#991b1b", fontSize: "16px", fontWeight: "700" }}>🚨 Students Needing Attention</h5>
                      <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {atRiskStudents.length > 0 ? (
                          atRiskStudents.map((student, idx) => (
                            <div key={idx} style={{ 
                              padding: "8px 12px", 
                              margin: "4px 0", 
                              fontSize: "14px", 
                              color: "#7f1d1d", 
                              background: "#fef2f2", 
                              borderRadius: "8px",
                              border: "1px solid #fecaca"
                            }}>
                              <strong style={{ color: "#991b1b" }}>⚠️ {student}</strong>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: "14px", color: "#059669", padding: "20px", textAlign: "center" }}>
                            ✅ No at-risk students identified
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "18px", borderRadius: "12px", border: "2px solid #fde68a", boxShadow: "0 2px 8px rgba(251, 191, 36, 0.1)" }}>
                      <h5 style={{ margin: "0 0 12px 0", color: "#92400e", fontSize: "16px", fontWeight: "700" }}>📚 Critical Weak Subjects</h5>
                      <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {sortedWeakSubjects.length > 0 ? (
                          sortedWeakSubjects.map(([subject, count], idx) => (
                            <div key={idx} style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center", 
                              padding: "10px 12px", 
                              margin: "6px 0", 
                              fontSize: "14px", 
                              background: "#fffbeb", 
                              borderRadius: "8px",
                              border: "1px solid #fde68a"
                            }}>
                              <span style={{ color: "#92400e", fontWeight: "600" }}>{subject}</span>
                              <span style={{ 
                                background: "#f59e0b", 
                                padding: "4px 12px", 
                                borderRadius: "20px", 
                                fontSize: "12px", 
                                fontWeight: "700", 
                                color: "#92400e" 
                              }}>
                                {count} students
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: "14px", color: "#059669", padding: "20px", textAlign: "center" }}>
                            ✅ No critical weak subjects
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "18px", borderRadius: "12px", border: "2px solid #bbf7d0", boxShadow: "0 2px 8px rgba(34, 197, 94, 0.1)" }}>
                      <h5 style={{ margin: "0 0 12px 0", color: "#166534", fontSize: "16px", fontWeight: "700" }}>🌟 Top Performers</h5>
                      <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                        {highPerformers.length > 0 ? (
                          highPerformers.slice(0, 5).map((student, idx) => (
                            <div key={idx} style={{ 
                              padding: "8px 12px", 
                              margin: "4px 0", 
                              fontSize: "14px", 
                              color: "#064e3b", 
                              background: "#f0fdf4", 
                              borderRadius: "8px",
                              border: "1px solid #bbf7d0"
                            }}>
                              🏆 <strong style={{ color: "#166534" }}>{student}</strong>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: "14px", color: "#059669", padding: "20px", textAlign: "center" }}>
                            🎯 Top performers emerging
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "18px", borderRadius: "12px", border: "2px solid #ddd6fe", boxShadow: "0 2px 8px rgba(99, 102, 241, 0.1)" }}>
                      <h5 style={{ margin: "0 0 12px 0", color: "#4338ca", fontSize: "16px", fontWeight: "700" }}>� AI Teaching Strategies</h5>
                      <div style={{ fontSize: "14px", lineHeight: "1.7", color: "#4c1d95" }}>
                        <div style={{ marginBottom: "16px" }}>
                          <strong style={{ color: "#4338ca", fontSize: "15px" }}>🎯 Priority Focus Areas:</strong>
                          <ul style={{ margin: "8px 0", paddingLeft: "24px", color: "#64748b" }}>
                            <li style={{ marginBottom: "6px" }}>• Provide extra attention to weak subjects identified above</li>
                            <li style={{ marginBottom: "6px" }}>• Schedule one-on-one sessions with at-risk students</li>
                            <li style={{ marginBottom: "6px" }}>• Use peer tutoring for struggling students</li>
                            <li style={{ marginBottom: "6px" }}>• Implement differentiated instruction techniques</li>
                          </ul>
                        </div>
                        <div>
                          <strong style={{ color: "#4338ca", fontSize: "15px" }}>📈 Teaching Strategies:</strong>
                          <ul style={{ margin: "8px 0", paddingLeft: "24px", color: "#64748b" }}>
                            <li style={{ marginBottom: "6px" }}>• Use formative assessments regularly</li>
                            <li style={{ marginBottom: "6px" }}>• Provide timely feedback and support</li>
                            <li style={{ marginBottom: "6px" }}>• Create study groups for weak subjects</li>
                            <li style={{ marginBottom: "6px" }}>• Adjust teaching pace based on class performance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div style={{ maxHeight: "700px", overflowY: "auto" }}>
            {predictions.map((prediction, index) => (
              <div key={index} style={{ 
                padding: "24px", 
                borderBottom: "1px solid #f3f4f6", 
                background: prediction.prediction.predictedScore >= 75 ? "#f0fdf4" : prediction.prediction.predictedScore >= 50 ? "#fffbeb" : "#fef2f2"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: "0 0 12px 0", 
                      color: "#1e293b", 
                      fontSize: "18px", 
                      fontWeight: "800",
                      display: "flex", 
                      alignItems: "center", 
                      gap: "10px"
                    }}>
                      {prediction.student.name}
                      {prediction.prediction.predictedScore >= 75 && <span style={{ background: "#dcfce7", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", color: "#166534", marginLeft: "8px" }}>🌟 Excellent</span>}
                      {prediction.prediction.predictedScore >= 50 && prediction.prediction.predictedScore < 75 && <span style={{ background: "#fef3c7", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", color: "#92400e", marginLeft: "8px" }}>📈 Good</span>}
                      {prediction.prediction.predictedScore < 50 && <span style={{ background: "#fee2e2", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", color: "#991b1b", marginLeft: "8px" }}>⚠️ Needs Help</span>}
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Current GPA</p>
                        <p style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e293b" }}>{prediction.student.currentGPA.toFixed(2)}</p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Predicted Score</p>
                        <p style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: prediction.prediction.predictedScore >= 75 ? "#166534" : prediction.prediction.predictedScore >= 50 ? "#92400e" : "#991b1b" }}>{prediction.prediction.predictedScore.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Trend</p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: "16px", 
                          fontWeight: "700",
                          color: prediction.prediction.trend === 'improving' ? '#10b981' : 
                                 prediction.prediction.trend === 'declining' ? '#ef4444' : '#6b7280',
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px"
                        }}>
                          {prediction.prediction.trend === 'improving' ? '📈 Improving' : 
                           prediction.prediction.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Confidence</p>
                        <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#3b82f6" }}>{prediction.prediction.confidence}%</p>
                      </div>
                    </div>
                    {prediction.student.weakSubjects && prediction.student.weakSubjects.length > 0 && (
                      <div style={{ marginTop: "16px" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Weak Subjects</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {prediction.student.weakSubjects.map((subject, idx) => (
                            <span key={idx} style={{ 
                              background: "#fee2e2", 
                              padding: "4px 8px", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              fontWeight: "600", 
                              color: "#991b1b" 
                            }}>
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "20px" }}>
                    {prediction.prediction.predictedScore >= 75 && <CheckCircle size={24} color="#10b981" />}
                    {prediction.prediction.predictedScore >= 50 && prediction.prediction.predictedScore < 75 && <AlertCircle size={24} color="#f59e0b" />}
                    {prediction.prediction.predictedScore < 50 && <X size={24} color="#ef4444" />}
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      background: prediction.prediction.predictedScore >= 75 ? "#dcfce7" : prediction.prediction.predictedScore >= 50 ? "#fef3c7" : "#fee2e2",
                      color: prediction.prediction.predictedScore >= 75 ? "#166534" : prediction.prediction.predictedScore >= 50 ? "#92400e" : "#991b1b"
                    }}>
                      {prediction.prediction.predictedScore >= 75 ? "EXCELLENT" : prediction.prediction.predictedScore >= 50 ? "AVERAGE" : "NEEDS IMPROVEMENT"}
                    </span>
                  </div>
                </div>

                {/* AI-Specific Recommendations for this student */}
                {prediction.prediction.recommendation && (
                  <div style={{ 
                    padding: "16px", 
                    background: "#eff6ff", 
                    borderRadius: "12px", 
                    border: "1px solid #bfdbfe",
                    marginTop: "16px"
                  }}>
                    <h5 style={{ 
                      margin: "0 0 12px 0", 
                      color: "#1e40af", 
                      fontSize: "15px", 
                      fontWeight: "700", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px" 
                    }}>
                      🤖 AI Recommendation for {prediction.student.name}
                    </h5>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "14px", 
                      color: "#1e40af", 
                      lineHeight: "1.6",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                      borderLeft: "4px solid #3b82f6"
                    }}>
                      {prediction.prediction.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMarks = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Add/Update Marks</h2>

      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Update Student Marks</h3>

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!gradeData.studentId) {
            showToast('Please select a student', 'error');
            return;
          }
          try {
            await api.post('/faculty/marks', gradeData);
            showToast('Marks updated successfully', 'success');
            setGradeData({ studentId: '', subject: '', marks: '', attendance: '', suggestion: '', examType: 'Internal' });
          } catch (err) {
            showToast('Error updating marks', 'error');
          }
        }}>
          {/* Student Selection */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
              Select Student *
            </label>
            <select
              value={gradeData.studentId || ''}
              onChange={(e) => {
                const selected = students.find(s => s._id === e.target.value);
                setGradeData({ 
                  ...gradeData, 
                  studentId: e.target.value,
                  studentName: selected?.name || '',
                  studentEmail: selected?.email || ''
                });
              }}
              style={{ 
                width: "100%",
                padding: "12px", 
                border: "1px solid #d1d5db", 
                borderRadius: "8px",
                fontSize: "14px",
                background: "white"
              }}
              required
            >
              <option value="">-- Select a Student --</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <select
              value={gradeData.examType}
              onChange={(e) => setGradeData({ ...gradeData, examType: e.target.value })}
              style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
              required
            >
              <option value="Internal">Internal Assessment</option>
              <option value="External">External Exam</option>
              <option value="Practical">Practical</option>
            </select>

            <input
              type="text"
              placeholder="Subject"
              value={gradeData.subject}
              onChange={(e) => setGradeData({ ...gradeData, subject: e.target.value })}
              style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
              required
            />

            <input
              type="number"
              placeholder="Marks (0-100)"
              value={gradeData.marks}
              onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
              style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
              min="0"
              max="100"
              required
            />

            <input
              type="number"
              placeholder="Attendance %"
              value={gradeData.attendance}
              onChange={(e) => setGradeData({ ...gradeData, attendance: e.target.value })}
              style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
              min="0"
              max="100"
              required
            />
          </div>

          <textarea
            placeholder="Additional suggestions or comments..."
            value={gradeData.suggestion}
            onChange={(e) => setGradeData({ ...gradeData, suggestion: e.target.value })}
            style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", minHeight: "80px", marginBottom: "15px" }}
          />

          <button
            type="submit"
            style={{ padding: "12px 24px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Update Marks
          </button>
        </form>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Attendance Management</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
          Select Date
        </label>
        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>Mark Attendance - {new Date(attendanceDate).toLocaleDateString()}</h3>
        </div>
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {filteredStudents.map(student => (
            <div key={student._id} style={{ padding: "15px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, color: "#1e293b" }}>{student.name}</h4>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{student.email}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => markAttendance(student._id, 'present')}
                  style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Present
                </button>
                <button
                  onClick={() => markAttendance(student._id, 'absent')}
                  style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const markAttendance = async (studentId, status) => {
    try {
      // API expects an array of records for daily-attendance
      await api.post('/daily-attendance', {
        records: [
          {
            studentId,
            date: attendanceDate,
            status,
            subject: 'General'
          }
        ]
      });
      showToast(`Attendance marked as ${status}`, 'success');

      // Refresh student data if performance tab active
      if (selectedStudent && selectedStudent._id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      const errMessage = err.response?.data?.msg || err.response?.data || err.message || 'Unknown error';
      console.error('Attendance API error:', errMessage);
      showToast(`Error marking attendance: ${errMessage}`, 'error');
    }
  };

  const renderChat = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Chat with Students</h2>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", height: "600px" }}>
        {/* Students List */}
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>Students</h3>
          </div>
          <div style={{ maxHeight: "520px", overflowY: "auto" }}>
            {chatStudents.map(student => (
              <div
                key={student._id}
                onClick={() => {
                  setSelectedChatStudent(student);
                  fetchChatHistory(student._id);
                }}
                style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  background: selectedChatStudent?._id === student._id ? "#f3f4f6" : "white"
                }}
              >
                <h4 style={{ margin: 0, color: "#1e293b" }}>{student.name}</h4>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{student.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
          {selectedChatStudent ? (
            <>
              <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: 0, color: "#1e293b" }}>Chat with {selectedChatStudent.name}</h3>
              </div>

              <div style={{ flex: 1, padding: "20px", overflowY: "auto", maxHeight: "400px" }}>
                {chatHistory.map((msg, index) => {
                  const userId = localStorage.getItem('userId');
                  const isCurrentUser = String(msg.senderId) === String(userId);

                  return (
                    <div key={index} style={{ marginBottom: "15px", textAlign: isCurrentUser ? 'right' : 'left' }}>
                      <div style={{
                        display: "inline-block",
                        padding: "10px 15px",
                        borderRadius: "18px",
                        background: isCurrentUser ? "#3b82f6" : "#f3f4f6",
                        color: isCurrentUser ? "white" : "#1e293b",
                        maxWidth: "70%"
                      }}>
                        <strong style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>{msg.senderName || (isCurrentUser ? 'You' : 'Student')}</strong>
                        {msg.text || msg.message || ''}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        {new Date(msg.date || msg.timestamp || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "20px", borderTop: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px" }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    style={{ padding: "12px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <MessageCircle size={48} style={{ color: "#9ca3af", marginBottom: "16px" }} />
              <h3 style={{ color: "#6b7280", marginBottom: "8px" }}>Select a Student</h3>
              <p style={{ color: "#9ca3af", textAlign: "center" }}>Choose a student from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const fetchChatHistory = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/history/${otherUserId}`);
      setChatHistory(res.data || []);
    } catch (err) {
      const errMsg = err.response?.data?.msg || err.response?.data || err.message || 'Unknown error';
      console.error('Error fetching chat history:', errMsg, err);
      showToast(`Error fetching chat history: ${errMsg}`, 'error');
      setChatHistory([]);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !selectedChatStudent) return;

    try {
      await api.post('/messages', {
        receiverId: selectedChatStudent._id,
        text: msgText
      });

      const userId = localStorage.getItem('userId');
      const newMessage = {
        senderId: userId,
        senderName: localStorage.getItem('name') || 'You',
        receiverId: selectedChatStudent._id,
        text: msgText,
        date: new Date().toISOString()
      };
      setChatHistory((prev) => [...prev, newMessage]);
      setMsgText("");

      // Refresh to show latest data and handle server-side.
      fetchChatHistory(selectedChatStudent._id);
    } catch (err) {
      const errMsg = err.response?.data?.msg || err.response?.data || err.message || 'Unknown error';
      console.error('Send message error:', errMsg, err);
      showToast(`Error sending message: ${errMsg}`, 'error');
    }
  };

  const renderReports = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Reports & Insights</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {/* Top Performers */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={20} color="#f59e0b" />
            Top Performers
          </h3>
          <div style={{ spaceY: "10px" }}>
            {students.slice(0, 5).map((student, index) => (
              <div key={student._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "bold", color: "#3b82f6" }}>#{index + 1}</span>
                  <span>{student.name}</span>
                </div>
                <span style={{ fontWeight: "bold", color: "#10b981" }}>{student.averageMarks || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Students */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="#ef4444" />
            Need Attention
          </h3>
          <div style={{ spaceY: "10px" }}>
            {students.filter(s => (s.averageMarks || 0) < 40).slice(0, 5).map((student, index) => (
              <div key={student._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "bold", color: "#ef4444" }}>#{index + 1}</span>
                  <span>{student.name}</span>
                </div>
                <span style={{ fontWeight: "bold", color: "#ef4444" }}>{student.averageMarks || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <Brain size={20} color="#8b5cf6" />
            AI Suggestions
          </h3>
          <button
            onClick={generateAISuggestions}
            disabled={loadingSuggestions}
            style={{
              width: "100%",
              padding: "12px",
              background: loadingSuggestions ? "#9ca3af" : "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loadingSuggestions ? "not-allowed" : "pointer",
              marginBottom: "15px"
            }}
          >
            {loadingSuggestions ? "Generating..." : "Generate Suggestions"}
          </button>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} style={{ padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>• {suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Reports */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Download Reports</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => downloadReport('performance')}
            style={{ padding: "12px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <DownloadIcon size={18} />
            Performance Report
          </button>
          <button
            onClick={() => downloadReport('attendance')}
            style={{ padding: "12px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <DownloadIcon size={18} />
            Attendance Report
          </button>
          <button
            onClick={() => downloadReport('predictions')}
            style={{ padding: "12px 20px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <DownloadIcon size={18} />
            Predictions Report
          </button>
        </div>
      </div>
    </div>
  );

  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/faculty/reports/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Report downloaded successfully', 'success');
    } catch (err) {
      showToast('Error downloading report', 'error');
    }
  };

  const renderComparison = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Student Comparison</h2>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#64748b", marginBottom: "10px" }}>Select students to compare (up to 4)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {students.slice(0, 8).map(student => (
            <button
              key={student._id}
              onClick={() => {
                if (comparisonStudents.find(s => s._id === student._id)) {
                  setComparisonStudents(prev => prev.filter(s => s._id !== student._id));
                } else if (comparisonStudents.length < 4) {
                  setComparisonStudents(prev => [...prev, student]);
                }
              }}
              style={{
                padding: "8px 16px",
                border: comparisonStudents.find(s => s._id === student._id) ? "2px solid #3b82f6" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: comparisonStudents.find(s => s._id === student._id) ? "#eff6ff" : "white",
                cursor: "pointer"
              }}
            >
              {student.name}
            </button>
          ))}
        </div>
      </div>

      {comparisonStudents.length > 1 && (
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px", color: "#1e293b" }}>Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              {comparisonStudents.map((student, index) => (
                <Bar key={student._id} dataKey={`student${index + 1}`} fill={COLORS[index % COLORS.length]} name={student.name} />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Leaderboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <select
          value={leaderboardType}
          onChange={(e) => setLeaderboardType(e.target.value)}
          style={{ padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", marginRight: "10px" }}
        >
          <option value="marks">By Marks</option>
          <option value="attendance">By Attendance</option>
          <option value="cgpa">By CGPA</option>
        </select>
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>Top 10 Students</h3>
        </div>
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {leaderboard.map((student, index) => (
            <div key={student._id} style={{ padding: "15px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: index === 0 ? "#f59e0b" : index === 1 ? "#9ca3af" : index === 2 ? "#92400e" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold"
                }}>
                  {index + 1}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: "#1e293b" }}>{student.name}</h4>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{student.department}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
                  {leaderboardType === 'marks' && `${student.averageMarks || 0}%`}
                  {leaderboardType === 'attendance' && `${student.attendancePercent || 0}%`}
                  {leaderboardType === 'cgpa' && `${student.cgpa || 0}`}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  {leaderboardType === 'marks' && 'Average Marks'}
                  {leaderboardType === 'attendance' && 'Attendance %'}
                  {leaderboardType === 'cgpa' && 'CGPA'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1e293b" }}>Activity Tracking</h2>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>Recent Activities</h3>
        </div>
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {activityLog.length > 0 ? activityLog.map((activity, index) => (
            <div key={index} style={{ padding: "15px 20px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, color: "#1e293b", fontWeight: "500" }}>{activity.description}</p>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{activity.studentName}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{new Date(activity.timestamp).toLocaleDateString()}</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Clock size={48} style={{ color: "#9ca3af", marginBottom: "16px" }} />
              <h3 style={{ color: "#6b7280", marginBottom: "8px" }}>No Activities Yet</h3>
              <p style={{ color: "#9ca3af" }}>Activity logs will appear here as you interact with student data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "280px" : "80px",
        background: "white",
        borderRight: "1px solid #e2e8f0",
        transition: "width 0.3s ease",
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        zIndex: 100,
        overflow: "hidden"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <GraduationCap size={20} />
              </div>
              {sidebarOpen && <span style={{ fontWeight: "800", fontSize: "18px", color: "#1e293b" }}>Academic Monitor</span>}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 0" }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: activeTab === item.id ? "#eff6ff" : "transparent",
                border: "none",
                borderRadius: 0,
                cursor: "pointer",
                color: activeTab === item.id ? "#2563eb" : "#64748b",
                textAlign: "left",
                transition: "all 0.2s ease"
              }}
            >
              <item.icon size={20} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>{item.label}</span>}
            </button>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px" }}>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            style={{
              width: "100%",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#fee2e2",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#dc2626"
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div {...getSidebarAwareContainerProps(sidebarOpen, {
        flex: 1,
        marginLeft: sidebarOpen ? "280px" : "80px",
        transition: "margin-left 0.3s ease",
        minHeight: "100vh"
      })}>
        {/* Header */}
        <div style={{ background: "#1e293b", padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "24px" }}>Welcome, {facultyName}</h1>
            <p style={{ margin: "4px 0", color: "#cbd5e1" }}>Faculty Dashboard</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "0" }}>
          {activeTab === "Dashboard" && renderDashboard()}
          {activeTab === "Students" && renderStudents()}
          {activeTab === "Performance" && renderPerformance()}
          {activeTab === "Predictions" && renderPredictions()}
          {activeTab === "Marks" && renderMarks()}
          {activeTab === "Attendance" && renderAttendance()}
          {activeTab === "Chat" && renderChat()}
          {activeTab === "Reports" && renderReports()}
          {activeTab === "Comparison" && renderComparison()}
          {activeTab === "Leaderboard" && renderLeaderboard()}
          {activeTab === "Activity" && renderActivity()}
        </div>
      </div>

      {/* Toasts */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <X size={18} />}
            {toast.type === 'info' && <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
