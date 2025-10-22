/// src/pages/stock/EditStockTransfer.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./StockTransfer.css";

export default function EditStockTransfer() {
  const navigate = useNavigate();
  const { id } = useParams(); // transferId from URL

  // 🔹 States
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showStatusInfo, setShowStatusInfo] = useState(false);
const [showFromInfo, setShowFromInfo] = useState(false);
const [showToInfo, setShowToInfo] = useState(false);

const [locked, setLocked] = useState(false);
const fetchPurchasePrice = async (productId, locationId) => {
  try {
    const res = await api.get(`/StockTransfer/GetPurchasePrice?productId=${productId}&locationId=${locationId}`);
    if (res.data && res.data.purchasePrice != null) {
      return parseFloat(res.data.purchasePrice) || 0;
    }
    return 0;
  } catch (err) {
    console.error("Error fetching purchase price:", err);
    return 0;
  }
};
  const [transfer, setTransfer] = useState({
    date: new Date().toISOString().split("T")[0],
    fromLocation: "",
    fromLocationName: "",
    toLocation: "",
    toLocationName: "",
    status: "Pending",
    shippingCharges: "",
    additionalNotes: ""
  });
  const grandTotal =
    selectedProducts.reduce((sum, p) => sum + p.totalAmount, 0) +
    Number(transfer.shippingCharges || 0);
  // 🔹 Fetch statuses
  useEffect(() => {
    api.get("/StockTransfer/Statuses")
      .then((res) => setStatuses(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Fetch locations
  useEffect(() => {
    api.get("/Location")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const mapped = res.data.map((loc) => ({
            id: loc.locationId,
            name: loc.locationName,
          }));
          setFromLocations(mapped);
          setToLocations(mapped);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  // 🔹 Fetch parent + children
// ... (existing code) ...

// 🔹 Fetch parent + children
useEffect(() => {
  const fetchTransferData = async () => {
    try {
      // 1️⃣ Fetch parent StockTransfer
      const res = await api.get(`/StockTransfer/${id}`);

      if (res.status === 204 || !res.data) {
        console.warn("No Stock Transfer record found.");
      } else {
        const transferData = res.data;

        setTransfer({
          date: transferData.date?.split("T")[0] || "",
          fromLocation: transferData.fromLocationId,
          fromLocationName: transferData.fromLocation?.locationName || "",
          toLocation: transferData.toLocationId,
          toLocationName: transferData.toLocation?.locationName || "",
          status: transferData.status || "",
          shippingCharges: transferData.shippingCharges || 0,
          additionalNotes: transferData.additionalNotes || "",
        });
         if (transferData.status === "Completed" || transferData.status === "Cancelled") {
     setLocked(true);    }
      }
 
      // 2️⃣ Fetch child StockTransferDetails
      try {
        const detailsRes = await api.get(`/StockTransferDetail/${id}`);
if (!detailsRes.data || detailsRes.data.length === 0) {
  console.warn("No items found for this transfer.");
  setSelectedProducts([]);
} else {
  setSelectedProducts(
    detailsRes.data.map((d) => ({
        transferId: d.transferId,      // ✅ backend TransferId
    stockTransferId: d.stockTransferId, // parent StockTransferId  
      id: d.productId,
      name: d.product?.productName || "",
      quantity: Number(d.quantity) || 0,
      unitPrice: Number(d.unitPrice) || 0,
      totalAmount: (Number(d.quantity) || 0) * (Number(d.unitPrice) || 0),
    }))
  );
}
      } catch (itemsErr) {
        console.error("Error fetching StockTransferDetail:", itemsErr);
        setSelectedProducts([]);
      }
    } catch (err) {
      console.error("Error fetching StockTransfer:", err);
      alert("⚠️ Could not load Stock Transfer. Please check if record exists.");
    } finally {
      setLoading(false);
    }
  };

  fetchTransferData();
}, [id]);

// ... (rest of the component code) ...

  // 🔹 Fetch products (search)
  useEffect(() => {
    if (searchQuery.trim().length < 1) return setProducts([]);
    api.get(`/Product/search?term=${encodeURIComponent(searchQuery)}`)
      .then((res) => setProducts(res.data || []))
      .catch((err) => console.error(err));
  }, [searchQuery]);

  // 🔹 Product handlers
  const handleProductSelect = async(product) => {
    if (!product) return;
    const id = product.productId ?? product.id;
    if (selectedProducts.some((p) => p.id === id)) return;
  const price = await fetchPurchasePrice(id, transfer.fromLocation);
    setSelectedProducts((prev) => [
      ...prev,
      {
        
        id,
        name: product.productName || product.name || "",
        quantity: 1,
          unitPrice: price,
        totalAmount: price * 1,
        
      },
    ]);
    setSearchQuery("");
    setProducts([]);
  };

  const handleDeleteProduct = async (productId) => {

     if (locked) {
   alert(
    `⚠️ This Stock Transfer cannot be updated because the Status is ${transfer.status}.`
 );
   return; // stop execution
 }
  try {
    const product = selectedProducts.find((p) => p.id === productId);
    if (!product) return;
 const confirmDelete = window.confirm(
      `Are you sure you want to delete product "${product.productName}" from this transfer?`
    );
    if (!confirmDelete) return;
    // ✅ If it's an existing record (has stockTransferId), delete from backend
    if (product.stockTransferId) {
      await api.delete(`/StockTransferDetail/${product.stockTransferId}`);
      alert(`✅ Product "${product.productName}" deleted successfully.`);
      console.log("Deleted StockTransferDetail:", product.stockTransferId);
    }

    // ✅ Remove from UI state
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  } catch (err) {
    console.error("Error deleting StockTransferDetail:", err);
    alert("⚠️ Failed to delete Stock Transfer Detail.");
  }
};

  const handleQuantityChange = (productId, value) => {
    const quantity = parseFloat(value) || 0;
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, quantity: quantity, totalAmount: quantity * (parseFloat(p.unitPrice) || 0) }
          : p
      )
    );
  };

  // 🔹 Save (PUT)
const handleUpdateTransfer = async (e) => {
  e.preventDefault();
   if (locked) {
   alert(
    `⚠️ This Stock Transfer cannot be updated because the Status is ${transfer.status}.`
 );
   return; // stop execution
 }

  if (!transfer.fromLocation || !transfer.toLocation) {
    alert("Please select both From and To locations.");
    return;
  }
  if (selectedProducts.length === 0) {
    alert("Please add at least one product.");
    return;
  }

  try {
        // 🔹 1) Check Low Stock
    let lowStockWarnings = [];

    for (const p of selectedProducts) {
      const stockRes = await api.get(
        `/Stock/GetStockInfo?productId=${p.id}&locationId=${transfer.fromLocation}`
      );

      const { currentStock, quantityAlert } = stockRes.data;
    const updatedStock = currentStock - p.quantity; // simulate new stock

if (p.quantity > updatedStock) {
  alert(
    `Insufficient Stock ⚠️
  ❌ Cannot transfer ${p.quantity} units of ${p.name}. Only ${currentStock} units available in stock.`
  );
  return; // stop saving, stay on same page
}

// ⚠️ If remaining stock goes below or equal to alert level → warn
if (updatedStock <= quantityAlert) {
  lowStockWarnings.push(
    `⚠️ ${p.name}: Current stock = ${currentStock}, Transfer = ${p.quantity}, Remaining = ${updatedStock}, Alert Level = ${quantityAlert}`
  );
}
    }

    if (lowStockWarnings.length > 0) {
      alert("Low Stock Warning:\n\n" + lowStockWarnings.join("\n"));
      // ❌ Block update completely:
     
      // ✅ OR allow update but still warn:
      // (remove the return)
    }
    // 🔹 Parent payload
    const updatedTransfer = {
      date: transfer.date,
      fromLocationId: transfer.fromLocation,
      fromLocation: {
        locationId: transfer.fromLocation,
        locationName: transfer.fromLocationName,
      },
      toLocationId: transfer.toLocation,
      toLocation: {
        locationId: transfer.toLocation,
        locationName: transfer.toLocationName,
      },
      status: transfer.status,
      shippingCharges: parseFloat(transfer.shippingCharges),
      additionalNotes: transfer.additionalNotes,
      totalAmount: selectedProducts.reduce((sum, p) => sum + p.totalAmount, 0),
    };

  

    // 🔹 Update each StockTransferDetail individually
for (const p of selectedProducts) {
const detailPayload = {
     transferId: id,  // ✅ lowercase
    productId: p.id,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
    totalAmount: p.totalAmount,
};

  
  console.log("Updating detail:", p.stockTransferId, detailPayload);

  if (p.transferId) {
    // ✅ existing detail → update
   await api.put(`/StockTransferDetail/${p.stockTransferId}`, detailPayload);
  }else {
        // ✅ new product → insert
        await api.post(`/StockTransferDetail`,  [detailPayload]);
      }

}
  // 🔹 Update parent StockTransfer
    await api.put(`/StockTransfer/${id}`, updatedTransfer);
    alert(`Stock transfer updated successfully! Transfer ID: ${id}`);
    if (transfer.status === "Completed" || transfer.status === "Cancelled") {
  setLocked(true);
}

    navigate("/stock/transfer");
  } catch (error) {
    console.error("Error updating stock transfer:", error);
    alert("Failed to update stock transfer.");
  }
};

  if (loading) return <div>Loading...</div>;

  return (
    <div className="stock-transfer-page">
      <Topbar />
      <Sidebar />
      <div className="stock-transfer-container">
        <div className="stock-transfer-header">
          <h2>Edit Stock Transfer</h2>
          <button className="cancel-btn" onClick={() => navigate("/stock/transfer")}>
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>

        <form onSubmit={handleUpdateTransfer} className="add-transfer-form">
          {/* 🔹 Same form fields as AddStockTransfer */}
         <div className="form-fields">
          {/* Row 1: Date + Status */}
       {/* Row 1: Date + Status */}
<div className="form-row">
  <div className="form-group">
    <label>Date</label>
    <input
      type="date"
      value={transfer.date}
      onChange={(e) =>
        setTransfer({ ...transfer, date: e.target.value })
      }
      className="transfer-input date-input"
      required
    />
  </div>

  <div className="form-group" style={{ position: "relative" }}>
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
            ⚠️ <b>Note:</b> Once the status is <b> Updated</b> to 
            <div><b>Completed</b> or <b>Cancelled</b>,</div>
          </div>
          <div>you will not be able to update it again.</div>
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
      value={transfer.status}
      onChange={(e) =>
        setTransfer({ ...transfer, status: e.target.value })
      }
      className="transfer-select"
       required
  disabled={locked} 
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
  {/* From Location */}
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
          <b>From Location:</b> Update to the location where stock will be transferred <u>from</u>.  
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
      value={transfer.fromLocation}
      onChange={(e) => {
        const selected = fromLocations.find(
          (l) => l.id === parseInt(e.target.value)
        );
        setTransfer({
          ...transfer,
          fromLocation: selected.id,
          fromLocationName: selected.name,
        });
      }}
      className="transfer-select"
      required
        disabled={locked}
    >
      <option value="">Select From Location</option>
      {fromLocations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  </div>

  {/* To Location */}
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
          <b>To Location:</b> Update to the location where stock will be transferred <u>to</u>.  
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
      value={transfer.toLocation}
      onChange={(e) => {
        const selected = toLocations.find(
          (l) => l.id === parseInt(e.target.value)
        );
        setTransfer({
          ...transfer,
          toLocation: selected.id,
          toLocationName: selected.name,
        });
      }}
      className="transfer-select"
      required
        disabled={locked}
    >
      <option value="">Select To Location</option>
      {toLocations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  </div>
</div>
          {/* Notes */}
          <div className="form-group full-width">
            <label>Additional Notes</label>
            <textarea
              value={transfer.additionalNotes}
              onChange={(e) =>
                setTransfer({ ...transfer, additionalNotes: e.target.value })
              }
              className="transfer-textarea"
            />
          </div>
        </div>

          {/* 🔹 Product Section */}
          <div className="product-section">
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
                    products.map((p) => {
                      const isSelected = selectedProducts.some((sp) => sp.id === (p.productId ?? p.id));
                      return (
                        <li
                          key={p.productId ?? p.id}
                          onClick={() => !isSelected && handleProductSelect(p)}
                          className={isSelected ? "disabled-item" : ""}
                        >
                          {p.productName || p.name} (ID: {p.productId ?? p.id})
                          {isSelected && " — Already selected"}
                        </li>
                      );
                    })
                  ) : (
                    <li className="not-found">Not found</li>
                  )}
                </ul>
              )}
            </div>

            <div className="product-list-container">
              <table className="product-table">
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
                  {selectedProducts.map((p) => (
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
                        <td>{p.unitPrice.toFixed(2)}</td>
                      <td>PKR{p.totalAmount.toFixed(2)}</td>
                      <td>
                        <button type="button" className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
   {/* Summary Section */}
        <div className="transfer-summary">
          <div className="summary-field">
            <label>Shipping Charges</label>
            <input
              type="number"
              value={transfer.shippingCharges}
              onChange={(e) =>
                setTransfer({ ...transfer, shippingCharges: e.target.value })
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
              <i className="fas fa-check"></i> Update Transfer
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/stock/transfer")}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
