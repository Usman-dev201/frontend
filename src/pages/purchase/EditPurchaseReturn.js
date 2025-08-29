// src/pages/purchase/EditPurchaseReturn.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "../../styles/purchase/Purchase.css";

export default function EditPurchaseReturn() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    date: "",
    purchaseId: "",
    amountReturned: 0,
    paymentDue: 0,
    paymentStatus: "",
    refundStatus: "",
    reasonForRefund: "",
    purchaseReturnId: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [refundStatuses, setRefundStatuses] = useState([]);

  // --- Load purchase return ---
useEffect(() => {
  const fetchData = async () => {
    try {
      // 1️⃣ Fetch parent PurchaseReturn
      const res = await api.get(`/PurchaseReturn/${id}`);

      if (res.status === 204 || !res.data) {
        console.warn("No Purchase Return record found.");
      } else {
        const returnData = res.data;

        setFormData({
          date: returnData.date ? returnData.date.split("T")[0] : "",
          purchaseId: returnData.purchaseId,
          amountReturned: returnData.amountReturned || 0,
          paymentDue: returnData.paymentDue || 0,
          paymentStatus: returnData.paymentStatus || "",
          refundStatus: returnData.refundStatus || "",
          reasonForRefund: returnData.reasonforRefund || "",
          purchaseReturnId: returnData.purchaseReturnId,
        });
      }

      // 2️⃣ Fetch child PurchaseReturnItems
      try {
        const itemsRes = await api.get(`/PurchaseReturnItem/${id}`);
        if (itemsRes.status === 204 || !itemsRes.data) {
          console.warn("No items found for this return.");
          setSelectedProducts([]);
        } else {
          setSelectedProducts(
            itemsRes.data.map((item) => ({
              id: item.productId,
              name: item.product?.productName || "",
              unitPrice: parseFloat(item.unitPrice || 0),
              quantity: parseFloat(item.quantityReturned || 0),
              total: parseFloat(item.totalAmount || 0),
            }))
          );
        }
      } catch (itemsErr) {
        console.error("Error fetching PurchaseReturnItem:", itemsErr);
        setSelectedProducts([]);
      }
    } catch (err) {
      console.error("Error fetching PurchaseReturn:", err);
      alert("⚠️ Could not load Purchase Return. Please check if record exists.");
    }
  };

  fetchData();
}, [id]);

  // --- Fetch statuses ---
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const [paymentRes, refundRes] = await Promise.all([
          api.get("/PurchaseReturn/payment-statuses"),
          api.get("/PurchaseReturn/refund-statuses"),
        ]);
        setPaymentStatuses(paymentRes.data || []);
        setRefundStatuses(refundRes.data || []);
      } catch (err) {
        console.error("Failed to load statuses:", err);
      }
    };
    fetchStatuses();
  }, []);

  // --- Product search ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (searchQuery.trim().length < 2) return setProducts([]);
      try {
        const res = await api.get(
          `/Product/search?term=${encodeURIComponent(searchQuery)}&t=${Date.now()}`
        );
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              quantity: parseFloat(quantity) || 0,
              total: (parseFloat(quantity) || 0) * product.unitPrice,
            }
          : product
      )
    );
  };

  const handleUnitPriceChange = (productId, price) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              unitPrice: parseFloat(price) || 0,
              total: (parseFloat(price) || 0) * product.quantity,
            }
          : product
      )
    );
  };

  const handleProductDelete = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  };

  const handleAddProduct = (product) => {
    if (selectedProducts.some((p) => p.id === (product.productId ?? product.id))) {
      alert("Product already added!");
      return;
    }
    setSelectedProducts((prev) => [
      ...prev,
      {
        id: product.productId ?? product.id,
        name: product.productName || product.name,
        unitPrice: parseFloat(product.unitPrice) || 0,
        quantity: 1,
        total: parseFloat(product.unitPrice) || 0,
      },
    ]);
    setSearchQuery("");
    setProducts([]);
  };

  // --- Submit updated return ---
// --- Submit updated return ---
const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log("Starting update process...");
  console.log("Current form data:", formData);
  console.log("Selected products:", selectedProducts);

  try {
    // 1. Update the parent PurchaseReturn record
    const parentPayload = {
      date: formData.date,
      purchaseId: Number(formData.purchaseId),
      amountReturned: parseFloat(formData.amountReturned),
      paymentDue: parseFloat(formData.paymentDue),
      paymentStatus: formData.paymentStatus,
      refundStatus: formData.refundStatus,
      reasonforRefund: formData.reasonForRefund,
    };
    
    console.log("Parent payload for PUT request:", parentPayload);
    const purchaseReturnId = formData.purchaseReturnId;
    console.log("Purchase Return ID for PUT request:", purchaseReturnId);

    await api.put(`/PurchaseReturn/${purchaseReturnId}`, parentPayload);
    console.log("Parent record updated successfully!");

    // 2. Update only the existing child PurchaseReturnItem records
    for (const p of selectedProducts) {
      // Only proceed with a PUT request if the item has an ID
      if (p.purchaseReturnItemId) {
        const childPayload = {
          purchaseReturnId: purchaseReturnId,
          productId: p.id,
          quantityReturned: Number(p.quantity),
          unitPrice: Number(p.unitPrice),
        };
        console.log(`Updating child item with ID ${p.purchaseReturnItemId}. Payload:`, childPayload);
        await api.put(`/PurchaseReturnItem/${p.purchaseReturnItemId}`, childPayload);
        console.log(`Child item ${p.purchaseReturnItemId} updated.`);
      } else {
        console.warn(`Skipping new product with ID ${p.id} as POST logic is removed.`);
      }
    }
    
    alert("Purchase return updated successfully! ✅");
    
    // Navigate to the purchase return list page
    navigate("/purchase/return");

  } catch (err) {
    console.error("Update failed. Error details:", err.response?.data || err.message);
    alert("Failed to update purchase return. ⚠️");
  }
};

  // --- Common styles ---
  const containerStyle = {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    maxWidth: "1200px",
    margin: "0 auto 30px",
  };
  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "30px",
    marginBottom: "40px",
  };
  const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "0",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "6px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    height: "45px",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontWeight: "500",
    fontSize: "14px",
    color: "#333",
    whiteSpace: "nowrap",
  };

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header" style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", color: "#2c3e50" }}>
            Edit Purchase Return
          </h2>
        </div>

        <div style={containerStyle}>
          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              {/* Date */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Purchase ID */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Purchase ID</label>
                <input
                  type="text"
                  name="purchaseId"
                  value={formData.purchaseId}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Amount Returned */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Amount Returned</label>
                <input
                  type="number"
                  name="amountReturned"
                  value={formData.amountReturned}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Payment Due */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Payment Due</label>
                <input
                  type="number"
                  name="paymentDue"
                  value={formData.paymentDue}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Payment Status */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select Status</option>
                  {paymentStatuses.map((s, i) => (
                    <option key={i} value={s.value || s}>
                      {s.label || s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refund Status */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Refund Status</label>
                <select
                  name="refundStatus"
                  value={formData.refundStatus}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select Status</option>
                  {refundStatuses.map((s, i) => (
                    <option key={i} value={s.value || s}>
                      {s.label || s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for Refund */}
              <div
                style={{
                  ...formGroupStyle,
                  gridColumn: "span 3",
                  marginTop: "10px",
                }}
              >
                <label style={labelStyle}>Reason for Refund</label>
                <textarea
                  name="reasonForRefund"
                  value={formData.reasonForRefund}
                  onChange={handleChange}
                  required
                  style={{
                    ...inputStyle,
                    minHeight: "120px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* Search and add product */}
            <div style={{ marginBottom: "30px" }}>
              <input
                type="text"
                placeholder="Search product to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, marginBottom: "10px" }}
              />
              {products.length > 0 && (
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                  }}
                >
                  {products.map((p) => (
                    <div
                      key={p.productId || p.id}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                      onClick={() => handleAddProduct(p)}
                    >
                      {p.productName || p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products table */}
            <div
              style={{
                marginBottom: "40px",
                overflowX: "auto",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    {[
                      "Product Name",
                      "Unit Price",
                      "Quantity Return",
                      "Total",
                      "Action",
                    ].map((header, index) => (
                      <th
                        key={header}
                        style={{
                          padding: "15px 20px",
                          textAlign: index === 0 ? "left" : "center",
                          fontWeight: "600",
                          color: "#495057",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.length > 0 ? (
                    selectedProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ padding: "15px 20px" }}>{product.name}</td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.unitPrice}
                            onChange={(e) =>
                              handleUnitPriceChange(product.id, e.target.value)
                            }
                            style={{
                              ...inputStyle,
                              width: "120px",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.quantity}
                            onChange={(e) =>
                              handleQuantityChange(product.id, e.target.value)
                            }
                            style={{
                              ...inputStyle,
                              width: "100px",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          {product.total.toFixed(2)}
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleProductDelete(product.id)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ padding: "30px", textAlign: "center", color: "#666" }}
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Update Return
              </button>
              <button
                type="button"
                onClick={() => navigate("/purchase/return")}
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
