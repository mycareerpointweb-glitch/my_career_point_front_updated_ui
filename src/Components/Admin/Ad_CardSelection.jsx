import React, { useState, useEffect, useRef } from "react";
import {
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiUsers,
    FiX, FiChevronLeft, FiChevronRight,
    FiLayers, FiBookOpen, FiAlertTriangle, FiCheckCircle,
    FiClock, FiMapPin, FiCalendar
} from "react-icons/fi";
// NOTE: The original Batches.css import is kept for reference,
// but the component now relies on the renamed classes (ad_cs_...) in its JSX.
import "../../Styles/Admin/Ad_CardSelection.css";
import StudentManagement from "../SuperAdmin/StudentManagement";


// ⚠️ IMPORTANT: Set the API Base URL to your Express server
// The URL is based on your server running at port 5000 and the '/api/courses' route


const API_BASE_URL = "http://localhost:5000/api/courses";
const teacherOptions = [
    { value: "teacher1", label: "John Doe" },
    { value: "teacher2", label: "Jane Smith" },
    { value: "teacher3", label: "Mark Lee" },
    { value: "teacher4", label: "Priya Sharma" },
    { value: "teacher5", label: "Ahmed Khan" },
];

// --- NEW DUMMY DATA FOR INSTITUTES ---
const dummyInstitutes = [
    { id: 1, name: "Nexus Academy", prefix: "NA", location: "Mumbai" },
    { id: 2, name: "Global EdTech", prefix: "GET", location: "Delhi" },
    { id: 3, name: "Local Coaching Hub", prefix: "LCH", location: "Pune" },
];


const dummyCourses = [
    // Courses for Nexus Academy (id: 1)
    { id: 101, instituteId: 1, courseName: "CA Foundation - Apr 2025 Regular", batchPrefix: "CAF-Apr25R", stream: "CA", level: "Foundation" },
    { id: 102, instituteId: 1, courseName: "CA Foundation - Dec 2025 Fast Track", batchPrefix: "CAF-Dec25FT", stream: "CA", level: "Foundation" },
    { id: 105, instituteId: 1, courseName: "CA Foundation - Nov 2025 Weekend", batchPrefix: "CAF-Nov25W", stream: "CA", level: "Foundation" },
    { id: 108, instituteId: 1, courseName: "CA Foundation - May 2026 Full", batchPrefix: "CAF-May26F", stream: "CA", level: "Foundation" },
    { id: 110, instituteId: 1, courseName: "CA Foundation - July 2026 Crash", batchPrefix: "CAF-Jul26C", stream: "CA", level: "Foundation" },

    { id: 103, instituteId: 1, courseName: "CA Intermediate - Apr 2025 Group 1", batchPrefix: "CAI-Apr25G1", stream: "CA", level: "Intermediate" },
    { id: 104, instituteId: 1, courseName: "CA Intermediate - Dec 2025 Group 2", batchPrefix: "CAI-Dec25G2", stream: "CA", level: "Intermediate" },
    { id: 106, instituteId: 1, courseName: "CA Intermediate - May 2026 Combined", batchPrefix: "CAI-May26C", stream: "CA", level: "Intermediate" },
    { id: 107, instituteId: 1, courseName: "CA Intermediate - July 2025 Weekend", batchPrefix: "CAI-Jul25W", stream: "CA", level: "Intermediate" },

    { id: 201, instituteId: 1, courseName: "CMA Foundation - Apr 2025 Batch A", batchPrefix: "CMF-Apr25A", stream: "CMA", level: "Foundation" },
    { id: 202, instituteId: 1, courseName: "CMA Foundation - Nov 2025 Batch B", batchPrefix: "CMF-Nov25B", stream: "CMA", level: "Foundation" },
    { id: 205, instituteId: 1, courseName: "CMA Foundation - May 2026 Exclusive", batchPrefix: "CMF-May26E", stream: "CMA", level: "Foundation" },
    { id: 203, instituteId: 1, courseName: "CMA Intermediate - Apr 2025 Term 1", batchPrefix: "CMI-Apr25T1", stream: "CMA", level: "Intermediate" },
    { id: 204, instituteId: 1, courseName: "CMA Intermediate - Dec 2025 Term 2", batchPrefix: "CMI-Dec25T2", stream: "CMA", level: "Intermediate" },
    
    // Courses for Global EdTech (id: 2)
    { id: 503, instituteId: 2, courseName: "CA Intermediate - Apr 2025 Group 1 (Global)", batchPrefix: "CAI-Apr25G1-G", stream: "CA", level: "Intermediate" },
    { id: 504, instituteId: 2, courseName: "CA Intermediate - Dec 2025 Group 2 (Global)", batchPrefix: "CAI-Dec25G2-G", stream: "CA", level: "Intermediate" },
    { id: 506, instituteId: 2, courseName: "CMA Final - May 2026 Combined", batchPrefix: "CMF-May26C", stream: "CMA", level: "Advanced" },
    { id: 507, instituteId: 2, courseName: "CA Final - July 2025 Weekend", batchPrefix: "CAF-Jul25W", stream: "CA", level: "Advanced" },
];

const initialBatches = [
    { 
        id: 1011, 
        courseId: 101, // Nexus Academy
        name: "Morning Batch A", 
        startDate: "2025-02-05", 
        endDate: "2025-04-15", 
        instructorIds: ["teacher1", "teacher3"], 
        studentCount: 98, 
        status: "Active", 
        capacity: 100, 
        mode: "Offline", 
        location: "Building A, Room 101", 
        notes: "Regular morning session",
        schedule: { startDay: "Mon", startTime: "09:00", endDay: "Fri", endTime: "12:00" } 
    },
    { 
        id: 1021, 
        courseId: 102, // Nexus Academy
        name: "Fast Track Batch", 
        startDate: "2025-10-01", 
        endDate: "2025-11-15", 
        instructorIds: ["teacher2"], 
        studentCount: 15, 
        status: "Upcoming", 
        capacity: 50, 
        mode: "Online", 
        location: "Zoom Link TBD", 
        notes: "Fast-paced course completion",
        schedule: { startDay: "Sat", startTime: "14:00", endDay: "Sun", endTime: "17:00" } 
    },
    { 
        id: 1051, 
        courseId: 105, // Nexus Academy
        name: "Weekend Batch", 
        startDate: "2025-08-01", 
        endDate: "2025-11-20", 
        instructorIds: ["teacher5"], 
        studentCount: 50, 
        status: "Upcoming", 
        capacity: 70, 
        mode: "Hybrid", 
        location: "Campus + Google Meet", 
        notes: "Weekend classes only",
        schedule: { startDay: "Sat", startTime: "10:00", endDay: "Sun", endTime: "13:00" } 
    },
    { 
        id: 1031, 
        courseId: 103, // Nexus Academy
        name: "Group 1 Regular", 
        startDate: "2025-01-20", 
        endDate: "2025-04-10", 
        instructorIds: ["teacher1", "teacher4"], 
        studentCount: 85, 
        status: "Active", 
        capacity: 100, 
        mode: "Offline", 
        location: "Building B, Hall 5", 
        notes: "Focus on Group 1 topics",
        schedule: { startDay: "Mon", startTime: "10:00", endDay: "Fri", endTime: "13:00" } 
    },
    { 
        id: 1032, 
        courseId: 103, // Nexus Academy
        name: "Group 1 Batch 2", 
        startDate: "2025-02-15", 
        endDate: "2025-05-01", 
        instructorIds: ["teacher3"], 
        studentCount: 52, 
        status: "Active", 
        capacity: 60, 
        mode: "Online", 
        location: "Private Discord Server", 
        notes: "Second batch for Group 1",
        schedule: { startDay: "Tue", startTime: "18:00", endDay: "Thu", endTime: "21:00" } 
    },
    { 
        id: 2011, 
        courseId: 201, // Nexus Academy
        name: "Regular Batch A", 
        startDate: "2025-02-01", 
        endDate: "2025-04-20", 
        instructorIds: ["teacher1", "teacher3"], 
        studentCount: 62, 
        status: "Active", 
        capacity: 80, 
        mode: "Offline", 
        location: "CMA Campus, Room 3", 
        notes: "Standard CMA Foundation batch",
        schedule: { startDay: "Mon", startTime: "08:00", endDay: "Fri", endTime: "11:00" } 
    },
    { 
        id: 2031, 
        courseId: 203, // Nexus Academy
        name: "Term 1 Batch X", 
        startDate: "2025-01-05", 
        endDate: "2025-03-30", 
        instructorIds: ["teacher5", "teacher2"], 
        studentCount: 120, 
        status: "Active", 
        capacity: 130, 
        mode: "Hybrid", 
        location: "Auditorium + Live Stream", 
        notes: "Intensive Term 1 preparation",
        schedule: { startDay: "Wed", startTime: "17:00", endDay: "Fri", endTime: "20:00" } 
    },
    { 
        id: 5031, 
        courseId: 503, // Global EdTech
        name: "Global Group 1", 
        startDate: "2025-04-01", 
        endDate: "2025-06-30", 
        instructorIds: ["teacher4"], 
        studentCount: 30, 
        status: "Upcoming", 
        capacity: 50, 
        mode: "Online", 
        location: "Global Platform Link", 
        notes: "Global cohort, evening classes",
        schedule: { startDay: "Mon", startTime: "19:00", endDay: "Wed", endTime: "22:00" } 
    },
];

const modeOptions = [
    { value: "Online", label: "Online" },
    { value: "Offline", label: "Offline" },
    { value: "Hybrid", label: "Hybrid" },
];

const weekDays = [
    { value: "Mon", label: "Monday" },
    { value: "Tue", label: "Tuesday" },
    { value: "Wed", label: "Wednesday" },
    { value: "Thu", label: "Thursday" },
    { value: "Fri", label: "Friday" },
    { value: "Sat", label: "Saturday" },
    { value: "Sun", label: "Sunday" },
];


// --- CustomSelect Component (to replace <select> as requested) ---

// Reusable component for dropdown look and feel using divs
const CustomSelect = ({ label, options, value, onChange, name, placeholder, disabled = false, icon: Icon, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const selectedOption = options.find(opt => opt.value === value);
    const selectedLabel = selectedOption?.label || (selectedOption === undefined && value === "" ? placeholder : value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (optionValue) => {
        // Mocking the event structure for compatibility with standard input handler
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const containerClasses = `ad_cs_batch-pro-custom-select ${isOpen ? 'ad_cs_open' : ''} ${disabled ? 'ad_cs_disabled' : ''}`;
    const headerClasses = `ad_cs_batch-pro-selected-value ${!value ? 'ad_cs_placeholder' : ''}`;

    return (
        <div className="ad_cs_batch_form_group" ref={selectRef}>
            <label>{label} {required && '*'}</label>
            <div className={containerClasses} onClick={() => !disabled && setIsOpen(!isOpen)}>
                <div className={headerClasses}>
                    {Icon && <Icon size={16} style={{ marginRight: '8px', color: 'var(--color-gray-500)' }} />}
                    {selectedLabel || placeholder}
                    <FiChevronDown size={18} className="ad_cs_batch-pro-dropdown-icon" />
                </div>
                {isOpen && (
                    <div className="ad_cs_batch-pro-select-dropdown">
                        {/* Option for default/placeholder if not required, or if we want an 'unselect' option */}
                        {placeholder && !required && (
                            <div
                                className="ad_cs_batch-pro-select-option ad_cs_placeholder-option"
                                onClick={(e) => { e.stopPropagation(); handleOptionClick(""); }}
                            >
                                {placeholder}
                            </div>
                        )}
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`ad_cs_batch-pro-select-option ${option.value === value ? 'ad_cs_selected' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleOptionClick(option.value); }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const FiChevronDown = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);


// --- Main Batches Component ---

const Ad_CardSelection = () => {
    const [batches, setBatches] = useState(initialBatches);
    // NEW: Institute selection state
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    // MODIFIED: Initial states are now null, requiring user selection
    const [selectedStream, setSelectedStream] = useState(null); 
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState(null); 
    
    // Global loading state for table (e.g., when fetching all batches, initially true)
    const [loading, setLoading] = useState(true); 
    // New states for form submissions and feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [addBatchOpen, setAddBatchOpen] = useState(false);
    const [addCourseOpen, setAddCourseOpen] = useState(false);
    const [editBatch, setEditBatch] = useState(null);
    const [selectedYear, setSelectedYear] = useState("All Years");
    // FIX: Add the missing searchTerm state here
    const [searchTerm, setSearchTerm] = useState(""); 
    const [selectableCourses, setSelectableCourses] = useState([]);
    const scrollContainer = useRef(null); // Exists for horizontal slider

    // REFS FOR AUTO-SCROLLING
    const instituteNavRef = useRef(null); // NEW REF
    const streamNavRef = useRef(null); // NEW REF
    const levelNavRef = useRef(null);
    const courseSliderRef = useRef(null);
    const batchesSectionRef = useRef(null);

    // Levels are now state to allow dynamic addition
    const [courseLevels, setCourseLevels] = useState(["Foundation", "Intermediate","Advanced"]);
    // Streams are now derived from courses filtered by institute
    const [availableStreams, setAvailableStreams] = useState([]);

    const availableYears = ["All Years", "2025", "2026", "2027"];

    // Combine filters for courses
    const getFilteredCourses = (instId, stream, level) => {
        return dummyCourses
            .filter(c => !instId || c.instituteId === instId)
            .filter(c => !stream || c.stream === stream)
            .filter(c => !level || c.level === level);
    }
    
    // Get unique streams for the selected institute
    useEffect(() => {
        if (selectedInstitute) {
            const courses = getFilteredCourses(selectedInstitute, null, null);
            const streams = [...new Set(courses.map(c => c.stream))];
            setAvailableStreams(streams);
        } else {
            setAvailableStreams([]);
        }
    }, [selectedInstitute]);

    useEffect(() => {
        // Simulate initial data loading for the table
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // NEW LOGIC: Filter courses based on Institute/Stream/Level selection
    useEffect(() => {
        if (selectedInstitute && selectedStream && selectedLevel) {
            const courses = getFilteredCourses(selectedInstitute, selectedStream, selectedLevel);
            setSelectableCourses(courses);
            
            // Check if the current selected course is still valid for the new stream/level
            if (selectedCourseId && courses.findIndex(c => c.id === selectedCourseId) === -1) {
                // If the previous course selection is no longer valid, clear it
                setSelectedCourseId(null);
                setFormData(prev => ({ ...prev, courseId: null }));
            }
            
            if (courses.length === 0) {
                setSelectedCourseId(null);
                setFormData(prev => ({ ...prev, courseId: null }));
            }

        } else {
            // Clear all course related states if stream or level is not selected
            setSelectableCourses([]);
            setSelectedCourseId(null);
            setFormData(prev => ({ ...prev, courseId: null }));
        }
    }, [selectedInstitute, selectedStream, selectedLevel]); 
    // selectedCourseId removed from dependency array to avoid setting it automatically
    

    // NEW: Scroll to the Stream Navigation when an Institute is selected
    useEffect(() => {
        if (selectedInstitute && streamNavRef.current) {
            streamNavRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedInstitute]);

    // NEW: Scroll to the Level Navigation when a Stream is selected
    useEffect(() => {
        if (selectedStream && levelNavRef.current) {
            levelNavRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedStream]);

    // NEW: Scroll to the Course Slider when a Level is selected
    useEffect(() => {
        if (selectedLevel && courseSliderRef.current) {
            courseSliderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedLevel]);

    // NEW: Scroll to the Batches Table when a Course is selected
    useEffect(() => {
        if (selectedCourseId && batchesSectionRef.current) {
            batchesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedCourseId]);


    const initialFormData = {
        courseId: null,
        name: "",
        startDate: "", // Overall batch start date
        endDate: "", // Overall batch end date
        instructorIds: [],
        capacity: "", // New: Student capacity
        mode: "", // New: Online/Offline/Hybrid
        location: "", // New: Location text
        notes: "", // New: Notes/Description text
        // New: Schedule fields (for daily/weekly class times)
        schedule: {
            startDay: "",
            startTime: "",
            endDay: "",
            endTime: ""
        }
    };
    const [formData, setFormData] = useState(initialFormData);

    // Sync formData's courseId when selection changes
    useEffect(() => {
        if (selectedCourseId) {
            setFormData(prev => ({ ...prev, courseId: selectedCourseId }));
        } else {
            setFormData(prev => ({ ...prev, courseId: null }));
        }
    }, [selectedCourseId]);


    // New state for Add Course Form (Stream and the New Level name)
    const [newCourseForm, setNewCourseForm] = useState({
        stream: selectedStream || 'CA',
        level: '', // This is the new Level name input, e.g., "Executive"
    });

    // Sync newCourseForm stream when main selection changes
    useEffect(() => {
        setNewCourseForm(prev => ({
            ...prev,
            stream: selectedStream || '',
            level: '', // Always clear the new level input when stream changes
        }));
    }, [selectedStream]);


    // Helper to clear feedback messages after a delay
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);


    const handleNewCourseFormChange = (e) => {
        const { name, value } = e.target;
        setNewCourseForm(prev => ({ ...prev, [name]: value }));
    };

    /**
     * HANDLER FOR ADDING NEW COURSE LEVEL
     * Sends a POST request to the backend. (Mocked)
     */
    const handleAddNewCourse = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const newLevelName = newCourseForm.level.trim();
        if (!newLevelName) {
            setError("Please enter a new course level name.");
            return;
        }
        
        // Check if level already exists (case-insensitive)
        if (courseLevels.map(l => l.toLowerCase()).includes(newLevelName.toLowerCase())) {
            setError(`The course level "${newLevelName}" already exists.`);
            return;
        }

        const courseData = {
            stream: newCourseForm.stream,
            newLevel: newLevelName
        };

        setIsSubmitting(true);
        try {
            console.log("Sending course level data:", courseData);
            // NOTE: API call is commented out, using client-side update only.
            // const response = await fetch(`${API_BASE_URL}/levels/create`, { ... });
            
            // SIMULATE SUCCESS
            await new Promise(resolve => setTimeout(resolve, 1000));
            // END SIMULATION

            // 3. Update local state ONLY on successful API response
            setCourseLevels(prevLevels => [...prevLevels, newLevelName]);
            setSelectedLevel(newLevelName); // Automatically select the new level

            // 4. Provide feedback and reset form
            setSuccess(`New course level "${newLevelName}" for ${newCourseForm.stream} created successfully!`);
            setAddCourseOpen(false);
            setNewCourseForm({
                stream: selectedStream || 'CA',
                level: '',
            });
            
        } catch (err) {
            // setError(err.message || 'Failed to add new course level.'); // Use if API is active
            setError('Failed to add new course level (Simulated API failure).');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * NEW: Handler for Institute selection
     */
    const handleInstituteClick = (instituteId) => {
        setSelectedInstitute(instituteId);
        // Reset subsequent selections
        setSelectedStream(null);
        setSelectedLevel(null);
        setSelectedCourseId(null);
        setAddBatchOpen(false);
        setSelectedYear("All Years");
        setFormData(prev => ({ ...prev, courseId: null }));
    };

    const handleStreamClick = (stream) => {
        setSelectedStream(stream);
        // Reset subsequent selections, hiding the next steps
        setSelectedLevel(null);
        setSelectedCourseId(null);
        setAddBatchOpen(false);
        setSelectedYear("All Years");
        setFormData(prev => ({ ...prev, courseId: null }));
    };

    const handleLevelClick = (level) => {
        setSelectedLevel(level);
        // Reset subsequent selections, hiding the table
        setSelectedCourseId(null);
        setAddBatchOpen(false);
        setSelectedYear("All Years");
        setFormData(prev => ({ ...prev, courseId: null }));
        // The filtering and course list update happens in the useEffect
    };

    const handleCourseSelect = (courseId) => {
        setSelectedCourseId(courseId);
        console.log(courseId);
        setFormData(prev => ({ ...prev, courseId }));
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        if (name === "instructorIds") {
            setFormData(prev => ({
                ...prev,
                instructorIds: prev.instructorIds.includes(value)
                    ? prev.instructorIds.filter(id => id !== value) // Remove if already present
                    : [...prev.instructorIds, value] // Add if not present
            }));
            return;
        }

        if (name.startsWith("schedule.")) {
            const scheduleField = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [scheduleField]: value
                }
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * HANDLER FOR ADDING/UPDATING A BATCH
     * Sends a POST/PUT request to the backend. (Mocked)
     */
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Basic Validation
        if (!formData.courseId || !formData.name || !formData.startDate || !formData.endDate || formData.instructorIds.length === 0 || !formData.capacity || !formData.mode || !formData.location) {
            setError("Please fill in all required fields (Course, Name, Dates, Instructors, Capacity, Mode, Location).");
            return;
        }
        
        if (formData.capacity <= 0) {
            setError("Capacity must be a positive number.");
            return;
        }

        const isEditing = !!editBatch;
        const submitData = {
            ...formData,
            id: isEditing ? editBatch.id : Date.now(), // Use existing ID or generate new mock ID
            status: isEditing ? editBatch.status : "Upcoming", // Default status for new batches
        };

        setIsSubmitting(true);

        try {
            console.log(`Submitting batch data (${isEditing ? 'UPDATE' : 'CREATE'}):`, submitData);
            // SIMULATE API CALL
            await new Promise(resolve => setTimeout(resolve, 1500));
            // END SIMULATION

            // 3. Update local state
            if (isEditing) {
                setBatches(prev => prev.map(b => b.id === submitData.id ? submitData : b));
                setSuccess(`Batch "${submitData.name}" updated successfully!`);
            } else {
                setBatches(prev => [submitData, ...prev]);
                setSuccess(`New batch "${submitData.name}" created successfully!`);
            }

            // 4. Close modal and reset form
            setAddBatchOpen(false);
            setEditBatch(null);
            setFormData(initialFormData);
            setSelectedCourseId(null); // Clear course selection in the flow as well

        } catch (err) {
            // setError(err.message || `Failed to ${isEditing ? 'update' : 'add'} batch.`); // Use if API is active
            setError(`Failed to ${isEditing ? 'update' : 'add'} batch (Simulated API failure).`);
        } finally {
            setIsSubmitting(false);
        }
    };


    /**
     * HANDLER FOR DELETING A BATCH
     * Sends a DELETE request to the backend. (Mocked)
     */
    const handleDeleteBatch = async (batchId, batchName) => {
        if (!window.confirm(`Are you sure you want to delete the batch: "${batchName}"?`)) {
            return;
        }

        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            console.log("Deleting batch ID:", batchId);
            // SIMULATE API CALL
            await new Promise(resolve => setTimeout(resolve, 1000));
            // END SIMULATION

            // 3. Update local state
            setBatches(prev => prev.filter(b => b.id !== batchId));
            setSuccess(`Batch "${batchName}" deleted successfully.`);
            
        } catch (err) {
            // setError(err.message || 'Failed to delete batch.'); // Use if API is active
            setError('Failed to delete batch (Simulated API failure).');
        } finally {
            setLoading(false);
        }
    };

    /**
     * HANDLER FOR STARTING EDIT MODE
     */
    const handleEditClick = (batch) => {
        // Set course in main state to show relevant course cards
        const course = dummyCourses.find(c => c.id === batch.courseId);
        if (course) {
            setSelectedInstitute(course.instituteId); // NEW: Select institute
            setSelectedStream(course.stream);
            setSelectedLevel(course.level);
        }

        // Populate form data
        setFormData({
            courseId: batch.courseId,
            name: batch.name,
            startDate: batch.startDate,
            endDate: batch.endDate,
            instructorIds: batch.instructorIds,
            capacity: batch.capacity,
            mode: batch.mode,
            location: batch.location,
            notes: batch.notes,
            schedule: batch.schedule,
        });

        // Set edit state and open modal
        setEditBatch(batch);
        setSelectedCourseId(batch.courseId); // Also select the course card
        setAddBatchOpen(true);
    };


    const handleCloseModal = () => {
        setAddBatchOpen(false);
        setEditBatch(null);
        setFormData(initialFormData);
    };

    // --- RENDERING HELPERS ---

    const getCourseName = (courseId) => {
        const course = dummyCourses.find(c => c.id === courseId);
        return course ? course.courseName : "Unknown Course";
    };

    const getInstructorNames = (instructorIds) => {
        return instructorIds.map(id => {
            const instructor = teacherOptions.find(t => t.value === id);
            return instructor ? instructor.label : id;
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Active":
                return <span className="ad_cs_batch-status-badge ad_cs_status-active">{status} <FiCheckCircle size={12} style={{ marginLeft: '4px' }}/></span>;
            case "Upcoming":
                return <span className="ad_cs_batch-status-badge ad_cs_status-upcoming">{status} <FiAlertTriangle size={12} style={{ marginLeft: '4px' }}/></span>;
            case "Completed":
                return <span className="ad_cs_batch-status-badge ad_cs_status-completed">{status} <FiCheckCircle size={12} style={{ marginLeft: '4px' }}/></span>;
            default:
                return <span className="ad_cs_batch-status-badge">{status}</span>;
        }
    };


    // --- FILTERING LOGIC ---
    
    // 1. Filter by Course Selection
    // NOTE: This logic now correctly displays batches *only* after a course card is selected.
    let displayedBatches = selectedCourseId 
        ? batches.filter(b => b.courseId === selectedCourseId)
        : []; // Only show batches for the selected course card

    // 2. Filter by Search Term (Course Name or Batch Name)
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        displayedBatches = displayedBatches.filter(batch => {
            const courseName = getCourseName(batch.courseId).toLowerCase();
            const batchName = batch.name.toLowerCase();
            return courseName.includes(lowerCaseSearchTerm) || batchName.includes(lowerCaseSearchTerm);
        });
    }

    // 3. Filter by Year
    if (selectedYear !== "All Years") {
        displayedBatches = displayedBatches.filter(batch => {
            return batch.startDate.startsWith(selectedYear);
        });
    }


    // --- COURSE SLIDER SCROLL LOGIC ---

    const scrollSlider = (direction) => {
        if (scrollContainer.current) {
            const scrollAmount = 250; // Scroll 250px
            if (direction === 'left') {
                scrollContainer.current.scrollLeft -= scrollAmount;
            } else {
                scrollContainer.current.scrollLeft += scrollAmount;
            }
        }
    };


    // --- RENDER FUNCTIONS FOR MODALS ---

    const renderBatchInfoModal = () => {
        if (!editBatch) return null;

        const course = dummyCourses.find(c => c.id === editBatch.courseId);
        const instructorNames = getInstructorNames(editBatch.instructorIds);

        return (
            <div className="ad_cs_batch-pro-modal-overlay">
                <div className="ad_cs_batch-pro-modal">
                    <div className="ad_cs_batch-pro-modal-header">
                        <h3>Batch Details: {editBatch.name}</h3>
                        <button onClick={() => setEditBatch(null)}><FiX size={24} /></button>
                    </div>
                    <div className="ad_cs_batch-pro-modal-body">
                        {/* Summary Card */}
                        <div className="ad_cs_batch-pro-info-card">
                            <div className="ad_cs_info-card-header">
                                <h4>{course ? course.courseName : 'Course ID: ' + editBatch.courseId}</h4>
                                {getStatusBadge(editBatch.status)}
                            </div>
                            <div className="ad_cs_info-card-detail">
                                <div className="ad_cs_info-card-item">
                                    <span><FiUsers size={14} /> Students</span>
                                    <span className="ad_cs_stat-value">{editBatch.studentCount}/{editBatch.capacity}</span>
                                </div>
                                <div className="ad_cs_info-card-item">
                                    <span><FiLayers size={14} /> Mode</span>
                                    <span className="ad_cs_stat-value">{editBatch.mode}</span>
                                </div>
                                <div className="ad_cs_info-card-item">
                                    <span><FiCalendar size={14} /> Start Date</span>
                                    <span className="ad_cs_stat-value">{new Date(editBatch.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="ad_cs_info-card-item">
                                    <span><FiCalendar size={14} /> End Date</span>
                                    <span className="ad_cs_stat-value">{new Date(editBatch.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Instructors */}
                            <label style={{ marginTop: 'var(--space-4)' }}>Instructors</label>
                            <div className="ad_cs_badge-group">
                                {instructorNames.map((name, index) => (
                                    <span key={index} className={`ad_cs_teacher-badge ${index % 3 === 0 ? 'ad_cs_tag-pink' : index % 3 === 1 ? 'ad_cs_tag-orange' : 'ad_cs_tag-info'}`}>
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="ad_cs_batch-detail-grid">
                            <div className="ad_cs_detail-group">
                                <span className="ad_cs_detail-label"><FiClock size={16} /> Schedule</span>
                                <span className="ad_cs_detail-value">
                                    {editBatch.schedule.startDay} - {editBatch.schedule.endDay}
                                </span>
                                <span className="ad_cs_detail-value" style={{ marginTop: '4px', fontSize: 'var(--font-size-base)' }}>
                                    {editBatch.schedule.startTime} to {editBatch.schedule.endTime}
                                </span>
                            </div>
                            <div className="ad_cs_detail-group">
                                <span className="ad_cs_detail-label"><FiMapPin size={16} /> Location</span>
                                <span className="ad_cs_detail-value">{editBatch.location}</span>
                            </div>
                        </div>

                        {/* Notes/Description */}
                        <div className="ad_cs_batch_form_group" style={{ marginTop: 'var(--space-4)' }}>
                            <label>Notes/Description</label>
                            <textarea
                                readOnly
                                value={editBatch.notes || 'No description provided.'}
                                style={{ minHeight: '100px', backgroundColor: 'var(--color-gray-100)' }}
                            />
                        </div>

                        <div className="ad_cs_batch_form_actions" style={{ padding: '0', border: 'none', marginTop: 'var(--space-8)' }}>
                             <button
                                className="ad_cs_btn-outline-pro"
                                onClick={() => {
                                    setEditBatch(null); // Close the info modal
                                    handleEditClick(editBatch); // Re-open in edit mode
                                }}>
                                <FiEdit2 /> Edit Batch
                            </button>
                             <button
                                className="ad_cs_btn-primary-pro"
                                onClick={() => setEditBatch(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderAddBatchModal = () => {
        // Find the selected course object for display in the modal
        const currentCourse = dummyCourses.find(c => c.id === formData.courseId);

        return (
            <div className="ad_cs_batch-pro-modal-overlay">
                <div className="ad_cs_batch-pro-modal">
                    <div className="ad_cs_batch-pro-modal-header">
                        <h3>{editBatch ? 'Edit Existing Batch' : 'Add New Batch'}</h3>
                        <button onClick={handleCloseModal} disabled={isSubmitting}><FiX size={24} /></button>
                    </div>
                    <form onSubmit={handleBatchSubmit}>
                        <div className="ad_cs_batch-pro-modal-body">
                            {/* Feedback Messages */}
                            {error && (
                                <div className="ad_cs_batch-pro-message ad_cs_error">
                                    <FiAlertTriangle size={16} /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="ad_cs_batch-pro-message ad_cs_success">
                                    <FiCheckCircle size={16} /> {success}
                                </div>
                            )}

                            {/* Course Selection Info */}
                            <div className="ad_cs_batch_form_group">
                                <label>Course Selected</label>
                                <div className="ad_cs_batch-pro-info-card">
                                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                                        {currentCourse ? currentCourse.courseName : "Please select a course first."}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
                                        {currentCourse ? `${currentCourse.stream} / ${currentCourse.level}` : "Selection is required."}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="ad_cs_batch_form_group">
                                <label htmlFor="batchName">Batch Name *</label>
                                <input
                                    type="text"
                                    id="batchName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="e.g., Morning Batch A, Fast Track Dec 25"
                                    required
                                    disabled={isSubmitting || !formData.courseId}
                                />
                            </div>

                            <div className="ad_cs_form-row">
                                <div className="ad_cs_batch_form_group">
                                    <label htmlFor="startDate">Start Date *</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting || !formData.courseId}
                                    />
                                </div>
                                <div className="ad_cs_batch_form_group">
                                    <label htmlFor="endDate">End Date *</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting || !formData.courseId}
                                    />
                                </div>
                            </div>
                            
                            <div className="ad_cs_form-row">
                                <CustomSelect
                                    label="Mode *"
                                    name="mode"
                                    options={modeOptions}
                                    value={formData.mode}
                                    onChange={handleFormChange}
                                    placeholder="Select Batch Mode"
                                    icon={FiLayers}
                                    required={true}
                                    disabled={isSubmitting || !formData.courseId}
                                />

                                <div className="ad_cs_batch_form_group">
                                    <label htmlFor="capacity">Capacity *</label>
                                    <input
                                        type="number"
                                        id="capacity"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleFormChange}
                                        placeholder="Max Students"
                                        min="1"
                                        required
                                        disabled={isSubmitting || !formData.courseId}
                                    />
                                </div>
                            </div>

                            <div className="ad_cs_batch_form_group">
                                <label htmlFor="location">Location / Link *</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleFormChange}
                                    placeholder="e.g., Building A, Room 101 or Zoom Link TBD"
                                    required
                                    disabled={isSubmitting || !formData.courseId}
                                />
                            </div>
                            
                            <div className="ad_cs_batch_form_group">
                                <label>Instructors *</label>
                                <div className="ad_cs_batch-pro-checkbox-group">
                                    {teacherOptions.map(teacher => (
                                        <label key={teacher.value} className="ad_cs_checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="instructorIds"
                                                value={teacher.value}
                                                checked={formData.instructorIds.includes(teacher.value)}
                                                onChange={handleFormChange}
                                                disabled={isSubmitting || !formData.courseId}
                                            />
                                            {teacher.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="ad_cs_batch-pro-schedule-group">
                                <label>Weekly Schedule (Class Days & Times)</label>
                                <div className="ad_cs_batch-pro-time-select">
                                    <CustomSelect
                                        label="Start Day"
                                        name="schedule.startDay"
                                        options={weekDays}
                                        value={formData.schedule.startDay}
                                        onChange={handleFormChange}
                                        placeholder="Mon"
                                        disabled={isSubmitting || !formData.courseId}
                                    />
                                    <div className="ad_cs_batch_form_group">
                                        <label htmlFor="startTime">Start Time</label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            name="schedule.startTime"
                                            value={formData.schedule.startTime}
                                            onChange={handleFormChange}
                                            disabled={isSubmitting || !formData.courseId}
                                        />
                                    </div>
                                </div>
                                <div className="ad_cs_batch-pro-time-select" style={{ marginTop: 'var(--space-4)' }}>
                                    <CustomSelect
                                        label="End Day"
                                        name="schedule.endDay"
                                        options={weekDays}
                                        value={formData.schedule.endDay}
                                        onChange={handleFormChange}
                                        placeholder="Fri"
                                        disabled={isSubmitting || !formData.courseId}
                                    />
                                    <div className="ad_cs_batch_form_group">
                                        <label htmlFor="endTime">End Time</label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            name="schedule.endTime"
                                            value={formData.schedule.endTime}
                                            onChange={handleFormChange}
                                            disabled={isSubmitting || !formData.courseId}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ad_cs_batch_form_group">
                                <label htmlFor="notes" style={{ marginTop: 'var(--space-4)' }}>Notes/Description</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleFormChange}
                                    placeholder="Any internal notes or descriptions for this batch..."
                                    rows="3"
                                    disabled={isSubmitting || !formData.courseId}
                                />
                            </div>

                        </div>
                        <div className="ad_cs_batch_form_actions">
                            <button type="button"
                                className="ad_cs_btn-outline-pro"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="submit"
                                className="ad_cs_btn-primary-pro"
                                disabled={isSubmitting || !formData.courseId}>
                                {isSubmitting ? 'Saving...' : <><FiPlus/> {editBatch ? 'Save Changes' : 'Add Batch'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderAddCourseModal = () => {
        return (
            <div className="ad_cs_batch-pro-modal-overlay">
                <div className="ad_cs_batch-pro-modal">
                    <div className="ad_cs_batch-pro-modal-header">
                        <h3>Add New Course Level</h3>
                        <button onClick={() => setAddCourseOpen(false)} disabled={isSubmitting}><FiX size={24} /></button>
                    </div>
                    <div className="ad_cs_batch-pro-modal-body">
                         {/* Feedback Messages */}
                        {error && (
                            <div className="ad_cs_batch-pro-message ad_cs_error">
                                <FiAlertTriangle size={16} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="ad_cs_batch-pro-message ad_cs_success">
                                <FiCheckCircle size={16} /> {success}
                            </div>
                        )}

                        <form onSubmit={handleAddNewCourse}>
                            <div className="ad_cs_batch_form_group">
                                <label>Stream Selected (Course Group)</label>
                                <input
                                    type="text"
                                    name="stream"
                                    value={newCourseForm.stream}
                                    onChange={handleNewCourseFormChange}
                                    readOnly
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: 'var(--color-gray-100)' }}
                                />
                            </div>

                            <div className="ad_cs_batch_form_group">
                                <label htmlFor="level">New Course Level Name *</label>
                                <input
                                    type="text"
                                    name="level"
                                    value={newCourseForm.level}
                                    onChange={handleNewCourseFormChange}
                                    placeholder="Enter New Level Name (e.g., Executive, Final)"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="ad_cs_batch_form_actions" style={{ marginTop: '20px' }}>
                                <button type="button"
                                    className="ad_cs_btn-outline-pro"
                                    onClick={() => setAddCourseOpen(false)}
                                    disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="ad_cs_btn-primary-pro"
                                    disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : <><FiPlus/> Save Level</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };


    // --- BATCH TABLE RENDERING ---

    const renderBatchesTable = () => {
        const selectedCourse = dummyCourses.find(c => c.id === selectedCourseId);

        if (!selectedCourseId) {
            return (
                <div className="ad_cs_batch-pro-empty-state">
                    <FiLayers size={48} color="var(--color-gray-300)" />
                    <p>Select a **Course Card** above to view and manage its batches.</p>
                </div>
            );
        }

        if (loading) {
            return <p>Loading batches...</p>;
        }

        if (displayedBatches.length === 0) {
            return (
                <div className="ad_cs_batch-pro-empty-state">
                    <FiAlertTriangle size={48} color="var(--color-gray-300)" />
                    <p>No batches found for {selectedCourse ? selectedCourse.courseName : 'the selected course'}.</p>
                    <button 
                        className="ad_cs_btn-primary-pro"
                        onClick={() => setAddBatchOpen(true)}
                        style={{ marginTop: '10px' }}>
                        <FiPlus/> Add First Batch
                    </button>
                </div>
            );
        }

        return (
            <></>
            // <div className="ad_cs_batch-pro-table-container">
            //     <table className="ad_cs_batch-pro-table">
            //         <thead>
            //             <tr>
            //                 <th>Batch Name</th>
            //                 <th>Dates</th>
            //                 <th>Instructors</th>
            //                 <th>Students</th>
            //                 <th>Mode & Location</th>
            //                 <th>Status</th>
            //                 <th>Actions</th>
            //             </tr>
            //         </thead>
            //         <tbody>
            //             {displayedBatches.map(batch => (
            //                 <tr key={batch.id}>
            //                     <td className="ad_cs_batch-name-cell" onClick={() => setEditBatch(batch)}>
            //                         <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{batch.name}</span>
            //                         <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
            //                             {getCourseName(batch.courseId)}
            //                         </span>
            //                     </td>
            //                     <td>
            //                         {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
            //                     </td>
            //                     <td style={{ maxWidth: '200px' }}>
            //                         <div className="ad_cs_instructor-list">
            //                             {getInstructorNames(batch.instructorIds).map((name, index) => (
            //                                 <span key={index} className="ad_cs_instructor-tag">{name}</span>
            //                             ))}
            //                         </div>
            //                     </td>
            //                     <td>{batch.studentCount} / {batch.capacity}</td>
            //                     <td>
            //                         <span className="ad_cs_mode-tag">{batch.mode}</span>
            //                         <span className="ad_cs_location-text">{batch.location}</span>
            //                     </td>
            //                     <td>{getStatusBadge(batch.status)}</td>
            //                     <td className="ad_cs_actions-cell">
            //                         <button onClick={() => handleEditClick(batch)} className="ad_cs_icon-btn" title="Edit Batch">
            //                             <FiEdit2 size={16} />
            //                         </button>
            //                         <button onClick={() => handleDeleteBatch(batch.id, batch.name)} className="ad_cs_icon-btn ad_cs_delete-btn" title="Delete Batch">
            //                             <FiTrash2 size={16} />
            //                         </button>
            //                     </td>
            //                 </tr>
            //             ))}
            //         </tbody>
            //     </table>
            // </div>
        );
    };


    // --- MAIN RENDER ---
    return (
        <div className="ad_cs_batch-pro-wrapper">
            
            {/* Modal Components (Rendered on top) */}
            {editBatch && !addBatchOpen && renderBatchInfoModal()} 
            {addBatchOpen && renderAddBatchModal()}
            {addCourseOpen && renderAddCourseModal()}

            {/* Header */}
            <div className="ad_cs_batch-pro-header-main">
                <h1 className="ad_cs_page-title">Batches</h1>
            </div>
            
            {/* Feedback Messages (Non-modal) */}
            {error && !addBatchOpen && !addCourseOpen && (
                <div className="ad_cs_batch-pro-message ad_cs_error">
                    <FiAlertTriangle size={16} /> {error}
                </div>
            )}
            {success && !addBatchOpen && !addCourseOpen && (
                <div className="ad_cs_batch-pro-message ad_cs_success">
                    <FiCheckCircle size={16} /> {success}
                </div>
            )}


            {/* 1. Institute Selection (NEW STEP) */}
            <div className="ad_cs_batch-pro-stream-nav" ref={instituteNavRef}>
                <h3>Institute</h3>
                <div className="ad_cs_flex">
                    {dummyInstitutes.map(institute => (
                        <div 
                            key={institute.id} 
                            className={`ad_cs_batch-pro-nav-card ${selectedInstitute === institute.id ? 'ad_cs_selected' : ''}`}
                            onClick={() => handleInstituteClick(institute.id)}>
                            <h3>{institute.name}</h3>
                            <p>{institute.location} ({institute.prefix})</p>
                        </div>
                    ))}
                </div>
            </div>


            {/* 2. Stream Selection (Appears after Institute selection) */}
            {selectedInstitute && (
                <div className="ad_cs_batch-pro-level-nav" ref={streamNavRef}>
                    <h3>Stream</h3>
                    <div className="ad_cs_flex">
                        {availableStreams.map(stream => (
                            <div 
                                key={stream} 
                                className={`ad_cs_batch-pro-nav-card ${selectedStream === stream ? 'ad_cs_selected_courses' : ''}`}
                                onClick={() => handleStreamClick(stream)}>
                                <h3>{stream}</h3>
                                <p>All {stream} Courses</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* 3. Level Selection (Appears after Stream selection) */}
            {selectedInstitute && selectedStream && (
                <div className="ad_cs_batch-pro-level-nav" ref={levelNavRef}>
                    <h3>Course Level</h3>
                    <div className="ad_cs_flex">
                        {courseLevels.map(level => (
                            <div 
                                key={level} 
                                className={`ad_cs_batch-pro-nav-card ${selectedLevel === level ? 'ad_cs_selected_courses' : ''}`}
                                onClick={() => handleLevelClick(level)}>
                                <h3>{level}</h3>
                                <p>Courses under {level} level</p>
                            </div>
                        ))}
                        {/* Optional button to add new level */}
                        <div 
                            className="ad_cs_batch-pro-nav-card ad_cs_add-new-card"
                            onClick={() => setAddCourseOpen(true)}
                            style={{ opacity: selectedStream ? 1 : 0.5, pointerEvents: selectedStream ? 'auto' : 'none' }}>
                            <FiPlus size={24}/>
                            <p>Add New Level</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 4. Course Card Slider Selection (Appears after Level selection) */}
            {selectedInstitute && selectedStream && selectedLevel && (
                <div className="ad_cs_batch-pro-course-slider-group" ref={courseSliderRef}>
                    <h3>Batches</h3>
                    
                    <div className="ad_cs_batch-pro-course-slider scroll-hide" ref={scrollContainer}>
                        {selectableCourses.map(course => (
                            <div 
                                key={course.id}
                                className={`ad_cs_batch-pro-course-card ${selectedCourseId === course.id ? 'ad_cs_selected' : ''}`}
                                onClick={() => handleCourseSelect(course.id)}
                                style={{ flex: '0 0 280px' }} // inline style to maintain card width
                            >
                                <h4>{course.courseName}</h4>
                                <p>Prefix: {course.batchPrefix} | ID: {course.id}</p>
                            </div>
                        ))}
                        {selectableCourses.length === 0 && (
                            <p style={{ padding: 'var(--space-4)', color: 'var(--color-gray-600)' }}>
                                No courses found for the selected Stream and Level.
                            </p>
                        )}
                    </div>
                    
                    {/* Slider Navigation Buttons (Show only if there are items) */}
                    {selectableCourses.length > 3 && (
                        <>
                            <div 
                                className="ad_cs_batch-pro-scroll-btn ad_cs_batch-pro-scroll-left"
                                onClick={() => scrollSlider('left')}>
                                <FiChevronLeft size={20} />
                            </div>
                            <div 
                                className="ad_cs_batch-pro-scroll-btn ad_cs_batch-pro-scroll-right"
                                onClick={() => scrollSlider('right')}>
                                <FiChevronRight size={20} />
                            </div>
                        </>
                    )}
                </div>
            )}
            
            
            {/* 6. Student Management Component - Only appears after a course card is selected */}
            {selectedCourseId && (
                <div className="ad_cs_batch-pro-selected-course-info">
                    <StudentManagement courseId={selectedCourseId} />
                </div>
            )}

        </div>
    );
};

export default Ad_CardSelection;