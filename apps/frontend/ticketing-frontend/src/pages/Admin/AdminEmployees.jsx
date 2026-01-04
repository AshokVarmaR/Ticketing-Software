import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Eye,
  User,
  Mail,
  Calendar,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  Download,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import AdminHeader from '../../Components/AdminHeader';
import { API_BASE_URL } from '../../config';
import EmployeeHeader from '../../Components/EmployeeHeader';

const AdminEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [adminEmployee, setAdminEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch admin employee data
  useEffect(() => {
    const fetchAdminData = () => {
      const storedData = localStorage.getItem('employeeData');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setAdminEmployee(data);
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
    };
    
    fetchAdminData();
  }, []);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeData');
        navigate('/employees/login');
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    // Exclude admin from the main list if they're in the response
    if (adminEmployee && employee.id === adminEmployee.id) return false;
    
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && employee.isActive === true) ||
      (statusFilter === 'INACTIVE' && employee.isActive === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Role options
  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'SOFTWARE_ENGINEER', label: 'Software Engineer' },
    { value: 'IT', label: 'IT' },
    { value: 'NETWORK', label: 'Network' },
    { value: 'HR', label: 'HR' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  // Status options
  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case 'SOFTWARE_ENGINEER': return 'bg-blue-100 text-blue-800';
      case 'IT': return 'bg-green-100 text-green-800';
      case 'NETWORK': return 'bg-purple-100 text-purple-800';
      case 'HR': return 'bg-pink-100 text-pink-800';
      case 'ADMIN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle export
  const handleExport = () => {
    // Export functionality would go here
    console.log('Exporting employee data...');
  };

  if (loading && employees.length === 0) {
    return (
      <div>
        <EmployeeHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your organization's employees and their details
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/employees/add')}
              className="mt-4 sm:mt-0 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Admin Employee Card */}
        {adminEmployee && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Administrator Account
              </h2>
              <button
                onClick={() => navigate(`/admin/employees/view/${adminEmployee.id}`)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {adminEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-gray-900">{adminEmployee.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor('ADMIN')}`}>
                        ADMIN
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {adminEmployee.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-1" />
                        ID: {adminEmployee.employeeCode}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined: {formatDate(adminEmployee.joiningDate)}
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active Account
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search Section */}
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
                    placeholder="Search employees by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="w-full md:w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
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
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={fetchEmployees}
                  className="p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                {/* <button
                  onClick={handleExport}
                  className="p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Count */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Employees ({filteredEmployees.length})
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Clear search</span>
              </button>
            )}
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' 
                  ? 'Try adjusting your search or filters'
                  : 'No employees have been added yet'}
              </p>
              <button
                onClick={() => navigate('/admin/employees/add')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Employee</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Details
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {employee.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                          {employee.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {employee.isActive ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm text-green-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm text-red-600 font-medium">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(employee.joiningDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/employees/view/${employee.id}`)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table Footer */}
        {filteredEmployees.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{filteredEmployees.length}</span> employees
            </div>
            {/* <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div> */}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminEmployees;