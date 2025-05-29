const { Role } = require('./src/models');

async function fixAdminPermissions() {
  try {
    console.log('Fixing admin role permissions...');

    const adminRole = await Role.findOne({ where: { name: 'Admin' } });
    
    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }

    // Update admin permissions to include approve permission for leaves
    const adminPermissions = {
      employees: ['create', 'read', 'update', 'delete'],
      departments: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
      attendance: ['create', 'read', 'update', 'delete'],
      leaves: ['create', 'read', 'update', 'delete', 'approve'] // Added approve permission
    };

    await adminRole.update({
      permissions: adminPermissions
    });

    console.log('✅ Admin role permissions updated successfully!');
    console.log('Admin now has approve permission for leaves.');

  } catch (error) {
    console.error('Error updating admin permissions:', error.message);
  }
}

fixAdminPermissions();
