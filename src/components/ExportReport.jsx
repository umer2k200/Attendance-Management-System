// src/components/ExportReport.jsx
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '40px',
  },
  button: {
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  pdfButton: {
    background: 'linear-gradient(to right, #10B981, #34D399)',
    color: 'white',
  },
  excelButton: {
    background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
    color: 'white',
  },
};

const ExportReport = ({ attendanceData }) => {
  // Export as PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 20, 10);

    const tableData = attendanceData.map((record) => [
      record.date,
      record.presentStudents.join(', '),
      record.absentStudents.join(', '),
    ]);

    autoTable(doc, {
      head: [['Date', 'Present Students', 'Absent Students']],
      body: tableData,
    });

    doc.save('attendance_report.pdf');
  };

  // Export as Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AttendanceReport');
    XLSX.writeFile(workbook, 'attendance_report.xlsx');
  };

  return (
    <div style={styles.container}>
      <motion.button
        onClick={exportToPDF}
        style={{ ...styles.button, ...styles.pdfButton }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        📄 Export to PDF
      </motion.button>

      <motion.button
        onClick={exportToExcel}
        style={{ ...styles.button, ...styles.excelButton }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        📊 Export to Excel
      </motion.button>
    </div>
  );
};

export default ExportReport;
