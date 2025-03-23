// src/components/AdminReports.jsx
import { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ExportReport from './ExportReport';

const AdminReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Ensure subjects exist and are unique
        const relatedSubjects = subjects.filter((subject) =>
          matchedClass.subject.includes(subject.name)
        );
        // Ensure unique subjects only
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
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Admin Attendance Reports</h2>

      {/* ✅ Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label>Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject('');
            }}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.classId} value={classItem.classId}>
                {classItem.classId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select Subject</option>
            {filteredSubjects.map((subject) => (
              <option key={subject.name} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>

      {/* ✅ Fetch Reports Button */}
      <button
        onClick={fetchAttendanceReports}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-6"
      >
        {loading ? 'Generating Report...' : 'Generate Report'}
      </button>

      {/* ✅ Attendance Report Table */}
      {attendanceData.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Attendance Report:</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Present Students</th>
                <th className="p-2 border">Absent Students</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record, index) => (
                <tr key={index}>
                  <td className="p-2 border">{record.date}</td>
                  <td className="p-2 border">{record.presentStudents.join(', ')}</td>
                  <td className="p-2 border">{record.absentStudents.join(', ')}</td>
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
  );
};

export default AdminReports;
