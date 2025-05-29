const { User, Role } = require('./src/models');

async function createAdmin() {
  try {
    console.log('Creating fresh admin user...');

    // Delete existing admin
    await User.destroy({ where: { username: 'admin' } });
    
    // Get or create Admin role
    let adminRole = await Role.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'System Administrator'
      });
    }
    
    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by model hooks
      roleId: adminRole.id,
      isActive: true,
      isPasswordSet: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    // Test the password
    const isValid = await admin.isValidPassword('admin123');
    console.log('Password test:', isValid ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createAdmin();
