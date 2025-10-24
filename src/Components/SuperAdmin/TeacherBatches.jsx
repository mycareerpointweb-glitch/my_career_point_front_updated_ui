import React, { useState, useRef, useEffect, useCallback } from "react";
import '../../Styles/SuperAdmin/TeacherBatches.css';
import {
    FiSearch, FiX, FiHome, FiStar, FiLayers, FiUsers, FiClock, FiBookOpen,
    FiChevronRight, FiCheckCircle, FiAlertTriangle, FiChevronLeft, FiMail, FiUser, FiAperture
} from "react-icons/fi";

// =======================================================
// === 1. MOCK/PLACEHOLDER DATA FOR UI LAYOUT DEMO ===
// =======================================================
const mockInstitutions = [
    { id: "INST001", name: "Apex Commerce College", icon: FiHome },
    { id: "INST002", name: "Zenith Professional College", icon: FiHome },
    { id: "INST003", name: "Elite Commerce Hub", icon: FiHome },
    { id: "INST004", name: "Global Academy of Finance", icon: FiHome },
    { id: "INST005", name: "The Professional Institute", icon: FiHome }
];

const mockStreams = [
    { id: "CA", name: "Chartered Accountancy", icon: FiStar },
    { id: "CMA", name: "Cost and Management Accountancy", icon: FiLayers }
];

const mockCoursesAndLevels = [
    { id: "CA_FND", name: "Foundation Level", stream: "Chartered Accountancy", icon: FiBookOpen, colorIndex: 0 },
    { id: "CA_INT", name: "Intermediate Level", stream: "Chartered Accountancy", icon: FiBookOpen, colorIndex: 1 },
    { id: "CMA_FND", name: "Foundation Level", stream: "CMA", icon: FiBookOpen, colorIndex: 2 },
    { id: "CMA_INT", name: "Intermediate Level", stream: "CMA", icon: FiBookOpen, colorIndex: 3 },
];

const mockClasses = [
    { id: "C1", name: "Morning Batch A1", courseLevelId: "CA_FND" },
    { id: "C2", name: "Evening Batch B2", courseLevelId: "CA_FND" },
    { id: "C3", name: "Weekend P1", courseLevelId: "CA_INT" },
    { id: "C4", name: "Online Flex", courseLevelId: "CA_INT" },
];

const mockSubjects = [
    { id: "S1", name: "Accounting & Reporting", icon: FiBookOpen, colorIndex: 0 },
    { id: "S2", name: "Business Law", icon: FiLayers, colorIndex: 1 },
    { id: "S3", name: "Quantitative Techniques", icon: FiStar, colorIndex: 2 },
];

const mockBatches = [
    { id: "B1", name: "FND 2025/C1/S1", status: "Active", classes: 3, teachers: 4, classId: "C1", subjectId: "S1", students: ['ST001', 'ST002', 'ST003'] },
    { id: "B2", name: "FND 2025/C1/S2", status: "Active", classes: 2, teachers: 3, classId: "C1", subjectId: "S2", students: ['ST004', 'ST005'] },
    { id: "B3", name: "INT 2025/C3/S3", status: "Inactive", classes: 0, teachers: 2, classId: "C3", subjectId: "S3", students: ['ST006'] },
    { id: "B4", name: "INT 2025/C4/S1", status: "Active", classes: 5, teachers: 1, classId: "C4", subjectId: "S1", students: ['ST001', 'ST007', 'ST008'] },
    { id: "B5", name: "FND 2025/C2/S3", status: "Active", classes: 1, teachers: 4, classId: "C2", subjectId: "S3", students: ['ST009', 'ST010'] }
];

const mockStudents = [
    { id: "ST001", name: "Alice Johnson", gender: "Female", email: "alice@example.com", profile_image_url: "https://placehold.co/40x40/6366f1/ffffff?text=AJ" },
    { id: "ST002", name: "Bob Williams", gender: "Male", email: "bob@example.com", profile_image_url: "https://placehold.co/40x40/f97316/ffffff?text=BW" },
    { id: "ST003", name: "Charlie Brown", gender: "Male", email: "charlie@example.com", profile_image_url: "https://placehold.co/40x40/10b981/ffffff?text=CB" },
    { id: "ST004", name: "Diana Prince", gender: "Female", email: "diana@example.com", profile_image_url: "https://placehold.co/40x40/ef4444/ffffff?text=DP" },
    { id: "ST005", name: "Ethan Hunt", gender: "Male", email: "ethan@example.com", profile_image_url: "https://placehold.co/40x40/3b82f6/ffffff?text=EH" },
    { id: "ST006", name: "Fiona Glenn", gender: "Female", email: "fiona@example.com", profile_image_url: "https://placehold.co/40x40/8b5cf6/ffffff?text=FG" },
    { id: "ST007", name: "George King", gender: "Male", email: "george@example.com", profile_image_url: "https://placehold.co/40x40/06b6d4/ffffff?text=GK" },
    { id: "ST008", name: "Hannah Lee", gender: "Female", email: "hannah@example.com", profile_image_url: "https://placehold.co/40x40/fb923c/ffffff?text=HL" },
    { id: "ST009", name: "Ivan Petrov", gender: "Male", email: "ivan@example.com", profile_image_url: "https://placehold.co/40x40/facc15/ffffff?text=IP" },
    { id: "ST010", name: "Jasmine Kaur", gender: "Female", email: "jasmine@example.com", profile_image_url: "https://placehold.co/40x40/a3e635/ffffff?text=JK" },
];

// =======================================================
// === 2. UTILITY HOOKS AND COMPONENTS ===
// =======================================================

/**
 * Custom hook to check if an element's content is overflowing horizontally.
 */
const useOverflowCheck = (ref) => {
    const [isOverflowing, setIsOverflowing] = useState(false);

    const checkOverflow = useCallback(() => {
        if (ref.current) {
            setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
        }
    }, [ref]);

    useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        
        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, [checkOverflow]);

    return isOverflowing;
};

// Component for Subject Card (uses course_card style)
const SubjectCard = ({ subject, isActive, onClick }) => (
    <div
        className={`course_card course-color-${subject.colorIndex} ${isActive ? 'course_active' : ''}`}
        onClick={() => onClick(subject)}
    >
        <subject.icon size={24} className="course_card-icon" />
        <div className="course_card-name">{subject.name}</div>
    </div>
);

// Component for Class Card (uses stream_card style)
const ClassCard = ({ classItem, isActive, onClick }) => (
    <div
        className={`stream_card ${isActive ? 'stream_active' : ''}`}
        onClick={() => onClick(classItem)}
    >
        <FiUsers size={20} />
        <div className="stream_card-name">{classItem.name}</div>
    </div>
);

// Component for displaying Student Table
const StudentTable = ({ batch }) => {
    // Lookup student objects based on IDs in the batch
    const students = batch.students.map(studentId => 
        mockStudents.find(s => s.id === studentId)
    ).filter(s => s); // Filter out any undefined if ID doesn't match

    return (
        <div className="tb_student-table-container">
            <h3 className="tb_student-table-title">Students in Batch: {batch.name}</h3>
            
            {students.length === 0 ? (
                <p className="tb_no-results">No students are currently enrolled in this batch.</p>
            ) : (
                <div className="tb_table-wrapper">
                    <table className="tb_student-table">
                        <thead>
                            <tr>
                                <th>Profile</th>
                                <th>Name</th>
                                <th>ID</th>
                                <th>Gender</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td data-label="Profile" className="tb_profile-cell">
                                        <img 
                                            src={student.profile_image_url} 
                                            alt={student.name[0]} 
                                            className="tb_profile-img"
                                            // Fallback if image URL fails
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/cccccc/000000?text=?" }}
                                        />
                                    </td>
                                    <td data-label="Name" className="tb_name-cell">{student.name}</td>
                                    <td data-label="ID">{student.id}</td>
                                    <td data-label="Gender">{student.gender}</td>
                                    <td data-label="Email" className="tb_email-cell">
                                        <a href={`mailto:${student.email}`} className="tb_email-link">
                                            <FiMail size={14} /> {student.email}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// =======================================================
// === 3. MAIN TEACHER BATCHES COMPONENT ===
// =======================================================

const TeacherBatches = () => {
    // --- State for Selection Flow ---
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    const [selectedStream, setSelectedStream] = useState(null);
    const [selectedCourseLevel, setSelectedCourseLevel] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null); 
    const [selectedBatch, setSelectedBatch] = useState(null); // New state for final selection

    // --- Search State ---
    const [batchSearchTerm, setBatchSearchTerm] = useState("");

    // --- Refs for Horizontal Scrolling ---
    const instSliderRef = useRef(null);
    const batchListRef = useRef(null);
    const scrollAmount = 300; 

    // --- Overflow Check Hooks ---
    const isInstOverflowing = useOverflowCheck(instSliderRef);
    const isBatchOverflowing = useOverflowCheck(batchListRef);

    // --- Handler Functions ---
    const handleScroll = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({
                left: direction === 'next' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    
    // Reset function helper
    // FIX: resetFlow is now only responsible for clearing everything *after* the specified step
    const resetFlow = (step) => {
        setSelectedBatch(null); // Always clear batch selection on flow change
        if (step === 'subject') {
            setSelectedSubject(null);
        } else if (step === 'class') {
            setSelectedClass(null);
            setSelectedSubject(null);
        } else if (step === 'level') {
            setSelectedCourseLevel(null);
            setSelectedClass(null);
            setSelectedSubject(null);
        } else if (step === 'stream') {
            setSelectedCourseLevel(null);
            setSelectedClass(null);
            setSelectedSubject(null);
        } else if (step === 'inst') {
            setSelectedStream(null);
            setSelectedCourseLevel(null);
            setSelectedClass(null);
            setSelectedSubject(null);
        }
        setBatchSearchTerm("");
    };

    // Main Selection Handlers - All now manually clear downstream dependencies
    const handleSelectInstitution = (inst) => {
        const newInstitution = (inst.id === selectedInstitution?.id) ? null : inst;
        setSelectedInstitution(newInstitution);
        
        // Clear all downstream dependencies
        setSelectedStream(null);
        setSelectedCourseLevel(null);
        setSelectedClass(null);
        setSelectedSubject(null);
        setSelectedBatch(null);
        setBatchSearchTerm("");
    };
    
    const handleSelectStream = (stream) => {
        const newStream = stream.id === selectedStream?.id ? null : stream;
        setSelectedStream(newStream);
        
        // Clear all downstream dependencies
        setSelectedCourseLevel(null);
        setSelectedClass(null);
        setSelectedSubject(null);
        setSelectedBatch(null);
        setBatchSearchTerm("");
    };
    
    const handleSelectLevel = (level) => {
        // FIX: Applied the same correction logic here
        const newLevel = level.id === selectedCourseLevel?.id ? null : level;
        setSelectedCourseLevel(newLevel);
        
        // Clear all downstream dependencies
        setSelectedClass(null);
        setSelectedSubject(null);
        setSelectedBatch(null);
        setBatchSearchTerm("");
    };
    
    const handleSelectClass = (classItem) => {
        // FIX: Applied the same correction logic here
        const newClass = classItem.id === selectedClass?.id ? null : classItem;
        setSelectedClass(newClass);
        
        // Clear all downstream dependencies
        setSelectedSubject(null);
        setSelectedBatch(null);
        setBatchSearchTerm("");
    };
    
    const handleSelectSubject = (subject) => {
        // FIX: Applied the same correction logic here
        const newSubject = subject.id === selectedSubject?.id ? null : subject;
        setSelectedSubject(newSubject);
        
        // Clear the batch selection and search term
        setSelectedBatch(null); 
        setBatchSearchTerm("");
    };

    // NEW: Handle Batch Selection to show table
    const handleSelectBatch = (batch) => {
        setSelectedBatch(batch);
    };


    // --- Filtering Logic ---
    const filteredLevels = selectedStream
        ? mockCoursesAndLevels.filter(level => level.stream.includes(selectedStream.name))
        : mockCoursesAndLevels;

    const filteredClasses = selectedCourseLevel
        ? mockClasses.filter(c => c.courseLevelId === selectedCourseLevel.id)
        : mockClasses;

    const filteredBatches = mockBatches.filter(batch => {
        // Filter must pass ALL selected steps
        const matchesClass = selectedClass ? batch.classId === selectedClass.id : true;
        const matchesSubject = selectedSubject ? batch.subjectId === selectedSubject.id : true;
        
        // Search filter
        const matchesSearch = batchSearchTerm.trim() === ""
            || batch.name.toLowerCase().includes(batchSearchTerm.toLowerCase());

        return matchesClass && matchesSubject && matchesSearch;
    });

    // --- UI Render Components ---
    const renderBreadcrumbs = () => {
        const parts = [
            { label: "Institution", data: selectedInstitution ? mockInstitutions.find(i => i.id === selectedInstitution.id) : null, reset: () => handleSelectInstitution(selectedInstitution) },
            { label: "Stream", data: selectedStream, reset: () => handleSelectStream(selectedStream) },
            { label: "Level", data: selectedCourseLevel, reset: () => handleSelectLevel(selectedCourseLevel) },
            { label: "Class", data: selectedClass, reset: () => handleSelectClass(selectedClass) },
            { label: "Subject", data: selectedSubject, reset: () => handleSelectSubject(selectedSubject) },
            { label: "Batch", data: selectedBatch, reset: () => setSelectedBatch(null) },
        ].filter(part => part.data || (part.label !== "Batch" && part.data === null)); // Hide Batch breadcrumb if not selected

        return (
            <div className="tb_breadcrumbs">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <FiChevronRight className="tb_breadcrumb-separator" />}
                        <span
                            className={`tb_breadcrumb-item ${part.data ? 'tb_active' : ''}`}
                            // FIX: Ensure reset only happens if the item is active
                            onClick={part.data ? part.reset : null}
                            title={part.data ? `Click to go back to selecting ${part.label}` : part.label}
                        >
                            {part.data ? part.data.name : `Select ${part.label}`}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="tb_wrapper">
            <h1 className="tb_title">Teacher Batches Overview</h1>

            {renderBreadcrumbs()}

            {/* ========================================================================= */}
            {/* STEP 1: Institution Selection (SLIDER) */}
            {/* ========================================================================= */}
            <div className="tb_card">
                <div className="tb_header">
                    <h2 className="tb_card-title">Step 1: Select Institution</h2>
                </div>
                <div className={`tb_slider-container ${!isInstOverflowing ? 'tb_center-content' : ''}`}>
                    {isInstOverflowing && (
                        <button
                            className="tb_slider-btn tb_slider-prev"
                            onClick={() => handleScroll(instSliderRef, 'prev')}
                            aria-label="Previous Institution"
                        >
                            <FiChevronLeft size={24} />
                        </button>
                    )}
                    <div className="entity_card_slider" ref={instSliderRef}>
                        {mockInstitutions.map((inst) => (
                            <div key={inst.id} className="tb_slider-item-wrapper">
                                <div
                                    className={`inst_card ${selectedInstitution?.id === inst.id ? 'inst_active' : ''}`}
                                    onClick={() => handleSelectInstitution(inst)}
                                >
                                    <inst.icon size={24} className="inst_card-icon" />
                                    <div className="inst_card-name">{inst.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isInstOverflowing && (
                        <button
                            className="tb_slider-btn tb_slider-next"
                            onClick={() => handleScroll(instSliderRef, 'next')}
                            aria-label="Next Institution"
                        >
                            <FiChevronRight size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Steps 2-5: Selection Grids */}
            
            {/* STEP 2: Select Stream */}
            {selectedInstitution && (
                <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Step 2: Select Stream</h2>
                    </div>
                    <div className="entity_card_grid">
                        {mockStreams.map((stream) => (
                            <div key={stream.id} className="tb_grid-item-wrapper">
                                <div
                                    className={`stream_card ${selectedStream?.id === stream.id ? 'stream_active' : ''}`}
                                    onClick={() => handleSelectStream(stream)}
                                >
                                    <stream.icon size={20} />
                                    <div className="stream_card-name">{stream.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: Select Course Level */}
            {selectedStream && (
                <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Step 3: Select Course Level</h2>
                    </div>
                    <div className="entity_card_grid">
                        {filteredLevels.map((course) => (
                            <div key={course.id} className="tb_grid-item-wrapper">
                                <SubjectCard // Using CourseCard style
                                    subject={course} 
                                    isActive={selectedCourseLevel?.id === course.id}
                                    onClick={handleSelectLevel}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 4: Select Class */}
            {selectedCourseLevel && (
                <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Step 4: Select Class</h2>
                    </div>
                    <div className="entity_card_grid">
                        {filteredClasses.map((classItem) => (
                            <ClassCard
                                key={classItem.id}
                                classItem={classItem}
                                isActive={selectedClass?.id === classItem.id}
                                onClick={handleSelectClass}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 5: Select Subject */}
            {selectedClass && (
                <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Step 5: Select Subject</h2>
                    </div>
                    <div className="entity_card_grid">
                        {mockSubjects.map((subject) => (
                            <div key={subject.id} className="tb_grid-item-wrapper">
                                <SubjectCard
                                    subject={subject}
                                    isActive={selectedSubject?.id === subject.id}
                                    onClick={handleSelectSubject}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* ========================================================================= */}
            {/* STEP 6: Filtered Batches List (SLIDER with Search) */}
            {/* ========================================================================= */}
            {selectedSubject && !selectedBatch && (
                <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Batches for {selectedSubject.name}</h2>
                        <div className="tb_actions">
                            <div className="tb_search-bar">
                                <FiSearch className="tb_search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search Batches..."
                                    value={batchSearchTerm}
                                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                                />
                                {batchSearchTerm && (
                                    <FiX className="tb_clear-icon" onClick={() => setBatchSearchTerm("")} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`tb_slider-container ${!isBatchOverflowing ? 'tb_center-content' : ''}`}>
                        {isBatchOverflowing && (
                            <button
                                className="tb_slider-btn tb_slider-prev"
                                onClick={() => handleScroll(batchListRef, 'prev')}
                                aria-label="Previous Batch"
                                disabled={filteredBatches.length === 0}
                            >
                                <FiChevronLeft size={24} />
                            </button>
                        )}

                        <ul className="tb_batch-list-slider" ref={batchListRef}>
                            {filteredBatches.length > 0 ? (
                                filteredBatches.map(batch => (
                                    <li key={batch.id} className="tb_batch-item" onClick={() => handleSelectBatch(batch)}>
                                        <div className="tb_batch-item-header">
                                            <span className="tb_batch-name">{batch.name}</span>
                                            <span className={`tb_status-pill tb_status-${batch.status.toLowerCase()}`}>
                                                {batch.status === "Active" ? <FiCheckCircle /> : <FiAlertTriangle />} {batch.status}
                                            </span>
                                        </div>
                                        <p className="tb_batch-action-hint">Click to View Students</p>
                                        <div className="tb_batch-details">
                                            <div className="tb_batch-detail-item">
                                                <FiClock /> {batch.classes} Classes
                                            </div>
                                            <div className="tb_batch-detail-item">
                                                <FiUsers /> {batch.students.length} Students
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="tb_no-results tb_no-results-fullwidth">No batches found matching "{batchSearchTerm}".</p>
                            )}
                        </ul>

                        {isBatchOverflowing && (
                            <button
                                className="tb_slider-btn tb_slider-next"
                                onClick={() => handleScroll(batchListRef, 'next')}
                                aria-label="Next Batch"
                                disabled={filteredBatches.length === 0}
                            >
                                <FiChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FINAL STEP: Student Details Table (Visible after Batch selection) */}
            {/* ========================================================================= */}
            {selectedBatch && (
                 <div className="tb_card">
                    <div className="tb_header">
                        <h2 className="tb_card-title">Students in Batch: {selectedBatch.name}</h2>
                        <button className="tb_btn-primary" onClick={() => setSelectedBatch(null)}>
                            <FiChevronLeft /> Back to Batches List
                        </button>
                    </div>
                    <StudentTable batch={selectedBatch} />
                 </div>
            )}

        </div>
    );
};

export default TeacherBatches;