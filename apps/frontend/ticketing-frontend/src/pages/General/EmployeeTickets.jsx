import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  Search,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Ticket,
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
  ChevronDown,
  BarChart3,
  X,
  CheckSquare,
  Zap,
  Paperclip
} from 'lucide-react';
import EmployeeHeader from '../../Components/EmployeeHeader';
import { API_BASE_URL } from '../../config';

const EmployeeTickets = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewType, setViewType] = useState('assigned'); // assigned, raised, open, live, or resolved
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Check if user is admin or software engineer
  const isAdmin = employeeData?.role === 'ADMIN';
  const isSoftwareEngineer = employeeData?.role === 'SOFTWARE_ENGINEER';
  const isSupportStaff = !isAdmin && !isSoftwareEngineer;

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
        
        // Set default view based on role
        if (data.role === 'SOFTWARE_ENGINEER') {
          setViewType('raised'); // Software Engineer default view
        } else if (data.role === 'ADMIN') {
          setViewType('live'); // Admin default view
        } else {
          setViewType('assigned'); // Support Staff default view
        }
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
  }, []);

  // Format role to lowercase with hyphens for URLs
  const formatRoleForUrl = (role) => {
    return role.toLowerCase().replace('_', '-');
  };

  // Get base path for current employee
  const getBasePath = () => {
    if (!employeeData?.role) return '';
    return `/${formatRoleForUrl(employeeData.role)}`;
  };

  // Fetch tickets from backend
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      let endpoint = '';
      let needsFiltering = true;
      let needsAdditionalFiltering = false;
      
      if (viewType === 'open') {
        // Open tickets in department
        endpoint = `${API_BASE_URL}/tickets/open`;
        needsFiltering = false;
      } else if (viewType === 'live' && isAdmin) {
        // Admin view all live tickets - fetch all and filter on frontend
        endpoint = `${API_BASE_URL}/tickets`;
        needsFiltering = false;
        needsAdditionalFiltering = true;
      } else if (viewType === 'resolved') {
        // Resolved tickets (available to all) - fetch all and filter on frontend
        endpoint = `${API_BASE_URL}/tickets`;
        needsFiltering = false;
        needsAdditionalFiltering = true;
      } else {
        // All tickets (assigned + raised)
        endpoint = `${API_BASE_URL}/tickets`;
        needsFiltering = true;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter data based on view type
        let filteredData = data;
        
        if (needsFiltering) {
          if (viewType === 'assigned') {
            // Show tickets assigned to current user
            filteredData = data.filter(ticket => 
              ticket.ticket.assignedTo && ticket.ticket.assignedTo.id === employeeData?.id
            );
          } else if (viewType === 'raised') {
            // Show tickets created by current user
            filteredData = data.filter(ticket => 
              ticket.ticket.createdBy && ticket.ticket.createdBy.id === employeeData?.id
            );
          }
        } else if (needsAdditionalFiltering) {
          // For endpoints that need additional frontend filtering
          if (viewType === 'live') {
            // Live tickets: Statuses that are NOT OPEN, RESOLVED, or CLOSED
            filteredData = data.filter(ticket => {
              const status = ticket.ticket.status;
              return status !== 'OPEN' && status !== 'RESOLVED' && status !== 'CLOSED';
            });
          } else if (viewType === 'resolved') {
            // Resolved tickets: Statuses that are RESOLVED or CLOSED
            filteredData = data.filter(ticket => {
              const status = ticket.ticket.status;
              return status === 'RESOLVED' || status === 'CLOSED';
            });
          }
        } else {
          // For endpoints that already return filtered data
          filteredData = data.map(item => ({ 
            ticket: item, 
            comments: [], 
            attachments: [] 
          }));
        }
        
        setTickets(filteredData);
        setTotalItems(filteredData.length);
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeData');
        navigate('/employees/login');
      } else {
        throw new Error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData) {
      fetchTickets();
    }
  }, [employeeData, viewType]);

  // Get priority label and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'CRITICAL': return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> };
      case 'HIGH': return { label: 'High', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-3 h-3" /> };
      case 'MEDIUM': return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-3 h-3" /> };
      case 'LOW': return { label: 'Low', color: 'bg-green-100 text-green-800', icon: <AlertCircle className="w-3 h-3" /> };
      default: return { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-3 h-3" /> };
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

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Time ago function
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticketData => {
    const ticket = ticketData.ticket;
    
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Pagination
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get view title
  const getViewTitle = () => {
    if (isSoftwareEngineer) {
      return 'My Raised Tickets';
    }
    
    switch (viewType) {
      case 'assigned': return 'Assigned Tickets';
      case 'raised': return 'My Raised Tickets';
      case 'open': return 'Open Department Tickets';
      case 'live': return 'Live Tickets (Admin View)';
      case 'resolved': return 'Resolved Tickets';
      default: return 'Tickets';
    }
  };

  // Get empty state message
  const getEmptyMessage = () => {
    if (isSoftwareEngineer) {
      return 'You haven\'t raised any tickets yet.';
    }
    
    switch (viewType) {
      case 'assigned': return 'No tickets assigned to you.';
      case 'raised': return 'You haven\'t raised any tickets.';
      case 'open': return 'No open tickets in your department.';
      case 'live': return 'No live tickets found.';
      case 'resolved': return 'No resolved tickets found.';
      default: return 'No tickets found.';
    }
  };

  // Handle raise ticket - Now uses role-based paths
  const handleRaiseTicket = () => {
    if (!employeeData?.role) return;
    
    const basePath = getBasePath();
    navigate(`${basePath}/tickets/raise`);
  };

  // Handle view ticket details - Role-based path
  const handleViewTicket = (ticketId) => {
    if (!employeeData?.role) return;
    
    const basePath = getBasePath();
    navigate(`${basePath}/tickets/${ticketId}`);
  };

  // Status options
  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'WAITING_FOR_INFO', label: 'Waiting for Info' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'ALL', label: 'All Priority' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'IT', label: 'IT' },
    { value: 'NETWORK', label: 'Network' },
    { value: 'HR', label: 'HR' },
    { value: 'SOFTWARE', label: 'Software' }
  ];

  // Get stats
  const stats = {
    total: filteredTickets.length,
    open: filteredTickets.filter(t => t.ticket.status === 'OPEN').length,
    inProgress: filteredTickets.filter(t => t.ticket.status === 'IN_PROGRESS').length,
    resolved: filteredTickets.filter(t => t.ticket.status === 'RESOLVED' || t.ticket.status === 'CLOSED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ticket Management</h1>
              <p className="text-gray-600 mt-2">
                {getViewTitle()} • {employeeData?.role ? employeeData.role.replace('_', ' ') : 'Employee'}
                {isAdmin && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Admin</span>}
                {isSoftwareEngineer && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Software Engineer</span>}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
              {/* View Type Buttons */}
              <div className="flex flex-wrap gap-2">
                {isSoftwareEngineer ? (
                  // Software Engineer only sees raised tickets (no other options)
                  <div className="flex items-center">
                    <button
                      onClick={() => { setViewType('raised'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm bg-blue-600 text-white shadow-md`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>My Raised Tickets</span>
                    </button>
                    <span className="ml-2 text-sm text-gray-500 italic">
                      (Software Engineers can only view raised tickets)
                    </span>
                  </div>
                ) : isAdmin ? (
                  // Admin view buttons
                  <>
                    <button
                      onClick={() => { setViewType('raised'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'raised'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Raised Tickets</span>
                    </button>
                    
                    <button
                      onClick={() => { setViewType('open'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'open'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Open Tickets</span>
                    </button>
                    
                    <button
                      onClick={() => { setViewType('resolved'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'resolved'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Resolved</span>
                    </button>
                    
                    {/* Admin-only Live Tickets Button */}
                    <button
                      onClick={() => { setViewType('live'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'live'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Live Tickets</span>
                    </button>
                  </>
                ) : (
                  // Support Staff view buttons
                  <>
                    <button
                      onClick={() => { setViewType('assigned'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'assigned'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Assigned</span>
                    </button>
                    
                    <button
                      onClick={() => { setViewType('open'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'open'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Open Tickets</span>
                    </button>
                    
                    <button
                      onClick={() => { setViewType('raised'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'raised'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Raised Tickets</span>
                    </button>
                    
                    {/* Resolved Tickets Button */}
                    <button
                      onClick={() => { setViewType('resolved'); setPage(1); }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm ${
                        viewType === 'resolved'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Resolved</span>
                    </button>
                  </>
                )}
              </div>
              
              {/* Raise Ticket Button (not for admin if viewing live tickets) */}
              {!(isAdmin && viewType === 'live') && viewType !== 'resolved' && !(isAdmin && viewType === 'raised') && (
                <button
                  onClick={handleRaiseTicket}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Raise a Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {viewType === 'assigned' ? 'Assigned to you' : 
               viewType === 'raised' ? 'Raised by you' : 
               viewType === 'open' ? 'Open in department' : 
               viewType === 'live' ? 'All live tickets' : 
               viewType === 'resolved' ? 'Resolved tickets' : 'Tickets'}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Waiting for action
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Currently being worked on
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Completed tickets
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tickets by title, number, or description..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => { setSearchTerm(''); setPage(1); }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Priority Filter */}
              <div className="w-full md:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Action Buttons - Removed Export */}
              <div className="flex space-x-3">
                <button
                  onClick={fetchTickets}
                  className="p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || searchTerm) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {statusFilter !== 'ALL' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {priorityFilter !== 'ALL' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Priority: {priorityOptions.find(o => o.value === priorityFilter)?.label}
                      <button
                        onClick={() => setPriorityFilter('ALL')}
                        className="ml-1.5 text-orange-600 hover:text-orange-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== 'ALL' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Category: {categoryOptions.find(o => o.value === categoryFilter)?.label}
                      <button
                        onClick={() => setCategoryFilter('ALL')}
                        className="ml-1.5 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1.5 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setPriorityFilter('ALL');
                      setCategoryFilter('ALL');
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {getViewTitle()} ({filteredTickets.length})
                {isAdmin && viewType === 'live' && (
                  <span className="ml-2 text-sm text-gray-500">(All active tickets - Admin only)</span>
                )}
                {viewType === 'resolved' && (
                  <span className="ml-2 text-sm text-gray-500">(Resolved and closed tickets)</span>
                )}
                {isSoftwareEngineer && (
                  <span className="ml-2 text-sm text-gray-500">(Software Engineer View)</span>
                )}
              </h2>
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredTickets.length)} of {filteredTickets.length}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-4">{getEmptyMessage()}</p>
              {(isSoftwareEngineer || viewType === 'raised' || (isSupportStaff && viewType === 'assigned')) && 
               viewType !== 'live' && viewType !== 'resolved' && (
                <button
                  onClick={handleRaiseTicket}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Raise Your First Ticket</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Tickets List */}
              <div className="divide-y divide-gray-200">
                {paginatedTickets.map((ticketData) => {
                  const ticket = ticketData.ticket;
                  const priorityInfo = getPriorityInfo(ticket.priority);
                  const commentCount = ticketData.comments?.length || 0;
                  const attachmentCount = ticketData.attachments?.length || 0;
                  
                  return (
                    <div key={ticket.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900 font-mono">{ticket.ticketNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${priorityInfo.color}`}>
                              {priorityInfo.icon}
                              <span>{priorityInfo.label}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                              {ticket.category}
                            </span>
                            {isAdmin && viewType === 'live' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ID: {ticket.id}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{timeAgo(ticket.createdAt)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>
                                {ticket.createdBy?.name} ({ticket.createdBy?.role})
                              </span>
                            </div>
                            
                            {ticket.assignedTo && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>
                                  Assigned to: {ticket.assignedTo.name} ({ticket.assignedTo.role})
                                </span>
                              </div>
                            )}
                            
                            {commentCount > 0 && (
                              <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                            
                            {attachmentCount > 0 && (
                              <div className="flex items-center">
                                <Paperclip className="w-4 h-4 mr-1" />
                                <span>{attachmentCount} attachment{attachmentCount !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                            
                            {isAdmin && viewType === 'live' && (
                              <div className="flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                <span>Live Ticket</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 lg:mt-0 lg:ml-4 flex items-center space-x-3">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeTickets;