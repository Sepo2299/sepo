import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFlask, 
  FaLaptopCode, 
  FaCar, 
  FaFilm,
  FaArrowRight,
  FaChevronDown
} from 'react-icons/fa';

const Schools = () => {
  const schoolsData = [
    {
      id: 'science',
      name: 'School of Science',
      shortDescription: 'Comprehensive education in natural sciences with state-of-the-art laboratory facilities.',
      icon: <FaFlask className="text-3xl text-blue-600" />,
      color: 'blue',
      path: '/schools/science',
      highlights: ['Modern Labs', 'Research Focus', 'Practical Training']
    },
    {
      id: 'computers',
      name: 'School of Computers',
      shortDescription: 'Cutting-edge IT education focusing on software development, networking, and information systems.',
      icon: <FaLaptopCode className="text-3xl text-green-600" />,
      color: 'green',
      path: '/schools/computers',
      highlights: ['Software Development', 'Network Admin', 'Web Development']
    },
    {
      id: 'automotive',
      name: 'School of Automotive',
      shortDescription: 'Comprehensive training in vehicle mechanics, driving skills, and automotive technology.',
      icon: <FaCar className="text-3xl text-red-600" />,
      color: 'red',
      path: '/schools/automotive',
      highlights: ['Driving Skills', 'Vehicle Maintenance', 'Engineering']
    },
    {
      id: 'entertainment',
      name: 'School of Entertainment',
      shortDescription: 'Creative arts, media production, and performance arts for the creative industries.',
      icon: <FaFilm className="text-3xl text-purple-600" />,
      color: 'purple',
      path: '/schools/entertainment',
      highlights: ['Media Production', 'Graphic Design', 'Performing Arts']
    },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="page-title">Our Schools & Programs</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Sepo College offers specialized education through four distinct schools, 
            each providing industry-relevant programs and hands-on training.
          </p>
        </div>

        {/* Schools Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {schoolsData.map((school) => (
            <div 
              key={school.id} 
              className={`border-l-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${school.color === 'blue' ? 'border-blue-500' : school.color === 'green' ? 'border-green-500' : school.color === 'red' ? 'border-red-500' : 'border-purple-500'}`}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${school.color === 'blue' ? 'bg-blue-100' : school.color === 'green' ? 'bg-green-100' : school.color === 'red' ? 'bg-red-100' : 'bg-purple-100'}`}>
                    {school.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{school.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{school.shortDescription}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {school.highlights.map((highlight, idx) => (
                      <span 
                        key={idx}
                        className={`text-xs font-medium px-2 py-1 rounded ${school.color === 'blue' ? 'bg-blue-50 text-blue-700' : school.color === 'green' ? 'bg-green-50 text-green-700' : school.color === 'red' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'}`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link 
                    to={school.path} // ✅ Fixed: Using correct path
                    className={`font-medium ${school.color === 'blue' ? 'text-blue-600 hover:text-blue-800' : school.color === 'green' ? 'text-green-600 hover:text-green-800' : school.color === 'red' ? 'text-red-600 hover:text-red-800' : 'text-purple-600 hover:text-purple-800'}`}
                  >
                    View Details →
                  </Link>
                  <Link 
                    to="/kiosk"
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${school.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : school.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' : school.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                  >
                    Apply
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schools Dropdown/Quick Navigation */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick School Navigation
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolsData.map((school) => (
                <div key={school.id} className="relative group">
                  <Link 
                    to={school.path} // ✅ Fixed: Using correct path
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 group-hover:shadow-md ${school.color === 'blue' ? 'border-blue-200 group-hover:border-blue-300' : school.color === 'green' ? 'border-green-200 group-hover:border-green-300' : school.color === 'red' ? 'border-red-200 group-hover:border-red-300' : 'border-purple-200 group-hover:border-purple-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      {school.icon}
                      <div>
                        <h3 className="font-bold text-gray-900">{school.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Click to view full details</p>
                      </div>
                    </div>
                    <FaChevronDown className={`transform transition-transform group-hover:rotate-180 ${school.color === 'blue' ? 'text-blue-500' : school.color === 'green' ? 'text-green-500' : school.color === 'red' ? 'text-red-500' : 'text-purple-500'}`} />
                  </Link>
                  
                  {/* Dropdown preview (visible on hover) */}
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">{school.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <Link 
                          to={school.path} // ✅ Fixed: Using correct path
                          className={`font-medium ${school.color === 'blue' ? 'text-blue-600 hover:text-blue-800' : school.color === 'green' ? 'text-green-600 hover:text-green-800' : school.color === 'red' ? 'text-red-600 hover:text-red-800' : 'text-purple-600 hover:text-purple-800'}`}
                        >
                          Full Details
                        </Link>
                        <Link 
                          to="/kiosk"
                          className={`px-3 py-1 rounded text-sm ${school.color === 'blue' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : school.color === 'green' ? 'bg-green-50 text-green-700 hover:bg-green-100' : school.color === 'red' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                        >
                          Quick Apply
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful graduates from Sepo College. 
            Choose your preferred school and apply today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/kiosk" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition">
              Apply Now <FaArrowRight className="inline ml-2" />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white py-3 px-8 rounded-lg hover:bg-white/10 transition">
              Request More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schools;