import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiEdit2, FiPlus, FiTrash2, FiAlertTriangle, FiCheckCircle, FiBookOpen, FiChevronDown } from "react-icons/fi";
import "../../Styles/SuperAdmin/CourseAndManagement.css"; // Contains all cm_ prefixed styles

// =================================================================
// 1. LOCAL IMPORT OF MATERIALS DATA
import materialsData from '../Materials.json';
// =================================================================


// --- SearchableDropdown Component (Unchanged) ---
const SearchableDropdown = ({ options, selectedValues, onToggle, label }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm(""); // Clear search when closing
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get the labels of the currently selected teachers to display as pills
    const selectedLabels = selectedValues.map(value => {
        const option = options.find(o => o.value === value);
        return option ? option.label : '';
    });
    
    // Toggle dropdown open/close
    const handleToggleDropdown = (e) => {
        e.preventDefault(); // Prevent form submission if inside a form
        setIsOpen(prev => !prev);
    };

    return (
        <div className="cm_searchable-dropdown" ref={dropdownRef}>
            <label>{label}</label>
            <div className="cm_dropdown-header" onClick={handleToggleDropdown}>
                {selectedLabels.length > 0 ? (
                    <div className="cm_pills-container">
                        {selectedLabels.map(label => (
                            <span key={label} className="cm_teacher-pill">{label}</span>
                        ))}
                    </div>
                ) : (
                    <span className="cm_placeholder-text">Select one or more instructors...</span>
                )}
                <FiChevronDown className={`cm_dropdown-icon ${isOpen ? 'open' : ''}`} />
            </div>

            {isOpen && (
                <div className="cm_dropdown-content">
                    <div className="cm_dropdown-search">
                        <FiSearch className="cm_search-icon" />
                        <input
                            type="text"
                            placeholder="Search instructors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Autofocus the search input when dropdown opens
                            autoFocus
                            onClick={(e) => e.stopPropagation()} // Keep dropdown open when clicking search input
                        />
                        {searchTerm && (
                            <FiX className="cm_clear-icon" onClick={() => setSearchTerm("")} />
                        )}
                    </div>
                    <div className="cm_checkbox-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <label key={option.value} className="cm_checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={() => onToggle(option.value)}
                                    />
                                    {option.label}
                                </label>
                            ))
                        ) : (
                            <p className="cm_no-results">No results found for "{searchTerm}"</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
// ----------------------------------------------------


// 2. DYNAMICALLY GENERATE DATA STRUCTURES FROM IMPORTED JSON

// Helper to extract unique teachers from the entire JSON structure
const getTeacherOptions = (data) => {
    const teachersMap = new Map();
    data.Materials.forEach(course => {
        course.levels.forEach(level => {
            level.batches.forEach(batch => {
                batch.subjects.forEach(subject => {
                    subject.teacher_details.forEach(teacher => {
                        if (!teachersMap.has(teacher.teacher_id)) {
                            teachersMap.set(teacher.teacher_id, {
                                value: teacher.teacher_id,
                                label: teacher.teacher_name,
                            });
                        }
                    });
                });
            });
        });
    });
    return Array.from(teachersMap.values());
};

// Helper to extract the initial streams
const getInitialStreams = (data) => {
    return data.Materials.map(course => ({
        name: course.course_id,
        label: course.course_name,
    }));
};

// Helper to map levels to their parent stream/course
const getStreamLevelsMap = (data) => {
    const streamLevelsMap = {};
    data.Materials.forEach(course => {
        streamLevelsMap[course.course_id] = course.levels.map(level => level.level_name);
    });
    return streamLevelsMap;
};


const teacherOptions = getTeacherOptions(materialsData);
const initialStreams = getInitialStreams(materialsData);
const streamLevelsMap = getStreamLevelsMap(materialsData);


const CourseManagement = () => {
  
  // Initialize state from localStorage or default to "" (No selection initially)
  const [selectedStream, setSelectedStream] = useState(
    localStorage.getItem('CM_selectedStream') || ""
  ); 
  const [selectedLevel, setSelectedLevel] = useState(
    localStorage.getItem('CM_selectedLevel') || ""
  );   
  
  const [streams, setStreams] = useState(initialStreams);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const [addLevelOpen, setAddLevelOpen] = useState(false); 
  // Initialize courseLevels based on the streamLevelsMap and current selection
  const [courseLevels, setCourseLevels] = useState(selectedStream ? streamLevelsMap[selectedStream] || [] : []); 

  const [newCourseForm, setNewCourseForm] = useState({ 
    stream: selectedStream || (initialStreams.length > 0 ? initialStreams[0].name : ''),
    level: '', 
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const levelNavRef = useRef(null); 
  const subjectTableRef = useRef(null); 

  const [formData, setFormData] = useState({
    courseName: "",
    subjectCode: "", 
    description: "",
    assignedTeachers: [],
  });

  // Effect to save state to localStorage on change
  useEffect(() => {
      if (selectedStream) localStorage.setItem('CM_selectedStream', selectedStream);
      else localStorage.removeItem('CM_selectedStream');

      if (selectedLevel) localStorage.setItem('CM_selectedLevel', selectedLevel);
      else localStorage.removeItem('CM_selectedLevel');
  }, [selectedStream, selectedLevel]);


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


  // Effect 1: Loads Levels and Subjects based on selection
  useEffect(() => {
    // === 1. Load/Filter Course Levels (Strict Hierarchy Logic) ===
    if (selectedStream) {
        // Only show levels available for the selected stream
        const levelsForStream = streamLevelsMap[selectedStream] || [];
        setCourseLevels(levelsForStream);
        
        // If a previously selected level is NOT in the new stream's levels, reset it.
        if (selectedLevel && !levelsForStream.includes(selectedLevel)) {
             setSelectedLevel("");
        }

        // Auto-scroll to levels section
        if (levelNavRef.current) {
            levelNavRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        setCourseLevels([]);
        setSelectedLevel(""); 
    }
    
    // === 2. Load Subjects ===
    if (selectedStream && selectedLevel) {
      setLoading(true);
      
      const streamData = materialsData.Materials.find(c => c.course_id === selectedStream);
      let coursesFormatted = [];
      
      if (streamData) {
        const levelData = streamData.levels.find(l => l.level_name === selectedLevel);
        
        if (levelData) {
            // Flatten subjects from all batches within the selected level
            levelData.batches.forEach(batch => {
                batch.subjects.forEach(subject => {
                    if (!coursesFormatted.some(c => c.subjectCode === subject.subject_id)) {
                         coursesFormatted.push({
                            id: subject.subject_id,
                            courseName: subject.subject_name,
                            subjectCode: subject.subject_id,
                            description: `Materials: ${subject.materials.length}, Assignments: ${subject.assignments.length}, Tests: ${subject.tests.length}`,
                            level: selectedLevel,
                            stream: selectedStream,
                            assignedTeachers: subject.teacher_details.map(t => t.teacher_id),
                        });
                    }
                });
            });
        }
      }
        
      // Simulate API call delay
      setTimeout(() => {
        setCourses(coursesFormatted);
        setLoading(false);
      }, 300);
      
      if (subjectTableRef.current) {
        subjectTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } else {
        setCourses([]); 
        setLoading(false);
    }
    
    // Sync newCourseForm stream when main selection changes
    setNewCourseForm(prev => ({
        ...prev,
        stream: selectedStream,
        level: '', // Always clear the new level input when stream changes
    }));
  }, [selectedStream, selectedLevel]);


  // Handlers for navigation clicks
  const handleStreamClick = (stream) => {
    setSelectedStream(stream);
    setSelectedLevel(""); // CRITICAL: Reset level when stream changes
    setSearchTerm("");
  };

  const handleLevelClick = (level) => {
    setSelectedLevel(level);
    setSearchTerm("");
  };
  
  // (Rest of the handlers remain unchanged as they operate on subjects)

  const handleAddSubjectClick = () => {
    if (!selectedStream || !selectedLevel) return; 
    
    setEditCourse(null); 
    setFormData({ 
        courseName: "", 
        subjectCode: "",
        description: "", 
        level: selectedLevel, 
        stream: selectedStream, 
        assignedTeachers: [] 
    });
    setAddCourseOpen(true);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stream' || name === 'level') return; 
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeacherToggle = (teacherValue) => {
    setFormData((prev) => {
      const isAssigned = prev.assignedTeachers.includes(teacherValue);
      return {
        ...prev,
        assignedTeachers: isAssigned
          ? prev.assignedTeachers.filter((t) => t !== teacherValue)
          : [...prev.assignedTeachers, teacherValue],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCourse = {
      id: editCourse ? editCourse.id : Date.now(),
      ...formData, 
      stream: selectedStream, 
      level: selectedLevel,
    };

    if (editCourse) {
      setCourses(courses.map(c => c.id === newCourse.id ? newCourse : c));
      setEditCourse(null);
    } else {
      setCourses([...courses, newCourse]);
    }

    setAddCourseOpen(false);
    setFormData({ courseName: "", subjectCode: "", description: "", assignedTeachers: [] });
  };
  
  const handleEdit = (course) => {
    setEditCourse(course);
    setFormData({
      courseName: course.courseName,
      subjectCode: course.subjectCode || "", 
      description: course.description,
      level: course.level, 
      stream: course.stream, 
      assignedTeachers: course.assignedTeachers,
    });
    setAddCourseOpen(true);
  };

  const handleDelete = (id) => {
    console.log(`Course with ID ${id} deleted.`);
    setCourses(courses.filter(course => course.id !== id));
  };
  
  const filteredCourses = courses.filter((course) => 
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === HANDLERS FOR ADD COURSE LEVEL / STREAM MODAL ===
  const handleNewCourseFormChange = (e) => {
    const { name, value } = e.target;
    setNewCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCourseLevel = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const newName = newCourseForm.level.trim();
    const isAddingLevel = !!newCourseForm.stream;

    if (!newName) {
        setError(isAddingLevel ? "Course level name cannot be empty." : "Stream/Course name cannot be empty.");
        return;
    }

    if (isAddingLevel) {
        // Adding a new Level to the selected stream
        if (courseLevels.map(l => l.toLowerCase()).includes(newName.toLowerCase())) {
            setError(`The course level "${newName}" already exists in ${newCourseForm.stream}.`);
            return;
        }
        
        // Update local component state for immediate reflection
        setCourseLevels(prevLevels => [...prevLevels, newName]);
        streamLevelsMap[newCourseForm.stream].push(newName); // Update the map source for persistence across component interaction
        
        setSelectedLevel(newName); 
        setSuccess(`New course level "${newName}" for ${newCourseForm.stream} created successfully!`);
    } else {
        // Adding a new Stream/Course
        const newStreamName = newName;
        const newStreamId = newStreamName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 5); 
        if (streams.some(s => s.name === newStreamId)) {
            setError(`A stream/course with ID ${newStreamId} already exists. Please modify the name.`);
            return;
        }
        
        const newStream = {
            name: newStreamId,
            label: newStreamName,
        };
    
        setStreams(prev => [...prev, newStream]);
        streamLevelsMap[newStreamId] = []; // Initialize empty levels for the new stream
        
        setSelectedStream(newStreamId); // Automatically select the new stream
        setSelectedLevel(""); // Clear level selection
        setSuccess(`New stream/course "${newStreamName}" created successfully!`);
    }

    setAddLevelOpen(false); 
    setNewCourseForm({ 
        stream: selectedStream || (initialStreams.length > 0 ? initialStreams[0].name : ''),
        level: '', 
        notes: '',
    });
  };

  // ============================================


  return (
    <div className="cm_wrapper">
      <div className="cm_header">
        <h1 className="cm_page-title">Course Management</h1>
      </div>

      {/* Stream Navigation Cards */}
      <div className="cm_stream-nav">
        
        <div className="cm_section-header-flex cm_bottom-border-section">
            <h3 className="cm_section-title">Select Stream</h3>
            <button 
                className="cm_btn-primary cm_btn-primary-small"
                onClick={() => {
                    setAddLevelOpen(true); 
                    setError(null);
                    setSuccess(null);
                    // Set stream to '' to trigger Add Stream mode
                    setNewCourseForm({ stream: '', level: '', notes: '' }); 
                }}
            >
                <FiPlus /> Add Course
            </button>
        </div>
        
        <div className="cm_stream-nav-container">
            <div className="cm_stream-nav-flex">
                {streams.map((stream) => (
                    <div
                        key={stream.name}
                        className={`cm_nav-card ${selectedStream === stream.name ? "selected" : ""}`}
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

      {/* Level Navigation Cards (Stream Courses) - Only displayed if selectedStream is set */}
      {selectedStream && (
        <div className="cm_level-nav" ref={levelNavRef}>
            
            <div className="cm_section-header-flex cm_bottom-border-section">
                <h3 className="cm_section-title cm_section-title-no-border">{selectedStream} Courses</h3> 
                <button 
                    className="cm_btn-primary cm_btn-primary-small"
                    onClick={() => {
                        setAddLevelOpen(true);
                        setError(null);
                        setSuccess(null);
                        // Set stream to selectedStream to trigger Add Level mode
                        setNewCourseForm(prev => ({ ...prev, level: '', stream: selectedStream, notes: '' })); 
                    }}
                >
                    <FiPlus /> Add Course Level
                </button>
            </div>
          
          <div className="cm_flex">
            {/* Renders only levels associated with the selectedStream */}
            {courseLevels.map((level) => (
              <div
                key={level}
                className={`cm_nav-card ${selectedLevel === level ? "selected_sec" : ""}`}
                onClick={() => handleLevelClick(level)}
              >
                <h3>{level}</h3>
                <p>Manage {level} Courses</p>
              </div>
            ))}
            {courseLevels.length === 0 && (
                 <p className="cm_loading-message">No levels found for this stream. Add one using the "Add Course Level" button.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Course Table - Only displayed if selectedLevel is set */}
      {selectedLevel && selectedStream && (
        <div ref={subjectTableRef}> 
        
        <div className="cm_section-header-flex cm_bottom-border-section">
          <h3 className="cm_section-title cm_section-title-no-border">{selectedStream} {selectedLevel} Subjects</h3>
          
          <div className="cm_actions"> 
            <div className="cm_search-bar" style={{ width: '240px' }}>
            <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="cm_search-icon" /> 
            </div>
            
            {selectedLevel && (
                <button 
                    className="cm_btn-primary cm_btn-primary-small"
                    onClick={handleAddSubjectClick} 
                >
                    <FiPlus /> Add Subject
                </button>
            )}
          </div>
        </div>
        
        <div className="cm_table-wrapper">
          {loading ? (
            <p className="cm_loading-message">Loading courses...</p>
          ) : filteredCourses.length === 0 ? (
            <p className="cm_loading-message">No subjects found for this level. Add a new subject using the "Add Subject" button above.</p>
          ) : (
            <div className="cm_pro-table-container">
              <table className="cm_pro-data-table">
              <thead>
                <tr>
                  <th>Subject Code</th> 
                  <th>Subject Name</th> 
                  <th>Description</th>
                  <th>Level</th>
                  <th>Assigned Teachers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.subjectCode}</td> 
                    <td>{course.courseName}</td>
                    <td>{course.description}</td>
                    <td><span className="cm_pill">{selectedStream}-{selectedLevel}</span></td>
                    <td className="cm_pill-teacher">
                      {course.assignedTeachers.map(teacherId => {
                          const teacher = teacherOptions.find(t => t.value === teacherId);
                          return teacher ? <span key={teacherId} >{teacher.label}</span> : null;
                      })}
                    </td>
                    <td>
                      <div className="cm_action-buttons">
                        <button className="cm_btn-icon edit" onClick={() => handleEdit(course)}>
                          <FiEdit2 />
                        </button>
                        <button className="cm_btn-icon cm_btn-icon-danger delete" onClick={() => handleDelete(course.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
        </div>
      )}

      {/* ORIGINAL ADD/EDIT SUBJECT MODAL (Unchanged) */}
      {addCourseOpen && (
        <div className="cm_model-overlay active" onClick={() => setAddCourseOpen(false)}>
          <div className="cm_model-content" onClick={(e) => e.stopPropagation()}>
            <div className="cm_model-header">
              <h2>{editCourse ? "Edit Subject" : "Add New Subject"}</h2>
               
              <button className="cm_model-close-btn" onClick={() => setAddCourseOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              
              <div className="cm_form-group">
                <label>Stream</label>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream || selectedStream} 
                  disabled 
                  className="cm_input-disabled"
                />
              </div>

              <div className="cm_form-group">
                <label>Linked Course</label>
                <input
                  type="text"
                  name="level"
                  value={`${formData.stream || selectedStream} ${formData.level || selectedLevel}`}
                  disabled
                  className="cm_input-disabled"
                />
              </div>
              
              <div className="cm_form-group">
                <label>Subject Name</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="cm_form-group">
                <label>Subject Code</label>
                <input
                  type="text"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleFormChange}
                  placeholder="e.g., CA-101"
                  required
                />
              </div>

              <div className="cm_form-group">
                <label>Description (Notes)</label> 
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>

              <div className="cm_form-group">
                <SearchableDropdown
                    options={teacherOptions}
                    selectedValues={formData.assignedTeachers}
                    onToggle={handleTeacherToggle}
                    label="Assign Instructors"
                />
              </div>
              
              <div className="cm_modal-actions">
                <button type="button" className="cm_btn-outline" onClick={() => setAddCourseOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="cm_btn-primary">
                  {editCourse ? <><FiEdit2 /> Save Changes</> : <><FiPlus /> Add Subject</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* === ADD COURSE LEVEL / STREAM POPUP (Adjusted for strict hierarchy) === */}
      {addLevelOpen && (
          <div className={`cm_model-overlay active`} 
               onClick={() => setAddLevelOpen(false)}
          >
              <div className="cm_model-content" onClick={(e) => e.stopPropagation()}>
                  <div className="cm_model-header">
                      <h2>{newCourseForm.stream ? "Add New Course Level" : "Add New Stream (Course)"}</h2>
                      <button className="cm_model-close-btn" onClick={() => setAddLevelOpen(false)}>
                          <FiX />
                      </button>
                  </div>

                  {error && (
                      <div className="cm_feedback error">
                          <FiAlertTriangle /> {error}
                      </div>
                  )}
                  {success && (
                      <div className="cm_feedback success">
                          <FiCheckCircle /> {success}
                      </div>
                  )}

                  <form onSubmit={handleAddNewCourseLevel} className="cm_modal-form">
                      {/* Stream Selection/Display - Only shows if a stream is selected (for adding a Level) */}
                      {newCourseForm.stream && (
                          <div className="cm_form-group">
                              <label>Stream</label>
                              <select
                                  name="stream"
                                  value={newCourseForm.stream}
                                  onChange={handleNewCourseFormChange}
                                  required
                                  disabled 
                                  className="cm_input-disabled"
                              >
                                {streams.map(s => (
                                    <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                          </div>
                      )}
                      
                      <div className="cm_form-group">
                          <label>{newCourseForm.stream ? "New Course Level Name" : "New Stream/Course Name"}</label>
                          <input
                              type="text"
                              name="level" 
                              value={newCourseForm.level}
                              onChange={handleNewCourseFormChange}
                              placeholder={newCourseForm.stream ? "Enter New Level Name (e.g., Executive, Final)" : "Enter New Stream Name (e.g., CA, CS, CMA)"}
                              required
                          />
                      </div>
                      
                      <div className="cm_form-group">
                          <label>Notes</label>
                          <textarea
                              name="notes" 
                              value={newCourseForm.notes || ''} 
                              onChange={handleNewCourseFormChange}
                              placeholder="Add a brief note or description (optional)."
                          />
                      </div>


                      <div className="cm_modal-actions">
                          <button type="button"
                              className="cm_btn-outline"
                              onClick={() => setAddLevelOpen(false)}>
                              Cancel
                          </button>
                          <button type="submit"
                              className="cm_btn-primary">
                              <FiPlus/> Save {newCourseForm.stream ? "Level" : "Stream"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default CourseManagement;