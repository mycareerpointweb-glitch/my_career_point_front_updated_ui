import React, { useState, useEffect } from "react";
import { 
    FiSearch, FiX, FiCheckCircle, FiAlertCircle, FiPaperclip, FiArrowLeft
} from "react-icons/fi";
import "../../../Styles/SuperAdmin/Assignment.css"; 

// --- DUMMY DATA STRUCTURES (Provided by User for Context) ---
// DUMMY_BATCHES, COURSE_SUBJECTS, DUMMY_SUBMISSIONS_DATA are assumed to be available
// ... (The DUMMY data remains the same) ...

const DUMMY_SUBMISSIONS_DATA = [
    // ASSIGNMENT ID 1 (CA Foundation / CFA01)
    { assignmentId: 1, studentId: 9001, studentName: "Aman Sharma", file: "Aman_A1_Acc_Final.pdf", marks: 45, submittedDate: "2025-04-25", validated: true },
    { assignmentId: 1, studentId: 9002, studentName: "Bhavna Singh", file: "Bhavna_A1_Acc_V1.docx", marks: null, submittedDate: "2025-04-26", validated: false }, // <-- Target Student
    
    // ASSIGNMENT ID 2 (CA Foundation / CFL02)
    { assignmentId: 2, studentId: 9004, studentName: "Deepak Verma", file: "Deepak_A2_Law_Case.pdf", marks: 32, submittedDate: "2025-05-14", validated: true },
    { assignmentId: 2, studentId: 9005, studentName: "Esha Gupta", file: "Esha_A2_Law_Draft.pdf", marks: null, submittedDate: "2025-05-15", validated: false },
    
    // ASSIGNMENT ID 5 (CA Intermediate / CIA05)
    { assignmentId: 5, studentId: 9101, studentName: "Gaurav Kohli", file: "Gaurav_A5_InterAcc.docx", marks: 65, submittedDate: "2025-03-20", validated: true },
    { assignmentId: 5, studentId: 9102, studentName: "Hitesh Jain", file: "Hitesh_A5_InterAcc.pdf", marks: 58, submittedDate: "2025-03-21", validated: true },

    // ASSIGNMENT ID 13 (CMA Foundation / CMF13)
    { assignmentId: 13, studentId: 9201, studentName: "Ira Khan", file: "Ira_A13_CMA_Law.pdf", marks: 40, submittedDate: "2025-04-10", validated: true },
    { assignmentId: 13, studentId: 9202, studentName: "Jatin Malik", file: "Jatin_A13_CMA_Law.pdf", marks: 35, submittedDate: "2025-04-11", validated: true },
    
    // ASSIGNMENT ID 16 (CA Advanced / CAA16)
    { assignmentId: 16, studentId: 9301, studentName: "Karan Iyer", file: "Karan_A16_AdvRep.pdf", marks: 80, submittedDate: "2025-05-10", validated: true },
];
// --- END DUMMY DATA ---

const ViewSubmission = ({ stream, level, batchName, subjectName, assignmentId, assignmentTitle, onClose, user }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const MAX_MARKS = 50; // Placeholder Max Marks
    
    // 1. Determine if the current user is a student
    const isStudent = user === 'Student';
    const studentId = 9001; // Assuming user.id holds the student's ID

    // 2. Initial Filter: Filter by assignment ID first
    // Note: The original submission data does not have an assignment ID for all students in a batch,
    // so this component only shows submissions *that exist* for the given assignment ID.
    let currentAssignmentSubmissions = DUMMY_SUBMISSIONS_DATA.filter(
        sub => sub.assignmentId === assignmentId
    );

    // 3. User-Role Filter: If it's a student, filter submissions by their student ID.
    if (isStudent && studentId) {
        // IMPORTANT: Convert studentId to a number if it comes from the user object as a string,
        // to match the DUMMY_SUBMISSIONS_DATA studentId type (number).
        const studentIdNumber = Number(studentId); 
        currentAssignmentSubmissions = currentAssignmentSubmissions.filter(
            sub => sub.studentId === studentIdNumber
        );
    }

    // 4. Apply Search Filter (only relevant if not a student, or if the student wants to search their own submission)
    const filteredSubmissions = currentAssignmentSubmissions.filter(sub => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            sub.studentName.toLowerCase().includes(searchLower) ||
            String(sub.studentId).includes(searchLower)
        );
    });

    // Determine the header count and search bar visibility
    const headerCount = isStudent ? (
        filteredSubmissions.length > 0 ? filteredSubmissions.length : 0
    ) : (
        currentAssignmentSubmissions.length
    );
    
    // Student view doesn't need a search bar to filter other students
    const showSearchBar = !isStudent;

    return (
        <div className="am_assignment-submissions-section vs_card-container">
            <div className="vs_header-bar">
                {/* Back Button */}
                <button className="vs_back-button" onClick={onClose} title="Back to Assignments">
                    <FiArrowLeft size={20} />
                </button>
                
                {/* Contextual Title - Uses the passed-in parameters */}
                <div className="vs_title-group">
                    <h4 className="vs_subtitle">
                        Subject - {subjectName}
                    </h4>
                </div>
            </div>

            <div className="vs_detail-panel-content am_detail-panel-content">
                <div className="vs_controls-header am_batch-controls-header">
                    <h4 className="vs_table-header am_detail-header">
                        Assignment Name:: {assignmentTitle} ({headerCount} {isStudent ? 'Submission' : 'Students'})
                    </h4>
                    
                    {/* Search Bar - Only visible for non-student users */}
                    {showSearchBar && (
                        <div className="vs_search-bar am_search-bar am_batch-search-bar">
                            <FiSearch className="am_search-icon" />
                            <input
                                type="text"
                                placeholder="Search Student Name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <FiX className="am_clear-icon" onClick={() => setSearchTerm('')} />
                            )}
                        </div>
                    )}
                </div>

                {/* Table Display */}
                <div className="vs_table-wrapper am_assignment-table-wrapper" style={{ marginTop: '15px' }}>
                    <table className="am_assignment-table">
                        <thead>
                            <tr>
                                {/* If a student, only their details are shown, but the column headers are the same */}
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Submitted File</th>
                                <th>Marks</th>
                                <th>Submitted Date</th>
                                <th>Validated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map(sub => (
                                    <tr key={sub.studentId}>
                                        <td>{sub.studentName}</td>
                                        <td>{sub.studentId}</td>
                                        <td className="am_file-cell">
                                            {/* File Icon based on extension */}
                                            <FiPaperclip 
                                                className={`text-${sub.file.includes('.pdf') ? 'error' : sub.file.includes('.docx') ? 'info' : 'warning'}`} 
                                            />
                                            <span className="am_file-cell-text">{sub.file}</span>
                                        </td>
                                        <td>
                                            {sub.marks !== null ? (
                                                <span style={{ fontWeight: 'bold' }}>{sub.marks} / {MAX_MARKS}</span>
                                            ) : (
                                                <span style={{ color: 'var(--color-warning-dark)' }}>Pending</span>
                                            )}
                                        </td>
                                        <td>{sub.submittedDate}</td>
                                        <td>
                                            {sub.validated ? (
                                                <FiCheckCircle size={16} style={{ color: 'var(--color-success-dark)' }} />
                                            ) : (
                                                <FiAlertCircle size={16} style={{ color: 'var(--color-warning-dark)' }} />
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="am_no-results-table">
                                        {isStudent 
                                            ? "You have no submission for this assignment or you are not enrolled."
                                            : "No submissions found or matching search criteria."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmission;