require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI);

async function createTestUsers() {
  try {
    console.log('🚀 Creating comprehensive test users for all roles...\n');

    // Test users configuration
    const testUsers = [
      {
        name: 'Candidate Test User',
        studentId: 'CAND2026',
        email: 'candidate@test.com',
        password: 'candidate123',
        role: 'candidate',
        faculty: 'Engineering',
        course: 'Computer Science',
        yearOfStudy: '3rd Year',
        gender: 'Male',
        redirectPath: '/candidate'
      },
      {
        name: 'Agent Test User',
        studentId: 'AGENT2026',
        email: 'agent@test.com',
        password: 'agent123',
        role: 'agent',
        faculty: 'Business',
        course: 'Marketing',
        yearOfStudy: '2nd Year',
        gender: 'Female',
        redirectPath: '/agent'
      },
      {
        name: 'Student Test User',
        studentId: 'STUD2026',
        email: 'student@test.com',
        password: 'student123',
        role: 'student',
        faculty: 'Arts',
        course: 'Psychology',
        yearOfStudy: '1st Year',
        gender: 'Non-binary',
        redirectPath: '/student-dashboard'
      },
      {
        name: 'Admin Test User',
        studentId: 'ADMIN2026',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        faculty: 'Administration',
        course: 'Management',
        yearOfStudy: 'Staff',
        gender: 'Male',
        redirectPath: '/admin'
      },
      {
        name: 'Student with Candidate Role',
        studentId: 'STUCAND2026',
        email: 'student.candidate@test.com',
        password: 'student123',
        role: 'student',
        additionalRoles: ['candidate'],
        faculty: 'Science',
        course: 'Biology',
        yearOfStudy: '4th Year',
        gender: 'Female',
        redirectPath: '/candidate'
      },
      {
        name: 'Student with Agent Role',
        studentId: 'STUAGENT2026',
        email: 'student.agent@test.com',
        password: 'student123',
        role: 'student',
        additionalRoles: ['agent'],
        faculty: 'Law',
        course: 'Legal Studies',
        yearOfStudy: '2nd Year',
        gender: 'Male',
        redirectPath: '/agent'
      }
    ];

    // Delete existing test users
    const testEmails = testUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('🗑️ Cleaned up existing test users...\n');

    // Create new test users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        name: userData.name,
        studentId: userData.studentId,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        additionalRoles: userData.additionalRoles || [],
        faculty: userData.faculty,
        course: userData.course,
        yearOfStudy: userData.yearOfStudy,
        gender: userData.gender,
        isVerified: true
      });

      await user.save();
      
      console.log(`✅ Created: ${userData.name}`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🔒 Password: ${userData.password}`);
      console.log(`   👤 Role: ${userData.role}${userData.additionalRoles?.length ? ` + ${userData.additionalRoles.join(', ')}` : ''}`);
      console.log(`   🎯 Login redirects to: ${userData.redirectPath}`);
      console.log('');
    }

    console.log('🎉 All test users created successfully!');
    console.log('\n📋 Quick Reference for Testing:');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ ROLE        │ EMAIL                     │ PASSWORD    │ PATH     │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    testUsers.forEach(user => {
      const roleDisplay = user.role + (user.additionalRoles?.length ? `+${user.additionalRoles[0]}` : '');
      console.log(`│ ${roleDisplay.padEnd(11)} │ ${user.email.padEnd(25)} │ ${user.password.padEnd(11)} │ ${user.redirectPath.padEnd(8)} │`);
    });
    console.log('└─────────────────────────────────────────────────────────────────┘');
    
    console.log('\n🔗 Testing URL: http://localhost:5173/test-routes');
    console.log('   Login with any of the above credentials, then visit /test-routes');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUsers();