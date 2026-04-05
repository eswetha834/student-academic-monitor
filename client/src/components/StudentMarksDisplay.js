import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award,
  RefreshCcw,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const StudentMarksDisplay = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMarks, setFilteredMarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    fetchAllMarks();
  }, []);

  const fetchAllMarks = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      // Fetch all marks for the current student
      const response = await api.get(`/student-marks/${studentId}`);
      const allMarks = response.data || [];
      
      console.log('📊 All marks fetched:', allMarks);
      console.log(`📈 Total marks: ${allMarks.length}`);
      
      setMarks(allMarks);
      setFilteredMarks(allMarks);
    } catch (error) {
      console.error('❌ Error fetching marks:', error);
      // Fallback data for demo
      const fallbackMarks = [
        {
          id: 1,
          subject: 'Mathematics',
          marks: 85,
          attendance: 92,
          grade: 'A-',
          date: '2024-03-15',
          type: 'exam',
          maxMarks: 100,
          remarks: 'Excellent performance'
        },
        {
          id: 2,
          subject: 'Physics',
          marks: 78,
          attendance: 88,
          grade: 'B+',
          date: '2024-03-18',
          type: 'assignment',
          maxMarks: 100,
          remarks: 'Good effort, needs more practice'
        },
        {
          id: 3,
          subject: 'Chemistry',
          marks: 92,
          attendance: 95,
          grade: 'A',
          date: '2024-03-20',
          type: 'practical',
          maxMarks: 100,
          remarks: 'Outstanding work'
        },
        {
          id: 4,
          subject: 'Computer Science',
          marks: 88,
          attendance: 90,
          grade: 'A-',
          date: '2024-03-22',
          type: 'project',
          maxMarks: 100,
          remarks: 'Creative solutions'
        }
      ];
      setMarks(fallbackMarks);
      setFilteredMarks(fallbackMarks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = marks;

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(mark => 
        mark.subject?.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(mark =>
        mark.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mark.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort marks
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'marks':
          aValue = a.marks;
          bValue = b.marks;
          break;
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        case 'grade':
          aValue = a.grade;
          bValue = b.grade;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMarks(filtered);
  }, [marks, searchTerm, sortBy, sortOrder, selectedSubject]);

  const getUniqueSubjects = () => {
    const subjects = [...new Set(marks.map(mark => mark.subject))].filter(Boolean);
    return ['all', ...subjects];
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#10b981',
      'A': '#10b981',
      'A-': '#3b82f6',
      'B+': '#10b981',
      'B': '#3b82f6',
      'B-': '#f59e0b',
      'C+': '#f59e0b',
      'C': '#f59e0b',
      'C-': '#ef4444',
      'D': '#ef4444',
      'F': '#ef4444'
    };
    return colors[grade] || '#6b7280';
  };

  const getPerformanceIcon = (marks) => {
    if (marks >= 90) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (marks >= 75) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (marks >= 60) return <TrendingDown className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const exportMarks = () => {
    const csvContent = [
      ['Subject', 'Marks', 'Grade', 'Date', 'Type', 'Attendance', 'Remarks'],
      ...filteredMarks.map(mark => [
        mark.subject || '',
        mark.marks || '',
        mark.grade || '',
        mark.date || '',
        mark.type || '',
        mark.attendance || '',
        mark.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-lg">Loading all marks...</div>
          <div className="text-white/60 text-sm mt-2">Fetching academic records</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">All Marks</h1>
                <p className="text-white/60 text-sm">
                  {filteredMarks.length} of {marks.length} records shown
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllMarks}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={exportMarks}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-6 bg-slate-800/30 border-b border-white/10">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-white/40 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search marks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="marks">Sort by Marks</option>
            <option value="subject">Sort by Subject</option>
            <option value="grade">Sort by Grade</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Toggle sort order"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="px-8 py-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {filteredMarks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No marks found</h3>
              <p className="text-white/60">
                {searchTerm ? 'Try adjusting your search terms' : 'No marks available for this student'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    <th className="px-6 py-4 text-left text-white font-medium">Subject</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Marks</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Grade</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Date</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Type</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Attendance</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Performance</th>
                    <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark, index) => (
                    <tr key={mark.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white font-medium">{mark.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{mark.marks}</span>
                          <span className="text-white/60 text-sm">/{mark.maxMarks || 100}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getGradeColor(mark.grade) }}
                        >
                          {mark.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80">{mark.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">
                          {mark.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-white/80">{mark.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPerformanceIcon(mark.marks)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRowExpansion(mark.id)}
                            className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Expanded Row Details */}
              {expandedRows.has(mark.id) && (
                <tr className="bg-black/20">
                  <td colSpan="8" className="px-6 py-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Remarks</h4>
                      <p className="text-white/80">{mark.remarks || 'No remarks available'}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-white/60">Percentage:</span>
                          <span className="text-white font-medium ml-2">
                            {((mark.marks / (mark.maxMarks || 100)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-white/60">Status:</span>
                          <span className={`ml-2 font-medium ${
                            mark.marks >= 75 ? 'text-green-400' : 
                            mark.marks >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {mark.marks >= 75 ? 'Pass' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Average Marks</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {marks.length > 0 ? (marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length).toFixed(1) : '0'}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Highest Score</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {marks.length > 0 ? Math.max(...marks.map(mark => mark.marks)) : '0'}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Total Subjects</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {[...new Set(marks.map(mark => mark.subject))].size}
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Pass Rate</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {marks.length > 0 ? ((marks.filter(mark => mark.marks >= 60).length / marks.length) * 100).toFixed(1) : '0'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksDisplay;
