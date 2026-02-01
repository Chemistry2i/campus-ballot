require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Election = require('./models/Election');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createObserverUser = async () => {
  try {
    await connectDB();
    
    // Get all elections
    const elections = await Election.find({});
    console.log(`Found ${elections.length} elections`);
    
    // Check if observer user already exists
    let observer = await User.findOne({ email: 'observer@campusballot.tech' });
    
    if (observer) {
      console.log('Observer user already exists, updating...');
      
      // Update observer info with all elections
      observer.observerInfo = {
        assignedElections: elections.map(e => e._id),
        organization: 'Campus Ballot System',
        accessLevel: 'full', // Give full access to see all elections
        assignedBy: null,
        assignedDate: new Date()
      };
      
      await observer.save();
      console.log('✅ Observer user updated successfully');
    } else {
      console.log('Creating new observer user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('observer123', 10);
      
      // Create observer user
      observer = new User({
        name: 'Election Observer',
        email: 'observer@campusballot.tech',
        password: hashedPassword,
        role: 'observer',
        isVerified: true,
        accountStatus: 'active',
        observerInfo: {
          assignedElections: elections.map(e => e._id),
          organization: 'Campus Ballot System',
          accessLevel: 'full', // Give full access
          assignedBy: null,
          assignedDate: new Date()
        }
      });
      
      await observer.save();
      console.log('✅ Observer user created successfully');
    }
    
    console.log('Observer Details:');
    console.log('Email: observer@campusballot.tech');
    console.log('Password: observer123');
    console.log('Role: observer');
    console.log(`Access Level: ${observer.observerInfo.accessLevel}`);
    console.log(`Assigned to ${observer.observerInfo.assignedElections.length} elections`);
    
    // List the elections
    if (elections.length > 0) {
      console.log('\nAssigned Elections:');
      elections.forEach((election, index) => {
        console.log(`${index + 1}. ${election.title} (${election.status})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating observer:', error);
    process.exit(1);
  }
};

createObserverUser();