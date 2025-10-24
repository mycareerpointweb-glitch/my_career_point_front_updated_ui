import React, { useState, useEffect, useRef } from "react";
import { 
    FiSearch, FiX, FiPlus, FiChevronLeft, FiChevronRight, 
    FiCheckCircle, FiBookOpen, FiTrash2, 
    FiEdit2, FiFileText, FiFile, FiImage, FiList, FiGrid, 
    FiAlertTriangle, FiBriefcase, FiUpload, FiLink, FiCalendar, FiGlobe
} from "react-icons/fi"; 
import "../../Styles/SuperAdmin/MaterialsManagement.css"; 

// --- Import JSON Data LOCALLY ---
import mockDataJson from '../Materials.json'; 

// --- Data Normalization and Processing ---
const normalizeData = (jsonData) => {
    const streams = [];
    const levels = {};
    const batches = [];
    const subjects = [];
    const documents = []; 

    let subjectIdCounter = 1000; 
    let docIdCounter = 10000; 
    let batchIdCounter = 100;

    jsonData.Materials.forEach(course => {
        streams.push({
            id: course.course_id.toLowerCase(),
            name: course.course_name,
            icon: course.course_id === 'CA' ? FiBookOpen : FiBriefcase,
        });

        levels[course.course_id.toLowerCase()] = [];

        course.levels.forEach(level => {
            const levelId = level.level_id.toLowerCase();
            levels[course.course_id.toLowerCase()].push({
                id: levelId,
                name: level.level_name,
                description: `Materials for ${level.level_name} in ${course.course_name}`,
                streamId: course.course_id.toLowerCase(),
            });

            level.batches.forEach(batch => {
                const uniqueBatchId = batchIdCounter++;

                batches.push({
                    id: uniqueBatchId,
                    batchId: batch.batch_id,
                    name: batch.batch_name,
                    streamId: course.course_id.toLowerCase(),
                    levelId: levelId,
                });

                batch.subjects.forEach(subject => {
                    const uniqueSubjectId = subjectIdCounter++;

                    subjects.push({
                        id: uniqueSubjectId, 
                        code: `${course.course_id.toUpperCase()}-${level.level_name.substring(0, 1)}-${subject.subject_id}`,
                        name: subject.subject_name,
                        streamId: course.course_id.toLowerCase(),
                        levelId: levelId,
                        batchId: uniqueBatchId, 
                        teacherDetails: subject.teacher_details,
                    });

                    subject.materials.forEach(material => {
                        documents.push({
                            id: docIdCounter++, 
                            subjectId: uniqueSubjectId, 
                            name: material.title,
                            type: material.type === 'video' ? 'mp4' : material.type,
                            size: `${(Math.random() * 10 + 1).toFixed(1)} MB`, 
                            uploaded: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
                            description: `Comprehensive material on ${material.title}.`,
                            isDownloadable: Math.random() > 0.1,
                            isLink: material.title.toLowerCase().includes('link') || Math.random() > 0.85, 
                        });
                    });
                });
            });
        });
    });

    const batchesByLevel = batches.reduce((acc, batch) => {
        acc[batch.levelId] = acc[batch.levelId] || [];
        acc[batch.levelId].push(batch);
        return acc;
    }, {});


    return { streams, levels, batches, batchesByLevel, subjects, documents };
};

// --- Execute Normalization Once at Import ---
const normalizedData = normalizeData(mockDataJson);

// --- Helper function to get the correct icon ---
const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'jpg':
        case 'png':
        case 'jpeg': 
            return FiImage;
        case 'pdf': 
        case 'docx':
        case 'doc': 
        case 'pptx':
        case 'ppt': 
        case 'txt': 
        case 'xlsx': 
            return FiFileText;
        case 'mp4': 
        case 'video':
            return FiFileText;
        case 'link': 
             return FiLink;
        default: 
            return FiFile;
    }
};

// --- Confirmation Modal (Unchanged) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    
    return (
        <div className="mm_model-overlay active">
            <div className="mm_confirm-modal-content">
                <div className="mm_confirm-modal-header">
                    <h2>{title}</h2>
                    <button className="mm_model-close-btn" onClick={onCancel}>
                        <FiX />
                    </button>
                </div>
                <div className="mm_confirm-modal-body">
                    <FiAlertTriangle size={36} className="mm_confirm-icon" />
                    <p>{message}</p>
                </div>
                <div className="mm_modal-actions">
                    <button type="button" className="mm_btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="mm_btn-danger" onClick={onConfirm}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Re-usable Slider Component (Batch & Subject) (Unchanged) ---
const CardSlider = ({ title, cards, selectedCard, onSelect, searchPlaceholder }) => {
    const sliderRef = useRef(null);
    const [showLeftControl, setShowLeftControl] = useState(false);
    const [showRightControl, setShowRightControl] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredCards = cards.filter(card => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        if (card.name.toLowerCase().includes(lowerSearchTerm)) return true;
        if (card.code && String(card.code).toLowerCase().includes(lowerSearchTerm)) return true;
        if (card.batchId !== undefined && String(card.batchId).toLowerCase().includes(lowerSearchTerm)) return true;
        
        return false;
    });

    const checkScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setShowLeftControl(scrollLeft > 0);
            setShowRightControl(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 5);
        }
    };
    
    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        checkScroll();
        if (sliderRef.current) {
            sliderRef.current.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (sliderRef.current) {
                sliderRef.current.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [filteredCards]); 

    return (
        <div className="mm_subject-selection-container">
            <div className="mm_section-header-flex mm_bottom-border-section">
                <h2 className="mm_section-title-no-border">{title}</h2>
                <div className="mm_subject-search-bar mm_search-bar">
                    <FiSearch className="mm_search-icon" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && <FiX className="mm_clear-icon" onClick={() => setSearchTerm('')} />}
                </div>
            </div>

            <div className="mm_slider-wrapper">
                {showLeftControl && (
                    <div className="mm_slider-control left" onClick={() => scroll('left')}>
                        <FiChevronLeft size={20} />
                    </div>
                )}
                
                <div className="mm_slider-content" ref={sliderRef}>
                    {filteredCards.length > 0 ? (
                        filteredCards.map(card => (
                            <div 
                                key={card.id} 
                                className={`mm_subject-card ${selectedCard && selectedCard.id === card.id ? `selcted`: ''}`}
                                onClick={() => onSelect(card)}
                            >
                                <p className="mm_subject-code">{card.code || card.batchId}</p> 
                                <h4>{card.name}</h4>
                                {selectedCard && selectedCard.id === card.id && 
                                    <FiCheckCircle size={20} className={`${selectedCard && selectedCard.id === card.id ? `selcted`: ''}`} style={{marginTop: '10px'}} />
                                }
                            </div>
                        ))
                    ) : (
                        <div className="mm_no-results">No {title.toLowerCase()} found matching "{searchTerm}".</div>
                    )}
                </div>

                {showRightControl && (
                    <div className="mm_slider-control right" onClick={() => scroll('right')}>
                        <FiChevronRight size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- UPDATED Component: Material Form Modal (used for both Add and Edit) ---
const MaterialFormModal = ({ isOpen, onClose, context, onSubmit, materialData, onEdit }) => {
    
    // Helper function to extract name/link from mock data for pre-filling
    const getInitialUploadDetails = () => {
        if (!materialData) {
            return { uploadType: 'file', file: null, driveLink: '' };
        }
        
        const type = (materialData.type || '').toLowerCase();
        
        if (materialData.isLink || type === 'link') {
            return { uploadType: 'link', file: null, driveLink: `https://mock.drive.link/for/${materialData.id}` };
        } else {
            const sizeInBytes = parseFloat(materialData.size) * 1024 * 1024;
            // Mock object to represent the pre-filled file
            return { 
                uploadType: 'file', 
                file: { name: `${materialData.name}.${type}`, size: sizeInBytes, type: `application/${type}` }, 
                driveLink: '' 
            };
        }
    }
    
    // State initialization, using materialData for pre-fill
    const initialDetails = getInitialUploadDetails();
    
    const [materialName, setMaterialName] = useState(materialData ? materialData.name : '');
    const [description, setDescription] = useState(materialData?.description || ''); 
    const [uploadType, setUploadType] = useState(initialDetails.uploadType); 
    const [file, setFile] = useState(initialDetails.file); 
    const [driveLink, setDriveLink] = useState(initialDetails.driveLink);
    const [startDate, setStartDate] = useState(materialData ? '2024-01-01' : ''); 
    const [endDate, setEndDate] = useState(materialData ? '2024-12-31' : '');
    const [isDownloadable, setIsDownloadable] = useState(materialData?.isDownloadable ?? true); 

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 104857600) {
                 alert("File size exceeds 100 MB limit.");
                 setFile(null);
                 e.target.value = null;
            } else {
                setFile(selectedFile);
            }
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const isFileOrLinkMissing = (uploadType === 'file' && !file) || (uploadType === 'link' && !driveLink);
        
        if (!materialName || !startDate || !endDate || isFileOrLinkMissing) {
            alert("Please fill all required fields and ensure a file or link is provided.");
            return;
        }

        const dataToSubmit = {
            materialName,
            description,
            startDate,
            endDate,
            isDownloadable,
            uploadDetails: uploadType === 'file' 
                ? { 
                    type: 'file', 
                    file: file.name, 
                    size: (file.size / 1048576).toFixed(2) + ' MB'
                } 
                : { type: 'link', link: driveLink },
        };
        
        if (materialData) {
            onEdit({ ...materialData, ...dataToSubmit });
        } else {
            onSubmit({ ...context, ...dataToSubmit });
        }

        onClose();
    };

    const getFileThumbnail = () => {
        if (!file) return <div className="mm_thumbnail-placeholder">No File Selected</div>;
        
        if (file instanceof File && file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt="Thumbnail" className="mm_thumbnail-preview-img" />;
        }
        
        const extension = file.name.split('.').pop() || 'file';
        const FileIcon = getFileIcon(extension);
        
        return <FileIcon size={40} className="mm_thumbnail-icon" />;
    };


    const { selectedStream, selectedLevel, selectedBatch, selectedSubject } = context;
    const modalTitle = materialData ? 'Edit Material' : 'Add New Material';

    return (
        <div className="mm_model-overlay active">
            <div className="mm_add-material-modal-content">
                <div className="mm_modal-header">
                    <h2>{materialData ? <FiEdit2/> : <FiPlus/>} {modalTitle}</h2>
                    <button className="mm_model-close-btn" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit} className="mm_modal-form">
                    
                    {/* Non-Editable Context */}
                    <div className="mm_non-editable-context">
                        <div className="mm_context-item"><FiBookOpen/> <strong>Stream:</strong> {selectedStream?.name}</div>
                        <div className="mm_context-item"><FiList/> <strong>Level:</strong> {selectedLevel?.name}</div>
                        <div className="mm_context-item"><FiBriefcase/> <strong>Batch:</strong> {selectedBatch?.name}</div>
                        <div className="mm_context-item"><FiFileText/> <strong>Subject:</strong> {selectedSubject?.name} ({selectedSubject?.code})</div>
                    </div>

                    <div className="mm_form-group">
                        <label>Material Name *</label>
                        <input 
                            type="text" 
                            value={materialName} 
                            onChange={(e) => setMaterialName(e.target.value)} 
                            required 
                            placeholder="e.g., Chapter 1 Notes (PDF)"
                        />
                    </div>
                    
                    <div className="mm_form-group">
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Brief summary of the material content."
                        />
                    </div>

                    <div className="mm_upload-section">
                        <h4>Upload Content *</h4>
                        <div className="mm_toggle-switch-group">
                             <button type="button" 
                                className={`mm_btn-toggle ${uploadType === 'file' ? 'mm_active' : ''}`}
                                onClick={() => setUploadType('file')}>
                                <FiUpload/> Upload File
                             </button>
                             <button type="button" 
                                className={`mm_btn-toggle ${uploadType === 'link' ? 'mm_active' : ''}`}
                                onClick={() => setUploadType('link')}>
                                <FiLink/> Drive Link
                             </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div className="mm_upload-file-container">
                                <label className="mm_upload-file-btn">
                                    <FiUpload size={18} /> Choose File (Max 100 MB)
                                    <input type="file" onChange={handleFileChange} style={{display: 'none'}} /> 
                                </label>
                                <div className="mm_file-status">
                                    {file ? `Selected: ${file.name}` : 'No file selected.'}
                                </div>
                                <div className="mm_thumbnail-preview">
                                    {getFileThumbnail()}
                                </div>
                            </div>
                        ) : (
                            <div className="mm_form-group">
                                <input 
                                    type="url" 
                                    value={driveLink} 
                                    onChange={(e) => setDriveLink(e.target.value)} 
                                    required={uploadType === 'link'}
                                    placeholder="Paste Google Drive/Cloud Link here"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="mm_date-section">
                         <div className="mm_form-group mm_date-group">
                            <label><FiCalendar/> Starting Date *</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </div>
                        <div className="mm_form-group mm_date-group">
                            <label><FiCalendar/> Ending Date *</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                        </div>
                    </div>
                    
                    <div className="mm_form-group mm_download-toggle-group">
                        <label><FiGlobe/> Download Visibility</label>
                        <div className="mm_toggle-container">
                            <span className="mm_toggle-label">Allow Download</span>
                            <label className="mm_switch">
                                <input 
                                    type="checkbox" 
                                    checked={isDownloadable} 
                                    onChange={(e) => setIsDownloadable(e.target.checked)} 
                                />
                                <span className="mm_slider mm_round"></span>
                            </label>
                            <span className="mm_toggle-state">{isDownloadable ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                    
                    <div className="mm_modal-actions">
                        <button type="button" className="mm_btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="mm_btn-primary">
                            {materialData ? <FiEdit2/> : <FiPlus/>} {materialData ? 'Save Changes' : 'Add Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- NEW Component: Explorer Material View (Basic Mock Implementation) ---
const ExplorerMaterialView = ({ materials, triggerMaterialEdit, triggerSingleDelete, handleSelectMaterial, selectedMaterials }) => {
    return (
        <div className="mm_explorer-grid-container">
            {materials.map(material => {
                const type = material.type ? material.type.toLowerCase() : 'file'; 
                const FileIcon = getFileIcon(type);
                const isSelected = selectedMaterials.has(material.id);

                return (
                    <div key={material.id} className={`mm_explorer-card ${isSelected ? 'mm_selected-card' : ''}`}>
                        <div className="mm_card-header">
                            <label className="mm_custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => handleSelectMaterial(material.id)}
                                />
                                <span className="mm_checkmark"></span>
                            </label>
                            <div className="mm_card-actions-top">
                                <button 
                                    className="mm_action-btn mm_action-edit" 
                                    onClick={() => triggerMaterialEdit(material)}
                                    title="Edit Material Details"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <button 
                                    className="mm_action-btn mm_action-delete" 
                                    onClick={() => triggerSingleDelete(material.id)} 
                                    title="Delete File"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="mm_card-icon-main">
                            <FileIcon size={48} className={`mm_file-icon mm_file-icon-${type}`} />
                        </div>
                        
                        <p className="mm_card-name" title={`${material.name}.${type}`}>
                            {material.name.length > 20 ? material.name.substring(0, 18) + '...' : material.name}.{type}
                        </p>
                        <p className="mm_card-meta">{material.size} | {material.uploaded}</p>
                    </div>
                );
            })}
        </div>
    );
};


// --- Sub-Component for Document Listing (Controller) ---
const SubjectMaterialList = ({ subject, context }) => { 
    const initialMaterials = normalizedData.documents.filter(doc => doc.subjectId === subject.id);
    const [materials, setMaterials] = useState(initialMaterials);
    const [selectedMaterials, setSelectedMaterials] = useState(new Set());
    const [isRenaming, setIsRenaming] = useState(null); 
    const [newName, setNewName] = useState('');
    const [viewMode, setViewMode] = useState('table'); 
    
    // States for Modals/Editing
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [materialToEdit, setMaterialToEdit] = useState(null); 

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteCandidateId, setDeleteCandidateId] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    useEffect(() => {
        setMaterials(normalizedData.documents.filter(doc => doc.subjectId === subject.id));
        setSelectedMaterials(new Set());
        setIsRenaming(null);
    }, [subject]);

    const handleMaterialUpload = (newMaterial) => {
        // Mock Material Insertion Logic
        const newMockMaterial = {
            id: Date.now(),
            subjectId: newMaterial.selectedSubject.id,
            name: newMaterial.materialName,
            type: newMaterial.uploadDetails.type === 'file' ? newMaterial.uploadDetails.file.split('.').pop() : 'link',
            size: newMaterial.uploadDetails.size || 'N/A', 
            uploaded: new Date().toISOString().slice(0, 10),
            description: newMaterial.description,
            isDownloadable: newMaterial.isDownloadable,
            isLink: newMaterial.uploadDetails.type === 'link',
        };
        setMaterials(prev => [newMockMaterial, ...prev]);
        alert(`Successfully added material: ${newMockMaterial.name}`);
    };
    
    const handleMaterialEdit = (editedMaterial) => {
        // Mock Material Update Logic
        setMaterials(prev => prev.map(m => 
            m.id === editedMaterial.id 
            ? { 
                ...m, 
                name: editedMaterial.materialName,
                type: editedMaterial.uploadDetails.type === 'file' 
                    ? editedMaterial.uploadDetails.file.split('.').pop() 
                    : 'link',
                size: editedMaterial.uploadDetails.size || m.size,
                description: editedMaterial.description,
                isDownloadable: editedMaterial.isDownloadable,
                isLink: editedMaterial.uploadDetails.type === 'link',
            } 
            : m
        ));
        alert(`Successfully updated material: ${editedMaterial.materialName}`);
        closeEditModal();
    };

    const triggerMaterialEdit = (material) => {
        setMaterialToEdit(material);
        setIsEditModalOpen(true);
    };
    
    const closeEditModal = () => {
        setMaterialToEdit(null);
        setIsEditModalOpen(false);
    };


    const filteredMaterials = materials.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMaterialById = (id) => materials.find(m => m.id === id);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = materials.map(m => m.id);
            setSelectedMaterials(new Set(allIds));
        } else {
            setSelectedMaterials(new Set());
        }
    };
    
    const handleSelectMaterial = (id) => {
        setSelectedMaterials(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const triggerSingleDelete = (id) => {
        setDeleteCandidateId(id);
        setIsBulkDelete(false);
        setIsConfirmModalOpen(true);
    };

    const triggerBulkDelete = () => {
        if (selectedMaterials.size === 0) return;
        setDeleteCandidateId(null);
        setIsBulkDelete(true);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (isBulkDelete) {
            setMaterials(prev => prev.filter(m => !selectedMaterials.has(m.id)));
            setSelectedMaterials(new Set());
        } else if (deleteCandidateId) {
            setMaterials(prev => prev.filter(m => m.id !== deleteCandidateId));
            setSelectedMaterials(prev => {
                const newSet = new Set(prev);
                newSet.delete(deleteCandidateId);
                return newSet;
            });
        }
        closeConfirmModal();
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setDeleteCandidateId(null);
        setIsBulkDelete(false);
    };

    const handleRenameStart = (material) => {
        const fileName = material.name;
        setIsRenaming(material.id);
        setNewName(fileName);
    };

    const handleRenameSubmit = (id) => {
        if (newName.trim() === "") {
             return;
        }
        
        setMaterials(prev => prev.map(m => 
            m.id === id ? { ...m, name: newName.trim() } : m
        ));
        setIsRenaming(null);
        setNewName('');
    };

    const isAllSelected = materials.length > 0 && selectedMaterials.size === materials.length;
    const isIndeterminate = selectedMaterials.size > 0 && selectedMaterials.size < materials.length;
    
    const selectedMaterialPills = Array.from(selectedMaterials)
        .map(id => getMaterialById(id))
        .filter(m => m !== undefined); 


    return (
        <div className="mm_material-list-container">
            <div className="mm_section-header-flex">
                 <h2 className="mm_section-title-no-border">Materials for: {subject.code} - {subject.name}</h2>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}> 
                    <button 
                        className="mm_btn-primary"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <FiPlus /> Add Materials
                    </button>

                    <div className="mm_view-toggle">
                        <button 
                            className={`mm_view-btn ${viewMode === 'table' ? 'mm_active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <FiList size={20} /> Table View
                        </button>
                        <button 
                            className={`mm_view-btn ${viewMode === 'explore' ? 'mm_active' : ''}`}
                            onClick={() => setViewMode('explore')}
                            title="Matrix View (File Explorer)"
                        >
                            <FiGrid size={20} /> Explorer View
                        </button>
                    </div>
                 </div>
            </div>
            
            <div className="mm_subject-search-bar mm_search-bar mm_material-search-bar">
                <FiSearch className="mm_search-icon" />
                <input
                    type="text"
                    placeholder="Search material name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <FiX className="mm_clear-icon" onClick={() => setSearchTerm('')} />}
            </div>

            {selectedMaterialPills.length > 0 && (
                <div className="mm_selection-pills-container">
                    <span className="mm_pills-label">Selected Files ({selectedMaterialPills.length}):</span>
                    {selectedMaterialPills.map(material => (
                        <div key={material.id} className="mm_selection-pill">
                            <span title={`${material.name}.${material.type || ''}`}>{material.name}.{(material.type || '').toLowerCase()}</span>
                            <FiX size={14} className="mm_pill-cancel" onClick={() => handleSelectMaterial(material.id)} />
                        </div>
                    ))}
                </div>
            )}
            
            
            {filteredMaterials.length === 0 && materials.length > 0 ? (
                <div className="mm_empty-state">
                    <p>No materials found matching "{searchTerm}".</p>
                </div>
            ) : filteredMaterials.length === 0 && materials.length === 0 ? (
                <div className="mm_empty-state">
                    <p>No materials have been uploaded for this subject yet.</p>
                    <button className="mm_btn-primary" style={{marginTop: '15px'}} onClick={() => setIsUploadModalOpen(true)}>
                        <FiPlus/> Upload First Material
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                <div className="mm_table-responsive-container"> 
                    <table className="mm_material-table">
                        <thead>
                            <tr>
                                <th className="mm_checkbox-col">
                                    <label className="mm_custom-checkbox">
                                        <input 
                                            type="checkbox" 
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            ref={el => el && (el.indeterminate = isIndeterminate)}
                                        />
                                        <span className="mm_checkmark"></span>
                                    </label>
                                </th>
                                <th>File Name</th>
                                <th className="mm_size-col">Size</th>
                                <th className="mm_date-col">Uploaded</th>
                                <th className="mm_actions-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map(material => {
                                const type = material.type ? material.type.toLowerCase() : 'file'; 
                                const FileIcon = getFileIcon(type);
                                const isCurrentRenaming = isRenaming === material.id;
                                
                                return (
                                    <tr key={material.id} className={selectedMaterials.has(material.id) ? 'mm_selected-row' : ''}>
                                        <td className="mm_checkbox-col">
                                            <label className="mm_custom-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedMaterials.has(material.id)}
                                                    onChange={() => handleSelectMaterial(material.id)}
                                                />
                                                <span className="mm_checkmark"></span>
                                            </label>
                                        </td>
                                        <td className="mm_filename-col">
                                            <FileIcon size={20} className={`mm_file-icon mm_file-icon-${type}`} />
                                            
                                            {isCurrentRenaming ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="mm_rename-input"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        onBlur={() => handleRenameSubmit(material.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRenameSubmit(material.id);
                                                            if (e.key === 'Escape') setIsRenaming(null);
                                                        }}
                                                        autoFocus
                                                    />
                                                    <span className="mm_file-extension">.{type}</span>
                                                </>
                                            ) : (
                                                <span>{material.name}.{type}</span>
                                            )}
                                        </td>
                                        <td className="mm_size-col">{material.size}</td>
                                        <td className="mm_date-col">{material.uploaded}</td>
                                        <td className="mm_actions-col">
                                            <div className="mm_table-actions-group">
                                                
                                                {isCurrentRenaming ? (
                                                    <button 
                                                        className="mm_action-btn mm_action-save" 
                                                        onClick={() => handleRenameSubmit(material.id)}
                                                        title="Save Rename"
                                                    >
                                                        <FiCheckCircle size={18} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="mm_action-btn mm_action-edit" 
                                                        onClick={() => triggerMaterialEdit(material)}
                                                        title="Edit Material Details (Opens Modal)"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                )}
                                                
                                                {!isCurrentRenaming && (
                                                    <button 
                                                        className="mm_action-btn mm_action-edit" 
                                                        onClick={() => handleRenameStart(material)}
                                                        title="Quick Rename"
                                                        style={{marginLeft: '5px'}}
                                                    >
                                                        <FiFileText size={18} /> 
                                                    </button>
                                                )}
                                                
                                                <button 
                                                    className="mm_action-btn mm_action-delete" 
                                                    onClick={() => triggerSingleDelete(material.id)} 
                                                    title="Delete File"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Explorer Material View (Now Implemented)
                <ExplorerMaterialView 
                    materials={filteredMaterials}
                    triggerMaterialEdit={triggerMaterialEdit}
                    triggerSingleDelete={triggerSingleDelete}
                    handleSelectMaterial={handleSelectMaterial}
                    selectedMaterials={selectedMaterials}
                />
            )}
            
            {selectedMaterials.size > 0 && (
                <div className="mm_bulk-actions">
                    <span>{selectedMaterials.size} files selected:</span>
                    <button className="mm_btn-outline mm_btn-small mm_btn-danger-outline" onClick={triggerBulkDelete}>
                        <FiTrash2 size={14} /> Bulk Delete
                    </button>
                </div>
            )}

            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                title={isBulkDelete ? `Confirm Bulk Delete` : `Confirm Delete: ${deleteCandidateId ? getMaterialById(deleteCandidateId)?.name : ''}`}
                message={isBulkDelete 
                    ? `Are you sure you want to permanently delete ${selectedMaterials.size} files? This action cannot be undone.`
                    : `Are you sure you want to permanently delete the file "${deleteCandidateId ? getMaterialById(deleteCandidateId)?.name : ''}"?`
                }
                onConfirm={confirmDelete}
                onCancel={closeConfirmModal}
            />

            {/* Modal for ADDING */}
            <MaterialFormModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                context={context}
                onSubmit={handleMaterialUpload}
                materialData={null}
                onEdit={() => {}} 
            />
            
            {/* Modal for EDITING */}
            <MaterialFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                context={context}
                onSubmit={() => {}} 
                materialData={materialToEdit}
                onEdit={handleMaterialEdit}
            />
        </div>
    );
};

// --- Main Component ---
const MaterialManagement = (props) => {
    
    const { userRole = 'SuperAdmin' } = props; 
    
    // --- Initial State Calculation for 'Student' Role ---
    let initialStream = null;
    let initialLevel = null;
    let initialBatch = null;
    
    let initialFilteredLevels = [];
    let initialFilteredBatches = [];
    let initialFilteredSubjects = []; 

    if (userRole === 'Student' && normalizedData.streams.length > 0) {
        // 1. Pre-select the first Stream
        initialStream = normalizedData.streams[0]; 
        
        if (initialStream) {
            // 2. Filter levels for the stream and pre-select the first Level
            initialFilteredLevels = normalizedData.levels[initialStream.id] || [];
            initialLevel = initialFilteredLevels[0] || null;
            
            if (initialLevel) {
                // 3. Filter batches for the level and pre-select the first Batch
                initialFilteredBatches = normalizedData.batchesByLevel[initialLevel.id] || [];
                initialBatch = initialFilteredBatches[0] || null;
                
                // 4. Filter subjects for the batch (DO NOT SELECT SUBJECT)
                if (initialBatch) {
                    // This sets the subjects list for display, but doesn't select one
                    initialFilteredSubjects = normalizedData.subjects.filter(s => s.batchId === initialBatch.id);
                }
            }
        }
    }

    // State Hooks for Selection
    const [selectedStream, setSelectedStream] = useState(initialStream);
    const [selectedLevel, setSelectedLevel] = useState(initialLevel);
    const [selectedBatch, setSelectedBatch] = useState(initialBatch);
    // selectedSubject MUST start as NULL to avoid auto-selection.
    const [selectedSubject, setSelectedSubject] = useState(null); 
    
    // State Hooks for Filtered Lists
    const [filteredLevels, setFilteredLevels] = useState(initialFilteredLevels);
    const [filteredBatches, setFilteredBatches] = useState(initialFilteredBatches);
    const [filteredSubjects, setFilteredSubjects] = useState(initialFilteredSubjects);
    
    const materialListRef = useRef(null); 
    
    useEffect(() => {
        if (selectedSubject && materialListRef.current) {
            materialListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedSubject]);


    // --- Handlers for User Interaction (Corrected logic) ---

    const handleStreamSelect = (stream) => {
        // Clear all lower selections
        const isDeselecting = selectedStream && selectedStream.id === stream.id;

        if (isDeselecting) {
            setSelectedStream(null);
            setSelectedLevel(null);
            setSelectedBatch(null);
            setSelectedSubject(null);
            setFilteredLevels([]);
            setFilteredBatches([]);
            setFilteredSubjects([]);
        } else {
            setSelectedStream(stream);
            setSelectedLevel(null);
            setSelectedBatch(null);
            setSelectedSubject(null);

            const nextLevels = normalizedData.levels[stream.id] || [];
            setFilteredLevels(nextLevels);
            setFilteredBatches([]);
            setFilteredSubjects([]);
            
            // AUTO-SELECT LOGIC FOR STUDENT ON CHANGE
            if (userRole === 'Student' && nextLevels.length > 0) {
                const firstLevel = nextLevels[0];
                setSelectedLevel(firstLevel);
                
                const nextBatches = normalizedData.batchesByLevel[firstLevel.id] || [];
                setFilteredBatches(nextBatches);
                
                if (nextBatches.length > 0) {
                    const firstBatch = nextBatches[0];
                    setSelectedBatch(firstBatch);
                    setFilteredSubjects(normalizedData.subjects.filter(s => s.batchId === firstBatch.id));
                }
            }
        }
    };

    const handleLevelSelect = (level) => {
        const isDeselecting = selectedLevel && selectedLevel.id === level.id;

        if (isDeselecting) {
            setSelectedLevel(null);
            setSelectedBatch(null);
            setSelectedSubject(null);
            setFilteredBatches([]);
            setFilteredSubjects([]);
        } else {
            setSelectedLevel(level);
            setSelectedBatch(null);
            setSelectedSubject(null);
            
            const nextBatches = normalizedData.batchesByLevel[level.id] || [];
            setFilteredBatches(nextBatches);
            setFilteredSubjects([]);
            
            // AUTO-SELECT LOGIC FOR STUDENT ON CHANGE
            if (userRole === 'Student' && nextBatches.length > 0) {
                const firstBatch = nextBatches[0];
                setSelectedBatch(firstBatch);
                setFilteredSubjects(normalizedData.subjects.filter(s => s.batchId === firstBatch.id));
            }
        }
    };
    
    const handleBatchSelect = (batch) => {
        const isDeselecting = selectedBatch && selectedBatch.id === batch.id;
        
        if (isDeselecting) {
            setSelectedBatch(null);
            setSelectedSubject(null);
            setFilteredSubjects([]);
        } else {
            setSelectedBatch(batch);
            // CRUCIAL: Must be explicitly set to null here to prevent selection
            setSelectedSubject(null); 
            
            // Load the subjects for the selected batch
            const subjects = normalizedData.subjects.filter(
                s => s.batchId === batch.id
            );
            setFilteredSubjects(subjects);
        }
    };

    const handleSubjectSelect = (subject) => {
        if (selectedSubject && selectedSubject.id === subject.id) {
            setSelectedSubject(null);
        } else {
            setSelectedSubject(subject);
        }
    };

    return (
        <div className="mm_wrapper">
            <div className="mm_header">
                <h1 className="mm_page-title">Material & Subject Management</h1>
            </div>
            
            {/* STEP 1: Stream Selection */}
            {selectedStream && userRole 
            !== 'Student' &&(<>
                <h2 className="mm_section-title">Stream</h2>
                <div className="mm_stream-nav-flex">
                    {normalizedData.streams.map(stream => {
                        const StreamIcon = stream.icon;
                        const isSelected = selectedStream && selectedStream.id === stream.id;
                        const selectedClass = isSelected ? `selected-${stream.id}` : '';
                        
                        return (
                            <div 
                                key={stream.id}
                                className={`mm_stream-pill ${selectedClass}`}
                                onClick={() => handleStreamSelect(stream)}
                            >
                                <StreamIcon size={20} />
                                {stream.name}
                                {isSelected && <FiCheckCircle size={18} />}
                            </div>
                        );
                    })}
                </div>
            </>
    )
}
            
            {selectedStream && userRole 
            !== 'Student' && (
                <>
                    <h2 className="mm_section-title">Levels ({selectedStream.name})</h2>
                    <div className="mm_level-grid">
                        {filteredLevels.map(level => {
                            const isSelected = selectedLevel && selectedLevel.id === level.id;
                            const selectedClass = isSelected ? `selected-level-${selectedStream.id}` : ''; 

                            return (
                                <div 
                                    key={level.id}
                                    className={`mm_level-card ${selectedClass}`}
                                    onClick={() => handleLevelSelect(level)}
                                >
                                    <div className="mm_level-card-header">
                                        <h3>{level.name}</h3>
                                        {isSelected && <FiCheckCircle size={20} color={`var(--brand-${selectedStream.id === 'ca' ? 'pink' : 'orange'})`} />}
                                    </div>
                                    <p>{level.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* STEP 3: Batch Selection */}
            {selectedLevel && userRole 
            !== 'Student' && (
                <CardSlider 
                    title="Batches"
                    cards={filteredBatches} 
                    selectedCard={selectedBatch} 
                    onSelect={handleBatchSelect} 
                    searchPlaceholder="Search Batch Name or ID..."
                />
            )}
            
            {/* STEP 4: Subject Selection - Only after Batch is selected */}
            {selectedBatch && (
                <CardSlider 
                    title="Subject"
                    cards={filteredSubjects} 
                    // selectedCard is intentionally null until user click
                    selectedCard={selectedSubject} 
                    onSelect={handleSubjectSelect} 
                    searchPlaceholder="Search Subject Name or Code..."
                />
            )}

            {selectedSubject && (
                <div ref={materialListRef} className="mm_material-list-section">
                    <SubjectMaterialList 
                        subject={selectedSubject} 
                        context={{ selectedStream, selectedLevel, selectedBatch, selectedSubject }} 
                    />
                </div>
            )}
        </div>
    ); 
};

export default MaterialManagement;