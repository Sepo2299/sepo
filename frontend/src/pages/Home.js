import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFlask, 
  FaLaptopCode, 
  FaCar, 
  FaFilm, 
  FaNewspaper,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaSms,
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const Home = () => {
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    dob: '',
    idNumber: '',
    phone: '',
    email: '',
    course: '',
    year: '2024'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newsItems = [
    {
      id: 1,
      title: '2024 Registration Now Open',
      date: '2023-11-15',
      category: 'Registration',
      excerpt: 'Online registration for the 2024 academic year is now open. Visit the Student Kiosk to register for courses.',
      link: '/kiosk'
    },
    {
      id: 2,
      title: 'New e-Learning Platform Launched',
      date: '2023-11-10',
      category: 'e-Learning',
      excerpt: 'We have launched our new e-Learning platform with enhanced features for students and lecturers.',
      link: '/elearning'
    },
    {
      id: 3,
      title: 'Scholarship Opportunities Available',
      date: '2023-11-05',
      category: 'Scholarships',
      excerpt: 'Apply for scholarships for the 2024 academic year. Deadline: 30 November 2023.',
      link: '/about#scholarships'
    },
  ];

  const schools = [
    {
      id: 1,
      name: 'School of Science',
      icon: <FaFlask className="text-3xl text-blue-600" />,
      description: 'Explore natural sciences with cutting-edge laboratory facilities and research opportunities.',
      color: 'from-blue-50 to-white',
      courses: ['Biology', 'Chemistry', 'Physics', 'Environmental Science']
    },
    {
      id: 2,
      name: 'School of Computers',
      icon: <FaLaptopCode className="text-3xl text-green-600" />,
      description: 'Master computer technology, programming, and IT systems with industry-relevant curriculum.',
      color: 'from-green-50 to-white',
      courses: ['ICT Fundamentals', 'Web Development', 'Database Management', 'Networking']
    },
    {
      id: 3,
      name: 'School of Automotive',
      icon: <FaCar className="text-3xl text-red-600" />,
      description: 'Learn automotive engineering, driving skills, and vehicle maintenance from experts.',
      color: 'from-red-50 to-white',
      courses: ['Driving Skills', 'Vehicle Maintenance', 'Automotive Engineering', 'Road Safety']
    },
    {
      id: 4,
      name: 'School of Entertainment',
      icon: <FaFilm className="text-3xl text-purple-600" />,
      description: 'Develop creative skills in media, arts, and entertainment production.',
      color: 'from-purple-50 to-white',
      courses: ['Media Production', 'Performing Arts', 'Graphic Design', 'Digital Marketing']
    },
  ];

  const handleInputChange = (e) => {
    setApplicationForm({
      ...applicationForm,
      [e.target.name]: e.target.value
    });
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Namibia phone numbers
    if (cleaned.startsWith('264')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+264${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+264${cleaned}`;
    }
    
    return phone;
  };

  const validateForm = () => {
    const errors = [];

    if (!applicationForm.fullName.trim()) {
      errors.push('Full name is required');
    }

    if (!applicationForm.dob) {
      errors.push('Date of birth is required');
    } else {
      const dob = new Date(applicationForm.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 16) {
        errors.push('You must be at least 16 years old');
      }
    }

    if (!applicationForm.idNumber.trim()) {
      errors.push('ID/Passport number is required');
    }

    if (!applicationForm.phone.trim()) {
      errors.push('Phone number is required');
    } else {
      const phoneRegex = /^(\+264|0)?\d{9}$/;
      const cleanPhone = applicationForm.phone.replace(/\s+/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid Namibia phone number (e.g., 0812345678 or +264812345678)');
      }
    }

    if (!applicationForm.email.trim()) {
      errors.push('Email address is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(applicationForm.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!applicationForm.course) {
      errors.push('Please select a course');
    }

    return errors;
  };

const handleSubmitApplication = async (e) => {
  e.preventDefault();
  
  // Get the submit button for loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  try {
    console.log('🚀 Starting quick application...');

    // Validate required fields
    if (!applicationForm.fullName || !applicationForm.dob || 
        !applicationForm.phone || !applicationForm.email || !applicationForm.course) {
      toast.error('Please fill in all required fields (marked with *)');
      return;
    }

    // Format phone number
    const cleanPhone = applicationForm.phone.replace(/\s+/g, '');
    
    // Prepare data EXACTLY like Kiosk page
    const applicationData = {
  full_name: applicationForm.fullName,
  date_of_birth: applicationForm.dob,
  id_number: applicationForm.idNumber || null,  // Use null instead of ''
  phone: cleanPhone,
  email: applicationForm.email.toLowerCase(),
  intended_course: applicationForm.course,
  planned_year: parseInt(applicationForm.year),
  is_quick_application: true,
  // Make sure all optional fields are null, not undefined
  nationality: 'Namibian',
  gender: null,  // Explicit null
  address: null,  // Explicit null
  emergency_contact: null,  // Explicit null
  highest_qualification: null,  // Explicit null
  institution: null,  // Explicit null
  year_completed: null,  // Explicit null
  results: null,  // Explicit null
  study_mode: 'full-time'
  
};
    console.log('📤 Sending to backend:', applicationData);

    // USE THE EXACT SAME APPROACH AS KIOSK PAGE
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });

    console.log('📥 Response status:', response.status);

    // First read the response as text to debug
    const responseText = await response.text();
    console.log('📥 Response text:', responseText);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', responseText);
      throw new Error('Server returned invalid JSON');
    }
    
    console.log('📊 Parsed response:', result);
    
    if (response.ok && result.success) {
      // Check if it's a quick application (has student_number)
      if (result.student_number && result.password) {
        // Quick application success
        toast.success(
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-3">
              <FaCheckCircle className="text-green-500 text-xl mr-2" />
              <h3 className="font-bold text-green-800 text-lg">Application Successful!</h3>
            </div>
            <div className="mb-4">
              <p className="mb-2"><strong>Student Number:</strong></p>
              <div className="bg-white p-3 rounded border border-green-300 font-mono font-bold text-blue-700 text-lg">
                {result.student_number}
              </div>
              <p className="mt-3 mb-2"><strong>Temporary Password:</strong></p>
              <div className="bg-white p-3 rounded border border-green-300 font-mono font-bold text-red-700 text-lg">
                {result.password}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              <p className="mb-1">📧 Credentials have been sent to your email.</p>
              <p>⚠️ Change your password after first login.</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Student Number: ${result.student_number}\nPassword: ${result.password}`);
                toast.success('Credentials copied to clipboard!');
              }}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy Credentials
            </button>
          </div>,
          { 
            duration: 15000,
            position: 'top-center'
          }
        );

        // Reset form
        setApplicationForm({
          fullName: '',
          dob: '',
          idNumber: '',
          phone: '',
          email: '',
          course: '',
          year: '2024'
        });

      } else {
        // Regular application response (shouldn't happen here)
        toast.success('Application submitted successfully!');
      }
    } else {
      toast.error(`❌ ${result.error || result.message || 'Application failed'}`);
    }
  } catch (error) {
    console.error('💥 Application error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      toast.error('🌐 Cannot connect to server. Make sure backend is running on http://localhost:5000');
    } else if (error.message.includes('invalid JSON')) {
      toast.error('⚠️ Server returned invalid response. Check backend logs.');
    } else {
      toast.error(`❌ ${error.message}`);
    }
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to <span className="text-blue-300">Sepo College</span>
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              The Premier College of Science and Technology in Namibia. 
              Empowering students with practical skills and theoretical knowledge for a successful career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#quick-application" 
                className="btn-primary inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              >
                Apply Now <FaArrowRight className="ml-2" />
              </a>
              <Link to="/schools" className="btn-secondary text-white border-white hover:bg-white/10">
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Application Form */}
      <section id="quick-application" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Quick Application Form</h2>
                <p className="text-gray-600">
                  Start your journey with Sepo College. Get your student number instantly via email/SMS!
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <span className="flex items-center text-green-600">
                    <FaEnvelope className="mr-2" /> Instant Email
                  </span>
                  <span className="flex items-center text-blue-600">
                    <FaSms className="mr-2" /> SMS Notification
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={applicationForm.dob}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      ID/Passport Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={applicationForm.idNumber}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="ID/Passport Number"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={applicationForm.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="0812345678 or +264812345678"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">Namibia format only</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={applicationForm.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Course of Interest <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course"
                      value={applicationForm.course}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select a course</option>
                      <option value="science">Natural Sciences</option>
                      <option value="computers">Computer Technology</option>
                      <option value="automotive">Automotive Engineering</option>
                      <option value="entertainment">Entertainment Arts</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Planned Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    value={applicationForm.year}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 mb-1">What happens next?</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Instant student number generation</li>
                        <li>• Email with login credentials sent immediately</li>
                        <li>• SMS notification with student number</li>
                        <li>• Direct access to e-Learning portal</li>
                        <li>• Complete registration in Student Kiosk</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full btn-primary py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Processing Application...
                    </>
                  ) : (
                    'Submit Quick Application'
                  )}
                </button>
                
                <div className="text-center text-sm text-gray-600 pt-4 border-t">
                  <p className="mb-2">
                    Already have an account?{' '}
                    <Link to="/elearning" className="text-blue-600 hover:underline font-medium">
                      Login to e-Learning →
                    </Link>
                  </p>
                  <p>
                    Need a detailed application?{' '}
                    <Link to="/kiosk" className="text-blue-600 hover:underline font-medium">
                      Go to Student Kiosk →
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="page-title">Our Schools & Faculties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sepo College offers specialized programs across four main schools, 
              each dedicated to excellence in their respective fields.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {schools.map((school) => (
              <div 
                key={school.id}
                className={`bg-gradient-to-b ${school.color} rounded-xl p-6 shadow-lg border border-gray-100 
                           hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
              >
                <div className="mb-6">
                  {school.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{school.name}</h3>
                <p className="text-gray-600 mb-6">{school.description}</p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Popular Courses:</h4>
                  <ul className="space-y-1">
                    {school.courses.map((course, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                        {course}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link 
                  to={`/schools/${school.name.toLowerCase().replace('school of ', '').replace(' ', '')}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Learn More <FaArrowRight className="ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Announcements */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="page-title">Latest News & Announcements</h2>
              <p className="text-gray-600">Stay updated with college news and important announcements</p>
            </div>
            <Link to="/about#news" className="text-blue-600 hover:text-blue-700 font-medium">
              View All News →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((news) => (
              <div key={news.id} className="card hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <FaNewspaper className="text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {news.category}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">{news.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{news.title}</h3>
                <p className="text-gray-600 mb-6">{news.excerpt}</p>
                <Link to={news.link} className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                  Read More <FaArrowRight className="ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="page-title text-center mb-12">Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* e-Learning Card */}
            <div className="card border-t-4 border-blue-500 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FaUserGraduate className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">e-Learning Portal</h3>
                  <p className="text-gray-600 text-sm">Access course materials online</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Login to access course materials, submit assignments, take tests, and communicate with lecturers.
              </p>
              <div className="space-y-4">
                <Link to="/elearning" className="block w-full text-center btn-primary">
                  Student Login
                </Link>
                <Link to="/elearning#lecturer" className="block w-full text-center btn-secondary">
                  Lecturer Login
                </Link>
              </div>
            </div>

            {/* Student Kiosk Card */}
            <div className="card border-t-4 border-green-500 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <FaUserGraduate className="text-green-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Student Kiosk</h3>
                  <p className="text-gray-600 text-sm">Applications & Registrations</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Complete your application, register for courses, and access your student documents.
              </p>
              <div className="space-y-4">
                <Link to="/kiosk#application" className="block w-full text-center bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all">
                  Full Application
                </Link>
                <Link to="/kiosk#registration" className="block w-full text-center border-2 border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 transition-all">
                  Student Registration
                </Link>
              </div>
            </div>

            {/* Lecturer Portal Card */}
            <div className="card border-t-4 border-purple-500 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <FaChalkboardTeacher className="text-purple-600 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lecturer Portal</h3>
                  <p className="text-gray-600 text-sm">Course Management</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Upload course materials, manage assignments, and communicate with students.
              </p>
              <div className="space-y-4">
                <Link to="/elearning#lecturer" className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-700 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-800 transition-all">
                  Lecturer Login
                </Link>
                <Link to="/contact" className="block w-full text-center border-2 border-purple-600 text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition-all">
                  Contact Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful graduates from Sepo College. 
            Apply today and receive your student number instantly!
          </p>
          <a 
            href="#quick-application" 
            className="inline-flex items-center bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Apply Now <FaArrowRight className="ml-2" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;