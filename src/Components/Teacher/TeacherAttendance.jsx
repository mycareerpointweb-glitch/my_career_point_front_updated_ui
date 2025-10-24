import "../../Styles/Teacher/TeacherAttendance.css";
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// --- LOCAL JSON DATA IMPORT (Assuming this data structure is available) ---
import jsonData from '../dummy.json'; 

// Using lucide-react for modern, clean icons
import {
    Users, BookOpen, Search,
    MonitorCheck, UserCog, Home,
    Layers, Aperture, TrendingUp,
    ChevronLeft, ChevronRight,
    ChevronDown,
    CalendarCheck, Check, X, Filter, List, Calendar, FileDown,
    Target, LineChart, TrendingDown, GraduationCap, Scale, // Added Scale for Law/Tax
    Calculator, // Added Calculator for Accounting/Math
    DollarSign // Added DollarSign for Finance/Economics
} from 'lucide-react';
// Assuming this is a placeholder or an external component
import AssignmentManagement from "../SuperAdmin/Assignments/Assignment"; 
import { FiSearch } from "react-icons/fi";

const batchRefMap = new Map(jsonData.batches_reference.map(b => [b.batch_id, b.batch_name]));

// 2. Map all student IDs to their full objects for quick lookup
const studentRefMap = new Map(jsonData.students_reference.map(s => [s.student_id, s]));

// 3. Map institution ID to its list of course IDs (for filtering Streams)
const institutionCoursesMap = new Map();
jsonData.data.forEach(inst => {
    institutionCoursesMap.set(inst.institution_id, inst.courses.map(c => c.course_id));
});


/**
 * Transforms the nested JSON structure into a flat list of batches,
 * now including the institutionId for filtering.
 */
const TRANSFORMED_BATCHES_WITH_INST = jsonData.data.flatMap(institution => {
    return institution.courses.flatMap(course => {
        return course.levels.flatMap(level => {
            return level.batches.map(batch => {
                const batchName = batchRefMap.get(batch.batch_id) || batch.batch_id;
                // Calculate total enrollment from all classes in the batch
                const enrollment = batch.classes.reduce((total, classItem) => total + classItem.students_ids.length, 0);

                return {
                    id: batch.batch_id,
                    courseName: batchName,
                    batchPrefix: batch.batch_id.split('_').slice(0, 3).join('-'),
                    stream: course.course_id,
                    level: level.level_name,
                    enrollment: enrollment,
                    status: "Active",
                    studentClasses: batch.classes, // Keep the list of classes
                    institutionId: institution.institution_id, 
                };
            });
        });
    });
});

const DUMMY_BATCHES = TRANSFORMED_BATCHES_WITH_INST;


// --- DYNAMIC DATA DERIVATIONS FROM JSON ---

// 1. DYNAMIC INSTITUTES: Derived from institutions_reference
// REFACTORED: Renamed INSTITUTES to COLLEGES for clarity based on prompt, though internal IDs use 'institution'
const COLLEGES = jsonData.institutions_reference.map(inst => ({
    id: inst.institution_id,
    label: inst.name,
    description: inst.location,
    icon: Home, 
}));

// 2. DYNAMIC STREAMS: Derived from courses_reference (Global List)
const STREAMS_GLOBAL = jsonData.courses_reference.map(course => ({
    id: course.course_id,
    label: course.course_id,
    description: course.course_name,
    icon: BookOpen,
}));

// 3. DYNAMIC LEVELS: Derived from unique level names in the data structure
const uniqueLevels = new Set();
jsonData.data.forEach(institution => {
    institution.courses.forEach(course => {
        course.levels.forEach(level => {
            uniqueLevels.add(level.level_name);
        });
    });
});

// Defined order for display preference
const LEVELS_ORDER = ['Foundation', 'Intermediate', 'Advanced', 'Final']; 

const LEVELS = LEVELS_ORDER.filter(l => Array.from(uniqueLevels).includes(l)).map(levelName => ({
    id: levelName,
    label: levelName,
    description: `${levelName} courses.`,
    icon: levelName.includes('Foundation') ? Layers : (levelName.includes('Intermediate') ? Aperture : TrendingUp),
}));


// --- NEW: DUMMY SUBJECTS FOR CA/CMA ---
// NOTE: This array is now used in a slider, so we keep it as a constant list of objects
const SUBJECTS_CA_CMA = [
    { id: 'S_Taxation', label: 'Taxation', description: 'Direct & Indirect Tax Laws', icon: Scale },
    { id: 'S_Accounting', label: 'Accounting', description: 'Financial & Corporate Accounting', icon: Calculator },
    { id: 'S_Law', label: 'Corporate Law', description: 'Company & Business Laws', icon: Scale },
    { id: 'S_Audit', label: 'Auditing', description: 'Auditing and Assurance', icon: Check },
    { id: 'S_Cost', label: 'Cost Mgmt', description: 'Cost & Management Accounting', icon: TrendingUp },
    { id: 'S_FM', label: 'Fin. Mgmt', description: 'Financial Management', icon: DollarSign },
];


// Static application data (NOT USED AFTER ROLE REMOVAL)
const ROLES = [
    { id: 'Student', label: 'Student', description: 'Manage or view assignments.', icon: MonitorCheck },
    { id: 'Teacher', label: 'Teacher', description: 'Assign or grade class work.', icon: UserCog },
];

const GENDER_OPTIONS = [
    { label: 'All Genders', value: 'All' },
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
];

const mockGender = (studentName) => {
    const isFemaleName = /(a|i|e|o|u)a$|i|a|e|o|u|y|h/i.test(studentName.slice(-1));
    return isFemaleName ? 'Female' : 'Male';
};


// Helper functions (generateCurrentWeekDays, generateFullDays, CustomDropdown, NavCard, BatchCard, StatsCard, AssignmentTable)
const generateCurrentWeekDays = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push({
            date: date,
            label: date.getDate(),
            isToday: i === 0,
            fullDate: date.toISOString().split('T')[0],
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'narrow' })
        });
    }
    return dates;
};

const generateFullDays = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let currentDate = startDate;
    while (currentDate <= today) {
        dates.push({
            date: new Date(currentDate), 
            label: currentDate.getDate(),
            isToday: currentDate.toISOString().split('T')[0] === today.toISOString().split('T')[0],
            fullDate: currentDate.toISOString().split('T')[0],
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'narrow' })
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

// Placeholder function for assignment data (replaces generateDummyAttendance)
const generateDummyAssignmentData = (students, allDays) => {
    const assignment = {};
    const completionRate = 0.8; 
    
    allDays.forEach(day => {
        students.forEach(student => {
            if (!assignment[student.id]) {
                assignment[student.id] = {};
            }
            // 'S' for Submitted (P), 'P' for Pending (A)
            let status = 'P'; 
            if (Math.random() < completionRate) {
                status = 'S'; 
            }
            
            assignment[student.id][day.fullDate] = status;
        });
    });
    return assignment;
};


const CustomDropdown = ({ options, value, onChange, placeholder, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="TAM_custom-dropdown-container" ref={dropdownRef}>
            <div className={`TAM_custom-dropdown-display ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {Icon && <Icon size={16} className="TAM_dropdown-icon" />}
                {selectedOption.label || placeholder}
                <ChevronDown size={16} className="TAM_dropdown-chevron" />
            </div>
            {isOpen && (
                <div className="TAM_custom-dropdown-options">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`TAM_custom-dropdown-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const NavCard = ({ item, selectedId, onSelect, Icon, themeClass }) => {
    const isSelected = item.id === selectedId;
    const selectedClass = isSelected ? themeClass : '';

    return (
        <div
            className={`TAM_nav-card ${selectedClass}`}
            onClick={() => onSelect(item.id)}
            role="button"
            aria-pressed={isSelected}
        >
            <Icon size={28} className="TAM_nav-card-icon" />
            <h3>{item.label}</h3>
            {item.description && <p>{item.description}</p>}
        </div>
    );
};

const BatchCard = ({ batch, isSelected, onSelect }) => (
    <div
        className={`TAM_batch-card ${isSelected ? 'TAM_selected' : ''}`}
        onClick={() => onSelect(batch.id)}
        role="button"
        aria-pressed={isSelected}
    >
        <div className="TAM_batch-card-title">{batch.courseName}</div>
        <div className="TAM_batch-card-details">
            <CalendarCheck size={12} style={{ display: 'inline-block', marginRight: '4px' }} />
            Batch Code: {batch.batchPrefix}
        </div>
        <div className="TAM_batch-card-details">
            <Users size={12} style={{ display: 'inline-block', marginRight: '4px' }} />
            Enrolled: {batch.enrollment}
        </div>
        <span className="TAM_badge">{batch.level}</span>
    </div>
);

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`TAM_stats-card ${colorClass}`}>
        <div className={`TAM_stats-content`}>
            <p className="TAM_stats-title">{title}</p>
            <h3 className="TAM_stats-value">{value}</h3>
        </div>
        <Icon size={32} className="TAM_stats-icon" />
    </div>
);


// Refactored Table component (Unchanged)
const AssignmentTable = ({ students, assignmentData, days, toggleAssignmentStatus, viewMode, userRole, toggleViewMode }) => {
    const todayFullDate = days.find(d => d.isToday)?.fullDate;
    // Filter to only show the first student if the userRole is 'Student'
    const studentFilteredStudents = useMemo(() => {
        return userRole === 'Student' && students.length > 0 ? students.slice(0, 1) : students;
    }, [students, userRole]);

    const scrollRef = useRef(null);
    // Placeholder for marking/grading permission
    const isGradingAllowed = userRole === 'Teacher' || userRole === 'Student'; 

    useEffect(() => {
        if (scrollRef.current && viewMode === 'full') {
            // Scroll to the latest day (right side)
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [days, viewMode]);

    // Inline styles to enforce fixed/sticky columns
    const percentageColumnStyles = { 
        position: 'sticky', 
        left: '200px', // Assuming TAM_sticky-col width is 200px
        zIndex: 2, 
        minWidth: '80px', // Ensure visibility
        textAlign: 'center',
        textColor: 'pink',
        fontWeight: 'bold',
    };
    const studentNameStyles = { zIndex: 3 }; // Ensure student name stays above the percentage column

    return (
        <div className="TAM_table-container">
            <div className="TAM_table-responsive-wrapper" ref={scrollRef}>
                <table className="TAM_assignment-table">
                    <thead>
                        <tr className="TAM_assignment-table-backgroundcolor">
                            <th className="TAM_sticky-col" style={studentNameStyles}>Student Name (Roll No)</th>
                            
                            {/* NEW: Total Percentage Column */}
                            <th style={percentageColumnStyles}>Completion %</th>
                            
                            <th>Gender</th>
                            {days.map(day => (
                                <th
                                    key={day.fullDate}
                                    className={day.isToday ? 'TAM_today-header' : ''}
                                    title={day.date.toLocaleDateString()}
                                >
                                    {day.label}
                                    <span className="TAM_day-of-week">{day.dayOfWeek}</span>
                                </th>
                            ))}
                            <th
                                className={`TAM_view-toggle-header TAM_view-mode-${viewMode}`}
                                onClick={toggleViewMode}
                                title={viewMode === 'week' ? `Show Full Month History (${days.length} Days)` : 'Show Current Week (7 Days)'}
                            >
                                {viewMode === 'week' ? <List size={18} /> : <Calendar size={18} />}
                                <span className="TAM_toggle-label">
                                    {viewMode === 'week' ? 'Monthly' : 'Weekly'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentFilteredStudents.length === 0 ? (
                            <tr><td colSpan={days.length + 4} className="TAM_no-data">No students found matching the filter criteria.</td></tr>
                        ) : (
                            studentFilteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="TAM_sticky-col" style={studentNameStyles}>
                                        <div className="TAM_student-name-cell">
                                            <span className="TAM_profile-icon">{student.profile}</span>
                                            <div>
                                                <strong>{student.name}</strong>
                                                <p className="TAM_roll-no">{student.rollNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* NEW: Total Percentage Data Cell */}
                                    <td style={percentageColumnStyles}>
                                        <span className="TAM_percentage-value">
                                            {student.assignmentPercentage}%
                                        </span>
                                    </td>
                                    
                                    <td>{student.gender}</td>
                                    {days.map(day => {
                                        // 'S' for Submitted (P), 'P' for Pending (A)
                                        const status = assignmentData[student.id]?.[day.fullDate] || 'P'; 

                                        // Determine if marking is allowed for the current cell
                                        const canToggle = day.isToday && isGradingAllowed;

                                        return (
                                            <td
                                                key={day.fullDate}
                                                className={`TAM_status-cell ${day.isToday ? 'TAM_today-cell' : ''}`}
                                                onClick={() => canToggle && toggleAssignmentStatus(student.id, todayFullDate)}
                                                style={{ cursor: canToggle ? 'pointer' : 'default' }}
                                            >
                                                {day.isToday ? (
                                                    <span className={`TAM_today-status TAM_status-${status === 'S' ? 'p' : 'a'}`}>
                                                        {status === 'S' ? <Check size={18} /> : <X size={18} />}
                                                    </span>
                                                ) : (
                                                    <span className={`TAM_status-text TAM_status-${status === 'S' ? 'p' : 'a'}`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="TAM_toggle-placeholder-col"></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Component ---
// REFACTORED: Renamed component to TeacherAssignment (Function name)
const TeacherAssignment = ({ userRole }) => {

    // REQ: Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Placeholder for grading permission (was isAttendanceMarkingAllowed)
    const isGradingAllowed = useMemo(() => {
        return !['Admin', 'Super Admin'].includes(userRole);
    }, [userRole]);

    // Initial State Helpers
    const getInitialInstitute = () => null;
    // REFACTORED: Removed getInitialRole, assuming default 'Teacher' context 
    const getInitialStream = () => null;
    const getInitialLevel = () => null;
    const getInitialBatch = () => null;
    const getInitialClass = () => null; 
    // NEW: Initial Subject State
    const getInitialSubject = () => null; 

    
    // --- State Management ---
    // REFACTORED: Removed selectedRole state
    const [selectedInstituteId, setSelectedInstituteId] = useState(getInitialInstitute); 
    const [selectedStream, setSelectedStream] = useState(getInitialStream);
    const [selectedLevel, setSelectedLevel] = useState(getInitialLevel);
    const [selectedBatchId, setSelectedBatchId] = useState(getInitialBatch);
    const [selectedClassId, setSelectedClassId] = useState(getInitialClass); 
    // NEW: Subject State
    const [selectedSubjectId, setSelectedSubjectId] = useState(getInitialSubject); 
    
    const [searchTermInstitute, setSearchTermInstitute] = useState(''); 
    const [searchTerm, setSearchTerm] = useState(''); 

    // Stage 2 Assignment States (Refactored from Attendance States)
    const [students, setStudents] = useState([]);
    const [assignmentData, setAssignmentData] = useState({}); 
    const [searchTermStudents, setSearchTermStudents] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const [viewMode, setViewMode] = useState('week'); 

    // Refs for auto-scroll
    const nextStepRef = useRef(null);
    const dashboardRef = useRef(null);

    // Initial Data Setup
    const [weekDays] = useState(generateCurrentWeekDays());
    const [fullDays] = useState(generateFullDays());
    const days = viewMode === 'full' ? fullDays : weekDays;
    const todayFullDate = days.find(d => d.isToday)?.fullDate;

    // Logic to determine if the filter bar should be visible
    const isFilterActive = searchTermStudents !== '' || genderFilter !== 'All';

    // REQ: Auto-scroll function
    const autoScrollToNextStep = useCallback(() => {
        if (nextStepRef.current) {
            nextStepRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, []);


    // --- Data Filtering Logic (Stage 1 & 2) ---

    // 1. Filter Institutes (COLLEGES) by Search
    const filteredInstitutes = useMemo(() => {
        let list = COLLEGES; // Using COLLEGES
        if (searchTermInstitute) {
            const lowerCaseSearch = searchTermInstitute.toLowerCase();
            list = list.filter(inst =>
                inst.label.toLowerCase().includes(lowerCaseSearch) ||
                inst.description.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return list;
    }, [searchTermInstitute]);


    // 2. Filter STREAMS (Courses) by selected Institute (UNCHANGED)
    const filteredStreams = useMemo(() => {
        if (!selectedInstituteId) {
            return STREAMS_GLOBAL; 
        }
        
        const allowedCourseIds = institutionCoursesMap.get(selectedInstituteId) || [];
        
        return STREAMS_GLOBAL.filter(stream => allowedCourseIds.includes(stream.id));

    }, [selectedInstituteId]); 


    // 3. Filter Batches (UNCHANGED)
    const filteredBatches = useMemo(() => {
        let batches = DUMMY_BATCHES;
        
        if (selectedInstituteId) {
             batches = batches.filter(batch => batch.institutionId === selectedInstituteId);
        } else {
            return [];
        }

        if (selectedStream) {
            batches = batches.filter(batch => batch.stream === selectedStream);
        }

        if (selectedLevel) {
            batches = batches.filter(batch => batch.level === selectedLevel);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            batches = batches.filter(batch =>
                batch.courseName.toLowerCase().includes(lowerCaseSearch) ||
                batch.batchPrefix.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return batches;
    }, [selectedInstituteId, selectedStream, selectedLevel, searchTerm]);

    // NEW: Derive Classes from selected Batch (UNCHANGED)
    const filteredClasses = useMemo(() => {
        if (!selectedBatchId) return [];
        
        const batch = DUMMY_BATCHES.find(b => b.id === selectedBatchId);
        if (!batch) return [];

        // Map the class structure to NavCard format
        return batch.studentClasses.map(classItem => {
            const parts = classItem.class_id.split('_');
            const classLabel = parts.length > 3 ? `${parts[3]} ${parts[4]}` : classItem.class_id; // e.g., 'Class 01'
            
            return {
                id: classItem.class_id,
                label: classLabel,
                description: `${classItem.students_ids.length} students`,
                icon: GraduationCap 
            };
        });
    }, [selectedBatchId]);


    // NEW: Calculate individual percentage and filter students (UNCHANGED)
    const studentsWithStats = useMemo(() => {
        let list = students;
        
        // 1. Filter students based on search and gender
        if (searchTermStudents) {
            const lowerCaseSearch = searchTermStudents.toLowerCase();
            list = list.filter(student =>
                student.name.toLowerCase().includes(lowerCaseSearch) ||
                student.rollNo.toLowerCase().includes(lowerCaseSearch)
            );
        }
        if (genderFilter !== 'All') {
            list = list.filter(student => student.gender === genderFilter);
        }
        
        // 2. Calculate completion percentage for each student in the filtered list
        return list.map(student => {
            const studentAssignment = assignmentData[student.id] || {};
            let submittedCount = 0;
            let totalRecords = 0;

            // Calculate based on all recorded days (fullDays are available in state)
            Object.values(studentAssignment).forEach(status => {
                totalRecords++;
                if (status === 'S') { // 'S' for Submitted
                    submittedCount++;
                }
            });

            const percentage = totalRecords > 0 ? ((submittedCount / totalRecords) * 100).toFixed(1) : '0.0';

            return {
                ...student,
                assignmentPercentage: percentage // ADDED STAT (Renamed from attendancePercentage)
            };
        });
    }, [students, assignmentData, searchTermStudents, genderFilter]); 


    const stats = useMemo(() => {
        // Students who submitted the 'today' assignment ('S' for Submitted)
        const submittedToday = studentsWithStats.filter(student =>
            assignmentData[student.id]?.[todayFullDate] === 'S'
        ).length;

        const total = students.length;
        const filteredCount = studentsWithStats.length;

        // Calculate Overall Completion Percentage 
        let totalSubmitted = 0;
        let totalRecords = 0;
        students.forEach(student => {
            const studentAssignment = assignmentData[student.id];
            if (studentAssignment) {
                Object.values(studentAssignment).forEach(status => {
                    totalRecords++;
                    if (status === 'S') {
                        totalSubmitted++;
                    }
                });
            }
        });
        const overallPercentage = totalRecords > 0 ? ((totalSubmitted / totalRecords) * 100).toFixed(1) : '0.0';

        return {
            total: total,
            submittedToday: submittedToday, // Renamed from presentToday
            pendingToday: filteredCount - submittedToday, // Renamed from absentToday
            filteredCount: filteredCount,
            overallPercentage: overallPercentage,
            icons: {
                total: Users,
                filtered: Target, 
                submitted: Check, // Renaming from present to submitted
                pending: X, // Renaming from absent to pending
                overall: LineChart 
            },
            colorClasses: {
                total: 'TAM_stats-total',
                filtered: 'TAM_stats-filtered', 
                submitted: 'TAM_stats-present', 
                pending: 'TAM_stats-absent', 
                overall: 'TAM_stats-overall' 
            }
        };
    }, [students, studentsWithStats, assignmentData, todayFullDate]);


    // --- Slider Controls for Institutes/Colleges (REFACTORED to use NavCard) ---
    const instituteSliderRef = useRef(null);
    const [instituteShowControls, setInstituteShowControls] = useState(false);
    const [instituteCanScrollLeft, setInstituteCanScrollLeft] = useState(false);
    const [instituteCanScrollRight, setInstituteCanScrollRight] = useState(false);

    const checkInstituteScrollState = useCallback(() => {
        const slider = instituteSliderRef.current;
        if (slider) {
            const isOverflowing = slider.scrollWidth > slider.clientWidth;
            if (window.innerWidth > 768) {
                setInstituteShowControls(isOverflowing);
            } else {
                setInstituteShowControls(false);
            }
            setInstituteCanScrollLeft(slider.scrollLeft > 5);
            setInstituteCanScrollRight(slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        setTimeout(checkInstituteScrollState, 100);
        const slider = instituteSliderRef.current;
        if (slider) {
            slider.addEventListener('scroll', checkInstituteScrollState);
            window.addEventListener('resize', checkInstituteScrollState);
            return () => {
                slider.removeEventListener('scroll', checkInstituteScrollState);
                window.removeEventListener('resize', checkInstituteScrollState);
            };
        }
    }, [checkInstituteScrollState, filteredInstitutes]);

    const handleInstituteScroll = (direction) => {
        const slider = instituteSliderRef.current;
        if (slider) {
            const scrollDistance = 320 * 2;
            const newScrollLeft = direction === 'left'
                ? slider.scrollLeft - scrollDistance
                : slider.scrollLeft + scrollDistance;

            slider.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
    // ---------------------------------------------


    // --- Slider Controls for Batches (UNCHANGED) ---
    const batchSliderRef = useRef(null);
    const [batchShowControls, setBatchShowControls] = useState(false);
    const [batchCanScrollLeft, setBatchCanScrollLeft] = useState(false);
    const [batchCanScrollRight, setBatchCanScrollRight] = useState(false);

    const checkBatchScrollState = useCallback(() => {
        const slider = batchSliderRef.current;
        if (slider) {
            const isOverflowing = slider.scrollWidth > slider.clientWidth;
            if (window.innerWidth > 768) {
                setBatchShowControls(isOverflowing);
            } else {
                setBatchShowControls(false);
            }
            setBatchCanScrollLeft(slider.scrollLeft > 5);
            setBatchCanScrollRight(slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        setTimeout(checkBatchScrollState, 100);
        const slider = batchSliderRef.current;
        if (slider) {
            slider.addEventListener('scroll', checkBatchScrollState);
            window.addEventListener('resize', checkBatchScrollState);
            return () => {
                slider.removeEventListener('scroll', checkBatchScrollState);
                window.removeEventListener('resize', checkBatchScrollState);
            };
        }
    }, [checkBatchScrollState, filteredBatches]);

    const handleBatchScroll = (direction) => {
        const slider = batchSliderRef.current;
        if (slider) {
            const scrollDistance = 320 * 2;
            const newScrollLeft = direction === 'left'
                ? slider.scrollLeft - scrollDistance
                : slider.scrollLeft + scrollDistance;

            slider.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
    // ---------------------------------------------

    // --- NEW: Slider Controls for Subjects ---
    const subjectSliderRef = useRef(null);
    const [subjectShowControls, setSubjectShowControls] = useState(false);
    const [subjectCanScrollLeft, setSubjectCanScrollLeft] = useState(false);
    const [subjectCanScrollRight, setSubjectCanScrollRight] = useState(false);

    const checkSubjectScrollState = useCallback(() => {
        const slider = subjectSliderRef.current;
        if (slider) {
            const isOverflowing = slider.scrollWidth > slider.clientWidth;
            if (window.innerWidth > 768) {
                setSubjectShowControls(isOverflowing);
            } else {
                setSubjectShowControls(false);
            }
            setSubjectCanScrollLeft(slider.scrollLeft > 5);
            setSubjectCanScrollRight(slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        setTimeout(checkSubjectScrollState, 100);
        const slider = subjectSliderRef.current;
        if (slider) {
            slider.addEventListener('scroll', checkSubjectScrollState);
            window.addEventListener('resize', checkSubjectScrollState);
            return () => {
                slider.removeEventListener('scroll', checkSubjectScrollState);
                window.removeEventListener('resize', checkSubjectScrollState);
            };
        }
    }, [checkSubjectScrollState, SUBJECTS_CA_CMA]);

    const handleSubjectScroll = (direction) => {
        const slider = subjectSliderRef.current;
        if (slider) {
            // Adjusted scroll distance for NavCard items
            const scrollDistance = 200 * 2; 
            const newScrollLeft = direction === 'left'
                ? slider.scrollLeft - scrollDistance
                : slider.scrollLeft + scrollDistance;

            slider.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };
    // ---------------------------------------------


    // --- Stage 1 Handlers ---
    // REFACTORED: Removed handleRoleSelect
    // const handleRoleSelect = (roleId) => { ... };

    const handleInstituteSelect = (instId) => {
        const newInstId = instId === selectedInstituteId ? null : instId;
        
        setSelectedInstituteId(newInstId);
        setSelectedStream(null); 
        setSelectedLevel(null);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // NEW: Reset subject
        setSearchTerm(''); 
        // Auto-scroll to next step after selection
        if (newInstId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleStreamSelect = (streamId) => {
        const newStreamId = streamId === selectedStream ? null : streamId;

        setSelectedStream(newStreamId);
        setSelectedLevel(null);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // NEW: Reset subject
        if (newStreamId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleLevelSelect = (levelId) => {
        const newLevelId = levelId === selectedLevel ? null : levelId;

        setSelectedLevel(newLevelId);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // NEW: Reset subject
        if (newLevelId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleBatchSelect = (batchId) => {
        const newBatchId = batchId === selectedBatchId ? null : batchId;
        setSelectedBatchId(newBatchId);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // NEW: Reset subject
        if (newBatchId) {
            setTimeout(autoScrollToNextStep, 100); 
        }
    };

    // NEW: Class selection handler (UNCHANGED)
    const handleClassSelect = (classId) => {
        const newClassId = classId === selectedClassId ? null : classId;
        setSelectedClassId(newClassId);
        setSelectedSubjectId(null); // NEW: Reset subject
        if (newClassId) {
            setTimeout(autoScrollToNextStep, 100);
        }
    };
    
    // NEW: Subject selection handler
    const handleSubjectSelect = (subjectId) => {
        const newSubjectId = subjectId === selectedSubjectId ? null : subjectId;
        setSelectedSubjectId(newSubjectId);
        if (newSubjectId) {
            // Scroll to dashboard after selecting a subject (FINAL STEP)
            setTimeout(() => {
                if (dashboardRef.current) {
                    dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };


    // --- Stage 2 Handlers & Effects (UNCHANGED) ---
    // MODIFIED: This effect now depends on selectedSubjectId
    useEffect(() => {
        // Only proceed if a specific class AND subject are selected
        if (selectedBatchId && selectedClassId && selectedSubjectId) { 
            const batch = DUMMY_BATCHES.find(b => b.id === selectedBatchId);
            const classItem = batch?.studentClasses.find(c => c.class_id === selectedClassId);

            if (classItem) {
                // Map student IDs from the selected class to full student objects
                const batchStudents = classItem.students_ids.map(id => {
                    const studentRef = studentRefMap.get(id) || {};
                    const name = studentRef.name || 'Unknown Student';
                    const rollNo = id; 
                    const profile = name.charAt(0).toUpperCase();
                    const gender = mockGender(name); 

                    return {
                        id: id, 
                        rollNo: rollNo,
                        name: name,
                        gender: gender,
                        profile: profile,
                    };
                });
                setStudents(batchStudents);
                setAssignmentData(generateDummyAssignmentData(batchStudents, fullDays)); // Using new data function
                setViewMode('week');
            } else {
                setStudents([]);
                setAssignmentData({});
            }

        } else { // Reset if no class or batch is selected
            setStudents([]);
            setAssignmentData({});
        }
    }, [selectedBatchId, selectedClassId, selectedSubjectId, fullDays]);


    // Placeholder for toggleAssignmentStatus function (UNCHANGED)
    const toggleAssignmentStatus = useCallback((studentId, date) => {
        if (!isGradingAllowed) return;

        setAssignmentData(prevData => {
            // 'S' for Submitted (P), 'P' for Pending (A)
            const currentStatus = prevData[studentId]?.[date] || 'P'; 
            const newStatus = currentStatus === 'S' ? 'P' : 'S';

            return {
                ...prevData,
                [studentId]: {
                    ...prevData[studentId],
                    [date]: newStatus
                }
            };
        });
    }, [isGradingAllowed]);

    const toggleViewMode = () => {
        setViewMode(prevMode => prevMode === 'week' ? 'full' : 'week');
    };

    const handleExportExcel = () => {
        alert(`Exporting data to Excel for Batch ID: ${selectedBatchId}, Class ID: ${selectedClassId}, Subject ID: ${selectedSubjectId}...`);
    };


    return (
        <div className="TAM_wrapper">
            <h1 className="TAM_section-title">Assignment Management Dashboard</h1>

            {/* Stage 1: Selection Flow */}
            {selectedSubjectId === null && ( 
                <>
                    
                    {/* Step 1: College/Institute Selection (SLIDER & PERSISTENT) */}
                    <div className="TAM_batch-container" ref={nextStepRef}>
                        <h2 className="TAM_step-title">Colleges / Institutes</h2>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search College by Name or Location"
                                value={searchTermInstitute}
                                onChange={(e) => setSearchTermInstitute(e.target.value)}
                                className="search-input"
                            />
                            <FiSearch className="search-icon" />
                        </div>
                        <div className="TAM_batch-slider-outer">
                            {instituteShowControls && (
                                <>
                                    <div className={`TAM_slider-button left ${!instituteCanScrollLeft ? 'disabled' : ''}`} onClick={() => instituteCanScrollLeft && handleInstituteScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                    <div className={`TAM_slider-button right ${!instituteCanScrollRight ? 'disabled' : ''}`} onClick={() => instituteCanScrollRight && handleInstituteScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                </>
                            )}
                            <div className="TAM_batch-slider-wrapper" ref={instituteSliderRef}> 
                                <div className="TAM_batch-slider-content">
                                    {filteredInstitutes.length > 0 ? (
                                        filteredInstitutes.map(inst => (
                                            <NavCard // Using NavCard for the slider items
                                                key={inst.id}
                                                item={inst}
                                                selectedId={selectedInstituteId}
                                                onSelect={handleInstituteSelect}
                                                Icon={Home}
                                                themeClass="selected-blue"
                                            />
                                        ))
                                    ) : (
                                        <div className="TAM_empty-message full-width">No colleges/institutes found matching the search criteria.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Step 2: Stream Selection (Conditional on Institute) */}
                    {selectedInstituteId && (
                        <div className="TAM_selection-step" ref={nextStepRef}>
                            <h2 className="TAM_step-title">Courses</h2>
                            <div className="TAM_card-selection-row">
                                {filteredStreams.map(stream => (
                                    <NavCard 
                                        key={stream.id} 
                                        item={stream} 
                                        selectedId={selectedStream} 
                                        onSelect={handleStreamSelect} 
                                        Icon={stream.icon} 
                                        themeClass="selected-orange" 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Levels (Conditional on Stream) */}
                    {selectedStream && (
                        <div className="TAM_selection-step" ref={nextStepRef}>
                            <h2 className="TAM_step-title">Levels</h2>
                            <div className="TAM_card-selection-row">
                                {LEVELS.map(level => (
                                    <NavCard 
                                        key={level.id} 
                                        item={level} 
                                        selectedId={selectedLevel} 
                                        onSelect={handleLevelSelect} 
                                        Icon={level.icon} 
                                        themeClass="selected-gray" 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Batches (Conditional on Level - SLIDER) */}
                    {selectedLevel && (
                        <div className="TAM_batch-container" ref={nextStepRef}>
                            <h2 className="TAM_step-title">Batches</h2>
                            

                            <div className="search-wrapper">
                                <input type="text" placeholder="Search by Batch Name or Code" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" /> <FiSearch className="search-icon" /> </div>



                            {filteredBatches.length > 0 ? (
                                <div className="TAM_batch-slider-outer">
                                    {batchShowControls && (
                                        <>
                                            <div className={`TAM_slider-button left ${!batchCanScrollLeft ? 'disabled' : ''}`} onClick={() => batchCanScrollLeft && handleBatchScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                            <div className={`TAM_slider-button right ${!batchCanScrollRight ? 'disabled' : ''}`} onClick={() => batchCanScrollRight && handleBatchScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                        </>
                                    )}
                                    <div className="TAM_batch-slider-wrapper" ref={batchSliderRef}>
                                        <div className="TAM_batch-slider-content">
                                            {filteredBatches.map(batch => (
                                                <BatchCard key={batch.id} batch={batch} isSelected={batch.id === selectedBatchId} onSelect={handleBatchSelect} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="TAM_empty-message">No batches found matching your selected criteria.</div>
                            )}
                        </div>
                    )}
                    
                    {/* Step 5: Class Selection (Conditional on Batch) */}
                    {selectedBatchId && (
                        <div className="TAM_selection-step" ref={nextStepRef}>
                            <h2 className="TAM_step-title">Classes</h2>
                            <div className="TAM_card-selection-row">
                                {filteredClasses.map(classItem => (
                                    <NavCard 
                                        key={classItem.id} 
                                        item={classItem} 
                                        selectedId={selectedClassId} 
                                        onSelect={handleClassSelect} 
                                        Icon={classItem.icon} 
                                        themeClass="selected-green" 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* MODIFIED STEP 6: Subject Selection (Conditional on Class - SLIDER) */}
                    {selectedClassId && (
                        <div className="TAM_batch-container" ref={nextStepRef}>
                            <h2 className="TAM_step-title">Subjects</h2>
                            
                            {/* Reusing the slider structure for subjects */}
                            <div className="TAM_batch-slider-outer">
                                {subjectShowControls && (
                                    <>
                                        <div className={`TAM_slider-button left ${!subjectCanScrollLeft ? 'disabled' : ''}`} onClick={() => subjectCanScrollLeft && handleSubjectScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                        <div className={`TAM_slider-button right ${!subjectCanScrollRight ? 'disabled' : ''}`} onClick={() => subjectCanScrollRight && handleSubjectScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                    </>
                                )}
                                <div className="TAM_batch-slider-wrapper" ref={subjectSliderRef}>
                                    <div className="TAM_batch-slider-content">
                                        {SUBJECTS_CA_CMA.map(subjectItem => (
                                            <NavCard 
                                                key={subjectItem.id} 
                                                item={subjectItem} 
                                                selectedId={selectedSubjectId} 
                                                onSelect={handleSubjectSelect} 
                                                Icon={subjectItem.icon} 
                                                themeClass="selected-purple" // New theme for visual distinction
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Final Step: Assignment Management Dashboard (Conditional on Subject Selection) */}
            {selectedSubjectId !== null && (
                <div ref={dashboardRef}>
                    {/* Note: In a real app, you'd pass selected data (like selectedBatchId, selectedSubjectId)
                        down to AssignmentManagement to load actual data, but here we keep the structure. */}
                    <AssignmentManagement userRole={'Teacher'} />
                </div>
            )}
        </div>
    );
};

export default TeacherAssignment;