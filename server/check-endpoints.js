const express = require('express');
require('dotenv').config();

function checkEndpoints() {
  console.log('🔍 Checking Available API Endpoints');
  console.log('==================================');
  
  // Create a simple Express app to check routes
  const app = express();
  
  // Load the server file to check routes
  try {
    const server = require('./server.js');
    
    console.log('✅ Server file loaded successfully');
    
    // Check if the app has the class-teacher route
    const app = server.app || server;
    
    if (app && app._router) {
      console.log('✅ Express app found');
      
      // Get all routes
      const routes = [];
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        } else if (middleware.name === 'router') {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              routes.push({
                path: handler.route.path,
                methods: Object.keys(handler.route.methods)
              });
            }
          });
        }
      });
      
      console.log(`\n📋 Found ${routes.length} routes:`);
      
      // Check for class-teacher routes
      const classTeacherRoutes = routes.filter(route => 
        route.path && route.path.includes('class-teacher')
      );
      
      if (classTeacherRoutes.length > 0) {
        console.log('\n✅ Class Teacher Routes Found:');
        classTeacherRoutes.forEach(route => {
          console.log(`   ├─ ${route.methods.join(', ')} ${route.path}`);
        });
      } else {
        console.log('\n❌ No Class Teacher Routes Found');
      }
      
      // Check for teacher routes
      const teacherRoutes = routes.filter(route => 
        route.path && route.path.includes('teacher')
      );
      
      if (teacherRoutes.length > 0) {
        console.log('\n✅ Teacher Routes Found:');
        teacherRoutes.forEach(route => {
          console.log(`   ├─ ${route.methods.join(', ')} ${route.path}`);
        });
      }
      
      console.log('\n🎯 Expected Routes:');
      console.log('   ├─ GET /api/class-teacher/students');
      console.log('   ├─ GET /api/class-teacher/student/:id');
      console.log('   ├─ PUT /api/class-teacher/student/:id');
      console.log('   ├─ POST /api/class-teacher/assign-teacher');
      console.log('   ├─ POST /api/class-teacher/transition-semester');
      console.log('   ├─ GET /api/class-teacher/student/:id/history');
      
    } else {
      console.log('❌ Express app not found');
    }
    
  } catch (error) {
    console.error('❌ Error loading server:', error.message);
  }
}

checkEndpoints();
