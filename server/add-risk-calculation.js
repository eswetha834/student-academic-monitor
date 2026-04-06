const mongoose = require('mongoose');
require('dotenv').config();

async function addRiskCalculation() {
  try {
    console.log('🔧 Adding Risk Calculation to Teacher Student View');
    console.log('==================================================');
    
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
    
    // Step 2: Create enhanced view with risk calculation
    console.log('\n📋 Creating enhanced teacher_student_view with risk calculation...');
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
        // Add CGPA calculation
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
        // Add risk calculation
        {
          $addFields: {
            // Calculate risk factors
            riskFactors: {
              $filter: {
                input: [
                  { 
                    condition: { $lt: ['$cgpa', 2.0] }, 
                    label: 'Low CGPA' 
                  },
                  { 
                    condition: { $lt: ['$attendancePercentage', 75] }, 
                    label: 'Poor Attendance' 
                  },
                  { 
                    condition: { $lt: ['$averageMarks', 40] }, 
                    label: 'Low Marks' 
                  },
                  { 
                    condition: { $eq: ['$grade', 'F'] }, 
                    label: 'Failing Grade' 
                  },
                  { 
                    condition: { $lt: ['$totalSubjects', 3] }, 
                    label: 'Few Subjects' 
                  }
                ],
                as: 'factor',
                cond: { $eq: ['$$factor.condition', true] }
              }
            },
            // Determine risk level
            riskLevel: {
              $switch: {
                branches: [
                  { 
                    case: { $gte: [{ $size: { $filter: {
                      input: [
                        { condition: { $lt: ['$cgpa', 2.0] } },
                        { condition: { $lt: ['$attendancePercentage', 75] } },
                        { condition: { $lt: ['$averageMarks', 40] } }
                      ],
                      as: 'factor',
                      cond: { $eq: ['$$factor.condition', true] }
                    }}}, 2] }, 
                    then: 'high' 
                  },
                  { 
                    case: { $eq: [{ $size: { $filter: {
                      input: [
                        { condition: { $lt: ['$cgpa', 2.0] } },
                        { condition: { $lt: ['$attendancePercentage', 75] } },
                        { condition: { $lt: ['$averageMarks', 40] } }
                      ],
                      as: 'factor',
                      cond: { $eq: ['$$factor.condition', true] }
                    }}}, 1] }, 
                    then: 'medium' 
                  },
                  { 
                    case: { $eq: [{ $size: { $filter: {
                      input: [
                        { condition: { $lt: ['$cgpa', 2.5] } },
                        { condition: { $lt: ['$attendancePercentage', 85] } },
                        { condition: { $lt: ['$averageMarks', 50] } }
                      ],
                      as: 'factor',
                      cond: { $eq: ['$$factor.condition', true] }
                    }}}, 1] }, 
                    then: 'low' 
                  }
                ],
                default: 'none'
              }
            },
            // Determine if at risk
            isAtRisk: {
              $or: [
                { $lt: ['$cgpa', 2.0] },
                { $lt: ['$attendancePercentage', 75] },
                { $lt: ['$averageMarks', 40] },
                { $eq: ['$grade', 'F'] }
              ]
            },
            // Determine if top performer
            isTopPerformer: {
              $and: [
                { $gte: ['$cgpa', 3.0] },
                { $gte: ['$attendancePercentage', 90] },
                { $gte: ['$averageMarks', 75] }
              ]
            }
          }
        },
        // Extract risk factor labels
        {
          $addFields: {
            riskFactors: {
              $map: {
                input: '$riskFactors',
                as: 'factor',
                in: '$$factor.label'
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
            attendanceRecords: 1,
            // Risk calculation fields
            riskLevel: 1,
            riskFactors: 1,
            isAtRisk: 1,
            isTopPerformer: 1
          }
        }
      ]
    });
    console.log('   ✅ Enhanced teacher_student_view created with risk calculation');
    
    // Step 3: Test the view
    console.log('\n🧪 Testing enhanced teacher_student_view...');
    const students = await db.collection('teacher_student_view').find({}).toArray();
    
    if (students.length > 0) {
      console.log(`✅ Found ${students.length} students in view`);
      
      console.log('\n📊 Risk Analysis:');
      console.log('==================');
      
      const riskStats = {
        high: students.filter(s => s.riskLevel === 'high').length,
        medium: students.filter(s => s.riskLevel === 'medium').length,
        low: students.filter(s => s.riskLevel === 'low').length,
        none: students.filter(s => s.riskLevel === 'none').length,
        atRisk: students.filter(s => s.isAtRisk).length,
        topPerformers: students.filter(s => s.isTopPerformer).length
      };
      
      console.log(`High Risk: ${riskStats.high}`);
      console.log(`Medium Risk: ${riskStats.medium}`);
      console.log(`Low Risk: ${riskStats.low}`);
      console.log(`No Risk: ${riskStats.none}`);
      console.log(`Total At Risk: ${riskStats.atRisk}`);
      console.log(`Top Performers: ${riskStats.topPerformers}`);
      
      console.log('\n📋 Student Risk Details:');
      students.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.name} (${student.email})`);
        console.log(`   ├─ CGPA: ${student.cgpa?.toFixed(2) || 'N/A'}`);
        console.log(`   ├─ Average Marks: ${student.averageMarks?.toFixed(2) || 'N/A'}`);
        console.log(`   ├─ Attendance: ${student.attendancePercentage || 'N/A'}%`);
        console.log(`   ├─ Grade: ${student.grade || 'N/A'}`);
        console.log(`   ├─ Risk Level: ${student.riskLevel || 'N/A'}`);
        console.log(`   ├─ At Risk: ${student.isAtRisk ? 'YES' : 'NO'}`);
        console.log(`   ├─ Top Performer: ${student.isTopPerformer ? 'YES' : 'NO'}`);
        console.log(`   └─ Risk Factors: ${student.riskFactors?.join(', ') || 'None'}`);
      });
    } else {
      console.log('❌ No students found in view');
    }
    
    console.log('\n🎉 Risk Calculation Added!');
    console.log('===========================');
    console.log('✅ Added risk level calculation (high/medium/low/none)');
    console.log('✅ Added isAtRisk boolean field');
    console.log('✅ Added isTopPerformer boolean field');
    console.log('✅ Added riskFactors array with specific issues');
    console.log('✅ Enhanced student data for frontend display');
    
    console.log('\n🚀 Risk Criteria:');
    console.log('=================');
    console.log('🔴 High Risk: 2+ major issues (CGPA<2.0, Attendance<75%, Marks<40%)');
    console.log('🟡 Medium Risk: 1 major issue');
    console.log('🟠 Low Risk: 1 minor issue (CGPA<2.5, Attendance<85%, Marks<50%)');
    console.log('🟢 No Risk: No significant issues');
    console.log('⭐ Top Performer: CGPA≥3.0, Attendance≥90%, Marks≥75%');
    
    console.log('\n🎯 Frontend Integration:');
    console.log('=======================');
    console.log('✅ s.riskLevel - for risk filtering and styling');
    console.log('✅ s.isAtRisk - for at-risk student identification');
    console.log('✅ s.isTopPerformer - for top performer identification');
    console.log('✅ s.riskFactors - for specific issue display');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the enhancement
addRiskCalculation();
