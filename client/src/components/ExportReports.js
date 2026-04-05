import React, { useState } from 'react';
import {
  Download, FileText, Table, Calendar, Filter, ChevronDown,
  CheckCircle, AlertCircle, Loader2, BarChart3, Users,
  TrendingUp, Award, BookOpen, Eye, Settings
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportReports = ({ data, type = "student" }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [reportType, setReportType] = useState('performance');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [selectedFields, setSelectedFields] = useState([
    'name', 'email', 'gpa', 'attendance', 'marks', 'riskLevel'
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reportTypes = [
    { value: 'performance', label: 'Performance Report', icon: BarChart3 },
    { value: 'attendance', label: 'Attendance Report', icon: Calendar },
    { value: 'analytics', label: 'Analytics Report', icon: TrendingUp },
    { value: 'risk', label: 'Risk Assessment Report', icon: AlertCircle },
    { value: 'summary', label: 'Summary Report', icon: FileText },
    { value: 'detailed', label: 'Detailed Report', icon: Table }
  ];

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: Table },
    { value: 'csv', label: 'CSV File', icon: FileText }
  ];

  const availableFields = [
    { value: 'name', label: 'Name', category: 'Basic' },
    { value: 'email', label: 'Email', category: 'Basic' },
    { value: 'rollNumber', label: 'Roll Number', category: 'Basic' },
    { value: 'department', label: 'Department', category: 'Basic' },
    { value: 'semester', label: 'Semester', category: 'Basic' },
    { value: 'gpa', label: 'GPA', category: 'Academic' },
    { value: 'attendance', label: 'Attendance %', category: 'Academic' },
    { value: 'averageMarks', label: 'Average Marks', category: 'Academic' },
    { value: 'riskLevel', label: 'Risk Level', category: 'Analytics' },
    { value: 'marksTrend', label: 'Marks Trend', category: 'Analytics' },
    { value: 'attendanceTrend', label: 'Attendance Trend', category: 'Analytics' },
    { value: 'subjectPerformance', label: 'Subject Performance', category: 'Detailed' },
    { value: 'recommendations', label: 'Recommendations', category: 'Detailed' },
    { value: 'insights', label: 'AI Insights', category: 'Detailed' }
  ];

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Student Performance Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      if (dateRange.start && dateRange.end) {
        doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 20, 40);
      }

      // Summary Statistics
      if (data && data.length > 0) {
        const avgGPA = data.reduce((sum, student) => sum + (student.gpa || 0), 0) / data.length;
        const avgAttendance = data.reduce((sum, student) => sum + (student.attendance || 0), 0) / data.length;
        const riskStudents = data.filter(student => student.riskLevel === 'high' || student.riskLevel === 'critical').length;

        doc.setFontSize(14);
        doc.text('Summary Statistics', 20, 60);
        doc.setFontSize(10);
        doc.text(`Total Students: ${data.length}`, 20, 70);
        doc.text(`Average GPA: ${avgGPA.toFixed(2)}`, 20, 80);
        doc.text(`Average Attendance: ${avgAttendance.toFixed(1)}%`, 20, 90);
        doc.text(`At-Risk Students: ${riskStudents}`, 20, 100);
      }

      // Student Details Table
      if (data && data.length > 0) {
        const tableData = data.map(student => {
          const row = {};
          selectedFields.forEach(field => {
            switch(field) {
              case 'name':
                row['Name'] = student.name || 'N/A';
                break;
              case 'email':
                row['Email'] = student.email || 'N/A';
                break;
              case 'rollNumber':
                row['Roll No'] = student.rollNumber || 'N/A';
                break;
              case 'department':
                row['Department'] = student.department || 'N/A';
                break;
              case 'semester':
                row['Semester'] = student.semester || 'N/A';
                break;
              case 'gpa':
                row['GPA'] = student.gpa ? student.gpa.toFixed(2) : 'N/A';
                break;
              case 'attendance':
                row['Attendance'] = student.attendance ? `${student.attendance.toFixed(1)}%` : 'N/A';
                break;
              case 'averageMarks':
                row['Avg Marks'] = student.averageMarks ? `${student.averageMarks.toFixed(1)}%` : 'N/A';
                break;
              case 'riskLevel':
                row['Risk Level'] = student.riskLevel || 'N/A';
                break;
              case 'marksTrend':
                row['Marks Trend'] = student.marksTrend || 'N/A';
                break;
              case 'attendanceTrend':
                row['Attendance Trend'] = student.attendanceTrend || 'N/A';
                break;
              default:
                row[field] = student[field] || 'N/A';
            }
          });
          return row;
        });

        if (typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: [Object.keys(tableData[0] || {})],
            body: tableData.map(row => Object.values(row)),
            startY: 120,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] }
          });
        } else {
          autoTable(doc, {
            head: [Object.keys(tableData[0] || {})],
            body: tableData.map(row => Object.values(row)),
            startY: 120,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] }
          });
        }
      }

      // Save the PDF
      doc.save(`student-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateExcel = async () => {
    setIsExporting(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      if (data && data.length > 0) {
        const summaryData = [
          ['Report Summary'],
          ['Generated on', new Date().toLocaleDateString()],
          ['Total Students', data.length],
          ['Average GPA', (data.reduce((sum, s) => sum + (s.gpa || 0), 0) / data.length).toFixed(2)],
          ['Average Attendance', `${(data.reduce((sum, s) => sum + (s.attendance || 0), 0) / data.length).toFixed(1)}%`],
          ['At-Risk Students', data.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length]
        ];

        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
      }

      // Main Data Sheet
      if (data && data.length > 0) {
        const tableData = data.map(student => {
          const row = {};
          selectedFields.forEach(field => {
            switch(field) {
              case 'name':
                row['Name'] = student.name || 'N/A';
                break;
              case 'email':
                row['Email'] = student.email || 'N/A';
                break;
              case 'rollNumber':
                row['Roll Number'] = student.rollNumber || 'N/A';
                break;
              case 'department':
                row['Department'] = student.department || 'N/A';
                break;
              case 'semester':
                row['Semester'] = student.semester || 'N/A';
                break;
              case 'gpa':
                row['GPA'] = student.gpa ? student.gpa.toFixed(2) : 'N/A';
                break;
              case 'attendance':
                row['Attendance %'] = student.attendance ? student.attendance.toFixed(1) : 'N/A';
                break;
              case 'averageMarks':
                row['Average Marks'] = student.averageMarks ? student.averageMarks.toFixed(1) : 'N/A';
                break;
              case 'riskLevel':
                row['Risk Level'] = student.riskLevel || 'N/A';
                break;
              case 'marksTrend':
                row['Marks Trend'] = student.marksTrend || 'N/A';
                break;
              case 'attendanceTrend':
                row['Attendance Trend'] = student.attendanceTrend || 'N/A';
                break;
              default:
                row[field] = student[field] || 'N/A';
            }
          });
          return row;
        });

        const dataWS = XLSX.utils.json_to_sheet(tableData);
        XLSX.utils.book_append_sheet(wb, dataWS, 'Student Data');
      }

      // Save the Excel file
      XLSX.writeFile(wb, `student-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = async () => {
    setIsExporting(true);
    try {
      if (data && data.length > 0) {
        const tableData = data.map(student => {
          const row = {};
          selectedFields.forEach(field => {
            switch(field) {
              case 'name':
                row['Name'] = student.name || 'N/A';
                break;
              case 'email':
                row['Email'] = student.email || 'N/A';
                break;
              case 'rollNumber':
                row['Roll Number'] = student.rollNumber || 'N/A';
                break;
              case 'department':
                row['Department'] = student.department || 'N/A';
                break;
              case 'semester':
                row['Semester'] = student.semester || 'N/A';
                break;
              case 'gpa':
                row['GPA'] = student.gpa ? student.gpa.toFixed(2) : 'N/A';
                break;
              case 'attendance':
                row['Attendance %'] = student.attendance ? student.attendance.toFixed(1) : 'N/A';
                break;
              case 'averageMarks':
                row['Average Marks'] = student.averageMarks ? student.averageMarks.toFixed(1) : 'N/A';
                break;
              case 'riskLevel':
                row['Risk Level'] = student.riskLevel || 'N/A';
                break;
              case 'marksTrend':
                row['Marks Trend'] = student.marksTrend || 'N/A';
                break;
              case 'attendanceTrend':
                row['Attendance Trend'] = student.attendanceTrend || 'N/A';
                break;
              default:
                row[field] = student[field] || 'N/A';
            }
          });
          return row;
        });

        const ws = XLSX.utils.json_to_sheet(tableData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        // Create and download CSV file
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        generatePDF();
        break;
      case 'excel':
        generateExcel();
        break;
      case 'csv':
        generateCSV();
        break;
      default:
        console.error('Unsupported export format');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Reports</h2>
              <p className="text-sm text-gray-600">Generate and download student performance reports</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
          <div className="space-y-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    reportType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
          <div className="space-y-3">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  onClick={() => setExportFormat(format.value)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{format.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Field Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Include Fields</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableFields.map((field) => (
            <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFields.includes(field.value)}
                onChange={() => handleFieldToggle(field.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include charts and graphs</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnalytics}
              onChange={(e) => setIncludeAnalytics(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include AI insights and recommendations</span>
          </label>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && data && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedFields.map(field => (
                    <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {availableFields.find(f => f.value === field)?.label || field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 5).map((student, index) => (
                  <tr key={index}>
                    {selectedFields.map(field => (
                      <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student[field] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Showing 5 of {data.length} records
              </p>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={handleExport}
          disabled={isExporting || !data || data.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportReports;
