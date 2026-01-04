import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Building, Shield } from 'lucide-react';
import { COMPANY_LOGO, COMPANY_NAME, API_BASE_URL } from '../../config'

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Role-based dashboard paths
  const roleDashboardPaths = {
    'SOFTWARE_ENGINEER': '/software-engineer/dashboard',
    'IT': '/it/dashboard',
    'NETWORK': '/network/dashboard',
    'HR': '/hr/dashboard',
    'ADMIN': '/admin/dashboard'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: identifier,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('employeeData', JSON.stringify(data.employee));
      
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Redirect based on role
      setTimeout(() => {
        const dashboardPath = roleDashboardPaths[data.employee.role] || '/dashboard';
        navigate(dashboardPath);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper text based on identifier type
  const getIdentifierType = () => {
    if (identifier.includes('@')) return 'email';
    if (/^[A-Z0-9]{4,10}$/.test(identifier)) return 'employee code';
    return 'email or employee code';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Company Logo */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-md">
              <img 
                src={COMPANY_LOGO} 
                alt={`${COMPANY_NAME} Logo`}
                className="w-7 h-7"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {COMPANY_NAME}
              </span>
              <div className="text-xs text-blue-600 font-medium">Employee Portal</div>
            </div>
          </Link>
        </div>

        <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900">
          Employee Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your organization's support management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-200 sm:px-10">
          {/* Role Information */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Role-Based Access</h4>
                <p className="text-xs text-gray-600">
                  You will be automatically redirected to your department's dashboard based on your role.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Identifier Input */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Employee Code
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {identifier.includes('@') ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter email or employee code"
                />
              </div>
              {identifier && (
                <p className="mt-1 text-xs text-gray-500">
                  Detected as {getIdentifierType()}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div> */}

              <div className="text-sm">
                <a
                  href="/employees/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      {success}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </div>
                ) : (
                  'Sign in to Employee Portal'
                )}
              </button>
            </div>
          </form>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-500">Need Help?</div>
                <div className="text-sm font-medium text-gray-900">IT Support</div>
                <div className="text-xs text-gray-600">Ext. 5555</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-500">HR Assistance</div>
                <div className="text-sm font-medium text-gray-900">Human Resources</div>
                <div className="text-xs text-gray-600">Ext. 7777</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            By logging in, you agree to our{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <Building className="w-3 h-3 mr-1" />
            <span>Secure Employee Portal v2.4</span>
          </div>
        </div>
      </div>

      {/* Role Information Modal */}
      <div className="mt-8 max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Dashboards</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(roleDashboardPaths).map(([role, path]) => (
              <div key={role} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  {role.replace('_', ' ')}
                </div>
                <div className="text-xs text-gray-600 truncate">{path}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">
            You will be automatically redirected to your department's dashboard upon successful login.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;