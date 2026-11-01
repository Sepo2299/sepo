import React from 'react';
import { FaUniversity, FaUsers, FaHistory, FaAward, FaBullseye, FaEye } from 'react-icons/fa';

const About = () => {
  const managementTeam = [
    { name: 'Dr. John Smith', position: 'Principal', department: 'Administration', email: 'principal@sepocollege.com.na' },
    { name: 'Prof. Sarah Johnson', position: 'Dean of Academics', department: 'Academic Affairs', email: 'dean@sepocollege.com.na' },
    { name: 'Mr. David Brown', position: 'Finance Director', department: 'Finance', email: 'finance@sepocollege.com.na' },
    { name: 'Ms. Maria Garcia', position: 'Student Affairs', department: 'Student Services', email: 'studentaffairs@sepocollege.com.na' },
  ];

  const milestones = [
    { year: '2010', event: 'Sepo College Founded', description: 'Started with 50 students and 5 staff members' },
    { year: '2012', event: 'First Accreditation', description: 'Accredited by Namibia Qualifications Authority' },
    { year: '2015', event: 'Campus Expansion', description: 'Moved to new 10-acre campus in Windhoek' },
    { year: '2018', event: 'e-Learning Launch', description: 'Digital learning platform introduced' },
    { year: '2020', event: 'ISO Certification', description: 'Received ISO 9001:2015 Certification' },
    { year: '2023', event: 'New Programs', description: 'Launched Automotive and Entertainment schools' },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="page-title">About Sepo College</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Sepo College is a premier institution dedicated to excellence in science, 
            computer technology, and specialized skills training in Namibia.
          </p>
        </div>

        {/* Mission, Vision, Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEye className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600">
              To be the leading college of science and technology in Southern Africa, 
              recognized for innovation, excellence, and transformative education.
            </p>
          </div>

          <div className="card text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBullseye className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600">
              To provide quality education and training that equips students with 
              practical skills and theoretical knowledge for successful careers and 
              meaningful contributions to society.
            </p>
          </div>

          <div className="card text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaAward className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Core Values</h3>
            <ul className="text-gray-600 space-y-2 text-left">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Excellence in Education
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Innovation and Creativity
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Integrity and Ethics
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Student Success
              </li>
            </ul>
          </div>
        </div>

        {/* Management Team */}
        <div className="mb-16">
          <h2 className="section-title text-center">College Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {managementTeam.map((member, index) => (
              <div key={index} className="card text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium">{member.position}</p>
                <p className="text-gray-600 text-sm mt-2">{member.department}</p>
                <a href={`mailto:${member.email}`} className="text-sm text-gray-500 hover:text-blue-600 mt-2 inline-block">
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* College History Timeline */}
        <div className="mb-16">
          <h2 className="section-title text-center">Our Journey</h2>
          <div className="relative mt-8">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            
            {/* Timeline items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="card inline-block max-w-md">
                      <div className="flex items-center mb-2">
                        <FaHistory className="text-blue-500 mr-2" />
                        <span className="font-bold text-blue-600">{milestone.year}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{milestone.event}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="section-title text-center">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">College Address</h3>
              <div className="space-y-4">
                <p className="text-gray-600 flex items-start">
                  <FaUniversity className="text-blue-500 mt-1 mr-3" />
                  <span>123 Education Street, Windhoek, Namibia</span>
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="text-blue-500 mr-3">📞</span>
                  <span>+264 61 123 4567 (Office)</span>
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="text-blue-500 mr-3">📱</span>
                  <span>+264 81 234 5678 (Mobile)</span>
                </p>
                <p className="text-gray-600 flex items-center">
                  <span className="text-blue-500 mr-3">✉️</span>
                  <span>info@sepocollege.com.na</span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Department Contacts</h3>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium">Admissions:</span> admissions@sepocollege.com.na
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Academic Office:</span> academics@sepocollege.com.na
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Finance Department:</span> finance@sepocollege.com.na
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Student Services:</span> studentservices@sepocollege.com.na
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;