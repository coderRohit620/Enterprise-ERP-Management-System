require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@erp.com' });

    if (!adminExists) {
      console.log('No Admin user found. Seeding default Admin user...');
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@erp.com',
        password: 'adminpassword', // Will be hashed by pre-save hook
        role: 'Admin',
      });

      await adminUser.save();
      console.log('Default Admin user successfully seeded:');
      console.log('Email: admin@erp.com');
      console.log('Password: adminpassword');
    } else {
      console.log('Admin user already exists. Skipping seed.');
    }

    console.log('Database seeding process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
