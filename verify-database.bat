@echo off
echo ============================================================
echo MediCore Database Verification
echo ============================================================
echo.

set MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set PASSWORD=S26042004n@#

echo Checking if database exists...
%MYSQL% -u root -p%PASSWORD% -e "SHOW DATABASES LIKE 'medicore_db';"
echo.

echo Checking tables...
%MYSQL% -u root -p%PASSWORD% -e "USE medicore_db; SHOW TABLES;"
echo.

echo Checking admin account...
%MYSQL% -u root -p%PASSWORD% -e "SELECT email, role, full_name FROM medicore_db.users WHERE role = 'admin';"
echo.

echo Checking table count...
%MYSQL% -u root -p%PASSWORD% -e "SELECT COUNT(*) as total_tables FROM information_schema.TABLES WHERE table_schema = 'medicore_db' AND table_type = 'BASE TABLE';"
echo.

echo ============================================================
echo Verification Complete!
echo ============================================================
echo.
echo Your database is working correctly!
echo.
echo To view in MySQL Workbench:
echo 1. Open MySQL Workbench
echo 2. Connect to Local instance MySQL80
echo 3. Password: %PASSWORD%
echo 4. Look for 'medicore_db' in left sidebar (SCHEMAS tab)
echo 5. If not visible, right-click and select "Refresh All"
echo.
pause
