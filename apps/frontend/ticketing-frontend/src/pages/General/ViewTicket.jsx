import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Paperclip,
  Download,
  Calendar,
  TrendingUp,
  ChevronDown,
  Filter,
  Plus,
  X,
  Send,
  Lock,
  Globe,
  RefreshCw,
  UserPlus,
  Shield,
  Code,
  Zap,
  FileText,
  MoreVertical,
  Edit3,
  Loader2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import EmployeeHeader from '../../Components/EmployeeHeader';
import { API_BASE_URL, FILE_BASE_URL } from '../../config';

const ViewTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState(3);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);

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

  
  // Get base path for navigation
  const getBasePath = () => {
    if (!employeeData?.role) return '';
    return `/${employeeData.role.toLowerCase().replace('_', '-')}`;
  };

  // Fetch ticket details
  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/employees/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ticket data:', data); // Debug log
        setTicket(data);
        setNewStatus(data.ticket?.status || '');
        setNewPriority(data.ticket?.priority || 3);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('employeeData');
        navigate('/employees/login');
      } else {
        throw new Error('Failed to fetch ticket');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments (from the nested response)
  const fetchComments = () => {
    if (ticket?.comments) {
      // Filter comments based on visibility rules
      const filteredComments = ticket.comments.filter(comment => {
        // If user is admin, show all comments
        if (employeeData?.role === 'ADMIN') return true;
        
        // If user is assignee, show all comments
        if (ticket?.ticket?.assignedTo?.id === employeeData?.id) return true;
        
        // If user is creator
        if (ticket?.ticket?.createdBy?.id === employeeData?.id) {
          // Only show non-internal comments
          return !comment.isInternal;
        }
        
        return false;
      });
      setComments(filteredComments);
    }
  };

  // Fetch attachments (from the nested response)
  const fetchAttachments = () => {
    if (ticket?.attachments) {
      setAttachments(ticket.attachments);
    }
  };

  // Fetch available statuses
  const fetchStatuses = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/statuses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableStatuses(data);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  // Filter statuses based on user role
  const filterStatuses = () => {
    if (!availableStatuses.length || !employeeData) {
      setFilteredStatuses(availableStatuses);
      return;
    }

    // If user is admin, show all statuses including CLOSED
    if (employeeData.role === 'ADMIN') {
      setFilteredStatuses(availableStatuses);
      return;
    }

    // For non-admin users, filter out CLOSED status
    const filtered = availableStatuses.filter(status => status !== 'CLOSED');
    setFilteredStatuses(filtered);
  };

  useEffect(() => {
    if (employeeData && id) {
      fetchTicketDetails();
      fetchStatuses();
    }
  }, [employeeData, id]);

  // Update comments and attachments when ticket data changes
  useEffect(() => {
    if (ticket) {
      fetchComments();
      fetchAttachments();
    }
  }, [ticket]);

  // Update filtered statuses when availableStatuses or employeeData changes
  useEffect(() => {
    filterStatuses();
  }, [availableStatuses, employeeData]);

  // Check if ticket is closed
  const isTicketClosed = () => {
    return ticket?.ticket?.status === 'CLOSED';
  };

  // Get priority label and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 1: return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> };
      case 2: return { label: 'High', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4" /> };
      case 3: return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="w-4 h-4" /> };
      case 4: return { label: 'Low', color: 'bg-green-100 text-green-800', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> };
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
    if (!dateString) return 'N/A';
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
    if (!dateString) return 'N/A';
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

  // Check if user can change status
  const canChangeStatus = () => {
    if (!employeeData || !ticket?.ticket || isTicketClosed()) return false;
    
    // Admin can always change status
    if (employeeData.role === 'ADMIN') return true;
    
    // Assignee can change status
    if (ticket.ticket.assignedTo?.id === employeeData.id) return true;
    
    return false;
  };

  // Check if user can change priority (only admin)
  const canChangePriority = () => {
    if (isTicketClosed()) return false;
    return employeeData?.role === 'ADMIN';
  };

  // Check if user can assign ticket (admin or open ticket view)
  const canAssignTicket = () => {
    if (!employeeData || !ticket?.ticket || isTicketClosed()) return false;
    
    // Admin can always assign to others (no "Assign to me")
    if (employeeData.role === 'ADMIN') return false; // Admin doesn't assign to themselves
    
    // Software Engineer doesn't assign to themselves
    if (employeeData.role === 'SOFTWARE_ENGINEER') return false;
    
    // For other roles (IT, NETWORK, HR), they can assign to themselves if ticket is open
    if (ticket.ticket.status === 'OPEN' && ticket.ticket.assignedTo === null) {
      // User should not be software engineer and ticket category should match user's role
      const userRole = employeeData.role;
      const ticketCategory = ticket.ticket.category;
      
      // Map roles to categories
      const roleToCategory = {
        'IT': 'IT',
        'NETWORK': 'NETWORK',
        'HR': 'HR'
      };
      
      return roleToCategory[userRole] === ticketCategory;
    }
    
    return false;
  };

  // Check if user can add comment
  const canAddComment = () => {
    if (!employeeData || !ticket?.ticket || isTicketClosed()) return false;
    
    // Admin can always comment
    if (employeeData.role === 'ADMIN') return true;
    
    // Assignee can always comment
    if (ticket.ticket.assignedTo?.id === employeeData.id) return true;
    
    // Creator can always comment
    if (ticket.ticket.createdBy?.id === employeeData.id) return true;
    
    return false;
  };

  // Check if user can see internal comments
  const canSeeInternalComments = () => {
    if (!employeeData || !ticket?.ticket) return false;
    
    // Admin can see all
    if (employeeData.role === 'ADMIN') return true;
    
    // Assignee can see internal comments
    if (ticket.ticket.assignedTo?.id === employeeData.id) return true;
    
    return false;
  };

  // Check if user can attach files
  const canAttachFiles = () => {
    if (!employeeData || !ticket?.ticket || isTicketClosed()) return false;
    
    // Admin, assignee, or creator can attach files
    const isAdmin = employeeData.role === 'ADMIN';
    const isAssignee = ticket.ticket.assignedTo?.id === employeeData.id;
    const isCreator = ticket.ticket.createdBy?.id === employeeData.id;
    
    return isAdmin || isAssignee || isCreator;
  };

  // Check if only admin can close ticket
  const canCloseTicket = () => {
    return employeeData?.role === 'ADMIN';
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!newStatus || !ticket?.ticket || newStatus === ticket.ticket.status) return;
    
    // Show warning if admin is trying to close ticket
    if (newStatus === 'CLOSED' && !showCloseWarning) {
      setShowCloseWarning(true);
      return;
    }
    
    setStatusLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchTicketDetails();
        // Add a comment about status change
        await addComment(`Status changed to ${newStatus.replace(/_/g, ' ')}`, true);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle confirm close ticket
  const handleConfirmClose = async () => {
    setShowCloseWarning(false);
    setStatusLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/status?status=CLOSED`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchTicketDetails();
        // Add a comment about closing the ticket
        await addComment(`Ticket closed by ${employeeData.name}`, true);
      } else {
        throw new Error('Failed to close ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle priority change (admin only)
  const handlePriorityChange = async () => {
    if (!canChangePriority() || !ticket?.ticket || newPriority === ticket.ticket.priority) return;
    
    setPriorityLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/priority`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        await fetchTicketDetails();
        const priorityInfo = getPriorityInfo(newPriority);
        await addComment(`Priority changed to ${priorityInfo.label}`, true);
      } else {
        throw new Error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setPriorityLoading(false);
    }
  };

  // Handle assign ticket (for non-admin users to assign to themselves)
  const handleAssignToMe = async () => {
    if (!canAssignTicket()) return;
    
    setAssignLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/assign/${employeeData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchTicketDetails();
        await addComment(`Ticket assigned to ${employeeData.name}`, true);
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle admin assign ticket (to another employee)
  const handleAdminAssign = async () => {
    if (!selectedEmployee) return;
    
    setAssignLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/assign/${selectedEmployee}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchTicketDetails();
        const assignedEmployee = availableEmployees.find(emp => emp.id === parseInt(selectedEmployee));
        await addComment(`Ticket assigned to ${assignedEmployee?.name}`, true);
        setShowAssignModal(false);
        setSelectedEmployee('');
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  // Fetch employees for admin assignment
  const fetchEmployeesForAssignment = async () => {
    if (!ticket?.ticket?.category) return;
    
    setLoadingEmployees(true);
    try {
      const token = getAuthToken();
      
      // Map ticket category to role
      const categoryToRole = {
        'IT': 'IT',
        'NETWORK': 'NETWORK',
        'HR': 'HR',
        'SOFTWARE': 'SOFTWARE_ENGINEER'
      };
      
      const role = categoryToRole[ticket.ticket.category];
      if (!role) return;
      
      const response = await fetch(`${API_BASE_URL}/employees/role/${role}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out current assignee if any
        const filteredData = data.filter(emp => emp.id !== ticket.ticket.assignedTo?.id);
        setAvailableEmployees(filteredData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Add comment
  const addComment = async (commentText, isInternalNote = false) => {
    if (!commentText.trim() || !ticket?.ticket || isTicketClosed()) return;
    
    setCommentLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/tickets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: commentText,
          isInternal: isInternalNote
        }),
      });

      if (response.ok) {
        setNewComment('');
        setIsInternal(false);
        // Refresh ticket data to get updated comments
        await fetchTicketDetails();
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (!canAttachFiles()) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload attachments
  const uploadAttachments = async () => {
    if (selectedFiles.length === 0 || !ticket?.ticket || isTicketClosed()) return;
    
    setFileUploading(true);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/tickets/${id}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSelectedFiles([]);
        // Refresh ticket data to get updated attachments
        await fetchTicketDetails();
        await addComment(`Added ${selectedFiles.length} attachment(s)`, false);
      } else {
        throw new Error('Failed to upload attachments');
      }
    } catch (error) {
      console.error('Error uploading attachments:', error);
    } finally {
      setFileUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 bytes';
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return '📎';
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    if (['mp4', 'avi', 'mov'].includes(ext)) return '🎥';
    return '📎';
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    await addComment(newComment, isInternal);
  };

  // Open assign modal for admin
  const openAssignModal = () => {
    if (isTicketClosed()) return;
    setShowAssignModal(true);
    fetchEmployeesForAssignment();
  };

  // Priority options
  const priorityOptions = [
    { value: 1, label: 'Critical' },
    { value: 2, label: 'High' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'Low' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mt-12"></div>
          <p className="mt-4 text-center text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket?.ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket not found</h3>
            <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate(`${getBasePath()}/tickets`)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTicket = ticket.ticket;
  const isClosed = isTicketClosed();
  const priorityInfo = getPriorityInfo(currentTicket.priority);
  const isAssignee = currentTicket.assignedTo?.id === employeeData?.id;
  const isCreator = currentTicket.createdBy?.id === employeeData?.id;
  const isAdmin = employeeData?.role === 'ADMIN';
  const isSoftwareEngineer = employeeData?.role === 'SOFTWARE_ENGINEER';

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`${getBasePath()}/tickets`)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </button>

        {/* Ticket Closed Banner */}
        {isClosed && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <Ban className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Ticket Closed</h3>
                <p className="text-red-700 mt-1">
                  This ticket has been closed. No further actions can be performed on it.
                  {/* {isAdmin && ' Only administrators can reopen tickets.'} */}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{currentTicket.title}</h1>
                <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                  #{currentTicket.ticketNumber}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 ${priorityInfo.color}`}>
                  {priorityInfo.icon}
                  <span>{priorityInfo.label}</span>
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(currentTicket.status)}`}>
                  {currentTicket.status.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(currentTicket.category)}`}>
                  {currentTicket.category}
                </span>
                {isClosed && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center">
                    <Ban className="w-4 h-4 mr-1" />
                    CLOSED
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{currentTicket.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created {timeAgo(currentTicket.createdAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    Created by: {currentTicket.createdBy?.name || 'N/A'} ({currentTicket.createdBy?.role?.replace('_', ' ') || 'Unknown'})
                  </span>
                </div>
                
                {currentTicket.assignedTo && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      Assigned to: {currentTicket.assignedTo.name} ({currentTicket.assignedTo.role?.replace('_', ' ')})
                    </span>
                </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-wrap gap-3">
              {/* Assign to me button (for non-admin, non-SE roles when ticket is open) */}
              {canAssignTicket() && !isAdmin && !isSoftwareEngineer && (
                <button
                  onClick={handleAssignToMe}
                  disabled={assignLoading || isClosed}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Assign to me</span>
                </button>
              )}
              
              {/* Admin assign button (only show if not assigned or admin wants to reassign) */}
              {isAdmin && !isClosed && (
                <button
                  onClick={openAssignModal}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{currentTicket.assignedTo ? 'Reassign' : 'Assign'}</span>
                </button>
              )}
              
              {/* Refresh button */}
              <button
                onClick={() => {
                  fetchTicketDetails();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status and Priority Controls */}
        {(canChangeStatus() || canChangePriority()) && !isClosed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Status Control */}
            {canChangeStatus() && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 text-blue-600 mr-2" />
                  Update Status
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                      disabled={statusLoading}
                    >
                      {filteredStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleStatusChange}
                    disabled={statusLoading || newStatus === currentTicket.status}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    <span>Update</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Current status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentTicket.status)}`}>
                    {currentTicket.status.replace(/_/g, ' ')}
                  </span>
                </p>
                {/* Show info message for non-admin users */}
                {!isAdmin && newStatus === 'CLOSED' && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Only administrators can close tickets
                  </p>
                )}
              </div>
            )}
            
            {/* Priority Control (Admin only) */}
            {canChangePriority() && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  Update Priority
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                      disabled={priorityLoading}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handlePriorityChange}
                    disabled={priorityLoading || newPriority === currentTicket.priority}
                    className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {priorityLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    <span>Update</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Current priority: <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                    {priorityInfo.label}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Comments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Comments Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                    Comments ({comments.length})
                  </h2>
                  {isClosed && (
                    <span className="text-sm text-red-600 flex items-center">
                      <Ban className="w-4 h-4 mr-1" />
                      Comments disabled for closed tickets
                    </span>
                  )}
                </div>
                {!canSeeInternalComments() && !isClosed && (
                  <p className="text-sm text-gray-500 mt-1">
                    Note: Internal comments are only visible to assignees and administrators
                  </p>
                )}
              </div>

              {/* Comments List */}
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                    <p className="text-gray-600">
                      {isClosed ? 'Ticket was closed without comments' : 'Be the first to comment on this ticket'}
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {comment.commentedBy?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{comment.commentedBy?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                              {comment.commentedBy?.role?.replace('_', ' ') || 'Unknown'} • {timeAgo(comment.commentedAt)}
                            </div>
                          </div>
                        </div>
                        {comment.isInternal && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Form */}
              {canAddComment() && !isClosed && (
                <div className="p-6 border-t border-gray-200">
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        disabled={commentLoading}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        {(isAdmin || isAssignee) && (
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isInternal}
                              onChange={(e) => setIsInternal(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-700 flex items-center">
                              <Lock className="w-4 h-4 mr-1" />
                              Internal comment
                            </span>
                          </label>
                        )}
                        
                        {/* File Upload */}
                        {canAttachFiles() && (
                          <label className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                            <Paperclip className="w-4 h-4 mr-1" />
                            <span>Attach files</span>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileSelect}
                              className="sr-only"
                              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                              disabled={fileUploading}
                            />
                          </label>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-32"
                      >
                        {commentLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send Comment</span>
                      </button>
                    </div>
                  </form>
                  
                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Files to upload ({selectedFiles.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{getFileIcon(file.name)}</span>
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
                              onClick={() => removeSelectedFile(index)}
                              className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                              disabled={fileUploading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={uploadAttachments}
                        disabled={fileUploading}
                        className="mt-3 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {fileUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                        <span>Upload {selectedFiles.length} File(s)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Attachments and Info */}
          <div className="space-y-6">
            {/* Attachments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Paperclip className="w-5 h-5 text-blue-600 mr-2" />
                    Attachments ({attachments.length})
                  </h2>
                  {isClosed && (
                    <span className="text-sm text-red-600">
                      Uploads disabled
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {attachments.length === 0 ? (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No attachments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getFileIcon(attachment.fileName)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {attachment.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy?.name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        <a
                          href={`${FILE_BASE_URL}${attachment.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  Ticket Information
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Category</div>
                  <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentTicket.category)}`}>
                    {currentTicket.category}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentTicket.status)}`}>
                    {currentTicket.status.replace(/_/g, ' ')}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Priority</div>
                  <div className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${priorityInfo.color}`}>
                    {priorityInfo.icon}
                    <span>{priorityInfo.label}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Created</div>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(currentTicket.createdAt)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Last Updated</div>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(currentTicket.updatedAt)}</div>
                </div>
                
                {currentTicket.resolvedAt && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Resolved</div>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(currentTicket.resolvedAt)}</div>
                  </div>
                )}
                
                {currentTicket.closedAt && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Closed</div>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(currentTicket.closedAt)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Permissions Info */}
            <div className={`${isClosed ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'} border rounded-xl p-6`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                Your Permissions
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                  <span>
                    <strong>View comments:</strong> {!isClosed ? 'Yes' : 'Read-only'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canAddComment() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>Add comments:</strong> {isClosed ? 'Disabled' : canAddComment() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canSeeInternalComments() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>See internal comments:</strong> {isClosed ? 'Yes' : canSeeInternalComments() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canChangeStatus() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>Change status:</strong> {isClosed ? 'Disabled' : canChangeStatus() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canChangePriority() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>Change priority:</strong> {isClosed ? 'Disabled' : canChangePriority() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canAssignTicket() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>Assign ticket:</strong> {isClosed ? 'Disabled' : canAssignTicket() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${isClosed ? 'bg-red-400' : canAttachFiles() ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>
                    <strong>Upload attachments:</strong> {isClosed ? 'Disabled' : canAttachFiles() ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0 ${canCloseTicket() ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                  <span>
                    <strong>Close ticket:</strong> {canCloseTicket() ? 'Yes (Admin only)' : 'No'}
                  </span>
                </li>
              </ul>
              {isClosed && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    <Ban className="w-4 h-4 inline mr-1" />
                    This ticket is closed. Most actions are disabled.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Assign Modal (Admin only) */}
      {showAssignModal && !isClosed && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                Assign Ticket
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee to Assign
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                  disabled={loadingEmployees}
                >
                  <option value="">Select an employee</option>
                  {availableEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role?.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                {loadingEmployees && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading employees...
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEmployee('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminAssign}
                  disabled={!selectedEmployee || assignLoading}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Assign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Ticket Warning Modal */}
      {showCloseWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Confirm Close Ticket
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Are you sure you want to close this ticket?</h4>
                    <p className="text-gray-600">
                      Closing a ticket will:
                    </p>
                    <ul className="text-gray-600 mt-2 space-y-1">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        Disable all further actions (comments, status changes, etc.)
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        Move the ticket to read-only mode
                      </li>
                      {/* <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        Only administrators can reopen closed tickets
                      </li> */}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This action is irreversible for users. 
                    {/* Once closed, only administrators can reopen the ticket. */}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCloseWarning(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClose}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Close Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;