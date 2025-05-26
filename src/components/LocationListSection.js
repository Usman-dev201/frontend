import React, { useState } from 'react';
import './LocationListSection.css';

export default function LocationListSection() {
  // Mock data for demonstration
  const [locationList, setLocationList] = useState([
    { 
      id: 'LOC001',
      name: 'Warehouse A'
    },
    { 
      id: 'LOC002',
      name: 'Store 1'
    },
    { 
      id: 'LOC003',
      name: 'Distribution Center'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    name: ''
  });

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      setLocationList([...locationList, { 
        id: `LOC${String(locationList.length + 1).padStart(3, '0')}`,
        name: newLocationName
      }]);
      setNewLocationName('');
      setShowAddForm(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location.id);
    setEditForm({
      id: location.id,
      name: location.name
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setLocationList(locationList.map(item => 
      item.id === editingLocation ? {
        ...item,
        name: editForm.name
      } : item
    ));
    setEditingLocation(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocationList(locationList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="location-list-container">
      <div className="location-list-header">
        <h2>Location List</h2>
        <button 
          className="add-location-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i> Add Location
        </button>
      </div>

      {showAddForm && (
        <div className="add-location-form-container">
          <form onSubmit={handleAddLocation} className="add-location-form">
            <div className="form-group">
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="Enter Location Name"
                className="location-name-input"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                <i className="fas fa-check"></i> Save
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setNewLocationName('');
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
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
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  {editingLocation === item.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="edit-input"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingLocation === item.id ? (
                      <>
                        <button 
                          className="save-btn"
                          onClick={handleSaveEdit}
                        >
                          <i className="fas fa-save"></i> Save
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => setEditingLocation(null)}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
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