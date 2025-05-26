import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useCategories } from '../../context/CategoryContext';
import '../../styles/Categories.css';

export default function Categories() {
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      addCategory(newCategory);
      setNewCategory({ name: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditedCategory({ ...category });
  };

  const handleSave = () => {
    if (editedCategory) {
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
    setEditedCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <div className="form-section">
            <h3>Add New Category</h3>
            <form onSubmit={handleSubmit} className="add-category-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  <i className="fas fa-save"></i>
                  Add Category
                </button>
              </div>
            </form>
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
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    {editingId === category.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editedCategory.name}
                        onChange={handleChange}
                        className="edit-input"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => editingId === category.id ? handleSave() : handleEdit(category)}
                      >
                        <i className={`fas fa-${editingId === category.id ? 'save' : 'edit'}`}></i>
                        {editingId === category.id ? 'Save' : 'Edit'}
                      </button>
                      {editingId === category.id ? (
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
                          onClick={() => handleDelete(category.id)}
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