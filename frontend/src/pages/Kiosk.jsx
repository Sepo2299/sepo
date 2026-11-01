import React, { useState } from 'react';
import { 
  FaUserGraduate, 
  FaFileAlt, 
  FaClipboardCheck, 
  FaDownload,
  FaUpload,
  FaIdCard,
  FaGraduationCap,
  FaCalendar,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Kiosk = () => {
  const [activeTab, setActiveTab] = useState('application');
  const [applicationForm, setApplicationForm] = useState({
    personalInfo: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      idNumber: '',
      nationality: '',
      maritalStatus: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      emergencyContact: ''
    },
    education: {
      highestQualification: '',
      institution: '',
      yearCompleted: '',
      results: ''
    },
    program: {
      intendedCourse: '',
      plannedYear: String(new Date().getFullYear()+1),
      studyMode: 'full-time',
      previousApplication: 'no'
    },
    documents: []
  });

  const [registrationForm, setRegistrationForm] = useState({
    studentNumber: '',
    password: '',
    courses: [],
    paymentMethod: '',
    termsAccepted: false
  });

  const courses = [
    { id: 1, code: 'CSC101', name: 'Introduction to Computer Technology', credits: 3 },
    { id: 2, code: 'CSC102', name: 'Software Development', credits: 4 },
    { id: 3, code: 'SCI101', name: 'Biology Fundamentals', credits: 3 },
    { id: 4, code: 'SCI102', name: 'Chemistry Basics', credits: 3 },
    { id: 5, code: 'AUT101', name: 'Basic Driving Skills', credits: 2 },
    { id: 6, code: 'ENT101', name: 'Media Production', credits: 3 },
  ];

  const studentDocuments = [
    { id: 1, name: 'Personal Information', type: 'pdf', date: '2023-10-15' },
    { id: 2, name: 'Proof of Registration', type: 'pdf', date: '2023-10-10' },
    { id: 3, name: 'Academic Results - Semester 1', type: 'pdf', date: '2023-07-20' },
    { id: 4, name: 'Examination Time-table', type: 'pdf', date: '2023-10-25' },
    { id: 5, name: 'Fee Statement', type: 'pdf', date: '2023-10-05' },
  ];

  const handleApplicationInputChange = (section, field, value) => {
    setApplicationForm({
      ...applicationForm,
      [section]: {
        ...applicationForm[section],
        [field]: value
      }
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setApplicationForm({
      ...applicationForm,
      documents: [...applicationForm.documents, ...files]
    });
    toast.success(`${files.length} file(s) added`);
  };

  const handleCourseSelection = (courseId) => {
    const isSelected = registrationForm.courses.includes(courseId);
    setRegistrationForm({
      ...registrationForm,
      courses: isSelected 
        ? registrationForm.courses.filter(id => id !== courseId)
        : [...registrationForm.courses, courseId]
    });
  };

  const handleSubmitApplication = async (e) => {
  e.preventDefault();
  
  // Add loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    
    // Validate
    if (!applicationForm.personalInfo.fullName || 
        !applicationForm.contactInfo.phone || 
        !applicationForm.contactInfo.email || 
        !applicationForm.program.intendedCourse) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prepare data - match EXACTLY what your model expects
    const applicationData = {
      full_name: applicationForm.personalInfo.fullName,
      date_of_birth: applicationForm.personalInfo.dateOfBirth || '',
      id_number: applicationForm.personalInfo.idNumber || '',
      nationality: applicationForm.personalInfo.nationality || 'Namibian',
      gender: applicationForm.personalInfo.gender || '',
      phone: applicationForm.contactInfo.phone,
      email: applicationForm.contactInfo.email,
      address: applicationForm.contactInfo.address,
      emergency_contact: applicationForm.contactInfo.emergencyContact || '',
      highest_qualification: applicationForm.education.highestQualification || '',
      institution: applicationForm.education.institution || '',
      year_completed: parseInt(applicationForm.education.yearCompleted) || new Date().getFullYear(),
      results: applicationForm.education.results || '',
      intended_course: applicationForm.program.intendedCourse,
      planned_year: parseInt(applicationForm.program.plannedYear) || new Date().getFullYear(),
      study_mode: applicationForm.program.studyMode || 'full-time'
    };


    // Use relative URL with proxy
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData)
    });

    
    const result = await response.json();
    
    if (response.ok && result.success) {
      toast.success(`✅ Application submitted! Your number: ${result.application_number || result.application?.application_number}`);
      
      // Reset form
      setApplicationForm({
        personalInfo: { fullName: '', dateOfBirth: '', gender: '', idNumber: '', nationality: '', maritalStatus: '' },
        contactInfo: { phone: '', email: '', address: '', emergencyContact: '' },
        education: { highestQualification: '', institution: '', yearCompleted: '', results: '' },
        program: { intendedCourse: '', plannedYear: String(new Date().getFullYear()+1), studyMode: 'full-time', previousApplication: 'no' },
        documents: []
      });
    } else {
      toast.error(`❌ ${result.error || result.message || 'Submission failed'}`);
    }
  } catch (error) {
    console.error('💥 Submission error:', error);
    toast.error('🌐 Network error. Check console for details.');
  } finally {
    // Restore button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    if (registrationForm.courses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }
    if (!registrationForm.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    toast.success('Registration completed successfully!');
  };

  const renderApplicationForm = () => (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="w-32 h-1 bg-blue-600"></div>
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="w-32 h-1 bg-blue-600"></div>
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="w-32 h-1 bg-blue-600"></div>
          <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
            4
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitApplication} className="space-y-8">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FaIdCard className="mr-3 text-blue-500" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={applicationForm.personalInfo.fullName}
                onChange={(e) => handleApplicationInputChange('personalInfo', 'fullName', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date of Birth *</label>
              <input
                type="date"
                value={applicationForm.personalInfo.dateOfBirth}
                onChange={(e) => handleApplicationInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Gender *</label>
              <select
                value={applicationForm.personalInfo.gender}
                onChange={(e) => handleApplicationInputChange('personalInfo', 'gender', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">ID/Passport Number *</label>
              <input
                type="text"
                value={applicationForm.personalInfo.idNumber}
                onChange={(e) => handleApplicationInputChange('personalInfo', 'idNumber', e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FaPhone className="mr-3 text-green-500" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={applicationForm.contactInfo.phone}
                onChange={(e) => handleApplicationInputChange('contactInfo', 'phone', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={applicationForm.contactInfo.email}
                onChange={(e) => handleApplicationInputChange('contactInfo', 'email', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2">Physical Address *</label>
              <textarea
                value={applicationForm.contactInfo.address}
                onChange={(e) => handleApplicationInputChange('contactInfo', 'address', e.target.value)}
                className="input-field"
                rows="3"
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FaGraduationCap className="mr-3 text-purple-500" />
            Educational Background
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Highest Qualification *</label>
              <select
                value={applicationForm.education.highestQualification}
                onChange={(e) => handleApplicationInputChange('education', 'highestQualification', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Qualification</option>
                <option value="grade12">Grade 12 Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Degree</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Institution *</label>
              <input
                type="text"
                value={applicationForm.education.institution}
                onChange={(e) => handleApplicationInputChange('education', 'institution', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Year Completed *</label>
              <input
                type="number"
                min="1990"
                max="2023"
                value={applicationForm.education.yearCompleted}
                onChange={(e) => handleApplicationInputChange('education', 'yearCompleted', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Results/Average *</label>
              <input
                type="text"
                value={applicationForm.education.results}
                onChange={(e) => handleApplicationInputChange('education', 'results', e.target.value)}
                className="input-field"
                placeholder="e.g., 25 points, 65%"
                required
              />
            </div>
          </div>
        </div>

        {/* Program Selection */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FaCalendar className="mr-3 text-red-500" />
            Program Selection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Intended Course *</label>
              <select
                value={applicationForm.program.intendedCourse}
                onChange={(e) => handleApplicationInputChange('program', 'intendedCourse', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Course</option>
                <option value="science">Natural Sciences</option>
                <option value="computers">Computer Technology</option>
                <option value="automotive">Automotive Engineering</option>
                <option value="entertainment">Entertainment Arts</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Planned Year *</label>
              <select
                value={applicationForm.program.plannedYear}
                onChange={(e) => handleApplicationInputChange('program', 'plannedYear', e.target.value)}
                className="input-field"
                required
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Study Mode *</label>
              <select
                value={applicationForm.program.studyMode}
                onChange={(e) => handleApplicationInputChange('program', 'studyMode', e.target.value)}
                className="input-field"
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Previous Application to Sepo College?</label>
              <select
                value={applicationForm.program.previousApplication}
                onChange={(e) => handleApplicationInputChange('program', 'previousApplication', e.target.value)}
                className="input-field"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FaUpload className="mr-3 text-yellow-500" />
            Required Documents
          </h3>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload required documents (PDF, JPEG, PNG)</p>
              <p className="text-sm text-gray-500 mb-4">Required: ID Copy, Qualifications, Passport Photo</p>
              <input
                type="file"
                id="documents-upload"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="documents-upload" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                Choose Files
              </label>
            </div>
            
            {applicationForm.documents.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Uploaded Documents:</h4>
                <div className="space-y-2">
                  {applicationForm.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FaFileAlt className="text-blue-500 mr-3" />
                        <span>{file.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-4 text-lg">
          Submit Full Application
        </button>
      </form>
    </div>
  );

  const renderRegistrationForm = () => (
    <div className="space-y-8">
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Student Login</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Student Number *</label>
            <input
              type="text"
              value={registrationForm.studentNumber}
              onChange={(e) => setRegistrationForm({...registrationForm, studentNumber: e.target.value})}
              className="input-field"
              placeholder="e.g., SEPO2023001"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Password *</label>
            <input
              type="password"
              value={registrationForm.password}
              onChange={(e) => setRegistrationForm({...registrationForm, password: e.target.value})}
              className="input-field"
              required
            />
          </div>
        </div>
        <div className="mt-4 text-right">
          <a href="#" className="text-blue-600 hover:underline text-sm">
            Forgot your student number or password?
          </a>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Course Registration</h3>
        <p className="text-gray-600 mb-6">Select courses for the upcoming semester:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div 
              key={course.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                registrationForm.courses.includes(course.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCourseSelection(course.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">{course.code}</span>
                <span className="text-sm text-gray-500">{course.credits} credits</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{course.name}</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={registrationForm.courses.includes(course.id)}
                  onChange={() => {}}
                  className="rounded text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-600">Select</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Selected Courses:</span>
            <span className="text-blue-600 font-bold">
              {registrationForm.courses.length} course(s)
            </span>
          </div>
          {registrationForm.courses.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Total Credits: {registrationForm.courses.reduce((total, id) => {
                const course = courses.find(c => c.id === id);
                return total + (course?.credits || 0);
              }, 0)}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>
        <div className="space-y-4">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={registrationForm.paymentMethod === 'bank'}
              onChange={(e) => setRegistrationForm({...registrationForm, paymentMethod: e.target.value})}
              className="text-blue-600"
            />
            <div className="ml-4">
              <span className="font-medium text-gray-900">Bank Transfer</span>
              <p className="text-sm text-gray-600">Transfer to Sepo College bank account</p>
            </div>
          </label>
          
          <label className="flex items-center p-4 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="credit"
              checked={registrationForm.paymentMethod === 'credit'}
              onChange={(e) => setRegistrationForm({...registrationForm, paymentMethod: e.target.value})}
              className="text-blue-600"
            />
            <div className="ml-4">
              <span className="font-medium text-gray-900">Credit/Debit Card</span>
              <p className="text-sm text-gray-600">Secure online payment</p>
            </div>
          </label>
          
          <label className="flex items-center p-4 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="sponsor"
              checked={registrationForm.paymentMethod === 'sponsor'}
              onChange={(e) => setRegistrationForm({...registrationForm, paymentMethod: e.target.value})}
              className="text-blue-600"
            />
            <div className="ml-4">
              <span className="font-medium text-gray-900">Sponsorship</span>
              <p className="text-sm text-gray-600">Company or government sponsorship</p>
            </div>
          </label>
        </div>
      </div>

      <div className="card">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={registrationForm.termsAccepted}
            onChange={(e) => setRegistrationForm({...registrationForm, termsAccepted: e.target.checked})}
            className="mt-1 text-blue-600"
          />
          <div className="ml-3">
            <span className="font-medium text-gray-900">
              I accept the terms and conditions *
            </span>
            <p className="text-sm text-gray-600 mt-1">
              I certify that all information provided is accurate and complete. 
              I agree to abide by the rules and regulations of Sepo College.
            </p>
          </div>
        </label>
      </div>

      <button 
        onClick={handleSubmitRegistration}
        className="w-full btn-primary py-4 text-lg"
      >
        Complete Registration
      </button>
    </div>
  );

  const renderStudentEnquiry = () => (
    <div className="space-y-8">
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Student Documents</h3>
        <p className="text-gray-600 mb-6">Download your official documents:</p>
        
        <div className="space-y-4">
          {studentDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FaFileAlt className="text-blue-500 mr-3 text-xl" />
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-500">Uploaded: {doc.date}</p>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-700">
                <FaDownload className="mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-medium">John Doe</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Student Number</label>
              <p className="font-medium">SEPO2023001</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Program</label>
              <p className="font-medium">Computer Technology</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Academic Status</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Current Semester</label>
              <p className="font-medium">Semester 2, 2023</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Courses Registered</label>
              <p className="font-medium">4 Courses (12 Credits)</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Academic Standing</label>
              <p className="font-medium text-green-600">Good Standing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Administration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Subject</label>
            <input type="text" className="input-field" placeholder="Enter subject" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea className="input-field h-40" placeholder="Type your enquiry here..."></textarea>
          </div>
          <button className="btn-primary">
            <FaEnvelope className="inline mr-2" />
            Send Enquiry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="page-title">Student Kiosk</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Complete applications, register for courses, and access your student information
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b mb-8">
          <button
            onClick={() => setActiveTab('application')}
            className={`px-6 py-4 font-medium text-lg ${
              activeTab === 'application' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaFileAlt className="inline mr-2" />
            Application for Admission
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-6 py-4 font-medium text-lg ${
              activeTab === 'registration' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaClipboardCheck className="inline mr-2" />
            Student Registration
          </button>
          <button
            onClick={() => setActiveTab('enquiry')}
            className={`px-6 py-4 font-medium text-lg ${
              activeTab === 'enquiry' 
                ? 'border-b-2 border-purple-600 text-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUserGraduate className="inline mr-2" />
            Student Enquiry
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'application' && renderApplicationForm()}
          {activeTab === 'registration' && renderRegistrationForm()}
          {activeTab === 'enquiry' && renderStudentEnquiry()}
        </div>

        {/* Important Notes */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Important Information</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>Application Processing:</strong> Applications are processed within 5-7 working days
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>Student Number:</strong> You will receive your student number via SMS/Email after application submission
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>Registration Deadline:</strong> Complete registration at least 2 weeks before semester start
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>Technical Support:</strong> For technical issues, email 
                <a href="mailto:support@sepocollege.com.na" className="text-blue-600 hover:underline ml-1">
                  support@sepocollege.com.na
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Kiosk;