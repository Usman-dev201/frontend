import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/Expense/ExpenseCategory.css"; // ✅ keep same CSS
import api from "../../api/axios";

export default function FeedbackCategoryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    isSubCategory: false,
    parentCategoryId: null
  });

  // ✅ Fetch feedback categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/FeedbackCategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Add / Update category
  // ✅ Add / Update category
const handleSubmit = async (e) => {
  e.preventDefault();

  // Prepare payload to match backend DTO
  const payload = [{
    feedbackCategoryId: editingCategoryId || 0, // 0 for new category
    categoryName: formData.categoryName,
    ParentCategoryId: formData.isSubCategory ? formData.parentCategoryId || null : null
  }];

  try {
    if (editingCategoryId) {
      // ✅ send PUT to /FeedbackCategory (no ID in URL)
      await api.put(`/FeedbackCategory`, payload);
      alert("Feedback category updated successfully!");
    } else {
      await api.post("/FeedbackCategory", payload);
      alert("Feedback category added successfully!");
    }
    setShowForm(false);
    setEditingCategoryId(null);
    setFormData({ feedbackCategoryId: null, categoryName: "", isSubCategory: false, parentCategoryId: null });
    fetchCategories();
  } catch (error) {
    console.error("Failed to save category:", error);
    alert("Error saving category. Check console for details.");
  }
};

  // ✅ Edit category
  const handleEdit = useCallback((category) => {
    setFormData({
      categoryName: category.categoryName,
      isSubCategory: !!category.parentCategoryId,
      parentCategoryId: category.parentCategoryId || null,
    });
    setEditingCategoryId(category.feedbackCategoryId);
    setShowForm(true);
  }, []);

  // ✅ Delete category
  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/FeedbackCategory/${id}`);
        alert("Feedback category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Error deleting category. Check console for details.");
      }
    }
  }, [fetchCategories]);

  // ✅ Table columns
  const columns = useMemo(() => [
    { header: "ID", accessorKey: "feedbackCategoryId" },
    { header: "Category Name", accessorKey: "categoryName" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(row.original.feedbackCategoryId)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(c =>
      c.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, categories]);

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="expense-category-page">
      <Topbar />
      <Sidebar />

      <div className="expense-category-container">
        <div className="expense-category-header">
          <h2>Feedback Categories</h2>
          <button
            className="add-category-btn"
            onClick={() => {
              setFormData({ categoryName: "", isSubCategory: false, parentCategoryId: null });
              setEditingCategoryId(null);
              setShowForm(true);
            }}
          >
            Add Category
          </button>
        </div>

        {/* Table Controls */}
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search Categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Table */}
        <table className="expense-category-table">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCategoryId ? "Edit Feedback Category" : "Add Feedback Category"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="excategoryform-group">
                <label>Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Add as Subcategory Checkbox */}
              <label className="small-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isSubCategory || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isSubCategory: e.target.checked,
                      parentCategoryId: e.target.checked ? prev.parentCategoryId : null,
                    }))
                  }
                />
                <span>Add as Sub-category</span>
              </label>

              {/* Parent Category Dropdown */}
              {formData.isSubCategory && (
                <div className="excategoryform-group">
                  <label>Select Parent Category:</label>
                  <select
                    name="parentCategoryId"
                    value={formData.parentCategoryId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentCategoryId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select Parent Category</option>
                    {categories
                      .filter((c) => !c.parentCategoryId) // only top-level
                      .map((cat) => (
                        <option key={cat.feedbackCategoryId} value={cat.feedbackCategoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
