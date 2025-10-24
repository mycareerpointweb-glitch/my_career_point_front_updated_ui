import "../../Styles/SuperAdmin/AttendanceManagement.css";
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// --- LOCAL JSON DATA IMPORT ---
import jsonData from '../dummy.json'; 

// Using lucide-react for modern, clean icons
import {
    Users, BookOpen, Search,
    MonitorCheck, UserCog, Home,
    Layers, Aperture, TrendingUp,
    ChevronLeft, ChevronRight,
    ChevronDown,
    CalendarCheck, Check, X, Filter, List, Calendar, FileDown,
    Target, LineChart, TrendingDown, GraduationCap, 
    ClipboardList 
} from 'lucide-react';

const batchRefMap = new Map(jsonData.batches_reference.map(b => [b.batch_id, b.batch_name]));
// NEW: Map subject IDs to their full objects for quick lookup
const subjectRefMap = new Map(jsonData.subjects_reference.map(s => [s.subject_id, s]));

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
 * MODIFIED: Adds levelId for subject lookup
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
                    levelId: level.level_id, // ADDED: For subject lookup
                    enrollment: enrollment,
                    status: "Active",
                    studentClasses: batch.classes, // Keep the list of classes
                    commonSubjects: batch.common_subjects_ids, // ADDED: For subject lookup
                    specificSubjects: batch.specific_subjects_ids, // ADDED: For subject lookup
                    institutionId: institution.institution_id, 
                };
            });
        });
    });
});

const DUMMY_BATCHES = TRANSFORMED_BATCHES_WITH_INST;


// --- DYNAMIC DATA DERIVATIONS FROM JSON ---

// 1. DYNAMIC INSTITUTES: Derived from institutions_reference
const INSTITUTES = jsonData.institutions_reference.map(inst => ({
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


// Static application data (not in JSON)
const ROLES = [
    { id: 'Student', label: 'Student', description: 'Mark or view student attendance.', icon: MonitorCheck },
    { id: 'Teacher', label: 'Teacher', description: 'Manage your class attendance.', icon: UserCog },
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


// Helper functions (generateCurrentWeekDays, generateFullDays, generateDummyAttendance, CustomDropdown, NavCard, BatchCard, StatsCard, AttendanceTable - all unchanged)
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

// MODIFIED: Ensure a minimum of 70% present for the dummy data and use random names for consistency
const generateDummyAttendance = (students, allDays) => {
    const attendance = {};
    const presentRate = 0.7; 
    const randomPresentNames = ["Rahul", "Priya", "Amit", "Sana", "Vishal"];

    allDays.forEach(day => {
        students.forEach(student => {
            if (!attendance[student.id]) {
                attendance[student.id] = {};
            }
            
            let status = 'A';
            if (Math.random() < presentRate) {
                status = 'P';
            }
            // Add a small chance for specific names to be present more often
            else if (randomPresentNames.some(name => student.name.toLowerCase().includes(name.toLowerCase())) && Math.random() > 0.5) {
                status = 'P'; 
            }
            
            attendance[student.id][day.fullDate] = status;
        });
    });
    return attendance;
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
        <div className="atm_custom-dropdown-container" ref={dropdownRef}>
            <div className={`atm_custom-dropdown-display ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {Icon && <Icon size={16} className="atm_dropdown-icon" />}
                {selectedOption.label || placeholder}
                <ChevronDown size={16} className="atm_dropdown-chevron" />
            </div>
            {isOpen && (
                <div className="atm_custom-dropdown-options">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`atm_custom-dropdown-option ${option.value === value ? 'selected' : ''}`}
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
            className={`atm_nav-card ${selectedClass}`}
            onClick={() => onSelect(item.id)}
            role="button"
            aria-pressed={isSelected}
        >
            <div className="atm_nav-card-icon-wrapper">
                {Icon && <Icon size={24} className="atm_nav-card-icon" />}
            </div>
            <h3>{item.label}</h3>
            {item.description && <p>{item.description}</p>}
        </div>
    );
};

const BatchCard = ({ batch, isSelected, onSelect }) => (
    <div
        className={`atm_batch-card ${isSelected ? 'atm_selected' : ''}`}
        onClick={() => onSelect(batch.id)}
        role="button"
        aria-pressed={isSelected}
    >
        <div className="atm_batch-card-title">{batch.courseName}</div>
        <div className="atm_batch-card-details">
            <CalendarCheck size={12} style={{ display: 'inline-block', marginRight: '4px' }} />
            Batch Code: {batch.batchPrefix}
        </div>
        <div className="atm_batch-card-details">
            <Users size={12} style={{ display: 'inline-block', marginRight: '4px' }} />
            Enrolled: {batch.enrollment}
        </div>
        <span className="atm_badge">{batch.level}</span>
    </div>
);

// MODIFIED: Enhanced StatsCard icons and colors
const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`atm_stats-card ${colorClass}`}>
        <div className={`atm_stats-content`}>
            <p className="atm_stats-title">{title}</p>
            <h3 className="atm_stats-value">{value}</h3>
        </div>
        <Icon size={32} className="atm_stats-icon" />
    </div>
);


// MODIFIED: AttendanceTable now includes the sticky percentage column
const AttendanceTable = ({ students, attendanceData, days, toggleAttendance, viewMode, userRole, toggleViewMode }) => {
    const todayFullDate = days.find(d => d.isToday)?.fullDate;
    // Filter to only show the first student if the userRole is 'Student'
    const studentFilteredStudents = useMemo(() => {
        return userRole === 'Student' && students.length > 0 ? students.slice(0, 1) : students;
    }, [students, userRole]);

    const scrollRef = useRef(null);
    const isAttendanceMarkingAllowed = userRole === 'Teacher' || userRole === 'Student'; // Assuming marking is allowed for these roles

    useEffect(() => {
        if (scrollRef.current && viewMode === 'full') {
            // Scroll to the latest day (right side)
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [days, viewMode]);

    // Inline styles to enforce fixed/sticky columns without changing the CSS file.
    const percentageColumnStyles = { 
        position: 'sticky', 
        left: '200px', // Assuming atm_sticky-col width is 200px
        zIndex: 2, 
        minWidth: '80px', // Ensure visibility
        textAlign: 'center',
        textColor: 'pink',
        fontWeight: 'bold',
    };
    const studentNameStyles = { zIndex: 3 }; // Ensure student name stays above the percentage column

    return (
        <div className="atm_table-container">
            <div className="atm_table-responsive-wrapper" ref={scrollRef}>
                <table className="atm_attendance-table">
                    <thead>
                        <tr className="atm_attendance-table-backgroundcolor">
                            <th className="atm_sticky-col" style={studentNameStyles}>Student Name (Roll No)</th>
                            
                            {/* NEW: Total Percentage Column */}
                            <th style={percentageColumnStyles}>Total %</th>
                            
                            <th>Gender</th>
                            {days.map(day => (
                                <th
                                    key={day.fullDate}
                                    className={day.isToday ? 'atm_today-header' : ''}
                                    title={day.date.toLocaleDateString()}
                                >
                                    {day.label}
                                    <span className="atm_day-of-week">{day.dayOfWeek}</span>
                                </th>
                            ))}
                            <th
                                className={`atm_view-toggle-header atm_view-mode-${viewMode}`}
                                onClick={toggleViewMode}
                                title={viewMode === 'week' ? `Show Full Month History (${days.length} Days)` : 'Show Current Week (7 Days)'}
                            >
                                {viewMode === 'week' ? <List size={18} /> : <Calendar size={18} />}
                                <span className="atm_toggle-label">
                                    {viewMode === 'week' ? 'Monthly' : 'Weekly'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentFilteredStudents.length === 0 ? (
                            <tr><td colSpan={days.length + 4} className="atm_no-data">No students found matching the filter criteria.</td></tr>
                        ) : (
                            studentFilteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="atm_sticky-col" style={studentNameStyles}>
                                        <div className="atm_student-name-cell">
                                            <span className="atm_profile-icon">{student.profile}</span>
                                            <div>
                                                <strong>{student.name}</strong>
                                                <p className="atm_roll-no">{student.rollNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* NEW: Total Percentage Data Cell */}
                                    <td style={percentageColumnStyles}>
                                        <span className="atm_percentage-value">
                                            {student.attendancePercentage}%
                                        </span>
                                    </td>
                                    
                                    <td>{student.gender}</td>
                                    {days.map(day => {
                                        const status = attendanceData[student.id]?.[day.fullDate] || 'A';

                                        // Determine if marking is allowed for the current cell
                                        const canToggle = day.isToday && isAttendanceMarkingAllowed;

                                        return (
                                            <td
                                                key={day.fullDate}
                                                className={`atm_status-cell ${day.isToday ? 'atm_today-cell' : ''}`}
                                                onClick={() => canToggle && toggleAttendance(student.id, todayFullDate)}
                                                style={{ cursor: canToggle ? 'pointer' : 'default' }}
                                            >
                                                {day.isToday ? (
                                                    <span className={`atm_today-status atm_status-${status.toLowerCase()}`}>
                                                        {status === 'P' ? <Check size={18} /> : <X size={18} />}
                                                    </span>
                                                ) : (
                                                    <span className={`atm_status-text atm_status-${status.toLowerCase()}`}>
                                                        {status}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="atm_toggle-placeholder-col"></td>
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
const AttendanceManagement = ({ userRole }) => {

    // REQ: Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // MODIFIED: Restrict attendance marking for Admin/Super Admin
    const isAttendanceMarkingAllowed = useMemo(() => {
        return !['Admin', 'Super Admin'].includes(userRole);
    }, [userRole]);

    // Initial State Helpers
    const getInitialInstitute = () => null;
    const getInitialRole = () => {
        if (userRole === 'Teacher' || userRole === 'Student') return userRole;
        return null;
    }
    const getInitialStream = () => null;
    const getInitialLevel = () => null;
    const getInitialBatch = () => null;
    // NEW: Class selection state
    const getInitialClass = () => null; 
    // NEW: Subject selection state
    const getInitialSubject = () => null; 

    
    // --- State Management ---
    const [selectedRole, setSelectedRole] = useState(getInitialRole)
    const [selectedInstituteId, setSelectedInstituteId] = useState(getInitialInstitute); 
    const [selectedStream, setSelectedStream] = useState(getInitialStream);
    const [selectedLevel, setSelectedLevel] = useState(getInitialLevel);
    const [selectedBatchId, setSelectedBatchId] = useState(getInitialBatch);
    // NEW: Class selection state
    const [selectedClassId, setSelectedClassId] = useState(getInitialClass); 
    // NEW: Subject selection state
    const [selectedSubjectId, setSelectedSubjectId] = useState(getInitialSubject); 
    // REMOVED: const [showAttendanceTable, setShowAttendanceTable] = useState(false);
    
    const [searchTermInstitute, setSearchTermInstitute] = useState(''); 
    const [searchTerm, setSearchTerm] = useState(''); 

    // Stage 2 Attendance States
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [searchTermStudents, setSearchTermStudents] = useState('');
    const [genderFilter, setGenderFilter] = useState('All');
    const [viewMode, setViewMode] = useState('week'); 

    // Refs for auto-scroll
    const nextStepRef = useRef(null);
    const dashboardRef = useRef(null);
    // NEW: Ref for Subject Slider
    const subjectSliderRef = useRef(null); 

    // Initial Data Setup
    const [weekDays] = useState(generateCurrentWeekDays());
    const [fullDays] = useState(generateFullDays());
    const days = viewMode === 'full' ? fullDays : weekDays;
    const todayFullDate = days.find(d => d.isToday)?.fullDate;

    // MODIFIED: Logic to determine if the filter bar should be visible
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

    // 1. Filter Institutes by Search (UNCHANGED)
    const filteredInstitutes = useMemo(() => {
        let list = INSTITUTES;
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


    // NEW: Derive Subjects from selected Class (Batch)
    const filteredSubjects = useMemo(() => {
        if (!selectedBatchId || !selectedClassId) return [];
        
        const batch = DUMMY_BATCHES.find(b => b.id === selectedBatchId);
        if (!batch) return [];
        
        const classParts = selectedClassId.split('_');
        const classLetter = classParts.length > 3 ? classParts[3] : null; 
        
        let subjectIds = [...(batch.commonSubjects || [])];

        if (classLetter && batch.specificSubjects && batch.specificSubjects[classLetter]) {
             subjectIds = [...subjectIds, ...batch.specificSubjects[classLetter]];
        }
        
        // Remove duplicates and map to NavCard format
        const uniqueSubjectIds = Array.from(new Set(subjectIds));

        return uniqueSubjectIds.map(subjectId => {
            const subjectRef = subjectRefMap.get(subjectId);
            const label = subjectRef?.subject_name || subjectId;
            return {
                id: subjectId,
                label: label,
                description: subjectId,
                icon: ClipboardList // Subject Icon
            };
        });

    }, [selectedBatchId, selectedClassId]);

    // NEW: Calculate individual percentage and filter students
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
        
        // 2. Calculate attendance percentage for each student in the filtered list
        return list.map(student => {
            const studentAttendance = attendanceData[student.id] || {};
            let presentCount = 0;
            let totalRecords = 0;

            // Calculate based on all recorded days (fullDays are available in state)
            Object.values(studentAttendance).forEach(status => {
                totalRecords++;
                if (status === 'P') {
                    presentCount++;
                }
            });

            const percentage = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : '0.0';

            return {
                ...student,
                attendancePercentage: percentage // ADDED STAT
            };
        });
    }, [students, attendanceData, searchTermStudents, genderFilter]);


    const stats = useMemo(() => {
        const presentToday = studentsWithStats.filter(student =>
            attendanceData[student.id]?.[todayFullDate] === 'P'
        ).length;

        const total = students.length;
        const filteredCount = studentsWithStats.length;

        // Calculate Overall Attendance Percentage (for all students across all days)
        let totalPresent = 0;
        let totalRecords = 0;
        students.forEach(student => {
            const studentAttendance = attendanceData[student.id];
            if (studentAttendance) {
                Object.values(studentAttendance).forEach(status => {
                    totalRecords++;
                    if (status === 'P') {
                        totalPresent++;
                    }
                });
            }
        });
        const overallPercentage = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : '0.0';

        return {
            total: total,
            presentToday: presentToday,
            absentToday: filteredCount - presentToday,
            filteredCount: filteredCount,
            overallPercentage: overallPercentage,
            icons: {
                total: Users,
                filtered: Target, 
                present: Check,
                absent: X,
                overall: LineChart 
            },
            colorClasses: {
                total: 'atm_stats-total',
                filtered: 'atm_stats-filtered', 
                present: 'atm_stats-present',
                absent: 'atm_stats-absent',
                overall: 'atm_stats-overall' 
            }
        };
    }, [students, studentsWithStats, attendanceData, todayFullDate]);


    // --- Slider Controls for Institutes (Logic unchanged) ---
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


    // --- Slider Controls for Subjects (NEW) ---
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
    }, [checkSubjectScrollState, filteredSubjects]);

    const handleSubjectScroll = (direction) => {
        const slider = subjectSliderRef.current;
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


    // --- Stage 1 Handlers ---
    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setSelectedInstituteId(null);
        setSelectedStream(null);
        setSelectedLevel(null);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        setSearchTerm('');
        setSearchTermInstitute('');
        setTimeout(autoScrollToNextStep, 100); 
    };

    const handleInstituteSelect = (instId) => {
        const newInstId = instId === selectedInstituteId ? null : instId;
        
        setSelectedInstituteId(newInstId);
        setSelectedStream(null); 
        setSelectedLevel(null);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        setSearchTerm(''); 
        if (newInstId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleStreamSelect = (streamId) => {
        const newStreamId = streamId === selectedStream ? null : streamId;

        setSelectedStream(newStreamId);
        setSelectedLevel(null);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        if (newStreamId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleLevelSelect = (levelId) => {
        const newLevelId = levelId === selectedLevel ? null : levelId;

        setSelectedLevel(newLevelId);
        setSelectedBatchId(null);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        if (newLevelId) setTimeout(autoScrollToNextStep, 100); 
    };

    const handleBatchSelect = (batchId) => {
        const newBatchId = batchId === selectedBatchId ? null : batchId;
        setSelectedBatchId(newBatchId);
        setSelectedClassId(null); 
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        if (newBatchId) {
            setTimeout(autoScrollToNextStep, 100); 
        }
    };

    // NEW: Class selection handler
    const handleClassSelect = (classId) => {
        const newClassId = classId === selectedClassId ? null : classId;
        setSelectedClassId(newClassId);
        setSelectedSubjectId(null); // RESET SUBJECT
        // Removed: setShowAttendanceTable(false);
        if (newClassId) {
            setTimeout(autoScrollToNextStep, 100); // Scroll to the new Subject step
        }
    };

    // NEW: Subject selection handler
    const handleSubjectSelect = (subjectId) => {
        const newSubjectId = subjectId === selectedSubjectId ? null : subjectId;
        setSelectedSubjectId(newSubjectId);
        
        // Removed: setShowAttendanceTable(!!newSubjectId); 
        
        if (newSubjectId) {
            // Scroll to dashboard after selecting a subject
            setTimeout(() => {
                if (dashboardRef.current) {
                    dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };
    
    // --- Stage 2 Handlers & Effects ---
    // MODIFIED: This effect now depends on selectedSubjectId
    useEffect(() => {
        // Only proceed if a specific subject, class, and batch are selected
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
                setAttendanceData(generateDummyAttendance(batchStudents, fullDays));
                setViewMode('week');
            } else {
                setStudents([]);
                setAttendanceData({});
            }

        } else { // Reset if no subject/class/batch is selected
            setStudents([]);
            setAttendanceData({});
        }
    }, [selectedBatchId, selectedClassId, selectedSubjectId, fullDays]); // Removed showAttendanceTable dependency


    const toggleAttendance = useCallback((studentId, date) => {
        if (!isAttendanceMarkingAllowed) return;

        setAttendanceData(prevData => {
            const currentStatus = prevData[studentId]?.[date] || 'A';
            const newStatus = currentStatus === 'P' ? 'A' : 'P';

            return {
                ...prevData,
                [studentId]: {
                    ...prevData[studentId],
                    [date]: newStatus
                }
            };
        });
    }, [isAttendanceMarkingAllowed]);

    const toggleViewMode = () => {
        setViewMode(prevMode => prevMode === 'week' ? 'full' : 'week');
    };

    const handleExportExcel = () => {
        alert(`Exporting data to Excel for Batch ID: ${selectedBatchId}, Class ID: ${selectedClassId}, Subject ID: ${selectedSubjectId}...`);
    };

    // --- Slider Controls for Batches (Existing) ---
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


    return (
        <div className="atm_wrapper">
            <h1 className="atm_section-title">Attendance Management Dashboard</h1>

            {/* Stage 1: Selection Flow - NOW UNCONDITIONALLY RENDERED */}
            <> 
                {/* Step 1: Role Selection */}
                {userRole !== 'Teacher' && userRole !== 'Student' && (
                    <div ref={userRole === 'Teacher' || userRole === 'Student' ? null : nextStepRef}>
                        <h2 className="atm_step-title">Roles</h2>
                        <div className="atm_card-selection-row">
                            {ROLES.map(role => (
                                <NavCard
                                    key={role.id} item={role} selectedId={selectedRole} onSelect={handleRoleSelect} Icon={role.icon} themeClass="selected-pink"
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {(selectedRole === 'Student' || selectedRole === 'Teacher') && (
                    <>
                        {/* Step 2: Institute Selection (SLIDER & PERSISTENT) */}
                        <div className="atm_institute-container" ref={nextStepRef}>
                            <h2 className="atm_step-title">Institutes</h2>
                            <div className="am_search-bar">
                                <Search className="am_search-icon" size={18} />
                                <input
                                    type="text"
                                    className="am_search-input"
                                    placeholder="Search Institute by Name or Location"
                                    value={searchTermInstitute}
                                    onChange={(e) => setSearchTermInstitute(e.target.value)}
                                />
                            </div>
                            <div className="atm_batch-slider-outer">
                                {instituteShowControls && (
                                    <>
                                        <div className={`atm_slider-button left ${!instituteCanScrollLeft ? 'disabled' : ''}`} onClick={() => instituteCanScrollLeft && handleInstituteScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                        <div className={`atm_slider-button right ${!instituteCanScrollRight ? 'disabled' : ''}`} onClick={() => instituteCanScrollRight && handleInstituteScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                    </>
                                )}
                                <div className="atm_batch-slider-wrapper" ref={instituteSliderRef}>
                                    <div className="atm_batch-slider-content">
                                        {filteredInstitutes.length > 0 ? (
                                            filteredInstitutes.map(inst => (
                                                <NavCard
                                                    key={inst.id}
                                                    item={inst}
                                                    selectedId={selectedInstituteId}
                                                    onSelect={handleInstituteSelect}
                                                    Icon={Home}
                                                    themeClass="selected-blue"
                                                />
                                            ))
                                        ) : (
                                            <div className="atm_empty-message full-width">No institutes found matching the search criteria.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Stream Selection (Conditional on Institute) */}
                        {selectedInstituteId && (
                            <div className="atm_selection-step" ref={nextStepRef}>
                                <h2 className="atm_step-title">Courses</h2>
                                <div className="atm_card-selection-row">
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

                        {/* Step 4: Levels (Conditional on Stream) */}
                        {selectedStream && (
                            <div className="atm_selection-step" ref={nextStepRef}>
                                <h2 className="atm_step-title">Levels</h2>
                                <div className="atm_card-selection-row">
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

                        {/* Step 5: Batches (Conditional on Level - NOW AS SLIDER) */}
                        {selectedLevel && (
                            <div className="atm_batch-container" ref={nextStepRef}>
                                <h2 className="atm_step-title">Batches</h2>
                                <div className="am_search-bar">
                                    <Search className="am_search-icon" size={18} />
                                    <input
                                        type="text"
                                        className="am_search-input"
                                        placeholder="Search by Batch Name or Code"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {filteredBatches.length > 0 ? (
                                    <div className="atm_batch-slider-outer">
                                        {batchShowControls && (
                                            <>
                                                <div className={`atm_slider-button left ${!batchCanScrollLeft ? 'disabled' : ''}`} onClick={() => batchCanScrollLeft && handleBatchScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                                <div className={`atm_slider-button right ${!batchCanScrollRight ? 'disabled' : ''}`} onClick={() => batchCanScrollRight && handleBatchScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                            </>
                                        )}
                                        <div className="atm_batch-slider-wrapper" ref={batchSliderRef}>
                                            <div className="atm_batch-slider-content">
                                                {filteredBatches.map(batch => (
                                                    <BatchCard key={batch.id} batch={batch} isSelected={batch.id === selectedBatchId} onSelect={handleBatchSelect} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="atm_empty-message">No batches found matching your selected criteria.</div>
                                )}
                            </div>
                        )}
                        
                        {/* NEW: Step 6: Class Selection (Conditional on Batch) */}
                        {selectedBatchId && (
                            <div className="atm_selection-step" ref={nextStepRef}>
                                <h2 className="atm_step-title">Classes</h2>
                                <div className="atm_card-selection-row">
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
                        
                        {/* NEW: Step 7: Subject Selection (Conditional on Class) - AS SLIDER */}
                        {selectedClassId && (
                            <div className="atm_batch-container" ref={nextStepRef}>
                                <h2 className="atm_step-title">Subjects</h2>
                                {filteredSubjects.length > 0 ? (
                                    <div className="atm_batch-slider-outer">
                                        {subjectShowControls && (
                                            <>
                                                <div className={`atm_slider-button left ${!subjectCanScrollLeft ? 'disabled' : ''}`} onClick={() => subjectCanScrollLeft && handleSubjectScroll('left')} aria-label="Scroll left"><ChevronLeft size={20} /></div>
                                                <div className={`atm_slider-button right ${!subjectCanScrollRight ? 'disabled' : ''}`} onClick={() => subjectCanScrollRight && handleSubjectScroll('right')} aria-label="Scroll right"><ChevronRight size={20} /></div>
                                            </>
                                        )}
                                        <div className="atm_batch-slider-wrapper" ref={subjectSliderRef}>
                                            <div className="atm_batch-slider-content">
                                                {filteredSubjects.map(subject => (
                                                    <NavCard 
                                                        key={subject.id} 
                                                        item={subject} 
                                                        selectedId={selectedSubjectId} 
                                                        onSelect={handleSubjectSelect} 
                                                        Icon={subject.icon} 
                                                        themeClass="selected-purple" 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="atm_empty-message">No subjects found for the selected class.</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </>

            {/* Stage 2: Attendance Marking Table - Visible ONLY if a Subject is selected, and appears below the selection flow */}
            {selectedSubjectId !== null && ( 
                <div className="atm_attendance-dashboard" ref={dashboardRef}>
                    <div className="atm_dashboard-header">
                        <h2 className="atm_dashboard-title">
                            Attendance: 
                            {DUMMY_BATCHES.find(b => b.id === selectedBatchId)?.courseName} - 
                            {filteredClasses.find(c => c.id === selectedClassId)?.label} - 
                            <span style={{color: '#9333ea', marginLeft: '8px'}}> 
                                {filteredSubjects.find(s => s.id === selectedSubjectId)?.label} 
                            </span>
                        </h2>
                        {/* MODIFIED: Back button now unselects the subject */}
                        {userRole !== 'Teacher' && userRole !== 'Student' &&
                            (<button className="atm_back-button" onClick={() => setSelectedSubjectId(null)}>
                                <ChevronLeft size={16} /> Change Subject
                            </button>
                            )}
                    </div>

                    {/* Filter Card Visibility Logic */}
                    {((isFilterActive || isAttendanceMarkingAllowed) && userRole !== 'Student') && (
                        <div className="atm_filter-bar-new">
                            <div className="am_search-bar">
                                <Search className="am_search-icon" size={20} />
                                <input
                                    type="text"
                                    className="am_search-input"
                                    placeholder="Filter by Student Name or Roll No"
                                    value={searchTermStudents}
                                    onChange={(e) => setSearchTermStudents(e.target.value)}
                                />
                            </div>

                            {/* Re-added Export Button as per standard UI practice, but without the dropdowns for now */}
                            <button className="atm_export-excel-button" onClick={handleExportExcel}>
                                <FileDown size={18} /> Export to Excel
                            </button>
                        </div>
                    )}

                    {/* Stats Row */}
                    {userRole !== 'Student' && (<div className="atm_stats-row">
                        <StatsCard 
                            title="Total Students" 
                            value={stats.total} 
                            icon={stats.icons.total} 
                            colorClass={stats.colorClasses.total} 
                        />
                        
                        <StatsCard 
                            title="Present Today" 
                            value={stats.presentToday} 
                            icon={stats.icons.present} 
                            colorClass={stats.colorClasses.present} 
                        />
                        <StatsCard 
                            title="Absent Today" 
                            value={stats.absentToday} 
                            icon={stats.icons.absent} 
                            colorClass={stats.colorClasses.absent} 
                        />
                    </div>)}

                    {/* Attendance Table */}
                    <AttendanceTable
                        students={studentsWithStats} // Pass the students with the percentage calculated
                        attendanceData={attendanceData}
                        days={days}
                        toggleAttendance={toggleAttendance}
                        userRole={userRole}
                        viewMode={viewMode}
                        toggleViewMode={toggleViewMode}
                    />
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;