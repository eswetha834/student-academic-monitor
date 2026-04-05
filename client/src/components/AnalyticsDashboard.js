import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Brain, Target,
  BarChart3, PieChart, Activity, Award, AlertCircle,
  CheckCircle, Info, Zap, BookOpen, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard = ({ studentId, semester }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [studentId, semester]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/student/${studentId}?semester=${semester}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error || 'No analytics data available'}</span>
        </div>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  const performanceData = [
    { name: 'Current', gpa: analytics.gpa, attendance: analytics.attendancePercentage },
    { name: 'Predicted', gpa: analytics.predictedGPA, attendance: analytics.predictedAttendance }
  ];

  const subjectData = analytics.subjectPerformance.map(subject => ({
    subject: subject.subject,
    marks: subject.averageMarks,
    fullMark: 100
  }));

  const riskDistribution = [
    { name: 'Low Risk', value: analytics.riskLevel === 'low' ? 1 : 0, color: '#10b981' },
    { name: 'Medium Risk', value: analytics.riskLevel === 'medium' ? 1 : 0, color: '#f59e0b' },
    { name: 'High Risk', value: analytics.riskLevel === 'high' ? 1 : 0, color: '#ef4444' },
    { name: 'Critical Risk', value: analytics.riskLevel === 'critical' ? 1 : 0, color: '#dc2626' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
            <p className="text-gray-600 mt-1">AI-powered insights and predictions</p>
          </div>
          <div className={`px-4 py-2 rounded-full border ${getRiskColor(analytics.riskLevel)}`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium capitalize">{analytics.riskLevel} Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'insights', 'predictions', 'recommendations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current GPA</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.gpa.toFixed(2)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                {getTrendIcon(analytics.marksTrend)}
                <span className="text-sm text-gray-500 ml-1 capitalize">{analytics.marksTrend}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.attendancePercentage.toFixed(1)}%</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2">
                {getTrendIcon(analytics.attendanceTrend)}
                <span className="text-sm text-gray-500 ml-1 capitalize">{analytics.attendanceTrend}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Predicted GPA</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.predictedGPA.toFixed(2)}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">{analytics.confidence}% confidence</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Marks</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageMarks.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Across all subjects</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="gpa" fill="#3b82f6" name="GPA" />
                  <Bar dataKey="attendance" fill="#10b981" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="subject" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Factors */}
          {analytics.riskFactors.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors Identified</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700 capitalize">
                      {factor.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Insights</h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'warning'
                      ? 'bg-red-50 border-red-200'
                      : insight.type === 'achievement'
                      ? 'bg-green-50 border-green-200'
                      : insight.type === 'prediction'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                    {insight.type === 'achievement' && <Award className="h-5 w-5 text-green-500 mt-0.5" />}
                    {insight.type === 'prediction' && <Brain className="h-5 w-5 text-blue-500 mt-0.5" />}
                    {insight.type === 'recommendation' && <Info className="h-5 w-5 text-gray-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{insight.message}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        Priority: {insight.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Predictions</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Predicted GPA</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.predictedGPA.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(analytics.predictedGPA / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Predicted Attendance</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.predictedAttendance.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analytics.predictedAttendance}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Confidence Level</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${analytics.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Predictions</h3>
              <div className="space-y-3">
                {analytics.subjectPerformance.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{subject.averageMarks.toFixed(1)}%</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subject.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                        subject.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                        subject.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {subject.riskLevel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-200'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Zap className={`h-5 w-5 mt-0.5 ${
                      rec.priority === 'high' ? 'text-red-500' :
                      rec.priority === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {rec.type.replace('_', ' ')}
                        </span>
                        {rec.subject !== 'General' && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {rec.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{rec.action}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        Priority: {rec.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
