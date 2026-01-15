# 🚀 Automated Project Restructuring Script
# Run this PowerShell script to automatically separate frontend and backend

# Step 1: Create new project structure
Write-Host "Creating new project structure..." -ForegroundColor Green

# Create main directory
$rootPath = "e:\medicore-platform"
New-Item -ItemType Directory -Path $rootPath -Force | Out-Null

# Create subdirectories
New-Item -ItemType Directory -Path "$rootPath\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "$rootPath\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$rootPath\docs" -Force | Out-Null

Write-Host "✅ Folders created" -ForegroundColor Green

# Step 2: Copy frontend files
Write-Host "`nCopying frontend files..." -ForegroundColor Green

$sourcePath = "e:\med"

# Copy src folder
Copy-Item -Path "$sourcePath\src" -Destination "$rootPath\frontend\src" -Recurse -Force
Write-Host "  ✅ src folder copied" -ForegroundColor Gray

# Copy public folder
if (Test-Path "$sourcePath\public") {
    Copy-Item -Path "$sourcePath\public" -Destination "$rootPath\frontend\public" -Recurse -Force
    Write-Host "  ✅ public folder copied" -ForegroundColor Gray
}

# Copy config files
$configFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    ".eslintrc.cjs"
)

foreach ($file in $configFiles) {
    if (Test-Path "$sourcePath\$file") {
        Copy-Item -Path "$sourcePath\$file" -Destination "$rootPath\frontend\$file" -Force
        Write-Host "  ✅ $file copied" -ForegroundColor Gray
    }
}

# Step 3: Copy documentation files
Write-Host "`nCopying documentation files..." -ForegroundColor Green

$docFiles = Get-ChildItem -Path $sourcePath -Filter "*.md"
foreach ($doc in $docFiles) {
    Copy-Item -Path $doc.FullName -Destination "$rootPath\docs\$($doc.Name)" -Force
    Write-Host "  ✅ $($doc.Name) copied" -ForegroundColor Gray
}

# Step 4: Create backend structure
Write-Host "`nCreating backend structure..." -ForegroundColor Green

$backendDirs = @(
    "src",
    "src\controllers",
    "src\models",
    "src\routes",
    "src\middleware",
    "src\services",
    "src\jobs",
    "src\config",
    "src\utils",
    "uploads"
)

foreach ($dir in $backendDirs) {
    New-Item -ItemType Directory -Path "$rootPath\backend\$dir" -Force | Out-Null
}
Write-Host "  ✅ Backend folders created" -ForegroundColor Gray

# Step 5: Create environment files
Write-Host "`nCreating environment files..." -ForegroundColor Green

# Frontend .env
$frontendEnv = @"
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MediCore
"@
Set-Content -Path "$rootPath\frontend\.env" -Value $frontendEnv
Write-Host "  ✅ frontend\.env created" -ForegroundColor Gray

# Backend .env
$backendEnv = @"
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medicore

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
"@
Set-Content -Path "$rootPath\backend\.env" -Value $backendEnv
Write-Host "  ✅ backend\.env created" -ForegroundColor Gray

# Step 6: Create backend package.json
Write-Host "`nCreating backend package.json..." -ForegroundColor Green

$backendPackageJson = @"
{
  "name": "medicore-backend",
  "version": "1.0.0",
  "description": "MediCore Healthcare Platform - Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "keywords": ["healthcare", "medication", "appointment"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "node-cron": "^3.0.3",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
"@
Set-Content -Path "$rootPath\backend\package.json" -Value $backendPackageJson
Write-Host "  ✅ backend\package.json created" -ForegroundColor Gray

# Step 7: Create .gitignore
Write-Host "`nCreating .gitignore..." -ForegroundColor Green

$gitignore = @"
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
frontend/.env
backend/.env

# Build outputs
frontend/dist/
frontend/build/

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
"@
Set-Content -Path "$rootPath\.gitignore" -Value $gitignore
Write-Host "  ✅ .gitignore created" -ForegroundColor Gray

# Step 8: Create root README
Write-Host "`nCreating root README..." -ForegroundColor Green

$rootReadme = @"
# MediCore Healthcare Platform

A comprehensive healthcare management system with medication tracking, appointment scheduling, and multi-role access.

## 🏗️ Project Structure

``````
medicore-platform/
├── frontend/    - React + Vite frontend
├── backend/     - Node.js + Express backend
└── docs/        - Documentation
``````

## 🚀 Quick Start

### Frontend
``````bash
cd frontend
npm install
npm run dev
``````
Runs on: http://localhost:5173

### Backend
``````bash
cd backend
npm install
npm run dev
``````
Runs on: http://localhost:5000

## 📚 Documentation

See ``/docs`` folder for complete documentation.

## 🔑 Features

- 👤 Patient Portal - Medication & appointment management
- 🤝 Helper Portal - Patient monitoring
- 🛡️ Admin Portal - System management
- 📧 Email notifications
- 📊 Real-time analytics

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router

**Backend:**
- Node.js
- Express
- MongoDB
- JWT Authentication
- Nodemailer

## 📄 License

MIT
"@
Set-Content -Path "$rootPath\README.md" -Value $rootReadme
Write-Host "  ✅ README.md created" -ForegroundColor Gray

# Step 9: Update frontend package.json name
Write-Host "`nUpdating frontend package.json..." -ForegroundColor Green

$frontendPackageJsonPath = "$rootPath\frontend\package.json"
if (Test-Path $frontendPackageJsonPath) {
    $packageJson = Get-Content $frontendPackageJsonPath -Raw | ConvertFrom-Json
    $packageJson.name = "medicore-frontend"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $frontendPackageJsonPath
    Write-Host "  ✅ Frontend package.json updated" -ForegroundColor Gray
}

# Step 10: Create basic server.js
Write-Host "`nCreating basic server.js..." -ForegroundColor Green

$serverJs = @"
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'MediCore API Server' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 MediCore Backend Server');
  console.log('📡 Server running on port ' + PORT);
  console.log('🌍 Environment: ' + process.env.NODE_ENV);
  console.log('✅ Ready to accept connections');
});
"@
Set-Content -Path "$rootPath\backend\server.js" -Value $serverJs
Write-Host "  ✅ server.js created" -ForegroundColor Gray

# Final summary
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ PROJECT RESTRUCTURING COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 New project location: $rootPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd $rootPath\frontend" -ForegroundColor White
Write-Host "  2. npm install" -ForegroundColor White
Write-Host "  3. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  4. Open new terminal" -ForegroundColor White
Write-Host "  5. cd $rootPath\backend" -ForegroundColor White
Write-Host "  6. npm install" -ForegroundColor White
Write-Host "  7. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Check docs folder for all documentation" -ForegroundColor Cyan
Write-Host ""
