import '../../Styles/Teacher/TeacherReportsAndAnalytics.css'; 
import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

// import './TeacherReportsAnalytics.css'; 

// ===================================================================
// 1. DATA CONFIGURATION & CONSTANTS (Self-Contained Dummy Data)
// ===================================================================

const TEACHER_ID = 'TCH0012'; 
const TEACHER_NAME = 'Alice Johnson'; 

// --- Institute References (Expanded) ---
const INSTITUTIONS_REF = [
    { institution_id: 'INST001', name: 'Apex Commerce College', location: 'Mumbai' },
    { institution_id: 'INST002', name: 'Zenith Professional College', location: 'Delhi' },
    { institution_id: 'INST003', name: 'Elite Commerce Hub', location: 'Bangalore' },
    { institution_id: 'INST004', name: 'Global Finance Academy', location: 'Kolkata' }, 
];

// --- Teacher Assignments (Expanded Scope) ---
const TEACHER_ASSIGNMENTS = [
    // INST001: Apex Commerce College (Main Campus)
    { instId: 'INST001', course: 'CA', level: 'Intermediate', batchName: 'CA_INT_MAY_2025_ACC', subjects: ['Taxation', 'Corporate Law', 'Cost & Mgmt Acct'], totalStudents: 45 },
    { instId: 'INST001', course: 'CMA', level: 'Intermediate', batchName: 'CMA_INT_MAY_2025_ACC', subjects: ['Cost Accounting', 'Financial Accounting'], totalStudents: 40 },
    // INST002: Zenith Professional College
    { instId: 'INST002', course: 'CA', level: 'Foundation', batchName: 'CA_FOU_NOV_2025_ZPC', subjects: ['Accounting', 'Business Laws'], totalStudents: 30 },
    { instId: 'INST002', course: 'CMA', level: 'Advanced', batchName: 'CMA_ADV_MAY_2025_ZPC', subjects: ['Strategic Performance Mgmt'], totalStudents: 25 },
    // INST003: Elite Commerce Hub (Added Data)
    { instId: 'INST003', course: 'CA', level: 'Intermediate', batchName: 'CA_INT_DEC_2025_ECH', subjects: ['Taxation', 'Corporate Law'], totalStudents: 50 },
    { instId: 'INST003', course: 'CA', level: 'Final', batchName: 'CA_FIN_MAY_2026_ECH', subjects: ['Financial Reporting', 'Audit'], totalStudents: 35 },
    // INST004: Global Finance Academy (New Institute)
    { instId: 'INST004', course: 'CMA', level: 'Intermediate', batchName: 'CMA_INT_JUN_2026_GFA', subjects: ['Operations Mgmt', 'Taxation'], totalStudents: 60 },
    { instId: 'INST004', course: 'CMA', level: 'Advanced', batchName: 'CMA_ADV_DEC_2026_GFA', subjects: ['Advanced Financial Mgmt'], totalStudents: 40 },
];

// --- Course and Subject Structure (Expanded) ---
const COURSE_SUBJECTS = {
    'CA': {
        'Foundation': { subjects: ['Accounting', 'Business Laws', 'Quantitative Aptitude', 'Economics'], totalMarks: 400 },
        'Intermediate': { subjects: ['Taxation', 'Corporate Law', 'Cost & Mgmt Acct', 'Advanced Accounts'], totalMarks: 800 },
        'Final': { subjects: ['Financial Reporting', 'Strategic Mgmt', 'Audit', 'Direct Tax Laws'], totalMarks: 800 },
    },
    'CMA': {
        'Intermediate': { subjects: ['Cost Accounting', 'Operations Mgmt', 'Taxation', 'Financial Accounting'], totalMarks: 800 },
        'Advanced': { subjects: ['Corporate Financial Reporting', 'Advanced Financial Mgmt', 'Strategic Performance Mgmt'], totalMarks: 800 },
    }
};

// --- CHART COLORS: Map to CSS Variables directly for Recharts ---
const CHART_COLORS = {
    Marks: 'var(--brand-pink)',
    Assignment: 'var(--brand-orange-dark)', 
    Attendance: 'var(--color-success)',
    Pass: 'var(--color-success-dark)', 
    Fail: 'var(--color-error-dark)', 
};

const PIE_COLORS = [CHART_COLORS.Pass, CHART_COLORS.Fail];

// ===================================================================
// 2. DATA SIMULATION & UTILITIES (Logic to generate performance metrics)
// ===================================================================

const simulateStudentSubjectData = (totalStudents) => {
    const studentData = [];
    for (let i = 1; i <= totalStudents; i++) {
        const marks = Math.round(Math.random() * 50 + 40); 
        const assignmentMarks = Math.round(Math.random() * 20 + 30); 
        const attendance = Math.round(Math.random() * 30 + 70); 

        studentData.push({
            studentId: `S${String(i).padStart(3, '0')}`,
            name: `Student Name ${i}`, 
            marks: marks, 
            assignmentMarks: assignmentMarks,
            attendance: attendance, 
        });
    }
    return studentData;
}


const simulateSubjectPerformance = (courseId, levelName, teacherAssignment) => {
    const { subjects: teacherSubjects, totalStudents } = teacherAssignment;
    const courseConfig = COURSE_SUBJECTS[courseId] ? COURSE_SUBJECTS[courseId][levelName] : null;
    if (!courseConfig) return null;

    const subjectMaxMarks = courseConfig.totalMarks / courseConfig.subjects.length;
    const basePassRate = (levelName === 'Foundation' ? 75 : levelName === 'Intermediate' ? 60 : 50); 
    const baseAttendance = 85;

    const subjectsToSimulate = courseConfig.subjects.filter(subject => teacherSubjects.includes(subject));

    const subjectData = subjectsToSimulate.map((subject) => {
        const markModifier = Math.random() * 0.2 + 0.9; 
        
        const avgMark = Math.min(subjectMaxMarks, subjectMaxMarks * (Math.random() * 0.2 + 0.65) * markModifier); 
        const avgAssignmentMark = Math.min(subjectMaxMarks * 0.5, subjectMaxMarks * (Math.random() * 0.15 + 0.3) * markModifier);
        const passRate = Math.min(95, basePassRate * 1.0 + (Math.random() * 10 - 5)); 
        
        const studentsPassed = Math.round(totalStudents * (passRate / 100));
        
        const detailedStudentData = simulateStudentSubjectData(totalStudents);

        return {
            subjectName: subject,
            maxMarks: subjectMaxMarks,
            avgMark: Math.round(avgMark),
            avgAssignmentMark: Math.round(avgAssignmentMark),
            passRate: Math.round(passRate),
            studentsPassed: studentsPassed,
            studentsFailed: totalStudents - studentsPassed,
            studentData: detailedStudentData,
        };
    });
    
    // Calculate overall metrics for the batch
    const overallAvgMarks = subjectData.reduce((sum, s) => sum + s.avgMark, 0) / (subjectData.length || 1);
    const overallAvgAssignmentMarks = subjectData.reduce((sum, s) => sum + s.avgAssignmentMark, 0) / (subjectData.length || 1);
    const totalPassedOverall = subjectData.reduce((sum, s) => sum + s.studentsPassed, 0);
    const avgPassed = Math.round(totalPassedOverall / (subjectData.length || 1));
    const attendanceRate = Math.min(95, baseAttendance + (Math.random() * 5));

    return {
        subjectData: subjectData,
        overallMetrics: {
            totalStudents: totalStudents,
            overallAvgMarks: Math.round(overallAvgMarks),
            overallAvgAssignmentMarks: Math.round(overallAvgAssignmentMarks),
            totalPassed: avgPassed,
            totalFailed: totalStudents - avgPassed,
            avgAttendanceRate: Math.round(attendanceRate),
        }
    };
};

// --- Core Data Processing for TCH0012 (omitted for brevity) ---
const instituteMap = INSTITUTIONS_REF.reduce((acc, inst) => {
  acc[inst.institution_id] = { name: inst.name, location: inst.location };
  return acc;
}, {});

const teacherScopeData = [];

TEACHER_ASSIGNMENTS.forEach(assignment => {
    const { instId, course, level, batchName } = assignment;
    const institutionName = instituteMap[instId]?.name || `Unknown Institute ${instId}`;
    
    const metrics = simulateSubjectPerformance(course, level, assignment);

    if (metrics && metrics.subjectData.length > 0) {
        const courseLevelKey = `${course} - ${level}`;
        
        teacherScopeData.push({
            institutionId: instId,
            institution: institutionName,
            course: course,
            level: level,
            courseLevelKey: courseLevelKey,
            batchName: batchName,
            ...metrics.overallMetrics,
            subjectData: metrics.subjectData,
        });
    }
});

const instituteOptions = [
    { id: 'ALL', name: 'All Institutes (Comparison View)' },
    ...INSTITUTIONS_REF.filter(inst => teacherScopeData.some(d => d.institutionId === inst.institution_id))
        .map(inst => ({
            id: inst.institution_id,
            name: `${inst.name} (${inst.location})`,
        })),
];


// ===================================================================
// 3. REACT COMPONENT & DYNAMIC DATA GENERATION
// ===================================================================

const TeacherReportsAnalytics = () => {
  const [selectedInstituteId, setSelectedInstituteId] = useState('ALL');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState('ALL'); 
  const [selectedBatchName, setSelectedBatchName] = useState('ALL');
  const [selectedSubjectName, setSelectedSubjectName] = useState('ALL');

  // --- Filtering Logic (omitted for brevity) ---
  const instituteFilteredData = useMemo(() => {
    if (selectedInstituteId === 'ALL') { return teacherScopeData; }
    return teacherScopeData.filter(d => d.institutionId === selectedInstituteId);
  }, [selectedInstituteId]);
  const availableCourses = useMemo(() => {
    const courses = instituteFilteredData.map(d => d.courseLevelKey);
    const uniqueCourses = [...new Set(courses)].sort();
    return ['ALL', ...uniqueCourses];
  }, [instituteFilteredData]);
  const courseFilteredData = useMemo(() => {
    if (selectedCourseLevel === 'ALL') { return instituteFilteredData; }
    return instituteFilteredData.filter(d => d.courseLevelKey === selectedCourseLevel);
  }, [selectedCourseLevel, instituteFilteredData]);
  const availableBatches = useMemo(() => {
    const batches = courseFilteredData.map(d => d.batchName);
    const uniqueBatches = [...new Set(batches)].sort();
    return ['ALL', ...uniqueBatches];
  }, [courseFilteredData]);
  const batchFilteredData = useMemo(() => {
    if (selectedBatchName === 'ALL') { return courseFilteredData; }
    return courseFilteredData.filter(d => d.batchName === selectedBatchName);
  }, [selectedBatchName, courseFilteredData]);
  const availableSubjects = useMemo(() => {
    if (selectedBatchName !== 'ALL' && batchFilteredData.length === 1) {
        return ['ALL', ...batchFilteredData[0].subjectData.map(s => s.subjectName)];
    }
    return ['ALL'];
  }, [batchFilteredData, selectedBatchName]);
  const finalFilteredData = useMemo(() => {
      if (selectedSubjectName !== 'ALL' && batchFilteredData.length === 1) {
          return batchFilteredData;
      }
      return batchFilteredData; 
  }, [selectedSubjectName, batchFilteredData]);


  // --- Helper States (omitted for brevity) ---
  const isAllInstitutes = selectedInstituteId === 'ALL';
  const isAllCourses = selectedCourseLevel === 'ALL';
  const isAllBatches = selectedBatchName === 'ALL';
  const isAllSubjects = selectedSubjectName === 'ALL';
  const selectedInstituteName = instituteOptions.find(opt => opt.id === selectedInstituteId)?.name || 'All Institutes';

  // --- Clear Filter Callbacks (omitted for brevity) ---
  const clearCourseFilter = useCallback(() => {
    setSelectedCourseLevel('ALL');
    setSelectedBatchName('ALL');
    setSelectedSubjectName('ALL');
  }, []);
  const clearBatchFilter = useCallback(() => {
    setSelectedBatchName('ALL');
    setSelectedSubjectName('ALL');
  }, []);
  const clearSubjectFilter = useCallback(() => {
    setSelectedSubjectName('ALL');
  }, []);

  // --- Summary Metrics Calculation (used for Pie Chart data) ---
  const summaryMetrics = useMemo(() => {
    const data = isAllSubjects ? batchFilteredData : finalFilteredData;
    const totalStudents = data.reduce((sum, d) => sum + d.totalStudents, 0);
    const uniqueBatches = new Set(data.map(d => d.batchName)).size;
    const allSubjects = data.flatMap(d => d.subjectData.map(s => s.subjectName));
    const uniqueSubjects = new Set(allSubjects).size;
    const totalAvgMarks = data.reduce((sum, d) => sum + d.overallAvgMarks, 0) / (data.length || 1);
    const totalAvgAssignmentMarks = data.reduce((sum, d) => sum + d.overallAvgAssignmentMarks, 0) / (data.length || 1);
    const totalAttendanceRate = data.reduce((sum, d) => sum + d.avgAttendanceRate, 0) / (data.length || 1);
    const totalPassed = data.reduce((sum, d) => sum + d.totalPassed, 0);
    const totalFailed = data.reduce((sum, d) => sum + d.totalFailed, 0);
    const totalStudentsCounted = totalPassed + totalFailed; 
    const passRate = totalStudentsCounted > 0 ? (totalPassed / totalStudentsCounted) * 100 : 0;
    const failRate = totalStudentsCounted > 0 ? (totalFailed / totalStudentsCounted) * 100 : 0;

    return {
        totalStudents, uniqueBatches, uniqueSubjects, 
        totalAvgMarks: Math.round(totalAvgMarks), 
        totalAvgAssignmentMarks: Math.round(totalAvgAssignmentMarks),
        totalAttendanceRate: Math.round(totalAttendanceRate),
        totalPassed, totalFailed,
        passRate: Math.round(passRate), 
        failRate: Math.round(failRate),
    };
  }, [isAllSubjects, finalFilteredData, batchFilteredData]);

  // --- Overall Pass/Fail Pie Chart Data ---
  const overallPassFailData = useMemo(() => ([
      { name: `Passed (${summaryMetrics.passRate}%)`, value: summaryMetrics.passRate },
      { name: `Failed (${summaryMetrics.failRate}%)`, value: summaryMetrics.failRate },
  ]), [summaryMetrics.passRate, summaryMetrics.failRate]);
  
  // -----------------------------------------------------------------
  // Subject-wise Pass/Fail Bar Chart Data (Card 4) (omitted for brevity)
  // -----------------------------------------------------------------
  const subjectPassFailData = useMemo(() => {
      const data = isAllSubjects ? batchFilteredData : finalFilteredData;
      const aggregatedSubjectData = data.flatMap(batch => 
          batch.subjectData.map(subject => ({
              subjectName: subject.subjectName,
              passed: subject.studentsPassed,
              failed: subject.studentsFailed,
          }))
      );
      const groupedData = aggregatedSubjectData.reduce((acc, item) => {
          const key = item.subjectName;
          if (!acc[key]) { acc[key] = { name: key, Passed: 0, Failed: 0 }; }
          acc[key].Passed += item.passed;
          acc[key].Failed += item.failed;
          return acc;
      }, {});
      
      if (Object.keys(groupedData).length === 0) {
          return [
              { name: 'Overall', Passed: summaryMetrics.totalPassed, Failed: summaryMetrics.totalFailed }
          ];
      }

      const finalData = Object.values(groupedData).sort((a, b) => a.name.localeCompare(b.name));
      return finalData;

  }, [isAllSubjects, finalFilteredData, batchFilteredData, summaryMetrics]);


  // -----------------------------------------------------------------
  // Core Graph Data Generation for Charts 5 & 6 
  // -----------------------------------------------------------------
  const { chartMarksData, chartAttendanceData, chartXAxis, chartTitle, xAxisConfig } = useMemo(() => {
    
    let marksData = [];
    let attendanceData = [];
    let chartTitle = 'Overall Performance Dashboard';
    let chartXAxis = 'name';

    // --- Determine X-Axis configuration based on view mode ---
    let config = {};
    if (!isAllSubjects && finalFilteredData.length === 1) {
        // Student vs Student View - Vertical labels for many student names
        config = {
            angle: -90,
            textAnchor: 'end',
            height: 80, 
            style: { fontSize: '10px' } 
        };
    } else {
        // All Comparison Views - Horizontal labels
        config = {
            angle: 0,
            textAnchor: 'middle',
            height: 30, 
            style: { fontSize: '11px' }
        };
    }

    // ... Data Filtering Logic (remains the same) ...
    if (!isAllSubjects && finalFilteredData.length === 1) {
        const subject = finalFilteredData[0].subjectData.find(s => s.subjectName === selectedSubjectName);
        marksData = subject.studentData.map(s => ({ name: s.name, 'Exam Marks': s.marks, 'Assignment Marks': s.assignmentMarks }));
        attendanceData = subject.studentData.map(s => ({ name: s.name, 'Attendance (%)': s.attendance }));
        chartTitle = `Marks & Attendance of Individual Students in: ${selectedSubjectName} (Batch: ${finalFilteredData[0].batchName})`;
    } else if (!isAllBatches && finalFilteredData.length === 1) {
        const batch = finalFilteredData[0];
        marksData = batch.subjectData.map(s => ({ name: s.subjectName, 'Avg Exam Marks': s.avgMark, 'Avg Assignment Marks': s.avgAssignmentMark }));
        attendanceData = batch.subjectData.map(s => ({ name: s.subjectName, 'Pass Rate (%)': s.passRate }));
        chartTitle = `Subject-wise Performance for Batch: ${selectedBatchName}`;
    } else if (!isAllCourses) {
        const comparisonData = finalFilteredData.reduce((acc, d) => {
            if (!acc[d.batchName]) { acc[d.batchName] = { name: d.batchName, totalMarks: 0, totalAssignment: 0, totalAttendance: 0, count: 0 }; }
            acc[d.batchName].totalMarks += d.overallAvgMarks; acc[d.batchName].totalAssignment += d.overallAvgAssignmentMarks;
            acc[d.batchName].totalAttendance += d.avgAttendanceRate; acc[d.batchName].count += 1; return acc;
        }, {});
        marksData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Exam Marks': Math.round(d.totalMarks / d.count), 'Avg Assignment Marks': Math.round(d.totalAssignment / d.count) }));
        attendanceData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Attendance (%)': Math.round(d.totalAttendance / d.count) }));
        chartTitle = `Batch-wise Comparison for Course: ${selectedCourseLevel}`;
    } else if (!isAllInstitutes) {
        const comparisonData = instituteFilteredData.reduce((acc, d) => {
            const key = d.courseLevelKey;
            if (!acc[key]) { acc[key] = { name: key, totalMarks: 0, totalAssignment: 0, totalAttendance: 0, count: 0 }; }
            acc[key].totalMarks += d.overallAvgMarks; acc[key].totalAssignment += d.overallAvgAssignmentMarks;
            acc[key].totalAttendance += d.avgAttendanceRate; acc[key].count += 1; return acc;
        }, {});
        marksData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Exam Marks': Math.round(d.totalMarks / d.count), 'Avg Assignment Marks': Math.round(d.totalAssignment / d.count) }));
        attendanceData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Attendance (%)': Math.round(d.totalAttendance / d.count) }));
        chartTitle = `Course-wise Comparison for ${selectedInstituteName}`;
    } else {
        const comparisonData = teacherScopeData.reduce((acc, d) => {
            const key = d.institution;
            if (!acc[key]) { acc[key] = { name: key, totalMarks: 0, totalAssignment: 0, totalAttendance: 0, count: 0 }; }
            acc[key].totalMarks += d.overallAvgMarks; acc[key].totalAssignment += d.overallAvgAssignmentMarks;
            acc[key].totalAttendance += d.avgAttendanceRate; acc[key].count += 1; return acc;
        }, {});
        marksData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Exam Marks': Math.round(d.totalMarks / d.count), 'Avg Assignment Marks': Math.round(d.totalAssignment / d.count) }));
        attendanceData = Object.values(comparisonData).map(d => ({ name: d.name, 'Avg Attendance (%)': Math.round(d.totalAttendance / d.count) }));
        chartTitle = 'Overall Marks & Attendance: Institute Comparison';
    }


    return {
        chartMarksData: marksData,
        chartAttendanceData: attendanceData,
        chartXAxis: 'name',
        chartTitle: chartTitle,
        xAxisConfig: config 
    };
  }, [isAllSubjects, isAllCourses, isAllInstitutes, selectedBatchName, selectedSubjectName, finalFilteredData, instituteFilteredData, selectedInstituteName, teacherScopeData]);

  
  // Set bar width and container width for horizontal scrolling in student view
  const studentCount = isAllSubjects && finalFilteredData.length === 1 ? finalFilteredData[0].totalStudents : 0;
  const barWidth = studentCount > 0 ? 15 : 25; 
  
  // Only apply dynamic width (scrolling) for the Student-wise view. 
  const chartWidthStyle = useMemo(() => {
    if (studentCount > 0) {
      return { width: studentCount * 45 }; 
    }
    return { width: '100%' };
  }, [studentCount]);


  return (
    <div className="TARA_dashboard-container">
      <h1 className="TARA_dashboard-title">Reports & Analytics </h1>

      {/* FILTER BOX (omitted for brevity) */}
      <div className="TARA_filter-box">
        <div className="TARA_filter-row">
            {/* ... Filter JSX (omitted) ... */}
            <div className="TARA_filter-group">
                <label htmlFor="institute-select" className="TARA_filter-label">Institute:</label>
                <select
                id="institute-select"
                value={selectedInstituteId}
                onChange={(e) => { setSelectedInstituteId(e.target.value); clearCourseFilter(); }}
                className="TARA_filter-select"
                >
                {instituteOptions.map(inst => (<option key={inst.id} value={inst.id}>{inst.name}</option>))}
                </select>
            </div>
            {!isAllInstitutes && (
                <div className="TARA_filter-group">
                    <label htmlFor="course-select" className="TARA_filter-label">Courses</label>
                    <select id="course-select" value={selectedCourseLevel} onChange={(e) => { setSelectedCourseLevel(e.target.value); clearBatchFilter(); }} className="TARA_filter-select">
                        {availableCourses.map(key => (<option key={key} value={key}>{key === 'ALL' ? 'All Courses (Comparison)' : key}</option>))}
                    </select>
                    {!isAllCourses && (<button className="TARA_clear-button" onClick={clearCourseFilter} title="Clear Course Filter">&times;</button>)}
                </div>
            )}
            {!isAllCourses && (
                <div className="TARA_filter-group">
                    <label htmlFor="batch-select" className="TARA_filter-label">Batch:</label>
                    <select id="batch-select" value={selectedBatchName} onChange={(e) => { setSelectedBatchName(e.target.value); clearSubjectFilter(); }} className="TARA_filter-select">
                        {availableBatches.map(batch => (<option key={batch} value={batch}>{batch === 'ALL' ? 'All Batches (Comparison)' : batch}</option>))}
                    </select>
                    {!isAllBatches && ( <button className="TARA_clear-button" onClick={clearBatchFilter} title="Clear Batch Filter">&times;</button>)}
                </div>
            )}
            {!isAllBatches && availableSubjects.length > 2 && (
                <div className="TARA_filter-group">
                    <label htmlFor="subject-select" className="TARA_filter-label">Subject:</label>
                    <select id="subject-select" value={selectedSubjectName} onChange={(e) => setSelectedSubjectName(e.target.value)} className="TARA_filter-select">
                        {availableSubjects.map(subject => (<option key={subject} value={subject}>{subject === 'ALL' ? 'All Students (Student-wise)' : subject}</option>))}
                    </select>
                    {!isAllSubjects && (<button className="TARA_clear-button" onClick={clearSubjectFilter} title="Clear Subject Filter">&times;</button>)}
                </div>
            )}
        </div>
      </div>
      
      {/* ----------------------------------------------------------------- */}
      {/* 4-CARD SUMMARY GRID (2x2 Layout) */}
      {/* ----------------------------------------------------------------- */}
      <div className="TARA_summary-grid">
        
        {/* CARD 1: SCOPE COUNTS */}
        <div className="TARA_chart-card TARA_small-card">
            <h3 className="TARA_card-title">Current Scope Counts</h3>
            <p className="TARA_card-subtitle">Total entities covered by the current filter.</p>
            <div className="TARA_summary-metrics-row TARA_count-metrics-row">
                <div><div className="TARA_summary-value TARA_students-value">{summaryMetrics.totalStudents}</div><div className="TARA_summary-label">Total Students</div></div>
                <div><div className="TARA_summary-value TARA_batch-value">{summaryMetrics.uniqueBatches}</div><div className="TARA_summary-label">Total Batches</div></div>
                <div><div className="TARA_summary-value TARA_subject-value">{summaryMetrics.uniqueSubjects}</div><div className="TARA_summary-label">Total Subjects</div></div>
            </div>
        </div>
        
        {/* CARD 2: AVERAGE MARKS/ATTENDANCE */}
        <div className="TARA_chart-card TARA_small-card">
            <h3 className="TARA_card-title"> Overall Average Performance</h3>
            <p className="TARA_card-subtitle">Aggregated average marks and attendance rate.</p>
            <div className="TARA_summary-metrics-row">
                <div><div className="TARA_summary-value TARA_marks-value">{summaryMetrics.totalAvgMarks}</div><div className="TARA_summary-label">Avg Exam Marks</div></div>
                <div><div className="TARA_summary-value TARA_assignment-value">{summaryMetrics.totalAvgAssignmentMarks}</div><div className="TARA_summary-label">Avg Assignment Marks</div></div>
                <div><div className="TARA_summary-value TARA_attendance-value">{summaryMetrics.totalAttendanceRate}%</div><div className="TARA_summary-label">Avg Attendance Rate</div></div>
            </div>
        </div>

        {/* CARD 3: OVERALL PASS/FAIL PIE CHART (FIXED LEGEND POSITION) */}
        <div className="TARA_chart-card TARA_rate-card TARA_pie-card">
            <h3 className="TARA_card-title">Overall Success Rate (%) - Pie Chart</h3>
            <p className="TARA_card-subtitle">Visualizing the aggregated Pass vs. Fail percentage.</p>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                        data={overallPassFailData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90} 
                        fill="#8884d8"
                        paddingAngle={5}
                        labelLine={false}
                        // Use default label rendering but ensure text doesn't overlap legend
                        label
                    >
                        {overallPassFailData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    {/* FIX: Move Legend to bottom to prevent overlap with pie slice labels */}
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" /> 
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* CARD 4: SUBJECT-WISE PASSED vs FAILED BAR CHART */}
        <div className="TARA_chart-card TARA_bar-card-subject">
          <h3 className="TARA_card-title">Subject-wise Pass/Fail Count (Bar Graph)</h3>
          <p className="TARA_card-subtitle">Count of students Passed vs Failed by Subject in the current scope.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={subjectPassFailData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              {/* Horizontal X-Axis for comparison view */}
              <XAxis dataKey="name" angle={0} textAnchor="middle" height={30} style={{ fontSize: '11px' }} />
              <YAxis allowDecimals={false} label={{ value: 'Student Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Passed" fill={CHART_COLORS.Pass} stackId="a" radius={[4, 4, 0, 0]} barSize={35} />
              <Bar dataKey="Failed" fill={CHART_COLORS.Fail} stackId="a" radius={[4, 4, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* ----------------------------------------------------------------- */}
      {/* MAIN CHARTS GRID (Side-by-side with dynamic X-axis for readability) */}
      {/* ----------------------------------------------------------------- */}
      <div className="TARA_horizontal-report-grid">
        
        {/* CHART 5: Marks Report (Exam + Assignment) */}
        <div className="TARA_chart-card">
            <h3 className="TARA_card-title">Marks Report (Exam & Assignment)</h3>
            <p className="TARA_card-subtitle">Tracking **Exam Marks** and **Assignment Marks** across the relevant entities.</p>
            <ResponsiveContainer width={chartWidthStyle.width} height={300}>
                <BarChart
                    data={chartMarksData}
                    // Adjust bottom margin based on XAxis height
                    margin={{ top: 10, right: 30, left: 20, bottom: xAxisConfig.height + 5 }} 
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey={chartXAxis} 
                        angle={xAxisConfig.angle} 
                        textAnchor={xAxisConfig.textAnchor} 
                        height={xAxisConfig.height} 
                        style={xAxisConfig.style} 
                        interval="preserveStartEnd"
                    />
                    <YAxis label={{ value: 'Marks', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Avg Assignment Marks" fill={CHART_COLORS.Assignment} radius={[4, 4, 0, 0]} barSize={barWidth} />
                    <Bar dataKey="Avg Exam Marks" fill={CHART_COLORS.Marks} radius={[4, 4, 0, 0]} barSize={barWidth} />
                    <Bar dataKey="Assignment Marks" fill={CHART_COLORS.Assignment} radius={[4, 4, 0, 0]} barSize={barWidth} />
                    <Bar dataKey="Exam Marks" fill={CHART_COLORS.Marks} radius={[4, 4, 0, 0]} barSize={barWidth} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* CHART 6: Attendance/Pass Rate Report */}
        <div className="TARA_chart-card">
            <h3 className="TARA_card-title">Attendance/Pass Rate Report</h3>
            <p className="TARA_card-subtitle">Tracking **Attendance (%)** or **Pass Rate (%)** across the relevant entities.</p>
            <ResponsiveContainer width={chartWidthStyle.width} height={280}>
                <BarChart
                    data={chartAttendanceData}
                    // Adjust bottom margin based on XAxis height
                    margin={{ top: 10, right: 30, left: 20, bottom: xAxisConfig.height + 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey={chartXAxis} 
                        angle={xAxisConfig.angle} 
                        textAnchor={xAxisConfig.textAnchor} 
                        height={xAxisConfig.height} 
                        style={xAxisConfig.style} 
                        interval="preserveStartEnd"
                    />
                    <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} domain={[50, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="Avg Attendance (%)" fill={CHART_COLORS.Attendance} radius={[4, 4, 0, 0]} barSize={barWidth} />
                    <Bar dataKey="Pass Rate (%)" fill={CHART_COLORS.Pass} radius={[4, 4, 0, 0]} barSize={barWidth} />
                    <Bar dataKey="Attendance (%)" fill={CHART_COLORS.Attendance} radius={[4, 4, 0, 0]} barSize={barWidth} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default TeacherReportsAnalytics;