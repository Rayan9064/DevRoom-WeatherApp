// Test Database Connection Script
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Get current database time
    const result = await client.query('SELECT NOW()');
    console.log('📅 Current database time:', result.rows[0].now);
    
    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Available tables:');
    if (tables.rows.length === 0) {
      console.log('  ⚠️  No tables found!');
    } else {
      tables.rows.forEach(row => console.log('  ✓', row.table_name));
    }
    
    // Check table structures
    console.log('\n📋 Table Details:');
    
    for (const table of tables.rows) {
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table.table_name]);
      
      console.log(`\n  ${table.table_name}:`);
      columns.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }
    
    client.release();
    await pool.end();
    console.log('\n✅ Connection test completed successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('\n💡 Make sure:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. Database "weatherdb" exists');
    console.error('   3. .env file has correct DATABASE_URL');
    console.error('   4. Password is correct');
    process.exit(1);
  }
}

testConnection();
