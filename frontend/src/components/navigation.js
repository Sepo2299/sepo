import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome,
  FaSchool,
  FaUserGraduate,
  FaInfoCircle,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaGraduationCap,
  FaUser,
  FaSignInAlt
} from 'react-icons/fa';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false);
  const location = useLocation();

  // Schools data for dropdown
  const schools = [
    { name: 'School of Science', path: '/schools/science', color: 'blue' },
    { name: 'School of Computers', path: '/schools/computers', color: 'green' },
    { name: 'School of Automotive', path: '/schools/automotive', color: 'red' },
    { name: 'School of Entertainment', path: '/schools/entertainment', color: 'purple' },
  ];

  const navLinks = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { 
      name: 'Schools', 
      path: '/schools', 
      icon: <FaSchool />,
      hasDropdown: true,
      dropdownItems: schools
    },
     { name: 'E-Learning', path: '/ELearning'},
     { name: 'Kiosk', path: '/Kiosk'},
    { name: 'About', path: '/about', icon: <FaInfoCircle /> },
    { name: 'Contact', path: '/contact', icon: <FaEnvelope /> },
  ];

  // Check if a link is active
  const isActive = (path) => {
    if (path === '/schools') {
      return location.pathname.startsWith('/schools');
    }
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when clicking a link
  const closeMenu = () => {
    setIsOpen(false);
    setSchoolsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo - Using Header.js design */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2 rounded-xl">
              <FaGraduationCap className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SEPO COLLEGE</h1>
              <p className="text-xs text-gray-600">College of Science & Technology</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.hasDropdown ? (
                  <div 
                    className="relative group"
                    onMouseEnter={() => setSchoolsDropdownOpen(true)}
                    onMouseLeave={() => setSchoolsDropdownOpen(false)}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isActive(link.path)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                      <FaChevronDown className={`ml-2 transition-transform ${schoolsDropdownOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    
                    {/* Schools Dropdown */}
                    {schoolsDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="p-2">
                          <div className="mb-2 px-3 py-2 text-sm font-medium text-gray-500">
                            Browse Schools
                          </div>
                          {link.dropdownItems.map((school) => (
                            <Link
                              key={school.name}
                              to={school.path}
                              className={`flex items-center px-3 py-3 rounded-lg mb-1 transition-colors ${
                                location.pathname === school.path
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                              onClick={closeMenu}
                            >
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                school.color === 'blue' ? 'bg-blue-500' :
                                school.color === 'green' ? 'bg-green-500' :
                                school.color === 'red' ? 'bg-red-500' : 'bg-purple-500'
                              }`} />
                              {school.name}
                            </Link>
                          ))}
                          <div className="border-t mt-2 pt-2">
                            <Link
                              to="/schools"
                              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              onClick={closeMenu}
                            >
                              <FaSchool className="mr-2" />
                              View All Schools
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Auth Buttons - Using Header.js design */}
            <div className="ml-4 flex items-center space-x-3">
              <Link
                to="/elearning"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition"
              >
                <FaSignInAlt className="mr-2" />
                Login
              </Link>
              <Link
                to="/kiosk"
                className="flex items-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                <FaUser className="mr-2" />
                Apply Now
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-xl p-4 border">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setSchoolsDropdownOpen(!schoolsDropdownOpen)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg ${
                          isActive(link.path)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{link.icon}</span>
                          {link.name}
                        </div>
                        <FaChevronDown className={`transition-transform ${schoolsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Mobile Schools Dropdown */}
                      {schoolsDropdownOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                          {link.dropdownItems.map((school) => (
                            <Link
                              key={school.name}
                              to={school.path}
                              className={`flex items-center px-4 py-2 rounded-lg ${
                                location.pathname === school.path
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                              }`}
                              onClick={closeMenu}
                            >
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                school.color === 'blue' ? 'bg-blue-500' :
                                school.color === 'green' ? 'bg-green-500' :
                                school.color === 'red' ? 'bg-red-500' : 'bg-purple-500'
                              }`} />
                              {school.name}
                            </Link>
                          ))}
                          <Link
                            to="/schools"
                            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            onClick={closeMenu}
                          >
                            <FaSchool className="mr-2" />
                            View All Schools
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      className={`flex items-center px-4 py-3 rounded-lg ${
                        isActive(link.path)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={closeMenu}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t">
                <Link
                  to="/elearning"
                  onClick={closeMenu}
                  className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg mb-3"
                >
                  <FaSignInAlt className="inline mr-2" />
                  Student/Staff Login
                </Link>
                <Link
                  to="/kiosk"
                  onClick={closeMenu}
                  className="block w-full text-center py-3 border-2 border-blue-600 text-blue-600 rounded-lg"
                >
                  <FaUser className="inline mr-2" />
                  Apply for Admission
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;