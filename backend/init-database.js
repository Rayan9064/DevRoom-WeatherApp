// Database initialization script
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Connecting to database...');
        
        // Read schema file
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const schemaPath = join(__dirname, 'src', 'config', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');
        
        console.log('📝 Executing schema...');
        
        // Execute the schema
        await client.query(schema);
        
        console.log('✅ Database initialized successfully!');
        console.log('');
        console.log('Tables created:');
        console.log('  - users');
        console.log('  - favorite_cities');
        console.log('  - refresh_tokens');
        console.log('  - otps');
        console.log('');
        
        // Verify tables exist
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        console.log('✅ Verified tables in database:');
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        console.error('');
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

initDatabase();
