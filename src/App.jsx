// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ClassSelection from './components/ClassSelection';
import AttendanceMarking from './components/AttendanceMarking';
import StudentDashboard from './components/StudentDashboard';
<<<<<<< HEAD
import AdminReports from './components/AdminReports';
=======
// import AdminReports from './components/AdminReports';
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
import Login from './components/Login';

function App() {
  return (
    <Router>
      <div >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/class-selection" element={<ClassSelection />} />
          <Route path="/attendance-marking" element={<AttendanceMarking />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
<<<<<<< HEAD
          <Route path="/admin-reports" element={<AdminReports />} />
          <Route path="/export-report" element={<AdminReports />} />
=======
          {/* <Route path="/admin-reports" element={<AdminReports />} /> */}
>>>>>>> c06f058045c4bc50a4203c0901298157c343913e
        </Routes>
      </div>
    </Router>
  );
}

export default App;
