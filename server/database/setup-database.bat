@echo off
REM MediCore Database Setup Script
REM This script creates the database and tables

echo ============================================================
echo MediCore Healthcare Platform - Database Setup
echo ============================================================
echo.

REM Set MySQL path
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

echo Step 1: Testing MySQL connection...
%MYSQL_PATH% --version
if errorlevel 1 (
    echo ERROR: MySQL not found!
    echo Please ensure MySQL is installed.
    pause
    exit /b 1
)

echo.
echo Step 2: Creating database and tables...
echo Please enter your MySQL root password when prompted.
echo.

REM Run the schema file
%MYSQL_PATH% -u root -p < "E:\med\server\database\schema.sql"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create database!
    echo Please check your root password and try again.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo SUCCESS! Database created successfully!
echo ============================================================
echo.
echo Database: medicore_db
echo Tables: 8 tables created
echo Admin user: admin@medicore.com (password: Admin@123)
echo App user: medicore_app (password: MediCore@2026)
echo.
echo Next step: Run 'node database\test-connection.js' to verify
echo ============================================================
echo.

pause
