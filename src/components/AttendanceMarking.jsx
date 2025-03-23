// src/components/AttendanceMarking.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, doc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
<<<<<<< HEAD
import { motion } from 'framer-motion';

const AttendanceMarking = () => {
  const location = useLocation();
  const { classItem, subjectItem } = location.state || {};
=======

const AttendanceMarking = () => {
  const location = useLocation();
  const { classItem } = location.state || {};
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);

<<<<<<< HEAD
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA');
=======
  // ✅ Fix the date issue (Ensure today’s date is correct)
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD (compatible with Firestore)
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isNewRecord, setIsNewRecord] = useState(true);

<<<<<<< HEAD
=======
  console.log('Received classItem:', classItem);

  // ✅ Utility function: Convert Firestore timestamp to YYYY-MM-DD
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA');
    }
<<<<<<< HEAD
    return timestamp;
  };

  const fetchData = async () => {
    try {
=======
    return timestamp; // If already a valid string, return as is.
  };

  // ✅ Fetch Data (Students and Attendance)
  const fetchData = async () => {
    try {
      // Fetch students for the selected class
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
      const studentRef = collection(db, 'student');
      const studentQuery = query(studentRef, where('class', '==', classItem.classId));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

<<<<<<< HEAD
=======
        // Initialize attendance to 'present' by default
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
        const initialAttendance = studentList.reduce((acc, student) => {
          acc[student.rollno] = 'present';
          return acc;
        }, {});
        setAttendance(initialAttendance);
      }

<<<<<<< HEAD
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', classItem.classId),
        where('subject', '==', subjectItem.name)
      );
=======
      // Fetch attendance dates for the class
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(attendanceRef, where('class', '==', classItem.classId));
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const dates = attendanceSnapshot.docs.map((doc) => formatDate(doc.data().date));
        setAttendanceDates(dates);
      }
<<<<<<< HEAD

      handleDateChange(selectedDate);
=======
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
<<<<<<< HEAD
  }, [classItem.classId, subjectItem.name]);

=======
  }, [classItem.classId]);

  // ✅ Handle Attendance Change
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  const handleAttendanceChange = (rollno, status) => {
    setAttendance((prev) => ({ ...prev, [rollno]: status }));
  };

<<<<<<< HEAD
=======
  // ✅ Handle Date Change (Reload Students and Attendance)
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const isExistingRecord = attendanceDates.includes(date);
    setIsNewRecord(!isExistingRecord);

    try {
<<<<<<< HEAD
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
=======
      // Fetch students (for consistency after date change)
      const studentRef = collection(db, 'student');
      const studentQuery = query(studentRef, where('class', '==', classItem.classId));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        // Fetch attendance if record exists
        if (isExistingRecord) {
          const attendanceRef = collection(db, 'attendance');
          const attendanceQuery = query(
            attendanceRef,
            where('class', '==', classItem.classId),
            where('date', '==', date)
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);

          if (!attendanceSnapshot.empty) {
            const record = attendanceSnapshot.docs[0].data();

            // Sync attendance with roll numbers
            const loadedAttendance = studentList.reduce((acc, student) => {
              acc[student.rollno] = record.presentStudents.includes(student.rollno)
                ? 'present'
                : 'absent';
              return acc;
            }, {});
            setAttendance(loadedAttendance);
          }
        } else {
          // Reset attendance for a new date
          const resetAttendance = studentList.reduce((acc, student) => {
            acc[student.rollno] = 'present';
            return acc;
          }, {});
          setAttendance(resetAttendance);
        }
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
      }
    } catch (error) {
      console.error('Error fetching attendance record:', error);
    }
  };

<<<<<<< HEAD
=======
  // ✅ Save or Update Attendance
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
  const saveAttendance = async () => {
    try {
      const presentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'present');
      const absentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'absent');

      const attendanceRef = collection(db, 'attendance');
<<<<<<< HEAD
      const recordRef = doc(attendanceRef, `${classItem.classId}_${subjectItem.name}_${selectedDate}`);

      await setDoc(recordRef, {
        class: classItem.classId,
        subject: subjectItem.name,
=======
      const recordRef = doc(attendanceRef, `${classItem.classId}_${selectedDate}`);

      await setDoc(recordRef, {
        class: classItem.classId,
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
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
<<<<<<< HEAD
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
=======
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg relative">
      <h2 className="text-2xl font-bold mb-6">Attendance for {classItem.classId}</h2>

      {/* ✅ Date Dropdown */}
      <div className="absolute top-8 right-8">
        <label className="mr-2">Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="p-2 border rounded-lg"
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
        >
          {attendanceDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
          <option value={getTodayDate()}>New Record (Today)</option>
        </select>
<<<<<<< HEAD

        {students.map((student) => (
          <div key={student.rollno} style={{ marginBottom: '1rem' }}>
            <span style={{ marginRight: '10px', fontWeight: '600', color:'black' }}>{student.name} ({student.rollno})</span>
            <select
              value={attendance[student.rollno] || 'present'}
              onChange={(e) => handleAttendanceChange(student.rollno, e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #6B7280' }}
=======
      </div>

      {/* ✅ Student List */}
      <ul className="mt-12">
        {students.map((student) => (
          <li key={student.rollno} className="mb-4">
            {student.name} ({student.rollno})
            <select
              value={attendance[student.rollno] || 'present'}
              onChange={(e) => handleAttendanceChange(student.rollno, e.target.value)}
              className="ml-4 p-2 border rounded-lg"
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
<<<<<<< HEAD
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
=======
          </li>
        ))}
      </ul>

      {/* ✅ Save or Update Button */}
      <button
        onClick={saveAttendance}
        className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg"
      >
        {isNewRecord ? 'Save Attendance' : 'Update Attendance'}
      </button>
    </div>
  );
};

export default AttendanceMarking;
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
