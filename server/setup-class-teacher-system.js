const mongoose = require('mongoose');
require('dotenv').config();

async function setupClassTeacherSystem() {
  try {
    console.log('🎓 Setting Up Class Teacher System');
    console.log('==================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Add classTeacher field to all students
    console.log('\n👨‍🏫 Adding class teacher assignments...');
    
    // Get all students
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    console.log(`   Found ${students.length} students`);
    
    // Get all teachers
    const teachers = await db.collection('users').find({ role: 'faculty' }).toArray();
    console.log(`   Found ${teachers.length} teachers`);
    
    // Assign class teachers (for demonstration, assign elango as class teacher for all students)
    const elangoTeacher = teachers.find(t => t.email === 'elango@gmail.com');
    const johnTeacher = teachers.find(t => t.email === 'faculty@gmail.com');
    
    if (elangoTeacher) {
      console.log(`\n📝 Assigning class teachers...`);
      
      for (const student of students) {
        // Assign class teacher based on some logic (e.g., department, semester)
        let assignedTeacher = elangoTeacher;
        
        // For demonstration, assign different teachers for different students
        if (student.rollNumber?.includes('STU') || student.email?.includes('student')) {
          assignedTeacher = elangoTeacher; // elango handles regular students
        } else if (student.rollNumber?.includes('TEST') || student.email?.includes('test')) {
          assignedTeacher = johnTeacher; // john handles test students
        }
        
        await db.collection('users').updateOne(
          { _id: student._id },
          { 
            $set: {
              classTeacher: assignedTeacher.userIdString,
              classTeacherName: assignedTeacher.name,
              classTeacherEmail: assignedTeacher.email,
              currentSemester: student.semester || '1',
              academicHistory: student.academicHistory || []
            }
          }
        );
        
        console.log(`   ✅ ${student.name} → ${assignedTeacher.name} (${assignedTeacher.email})`);
      }
    }
    
    // Step 2: Create class-teacher-specific views
    console.log('\n📊 Creating class teacher views...');
    
    // Drop existing views if they exist
    const viewsToDrop = ['class_teacher_students_view', 'teacher_class_stats_view'];
    for (const viewName of viewsToDrop) {
      try {
        await db.collection(viewName).drop();
        console.log(`   ├─ Dropped ${viewName}`);
      } catch (err) {
        console.log(`   ├─ ${viewName} does not exist`);
      }
    }
    
    // Create class teacher students view
    await db.createCollection('class_teacher_students_view', {
      viewOn: 'users',
      pipeline: [
        // Filter only students
        {
          $match: {
            role: 'student'
          }
        },
        // Join with marks collection
        {
          $lookup: {
            from: 'marks',
            localField: 'userIdString',
            foreignField: 'studentId',
            as: 'studentMarks'
          }
        },
        // Join with attendance records
        {
          $lookup: {
            from: 'attendancerecords',
            localField: 'userIdString',
            foreignField: 'studentId',
            as: 'attendanceRecords'
          }
        },
        // Calculate student statistics
        {
          $addFields: {
            totalMarks: {
              $sum: {
                $map: {
                  input: '$studentMarks',
                  as: 'mark',
                  in: { $toDouble: '$$mark.marks' }
                }
              }
            },
            averageMarks: {
              $avg: {
                $map: {
                  input: '$studentMarks',
                  as: 'mark',
                  in: { $toDouble: '$$mark.marks' }
                }
              }
            },
            totalSubjects: { $size: '$studentMarks' },
            attendancePercentage: {
              $let: {
                vars: {
                  totalClasses: { $size: '$attendanceRecords' },
                  presentClasses: {
                    $size: {
                      $filter: {
                        input: '$attendanceRecords',
                        cond: { $eq: ['$$this.status', 'Present'] }
                      }
                    }
                  }
                },
                in: {
                  $cond: {
                    if: { $gt: ['$$totalClasses', 0] },
                    then: {
                      $multiply: [
                        { $divide: ['$$presentClasses', '$$totalClasses'] },
                        100
                      ]
                    },
                    else: 0
                  }
                }
              }
            },
            grade: {
              $switch: {
                branches: [
                  { case: { $gte: ['$averageMarks', 90] }, then: 'A' },
                  { case: { $gte: ['$averageMarks', 80] }, then: 'B' },
                  { case: { $gte: ['$averageMarks', 70] }, then: 'C' },
                  { case: { $gte: ['$averageMarks', 60] }, then: 'D' },
                  { case: { $gte: ['$averageMarks', 50] }, then: 'E' }
                ],
                default: 'F'
              }
            },
            performance: {
              $switch: {
                branches: [
                  { case: { $gte: ['$averageMarks', 75] }, then: 'Excellent' },
                  { case: { $gte: ['$averageMarks', 60] }, then: 'Good' },
                  { case: { $gte: ['$averageMarks', 50] }, then: 'Average' }
                ],
                default: 'Needs Improvement'
              }
            }
          }
        },
        // Project final fields
        {
          $project: {
            userIdString: 1,
            name: 1,
            email: 1,
            password: 1,
            role: 1,
            department: 1,
            semester: 1,
            rollNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            // Class teacher info
            classTeacher: 1,
            classTeacherName: 1,
            classTeacherEmail: 1,
            currentSemester: 1,
            academicHistory: 1,
            // Calculated fields
            totalMarks: 1,
            averageMarks: { $round: ['$averageMarks', 2] },
            totalSubjects: 1,
            attendancePercentage: { $round: ['$attendancePercentage', 2] },
            grade: 1,
            performance: 1,
            // Marks details
            studentMarks: {
              $map: {
                input: '$studentMarks',
                as: 'mark',
                in: {
                  subject: '$$mark.subject',
                  marks: '$$mark.marks',
                  grade: {
                    $switch: {
                      branches: [
                        { case: { $gte: ['$$mark.marks', 90] }, then: 'A' },
                        { case: { $gte: ['$$mark.marks', 80] }, then: 'B' },
                        { case: { $gte: ['$$mark.marks', 70] }, then: 'C' },
                        { case: { $gte: ['$$mark.marks', 60] }, then: 'D' },
                        { case: { $gte: ['$$mark.marks', 50] }, then: 'E' }
                      ],
                      default: 'F'
                    }
                  },
                  examType: '$$mark.examType',
                  date: '$$mark.date',
                  semester: '$$mark.semester'
                }
              }
            },
            // Attendance details
            attendanceRecords: {
              $map: {
                input: '$attendanceRecords',
                as: 'record',
                in: {
                  date: '$$record.date',
                  status: '$$record.status',
                  subject: '$$record.subject',
                  semester: '$$record.semester'
                }
              }
            },
            // Hide the original ObjectID
            _id: 0
          }
        }
      ]
    });
    console.log('   ✅ class_teacher_students_view created');
    
    // Step 3: Test the view
    console.log('\n🧪 Testing class teacher view...');
    const classStudents = await db.collection('class_teacher_students_view').find({}).toArray();
    console.log(`   ✅ Found ${classStudents.length} students with class teacher assignments`);
    
    if (classStudents.length > 0) {
      console.log('\n📋 Sample Student with Class Teacher:');
      console.log('=====================================');
      console.log(JSON.stringify(classStudents[0], null, 2));
    }
    
    // Step 4: Show class teacher assignments
    console.log('\n👨‍🏫 Class Teacher Assignments:');
    console.log('==============================');
    
    const teacherGroups = {};
    classStudents.forEach(student => {
      const teacherKey = student.classTeacherEmail || 'Unassigned';
      if (!teacherGroups[teacherKey]) {
        teacherGroups[teacherKey] = [];
      }
      teacherGroups[teacherKey].push(student);
    });
    
    Object.entries(teacherGroups).forEach(([teacherEmail, students]) => {
      console.log(`\n📧 ${teacherEmail}:`);
      console.log(`   ├─ Total Students: ${students.length}`);
      students.forEach(student => {
        console.log(`   ├─ ${student.name} (${student.rollNumber}) - Semester ${student.semester}`);
      });
    });
    
    console.log('\n🎉 Class Teacher System Setup Complete!');
    console.log('======================================');
    console.log('\n📋 Next Steps:');
    console.log('===============');
    console.log('1. Update login API to check class teacher assignments');
    console.log('2. Create class-teacher-specific API endpoints');
    console.log('3. Update frontend to show only assigned students');
    console.log('4. Implement semester transition system');
    console.log('5. Add academic history tracking');
    
    console.log('\n🔧 API Endpoints to Create:');
    console.log('===========================');
    console.log('GET /api/class-teacher/students - Get only assigned students');
    console.log('GET /api/class-teacher/student/:id - Get student details');
    console.log('POST /api/class-teacher/assign-teacher - Assign new class teacher');
    console.log('POST /api/class-teacher/transition-semester - Handle semester transition');
    console.log('PUT /api/class-teacher/student/:id - Update student data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupClassTeacherSystem();
