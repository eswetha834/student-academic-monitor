const mongoose = require('mongoose');
require('dotenv').config();

async function fixTeacherStudentViewFinal() {
  try {
    console.log('🔧 Final Fix for Teacher Student View');
    console.log('====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Drop existing view
    console.log('\n🗑️  Dropping existing teacher_student_view...');
    try {
      await db.collection('teacher_student_view').drop();
      console.log('   ✅ Dropped existing view');
    } catch (err) {
      console.log('   ├─ View does not exist or already dropped');
    }
    
    // Step 2: Create fixed view with proper ObjectId handling
    console.log('\n📋 Creating fixed teacher_student_view...');
    await db.createCollection('teacher_student_view', {
      viewOn: 'users',
      pipeline: [
        // Filter only students
        {
          $match: {
            role: 'student'
          }
        },
        // Convert userIdString to ObjectId for marks lookup
        {
          $addFields: {
            studentObjectId: { $toObjectId: '$userIdString' }
          }
        },
        // Join with marks collection using ObjectId
        {
          $lookup: {
            from: 'marks',
            localField: 'studentObjectId',
            foreignField: 'studentId',
            as: 'studentMarks'
          }
        },
        // Join with attendance records using ObjectId
        {
          $lookup: {
            from: 'attendancerecords',
            localField: 'studentObjectId',
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
        // Add CGPA calculation (assuming 4.0 scale)
        {
          $addFields: {
            cgpa: {
              $cond: {
                if: { $gt: ['$averageMarks', 0] },
                then: {
                  $divide: [
                    { $multiply: ['$averageMarks', 4] },
                    100
                  ]
                },
                else: 0
              }
            }
          }
        },
        // Project final fields (remove temporary fields)
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            password: 1,
            role: 1,
            department: 1,
            semester: 1,
            rollNumber: 1,
            userIdString: 1,
            academicHistory: 1,
            classTeacher: 1,
            classTeacherEmail: 1,
            classTeacherName: 1,
            currentSemester: 1,
            // Calculated fields
            totalMarks: 1,
            totalSubjects: 1,
            averageMarks: 1,
            cgpa: 1,
            grade: 1,
            performance: 1,
            attendancePercentage: 1,
            studentMarks: 1,
            attendanceRecords: 1
          }
        }
      ]
    });
    console.log('   ✅ Fixed teacher_student_view created with ObjectId handling');
    
    // Step 3: Test the view
    console.log('\n🧪 Testing fixed teacher_student_view...');
    const students = await db.collection('teacher_student_view').find({}).limit(3).toArray();
    
    if (students.length > 0) {
      console.log(`✅ Found ${students.length} students in view`);
      
      students.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.name} (${student.email})`);
        console.log(`   ├─ CGPA: ${student.cgpa || 'N/A'}`);
        console.log(`   ├─ Average Marks: ${student.averageMarks || 'N/A'}`);
        console.log(`   ├─ Total Marks: ${student.totalMarks || 'N/A'}`);
        console.log(`   ├─ Grade: ${student.grade || 'N/A'}`);
        console.log(`   ├─ Performance: ${student.performance || 'N/A'}`);
        console.log(`   ├─ Attendance: ${student.attendancePercentage || 'N/A'}%`);
        console.log(`   ├─ Student Marks: ${student.studentMarks ? student.studentMarks.length : 0} records`);
        console.log(`   └─ Attendance Records: ${student.attendanceRecords ? student.attendanceRecords.length : 0} records`);
        
        // Show sample marks if available
        if (student.studentMarks && student.studentMarks.length > 0) {
          console.log(`   📝 Sample Marks:`);
          student.studentMarks.slice(0, 3).forEach(mark => {
            console.log(`      ├─ ${mark.subject}: ${mark.marks}`);
          });
        }
      });
    } else {
      console.log('❌ No students found in view');
    }
    
    // Step 4: Test class statistics
    console.log('\n📊 Testing class statistics...');
    const classStats = await db.collection('teacher_student_view').aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageClassMarks: { $avg: '$averageMarks' },
          averageAttendance: { $avg: '$attendancePercentage' },
          gradeA: { $sum: { $cond: [{ $eq: ['$grade', 'A'] }, 1, 0] } },
          gradeB: { $sum: { $cond: [{ $eq: ['$grade', 'B'] }, 1, 0] } },
          gradeC: { $sum: { $cond: [{ $eq: ['$grade', 'C'] }, 1, 0] } },
          gradeD: { $sum: { $cond: [{ $eq: ['$grade', 'D'] }, 1, 0] } },
          gradeF: { $sum: { $cond: [{ $eq: ['$grade', 'F'] }, 1, 0] } }
        }
      }
    ]).toArray();
    
    if (classStats.length > 0) {
      const stats = classStats[0];
      console.log('✅ Class Statistics:');
      console.log(`   ├─ Total Students: ${stats.totalStudents}`);
      console.log(`   ├─ Average Class Marks: ${stats.averageClassMarks ? stats.averageClassMarks.toFixed(2) : 'N/A'}`);
      console.log(`   ├─ Average Attendance: ${stats.averageAttendance ? stats.averageAttendance.toFixed(2) : 'N/A'}%`);
      console.log(`   ├─ Grade Distribution: A:${stats.gradeA} B:${stats.gradeB} C:${stats.gradeC} D:${stats.gradeD} F:${stats.gradeF}`);
    }
    
    console.log('\n🎉 Teacher Student View Fixed!');
    console.log('===============================');
    console.log('✅ Fixed ObjectId conversion for marks lookup');
    console.log('✅ Fixed ObjectId conversion for attendance lookup');
    console.log('✅ Added CGPA calculation');
    console.log('✅ Enhanced field mapping');
    console.log('✅ Ready for teacher dashboard');
    
    console.log('\n🚀 Next Steps:');
    console.log('=============');
    console.log('1. Restart the server to refresh the view');
    console.log('2. Test teacher dashboard data fetch');
    console.log('3. Verify CGPA, marks, and attendance display');
    console.log('4. Check frontend field mapping');
    console.log('5. Test all student data display');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixTeacherStudentViewFinal();
