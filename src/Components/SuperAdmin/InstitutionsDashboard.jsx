import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaUniversity } from 'react-icons/fa';
import institutionsData from '../dummy.json'; 
import '../../Styles/SuperAdmin/InstitutionsDashboard.css';

// --- Reference Data Extraction ---
const availableAdmins = institutionsData.admins_reference || [];
const availableCoursesRef = institutionsData.courses_reference || [];
const adminRefMap = new Map(availableAdmins.map(ref => [ref.admin_id, ref.name]));

// --- Utility to Extract Batches ---
/**
 * Extracts and normalizes batch data for a specific institution's raw data object.
 * @param {object} instFullData - The object from institutionsData.data for the institution.
 * @returns {Array} List of batch objects.
 */
const getBatches = (instFullData) => {
    const batches = [];
    (instFullData.courses || []).forEach(course => {
        (course.levels || []).forEach(level => {
            (level.batches || []).forEach(batch => {
                const totalStudents = (batch.classes || []).reduce(
                    (sum, cls) => sum + (cls.students_ids ? cls.students_ids.length : 0), 0
                );
                batches.push({
                    id: batch.batch_id,
                    name: batch.batch_name || `Batch ${batch.batch_id}`,
                    course: course.course_id.toUpperCase(),
                    level: level.level_name,
                    totalStudents: totalStudents,
                });
            });
        });
    });
    return batches;
};

// --- Institution Details Panel Component (Unchanged) ---
const InstitutionDetailsPanel = React.forwardRef(({ institution, instRawData, onClear }, ref) => {
    if (!institution || !instRawData) return null;

    // Use the utility function to get the batches for the current institution
    const batchesList = getBatches(instRawData);

    return (
        <div ref={ref} className="inst_details_panel_container">
            <div className="inst_details_panel">
                <header className="inst_details_panel_header">
                    <h3 className="inst_details_title">Details for {institution.name}</h3>
                    <button className="inst_details_close_btn" onClick={onClear}>&times;</button>
                </header>
                
                <section className="inst_details_summary">
                    <p><strong>ID:</strong> {institution.id}</p>
                    <p><strong>Location:</strong> {institution.location}</p>
                    <p><strong>Admins:</strong> {institution.adminNamesList}</p>
                </section>

                <h4 className="inst_details_subtitle">Available Batches ({batchesList.length})</h4>
                
                {batchesList.length > 0 ? (
                    <div className="inst_batches_table_responsive">
                        <table className="inst_batches_table">
                            <thead>
                                <tr>
                                    <th>Batch ID</th>
                                    <th>Batch Name</th>
                                    <th>Course/Level</th>
                                    <th>Total Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchesList.map((batch) => (
                                    <tr key={batch.id}>
                                        <td>{batch.id}</td>
                                        <td>{batch.name}</td>
                                        <td>{`${batch.course} - ${batch.level}`}</td>
                                        <td>{batch.totalStudents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="inst_no_results_small">No active batches found for this institution.</p>
                )}
            </div>
        </div>
    );
});


// --- Data Processing (Remains Corrected) ---
const processInstitutionData = (rawData) => {
  const dataArray = rawData.data || [];
  const institutionRefMap = new Map(
    (rawData.institutions_reference || []).map(ref => [ref.institution_id, ref])
  );
  const adminRefMap = new Map(
    (rawData.admins_reference || []).map(ref => [ref.admin_id, ref.name])
  );
  
  if (!dataArray || dataArray.length === 0) return [];
  
  return dataArray.map(instData => {
    const ref = institutionRefMap.get(instData.institution_id) || {};
    
    let totalBatches = 0;
    let totalStudents = 0;
    const availableCourses = new Set();
    
    const adminNamesList = (instData.admins_ids || [])
        .map(id => adminRefMap.get(id))
        .filter(name => name)
        .join(', ');

    (instData.courses || []).forEach(course => {
      (course.levels || []).forEach(level => {
        if (course.course_id) {
            availableCourses.add(`${course.course_id.toUpperCase()} ${level.level_name || ''}`);
        }
        
        (level.batches || []).forEach(batch => {
          totalBatches++;
          const studentCount = (batch.classes || []).reduce(
            (sum, cls) => sum + (cls.students_ids ? cls.students_ids.length : 0), 0
          );
          totalStudents += studentCount;
        });
      });
    });
    
    // Extract currently available course IDs for pre-filling the form
    const currentCourseIds = (instData.courses || []).map(c => c.course_id).filter(id => id);

    return {
      id: instData.institution_id,
      name: ref.name || `Unknown Institution (${instData.institution_id})`,
      location: ref.location || 'N/A',
      adminNamesList: adminNamesList || 'N/A',
      // NEW: Include admin IDs for pre-filling edit form
      adminIds: instData.admins_ids || [], 
      // NEW: Include course IDs for pre-filling edit form
      courseIds: currentCourseIds, 
      totalBatches: totalBatches,
      totalStudents: totalStudents,
      coursesList: Array.from(availableCourses).join(', ') || 'No Courses Found', 
      // Keep a reference to the raw data object for the panel
      rawInstData: instData 
    };
  });
};

const initialProcessedData = processInstitutionData(institutionsData);
const rawDataMap = new Map(initialProcessedData.map(inst => [inst.id, inst.rawInstData]));


// --- Custom Multi-Select with Pills Component (Unchanged) ---
const MultiSelectPillInput = ({ label, options, selectedItems, onSelect, onRemove, displayKey, valueKey }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Filter options based on search term and exclusion of already selected items
    const filteredOptions = options.filter(option =>
        (option[displayKey] || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.some(item => item[valueKey] === option[valueKey])
    );
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="inst_form_group" ref={wrapperRef}>
            <label>{label}</label>

            {/* Pills Display */}
            <div className="inst_pills_container">
                {selectedItems.map((item) => (
                    <div key={item[valueKey]} className="inst_pill">
                        {item[displayKey]}
                        <button type="button" onClick={() => onRemove(item[valueKey])} className="inst_pill_remove_btn">
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* Custom Dropdown Input */}
            <div 
                className={`inst_custom_select ${isOpen ? 'is_open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Always show search input field */}
                <input 
                    type="text"
                    placeholder={selectedItems.length === 0 ? `Search and select ${label.toLowerCase()}` : 'Search for more...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="inst_custom_select_input"
                />
                
                {/* Dropdown List */}
                {isOpen && (
                    <div className="inst_custom_select_dropdown">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option[valueKey]}
                                    className="inst_dropdown_option"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent closing the main div
                                        onSelect(option);
                                        setSearchTerm(''); // Clear search after selection
                                    }}
                                >
                                    {option[displayKey]}
                                </div>
                            ))
                        ) : (
                            <div className="inst_dropdown_no_results">
                                {searchTerm ? `No results for "${searchTerm}"` : 'All options selected.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Modal Component for Adding/Editing an Institution (Unchanged except for onSubmit call) ---
const InstitutionFormModal = ({ isOpen, onClose, onSubmit, isEdit, initialData }) => {
    
    const defaultFormData = {
        institution_id: '', 
        name: '', 
        location: '', 
        admins: [], // Array of { id, name } objects
        courses: [], // Array of { id, name } objects
    };

    const [formData, setFormData] = useState(defaultFormData);
    const [idDisabled, setIdDisabled] = useState(false);

    // Effect to handle data population for EDIT mode
    useEffect(() => {
        if (isOpen && isEdit && initialData) {
            
            // Map admin IDs back to full admin objects for the form state
            const initialAdmins = (initialData.adminIds || []).map(id => {
                const name = adminRefMap.get(id);
                return name ? { admin_id: id, name: name } : null;
            }).filter(Boolean);

            // Map course IDs back to full course objects for the form state
            const initialCourses = (initialData.courseIds || []).map(id => {
                const courseRef = availableCoursesRef.find(c => c.course_id === id);
                return courseRef ? { course_id: id, course_name: courseRef.course_name } : null;
            }).filter(Boolean);

            setFormData({
                institution_id: initialData.id,
                name: initialData.name,
                location: initialData.location,
                admins: initialAdmins,
                courses: initialCourses,
            });
            setIdDisabled(true); // Disable ID field on edit
        } else if (isOpen && !isEdit) {
            setFormData(defaultFormData);
            setIdDisabled(false);
        }
    }, [isOpen, isEdit, initialData]);


    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSelectAdmin = (admin) => {
        setFormData(prev => ({ ...prev, admins: [...prev.admins, admin] }));
    };

    const handleRemoveAdmin = (id) => {
        setFormData(prev => ({ ...prev, admins: prev.admins.filter(a => a.admin_id !== id) }));
    };
    
    const handleSelectCourse = (course) => {
        setFormData(prev => ({ ...prev, courses: [...prev.courses, course] }));
    };
    
    const handleRemoveCourse = (id) => {
        setFormData(prev => ({ ...prev, courses: prev.courses.filter(c => c.course_id !== id) }));
    };

    // UPDATED: Submit handler now calls the parent onSubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, isEdit);
        onClose(); // Close the form modal after submission
    };
    
    const title = isEdit ? `Edit Institution: ${initialData?.name || ''}` : 'Add New Institution';
    const actionText = isEdit ? 'Save Changes' : 'Save Institution';

    return (
        <div className="inst_modal_overlay">
            <div className="inst_modal_content">
                <div className="inst_modal_header">
                    <h2 className="inst_modal_title">{title}</h2>
                    <button className="inst_modal_close" onClick={onClose}>&times;</button>
                </div>
                <form className="inst_form" onSubmit={handleSubmit}>
                    
                    <div className="inst_form_group">
                        <label htmlFor="institution_id">Institution ID</label>
                        <input
                            id="institution_id"
                            type="text"
                            name="institution_id"
                            value={formData.institution_id}
                            onChange={handleChange}
                            placeholder="Unique Identifier (e.g., INST004)"
                            required
                            disabled={idDisabled}
                        />
                    </div>

                    <div className="inst_form_group">
                        <label htmlFor="name">Institution Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Apex Commerce College"
                            required
                        />
                    </div>
                    
                    <div className="inst_form_group">
                        <label htmlFor="location">Location / City</label>
                        <input
                            id="location"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Mumbai, Pune, etc."
                            required
                        />
                    </div>
                    
                    {/* Custom Multi-Select for Admins */}
                    <MultiSelectPillInput
                        label="Admins (Multiple Selection)"
                        options={availableAdmins}
                        selectedItems={formData.admins}
                        onSelect={handleSelectAdmin}
                        onRemove={handleRemoveAdmin}
                        displayKey="name"
                        valueKey="admin_id"
                    />
                    
                    {/* Custom Multi-Select for Courses */}
                    <MultiSelectPillInput
                        label="Courses Offered (Multiple Selection)"
                        options={availableCoursesRef}
                        selectedItems={formData.courses}
                        onSelect={handleSelectCourse}
                        onRemove={handleRemoveCourse}
                        displayKey="course_name"
                        valueKey="course_id"
                    />

                    <div className="inst_modal_actions">
                        <button type="button" className="inst_btn_secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="inst_btn_primary">
                            <svg className="inst_icon_prefix" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {actionText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- NEW: Confirmation/Message Modal Component ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isConfirmation, confirmText, institutionId }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(institutionId);
        onClose();
    };

    return (
        <div className="inst_modal_overlay">
            <div className={`inst_modal_content inst_confirm_modal ${isConfirmation ? 'inst_delete_confirmation' : 'inst_save_message'}`}>
                <div className="inst_modal_header">
                    <h2 className="inst_modal_title">{title}</h2>
                    <button className="inst_modal_close" onClick={onClose}>&times;</button>
                </div>
                <div className="inst_form" style={{ padding: '20px' }}>
                    <p>{message}</p>
                    <div className="inst_modal_actions" style={{ position: 'relative', borderTop: 'none', padding: 0 }}>
                        {!isConfirmation && (
                             <button type="button" className="inst_btn_primary" onClick={onClose}>
                                OK
                            </button>
                        )}
                        {isConfirmation && (
                            <>
                                <button type="button" className="inst_btn_secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="button" className="inst_action_btn inst_delete_btn" onClick={handleConfirm} style={{ padding: '8px 16px' }}>
                                    {confirmText || 'Confirm'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const InstitutionsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionsList, setInstitutionsList] = useState(initialProcessedData); 
  
  // State for Add/Edit Modal
  const [formModalState, setFormModalState] = useState({ isOpen: false, mode: 'add', data: null }); 
  
  // NEW: State for Confirmation Modal
  const [confirmModalState, setConfirmModalState] = useState({ 
      isOpen: false, 
      title: '', 
      message: '', 
      isConfirmation: false, // true for Delete, false for Save success message
      confirmAction: () => {}, // The function to run on confirm (e.g., actual delete)
      confirmText: '',
      targetId: null, // The ID of the institution being acted upon
  });
  
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const detailsPanelRef = useRef(null);

  // Auto-scroll to top on component load/re-entry
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Auto-scroll to details panel when data is selected
  useEffect(() => {
      if (selectedInstitution && detailsPanelRef.current) {
          detailsPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, [selectedInstitution]);

  const handleViewBatches = (institution) => {
    if (selectedInstitution && selectedInstitution.id === institution.id) {
        setSelectedInstitution(null);
    } else {
        setSelectedInstitution(institution);
    }
  };
  
  const handleClearDetails = () => {
      setSelectedInstitution(null);
  }

  const handleEdit = (inst) => {
    setFormModalState({ isOpen: true, mode: 'edit', data: inst });
  };

  // NEW: Actual Delete Action
  const handlePerformDelete = (id) => {
    setInstitutionsList(prevList => prevList.filter(inst => inst.id !== id));
    handleClearDetails(); // Close details panel if the deleted item was selected
    
    // Show final success message
    setConfirmModalState({
        isOpen: true,
        title: 'Institution Deleted',
        message: `Institution ID: ${id} has been successfully removed from the system.`,
        isConfirmation: false,
        confirmAction: () => {},
        confirmText: 'OK',
        targetId: null,
    });
  };

  // UPDATED: Handle Delete button click (opens confirmation modal)
  const handleDelete = (inst) => {
    setConfirmModalState({
        isOpen: true,
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${inst.name}" (ID: ${inst.id})? This action cannot be undone.`,
        isConfirmation: true,
        confirmAction: handlePerformDelete, // Pass the actual delete function
        confirmText: 'Delete Institution',
        targetId: inst.id,
    });
  };

  // Search/Filter logic (remains the same)
  const filteredInstitutions = useMemo(() => {
    if (!searchTerm) return institutionsList;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return institutionsList.filter(inst => 
      inst.name.toLowerCase().includes(lowerCaseSearch) ||
      inst.location.toLowerCase().includes(lowerCaseSearch) ||
      inst.id.toLowerCase().includes(lowerCaseSearch) ||
      inst.coursesList.toLowerCase().includes(lowerCaseSearch) ||
      inst.adminNamesList.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, institutionsList]);

  const totalInstitutions = institutionsList.length;

  // UPDATED: Handle modal submission for both Add and Edit (shows confirmation message)
  const handleModalSubmit = (formData, isEdit) => {
    const newAdminNamesList = formData.admins.map(a => a.name).join(', ') || 'N/A';
    const newAdminIds = formData.admins.map(a => a.admin_id);
    const newCoursesList = formData.courses.map(c => c.course_id).join(', ') || 'N/A';
    const newCourseIds = formData.courses.map(c => c.course_id);
    
    let message, title;
    
    if (isEdit) {
        // --- EDIT LOGIC ---
        setInstitutionsList(prevList => 
            prevList.map(inst => 
                inst.id === formData.institution_id
                    ? {
                        ...inst,
                        name: formData.name,
                        location: formData.location,
                        adminNamesList: newAdminNamesList,
                        adminIds: newAdminIds,
                        coursesList: newCoursesList,
                        courseIds: newCourseIds,
                      }
                    : inst
            )
        );
        title = 'Update Successful';
        message = `The institution "${formData.name}" (ID: ${formData.institution_id}) has been updated successfully.`;
    } else {
        // --- ADD LOGIC ---
        const newInstitution = {
            id: formData.institution_id,
            name: formData.name,
            location: formData.location,
            adminNamesList: newAdminNamesList,
            adminIds: newAdminIds,
            coursesList: newCoursesList,
            courseIds: newCourseIds,
            totalBatches: 0, 
            totalStudents: 0,
            rawInstData: {} // Placeholder for new institutions
        };
        setInstitutionsList([newInstitution, ...institutionsList]);
        title = 'Institution Added';
        message = `New institution "${formData.name}" has been added to the list.`;
    }
    
    // Show Save/Update Success Confirmation Message
    setConfirmModalState({
        isOpen: true,
        title: title,
        message: message,
        isConfirmation: false, // This is a message, not a confirmation prompt
        confirmAction: () => {},
        confirmText: 'OK',
        targetId: null,
    });
  };
  
  const handleFormModalClose = () => {
    setFormModalState({ isOpen: false, mode: 'add', data: null });
  };
  
  const handleConfirmModalClose = () => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  };


  // Get the raw data object needed for the Batches Details Panel
  const rawDataForPanel = selectedInstitution ? rawDataMap.get(selectedInstitution.id) : null;

  return (
    <>
        <div className="inst_dashboard_container">
            <header className="inst_dashboard_header">
                <h1 className="inst_main_title">Institutions<FaUniversity /></h1>
                <p className="inst_total_count">
                    Total Institutions: <span className="inst_count_value">{totalInstitutions}</span>
                </p>
            </header>

            {/* --- Action Bar: Search and Add Button --- */}
            <div className="inst_action_bar">
                <div className="inst_search_wrapper">
                    <svg className="inst_search_icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19ZM21 21L16.7 16.7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, place, course, or admin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="inst_search_input"
                    />
                </div>
                
                <button 
                    className="inst_btn_primary inst_add_button"
                    onClick={() => setFormModalState({ isOpen: true, mode: 'add', data: null })}
                >
                    <svg className="inst_icon_prefix" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Institute
                </button>
            </div>
            
            {/* --- Table View --- */}
            <h2 className="inst_section_heading">Institutions Tabular View</h2>
            <div className="inst_table_container">
                <div className="inst_table_responsive">
                    <table className="inst_institutions_table">
                        <thead>
                            <tr>
                                <th>Institute ID</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Admins</th>
                                <th>Available Courses</th>
                                <th>Total Batches</th>
                                <th>Total Students</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInstitutions.length > 0 ? (
                                filteredInstitutions.map((inst) => (
                                    <tr 
                                        key={inst.id} 
                                        className={`inst_table_row ${selectedInstitution && selectedInstitution.id === inst.id ? 'inst_row_selected' : ''}`}
                                    >
                                        <td>{inst.id}</td>
                                        <td>{inst.name}</td>
                                        <td>{inst.location}</td>
                                        <td>{inst.adminNamesList}</td>
                                        <td className="inst_courses_cell">{inst.coursesList}</td>
                                        <td>{inst.totalBatches}</td>
                                        <td>{inst.totalStudents}</td>
                                        
                                        <td className="inst_actions_cell">
                                            <button 
                                                className="inst_action_btn inst_details_btn"
                                                onClick={() => handleViewBatches(inst)}
                                            >
                                                {selectedInstitution && selectedInstitution.id === inst.id ? 'Hide Details' : 'Details'}
                                            </button>
                                            <button 
                                                className="inst_action_btn inst_edit_btn"
                                                onClick={() => handleEdit(inst)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="inst_action_btn inst_delete_btn"
                                                onClick={() => handleDelete(inst)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="inst_no_results">No institutions match your search criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* --- Details Panel RENDERED BELOW THE TABLE --- */}
            <InstitutionDetailsPanel
                ref={detailsPanelRef}
                institution={selectedInstitution}
                instRawData={rawDataForPanel}
                onClear={handleClearDetails}
            />

            {/* --- Institution Form Modal --- */}
            <InstitutionFormModal 
                isOpen={formModalState.isOpen} 
                onClose={handleFormModalClose}
                onSubmit={handleModalSubmit}
                isEdit={formModalState.mode === 'edit'}
                initialData={formModalState.data}
            />
            
            {/* --- Confirmation Modal --- */}
            <ConfirmationModal 
                isOpen={confirmModalState.isOpen}
                onClose={handleConfirmModalClose}
                onConfirm={confirmModalState.confirmAction}
                title={confirmModalState.title}
                message={confirmModalState.message}
                isConfirmation={confirmModalState.isConfirmation}
                confirmText={confirmModalState.confirmText}
                institutionId={confirmModalState.targetId}
            />

        </div>
    </>
  );
};

export default InstitutionsDashboard;