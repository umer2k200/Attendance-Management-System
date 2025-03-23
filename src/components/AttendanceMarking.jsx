// src/components/AttendanceMarking.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, doc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion } from 'framer-motion';

const AttendanceMarking = () => {
  const location = useLocation();
  const { classItem, subjectItem } = location.state || {};
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA');
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isNewRecord, setIsNewRecord] = useState(true);

  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA');
    }
    return timestamp;
  };

  const fetchData = async () => {
    try {
      const studentRef = collection(db, 'student');
      const studentQuery = query(studentRef, where('class', '==', classItem.classId));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        const initialAttendance = studentList.reduce((acc, student) => {
          acc[student.rollno] = 'present';
          return acc;
        }, {});
        setAttendance(initialAttendance);
      }

      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', classItem.classId),
        where('subject', '==', subjectItem.name)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const dates = attendanceSnapshot.docs.map((doc) => formatDate(doc.data().date));
        setAttendanceDates(dates);
      }

      handleDateChange(selectedDate);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classItem.classId, subjectItem.name]);

  const handleAttendanceChange = (rollno, status) => {
    setAttendance((prev) => ({ ...prev, [rollno]: status }));
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const isExistingRecord = attendanceDates.includes(date);
    setIsNewRecord(!isExistingRecord);

    try {
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', classItem.classId),
        where('subject', '==', subjectItem.name),
        where('date', '==', date)
      );
      const snapshot = await getDocs(attendanceQuery);

      if (!snapshot.empty) {
        const record = snapshot.docs[0].data();

        const loadedAttendance = students.reduce((acc, student) => {
          acc[student.rollno] = record.presentStudents.includes(student.rollno) ? 'present' : 'absent';
          return acc;
        }, {});

        setAttendance(loadedAttendance);
      } else {
        const resetAttendance = students.reduce((acc, student) => {
          acc[student.rollno] = 'present';
          return acc;
        }, {});
        setAttendance(resetAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance record:', error);
    }
  };

  const saveAttendance = async () => {
    try {
      const presentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'present');
      const absentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'absent');

      const attendanceRef = collection(db, 'attendance');
      const recordRef = doc(attendanceRef, `${classItem.classId}_${subjectItem.name}_${selectedDate}`);

      await setDoc(recordRef, {
        class: classItem.classId,
        subject: subjectItem.name,
        date: selectedDate,
        presentStudents,
        absentStudents,
      });

      alert(isNewRecord ? 'Attendance saved successfully!' : 'Attendance updated successfully!');

      if (isNewRecord) {
        setAttendanceDates((prevDates) => [...prevDates, selectedDate]);
        setIsNewRecord(false);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance.');
    }
  };

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
      <div style={{ maxWidth: '900px', width: '100%', backgroundColor: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#1F2937' }}>
          Attendance for {classItem.classId} - {subjectItem.name}
        </h2>

        <label style={{ fontWeight: '600', color: '#374151', marginRight: '10px' }}>Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          style={{ padding: '8px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #6B7280' }}
        >
          {attendanceDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
          <option value={getTodayDate()}>New Record (Today)</option>
        </select>

        {students.map((student) => (
          <div key={student.rollno} style={{ marginBottom: '1rem' }}>
            <span style={{ marginRight: '10px', fontWeight: '600', color:'black' }}>{student.name} ({student.rollno})</span>
            <select
              value={attendance[student.rollno] || 'present'}
              onChange={(e) => handleAttendanceChange(student.rollno, e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #6B7280' }}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        ))}

        <button onClick={saveAttendance} style={{ marginTop: '2rem', padding: '12px 24px', borderRadius: '12px', backgroundColor: '#4F46E5', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>
          {isNewRecord ? 'Save Attendance' : 'Update Attendance'}
        </button>
      </div>
    </motion.div>
  );
};

export default AttendanceMarking;
