// src/components/StudentDashboard.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion } from 'framer-motion';

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
      const { subject, presentStudents } = record;

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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #4F46E5, #9333EA)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          width: '100%',
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1F2937',
          }}
        >
          Welcome, {userData?.name}
        </h2>

        <h3
          style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#4B5563',
          }}
        >
          Your Attendance Dashboard
        </h3>

        {subjects.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#6B7280' }}>
            Loading subjects...
          </p>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.name}
              style={{
                marginBottom: '2rem',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid #6366F1',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <h4
                style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  color: '#374151',
                }}
              >
                {subject.name}
              </h4>

              {attendanceSummary[subject.name] ? (
                <div>
                  <p style={{color:'black'}}><strong>Attendance Percentage:</strong> {attendanceSummary[subject.name].percentage}%</p>
                  <p style={{color:'black'}}><strong>Classes Attended:</strong> {attendanceSummary[subject.name].attended} / {attendanceSummary[subject.name].totalClasses}</p>

                  <h5
                    style={{
                      marginTop: '1.5rem',
                      marginBottom: '1rem',
                      fontWeight: 'bold',
                      color: '#1F2937',
                    }}
                  >
                    Attendance History:
                  </h5>

                  <ul style={{color:'black'}}>
                    {attendanceSummary[subject.name].records.map((record, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        <strong>Date:</strong> {record.date} - {record.presentStudents.includes(userData.rollno) ? '✅ Present' : '❌ Absent'}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{color:'black'}}>No attendance records available for this subject.</p>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
