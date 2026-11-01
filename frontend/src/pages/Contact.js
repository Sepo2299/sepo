import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  });

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl text-blue-500" />,
      title: 'Visit Us',
      details: [
        '123 Education Street',
        'Windhoek, Namibia',
        'P.O. Box 12345'
      ]
    },
    {
      icon: <FaPhone className="text-2xl text-green-500" />,
      title: 'Call Us',
      details: [
        '+264 61 123 4567 (Office)',
        '+264 81 234 5678 (Mobile)',
        '+264 61 123 4568 (Fax)'
      ]
    },
    {
      icon: <FaEnvelope className="text-2xl text-purple-500" />,
      title: 'Email Us',
      details: [
        'info@sepocollege.com.na',
        'admissions@sepocollege.com.na',
        'support@sepocollege.com.na'
      ]
    },
    {
      icon: <FaClock className="text-2xl text-red-500" />,
      title: 'Working Hours',
      details: [
        'Monday - Friday: 8:00 AM - 5:00 PM',
        'Saturday: 9:00 AM - 1:00 PM',
        'Sunday: Closed'
      ]
    }
  ];

  const departments = [
    { name: 'Admissions Office', email: 'admissions@sepocollege.com.na', phone: '+264 61 123 4567 ext. 101' },
    { name: 'Academic Office', email: 'academics@sepocollege.com.na', phone: '+264 61 123 4567 ext. 102' },
    { name: 'Finance Department', email: 'finance@sepocollege.com.na', phone: '+264 61 123 4567 ext. 103' },
    { name: 'Student Services', email: 'studentservices@sepocollege.com.na', phone: '+264 61 123 4567 ext. 104' },
    { name: 'ICT Support', email: 'ict@sepocollege.com.na', phone: '+264 61 123 4567 ext. 105' },
    { name: 'Examinations Office', email: 'exams@sepocollege.com.na', phone: '+264 61 123 4567 ext. 106' },
  ];

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will respond within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: 'general',
      message: ''
    });
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="page-title">Contact Us</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Get in touch with Sepo College. We're here to answer your questions and provide assistance.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div key={index} className="card text-center hover:shadow-xl transition">
              <div className="mb-4">{info.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{info.title}</h3>
              <div className="space-y-2">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600">{detail}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Category</label>
                    <select
                      name="category"
                      value={contactForm.category}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="admissions">Admissions</option>
                      <option value="academic">Academic</option>
                      <option value="finance">Finance</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback/Suggestions</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    className="input-field h-48"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="w-full btn-primary py-3">
                  <FaPaperPlane className="inline mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Department Contacts & Map */}
          <div className="space-y-8">
            {/* Department Contacts */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Department Contacts</h2>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-bold text-gray-900">{dept.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
                      <a 
                        href={`mailto:${dept.email}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        📧 {dept.email}
                      </a>
                      <span className="text-gray-600 text-sm mt-1 sm:mt-0">
                        📞 {dept.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="flex-1 bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition">
                  <FaFacebook className="inline text-2xl" />
                  <p className="mt-2 font-medium">Facebook</p>
                </a>
                <a href="#" className="flex-1 bg-blue-400 text-white p-4 rounded-lg text-center hover:bg-blue-500 transition">
                  <FaTwitter className="inline text-2xl" />
                  <p className="mt-2 font-medium">Twitter</p>
                </a>
                <a href="#" className="flex-1 bg-pink-600 text-white p-4 rounded-lg text-center hover:bg-pink-700 transition">
                  <FaInstagram className="inline text-2xl" />
                  <p className="mt-2 font-medium">Instagram</p>
                </a>
                <a href="#" className="flex-1 bg-blue-700 text-white p-4 rounded-lg text-center hover:bg-blue-800 transition">
                  <FaLinkedin className="inline text-2xl" />
                  <p className="mt-2 font-medium">LinkedIn</p>
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Location</h2>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-4xl text-red-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Sepo College Campus</p>
                  <p className="text-gray-600">123 Education Street, Windhoek</p>
                  <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="page-title text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[
              {
                q: 'How do I apply for admission?',
                a: 'You can apply through our online Student Kiosk. First, complete the quick application form on the homepage to get your student number, then proceed to the full application in the kiosk.'
              },
              {
                q: 'What are the admission requirements?',
                a: 'Requirements vary by program. Generally, you need a Grade 12 certificate with specific subject combinations. Check the specific school pages for detailed requirements.'
              },
              {
                q: 'How do I access the e-learning platform?',
                a: 'Registered students receive login credentials. Use your student number and e-learning password to access the platform through the e-Learning page.'
              },
              {
                q: 'What payment methods are available?',
                a: 'We accept bank transfers, credit/debit cards, and sponsor payments. Payment details are available in the Student Kiosk during registration.'
              },
              {
                q: 'How long does application processing take?',
                a: 'Applications are typically processed within 5-7 working days. You will receive notifications via SMS and email.'
              },
              {
                q: 'Can I study part-time or online?',
                a: 'Yes! We offer full-time, part-time, and online study options for most programs. Select your preferred mode during application.'
              },
            ].map((faq, index) => (
              <div key={index} className="card hover:shadow-xl">
                <h3 className="font-bold text-gray-900 mb-3">Q: {faq.q}</h3>
                <p className="text-gray-600">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;