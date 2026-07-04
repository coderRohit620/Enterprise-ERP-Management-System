require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    // 1. Clean up existing records to allow clean re-seeding
    console.log('Cleaning up old test data...');
    await Promise.all([
      User.deleteMany({ email: { $in: ['admin@erp.com', 'manager@erp.com', 'employee@erp.com'] } }),
      Department.deleteMany({ department_name: 'Engineering' }),
    ]);
    
    // We also delete employees linked to these test emails
    const testUsers = await User.find({ email: { $in: ['manager@erp.com', 'employee@erp.com'] } });
    const userIds = testUsers.map(u => u._id);
    await Employee.deleteMany({ user_id: { $in: userIds } });

    console.log('Seeding fresh organizational data...');

    // 2. Seed default Admin User
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@erp.com',
      password: 'adminpassword',
      role: 'Admin',
    });
    await adminUser.save();
    console.log('✓ Admin User seeded: admin@erp.com / adminpassword');

    // 3. Seed default Department "Engineering" (temp manager_id)
    const engineeringDept = new Department({
      department_name: 'Engineering',
      manager_id: null,
    });
    await engineeringDept.save();
    console.log('✓ Department Engineering seeded');

    // 4. Seed default Manager User
    const managerUser = new User({
      name: 'Engineering Manager',
      email: 'manager@erp.com',
      password: 'managerpassword',
      role: 'Manager',
    });
    await managerUser.save();
    console.log('✓ Manager User seeded: manager@erp.com / managerpassword');

    // 5. Seed Manager Employee Profile
    const managerProfile = new Employee({
      user_id: managerUser._id,
      employee_code: 'MGR-001',
      designation: 'Engineering Lead',
      department_id: engineeringDept._id,
      joining_date: new Date(),
      salary: 9500,
      phone: '+1 555 0100',
      address: '100 Silicon Valley Way',
      status: 'Active',
    });
    await managerProfile.save();
    console.log('✓ Manager Employee Profile seeded');

    // 6. Update Department manager_id referencing the Manager User
    engineeringDept.manager_id = managerUser._id;
    await engineeringDept.save();
    console.log('✓ Updated Engineering Department with Manager reference');

    // 7. Seed default Employee User
    const employeeUser = new User({
      name: 'Software Engineer',
      email: 'employee@erp.com',
      password: 'employeepassword',
      role: 'Employee',
    });
    await employeeUser.save();
    console.log('✓ Employee User seeded: employee@erp.com / employeepassword');

    // 8. Seed Employee Profile
    const employeeProfile = new Employee({
      user_id: employeeUser._id,
      employee_code: 'EMP-001',
      designation: 'Senior Developer',
      department_id: engineeringDept._id,
      joining_date: new Date(),
      salary: 6500,
      phone: '+1 555 0101',
      address: '102 Silicon Valley Way',
      status: 'Active',
    });
    await employeeProfile.save();
    console.log('✓ Employee Profile seeded');

    console.log('\n🎉 Seeding process completed successfully!');
    console.log('Ready to test role views for: Admin, Manager, and Employee.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
