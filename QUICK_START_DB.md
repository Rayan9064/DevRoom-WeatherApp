# Quick Start: PostgreSQL Setup for Weather App

## 🚀 Quick Steps

### 1. Create Database (Choose ONE method)

#### Method A: Using pgAdmin (Easiest)
1. Open **pgAdmin 4** from Start Menu
2. Connect to PostgreSQL 18 server (enter password)
3. Right-click **Databases** → **Create** → **Database**
4. Name: `weatherdb` → **Save**
5. Click on `weatherdb` → **Tools** → **Query Tool**
6. Open and run: `backend\setup-database.sql`

#### Method B: Using Command Line
```powershell
# Add to PATH first (if needed):
# C:\Program Files\PostgreSQL\18\bin

# Then run:
psql -U postgres
# Enter password when prompted

# In psql:
CREATE DATABASE weatherdb;
\c weatherdb
\i 'd:/Projects/weatherapp/backend/setup-database.sql'
\q
```

### 2. Configure .env File

Edit `backend\.env` and update the DATABASE_URL:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/weatherdb
```

**⚠️ Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

### 3. Test Connection

```powershell
cd backend
npm run test:connection
```

You should see:
```
✅ Successfully connected to PostgreSQL!
📊 Available tables:
  ✓ favorites
  ✓ users
  ✓ weather_cache
```

### 4. Start Your Backend

```powershell
npm run dev
```

## 📋 Database Schema

**users**
- id, username, email, password_hash, created_at, updated_at

**favorites**
- id, user_id, city_name, country_code, latitude, longitude, created_at

**weather_cache**
- id, city_name, country_code, weather_data (JSONB), cached_at, expires_at

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ Connection refused | Check service: `Get-Service postgresql*` |
| ❌ Password failed | Verify password in `.env` file |
| ❌ Database not found | Create database using pgAdmin or psql |
| ❌ psql not found | Use pgAdmin or add to PATH |

## 📚 Useful Commands

```powershell
# Check PostgreSQL service
Get-Service postgresql*

# Test database connection
npm run test:connection

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🔗 Files Created

- ✅ `POSTGRESQL_SETUP.md` - Detailed setup guide
- ✅ `backend/setup-database.sql` - Database schema
- ✅ `backend/test-db-connection.js` - Connection test script

## 📖 Full Documentation

See `POSTGRESQL_SETUP.md` for complete documentation.
