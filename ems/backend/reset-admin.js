const { sequelize } = require('./src/models');
const bcrypt = require('bcrypt');

async function resetAdmin() {
  try {
    console.log('Resetting admin password...');
    
    // Hash the password manually
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update admin user directly in database
    const [updatedRows] = await sequelize.query(`
      UPDATE "Users" 
      SET password = :password, 
          "isPasswordSet" = true, 
          "isActive" = true,
          "updatedAt" = NOW()
      WHERE username = 'admin'
    `, {
      replacements: { password: hashedPassword }
    });
    
    console.log('Updated rows:', updatedRows);
    
    // Verify the update
    const [users] = await sequelize.query(`
      SELECT username, email, "isActive", "isPasswordSet" 
      FROM "Users" 
      WHERE username = 'admin'
    `);
    
    console.log('Admin user after update:', users[0]);
    
    // Test password
    if (users[0]) {
      const [passwordCheck] = await sequelize.query(`
        SELECT password FROM "Users" WHERE username = 'admin'
      `);
      
      const isValid = await bcrypt.compare('admin123', passwordCheck[0].password);
      console.log('Password validation test:', isValid ? 'PASS' : 'FAIL');
    }
    
    console.log('Admin reset complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetAdmin();
