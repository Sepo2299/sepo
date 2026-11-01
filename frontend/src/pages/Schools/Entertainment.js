import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFilm, 
  FaBook,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUniversity,
  FaMusic,
  FaPaintBrush,
  FaCamera
} from 'react-icons/fa';

const Entertainment = () => {
  const school = {
    id: 'entertainment',
    name: 'School of Entertainment',
    description: 'The School of Entertainment focuses on creative arts, media production, and performance arts, preparing students for dynamic careers in the creative industries through hands-on training and industry exposure.',
    icon: <FaFilm className="text-4xl text-purple-600" />,
    color: 'purple',
    courses: [
      { name: 'Media Production', duration: '1 Year', level: 'Certificate' },
      { name: 'Graphic Design', duration: '2 Years', level: 'Diploma' },
      { name: 'Performing Arts', duration: '2 Years', level: 'Diploma' },
      { name: 'Digital Marketing', duration: '1 Year', level: 'Certificate' },
      { name: 'Entertainment Management', duration: '3 Years', level: 'Advanced Diploma' },
      { name: 'Music Production', duration: '1 Year', level: 'Certificate' },
      { name: 'Film & TV Production', duration: '2 Years', level: 'Diploma' },
    ],
    facilities: ['Recording Studio', 'Media Lab', 'Performance Theater', 'Design Studio', 'Photography Studio', 'Editing Suites', 'Art Gallery'],
    requirements: 'Grade 12 Certificate, Portfolio/Interview, Creative aptitude test',
    email: 'entertainment@sepocollege.com.na'
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/schools" className="text-purple-600 hover:text-purple-800 flex items-center">
            ← Back to All Schools
          </Link>
        </div>

        {/* School Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <FaFilm className="text-5xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{school.name}</h1>
              <p className="text-purple-100 mt-2">{school.description}</p>
            </div>
          </div>
        </div>

        {/* School Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Offered */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaBook className="mr-3 text-purple-500" />
              Courses Offered
            </h3>
            <div className="space-y-4">
              {school.courses.map((course, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{course.name}</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{course.duration}</span>
                  </div>
                  {course.name.includes('Production') && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaCamera className="mr-2" />
                      <span>Includes practical production work</span>
                    </div>
                  )}
                  {course.name.includes('Design') && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaPaintBrush className="mr-2" />
                      <span>Design portfolio development</span>
                    </div>
                  )}
                  {course.name.includes('Music') && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FaMusic className="mr-2" />
                      <span>Studio recording sessions</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/kiosk" className="btn-primary w-full bg-purple-600 hover:bg-purple-700">
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
                  <span className="w-2 h-2 rounded-full mr-3 bg-purple-500"></span>
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
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-purple-900 mb-2">Creative Environment</h4>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-center">
                  <FaFilm className="mr-2" />
                  <span>Industry-standard equipment</span>
                </li>
                <li className="flex items-center">
                  <FaMusic className="mr-2" />
                  <span>Regular showcases & exhibitions</span>
                </li>
                <li className="flex items-center">
                  <FaPaintBrush className="mr-2" />
                  <span>Guest lectures from industry professionals</span>
                </li>
              </ul>
            </div>
          </div>

          {/* School Information */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FaChalkboardTeacher className="mr-3 text-blue-500" />
              School Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Career Opportunities</h4>
                <p className="text-gray-600">
                  Graduates from {school.name} can pursue careers as Graphic Designers, 
                  Media Producers, Performers, Digital Marketers, Event Managers, 
                  Music Producers, Film Directors, Photographers, and Creative Directors 
                  in various entertainment and media companies.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Industry Exposure</h4>
                <p className="text-gray-600 mb-3">
                  Our students gain real-world experience through:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Internships</p>
                    <p className="text-xs text-gray-600">With media companies</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Live Projects</p>
                    <p className="text-xs text-gray-600">Real client work</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Exhibitions</p>
                    <p className="text-xs text-gray-600">Annual showcase events</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="font-medium text-gray-900 text-sm">Networking</p>
                    <p className="text-xs text-gray-600">Industry meetups</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Special Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    <span>Annual talent showcase and exhibition</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    <span>Industry mentorship program</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    <span>Access to professional equipment</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    <span>Portfolio development assistance</span>
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
                  className="text-purple-600 hover:underline font-medium"
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

export default Entertainment;