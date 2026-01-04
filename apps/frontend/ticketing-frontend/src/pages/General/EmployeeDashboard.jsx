import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  Users,
  MessageSquare,
  FileText,
  ChevronRight,
  Bell,
  Star,
  Award,
  Zap,
  PieChart,
  Activity,
  UserCheck,
  FolderOpen,
  Shield,
  Briefcase,
  Target
} from 'lucide-react';
import EmployeeHeader from '../../Components/EmployeeHeader';
import { API_BASE_URL } from '../../config';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    assignedTickets: 0,
    myTickets: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todaysDate, setTodaysDate] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = '';
      
      if (hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour < 17) {
        timeGreeting = 'Good Afternoon';
      } else if (hour < 21) {
        timeGreeting = 'Good Evening';
      } else {
        timeGreeting = 'Good Night';
      }
      
      setGreeting(timeGreeting);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Set today's date
  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setTodaysDate(today.toLocaleDateString('en-US', options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get base path for navigation
  const getBasePath = () => {
    if (!employeeData?.role) return '';
    return `/${employeeData.role.toLowerCase().replace('_', '-')}`;
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      // Fetch all tickets
      const ticketsResponse = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (ticketsResponse.ok) {
        const allTickets = await ticketsResponse.json();
        
        // Filter tickets based on user role
        let filteredTickets = allTickets;
        
        if (!isAdmin) {
          // For non-admin users, show only tickets where they are creator or assignee
          filteredTickets = allTickets.filter(ticket => 
            ticket.ticket.createdBy?.id === employeeData.id || 
            ticket.ticket.assignedTo?.id === employeeData.id
          );
        }

        // Calculate stats
        const totalTickets = filteredTickets.length;
        const openTickets = filteredTickets.filter(t => t.ticket.status === 'OPEN').length;
        const inProgressTickets = filteredTickets.filter(t => t.ticket.status === 'IN_PROGRESS').length;
        const resolvedTickets = filteredTickets.filter(t => 
          t.ticket.status === 'RESOLVED' || t.ticket.status === 'CLOSED'
        ).length;
        const assignedTickets = filteredTickets.filter(t => 
          t.ticket.assignedTo?.id === employeeData.id && t.ticket.status !== 'CLOSED'
        ).length;
        const myTickets = filteredTickets.filter(t => 
          t.ticket.createdBy?.id === employeeData.id
        ).length;

        setStats({
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          assignedTickets,
          myTickets
        });

        // Get recent tickets (last 5)
        const recent = filteredTickets
          .sort((a, b) => new Date(b.ticket.createdAt) - new Date(a.ticket.createdAt))
          .slice(0, 5)
          .map(ticket => ({
            id: ticket.ticket.id,
            number: ticket.ticket.ticketNumber,
            title: ticket.ticket.title,
            // priority: getPriorityLabel(ticket.ticket.priority),
            priority: ticket.ticket.priority,
            status: ticket.ticket.status,
            category: ticket.ticket.category,
            createdAt: formatTimeAgo(ticket.ticket.createdAt),
            isAssignedToMe: ticket.ticket.assignedTo?.id === employeeData.id,
            isCreatedByMe: ticket.ticket.createdBy?.id === employeeData.id
          }));

        setRecentTickets(recent);
      } else if (ticketsResponse.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeData');
        navigate('/employees/login');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData) {
      fetchDashboardData();
    }
  }, [employeeData]);

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // Get priority label
//   const getPriorityLabel = (priority) => {
//     switch (priority) {
//       case 1: return 'CRITICAL';
//       case 2: return 'HIGH';
//       case 3: return 'MEDIUM';
//       case 4: return 'LOW';
//       default: return 'MEDIUM';
//     }
//   };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
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

  // Quick actions based on role
  const getQuickActions = () => {
    const basePath = getBasePath();
    const actions = [
      { 
        label: 'View Tickets', 
        icon: <FileText className="w-5 h-5" />, 
        action: () => navigate(`${basePath}/tickets`) 
      },
    ];

    if (isAdmin) {
      actions.unshift(
        { 
          label: 'Create Ticket', 
          icon: <Ticket className="w-5 h-5" />, 
          action: () => navigate(`${basePath}/tickets/raise`) 
        },
        { 
          label: 'Manage Employees', 
          icon: <Users className="w-5 h-5" />, 
          action: () => navigate(`${basePath}/employees`) 
        }
      );
    } else {
      actions.unshift(
        { 
          label: 'Create Ticket', 
          icon: <Ticket className="w-5 h-5" />, 
          action: () => navigate(`${basePath}/tickets/raise`) 
        }
      );
    }

    return actions;
  };

  // Refresh dashboard
  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {greeting}, {employeeData?.name?.split(' ')[0] || 'Employee'}!
                </h1>
                {isAdmin && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                {todaysDate}
              </p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-4 py-3">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    {employeeData?.role?.replace('_', ' ') || 'Employee'}
                  </div>
                  <div className="text-xs text-blue-700">{employeeData?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTickets}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Open: {stats.openTickets}</span>
                <span>In Progress: {stats.inProgressTickets}</span>
                <span>Resolved: {stats.resolvedTickets}</span>
              </div>
            </div>
          </div>

          {/* My Tickets */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Tickets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.myTickets}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
              <UserCheck className="w-4 h-4 mr-1" />
              <span>Created by me</span>
            </div>
          </div>

          {/* Assigned to Me */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned to Me</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.assignedTickets}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${stats.totalTickets > 0 ? (stats.assignedTickets / stats.totalTickets) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.assignedTickets} ticket(s) assigned to you
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Tickets */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Tickets */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
                  <button
                    onClick={() => navigate(`${getBasePath()}/tickets`)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : recentTickets.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-600 mb-4">
                      {isAdmin ? 'No tickets in the system yet' : 'You have no tickets yet'}
                    </p>
                    <button
                      onClick={() => navigate(`${getBasePath()}/tickets/raise`)}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Create Ticket
                    </button>
                  </div>
                ) : (
                  recentTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer" 
                      onClick={() => navigate(`${getBasePath()}/tickets/${ticket.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{ticket.number}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            {ticket.isAssignedToMe && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Assigned
                              </span>
                            )}
                            {ticket.isCreatedByMe && !ticket.isAssignedToMe && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Created
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm text-gray-900 font-medium mt-1">{ticket.title}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{ticket.category}</span>
                            <span className="text-xs text-gray-500">{ticket.createdAt}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Overview (Only for Admin) */}
            {isAdmin && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Ticket Distribution</div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Open</span>
                        <span className="font-medium">{stats.openTickets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In Progress</span>
                        <span className="font-medium">{stats.inProgressTickets}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Resolved/Closed</span>
                        <span className="font-medium">{stats.resolvedTickets}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Quick Stats</div>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Users</span>
                        <span className="font-medium">{stats.totalTickets > 0 ? 'Multiple' : 'None'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Categories</span>
                        <span className="font-medium">4</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Resolution</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors cursor-pointer group border border-gray-100 hover:border-gray-200"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Ticket Status</h2>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { status: 'OPEN', count: stats.openTickets, color: 'bg-blue-500' },
                    { status: 'IN_PROGRESS', count: stats.inProgressTickets, color: 'bg-purple-500' },
                    { status: 'RESOLVED/CLOSED', count: stats.resolvedTickets, color: 'bg-green-500' },
                    { status: 'WAITING_FOR_INFO', count: 0, color: 'bg-yellow-500' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <span className="text-sm text-gray-700">{item.status.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Tickets</span>
                    <span className="font-medium text-gray-900">{stats.totalTickets}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Information</h2>
                  <Award className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {employeeData?.name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employeeData?.name || 'Employee'}</div>
                    <div className="text-sm text-gray-600">{employeeData?.email || 'email@example.com'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role</span>
                    <span className="font-medium text-gray-900">{employeeData?.role?.replace('_', ' ') || 'Employee'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tickets Created</span>
                    <span className="font-medium text-gray-900">{stats.myTickets}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Assigned Tickets</span>
                    <span className="font-medium text-gray-900">{stats.assignedTickets}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;