# 🚀 How to Run the Smart Student Analytics Project

## 📋 Prerequisites

Make sure you have the following installed:

### Required Software:
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning)

### Verify Installation:
```bash
node --version  # Should be v16 or higher
npm --version   # Should be 8.x or higher
mongod --version # MongoDB server version
```

---

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd academic-monitor
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Or create manually if .env.example doesn't exist
```

### 3. Configure Backend Environment
Create a `.env` file in the `server` directory:

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/academic-monitor
# OR use MongoDB Atlas
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/academic-monitor

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=10h

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

---

## 🗄️ Database Setup

### Option 1: Local MongoDB
```bash
# Start MongoDB service
# On Windows
net start MongoDB

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to your `.env` file

### Initialize Database
The first time you run the server, it will automatically:
- Connect to the database
- Create all necessary collections
- Initialize the RBAC system with default roles and permissions

---

## 🚀 Running the Application

### Method 1: Run Both Separately (Recommended for Development)

#### Terminal 1: Start Backend
```bash
cd server
npm start
# OR for development with auto-restart
npm run dev
```

You should see:
```
Server running on port 5000
Connected to MongoDB
RBAC system initialized successfully
```

#### Terminal 2: Start Frontend
```bash
cd client
npm start
```

The frontend will open at: `http://localhost:3000`

### Method 2: Run with Concurrently (Both at Once)

#### Install Concurrently (in root directory)
```bash
npm install -g concurrently
```

#### Create a start script in root directory
Create `package.json` in root if it doesn't exist:

```json
{
  "name": "academic-monitor",
  "scripts": {
    "start": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm start",
    "client": "cd client && npm start"
  }
}
```

#### Run both together:
```bash
npm start
```

---

## 🔧 Default Login Credentials

After first run, you can create users through registration or use these test accounts:

### Student Account:
- **Email**: student@gmail.com
- **Password**: student123
- **Role**: Student

### Faculty Account:
- **Email**: faculty@gmail.com
- **Password**: faculty123
- **Role**: Faculty

### Admin Account:
- **Email**: admin@gmail.com
- **Password**: admin123
- **Role**: Administrator

---

## 🌐 Access Points

### Frontend Application:
- **Main URL**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register

### Backend API:
- **Base URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/
- **API Routes**: http://localhost:5000/api/

### Key API Endpoints:
```
Authentication:
POST /api/login
POST /api/register
POST /api/forgot-password

Analytics:
GET /api/analytics/student/:id
GET /api/analytics/class
GET /api/analytics/at-risk

Notifications:
GET /api/notifications
POST /api/notifications
PATCH /api/notifications/:id/read

Users:
GET /api/users
GET /api/users/:id
PUT /api/users/:id

Marks:
POST /api/add-marks
PUT /api/marks/:id
DELETE /api/marks/:id
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions:

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB  # Windows
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Kill the process or change port
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # macOS/Linux

# Kill process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # macOS/Linux
```

#### 3. Module Not Found Error
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
cd server
npm install

cd ../client
npm install
```

#### 4. CORS Error
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS policy
```
**Solution**: Backend should handle CORS automatically. If not, check server.js.

#### 5. JWT Token Error
```
Error: Token is not valid
```
**Solution**: Clear browser localStorage and login again.

#### 6. Frontend Build Issues
```
Module not found: Can't resolve 'recharts'
```
**Solution**: Install missing frontend dependencies
```bash
cd client
npm install recharts lucide-react jspdf jspdf-autotable xlsx
```

---

## 📱 Testing the Application

### 1. Test Authentication
1. Go to http://localhost:3000
2. Try registering a new user
3. Login with the credentials
4. Verify you're redirected to the correct dashboard

### 2. Test Analytics Features
1. Login as a student
2. Navigate to Analytics section
3. View performance charts and insights
4. Check risk assessment

### 3. Test Faculty Features
1. Login as faculty
2. Add marks for students
3. View student analytics
4. Send notifications

### 4. Test Admin Features
1. Login as admin
2. Manage users
3. View system analytics
4. Export reports

---

## 🔍 Development Tips

### Backend Development:
```bash
# Use nodemon for auto-restart
npm install -g nodemon
cd server
nodemon server.js
```

### Frontend Development:
```bash
# Start with environment variables
cd client
REACT_APP_API_URL=http://localhost:5000 npm start
```

### Database Management:
```bash
# Connect to MongoDB shell
mongo academic-monitor

# View collections
show collections

# Query users
db.users.find().pretty()
```

---

## 📊 Monitoring and Logs

### Backend Logs:
```bash
cd server
npm start
# Logs will appear in console
```

### Frontend Logs:
- Open browser Developer Tools (F12)
- Check Console tab for errors
- Network tab for API requests

### Database Logs:
```bash
# MongoDB logs location
# Windows: C:\data\db\mongod.log
# macOS: /usr/local/var/log/mongodb/mongo.log
# Linux: /var/log/mongodb/mongod.log
```

---

## 🚀 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-production-secret
PORT=5000
```

### Build Frontend:
```bash
cd client
npm run build
```

### Deploy Backend:
```bash
cd server
npm install --production
npm start
```

---

## 📞 Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify MongoDB** is running
3. **Check environment variables** in .env file
4. **Ensure all dependencies** are installed
5. **Check port conflicts** (3000, 5000)

### Quick Test Commands:
```bash
# Test backend
curl http://localhost:5000/

# Test database connection
node -e "require('mongoose').connect('mongodb://localhost:27017/test').then(() => console.log('DB OK'))"
```

---

## 🎉 Success Indicators

You'll know everything is working when you see:

1. **Backend Console**:
```
Server running on port 5000
Connected to MongoDB
RBAC system initialized successfully
```

2. **Frontend Browser**:
- Login page loads at http://localhost:3000
- Can register and login successfully
- Dashboard loads with user data
- Charts and analytics display correctly

3. **Database**:
- Collections are created automatically
- User data is stored correctly
- Analytics data is generated

🎊 **Your Smart Student Analytics System is now running!**
