// src/components/ExportReport.jsx
import jsPDF from 'jspdf';  // ✅ Correct import
import autoTable from 'jspdf-autotable';  // ✅ Ensure this is imported correctly
import * as XLSX from 'xlsx';

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
    <div className="mt-6">
      <button
        onClick={exportToPDF}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mr-4"
      >
        Export to PDF
      </button>
      <button
        onClick={exportToExcel}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
      >
        Export to Excel
      </button>
    </div>
  );
};

export default ExportReport;
