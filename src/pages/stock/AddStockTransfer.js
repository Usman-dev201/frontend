import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import './StockTransfer.css';

export default function AddStockTransfer() {
  const navigate = useNavigate();

  // 🔹 States
  const [statuses, setStatuses] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
const [showStatusInfo, setShowStatusInfo] = useState(false);
const [showFromInfo, setShowFromInfo] = useState(false);
const [showToInfo, setShowToInfo] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    date: new Date().toISOString().split("T")[0],
    fromLocation: '',
    fromLocationName: '',
    toLocation: '',
    toLocationName: '',
    status: 'Pending', // default to Pending
    shippingCharges: 0,
    additionalNotes: ''
  });
// 🔹 Compute grand total dynamically
const grandTotal = selectedProducts.reduce((sum, p) => sum + p.totalAmount, 0) + (parseFloat(newTransfer.shippingCharges) || 0);

  // 🔹 Fetch statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.get('/StockTransfer/Statuses');
        setStatuses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatuses();
  }, []);

  // 🔹 Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/Location'); // endpoint to get all locations
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(loc => ({
            id: loc.locationId,
            name: loc.locationName
          }));
          setFromLocations(mapped);
          setToLocations(mapped);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // 🔹 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (searchQuery.trim().length < 1) return setProducts([]);
      try {
        const res = await api.get(`/Product/search?term=${encodeURIComponent(searchQuery)}&t`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  // 🔹 Product handlers
const handleProductSelect = async (product) => {
  if (!product) return;

  if (!newTransfer.fromLocation) {
    alert("Please select a From Location first.");
    return;
  }

  const id = product.productId ?? product.id;
  if (selectedProducts.some(p => p.id === id)) return;

  try {
    const res = await api.get(
      `/StockTransfer/GetPurchasePrice?productId=${id}&locationId=${newTransfer.fromLocation}`
    );

    const purchasePrice = res.data?.purchasePrice || 0;

    setSelectedProducts(prev => [
      ...prev,
      {
        id,
        name: product.productName || product.name || '',
        quantity: 1,
        unitPrice: purchasePrice, // ✅ auto-filled
        totalAmount: purchasePrice,
      }
    ]);
  } catch (err) {
    console.error("Error fetching purchase price:", err);
  }

  setSearchQuery('');
  setProducts([]);
};

  const handleDeleteProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: parseInt(value) || 0, totalAmount: (parseInt(value) || 0) * p.unitPrice }
          : p
      )
    );
  };


  // 🔹 Save transfer
  const handleAddTransfer = async (e) => {
    e.preventDefault();

    if (!newTransfer.fromLocation || !newTransfer.toLocation) {
      alert("Please select both From and To locations.");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    try {
       // 🔹 Check LowStock for all selected products
    let lowStockWarnings = [];

    for (const p of selectedProducts) {
      const stockRes = await api.get(
        `/Stock/GetStockInfo?productId=${p.id}&locationId=${newTransfer.fromLocation}`
      );

      const { currentStock, quantityAlert } = stockRes.data;

      const updatedStock = currentStock - p.quantity; // simulate new stock
// ❌ If trying to transfer more than available stock → block immediately
if (p.quantity > updatedStock) {
  alert(

    `Insufficient Stock ⚠️
❌ Cannot transfer ${p.quantity} units of ${p.name}. Only ${currentStock} units available in stock.`
  );
  return; // stop saving, stay on same page
}
      if (updatedStock <= quantityAlert) {
        lowStockWarnings.push(
          `⚠️ ${p.name}: Current stock = ${currentStock}, Transfer = ${p.quantity}, Remaining = ${updatedStock}, Alert Level = ${quantityAlert}`
        );
      }
    }

    if (lowStockWarnings.length > 0) {
      alert("Low Stock Warning:\n\n" + lowStockWarnings.join("\n"));
      // ⚠️ If you want to STOP saving transfer when low stock:
     
      // If you only want to WARN but still allow save, remove the return.
    }


      // 🔹 Parent transfer payload (keep unchanged)
      const details = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        totalAmount: p.quantity * p.unitPrice,
      }));

      const transfer = {
        date: newTransfer.date,
        fromLocationId: newTransfer.fromLocation,
        fromLocation: {
          locationId: newTransfer.fromLocation,
          locationName: newTransfer.fromLocationName,
        },
        toLocationId: newTransfer.toLocation,
        toLocation: {
          locationId: newTransfer.toLocation,
          locationName: newTransfer.toLocationName,
        },
        status: newTransfer.status,
        shippingCharges: parseFloat(newTransfer.shippingCharges),
        additionalNotes: newTransfer.additionalNotes,
        totalAmount: details.reduce((sum, d) => sum + d.totalAmount, 0),
      };

      // 🔹 Save parent transfer
      const response = await api.post("/stocktransfer", [transfer]);
      const savedTransfer = response.data[0];
      const transferId = savedTransfer.transferId || savedTransfer.id;

      console.log("Saved parent transfer:", savedTransfer);

      // 🔹 Add child StockTransferDetail records
      const childDetails = selectedProducts.map((p) => ({
        transferId: transferId, // link to parent
        productId: p.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        totalAmount: p.quantity * p.unitPrice,
      }));

      if (childDetails.length > 0) {
        await api.post("/StockTransferDetail", childDetails);
        console.log("Child StockTransferDetail records saved:", childDetails);
      }

      // 🔹 Optionally fetch the parent with children
      const getResponse = await api.get(`/stocktransfer/${transferId}`);
      const loadedTransfer = getResponse.data;

      alert(`Stock transfer saved successfully! Transfer ID: ${transferId}`);
      console.log("Loaded Transfer from backend:", loadedTransfer);

      navigate('/stock/transfer'); // go back to list
    } catch (error) {
      console.error("Error saving stock transfer or child details:", error);
      alert("Failed to save stock transfer.");
    }
  };

  return (
    <div className="stock-transfer-page">
      <Topbar />
      <Sidebar />
      <div className="stock-transfer-container">
        {/* Header */}
        <div className="stock-transfer-header">
          <h2>Add Stock Transfer</h2>
          <button className="cancel-btn" onClick={() => navigate('/stock/transfer')}>
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAddTransfer} className="add-transfer-form">
         <div className="form-fields">
  {/* Row 1: Date + Status */}
  <div className="form-row">
    <div className="form-group">
      <label>Date</label>
    <input
  type="date"
  value={newTransfer.date}
  onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
  className="transfer-input date-input"
  required
/>
    </div>

   <div className="form-group">
  <label style={{ display: "flex", alignItems: "center" }}>
    Status
    <span
      onMouseEnter={() => setShowStatusInfo(true)}
      onMouseLeave={() => setShowStatusInfo(false)}
      style={{
        marginLeft: "8px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "12px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
        transition: "all 0.2s ease"
      }}
    >
      ?
    </span>

    {/* Popup */}
    {showStatusInfo && (
      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "0",
          zIndex: 10,
          backgroundColor: "#fff",
          color: "#333",
          padding: "10px 14px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "13px",
          lineHeight: "1.4",
          width: "260px",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          ⚠️ <b>Note:</b> Once the status is set to 
          <div><b>Completed</b> or <b>Cancelled</b>,</div>
        </div>
        <div>you will not be able to update it again.</div>
        {/* Tooltip Arrow */}
        <div
          style={{
            position: "absolute",
            top: "-6px",
            left: "12px",
            width: "12px",
            height: "12px",
            backgroundColor: "#fff",
            borderLeft: "1px solid #ddd",
            borderTop: "1px solid #ddd",
            transform: "rotate(45deg)"
          }}
        />
      </div>
    )}
  </label>

  <select
    value={newTransfer.status}
    onChange={(e) => setNewTransfer({ ...newTransfer, status: e.target.value })}
    className="transfer-select"
    required
  >
    <option value="">Select Status</option>
    {statuses.map((s, i) => (
      <option key={i} value={s}>{s}</option>
    ))}
  </select>
</div>
</div>

  {/* Row 2: From + To Location */}
  <div className="form-row">
    <div className="form-group" style={{ position: "relative" }}>
  <label style={{ display: "flex", alignItems: "center" }}>
    From Location
    <span
      onMouseEnter={() => setShowFromInfo(true)}
      onMouseLeave={() => setShowFromInfo(false)}
      style={{
        marginLeft: "8px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "12px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
      }}
    >
      ?
    </span>

    {showFromInfo && (
      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "0",
          zIndex: 10,
          backgroundColor: "#fff",
          color: "#333",
          padding: "10px 14px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "13px",
          lineHeight: "1.4",
          width: "260px",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
        }}
      >
        <b>From Location:</b> Select the location where stock will be transferred <u>from</u>.  
        Products and purchase price will be fetched based on this location.
        <div
          style={{
            position: "absolute",
            top: "-6px",
            left: "12px",
            width: "12px",
            height: "12px",
            backgroundColor: "#fff",
            borderLeft: "1px solid #ddd",
            borderTop: "1px solid #ddd",
            transform: "rotate(45deg)"
          }}
        />
      </div>
    )}
  </label>

  <select
    value={newTransfer.fromLocation}
    onChange={(e) => {
      const selected = fromLocations.find(l => l.id === parseInt(e.target.value));
      setNewTransfer({
        ...newTransfer,
        fromLocation: selected.id,
        fromLocationName: selected.name
      });
    }}
    className="transfer-select"
    required
  >
    <option value="">Select From Location</option>
    {fromLocations.map(loc => (
      <option key={loc.id} value={loc.id}>{loc.name}</option>
    ))}
  </select>
</div>


   <div className="form-group" style={{ position: "relative" }}>
  <label style={{ display: "flex", alignItems: "center" }}>
    To Location
    <span
      onMouseEnter={() => setShowToInfo(true)}
      onMouseLeave={() => setShowToInfo(false)}
      style={{
        marginLeft: "8px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#007bff",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "12px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
      }}
    >
      ?
    </span>

    {showToInfo && (
      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "0",
          zIndex: 10,
          backgroundColor: "#fff",
          color: "#333",
          padding: "10px 14px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          fontSize: "13px",
          lineHeight: "1.4",
          width: "260px",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
        }}
      >
        <b>To Location:</b> Select the location where stock will be transferred <u>to</u>.  
        The stock will be added at this location once transfer is <b>Completed</b>.
        <div
          style={{
            position: "absolute",
            top: "-6px",
            left: "12px",
            width: "12px",
            height: "12px",
            backgroundColor: "#fff",
            borderLeft: "1px solid #ddd",
            borderTop: "1px solid #ddd",
            transform: "rotate(45deg)"
          }}
        />
      </div>
    )}
  </label>

  <select
    value={newTransfer.toLocation}
    onChange={(e) => {
      const selected = toLocations.find(l => l.id === parseInt(e.target.value));
      setNewTransfer({
        ...newTransfer,
        toLocation: selected.id,
        toLocationName: selected.name
      });
    }}
    className="transfer-select"
    required
  >
    <option value="">Select To Location</option>
    {toLocations.map(loc => (
      <option key={loc.id} value={loc.id}>{loc.name}</option>
    ))}
  </select>
</div>

  </div>

  {/* Additional Notes (full width) */}
  <div className="form-group full-width">
    <label>Additional Notes</label>
    <textarea
      value={newTransfer.additionalNotes}
      onChange={(e) => setNewTransfer({ ...newTransfer, additionalNotes: e.target.value })}
      className="transfer-textarea"
    />
  </div>
</div>

          {/* Product Search */}
          <div className="product-section">
                <h3>Search Products</h3>
            <div className="search-bar-container">
          
              <input
                type="text"
                placeholder="Search products by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery.trim().length >= 1 && (
                <ul className="Sdropdown-list">
                  {products.length > 0 ? (
                    products.map(p => {
                      const isSelected = selectedProducts.some(sp => sp.id === (p.productId ?? p.id));
                      return (
                        <li
                          key={p.productId ?? p.id}
                          onClick={() => !isSelected && handleProductSelect(p)}
                          className={isSelected ? 'disabled-item' : ''}
                        >
                          {p.productName || p.name} (ID: {p.productId ?? p.id})
                          {isSelected && ' — Already selected'}
                        </li>
                      );
                    })
                  ) : (
                    <li className="not-found">Not found</li>
                  )}
                </ul>
              )}
            </div>

            {/* Selected Products Table */}
            <div className="product-list-container">
              <table className="discount-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={p.quantity}
                          onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                          className="quantity-input"
                        />
                      </td>
                      <td>
                       <td>{p.unitPrice.toFixed(2)}</td>
                      </td>
                      <td>{p.totalAmount.toFixed(2)}</td>
                      <td>
                        <button type="button" className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
{/* Totals Section */}
<div className="transfer-summary">
  <div className="summary-field">
    <label>Shipping Charges</label>
    <input
      type="number"
      value={newTransfer.shippingCharges}
      onChange={(e) =>
        setNewTransfer({ ...newTransfer, shippingCharges: e.target.value })
      }
      className="summary-input"
    />
  </div>

  <div className="summary-field">
    <label>Grand Total</label>
    <input
      type="text"
      value={grandTotal.toFixed(2)}
      className="summary-input"
      readOnly
    />
  </div>
</div>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="submit" className="submit-btn">
              <i className="fas fa-check"></i> Save Transfer
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/stock/transfer')}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
