import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  Ticket,
  FileText,
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { COMPANY_LOGO, COMPANY_NAME } from '../config';
import { WS_BASE_URL, API_BASE_URL } from '../config';
import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

const EmployeeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [notificationsPage, setNotificationsPage] = useState(0);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const notificationsPerPage = 10;
  const notificationsEndRef = useRef(null);

  // Fetch employee data from localStorage and setup WebSocket
  useEffect(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setEmployeeData(data);
        setIsAdmin(data?.role === 'ADMIN');
        
        // Initialize WebSocket connection for notifications
        console.log(data);
        setupWebSocket(data.id);
        
        // Load existing notifications from localStorage
        const savedNotifications = localStorage.getItem(`notifications_${data.id}`);
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  // Setup WebSocket connection for real-time notifications
  const setupWebSocket = (employeeId) => {
    // const socket = new SockJS(WS_BASE_URL);
    const client = new Client({
      // webSocketFactory: () =>
      brokerURL: WS_BASE_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        
        // Subscribe to user-specific notification queue
        client.subscribe(`/queue/notifications/${employeeId}`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('New notification received:', notification);
          
          // Add new notification to state
          setNotifications(prev => {
            const updated = [notification, ...prev];
            // Save to localStorage
            localStorage.setItem(`notifications_${employeeId}`, JSON.stringify(updated));
            return updated;
          });
        });
        
        // Send a connection confirmation if needed
        // client.publish({ destination: '/app/notifications/connect', body: JSON.stringify({ userId: employeeId }) });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      }
    });
    
    client.activate();
    setStompClient(client);
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API call to mark a single notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!employeeData?.id || !getAuthToken()) return;

    try {
      setMarkingAsRead(true);
      
      const response = await fetch(
        `${API_BASE_URL}/notifications/recipient/${notificationId}/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Notification ${notificationId} marked as read on backend`);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // We'll still update the UI even if backend call fails
    } finally {
      setMarkingAsRead(false);
    }
  }, [employeeData?.id]);

  // API call to mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!employeeData?.id || !getAuthToken()) return;

    try {
      setMarkingAllAsRead(true);
      
      const response = await fetch(
        `${API_BASE_URL}/notifications/recipient/mark-readall`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('All notifications marked as read on backend');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // We'll still update the UI even if backend call fails
    } finally {
      setMarkingAllAsRead(false);
    }
  }, [employeeData?.id]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get paginated notifications
  const getPaginatedNotifications = () => {
    const startIndex = 0;
    const endIndex = (notificationsPage + 1) * notificationsPerPage;
    return notifications.slice(startIndex, endIndex);
  };

  const displayedNotifications = getPaginatedNotifications();
  console.log('notifications', displayedNotifications)
  const hasMoreNotifications = notifications.length > displayedNotifications.length;

  // Mark notification as read (with backend call)
  const markAsRead = useCallback(async (id) => {
    // First update UI immediately for better UX
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      // Save updated notifications to localStorage
      if (employeeData?.id) {
        localStorage.setItem(`notifications_${employeeData.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Then call backend API
    await markNotificationAsRead(id);
  }, [employeeData?.id, markNotificationAsRead]);

  // Mark all notifications as read (with backend call)
  const markAllAsRead = useCallback(async () => {
    // First update UI immediately for better UX
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, isRead: true }));
      if (employeeData?.id) {
        localStorage.setItem(`notifications_${employeeData.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Then call backend API
    await markAllNotificationsAsRead();
  }, [employeeData?.id, markAllNotificationsAsRead]);

  // Load more notifications
  const loadMoreNotifications = () => {
    setNotificationsPage(prev => prev + 1);
  };

  // Handle notification click and redirect to ticket
  const handleNotificationClick = useCallback(async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    } else {
      // If already read, we can still update the read time on backend
      // or perform any other action if needed
      console.log('Notification already read:', notification.id);
    }
    
    // If notification has a ticket, redirect to ticket page
    if (notification.ticket?.id) {
      const ticketId = notification.ticket.id;
      let ticketPath = '';
      
      if (isAdmin) {
        ticketPath = `/admin/tickets/${ticketId}`;
      } else {
        // Adjust based on your employee role paths
        const rolePath = employeeData?.role?.toLowerCase().replace("_","-") || 'employee';
        ticketPath = `/${rolePath}/tickets/${ticketId}`;
      }
      
      setNotificationsOpen(false);
      navigate(ticketPath);
    }
  }, [markAsRead, navigate, isAdmin, employeeData?.role]);

  // Role-based path configuration
  const getRoleBasedPath = (page) => {
    if (!employeeData?.role) return '/dashboard';
    
    const role = employeeData.role.toLowerCase();
    const rolePrefix = role === 'admin' ? 'admin' : role.replace('_', '-');
    
    switch(page) {
      case 'dashboard':
        return `/${rolePrefix}/dashboard`;
      case 'tickets':
        return `/${rolePrefix}/tickets`;
      case 'employees':
        return `/${rolePrefix}/employees`;
      case 'reports':
        return `/${rolePrefix}/reports`;
      case 'notifications':
        return `/${rolePrefix}/notifications`;
      default:
        return `/${rolePrefix}/dashboard`;
    }
  };

  // Get modules based on role
  const getModules = () => {
    if (isAdmin) {
      return [
        { name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/dashboard' },
        { name: 'Tickets', icon: <Ticket className="w-4 h-4" />, path: '/admin/tickets' },
        { name: 'Employees', icon: <Users className="w-4 h-4" />, path: '/admin/employees' },
        { name: 'Reports', icon: <FileText className="w-4 h-4" />, path: '/admin/reports' },
      ];
    }
    
    return [
      { name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: getRoleBasedPath('dashboard') },
      { name: 'Tickets', icon: <Ticket className="w-4 h-4" />, path: getRoleBasedPath('tickets') },
    ];
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.notifications-menu')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  // Scroll to bottom when loading more notifications
  useEffect(() => {
    if (notificationsOpen && notificationsEndRef.current && notificationsPage > 0) {
      notificationsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notificationsOpen, displayedNotifications.length]);

  // Determine active module based on current path
  const getActiveModule = () => {
    const path = location.pathname;
    if (isAdmin) {
      if (path.includes('/admin/tickets')) return 'Tickets';
      if (path.includes('/admin/employees')) return 'Employees';
      if (path.includes('/admin/reports')) return 'Reports';
      return 'Dashboard';
    } else {
      if (path.includes('/tickets')) return 'Tickets';
      if (path.includes('/notifications')) return 'Notifications';
      return 'Dashboard';
    }
  };

  // Logout function
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('employeeData');
    
    // Cleanup WebSocket
    if (stompClient) {
      stompClient.deactivate();
    }
    
    // Redirect to login page
    navigate('/employees/login');
    
    // Prevent back navigation
    window.history.replaceState(null, '', '/employees/login');
  };

  // Format role name for display
  const formatRoleName = (role) => {
    if (!role) return 'Employee';
    if (role === 'ADMIN') return 'Administrator';
    return role.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Get portal title based on role
  const getPortalTitle = () => {
    return isAdmin ? 'Admin Portal' : 'Employee Portal';
  };

  // Format time for display
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'TICKET_ASSIGNED':
      case 'TICKET_UPDATED':
        return <Ticket className="w-4 h-4 text-blue-600" />;
      case 'SYSTEM':
        return <Bell className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const modules = getModules();
  const activeModule = getActiveModule();
  const notificationsPath = getRoleBasedPath('notifications');

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg border-b border-gray-100' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Company Name */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                <img 
                  src={COMPANY_LOGO} 
                  alt={`${COMPANY_NAME} Logo`}
                  className="w-6 h-6"
                />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  {COMPANY_NAME}
                </span>
                <div className="text-xs text-blue-600 font-medium">
                  {getPortalTitle()}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Navigation Modules */}
          <div className="hidden lg:flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2">
            {modules.map((module) => (
              <button
                key={module.name}
                onClick={() => navigate(module.path)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  activeModule === module.name
                    ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {module.icon}
                <span>{module.name}</span>
              </button>
            ))}
          </div>

          {/* Right: Notifications (for ALL employees) & User Menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Notifications (for ALL employees including ADMIN) */}
            <div className="relative notifications-menu">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown - Made wider */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {unreadCount} unread • {notifications.length} total
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          disabled={markingAllAsRead}
                          className={`text-sm font-medium flex items-center space-x-1 cursor-pointer ${
                            markingAllAsRead 
                              ? 'text-gray-500 cursor-not-allowed' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {markingAllAsRead && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          <span>Mark all as read</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                      <>
                        {displayedNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 hover:bg-gray-50 border-l-2 cursor-pointer transition-colors duration-150 ${
                              !notification.isRead 
                                ? 'border-blue-500 bg-blue-50/50' 
                                : 'border-transparent'
                            } ${markingAsRead ? 'opacity-70' : ''}`}
                            disabled={markingAsRead}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {!notification.isRead && markingAsRead && (
                                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                    )}
                                    {notification.ticket && (
                                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                {notification.ticket && (
                                  <div className="mt-2 flex items-center space-x-2">
                                    <Ticket className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {notification.ticket.ticketNumber}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">
                                      {notification.ticket.title}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-500">
                                    {formatTime(notification.createdAt)}
                                  </p>
                                  {!notification.isRead && !markingAsRead && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={notificationsEndRef} />
                        
                        {/* Load More Button */}
                        {hasMoreNotifications && (
                          <div className="px-4 py-3 border-t border-gray-100">
                            <button
                              onClick={loadMoreNotifications}
                              className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-2"
                            >
                              <span>Load more notifications</span>
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100">
                    {/* <button
                      onClick={() => {
                        navigate(notificationsPath);
                        setNotificationsOpen(false);
                      }}
                      className="w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>View all notifications</span>
                      <ChevronRight className="w-4 h-4" />
                    </button> */}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {employeeData?.name?.charAt(0) || (isAdmin ? 'A' : 'E')}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {employeeData?.name || (isAdmin ? 'Admin' : 'Employee')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatRoleName(employeeData?.role)}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {employeeData?.name?.charAt(0) || (isAdmin ? 'A' : 'E')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {employeeData?.name || (isAdmin ? 'Admin' : 'Employee')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {employeeData?.email || (isAdmin ? 'admin@company.com' : 'employee@company.com')}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          ID: {employeeData?.employeeCode || (isAdmin ? 'ADM001' : 'EMP001')}
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          Role: {formatRoleName(employeeData?.role)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Links */}
                  <div className="px-2 py-1">
                    {modules.map((module) => (
                      <button
                        key={module.name}
                        onClick={() => {
                          navigate(module.path);
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded-lg cursor-pointer"
                      >
                        {module.icon}
                        <span className="font-medium">{module.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2 border-t border-gray-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                  </button>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl mt-2">
                    <div className="text-xs text-gray-600">
                      {getPortalTitle()}
                      <span className="mx-2">•</span>
                      <span className="text-green-600 font-medium">●</span> Online
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-2 py-3 space-y-1">
              {/* Mobile Modules */}
              {modules.map((module) => (
                <button
                  key={module.name}
                  onClick={() => {
                    navigate(module.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-lg w-full cursor-pointer ${
                    activeModule === module.name
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {module.icon}
                  <span className="font-medium">{module.name}</span>
                </button>
              ))}

              {/* Mobile Notifications (for ALL employees including ADMIN) */}
              <button
                onClick={() => {
                  navigate(notificationsPath);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 w-full rounded-lg cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute right-4 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile User Info */}
              {employeeData && (
                <div className="px-4 py-3 border-t border-gray-100 mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {employeeData.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">{employeeData.name}</div>
                      <div className="text-xs text-gray-500">{formatRoleName(employeeData.role)}</div>
                      <div className="text-xs text-blue-600 font-medium">
                        Portal: {getPortalTitle()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 w-full rounded-lg border-t border-gray-100 mt-2 pt-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EmployeeHeader;