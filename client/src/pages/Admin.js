
import { useEffect, useState } from "react";
import api from "../api";
import ErrorBoundary from "../components/ErrorBoundary";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users, UserCheck, ShieldAlert, Settings,
  UserPlus, Search, Shield, LogOut,
  BookOpen, Calendar, BarChart3, Bell, ArrowRight,
  TrendingUp, Clock, FileText, Plus, Edit2, CheckCircle, Brain, X, Download, Star, Menu, Users as UsersIcon, RefreshCw, Trash2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("Assignments");
  const adminName = localStorage.getItem("name") || "Admin";
  const [stats, setStats] = useState({
    totalStudents: 0, totalTeachers: 0, totalCourses: 0,
    avgGpa: "0.00", avgAttendance: 0, recentActivities: []
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check user role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "user", "course"
  const [editingItem, setEditingItem] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    studentEmail: "",
    teacherEmail: "",
    department: ""
  });
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [userData, setUserData] = useState({
    name: "", email: "", password: "", role: "student",
    department: "", rollNumber: "", semester: "1"
  });
  const [courseData, setCourseData] = useState({ code: "", title: "", teacher: "", department: "" });
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes, anncRes, assignmentsRes, teachersRes, studentsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/users"),
        api.get("/admin/courses"),
        api.get("/announcements"),
        api.get("/admin/assignments"),
        api.get("/admin/teachers"),
        api.get("/admin/students")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setAnnouncements(anncRes.data);
      setAssignments(assignmentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Admin Fetch Error:", err);
      // Add more detailed error logging
      if (err.response) {
        console.error("Response Status:", err.response.status);
        console.error("Response Data:", err.response.data);
      }
      if (err.message) {
        console.error("Error Message:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.patch(`/admin/reset-password/${editingItem._id}`, { newPassword: userData.password });
        alert("Password updated");
      } else {
        await api.post("/register", userData);
        alert("User Registered Successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      fetchAdminData();
    } catch (e) { alert("Action failed"); }
  };

  const handleCreateOrUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        alert("Update mock successful (Backend PUT route pending)");
      } else {
        await api.post("/admin/courses", courseData);
        alert("Course Created Successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      fetchAdminData();
    } catch (e) { alert("Error saving course"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAdminData();
    } catch (e) { alert("Delete failed"); }
  };

  // Assignment Management Functions
  const fetchAssignments = async () => {
    try {
      const res = await api.get("/admin/assignments");
      setAssignments(res.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const createAssignment = async () => {
    const cleanedStudentEmail = assignmentData.studentEmail?.trim();
    const cleanedTeacherEmail = assignmentData.teacherEmail?.trim();

    if (!cleanedStudentEmail || !cleanedTeacherEmail) {
      alert("Please select both student and teacher.");
      return;
    }

    const payload = {
      studentEmail: cleanedStudentEmail,
      teacherEmail: cleanedTeacherEmail,
      department: assignmentData.department?.trim() || ""
    };

    console.log("Creating assignment payload", payload);

    try {
      const res = await api.post("/admin/assignments", payload);
      if (res.data?.success) {
        alert(res.data.msg || res.data.message || "Assignment created successfully.");
        setAssignmentData({ studentEmail: "", teacherEmail: "", department: "" });
        fetchAssignments();
      } else {
        const errorMessage = res.data?.msg || res.data?.message || "Failed to create assignment.";
        console.warn("Assignment creation failed response", res.data);
        alert(errorMessage);
      }
    } catch (err) {
      console.error("Error creating assignment:", err, "response", err.response?.data);
      const serverMessage = err.response?.data?.msg || err.response?.data?.message || err.message;
      alert(serverMessage || "Failed to create assignment. Please check server logs.");
    }
  };

  const editAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentData({
      studentEmail: assignment.studentEmail,
      teacherEmail: assignment.teacherEmail,
      department: assignment.department || ""
    });
  };

  const updateAssignment = async () => {
    if (!editingAssignment) return;

    try {
      const res = await api.put(`/admin/assignments/${editingAssignment._id}`, assignmentData);
      if (res.data.success) {
        alert(res.data.message);
        setEditingAssignment(null);
        setAssignmentData({ studentEmail: "", teacherEmail: "", department: "" });
        fetchAssignments();
      } else {
        alert(res.data.message || "Failed to update assignment");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update assignment");
    }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("Failed to delete assignment");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchAdminData();
    } catch (e) { alert("Delete failed"); }
  };

  const openUserModal = (user = null) => {
    setEditingItem(user);
    setUserData(user ? { ...user, password: "" } : {
      name: "", email: "", password: "", role: "student",
      department: "Computer Science", rollNumber: "", semester: "1"
    });
    setModalType("user");
    setShowModal(true);
  };

  const openCourseModal = (course = null) => {
    setEditingItem(course);
    setCourseData(course ? { ...course } : { code: "", title: "", teacher: "", department: "" });
    setModalType("course");
    setShowModal(true);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("EduMonitor Academic Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const autogen = (docObj, options) => {
      if (typeof docObj.autoTable === 'function') {
        docObj.autoTable(options);
      } else {
        autoTable(docObj, options);
      }
    };

    autogen(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Students', stats.totalStudents],
        ['Total Faculty', stats.totalTeachers],
        ['Total Courses', stats.totalCourses],
        ['Average GPA', stats.avgGpa],
        ['Avg Attendance', `${stats.avgAttendance}%`]
      ],
    });

    doc.save("institutional_report.pdf");
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
        <div style={{ background: `${color}15`, padding: "12px", borderRadius: "12px", color: color }}>
          <Icon size={24} />
        </div>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", background: "#dcfce7", padding: "4px 8px", borderRadius: "20px" }}>+12%</span>
      </div>
      <h2 style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "800", color: "#1e293b" }}>{value}</h2>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#64748b" }}>{title}</p>
      {subtitle && <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>{subtitle}</p>}
    </div>
  );

  const SidebarItem = ({ icon: Icon, label }) => (
    <div
      onClick={() => { setActiveTab(label); setSidebarOpen(false); }}
      style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px",
        borderRadius: "15px", cursor: "pointer", marginBottom: "4px",
        background: activeTab === label ? "rgba(37, 99, 235, 0.1)" : "transparent",
        color: activeTab === label ? "#2563eb" : "#94a3b8",
        fontWeight: "700",
        transition: "all 0.2s"
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
      {activeTab === label && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb" }}></div>}
    </div>
  );

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }}></div>
        <p style={{ fontWeight: "800", color: "#1e293b" }}>System Booting...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", width: "100%", background: "#f8fafc", display: "flex", fontFamily: "'Inter', sans-serif", position: "relative", overflowX: "hidden" }}>

      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 99,
          }}
        />
      )}

      {/* SIDEBAR */}
      <div
        style={{
          width: "280px", background: "white", borderRight: "1px solid #e2e8f0", padding: "30px",
          position: "fixed", left: 0, top: 0, height: "100vh", zIndex: 100,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
              <Shield size={22} />
            </div>
            <span style={{ fontWeight: "900", fontSize: "20px", color: "#1e293b", letterSpacing: "-1px" }}>EDUMONITOR</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            style={{ border: "none", background: "#f1f5f9", borderRadius: "10px", padding: "8px", cursor: "pointer", display: "flex", flexShrink: 0 }}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={{ display: "grid", gap: "2px" }}>
          <SidebarItem icon={BarChart3} label="Dashboard" />
          <SidebarItem icon={UsersIcon} label="Users" />
          <SidebarItem icon={UserCheck} label="Assignments" />
          <SidebarItem icon={Brain} label="Performance Prediction" />
          <SidebarItem icon={BookOpen} label="Departments" />
          <SidebarItem icon={Calendar} label="Attendance & Marks" />
          <SidebarItem icon={Bell} label="Notifications" />
          <SidebarItem icon={FileText} label="Reports" />
          <SidebarItem icon={Settings} label="Settings" />
        </div>

        <div style={{ position: "absolute", bottom: "30px", left: "30px", right: "30px" }}>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px", borderRadius: "15px", border: "1px solid #fee2e2", background: "#fff1f1", color: "#ef4444", fontWeight: "800", cursor: "pointer" }}
          >
            <LogOut size={18} /> Exit Admin
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, width: "100%", minWidth: 0, marginLeft: 0, padding: "40px", minHeight: "100vh", boxSizing: "border-box" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "44px", height: "44px", borderRadius: "14px",
                border: "1px solid #e2e8f0", background: "white", cursor: "pointer", color: "#1e293b", flexShrink: 0,
              }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#1e293b", margin: 0 }}>{activeTab}</h1>
              <p style={{ margin: "5px 0 0 0", color: "#64748b", fontWeight: "600" }}>University Control Center • Session 2026</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={fetchAdminData} style={{ background: "white", border: "1px solid #e2e8f0", padding: "12px 24px", borderRadius: "15px", fontWeight: "800", color: "#1e293b", cursor: "pointer" }}>Reload Stats</button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px 16px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
              <ShieldAlert size={18} color="#2563eb" />
              <span style={{ fontWeight: "900", color: "#1e293b" }}>{adminName}</span>
            </div>
            <button
              type="button"
              onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff1f1", border: "1px solid #fecaca", padding: "12px 20px", borderRadius: "15px", fontWeight: "800", color: "#ef4444", cursor: "pointer" }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {activeTab === "Dashboard" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
              <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="#3b82f6" subtitle="Enrolled" />
              <StatCard title="Total Faculty" value={stats.totalTeachers} icon={UserCheck} color="#10b981" subtitle="Active Staff" />
              <StatCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} color="#8b5cf6" subtitle="Programs" />
              <StatCard title="Avg GPA" value={stats.avgGpa} icon={Star} color="#f59e0b" subtitle="Success Rate" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              <div style={{ background: "white", padding: "30px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: "0 0 25px 0", fontWeight: "800" }}>Enrollment Trend</h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <AreaChart data={[{ name: 'Jan', students: 120 }, { name: 'Feb', students: 150 }, { name: 'Mar', students: 180 }, { name: 'Apr', students: 200 }, { name: 'May', students: 220 }, { name: 'Jun', students: 250 }]}>
                      <defs><linearGradient id="enrollment" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#enrollment)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "white", padding: "30px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: "0 0 25px 0", fontWeight: "800" }}>Performance Distribution</h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (90-100)', value: 35, fill: '#10b981' },
                          { name: 'Good (80-89)', value: 45, fill: '#3b82f6' },
                          { name: 'Average (70-79)', value: 15, fill: '#f59e0b' },
                          { name: 'Needs Improvement (&lt;70)', value: 5, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Excellent (90-100)', value: 35, fill: '#10b981' },
                          { name: 'Good (80-89)', value: 45, fill: '#3b82f6' },
                          { name: 'Average (70-79)', value: 15, fill: '#f59e0b' },
                          { name: 'Needs Improvement (&lt;70)', value: 5, fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "30px" }}>
              <div style={{ background: "white", padding: "30px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: "0 0 25px 0", fontWeight: "800" }}>GPA Trends Over Time</h3>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer>
                    <LineChart data={[{ semester: 'Sem 1', gpa: 3.2 }, { semester: 'Sem 2', gpa: 3.4 }, { semester: 'Sem 3', gpa: 3.1 }, { semester: 'Sem 4', gpa: 3.6 }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "white", padding: "30px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: "0 0 25px 0", fontWeight: "800" }}>Recent Activities</h3>
                <div style={{ display: "grid", gap: "20px" }}>
                  {stats.recentActivities && stats.recentActivities.map((act, i) => (
                    <div key={i} style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", marginTop: "6px" }}></div>
                      <div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{act.text}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>{act.time}</p>
                      </div>
                    </div>
                  ))}
                  {(!stats.recentActivities || stats.recentActivities.length === 0) && (
                    <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Users" && (
          <div style={{ background: "white", borderRadius: "30px", padding: "35px", border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
              <div style={{ background: "#f8fafc", padding: "12px 20px", borderRadius: "15px", border: "1px solid #e2e8f0", width: "450px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Search size={20} color="#94a3b8" />
                <input placeholder="Search records by name or email..." style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontWeight: "600" }} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => openUserModal()} style={{ background: "#2563eb", color: "white", border: "none", padding: "14px 28px", borderRadius: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                <UserPlus size={20} /> New Account
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#94a3b8" }}>
                  <th style={{ padding: "0 20px" }}>FULL NAME</th>
                  <th>ROLE/DEPT</th>
                  <th>ID STATUS</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} style={{ background: "#f8fafc" }}>
                    <td style={{ padding: "20px", borderRadius: "15px 0 0 15px", fontWeight: "800", color: "#1e293b" }}>
                      {user.name}
                      <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{user.email}</p>
                    </td>
                    <td>
                      <span style={{ padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "900", background: user.role === 'admin' ? "#f3e8ff" : user.role === 'faculty' ? "#dcfce7" : "#eff6ff", color: user.role === 'admin' ? "#7e22ce" : user.role === 'faculty' ? "#15803d" : "#2563eb", textTransform: "uppercase" }}>
                        {user.role}
                      </span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "10px", fontWeight: "700" }}>{user.department}</p>
                    </td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", color: "#10b981" }}><div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }}></div> Active</div></td>
                    <td style={{ borderRadius: "0 15px 15px 0", textAlign: "right", paddingRight: "20px" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button onClick={() => openUserModal(user)} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", cursor: "pointer" }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteUser(user._id)} style={{ padding: "10px", borderRadius: "12px", border: "1px solid #fee2e2", background: "white", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Assignments" && (
          <div style={{ background: "white", borderRadius: "30px", padding: "40px", border: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>Student-Teacher Assignment Management</h2>
                <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Assign students to teachers and manage teacher assignments</p>
              </div>
              <button onClick={fetchAssignments} style={{ background: "#2563eb", color: "white", padding: "12px 24px", borderRadius: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                <RefreshCw size={20} /> Refresh
              </button>
            </div>

            <div style={{ display: "grid", gap: "30px" }}>
              {/* Assignment Form */}
              <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Create New Assignment</h3>
                <div style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Student Email</label>
                    <select
                      value={assignmentData.studentEmail}
                      onChange={(e) => setAssignmentData({ ...assignmentData, studentEmail: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student.email}>
                          {student.name} ({student.email}) - {student.rollNumber || 'No Roll Number'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Teacher Email</label>
                    <select
                      value={assignmentData.teacherEmail}
                      onChange={(e) => setAssignmentData({ ...assignmentData, teacherEmail: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher.email}>
                          {teacher.name} ({teacher.email}) - {teacher.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Department (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={assignmentData.department}
                      onChange={(e) => setAssignmentData({ ...assignmentData, department: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    {editingAssignment ? (
                      <button
                        onClick={updateAssignment}
                        style={{ background: "#10b981", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                      >
                        <CheckCircle size={18} /> Update Assignment
                      </button>
                    ) : (
                      <button
                        onClick={createAssignment}
                        style={{ background: "#2563eb", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                      >
                        <UserPlus size={18} /> Create Assignment
                      </button>
                    )}
                    <button
                      onClick={() => { setAssignmentData({ studentEmail: "", teacherEmail: "", department: "", assignmentType: "student" }); setEditingAssignment(null) }}
                      style={{ background: "#6b7280", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      <X size={18} /> Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Assignments */}
              <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Current Assignments</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                    <thead>
                      <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Student</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Teacher</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Department</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Assigned Date</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment, index) => (
                        <tr key={assignment._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: "600" }}>{assignment.studentName}</td>
                          <td style={{ padding: "12px" }}>{assignment.studentEmail}</td>
                          <td style={{ padding: "12px" }}>{assignment.teacherName} ({assignment.teacherEmail})</td>
                          <td style={{ padding: "12px" }}>{assignment.department || "—"}</td>
                          <td style={{ padding: "12px" }}>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => editAssignment(assignment)}
                                style={{ background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "none" }}
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => deleteAssignment(assignment._id)}
                                style={{ background: "#ef4444", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "none", marginLeft: "8px" }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {assignments.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      <p>No assignments found. Create the first assignment to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Performance Prediction" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>Performance Prediction Control</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Trigger AI-powered predictions and view student performance forecasts</p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm("Trigger prediction for all students? This may take some time.")) {
                      alert("Prediction triggered successfully! Results will be updated shortly.");
                    }
                  }}
                  style={{ background: "#10b981", color: "white", padding: "14px 28px", borderRadius: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Brain size={20} /> Trigger Prediction
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                <div style={{ background: "#f0f9ff", padding: "20px", borderRadius: "15px", border: "1px solid #e0f2fe" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#0369a1" }}>Excellent</h4>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#0369a1" }}>35%</p>
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>90-100 GPA predicted</p>
                </div>
                <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "15px", border: "1px solid #dcfce7" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#15803d" }}>Good</h4>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#15803d" }}>45%</p>
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>80-89 GPA predicted</p>
                </div>
                <div style={{ background: "#fffbeb", padding: "20px", borderRadius: "15px", border: "1px solid #fef3c7" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#d97706" }}>Average</h4>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#d97706" }}>15%</p>
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>70-79 GPA predicted</p>
                </div>
                <div style={{ background: "#fef2f2", padding: "20px", borderRadius: "15px", border: "1px solid #fee2e2" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "800", color: "#dc2626" }}>Needs Improvement</h4>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#dc2626" }}>5%</p>
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>&lt;70 GPA predicted</p>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Prediction Results</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                    <thead>
                      <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Student Name</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Current GPA</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Predicted GPA</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Category</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Alice Johnson", current: 3.2, predicted: 3.8, category: "Excellent", risk: "Low" },
                        { name: "Bob Smith", current: 2.8, predicted: 3.1, category: "Good", risk: "Medium" },
                        { name: "Charlie Brown", current: 2.5, predicted: 2.7, category: "Average", risk: "Medium" },
                        { name: "Diana Prince", current: 1.9, predicted: 2.2, category: "Needs Improvement", risk: "High" }
                      ].map((student, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: "600" }}>{student.name}</td>
                          <td style={{ padding: "12px" }}>{student.current}</td>
                          <td style={{ padding: "12px", fontWeight: "700", color: student.category === 'Excellent' ? '#10b981' : student.category === 'Good' ? '#3b82f6' : student.category === 'Average' ? '#f59e0b' : '#ef4444' }}>{student.predicted}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              background: student.category === 'Excellent' ? '#dcfce7' : student.category === 'Good' ? '#dbeafe' : student.category === 'Average' ? '#fef3c7' : '#fee2e2',
                              color: student.category === 'Excellent' ? '#166534' : student.category === 'Good' ? '#1e40af' : student.category === 'Average' ? '#92400e' : '#991b1b',
                              textTransform: "uppercase"
                            }}>
                              {student.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              background: student.risk === 'Low' ? '#dcfce7' : student.risk === 'Medium' ? '#fef3c7' : '#fee2e2',
                              color: student.risk === 'Low' ? '#166534' : student.risk === 'Medium' ? '#92400e' : '#991b1b',
                              textTransform: "uppercase"
                            }}>
                              {student.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Departments" && (
          <div style={{ background: "white", borderRadius: "30px", padding: "40px", border: "1px solid #f1f5f9", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", background: "#fef3c7", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", margin: "0 auto 30px" }}>
              <FileText size={40} />
            </div>
            <h2 style={{ fontWeight: "900", marginBottom: "15px" }}>Institutional Performance Report</h2>
            <p style={{ color: "#64748b", fontWeight: "600", maxWidth: "500px", margin: "0 auto 40px" }}>
              Generate a comprehensive overview of the current academic session including enrollment counts, average performance velocity, and faculty engagement metrics.
            </p>
            <button onClick={generatePDFReport} style={{ background: "#1e293b", color: "white", padding: "18px 40px", borderRadius: "15px", fontWeight: "800", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", margin: "0 auto" }}>
              <Download size={20} /> Download PDF Report
            </button>
          </div>
        )}

        {activeTab === "Departments" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>Department Management</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Manage academic departments and faculty assignments</p>
                </div>
                <button
                  onClick={() => setModalType("department")}
                  style={{ background: "#2563eb", color: "white", padding: "14px 28px", borderRadius: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Plus size={20} /> Add Department
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {[
                  { name: "Computer Science", head: "Dr. Sarah Wilson", students: 45, faculty: 8 },
                  { name: "Mathematics", head: "Prof. Michael Chen", students: 38, faculty: 6 },
                  { name: "Physics", head: "Dr. Emily Davis", students: 32, faculty: 5 },
                  { name: "Chemistry", head: "Prof. Robert Johnson", students: 28, faculty: 4 }
                ].map((dept, index) => (
                  <div key={index} style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>{dept.name}</h3>
                      <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Head: {dept.head}</p>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 5px", fontSize: "20px", fontWeight: "900", color: "#2563eb" }}>{dept.students}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Students</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 5px", fontSize: "20px", fontWeight: "900", color: "#10b981" }}>{dept.faculty}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Faculty</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Attendance & Marks" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>Attendance & Marks Management</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>View and manage student attendance records and academic performance</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ background: "#10b981", color: "white", padding: "14px 28px", borderRadius: "15px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Download size={20} /> Export Data
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
                <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Attendance Overview</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <span style={{ fontWeight: "600", color: "#64748b" }}>Current Month</span>
                    <span style={{ fontSize: "24px", fontWeight: "900", color: "#10b981" }}>87%</span>
                  </div>
                  <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "87%", height: "100%", background: "#10b981", borderRadius: "4px" }}></div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Marks Distribution</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 5px", fontSize: "20px", fontWeight: "900", color: "#2563eb" }}>3.4</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Avg GPA</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 5px", fontSize: "20px", fontWeight: "900", color: "#f59e0b" }}>85%</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Pass Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Student Performance Records</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                    <thead>
                      <tr style={{ textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#94a3b8", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Student</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Subject</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Marks</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Attendance</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600" }}>Grade</th>
                        <th style={{ padding: "12px", background: "#f8fafc", fontWeight: "600", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Alice Johnson", subject: "Computer Science", marks: 92, attendance: 95, grade: "A" },
                        { name: "Bob Smith", subject: "Mathematics", marks: 78, attendance: 88, grade: "B" },
                        { name: "Charlie Brown", subject: "Physics", marks: 85, attendance: 92, grade: "A-" },
                        { name: "Diana Prince", subject: "Chemistry", marks: 67, attendance: 78, grade: "C" }
                      ].map((record, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: "600" }}>{record.name}</td>
                          <td style={{ padding: "12px" }}>{record.subject}</td>
                          <td style={{ padding: "12px", fontWeight: "700", color: record.marks >= 90 ? '#10b981' : record.marks >= 80 ? '#3b82f6' : record.marks >= 70 ? '#f59e0b' : '#ef4444' }}>{record.marks}%</td>
                          <td style={{ padding: "12px" }}>{record.attendance}%</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              background: record.grade.startsWith('A') ? '#dcfce7' : record.grade.startsWith('B') ? '#dbeafe' : record.grade.startsWith('C') ? '#fef3c7' : '#fee2e2',
                              color: record.grade.startsWith('A') ? '#166534' : record.grade.startsWith('B') ? '#1e40af' : record.grade.startsWith('C') ? '#92400e' : '#991b1b',
                              textTransform: "uppercase"
                            }}>
                              {record.grade}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <button style={{ background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "none" }}>
                              <Edit2 size={14} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Reports" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>Reports & Export</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Generate and download comprehensive reports</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <button
                  onClick={generatePDFReport}
                  style={{ background: "#2563eb", color: "white", padding: "25px", borderRadius: "15px", fontWeight: "800", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                >
                  <FileText size={32} />
                  <span>Institutional Report</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>PDF Format</span>
                </button>
                <button
                  style={{ background: "#10b981", color: "white", padding: "25px", borderRadius: "15px", fontWeight: "800", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                >
                  <Download size={32} />
                  <span>Student Performance</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>Excel Format</span>
                </button>
                <button
                  style={{ background: "#f59e0b", color: "white", padding: "25px", borderRadius: "15px", fontWeight: "800", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                >
                  <BarChart3 size={32} />
                  <span>Analytics Report</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>CSV Format</span>
                </button>
                <button
                  style={{ background: "#ef4444", color: "white", padding: "25px", borderRadius: "15px", fontWeight: "800", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}
                >
                  <Calendar size={32} />
                  <span>Attendance Report</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.8 }}>PDF Format</span>
                </button>
              </div>

              <div style={{ background: "#f8fafc", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Recent Reports</h3>
                <div style={{ display: "grid", gap: "15px" }}>
                  {[
                    { name: "Monthly Performance Report", date: "2026-04-01", type: "PDF", size: "2.4 MB" },
                    { name: "Student Attendance Summary", date: "2026-03-28", type: "Excel", size: "1.8 MB" },
                    { name: "Department Analytics", date: "2026-03-25", type: "CSV", size: "956 KB" }
                  ].map((report, index) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "white", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: "700", color: "#1e293b" }}>{report.name}</h4>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Generated: {report.date} • {report.size}</p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span style={{ padding: "4px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>{report.type}</span>
                        <button style={{ background: "#2563eb", color: "white", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "none" }}>
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div style={{ display: "grid", gap: "40px" }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#1e293b" }}>System Settings</h2>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Configure application settings and preferences</p>
                </div>
              </div>

              <div style={{ display: "grid", gap: "30px" }}>
                <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>AI Model Configuration</h3>
                  <div style={{ display: "grid", gap: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Prediction Model</label>
                      <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}>
                        <option>Advanced ML Model (Current)</option>
                        <option>Basic Statistical Model</option>
                        <option>Custom Model</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Accuracy Threshold</label>
                      <input type="range" min="70" max="95" defaultValue="85" style={{ width: "100%" }} />
                      <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>Current: 85%</p>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Theme & Appearance</h3>
                  <div style={{ display: "grid", gap: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Dashboard Theme</label>
                      <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}>
                        <option>Modern Blue (Current)</option>
                        <option>Dark Professional</option>
                        <option>Light Minimal</option>
                        <option>Green Academic</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button style={{ background: "#2563eb", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}>
                        Apply Theme
                      </button>
                      <button style={{ background: "#6b7280", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}>
                        Reset to Default
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>System Maintenance</h3>
                  <div style={{ display: "grid", gap: "15px" }}>
                    <button style={{ background: "#10b981", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                      <RefreshCw size={18} /> Clear Cache
                    </button>
                    <button style={{ background: "#f59e0b", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Download size={18} /> Backup Data
                    </button>
                    <button style={{ background: "#ef4444", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Trash2 size={18} /> Reset System
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL SYSTEM */}
        {showModal && (
          <div
            role="presentation"
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 999,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                background: "white", borderRadius: "20px", padding: "40px", width: "90%", maxWidth: "500px",
                maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#1e293b" }}>
                  {modalType === "user" ? (editingItem ? "Edit User" : "Create New User") : modalType === "course" ? (editingItem ? "Edit Course" : "Create New Course") : modalType === "department" ? "Create New Department" : "New Notice"}
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingItem(null); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px" }}
                >
                  <X size={24} color="#64748b" />
                </button>
              </div>

              {modalType === "user" && (
                <form onSubmit={handleCreateOrUpdateUser} style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Full Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Password</label>
                    <input
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      placeholder={editingItem ? "Leave blank to keep current" : "Enter password"}
                      required={!editingItem}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Role</label>
                    <select
                      value={userData.role}
                      onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Department</label>
                    <input
                      type="text"
                      value={userData.department}
                      onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="submit"
                      style={{ background: "#2563eb", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      {editingItem ? "Update User" : "Create User"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingItem(null); }}
                      style={{ background: "#6b7280", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {modalType === "course" && (
                <form onSubmit={handleCreateOrUpdateCourse} style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Course Code</label>
                    <input
                      type="text"
                      value={courseData.code}
                      onChange={(e) => setCourseData({ ...courseData, code: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Course Title</label>
                    <input
                      type="text"
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Teacher</label>
                    <input
                      type="text"
                      value={courseData.teacher}
                      onChange={(e) => setCourseData({ ...courseData, teacher: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Department</label>
                    <input
                      type="text"
                      value={courseData.department}
                      onChange={(e) => setCourseData({ ...courseData, department: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="submit"
                      style={{ background: "#2563eb", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      {editingItem ? "Update Course" : "Create Course"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingItem(null); }}
                      style={{ background: "#6b7280", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {modalType === "department" && (
                <form style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Department Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science"
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Department Head</label>
                    <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }}>
                      <option>Select Department Head</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>Description</label>
                    <textarea
                      placeholder="Brief description of the department"
                      rows="3"
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="submit"
                      style={{ background: "#2563eb", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      Create Department
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setEditingItem(null); }}
                      style={{ background: "#6b7280", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", border: "none", flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </ErrorBoundary>
);
}
