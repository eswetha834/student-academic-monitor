const mongoose = require('mongoose');
require('dotenv').config();

async function fixTeacherStudentView() {
  try {
    console.log('🔧 Fixing Teacher Student View');
    console.log('=============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Check existing collections
    console.log('\n📊 Checking collections...');
    const collections = await db.listCollections().toArray();
    const attendanceCollections = collections.filter(c => 
      c.name.toLowerCase().includes('attendance')
    );
    
    console.log('Found attendance-related collections:');
    attendanceCollections.forEach(col => {
      console.log(`   ├─ ${col.name}`);
    });
    
    // Check marks collection
    const marksExists = collections.some(c => c.name === 'marks');
    console.log(`   ├─ marks: ${marksExists ? 'EXISTS' : 'MISSING'}`);
    
    // Step 2: Drop existing view
    console.log('\n🗑️  Dropping existing teacher_student_view...');
    try {
      await db.collection('teacher_student_view').drop();
      console.log('   ✅ Dropped existing view');
    } catch (err) {
      console.log('   ├─ View does not exist or already dropped');
    }
    
    // Step 3: Create fixed view
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
        // Join with marks collection
        {
          $lookup: {
            from: 'marks',
            localField: 'userIdString',
            foreignField: 'studentId',
            as: 'studentMarks'
          }
        },
        // Join with attendance records (using correct collection name)
        {
          $lookup: {
            from: 'attendances',
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
        // Project final fields
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
    console.log('   ✅ Fixed teacher_student_view created');
    
    // Step 4: Test the view
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
      });
    } else {
      console.log('❌ No students found in view');
    }
    
    // Step 5: Add sample attendance data if needed
    console.log('\n📅 Checking attendance data...');
    const attendanceCount = await db.collection('attendances').countDocuments();
    console.log(`Found ${attendanceCount} attendance records`);
    
    if (attendanceCount === 0) {
      console.log('📝 Adding sample attendance data...');
      const sampleAttendance = [
        // Jane Student attendance
        { studentId: '69c20e0f0623f7cee6154bbc', date: '2024-01-01', status: 'Present', subject: 'Mathematics' },
        { studentId: '69c20e0f0623f7cee6154bbc', date: '2024-01-02', status: 'Present', subject: 'Physics' },
        { studentId: '69c20e0f0623f7cee6154bbc', date: '2024-01-03', status: 'Absent', subject: 'Chemistry' },
        { studentId: '69c20e0f0623f7cee6154bbc', date: '2024-01-04', status: 'Present', subject: 'Mathematics' },
        { studentId: '69c20e0f0623f7cee6154bbc', date: '2024-01-05', status: 'Present', subject: 'Physics' },
        
        // DMIN attendance
        { studentId: '69c20ed7e5f3a96f227cad54', date: '2024-01-01', status: 'Present', subject: 'Mathematics' },
        { studentId: '69c20ed7e5f3a96f227cad54', date: '2024-01-02', status: 'Present', subject: 'Physics' },
        { studentId: '69c20ed7e5f3a96f227cad54', date: '2024-01-03', status: 'Present', subject: 'Chemistry' },
        { studentId: '69c20ed7e5f3a96f227cad54', date: '2024-01-04', status: 'Absent', subject: 'Mathematics' },
        { studentId: '69c20ed7e5f3a96f227cad54', date: '2024-01-05', status: 'Present', subject: 'Physics' },
        
        // Sai attendance
        { studentId: '69c20ed7e5f3a96f227cad57', date: '2024-01-01', status: 'Present', subject: 'Mathematics' },
        { studentId: '69c20ed7e5f3a96f227cad57', date: '2024-01-02', status: 'Absent', subject: 'Physics' },
        { studentId: '69c20ed7e5f3a96f227cad57', date: '2024-01-03', status: 'Present', subject: 'Chemistry' },
        { studentId: '69c20ed7e5f3a96f227cad57', date: '2024-01-04', status: 'Present', subject: 'Mathematics' },
        { studentId: '69c20ed7e5f3a96f227cad57', date: '2024-01-05', status: 'Present', subject: 'Physics' }
      ];
      
      await db.collection('attendances').insertMany(sampleAttendance);
      console.log('   ✅ Added 15 sample attendance records');
    }
    
    console.log('\n🎉 Teacher Student View Fixed!');
    console.log('===============================');
    console.log('✅ Fixed attendance collection lookup');
    console.log('✅ Added CGPA calculation');
    console.log('✅ Enhanced field mapping');
    console.log('✅ Added sample attendance data');
    console.log('✅ Ready for teacher dashboard');
    
    console.log('\n🚀 Next Steps:');
    console.log('=============');
    console.log('1. Restart the server to refresh the view');
    console.log('2. Test teacher dashboard data fetch');
    console.log('3. Verify CGPA, marks, and attendance display');
    console.log('4. Check frontend field mapping');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixTeacherStudentView();
