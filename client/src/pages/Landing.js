
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px", textAlign: "center" }}>
            <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>
                Academic Monitoring System
            </h1>
            <p style={{ color: "#64748b", marginBottom: "30px" }}>
                Manage your academic journey with AI-powered insights
            </p>
            
            <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link 
                    to="/login" 
                    style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600"
                    }}
                >
                    Login
                </Link>
                
                <Link 
                    to="/login" 
                    style={{
                        background: "#10b981",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600"
                    }}
                >
                    Register
                </Link>
            </div>
            
            <div style={{ marginTop: "40px", padding: "20px", background: "white", borderRadius: "8px", maxWidth: "600px", margin: "40px auto" }}>
                <h2 style={{ color: "#1e293b", marginBottom: "15px" }}>Features</h2>
                <ul style={{ textAlign: "left", color: "#64748b" }}>
                    <li>Student Dashboard</li>
                    <li>Faculty Dashboard</li>
                    <li>Admin Panel</li>
                    <li>AI Predictions</li>
                    <li>Performance Analytics</li>
                </ul>
            </div>
        </div>
    );
}
                <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
                    <a href="#about" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px", transition: "color 0.3s" }}>About</a>
                    <a href="#features" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px", transition: "color 0.3s" }}>Features</a>
                    <a href="#testimonials" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px", transition: "color 0.3s" }}>Testimonials</a>
                    <a href="#contact" style={{ textDecoration: "none", color: "#64748b", fontWeight: "700", fontSize: "14px", transition: "color 0.3s" }}>Contact</a>
                    <button onClick={scrollToLogin} style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: "800", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}>Login Portal</button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section style={{ paddingTop: "180px", paddingBottom: "100px", textAlign: "center", background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 50%, #ffffff 100%)", position: "relative", overflow: "hidden" }}>
                {/* Background decoration */}
                <div style={{ position: "absolute", top: "10%", right: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)", borderRadius: "50%" }}></div>
                <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)", borderRadius: "50%" }}></div>
                
                <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
                    <div style={{ background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", color: "#166534", padding: "10px 24px", borderRadius: "30px", fontSize: "12px", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "30px", boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)" }}>
                        <Brain size={16} /> POWERED BY ACADEMIC INTELLIGENCE
                    </div>
                    <h1 style={{ fontSize: "72px", fontWeight: "900", lineHeight: "1.1", marginBottom: "30px", letterSpacing: "-2px", background: "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        Monitoring Excellence,<br /><span style={{ color: "#2563eb" }}>Empowering Success.</span>
                    </h1>
                    <p style={{ fontSize: "20px", color: "#64748b", maxWidth: "650px", margin: "0 auto 50px", fontWeight: "600", lineHeight: "1.7" }}>
                        Transform your institution with AI-powered academic monitoring. Real-time insights, predictive analytics, and seamless collaboration between faculty and students.
                    </p>
                    <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center" }}>
                        <button onClick={scrollToLogin} style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "20px 40px", borderRadius: "16px", border: "none", fontWeight: "800", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 12px 24px -8px rgba(37, 99, 235, 0.4)", transition: "all 0.3s" }}>
                            Get Started <ChevronRight size={20} />
                        </button>
                        <button style={{ background: "white", color: "#1e293b", padding: "20px 40px", borderRadius: "16px", border: "2px solid #e2e8f0", fontWeight: "800", fontSize: "17px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.3s", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
                            <BarChart3 size={20} /> Watch Demo
                        </button>
                    </div>
                    
                    {/* Trust indicators */}
                    <div style={{ display: "flex", gap: "40px", justifyContent: "center", marginTop: "60px" }}>
                        {[/* eslint-disable-next-line react/prop-types */
                            { icon: CheckCircle, text: "GDPR Compliant" },
                            { icon: Shield, text: "Secure Platform" },
                            { icon: TrendingUp, text: "98% Success Rate" }
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
                                <item.icon size={16} style={{ color: "#10b981" }} />
                                {item.text}
                            </div>
                        ))}
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

            {/* TESTIMONIALS SECTION */}
            <section id="testimonials" style={{ padding: "120px 80px", background: "white" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h2 style={{ fontSize: "42px", fontWeight: "900", marginBottom: "15px", letterSpacing: "-1px" }}>Trusted by Institutions</h2>
                    <p style={{ color: "#64748b", fontWeight: "600" }}>See what educators and students are saying about EDUMONITOR.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px", maxWidth: "1200px", margin: "0 auto" }}>
                    {[
                        {
                            name: "Dr. Sarah Chen",
                            role: "Dean of Computer Science",
                            institution: "Tech University",
                            content: "EDUMONITOR has revolutionized how we track student performance. The AI predictions are remarkably accurate.",
                            rating: 5,
                            avatar: "SC"
                        },
                        {
                            name: "Prof. Michael Roberts",
                            role: "Mathematics Department Head",
                            institution: "State University",
                            content: "The faculty dashboard makes it easy to identify at-risk students and provide timely interventions.",
                            rating: 5,
                            avatar: "MR"
                        },
                        {
                            name: "Emily Johnson",
                            role: "Student Representative",
                            institution: "Liberal Arts College",
                            content: "I love how I can track my academic progress and communicate directly with my professors through the platform.",
                            rating: 5,
                            avatar: "EJ"
                        }
                    ].map((testimonial, i) => (
                        <div key={i} style={{ background: "#f8fafc", padding: "40px", borderRadius: "30px", border: "1px solid #e2e8f0", position: "relative" }}>
                            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                                {[...Array(testimonial.rating)].map((_, j) => (
                                    <Star key={j} size={16} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                                ))}
                            </div>
                            <p style={{ color: "#64748b", fontWeight: "600", lineHeight: "1.6", marginBottom: "25px", fontStyle: "italic" }}>
                                "{testimonial.content}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800" }}>
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: "800", fontSize: "16px" }}>{testimonial.name}</p>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "600" }}>{testimonial.role}</p>
                                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>{testimonial.institution}</p>
                                </div>
                            </div>
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
                    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "50px", borderRadius: "40px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                        <h3 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "30px" }}>Request a Demo</h3>
                        <form onSubmit={handleDemoRequest} style={{ display: "grid", gap: "20px" }}>
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                required
                                style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none", fontSize: "16px", fontWeight: "600" }} 
                            />
                            <input 
                                type="email" 
                                placeholder="Institution Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none", fontSize: "16px", fontWeight: "600" }} 
                            />
                            <select 
                                style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none", fontSize: "16px", fontWeight: "600", color: "#64748b" }}
                            >
                                <option value="">Select Institution Type</option>
                                <option value="university">University</option>
                                <option value="college">College</option>
                                <option value="school">K-12 School</option>
                                <option value="other">Other</option>
                            </select>
                            <textarea 
                                placeholder="Tell us about your needs..." 
                                rows={4} 
                                style={{ padding: "18px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: "none", resize: "none", fontSize: "16px", fontWeight: "600" }}
                            ></textarea>
                            <button 
                                type="submit"
                                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)", color: "white", padding: "18px", borderRadius: "15px", border: "none", fontWeight: "800", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.3s" }}
                            >
                                <ArrowRight size={20} /> Schedule Demo
                            </button>
                        </form>
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
