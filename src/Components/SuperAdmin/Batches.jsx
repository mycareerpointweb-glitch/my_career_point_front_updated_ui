import React, { useState, useEffect, useRef, useMemo } from "react";
import '../../Styles/SuperAdmin/Batches.css'; // Link to the new CSS
import institutionsData from '../dummy.json'; // Acting as local file

import {
    FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle,
    FiHome, FiStar, FiLayers, FiChevronDown, FiUsers, FiClock, FiBookOpen
} from "react-icons/fi";

// =======================================================
// === 2. DATA TRANSFORMATION LOGIC (Normalized Data) ===
// =======================================================
// Helper function to get teacher name from ID (using global map)
const getTeacherName = (id, teachersMap) => teachersMap[id]?.name || id;

// Helper function to get subject name from ID (using global map)
const getSubjectName = (id, subjectsMap) => subjectsMap[id] || id;

const transformJSONData = (rawData) => {
    // 1. Reference Maps
    const mockInstitutions = (rawData.institutions_reference || []).map(inst => ({
        name: inst.name,
        id: inst.institution_id
    }));

    // Map teachers for quick lookup of name and subjects taught
    const teachersMap = (rawData.teachers_reference || []).reduce((acc, curr) => {
        acc[curr.teacher_id] = { name: curr.name, subjects: curr.subjects_taught_ids || [] };
        return acc;
    }, {});

    // Map subjects for quick lookup of name
    const subjectsMap = (rawData.subjects_reference || []).reduce((acc, curr) => {
        acc[curr.subject_id] = curr.subject_name;
        return acc;
    }, {});

    const coursesReference = rawData.courses_reference.reduce((acc, curr) => {
        acc[curr.course_id] = curr.course_name;
        return acc;
    }, {});

    // Helper to get teacher IDs who teach at least one of the subjects
    const getTeachersForSubjects = (subjectIds) => {
        const teacherIds = new Set();
        for (const teacherId in teachersMap) {
            const teacher = teachersMap[teacherId];
            if (subjectIds.some(subId => teacher.subjects.includes(subId))) {
                teacherIds.add(teacherId);
            }
        }
        return Array.from(teacherIds);
    };

    let detailedInstRecords = rawData.data || [];
    const initialAllData = {};

    detailedInstRecords.forEach(inst_data => {
        const inst_id = inst_data.institution_id;
        initialAllData[inst_id] = { streams: [], courses: [], levels: {} };
        const processed_stream_ids = new Set();

        (inst_data.courses || []).forEach(course => {
            const stream_id = course.course_id;
            const stream_name = coursesReference[stream_id] || stream_id;

            if ((course.levels || []).length === 0) {
                return;
            }

            if (!processed_stream_ids.has(stream_id)) {
                initialAllData[inst_id].streams.push({ name: stream_name, id: stream_id });
                processed_stream_ids.add(stream_id);
            }

            (course.levels || []).forEach(level => {
                const level_name = level.level_name;
                const level_id = level.level_id;

                initialAllData[inst_id].courses.push({ stream: stream_name, name: level_name, id: level_id });

                const level_key = `${stream_name}_${level_name}`;
                initialAllData[inst_id].levels[level_key] = [];

                (level.batches || []).forEach(batch => {
                    const batch_name = rawData.batches_reference.find(b => b.batch_id === batch.batch_id)?.batch_name || batch.batch_id;
                    const classes = batch.classes || [];
                    const totalClasses = classes.length;
                    const is_active = totalClasses > 0;

                    const commonSubjects = batch.common_subjects_ids || [];
                    const specificSubjectsGroups = batch.specific_subjects_ids || {};
                    const specificSubjectsFlat = Object.values(specificSubjectsGroups).flat();
                    const allSubjectIds = Array.from(new Set([...commonSubjects, ...specificSubjectsFlat]));
                    const totalSubjects = allSubjectIds.length;
                    const assignedTeachers = getTeachersForSubjects(allSubjectIds);

                    initialAllData[inst_id].levels[level_key].push({
                        name: batch_name,
                        id: batch.batch_id,
                        active: is_active,
                        totalClasses: totalClasses,
                        totalSubjects: totalSubjects,
                        assignedTeachers: assignedTeachers,

                        classes: classes.map(c => {
                            const groupKey = c.class_name.split(' ').pop();
                            const classSpecificSubjects = specificSubjectsGroups[groupKey] || [];

                            const classSubjectsIds = Array.from(new Set([...commonSubjects, ...classSpecificSubjects]));
                            const classTeachersIds = getTeachersForSubjects(classSubjectsIds);

                            return {
                                ...c,
                                totalStudents: c.students_ids ? c.students_ids.length : 0,
                                subjectsIds: classSubjectsIds,
                                teachersIds: classTeachersIds,
                                class_name: c.class_name,
                                class_id: c.class_id,
                                // Pass references needed for detailed mapping
                                allSubjects: subjectsMap,
                                allTeachers: teachersMap,
                            };
                        }),
                        startTime: "09:00 AM", // Mocked field for form
                        endTime: "01:00 PM", // Mocked field for form
                        location: "Main Campus, Room 101", // Mocked field for form
                        mode: "Hybrid", // Mocked field for form
                        notes: "This batch focuses on advanced topics.", // Mocked field for form
                    });
                });
            });
        });
    });

    return { mockInstitutions, teachersMap, subjectsMap, initialAllData };
};

// =======================================================
// === 3. INITIALIZING CONSTANTS FROM TRANSFORMED DATA ===
// =======================================================
const { mockInstitutions, teachersMap, subjectsMap, initialAllData } = transformJSONData(institutionsData);


// --- Timetable Generation Helper ---
const generateMockTimetable = (classId, subjectTeacherMap) => {
    const days = ['Monday', 'Tuesday', 'Wednesday'];
    const timeSlots = [
        { time: '9:00 AM - 10:00 AM', period: 'P1' },
        { time: '10:00 AM - 11:00 AM', period: 'P2' },
        { time: '11:30 AM - 12:30 PM', period: 'P3' },
        { time: '1:30 PM - 2:30 PM', period: 'P4' },
    ];
    const subjects = Object.keys(subjectTeacherMap);
    if (subjects.length === 0) return { days, timeSlots, schedule: {} };

    const schedule = {};
    let subjectIndex = 0;

    days.forEach(day => {
        schedule[day] = {};
        timeSlots.forEach((slot) => {
            const subjectName = subjects[subjectIndex % subjects.length];
            const teacherName = subjectTeacherMap[subjectName];

            schedule[day][slot.period] = {
                subject: subjectName,
                teacher: teacherName,
                colorIndex: subjectIndex % 4
            };
            subjectIndex++;
        });
    });
    return { days, timeSlots, schedule };
};

const Timetable = ({ classDetail }) => {
    const subjectTeacherMap = getClassSubjectTeacherMap(classDetail);
    const { days, timeSlots, schedule } = generateMockTimetable(classDetail.class_id, subjectTeacherMap);

    return (
        <div className="batch_timetable-container">
            <h4 className="timetable_heading"><FiClock /> Class Timetable</h4>
            <div className="timetable_legend">
                <span className="legend-item">Breaks (11:00 - 11:30 AM) and Lunch (12:30 - 1:30 PM) are aligned but not displayed.</span>
            </div>
            <table className="batch_timetable">
                <thead>
                    <tr>
                        <th className="time-col">Time Slot</th>
                        {days.map(day => <th key={day}>{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((slot, slotIndex) => (
                        <React.Fragment key={slot.period}>
                            <tr className="timetable-slot-row">
                                <td className="time-col">
                                    <div className="slot-time">{slot.time}</div>
                                    <div className="slot-period">{slot.period}</div>
                                </td>
                                {days.map(day => {
                                    const cellData = schedule[day][slot.period];
                                    return (
                                        <td
                                            key={`${day}-${slot.period}`}
                                            className={`timetable-cell color-${cellData.colorIndex}`}
                                            title={`${cellData.subject} by ${cellData.teacher}`}
                                        >
                                            <div className="cell-subject">{cellData.subject}</div>
                                            <div className="cell-teacher">Taught by: {cellData.teacher}</div>
                                        </td>
                                    );
                                })}
                            </tr>
                            {/* Insert implicit break/lunch rows for visual alignment */}
                            {slotIndex === 1 && (
                                <tr className="timetable-separator-row break">
                                    <td colSpan={days.length + 1} className="separator-cell">Break (11:00 AM - 11:30 AM)</td>
                                </tr>
                            )}
                            {slotIndex === 2 && (
                                <tr className="timetable-separator-row lunch">
                                    <td colSpan={days.length + 1} className="separator-cell">Lunch (12:30 PM - 1:30 PM)</td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const getClassSubjectTeacherMap = (classDetail) => {
    const subjectTeacherMap = {};
    const teachersMap = classDetail.allTeachers;
    const subjectsMap = classDetail.allSubjects;
    const availableTeachersIds = classDetail.teachersIds;

    classDetail.subjectsIds.forEach(subId => {
        let assignedTeacher = "No Teacher Assigned";

        for (const teacherId of availableTeachersIds) {
            const teacherData = teachersMap[teacherId];
            if (teacherData && teacherData.subjects.includes(subId)) {
                assignedTeacher = getTeacherName(teacherId, teachersMap);
                break;
            }
        }
        subjectTeacherMap[getSubjectName(subId, subjectsMap)] = assignedTeacher;
    });
    return subjectTeacherMap;
};

// =======================================================
// === UPDATED BATCH FORM MODAL (Handles both ADD and EDIT) ===
// =======================================================
const getInitialFormState = (data) => {
    const isEditing = data && data !== 'NEW';
    // Mapping batch properties to form properties, with fallbacks
    return {
        name: isEditing ? (data.name || "") : "",
        startTime: isEditing ? (data.startTime || "09:00 AM") : "09:00 AM",
        endTime: isEditing ? (data.endTime || "01:00 PM") : "01:00 PM",
        location: isEditing ? (data.location || "") : "",
        mode: isEditing ? (data.mode || "Hybrid") : "Hybrid",
        notes: isEditing ? (data.notes || "") : "",
        totalClasses: isEditing ? (data.totalClasses || 1) : 1,
    };
};

const AddBatchModal = ({ initialBatchData, onClose, courseCategory, levelCategory, teachersMap, onSubmit }) => {

    if (!initialBatchData) return null;

    const isEdit = initialBatchData !== 'NEW';

    const [form, setForm] = useState(() => getInitialFormState(initialBatchData));
    const [showConfirm, setShowConfirm] = useState(false); // State to control confirmation

    // Effect to reset form when modal opens/closes or switches mode
    useEffect(() => {
        setForm(getInitialFormState(initialBatchData));
        setShowConfirm(false); // Ensure confirmation is hidden on modal open/mode switch
    }, [initialBatchData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 1. User clicks the main Save/Update button
    const handleSaveClick = (e) => {
        e.preventDefault();
        // Here, we show the confirmation popup. The actual submission is deferred.
        setShowConfirm(true);
    };

    // 2. User clicks the Confirm button in the popup
    const handleConfirmSave = () => {
        onSubmit(form); // Call the main submission handler (which closes the modal internally)
    };

    const modalTitle = isEdit ? `Edit Batch: ${initialBatchData.name}` : "Add New Batch";
    const saveButtonText = isEdit ? "Update Batch" : "Save Batch";
    const confirmMessage = isEdit
        ? `Are you sure you want to update the batch **${form.name}**?`
        : `Are you sure you want to save the new batch **${form.name}** for ${courseCategory} / ${levelCategory}?`;


    return (
        <div className="batch_modal batch_add-batch-modal">
            {/* Main Modal Content (The form) */}
            <div className="batch_modal-content">
                <div className="batch_modal-header">
                    <h3><FiPlus /> {modalTitle}</h3>
                    <FiX onClick={onClose} className="batch_close-modal" />
                </div>
                <form onSubmit={handleSaveClick}>
                    {/* Display Course/Level (Non-Editable) */}
                    <div className="batch_form-group">
                        <label>Course/Level Selected</label>
                        {/* Course and Level are displayed but NOT editable, fulfilling the user request */}
                        <input
                            type="text"
                            value={`${courseCategory} / ${levelCategory}`}
                            readOnly
                            disabled
                            className="batch_read-only-field"
                        />
                    </div>

                    {/* Batch Name (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="batchName">Batch Name <span className="required">*</span></label>
                        <input
                            id="batchName"
                            name="name"
                            type="text"
                            placeholder="e.g., CA Foundation May 2026"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Time Fields (Editable) */}
                    <div className="batch_form-row">
                        <div className="batch_form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="text"
                                placeholder="e.g., 09:00 AM"
                                value={form.startTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="batch_form-group">
                            <label htmlFor="endTime">End Time</label>
                            <input
                                id="endTime"
                                name="endTime"
                                type="text"
                                placeholder="e.g., 01:00 PM"
                                value={form.endTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Location (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g., Main Campus, Room 101"
                            value={form.location}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Mode (Editable) */}
                    <div className="batch_form-group">
                        <label>Mode <span className="required">*</span></label>
                        <div className="batch_radio-group">
                            {['Hybrid', 'Online', 'Offline'].map(mode => (
                                <label key={mode} className="batch_radio-label">
                                    <input
                                        type="radio"
                                        name="mode"
                                        value={mode}
                                        checked={form.mode === mode}
                                        onChange={handleChange}
                                        required
                                    />
                                    {mode}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Total Class Count (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="totalClasses">Total Class Count</label>
                        <input
                            id="totalClasses"
                            name="totalClasses"
                            type="number"
                            min="1"
                            placeholder="e.g., 5"
                            value={form.totalClasses}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Notes (Editable) */}
                    <div className="batch_form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            placeholder="Any special instructions or details about the batch..."
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="batch_modal-actions">
                        <button type="button" className="batch_btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="batch_btn-primary">{saveButtonText}</button>
                    </div>
                </form>
            </div>

            {/* Confirmation Popup: MOVED OUTSIDE the inner batch_modal-content to ensure it overlays the entire form */}
            {showConfirm && (
                <div className="batch_modal-confirmation-overlay">
                    <div className="batch_modal-content batch_confirm-popup">
                        <FiAlertTriangle size={32} className="batch_confirm-icon" />
                        <h4>Confirm Batch {isEdit ? 'Update' : 'Creation'}</h4>
                        <p>{confirmMessage}</p>
                        <div className="batch_modal-actions">
                            <button
                                className="batch_btn-secondary"
                                onClick={() => setShowConfirm(false)} // Close confirmation, return to form
                            >
                                Cancel
                            </button>
                            <button
                                className="batch_btn-primary"
                                onClick={handleConfirmSave} // Final submission here
                            >
                                Confirm {isEdit ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Batches Component ---

const Batches = () => {
    // ... (State and Handlers remain largely the same) ...
    const [allInstData] = useState(initialAllData);
    const [activeInstitutionId, setActiveInstitutionId] = useState(null);
    const [activeCourseCategory, setActiveCourseCategory] = useState(null);
    const [activeLevelCategory, setActiveLevelCategory] = useState(null);
    const [activeBatches, setActiveBatches] = useState([]);

    // STATES FOR DRILL-DOWN
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    // 2. Search States
    const [instSearchTerm, setInstSearchTerm] = useState("");
    const [courseSearchTerm, setCourseSearchTerm] = useState("");

    // 3. Derived State (useMemo for efficiency)
    const currentInstData = useMemo(() => activeInstitutionId ? allInstData[activeInstitutionId] : null, [activeInstitutionId, allInstData]);

    const institutions = useMemo(() => mockInstitutions.filter(inst =>
        inst.name.toLowerCase().includes(instSearchTerm.toLowerCase())
    ), [instSearchTerm]);

    const coursesForSelectedInst = useMemo(() =>
        currentInstData?.streams.filter(s =>
            s.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
        ) || [],
        [currentInstData, courseSearchTerm]
    );

    const levelsForSelectedCourse = useMemo(() =>
        currentInstData?.courses.filter(c => c.stream === activeCourseCategory) || [],
        [currentInstData, activeCourseCategory]
    );

    // 4. Modal and Form States (Simplified)
    const [addInstitutionOpen, setAddInstitutionOpen] = useState(false);
    const [newInstitutionName, setNewInstitutionName] = useState("");
    const [addStreamOpen] = useState(false);
    const [addCourseOpen] = useState(false);

    // BATCH MODAL STATE (Handles both ADD ('NEW') and EDIT ({batch}))
    const [modalBatchData, setModalBatchData] = useState(null);
    // ---
    const [, setNewCourseForm] = useState({ stream: null, name: "" });
    const [, setNewLevelForm] = useState({ name: "", teachers: Object.keys(teachersMap).slice(0, 2), status: 'Active' });

    // --- Handlers ---

    const handleInstitutionSelect = (instId) => {
        setActiveInstitutionId(instId);
        setActiveCourseCategory(null);
        setActiveLevelCategory(null);
        setActiveBatches([]);
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleCourseCategorySelect = (courseCategoryName) => {
        setActiveCourseCategory(courseCategoryName);
        setActiveLevelCategory(null);
        setActiveBatches([]);
        setSelectedBatch(null);
        setSelectedClass(null);
    };

    const handleLevelCategorySelect = (levelCategoryName) => {
        setActiveLevelCategory(levelCategoryName);
        setSelectedBatch(null);
        setSelectedClass(null);

        if (activeCourseCategory && levelCategoryName && currentInstData) {
            const key = `${activeCourseCategory}_${levelCategoryName}`;
            setActiveBatches(currentInstData.levels[key] || []);
        } else {
            setActiveBatches([]);
        }
    };

    const handleRowSelect = (batch) => {
        if (selectedBatch?.id === batch.id) {
            setSelectedBatch(null);
            setSelectedClass(null);
        } else {
            setSelectedBatch(batch);
            setSelectedClass(null);
        }
    };

    const handleClassSelect = (classDetail) => {
        if (selectedClass?.class_id === classDetail.class_id) {
            setSelectedClass(null);
        } else {
            setSelectedClass(classDetail);
        }
    };

    const handleNewInstitutionSubmit = (e) => {
        e.preventDefault();
        // Mock submission logic...
    };

    // Handler to open modal in edit mode
    const handleEditClick = (batch) => {
        setModalBatchData(batch);
    };


    // BATCH SUBMISSION HANDLER (Handles both create/update)
    const handleBatchSubmit = (formData) => {
        const isEdit = modalBatchData && modalBatchData !== 'NEW';

        if (isEdit) {
            // --- MOCK BATCH UPDATE LOGIC ---
            console.log("Updating Batch:", modalBatchData.id, formData);
            alert(`Successfully updated mock batch: ${formData.name}`);

            // Update activeBatches state with the edited data (Mock update)
            setActiveBatches(prev => prev.map(b =>
                b.id === modalBatchData.id
                    ? { ...b, ...formData, totalClasses: Number(formData.totalClasses) }
                    : b
            ));
            // --- END MOCK LOGIC ---

        } else {
            // --- MOCK BATCH CREATION LOGIC ---
            console.log("Submitting New Batch:", formData);
            alert(`Successfully created mock batch: ${formData.name}`);

            const newMockBatch = {
                name: formData.name,
                id: `MOCK-${Date.now()}`, // Unique ID
                active: true,
                totalClasses: Number(formData.totalClasses),
                totalSubjects: 0, // Mock
                assignedTeachers: Object.keys(teachersMap).slice(0, 1), // Assign a mock teacher
                classes: [], // No classes initially
                startTime: formData.startTime,
                endTime: formData.endTime,
                location: formData.location,
                mode: formData.mode,
                notes: formData.notes,
            };

            // For demonstration, we'll temporarily update the state (this wouldn't persist)
            setActiveBatches(prev => [...prev, newMockBatch]);
            // --- END MOCK LOGIC ---
        }

        setModalBatchData(null); // Close modal after successful action
    };


    /**
     * Renders teacher pills for the table column.
     * @param {string[]} assignedTeacherIds - Array of teacher IDs.
     */
    const renderTeacherPills = (assignedTeacherIds) => {
        const assignedTeachers = assignedTeacherIds.map(id => ({ id, name: getTeacherName(id, teachersMap) }));
        const visibleTeachers = assignedTeachers.slice(0, assignedTeachers.length);

        return (
            <div className="batch_teacher-list" title={assignedTeachers.map(t => t.name).join(', ')}>
                {visibleTeachers.map(t => (
                    <span key={t.id} className="batch_teacher-pill" title={t.name}>{t.name}</span>
                ))}
            </div>
        );
    };

    // --- CARD COMPONENTS (Internal) ---

    const InstCard = ({ institution }) => (
        <div
            className={`inst_card ${institution.id === activeInstitutionId ? 'inst_active' : ''}`}
            onClick={() => handleInstitutionSelect(institution.id)}
        >
            <FiHome size={24} className="inst_card-icon" />
            <div className="inst_card-name" title={institution.name}>{institution.name}</div>
        </div>
    );

    const CourseLevelCard = ({ level, index }) => {
        const colorClass = `course-color-${index % 4}`;

        return (
            <div
                className={`course_card ${colorClass} ${level.name === activeLevelCategory ? 'course_active' : ''}`}
                onClick={() => handleLevelCategorySelect(level.name)}
            >
                <FiLayers size={24} className="course_card-icon" />
                <div className="course_card-name">{level.name}</div>
                <div className="course_card-stream">{level.stream}</div>
            </div>
        );
    };

    // --- MAIN COMPONENT RENDER ---

    return (
        <div className="batch_wrapper">
            <h1 className="batch_title">Batches Management</h1>

            {/* ==================================== */}
            {/* STEP 1: INSTITUTION SELECTION */}
            {/* ==================================== */}
            <div className="step_card">
                <div className="step_header">
                    <h2 className="step_title">Institutions</h2>
                    <div className="step_actions">
                        <div className="batch_search-bar">
                            <input
                                type="text"
                                placeholder="Search Institutions..."
                                value={instSearchTerm}
                                onChange={(e) => setInstSearchTerm(e.target.value)}
                            />
                            <FiSearch className="batch_search-icon" />
                        </div>
                    </div>
                </div>

                <div className="entity_card_grid inst_grid">
                    {institutions.length > 0 ? (
                        institutions.map(inst => (
                            <InstCard key={inst.id} institution={inst} />
                        ))
                    ) : (
                        <div className="batch_no-results-tile">
                             No institutions match "{instSearchTerm}".
                        </div>
                    )}
                </div>
            </div>

            {/* ------------------------------------ */}

            {/* ==================================== */}
            {/* STEP 2: COURSE CATEGORY (STREAM) SELECTION */}
            {/* ==================================== */}
            {activeInstitutionId && (
                <div className="step_card">
                    <div className="step_header">
                        <h2 className="step_title">Courses</h2>
                        <div className="step_actions">
                            <div className="batch_search-bar">
                                <input
                                    type="text"
                                    placeholder="Search Streams..."
                                    value={courseSearchTerm}
                                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                                />
                                <FiSearch className="batch_search-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="entity_card_grid stream_grid">
                        {coursesForSelectedInst.length > 0 ? (
                            coursesForSelectedInst.map((stream) => (
                                <div
                                    key={stream.id}
                                    className={`stream_card ${stream.name === activeCourseCategory ? 'stream_active' : ''}`}
                                    onClick={() => handleCourseCategorySelect(stream.name)}
                                >
                                    <FiStar size={20} />
                                    <div className="stream_card-name">{stream.name}</div>
                                </div>
                            ))
                        ) : (
                             <div className="batch_no-results-tile">
                                 No categories found for the selected institution.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------ */}

            {/* ==================================== */}
            {/* STEP 3: COURSE LEVEL SELECTION (WITH COLOR CARDS) */}
            {/* ==================================== */}
            {activeCourseCategory && (
                <div className="step_card">
                    <div className="step_header">
                        <h2 className="step_title">Course Levels</h2>
                    </div>

                    <div className="entity_card_grid level_grid">
                        {levelsForSelectedCourse.length > 0 ? (
                            levelsForSelectedCourse.map((level, index) => (
                                <CourseLevelCard key={level.id} level={level} index={index} />
                            ))
                        ) : (
                             <div className="batch_no-results-tile">
                                 No course levels found for the selected Course Category.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------ */}

            {/* ==================================== */}
            {/* STEP 4: AVAILABLE LEVELS/BATCHES DISPLAY (TABLE) */}
            {/* ==================================== */}
            {activeLevelCategory && (
                <div className="step_card">
                    <div className="step_header">
                        <h2 className="step_title">Batches</h2>
                        <button className="batch_btn-primary" onClick={() => setModalBatchData('NEW')}>
                            <FiPlus /> Add New Batch
                        </button>
                    </div>

                    <div className="batch_table-container">
                        <table className="batch_table">
                            <thead>
                                <tr>
                                    <th>Batch Name</th>
                                    <th>Status</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Total No. of Classes</th>
                                    <th>Assigned Teachers</th>
                                    <th className="batch_table-actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeBatches.length > 0 ? (
                                    activeBatches.map(batch => (
                                        <tr
                                            key={batch.id}
                                            className={`batch_selectable-row ${selectedBatch?.id === batch.id ? 'batch_selected-row' : ''}`}
                                            onClick={() => handleRowSelect(batch)}
                                        >
                                            <td className="batch_batch-name-cell">{batch.name}</td>
                                            <td>
                                                <span className={`batch_status-pill batch_status-${batch.active ? 'active' : 'inactive'}`}>
                                                    {batch.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{batch.startTime}</td>
                                            <td>{batch.endTime}</td>
                                            <td><span className="batch_stat-number">{batch.totalClasses}</span></td>
                                            <td>{renderTeacherPills(batch.assignedTeachers)}</td>
                                            <td className="batch_table-actions-col">
                                                {/* EDIT ICON WITH HANDLER */}
                                                <button
                                                    className="batch_action-btn batch_edit-btn"
                                                    title="Edit Batch"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row selection when clicking the button
                                                        handleEditClick(batch);
                                                    }}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                {/* <button className="batch_action-btn batch_toggle-btn" title={batch.active ? 'Deactivate' : 'Activate'} ><FiAlertTriangle /></button> */}
                                                <button className="batch_action-btn batch_delete-btn" title="Delete Batch" ><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="8"><div className="batch_no-results">No batches defined for this course yet. Click "Add New Batch" to create one.</div></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ------------------------------------ */}

            {/* ==================================== */}
            {/* STEP 5: CLASS CARDS (Appears when a batch row is selected) */}
            {/* ==================================== */}
            {selectedBatch && (
                <div className="step_card batch_class-section">
                    <div className="step_header">
                        <h2 className="step_title">Classes</h2>
                    </div>
                    <div className="entity_card_grid class_card_grid">
                        {selectedBatch.classes.length > 0 ? (
                            selectedBatch.classes.map((classDetail, index) => (
                                <div
                                    key={classDetail.class_id}
                                    className={`class_card class-color-${index % 4} ${selectedClass?.class_id === classDetail.class_id ? 'class_active' : ''}`}
                                    onClick={() => handleClassSelect(classDetail)}
                                >
                                    <FiUsers size={24} className="class_card-icon" />
                                    <div className="class_card-name">{classDetail.class_name}</div>
                                    <div className="class_card-info">
                                        <FiCheckCircle size={14} className="class_card-info-icon"/>
                                        {classDetail.totalStudents} Students
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="batch_no-results-tile">No classes defined for this batch.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ------------------------------------ */}

            {/* ==================================== */}
            {/* STEP 6: CLASS DETAILS (Appears when a class card is selected) */}
            {/* ==================================== */}
            {selectedClass && (
                <div className="step_card batch_class-detail-section">
                    <div className="step_header">
                        <h2 className="step_title">Details for **{selectedClass.class_name}**</h2>
                    </div>
                    <div className="batch_detail-content-wrapper">
                        <div className="batch_detail-grid">
                            {/* Detail 1: Students */}
                            <div className="batch_detail-item item-students">
                                <div className="batch_detail-header">
                                    <FiCheckCircle size={24} className="batch_detail-icon" />
                                    <strong>Total Students</strong>
                                </div>
                                <div className="batch_detail-value">{selectedClass.totalStudents}</div>
                            </div>

                            {/* Detail 2: Subject-Respective Teachers (New requirement) */}
                            <div className="batch_detail-item item-subjects-teachers">
                                <div className="batch_detail-header">
                                    <FiBookOpen size={24} className="batch_detail-icon" />
                                    <strong>Subjects & Teachers ({selectedClass.subjectsIds.length})</strong>
                                </div>
                                <ul className="batch_subject-teacher-list">
                                    {Object.entries(getClassSubjectTeacherMap(selectedClass)).map(([subject, teacher], index) => (
                                        <li key={index} className="subject-teacher-row">
                                            <span className="subject-name">{subject}</span>
                                            <span className="teacher-name">{teacher}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Detail 3: Timetable (New Requirement) */}
                        <Timetable classDetail={selectedClass} />
                    </div>
                </div>
            )}

            {/* Modal JSX (Simplified for demonstration) */}
            {addInstitutionOpen && (
                <div className="batch_modal">
                    <div className="batch_modal-content">
                        <div className="batch_modal-header">
                            <h3>Add New Institution</h3>
                            <FiX onClick={() => setAddInstitutionOpen(false)} className="batch_close-modal" />
                        </div>
                        <form onSubmit={handleNewInstitutionSubmit}>
                            <label htmlFor="newInstName">Institution Name</label>
                            <input
                                id="newInstName"
                                type="text"
                                placeholder="e.g., Global Academy"
                                value={newInstitutionName}
                                onChange={(e) => setNewInstitutionName(e.target.value)}
                                required
                            />
                            <div className="batch_modal-actions">
                                <button type="button" className="batch_btn-secondary" onClick={() => setAddInstitutionOpen(false)}>Cancel</button>
                                <button type="submit" className="batch_btn-primary">Add Institution</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================== */}
            {/* NEW ADD/EDIT BATCH MODAL RENDER */}
            {/* ==================================== */}
            {/* Modal only opens if modalBatchData is not null AND course/level are selected */}
            {(activeCourseCategory && activeLevelCategory) && (
                <AddBatchModal
                    initialBatchData={modalBatchData}
                    onClose={() => setModalBatchData(null)}
                    courseCategory={activeCourseCategory}
                    levelCategory={activeLevelCategory}
                    teachersMap={teachersMap}
                    onSubmit={handleBatchSubmit} // Use the combined submit handler
                />
            )}

        </div>
    );
};

export default Batches;