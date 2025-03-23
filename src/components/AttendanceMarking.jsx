// src/components/AttendanceMarking.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, doc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AttendanceMarking = () => {
  const location = useLocation();
  const { classItem } = location.state || {};
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);

  // ✅ Fix the date issue (Ensure today’s date is correct)
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD (compatible with Firestore)
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isNewRecord, setIsNewRecord] = useState(true);

  console.log('Received classItem:', classItem);

  // ✅ Utility function: Convert Firestore timestamp to YYYY-MM-DD
  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA');
    }
    return timestamp; // If already a valid string, return as is.
  };

  // ✅ Fetch Data (Students and Attendance)
  const fetchData = async () => {
    try {
      // Fetch students for the selected class
      const studentRef = collection(db, 'student');
      const studentQuery = query(studentRef, where('class', '==', classItem.classId));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        // Initialize attendance to 'present' by default
        const initialAttendance = studentList.reduce((acc, student) => {
          acc[student.rollno] = 'present';
          return acc;
        }, {});
        setAttendance(initialAttendance);
      }

      // Fetch attendance dates for the class
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(attendanceRef, where('class', '==', classItem.classId));
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const dates = attendanceSnapshot.docs.map((doc) => formatDate(doc.data().date));
        setAttendanceDates(dates);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classItem.classId]);

  // ✅ Handle Attendance Change
  const handleAttendanceChange = (rollno, status) => {
    setAttendance((prev) => ({ ...prev, [rollno]: status }));
  };

  // ✅ Handle Date Change (Reload Students and Attendance)
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const isExistingRecord = attendanceDates.includes(date);
    setIsNewRecord(!isExistingRecord);

    try {
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
      }
    } catch (error) {
      console.error('Error fetching attendance record:', error);
    }
  };

  // ✅ Save or Update Attendance
  const saveAttendance = async () => {
    try {
      const presentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'present');
      const absentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'absent');

      const attendanceRef = collection(db, 'attendance');
      const recordRef = doc(attendanceRef, `${classItem.classId}_${selectedDate}`);

      await setDoc(recordRef, {
        class: classItem.classId,
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
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg relative">
      <h2 className="text-2xl font-bold mb-6">Attendance for {classItem.classId}</h2>

      {/* ✅ Date Dropdown */}
      <div className="absolute top-8 right-8">
        <label className="mr-2">Select Date:</label>
        <select
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="p-2 border rounded-lg"
        >
          {attendanceDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
          <option value={getTodayDate()}>New Record (Today)</option>
        </select>
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
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
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
