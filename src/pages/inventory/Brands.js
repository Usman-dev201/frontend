import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useBrands } from '../../context/BrandContext';
import '../../styles/Brands.css';

export default function Brands() {
  const { brands, addBrand, deleteBrand, updateBrand } = useBrands();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedBrand, setEditedBrand] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBrand.name.trim()) {
      addBrand(newBrand);
      setNewBrand({ name: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteBrand(id);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setEditedBrand({ ...brand });
  };

  const handleSave = () => {
    if (editedBrand) {
      updateBrand(editingId, editedBrand);
      setEditingId(null);
      setEditedBrand(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedBrand(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedBrand(prev => ({
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
            <h2>Brands</h2>
          </div>
          <div className="header-actions">
            <button 
              className="action-button add-button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <i className="fas fa-plus"></i>
              {showAddForm ? 'Cancel' : 'Add New Brand'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="form-section">
            <h3>Add New Brand</h3>
            <form onSubmit={handleSubmit} className="add-brand-form">
              <div className="form-group">
                <label htmlFor="brandName">Brand Name</label>
                <input
                  type="text"
                  id="brandName"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ name: e.target.value })}
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  <i className="fas fa-save"></i>
                  Add Brand
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
                <th>Brand Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>
                    {editingId === brand.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editedBrand.name}
                        onChange={handleChange}
                        className="edit-input"
                      />
                    ) : (
                      brand.name
                    )}
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => editingId === brand.id ? handleSave() : handleEdit(brand)}
                      >
                        <i className={`fas fa-${editingId === brand.id ? 'save' : 'edit'}`}></i>
                        {editingId === brand.id ? 'Save' : 'Edit'}
                      </button>
                      {editingId === brand.id ? (
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
                          onClick={() => handleDelete(brand.id)}
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