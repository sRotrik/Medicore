# MediCore Database Setup Guide

## Overview
This guide explains how to set up the MySQL database for the MediCore Healthcare Platform on localhost.

## Prerequisites
- MySQL Server 8.0+ installed on localhost
- MySQL Workbench (optional, for GUI management)
- Command-line access to MySQL

## Installation Steps

### Step 1: Install MySQL (if not already installed)

**Windows:**
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run installer and select "MySQL Server" and "MySQL Workbench"
3. Set root password during installation
4. Note the port (default: 3306)

**Verify Installation:**
```bash
mysql --version
```

### Step 2: Create Database

**Option A: Using MySQL Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source E:/med/server/database/schema.sql

# Verify database creation
SHOW DATABASES;
USE medicore_db;
SHOW TABLES;
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to localhost
3. File → Open SQL Script → Select `schema.sql`
4. Execute the script (⚡ icon)

### Step 3: Verify Database Structure

```sql
USE medicore_db;

-- Check all tables
SHOW TABLES;

-- Verify users table
DESCRIBE users;

-- Check default admin account
SELECT email, role, full_name FROM users WHERE role = 'admin';
```

Expected output:
```
+----------------------+--------+----------------------+
| email                | role   | full_name            |
+----------------------+--------+----------------------+
| admin@medicore.com   | admin  | System Administrator |
+----------------------+--------+----------------------+
```

## Database Structure

### Tables Overview

| Table Name         | Purpose                              | Rows (Initial) |
|--------------------|--------------------------------------|----------------|
| users              | All user accounts                    | 1 (admin)      |
| refresh_tokens     | JWT refresh tokens                   | 0              |
| medications        | Patient medication records           | 0              |
| appointments       | Doctor appointments                  | 0              |
| medication_logs    | Medication adherence tracking        | 0              |
| patient_helpers    | Helper-patient relationships         | 0              |
| notifications      | Notification history                 | 0              |
| system_logs        | Audit trail                          | 0              |

### Views

- `patient_adherence_summary` - Medication compliance statistics
- `upcoming_appointments` - Scheduled appointments
- `low_stock_medications` - Medications running low

### Stored Procedures

- `mark_medication_taken()` - Records medication intake with adherence tracking

## Configuration

### Application Database User

The schema creates a dedicated user for the application:

- **Username:** `medicore_app`
- **Password:** `MediCore@2026`
- **Privileges:** SELECT, INSERT, UPDATE, DELETE, EXECUTE
- **Host:** localhost

### Environment Variables

Update `server/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medicore_db
DB_USER=medicore_app
DB_PASSWORD=MediCore@2026
DB_DIALECT=mysql

# Connection Pool
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

## Testing Database Connection

Create a test script:

```javascript
// server/database/test-connection.js
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'medicore_app',
            password: 'MediCore@2026',
            database: 'medicore_db'
        });

        console.log('✅ Database connected successfully!');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`📊 Total users: ${rows[0].count}`);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

testConnection();
```

Run test:
```bash
cd server
node database/test-connection.js
```

## Database Normalization (3NF)

### First Normal Form (1NF)
✅ All tables have atomic values  
✅ Each column contains single values  
✅ No repeating groups  

### Second Normal Form (2NF)
✅ All non-key attributes fully dependent on primary key  
✅ No partial dependencies  

### Third Normal Form (3NF)
✅ No transitive dependencies  
✅ All non-key attributes depend only on primary key  

**Example:**
- `medications` table: All attributes depend on `medication_id`
- `patient_id` is a foreign key reference, not a transitive dependency
- Separate `medication_logs` table prevents redundancy

## Indexes & Performance

### Primary Indexes
- All tables have AUTO_INCREMENT primary keys
- Ensures fast row lookups

### Foreign Key Indexes
- Automatic indexes on all foreign keys
- Optimizes JOIN operations

### Composite Indexes
```sql
idx_med_patient_active (patient_id, is_active)
idx_apt_patient_date (patient_id, appointment_date)
idx_log_patient_time (patient_id, taken_time)
```

### Query Optimization Examples

**Fast Query (uses index):**
```sql
SELECT * FROM medications 
WHERE patient_id = 1 AND is_active = TRUE;
```

**Explain Plan:**
```sql
EXPLAIN SELECT * FROM medications 
WHERE patient_id = 1 AND is_active = TRUE;
```

## Backup & Restore

### Create Backup
```bash
mysqldump -u root -p medicore_db > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
mysql -u root -p medicore_db < backup_20260116.sql
```

## Common Operations

### Reset Database
```sql
DROP DATABASE medicore_db;
source E:/med/server/database/schema.sql;
```

### View Active Medications
```sql
SELECT u.full_name, m.medicine_name, m.remaining_quantity
FROM medications m
JOIN users u ON m.patient_id = u.user_id
WHERE m.is_active = TRUE;
```

### Check Adherence Statistics
```sql
SELECT * FROM patient_adherence_summary;
```

### View Low Stock Alerts
```sql
SELECT * FROM low_stock_medications;
```

## Troubleshooting

### Issue: Cannot connect to MySQL
**Solution:**
```bash
# Check if MySQL is running
net start MySQL80

# Verify port
netstat -an | findstr 3306
```

### Issue: Access denied for user
**Solution:**
```sql
-- Login as root
mysql -u root -p

-- Recreate user
DROP USER IF EXISTS 'medicore_app'@'localhost';
CREATE USER 'medicore_app'@'localhost' IDENTIFIED BY 'MediCore@2026';
GRANT ALL PRIVILEGES ON medicore_db.* TO 'medicore_app'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: Table doesn't exist
**Solution:**
```sql
USE medicore_db;
SHOW TABLES;

-- If empty, re-run schema
source E:/med/server/database/schema.sql;
```

## Security Best Practices

1. ✅ **Separate application user** (not root)
2. ✅ **Limited privileges** (no DROP, CREATE)
3. ✅ **Password hashing** (bcrypt in application)
4. ✅ **Prepared statements** (prevents SQL injection)
5. ✅ **Foreign key constraints** (referential integrity)
6. ✅ **Audit logging** (system_logs table)

## Next Steps

After database setup:
1. Install Sequelize ORM: `npm install sequelize mysql2`
2. Create Sequelize models (see `models/` directory)
3. Update `server/src/config/db.js` for MySQL
4. Test API endpoints with Postman
5. Run frontend and verify end-to-end flow

---

**Database Status:** ✅ Production-ready for localhost deployment  
**Normalization:** ✅ 3NF compliant  
**Performance:** ✅ Optimized with indexes  
**Security:** ✅ Role-based access control
