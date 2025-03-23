// src/components/AttendanceMarking.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocs, collection, doc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AttendanceMarking = () => {
  const location = useLocation();
  const { classItem, subjectItem } = location.state || {};
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendanceDates, setAttendanceDates] = useState([]);

  // ✅ Ensure the date is formatted correctly (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD (compatible with Firestore)
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isNewRecord, setIsNewRecord] = useState(true);

  console.log('Class & Subject:', classItem, subjectItem);

  // ✅ Utility function: Convert Firestore timestamp to YYYY-MM-DD
  const formatDate = (timestamp) => {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-CA');
    }
    return timestamp; // If already a valid string, return as is.
  };

  // ✅ Fetch Students and Attendance Dates
  const fetchData = async () => {
    try {
      // Fetch students for the selected class
      const studentRef = collection(db, 'student');
      const studentQuery = query(studentRef, where('class', '==', classItem.classId));
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        // Initialize attendance with "present" as default
        const initialAttendance = studentList.reduce((acc, student) => {
          acc[student.rollno] = 'present';
          return acc;
        }, {});
        setAttendance(initialAttendance);
      }

      // Fetch attendance dates for the class + subject
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

      // ✅ After fetching students and dates, load today's attendance
      handleDateChange(selectedDate);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ✅ Fetch Data on Component Mount (Initial Load)
  useEffect(() => {
    fetchData();
  }, [classItem.classId, subjectItem.name]);

  // ✅ Handle Attendance Change (Student Present/Absent)
  const handleAttendanceChange = (rollno, status) => {
    setAttendance((prev) => ({ ...prev, [rollno]: status }));
  };

  // ✅ Load Attendance for a Specific Date
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const isExistingRecord = attendanceDates.includes(date);
    setIsNewRecord(!isExistingRecord);

    try {
      // Fetch attendance for the current class + subject + date
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

        // Sync attendance with the current student list (Handles missing students)
        const loadedAttendance = students.reduce((acc, student) => {
          acc[student.rollno] = record.presentStudents.includes(student.rollno) ? 'present' : 'absent';
          return acc;
        }, {});

        setAttendance(loadedAttendance);
      } else {
        // If no record exists, reset to default "present"
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

  // ✅ Save or Update Attendance Record
  const saveAttendance = async () => {
    try {
      // Get present and absent students by roll numbers
      const presentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'present');
      const absentStudents = Object.keys(attendance).filter((rollno) => attendance[rollno] === 'absent');

      // Create a unique document ID for each class + subject + date
      const attendanceRef = collection(db, 'attendance');
      const recordRef = doc(attendanceRef, `${classItem.classId}_${subjectItem.name}_${selectedDate}`);

      // Save or update the attendance record
      await setDoc(recordRef, {
        class: classItem.classId,
        subject: subjectItem.name,
        date: selectedDate,
        presentStudents,
        absentStudents,
      });

      alert(isNewRecord ? 'Attendance saved successfully!' : 'Attendance updated successfully!');

      // Update attendance dates if it's a new record
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
      <h2 className="text-2xl font-bold mb-6">
        Attendance for {classItem.classId} - {subjectItem.name}
      </h2>

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

      {/* ✅ Save/Update Button */}
      <button onClick={saveAttendance} className="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg">
        {isNewRecord ? 'Save Attendance' : 'Update Attendance'}
      </button>
    </div>
  );
};

export default AttendanceMarking;
