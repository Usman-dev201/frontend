// src/pages/Shipping/AddShipping.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./AddShippment.css";

export default function AddShipping() {
  const { shippingId, orderId } = useParams();
  const navigate = useNavigate();

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

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [methodsRes, viaRes, statusRes,locationRes] = await Promise.all([
          api.get("/Shipping/shippingMethods"),
          api.get("/Shipping/shippedViaOptions"),
          api.get("/Shipping/shippingStatuses"),
            api.get("/Location")
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
    loadDropdownData();
  }, []);

  // Load existing shipping for update
  useEffect(() => {
    if (shippingId) {
      const fetchShipping = async () => {
        try {
          const res = await api.get(`/Shipping/${shippingId}`);
          const data = res.data;

          setShippingInfo({
            orderId: data.orderId,
            shippingMethod: data.shippingMethod || "",
            trackingNumber: data.trackingNumber || "",
            shippedVia: data.shippedVia || "",
            locationId: data.locationId || "", // set locationId
          });

          if (data.shippingTrackings && data.shippingTrackings.length > 0) {
            setTrackingRows(
              data.shippingTrackings.map((t) => ({
                shippingTrackingId: t.shippingTrackingId, // keep id for updates
                date: t.date ? t.date.split('T')[0] : new  Date().toISOString().split('T')[0],
                location: t.location || "",
                status: t.status || "",
              }))
            );
          }
        } catch (err) {
          console.error("Failed to fetch shipping:", err);
          alert("Failed to load shipping info.");
        }
      };
      fetchShipping();
    }
  }, [shippingId]);

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
      { date: new Date().toISOString().split('T')[0], location: "", status: "" },
    ]);
  };

  const deleteTrackingRow = (index) => {
    setTrackingRows((rows) => rows.filter((_, i) => i !== index));
  };

 // Submit shipping and tracking updates (only POST new trackings)
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // 1️⃣ Update Shipping info
    await api.put(`/Shipping/${shippingId}`, [
      {
        orderId: parseInt(shippingInfo.orderId),
        shippingMethod: shippingInfo.shippingMethod,
        trackingNumber: shippingInfo.trackingNumber,
        shippedVia: shippingInfo.shippedVia,
      },
    ]);

    // 2️⃣ Filter ONLY new shipping tracking rows
    const newTrackings = trackingRows
      .filter(t => !t.shippingTrackingId)   // <-- NEW (only entries without ID)
      .map(t => ({
        shippingId: parseInt(shippingId),
        date: new Date().toISOString().split('T')[0],
        status: t.status,
        location: t.location,
      }));

    // If there are NEW rows, send them
    if (newTrackings.length > 0) {
      await api.post("/ShippingTracking", newTrackings);
    }

    alert("Shipping updated successfully!");
    navigate(-1);
  } catch (err) {
    console.error("Update failed:", err.response?.data || err);
    alert("Failed to update shipping.");
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <div className="add-shipping-page">
      <Topbar />
      <Sidebar />

      <div className="add-shipping-container">
        <div className="add-shipping-header">
          <h2>Update Shipping</h2>
        </div>

        <form className="add-shipping-form" onSubmit={handleSubmit}>
          {/* Shipping Info */}
          <div className="form-row">
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
                {shippingMethods.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
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

          <div className="shipform-row">
          
            <div className="shipform-group">
              <label>Shipped Via</label>
              <select
                name="shippedVia"
                value={shippingInfo.shippedVia}
                onChange={handleShippingInfoChange}
              >
                <option value="">Select Courier</option>
                {shippedViaOptions.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tracking Table */}
          <div className="tracking-panel">
            <div className="tracking-panel-header">
              <h3>Tracking Entries</h3>
              <button type="button" className="btn-add-row" onClick={addTrackingRow}>
                + Add Row
              </button>
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
                    <td>
                      <input
                        type="date"
                        name="date"
                        value={row.date}
                        onChange={(e) => handleTrackingChange(idx, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="location"
                        value={row.location}
                        onChange={(e) => handleTrackingChange(idx, e)}
                      />
                    </td>
                    <td>
                      <select
                        name="status"
                        value={row.status}
                        onChange={(e) => handleTrackingChange(idx, e)}
                      >
                        <option value="">Select Status</option>
                        {shippingStatuses.map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="btn-delete" onClick={() => deleteTrackingRow(idx)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="btn-save">
              {isSubmitting ? "Saving..." : "Update Shipping"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
