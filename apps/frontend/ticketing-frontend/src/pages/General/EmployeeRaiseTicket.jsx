import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Paperclip,
  X,
  AlertCircle,
  Clock,
  FileText,
  Users,
  Zap,
  CheckCircle,
  Loader2,
  ChevronDown,
  Lightbulb,
  XCircle,
  Shield,
  Code
} from 'lucide-react';
import EmployeeHeader from '../../Components/EmployeeHeader';
import { API_BASE_URL } from '../../config';

const EmployeeRaiseTicket = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 3 // Default: Medium (3 = Low in our system, 2 = Medium)
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [ticketId, setTicketId] = useState(null);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);

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
      } catch (error) {
        console.error('Error parsing employee data:', error);
      }
    }
  }, []);

  // Available categories based on employee role
  const getAvailableCategories = () => {
    if (!employeeData?.role) return [];
    
    const allCategories = [
      { value: 'IT', label: 'IT Support', icon: <Zap className="w-6 h-6" />, description: 'Hardware, software, email issues' },
      { value: 'NETWORK', label: 'Network Team', icon: <Users className="w-6 h-6" />, description: 'Connectivity, VPN, firewall' },
      { value: 'HR', label: 'Human Resources', icon: <FileText className="w-6 h-6" />, description: 'Leave, salary, policies' },
      // Software Engineers and Admins can only raise, not receive tickets
    ];
    
    // Filter out employee's own department and remove SOFTWARE/ADMIN categories
    return allCategories.filter(category => {
      const employeeRole = employeeData.role;
      
      // Map employee role to category
      const roleToCategory = {
        'SOFTWARE_ENGINEER': 'SOFTWARE',
        'IT': 'IT',
        'NETWORK': 'NETWORK',
        'HR': 'HR',
        'ADMIN': 'ADMIN'
      };
      
      const employeeCategory = roleToCategory[employeeRole];
      
      // No one can assign to SOFTWARE_ENGINEER or ADMIN
      // Also filter out employee's own department
      return category.value !== employeeCategory && 
             category.value !== 'SOFTWARE' && 
             category.value !== 'ADMIN';
    });
  };

  // Priority options
  const priorityOptions = [
    { value: 1, label: 'Critical', color: 'bg-red-100 text-red-800', description: 'System down, immediate attention required' },
    { value: 2, label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important but not critical' },
    { value: 3, label: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Normal priority' },
    { value: 4, label: 'Low', color: 'bg-green-100 text-green-800', description: 'Minor issue, can wait' },
  ];

  // Title suggestions based on selected category
  useEffect(() => {
    if (formData.category) {
      const suggestions = {
        'IT': [
          'Email access issue',
          'Software installation request',
          'Laptop hardware problem',
          'Printer not working',
          'VPN connection issue',
          'Password reset required',
          'New software license request',
          'System performance slow'
        ],
        'NETWORK': [
          'Internet connectivity problem',
          'Wi-Fi signal weak',
          'Network printer not accessible',
          'VPN access required',
          'Firewall configuration',
          'Server connectivity issue',
          'Network switch replacement',
          'IP address conflict'
        ],
        'HR': [
          'Leave application query',
          'Salary slip issue',
          'Insurance claim assistance',
          'Attendance discrepancy',
          'Training program inquiry',
          'Employee onboarding help',
          'POSH complaint',
          'Policy clarification needed'
        ]
      };
      
      setTitleSuggestions(suggestions[formData.category] || []);
    } else {
      setTitleSuggestions([]);
    }
  }, [formData.category]);

  // Update character count
  useEffect(() => {
    setCharacterCount(formData.description.length);
  }, [formData.description]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Please provide more details (minimum 10 characters)';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select priority';
    }

    // Check file sizes
    attachments.forEach((file, index) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        newErrors[`attachment_${index}`] = `${file.name} exceeds 10MB limit`;
      }
    });

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
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError(name);
    setSuccess('');
  };

  // Handle priority change
  const handlePriorityChange = (priority) => {
    setFormData(prev => ({ ...prev, priority }));
    clearError('priority');
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setFormData(prev => ({ ...prev, category, title: '' })); // Clear title when category changes
    clearError('category');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const existingSize = attachments.reduce((acc, file) => acc + file.size, 0);
    
    if (totalSize + existingSize > 50 * 1024 * 1024) { // 50MB total limit
      setErrors(prev => ({ ...prev, attachments: 'Total file size cannot exceed 50MB' }));
      return;
    }
    
    // Add new files
    setAttachments(prev => [...prev, ...files]);
    clearError('attachments');
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    if (['mp4', 'avi', 'mov'].includes(ext)) return '🎥';
    return '📎';
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({ ...prev, title: suggestion }));
    clearError('title');
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
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      // Step 1: Create ticket
      const ticketResponse = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!ticketResponse.ok) {
        const errorData = await ticketResponse.json();
        throw new Error(errorData.message || 'Failed to create ticket');
      }

      const ticketData = await ticketResponse.json();
      const createdTicketId = ticketData.id;
      setTicketId(createdTicketId);

      // Step 2: Upload attachments if any
      if (attachments.length > 0) {
        setUploading(true);
        
        const formDataForAttachments = new FormData();
        attachments.forEach(file => {
          formDataForAttachments.append('files', file);
        });

        const attachmentResponse = await fetch(`${API_BASE_URL}/tickets/${createdTicketId}/attachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataForAttachments,
        });

        if (!attachmentResponse.ok) {
          throw new Error('Ticket created but failed to upload attachments');
        }
      }

      // Success
      setSuccess(`Ticket #${ticketData.ticketNumber} created successfully!`);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 3
        });
        setAttachments([]);
        setTicketId(null);
        
        // Redirect to tickets list after delay
        setTimeout(() => {
          const basePath = getBasePath();
          navigate(`${basePath}/tickets`);
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrors({ submit: error.message || 'Failed to create ticket. Please try again.' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Get base path for navigation
  const getBasePath = () => {
    if (!employeeData?.role) return '';
    return `/${employeeData.role.toLowerCase().replace('_', '-')}`;
  };

  const availableCategories = getAvailableCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`${getBasePath()}/tickets`)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Raise New Ticket</h1>
              <p className="text-gray-600 mt-1">
                Submit a support request to relevant department
              </p>
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
                  Ticket Created Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  {success} {uploading && 'Uploading attachments...'}
                </div>
                {ticketId && (
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`${getBasePath()}/tickets/${ticketId}`)}
                      className="text-sm text-green-800 font-medium hover:text-green-900 cursor-pointer"
                    >
                      View ticket details →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection - Centered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                  Select Department to Raise Ticket
                </label>
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {availableCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleCategoryChange(category.value)}
                        className={`p-6 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer w-64 h-48 ${
                          formData.category === category.value
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        <div className={`p-4 rounded-full mb-4 ${
                          formData.category === category.value 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.icon}
                        </div>
                        <span className="text-lg font-bold text-gray-900 mb-2">{category.label}</span>
                        <p className="text-sm text-gray-600 text-center mb-4">{category.description}</p>
                        {formData.category === category.value && (
                          <div className="mt-2 w-4 h-4 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                    
                    {/* Restricted Categories Info */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gray-200 rounded-lg">
                              <Code className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Software Engineers</div>
                              <div className="text-xs text-gray-500">Can only raise tickets</div>
                            </div>
                          </div>
                          <div className="h-4 w-px bg-gray-300"></div>
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gray-200 rounded-lg">
                              <Shield className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Administrators</div>
                              <div className="text-xs text-gray-500">Can only raise tickets</div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-3">
                          Tickets cannot be assigned to Software Engineers or Administrators
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.category && (
                  <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category}
                  </p>
                )}
                {availableCategories.length === 0 && employeeData && (
                  <p className="mt-4 text-sm text-yellow-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    You cannot raise tickets to your own department ({employeeData.role.replace('_', ' ')})
                  </p>
                )}
              </div>

              {/* Title Input with Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief description of the issue"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}

                {/* Title Suggestions */}
                {titleSuggestions.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Popular issues in {formData.category}:
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {titleSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors cursor-pointer hover:scale-105"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Please provide detailed information about the issue. Include steps to reproduce, error messages, and any relevant context."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    Minimum 10 characters. Be as detailed as possible.
                  </div>
                  <div className={`text-xs ${characterCount < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                    {characterCount} characters
                  </div>
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Priority Selection - Centered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-6 text-center">
                  Priority Level
                </label>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {priorityOptions.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => handlePriorityChange(priority.value)}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer w-full ${
                          formData.priority === priority.value
                            ? `${priority.color} border-current shadow-lg scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{priority.label}</span>
                          {formData.priority === priority.value && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 text-left">{priority.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {errors.priority && (
                  <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.priority}
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-2 text-center">
                    <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span className="px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50">
                          Click to upload files
                        </span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                        />
                      </label>
                      <p className="pl-3 py-2">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC, XLS, ZIP up to 10MB each (50MB total)
                    </p>
                  </div>
                </div>
                
                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Attached Files ({attachments.length})
                    </h4>
                    <div className="space-y-3">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{getFileIcon(file.name)}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-2 text-gray-400 hover:text-red-500 cursor-pointer hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.attachments && (
                  <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.attachments}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      {errors.submit}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Centered */}
              <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200 justify-center">
                <button
                  type="button"
                  onClick={() => navigate(`${getBasePath()}/tickets`)}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={loading || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading || availableCategories.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-48"
                >
                  {(loading || uploading) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {loading ? 'Creating Ticket...' : 'Uploading Attachments...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Raise Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            Ticket Submission Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Select the correct department:</strong> Tickets can only be raised to IT, Network, or HR</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Be specific in the title:</strong> Use our suggestions for common issues</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Provide detailed description:</strong> Include error messages, steps to reproduce</span>
              </li>
            </ul>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Choose appropriate priority:</strong> Critical = System down, Low = Minor issues</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Attach relevant files:</strong> Screenshots, error logs, or documents</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <span><strong>Restricted departments:</strong> Cannot raise tickets to Software Engineers or Administrators</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeRaiseTicket;