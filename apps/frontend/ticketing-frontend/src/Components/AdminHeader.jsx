import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  Ticket,
  FileText,
  ChevronDown
} from 'lucide-react';
import { COMPANY_LOGO, COMPANY_NAME } from '../config';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  // Fetch employee data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      try {
        setEmployeeData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Determine active module based on current path
  const getActiveModule = () => {
    const path = location.pathname;
    if (path.includes('/admin/tickets')) return 'Tickets';
    if (path.includes('/admin/employees')) return 'Employees';
    if (path.includes('/admin/reports')) return 'Reports';
    return 'Dashboard';
  };

  // Logout function
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('employeeData');
    
    // Redirect to login page
    navigate('/employees/login');
    
    // Prevent back navigation
    window.history.replaceState(null, '', '/employees/login');
  };

  // Admin navigation modules - all starting with /admin
  const modules = [
    { name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/admin' },
    { name: 'Tickets', icon: <Ticket className="w-4 h-4" />, path: '/admin/tickets' },
    { name: 'Employees', icon: <Users className="w-4 h-4" />, path: '/admin/employees' },
    { name: 'Reports', icon: <FileText className="w-4 h-4" />, path: '/admin/reports' },
  ];

  const activeModule = getActiveModule();

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg border-b border-gray-100' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Company Logo Only */}
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
                <div className="text-xs text-blue-600 font-medium">Admin Portal</div>
              </div>
            </div>
          </div>

          {/* Center: Navigation Modules */}
          <div className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
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

          {/* Right: User Menu & Logout */}
          <div className="flex items-center space-x-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {employeeData?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {employeeData?.name || 'Admin'}
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  {employeeData && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {employeeData.name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {employeeData.email}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          ID: {employeeData.employeeCode}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Sign Out</span>
                  </button>
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

              {/* Mobile User Info */}
              {employeeData && (
                <div className="px-4 py-3 border-t border-gray-100 mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {employeeData.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">{employeeData.name}</div>
                      <div className="text-xs text-gray-500">Administrator</div>
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

export default AdminHeader;