import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/Expense/ExpenseCategory.css";
import api from "../../api/axios";

export default function ExpenseCategoryList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
 const [formData, setFormData] = useState({
  categoryName: "",
  categoryCode: "",
  isSubCategory: false,
  parentCategoryId: null
});
  // ✅ Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/ExpenseCategory");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await api.put(`/ExpenseCategory/${editingCategoryId}`, formData);
        alert("Category updated successfully!");
      } else {
        await api.post("/ExpenseCategory", [formData]);
        alert("Category added successfully!");
      }
      setShowForm(false);
      setEditingCategoryId(null);
      setFormData({ categoryName: "", categoryCode: "" });
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
    categoryCode: category.categoryCode,
    isSubCategory: !!category.parentCategoryId,
    parentCategoryId: category.parentCategoryId || null,
  });
  setEditingCategoryId(category.expenseCategoryId);
  setShowForm(true);
}, []); // ✅ no external dependencies needed

  // ✅ Delete category
  const handleDelete = useCallback(async (id) => {
  if (window.confirm("Are you sure you want to delete this category?")) {
    try {
      await api.delete(`/ExpenseCategory/${id}`);
      alert("Category deleted successfully!");
      fetchCategories(); // ✅ dependency
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Error deleting category. Check console for details.");
    }
  }
}, [fetchCategories]); // ✅ keep this dependency

  // ✅ Table columns
  const columns = useMemo(() => [
    { header: "ID", accessorKey: "expenseCategoryId" },
    { header: "Category Name", accessorKey: "categoryName" },
    { header: "Category Code", accessorKey: "categoryCode" },
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
            onClick={() => handleDelete(row.original.expenseCategoryId)}
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
      c.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoryCode.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2>Expense Categories</h2>
          <button
            className="add-category-btn"
            onClick={() => {
              setFormData({ categoryName: "", categoryCode: "" });
              setEditingCategoryId(null);
              setShowForm(true);
            }}
          >
            Add Category
          </button>
        </div>

        {/* ✅ Table Controls */}
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search Categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ✅ Category Table */}
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

      {/* ✅ Add/Edit Modal */}
{/* ✅ Add/Edit Modal */}
{showForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{editingCategoryId ? "Edit Expense Category" : "Add Expense Category"}</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name <span className="required">*</span></label>
          <input
            type="text"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            required
            
          />
        </div>

        <div className="form-group">
          <label>Category Code</label>
          <input
            type="text"
            name="categoryCode"
            value={formData.categoryCode}
            onChange={handleChange}
           
          />
        </div>

        {/* ✅ Add as Subcategory Checkbox */}
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

        {/* ✅ Parent Category Dropdown (only visible if checked) */}
        {formData.isSubCategory && (
          <div className="form-group">
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
                .filter((c) => !c.parentCategoryId) // only show top-level
                .map((cat) => (
                  <option key={cat.expenseCategoryId} value={cat.expenseCategoryId}>
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
