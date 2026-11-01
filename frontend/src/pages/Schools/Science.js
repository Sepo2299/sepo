import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFlask, 
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUniversity
} from 'react-icons/fa';

const Science = () => {
  const school = {
    id: 'science',
    name: 'School of Science',
    description: 'Our School of Science provides comprehensive education in natural sciences with state-of-the-art laboratory facilities. We focus on practical skills and research methodologies.',
    icon: <FaFlask className="text-4xl text-blue-600" />,
    color: 'blue',
    courses: [
      { name: 'Biology Fundamentals', duration: '1 Year', level: 'Certificate' },
      { name: 'Chemistry & Laboratory Techniques', duration: '2 Years', level: 'Diploma' },
      { name: 'Physics Principles', duration: '1 Year', level: 'Certificate' },
      { name: 'Environmental Science', duration: '2 Years', level: 'Diploma' },
      { name: 'Science Laboratory Technology', duration: '3 Years', level: 'Advanced Diploma' },
    ],
    facilities: ['Modern Laboratories', 'Research Center', 'Science Library', 'Computer Lab'],
    requirements: 'Grade 12 with Science & Mathematics, Minimum 25 points',
    email: 'science@sepocollege.com.na'
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/schools" className="text-blue-600 hover:text-blue-800 flex items-center">
            ← Back to All Schools
          </Link>
        </div>

        {/* School Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <FaFlask className="text-5xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{school.name}</h1>
              <p className="text-blue-100 mt-2">{school.description}</p>
            </div>
          </div>
        </div>

        {/* School Content - Same layout as before but for single school */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Offered */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaBook className="mr-3 text-blue-500" />
              Courses Offered
            </h3>
            <div className="space-y-4">
              {school.courses.map((course, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{course.name}</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
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
              <Link to="/kiosk" className="btn-primary w-full">
                Apply to {school.name}
              </Link>
            </div>
          </div>

          {/* Facilities */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaUniversity className="mr-3 text-green-500" />
              Facilities & Resources
            </h3>
            <ul className="space-y-3">
              {school.facilities.map((facility, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 rounded-full mr-3 bg-blue-500"></span>
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
                  Graduates from {school.name} find employment in various industries 
                  including research institutions, pharmaceutical companies, environmental agencies, 
                  and educational institutions.
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
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Contact School</h4>
                <p className="text-gray-600">
                  For more information about {school.name}, email:
                </p>
                <a 
                  href={`mailto:${school.email}`}
                  className="text-blue-600 hover:underline font-medium"
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

export default Science;