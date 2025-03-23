// src/components/AdminReports.jsx
import { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ExportReport from './ExportReport';
import { color, motion } from 'framer-motion';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    padding: '20px',
  },
  formWrapper: {
    maxWidth: '1100px',
    width: '100%',
    background: '#ffffff',
    padding: '50px 40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  header: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: '20px',
    letterSpacing: '1.5px',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '2px solid #cbd5e0',
    outline: 'none',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    color: '#fff',
    background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '40px',
    marginBottom: '40px'
  },
  tableHeader: {
    background: '#7c3aed',
    color: '#fff',
  },
  tableCell: {
    padding: '12px',
    border: '1px solid #cbd5e0',
    textAlign: 'center',
    color: '#2d3748',
  },
};


const AdminReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Utility to format date to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // ✅ Fetch available classes and subjects
  useEffect(() => {
    const fetchClassesAndSubjects = async () => {
      try {
        const classSnapshot = await getDocs(collection(db, 'class'));
        const subjectSnapshot = await getDocs(collection(db, 'subject'));

        const classData = classSnapshot.docs.map((doc) => doc.data());
        const subjectData = subjectSnapshot.docs.map((doc) => doc.data());

        setClasses(classData);
        setSubjects(subjectData);
      } catch (error) {
        console.error('Error fetching classes or subjects:', error);
      }
    };

    fetchClassesAndSubjects();
  }, []);

  // ✅ Filter subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      const matchedClass = classes.find((cls) => cls.classId === selectedClass);
      if (matchedClass && Array.isArray(matchedClass.subject)) {
        // Filter only subjects of the selected class
        const relatedSubjects = subjects.filter((subject) =>
          matchedClass.subject.includes(subject.name)
        );
        const uniqueSubjects = Array.from(new Set(relatedSubjects.map((sub) => sub.name))).map(
          (name) => relatedSubjects.find((sub) => sub.name === name)
        );
        setFilteredSubjects(uniqueSubjects);
      } else {
        setFilteredSubjects([]);
      }
    } else {
      setFilteredSubjects([]);
    }
  }, [selectedClass, classes, subjects]);

  // ✅ Fetch attendance records and set dynamic date range
  const fetchAttendanceDateRange = async () => {
    try {
      if (!selectedClass || !selectedSubject) return;

      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', selectedClass),
        where('subject', '==', selectedSubject)
      );

      const snapshot = await getDocs(attendanceQuery);
      if (!snapshot.empty) {
        const dates = snapshot.docs.map((doc) => new Date(doc.data().date));

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        setStartDate(formatDate(minDate));
        setEndDate(formatDate(maxDate));
        setAttendanceDates(dates.map((date) => formatDate(date)));
      } else {
        setStartDate('');
        setEndDate('');
        setAttendanceDates([]);
      }
    } catch (error) {
      console.error('Error fetching attendance dates:', error);
    }
  };

  // ✅ Trigger attendance date range fetch
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchAttendanceDateRange();
    }
  }, [selectedClass, selectedSubject]);

  // ✅ Fetch Attendance Data based on filters
  const fetchAttendanceReports = async () => {
    setLoading(true);
    try {
      if (!selectedClass || !selectedSubject || !startDate || !endDate) {
        alert('Please select class, subject, and date range.');
        setLoading(false);
        return;
      }

      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('class', '==', selectedClass),
        where('subject', '==', selectedSubject)
      );

      const snapshot = await getDocs(attendanceQuery);

      if (!snapshot.empty) {
        const filteredData = snapshot.docs
          .map((doc) => doc.data())
          .filter((record) => {
            const recordDate = new Date(record.date);
            return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
          });

        setAttendanceData(filteredData);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.container}>
    <div style={styles.formWrapper}>
      <h2 style={styles.header}>Admin Attendance Reports</h2>

      {/* ✅ Filters */}
      <div >
        {/* Class Dropdown */}
        <div style={styles.inputContainer}>
          <label style={styles.label}>Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject('');
            }}
            style={styles.select}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.classId} value={classItem.classId}>
                {classItem.classId}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Dropdown */}
        <div style={styles.inputContainer}>
          <label style={styles.label}>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={styles.select}
            disabled={!filteredSubjects.length}
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((subject) => (
              <option key={subject.name} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div style={styles.inputContainer}>
          <label style={styles.label}>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.select}
            disabled={!startDate}
          />
        </div>

        {/* End Date */}
        <div style={styles.inputContainer}>
          <label style={styles.label}>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.select}
            disabled={!endDate}
          />
        </div>
      </div>

      {/* ✅ Fetch Reports Button */}
      {/* <button
        onClick={fetchAttendanceReports}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-6"
      >
        {loading ? 'Generating Report...' : 'Generate Report'}
      </button> */}
      <motion.button style={styles.button} onClick={fetchAttendanceReports} whileHover={{ scale: 1.05 }}>
          {loading ? 'Generating Report...' : 'Generate Report'}
        </motion.button>

      {/* ✅ Attendance Report Table */}
      {attendanceData.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Attendance Report:</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr >
                <th style={styles.tableCell}>Date</th>
                <th style={styles.tableCell}>Present Students</th>
                <th style={styles.tableCell}>Absent Students</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{record.date}</td>
                  <td cstyle={styles.tableCell}>{record.presentStudents.join(', ')}</td>
                  <td style={styles.tableCell}>{record.absentStudents.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Export Button */}
          <ExportReport attendanceData={attendanceData} />
        </div>
      ) : (
        <p>No attendance records found.</p>
      )}
    </div>
    </motion.div>
  );
};

export default AdminReports;
