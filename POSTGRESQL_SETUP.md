# PostgreSQL Setup Guide for Weather App

## ✅ PostgreSQL is Already Installed!

Good news! PostgreSQL 18 is already installed and running on your system.

## Step 1: Create the Database

You have two options to create the database:

### Option A: Using pgAdmin (GUI - Recommended for Windows)

1. **Open pgAdmin 4**
   - Search for "pgAdmin" in Windows Start Menu
   - Launch pgAdmin 4

2. **Connect to PostgreSQL Server**
   - Expand "Servers" in the left sidebar
   - Click on "PostgreSQL 18" (or similar)
   - Enter your postgres password when prompted

3. **Create the Database**
   - Right-click on "Databases"
   - Select "Create" → "Database..."
   - Database name: `weatherdb`
   - Owner: `postgres` (or your preferred user)
   - Click "Save"

4. **Run the Setup Script**
   - Click on the newly created `weatherdb` database
   - Click on "Tools" → "Query Tool"
   - Open the file: `d:\Projects\weatherapp\backend\setup-database.sql`
   - Click the "Execute" button (▶️) or press F5
   - Verify that all tables were created successfully

### Option B: Using Command Line (psql)

1. **Add PostgreSQL to PATH** (if not already done)
   - Open System Environment Variables
   - Add to PATH: `C:\Program Files\PostgreSQL\18\bin`
   - Restart your terminal

2. **Connect to PostgreSQL**
   ```powershell
   # Connect as postgres user
   psql -U postgres
   ```

3. **Create Database and Run Script**
   ```sql
   -- Create the database
   CREATE DATABASE weatherdb;
   
   -- Connect to the database
   \c weatherdb
   
   -- Run the setup script
   \i 'd:/Projects/weatherapp/backend/setup-database.sql'
   
   -- Verify tables
   \dt
   
   -- Exit
   \q
   ```

## Step 2: Configure Your Backend Connection

### Update your `.env` file

Your `.env` file should contain the following database configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/weatherdb
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

### Alternative: Create a Dedicated Database User (Recommended for Production)

For better security, create a dedicated user for your app:

```sql
-- Connect to PostgreSQL as postgres user
CREATE USER weatherapp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE weatherdb TO weatherapp_user;

-- Connect to weatherdb
\c weatherdb

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO weatherapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO weatherapp_user;
```

Then update your `.env`:
```env
DATABASE_URL=postgresql://weatherapp_user:your_secure_password@localhost:5432/weatherdb
```

## Step 3: Test the Connection

### Install PostgreSQL Client for Node.js

Make sure you have the required dependencies:

```powershell
cd backend
npm install pg pg-hstore
```

### Test Connection Script

Create a test file to verify your connection:

```javascript
// backend/test-db-connection.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Available tables:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    client.release();
    await pool.end();
    console.log('\n✅ Connection test completed successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
```

Run the test:
```powershell
node backend/test-db-connection.js
```

## Step 4: Database Schema Overview

Your Weather App database includes:

### **users** table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password (bcrypt)
- `created_at`, `updated_at`: Timestamps

### **favorites** table
- `id`: Primary key
- `user_id`: Foreign key to users
- `city_name`: Name of the favorite city
- `country_code`: Country code
- `latitude`, `longitude`: Coordinates
- `created_at`: Timestamp

### **weather_cache** table (optional)
- Caches weather API responses to reduce API calls
- Includes expiration time for automatic cleanup

## Troubleshooting

### Connection Refused
- Verify PostgreSQL service is running: `Get-Service postgresql*`
- Check if port 5432 is open: `netstat -an | findstr 5432`

### Authentication Failed
- Double-check your password in `.env`
- Verify user has proper permissions
- Check `pg_hba.conf` for authentication settings

### Cannot Find psql Command
- Add PostgreSQL bin directory to PATH
- Use pgAdmin instead
- Use full path: `"C:\Program Files\PostgreSQL\18\bin\psql.exe"`

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to a database
\c weatherdb

-- List all tables
\dt

-- Describe a table
\d users

-- View table data
SELECT * FROM users;

-- Drop database (careful!)
DROP DATABASE weatherdb;
```

## Next Steps

1. ✅ Create the database
2. ✅ Run the setup script
3. ✅ Configure your `.env` file
4. ✅ Test the connection
5. 🚀 Start your backend server!

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
