const mongoose = require('mongoose');
const User = require('./models/User');
const StudentTeacherAssignment = require('./models/StudentTeacherAssignment');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/academic-monitor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if we have students and teachers
    const students = await User.find({ role: 'student' }).limit(5);
    const teachers = await User.find({ role: { $in: ['faculty', 'teacher'] } }).limit(5);
    
    console.log('\n=== AVAILABLE STUDENTS ===');
    students.forEach(student => {
      console.log(`- ${student.name} (${student.email}) - Role: ${student.role}`);
    });
    
    console.log('\n=== AVAILABLE TEACHERS ===');
    teachers.forEach(teacher => {
      console.log(`- ${teacher.name} (${teacher.email}) - Role: ${teacher.role}`);
    });
    
    // Check existing assignments
    const existingAssignments = await StudentTeacherAssignment.find({ isActive: true });
    console.log(`\n=== EXISTING ASSIGNMENTS (${existingAssignments.length}) ===`);
    existingAssignments.forEach(assignment => {
      console.log(`- ${assignment.studentEmail} -> ${assignment.teacherEmail} (${assignment.assignedDate})`);
    });
    
    // Test assignment creation
    if (students.length > 0 && teachers.length > 0) {
      const testStudent = students[0];
      const testTeacher = teachers[0];
      
      console.log(`\n=== TESTING ASSIGNMENT CREATION ===`);
      console.log(`Trying to assign: ${testStudent.name} -> ${testTeacher.name}`);
      
      // Check if student already has assignment
      const existingStudentAssignment = await StudentTeacherAssignment.findOne({ 
        studentEmail: testStudent.email, 
        isActive: true 
      });
      
      if (existingStudentAssignment) {
        console.log('❌ Student already has an assignment:', existingStudentAssignment.teacherEmail);
        console.log('Try assigning a different student or deactivate existing assignment first');
      } else {
        // Check if this specific student-teacher pair exists
        const existingPairAssignment = await StudentTeacherAssignment.findOne({
          studentEmail: testStudent.email,
          teacherEmail: testTeacher.email,
          isActive: true
        });
        
        if (existingPairAssignment) {
          console.log('❌ This specific student-teacher pair already exists');
        } else {
          console.log('✅ This assignment should be valid to create');
        }
      }
    } else {
      console.log('\n❌ No students or teachers found in database');
      console.log('Please create some test users first');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);
