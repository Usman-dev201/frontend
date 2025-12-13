import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useLocation } from "react-router-dom";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "../../pages/CRM/CustomerFeedback.css";

export default function ListCustomerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [feedbackCategories, setFeedbackCategories] = useState([]);
  const [feedbackSubCategories, setFeedbackSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const urlSalesId = queryParams.get("salesId");

  const [newFeedback, setNewFeedback] = useState({
    feedbackId: null,
    date: new Date().toISOString().split('T')[0], // Default to today
    customerId: "",
      salesId: urlSalesId || "",  
    feedbackCategoryId: "",
    feedbackSubCategoryId: "",
    rating: 5,
    comments: ""
  });

  // ✅ Fetch all feedbacks
  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await api.get("/CustomerFeedback");
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      alert("Failed to load customer feedbacks. Please try again.");
    }
  }, []);

  // ✅ Fetch customers for dropdown
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get("/Customer");
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Failed to load customers.");
    }
  }, []);

  // ✅ Fetch sales records for dropdown
const fetchSalesRecords = useCallback(async () => {
  try {
    const response = await api.get("/SalesRecord");
    // Filter only completed sales records
    const completedSales = response.data.filter(
      sales => sales.transactionStatus?.toLowerCase() === 'completed'
    );
    setSalesRecords(completedSales || []);
    
    console.log("Completed sales records:", completedSales);
  } catch (error) {
    console.error("Error fetching sales records:", error);
    alert("Failed to load sales records.");
  }
}, []);

  // ✅ Fetch feedback categories and subcategories correctly
  const fetchFeedbackCategories = useCallback(async () => {
    try {
      // Use the flat endpoint first for simpler data structure
      const response = await api.get("/FeedbackCategory");
      const allCategories = response.data || [];
      
      console.log("All categories from API:", allCategories);
      
      // Separate main categories and sub-categories
      const mainCategories = allCategories.filter(cat => !cat.parentCategoryId);
      const subCategories = allCategories.filter(cat => cat.parentCategoryId);
      
      setFeedbackCategories(mainCategories);
      setFeedbackSubCategories(subCategories);
      
      console.log("Main categories:", mainCategories);
      console.log("Sub categories:", subCategories);
      
    } catch (error) {
      console.error("Error fetching feedback categories:", error);
      alert("Failed to load feedback categories.");
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
    fetchCustomers();
    fetchSalesRecords();
    fetchFeedbackCategories();
  }, [fetchFeedbacks, fetchCustomers, fetchSalesRecords, fetchFeedbackCategories]);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("Current feedbackCategories:", feedbackCategories);
    console.log("Current feedbackSubCategories:", feedbackSubCategories);
    console.log("Selected category ID:", newFeedback.feedbackCategoryId);
    
    if (newFeedback.feedbackCategoryId) {
      const filteredSubs = feedbackSubCategories.filter(
        subCat => subCat.parentCategoryId === parseInt(newFeedback.feedbackCategoryId)
      );
      console.log("Filtered subcategories for selected category:", filteredSubs);
    }
  }, [feedbackCategories, feedbackSubCategories, newFeedback.feedbackCategoryId]);

  // ✅ Add/Edit modal controls
  const handleAddFeedback = () => {
    setIsEditing(false);
    setNewFeedback({
      feedbackId: null,
      date: new Date().toISOString().split('T')[0],
      customerId: "",
      salesId: "",
      feedbackCategoryId: "",
      feedbackSubCategoryId: "",
      rating: 5,
      comments: ""
    });
    setShowModal(true);
  };
useEffect(() => {
  if (urlSalesId && salesRecords.length > 0) {
    setShowModal(true);

    setNewFeedback((prev) => ({
      ...prev,
      salesId: Number(urlSalesId)
    }));
  }
}, [urlSalesId, salesRecords]);



  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/CustomerFeedback/${id}`);
      const feedbackData = response.data;
      
      setNewFeedback({
        feedbackId: feedbackData.feedbackId,
        date: feedbackData.date,
        customerId: feedbackData.customerId,
        salesId: feedbackData.salesId || "",
        feedbackCategoryId: feedbackData.feedbackCategoryId,
        feedbackSubCategoryId: feedbackData.feedbackSubCategoryId || "",
        rating: feedbackData.rating,
        comments: feedbackData.comments
      });
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching feedback details:", error);
      alert("Failed to load feedback details.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewFeedback({
      feedbackId: null,
      date: new Date().toISOString().split('T')[0],
      customerId: "",
      salesId: "",
      feedbackCategoryId: "",
      feedbackSubCategoryId: "",
      rating: 5,
      comments: ""
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback((prev) => ({ 
      ...prev, 
      [name]: name === 'rating' ? parseInt(value) : value 
    }));
  };

  // ✅ Save feedback (Add or Update)
  const handleSaveFeedback = async () => {
  if (!newFeedback.date || !newFeedback.customerId || !newFeedback.feedbackCategoryId) {
    alert("Please fill in all required fields (Date, Customer, and Feedback Category).");
    return;
  }

  try {
    if (isEditing) {
      // Backend expects full CustomerFeedback model
      const updatePayload = [{
        feedbackId: newFeedback.feedbackId,
        date: newFeedback.date,
        customerId: parseInt(newFeedback.customerId),
        salesId: newFeedback.salesId ? parseInt(newFeedback.salesId) : null,
        feedbackCategoryId: parseInt(newFeedback.feedbackCategoryId),
        feedbackSubCategoryId: newFeedback.feedbackSubCategoryId
          ? parseInt(newFeedback.feedbackSubCategoryId)
          : null,
        rating: newFeedback.rating,
        comments: newFeedback.comments
      }];

      await api.put("/CustomerFeedback", updatePayload);
      alert("Feedback updated successfully!");
    } else {
      // Add new feedback (DTO for add)
      const addFeedbackDto = {
        date: newFeedback.date,
        customerId: parseInt(newFeedback.customerId),
        salesId: newFeedback.salesId ? parseInt(newFeedback.salesId) : null,
        feedbackCategoryId: parseInt(newFeedback.feedbackCategoryId),
        feedbackSubCategoryId: newFeedback.feedbackSubCategoryId
          ? parseInt(newFeedback.feedbackSubCategoryId)
          : null,
        rating: newFeedback.rating,
        comments: newFeedback.comments
      };

      await api.post("/CustomerFeedback", [addFeedbackDto]);
      alert("Feedback added successfully!");
    }

    handleModalClose();
    fetchFeedbacks();

  } catch (error) {
    console.error("Error saving feedback:", error);
    alert("Failed to save feedback. Please try again.");
  }
};

  // ✅ Delete feedback
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      await api.delete(`/CustomerFeedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== id));
      alert("Feedback deleted successfully!");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  const getCustomerName = useCallback((row) => {
  return row?.customer?.customerName || "Unknown Customer";
}, []);


  // ✅ Get category name by ID - handle property naming variations
  const getCategoryName = useCallback((row) => {
  return row?.feedbackCategory?.categoryName || "Unknown Category";
}, []);

  // ✅ Get sub-category name by ID
  const getSubCategoryName = useCallback((row) => {
  return row?.feedbackSubCategory?.categoryName || "N/A";
}, []);

  // ✅ Update available subcategories when main category changes
  useEffect(() => {
    if (newFeedback.feedbackCategoryId) {
      // If current subcategory doesn't belong to selected main category, clear it
      if (newFeedback.feedbackSubCategoryId) {
        const currentSub = feedbackSubCategories.find(
          sub => sub.feedbackCategoryId === parseInt(newFeedback.feedbackSubCategoryId)
        );
        if (currentSub && currentSub.parentCategoryId !== parseInt(newFeedback.feedbackCategoryId)) {
          setNewFeedback(prev => ({ ...prev, feedbackSubCategoryId: "" }));
        }
      }
    } else {
      // If no main category selected, clear subcategory
      setNewFeedback(prev => ({ ...prev, feedbackSubCategoryId: "" }));
    }
  }, [newFeedback.feedbackCategoryId, feedbackSubCategories, newFeedback.feedbackSubCategoryId]);

  // ✅ Render star rating
  const renderRating = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // ✅ Action Buttons
  const ActionCell = ({ feedbackId }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(feedbackId)}>
        <i className="fas fa-edit"></i> Edit
      </button>
      <button className="btn btn-danger" onClick={() => handleDelete(feedbackId)}>
        <i className="fas fa-trash"></i> Delete
      </button>
    </div>
  );

  // ✅ Table Columns
  const columnsRef = useRef([
    {
      header: "Feedback ID",
      accessorKey: "feedbackId",
      cell: (info) => <strong>{info.getValue()}</strong>,
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
    header: "Customer",
    accessorFn: (row) => row,
    cell: (info) => getCustomerName(info.getValue()),
  },
    {
      header: "Invoice No",
      accessorKey: "salesId",
      cell: (info) => info.getValue() || "N/A",
    },
    {
    header: "Category",
    accessorFn: (row) => row,
    cell: (info) => getCategoryName(info.getValue()),
  },
     {
    header: "Sub-Category",
    accessorFn: (row) => row,
    cell: (info) => getSubCategoryName(info.getValue()),
  },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: (info) => (
        <span className="rating-stars" title={`${info.getValue()} out of 5`}>
          {renderRating(info.getValue())}
        </span>
      ),
    },
    {
      header: "Comments",
      accessorKey: "comments",
      cell: (info) => (
        <div className="comments-cell">
          {info.getValue() || "No comments"}
        </div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => <ActionCell feedbackId={row.original.feedbackId} />,
    },
  ]);
  const columns = columnsRef.current;

  // ✅ Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return feedbacks;
    const q = searchQuery.toLowerCase();
    return feedbacks.filter(
      (f) =>
        getCustomerName(f.customerId)?.toLowerCase().includes(q) ||
        getCategoryName(f.feedbackCategoryId)?.toLowerCase().includes(q) ||
        f.comments?.toLowerCase().includes(q) ||
        String(f.feedbackId).includes(q)
    );
  }, [searchQuery, feedbacks, getCustomerName, getCategoryName]);

  // ✅ Table setup
  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="customer-feedback-page">
      <Topbar />
      <Sidebar />

      <div className="customer-feedback-container">
        <div className="customer-feedback-header">
          <h2>Customer Feedback</h2>
          <button className="btn btn-primary" onClick={handleAddFeedback}>
            <i className="fas fa-plus"></i> Add Feedback
          </button>
        </div>

        {/* Search + Pagination Controls */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search feedback by customer, comments, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="page-size-control">
            <label htmlFor="pageSize">Show</label>
            <select
              id="pageSize"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>

            <button
              className="pagination-button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal Popup for Add/Edit Feedback */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isEditing ? "Edit Feedback" : "Add New Feedback"}</h3>
            <div className="modal-content">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={newFeedback.date}
                onChange={handleInputChange}
              />

              <label>Customer</label>
              <select
                name="customerId"
                value={newFeedback.customerId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.customerName || customer.name}
                  </option>
                ))}
              </select>

              <label>Invoice No(Optional)</label>
              <select
                name="salesId"
                value={newFeedback.salesId}
                onChange={handleInputChange}
              >
                <option value="">Select Sales Record</option>
                {salesRecords.map((sales) => (
                  <option key={sales.salesId} value={sales.salesId}>
                    {sales.salesId} - {sales.description || "Sale"}
                  </option>
                ))}
              </select>

              {/* Feedback Category Dropdown */}
              <label>Category</label>
              <select
                name="feedbackCategoryId"
                value={newFeedback.feedbackCategoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {feedbackCategories.map((category) => (
                  <option key={category.feedbackCategoryId} value={category.feedbackCategoryId}>
                    {category.categoryName || category.CategoryName}
                  </option>
                ))}
              </select>

              {/* Feedback Sub-Category Dropdown - Filtered by selected category */}
              <label>Sub-Category (Optional)</label>
              <select
                name="feedbackSubCategoryId"
                value={newFeedback.feedbackSubCategoryId}
                onChange={handleInputChange}
                disabled={!newFeedback.feedbackCategoryId}
              >
                <option value="">Select Sub-Category</option>
                {feedbackSubCategories
                  .filter(subCat => subCat.parentCategoryId === parseInt(newFeedback.feedbackCategoryId))
                  .map((subCategory) => (
                    <option key={subCategory.feedbackCategoryId} value={subCategory.feedbackCategoryId}>
                      {subCategory.categoryName || subCategory.CategoryName}
                    </option>
                  ))}
              </select>

              <label>Rating</label>
              <div className="star-rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= newFeedback.rating ? 'filled' : ''}`}
                    onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                    onMouseEnter={() => document.querySelectorAll('.star').forEach((s, idx) => {
                      if (idx < star) s.classList.add('hover');
                      else s.classList.remove('hover');
                    })}
                    onMouseLeave={() => document.querySelectorAll('.star').forEach(s => s.classList.remove('hover'))}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-text">({newFeedback.rating} {newFeedback.rating === 1 ? 'Star' : 'Stars'})</span>
              </div>

              <label>Comments</label>
              <textarea
                name="comments"
                value={newFeedback.comments}
                onChange={handleInputChange}
                placeholder="Enter feedback comments..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveFeedback}>
                {isEditing ? "Update" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}