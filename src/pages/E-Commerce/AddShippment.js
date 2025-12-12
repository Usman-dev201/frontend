// src/pages/Shipping/AddShipping.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./AddShippment.css";

export default function AddShipping() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Dropdown lists from backend
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippedViaOptions, setShippedViaOptions] = useState([]);
  const [shippingStatuses, setShippingStatuses] = useState([]);
  const [locations, setLocations] = useState([]);


const [shippingInfo, setShippingInfo] = useState({
  orderId: orderId || "",
  shippingMethod: "",
  trackingNumber: "",
  shippedVia: "",
  locationId: "", // added
});


  const [trackingRows, setTrackingRows] = useState([
    { date: new Date().toISOString().split('T')[0], time: "", location: "", status: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setShippingInfo((s) => ({ ...s, orderId: orderId || "" }));
    loadDropdownData();
  }, [orderId]);

 const loadDropdownData = async () => {
  try {
    const [methodsRes, viaRes, statusRes, locationRes] = await Promise.all([
      api.get("/Shipping/shippingMethods"),
      api.get("/Shipping/shippedViaOptions"),
      api.get("/Shipping/shippingStatuses"),
      api.get("/Location") // your backend endpoint for locations
    ]);
    setShippingMethods(methodsRes.data);
    setShippedViaOptions(viaRes.data);
    setShippingStatuses(statusRes.data);
    setLocations(locationRes.data); // set locations
  } catch (err) {
    console.error("Dropdown fetch error:", err);
    alert("Failed to load dropdown values.");
  }
};

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrackingChange = (index, e) => {
    const { name, value } = e.target;
    setTrackingRows((rows) => {
      const copy = [...rows];
      copy[index] = { ...copy[index], [name]: value };
      return copy;
    });
  };

  const addTrackingRow = () => {
    setTrackingRows((rows) => [
      ...rows,
      {date: new Date().toISOString().split('T')[0], time: "", location: "", status: "" },
    ]);
  };

  const deleteTrackingRow = (index) => {
    setTrackingRows((rows) => rows.filter((_, i) => i !== index));
  };

  const validateBeforeSubmit = () => {
    if (!shippingInfo.orderId) return alert("OrderId missing.");
    if (!shippingInfo.shippingMethod) return alert("Select a Shipping Method.");
    if (!shippingInfo.trackingNumber.trim()) return alert("Enter Tracking Number.");
    if (!shippingInfo.shippedVia) return alert("Select Shipped Via.");
if (!shippingInfo.locationId) return alert("Select a Location.");

    
    return true;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateBeforeSubmit()) return;

  setIsSubmitting(true);

  try {
    // 1️⃣ Create shipping record
const shippingPayload = [{
  orderId: Number(shippingInfo.orderId),
  shippingMethod: shippingInfo.shippingMethod,
  trackingNumber: shippingInfo.trackingNumber,
  shippedVia: shippingInfo.shippedVia,
  locationId: Number(shippingInfo.locationId), // send selected location
}];


    const shippingRes = await api.post("/Shipping", shippingPayload);
    const createdShipping = shippingRes.data[0]; // backend returns array
    const shippingId = createdShipping.shippingId;

    // 2️⃣ Create tracking records
    const trackingPayload = trackingRows.map((row) => ({
      shippingId: shippingId,
      date: row.date,
      time: row.time,
      status: row.status,
      location: row.location,
    }));

    await api.post("/ShippingTracking", trackingPayload);

    alert("✅ Shipping and tracking records created successfully.");
    navigate(`/ecommerce/shipments`);

  } catch (err) {
  console.error("Create shipping error:", err);

  if (err.response) {
    if (err.response.status === 400) {
      alert(err.response.data); // backend BadRequest message
    } else {
      alert(`Error: ${err.response.status} - ${err.response.data}`);
    }
  } else {
    alert("❌ Failed to save shipping. Server not reachable.");
  }
}
};

  return (
    <div className="add-shipping-page">
      <Topbar />
      <Sidebar />

      <div className="add-shipping-container">
        <div className="add-shipping-header">
          <h2>Add Shipping</h2>
        </div>

        <form className="add-shipping-form" onSubmit={handleSubmit}>

        {/* Shipping info rows */}
<div className="form-row">
  {/* Row 1: Order Id + Shipping Method */}
  <div className="shipform-group">
    <label>Order Id</label>
    <input type="text" value={shippingInfo.orderId} readOnly />
  </div>

<div className="shipform-group">
  <label>Location</label>
  <select
    name="locationId"
    value={shippingInfo.locationId}
    onChange={handleShippingInfoChange}
  >
    <option value="">Select Location</option>
    {locations.map((loc) => (
      <option key={loc.locationId} value={loc.locationId}>
        {loc.locationName}
      </option>
    ))}
  </select>
</div>

  <div className="shipform-group">
    <label>Shipping Method</label>
    <select
      name="shippingMethod"
      value={shippingInfo.shippingMethod}
      onChange={handleShippingInfoChange}
    >
      <option value="">Select Method</option>
      {shippingMethods.map((m, i) => <option key={i} value={m}>{m}</option>)}
    </select>
  </div>
    <div className="shipform-group">
    <label>Tracking Number</label>
    <input
      type="text"
      name="trackingNumber"
      value={shippingInfo.trackingNumber}
      onChange={handleShippingInfoChange}
    />
  </div>

</div>

<div className="form-row">
  {/* Row 2: Tracking Number + Shipped Via */}

  <div className="shipform-group">
    <label>Shipped Via</label>
    <select
      name="shippedVia"
      value={shippingInfo.shippedVia}
      onChange={handleShippingInfoChange}
    >
      <option value="">Select Courier</option>
      {shippedViaOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
    </select>
  </div>
</div>


          {/* Tracking Table */}
          <div className="tracking-panel">
            <div className="tracking-panel-header">
              <h3>Tracking Entries</h3>
              <button type="button" className="btn-add-row" onClick={addTrackingRow}>+ Add Row</button>
            </div>

            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Date</th>
                 
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trackingRows.map((row, idx) => (
                  <tr key={idx}>
                    <td><input type="date" name="date" value={row.date} onChange={(e) => handleTrackingChange(idx, e)} /></td>
                 
                    <td><input type="text" name="location" value={row.location} onChange={(e) => handleTrackingChange(idx, e)} /></td>
                    <td>
                      <select name="status" value={row.status} onChange={(e) => handleTrackingChange(idx, e)}>
                        <option value="">Select Status</option>
                        {shippingStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button type="button" className="btn-delete" onClick={() => deleteTrackingRow(idx)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="btn-save">
              {isSubmitting ? "Saving..." : "Save Shipping"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
