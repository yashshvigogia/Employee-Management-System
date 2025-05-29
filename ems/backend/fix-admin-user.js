const { User, Role } = require('./src/models');
const bcrypt = require('bcrypt');

async function fixAdminUser() {
  try {
    console.log('🔧 Fixing admin user...\n');

    // Check if admin user exists
    console.log('1. Checking admin user...');
    let adminUser = await User.findOne({
      where: { username: 'admin' },
      include: [{ model: Role, as: 'role' }]
    });

    if (adminUser) {
      console.log('✅ Admin user found');
      console.log('   Username:', adminUser.username);
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role?.name);
      console.log('   Active:', adminUser.isActive);
      console.log('   Password Set:', adminUser.isPasswordSet);
    } else {
      console.log('❌ Admin user not found');
    }

    // Check if Admin role exists
    console.log('\n2. Checking Admin role...');
    let adminRole = await Role.findOne({ where: { name: 'Admin' } });

    if (!adminRole) {
      console.log('❌ Admin role not found. Creating...');
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
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role found');
    }

    // Create or update admin user
    console.log('\n3. Creating/updating admin user...');
    // Don't hash manually - let the model hooks handle it

    if (adminUser) {
      // Update existing admin user
      await adminUser.update({
        password: 'admin123', // Plain text - model will hash it
        email: 'admin@example.com',
        roleId: adminRole.id,
        isActive: true,
        isPasswordSet: true
      });
      console.log('✅ Admin user updated');
    } else {
      // Create new admin user
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Plain text - model will hash it
        roleId: adminRole.id,
        isActive: true,
        isPasswordSet: true
      });
      console.log('✅ Admin user created');
    }

    // Test password
    console.log('\n4. Testing password...');
    const passwordMatch = await bcrypt.compare('admin123', adminUser.password);
    console.log('Password test result:', passwordMatch ? '✅ PASS' : '❌ FAIL');

    // Test login method
    console.log('\n5. Testing user login method...');
    if (typeof adminUser.isValidPassword === 'function') {
      const loginTest = await adminUser.isValidPassword('admin123');
      console.log('Login method test:', loginTest ? '✅ PASS' : '❌ FAIL');
    } else {
      console.log('❌ isValidPassword method not found');
    }

    console.log('\n🎉 Admin user fix complete!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
  }
}

fixAdminUser();
