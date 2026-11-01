const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  // Create subdirectories
  ['documents', 'images', 'profiles', 'course-materials'].forEach(subDir => {
    const subDirPath = path.join(uploadDir, subDir);
    if (!fs.existsSync(subDirPath)) {
      fs.mkdirSync(subDirPath, { recursive: true });
    }
  });
}

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));


// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/static', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sepo College API is running',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Sepo College API',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      courses: '/api/courses',
      applications: '/api/applications',
      announcements: '/api/announcements',
      uploads: '/api/uploads'
    },
    documentation: 'https://docs.sepocollege.com.na/api'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Database connection
const db = require('./config/database');

// Test DB connection
db.getConnection()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Please ensure MySQL is running and database exists');
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Sepo College Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
  console.log(`🔗 Health check: ${process.env.BASE_URL}/api/health`);
  console.log(`📁 Upload directory: ${uploadDir}`);
});