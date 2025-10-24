import "../../../Styles/SuperAdmin/Assignment.css"; // Contains all am_ prefixed styles
import ViewSubmission from "./ViewSubmission";
import React, { useState, useRef, useEffect, use } from "react";
// Added all necessary icons for the Assignment Display and Modal
import { 
    FiSearch, FiX, FiBookOpen, FiZap, FiCalendar, FiArrowLeft, FiArrowRight, 
    FiCheckCircle, FiGrid, FiList, FiClock, FiFileText, FiDownload, 
    FiUpload, FiEdit, FiTrash2, FiMaximize2, FiLayers, FiCheckSquare, 
    FiAlertCircle, FiPlus, FiSave, FiUploadCloud, FiPaperclip,FiEye
} from "react-icons/fi";

// --- DUMMY DATA (Re-included codes for file generation logic) ---
const DUMMY_BATCHES = [
    { id: 101, courseName: "CA Foundation - Apr 2025 Regular", batchPrefix: "CAF-Apr25R", stream: "CA", level: "Foundation", enrollment: 450, status: "Active" },
    { id: 102, courseName: "CA Foundation - Dec 2025 Fast Track", batchPrefix: "CAF-Dec25FT", stream: "CA", level: "Foundation", enrollment: 210, status: "Active" },
    { id: 105, courseName: "CA Foundation - Nov 2025 Weekend", batchPrefix: "CAF-Nov25W", stream: "CA", level: "Foundation", enrollment: 150, status: "Active" },
    { id: 501, courseName: "CA Foundation - Apr 2025 Regular", batchPrefix: "CAF-Apr25R", stream: "CA", level: "Foundation", enrollment: 450, status: "Active" },
    { id: 502, courseName: "CA Foundation - Dec 2025 Fast Track", batchPrefix: "CAF-Dec25FT", stream: "CA", level: "Foundation", enrollment: 210, status: "Active" },
    { id: 505, courseName: "CA Foundation - Nov 2025 Weekend", batchPrefix: "CAF-Nov25W", stream: "CA", level: "Foundation", enrollment: 150, status: "Active" },
    
    { id: 103, courseName: "CA Intermediate - Apr 2025 Group 1", batchPrefix: "CAI-Apr25G1", stream: "CA", level: "Intermediate", enrollment: 620, status: "Active" },
    { id: 106, courseName: "CA Intermediate - May 2026 Combined", batchPrefix: "CAI-May26C", stream: "CA", level: "Intermediate", enrollment: 410, status: "Active" },
    
    { id: 201, courseName: "CMA Foundation - Apr 2025 Batch A", batchPrefix: "CMF-Apr25A", stream: "CMA", level: "Foundation", enrollment: 120, status: "Active" },
    { id: 203, courseName: "CMA Intermediate - Apr 2025 Term 1", batchPrefix: "CMI-Apr25T1", stream: "CMA", level: "Intermediate", enrollment: 150, status: "Active" },
    
    { id: 301, courseName: "CA Advanced - May 2025", batchPrefix: "CAA-May25", stream: "CA", level: "Advanced", enrollment: 500, status: "Active" },
];

const COURSE_SUBJECTS = {
    "CA": {
        "Foundation": [
            { id: 1, code: "CFA01", name: "Principles and Practice of Accounting" },
            { id: 2, code: "CFL02", name: "Business Laws and Business Correspondence and Reporting" },
            { id: 3, code: "CFM03", name: "Business Mathematics and Logical Reasoning and Statistics" },
            { id: 4, code: "CFE04", name: "Business Economics and Business and Commercial Knowledge" },
        ],
        "Intermediate": [
            { id: 5, code: "CIA05", name: "Accounting" },
            { id: 6, code: "CIL06", name: "Corporate and Other Laws" },
            { id: 7, code: "CIC07", name: "Cost and Management Accounting" },
            { id: 8, code: "CIT08", name: "Taxation (Direct & Indirect)" },
            { id: 9, code: "CIA09", name: "Advanced Accounting" },
            { id: 10, code: "CIA10", name: "Auditing and Assurance" },
            { id: 11, code: "CIE11", name: "Enterprise Information Systems & Strategic Management" },
            { id: 12, code: "CIF12", name: "Financial Management & Economics for Finance" },
        ],
        "Advanced": [
            { id: 16, code: "CAA16", name: "Financial Reporting" },
            { id: 17, code: "CAS17", name: "Strategic Financial Management" },
            { id: 18, code: "CAA18", name: "Advanced Auditing and Professional Ethics" },
        ]
    },
    "CMA": {
        "Foundation": [
            { id: 13, code: "CMF13", name: "Fundamentals of Business Laws and Ethics" },
            { id: 14, code: "CMF14", name: "Fundamentals of Financial and Cost Accounting" },
            { id: 15, code: "CMF15", name: "Fundamentals of Business Economics and Management" },
        ],
        "Intermediate": [
            { id: 19, code: "CMI19", name: "Corporate Laws & Compliance" },
            { id: 20, code: "CMI20", name: "Cost Accounting" },
            { id: 21, code: "CMI21", name: "Operations Management & Strategic Management" },
        ],
        "Advanced": [
            { id: 22, code: "CMA22", name: "Corporate Financial Reporting" },
            { id: 23, code: "CMA23", name: "Strategic Cost Management" },
        ]
    }
};

// New color variables for colorful grid cards based on index.css colors
const CARD_COLOR_STYLES = [
    { background: 'am_card-color-pink', text: 'am_text-pink-dark' },    // Brand Pink
    { background: 'am_card-color-orange', text: 'am_text-orange-dark' },  // Brand Orange
    { background: 'am_card-color-info', text: 'am_text-info-dark' },      // Info Blue/Teal
    { background: 'am_card-color-success', text: 'am_text-success-dark' }, // Success Green
];

// Replaced DUMMY_ASSIGNMENTS to be mutable (for simulation)
let DUMMY_ASSIGNMENTS = [
    { 
        id: 1, 
        subjectId: 1, 
        assignmentNo: 1, 
        title: "Partnership Accounts Fundamentals & Final Accounts", 
        marks: 50, 
        startDate: "2025-04-10", 
        submitDate: "2025-04-25", 
        submittedCount: 320, 
        status: "Upcoming", 
        fileName: "Assgn-1_Partner_Fund.pdf",
        submissionType: "Online",
        colorId: 0 
    },
    { 
        id: 2, 
        subjectId: 1, 
        assignmentNo: 2, 
        title: "Consignment and Joint Venture Practice Problems", 
        marks: 40, 
        startDate: "2025-05-01", 
        submitDate: "2025-05-15", 
        submittedCount: 290, 
        status: "Completed", 
        fileName: "Assgn-2_Consignment_JV.docx",
        submissionType: "Offline",
        colorId: 1
    },
    { 
        id: 3, 
        subjectId: 2, 
        assignmentNo: 1, 
        title: "Indian Contract Act Case Studies & Theory Questions", 
        marks: 60, 
        startDate: "2025-04-15", 
        submitDate: "2025-04-30", 
        submittedCount: 150, 
        status: "Upcoming", 
        fileName: "Assgn-1_Contract_Law.pdf",
        submissionType: "Online",
        colorId: 2
    },
    { 
        id: 4, 
        subjectId: 2, 
        assignmentNo: 2, 
        title: "Negotiable Instruments Act - MCQs and Short Notes", 
        marks: 30, 
        startDate: "2025-05-05", 
        submitDate: "2025-05-20", 
        submittedCount: 180, 
        status: "Upcoming", 
        fileName: "Assgn-2_NIA_MCQs.pdf",
        submissionType: "Online",
        colorId: 3
    },
    { 
        id: 5, 
        subjectId: 5, 
        assignmentNo: 1, 
        title: "Consolidated Financial Statements & AS-21 Practical", 
        marks: 75, 
        startDate: "2025-03-20", 
        submitDate: "2025-04-10", 
        submittedCount: 550, 
        status: "Completed", 
        fileName: "Assgn-1_CFS_AS21.pdf",
        submissionType: "Offline",
        colorId: 0
    },
    { 
        id: 6, 
        subjectId: 6, 
        assignmentNo: 1, 
        title: "Company Law: Share Capital & Debentures", 
        marks: 50, 
        startDate: "2025-05-25", 
        submitDate: "2025-06-10", 
        submittedCount: 0, 
        status: "Upcoming", 
        fileName: "Assgn-1_Comp_Law.pdf",
        submissionType: "Online",
        colorId: 1
    },
];

const streams = [
    { name: "CA", label: "Chartered Accountancy" },
    { name: "CMA", label: "Cost & Management Accountancy" },
];

const initialLevelOptions = ["Foundation", "Intermediate", "Advanced"];

/**
 * Helper to get subject details 
 */
const getSubjectDetails = (stream, level, subjectId) => {
    // NOTE: Hardcoding 'CA' and 'Foundation' for demonstration since actual state isn't available
    const effectiveStream = stream || "CA"; 
    const effectiveLevel = level || "Foundation";
    const subjects = COURSE_SUBJECTS[effectiveStream]?.[effectiveLevel] || [];
    return subjects.find(sub => sub.id === subjectId) || {};
}

// Helper to format date (to YYYY-MM-DD for input fields)
const formatDate = (dateString, forInput = false) => {
    if (forInput) {
        return dateString;
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// ... (generateFileContent and handleFileAction remain the same) ...

/**
 * Helper function to generate dummy file content (simulating PDF/DOCX)
 */
const generateFileContent = (assignment) => {
    const tempStream = "CA"; 
    const tempLevel = "Foundation";
    
    const subject = getSubjectDetails(tempStream, tempLevel, assignment.subjectId).name || 'Unknown Subject';
    const subjectCode = getSubjectDetails(tempStream, tempLevel, assignment.subjectId).code || 'N/A';
    
    const content = `
# Assignment Paper: ${assignment.title}

## Subject: ${subject} (${subjectCode})
| Metric | Details |
|---|---|
| Assignment No. | ${assignment.assignmentNo} |
| Total Marks | ${assignment.marks} |
| Submission Deadline | ${formatDate(assignment.submitDate, true)} |

---
// ... (rest of the dummy content)
This document is a **simulated assignment paper** designed for demonstration purposes.
`;

    const extension = assignment.fileName.split('.').pop().toLowerCase();
    let mimeType = 'text/plain';

    if (extension === 'pdf') {
        mimeType = 'application/pdf';
        return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    } else if (extension === 'docx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return new Blob([content], { type: mimeType });
    } else {
        return new Blob([content], { type: 'text/plain' });
    }
};

/**
 * Function to handle file view/download
 */
const handleFileAction = (assignment, actionType) => {
    const fileContent = generateFileContent(assignment);

    if (actionType === 'view') {
        const url = (typeof fileContent === 'string' && fileContent.startsWith('data:')) 
                    ? fileContent 
                    : URL.createObjectURL(fileContent);

        window.open(url, '_blank');
        
        if (typeof fileContent !== 'string') {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }

    } else if (actionType === 'download') {
        const url = URL.createObjectURL(fileContent);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', assignment.fileName); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); 
    }
};

// ... (BatchDisplay and SubjectDisplay components remain the same) ...
const BatchDisplay = ({ batches, stream, level, selectedBatchId, onBatchSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const sliderRef = useRef(null);
    const filteredBatches = batches.filter(batch =>
        batch.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batchPrefix.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleScroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 300;
            sliderRef.current.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
        }
    };
    return (
        <div className="am_detail-panel-container am_full-width-panel">
            <div className="am_detail-panel-content">
                <div className="am_batch-controls-header">
                    <h4 className="am_detail-header am_header-in-row">Batches for: **{stream}** {level} Level</h4>
                    <div className="am_search-bar am_batch-search-bar">
                        <FiSearch className="am_search-icon" size={18} />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search Batch Name or Prefix..." />
                        {searchTerm && (<FiX className="am_clear-icon" onClick={() => setSearchTerm("")} size={18} />)}
                    </div>
                </div>
                {filteredBatches.length === 0 ? (<p className="am_no-results">{batches.length > 0 ? `No batches found matching "${searchTerm}".` : `No batches currently defined for ${stream} ${level}.`}</p>) : (
                    <div className="am_batch-slider-wrapper">
                        <button className="am_slider-nav-btn am_slider-nav-left" onClick={() => handleScroll('left')} aria-label="Scroll Batches Left"><FiArrowLeft size={20} /></button>
                        <div className="am_batch-slider" ref={sliderRef}>
                            {filteredBatches.map(batch => (
                                <div key={batch.id} className={`am_batch-card ${selectedBatchId === batch.id ? 'am_subject-card-selected' : ''}`} onClick={() => onBatchSelect(batch.id)}>
                                    {selectedBatchId === batch.id && (<div className="am_batch-check-icon-overlay"><FiCheckCircle size={24} /></div>)}
                                    <p className="am_batch-prefix">{batch.batchPrefix}</p>
                                    <h5 className="am_batch-name">{batch.courseName}</h5>
                                    <div className="am_batch-meta">
                                        <span className={`am_batch-status am_status-${batch.status.toLowerCase()}`}><FiZap size={12} /> {batch.status}</span>
                                        <span className="am_batch-enrollment"><FiCalendar size={12} /> {batch.enrollment} <span className="am_enrollment-label">Students</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="am_slider-nav-btn am_slider-nav-right" onClick={() => handleScroll('right')} aria-label="Scroll Batches Right"><FiArrowRight size={20} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SubjectDisplay = ({ subjects, stream, level, selectedSubjectId, onSubjectSelect }) => {
    return (
        <div className="am_detail-panel-container am_full-width-panel am_subject-panel">
            <div className="am_subject-card-grid">
                {subjects.map(subject => (
                    <div
                        key={subject.id}
                        className={`am_subject-card ${selectedSubjectId === subject.id ? 'am_batch-card-selected' : ''}`}
                        onClick={() => onSubjectSelect(subject.id)}
                    >
                        {selectedSubjectId === subject.id && (
                             <FiCheckCircle className="am_subject-check-icon-grid" size={24} /> 
                        )}
                        <h5 className="am_subject-name">{subject.name}</h5>
                        <div className="am_subject-meta">
                            <FiBookOpen size={12} /> <span className="am_subject-level-detail">{stream} - {level} Level</span>
                            <span className="am_subject-code">({subject.code})</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


/**
 * NEW COMPONENT: Assignment Display for Selected Subject (OVERHAULED UI)
 * NOTE: Corrected the prop destructuring error here.
 */
const AssignmentDisplay = ({ 
    assignments, 
    userRole,
    subjectDetails, 
    onAddAssignment, 
    onEditAssignment, 
    viewingSubmissionFor, // 泊 FIX APPLIED: Separated from onEditAssignment
    onViewSubmissions 
}) => {
    const [viewMode, setViewMode] = useState("table"); // 'grid' or 'table'
    const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'completed'
    const [searchTerm, setSearchTerm] = useState("");
    
    const subjectName = subjectDetails.name || "Selected Subject";
    
    const filteredAssignments = assignments
        .filter(assignment => filter === 'all' || assignment.status.toLowerCase() === filter)
        .filter(assignment => 
            assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            assignment.assignmentNo.toString().includes(searchTerm.toLowerCase())
        );

    // This variable now correctly references the prop, which is defined in the destructuring above.
    const isSubmissionViewActive = viewingSubmissionFor !== null;

    // Helper to get status class
    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'upcoming': return 'am_status-upcoming';
            case 'completed': return 'am_status-completed';
            default: return '';
        }
    };
    
    // Helper to get file icon and its color class
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(extension)) return { icon: <FiFileText size={16} />, colorClass: 'text-error' };
        if (['docx', 'doc'].includes(extension)) return { icon: <FiFileText size={16} />, colorClass: 'text-info' };
        if (['zip', 'rar'].includes(extension)) return { icon: <FiLayers size={16} />, colorClass: 'text-warning' };
        return { icon: <FiFileText size={16} />, colorClass: 'text-gray-700' };
    };


    // --- Grid View Render (New UI) ---
    // const renderGridView = () => (
    //     <div className="am_assignment-grid">
    //         {filteredAssignments.length === 0 ? (
    //              <p className="am_no-results-grid">No assignments found matching the current filters/search.</p>
    //         ) : (
    //             filteredAssignments.map(item => {
    //                 const colorStyle = CARD_COLOR_STYLES[item.colorId % CARD_COLOR_STYLES.length];
    //                 const fileInfo = getFileIcon(item.fileName);

    //                 return (
    //                     <div key={item.id} className={`am_assignment-card`}>
    //                         <div className={`am_card-color-strip ${colorStyle.background.replace('am_card-color-', 'am_strip-color-')}`}></div>
                            
    //                         <div className="am_card-content-area">
    //                             <div className="am_card-header">
    //                                 <span className="am_card-badge">Assgn **#{item.assignmentNo}**</span>
    //                                 <span className={`am_status-badge ${getStatusClass(item.status)}`}>
    //                                     {item.status === 'Upcoming' ? <FiClock size={12} /> : <FiCheckSquare size={12} />} 
    //                                     {item.status}
    //                                 </span>
    //                             </div>

    //                             <h5 className="am_assignment-title">{item.title}</h5>

    //                             <div className="am_card-details">
    //                                 <p className="am_card-info"><FiCalendar size={14} /> Due Date: **{formatDate(item.submitDate)}**</p>
    //                                 <p className="am_card-info"><FiAlertCircle size={14} /> Total Marks: **{item.marks}**</p>
    //                                 <p className="am_card-info"><FiUpload size={14} /> Submission Type: **{item.submissionType}**</p>
    //                             </div>
                                
    //                             {/* File Info Bar */}
    //                             <div className={`am_file-info-bar ${fileInfo.colorClass}`}>
    //                                  {fileInfo.icon} <span className="am_file-name-text">{item.fileName}</span>
    //                             </div>
    //                         </div>
                            
    //                         {/* Actions Footer */}
    //                         <div className="am_card-actions am_card-actions-grid">
    //                             {/* View Submissions (Grid View) */}
    //                             <button
    //                                 className="btn btn-icon btn-sm am_action-btn-secondary"
    //                                 title="View Submissions"
    //                                 onClick={() => onViewSubmissions(item)} 
    //                                 disabled={isSubmissionViewActive && viewingSubmissionFor.id !== item.id}
    //                             >
    //                                 <FiLayers size={16} /> <span className="am_action-label">{item.submittedCount} Submissions</span>
    //                             </button>
                                
    //                             <button 
    //                                 className="btn btn-icon btn-sm am_action-btn-primary" 
    //                                 title="View File in New Tab"
    //                                 onClick={() => handleFileAction(item, 'view')}
    //                             >
    //                                 <FiMaximize2 size={16} /> <span className="am_action-label">View</span>
    //                             </button>
    //                             <button 
    //                                 className="btn btn-icon btn-sm am_action-btn-primary" 
    //                                 title="Download File"
    //                                 onClick={() => handleFileAction(item, 'download')}
    //                             >
    //                                 <FiDownload size={16} /> <span className="am_action-label">Download</span>
    //                             </button>
    //                             <button 
    //                                 className="btn btn-icon btn-sm" 
    //                                 title="Edit Assignment"
    //                                 onClick={() => onEditAssignment(item)} // OPEN MODAL
    //                                 disabled={isSubmissionViewActive}
    //                             >
    //                                 <FiEdit size={16} />
    //                             </button>
    //                             <button 
    //                                 className="btn btn-icon btn-sm am_action-delete" 
    //                                 title="Delete Assignment"
    //                                 disabled={isSubmissionViewActive}
    //                             >
    //                                 <FiTrash2 size={16} />
    //                             </button>
    //                         </div>
    //                     </div>
    //                 );
    //             })
    //         )}
    //     </div>
    // );





    const renderGridView = ({userRole}) => (
    <div className="am_assignment-grid">
        {filteredAssignments.length === 0 ? (
            <p className="am_no-results-grid">No assignments found matching the current filters/search.</p>
        ) : (
            filteredAssignments.map(item => {
                const colorStyle = CARD_COLOR_STYLES[item.colorId % CARD_COLOR_STYLES.length];
                const fileInfo = getFileIcon(item.fileName);

                return (
                    <div key={item.id} className="am_file-card-new"> {/* New card class */}
                        {/* Status and Assignment No. in Top Right/Left Corners */}
                        <div className="am_file-card-header-new">
                            <span className="am_card-badge">Assgn **#{item.assignmentNo}**</span>
                            <span className={`am_status-badge ${getStatusClass(item.status)}`}>
                                {item.status === 'Upcoming' ? <FiClock size={12} /> : <FiCheckSquare size={12} />} 
                                {item.status}
                            </span>
                        </div>

                        {/* Large File Icon and Assignment Name (New Focus Area) */}
                        <div className="am_file-card-main-content">
                            <div className={`am_large-file-icon-wrapper ${fileInfo.colorClass}`}>
                                {React.cloneElement(fileInfo.icon, { size: 48 })} {/* Larger Icon */}
                            </div>
                            <h5 className="am_file-card-title">{item.title}</h5>
                        </div>

                        {/* Details Section (Separated by a border/line) */}
                        <div className="am_file-card-details-footer">
                            <p className="am_card-info"><FiCalendar size={14} /> Due: **{formatDate(item.submitDate)}**</p>
                            <p className="am_card-info"><FiAlertCircle size={14} /> Marks: **{item.marks}**</p>
                            <p className="am_card-info"><FiUpload size={14} /> Type: **{item.submissionType}**</p>
                        </div>

                        {/* Actions Footer (Condensed Icons) */}
                        <div className="am_card-actions am_file-card-actions-new">
                            <button
                                className="btn btn-icon btn-sm am_action-btn-secondary"
                                title={`${item.submittedCount} Submissions`}
                                onClick={() => onViewSubmissions(item)} 
                                disabled={isSubmissionViewActive && viewingSubmissionFor.id !== item.id}
                            >
                                <FiLayers size={16} /> <span>{item.submittedCount}</span>
                            </button>
                            <button 
                                className="btn btn-icon btn-sm am_action-btn-primary" 
                                title="View File"
                                onClick={() => handleFileAction(item, 'view')}
                            >
                                <FiEye size={16} />
                            </button>
                            <button 
                                className="btn btn-icon btn-sm" 
                                title="Edit"
                                onClick={() => onEditAssignment(item)}
                                disabled={isSubmissionViewActive}
                            >
                                <FiEdit size={16} />
                            </button>
                            <button 
                                className="btn btn-icon btn-sm am_action-delete" 
                                title="Delete"
                                disabled={isSubmissionViewActive}
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })
        )}
    </div>
);
    // --- Table View Render (Updated to remove Subject/Code) ---
    const renderTableView = ({userRole}) => (
        <div className="am_assignment-table-wrapper">
             {filteredAssignments.length === 0 ? (
                <p className="am_no-results-table">No assignments found matching the current filters/search.</p>
            ) : (
                <table className="am_assignment-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Assignment Title</th>
                            <th>Due Date</th>
                            <th>Marks</th>
                            <th>Sub. Type</th>
                            <th>Submitted</th>
                            <th>File</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map(item => {
                            const fileInfo = getFileIcon(item.fileName);
                            return (
                                <tr key={item.id}>
                                    <td>{item.assignmentNo}</td>
                                    <td>{item.title}</td>
                                    <td>**{formatDate(item.submitDate)}**</td>
                                    <td>**{item.marks}**</td>
                                    <td>{item.submissionType}</td>
                                    <td>
                                        <div className="am_view-submisiion-flex">
                                            <button
                                                className="am_view_sumbission-btn"
                                                title="View Submissions"
                                                onClick={() => onViewSubmissions(item)} // 泊 CALLS THE NEW HANDLER
                                                disabled={isSubmissionViewActive && viewingSubmissionFor.id !== item.id}
                                            >
                                                <FiLayers size={16} /> 
                                                View
                                            </button>
                                             {item.submittedCount}
                                        </div>
                                       </td>
                                    <td >
                                        <div className={`am_file-cell ${fileInfo.colorClass}`}>
                                            {fileInfo.icon} {item.fileName}
                                        </div>
                                        
                                    </td>
                                    <td >
                                        <div className="am_action-cell">
                                        <button 
                                            className="btn btn-icon btn-sm" 
                                            title="View File"
                                            onClick={() => handleFileAction(item, 'view')}
                                            disabled={isSubmissionViewActive}
                                        >
                                            <FiMaximize2 size={16} />
                                        </button>
                                        <button 
                                            className="btn btn-icon btn-sm" 
                                            title="Download File"
                                            onClick={() => handleFileAction(item, 'download')}
                                            disabled={isSubmissionViewActive}
                                        >
                                            <FiDownload size={16} />
                                        </button>
                                        <button 
                                            className="btn btn-icon btn-sm" 
                                            title="Edit Assignment"
                                            onClick={() => onEditAssignment(item)} // OPEN MODAL
                                            disabled={isSubmissionViewActive}
                                        >
                                            <FiEdit size={16} />
                                        </button>
                                        <button 
                                            className="btn btn-icon btn-sm am_action-delete" 
                                            title="Delete Assignment"
                                            disabled={isSubmissionViewActive}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );


    return (
        <div className="am_detail-panel-container am_full-width-panel am_assignment-panel">
            <h4 className="am_detail-header am_header-in-row am_assignment-panel-title">
                Assignments for: {subjectName}
            </h4>
            <div className="am_assignment-controls">
                
                {/* Search Bar */}
                <div className="am_search-bar am_assignment-search-bar">
                    <FiSearch className="am_search-icon" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Assignment Title or No..."
                        disabled={isSubmissionViewActive}
                    />
                    {searchTerm && (
                        <FiX className="am_clear-icon" onClick={() => setSearchTerm("")} size={18} />
                    )}
                </div>

                {/* Filter and View Controls and ADD BUTTON */}
                <div className="am_control-group">

                    { userRole !== "Student" && (<button 
                        className="btn btn-primary btn-sm am_add-assignment-btn"
                        onClick={() => onAddAssignment()} // OPEN MODAL for ADD
                        disabled={isSubmissionViewActive}
                    >
                        <FiPlus size={16} /> Add Assignment
                    </button>)}

                    {/* Filter Dropdown/Buttons */}
                    <div className="am_filter-buttons">
                        <button 
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setFilter("all")}
                            disabled={isSubmissionViewActive}
                        >
                            All
                        </button>
                        <button 
                            className={`btn btn-sm ${filter === 'upcoming' ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => setFilter("upcoming")}
                            disabled={isSubmissionViewActive}
                        >
                            Upcoming
                        </button>
                        <button 
                            className={`btn btn-sm ${filter === 'completed' ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => setFilter("completed")}
                            disabled={isSubmissionViewActive}
                        >
                            Completed
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="am_view-toggle">
                        <button 
                            className={`btn btn-icon btn-sm ${viewMode === 'table' ? 'selected-view' : ''}`}
                            onClick={() => setViewMode("table")}
                            title="Table View"
                            disabled={isSubmissionViewActive}
                        >
                            <FiGrid size={18} />
                        </button>
                        <button 
                            className={`btn btn-icon btn-sm ${viewMode === 'grid' ? 'selected-view' : ''}`}
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                            disabled={isSubmissionViewActive}
                        >
                            <FiList size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Assignment Content Display */}
            <div className="am_assignment-content">
                {viewMode === 'grid' ? renderGridView({userRole}) : renderTableView({userRole})}
            </div>
        </div>
    );
};


/**
 * NEW COMPONENT: Assignment Form Modal
 */
const AssignmentFormModal = ({ isOpen, onClose, context, initialData, onSubmit }) => {
    
    const isEditMode = initialData !== null;

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        submitDate: '',
        marks: '',
        submissionType: 'Online',
        documentFile: null,
        documentFileName: '',
    });
    
    // Set initial data when modal opens or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title || '',
                startDate: formatDate(initialData.startDate, true) || '',
                submitDate: formatDate(initialData.submitDate, true) || '',
                marks: initialData.marks || '',
                submissionType: initialData.submissionType || 'Online',
                documentFile: null, // Always reset file upload input
                documentFileName: initialData.fileName || '', // Display existing file name
            });
        } else if (isOpen && !initialData) {
             setFormData({
                title: '',
                startDate: '',
                submitDate: '',
                marks: '',
                submissionType: 'Online',
                documentFile: null,
                documentFileName: '',
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ 
            ...prev, 
            documentFile: file,
            documentFileName: file ? file.name : ''
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send formData to an API
        console.log("Submitting Assignment:", { ...formData, context, isEditMode });
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="am_form-modal-overlay">
            <div className="am_form-modal-container">
                <div className="am_form-modal-header">
                    <h3>{isEditMode ? 'Edit Assignment' : 'Create New Assignment'}</h3>
                    <button className="am_form-modal-close" onClick={onClose} aria-label="Close Modal"><FiX size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Non-Editable Context Fields */}
                    <div className="am_form-modal-context-bar">
                        {/* <span className="am_context-badge am_context-stream" title="Selected Stream">{context.courseName}</span> */}
                        <span className="am_context-badge am_context-batch" title="Selected Batch">{context.batchPrefix} - {context.batchName}</span>
                        <span className="am_context-badge am_context-subject" title="Selected Subject">{context.subjectName} ({context.subjectCode})</span>
                    </div>

                    {/* Editable Fields */}
                    <div className="am_form-modal-body">
                        
                        <div className="am_form-group am_full-width">
                            <label htmlFor="title">Assignment Title / Name <span className="am_required-star">*</span></label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Partnership Accounts Final Problems Set 1"
                                required
                            />
                        </div>

                        <div className="am_form-group">
                            <label htmlFor="marks">Total Marks <span className="am_required-star">*</span></label>
                            <input
                                id="marks"
                                name="marks"
                                type="number"
                                value={formData.marks}
                                onChange={handleChange}
                                placeholder="E.g., 50"
                                required
                            />
                        </div>

                        <div className="am_form-group">
                            <label htmlFor="startDate">Start Date</label>
                            <input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="am_form-group">
                            <label htmlFor="submitDate">Submission Deadline <span className="am_required-star">*</span></label>
                            <input
                                id="submitDate"
                                name="submitDate"
                                type="date"
                                value={formData.submitDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        {/* File Upload (Using the requested file upload style) */}
                        <div className="am_form-group am_full-width">
                            <label htmlFor="documentFile">Assignment Document (PDF/DOCX) <span className="am_required-star">*</span></label>
                            <div className="am_file-upload-container">
                                <input
                                    type="file"
                                    id="documentFile"
                                    name="documentFile"
                                    onChange={handleFileChange}
                                    className="am_file-upload-input"
                                    required={!isEditMode || !formData.documentFileName} // Required only if adding or editing without an existing file
                                />
                                <label htmlFor="documentFile" className="am_file-upload-label">
                                    <FiUploadCloud size={24} className="am_upload-icon" />
                                    <span className="am_upload-text">
                                        {formData.documentFileName ? (
                                            <>File Selected: <strong>{formData.documentFileName}</strong>. Click to change.</>
                                        ) : (
                                            <>Drag & Drop or <strong>Click to Upload</strong> Assignment File</>
                                        )}
                                    </span>
                                </label>
                            </div>
                            {(isEditMode && formData.documentFileName && !formData.documentFile) && (
                                <p className="am_existing-file-info"><FiPaperclip size={14} /> Current file: {formData.documentFileName} (Will be replaced if a new file is uploaded)</p>
                            )}
                        </div>

                        {/* Submission Type Radio Group */}
                        <div className="am_form-group am_full-width am_radio-group">
                            <label>Submission Type <span className="am_required-star">*</span></label>
                            <div className="am_radio-options">
                                <label className="am_radio-label">
                                    <input
                                        type="radio"
                                        name="submissionType"
                                        value="Online"
                                        checked={formData.submissionType === 'Online'}
                                        onChange={handleChange}
                                    />
                                    Online Submission (LMS Upload)
                                </label>
                                <label className="am_radio-label">
                                    <input
                                        type="radio"
                                        name="submissionType"
                                        value="Offline"
                                        checked={formData.submissionType === 'Offline'}
                                        onChange={handleChange}
                                    />
                                    Offline Submission (Classroom Only)
                                </label>
                            </div>
                        </div>

                    </div>
                    
                    {/* Form Actions */}
                    <div className="am_form-modal-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            <FiX size={18} /> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <FiSave size={18} /> {isEditMode ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


/**
 * Main Assignment Management Component (Used to control state/flow and modal)
 */
const AssignmentManagement = ({userRole}) => {
    // MODIFIED: Initialize selections to null/empty string for step-by-step display
    const getInitialSubject = () => {
            // Only set it to userRole if it's 'Teacher', otherwise start as null.
            return (userRole === 'Teacher' ) ? 2 : null;
            
        };
        const getInitialStream   = () => {
            // Only set it to userRole if it's 'Teacher', otherwise start as null.
            return (userRole === 'Teacher' || userRole === 'Student')? "CA" : null;
    
        };
        const getInitialCourse   = () => {
            // Only set it to userRole if it's 'Teacher', otherwise start as null.
            return (userRole === 'Teacher' || userRole === 'Student') ? "Foundation" : null;
    
        };
        const getInitialBatch   = () => {
            // Only set it to userRole if it's 'Teacher', otherwise start as null.
            return (userRole === 'Teacher' || userRole === 'Student') ? 101 : null;
    
        };
    
    const [selectedStream, setSelectedStream] = useState(getInitialStream); 
    const [selectedLevel, setSelectedLevel] = useState(getInitialCourse); 
    const [selectedBatchId, setSelectedBatchId] = useState(getInitialBatch); 
    const [selectedSubjectId, setSelectedSubjectId] = useState(getInitialSubject); 
    
    // NEW MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null); // Assignment object for editing, or null for adding
    // 泊 FIX: STATE DEFINITION IS CORRECT
    const [viewingSubmissionFor, setViewingSubmissionFor] = useState(null);
    
    // NEW REFS FOR AUTO-SCROLL
    const levelRef = useRef(null);
    const batchRef = useRef(null);
    const subjectRef = useRef(null);
    const assignmentRef = useRef(null);
    // NEW REF: For ViewSubmission component
    const submissionViewRef = useRef(null);
    
    // EFFECT 1: SCROLL TO TOP ON COMPONENT MOUNT/NAVIGATION
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    // EFFECT 2: SCROLL TO LEVEL (STEP 2) WHEN STREAM IS SELECTED
    useEffect(() => {
        if (selectedStream && levelRef.current) {
            levelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedStream]);

    // EFFECT 3: SCROLL TO BATCH (STEP 3) WHEN LEVEL IS SELECTED
    useEffect(() => {
        if (selectedLevel && batchRef.current) {
            batchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedLevel]);
    
    // EFFECT 4: SCROLL TO SUBJECT (STEP 4) WHEN BATCH IS SELECTED
    useEffect(() => {
        if (selectedBatchId && subjectRef.current) {
            subjectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedBatchId]);
    
    // EFFECT 5: SCROLL TO ASSIGNMENT (STEP 5) WHEN SUBJECT IS SELECTED
    useEffect(() => {
        if (selectedSubjectId && assignmentRef.current) {
            assignmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedSubjectId]);
    
    // EFFECT 6: SCROLL TO VIEW SUBMISSION WHEN IT OPENS 
    // This is the new logic to scroll when the submission panel is activated
    useEffect(() => {
        if (viewingSubmissionFor && submissionViewRef.current) {
            submissionViewRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [viewingSubmissionFor]);

    // ... (Navigation handlers remain the same) ...
    const handleStreamClick = (stream) => {
        // Reset subsequent selections when stream changes
        setSelectedStream(stream);
        setSelectedLevel(null); 
        setSelectedBatchId(null);
        setSelectedSubjectId(null);
        setViewingSubmissionFor(null); // Reset submission view on stream change
    };
    
    const handleViewSubmissions = (assignment) => {
        if (viewingSubmissionFor && viewingSubmissionFor.id === assignment.id) {
            setViewingSubmissionFor(null); // Close view
            // No scroll needed here, as the component will disappear and EFF 5 will handle scrolling to Step 5 if subject is still selected
        } else {
            const currentBatch = DUMMY_BATCHES.find(b => b.id === selectedBatchId);
            const currentSubjectDetails = getSubjectDetails(selectedStream, selectedLevel, assignment.subjectId);

            const submissionContext = {
                id: assignment.id, // This is the crucial filter parameter for ViewSubmission.jsx
                stream: selectedStream,
                level: selectedLevel,
                batchName: currentBatch?.courseName || 'N/A',
                subjectName: currentSubjectDetails?.name || 'N/A',
                assignmentTitle: assignment.title,
            };
            setViewingSubmissionFor(submissionContext); // Open view
            // The useEffect (EFF 6) above handles the scroll after this state update.
        }
    };
    
    const handleLevelClick = (level) => {
        // Reset subsequent selections when level changes
        setSelectedLevel(level);
        setSelectedBatchId(null);
        setSelectedSubjectId(null);
        setViewingSubmissionFor(null); // Reset submission view on level change
    };
    
    const handleBatchSelect = (batchId) => {
        // Toggle batch selection, reset subject if deselected or new batch selected
        setSelectedBatchId(prevId => {
            if (prevId === batchId) {
                setSelectedSubjectId(null); // Deselect subject if batch is deselected
                setViewingSubmissionFor(null); // Reset submission view
                return null;
            } else {
                setSelectedSubjectId(null); // Deselect subject when a new batch is selected
                setViewingSubmissionFor(null); // Reset submission view
                return batchId;
            }
        });
    };

    const handleSubjectSelect = (subjectId) => {
        // Toggle subject selection
        setSelectedSubjectId(prevId => (prevId === subjectId ? null : subjectId));
        setViewingSubmissionFor(null); // Reset submission view when changing subject
    };
    
    // NEW MODAL HANDLERS
    const handleOpenModal = (assignment = null) => {
        setAssignmentToEdit(assignment); // null for add, object for edit
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setAssignmentToEdit(null); // Clear data when closing
    };
    
    // Placeholder for form submission (simulates save)
    const handleAssignmentSubmit = (formData) => {
        // Find if this is an existing assignment
        if (assignmentToEdit) {
            console.log(`Updating Assignment ID ${assignmentToEdit.id}`);
            // In a real app, you'd update DUMMY_ASSIGNMENTS state/API
        } else {
            console.log("Adding New Assignment");
             // Simulate adding a new one
            const newId = DUMMY_ASSIGNMENTS.length + 1;
            const newAssignment = {
                id: newId,
                subjectId: selectedSubjectId,
                assignmentNo: newId, 
                title: formData.title, 
                marks: parseInt(formData.marks, 10), 
                startDate: formData.startDate, 
                submitDate: formData.submitDate, 
                submittedCount: 0, 
                status: "Upcoming", 
                fileName: formData.documentFileName,
                submissionType: formData.submissionType,
                colorId: newId % CARD_COLOR_STYLES.length,
            };
            DUMMY_ASSIGNMENTS.push(newAssignment); // Mutate for demo, use state setter in real app
        }
    };
    

    // Filter batches and get subject details - only run if stream/level are selected
    const batchesToDisplay = (selectedStream && selectedLevel) ? 
        DUMMY_BATCHES.filter(batch => 
            batch.stream === selectedStream && batch.level === selectedLevel
        ) : [];
        
    const subjectsToDisplay = (selectedStream && selectedLevel && selectedBatchId) 
        ? COURSE_SUBJECTS[selectedStream]?.[selectedLevel] || []
        : [];

    const currentSubjectDetails = selectedSubjectId
        ? getSubjectDetails(selectedStream, selectedLevel, selectedSubjectId)
        : {};
        
    const assignmentsForSubject = selectedSubjectId
        ? DUMMY_ASSIGNMENTS.filter(a => a.subjectId === selectedSubjectId)
        : [];
    
    // Build Context for Modal (Non-editable fields)
    const currentBatchDetails = DUMMY_BATCHES.find(b => b.id === selectedBatchId);
    const modalContext = {
        stream: selectedStream || 'N/A',
        level: selectedLevel || 'N/A',
        batchName: currentBatchDetails?.courseName || 'N/A',
        batchPrefix: currentBatchDetails?.batchPrefix || 'N/A',
        subjectName: currentSubjectDetails?.name || 'N/A',
        subjectCode: currentSubjectDetails?.code || 'N/A',
    };


    // Assignment.jsx (Inside the AssignmentManagement component)

return (
    <div className="am_wrapper">
        <div className="am_header">
            <h1 className="am_page-title">Assignment Management</h1>
        </div>

        {userRole !== "Teacher" && userRole !== "Student" && (
        <div className="am_stream-nav">
            <h3 className="am_section-title">Streams</h3>
            <div className="am_stream-nav-container">
                <div className="am_stream-nav-flex">
                    {streams.map((stream) => (
                        <div
                            key={stream.name}
                            className={`am_nav-card ${selectedStream === stream.name ? "selected" : ""}`}
                            onClick={() => handleStreamClick(stream.name)}
                        >
                            <FiBookOpen size={28} />
                            <h3>{stream.name}</h3>
                            <p>{stream.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        )}

        
                {/* Ref added here */}
                {selectedStream && userRole !== "Teacher" && userRole !== "Student" && (
                    <div className="am_level-nav" ref={levelRef}>
                        <h3 className="am_section-title">Courses</h3>
                        <div className="am_flex">
                            {initialLevelOptions.map((level) => (
                                <div
                                    key={level}
                                    className={`am_nav-card ${selectedLevel === level ? "selected_sec" : ""}`}
                                    onClick={() => handleLevelClick(level)}
                                >
                                    <h3>{level}</h3>
                                    <p>View {level} Batches</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {selectedLevel && userRole !== "Teacher" && userRole !== "Student" && (
                    <div className="am_batch-view-section" ref={batchRef}>
                        <h3 className="am_section-title am_section-title-no-border am_bottom-border-section">
                            Batches
                        </h3>
                        
                        <BatchDisplay 
                            batches={batchesToDisplay} 
                            stream={selectedStream}
                            level={selectedLevel}
                            selectedBatchId={selectedBatchId}
                            onBatchSelect={handleBatchSelect}
                        />
                    </div>
                )}
                {selectedBatchId && userRole !== "Teacher" && (
                    <div className="am_subject-view-section" ref={subjectRef}>
                        <h3 className="am_section-title am_section-title-no-border am_bottom-border-section">
                            Subjects
                        </h3>
                        
                        <SubjectDisplay
                            subjects={subjectsToDisplay}
                            stream={selectedStream}
                            level={selectedLevel}
                            selectedSubjectId={selectedSubjectId}
                            onSubjectSelect={handleSubjectSelect}
                        />
                    </div>
                )}
                {selectedSubjectId && (
                    <div className="am_assignment-view-section" ref={assignmentRef}>
                        <h3 className="am_section-title am_section-title-no-border am_bottom-border-section">
                            Assignments
                        </h3>
                        <AssignmentDisplay
                            assignments={assignmentsForSubject}
                            subjectDetails={currentSubjectDetails}
                            onAddAssignment={() => handleOpenModal(null)}
                            userRole={userRole}
                            onEditAssignment={handleOpenModal}
                            viewingSubmissionFor={viewingSubmissionFor} 
                            onViewSubmissions={handleViewSubmissions}
                        />
                    </div>
                )}
            
        
        
        {/* NEW: Assignment Form Modal - Conditional on modal state (Always rendered at the root) */}
        {isModalOpen && (
            <AssignmentFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                context={modalContext}
                initialData={assignmentToEdit}
                onSubmit={handleAssignmentSubmit}
            />
        )}

        {viewingSubmissionFor &&
        <div className="am_detail-panel-container">
            <div ref={submissionViewRef} className="am_view-submission-wrapper">
                <ViewSubmission
                    stream={viewingSubmissionFor.stream}
                    user={userRole}
                    level={viewingSubmissionFor.level}
                    batchName={viewingSubmissionFor.batchName}
                    subjectName={viewingSubmissionFor.subjectName}
                    assignmentId={viewingSubmissionFor.id} // This is the crucial filter key
                    assignmentTitle={viewingSubmissionFor.assignmentTitle}
                    onClose={() => setViewingSubmissionFor(null)} // Allows the user to go back to Step 5
                />
            </div>
        </div>
        }
    </div>
);
};

export default AssignmentManagement;