// scripts/seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Patient, HealthProvider } = require('../models');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onus-health';

// Test account data
const accounts = [
  {
    name: 'Admin User',
    email: 'rowan.franciscus.2@gmail.com',
    password: 'password@123',
    role: 'admin'
  },
  {
    name: 'Patient User',
    email: 'rowan.franciscus.3@gmail.com',
    password: 'password@123',
    role: 'patient',
    patientData: {
      dateOfBirth: new Date('1990-01-15'),
      gender: 'male',
      healthInsurance: {
        provider: 'NMC Health',
        planName: 'Ruby'
      },
      profileCompleted: true
    }
  },
  {
    name: 'Dr. Tony Stark',
    email: 'rowan.franciscus.4@gmail.com',
    password: 'password@123',
    role: 'provider',
    providerData: {
      title: 'Dr.',
      specialty: 'General Practitioner',
      practice: {
        name: 'Stark Medical Center',
        location: {
          address: '123 Main St',
          city: 'Windhoek',
          country: 'Namibia'
        }
      },
      verificationStatus: 'approved',
      profileCompleted: true
    }
  }
];

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create accounts
    for (const account of accounts) {
      let user;
      
      if (account.role === 'admin') {
        // Create admin user
        user = new User({
          name: account.name,
          email: account.email,
          password: account.password,
          role: 'admin',
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
      } else if (account.role === 'patient') {
        // Create patient user
        user = new Patient({
          name: account.name,
          email: account.email,
          password: account.password,
          role: 'patient',
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          dateOfBirth: account.patientData.dateOfBirth,
          gender: account.patientData.gender,
          healthInsurance: account.patientData.healthInsurance,
          profileCompleted: account.patientData.profileCompleted
        });
        
      } else if (account.role === 'provider') {
        // Create provider user
        user = new HealthProvider({
          name: account.name,
          email: account.email,
          password: account.password,
          role: 'provider',
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: account.providerData.title,
          specialty: account.providerData.specialty,
          practice: account.providerData.practice,
          verificationStatus: account.providerData.verificationStatus,
          profileCompleted: account.providerData.profileCompleted,
          verificationRequest: {
            dateRequested: new Date(),
            dateApproved: new Date()
          }
        });
      }
      
      await user.save();
      console.log(`Created ${account.role} account: ${account.email}`);
    }
    
    console.log('Database seeding completed');
    mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}