import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiAlertTriangle, 
  FiCheckCircle,   
} from "react-icons/fi";
import { MdBlock } from "react-icons/md";
import { RiUserForbidFill } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi";
import "../../Styles/SuperAdmin/UserManagement.css";
import CreateUserForm from "./CreateUserForm";

// ⚠️ IMPORTANT: Set the API Base URL (Kept for reference, but fetch is commented out below)
const API_BASE_URL = "http://localhost:5000/api";

// --- SuspendUserModal and other NEW COMPONENTS remain unchanged ---
const SuspendUserModal = ({ user, onClose, onSave }) => {
  const isSuspended = user.status === "Suspended";
  const [reason, setReason] = useState(user.suspensionReason || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); 

  useEffect(() => {
    // Logic for setting initial dates for suspended users (optional)
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSuspended && !reason.trim()) {
        alert("Suspension reason is required.");
        return;
    }
    setShowConfirm(true); 
  };

  const handleConfirmAction = () => {
    setShowConfirm(false); 
    
    const payload = {
      user_id: user.user_id,
      action: isSuspended ? "reactivate" : "suspend",
      reason: isSuspended ? "" : reason, 
      timeline: { startDate, endDate }
    };

    onSave(payload); 
    onClose(); 
  };


  if (showConfirm) {
    // Confirmation Popup
    return (
        <div className="modal-overlay">
            <div className="modal-content small-modal">
                <h3 className="modal-title">Confirm {isSuspended ? "Reactivation" : "Suspension"}</h3>
                <p>Are you sure you want to {isSuspended ? "REACTIVATE" : "SUSPEND"} the user **{user.username}**?</p>
                <div className="modal-actions">
                    <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                        Cancel
                    </button>
                    <button className={`btn ${isSuspended ? "btn-primary" : "btn-danger"}`} onClick={handleConfirmAction}>
                        {isSuspended ? "Confirm Reactivate" : "Confirm Suspend"}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // Main Suspend/Reactivate Form Modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {isSuspended ? "Reactivate User" : "Suspend User"}
          </h3>
          <FiX className="close-icon" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <p className="user-info-text">
            User: {user.fullName}  - {user.role}
          </p>

          {!isSuspended && (
            <>
              <div className="form-group">
                <label htmlFor="reason">Reason for Suspension <span className="required">*</span></label>
                <textarea
                  id="reason"
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Enter the detailed reason for suspension..."
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="startDate">Suspension Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">Suspension End Date (Optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary`}
            >
              {isSuspended ? "Reactivate User" : "Suspend User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ----------------------------


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); 
  const [filters, setFilters] = useState({
    role: null,
    status: null,
    batch: null,
  });

  const [availableBatches, setAvailableBatches] = useState([]);

  const filterRef = useRef(null);

  const [editUser, setEditUser] = useState(null);
  // ✨ NEW STATE: To pass custom text when opening from the action column
  const [formSource, setFormSource] = useState(null);

  const [suspendPopup, setSuspendPopup] = useState({ open: false, user: null });
  
  // States for form submissions and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // Dummy Users instead of API
  useEffect(() => {
    const dummyUsers = [
      {
        user_id: 1,
        username: "john_doe",
        fullName: "John Doe",
        email: "john@student.com",
        phone: "9998887776",
        role: "Student",
        status: "Active",
        rollNo: "23STU101",
        school: "Career Point - Chennai Branch",
        guardianName: "Jane Doe",
        guardianPhone: "9876543210",
        batch: "Batch A - 2025",
        course: "Physics + Chemistry",
        admissionDate: "2025-10-11",
        notes: "Scholarship student",
        last_login: "2025-10-01T10:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 2,
        username: "jane_admin",
        fullName: "Jane Admin",
        email: "jane@careerpoint.com",
        phone: "9123456789",
        role: "Admin",
        status: "Suspended",
        employeeID: "ADM2003",
        assignedSchool: "Career Point - Mumbai Branch",
        suspensionReason: "Leave request for 3 months starting Oct 15.", 
        notes: "Manages batches for School A",
        last_login: "2025-09-28T12:30:00",
        profile_image: null,
      },
      {
        user_id: 3,
        username: "super_user",
        fullName: "Ramesh Kumar",
        email: "ramesh@careerpoint.com",
        phone: "9876543210",
        role: "Super Admin",
        status: "Active",
        employeeID: "SA1001",
        department: "Academic Affairs",
        notes: "Handles all institutes",
        last_login: "2025-10-02T15:45:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 4,
        username: "vikram_teacher",
        fullName: "Vikram Rao",
        email: "vikram@careerpoint.com",
        phone: "9812345678",
        role: "Teacher",
        status: "Active",
        employeeID: "TCH502",
        joiningDate: "2025-07-01",
        courses: "Physics, Math",
        assignedBatch: "Batch A - 2025, Batch C - 2026",
        notes: "Specializes in JEE coaching",
        last_login: "2025-10-10T11:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 5,
        username: "ananya_s",
        fullName: "Ananya Sharma",
        email: "ananya@student.com",
        phone: "9000011111",
        role: "Student",
        status: "Active",
        rollNo: "23STU102",
        school: "Career Point - Delhi Branch",
        guardianName: "Manoj Sharma",
        guardianPhone: "9000022222",
        batch: "Batch C - 2026",
        course: "Biology",
        admissionDate: "2025-11-01",
        notes: "New admission",
        last_login: "2025-10-11T09:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
      {
        user_id: 6,
        username: "ananya_s",
        fullName: "Ananya Sharma",
        email: "ananya@student.com",
        phone: "9000011111",
        role: "Student",
        status: "Active",
        rollNo: "23STU103",
        school: "Career Point - Delhi Branch",
        guardianName: "Manoj Sharma",
        guardianPhone: "9000022222",
        batch: "Batch C - 2027",
        course: "Biology",
        admissionDate: "2025-11-01",
        notes: "New admission",
        last_login: "2025-10-11T09:00:00",
        profile_image: null,
        suspensionReason: null, 
      },
    ];
    setUsers(dummyUsers);
    setLoading(false);

    // Calculate unique batches from dummy users who are students
    const studentBatches = [...new Set(
      dummyUsers
        .filter(user => user.role === 'Student' && user.batch)
        .map(user => user.batch)
    )];
    setAvailableBatches(studentBatches.sort());

  }, []);
  
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


  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filters.role
      ? user.role?.toLowerCase() === filters.role.toLowerCase()
      : true;
    const matchesStatus = filters.status
      ? user.status?.toLowerCase() === filters.status.toLowerCase()
      : true;
    // Use filters.batch in the filter logic
    const matchesBatch = filters.batch ? user.batch === filters.batch : true;
      
    return matchesSearch && matchesRole && matchesStatus && matchesBatch;
  });

  // Handle checkbox selection
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedUsers(checked ? filteredUsers.map((u) => u.user_id) : []);
  };

  /**
   * HANDLER FOR DELETING USER (API SIMULATION)
   */
  // const handleDeleteUser = async (id) => {
  //   if(window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
  //       setError(null);
  //       setSuccess(null);
  //       setIsSubmitting(true);
  //       const userToDelete = users.find(u => u.user_id === id);

  //       try {
  //           // 1. Simulate API Call delay
  //           await new Promise(resolve => setTimeout(resolve, 500)); 
            
  //           // 2. Simulate SUCCESS Update
  //           setUsers((prev) => prev.filter((user) => user.user_id !== id));
  //           setSuccess(`✅ ${userToDelete.role} (${userToDelete.username}) Deleted Successfully!`);

  //           // ⚠️ For a real backend, the fetch call would go here.

  //       } catch (err) {
  //           setError(err.message || "Failed to delete user.");
  //       } finally {
  //           setIsSubmitting(false);
  //       }
  //   }
  // };

  /**
   * HANDLER FOR DELETING USER (API INTEGRATION)
   */
  const handleDeleteUser = async (id) => {
    if(window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        const userToDelete = users.find(u => u.user_id === id);

        if (!userToDelete) {
            setError("User not found for deletion.");
            setIsSubmitting(false);
            return;
        }

        try {
            // 1. Send data to backend using fetch DELETE
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization headers here if needed (e.g., 'Authorization': 'Bearer YOUR_TOKEN')
                },
            });

            if (!response.ok) {
                // Read and throw the error message from the backend response body
                const errorData = await response.json(); 
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            
            // 2. Local State Update on SUCCESS
            setUsers((prev) => prev.filter((user) => user.user_id !== id));
            setSuccess(`✅ ${userToDelete.role} (${userToDelete.username}) Deleted Successfully!`);

        } catch (err) {
            console.error("Delete Error:", err);
            setError(err.message || "Failed to delete user.");
        } finally {
            setIsSubmitting(false);
        }
    }
  };


  /**
   * HANDLER FOR CREATING/EDITING USER (API SIMULATION)
   */
  // const handleSave = async (userData) => {
  //   setError(null);
  //   setSuccess(null);
  //   setIsSubmitting(true);
    
  //   const isUpdate = !!userData.user_id; 
    
  //   // Simulate API call delay
  //   await new Promise(resolve => setTimeout(resolve, 500)); 

  //   try {
  //       // --- START: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
  //       const savedUser = isUpdate 
  //           ? userData 
  //           : { ...userData, user_id: Date.now(), status: "Active", suspensionReason: null };
            
        
  //       // Update local state and close the modal
  //       if (isUpdate) {
  //           setUsers((prev) =>
  //               prev.map((user) =>
  //                   user.user_id === savedUser.user_id ? savedUser : user
  //               )
  //           );
  //           setSuccess(`✅ ${savedUser.role} Updated Successfully!`);
  //           setEditUser(null); // Close the modal on success
  //       } else {
  //           setUsers((prev) => [...prev, savedUser]);
  //           setSuccess(`✅ ${savedUser.role} Created Successfully!\nUsername: ${savedUser.username}`);
  //           setSelectedRole(null); // Close the modal on success
  //       }
  //       // --- END: LOCAL STATE UPDATE (SIMULATING SUCCESS) ---
        
  //   } catch (err) {
  //       setError(err.message || `Failed to ${isUpdate ? 'update' : 'create'} user. Check console for details.`);
  //       // Do NOT close the modal on error
        
  //   } finally {
  //       setIsSubmitting(false);
  //       // ✨ New: Clear formSource on successful completion or failure
  //       setFormSource(null);
  //   }
  // };



  /**
   * HANDLER FOR CREATING/EDITING USER (API INTEGRATION)
   */
  const handleSave = async (userData) => {

    console.log(userData);
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    
    const isUpdate = !!userData.user_id; 
    const endpoint = isUpdate ? `${API_BASE_URL}/users/${userData.user_id}` : `${API_BASE_URL}/users/create`;
    const method = isUpdate ? 'PUT' : 'POST';

    // try {
    //     // 1. Send data to backend using fetch POST or PUT
    //     const response = await fetch(endpoint, {
    //         method: method,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             // Add authorization headers here if needed
    //         },
    //         body: JSON.stringify(userData), // Convert JS object to JSON string
    //     });

    //     if (!response.ok) {
    //         const errorData = await response.json(); 
    //         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    //     }
        
    //     // Assuming the backend returns the saved/updated user object
    //     const savedUser = await response.json(); 
        
    //     // --- START: LOCAL STATE UPDATE (SUCCESS) ---
    //     if (isUpdate) {
    //         setUsers((prev) =>
    //             prev.map((user) =>
    //                 user.user_id === savedUser.user_id ? savedUser : user
    //             )
    //         );
    //         setSuccess(`✅ ${savedUser.role} Updated Successfully!`);
    //         setEditUser(null); // Close the modal on success
    //     } else {
    //         // Ensure the new user has the minimum required fields (like a status) if not returned by API
    //         const newUserWithDefaults = { 
    //             ...savedUser, 
    //             status: savedUser.status || "Active", 
    //             suspensionReason: savedUser.suspensionReason || null 
    //         }; 
    //         setUsers((prev) => [...prev, newUserWithDefaults]);
    //         setSuccess(`✅ ${savedUser.role} Created Successfully!\nUsername: ${savedUser.username}`);
    //         setSelectedRole(null); // Close the modal on success
    //     }
    //     // --- END: LOCAL STATE UPDATE (SUCCESS) ---
        
    // } catch (err) {
    //     console.error(`${isUpdate ? 'Update' : 'Create'} Error:`, err);
    //     setError(err.message || `Failed to ${isUpdate ? 'update' : 'create'} user.`);
        
    // } finally {
    //     setIsSubmitting(false);
    //     setFormSource(null);
    // }
  };

  /**
   * HANDLER FOR SUSPEND/REACTIVATE (API SIMULATION)
   */
  // const handleSuspendSave = async ({ user_id, action, reason, timeline }) => {
  //   setError(null);
  //   setSuccess(null);
  //   setIsSubmitting(true);
  //   const userToUpdate = users.find(u => u.user_id === user_id);
  //   const actionText = action === "suspend" ? "Suspend" : "Reactivate";

  //   try {
  //       // 1. Simulate API Call delay
  //       await new Promise(resolve => setTimeout(resolve, 500)); 

  //       // 2. Simulate SUCCESS Update
  //       const updatedUser = {
  //           ...userToUpdate,
  //           status: action === "suspend" ? "Suspended" : "Active",
  //           suspensionReason: action === "suspend" ? reason : null,
  //       };

  //       setUsers(prev => prev.map(user => 
  //           user.user_id === user_id ? updatedUser : user
  //       ));
        
  //       setSuccess(`✅ User (${userToUpdate.username}) ${actionText}d Successfully!`);

  //       // ⚠️ For a real backend, the fetch call would go here.
        
  //   } catch (err) {
  //       setError(err.message || `Failed to ${actionText.toLowerCase()} user.`);
  //   } finally {
  //       setIsSubmitting(false);
  //   }
  //   // The SuspendUserModal handles its own closure after calling onSave, so no need to close it here.
  // };
  /**
   * HANDLER FOR SUSPEND/REACTIVATE (API INTEGRATION)
   */
  const handleSuspendSave = async ({ user_id, action, reason, timeline }) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const userToUpdate = users.find(u => u.user_id === user_id);
    const actionText = action === "suspend" ? "Suspend" : "Reactivate";

    if (!userToUpdate) {
        setError("User not found for status update.");
        setIsSubmitting(false);
        return;
    }

    try {
        // 1. Prepare Payload and Send PATCH/PUT Request
        const payload = {
            status: action === "suspend" ? "Suspended" : "Active",
            suspensionReason: action === "suspend" ? reason : null,
            // Include timeline data if your backend needs it
            suspensionTimeline: action === "suspend" ? timeline : null, 
        };

        const response = await fetch(`${API_BASE_URL}/users/${user_id}/status`, {
            method: 'PATCH', // PATCH is typically used for partial updates
            headers: {
                'Content-Type': 'application/json',
                // Add authorization headers here if needed
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        
        // Assuming the backend returns the updated user
        const updatedUser = await response.json(); 

        // 2. Local State Update on SUCCESS
        setUsers(prev => prev.map(user => 
            user.user_id === user_id ? updatedUser : user
        ));
        
        setSuccess(`✅ User (${userToUpdate.username}) ${actionText}ed Successfully!`);
        
    } catch (err) {
        console.error(`${actionText} Error:`, err);
        setError(err.message || `Failed to ${actionText.toLowerCase()} user.`);
    } finally {
        setIsSubmitting(false);
    }
  };


  const removeFilter = (key) => {
    // If we remove the role filter, also clear the batch filter
    if (key === 'role') {
        setFilters((prev) => ({ ...prev, [key]: null, batch: null }));
    } else {
        setFilters((prev) => ({ ...prev, [key]: null }));
    }
  };
  
  // Helper to open the form for creation, clearing any existing edit state
  const handleOpenCreateUser = (role) => {
    setEditUser(null);
    setFormSource(null); // Explicitly set to null for creation buttons
    setSelectedRole(role);
  };
  
  // Helper to open the form for editing from the action column
  const handleOpenEditUser = (user) => {
    setSelectedRole(null); // Clear creation mode
    setFormSource("action"); // ✨ Set the specific string for action column edit
    setEditUser(user);
    setError(null); 
    setSuccess(null);
  };


  return (
    <div className="user-management">
        
        {/* Global Success/Error Notification */}
        {(success || error) && (
            <div className={`notification ${success ? 'success' : 'error'}`}>
                {success && <FiCheckCircle size={20} style={{ marginRight: '8px' }} />}
                {error && <FiAlertTriangle size={20} style={{ marginRight: '8px' }} />}
                {success || error}
                <button className="close-btn" onClick={() => { setSuccess(null); setError(null); }}>
                    <FiX size={16} />
                </button>
            </div>
        )}
        
      {/* Header */}
      <div className="um-header">
        <h2 className="page-title">User Management</h2>
        
        <div className="um-actions">
          
          {/* Search and Filter Group */}
          <div className="search-filter-group">
              {/* Search */}
              <div className="am_search-bar">
                  <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                  />
                  <FiSearch className="search-icon" />
              </div>

              {/* Filter */}
              <div className="filter-wrapper" ref={filterRef}>
                  <button
                      className={`btn btn-outline ${filterOpen ? "active" : ""}`}
                      onClick={() => setFilterOpen(!filterOpen)}
                  >
                      <FiFilter />
                      <span>Filter</span>
                  </button>

                  {filterOpen && (
                      <div className="filter-dropdown slide-down">
                          <div className="filter-group">
                              <p className="filter-title">Role</p>
                              {["Admin", "Teacher", "Super Admin", "Student"].map((role) => (
                                  <button
                                      key={role}
                                      className={`filter-option ${
                                          filters.role === role ? "active" : ""
                                      }`}
                                      onClick={() =>
                                          setFilters((prev) => ({
                                              ...prev,
                                              // If changing role to non-student, clear batch filter
                                              batch: role !== 'Student' ? null : prev.batch,
                                              role: prev.role === role ? null : role,
                                          }))
                                      }
                                  >
                                      {role}
                                  </button>
                              ))}
                          </div>

                          <div className="filter-group">
                              <p className="filter-title">Status</p>
                              {["Active", "Pending", "Suspended", "Deleted"].map(
                                  (status) => (
                                      <button
                                          key={status}
                                          className={`filter-option ${
                                              filters.status === status ? "active" : ""
                                          }`}
                                          onClick={() =>
                                              setFilters((prev) => ({
                                                  ...prev,
                                                  status: prev.status === status ? null : status,
                                              }))
                                          }
                                      >
                                          {status}
                                      </button>
                                  )
                              )}
                          </div>
                          
                          {/* Conditional Batch Filter, only for Students */}
                          {filters.role === "Student" && availableBatches.length > 0 && (
                              <div className="filter-group">
                                  <p className="filter-title">Batch</p>
                                  {availableBatches.map((batch) => (
                                      <button
                                          key={batch}
                                          className={`filter-option ${
                                              filters.batch === batch ? "active" : ""
                                          }`}
                                          onClick={() =>
                                              setFilters((prev) => ({
                                                  ...prev,
                                                  batch: prev.batch === batch ? null : batch,
                                              }))
                                          }
                                      >
                                          {batch}
                                      </button>
                                  ))}
                              </div>
                          )}
                          
                      </div>
                  )}
              </div>
          </div>
          
          {/* Separate Add User Buttons (Updated to use new helper) */}
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Student")}>
            <FiPlus /> Add Student
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Teacher")}>
            <FiPlus /> Add Teacher
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Admin")}>
            <FiPlus /> Add Admin
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenCreateUser("Super Admin")}>
            <FiPlus /> Add Super Admin
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.role || filters.status || filters.batch) && (
        <div className="active-filters">
          {Object.entries(filters).map(
            ([key, value]) =>
              value && (
                <span key={key} className="filter-tag">
                  {value}
                  <FiX onClick={() => removeFilter(key)} />
                </span>
              )
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Users</h4>
          <p className="summary-value">{users.length}</p>
        </div>
        {(searchTerm || filters.role || filters.status || filters.batch) && (
          <div className="summary-card">
            <h4>Filtered Results</h4>
            <p className="summary-value">{filteredUsers.length}</p>
          </div>
        )}
        {selectedUsers.length > 0 && (
          <div className="summary-card highlight">
            <h4>Selected Users</h4>
            <p className="summary-value">{selectedUsers.length}</p>
          </div>
        )}
      </div>


      {/* Reusable Create/Edit User Form (Modal) */}
      {(selectedRole || editUser) && (
        <div className="modal-overlay">
          <CreateUserForm
            role={selectedRole || editUser?.role}
            initialData={editUser}
            // ✨ Pass the new prop for tracking the form source
            formSource={formSource} 
            onClose={() => {
              setSelectedRole(null);
              setEditUser(null);
              setFormSource(null); // Clear formSource when closing
            }}
            onSubmit={handleSave}
            // Pass the submitting state to the form so it can disable its button
            isSubmitting={isSubmitting} 
          />
        </div>
      )}
      
      {/* Suspend/Reactivate Modal */}
      {suspendPopup.open && suspendPopup.user && (
        <SuspendUserModal
            user={suspendPopup.user}
            onClose={() => setSuspendPopup({ open: false, user: null })}
            onSave={handleSuspendSave}
        />
      )}

      {/* Users Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={
                      filteredUsers.length > 0 &&
                      selectedUsers.length === filteredUsers.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => handleSelectUser(user.user_id)}
                      />
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar-wrapper">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt={user.username}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            <HiUserCircle />
                          </div>
                        )}
                      </div>
                      <span className="user-name">{user.username}</span>
                    </td>
                    <td className="role-cell">{user.role || "—"}</td>
                    <td>
                      <span
                        className={`status-badge status-${user.status?.toLowerCase()}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="actions-col">
                      <div className="action-buttons">
                        <button
                          className="btn-icon action-edit"
                          title="Edit"
                          // Use the new helper function for editing
                          onClick={() => handleOpenEditUser(user)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon action-delete"
                          title="Delete"
                          onClick={() => handleDeleteUser(user.user_id)} 
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          className={`btn-icon ${
                            user.status === "Suspended"
                              ? "action-unsuspend"
                              : "action-suspend"
                          }`}
                          title={
                            user.status === "Suspended"
                              ? "Unsuspend"
                              : "Suspend"
                          }
                          onClick={() =>
                            setSuspendPopup({
                              open: true,
                              user: user,
                            })
                          }
                        >
                          {user.status === "Suspended" ? (
                            <MdBlock />
                          ) : (
                            <RiUserForbidFill />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;