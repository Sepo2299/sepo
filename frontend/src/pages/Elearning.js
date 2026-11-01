import React, { useState, useEffect } from 'react';
import { 
  FaSignInAlt, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaDownload,
  FaUpload,
  FaComments,
  FaCalendarAlt,
  FaFilePdf,
  FaVideo,
  FaTasks,
  FaLock,
  FaUser,
  FaSpinner,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaChartLine,
  FaCertificate,
  FaClock,
  FaBell,
  FaCog,
  FaHome
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Elearning = () => {
  const [isStudentLogin, setIsStudentLogin] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: '',
    userType: 'student'
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('');
  const [userData, setUserData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);
      setUserData(parsedUser);
      setUserType(parsedUser.role);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      fetchUserData();
    }
  }, []);

  // Fetch user data after login
  useEffect(() => {
    if (isLoggedIn && userType === 'student') {
      fetchStudentData();
    }
  }, [isLoggedIn, userType]);

  const handleLoginChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: loginCredentials.username.trim(),
        password: loginCredentials.password,
        userType: loginCredentials.userType
      });

      if (response.data.success) {
        const { token, user, student } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set state
        setIsLoggedIn(true);
        setUserData(user);
        setUserType(user.role);
        
        if (student) {
          setStudentData(student);
        }
        
        toast.success(`Welcome back, ${user.full_name}!`);
        
        // Reset login form
        setLoginCredentials({
          username: '',
          password: '',
          userType: loginCredentials.userType
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch dashboard data
      const dashboardRes = await axios.get(`${API_URL}/students/dashboard`);
      if (dashboardRes.data.success) {
        setStudentData(dashboardRes.data.student);
        setCourses(dashboardRes.data.courses || []);
        setAssignments(dashboardRes.data.upcoming_assignments || []);
        setGrades(dashboardRes.data.recent_grades || []);
        setDashboardStats(dashboardRes.data.dashboard || {});
      }
      
      // Fetch courses for e-learning display
      const coursesRes = await axios.get(`${API_URL}/students/courses/me`);
      if (coursesRes.data.success) {
        // Use the enriched courses data
        setCourses(coursesRes.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Token might be expired, log user out
      handleLogout();
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setIsLoggedIn(false);
    setUserData(null);
    setStudentData(null);
    setUserType('');
    setCourses([]);
    setAssignments([]);
    setGrades([]);
    setDashboardStats(null);
    setLoginCredentials({
      username: '',
      password: '',
      userType: 'student'
    });
    
    toast.success('Logged out successfully');
  };

  const handleFileUpload = () => {
    toast.success('File uploaded successfully!');
  };

  if (!isLoggedIn) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
              <h1 className="page-title">e-Learning Portal</h1>
              <p className="text-gray-600">Secure access to course materials and resources</p>
            </div>
            
            {/* Login Type Selection */}
            <div className="flex border-b mb-8">
              <button
                onClick={() => {
                  setIsStudentLogin(true);
                  setLoginCredentials({...loginCredentials, userType: 'student'});
                }}
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  isStudentLogin 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaUserGraduate className="inline mr-2" />
                Student Login
              </button>
              <button
                onClick={() => {
                  setIsStudentLogin(false);
                  setLoginCredentials({...loginCredentials, userType: 'lecturer'});
                }}
                className={`flex-1 py-4 font-medium text-center transition-colors ${
                  !isStudentLogin 
                    ? 'border-b-2 border-green-600 text-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaChalkboardTeacher className="inline mr-2" />
                Lecturer Login
              </button>
            </div>
            
            {/* Login Form */}
            <div className="card">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {isStudentLogin ? 'Student Number or Email' : 'Username or Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={loginCredentials.username}
                      onChange={handleLoginChange}
                      className="input-field pl-10"
                      placeholder={isStudentLogin ? "SEPO2024001 or student@email.com" : "lecturer_john or lecturer@email.com"}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={loginCredentials.password}
                      onChange={handleLoginChange}
                      className="input-field pl-10"
                      placeholder="Enter password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    type="hidden"
                    name="userType"
                    value={loginCredentials.userType}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => toast.info('Contact ICT department for password reset')}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="inline mr-2" />
                      Login to e-Learning
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    {isStudentLogin ? (
                      <>
                        Don't have an account? 
                        <a href="/#quick-application" className="text-blue-600 hover:underline ml-1 font-medium">
                          Apply for admission
                        </a>
                      </>
                    ) : (
                      <>
                        Need a lecturer account? 
                        <a href="mailto:admin@sepocollege.com.na" className="text-blue-600 hover:underline ml-1 font-medium">
                          Contact Administrator
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </form>
              
              {/* Login Help */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FaLock className="text-blue-500 mr-2" />
                  Login Help
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FaUserGraduate className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-800">Students:</strong> Use your <span className="font-mono font-bold">Student Number</span> 
                      or <span className="font-mono font-bold">Email</span> and the password from your welcome email.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaChalkboardTeacher className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-800">Lecturers:</strong> Use your assigned username/email and password.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaEnvelope className="text-purple-500 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      Contact ICT department for login issues: 
                      <a href="mailto:ict@sepocollege.com.na" className="text-blue-600 hover:underline ml-1">
                        ict@sepocollege.com.na
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Quick Application CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Ready to become a student?</p>
              <a 
                href="/#quick-application" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all shadow-md"
              >
                Apply Now - Get Instant Access
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in View
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="page-title">
              Welcome back, {userData?.full_name || 'Student'}!
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {userType === 'student' && studentData?.student_number && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <FaIdCard className="mr-2" />
                  {studentData.student_number}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <FaUserGraduate className="mr-2" />
                {userType === 'student' ? 'Student' : 'Lecturer'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                <FaEnvelope className="mr-2" />
                {userData?.email}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center">
              <FaHome className="mr-2" />
              Home
            </Link>
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition flex items-center">
              <FaCog className="mr-2" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center"
            >
              <FaSignInAlt className="mr-2 transform rotate-180" />
              Logout
            </button>
          </div>
        </div>

        {userType === 'student' ? (
          /* Student Dashboard */
          <div className="space-y-8">
            {/* Dashboard Stats */}
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-3 rounded-lg mr-4">
                      <FaBook className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.total_courses || courses.length}</h3>
                      <p className="text-gray-600">Enrolled Courses</p>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="flex items-center">
                    <div className="bg-green-500 p-3 rounded-lg mr-4">
                      <FaTasks className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.pending_assignments || 0}</h3>
                      <p className="text-gray-600">Pending Assignments</p>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                  <div className="flex items-center">
                    <div className="bg-yellow-500 p-3 rounded-lg mr-4">
                      <FaChartLine className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.average_grade || 0}%</h3>
                      <p className="text-gray-600">Average Grade</p>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-3 rounded-lg mr-4">
                      <FaClock className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.completed_assignments || 0}</h3>
                      <p className="text-gray-600">Completed Work</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Courses */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="section-title">My Courses</h2>
                <span className="text-gray-600">
                  {isLoadingData ? 'Loading...' : `${courses.length} courses`}
                </span>
              </div>
              
              {isLoadingData ? (
                <div className="card text-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading your courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="card text-center py-12">
                  <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                  <button className="btn-primary">
                    Browse Available Courses
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {course.code}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mt-2">{course.name}</h3>
                          <p className="text-gray-600 text-sm">Instructor: {course.instructor || 'TBA'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{course.progress || 0}%</div>
                          <div className="text-sm text-gray-500">Progress</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                      
                      {/* Course Materials */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 flex items-center">
                          <FaBook className="mr-2" />
                          Course Materials
                        </h4>
                        {course.materials && course.materials.slice(0, 3).map((material, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {material.type === 'outline' && <FaFilePdf className="text-blue-500 mr-3" />}
                              {material.type === 'unit' && <FaBook className="text-green-500 mr-3" />}
                              {material.type === 'assignment' && <FaTasks className="text-yellow-500 mr-3" />}
                              {material.type === 'test' && <FaFilePdf className="text-red-500 mr-3" />}
                              {material.type === 'textbook' && <FaBook className="text-purple-500 mr-3" />}
                              {material.type === 'video' && <FaVideo className="text-pink-500 mr-3" />}
                              <div>
                                <p className="font-medium text-gray-900">{material.name}</p>
                                <p className="text-sm text-gray-500">
                                  {material.dueDate ? `Due: ${material.dueDate}` : `Posted: ${material.date}`}
                                  {material.submitted !== undefined && (
                                    <span className={`ml-2 ${material.submitted ? 'text-green-600' : 'text-red-600'}`}>
                                      {material.submitted ? 'Submitted' : 'Pending'}
                                    </span>
                                  )}
                                  {material.score && (
                                    <span className="ml-2 text-blue-600">Score: {material.score}%</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700">
                              <FaDownload />
                            </button>
                          </div>
                        ))}
                        {course.materials && course.materials.length > 3 && (
                          <div className="text-center">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              View {course.materials.length - 3} more materials →
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <button className="flex-1 btn-primary py-2">
                          <FaUpload className="inline mr-2" />
                          Submit Work
                        </button>
                        <button className="flex-1 btn-secondary py-2">
                          <FaComments className="inline mr-2" />
                          Discussion
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div>
              <h2 className="section-title mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="card text-center hover:shadow-lg transition-all p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUpload className="text-3xl text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Submit Assignment</h3>
                  <p className="text-sm text-gray-600 mt-2">Upload your completed work</p>
                </button>
                
                <button className="card text-center hover:shadow-lg transition-all p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaDownload className="text-3xl text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Download Materials</h3>
                  <p className="text-sm text-gray-600 mt-2">Course notes and resources</p>
                </button>
                
                <button className="card text-center hover:shadow-lg transition-all p-6">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-3xl text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Class Discussion</h3>
                  <p className="text-sm text-gray-600 mt-2">Chat with classmates</p>
                </button>
                
                <button className="card text-center hover:shadow-lg transition-all p-6">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCalendarAlt className="text-3xl text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Schedule</h3>
                  <p className="text-sm text-gray-600 mt-2">View timetable</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Lecturer Dashboard */
          <div className="space-y-8">
            {/* Lecturer Courses */}
            <div>
              <h2 className="section-title mb-6">My Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample lecturer courses - in real app, fetch from API */}
                {[
                  {
                    id: 1,
                    code: 'CSC101',
                    name: 'Introduction to Computer Technology',
                    students: 45,
                    materials: 12,
                    assignments: 3
                  },
                  {
                    id: 2,
                    code: 'CSC102',
                    name: 'Software Development',
                    students: 32,
                    materials: 8,
                    assignments: 2
                  },
                  {
                    id: 3,
                    code: 'CSC201',
                    name: 'Database Systems',
                    students: 28,
                    materials: 10,
                    assignments: 4
                  }
                ].map((course) => (
                  <div key={course.id} className="card hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {course.code}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-2">{course.name}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{course.students}</div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{course.materials}</div>
                        <div className="text-sm text-gray-600">Materials</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{course.assignments}</div>
                        <div className="text-sm text-gray-600">Assignments</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={handleFileUpload}
                        className="w-full btn-primary py-2"
                      >
                        <FaUpload className="inline mr-2" />
                        Upload Material
                      </button>
                      <button className="w-full btn-secondary py-2">
                        <FaComments className="inline mr-2" />
                        Student Messages
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                        <FaTasks className="inline mr-2" />
                        Grade Assignments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upload Section */}
            <div className="card">
              <h2 className="section-title mb-6">Upload Course Material</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Course</label>
                    <select className="input-field">
                      <option>Select Course</option>
                      <option>CSC101 - Introduction to Computer Technology</option>
                      <option>CSC102 - Software Development</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Material Type</label>
                    <select className="input-field">
                      <option>Select Type</option>
                      <option>Course Unit</option>
                      <option>Assignment</option>
                      <option>Test/Quiz</option>
                      <option>Textbook</option>
                      <option>Video Lecture</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Title</label>
                  <input type="text" className="input-field" placeholder="Enter material title" />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea className="input-field h-32" placeholder="Enter description"></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag & drop files here or click to browse</p>
                    <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                    <input type="file" className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="inline-block mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                      Choose File
                    </label>
                  </div>
                </div>
                
                <button 
                  onClick={handleFileUpload}
                  className="w-full btn-primary py-3"
                >
                  <FaUpload className="inline mr-2" />
                  Upload Material
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Elearning;