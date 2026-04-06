const mongoose = require('mongoose');
require('dotenv').config();

async function setupTeacherStudentData() {
  try {
    console.log('🎓 Setting up Teacher Dashboard Student Data');
    console.log('==========================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Create comprehensive student data endpoint
    console.log('\n📊 Creating student data aggregation...');
    
    // Create a view for teacher dashboard with all student details
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
                  date: '$$mark.date'
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
                  subject: '$$record.subject'
                }
              }
            },
            // Hide original ObjectID
            _id: 0
          }
        }
      ]
    });
    console.log('   ✅ teacher_student_view created');
    
    // Step 2: Create API endpoint for teacher dashboard
    console.log('\n🔧 Creating teacher dashboard API endpoints...');
    
    // Test the view
    console.log('\n🧪 Testing teacher_student_view...');
    const studentData = await db.collection('teacher_student_view').find({}).toArray();
    console.log(`   ✅ Found ${studentData.length} students`);
    
    if (studentData.length > 0) {
      console.log('\n📋 Sample Student Data:');
      console.log(JSON.stringify(studentData[0], null, 2));
    }
    
    // Step 3: Create summary statistics
    console.log('\n📊 Creating class statistics...');
    
    const classStats = await db.collection('teacher_student_view').aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageClassMarks: { $avg: '$averageMarks' },
          highestMarks: { $max: '$averageMarks' },
          lowestMarks: { $min: '$averageMarks' },
          averageAttendance: { $avg: '$attendancePercentage' },
          gradeDistribution: {
            $push: '$grade'
          },
          performanceDistribution: {
            $push: '$performance'
          }
        }
      },
      {
        $addFields: {
          gradeA: {
            $size: {
              $filter: {
                input: '$gradeDistribution',
                cond: { $eq: ['$$this', 'A'] }
              }
            }
          },
          gradeB: {
            $size: {
              $filter: {
                input: '$gradeDistribution',
                cond: { $eq: ['$$this', 'B'] }
              }
            }
          },
          gradeC: {
            $size: {
              $filter: {
                input: '$gradeDistribution',
                cond: { $eq: ['$$this', 'C'] }
              }
            }
          },
          gradeD: {
            $size: {
              $filter: {
                input: '$gradeDistribution',
                cond: { $eq: ['$$this', 'D'] }
              }
            }
          },
          gradeF: {
            $size: {
              $filter: {
                input: '$gradeDistribution',
                cond: { $eq: ['$$this', 'F'] }
              }
            }
          }
        }
      }
    ]).toArray();
    
    if (classStats.length > 0) {
      console.log('\n📈 Class Statistics:');
      console.log(JSON.stringify(classStats[0], null, 2));
    }
    
    // Step 4: Create subject-wise statistics
    console.log('\n📚 Creating subject-wise statistics...');
    
    const subjectStats = await db.collection('teacher_student_view').aggregate([
      { $unwind: '$studentMarks' },
      {
        $group: {
          _id: '$studentMarks.subject',
          totalStudents: { $sum: 1 },
          averageMarks: { $avg: { $toDouble: '$studentMarks.marks' } },
          highestMarks: { $max: { $toDouble: '$studentMarks.marks' } },
          lowestMarks: { $min: { $toDouble: '$studentMarks.marks' } },
          gradeA: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'A'] }, 1, 0]
            }
          },
          gradeB: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'B'] }, 1, 0]
            }
          },
          gradeC: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'C'] }, 1, 0]
            }
          },
          gradeD: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'D'] }, 1, 0]
            }
          },
          gradeF: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'F'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    console.log('\n📚 Subject-wise Statistics:');
    subjectStats.forEach(subject => {
      console.log(`${subject._id}:`);
      console.log(`   ├─ Students: ${subject.totalStudents}`);
      console.log(`   ├─ Average: ${subject.averageMarks?.toFixed(2) || 0}`);
      console.log(`   ├─ Highest: ${subject.highestMarks || 0}`);
      console.log(`   ├─ Lowest: ${subject.lowestMarks || 0}`);
      console.log(`   └─ Grades: A:${subject.gradeA} B:${subject.gradeB} C:${subject.gradeC} D:${subject.gradeD} F:${subject.gradeF}`);
    });
    
    console.log('\n🎉 Teacher Dashboard Student Data Setup Complete!');
    console.log('==================================================');
    console.log('\n📋 Available Data for Teacher Dashboard:');
    console.log('==========================================');
    console.log('1. teacher_student_view - Complete student data');
    console.log('2. Class statistics - Overall performance');
    console.log('3. Subject-wise statistics - Per subject analysis');
    console.log('4. Individual student details - Marks, attendance, grades');
    console.log('\n🔧 API Endpoints to Create:');
    console.log('===============================');
    console.log('GET /api/teacher/students - All student data');
    console.log('GET /api/teacher/class-stats - Class statistics');
    console.log('GET /api/teacher/subject-stats - Subject statistics');
    console.log('GET /api/teacher/student/:id - Individual student details');
    console.log('\n🎯 What Teachers Can See:');
    console.log('==========================');
    console.log('✅ All student personal information');
    console.log('✅ Complete academic records');
    console.log('✅ Marks by subject and exam type');
    console.log('✅ Attendance records');
    console.log('✅ Calculated grades and performance');
    console.log('✅ Class and subject statistics');
    console.log('✅ Individual student progress tracking');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupTeacherStudentData();
