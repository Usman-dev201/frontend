// src/pages/stock/EditStockTransfer.js
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

  const [transfer, setTransfer] = useState({
    date: "",
    fromLocation: "",
    fromLocationName: "",
    toLocation: "",
    toLocationName: "",
    status: "",
    shippingCharges: "",
    additionalNotes: ""
  });

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
      }

      // 2️⃣ Fetch child StockTransferDetails
      try {
        const detailsRes = await api.get(`/StockTransferDetail/${id}`);

        if (detailsRes.status === 204 || !detailsRes.data) {
          console.warn("No items found for this transfer.");
          setSelectedProducts([]);
        } else {
          // ⭐ FIX: Check if the response data is an array
          const productsArray = Array.isArray(detailsRes.data)
            ? detailsRes.data
            : [detailsRes.data]; // If not an array, wrap it in one

          setSelectedProducts(
            productsArray.map((d) => ({
              id: d.productId,
              name: d.product?.productName || "",
              quantity: parseFloat(d.quantity || 0),
              unitPrice: parseFloat(d.unitPrice || 0),
              totalAmount: parseFloat(d.totalAmount || 0),
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
  const handleProductSelect = (product) => {
    if (!product) return;
    const id = product.productId ?? product.id;
    if (selectedProducts.some((p) => p.id === id)) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        id,
        name: product.productName || product.name || "",
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
      },
    ]);
    setSearchQuery("");
    setProducts([]);
  };

  const handleDeleteProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
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

  const handleUnitPriceChange = (productId, value) => {
    const unitPrice = parseFloat(value) || 0;
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, unitPrice: unitPrice, totalAmount: (parseFloat(p.quantity) || 0) * unitPrice }
          : p
      )
    );
  };

  // 🔹 Save (PUT)
  const handleUpdateTransfer = async (e) => {
    e.preventDefault();

    if (!transfer.fromLocation || !transfer.toLocation) {
      alert("Please select both From and To locations.");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    try {
      // Parent payload
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
        totalAmount: selectedProducts.reduce(
          (sum, p) => sum + p.totalAmount,
          0
        ),
      };

      // Child payload (linked to parent by transferId)
      const details = selectedProducts.map((p) => ({
        transferId: Number(id),
        productId: p.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        totalAmount: p.totalAmount,
      }));

      // 🔹 Update parent
      await api.put(`/StockTransfer/${id}`, updatedTransfer);

      // 🔹 Update child (linked with parentId)
      await api.put(`/StockTransferDetail/${id}`, details);

      alert(`Stock transfer updated successfully! Transfer ID: ${id}`);
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
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={transfer.date}
                onChange={(e) => setTransfer({ ...transfer, date: e.target.value })}
                className="transfer-input"
                required
              />
            </div>

            <div className="form-group">
              <label>From Location</label>
              <select
                value={transfer.fromLocation}
                onChange={(e) => {
                  const selected = fromLocations.find((l) => l.id === parseInt(e.target.value));
                  setTransfer({ ...transfer, fromLocation: selected.id, fromLocationName: selected.name });
                }}
                className="transfer-select"
                required
              >
                <option value="">Select From Location</option>
                {fromLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>To Location</label>
              <select
                value={transfer.toLocation}
                onChange={(e) => {
                  const selected = toLocations.find((l) => l.id === parseInt(e.target.value));
                  setTransfer({ ...transfer, toLocation: selected.id, toLocationName: selected.name });
                }}
                className="transfer-select"
                required
              >
                <option value="">Select To Location</option>
                {toLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={transfer.status}
                onChange={(e) => setTransfer({ ...transfer, status: e.target.value })}
                className="transfer-select"
                required
              >
                <option value="">Select Status</option>
                {statuses.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Shipping Charges</label>
              <input
                type="number"
                value={transfer.shippingCharges}
                onChange={(e) => setTransfer({ ...transfer, shippingCharges: e.target.value })}
                className="transfer-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={transfer.additionalNotes}
                onChange={(e) => setTransfer({ ...transfer, additionalNotes: e.target.value })}
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
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={p.unitPrice}
                          onChange={(e) => handleUnitPriceChange(p.id, e.target.value)}
                          className="price-input"
                        />
                      </td>
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