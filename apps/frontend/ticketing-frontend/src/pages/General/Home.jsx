import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight,
  Building,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Workflow,
  Zap,
  Cpu,
  Globe,
  Award,
  CheckCircle,
  Server,
  Headphones,
  Calendar,
  FileText,
  Settings,
  Menu,
  X,
  Mail,
  Users,
  Shield,
  BarChart3,
  Clock,
  MessageSquare,
  Ticket as TicketIcon
} from 'lucide-react';

// Import your company assets
import { COMPANY_LOGO, COMPANY_NAME } from '../../config.js'
const productName = "FlowTix Pro";

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Features data
  const features = [
    {
      icon: <Workflow className="w-10 h-10" />,
      title: 'Intelligent Workflow Automation',
      description: 'AI-powered ticket routing and smart assignment algorithms reduce manual work by 70%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: '70% faster resolution'
    },
    {
      icon: <ShieldCheck className="w-10 h-10" />,
      title: 'Enterprise-Grade Security',
      description: 'SOC 2 Type II certified with end-to-end encryption and role-based access control',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      stats: '99.99% uptime SLA'
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: 'Advanced Analytics Suite',
      description: 'Real-time dashboards with predictive insights and custom reporting capabilities',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: '150+ metrics tracked'
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: 'Team Collaboration Hub',
      description: 'Unified workspace with shared notes, file management, and team communication tools',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: '10K+ teams onboarded'
    }
  ];

  // Client logos
  const clients = [
    { name: 'TechCorp Inc.', icon: <Server className="w-8 h-8" />, color: 'text-gray-700' },
    { name: 'Global Finance', icon: <Building className="w-8 h-8" />, color: 'text-blue-600' },
    { name: 'HealthFirst', icon: <Shield className="w-8 h-8" />, color: 'text-emerald-600' },
    { name: 'EduTech Systems', icon: <Cpu className="w-8 h-8" />, color: 'text-purple-600' },
    { name: 'Retail Giant', icon: <Globe className="w-8 h-8" />, color: 'text-orange-600' }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'IT Director, TechCorp Inc.',
      content: `${productName} reduced our average ticket resolution time from 48 hours to just 6 hours. The ROI was immediate.`,
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager, Global Finance',
      content: 'The analytics dashboard helped us identify bottlenecks we never knew existed. Game-changer for our support team.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Customer Support Lead, HealthFirst',
      content: 'Implementation was seamless, and our team adapted immediately. The automation features are brilliant.',
      rating: 5
    }
  ];

  // Industries served
  const industries = [
    { name: 'Technology', icon: <Cpu className="w-6 h-6" />, count: '850+' },
    { name: 'Healthcare', icon: <Shield className="w-6 h-6" />, count: '420+' },
    { name: 'Finance', icon: <Building className="w-6 h-6" />, count: '380+' },
    { name: 'Education', icon: <FileText className="w-6 h-6" />, count: '290+' },
    { name: 'Retail', icon: <Globe className="w-6 h-6" />, count: '540+' },
    { name: 'Manufacturing', icon: <Settings className="w-6 h-6" />, count: '320+' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Fixed Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-100' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-md">
                <img 
                  src={COMPANY_LOGO} 
                  alt={`${COMPANY_NAME} Logo`}
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {COMPANY_NAME}
                </span>
                <div className="text-xs text-blue-600 font-medium hidden sm:block">Enterprise Solutions</div>
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center space-x-8 mx-8 flex-1 justify-center">
              {/* <a href="#solutions" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Solutions
              </a> */}
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Features
              </a>
              <a href="#industries" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Industries
              </a>
              <a href="#clients" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                Clients
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium text-sm">
                About
              </a>
            </div>

            {/* Employee Login Button */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <Link 
                to="/employees/login"
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
              >
                <span>Employee Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 ml-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
  
              <a 
                href="#features" 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#industries" 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Industries
              </a>
              <a 
                href="#clients" 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clients
              </a>
              <a 
                href="#about" 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <Link 
                to="/employees/login"
                className="block py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Employee Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6">
                <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">Trusted by 2,400+ organizations worldwide</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="text-gray-900">Streamline Support with</span>
                <span className="block text-blue-600">{productName}</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                {COMPANY_NAME} delivers enterprise-grade ticketing solutions that transform 
                how organizations manage support requests, boost team productivity, and 
                deliver exceptional service experiences.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/employees/login"
                  className="group px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-sm sm:text-base"
                >
                  <span>Access Employee Portal</span>
                  <ArrowRight className="ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
                <a 
                  href="#contact"
                  className="px-6 py-3.5 bg-white text-blue-600 font-semibold rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 text-sm sm:text-base text-center"
                >
                  Contact Sales
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">15K+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Daily Tickets</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">4.8/5</div>
                  <div className="text-xs sm:text-sm text-gray-600">Satisfaction</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">47min</div>
                  <div className="text-xs sm:text-sm text-gray-600">Avg. Resolution</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xl">
                {/* Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">{productName} Dashboard</div>
                      <div className="text-xs sm:text-sm text-gray-500">Live ticket monitoring</div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                      <div className="text-base sm:text-lg font-bold text-gray-900">142</div>
                      <div className="text-xs text-gray-600">Active Tickets</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                      <div className="text-base sm:text-lg font-bold text-gray-900">94%</div>
                      <div className="text-xs text-gray-600">SLA Compliance</div>
                    </div>
                  </div>

                  {/* Ticket List Preview */}
                  <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              i === 1 ? 'bg-red-500' : 
                              i === 2 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">INC-2024-00{i}29</span>
                          </div>
                          <span className="text-xs text-gray-500">Priority {i === 1 ? 'High' : 'Medium'}</span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Network connectivity issue • IT Department</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section id="clients" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Trusted By Industry Leaders
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">Powering support operations across multiple sectors</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {clients.map((client, index) => (
              <div key={index} className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-2 sm:p-3 rounded-lg ${client.color} mb-2 sm:mb-3`}>
                  {client.icon}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 text-center">{client.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for scale, security, and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                className={`relative bg-white rounded-xl border p-4 sm:p-6 transition-all duration-300 ${
                  activeFeature === index 
                    ? 'border-blue-300 shadow-xl scale-105' 
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-lg ${feature.bgColor} ${feature.color} w-fit mb-3 sm:mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                <div className="text-xs sm:text-sm font-medium text-blue-600">{feature.stats}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Industry Solutions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored implementations for diverse business sectors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg">
                      {industry.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{industry.name}</h3>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-blue-600">{industry.count} clients</span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Custom workflows and compliance features tailored for {industry.name.toLowerCase()} sector requirements.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Client Success Stories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading organizations transformed their support operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                About {COMPANY_NAME}
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Founded in 2015, {COMPANY_NAME} has been at the forefront of enterprise 
                support management innovation. Our mission is to empower organizations 
                with intelligent tools that streamline operations and enhance service delivery.
              </p>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                With over 2,400 organizations relying on our solutions, we've built a 
                reputation for reliability, security, and exceptional customer support.
              </p>
              
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">ISO 27001 Certified</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">24/7 Enterprise Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Global Data Centers</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-full mb-4 sm:mb-6">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Schedule a Consultation</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Speak with our solutions team about implementing {productName} for your organization.
                </p>
                <a 
                  href="#contact"
                  className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  Contact Our Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <img 
                    src={COMPANY_LOGO} 
                    alt={`${COMPANY_NAME} Logo`}
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold">{COMPANY_NAME}</div>
                  <div className="text-xs sm:text-sm text-blue-300">Enterprise Solutions</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                Transforming support operations with intelligent ticketing solutions since 2015.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Solutions</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">IT Service Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HR Service Desk</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facilities Management</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News & Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Employee Portal</h4>
              <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                Access your organization's support management system.
              </p>
              <Link 
                to="/employees/login"
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                Employee Login
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 text-center text-gray-500 text-xs sm:text-sm">
            <p>© 2024 {COMPANY_NAME}. All rights reserved. | <a href="#" className="hover:text-gray-300">Privacy Policy</a> | <a href="#" className="hover:text-gray-300">Terms of Service</a></p>
            <p className="mt-1 sm:mt-2">{productName} is a registered product of {COMPANY_NAME}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;