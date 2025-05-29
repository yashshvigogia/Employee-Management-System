const { sequelize } = require('../models');

async function addPasswordTokenColumns() {
  try {
    console.log('Adding password token columns to Users table...');
    
    // Add the new columns
    await sequelize.query(`
      ALTER TABLE "Users" 
      ADD COLUMN IF NOT EXISTS "passwordSetupToken" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "passwordSetupTokenExpires" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "passwordResetToken" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "passwordResetTokenExpires" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "isPasswordSet" BOOLEAN DEFAULT false;
    `);
    
    console.log('Password token columns added successfully!');
    
    // Update existing users to have isPasswordSet = true
    await sequelize.query(`
      UPDATE "Users" 
      SET "isPasswordSet" = true 
      WHERE "isPasswordSet" IS NULL OR "isPasswordSet" = false;
    `);
    
    console.log('Updated existing users to have isPasswordSet = true');
    
  } catch (error) {
    console.error('Error adding password token columns:', error);
  } finally {
    await sequelize.close();
  }
}

addPasswordTokenColumns();
