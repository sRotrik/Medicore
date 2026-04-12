# MediCore Database Setup Script (PowerShell)
# Automated database creation

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "MediCore Healthcare Platform - Database Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# MySQL path
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schemaPath = "E:\med\server\database\schema.sql"

# Check if MySQL exists
if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL not found at $mysqlPath" -ForegroundColor Red
    Write-Host "Please ensure MySQL is installed." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Testing MySQL connection..." -ForegroundColor Green
& $mysqlPath --version

Write-Host ""
Write-Host "Step 2: Creating database and tables..." -ForegroundColor Green
Write-Host "Please enter your MySQL root password when prompted." -ForegroundColor Yellow
Write-Host ""

# Prompt for password securely
$password = Read-Host "Enter MySQL root password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Run MySQL command
try {
    $process = Start-Process -FilePath $mysqlPath `
        -ArgumentList "-u", "root", "-p$plainPassword", "-e", "source $schemaPath" `
        -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "SUCCESS! Database created successfully!" -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Database: medicore_db" -ForegroundColor Cyan
        Write-Host "Tables: 8 tables created" -ForegroundColor Cyan
        Write-Host "Admin user: admin@medicore.com (password: Admin@123)" -ForegroundColor Cyan
        Write-Host "App user: medicore_app (password: MediCore@2026)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next step: Run 'node database\test-connection.js' to verify" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ERROR: Failed to create database!" -ForegroundColor Red
        Write-Host "Please check your password and try again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
