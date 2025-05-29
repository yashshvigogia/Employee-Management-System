const { Role } = require('./src/models');

async function updateAdminPermissions() {
  try {
    console.log('Updating admin role permissions...');

    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    
    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }

    // Update admin permissions to include all modules
    const adminPermissions = {
      employees: ['create', 'read', 'update', 'delete'],
      departments: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
      attendance: ['create', 'read', 'update', 'delete'],
      leaves: ['create', 'read', 'update', 'delete']
    };

    await adminRole.update({
      permissions: adminPermissions
    });

    console.log('✅ Admin role permissions updated successfully!');
    console.log('Admin now has full access to all modules including roles management.');

  } catch (error) {
    console.error('Error updating admin permissions:', error.message);
  }
}

updateAdminPermissions();
