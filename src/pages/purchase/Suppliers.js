import React, { useState } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import { useSupplier } from "../../context/SupplierContext";
import "./Supplier.css";

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplier();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    email: "",
    contactNo: "",
    address: "",
  });

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      supplierId: "",
      supplierName: "",
      email: "",
      contactNo: "",
      address: "",
    });
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setIsEditing(true);
    setFormData(supplier);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) updateSupplier(formData);
    else addSupplier(formData);

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="supplier-page">
      <Topbar />
      <Sidebar />

      <div className="supplier-container">
        <div className="supplier-header">
          <h2>Supplier List</h2>
          <button className="supplier-btn supplier-btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Add Supplier
          </button>
        </div>

        {/* Table */}
        <div className="supplier-table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s) => (
                <tr key={s.supplierId}>
                  <td>{s.supplierId}</td>
                  <td>{s.supplierName}</td>
                  <td>{s.email}</td>
                  <td>{s.contactNo}</td>
                  <td>{s.address}</td>

                  <td>
                    <div className="supplier-actions">
                      <button
                        className="supplier-btn supplier-btn-primary"
                        onClick={() => openEditModal(s)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>

                      <button
                        className="supplier-btn supplier-btn-danger"
                        onClick={() => handleDelete(s.supplierId)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            <h3>{isEditing ? "Edit Supplier" : "Add Supplier"}</h3>

            <form onSubmit={handleSubmit} className="supplier-modal-content">

              <label>Supplier Name</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                required
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                required
              />

              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />

              <div className="supplier-modal-actions">
                <button className="supplier-btn supplier-btn-primary" type="submit">
                  {isEditing ? "Update" : "Save"}
                </button>

                <button
                  className="supplier-btn supplier-btn-secondary"
                  type="button"
                  onClick={closeModal}
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
