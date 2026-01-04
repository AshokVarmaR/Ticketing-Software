import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Users,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  FileBarChart,
  Shield,
  Loader2,
  X,
  User,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Briefcase
} from 'lucide-react';
import EmployeeHeader from '../../Components/EmployeeHeader';
import { API_BASE_URL } from '../../config';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'employees'
  
  // Stats
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    avgResolutionTime: 0,
    ticketByCategory: {},
    ticketByStatus: {},
    ticketByPriority: {}
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch employee data
  useEffect(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setEmployeeData(data);
        setIsAdmin(data.role === 'ADMIN');
        
        if (data.role !== 'ADMIN') {
          navigate('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    } else {
      navigate('/employees/login');
    }
  }, [navigate]);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      // Fetch tickets
      const ticketsResponse = await fetch(`${API_BASE_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Fetch employees
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (ticketsResponse.ok && employeesResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        const employeesData = await employeesResponse.json();
        
        setTickets(ticketsData);
        setEmployees(employeesData);
        
        // Calculate stats
        calculateStats(ticketsData, employeesData);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Calculate statistics
  const calculateStats = (ticketsData, employeesData) => {
    const ticketList = ticketsData.map(t => t.ticket);
    
    // Status counts
    const openTickets = ticketList.filter(t => t.status === 'OPEN').length;
    const inProgressTickets = ticketList.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedTickets = ticketList.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    
    // Category distribution
    const categoryCounts = {};
    ticketList.forEach(ticket => {
      categoryCounts[ticket.category] = (categoryCounts[ticket.category] || 0) + 1;
    });
    
    // Status distribution
    const statusCounts = {};
    ticketList.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    
    // Priority distribution
    const priorityCounts = {};
    ticketList.forEach(ticket => {
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
    });
    
    // Employee stats
    const activeEmployees = employeesData.filter(emp => emp.isActive).length;
    
    setStats({
      totalTickets: ticketList.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalEmployees: employeesData.length,
      activeEmployees,
      avgResolutionTime: calculateAvgResolutionTime(ticketList),
      ticketByCategory: categoryCounts,
      ticketByStatus: statusCounts,
      ticketByPriority: priorityCounts
    });
  };

  // Calculate average resolution time
  const calculateAvgResolutionTime = (tickets) => {
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    if (resolvedTickets.length === 0) return 0;
    
    const totalHours = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt);
      const resolved = new Date(ticket.resolvedAt);
      const hours = (resolved - created) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return Math.round(totalHours / resolvedTickets.length);
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticketData => {
    const ticket = ticketData.ticket;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!ticket.title.toLowerCase().includes(searchLower) &&
          !ticket.ticketNumber.toLowerCase().includes(searchLower) &&
          !ticket.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      const priorityMap = { high: 2, medium: 3, low: 4, critical: 1 };
      if (ticket.priority !== priorityMap[priorityFilter]) {
        return false;
      }
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const ticketDate = new Date(ticket.createdAt);
      const now = new Date();
      let daysAgo = 0;
      
      switch (dateRange) {
        case 'today':
          daysAgo = 1;
          break;
        case 'week':
          daysAgo = 7;
          break;
        case 'month':
          daysAgo = 30;
          break;
        case 'quarter':
          daysAgo = 90;
          break;
      }
      
      const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
      if (ticketDate < cutoffDate) {
        return false;
      }
    }
    
    return true;
  });

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    if (employeeSearchTerm) {
      const searchLower = employeeSearchTerm.toLowerCase();
      return (
        employee.name?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.employeeCode?.toLowerCase().includes(searchLower) ||
        employee.role?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Critical';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      default: return 'Medium';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'WAITING_FOR_INFO': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'IT': return 'bg-green-100 text-green-800';
      case 'NETWORK': return 'bg-purple-100 text-purple-800';
      case 'HR': return 'bg-pink-100 text-pink-800';
      case 'SOFTWARE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'SUPPORT': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      case 'MANAGER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color for employee
  const getEmployeeStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    if (activeTab === 'tickets') {
      exportTicketsToExcel();
    } else {
      exportEmployeesToExcel();
    }
  };

  const exportTicketsToExcel = () => {
    const data = filteredTickets.map(ticketData => {
      const ticket = ticketData.ticket;
      return {
        'Ticket ID': ticket.id,
        'Ticket Number': ticket.ticketNumber,
        'Title': ticket.title,
        'Description': ticket.description,
        'Category': ticket.category,
        'Status': ticket.status.replace(/_/g, ' '),
        'Priority': getPriorityLabel(ticket.priority),
        'Created By': ticket.createdBy?.name || 'N/A',
        'Created By Email': ticket.createdBy?.email || 'N/A',
        'Assigned To': ticket.assignedTo?.name || 'Unassigned',
        'Assigned To Email': ticket.assignedTo?.email || 'N/A',
        'Created Date': formatDate(ticket.createdAt),
        'Last Updated': formatDate(ticket.updatedAt),
        'Resolved Date': formatDate(ticket.resolvedAt)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets Report');
    
    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, r.Title?.length || 0), 10);
    worksheet['!cols'] = [{ wch: maxWidth + 2 }];
    
    XLSX.writeFile(workbook, `tickets-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportEmployeesToExcel = () => {
    const data = filteredEmployees.map(employee => {
      return {
        'Employee ID': employee.id,
        'Employee Code': employee.employeeCode,
        'Name': employee.name,
        'Email': employee.email,
        'Phone': employee.phone || 'N/A',
        'Role': employee.role?.replace('_', ' ') || 'N/A',
        'Status': employee.isActive ? 'Active' : 'Inactive',
        'Joining Date': employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees Report');
    
    XLSX.writeFile(workbook, `employees-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    if (activeTab === 'tickets') {
      exportTicketsToPDF();
    } else {
      exportEmployeesToPDF();
    }
  };

  const exportTicketsToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Tickets Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Tickets: ${filteredTickets.length}`, 14, 36);
    
    // Table data
    const tableData = filteredTickets.map(ticketData => {
      const ticket = ticketData.ticket;
      return [
        ticket.ticketNumber,
        ticket.title.substring(0, 30) + (ticket.title.length > 30 ? '...' : ''),
        ticket.category,
        ticket.status.replace(/_/g, ' '),
        getPriorityLabel(ticket.priority),
        ticket.createdBy?.name || 'N/A',
        formatDate(ticket.createdAt)
      ];
    });
    
    // Add table
    autoTable(doc, {
      head: [['Ticket #', 'Title', 'Category', 'Status', 'Priority', 'Created By', 'Created Date']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 }
      }
    });
    
    doc.save(`tickets-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportEmployeesToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Employees Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Employees: ${filteredEmployees.length}`, 14, 36);
    
    // Table data
    const tableData = filteredEmployees.map(employee => {
      return [
        employee.employeeCode,
        employee.name,
        employee.email,
        employee.phone || 'N/A',
        employee.role?.replace('_', ' ') || 'N/A',
        employee.isActive ? 'Active' : 'Inactive',
        employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'
      ];
    });
    
    // Add table
    autoTable(doc, {
      head: [['Emp Code', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joining Date']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      }
    });
    
    doc.save(`employees-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Print report
  const printReport = () => {
    const printContent = document.getElementById('reports-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center;">${activeTab === 'tickets' ? 'Tickets' : 'Employees'} Report</h1>
        <p style="text-align: center;">Generated on: ${new Date().toLocaleDateString()}</p>
        <div>${printContent}</div>
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // Clear filters
  const clearFilters = () => {
    setDateRange('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
    setEmployeeSearchTerm('');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">This page is only accessible to administrators.</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive overview and analysis of system data
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </button>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-4 py-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Admin Access</div>
                  <div className="text-xs text-blue-700">Full system reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTickets}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="text-green-600 font-medium">+{stats.openTickets} open</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="text-green-600 font-medium">{stats.activeEmployees} active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Of all tickets</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Resolution</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgResolutionTime}h</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">Average time to resolve</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="flex items-center space-x-2">
                  <Ticket className="w-4 h-4" />
                  <span>Tickets ({filteredTickets.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } cursor-pointer`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Employees ({filteredEmployees.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Filters and Export Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              {activeTab === 'tickets' ? (
                <div className="flex flex-wrap gap-3">
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="quarter">Last 90 Days</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_INFO">Waiting for Info</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="IT">IT</option>
                      <option value="NETWORK">Network</option>
                      <option value="HR">HR</option>
                      <option value="SOFTWARE">Software</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {/* Employee Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Search for tickets tab */}
              {activeTab === 'tickets' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
                  />
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium cursor-pointer flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>

              {/* Export Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <FileBarChart className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={printReport}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div id="reports-content">
          {activeTab === 'tickets' ? (
            <>
              {/* Tickets Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tickets Report</h2>
                    <div className="text-sm text-gray-500">
                      Showing {filteredTickets.length} of {tickets.length} tickets
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket #
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading tickets...</p>
                          </td>
                        </tr>
                      ) : filteredTickets.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center">
                            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                            <p className="text-gray-600">Try adjusting your filters</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((ticketData) => {
                          const ticket = ticketData.ticket;
                          return (
                            <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/tickets/${ticket.id}`)}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{ticket.ticketNumber}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{ticket.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description.substring(0, 50)}...</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                                  {ticket.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                  {ticket.status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                                  {getPriorityLabel(ticket.priority)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.createdBy?.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{ticket.createdBy?.role?.replace('_', ' ') || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.assignedTo?.name || 'Unassigned'}</div>
                                <div className="text-xs text-gray-500">{ticket.assignedTo?.role?.replace('_', ' ') || ''}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</div>
                                <div className="text-xs text-gray-500">
                                  {ticket.resolvedAt ? `Resolved: ${formatDate(ticket.resolvedAt)}` : 'Pending'}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Tickets by Category</h2>
                    <PieChart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.ticketByCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category).split(' ')[0]}`}></div>
                          <span className="text-sm text-gray-700">{category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${getCategoryColor(category).split(' ')[0]} rounded-full`}
                              style={{ width: `${(count / stats.totalTickets) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Tickets by Status</h2>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.ticketByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                          <span className="text-sm text-gray-700">{status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${getStatusColor(status).split(' ')[0]} rounded-full`}
                              style={{ width: `${(count / stats.totalTickets) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Employees Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Employees Report</h2>
                    <div className="text-sm text-gray-500">
                      Showing {filteredEmployees.length} of {employees.length} employees
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emp Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joining Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading employees...</p>
                          </td>
                        </tr>
                      ) : filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                            <p className="text-gray-600">Try adjusting your search</p>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{employee.employeeCode}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{employee.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{employee.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                                {employee.role?.replace('_', ' ') || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmployeeStatusColor(employee.isActive)}`}>
                                {employee.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center space-x-1">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Employee Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Role Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Employees by Role</h2>
                    <Briefcase className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {(() => {
                      const roleCounts = {};
                      employees.forEach(emp => {
                        roleCounts[emp.role] = (roleCounts[emp.role] || 0) + 1;
                      });
                      
                      return Object.entries(roleCounts).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getRoleColor(role).split(' ')[0]}`}></div>
                            <span className="text-sm text-gray-700">{role.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full ${getRoleColor(role).split(' ')[0]} rounded-full`}
                                style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Employees by Status</h2>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-100"></div>
                        <span className="text-sm text-gray-700">Active</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-green-100 rounded-full"
                            style={{ width: `${(stats.activeEmployees / stats.totalEmployees) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{stats.activeEmployees}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-red-100"></div>
                        <span className="text-sm text-gray-700">Inactive</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-red-100 rounded-full"
                            style={{ width: `${((stats.totalEmployees - stats.activeEmployees) / stats.totalEmployees) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {stats.totalEmployees - stats.activeEmployees}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;