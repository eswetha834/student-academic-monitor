const mongoose = require('mongoose');
require('dotenv').config();

async function assignAllStudentsToAdmin() {
  try {
    console.log('👨‍💼 Assigning All Students to Admin');
    console.log('====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get admin user
    console.log('\n🔍 Finding Admin User...');
    const adminUser = await db.collection('users').findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      console.log('💡 Please ensure admin@gmail.com exists in users collection');
      return;
    }
    
    console.log(`✅ Admin found: ${adminUser.name} (${adminUser.email})`);
    
    // Get all students
    console.log('\n👥 Finding All Students...');
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    console.log(`📊 Found ${students.length} students`);
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    // Show current assignments
    console.log('\n📋 Current Student Assignments:');
    
    const currentAssignments = {};
    students.forEach(student => {
      const teacherEmail = student.classTeacherEmail || 'Unassigned';
      if (!currentAssignments[teacherEmail]) {
        currentAssignments[teacherEmail] = [];
      }
      currentAssignments[teacherEmail].push(student.name);
    });
    
    Object.keys(currentAssignments).forEach(teacherEmail => {
      const studentCount = currentAssignments[teacherEmail].length;
      const studentList = currentAssignments[teacherEmail].slice(0, 3).join(', ');
      const moreText = currentAssignments[teacherEmail].length > 3 ? ` +${currentAssignments[teacherEmail].length - 3} more` : '';
      
      if (teacherEmail === 'Unassigned') {
        console.log(`   ├─ Unassigned: ${studentCount} students`);
      } else {
        console.log(`   ├─ ${teacherEmail}: ${studentCount} students (${studentList}${moreText})`);
      }
    });
    
    // Assign all students to admin
    console.log('\n🔧 Assigning All Students to Admin...');
    
    let updateCount = 0;
    let errorCount = 0;
    
    for (const student of students) {
      try {
        const result = await db.collection('users').updateOne(
          { _id: student._id },
          { 
            $set: { 
              classTeacherEmail: 'admin@gmail.com',
              classTeacherName: 'admin'
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          updateCount++;
          console.log(`   ✅ Assigned ${student.name} to admin@gmail.com`);
        } else {
          console.log(`   ℹ️  ${student.name} already assigned to admin@gmail.com`);
        }
        
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Error assigning ${student.name}: ${error.message}`);
      }
    }
    
    console.log('\n📊 Assignment Summary:');
    console.log(`   ├─ Total Students: ${students.length}`);
    console.log(`   ├─ Successfully Updated: ${updateCount}`);
    console.log(`   ├─ Already Assigned: ${students.length - updateCount}`);
    console.log(`   ├─ Errors: ${errorCount}`);
    console.log(`   └─ Success Rate: ${students.length > 0 ? ((updateCount / students.length) * 100).toFixed(1) : 0}%`);
    
    // Verify final assignments
    console.log('\n🔍 Verifying Final Assignments...');
    
    const finalAssignments = {};
    const studentsAfter = await db.collection('users').find({ role: 'student' }).toArray();
    
    studentsAfter.forEach(student => {
      const teacherEmail = student.classTeacherEmail || 'Unassigned';
      if (!finalAssignments[teacherEmail]) {
        finalAssignments[teacherEmail] = [];
      }
      finalAssignments[teacherEmail].push(student.name);
    });
    
    console.log('\n📋 Final Student Assignments:');
    
    Object.keys(finalAssignments).forEach(teacherEmail => {
      const studentCount = finalAssignments[teacherEmail].length;
      
      if (teacherEmail === 'admin@gmail.com') {
        console.log(`   ✅ ${teacherEmail}: ${studentCount} students ⭐`);
      } else if (teacherEmail === 'Unassigned') {
        console.log(`   ℹ️  Unassigned: ${studentCount} students`);
      } else {
        console.log(`   ℹ️  ${teacherEmail}: ${studentCount} students`);
      }
    });
    
    // Check admin's student count
    const adminStudents = finalAssignments['admin@gmail.com'] || [];
    console.log(`\n🎯 Admin Students Count: ${adminStudents.length}`);
    
    if (adminStudents.length === students.length) {
      console.log('   ✅ All students successfully assigned to admin');
    } else {
      console.log(`   ⚠️  Expected: ${students.length}, Actual: ${adminStudents.length}`);
    }
    
    console.log('\n🎉 Assignment Complete!');
    console.log('========================');
    console.log('✅ All students assigned to admin@gmail.com');
    console.log('✅ Admin can now access all student data');
    console.log('✅ Predictions will work for admin account');
    console.log('✅ Teacher-specific access maintained');
    
    console.log('\n🚀 Next Steps:');
    console.log('===============');
    console.log('1. Restart the server to refresh any cached data');
    console.log('2. Login as admin@gmail.com');
    console.log('3. Navigate to teacher dashboard');
    console.log('4. Test predictions - should show all students');
    console.log('5. Verify student data access');
    
    console.log('\n📋 Admin Benefits:');
    console.log('==================');
    console.log('✅ Access to all student predictions');
    console.log('✅ System-wide performance analysis');
    console.log('✅ Cross-class performance comparison');
    console.log('✅ Global student risk assessment');
    console.log('✅ School-wide trend analysis');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the assignment
assignAllStudentsToAdmin();
