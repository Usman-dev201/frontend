// src/pages/purchase/EditPurchaseReturn.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "../../styles/purchase/Purchase.css";
import { usePurchaseReturn } from "../../context/PurchaseReturnContext";

export default function EditPurchaseReturn() {
  const navigate = useNavigate();
  const { id } = useParams();
const { getProductPrice,checkAvailableQuantity,
  updateReturnPayment 


} = usePurchaseReturn();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    purchaseId: "",
    amountReturned: 0,
    paymentDue: 0,
    paymentStatus: "Unpaid",
    refundStatus: "Pending",
    reasonForRefund: "",
    purchaseReturnId: null,
     isLocked: false   // ✅ add this
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [products, setProducts] = useState([]); 
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [refundStatuses, setRefundStatuses] = useState([]);
const [completedPurchases, setCompletedPurchases] = useState([]);
const [showPurchaseIdInfo, setShowPurchaseIdInfo] = useState(false);
const [showRefundInfo, setShowRefundInfo] = useState(false);
const [loading, setLoading] = useState(false);
const [originalFormData, setOriginalFormData] = useState(null);
const [originalRefundStatus, setOriginalRefundStatus] = useState("");


 
useEffect(() => {
  if (!loading && formData.purchaseId && !originalFormData) {
    console.log("💾 Setting original form data ONCE:", {
      amountPaid: formData.amountPaid,
      paymentStatus: formData.paymentStatus,
      transactionStatus: formData.transactionStatus
    });
    
    setOriginalFormData({ 
      ...formData,
      amountPaid: formData.amountPaid,
      paymentStatus: formData.paymentStatus 
    });
    setOriginalRefundStatus(formData.transactionStatus);
  }
}, [loading, formData.purchaseId, formData, originalFormData]); 
useEffect(() => {
  const fetchCompletedPurchases = async () => {
    try {
      const res = await api.get("/PurchaseReturn/GetCompletedPurchases");
      const data = res.data || [];

      setCompletedPurchases(data);

      // Auto-select most recent PurchaseId if none set
      setFormData((prev) => {
        if (!prev.purchaseId && data.length > 0) {
          return {
            ...prev,
            purchaseId: data[data.length - 1].purchaseId,
          };
        }
        return prev;
      });
    } catch (err) {
      console.error("❌ Failed to load completed purchases:", err);
    }
  };

  fetchCompletedPurchases();

}, []); // ✅ no dependency warning now
// ✅ Find selected purchase details
const grandTotal = selectedProducts.reduce((sum, p) => sum + p.total, 0);
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




// --- Auto-update paymentDue whenever grandTotal or amountReturned changes ---
useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    paymentDue: paymentDue.toFixed(2),
  }));
}, [grandTotal, formData.amountReturned, selectedPurchase,paymentDue]);

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
          isLocked: ["Approved", "Cancelled"].includes(returnData.refundStatus),
        });

        // 🟩 ADD THESE TWO LINES BELOW 👇
        setOriginalRefundStatus(returnData.refundStatus);
        setOriginalFormData({
          amountReturned: returnData.amountReturned,
          paymentStatus: returnData.paymentStatus,
        });
      }

      // 2️⃣ Fetch PurchaseReturnItem records
      try {
        const itemsRes = await api.get(`/PurchaseReturnItem/${id}`);
        if (itemsRes.status === 204 || !itemsRes.data) {
          console.warn("No items found for this return.");
          setSelectedProducts([]);
        } else {
          const itemsWithQty = await Promise.all(
            itemsRes.data.map(async (item) => {
              let quantityPurchased = 0;
              try {
                const { quantityPurchased: qp } = await getProductPrice(
                  item.purchaseId || res.data.purchaseId,
                  item.productId
                );
                quantityPurchased = qp;
              } catch (err) {
                console.warn(
                  `⚠️ Could not fetch quantityPurchased for product ${item.productId}`,
                  err
                );
              }

              return {
                id: item.productId,
                productId: item.productId,
                productName:
                  item.product?.productName || item.productName || "",
                purchaseReturnItemId: item.purchaseReturnItemId,
                purchaseReturnId: item.purchaseReturnId,
                unitPrice: parseFloat(item.unitPrice || 0),
                quantity: parseFloat(item.quantityReturned || 0),
                total: parseFloat(item.totalAmount || 0) || 0,
                quantityPurchased,
                lotId: item.lotId || null,
              };
            })
          );

          setSelectedProducts(itemsWithQty);
        }
      } catch (itemsErr) {
        console.error("Error fetching PurchaseReturnItem:", itemsErr);
        setSelectedProducts([]);
      }
    } catch (err) {
      console.error("Error fetching PurchaseReturn:", err);
    }
  };

  fetchData();
}, [id, getProductPrice]);


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

// Add this useEffect hook after your other useEffect hooks
useEffect(() => {
  const fetchProducts = async () => {
    if (searchQuery.trim().length < 2) {
      setProducts([]);
      return;
    }
    try {
      const res = await api.get(
        `/Product/search?term=${encodeURIComponent(searchQuery)}&t=${Date.now()}`
      );
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const timeoutId = setTimeout(fetchProducts, 300); // Add debounce
  return () => clearTimeout(timeoutId);
}, [searchQuery]);


  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleQuantityChange = async (productId, quantity) => {
  const newQty = parseFloat(quantity) || 0;

  // Find the product first
  const productToCheck = selectedProducts.find(
    (p) => p.id === productId || p.productId === productId
  );
  if (!productToCheck) return;

  // --- Step 1: Hard cap at purchased quantity ---
  if (newQty > productToCheck.quantityPurchased) {
    alert(
      `⚠️ Cannot return ${newQty} units for ${productToCheck.productName}. Only ${productToCheck.quantityPurchased} were purchased in this batch.`
    );

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId || product.productId === productId
          ? {
              ...product,
              quantity: product.quantityPurchased,
              total: product.quantityPurchased * product.unitPrice,
            }
          : product
      )
    );
    return; // stop here, no async check needed
  }

  // --- Step 2: Check async availableQty (after previous returns) ---
 const availableQty = await checkAvailableQuantity(
    formData.purchaseId,
    productToCheck.productId
  );

  if (availableQty !== null && newQty > availableQty) {
    // 🚨 Alert with **remaining qty after previous returns**
    alert(
      `⚠️ Cannot return ${newQty} units of ${productToCheck.productName}. Only ${availableQty} units remaining after previous returns.`
    );

    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId || product.productId === productId
          ? {
              ...product,
              quantity: availableQty,
              total: availableQty * product.unitPrice,
            }
          : product
      )
    );
  } else {
    // ✅ Valid case — set what user entered
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId || product.productId === productId
          ? {
              ...product,
              quantity: newQty,
              total: newQty * product.unitPrice,
            }
          : product
      )
    );
  }
};

const handleProductSelect = async (product) => {
  const exists = selectedProducts.some(
    (p) => p.productId === (product.productId ?? product.id)
  );

  if (exists) {
    alert("This product has already been added");
    return;
  }

  try {
   const { unitPrice, productName, quantityPurchased ,lotId} =
  await getProductPrice(formData.purchaseId, product.productId ?? product.id);

const newProduct = {
  ...product,
  productId: product.productId ?? product.id,
  productName: productName || product.productName || product.name || "",
  unitPrice: unitPrice,
  quantity: 1,
total: Number(unitPrice) || 0,
  quantityPurchased: quantityPurchased ?? 0, // ✅ correct
  lotId: lotId,
};
    setSelectedProducts((prev) => [...prev, newProduct]);
    setSearchQuery("");
    setProducts([]); // Clear search results after selection

  } catch (err) {
    if (err.response && err.response.status === 404) {
      alert("⚠️ This product is not purchased under the selected Purchase Record.");
    } 
  }
};

const handleProductDelete = async (product) => {
   if (formData.refundStatus === "Approved") {
    alert("⚠️ This Product Record cannot be Deleted because the Refund Status is Approved.");
    return; // stop execution
  }

  if (formData.refundStatus === "Cancelled") {
    alert("⚠️ This Product Record  cannot be Deleted because the Refund Status is Cancelled.");
    return; // stop execution
  }
  if (product.purchaseReturnItemId) {
    try {
      await api.delete(`/PurchaseReturnItem/${product.purchaseReturnItemId}`);
      console.log(`🗑️ Deleted item ID=${product.purchaseReturnItemId} from backend`);
    } catch (err) {
      console.error("❌ Failed to delete PurchaseReturnItem:", err.response?.data || err.message);
      alert("Failed to delete item. Please try again.");
      return;
    }
  }

  // Remove locally (both for saved & unsaved)
  setSelectedProducts((prev) =>
    prev.filter((p) => p.id !== product.id && p.productId !== product.productId)
  );
};



  // --- Submit updated return ---
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Starting update process...");

  try {
    setLoading(true);

    // 🔍 Debug comparisons
    console.log("🔄 DEBUG Payment Fields Comparison:", {
      currentAmountReturned: formData.amountReturned,
      originalAmountReturned: originalFormData?.amountReturned,
      currentPaymentStatus: formData.paymentStatus,
      originalPaymentStatus: originalFormData?.paymentStatus,
      amountReturnedChanged: formData.amountReturned !== originalFormData?.amountReturned,
      paymentStatusChanged: formData.paymentStatus !== originalFormData?.paymentStatus
    });

    // ✅ Determine if any payment-related fields changed
    const paymentFieldsChanged =
      formData.amountReturned !== originalFormData?.amountReturned ||
      formData.paymentStatus !== originalFormData?.paymentStatus;

    // ✅ Check if the record was previously finalized
    const isApprovedOrCancelled = ["Approved", "Cancelled"].includes(originalRefundStatus);

    // ❌ If record is finalized and no payment fields changed → block update
    if (isApprovedOrCancelled && !paymentFieldsChanged) {
      alert(
        `⚠️ This Purchase Return cannot be updated because the Refund Status is ${originalRefundStatus}. Only payment details (Amount Returned, Payment Status) can be updated.`
      );
      return;
    }

    console.log("🔄 Starting return update process...");

    // ✅ If record is finalized but payment changed → update payment only
    if (isApprovedOrCancelled && paymentFieldsChanged) {
      const paymentPayload = {
        amountReturned: parseFloat(formData.amountReturned) || 0,
        paymentStatus: formData.paymentStatus || "Unpaid",
      };

      console.log("📤 Updating payment details:", paymentPayload);
      await updateReturnPayment(id, paymentPayload);

      alert("✅ Payment details updated successfully.");
      navigate("/purchase/return");
      return;
    }

    // ✅ Case 2: Normal editable returns (Pending / Under Review)
    console.log("🔄 Running full update process for editable return...");

    const parentPayload = {
      date: formData.date,
      purchaseId: Number(formData.purchaseId),
      amountReturned: parseFloat(formData.amountReturned),
      paymentDue: parseFloat(formData.paymentDue),
      paymentStatus: formData.paymentStatus,
      refundStatus: formData.refundStatus,
      reasonforRefund: formData.reasonForRefund,
    };

    const purchaseReturnId = formData.purchaseReturnId;

    // --- Update child items (ONLY for editable returns) ---
  // --- Update child items (ONLY if NOT Approved/Cancelled) ---
if (!["Approved", "Cancelled"].includes(originalRefundStatus)) {
  console.log("📦 Updating purchase return items...");
  for (const p of selectedProducts) {
    const childPayload = {
      purchaseReturnId,
      productId: p.productId || p.id,
      quantityReturned: Number(p.quantity),
      unitPrice: Number(p.unitPrice),
    };

    if (p.purchaseReturnItemId) {
      await api.put(`/PurchaseReturnItem/${p.purchaseReturnItemId}`, childPayload);
      console.log(`✅ Updated child item ID=${p.purchaseReturnItemId}`);
    } else {
      const res = await api.post(`/PurchaseReturnItem`, [childPayload]);
      p.purchaseReturnItemId = res.data.purchaseReturnItemId || res.data.id;
      console.log(`✅ Added new child item ID=${p.purchaseReturnItemId}`);
    }
  }
} else {
  console.log("🚫 Skipping PurchaseReturnItem updates — RefundStatus is Approved or Cancelled.");
}

    // --- Update parent record ---
    console.log("📄 Updating parent purchase return record...");
    await api.put(`/PurchaseReturn/${purchaseReturnId}`, parentPayload);
    console.log("✅ Parent record updated successfully.");

    alert("✅ Purchase Return updated successfully!");

    // 🔒 Lock editing after approval/cancel
    if (["Approved", "Cancelled"].includes(formData.refundStatus)) {
      setFormData((prev) => ({ ...prev, isLocked: true }));
    }

    navigate("/purchase/return");
  } catch (err) {
    console.error("❌ Update failed:", err.response?.data || err.message);
    alert(`❌ Update failed: ${err.response?.data || err.message}`);
  } finally {
    setLoading(false);
    console.log("✅ Update process finished.");
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

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "0",
  };
  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // 2 columns
    gap: "20px",
    marginBottom: "20px",
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
            width: "270px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            ⚠️ <b>Note:</b>
          </div>
          <div>Please update to the <b>most recent Purchase ID</b>.</div>
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
    disabled={formData.isLocked}
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
</div>

{/* Row 2: Payment Status + Refund Status */}
<div style={formGridStyle}>
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
  {/* Refund Status with Info Popup */}
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
          transition: "all 0.2s ease",
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
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            ⚠️ <b>Note:</b> Once the status is updtaed to{" "}
          <div>  <b>Approved</b> or <b>Cancelled</b>,</div></div>
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
              transform: "rotate(45deg)",
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
    disabled={formData.isLocked}
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
                      onClick={() => handleProductSelect(p)}
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
                      "Quantity Return",
                      "Unit Price",
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
                     selectedProducts.map((product, idx) => (
    <tr
      key={product.purchaseReturnItemId || product.productId || idx}
    >
                        <td style={{ padding: "15px 20px" }}>{product.productName}</td>
                       
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={product.quantity}
                            onChange={(e) =>
                             handleQuantityChange(product.productId || product.id, e.target.value)
                            }
                            style={{
                              ...inputStyle,
                              width: "100px",
                              textAlign: "center",
                            }}
                          />
                        </td>
                         <td style={{ padding: "15px 20px", textAlign: "center" }}>
                        <input
  type="number"
  value={product.unitPrice}
  readOnly
  style={{
    ...inputStyle,
    width: "120px",
    textAlign: "center",
    backgroundColor: "#f9f9f9", // gray to indicate locked
    cursor: "not-allowed",
  }}
/>
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          {Number(product.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "15px 20px", textAlign: "center" }}>
                          <button
                            type="button"
                           onClick={() => handleProductDelete(product)}
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
<div style={{ ...formGridStyle, marginTop: "30px" }}>
  {/* Grand Total (calculated) */}
{/* Row: Grand Total + Amount Returned + Payment Due */}
<div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "30px",
    marginBottom: "20px",
    width: "200%",
  }}
>
  {/* Grand Total */}
  <div style={{ ...formGroupStyle, flex: 1 }}>
    <label style={labelStyle}>Grand Total</label>
    <input
      type="number"
      name="grandTotal"
      value={grandTotal.toFixed(2)}
      readOnly
      style={{ ...inputStyle, backgroundColor: "#f9f9f9", width: "100%" }}
    />
  </div>

  {/* Amount Returned */}
  <div style={{ ...formGroupStyle, flex: 1 }}>
    <label style={labelStyle}>Amount Returned</label>
    <input
      type="number"
      name="amountReturned"
      value={formData.amountReturned}
      onChange={handleChange}
      required
      style={{ ...inputStyle, width: "100%" }}
    />
  </div>

  {/* Payment Due */}
  <div style={{ ...formGroupStyle, flex: 1 }}>
    <label style={labelStyle}>Payment Due</label>
    <input
      type="number"
      name="paymentDue"
      value={formData.paymentDue}
      readOnly
      style={{ ...inputStyle, backgroundColor: "#f9f9f9", width: "100%" }}
    />
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
