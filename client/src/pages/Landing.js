
import { LayoutDashboard, BookOpen, Users, Brain, Shield, ChevronRight, Mail, Phone, MapPin, Star, Award, Zap } from "lucide-react";

export default function Landing() {
    const scrollToLogin = () => {
        window.location.href = "/login";
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b" }}>

            {/* NAVBAR */}
            <nav style={{ position: "fixed", top: 0, width: "100%", height: "80px", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", zIndex: 1000 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                        <LayoutDashboard size={24} />
                    </div>
                    <span style={{ fontWeight: "900", fontSize: "22px", letterSpacing: "-1px" }}>EDUMONITOR</span>
                </div>
                <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
                    <a href="#about" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px" }}>About</a>
                    <a href="#features" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px" }}>Features</a>
                    <a href="#contact" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px" }}>Contact</a>
                    <button onClick={scrollToLogin} style={{ background: "#2563eb", color: "white", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "800", cursor: "pointer", transition: "all 0.3s" }}>Login Portal</button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section style={{ paddingTop: "180px", paddingBottom: "100px", textAlign: "center", background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
                    <div style={{ background: "#dcfce7", color: "#166534", padding: "8px 20px", borderRadius: "30px", fontSize: "12px", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "25px" }}>
                        <Brain size={16} /> POWERED BY ACADEMIC INTELLIGENCE
                    </div>
                    <h1 style={{ fontSize: "64px", fontWeight: "900", lineHeight: "1.1", marginBottom: "25px", letterSpacing: "-2px" }}>
                        Monitoring Excellence, <span style={{ color: "#2563eb" }}>Empowering Success.</span>
                    </h1>
                    <p style={{ fontSize: "18px", color: "#64748b", maxWidth: "600px", margin: "0 auto 40px", fontWeight: "600", lineHeight: "1.6" }}>
                        The ultimate Online Academic Performance Monitor for institutions. Real-time insights, AI-driven predictions, and seamless collaboration between Faculty and Students.
                    </p>
                    <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                        <button onClick={scrollToLogin} style={{ background: "#2563eb", color: "white", padding: "18px 36px", borderRadius: "15px", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)" }}>
                            Get Started <ChevronRight size={20} />
                        </button>
                        <button style={{ background: "white", color: "#1e293b", padding: "18px 36px", borderRadius: "15px", border: "1px solid #e2e8f0", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>Watch Demo</button>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section style={{ padding: "60px 0", background: "white", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", padding: "0 80px" }}>
                    {[
                        { v: "15,000+", l: "Students Enrolled", i: Users, c: "#3b82f6" },
                        { v: "500+", l: "Expert Faculty", i: Award, c: "#10b981" },
                        { v: "98%", l: "Success Velocity", i: Zap, c: "#f59e0b" },
                        { v: "AI-Driven", l: "Growth Insights", i: Brain, c: "#8b5cf6" }
                    ].map((s, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ color: s.c, marginBottom: "10px", display: "flex", justifyContent: "center" }}><s.i size={32} /></div>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", margin: 0 }}>{s.v}</h2>
                            <p style={{ margin: 0, fontWeight: "700", color: "#64748b", fontSize: "14px" }}>{s.l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" style={{ padding: "120px 80px", background: "#f8fafc" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h2 style={{ fontSize: "42px", fontWeight: "900", marginBottom: "15px", letterSpacing: "-1px" }}>Comprehensive Ecosystem</h2>
                    <p style={{ color: "#64748b", fontWeight: "600" }}>Everything you need to monitor academic growth in one place.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                    {[
                        {
                            title: "Admin Control",
                            desc: "Manage users, faculty assignments, and overall institutional performance with advanced audit logs.",
                            icon: Shield, color: "#3b82f6", bg: "#eff6ff"
                        },
                        {
                            title: "Faculty Dashboard",
                            desc: "Upload marks, track attendance, and send targeted signals to student cohorts in real-time.",
                            icon: BookOpen, color: "#10b981", bg: "#ecfdf5"
                        },
                        {
                            title: "Student Portal",
                            desc: "View academic milestones, track study velocity, and communicate directly with faculty staff.",
                            icon: LayoutDashboard, color: "#8b5cf6", bg: "#f5f3ff"
                        },
                        {
                            title: "AI Predictions",
                            desc: "Proactive identifies weak areas and predicts final GPAs based on historical velocity.",
                            icon: Brain, color: "#f59e0b", bg: "#fffbeb"
                        },
                        {
                            title: "Attendance tracking",
                            desc: "Automated attendance logs with manual faculty verification and student transparency.",
                            icon: Users, color: "#ef4444", bg: "#fef2f2"
                        },
                        {
                            title: "Export & Reporting",
                            desc: "Generate professional PDF reports for results, statistics, and system-wide audit metrics.",
                            icon: Zap, color: "#06b6d4", bg: "#ecfeff"
                        }
                    ].map((f, i) => (
                        <div key={i} style={{ background: "white", padding: "40px", borderRadius: "30px", border: "1px solid #e2e8f0", transition: "transform 0.3s" }}>
                            <div style={{ background: f.bg, color: f.color, width: "60px", height: "60px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "25px" }}>
                                <f.icon size={30} />
                            </div>
                            <h3 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "15px" }}>{f.title}</h3>
                            <p style={{ color: "#64748b", fontWeight: "600", lineHeight: "1.6", margin: 0 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" style={{ padding: "120px 80px", background: "white" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "100px", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: "42px", fontWeight: "900", marginBottom: "25px", letterSpacing: "-1px" }}>Need Assistance?</h2>
                        <p style={{ color: "#64748b", fontWeight: "600", lineHeight: "1.8", marginBottom: "40px" }}>
                            Our administration team is available to help institutions set up their academic monitoring system. Reach out for technical support or general inquiries.
                        </p>
                        <div style={{ display: "grid", gap: "25px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ background: "#eff6ff", color: "#2563eb", width: "50px", height: "50px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail size={24} /></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Email Support</p>
                                    <p style={{ margin: 0, fontWeight: "800" }}>admin@edumonitor.edu</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ background: "#ecfdf5", color: "#10b981", width: "50px", height: "50px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={24} /></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Phone Hotline</p>
                                    <p style={{ margin: 0, fontWeight: "800" }}>+1 (555) 000-EDUM</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ background: "#fdf2f8", color: "#db2777", width: "50px", height: "50px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={24} /></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Institution HQ</p>
                                    <p style={{ margin: 0, fontWeight: "800" }}>101 Education Way, Silicon Valley</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "50px", borderRadius: "40px", border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "30px" }}>Direct Inquiry</h3>
                        <div style={{ display: "grid", gap: "20px" }}>
                            <input placeholder="Full Name" style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none" }} />
                            <input placeholder="Institution Email" style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none" }} />
                            <textarea placeholder="Message..." rows={4} style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none", resize: "none" }}></textarea>
                            <button style={{ background: "#1e293b", color: "white", padding: "18px", borderRadius: "15px", border: "none", fontWeight: "800", cursor: "pointer" }}>Send Inquiry</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ background: "#1e293b", padding: "80px", color: "white" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ maxWidth: "300px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <LayoutDashboard size={18} />
                            </div>
                            <span style={{ fontWeight: "900", fontSize: "18px", letterSpacing: "-1px" }}>EDUMONITOR</span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", fontWeight: "500" }}>
                            Advancing academic success through data-driven insights and modern monitoring technologies.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "80px" }}>
                        <div>
                            <h4 style={{ fontWeight: "900", marginBottom: "20px", fontSize: "14px", textTransform: "uppercase" }}>System</h4>
                            <div style={{ display: "grid", gap: "12px", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                                <span>Login</span>
                                <span>Register</span>
                                <span>Documentation</span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: "900", marginBottom: "20px", fontSize: "14px", textTransform: "uppercase" }}>Legal</h4>
                            <div style={{ display: "grid", gap: "12px", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                                <span>Privacy Policy</span>
                                <span>Terms of Use</span>
                                <span>Institutional License</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "80px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "40px", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
                    &copy; 2026 EDUMONITOR Academic Performance Systems. All rights reserved.
                </div>
            </footer>

        </div>
    );
}
