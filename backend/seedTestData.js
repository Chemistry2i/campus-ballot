const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Election = require('./models/Election');
const User = require('./models/User');
const Candidate = require('./models/Candidate');
const Vote = require('./models/Vote');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/university-voting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedTestData() {
  try {
    console.log('🌱 Starting to seed test data...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Election.deleteMany({});
    // await Candidate.deleteMany({});
    // await Vote.deleteMany({});

    // Create test elections
    const elections = await Election.insertMany([
      {
        title: 'Student Council President 2024',
        description: 'Election for Student Council President',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-30'),
        status: 'active'
      },
      {
        title: 'Vice President Election',
        description: 'Election for Vice President position',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15'),
        status: 'active'
      },
      {
        title: 'Secretary General Election',
        description: 'Election for Secretary General',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-15'),
        status: 'completed'
      }
    ]);

    console.log('✅ Created elections:', elections.length);

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      {
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.student@university.edu',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        studentId: 'STU002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.student@university.edu',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        studentId: 'STF001',
        firstName: 'Prof',
        lastName: 'Wilson',
        email: 'prof.wilson@university.edu',
        password: hashedPassword,
        role: 'staff',
        isVerified: true
      },
      {
        studentId: 'STU003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.student@university.edu',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        studentId: 'STU004',
        firstName: 'Sarah',
        lastName: 'Brown',
        email: 'sarah.student@university.edu',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      }
    ]);

    console.log('✅ Created users:', users.length);

    // Create test candidates
    const candidates = await Candidate.insertMany([
      {
        candidateName: 'Alice Cooper',
        position: 'President',
        biography: 'Experienced student leader with 3 years in student government',
        election: elections[0]._id,
        status: 'approved',
        manifestoUrl: 'https://example.com/alice-manifesto.pdf'
      },
      {
        candidateName: 'Bob Martin',
        position: 'President',
        biography: 'Former class representative with fresh ideas',
        election: elections[0]._id,
        status: 'approved',
        manifestoUrl: 'https://example.com/bob-manifesto.pdf'
      },
      {
        candidateName: 'Carol Davis',
        position: 'Vice President',
        biography: 'Active in student clubs and societies',
        election: elections[1]._id,
        status: 'approved',
        manifestoUrl: 'https://example.com/carol-manifesto.pdf'
      },
      {
        candidateName: 'David Wilson',
        position: 'Vice President',
        biography: 'Business student with leadership experience',
        election: elections[1]._id,
        status: 'approved',
        manifestoUrl: 'https://example.com/david-manifesto.pdf'
      },
      {
        candidateName: 'Eva Green',
        position: 'Secretary General',
        biography: 'Communications major with organizational skills',
        election: elections[2]._id,
        status: 'approved',
        manifestoUrl: 'https://example.com/eva-manifesto.pdf'
      }
    ]);

    console.log('✅ Created candidates:', candidates.length);

    // Create test votes
    const votes = await Vote.insertMany([
      {
        voter: users[0]._id,
        candidate: candidates[0]._id,
        election: elections[0]._id,
        timestamp: new Date()
      },
      {
        voter: users[1]._id,
        candidate: candidates[1]._id,
        election: elections[0]._id,
        timestamp: new Date()
      },
      {
        voter: users[2]._id,
        candidate: candidates[0]._id,
        election: elections[0]._id,
        timestamp: new Date()
      },
      {
        voter: users[3]._id,
        candidate: candidates[2]._id,
        election: elections[1]._id,
        timestamp: new Date()
      },
      {
        voter: users[4]._id,
        candidate: candidates[3]._id,
        election: elections[1]._id,
        timestamp: new Date()
      },
      {
        voter: users[0]._id,
        candidate: candidates[4]._id,
        election: elections[2]._id,
        timestamp: new Date()
      }
    ]);

    console.log('✅ Created votes:', votes.length);

    console.log('🎉 Test data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${elections.length} Elections`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${candidates.length} Candidates`);
    console.log(`   - ${votes.length} Votes`);

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    mongoose.disconnect();
  }
}

seedTestData();
