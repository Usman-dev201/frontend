import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const PurchaseReturnContext = createContext();
export const usePurchaseReturn = () => useContext(PurchaseReturnContext);

export const PurchaseReturnProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    date: "",
    purchaseId: "",
    amountReturned: "",
    paymentDue: "",
    paymentStatus: "",
    refundStatus: "",
    reasonForRefund: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [refundStatuses, setRefundStatuses] = useState([]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
const [completedPurchases, setCompletedPurchases] = useState([]);

useEffect(() => {
  const fetchCompletedPurchases = async () => {
    try {
      const res = await api.get("/PurchaseReturn/GetCompletedPurchases");
      setCompletedPurchases(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load completed purchases:", err);
    }
  };
  fetchCompletedPurchases();
}, []);

  // Fetch payment & refund statuses
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
const getProductPrice = async (purchaseId, productId) => {
  try {
    const res = await api.get(
      `/PurchaseReturn/GetProductPrice?purchaseId=${purchaseId}&productId=${productId}`
    );
    return {
      unitPrice: res.data.purchasePriceAfterDiscount,
      productName: res.data.productName // 👈 now available
    };
  } catch (err) {
    console.error("❌ Failed to fetch product price:", err);
    throw err;
  }
};
  // Fetch products based on search
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

  // Add product to selected list
  const addProduct = (product) => {
    if (!product) return;
    const exists = selectedProducts.some(
      (p) => p.productId === (product.productId ?? product.id)
    );
    if (exists) return;
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: product.productId ?? product.id,
        productName: product.productName || product.name || "",
        unitPrice: 0,
        quantity: 1,
        total: 0,
      },
    ]);
    setSearchQuery("");
  };

  const handleQuantityChange = (productId, qty) => {
    const q = Number(qty);
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, quantity: q, total: q * (p.unitPrice || 0) } : p
      )
    );
  };

  const handleUnitPriceChange = (productId, price) => {
    const p = Number(price);
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, unitPrice: p, total: p * (item.quantity || 0) } : item
      )
    );
  };

  const handleProductDelete = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  // Submit Purchase Return
const submitPurchaseReturn = async () => {
  if (
    !formData.date ||
    !formData.paymentStatus ||
    !formData.refundStatus ||
    !formData.reasonForRefund ||
    !formData.purchaseId
  ) {
    throw new Error("All required fields must be filled.");
  }
  if (!selectedProducts.length) throw new Error("Add at least one product.");

  try {
  // 🔹 Parent PurchaseReturn payload (keep unchanged)
  const payload = [
    {
      date: formData.date,
      purchaseId: Number(formData.purchaseId),
      amountReturned: Number(formData.amountReturned),
      paymentDue: Number(formData.paymentDue),
      paymentStatus: formData.paymentStatus,
      refundStatus: formData.refundStatus,
      reasonforRefund: formData.reasonForRefund,
      products: selectedProducts.map((p) => ({
        productId: p.productId,
        quantityReturned: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
      })),
    },
  ];

  console.log("Parent Payload:", payload);

  // 🔹 Save parent PurchaseReturn
  const res = await api.post("/PurchaseReturn", payload);
  const savedReturn = res.data[0];
  const purchaseReturnId = savedReturn.purchaseReturnId || savedReturn.id;

  console.log("Saved PurchaseReturn:", savedReturn);

  // 🔹 Add child records
  const childDetails = selectedProducts.map((p) => ({
    purchaseReturnId: purchaseReturnId, // link to parent
    productId: p.productId,
    quantityReturned: Number(p.quantity),
    unitPrice: Number(p.unitPrice),
  }));

  if (childDetails.length > 0) {
    await api.post("/PurchaseReturnItem", childDetails);
    console.log("Child PurchaseReturnItem records saved:", childDetails);
  }

  // 🔹 Optionally fetch parent with children
  const getResponse = await api.get(`/PurchaseReturn/${purchaseReturnId}`);
  const loadedReturn = getResponse.data;

  console.log("Loaded PurchaseReturn from backend:", loadedReturn);

  return { success: true, data: loadedReturn };
} catch (err) {
  console.error(
    "Failed to submit purchase return or child details:",
    err.response?.data || err.message
  );
  throw err;
}
};


  return (
    <PurchaseReturnContext.Provider
      value={{
        formData,
        handleChange,
        searchQuery,
        setSearchQuery,
        products,
        selectedProducts,
        setSelectedProducts,
        addProduct,
        handleQuantityChange,
        handleUnitPriceChange,
        handleProductDelete,
        paymentStatuses,
        refundStatuses,
        submitPurchaseReturn,
         getProductPrice,
         completedPurchases,
      }}
    >
      {children}
    </PurchaseReturnContext.Provider>
  );
};
