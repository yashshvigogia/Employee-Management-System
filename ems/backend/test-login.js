const { User, Role, Employee } = require('./src/models');
const bcrypt = require('bcrypt');

async function testLogin() {
  try {
    console.log('Testing login functionality...\n');

    // Check if admin user exists
    console.log('1. Checking if admin user exists...');
    const adminUser = await User.findOne({
      where: { username: 'admin' },
      include: [
        { model: Role, as: 'role' },
        { model: Employee, as: 'employee' }
      ]
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      
      // Check if Admin role exists
      const adminRole = await Role.findOne({ where: { name: 'Admin' } });
      if (!adminRole) {
        console.log('❌ Admin role not found. Creating roles...');
        
        // Create roles
        await Role.bulkCreate([
          { name: 'Admin', description: 'System Administrator' },
          { name: 'HR', description: 'Human Resources' },
          { name: 'Employee', description: 'Regular Employee' }
        ]);
        console.log('✓ Roles created');
      }

      // Create admin user
      const newAdminRole = await Role.findOne({ where: { name: 'Admin' } });
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@company.com',
        password: hashedPassword,
        roleId: newAdminRole.id,
        isActive: true,
        isPasswordSet: true
      });
      
      console.log('✓ Admin user created');
      return;
    }

    console.log('✓ Admin user found:', adminUser.username);
    console.log('  - Email:', adminUser.email);
    console.log('  - Role:', adminUser.role?.name);
    console.log('  - Active:', adminUser.isActive);
    console.log('  - Password Set:', adminUser.isPasswordSet);

    // Test password
    console.log('\n2. Testing password...');
    const passwordMatch = await bcrypt.compare('admin123', adminUser.password);
    console.log('✓ Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('❌ Password does not match. Updating password...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await adminUser.update({ 
        password: hashedPassword,
        isPasswordSet: true 
      });
      console.log('✓ Password updated');
    }

    console.log('\n✅ Login should work now!');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
