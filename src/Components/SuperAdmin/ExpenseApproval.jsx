// ExpenseRequestDashboard.js

import React, { useState, useMemo } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import ExpenseFormModal from './ExpenseFormModal'; // Assumed to be in the same folder
import '../../Styles/SuperAdmin/ExpenseApprovalForm.css'; 

// Mock Data updated with 'purpose' field
const initialExpenses = [
    { 
        id: 1, 
        teacherName: "CA Ramesh Kumar", 
        employeeId: "TCH502", 
        batchCourse: "CA Inter – Batch A",
        expenseType: "Travel",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-05", // Standard date format for input
        submittedDate: "06-10-2025", 
        status: "Pending", 
        amount: "₹2,500", 
        approvalDate: "-", 
        purpose: "Travel expenses for guest lecture at CMA campus",
        supportingDocument: "travel_receipt.pdf"
    },
    { 
        id: 2, 
        teacherName: "Prof. Priya Singh", 
        employeeId: "TCH510", 
        batchCourse: "CS Exec – Batch B",
        expenseType: "Training",
        paymentMode: "Institute Advance",
        expenseDate: "2025-09-12",
        submittedDate: "15-09-2025", 
        status: "Approved", 
        amount: "₹1,800", 
        approvalDate: "16-09-2025", 
        purpose: "Purchase of training materials and software license",
        supportingDocument: "software_invoice.pdf"
    },
    { 
        id: 3, 
        teacherName: "CA Ramesh Kumar", // Match current teacher
        employeeId: "TCH502", 
        batchCourse: "CMA Final – Batch C",
        expenseType: "Accommodation",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-01",
        submittedDate: "01-10-2025", 
        status: "Rejected", 
        amount: "₹4,200", 
        approvalDate: "03-10-2025", 
        purpose: "Accommodation during the regional academic conference",
        supportingDocument: "hotel_bill.pdf"
    },
    { 
        id: 5, 
        teacherName: "CA Ramesh Kumar", // Match current teacher
        employeeId: "TCH502", 
        batchCourse: "CA Inter – Batch A",
        expenseType: "Materials",
        paymentMode: "Self-paid",
        expenseDate: "2025-10-20",
        submittedDate: "21-10-2025", 
        status: "Pending", 
        amount: "₹1,550", 
        approvalDate: "-", 
        purpose: "Subscription renewal for engineering software",
        supportingDocument: "renewal_invoice.pdf"
    },
    // ... other expenses
];

const FILTER_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];

// Define the current teacher's context for display filtering and form pre-fill
const CURRENT_TEACHER_CONTEXT = {
    teacherName: "CA Ramesh Kumar",
    employeeId: "TCH502",
};

const ExpenseRequestDashboard = ( {userRole = 'teacher'}) => { // Default to 'teacher' for easy testing
    const isTeacherView = (userRole === 'teacher' || userRole==='Admin'); 
    const currentTeacherId = CURRENT_TEACHER_CONTEXT.employeeId;

    const [expenses, setExpenses] = useState(initialExpenses);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    // --- CRUD Operations ---
    
    const handleSaveExpense = (newExpenseData) => {
        const expenseToSave = {
            ...newExpenseData,
            // Ensure ID is unique for new entries
            id: newExpenseData.id || Date.now(), 
            // New requests are always 'Pending'
            status: 'Pending', 
            approvalDate: '-',
            submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            
        };

        if (editingExpense) {
            // EDIT operation
            setExpenses(prevExpenses =>
                prevExpenses.map(exp => (exp.id === expenseToSave.id ? expenseToSave : exp))
            );
        } else {
            // ADD operation
            setExpenses(prevExpenses => [expenseToSave, ...prevExpenses]);
        }
        setEditingExpense(null); // Clear editing state
    };

    const handleDeleteExpense = (expenseId) => {
        if (window.confirm(`Are you sure you want to DELETE expense ID ${expenseId}? This action cannot be undone.`)) {
            setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
            setSelectedExpenses(prevSelected => prevSelected.filter(id => id !== expenseId));
        }
    };

    const handleEditExpense = (expense) => {
        if (expense.status === 'Pending') {
            setEditingExpense(expense);
            setIsModalOpen(true);
        } else {
            alert(`Cannot edit expense ID ${expense.id}. Only 'Pending' requests can be edited.`);
        }
    };

    const handleOpenAddModal = () => {
        setEditingExpense(null); // Ensure we are in Add mode
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    // --- Table Logic ---

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setIsFilterOpen(false);
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedExpenses(filteredExpenses.map(expense => expense.id));
        } else {
            setSelectedExpenses([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedExpenses(prev => 
            prev.includes(id) 
                ? prev.filter(expId => expId !== id) 
                : [...prev, id]
        );
    };

    // --- Memoized Filtering ---
    const filteredExpenses = useMemo(() => {
        // Step 1: Filter by Teacher (if in Teacher View)
        const teacherFiltered = isTeacherView 
            ? expenses.filter(expense => expense.employeeId === currentTeacherId)
            : expenses; 

        // Step 2: Filter by Status
        const statusFiltered = teacherFiltered.filter(expense => {
            return filterStatus === 'All' || expense.status === filterStatus;
        });

        // Step 3: Filter by Search Text
        return statusFiltered.filter(expense => {
            const searchLower = searchText.toLowerCase();
            return (
                expense.teacherName.toLowerCase().includes(searchLower) ||
                expense.employeeId.toLowerCase().includes(searchLower) ||
                expense.purpose.toLowerCase().includes(searchLower)
            );
        });
    }, [expenses, searchText, filterStatus, isTeacherView, currentTeacherId]);

    // --- Render ---

    return (
        <div className="EXP_approval-dashboard">
            <h1 className="EXP_header">My Expense Requests</h1>

            {/* --- Search Bar and Filters & Add Button --- */}
            <div className="EXP_controls-row">
                <div className="EXP_search-container">
                    <input
                        type="text"
                        placeholder="Search by Name, ID, or Purpose..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="EXP_search-input"
                    />
                </div>
                
                {/* Custom Filter Dropdown */}
                <div className="EXP_custom-dropdown-wrapper">
                    <div 
                        className="EXP_custom-select EXP_search-input"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        tabIndex="0" 
                        role="button" 
                        aria-haspopup="listbox"
                        aria-expanded={isFilterOpen}
                    >
                        <div className="EXP_select-label">{filterStatus} Statuses</div>
                        {isFilterOpen ? <FaChevronUp className="EXP_dropdown-icon" /> : <FaChevronDown className="EXP_dropdown-icon" />}
                    </div>

                    {isFilterOpen && (
                        <div className="EXP_dropdown-options-container">
                            <ul 
                                className="EXP_dropdown-options-list"
                                role="listbox"
                                aria-activedescendant={filterStatus}
                            >
                                {FILTER_OPTIONS.map(option => (
                                    <li 
                                        key={option}
                                        className={`EXP_dropdown-option ${filterStatus === option ? 'EXP_selected' : ''}`}
                                        onClick={() => handleFilterChange(option)}
                                        role="option"
                                        aria-selected={filterStatus === option}
                                    >
                                        {option} Statuses
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ADD EXPENSE BUTTON (Teacher View) - Displayed in the same row */}
                <button 
                    className="EXP_action-button EXP_add-button" 
                    onClick={handleOpenAddModal}
                    title="Submit a New Expense Request"
                >
                    <FaPlus style={{marginRight: '5px'}} /> Add Expense Request
                </button>
            </div>

            {/* --- Expenses Table inside Card --- */}
            <div className="EXP_card EXP_table-container">
                <table className="EXP_table">
                    <thead className="EXP_thead">
                        <tr>
                            <th className="EXP_th EXP_checkbox-col">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll} 
                                    checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                                    disabled={filteredExpenses.length === 0}
                                />
                            </th>
                            <th className="EXP_th">Teacher Name</th>
                            <th className="EXP_th">ID</th>
                            <th className="EXP_th">Amount</th>
                            <th className="EXP_th">Purpose</th>
                            <th className="EXP_th">Submitted Date</th>
                            <th className="EXP_th">Approval Status</th>
                            <th className="EXP_th">Supporting Doc</th>
                            <th className="EXP_th EXP_actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="EXP_tr">
                                    <td className="EXP_td EXP_checkbox-col">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedExpenses.includes(expense.id)}
                                            onChange={() => handleSelectOne(expense.id)}
                                        />
                                    </td>
                                    <td className="EXP_td EXP_name">{expense.teacherName}</td>
                                    <td className="EXP_td">{expense.employeeId}</td>
                                    <td className="EXP_td EXP_amount">{expense.amount}</td>
                                    <td className="EXP_td EXP_purpose">{expense.purpose}</td>
                                    <td className="EXP_td">{expense.submittedDate}</td>
                                    <td className="EXP_td">
                                        <span className={`EXP_status-tag EXP_${expense.status.toLowerCase()}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="EXP_td">
                                         <button className="EXP_action-button EXP_view-doc" title="View Document">
                                            <FaEye />
                                        </button>
                                    </td>
                                    <td className="EXP_td EXP_actions-col">
                                        <div className="EXP_actions-group EXP_teacher-actions">
                                            {/* EDIT Button - Only if Pending */}
                                            <button 
                                                className="EXP_action-button EXP_edit" 
                                                onClick={() => handleEditExpense(expense)}
                                                title="Edit Request"
                                                disabled={expense.status !== 'Pending'} 
                                            >
                                                <FaEdit />
                                            </button>
                                            {/* DELETE Button - Only if Pending */}
                                            <button 
                                                className="EXP_action-button EXP_delete" 
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                title="Delete Request"
                                                disabled={expense.status !== 'Pending'} 
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="EXP_tr">
                                <td colSpan="9" className="EXP_td EXP_empty-row">
                                    No expense requests found for {CURRENT_TEACHER_CONTEXT.teacherName} matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Expense Form Modal */}
            <ExpenseFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                currentExpense={editingExpense}
                onSave={handleSaveExpense}
                teacherContext={CURRENT_TEACHER_CONTEXT}
            />
        </div>
    );
};

export default ExpenseRequestDashboard;