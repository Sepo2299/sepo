import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLaptopCode, 
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUniversity
} from 'react-icons/fa';

const Computers = () => {
  const school = {
    id: 'computers',
    name: 'School of Computers',
    description: 'The School of Computers offers cutting-edge IT education with a focus on practical skills in software development, networking, and information systems. Our programs are designed to meet industry demands.',
    icon: <FaLaptopCode className="text-4xl text-green-600" />,
    color: 'green',
    courses: [
      { name: 'Introduction to ICT', duration: '6 Months', level: 'Certificate' },
      { name: 'Software Development', duration: '2 Years', level: 'Diploma' },
      { name: 'Network Administration', duration: '2 Years', level: 'Diploma' },
      { name: 'Database Management', duration: '1 Year', level: 'Certificate' },
      { name: 'Web & Mobile Development', duration: '3 Years', level: 'Advanced Diploma' },
      { name: 'Cybersecurity Fundamentals', duration: '1 Year', level: 'Certificate' },
      { name: 'Cloud Computing', duration: '6 Months', level: 'Certificate' },
    ],
    facilities: ['Computer Labs', 'Network Simulation Lab', 'Software Development Center', 'IT Library', 'Cybersecurity Lab', 'Hardware Workshop'],
    requirements: 'Grade 12 Certificate, Basic Computer Knowledge, Mathematics recommended',
    email: 'computers@sepocollege.com.na'
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/schools" className="text-green-600 hover:text-green-800 flex items-center">
            ← Back to All Schools
          </Link>
        </div>

        {/* School Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <FaLaptopCode className="text-5xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{school.name}</h1>
              <p className="text-green-100 mt-2">{school.description}</p>
            </div>
          </div>
        </div>

        {/* School Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Offered */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaBook className="mr-3 text-green-500" />
              Courses Offered
            </h3>
            <div className="space-y-4">
              {school.courses.map((course, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{course.name}</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/kiosk" className="btn-primary w-full bg-green-600 hover:bg-green-700">
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
                  <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
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
                  Graduates from {school.name} are prepared for roles such as Software Developer, 
                  Network Administrator, Database Manager, Web Developer, IT Support Specialist, 
                  Cybersecurity Analyst, and Systems Analyst in various tech companies and organizations.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Study Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Full-time</p>
                    <p className="text-sm text-gray-600">On-campus learning</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Part-time</p>
                    <p className="text-sm text-gray-600">Evening & weekend classes</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Online</p>
                    <p className="text-sm text-gray-600">Flexible e-learning</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">Hybrid</p>
                    <p className="text-sm text-gray-600">Blended approach</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Certifications & Partnerships</h4>
                <p className="text-gray-600 mb-2">
                  We partner with leading tech companies and offer preparation for certifications like:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">CompTIA A+</span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Cisco CCNA</span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Microsoft Azure</span>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">AWS Certified</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Contact School</h4>
                <p className="text-gray-600">
                  For more information about {school.name}, email:
                </p>
                <a 
                  href={`mailto:${school.email}`}
                  className="text-green-600 hover:underline font-medium"
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

export default Computers;