# Database Setup Guide

This guide will help you set up PostgreSQL for the Weather Dashboard application.

## Prerequisites

- PostgreSQL 14 or higher installed
- Access to PostgreSQL command line or pgAdmin

## Option 1: Command Line Setup (Recommended)

### Step 1: Access PostgreSQL

**Windows:**
```bash
# Using psql (PostgreSQL command line)
psql -U postgres
```

**macOS/Linux:**
```bash
sudo -u postgres psql
```

### Step 2: Create Database

```sql
-- Create the database
CREATE DATABASE weatherdb;

-- Connect to the database
\c weatherdb

-- Verify connection
SELECT current_database();
```

### Step 3: Run Schema

Copy and paste the contents of `backend/src/config/schema.sql` or run:

```bash
# From the backend directory
psql -U postgres -d weatherdb -f src/config/schema.sql
```

### Step 4: Verify Tables

```sql
-- List all tables
\dt

-- You should see:
-- users
-- favorite_cities
```

### Step 5: Create Database User (Optional but Recommended)

```sql
-- Create a dedicated user for the application
CREATE USER weatherapp_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE weatherdb TO weatherapp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO weatherapp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO weatherapp_user;
```

### Step 6: Update .env File

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

# Database - Update with your credentials
DATABASE_URL=postgresql://weatherapp_user:your_secure_password@localhost:5432/weatherdb

# Or if using default postgres user:
# DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/weatherdb

# JWT Secret - Generate a strong random string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# OpenWeatherMap API Key - Get from https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweathermap_api_key_here

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Option 2: Using pgAdmin (GUI)

### Step 1: Open pgAdmin

1. Launch pgAdmin
2. Connect to your PostgreSQL server

### Step 2: Create Database

1. Right-click on "Databases"
2. Select "Create" → "Database"
3. Name: `weatherdb`
4. Owner: `postgres` (or your preferred user)
5. Click "Save"

### Step 3: Run Schema

1. Select the `weatherdb` database
2. Click on "Tools" → "Query Tool"
3. Copy the contents of `backend/src/config/schema.sql`
4. Paste into the query tool
5. Click "Execute" (F5)

### Step 4: Verify

1. Expand `weatherdb` → `Schemas` → `public` → `Tables`
2. You should see `users` and `favorite_cities`

---

## Option 3: Docker (Alternative)

If you prefer using Docker:

```bash
# Run PostgreSQL in Docker
docker run --name weatherdb-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=weatherdb \
  -p 5432:5432 \
  -d postgres:14

# Wait a few seconds for PostgreSQL to start

# Run the schema
docker exec -i weatherdb-postgres psql -U postgres -d weatherdb < backend/src/config/schema.sql
```

**Update .env:**
```env
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/weatherdb
```

---

## Testing Database Connection

### Method 1: Using Node.js Script

Create a test file `backend/test-db.js`:

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        console.log('Current time from database:', result.rows[0].now);
        
        // Test tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\n📋 Tables in database:');
        tables.rows.forEach(row => console.log('  -', row.table_name));
        
        await pool.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
```

Run the test:
```bash
cd backend
node test-db.js
```

### Method 2: Using psql

```bash
psql -U postgres -d weatherdb -c "SELECT * FROM users;"
psql -U postgres -d weatherdb -c "SELECT * FROM favorite_cities;"
```

---

## Getting OpenWeatherMap API Key

1. Go to [https://openweathermap.org/](https://openweathermap.org/)
2. Click "Sign Up" (top right)
3. Create a free account
4. After login, go to "API keys" section
5. Copy your API key
6. Add it to your `.env` file

**Note:** Free tier includes:
- 60 calls/minute
- 1,000,000 calls/month
- Current weather data
- Perfect for development!

---

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Start PostgreSQL if not running:
   ```bash
   # Windows
   sc start postgresql-x64-14
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

### Authentication Failed

**Error:** `password authentication failed for user "postgres"`

**Solutions:**
1. Reset PostgreSQL password
2. Check `pg_hba.conf` file
3. Use correct credentials in `.env`

### Database Does Not Exist

**Error:** `database "weatherdb" does not exist`

**Solution:**
Run the database creation commands from Step 2 above.

### Permission Denied

**Error:** `permission denied for table users`

**Solution:**
Grant proper privileges:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

---

## Next Steps

After successful database setup:

1. ✅ Verify `.env` file is configured
2. ✅ Test database connection
3. ✅ Start the backend server: `npm run dev`
4. ✅ Test API endpoints using the API documentation

---

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to database
\c weatherdb

-- List all tables
\dt

-- Describe table structure
\d users
\d favorite_cities

-- View all users
SELECT * FROM users;

-- View all favorites
SELECT * FROM favorite_cities;

-- Count records
SELECT COUNT(*) FROM users;

-- Delete all data (careful!)
TRUNCATE TABLE favorite_cities CASCADE;
TRUNCATE TABLE users CASCADE;

-- Drop database (careful!)
DROP DATABASE weatherdb;

-- Exit psql
\q
```

---

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** for database users
3. **Use different credentials** for development and production
4. **Rotate JWT secrets** regularly in production
5. **Use environment-specific** database instances

---

For more help, refer to:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
