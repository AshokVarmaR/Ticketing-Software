import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { API_BASE_URL, COMPANY_LOGO, COMPANY_NAME } from '../../config';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: ['', '', '', '', '', ''],
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    alphanumeric: false,
    specialChar: false
  });
  
  const otpRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus OTP inputs
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // Validate password and update validation state
  useEffect(() => {
    if (step === 3 && formData.password) {
      const validations = {
        length: formData.password.length >= 6,
        alphanumeric: /[a-zA-Z]/.test(formData.password) && /[0-9]/.test(formData.password),
        specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
      };
      setPasswordValidation(validations);
    } else if (step === 3 && !formData.password) {
      setPasswordValidation({
        length: false,
        alphanumeric: false,
        specialChar: false
      });
    }
  }, [formData.password, step]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = () => {
    return passwordValidation.length && 
           passwordValidation.alphanumeric && 
           passwordValidation.specialChar;
  };

  const navigateToLogin = () => {
    navigate('/employees/login');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/otp/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email,
          type: 'password_reset'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setResendTimer(30);
        setSuccess('OTP sent successfully! Check your email.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ email: data.message || data.error || 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setErrors({ email: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });
    setErrors({ ...errors, otp: '' });

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    // Navigate to previous input on backspace
    if (e.key === 'Backspace' && index > 0 && !formData.otp[index]) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const otpCode = formData.otp.join('');
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter a 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/otp/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: otpCode,
          type: 'password_reset'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1000);
      } else {
        setErrors({ otp: data.message || data.error || 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors({ otp: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/otp/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email,
          type: 'password_reset'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResendTimer(30);
        setSuccess('New OTP sent successfully!');
        setFormData({ ...formData, otp: ['', '', '', '', '', ''] });
        setTimeout(() => setSuccess(''), 3000);
        otpRefs.current[0]?.focus();
      } else {
        setErrors({ otp: data.message || data.error || 'Failed to resend OTP' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ otp: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validatePassword()) {
      setErrors({ password: 'Please meet all password requirements' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/password/reset`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          otp: formData.otp.join('')
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/employees/login');
        }, 2000);
      } else {
        setErrors({ password: data.message || data.error || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ password: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return '';
    
    const passedValidations = Object.values(passwordValidation).filter(Boolean).length;
    const totalValidations = Object.keys(passwordValidation).length;
    
    if (passedValidations === totalValidations) return 'Strong';
    if (passedValidations >= 2) return 'Moderate';
    return 'Weak';
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        isValid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
      }`}>
        {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </div>
      <span className={`text-sm ${isValid ? 'text-green-700' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Company Logo/Name */}
        <div className="text-center mb-8">
          {COMPANY_LOGO ? (
            <img 
              src={COMPANY_LOGO} 
              alt={COMPANY_NAME} 
              className="h-12 mx-auto mb-4"
            />
          ) : (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{COMPANY_NAME}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {step === 1 && 'Enter your registered email to receive OTP'}
                  {step === 2 && 'Enter the 6-digit code sent to your email'}
                  {step === 3 && 'Create a new secure password'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold text-sm ${
                      step >= stepNum 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {stepNum}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">
                      {stepNum === 1 ? 'Email' : stepNum === 2 ? 'Verify OTP' : 'New Password'}
                    </span>
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="employee@company.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={navigateToLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enter 6-Digit Code</span>
                    </div>
                  </label>
                  
                  <div className="flex justify-center space-x-3 mb-4">
                    {formData.otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          otpVerified 
                            ? 'border-green-500 bg-green-50' 
                            : errors.otp 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300'
                        }`}
                        disabled={otpVerified || loading}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">{formData.email}</span>
                  </div>

                  {errors.otp && (
                    <div className="mb-4 flex items-center space-x-2 text-red-600 text-sm justify-center">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.otp}</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Didn't receive code?{' '}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || loading}
                        className={`font-medium ${
                          resendTimer > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        Resend OTP
                        {resendTimer > 0 && ` (${resendTimer}s)`}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || formData.otp.some(d => d === '')}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Change Email</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordReset}>
                <div className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>New Password</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Create a strong password"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                      <div className="space-y-2">
                        <ValidationItem 
                          isValid={passwordValidation.length} 
                          text="At least 6 characters" 
                        />
                        <ValidationItem 
                          isValid={passwordValidation.alphanumeric} 
                          text="Both letters and numbers" 
                        />
                        <ValidationItem 
                          isValid={passwordValidation.specialChar} 
                          text="At least one special character (!@#$%^&* etc.)" 
                        />
                      </div>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                          <span className={`text-sm font-medium ${
                            passwordStrength() === 'Strong' ? 'text-green-600' :
                            passwordStrength() === 'Moderate' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              passwordStrength() === 'Strong' ? 'bg-green-500 w-full' :
                              passwordStrength() === 'Moderate' ? 'bg-yellow-500 w-2/3' :
                              'bg-red-500 w-1/3'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Confirm New Password</span>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-2">
                        <ValidationItem 
                          isValid={formData.password === formData.confirmPassword && formData.confirmPassword.length > 0} 
                          text="Passwords match" 
                        />
                      </div>
                    )}
                    
                    {errors.confirmPassword && (
                      <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mt-8">
                  <button
                    type="submit"
                    disabled={loading || !validatePassword() || formData.password !== formData.confirmPassword}
                    className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                      validatePassword() && formData.password === formData.confirmPassword
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to OTP</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Your security is our priority. All data is encrypted and protected.</span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>

        {/* Additional Styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .otp-input:focus {
            transform: scale(1.05);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }
          button:focus {
            outline: none;
            ring: 2px solid rgba(59, 130, 246, 0.5);
          }
          .password-strength-meter {
            transition: width 0.3s ease;
          }
          .validation-check {
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForgotPassword;