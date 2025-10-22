// src/pages/purchase/AddPurchaseReturn.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseReturn } from "../../context/PurchaseReturnContext";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../styles/purchase/Purchase.css";

export default function AddPurchaseReturn() {
  const navigate = useNavigate();
const [showRefundInfo, setShowRefundInfo] = useState(false); // 👈 new state
const [showPurchaseIdInfo, setShowPurchaseIdInfo] = useState(false);
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
    getProductPrice,
    completedPurchases,
    checkAvailableQuantity
  
  } = usePurchaseReturn();
const grandTotal = selectedProducts.reduce(
  (sum, p) => sum + (p.total || 0),
  0
);

// Calculate Payment Due
// ✅ Find selected purchase details
const selectedPurchase = completedPurchases.find(
  (p) => p.purchaseId === Number(formData.purchaseId)
);

let paymentDue = 0;

if (selectedPurchase) {
  const totalPurchase = selectedPurchase.grandTotal || 0;
  const paidAtPurchase = selectedPurchase.amountPaid || 0;
  const totalReturnValue = grandTotal;
  const refundedAmount = Number(formData.amountReturned) || 0;

  if (paidAtPurchase >= totalPurchase) {
    // Fully paid → supplier owes refund
    paymentDue = totalReturnValue - refundedAmount;
  } else {
    // Partially paid
    const remainingPayable = totalPurchase - paidAtPurchase;

    if (totalReturnValue <= remainingPayable) {
      // Just reduce payable — no refund owed
      paymentDue = 0;
    } else {
      // Excess return value becomes refund due
      paymentDue = totalReturnValue - remainingPayable - refundedAmount;
    }
  }
}

  // Add product with empty unit price and total for frontend input
const handleProductSelect = async (product) => {
  const exists = selectedProducts.some(
    (p) => p.productId === (product.productId ?? product.id)
  );

  if (exists) {
    alert("This product has already been added");
    return;
  }

  try {
    // call backend API with both purchaseId and productId
    const { unitPrice, productName ,quantityPurchased} = await getProductPrice(
      formData.purchaseId,
      product.productId ?? product.id
    );

    // if found → add to list
    const newProduct = {
      ...product,
      productId: product.productId ?? product.id,
      productName: productName || product.productName || product.name || "",
      unitPrice: unitPrice,
      quantity: 1,
      total: unitPrice,
      quantityPurchased
    };

    setSelectedProducts((prev) => [...prev, newProduct]);
    setSearchQuery("");

  } catch (err) {
    // ❌ product not under purchase record
    if (err.response && err.response.status === 404) {
      alert("⚠️ This product is not purchased under the selected Purchase Record.");
    } else {
      console.error("❌ Failed to fetch product price:", err);
      alert("Could not fetch product purchase price.");
    }
  }
};
const hasInvalidQty = selectedProducts.some(
  (p) => p.quantity > p.quantityPurchased
);
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
           {/* --- Form fields --- */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // ✅ Two fields in one row
    gap: "30px",
    marginBottom: "40px",
  }}
>
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
  {/* Purchase ID with Info Popup */}
<div style={formGroupStyle}>
  <label htmlFor="purchaseId" style={labelStyle}>
    Reference Purchase ID{" "}
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* Info Icon */}
      <span
        onMouseEnter={() => setShowPurchaseIdInfo(true)}
        onMouseLeave={() => setShowPurchaseIdInfo(false)}
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
          transition: "all 0.2s ease",
        }}
      >
        ?
      </span>

      {/* Popup */}
      {showPurchaseIdInfo && (
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
            width: "250px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          }}
        >
        <div style={{ marginBottom: "6px" }}>
  ⚠️ <b>Note:</b>
</div>
<div>Please select the <b>most recent Purchase ID</b>.</div>
<div>This ensures correct product pricing.</div>
<div>And also keeps stock adjustments accurate.</div>

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
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}
    </span>
  </label>

  <select
    id="purchaseId"
    name="purchaseId"
    value={formData.purchaseId}
    onChange={handleChange}
    required
    style={inputStyle}
  >
    <option value="">Select Purchase</option>
    {completedPurchases.map((purchase) => (
      <option key={purchase.purchaseId} value={purchase.purchaseId}>
        #{purchase.purchaseId} - {purchase.supplierName} (
        {new Date(purchase.date).toLocaleDateString()})
      </option>
    ))}
  </select>
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
      {paymentStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  </div>

  {/* Refund Status */}
   <div style={formGroupStyle}>
    <label htmlFor="refundStatus" style={labelStyle}>
      Refund Status{" "}
      <span style={{ position: "relative", display: "inline-block" }}>
        {/* Info Icon */}
        <span
          onMouseEnter={() => setShowRefundInfo(true)}
          onMouseLeave={() => setShowRefundInfo(false)}
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
        {showRefundInfo && (
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
              width: "250px",
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
      </span>
    </label>

    <select
      id="refundStatus"
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

  {/* Reason for Refund - Full Width */}
  <div
    style={{
      ...formGroupStyle,
      gridColumn: "span 2", // ✅ take both columns
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
                    width: "290%",
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
                    {["Product Name","Quantity Return", "Unit Price", "Total", "Action"].map(
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

                     

                        {/* Editable Quantity */}
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.quantity || ""}
                          onChange={async (e) => {
                              const newQty = Number(e.target.value);

                               if (newQty > product.quantityPurchased) {
      alert(`⚠️  Cannot return  ${newQty} units for  ${product.productName}.Only ${product.quantityPurchased} were purchased in this batch .`);
      return;
    }
   const availableQty = await checkAvailableQuantity(formData.purchaseId, product.productId);
  
  if (availableQty !== null && newQty > availableQty) {
    alert(`⚠️ Cannot return ${newQty} units for ${product.productName}. Only ${availableQty} units available for return (considering previous returns).`);
    return;
  }
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
   {/* Editable Unit Price */}
                   <td style={{ padding: "15px 20px", textAlign: "center" }}>
  <input
    type="number"
    value={product.unitPrice || ""}
    readOnly
    style={{
      ...inputStyle,
      width: "120px",
      textAlign: "center",
      height: "36px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9", // gray background
      cursor: "not-allowed",      // show as locked
    }}
  />
</td>
                        {/* Editable Total */}
                       <td style={{ padding: "15px 20px", textAlign: "center" }}>
  <input
    type="number"
    value={product.unitPrice * product.quantity || 0}
    readOnly
    style={{
      ...inputStyle,
      width: "120px",
      textAlign: "center",
      height: "36px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9", // gray to show locked
      cursor: "not-allowed",
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
<div
  style={{
    ...formGridStyle,
    marginTop: "20px",
    borderTop: "1px solid #e0e0e0",
    paddingTop: "20px",
  }}
>
  {/* Grand Total (calculated only) */}
  <div style={formGroupStyle}>
    <label style={labelStyle}>Grand Total</label>
    <input
      type="number"
      name="grandTotal"
      value={grandTotal}
      readOnly
      style={{ ...inputStyle, backgroundColor: "#f8f9fa" }}
    />
  </div>

  {/* Amount Returned (editable) */}
  <div style={formGroupStyle}>
    <label style={labelStyle}>Amount Returned</label>
    <input
      type="number"
      name="amountReturned"
      value={formData.amountReturned}
      onChange={handleChange}
      style={inputStyle}
    />
  </div>
{/* Payment Due (calculated only) */}
<div style={formGroupStyle}>
  <label style={labelStyle}>Payment Due</label>
  <input
    type="number"
    name="paymentDue"
    value={paymentDue}
    readOnly
    style={{ ...inputStyle, backgroundColor: "#f8f9fa" }}
  />

  {/* ✅ Safe + numeric comparison + dynamic color */}
  {selectedPurchase && (
    <small
      style={{
        color: paymentDue > 0 ? "green" : "#6c757d",
        display: "block",
        marginTop: "4px",
        fontWeight: 500,
      }}
    >
      {Number(selectedPurchase.amountPaid) === 0
        ? "This purchase was unpaid — refund does not apply; it will just reduce the outstanding balance."
        : Number(selectedPurchase.amountPaid) < Number(selectedPurchase.grandTotal)
        ? "This purchase was partially paid — refund applies only if the return exceeds unpaid balance."
        : "This purchase was fully paid — refund due from supplier."}
    </small>
  )}
</div>

  
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
                disabled={hasInvalidQty}
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
