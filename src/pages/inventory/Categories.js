import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useCategories } from '../../context/CategoryContext';
import '../../styles/Categories.css';

export default function Categories() {
  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    loading
  } = useCategories();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ categoryName: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategory.categoryName.trim()) {
      addCategory(newCategory);
      setNewCategory({ categoryName: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleEdit = (category) => {
   setEditingId(category.categoryId);
    setEditedCategory({ categoryName: category.categoryName });
  };

  const handleSave = () => {
    if (editedCategory && editedCategory.categoryName.trim()) {
      updateCategory(editingId, editedCategory);
      setEditingId(null);
      setEditedCategory(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedCategory(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCategory((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="list-product-page">
      <Topbar />
      <Sidebar />
      <div className="list-product-content">
        <div className="list-product-header">
          <div className="header-title">
            <h2>Categories</h2>
          </div>
          <div className="header-actions">
            <button
              className="action-button add-button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <i className="fas fa-plus"></i>
              {showAddForm ? 'Cancel' : 'Add New Category'}
            </button>
          </div>
        </div>

        {showAddForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Add New Category</h3>
      <form onSubmit={handleSubmit} className="add-category-form">
        <div className="catform-group">
          <label htmlFor="categoryName">Category Name</label>
          <input
            type="text"
            id="categoryName"
            value={newCategory.categoryName}
            onChange={(e) => setNewCategory({ categoryName: e.target.value })}
            placeholder="Enter category name"
            required
          />
        </div>
        <div className="catform-actions">
          <button type="submit" className="submit-button">
            <i className="fas fa-save"></i>
            Add Category
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowAddForm(false)}
          >
            <i className="fas fa-times"></i>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.categoryId}>
  <td>{category.categoryId}</td>
                  <td>
                    {editingId === category.categoryId ? (
                      <input
                        type="text"
                        name="categoryName"
                        value={editedCategory.categoryName}
                        onChange={handleChange}
                        className="edit-input"
                      />
                    ) : (
                      category.categoryName
                    )}
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button
                        className="action-btn edit-btn"
                       onClick={() =>
  editingId === category.categoryId ? handleSave() : handleEdit(category)
}
                      >
                        <i className={`fas fa-${editingId === category.id ? 'save' : 'edit'}`}></i>
                        {editingId === category.categoryId ? 'Save' : 'Edit'}
                      </button>
                      {editingId === category.categoryId ? (
                        <button
                          className="action-btn cancel-btn"
                          onClick={handleCancel}
                        >
                          <i className="fas fa-times"></i>
                          Cancel
                        </button>
                      ) : (
                       <button
  className="action-btn delete-btn"
  onClick={() => handleDelete(category.categoryId)}
>
                          <i className="fas fa-trash-alt"></i>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
