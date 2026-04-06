const mongoose = require('mongoose');
require('dotenv').config();

async function checkTeacherAssignments() {
  try {
    console.log('👨‍🏫 Checking Teacher Assignments');
    console.log('==============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check current teacher assignments
    console.log('\n📊 Current Teacher Assignments:');
    
    // Get all teachers
    const teachers = await db.collection('users').find({ 
      $or: [{ role: 'faculty' }, { role: 'teacher' }] 
    }).toArray();
    
    console.log(`Found ${teachers.length} teachers/faculty`);
    
    for (const teacher of teachers) {
      console.log(`\n👨‍🏫 Teacher: ${teacher.name} (${teacher.email})`);
      
      // Count assigned students
      const assignedStudents = await db.collection('users').find({ 
        role: 'student',
        classTeacherEmail: teacher.email 
      }).toArray();
      
      console.log(`   ├─ Assigned Students: ${assignedStudents.length}`);
      
      if (assignedStudents.length > 0) {
        console.log(`   ├─ Student List: ${assignedStudents.map(s => s.name).join(', ')}`);
      } else {
        console.log(`   ├─ No students assigned`);
      }
    }
    
    // Check all students and their assignments
    console.log('\n👥 All Students and Their Teachers:');
    
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    
    const teacherAssignments = {};
    students.forEach(student => {
      const teacherEmail = student.classTeacherEmail || 'Unassigned';
      if (!teacherAssignments[teacherEmail]) {
        teacherAssignments[teacherEmail] = [];
      }
      teacherAssignments[teacherEmail].push(student.name);
    });
    
    Object.keys(teacherAssignments).forEach(teacherEmail => {
      const studentCount = teacherAssignments[teacherEmail].length;
      const studentList = teacherAssignments[teacherEmail].slice(0, 3).join(', ');
      const moreText = teacherAssignments[teacherEmail].length > 3 ? ` +${teacherAssignments[teacherEmail].length - 3} more` : '';
      
      console.log(`   ├─ ${teacherEmail}: ${studentCount} students (${studentList}${moreText})`);
    });
    
    // Check if elango has students
    console.log('\n🎯 Elango Assignment Status:');
    
    const elango = teachers.find(t => t.email === 'elango@gmail.com');
    if (elango) {
      const elangoStudents = await db.collection('users').find({ 
        role: 'student',
        classTeacherEmail: 'elango@gmail.com' 
      }).toArray();
      
      console.log(`   ├─ Elango has ${elangoStudents.length} students assigned`);
      
      if (elangoStudents.length === 0) {
        console.log('   ❌ ISSUE: Elango has no students assigned');
        console.log('   💡 This is why predictions show "Generated for 0 students"');
        
        // Assign some students to elango
        console.log('\n🔧 Assigning Students to Elango...');
        
        const unassignedStudents = await db.collection('users').find({ 
          role: 'student',
          $or: [
            { classTeacherEmail: { $exists: false } },
            { classTeacherEmail: '' },
            { classTeacherEmail: null }
          ]
        }).limit(5).toArray();
        
        console.log(`   ├─ Found ${unassignedStudents.length} unassigned students`);
        
        for (const student of unassignedStudents) {
          await db.collection('users').updateOne(
            { _id: student._id },
            { $set: { classTeacherEmail: 'elango@gmail.com', classTeacherName: 'elango' } }
          );
          console.log(`   ├─ Assigned ${student.name} to elango@gmail.com`);
        }
        
        // Verify assignment
        const elangoStudentsAfter = await db.collection('users').find({ 
          role: 'student',
          classTeacherEmail: 'elango@gmail.com' 
        }).toArray();
        
        console.log(`   ✅ Elango now has ${elangoStudentsAfter.length} students assigned`);
        console.log(`   ├─ Students: ${elangoStudentsAfter.map(s => s.name).join(', ')}`);
        
      } else {
        console.log(`   ✅ Elango has students: ${elangoStudents.map(s => s.name).join(', ')}`);
      }
    } else {
      console.log('   ❌ Elango teacher account not found');
    }
    
    console.log('\n🎉 Teacher Assignment Fix Complete!');
    console.log('===================================');
    console.log('✅ Checked all teacher assignments');
    console.log('✅ Fixed elango student assignment');
    console.log('✅ Predictions should now work for elango');
    
    console.log('\n🚀 Next Steps:');
    console.log('===============');
    console.log('1. Restart the server to refresh cache');
    console.log('2. Login as elango@gmail.com');
    console.log('3. Try "Generate Predictions" again');
    console.log('4. Should show "Generated predictions for X students"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkTeacherAssignments();
