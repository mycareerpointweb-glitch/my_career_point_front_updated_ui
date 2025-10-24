import React, { useState, useEffect, useRef } from "react";
import "../../Styles/SuperAdmin/UserManagement.css";

const CreateUserForm = ({ role, onClose, onSubmit, initialData, isSubmitting }) => {
  // Combined state with all fields required for all roles
  const [formData, setFormData] = useState({
    // Shared Fields
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    sendInvite: false,
    
    // Student Fields
    rollNo: "",
    school: "", 
    guardianName: "",
    guardianPhone: "",
    batch: "",
    course: "", 
    admissionDate: "",
    
    // Role-Specific Status (Default to Active)
    status: "Active", 
    
    // Conditional Fields
    suspensionReason: "",
    suspensionStartEnd: "", 
    notes: "",

    // Teacher & Admin Fields
    employeeID: "",
    assignedBatch: "", 
    courses: "", 
    joiningDate: "", 
    assignedSchool: "", 
    department: "", 
  });
  
  // ==========================================================
  // Custom Dropdown State and Refs
  // ==========================================================
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const courseRef = useRef(null); 
  
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolRef = useRef(null); 
  
  const [showBatchDropdown, setShowBatchDropdown] = useState(false);
  const batchRef = useRef(null); 
  
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef(null); 
  
  const [showAssignedSchoolDropdown, setShowAssignedSchoolDropdown] = useState(false);
  const assignedSchoolRef = useRef(null); 

  // ==========================================================
  // Dropdown Options
  // ==========================================================
  const courseOptions = [
    "CA Foundation", 
    "CA Intermediate", 
    "CMA Foundation", 
    "CMA Intermediate"
  ];
  const schoolOptions = [
    "Career Point - Chennai Branch",
    "Career Point - Mumbai Branch",
    "Career Point - Delhi Branch",
    "Career Point - Bangalore Branch",
  ];
  const batchOptions = [
    "Batch A - 2025", 
    "Batch B - 2026", 
    "Batch C - 2027"
  ];
  const statusOptions = [
    "Active", 
    "Suspended"
  ];
  
  // ==========================================================
  // Effects
  // ==========================================================

  // 🔹 EFFECT 1: Load initialData for editing
  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({ 
            ...prev,
            ...initialData,
            status: initialData.status || "Active", 
        }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            status: "Active", 
            course: "", 
            school: "", 
            batch: "", 
            assignedSchool: "", 
        }));
    }
  }, [initialData]); 

  // 🔹 Auto-generate username (existing logic)
  useEffect(() => {
    if (formData.fullName && !formData.username && !initialData) {
      setFormData((prev) => ({
        ...prev,
        username: formData.fullName.toLowerCase().replace(/\s+/g, "_"),
      }));
    }
  }, [formData.fullName, formData.username, initialData]);
  
  // 🔹 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close all dropdowns if the click is outside their respective wrappers
      if (courseRef.current && !courseRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
      if (schoolRef.current && !schoolRef.current.contains(event.target)) {
        setShowSchoolDropdown(false);
      }
      if (batchRef.current && !batchRef.current.contains(event.target)) {
        setShowBatchDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (assignedSchoolRef.current && !assignedSchoolRef.current.contains(event.target)) {
        setShowAssignedSchoolDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  // ==========================================================
  // Helper Functions
  // ==========================================================
  
  const generatePassword = () => { 
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const generateUsername = (name) => { 
    if (name) {
      return (
        name.toLowerCase().replace(/\s+/g, "_") +
        "_" +
        Math.floor(Math.random() * 1000)
      );
    }
    return "user_" + Math.floor(Math.random() * 10000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Helper for setting custom dropdown values
  const handleDropdownSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Close the correct dropdown
    if (name === 'course') setShowCourseDropdown(false);
    if (name === 'school') setShowSchoolDropdown(false);
    if (name === 'batch') setShowBatchDropdown(false);
    if (name === 'status') setShowStatusDropdown(false);
    if (name === 'assignedSchool') setShowAssignedSchoolDropdown(false);
  };
  
  // 💥 MODIFIED Custom Dropdown Renderer Function 💥
  const CustomDropdown = ({ name, label, options, currentValue, placeholder, required, showDropdown, setShowDropdown, dropdownRef }) => {
    // 💥 NEW: State for Search Term
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter the options based on the search term
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Handle opening/closing
    const toggleDropdown = () => {
      // Clear search term when closing
      if (showDropdown) {
        setSearchTerm(''); 
      }
      setShowDropdown(prev => !prev);
    };

    // Handle selection and close
    const handleSelect = (option) => {
        handleDropdownSelect(name, option);
        setSearchTerm(''); // Clear search on select
    };

    // Handle text input for the search
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Effect to auto-focus the search input when the dropdown opens
    const searchInputRef = useRef(null);
    useEffect(() => {
        if (showDropdown && searchInputRef.current) {
            // Use a slight delay to ensure the input is mounted and focusable
            setTimeout(() => searchInputRef.current.focus(), 0);
        }
    }, [showDropdown]);


    return (
        <div className="form-group custom-select-wrapper" ref={dropdownRef}>
            <label>
                {label} {required && <span className="required">*</span>}
            </label>
            <div 
                className={`custom-select-trigger ${showDropdown ? 'active' : ''} ${!currentValue ? 'placeholder-text' : ''}`} 
                onClick={toggleDropdown}
                tabIndex="0" 
                onKeyDown={(e) => { 
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown();
                    }
                }}
            >
                {currentValue || placeholder}
            </div>
            {showDropdown && (
                <div className="custom-select-options slide-down">
                    {/* 💥 NEW: Search Input */}
                    <div className="custom-select-search-wrapper">
                        <input
                            type="text"
                            ref={searchInputRef}
                            placeholder={`Search ${label}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            // Stop propagation to prevent the dropdown from closing immediately
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()} 
                            className="custom-select-search-input"
                        />
                    </div>
                    {/* 💥 Display Filtered Options */}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option}
                                className={`custom-option ${currentValue === option ? 'selected' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="custom-option no-results">No results found</div>
                    )}
                </div>
            )}
            {/* Hidden input field for form submission/validation */}
            <input type="hidden" name={name} value={currentValue} required={required} /> 
        </div>
    );
  }; // End of CustomDropdown


  // 🔹 Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    let { username, password, confirmPassword, fullName, status, course, school, batch, assignedSchool } = formData; 

    // Auto-generation and validation logic (remains the same)
    if (!username.trim()) {
      username = initialData?.username || generateUsername(fullName);
    }
    if (!password.trim()) {
      const autoPass = generatePassword();
      password = autoPass;
      confirmPassword = autoPass;
    }
    if (password && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!status) {
        status = "Active";
    }
    
    // REQUIRED FIELD VALIDATION 
    if (role === "Student") {
        if (!school.trim()) {
            alert("School is a required field for Students.");
            return;
        }
        if (!batch.trim()) {
            alert("Batch is a required field for Students.");
            return;
        }
        if (!course.trim()) {
            alert("Course is a required field for Students.");
            return;
        }
    }
    
    if (role === "Admin" && !assignedSchool.trim()) {
        alert("Assigned School is a required field for Admin.");
        return;
    }
    // END REQUIRED FIELD VALIDATION

    // Final user data
    const data = {
      ...formData,
      username,
      password,
      confirmPassword,
      status,
      role,
      user_id: initialData?.user_id || Date.now(),
      last_login: new Date().toISOString(),
    };

    onSubmit?.(data);

    // Alert removed from component, controlled by parent (UserManagement.jsx)
    alert(
      `✅ ${role} Created Successfully!\nUsername: ${username}\nPassword: ${password}`
    );
  };

  return (
    <div className="user-form-card fade-in modal-card">
      <div className="form-header">
        <h3>{initialData ? 'Edit' : 'Create'} {role}</h3>
        <button className="btn-icon" onClick={onClose}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="user-form">
        {/* ========================================================== */}
        {/* SHARED FIELDS (All Users) */}
        {/* ========================================================== */}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Priya S"
            />
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91-9998887776"
            />
          </div>
          <div className="form-group">
            <label>Username (auto if empty)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Auto-generated if empty"
            />
          </div>
        </div>
        
        {/* Password fields */}
        <div className="form-row">
          <div className="form-group">
            <label>Password (auto if empty)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave empty to auto-generate"
            />
          </div>
          
          {/* CONFIRM PASSWORD: Only visible if a password has been entered */}
          {formData.password && (
            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!!formData.password}
                placeholder="Confirm password"
              />
            </div>
          )}
          {/* Placeholder column if confirmPassword is hidden, for alignment in form-row */}
          {!formData.password && <div className="form-group"></div>}
        </div>


        {/* ========================================================== */}
        {/* STUDENT-ONLY FIELDS */}
        {/* ========================================================== */}
        {role === "Student" && (
          <>
            {/* Roll No & School (CustomDropdown) */}
            <div className="form-row">
                <div className="form-group">
                    <label>Roll No <span className="required">*</span></label>
                    <input
                      type="text"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      required
                      placeholder="23STU101"
                    />
                </div>
                
                <CustomDropdown
                    name="school"
                    label="School"
                    options={schoolOptions}
                    currentValue={formData.school}
                    placeholder="Select School"
                    required={true}
                    showDropdown={showSchoolDropdown}
                    setShowDropdown={setShowSchoolDropdown}
                    dropdownRef={schoolRef}
                />
            </div>
            
            {/* Guardian Name & Phone */}
            <div className="form-row">
                <div className="form-group">
                    <label>Guardian Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleChange}
                      required
                      placeholder="Sundar S"
                    />
                </div>
                <div className="form-group">
                    <label>Guardian Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      required
                      placeholder="+91-9876541111"
                    />
                </div>
            </div>
            
            {/* Batch & Course (CustomDropdown) */}
            <div className="form-row">
              <CustomDropdown
                  name="batch"
                  label="Batch"
                  options={batchOptions}
                  currentValue={formData.batch}
                  placeholder="Select Batch"
                  required={true}
                  showDropdown={showBatchDropdown}
                  setShowDropdown={setShowBatchDropdown}
                  dropdownRef={batchRef}
              />
              
              <CustomDropdown
                  name="course"
                  label="Course"
                  options={courseOptions}
                  currentValue={formData.course}
                  placeholder="Select Course"
                  required={true}
                  showDropdown={showCourseDropdown}
                  setShowDropdown={setShowCourseDropdown}
                  dropdownRef={courseRef}
              />
            </div>
            
            {/* Admission Date & Status (Updated Status to CustomDropdown) */}
            <div className="form-row">
                <div className="form-group">
                    <label>Admission Date <span className="required">*</span></label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      required
                    />
                </div>
              <CustomDropdown
                  name="status"
                  label="Status"
                  options={statusOptions}
                  currentValue={formData.status}
                  placeholder="Select Status"
                  required={false}
                  showDropdown={showStatusDropdown}
                  setShowDropdown={setShowStatusDropdown}
                  dropdownRef={statusRef}
              />
            </div>

            {/* Suspension Reason (Conditional) */}
            {formData.status === "Suspended" && (
                <div className="form-group">
                  <label>Suspension Reason / Timeline</label>
                  <input
                    type="text"
                    name="suspensionReason"
                    value={formData.suspensionReason}
                    onChange={handleChange}
                    placeholder="e.g., Leave of absence"
                  />
                </div>
            )}

            {/* Notes (Textarea) */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Scholarship student / Special needs..."
              />
            </div>
          </>
        )}


        {/* ========================================================== */}
        {/* TEACHER-ONLY FIELDS */}
        {/* ========================================================== */}
        {role === "Teacher" && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID <span className="required">*</span></label>
                <input
                  type="text"
                  name="employeeID"
                  value={formData.employeeID}
                  onChange={handleChange}
                  required
                  placeholder="TCH502"
                />
              </div>
              <div className="form-group">
                <label>Joining Date <span className="required">*</span></label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Courses/Subjects (Multi-select-like)</label>
                <input
                  type="text"
                  name="courses"
                  value={formData.courses}
                  onChange={handleChange}
                  placeholder="Physics, Math, etc."
                />
              </div>
              <div className="form-group">
                <label>Assigned Batch (Multi-select-like)</label>
                <input
                  type="text"
                  name="assignedBatch"
                  value={formData.assignedBatch}
                  onChange={handleChange}
                  placeholder="Batch A, Batch C"
                />
              </div>
            </div>
            
            {/* Status & Conditional Suspension Reason (CustomDropdown) */}
            <div className="form-row">
              <CustomDropdown
                  name="status"
                  label="Status"
                  options={statusOptions}
                  currentValue={formData.status}
                  placeholder="Select Status"
                  required={false}
                  showDropdown={showStatusDropdown}
                  setShowDropdown={setShowStatusDropdown}
                  dropdownRef={statusRef}
              />
              
              {formData.status === "Suspended" ? (
                <div className="form-group">
                  <label>Suspension Reason / Timeline</label>
                  <input
                    type="text"
                    name="suspensionReason"
                    value={formData.suspensionReason}
                    onChange={handleChange}
                    placeholder="e.g., Contract break"
                  />
                </div>
              ) : (
                 <div className="form-group"></div> // Placeholder for alignment
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Specializes in JEE coaching..."
              />
            </div>
          </>
        )}

        {/* ========================================================== */}
        {/* ADMIN/SUPER ADMIN-ONLY FIELDS */}
        {/* ========================================================== */}
        {(role === "Admin" || role === "Super Admin") && (
            <>
                <div className="form-row">
                    <div className="form-group">
                        <label>Employee ID <span className="required">*</span></label>
                        <input
                          type="text"
                          name="employeeID"
                          value={formData.employeeID}
                          onChange={handleChange}
                          required
                          placeholder={role === "Admin" ? "ADM2003" : "SA1001"}
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input
                          type="text"
                          value={role}
                          disabled
                          className="disabled-input"
                        />
                    </div>
                </div>
                
                {role === "Admin" && (
                    <CustomDropdown
                        name="assignedSchool"
                        label="Assigned School"
                        options={schoolOptions} // Reuses school options
                        currentValue={formData.assignedSchool}
                        placeholder="Select Assigned School"
                        required={true}
                        showDropdown={showAssignedSchoolDropdown}
                        setShowDropdown={setShowAssignedSchoolDropdown}
                        dropdownRef={assignedSchoolRef}
                    />
                )}
                
                {role === "Super Admin" && (
                    <div className="form-group">
                        <label>Department <span className="required">*</span></label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          placeholder="Academic Affairs"
                        />
                    </div>
                )}
                
                {/* Status and Conditional Suspension Reason for Admin/Super Admin (CustomDropdown) */}
                <div className="form-row">
                  <CustomDropdown
                      name="status"
                      label="Status"
                      options={statusOptions}
                      currentValue={formData.status}
                      placeholder="Select Status"
                      required={false}
                      showDropdown={showStatusDropdown}
                      setShowDropdown={setShowStatusDropdown}
                      dropdownRef={statusRef}
                  />
                  
                  {formData.status === "Suspended" && (
                      <div className="form-group">
                          <label>Suspension Reason / Timeline</label>
                          <input
                              type="text"
                              name="suspensionReason"
                              value={formData.suspensionReason}
                              onChange={handleChange}
                              placeholder="e.g., Policy violation"
                          />
                      </div>
                  )}
                  {formData.status !== "Suspended" && <div className="form-group"></div>}
                </div>
                
                {/* Suspension Start & End Date (Super Admin Only) */}
                {role === "Super Admin" && formData.status === "Suspended" && (
                    <div className="form-group">
                        <label>Suspension Start & End Date</label>
                        <input
                          type="text"
                          name="suspensionStartEnd"
                          value={formData.suspensionStartEnd}
                          onChange={handleChange}
                          placeholder="12-10-2025 -> 30-10-2025"
                        />
                    </div>
                )}

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Manages batches for School A..."
                    />
                </div>
            </>
        )}

        {/* Form Actions (for all roles) */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="sendInvite"
              checked={formData.sendInvite}
              onChange={handleChange}
            />
            <span>Send invitation email</span>
          </label>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;