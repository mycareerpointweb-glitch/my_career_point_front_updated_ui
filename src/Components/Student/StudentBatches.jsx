import '../../Styles/Student/StudentBatches.css'; 
import React from 'react';
// import './StudentBatches.css';

// --- Updated Dummy Data ---
const batchData = {
  batchName: "CA - Foundation APR 2025",
  startDate: "15th April 2024",
  endDate: "30th March 2025",
  schedule: "Mon–Fri, 6 PM – 8 PM",
  totalStudents: 60,
  mode: "Hybrid",
  location: "Chennai",
  instructors: [
    "Dr. S. K. Sharma (Taxation)",
    "Prof. A. R. Singh (Accounting)",
    "Ms. J. V. Iyer (Law)",
  ],
};

const subjectsData = [
  {
    name: "Taxation (Income Tax & GST)",
    code: "CF-TAX-101",
    teacher: "Dr. S. K. Sharma",
  },
  {
    name: "Financial Accounting",
    code: "CF-ACC-102",
    teacher: "Prof. A. R. Singh",
  },
  {
    name: "Business Laws",
    code: "CF-LAW-103",
    teacher: "Ms. J. V. Iyer",
  },
  {
    name: "Quantitative Aptitude & Economics",
    code: "CF-QA-104",
    teacher: "Mr. R. P. Gupta",
  },
  {
    name: "Auditing Principles",
    code: "CF-AUD-105",
    teacher: "Ms. P. L. Menon",
  },
];

// Updated Timetable Data (Min 2, Max 4 periods per day + breaks)
const timetableData = [
  // Total 8 periods, with max 4 allocated slots per day
  { time: "9:00 AM - 10:00 AM", Mon: "Taxation", Tue: "Accounting", Wed: "Law", Thu: "", Fri: "Auditing" },
  { time: "10:00 AM - 11:00 AM", Mon: "Accounting", Tue: "Law", Wed: "", Thu: "Auditing", Fri: "QA & Economics" },
  { time: "11:00 AM - 11:15 AM", Mon: "BREAK", Tue: "BREAK", Wed: "BREAK", Thu: "BREAK", Fri: "BREAK" },
  { time: "11:15 AM - 12:15 PM", Mon: "Law", Tue: "", Wed: "Accounting", Thu: "Taxation", Fri: "" },
  { time: "12:15 PM - 1:15 PM", Mon: "", Tue: "Auditing", Wed: "Law", Thu: "Accounting", Fri: "Taxation" },
  { time: "1:15 PM - 2:15 PM", Mon: "LUNCH", Tue: "LUNCH", Wed: "LUNCH", Thu: "LUNCH", Fri: "LUNCH" },
  { time: "2:15 PM - 3:15 PM", Mon: "", Tue: "Taxation", Wed: "QA & Economics", Thu: "", Fri: "Accounting" },
  { time: "3:15 PM - 4:15 PM", Mon: "", Tue: "", Wed: "", Thu: "QA & Economics", Fri: "" },
];


const StudentBatches = () => {
  return (
    <div className="container student-batches-container fade-in">
      <h1 className="mt-4 mb-8 font-bold text-center text-pink">Batch Curriculum Overview</h1>
      
      <BatchDetailsCard data={batchData} />

      <SubjectsCard subjects={subjectsData} />

      <TimetableCard timetable={timetableData} />
    </div>
  );
};

const BatchDetailsCard = ({ data }) => (
  <div className="card batch-details-card shadow-lg rounded-lg slide-down">
    <div className="card-header bg-brand-pink">
      <h2 className="text-center">{data.batchName}</h2>
    </div>
    <div className="card-body p-6">
      
      {/* 1. Batch Info Box */}
      <div className="batch-info-box shadow rounded-lg p-5">
        <h3 className="text-brand-pink mb-4 font-semibold">Batch Information</h3>
        
        <div className="batch-info-grid">
            <p><strong>Start Date:</strong> <span className="text-gray-700">{data.startDate}</span></p>
            <p><strong>End Date:</strong> <span className="text-gray-700">{data.endDate}</span></p>
            <p><strong>Schedule:</strong> <span className="text-gray-700 font-semibold">{data.schedule}</span></p>
            <p><strong>Total Students:</strong> <span className="text-gray-700">{data.totalStudents}</span></p>
            <p>
                <strong>Mode:</strong> 
                <span className="badge badge-mode font-semibold rounded-sm bg-brand-orange ml-2">
                    {data.mode}
                </span>
            </p>
            <p className="m-0"><strong>Location:</strong> <span className="text-gray-700">{data.location}</span></p>
            
            {/* INSTRUCTORS - MOVED INSIDE THE GRID */}
            <div className="instructors-in-grid">
                <p className="m-0"><strong>Instructors:</strong></p>
                <div className="instructor-pills-container flex gap-3 mt-2">
                    {data.instructors.map((instructor, index) => (
                        <span key={index} className="instructor-pill rounded-full bg-brand-pink-dark text-white font-medium shadow-sm transition-fast">
                            {instructor}
                        </span>
                    ))}
                </div>
            </div>
            
        </div>
      </div>
    </div>
  </div>
);

const SubjectsCard = ({ subjects }) => (
  <div className="card subjects-card shadow-lg rounded-lg mt-8 slide-down">
    <div className="card-header bg-brand-orange">
      <h2 className="text-center">Curriculum Subjects</h2>
    </div>
    <div className="card-body subject-grid p-6">
      {subjects.map((subject) => (
        <div key={subject.code} className="subject-item-card rounded-lg shadow-sm">
          <h4 className="text-brand-pink mb-2">{subject.name}</h4>
          <p className="font-medium mb-1">Code: <span className="text-gray-600">{subject.code}</span></p>
          <p className="font-medium m-0">Teacher: <span className="text-gray-700">{subject.teacher}</span></p>
        </div>
      ))}
    </div>
  </div>
);

const TimetableCard = ({ timetable }) => {
  const days = timetable.length > 0 ? Object.keys(timetable[0]).filter(key => key !== 'time') : [];

  return (
    <div className="card timetable-card shadow-lg rounded-lg mt-8 slide-down">
      <div className="bg-brand-timetable">
        <span className="text-center">Weekly Timetable Schedule</span>
      </div>
      <div className="card-body timetable-table-container p-4">
        <table className="rounded-lg shadow-sm">
          <thead>
            <tr>
              <th className="time-column-header">Time Slot</th>
              {days.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {timetable.map((period, index) => (
              <tr key={index} className="table-row-hover">
                <td className="time-column font-semibold">{period.time}</td>
                {days.map(day => {
                  const content = period[day];
                  let className = 'period-cell';

                  if (content === 'BREAK' || content === 'LUNCH') {
                    className += ' break-lunch font-bold';
                  } else if (content === 'NIGHT PERIOD') { // Note: Night Period is treated like an empty slot in the new data
                    className += ' night-period font-bold';
                  } else if (!content) {
                    className += ' free-period'; 
                  } else {
                    className += ' regular-period font-medium';
                  }
                  
                  return (
                    <td key={day} className={className}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentBatches;