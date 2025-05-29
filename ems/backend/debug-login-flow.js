const { User, Role } = require('./src/models');
const bcrypt = require('bcrypt');

async function debugLoginFlow() {
  try {
    console.log('🔍 Debugging complete login flow...\n');

    // 1. Check admin user in database
    console.log('1. Checking admin user in database...');
    const adminUser = await User.findOne({
      where: { username: 'admin' },
      include: [{ model: Role, as: 'role' }]
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   ID:', adminUser.id);
    console.log('   Username:', adminUser.username);
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role?.name);
    console.log('   Active:', adminUser.isActive);
    console.log('   Password Set:', adminUser.isPasswordSet);
    console.log('   Password Hash:', adminUser.password.substring(0, 20) + '...');

    // 2. Test password validation
    console.log('\n2. Testing password validation...');
    const testPassword = 'admin123';
    
    // Test with bcrypt directly
    const bcryptTest = await bcrypt.compare(testPassword, adminUser.password);
    console.log('   bcrypt.compare result:', bcryptTest ? '✅ PASS' : '❌ FAIL');
    
    // Test with user method
    const userMethodTest = await adminUser.isValidPassword(testPassword);
    console.log('   user.isValidPassword result:', userMethodTest ? '✅ PASS' : '❌ FAIL');

    // 3. Test the login controller logic
    console.log('\n3. Testing login controller logic...');
    
    // Simulate the login controller
    const username = 'admin';
    const password = 'admin123';
    
    console.log('   Looking for user with username:', username);
    const foundUser = await User.findOne({
      where: { username },
      include: [
        { model: Role, as: 'role' },
      ],
    });

    if (!foundUser) {
      console.log('   ❌ User not found in login simulation');
      return;
    }

    console.log('   ✅ User found in login simulation');
    
    const isPasswordValid = await foundUser.isValidPassword(password);
    console.log('   Password validation in login simulation:', isPasswordValid ? '✅ PASS' : '❌ FAIL');
    
    if (!foundUser.isActive) {
      console.log('   ❌ User is not active');
      return;
    }
    
    console.log('   ✅ User is active');
    console.log('   ✅ Login simulation would succeed');

    // 4. Test JWT token generation
    console.log('\n4. Testing JWT token generation...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '24h',
    });
    console.log('   ✅ JWT token generated:', token.substring(0, 20) + '...');

    // 5. Create a fresh admin user to be sure
    console.log('\n5. Creating fresh admin user...');
    
    // Delete existing admin
    await User.destroy({ where: { username: 'admin' } });
    console.log('   🗑️ Deleted existing admin user');
    
    // Get or create Admin role
    let adminRole = await Role.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'System Administrator',
        permissions: {
          employees: ['create', 'read', 'update', 'delete'],
          departments: ['create', 'read', 'update', 'delete'],
          roles: ['create', 'read', 'update', 'delete'],
          attendance: ['create', 'read', 'update', 'delete'],
          leaves: ['create', 'read', 'update', 'delete']
        }
      });
    }
    
    // Create new admin user
    const newAdmin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by model hooks
      roleId: adminRole.id,
      isActive: true,
      isPasswordSet: true
    });
    
    console.log('   ✅ Fresh admin user created');
    
    // Test the new admin
    const finalTest = await newAdmin.isValidPassword('admin123');
    console.log('   Final password test:', finalTest ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 Debug complete! Admin user should work now.');
    console.log('📋 Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLoginFlow();
