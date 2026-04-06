const mongoose = require('mongoose');
const User = require('./models/User');
const StudentTeacherAssignment = require('./models/StudentTeacherAssignment');

async function testDirectAssignment() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Test the exact logic from the API
    const studentEmail = 'student@gmail.com';
    const teacherEmail = 'faculty@gmail.com';
    const department = 'Computer Science';
    const assignmentType = 'student';

    console.log('\n🧪 Testing direct assignment creation...');

    // Clean inputs
    const cleanedStudentEmail = String(studentEmail || "").trim().toLowerCase();
    const cleanedTeacherEmail = String(teacherEmail || "").trim().toLowerCase();

    console.log(`Looking for student: ${cleanedStudentEmail}`);
    console.log(`Looking for teacher: ${cleanedTeacherEmail}`);

    // Find student
    const student = await User.findOne({ email: cleanedStudentEmail, role: 'student' });
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    console.log(`✅ Found student: ${student.name}`);

    // Find teacher
    const teacher = await User.findOne({ email: cleanedTeacherEmail, role: { $in: ['faculty', 'teacher', 'admin'] } });
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    console.log(`✅ Found teacher: ${teacher.name}`);

    // Check for existing assignment
    const existingAssignment = await StudentTeacherAssignment.findOne({
      studentEmail: cleanedStudentEmail,
      teacherEmail: cleanedTeacherEmail,
      isActive: true
    });

    if (existingAssignment) {
      console.log('❌ This student-teacher relationship already exists');
      return;
    }

    // Check if student already has any assignment
    const studentAssignment = await StudentTeacherAssignment.findOne({ 
      studentEmail: cleanedStudentEmail, 
      isActive: true 
    });
    
    if (studentAssignment && assignmentType === "student") {
      console.log('❌ Student is already assigned to a teacher');
      return;
    }

    // Create assignment
    console.log('\n📝 Creating assignment...');
    const assignment = new StudentTeacherAssignment({
      studentEmail: cleanedStudentEmail,
      teacherEmail: cleanedTeacherEmail,
      assignmentType,
      department: String(department || "").trim(),
      assignedDate: new Date(),
      assignedBy: 'admin'
    });

    await assignment.save();
    console.log('✅ Assignment saved successfully!');

    // Update student record
    await User.findByIdAndUpdate(student._id, {
      classTeacherEmail: cleanedTeacherEmail,
      classTeacherName: teacher.name
    });
    console.log('✅ Student record updated');

    console.log(`\n🎉 Assignment created: ${student.name} -> ${teacher.name}`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

testDirectAssignment();
