const { Role } = require('./src/models');

async function updateRolePermissions() {
  try {
    console.log('Updating role permissions...');

    // Update HR Manager role
    const hrRole = await Role.findOne({ where: { name: 'HR Manager' } });
    if (hrRole) {
      await hrRole.update({
        permissions: {
          employees: ['create', 'read', 'update', 'delete'],
          departments: ['create', 'read', 'update', 'delete'],
          roles: ['read'],
          attendance: ['read', 'update'],
          leaves: ['create', 'read', 'update', 'delete', 'approve'] // Added approve
        }
      });
      console.log('✅ Updated HR Manager permissions');
    }

    // Update Department Manager role
    const deptRole = await Role.findOne({ where: { name: 'Department Manager' } });
    if (deptRole) {
      await deptRole.update({
        permissions: {
          employees: ['read', 'update'],
          departments: ['read'],
          roles: [],
          attendance: ['read'],
          leaves: ['read', 'update', 'approve'] // Added approve for dept managers
        }
      });
      console.log('✅ Updated Department Manager permissions');
    }

    // Update Team Lead role
    const teamRole = await Role.findOne({ where: { name: 'Team Lead' } });
    if (teamRole) {
      await teamRole.update({
        permissions: {
          employees: ['read'],
          departments: ['read'],
          roles: [],
          attendance: ['read'],
          leaves: ['read', 'approve'] // Added approve for team leads
        }
      });
      console.log('✅ Updated Team Lead permissions');
    }

    // Update Employee role
    const empRole = await Role.findOne({ where: { name: 'Employee' } });
    if (empRole) {
      await empRole.update({
        permissions: {
          employees: ['read'], // Can read own profile
          departments: ['read'],
          roles: [],
          attendance: ['create', 'read'], // Can mark own attendance
          leaves: ['create', 'read'] // Can apply for leave and view own
        }
      });
      console.log('✅ Updated Employee permissions');
    }

    console.log('\n🎉 All role permissions updated successfully!');
    console.log('Roles with leave approval permissions:');
    console.log('- Admin: Full access');
    console.log('- HR Manager: Full leave management');
    console.log('- Department Manager: Can approve team leaves');
    console.log('- Team Lead: Can approve subordinate leaves');

  } catch (error) {
    console.error('Error updating role permissions:', error.message);
  }
}

updateRolePermissions();
