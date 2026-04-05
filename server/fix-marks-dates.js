const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Role = require('./models/Role');
require('dotenv').config();

async function fixMarksDates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the student user
    const studentRole = await Role.findOne({ name: 'student' });
    const student = await User.findOne({ email: 'student@gmail.com', role: studentRole._id });
    
    if (!student) {
      console.log('Student user not found');
      process.exit(0);
    }

    console.log('Found student:', student.name);

    // Get all marks for this student
    const marks = await Marks.find({ studentId: student._id });
    console.log('Found marks:', marks.length);

    // Update marks with dates if they don't have them
    const today = new Date();
    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      if (!mark.date) {
        // Assign dates going back from today
        const date = new Date(today);
        date.setDate(date.getDate() - (marks.length - i - 1) * 7); // One week apart
        
        await Marks.findByIdAndUpdate(mark._id, { date: date });
        console.log(`Updated ${mark.subject} with date: ${date.toISOString().split('T')[0]}`);
      }
    }

    // Display updated marks
    const updatedMarks = await Marks.find({ studentId: student._id }).sort({ date: 1 });
    console.log('\n📊 Updated Student Marks:');
    updatedMarks.forEach((mark, index) => {
      console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (Date: ${mark.date ? mark.date.toISOString().split('T')[0] : 'No date'})`);
    });

  } catch (error) {
    console.error('Error fixing marks dates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixMarksDates();
