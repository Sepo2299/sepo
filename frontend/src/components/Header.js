import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaBars, FaTimes, FaUser, FaSignInAlt } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Schools', path: '/schools' },
    { name: 'e-Learning', path: '/elearning' },
    { name: 'Student Kiosk', path: '/kiosk' },
    { name: 'Contact', path: '/contact' },
  ];

  const schoolsSubmenu = [
    { name: 'School of Science', path: '/schools#science' },
    { name: 'School of Computers', path: '/schools#computers' },
    { name: 'School of Automotive', path: '/schools#automotive' },
    { name: 'School of Entertainment', path: '/schools#entertainment' },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
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
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.name === 'Schools' ? (
                <div key={item.name} className="relative group">
                  <button className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition">
                    {item.name}
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute hidden group-hover:block bg-white shadow-xl rounded-lg mt-1 w-48 z-10 border">
                    {schoolsSubmenu.map((school) => (
                      <Link
                        key={school.name}
                        to={school.path}
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b last:border-b-0"
                      >
                        {school.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 font-medium rounded-lg transition ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Auth Buttons */}
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
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-xl p-4 border">
            <div className="space-y-2">
              {navItems.map((item) => (
                item.name === 'Schools' ? (
                  <div key={item.name} className="space-y-2">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex justify-between items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                    >
                      <span>{item.name}</span>
                      <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="ml-4 space-y-2 border-l-2 border-blue-200 pl-4">
                        {schoolsSubmenu.map((school) => (
                          <Link
                            key={school.name}
                            to={school.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            {school.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium ${
                      location.pathname === item.path
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              <div className="pt-4 border-t">
                <Link
                  to="/elearning"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg mb-3"
                >
                  <FaSignInAlt className="inline mr-2" />
                  Student/Staff Login
                </Link>
                <Link
                  to="/kiosk"
                  onClick={() => setIsMenuOpen(false)}
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
    </header>
  );
};

export default Header;