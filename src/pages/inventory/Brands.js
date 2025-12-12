import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useBrands } from '../../context/BrandContext';
import '../../styles/Brands.css';

export default function Brands() {
  const { brands, addBrand, deleteBrand, updateBrand, loading } = useBrands();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ brandName: '' });
  const [editingId, setEditingId] = useState(null);
  const [editedBrand, setEditedBrand] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newBrand.brandName.trim()) {
      addBrand(newBrand);
      setNewBrand({ brandName: '' });
      setShowAddForm(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      deleteBrand(id);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.brandId);
    setEditedBrand({ brandName: brand.brandName });
  };

  const handleSave = () => {
    if (editedBrand && editedBrand.brandName.trim()) {
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

  if (loading) {
    return <div>Loading brands...</div>;
  }

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

    {/* Add Brand Modal */}
{showAddForm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Add New Brand</h3>
      <form onSubmit={handleSubmit} className="add-brand-form">
        <div className="brandform-group">
          <label htmlFor="brandName">Brand Name</label>
          <input
            type="text"
            id="brandName"
            name="brandName"
            value={newBrand.brandName}
            onChange={(e) => setNewBrand({ brandName: e.target.value })}
            placeholder="Enter brand name"
            required
          />
        </div>
        <div className="brandform-actions">
          <button type="submit" className="submit-button">
            <i className="fas fa-save"></i>
            Add Brand
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
                <th>Brand Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.brandId}>
                  <td>{brand.brandId}</td>
                  <td>
                    {editingId === brand.brandId ? (
                      <input
                        type="text"
                        name="brandName"
                        value={editedBrand.brandName}
                        onChange={handleChange}
                        className="edit-input"
                      />
                    ) : (
                      brand.brandName
                    )}
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button
                        className="action-btn edit-btn"
                        onClick={() =>
                          editingId === brand.brandId ? handleSave() : handleEdit(brand)
                        }
                      >
                        <i className={`fas fa-${editingId === brand.brandId ? 'save' : 'edit'}`}></i>
                        {editingId === brand.brandId ? 'Save' : 'Edit'}
                      </button>
                      {editingId === brand.brandId ? (
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
                          onClick={() => handleDelete(brand.brandId)}
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
