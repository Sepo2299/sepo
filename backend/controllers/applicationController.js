const Application = require('../models/Application');
const Student = require('../models/Student');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 25,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false  // Allow self-signed certificates
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email connection error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log(`📧 Using: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  }
});
// Helper functions for quick applications
const generateStudentNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SEPO${year}${random}`;
};

const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Create new application (regular or quick)
// @route   POST /api/applications
// @access  Public
exports.createApplication = async (req, res) => {
  try {
    console.log('🔍 =========== APPLICATION SUBMISSION START ===========');
    console.log('📥 Headers:', req.headers);
    console.log('📥 Body:', JSON.stringify(req.body, null, 2));
    
    const {
      full_name,
      date_of_birth,
      id_number,
      nationality = 'Namibian',
      gender,
      phone,
      email,
      address = '',
      emergency_contact = '',
      highest_qualification = '',
      institution = '',
      year_completed,
      results = '',
      intended_course,
      planned_year,
      study_mode = 'full-time',
      is_quick_application = false, // NEW: Flag for quick applications
      marital_status = 'single'
    } = req.body;

    console.log('📊 Application type:', is_quick_application ? 'QUICK' : 'REGULAR');

    // Validate required fields
    if (!full_name || !date_of_birth || !phone || !email || !intended_course) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: Full Name, Date of Birth, Phone, Email, and Course are required'
      });
    }

    // Validate phone format for Namibia
    const phoneRegex = /^(\+?264|0)?\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use Namibia format: 0812345678 or +264812345678'
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address format'
      });
    }

    // Get database connection
    const db = require('../config/database');

    // ========== QUICK APPLICATION LOGIC ==========
    if (is_quick_application) {
      console.log('🚀 Processing QUICK application');
      
      // Check if email already registered
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered. Please use a different email or login to your existing account.'
        });
      }

      // Generate student credentials
      const student_number = generateStudentNumber();
      const password = generateRandomPassword();
      const username = `student_${student_number.toLowerCase()}`;
      
      console.log('🔑 Generated credentials:', { student_number, password, username });

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        // 1. Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [userResult] = await connection.execute(
          `INSERT INTO users (username, email, password, role, full_name, phone, is_active, created_at)
           VALUES (?, ?, ?, 'student', ?, ?, TRUE, NOW())`,
          [username, email, hashedPassword, full_name, cleanPhone]
        );
        const userId = userResult.insertId;
        console.log('✅ User created with ID:', userId);
        
        // 2. Create student record
        const [studentResult] = await connection.execute(
          `INSERT INTO students 
           (student_number, user_id, full_name, date_of_birth, id_number, nationality, gender,
            phone, email, address, emergency_contact, enrollment_year, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
          [student_number, userId, full_name, date_of_birth, id_number || null, nationality, gender || null,
           cleanPhone, email, address, emergency_contact, planned_year]
        );
        const studentId = studentResult.insertId;
        console.log('✅ Student created with ID:', studentId);
        
        // 3. Create application record (auto-accepted for quick apps)
        const application_number = Application.generateApplicationNumber();
        const [appResult] = await connection.execute(
          `INSERT INTO applications 
           (application_number, student_id, full_name, date_of_birth, id_number, nationality, gender,
            phone, email, address, emergency_contact, highest_qualification, institution,
            year_completed, results, intended_course, planned_year, study_mode, 
            status, is_quick_application, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'accepted', TRUE, NOW())`,
          [
            application_number || null,
            studentId || null, 
            full_name, 
            date_of_birth,
            id_number || null,
            nationality || null,
            gender || null,
            cleanPhone, 
            email,
            address || null,
            emergency_contact || null, 
            highest_qualification || null,
            institution || null,
            year_completed || null,
            results || null, 
            intended_course, 
            planned_year, 
            study_mode || null
          ]
        );
        
        const applicationId = appResult.insertId;
        console.log('✅ Application created with ID:', applicationId);
        
        // Commit transaction
        await connection.commit();
        connection.release();
        console.log('✅ Transaction committed successfully');
        
        // Send welcome email with credentials
        let emailSent = false;
        try {
          const mailOptions = {
            from: `"Sepo College" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Welcome to Sepo College - Your Student Credentials',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .header h1 { color: white; margin: 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
                  .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                  .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin: 15px 0; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Welcome to Sepo College</h1>
                </div>
                <div class="content">
                  <h2>Hello ${full_name},</h2>
                  <p>Congratulations! Your quick application has been processed successfully.</p>
                  
                  <div class="credentials">
                    <h3 style="color: #065f46; margin-top: 0;">Your Student Credentials:</h3>
                    <p><strong>Student Number:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb;">${student_number}</span></p>
                    <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #dc2626;">${password}</span></p>
                    <p><strong>Program:</strong> ${intended_course}</p>
                    <p><strong>Year:</strong> ${planned_year}</p>
                  </div>
                  
                  <div class="warning">
                    <p><strong>⚠️ Important Security Notice:</strong></p>
                    <p>1. Change your password immediately after first login</p>
                    <p>2. Never share your credentials with anyone</p>
                    <p>3. This temporary password expires in 7 days</p>
                  </div>
                  
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/elearning" class="btn">
                    🚀 Login to e-Learning Portal
                  </a>
                  
                  <p>Next steps:</p>
                  <ol>
                    <li>Login to e-Learning portal using credentials above</li>
                    <li>Change your password in account settings</li>
                    <li>Complete course registration in Student Kiosk</li>
                    <li>Upload required documents if any</li>
                  </ol>
                  
                  <div class="footer">
                    <p><strong>Sepo College of Science and Technology</strong></p>
                    <p>📞 Phone: +264 61 123 4567 | ✉️ Email: support@sepocollege.com.na</p>
                    <p>📍 123 Education Street, Windhoek, Namibia</p>
                  </div>
                </div>
              </body>
              </html>
            `
          };

          if (process.env.NODE_ENV !== 'test') {
            await transporter.sendMail(mailOptions);
            emailSent = true;
            console.log('📧 Welcome email sent successfully to:', email);
          }
        } catch (emailError) {
          console.error('❌ Failed to send welcome email:', emailError.message);
          // Don't fail the whole process if email fails
        }

        // Return success with credentials
        return res.status(201).json({
          success: true,
          message: 'Quick application processed successfully! You can now login.',
          student_number,
          password,
          email_sent: emailSent,
          credentials: {
            student_number,
            password,
            login_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/elearning`,
            username: username
          },
          next_steps: [
            'Check your email for login credentials',
            'Login to e-Learning portal',
            'Change your password immediately',
            'Complete course registration'
          ],
          application: {
            application_number,
            application_id: applicationId,
            full_name,
            email,
            intended_course,
            status: 'accepted'
          }
        });
        
      } catch (transactionError) {
        await connection.rollback();
        connection.release();
        console.error('❌ Transaction failed:', transactionError);
        throw transactionError;
      }
    }
    
    // ========== REGULAR APPLICATION LOGIC ==========
    console.log('📝 Processing REGULAR application');
    
    // Check if email already has a pending application (only for regular apps)
    const [existingApps] = await db.execute(
      'SELECT * FROM applications WHERE email = ? AND status = "pending"',
      [email]
    );

    if (existingApps.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending application. Please wait for it to be processed.'
      });
    }

    // Create regular application
    const application = await Application.create({
      full_name,
      date_of_birth,
      id_number,
      nationality,
      gender,
      phone: cleanPhone,
      email,
      address,
      emergency_contact,
      highest_qualification,
      institution,
      year_completed,
      results,
      intended_course,
      planned_year,
      study_mode,
      marital_status
    });

    console.log('✅ Regular application created:', application.application_number);

    // Send confirmation email for regular application
    try {
      const mailOptions = {
        from: `"Sepo College" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Application Received - Sepo College',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Application Received</h2>
            <p>Dear ${full_name},</p>
            <p>Thank you for applying to Sepo College!</p>
            <p>Your application has been received and is being processed.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p><strong>Application Number:</strong> ${application.application_number}</p>
              <p><strong>Applied Program:</strong> ${intended_course}</p>
              <p><strong>Planned Year:</strong> ${planned_year}</p>
            </div>
            <p>You will receive another email once your application has been reviewed.</p>
            <p>You can check your application status using your application number.</p>
            <br>
            <p>Best regards,<br>Sepo College Admissions Team</p>
          </div>
        `
      };

      if (process.env.NODE_ENV !== 'test') {
        await transporter.sendMail(mailOptions);
        console.log('📧 Confirmation email sent to:', email);
      }
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. You will receive an email when your application is reviewed.',
      application: {
        application_number: application.application_number,
        full_name,
        email,
        intended_course,
        status: 'pending',
        estimated_processing: '5-7 working days'
      },
      next_steps: [
        'Wait for application review',
        'Check your email for updates',
        'Prepare required documents',
        'Monitor application status'
      ]
    });
    
  } catch (error) {
    console.error('❌ Create application error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry. This application may already exist.'
      });
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        error: 'Database configuration error. Please contact administrator.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while processing application',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== REST OF YOUR EXISTING FUNCTIONS (UNCHANGED) ==========

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin)
exports.getApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.intended_course) filters.intended_course = req.query.intended_course;
    if (req.query.planned_year) filters.planned_year = req.query.planned_year;
    if (req.query.search) filters.search = req.query.search;

    const applications = await Application.findAll(limit, offset, filters);
    
    // Get total count for pagination
    const db = require('../config/database');
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM applications'
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Admin) or Public with application number
exports.getApplication = async (req, res) => {
  try {
    let application;
    
    if (req.user && req.user.role === 'admin') {
      // Admin can get by ID
      application = await Application.findById(req.params.id);
    } else {
      // Public access needs application number
      application = await Application.findByApplicationNumber(req.params.id);
    }
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required'
      });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // If accepting application, create student account
    let studentData = null;
    if (status === 'accepted') {
      try {
        // Create user account for student
        const username = `student${application.application_number}`;
        const tempPassword = Math.random().toString(36).slice(-8);
        
        const user = await User.create({
          username,
          email: application.email,
          password: tempPassword,
          role: 'student',
          full_name: application.full_name,
          phone: application.phone
        });

        // Create student record
        studentData = await Student.create({
          user_id: user.id,
          full_name: application.full_name,
          date_of_birth: application.date_of_birth,
          id_number: application.id_number,
          nationality: application.nationality,
          gender: application.gender,
          phone: application.phone,
          email: application.email,
          address: application.address,
          emergency_contact: application.emergency_contact,
          enrollment_year: application.planned_year
        });

        // Send acceptance email with login credentials
        try {
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: application.email,
            subject: 'Application Accepted - Sepo College',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Congratulations! Your Application has been Accepted</h2>
                <p>Dear ${application.full_name},</p>
                <p>We are pleased to inform you that your application to Sepo College has been accepted!</p>
                <div style="background-color: #d1fae5; padding: 16px; border-radius: 6px; margin: 16px 0;">
                  <p><strong>Application Number:</strong> ${application.application_number}</p>
                  <p><strong>Student Number:</strong> ${studentData.student_number}</p>
                  <p><strong>Program:</strong> ${application.intended_course}</p>
                  <p><strong>Username:</strong> ${username}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                <p><strong>Important:</strong> Please login to the Student Kiosk and change your password immediately.</p>
                <p>You can now proceed to register for courses in the Student Kiosk.</p>
                <br>
                <p>Welcome to Sepo College!</p>
                <p>Best regards,<br>Sepo College Admissions Team</p>
              </div>
            `
          };

          if (process.env.NODE_ENV !== 'test') {
            await transporter.sendMail(mailOptions);
          }
        } catch (emailError) {
          console.error('Failed to send acceptance email:', emailError);
        }
      } catch (createError) {
        console.error('Failed to create student account:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create student account'
        });
      }
    }

    // Update application status
    const updated = await Application.updateStatus(
      req.params.id, 
      status, 
      studentData ? studentData.id : null,
      req.user.id,
      notes
    );
    
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update application status'
    });
    }

    // Send status update email
    try {
      let subject, message;
      switch (status) {
        case 'reviewed':
          subject = 'Application Under Review';
          message = 'Your application is currently under review.';
          break;
        case 'accepted':
          subject = 'Application Accepted';
          message = 'Congratulations! Your application has been accepted.';
          break;
        case 'rejected':
          subject = 'Application Decision';
          message = 'We regret to inform you that your application was not successful.';
          break;
        default:
          subject = 'Application Status Update';
          message = 'Your application status has been updated.';
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: application.email,
        subject: `${subject} - Sepo College`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${status === 'accepted' ? '#10b981' : '#2563eb'};">${subject}</h2>
            <p>Dear ${application.full_name},</p>
            <p>${message}</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p><strong>Application Number:</strong> ${application.application_number}</p>
              <p><strong>Status:</strong> ${status}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            <p>If you have any questions, please contact the admissions office.</p>
            <br>
            <p>Best regards,<br>Sepo College Admissions Team</p>
          </div>
        `
      };

      if (process.env.NODE_ENV !== 'test') {
        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the update if email fails
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      student: studentData
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Check application status
// @route   GET /api/applications/check/:application_number
// @access  Public
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { application_number } = req.params;
    
    const application = await Application.findByApplicationNumber(application_number);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Return minimal information for public access
    res.json({
      success: true,
      data: {
        application_number: application.application_number,
        status: application.status,
        full_name: application.full_name,
        intended_course: application.intended_course,
        created_at: application.created_at,
        reviewed_at: application.reviewed_at
      }
    });
  } catch (error) {
    console.error('Check application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private (Admin)
exports.getApplicationStats = async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    const stats = await Application.getStats(timeframe || 'month');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get application trends
// @route   GET /api/applications/trends
// @access  Private (Admin)
exports.getApplicationTrends = async (req, res) => {
  try {
    const trends = await Application.getTrends();

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Get application trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search applications
// @route   GET /api/applications/search
// @access  Private (Admin)
exports.searchApplications = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const applications = await Application.search(query);

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Search applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};