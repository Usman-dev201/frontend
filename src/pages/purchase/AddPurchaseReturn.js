// src/pages/purchase/AddPurchaseReturn.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseReturn } from "../../context/PurchaseReturnContext";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../styles/purchase/Purchase.css";

export default function AddPurchaseReturn() {
  const navigate = useNavigate();

  const {
    formData,
    handleChange,
    searchQuery,
    setSearchQuery,
    products,
    selectedProducts,
    setSelectedProducts,
    handleProductDelete,
    paymentStatuses,
    refundStatuses,
    submitPurchaseReturn,
  } = usePurchaseReturn();

  // Add product with empty unit price and total for frontend input
  const handleProductSelect = (product) => {
    const exists = selectedProducts.some(
      (p) => p.productId === (product.productId ?? product.id)
    );

    if (!exists) {
      const newProduct = {
        ...product,
        productId: product.productId ?? product.id,
        productName: product.productName || product.name || "",
        unitPrice: 0, // ✅ user will enter manually
        quantity: 1,
        total: 0,
      };

      setSelectedProducts((prev) => [...prev, newProduct]);
      setSearchQuery("");
    } else {
      alert("This product has already been added");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        products: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          total: p.total,
        })),
      };

      await submitPurchaseReturn(payload);
      navigate("/purchase/return");
    } catch (err) {
      console.error("❌ Failed to save purchase return:", err);
      alert("Failed to save purchase return. Please try again.");
    }
  };

  // --- Styles ---
  const containerStyle = {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
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
    transition: "all 0.2s ease",
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
            Add Purchase Return
          </h2>
        </div>

        <div style={containerStyle}>
          <form onSubmit={handleSubmit}>
            {/* --- Form fields --- */}
            <div style={formGridStyle}>
              {[
                { label: "Date", name: "date", type: "date" },
                { label: "Purchase ID", name: "purchaseId", type: "text" },
                { label: "Amount Returned", name: "amountReturned", type: "number" },
                { label: "Payment Due", name: "paymentDue", type: "number" },
              ].map((field) => (
                <div key={field.name} style={formGroupStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
              ))}

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
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                  {refundStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                    height: "auto",
                    minHeight: "120px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* --- Product Search --- */}
            <div style={{ marginBottom: "40px" }}>
              <div style={{ position: "relative", maxWidth: "400px" }}>
                <i
                  className="fas fa-search"
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                    zIndex: 1,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: "45px",
                    width: "100%",
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </div>

              {/* --- Search results dropdown (show only when 2+ chars) --- */}
              {searchQuery.length >= 1 && (
                <div
                  style={{
                    border: "1px solid #ccc",
                    marginTop: "5px",
                    borderRadius: "8px",
                    background: "#fff",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {products.length > 0 ? (
                    products.map((p) => (
                      <div
                        key={p.productId}
                        onClick={() => handleProductSelect(p)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {p.productName || p.name} (ID: {p.productId})
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px", color: "gray" }}>
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- Products Table --- */}
            <div
              style={{
                marginBottom: "40px",
                overflowX: "auto",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    {["Product Name", "Unit Price", "Quantity Return", "Total", "Action"].map(
                      (header, index) => (
                        <th
                          key={header}
                          style={{
                            padding: "15px 20px",
                            textAlign: index === 0 ? "left" : "center",
                            fontWeight: "600",
                            color: "#495057",
                            borderBottom: "1px solid #e0e0e0",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.length > 0 ? (
                    selectedProducts.map((product) => (
                      <tr key={product.productId}>
                        <td style={{ padding: "15px 20px" }}>{product.productName}</td>

                        {/* Editable Unit Price */}
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.unitPrice || ""}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              setSelectedProducts((prev) =>
                                prev.map((p) =>
                                  p.productId === product.productId
                                    ? {
                                        ...p,
                                        unitPrice: newPrice,
                                        total: newPrice * (p.quantity || 0),
                                      }
                                    : p
                                )
                              );
                            }}
                            style={{
                              ...inputStyle,
                              width: "120px",
                              textAlign: "center",
                              height: "36px",
                              margin: "0 auto",
                            }}
                          />
                        </td>

                        {/* Editable Quantity */}
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.quantity || ""}
                            onChange={(e) => {
                              const newQty = Number(e.target.value);
                              setSelectedProducts((prev) =>
                                prev.map((p) =>
                                  p.productId === product.productId
                                    ? {
                                        ...p,
                                        quantity: newQty,
                                        total: newQty * (p.unitPrice || 0),
                                      }
                                    : p
                                )
                              );
                            }}
                            style={{
                              ...inputStyle,
                              width: "100px",
                              textAlign: "center",
                              height: "36px",
                              margin: "0 auto",
                            }}
                          />
                        </td>

                        {/* Editable Total */}
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.total || ""}
                            onChange={(e) => {
                              const newTotal = Number(e.target.value);
                              setSelectedProducts((prev) =>
                                prev.map((p) =>
                                  p.productId === product.productId
                                    ? { ...p, total: newTotal }
                                    : p
                                )
                              );
                            }}
                            style={{
                              ...inputStyle,
                              width: "140px",
                              textAlign: "center",
                              height: "36px",
                              margin: "0 auto",
                            }}
                          />
                        </td>

                        {/* Delete */}
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleProductDelete(product.productId)}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: "#dc3545",
                              color: "#fff",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "30px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Action Buttons --- */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#4299e1 ",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "120px",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-save"></i> Save Return
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
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "120px",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
