import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext'; // Adjust path as needed
import './LocationListSection.css';

export default function LocationListSection() {
  const { locationList, addLocation, updateLocation, deleteLocation } = useLocation();

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editForm, setEditForm] = useState({ locationId: '', locationName: '' });

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      addLocation(newLocationName);
      setNewLocationName('');
      setShowAddPopup(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location.locationId);
    setEditForm({ locationId: location.locationId, locationName: location.locationName });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateLocation(editForm.locationId, editForm.locationName);
    setEditingLocation(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteLocation(id);
    }
  };

  return (
    <div className="location-list-container">
      <div className="location-list-header">
        <h2>Location List</h2>
        <button 
          className="add-location-btn"
          onClick={() => setShowAddPopup(true)}
        >
          <i className="fas fa-plus"></i> Add Location
        </button>
      </div>

      {/* Add Location Popup Modal */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Add New Location</h3>
            <form onSubmit={handleAddLocation}>
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="Enter Location Name"
                className="location-name-input"
                autoFocus
              />
              <div className="form-buttons" style={{ marginTop: '15px' }}>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-check"></i> Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddPopup(false);
                    setNewLocationName('');
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="location-table-container">
        <table className="location-table">
          <thead>
            <tr>
              <th>Location ID</th>
              <th>Location Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locationList.map((item) => (
              <tr key={item.locationId}>
                <td>{item.locationId}</td>
                <td>
                  {editingLocation === item.locationId ? (
                    <input
                      type="text"
                      value={editForm.locationName}
                      onChange={(e) => setEditForm({ ...editForm, locationName: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    item.locationName
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingLocation === item.locationId ? (
                      <>
                        <button className="save-btn" onClick={handleSaveEdit}>
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button className="cancel-btn" onClick={() => setEditingLocation(null)}>
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => handleEdit(item)}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(item.locationId)}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
