import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCar, 
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUniversity,
  FaWrench,
  FaRoad
} from 'react-icons/fa';

const Automotive = () => {
  const school = {
    id: 'automotive',
    name: 'School of Automotive',
    description: 'Our Automotive School provides comprehensive training in vehicle mechanics, driving skills, and automotive technology with hands-on workshops. We prepare students for careers in the automotive industry.',
    icon: <FaCar className="text-4xl text-red-600" />,
    color: 'red',
    courses: [
      { name: 'Basic Driving Skills', duration: '3 Months', level: 'Certificate' },
      { name: 'Vehicle Maintenance', duration: '1 Year', level: 'Certificate' },
      { name: 'Automotive Engineering', duration: '2 Years', level: 'Diploma' },
      { name: 'Advanced Driving Techniques', duration: '6 Months', level: 'Certificate' },
      { name: 'Transport Management', duration: '2 Years', level: 'Diploma' },
      { name: 'Heavy Vehicle Operation', duration: '6 Months', level: 'Certificate' },
      { name: 'Automotive Electronics', duration: '1 Year', level: 'Certificate' },
    ],
    facilities: ['Driving Range', 'Vehicle Workshop', 'Simulation Lab', 'Parts Library', 'Diagnostic Center', 'Fleet Vehicles'],
    requirements: 'Valid Learners License, Grade 10 Certificate, Medical Fitness Certificate',
    email: 'automotive@sepocollege.com.na'
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/schools" className="text-red-600 hover:text-red-800 flex items-center">
            ← Back to All Schools
          </Link>
        </div>

        {/* School Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <FaCar className="text-5xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{school.name}</h1>
              <p className="text-red-100 mt-2">{school.description}</p>
            </div>
          </div>
        </div>

        {/* School Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Offered */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaBook className="mr-3 text-red-500" />
              Courses Offered
            </h3>
            <div className="space-y-4">
              {school.courses.map((course, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{course.name}</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  {course.name.includes('Driving') && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaRoad className="mr-2" />
                      <span>Includes practical driving tests</span>
                    </div>
                  )}
                  {course.name.includes('Maintenance') && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaWrench className="mr-2" />
                      <span>Hands-on workshop training</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/kiosk" className="btn-primary w-full bg-red-600 hover:bg-red-700">
                Apply to {school.name}
              </Link>
            </div>
          </div>

          {/* Facilities */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaUniversity className="mr-3 text-blue-500" />
              Facilities & Resources
            </h3>
            <ul className="space-y-3">
              {school.facilities.map((facility, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 rounded-full mr-3 bg-red-500"></span>
                  {facility}
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <h4 className="font-bold text-gray-900 mb-3">Admission Requirements</h4>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {school.requirements}
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h4 className="font-bold text-red-900 mb-2">Special Features</h4>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-center">
                  <FaCar className="mr-2" />
                  <span>Professional driving instructors</span>
                </li>
                <li className="flex items-center">
                  <FaWrench className="mr-2" />
                  <span>Industry-standard workshop equipment</span>
                </li>
                <li className="flex items-center">
                  <FaRoad className="mr-2" />
                  <span>Dedicated driving test preparation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* School Information */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaChalkboardTeacher className="mr-3 text-purple-500" />
              School Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Career Opportunities</h4>
                <p className="text-gray-600">
                  Graduates from {school.name} can pursue careers as Professional Drivers, 
                  Automotive Technicians, Fleet Managers, Transport Supervisors, 
                  Vehicle Inspectors, Driving Instructors, and Automotive Parts Specialists.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Industry Partnerships</h4>
                <p className="text-gray-600 mb-3">
                  We collaborate with leading automotive companies and transport agencies:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Driving License Testing</p>
                    <p className="text-xs text-gray-600">NADTC Certified</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Vehicle Workshops</p>
                    <p className="text-xs text-gray-600">Industry Partnerships</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Licensing & Certification</h4>
                <p className="text-gray-600">
                  Our programs include preparation for various driving licenses:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">Code B (Light Vehicles)</span>
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">Code C (Heavy Vehicles)</span>
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">Code EC (Trailers)</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Contact School</h4>
                <p className="text-gray-600">
                  For more information about {school.name}, email:
                </p>
                <a 
                  href={`mailto:${school.email}`}
                  className="text-red-600 hover:underline font-medium"
                >
                  {school.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automotive;