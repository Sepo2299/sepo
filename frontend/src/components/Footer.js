import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Schools', path: '/schools' },
    { name: 'e-Learning', path: '/elearning' },
    { name: 'Student Kiosk', path: '/kiosk' },
    { name: 'Contact', path: '/contact' },
  ];

  // In Footer.js, update the schools array:
const schools = [
  { name: 'School of Science', path: '/schools/science' }, // Changed from '/schools#science'
  { name: 'School of Computers', path: '/schools/computers' }, // Changed from '/schools#computers'
  { name: 'School of Automotive', path: '/schools/automotive' }, // Changed from '/schools#automotive'
  { name: 'School of Entertainment', path: '/schools/entertainment' }, // Changed from '/schools#entertainment'
];

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* College Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg mr-3">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold">SEPO COLLEGE</h3>
                <p className="text-sm text-gray-300">Science & Technology Excellence</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              The premier institution for science and technology education in Namibia, 
              dedicated to producing industry-ready professionals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-700 p-2 rounded-lg hover:bg-blue-600 transition">
                <FaFacebook />
              </a>
              <a href="#" className="bg-blue-500 p-2 rounded-lg hover:bg-blue-400 transition">
                <FaTwitter />
              </a>
              <a href="#" className="bg-pink-600 p-2 rounded-lg hover:bg-pink-500 transition">
                <FaInstagram />
              </a>
              <a href="#" className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-white transition flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Schools */}
          <div>
            <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">Our Schools</h4>
            <ul className="space-y-3">
              {schools.map((school) => (
                <li key={school.name}>
                  <Link 
                    to={school.path}
                    className="text-gray-300 hover:text-white transition flex items-center"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    {school.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400" />
                <span className="text-gray-300">
                  123 Education Street,<br />
                  Windhoek, Namibia
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-blue-400" />
                <span className="text-gray-300">+264 61 123 4567</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-blue-400" />
                <span className="text-gray-300">info@sepocollege.com.na</span>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-3 text-blue-400" />
                <span className="text-gray-300">Mon-Fri: 8:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Sepo College. All Rights Reserved. | 
            Domain: <span className="text-blue-300">www.sepocollege.com.na</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            College of Science and Technology | Accredited by the Namibia Qualifications Authority
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;