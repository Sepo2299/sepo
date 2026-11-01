// backend/test-application.js
const Application = require('./models/Application');

const testApplication = async () => {
  try {
    console.log('🚀 Testing Application model...');
    
    const testData = {
      full_name: 'Test Student',
      date_of_birth: '2000-01-01',
      id_number: '123456789',
      nationality: 'Namibian',
      gender: 'male',
      phone: '0812345678',
      email: 'test@example.com',
      address: '123 Test Street, Windhoek',
      emergency_contact: '0818765432',
      highest_qualification: 'Grade 12',
      institution: 'Test High School',
      year_completed: 2022,
      results: '25 points',
      intended_course: 'computers',
      planned_year: 2024,
      study_mode: 'full-time'
    };
    
    console.log('📤 Test data:', testData);
    
    const result = await Application.create(testData);
    console.log('✅ Application created successfully!');
    console.log('📄 Result:', result);
    
    // Verify it's in the database
    const foundApp = await Application.findByApplicationNumber(result.application_number);
    console.log('🔍 Retrieved from DB:', foundApp);
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

// Run test
testApplication()
  .then(() => {
    console.log('🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed!');
    process.exit(1);
  });