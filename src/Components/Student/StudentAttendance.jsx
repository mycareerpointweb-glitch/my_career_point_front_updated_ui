// StudentAttendance.jsx

import '../../Styles/Student/StudentAttendance.css';
// StudentAttendance.jsx

import React, { useState } from 'react';
// import './StudentAttendance.css';
import { FaBookOpen, FaUserCheck, FaUserTimes, FaCalendarAlt } from 'react-icons/fa';

// Dummy Data (Matching the requirements)
const subjectData = [
  {
    id: 'S001',
    subject: 'Web Development',
    teacher: 'Mr. Alex Johnson',
    code: 'CS401',
    totalPeriods: 80,
    periodsPresent: 68,
    periodsAbsent: 12,
  },
  {
    id: 'S002',
    subject: 'Data Structures',
    teacher: 'Ms. Emily Davis',
    code: 'CS402',
    totalPeriods: 75,
    periodsPresent: 55,
    periodsAbsent: 20,
  },
  {
    id: 'S003',
    subject: 'Database Management',
    teacher: 'Dr. Michael Chen',
    code: 'CS403',
    totalPeriods: 60,
    periodsPresent: 58,
    periodsAbsent: 2,
  },
  {
    id: 'S004',
    subject: 'Operating Systems',
    teacher: 'Mrs. Sarah Lee',
    code: 'CS404',
    totalPeriods: 70,
    periodsPresent: 60,
    periodsAbsent: 10,
  },
  {
    id: 'S005',
    subject: 'Discrete Mathematics',
    teacher: 'Prof. David Kim',
    code: 'MA405',
    totalPeriods: 90,
    periodsPresent: 75,
    periodsAbsent: 15,
  },
];

// Calculate overall attendance for the summary table
const totalPeriodsAvailable = subjectData.reduce((acc, sub) => acc + sub.totalPeriods, 0);
const totalPeriodsPresent = subjectData.reduce((acc, sub) => acc + sub.periodsPresent, 0);
const totalPeriodsAbsent = subjectData.reduce((acc, sub) => acc + sub.periodsAbsent, 0);

const overallAttendance = {
  presentPercentage: ((totalPeriodsPresent / totalPeriodsAvailable) * 100).toFixed(2),
  absentPercentage: ((totalPeriodsAbsent / totalPeriodsAvailable) * 100).toFixed(2),
  totalPeriodsAvailable,
  totalPeriodsPresent,
  totalPeriodsAbsent,
};

// Dummy daily attendance data for a selected subject (Now structured for a table)
const dailyAttendanceData = [
    { date: '2024-10-01', day: 'Tuesday', hour: 1, periodNo: 2, status: 'Present' },
    { date: '2024-10-01', day: 'Tuesday', hour: 3, periodNo: 4, status: 'Present' },
    { date: '2024-10-03', day: 'Thursday', hour: 2, periodNo: 3, status: 'Absent' },
    { date: '2024-10-03', day: 'Thursday', hour: 4, periodNo: 5, status: 'Present' },
    { date: '2024-10-03', day: 'Thursday', hour: 5, periodNo: 6, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 1, periodNo: 2, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 2, periodNo: 3, status: 'Present' },
    { date: '2024-10-07', day: 'Monday', hour: 4, periodNo: 5, status: 'Absent' },
    { date: '2024-10-07', day: 'Monday', hour: 6, periodNo: 7, status: 'Present' },
];

const StudentAttendance = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectData[0].id);
  const selectedSubject = subjectData.find(sub => sub.id === selectedSubjectId);
  const selectedSubjectName = selectedSubject?.subject || 'No Subject Selected';

  const handleRowClick = (id) => {
    setSelectedSubjectId(id);
  };

  return (
    <div className="STAT_container">
      <h1 className="STAT_title">Student Attendance Report</h1>

      {/* --- Overall Summary Table Section --- */}
      <div className="STAT_card STAT_summary-table-card STAT_shadow-lg">
        <h3 className="STAT_subtitle">Overall Attendance Summary</h3>
        <div className="STAT_table-wrapper STAT_summary-table-wrapper">
          <table className="STAT_table STAT_summary-table">
            <thead>
              <tr>
                <th><FaUserCheck className="STAT_text-success" /> Total Present Percentage</th>
                <th><FaUserTimes className="STAT_text-error" /> Total Absent Percentage</th>
                <th><FaUserCheck className="STAT_text-success" /> Total Periods Presented</th>
                <th><FaUserTimes className="STAT_text-error" /> Total Periods Absent</th>
                <th><FaCalendarAlt className="STAT_text-orange" /> Total Periods Available</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="STAT_summary-value STAT_text-success">{overallAttendance.presentPercentage}%</span></td>
                <td><span className="STAT_summary-value STAT_text-error">{overallAttendance.absentPercentage}%</span></td>
                <td><span className="STAT_summary-value STAT_text-success">{overallAttendance.totalPeriodsPresent}</span></td>
                <td><span className="STAT_summary-value STAT_text-error">{overallAttendance.totalPeriodsAbsent}</span></td>
                <td><span className="STAT_summary-value STAT_text-orange">{overallAttendance.totalPeriodsAvailable}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr className="STAT_separator" />

      {/* --- Subject-wise Attendance Table --- */}
      <div className="STAT_card STAT_table-card STAT_shadow-lg">
        <h3 className="STAT_subtitle">Subject-wise Attendance Breakdown</h3>
        <div className="STAT_table-wrapper">
          <table className="STAT_table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher Name</th>
                <th>ID</th>
                <th>Subject Code</th>
                <th>Total Periods</th>
                <th>Presented</th>
                <th>Absented</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {subjectData.map((subject) => {
                const percentage = ((subject.periodsPresent / subject.totalPeriods) * 100).toFixed(2);
                return (
                  <tr
                    key={subject.id}
                    className={`STAT_table-row ${subject.id === selectedSubjectId ? 'STAT_table-row-selected' : ''}`}
                    onClick={() => handleRowClick(subject.id)}
                  >
                    <td data-label="Subject">{subject.subject}</td>
                    <td data-label="Teacher Name">{subject.teacher}</td>
                    <td data-label="ID">{subject.id}</td>
                    <td data-label="Subject Code">{subject.code}</td>
                    <td data-label="Total Periods">{subject.totalPeriods}</td>
                    <td data-label="Presented" className="STAT_text-success">{subject.periodsPresent}</td>
                    <td data-label="Absented" className="STAT_text-error">{subject.periodsAbsent}</td>
                    <td data-label="Attendance %">
                      <span className={`STAT_badge ${parseFloat(percentage) >= 80 ? 'STAT_badge-success' : 'STAT_badge-warning'}`}>
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="STAT_separator" />

      {/* --- Daily Attendance Details Table --- */}
      <div className="STAT_card STAT_daily-attendance-card STAT_shadow-lg">
        <h3 className="STAT_subtitle">Daily Attendance Log for: <span className="STAT_text-pink">{selectedSubjectName}</span></h3>
        
        <div className="STAT_table-wrapper">
            {dailyAttendanceData.length > 0 ? (
                <table className="STAT_table STAT_daily-log-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Hour</th>
                            <th>Period No.</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyAttendanceData.map((log, index) => (
                            <tr key={index}>
                                <td data-label="Date">{log.date}</td>
                                <td data-label="Day">{log.day}</td>
                                <td data-label="Hour">{log.hour}</td>
                                <td data-label="Period No.">{log.periodNo}</td>
                                <td data-label="Status">
                                    <span className={`STAT_status-badge ${log.status === 'Present' ? 'STAT_status-present' : 'STAT_status-absent'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="STAT_no-data-msg">No daily attendance records found for this subject.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;