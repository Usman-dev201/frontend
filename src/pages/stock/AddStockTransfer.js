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

  const [newTransfer, setNewTransfer] = useState({
    date: '',
    fromLocation: '',
    fromLocationName: '',
    toLocation: '',
    toLocationName: '',
    status: '',
    shippingCharges: '',
    additionalNotes: ''
  });

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
  const handleProductSelect = (product) => {
    if (!product) return;
    const id = product.productId ?? product.id;
    if (selectedProducts.some(p => p.id === id)) return;

    setSelectedProducts(prev => [
      ...prev,
      { id, name: product.productName || product.name || '', quantity: 1, unitPrice: 0, totalAmount: 0 }
    ]);
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

  const handleUnitPriceChange = (productId, value) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, unitPrice: parseFloat(value) || 0, totalAmount: p.quantity * (parseFloat(value) || 0) }
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
            {/* Date */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newTransfer.date}
                onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
                className="transfer-input"
                required
              />
            </div>

            {/* From Location */}
            <div className="form-group">
              <label>From Location</label>
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

            {/* To Location */}
            <div className="form-group">
              <label>To Location</label>
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

            {/* Status */}
            <div className="form-group">
              <label>Status</label>
              <select
                value={newTransfer.status}
                onChange={(e) => setNewTransfer({ ...newTransfer, status: e.target.value })}
                className="transfer-select"
                required
              >
                <option value="">Select Status</option>
                {statuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Shipping Charges */}
            <div className="form-group">
              <label>Shipping Charges</label>
              <input
                type="number"
                value={newTransfer.shippingCharges}
                onChange={(e) => setNewTransfer({ ...newTransfer, shippingCharges: e.target.value })}
                className="transfer-input"
                required
              />
            </div>

            {/* Additional Notes */}
            <div className="form-group">
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
                        <button type="button" className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
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
