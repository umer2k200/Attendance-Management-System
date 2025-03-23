// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ClassSelection from './components/ClassSelection';
import AttendanceMarking from './components/AttendanceMarking';
import StudentDashboard from './components/StudentDashboard';
import AdminReports from './components/AdminReports';
import ExportReport from './components/ExportReport';
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
          <Route path="/admin-reports" element={<AdminReports />} />
          <Route path="/export-report" element={<AdminReports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
