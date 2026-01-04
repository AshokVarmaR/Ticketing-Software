import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  Calendar,
  Building,
  Shield,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Edit3,
  X
} from 'lucide-react';
// import AdminHeader from '../../Components/AdminHeader';
import { API_BASE_URL } from '../../config';
import EmployeeHeader from '../../Components/EmployeeHeader';

const AdminAddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    email: '',
    password: '',
    joiningDate: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [employeeCodeEnabled, setEmployeeCodeEnabled] = useState(false);
  const [isCustomCode, setIsCustomCode] = useState(false);

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/employees/login');
          return;
        }

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
        } else if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('employeeData');
          navigate('/employees/login');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, [navigate]);

  // Handle enabling/disabling employee code input
  const toggleEmployeeCodeInput = () => {
    if (employeeCodeEnabled) {
      // Disable and clear
      setFormData(prev => ({ ...prev, employeeCode: '' }));
      setEmployeeCodeEnabled(false);
      setIsCustomCode(false);
      clearError('employeeCode');
    } else {
      // Enable
      setEmployeeCodeEnabled(true);
    }
  };

  // Validate EDIC format
  const validateEDICFormat = (code) => {
    if (!code) return true; // Optional field
    const edicRegex = /^EDIC\d+$/;
    return edicRegex.test(code);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate employee code only if it's entered
    if (formData.employeeCode.trim()) {
      if (!validateEDICFormat(formData.employeeCode)) {
        newErrors.employeeCode = 'Employee code must be in EDIC format followed by numbers (e.g., EDIC100, EDIC45)';
      }
    }

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    } else {
      const selectedDate = new Date(formData.joiningDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.joiningDate = 'Joining date cannot be in the future';
      }
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
    
    // Convert to uppercase for employee code
    const processedValue = name === 'employeeCode' ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    clearError(name);
    setSuccess('');
    
    // Mark as custom code if user types something
    if (name === 'employeeCode' && value.trim() !== '') {
      setIsCustomCode(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/employees/login');
        return;
      }

      // Prepare data - don't send employeeCode if it's empty
      const dataToSend = { ...formData };
      if (!dataToSend.employeeCode.trim()) {
        delete dataToSend.employeeCode;
      }

      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Employee added successfully!');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            employeeCode: '',
            name: '',
            email: '',
            password: '',
            joiningDate: '',
            role: ''
          });
          setEmployeeCodeEnabled(false);
          setIsCustomCode(false);
          
          // Redirect to employees list after delay
          setTimeout(() => {
            navigate('/admin/employees');
          }, 1500);
        }, 1000);
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrors({ 
            employeeCode: 'Employee code already exists',
            email: 'Email already exists' 
          });
        } else {
          throw new Error(errorData.message || 'Failed to add employee');
        }
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setErrors({ submit: error.message || 'Failed to add employee. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Format role name for display
  const formatRoleName = (role) => {
    return role.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Example EDIC codes for reference
  const edicExamples = ['EDIC100', 'EDIC45', 'EDIC789', 'EDIC2024'];

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Employee</h1>
              <p className="text-gray-600 mt-1">Add a new employee to your organization</p>
            </div>
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

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Code - Optional */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    <Building className="inline w-4 h-4 mr-1" />
                    Employee Code (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={toggleEmployeeCodeInput}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {employeeCodeEnabled ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Remove custom code</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>Add custom code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {employeeCodeEnabled ? (
                    <>
                      <input
                        type="text"
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleChange}
                        placeholder="EDIC followed by numbers (e.g., EDIC100)"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          errors.employeeCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        autoFocus
                      />
                      {errors.employeeCode && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.employeeCode}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Format: EDIC followed by numbers. Leave empty for auto-generation.
                        Examples: {edicExamples.join(', ')}
                      </p>
                    </>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700 font-medium">Auto-generated code</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Employee code will be automatically generated by the system
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 italic">
                          System will assign
                        </div>
                      </div>
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
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter employee's full name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
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
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter temporary password"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
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
                  Minimum 8 characters. Employee can change this later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Joining Date
                  </label>
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
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      {errors.submit}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/employees')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding Employee...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Add Employee</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            Information
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span><strong>Employee Code:</strong> Optional. Leave empty for auto-generation or use EDIC format (e.g., EDIC100)</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Employee will receive login credentials via email</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Employee can reset their password after first login</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Role determines access level and permissions</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AdminAddEmployee;