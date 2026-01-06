require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
    console.log('🔍 Testing database connection...\n');
    
    try {
        // Test basic connection
        const timeResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        console.log('📅 Current time from database:', timeResult.rows[0].now);
        console.log('');
        
        // Check if tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('📋 Tables in database:');
        if (tablesResult.rows.length === 0) {
            console.log('   ⚠️  No tables found! Please run the schema.sql file.');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`   ✓ ${row.table_name}`);
            });
        }
        console.log('');
        
        // Check table counts
        if (tablesResult.rows.length > 0) {
            console.log('📊 Record counts:');
            
            try {
                const usersCount = await pool.query('SELECT COUNT(*) FROM users');
                console.log(`   Users: ${usersCount.rows[0].count}`);
            } catch (err) {
                console.log('   Users: Table not found');
            }
            
            try {
                const favoritesCount = await pool.query('SELECT COUNT(*) FROM favorite_cities');
                console.log(`   Favorite Cities: ${favoritesCount.rows[0].count}`);
            } catch (err) {
                console.log('   Favorite Cities: Table not found');
            }
            console.log('');
        }
        
        // Test database version
        const versionResult = await pool.query('SELECT version()');
        const version = versionResult.rows[0].version;
        console.log('🗄️  PostgreSQL Version:');
        console.log(`   ${version.split(',')[0]}`);
        console.log('');
        
        console.log('✨ All database checks passed!');
        console.log('');
        console.log('Next steps:');
        console.log('1. If tables are missing, run: psql -U postgres -d weatherdb -f src/config/schema.sql');
        console.log('2. Start the server: npm run dev');
        console.log('3. Test the API endpoints using the API_DOCUMENTATION.md');
        
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('');
        console.error('Error details:', error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('1. Make sure PostgreSQL is running');
        console.error('2. Check your DATABASE_URL in .env file');
        console.error('3. Verify the database "weatherdb" exists');
        console.error('4. Check your database credentials');
        console.error('');
        console.error('For more help, see DATABASE_SETUP.md');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();
