require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testDatabase() {
  console.log('Testing database connection...');
  
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('Current time from DB:', result[0][0].current_time);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure PostgreSQL is running and the database exists.');
  } finally {
    await sequelize.close();
  }
}

testDatabase();
