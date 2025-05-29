const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Generate a random UUID
const generateUUID = () => uuidv4();

// Generate a hashed password
const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Generate a random role
const generateRole = (name, description, permissions = {}) => ({
  id: generateUUID(),
  name,
  description,
  permissions,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Generate a random user
const generateUser = async (roleId, username, email, password = 'password123') => ({
  id: generateUUID(),
  username,
  email,
  password: await generateHashedPassword(password),
  roleId,
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Generate a random department
const generateDepartment = (name, description = null, managerId = null) => ({
  id: generateUUID(),
  name,
  description: description || `${name} department`,
  managerId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Generate a random employee
const generateEmployee = (userId, departmentId, managerId = null) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
  
  return {
    id: generateUUID(),
    employeeId: faker.string.alphanumeric(6).toUpperCase(),
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    gender,
    position: faker.person.jobTitle(),
    hireDate: faker.date.past({ years: 5 }),
    terminationDate: null,
    salary: parseFloat(faker.finance.amount(30000, 150000, 2)),
    departmentId,
    managerId,
    userId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Generate a random leave request
const generateLeaveRequest = (employeeId, approvedById = null) => {
  const startDate = faker.date.future();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 14 }));
  
  return {
    id: generateUUID(),
    employeeId,
    leaveType: faker.helpers.arrayElement(['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other']),
    startDate,
    endDate,
    reason: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['Pending', 'Approved', 'Rejected']),
    approvedById,
    approvedAt: approvedById ? faker.date.recent() : null,
    comments: approvedById ? faker.lorem.sentence() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Generate a random attendance record
const generateAttendance = (employeeId) => {
  const date = faker.date.recent();
  const checkIn = new Date(date);
  checkIn.setHours(8 + faker.number.int({ min: 0, max: 2 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
  
  const checkOut = new Date(date);
  checkOut.setHours(17 + faker.number.int({ min: 0, max: 3 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
  
  const workHours = (checkOut - checkIn) / (1000 * 60 * 60);
  
  return {
    id: generateUUID(),
    employeeId,
    date,
    checkIn,
    checkOut,
    status: faker.helpers.arrayElement(['Present', 'Absent', 'Late', 'Half-day', 'On Leave']),
    workHours,
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

module.exports = {
  generateUUID,
  generateHashedPassword,
  generateRole,
  generateUser,
  generateDepartment,
  generateEmployee,
  generateLeaveRequest,
  generateAttendance,
};
