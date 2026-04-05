import React from 'react';
import StudentMarksDisplay from '../components/StudentMarksDisplay';

const StudentMarksTab = ({ activeTab }) => {
  return (
    <>
      {activeTab === "Marks" && (
        <StudentMarksDisplay />
      )}
    </>
  );
};

export default StudentMarksTab;
