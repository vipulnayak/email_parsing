# Email Invoice Detection System - Setup Guide

## Step 1: Prerequisites Installation

1. Install Node.js (v14 or higher):
   ```bash
   # For Windows: Download from https://nodejs.org/
   # For Ubuntu/Debian:
   curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Install MongoDB:
   ```bash
   # For Windows: Download from https://www.mongodb.com/try/download/community
   # For Ubuntu/Debian:
   sudo apt-get install mongodb
   sudo systemctl start mongodb
   ```

3. Configure Gmail Account:
   - Enable 2-Step Verification in Google Account
   - Generate App Password:
     1. Go to Google Account Settings
     2. Security > 2-Step Verification
     3. App passwords > Generate
     4. Select "Mail" and "Other"
     5. Copy the generated password

## Step 2: Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/email-invoice-system.git
   cd email-invoice-system
   ```

2. Create environment files:

   Create `.env` file in server directory:
   ```bash
   cd server
   touch .env
   ```

   Add the following to `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/email-invoice-system
   EMAIL_HOST=imap.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   JWT_SECRET=your-secret-key
   EMAIL_PORT=993
   EMAIL_TLS=true
   ADMIN_EMAIL=your-email@gmail.com
   ADMIN_PASSWORD=your-admin-password
   ```

## Step 3: Install Dependencies

1. Install Server Dependencies:
   ```bash
   cd server
   npm install
   ```

2. Install Client Dependencies:
   ```bash
   cd ../client
   npm install
   ```

## Step 4: Database Setup

1. Start MongoDB:
   ```bash
   # For Windows:
   net start MongoDB
   # For Ubuntu:
   sudo systemctl start mongodb
   ```

2. Verify MongoDB is running:
   ```bash
   mongo
   # Should open MongoDB shell
   ```

## Step 5: Running the Application

1. Start the Backend Server:
   ```bash
   cd server
   npm run dev
   ```
   Server should start on http://localhost:5000

2. Start the Frontend Application:
   ```bash
   cd client
   npm start
   ```
   Frontend should open at http://localhost:3000

## Step 6: Testing the Application

1. Login Credentials:
   - Email: your-configured-admin-email
   - Password: your-configured-admin-password

2. Run Tests:
   ```bash
   cd server
   npm test
   ```

## Common Commands

### Development Commands