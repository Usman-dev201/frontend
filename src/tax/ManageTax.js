import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { useTax } from '../context/TaxContext';
import { usePurchase } from '../context/PurchaseContext';
import './TaxList.css';

export default function ManageTax() {
  const {  getTaxLocations, loading, addTaxLocation} = useTax();
const { taxNames, locations } = usePurchase(); 
const [taxData, setTaxData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
 const [formData, setFormData] = useState({
  taxId: '',
  locationId: '',
  taxPercentage: '',
  effectiveDate: '',
});

  useEffect(() => {
  async function fetchData() {
    try {
      const response = await getTaxLocations();
      setTaxData(response);
    } catch (err) {
      console.error("Failed to load tax location data", err);
    }
  }

  fetchData();
  // taxNames and locations are auto-loaded via PurchaseProvider
}, [getTaxLocations]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({
      taxName: '',
      location: '',
      taxPercentage: '',
      effectiveDate: '',
    });
  };
const handleSave = async () => {
  try {
    const payload = {
      taxId: parseInt(formData.taxId),
      locationId: parseInt(formData.locationId),
      taxPercentage: parseFloat(formData.taxPercentage),
      effectiveDate: formData.effectiveDate
    };

    await addTaxLocation(payload);
    setShowPopup(false);
    setFormData({
      taxId: '',
      locationId: '',
      taxPercentage: '',
      effectiveDate: '',
    });

    const refreshed = await getTaxLocations(); // refresh table
    setTaxData(refreshed);
  } catch (error) {
    alert('Failed to save tax location. See console for details.');
    console.error(error);
  }
};
  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="tax-list-container">
          <div className="tax-list-header">
            <h2>Manage Tax</h2>
            <button className="add-tax-btn" onClick={() => setShowPopup(true)}>Manage</button>
          </div>

          {loading ? (
            <p>Loading tax locations...</p>
          ) : (
            <div className="tax-table-container">
              <table className="tax-table">
                <thead>
                  <tr>
                    <th className="equal-width">Tax ID</th>
                    <th className="equal-width">Tax Name</th>
                    <th className="equal-width">Location</th>
                    <th className="equal-width">Tax Percentage</th>
                    <th className="equal-width">Effective Date</th>
                  </tr>
                </thead>
                <tbody>
                {taxData.map((item, index) => {
    const tax = taxNames.find(t => t.taxId === item.taxId);
    const location = locations.find(l => l.locationId === item.locationId);

    return (
      <tr key={index}>
        <td>{item.taxId}</td>
        <td>{tax ? tax.taxName : 'Unknown Tax'}</td>
        <td>{location ? location.locationName : 'Unknown Location'}</td>
        <td>{item.taxPercentage}%</td>
        <td>{new Date(item.effectiveDate).toLocaleDateString()}</td>
      </tr>
    );
  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-form">
              <h3>Manage Tax Entry</h3>

              <label>Tax Name</label>
<select name="taxId" value={formData.taxId} onChange={handleChange}>
  <option value="">Select Tax</option>
  {taxNames.map(tax => (
    <option key={tax.taxId} value={tax.taxId}>{tax.taxName}</option>
  ))}
</select>

<label>Location</label>
<select name="locationId" value={formData.locationId} onChange={handleChange}>
  <option value="">Select Location</option>
  {locations.map(loc => (
    <option key={loc.locationId} value={loc.locationId}>{loc.locationName}</option>
  ))}
</select>


              <label>Tax Percentage</label>
              <input
                type="number"
                name="taxPercentage"
                value={formData.taxPercentage}
                onChange={handleChange}
                placeholder="Enter tax %"
              />

              <label>Effective Date</label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
              />

              <div className="form-buttons">
               <button className="submit-btn" onClick={handleSave}>Save</button>
                <button className="cancel-btn" onClick={closePopup}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
