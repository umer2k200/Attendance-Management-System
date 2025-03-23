// src/components/StudentDashboard.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const StudentDashboard = () => {
  const location = useLocation();
  const { userData } = location.state || {};
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState({});

  console.log('Student Data:', userData);

  // ✅ Fetch Subjects and Attendance Data
  const fetchData = async () => {
    try {
      // Fetch subjects for the student's class
      const subjectRef = collection(db, 'subject');
      const subjectQuery = query(subjectRef, where('class', '==', userData.class));
      const subjectSnapshot = await getDocs(subjectQuery);

      if (!subjectSnapshot.empty) {
        const subjectList = subjectSnapshot.docs.map((doc) => doc.data());
        setSubjects(subjectList);
      }

      // Fetch attendance records for the student
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', userData.class)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const records = attendanceSnapshot.docs.map((doc) => doc.data());
        calculateAttendance(records);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ✅ Calculate Attendance Percentage for Each Subject
  const calculateAttendance = (records) => {
    const attendanceBySubject = {};
    const summary = {};

    // Group attendance by subject
    records.forEach((record) => {
      const { subject, presentStudents, absentStudents } = record;

      if (!attendanceBySubject[subject]) {
        attendanceBySubject[subject] = {
          totalClasses: 0,
          attended: 0,
          records: [],
        };
      }

      attendanceBySubject[subject].totalClasses += 1;
      attendanceBySubject[subject].records.push(record);

      if (presentStudents.includes(userData.rollno)) {
        attendanceBySubject[subject].attended += 1;
      }
    });

    // Calculate percentages
    for (const subject in attendanceBySubject) {
      const { attended, totalClasses } = attendanceBySubject[subject];
      summary[subject] = {
        percentage: ((attended / totalClasses) * 100).toFixed(2),
        ...attendanceBySubject[subject],
      };
    }

    setAttendanceRecords(attendanceBySubject);
    setAttendanceSummary(summary);
  };

  // ✅ Fetch Data on Component Mount
  useEffect(() => {
    fetchData();
  }, [userData.class, userData.rollno]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Welcome, {userData.name}</h2>
      <h3 className="text-xl mb-4">Your Attendance Dashboard</h3>

      {/* ✅ Subject Attendance Overview */}
      {subjects.length === 0 ? (
        <p>Loading subjects...</p>
      ) : (
        subjects.map((subject) => (
          <div key={subject.name} className="mb-8 p-4 border rounded-lg shadow-sm">
            <h4 className="text-2xl font-semibold mb-4">{subject.name}</h4>

            {attendanceSummary[subject.name] ? (
              <div>
                <p>
                  <strong>Attendance Percentage:</strong>{' '}
                  {attendanceSummary[subject.name].percentage}%
                </p>
                <p>
                  <strong>Classes Attended:</strong>{' '}
                  {attendanceSummary[subject.name].attended} /{' '}
                  {attendanceSummary[subject.name].totalClasses}
                </p>

                {/* ✅ Attendance Record List */}
                <h5 className="mt-4 mb-2 font-semibold">Attendance History:</h5>
                <ul>
                  {attendanceSummary[subject.name].records.map((record, index) => (
                    <li key={index} className="mb-2">
                      <strong>Date:</strong> {record.date} -{' '}
                      {record.presentStudents.includes(userData.rollno)
                        ? 'Present'
                        : 'Absent'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No attendance records available for this subject.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default StudentDashboard;
