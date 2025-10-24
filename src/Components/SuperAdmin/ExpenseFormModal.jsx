// ExpenseFormModal.js
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import '../../Styles/SuperAdmin/ExpenseApprovalForm.css'; // Assuming common styles

// Field Configuration based on the uploaded image
const EXPENSE_FORM_FIELDS = [
    { name: 'teacherName', label: 'Teacher Name', type: 'Text', example: 'CA Ramesh Kumar', required: true },
    { name: 'employeeId', label: 'Employee ID', type: 'Text', example: 'TCH502', required: true },
    { name: 'batchCourse', label: 'Batch / Course Linked', type: 'Dropdown', options: ['CA Inter – Batch A', 'CS Exec – Batch B', 'CMA Final – Batch C'], required: true },
    { name: 'expenseType', label: 'Expense Type', type: 'Dropdown', options: ['Travel', 'Training', 'Accommodation', 'Materials', 'Other'], required: true },
    { name: 'expenseDate', label: 'Expense Date', type: 'Date', example: '05-10-2025', required: true },
    { name: 'expenseAmount', label: 'Expense Amount', type: 'Number', example: '₹2,500', required: true },
    { name: 'paymentMode', label: 'Payment Mode', type: 'Dropdown', options: ['Self-paid', 'Institute Advance'], required: true },
    { name: 'purpose', label: 'Reason / Description', type: 'TextArea', example: 'Travel expenses for guest lecture at CMA campus', required: true },
    // Supporting Document field is File Upload, but for simplicity in a pure React demo, we'll keep it simple
    { name: 'supportingDocument', label: 'Supporting Document', type: 'file', example: 'Upload file (e.g., travel_receipt.pdf)', required: false },
];

const initialFormState = EXPENSE_FORM_FIELDS.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
}, {});

const CustomDropdown = ({ label, options, value, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="EXP_custom-dropdown-wrapper EXP_form-dropdown">
            <label className="EXP_form-label">{label}</label>
            <div
                className="EXP_custom-select EXP_search-input"
                onClick={() => setIsOpen(!isOpen)}
                tabIndex="0"
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="EXP_select-label">{value || `Select ${label}`}</div>
                {isOpen ? <FaChevronUp className="EXP_dropdown-icon" /> : <FaChevronDown className="EXP_dropdown-icon" />}
            </div>

            {isOpen && (
                <div className="EXP_dropdown-options-container">
                    <ul
                        className="EXP_dropdown-options-list"
                        role="listbox"
                    >
                        {options.map(option => (
                            <li
                                key={option}
                                className={`EXP_dropdown-option ${value === option ? 'EXP_selected' : ''}`}
                                onClick={() => {
                                    onChange({ target: { name, value: option } });
                                    setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={value === option}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ExpenseFormModal = ({ isOpen, onClose, currentExpense, onSave, teacherContext }) => {
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (currentExpense) {
            // Fill form for Edit
            setFormData({
                ...currentExpense,
                teacherName: currentExpense.teacherName, // Pre-filled data
                employeeId: currentExpense.employeeId,
                expenseAmount: currentExpense.amount.replace('₹', '').replace(/,/g, ''), // Clean amount for input
                batchCourse: 'CA Inter – Batch A', // Placeholder for missing fields in mock data
                expenseType: 'Travel',
                paymentMode: 'Self-paid',
            });
        } else {
            // Fill form for Add new expense, defaulting teacher info
            setFormData({
                ...initialFormState,
                teacherName: teacherContext.teacherName,
                employeeId: teacherContext.employeeId,
            });
        }
    }, [currentExpense, teacherContext]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.teacherName || !formData.expenseAmount || !formData.purpose) {
            alert('Please fill in all required fields.');
            return;
        }

        // Confirmation logic
        const confirmMessage = currentExpense 
            ? `Are you sure you want to update expense ID ${currentExpense.id}?`
            : "Are you sure you want to submit this new expense request?";
        
        if (window.confirm(confirmMessage)) {
            const expenseDataForSave = {
                ...formData,
                // Format amount back
                amount: `₹${parseFloat(formData.expenseAmount).toLocaleString('en-IN')}`,
                // Mock for new submission dates/status
                id: currentExpense ? currentExpense.id : Date.now(),
                submittedDate: currentExpense ? currentExpense.submittedDate : new Date().toLocaleDateString('en-GB'),
                status: currentExpense ? currentExpense.status : 'Pending', // New requests start as Pending
                approvalDate: currentExpense ? currentExpense.approvalDate : '-',
            };
            onSave(expenseDataForSave);
            onClose(); // Close modal after successful save
        }
    };

    const title = currentExpense ? 'Edit Expense Request' : 'New Expense Request';

    return (
        <div className="EXP_modal-overlay" onClick={onClose}>
            <div className="EXP_modal-content" onClick={e => e.stopPropagation()}>
                <div className="EXP_modal-header">
                    <h2 className="EXP_modal-title">{title}</h2>
                    <button className="EXP_modal-close-button" onClick={onClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="EXP_expense-form">
                    {EXPENSE_FORM_FIELDS.map(field => {
                        const commonProps = {
                            key: field.name,
                            name: field.name,
                            value: formData[field.name],
                            onChange: handleChange,
                            className: 'EXP_form-input',
                            placeholder: field.example,
                            required: field.required,
                            disabled: field.name === 'teacherName' || field.name === 'employeeId' // Teacher/ID should be non-editable
                        };

                        if (field.type === 'Dropdown') {
                            return (
                                <CustomDropdown
                                    key={field.name}
                                    label={field.label + (field.required ? ' *' : '')}
                                    options={field.options}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    name={field.name}
                                />
                            );
                        } else if (field.type === 'TextArea') {
                            return (
                                <div className="EXP_form-group" key={field.name}>
                                    <label className="EXP_form-label" htmlFor={field.name}>{field.label + (field.required ? ' *' : '')}</label>
                                    <textarea
                                        {...commonProps}
                                        id={field.name}
                                        rows="4"
                                    ></textarea>
                                </div>
                            );
                        } else {
                            // Text, Number, Date, File Upload (simplified as Text)
                            let inputType = field.type.toLowerCase();
                            if (inputType === 'number') inputType = 'text'; // Handle number as text for custom currency formatting if needed, but here simple text
                            if (inputType === 'file upload') inputType = 'text'; // Simplified file upload

                            return (
                                <div className="EXP_form-group" key={field.name}>
                                    <label className="EXP_form-label" htmlFor={field.name}>{field.label + (field.required ? ' *' : '')}</label>
                                    <input
                                        {...commonProps}
                                        id={field.name}
                                        type={inputType}
                                    />
                                </div>
                            );
                        }
                    })}
                    
                    <div className="EXP_modal-footer">
                        <button type="button" onClick={onClose} className="EXP_action-button EXP_reject">Cancel</button>
                        <button type="submit" className="EXP_action-button EXP_approve">{currentExpense ? 'Save Changes' : 'Submit Request'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseFormModal;