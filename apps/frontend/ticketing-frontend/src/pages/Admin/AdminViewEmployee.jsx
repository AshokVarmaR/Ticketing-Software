import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Edit2,
  Trash2,
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import AdminHeader from '../../Components/AdminHeader';
import { API_BASE_URL } from '../../config';
import EmployeeHeader from '../../Components/EmployeeHeader';

const AdminViewEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    joiningDate: '',
    role: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        setFormData({
          employeeCode: data.employeeCode || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '', // Don't populate password for security
          joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',
          role: data.role || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else if (response.status === 404) {
        navigate('/admin/employees');
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeData');
        navigate('/employees/login');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/employees/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
      fetchRoles();
    }
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  // Format role name for display
  const formatRoleName = (role) => {
    return role.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Validate phone number (Indian format)
  const validateIndianPhone = (phone) => {
    if (!phone) return true; // Optional field
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phone.replace(/\D/g, ''));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone if provided
    if (formData.phone && !validateIndianPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
    }

    // Validate password only if provided during edit
    if (editing && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear specific error
  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    let processedValue = value;
    if (name === 'phone') {
      // Remove all non-digits and limit to 10
      const digits = value.replace(/\D/g, '').slice(0, 10);
      processedValue = digits;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    clearError(name);
    setSuccess('');
  };

  // Handle toggle change
  const handleToggleChange = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  // Handle update employee
  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess('');

    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      // Prepare data - remove password if empty
      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        setSuccess('Employee updated successfully!');
        setEditing(false);
        
        // Clear password field after successful update
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrors({ 
            employeeCode: 'Employee code already exists',
            email: 'Email already exists' 
          });
        } else {
          throw new Error(errorData.message || 'Failed to update employee');
        }
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setErrors({ submit: error.message || 'Failed to update employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete employee
  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/admin/employees');
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    if (employee) {
      setFormData({
        employeeCode: employee.employeeCode || '',
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        password: '',
        joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
        role: employee.role || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true
      });
    }
    setEditing(false);
    setErrors({});
    setSuccess('');
  };

  if (loading && !employee) {
    return (
      <div>
        <EmployeeHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div>
        <EmployeeHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Employee not found</h3>
            <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/employees')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Back to Employees
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/employees')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </button>

        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {editing ? 'Edit Employee' : 'Employee Details'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {employee.employeeCode} • {formatRoleName(employee.role)}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!editing ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditing(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {/* <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button> */}
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Success
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  {success}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {errors.submit}
              </div>
            </div>
          </div>
        )}

        {/* Employee Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Employee Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline w-4 h-4 mr-1" />
                    Employee Code
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.employeeCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled // Employee code should not be editable after creation
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-medium">{employee.employeeCode}</p>
                    </div>
                  )}
                  {errors.employeeCode && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.employeeCode}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {editing ? (
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={handleToggleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {formData.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {employee.isActive ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-red-600 font-medium">Inactive</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-medium">{employee.name}</p>
                  </div>
                )}
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-medium">{employee.email}</p>
                  </div>
                )}
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number
                </label>
                {editing ? (
                  <>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit Indian phone number"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formData.phone && !errors.phone && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Valid Indian phone number format
                      </p>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900 font-medium">
                      {employee.phone || 'Not provided'}
                    </p>
                  </div>
                )}
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password (Only in Edit mode) */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-1" />
                    Password (Optional - Leave empty to keep current)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password (minimum 8 characters)"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer text-sm"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Leave empty to keep the current password. If provided, must be at least 8 characters.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Joining Date
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.joiningDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 font-medium">{formatDate(employee.joiningDate)}</p>
                    </div>
                  )}
                  {errors.joiningDate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.joiningDate}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="inline w-4 h-4 mr-1" />
                    Role
                  </label>
                  {editing ? (
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer ${
                          errors.role ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {formatRoleName(role)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(employee.role)}`}>
                        {formatRoleName(employee.role)}
                      </span>
                    </div>
                  )}
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {!editing && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              Employee Information
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span>Employee ID: {employee.employeeCode}</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span>Status: {employee.isActive ? 'Active' : 'Inactive'}</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span>Joined: {formatDate(employee.joiningDate)}</span>
              </li>
              {employee.phone && (
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                  <span>Phone: {employee.phone}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this employee? This action cannot be undone.
                  </p>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.email}</div>
                        <div className="text-sm text-gray-500">ID: {employee.employeeCode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Deleting...' : 'Yes, Delete Employee'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewEmployee;