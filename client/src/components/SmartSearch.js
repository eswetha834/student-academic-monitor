import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, X, ChevronDown, User, BookOpen,
  TrendingUp, AlertTriangle, Calendar, Download, SlidersHorizontal,
  Star, Award, BarChart3, GraduationCap
} from 'lucide-react';

const SmartSearch = ({ onSearch, onFilter, placeholder = "Search students..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    riskLevel: '',
    performanceRange: { min: '', max: '' },
    attendanceRange: { min: '', max: '' },
    gpaRange: { min: '', max: '' },
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Business Administration'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'gpa', label: 'GPA' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'marks', label: 'Average Marks' },
    { value: 'riskLevel', label: 'Risk Level' }
  ];

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleRangeChange = (key, field, value) => {
    const newFilters = {
      ...filters,
      [key]: {
        ...filters[key],
        [field]: value
      }
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      department: '',
      semester: '',
      riskLevel: '',
      performanceRange: { min: '', max: '' },
      attendanceRange: { min: '', max: '' },
      gpaRange: { min: '', max: '' },
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.department) count++;
    if (filters.semester) count++;
    if (filters.riskLevel) count++;
    if (filters.performanceRange.min || filters.performanceRange.max) count++;
    if (filters.attendanceRange.min || filters.attendanceRange.max) count++;
    if (filters.gpaRange.min || filters.gpaRange.max) count++;
    return count;
  };

  const getFilterSummary = () => {
    const summary = [];
    if (filters.department) summary.push(`Dept: ${filters.department}`);
    if (filters.semester) summary.push(`Sem: ${filters.semester}`);
    if (filters.riskLevel) summary.push(`Risk: ${filters.riskLevel}`);
    if (filters.performanceRange.min || filters.performanceRange.max) {
      const min = filters.performanceRange.min || '0';
      const max = filters.performanceRange.max || '100';
      summary.push(`Marks: ${min}-${max}`);
    }
    if (filters.attendanceRange.min || filters.attendanceRange.max) {
      const min = filters.attendanceRange.min || '0';
      const max = filters.attendanceRange.max || '100';
      summary.push(`Att: ${min}-${max}%`);
    }
    if (filters.gpaRange.min || filters.gpaRange.max) {
      const min = filters.gpaRange.min || '0';
      const max = filters.gpaRange.max || '10';
      summary.push(`GPA: ${min}-${max}`);
    }
    return summary.join(' | ');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Active filters:</span> {getFilterSummary()}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Risk Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Risk Levels</option>
                {riskLevels.map(level => (
                  <option key={level} value={level} className="capitalize">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Performance Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Marks (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.performanceRange.min}
                  onChange={(e) => handleRangeChange('performanceRange', 'min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.performanceRange.max}
                  onChange={(e) => handleRangeChange('performanceRange', 'max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attendance Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.attendanceRange.min}
                  onChange={(e) => handleRangeChange('attendanceRange', 'min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.attendanceRange.max}
                  onChange={(e) => handleRangeChange('attendanceRange', 'max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* GPA Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.gpaRange.min}
                  onChange={(e) => handleRangeChange('gpaRange', 'min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.gpaRange.max}
                  onChange={(e) => handleRangeChange('gpaRange', 'max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Quick filters:</span>
              
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    riskLevel: 'high'
                  });
                  onFilter({
                    ...filters,
                    riskLevel: 'high'
                  });
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>At Risk Students</span>
              </button>

              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    gpaRange: { min: '8.0', max: '10' }
                  });
                  onFilter({
                    ...filters,
                    gpaRange: { min: '8.0', max: '10' }
                  });
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                <Star className="h-3 w-3" />
                <span>Top Performers</span>
              </button>

              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    attendanceRange: { min: '0', max: '75' }
                  });
                  onFilter({
                    ...filters,
                    attendanceRange: { min: '0', max: '75' }
                  });
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
              >
                <Calendar className="h-3 w-3" />
                <span>Low Attendance</span>
              </button>

              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    performanceRange: { min: '0', max: '60' }
                  });
                  onFilter({
                    ...filters,
                    performanceRange: { min: '0', max: '60' }
                  });
                }}
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Needs Improvement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
