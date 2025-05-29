const { Role } = require('./src/models');

async function createSampleRoles() {
  try {
    console.log('Creating sample roles...');

    // Check if roles already exist
    const existingRoles = await Role.findAll();
    console.log(`Found ${existingRoles.length} existing roles`);

    const sampleRoles = [
      {
        name: 'HR Manager',
        description: 'Human Resources Manager with full HR access',
        permissions: {
          employees: ['create', 'read', 'update', 'delete'],
          departments: ['create', 'read', 'update', 'delete'],
          roles: ['read'],
          attendance: ['read', 'update'],
          leaves: ['create', 'read', 'update', 'delete']
        }
      },
      {
        name: 'Department Manager',
        description: 'Department Manager with limited management access',
        permissions: {
          employees: ['read', 'update'],
          departments: ['read'],
          roles: [],
          attendance: ['read'],
          leaves: ['read', 'update']
        }
      },
      {
        name: 'Team Lead',
        description: 'Team Lead with team management capabilities',
        permissions: {
          employees: ['read'],
          departments: ['read'],
          roles: [],
          attendance: ['read'],
          leaves: ['read']
        }
      }
    ];

    for (const roleData of sampleRoles) {
      const existingRole = await Role.findOne({ where: { name: roleData.name } });
      
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⚠️ Role already exists: ${roleData.name}`);
      }
    }

    console.log('\n🎉 Sample roles setup complete!');
    console.log('You can now manage roles through the admin interface.');

  } catch (error) {
    console.error('Error creating sample roles:', error.message);
  }
}

createSampleRoles();
