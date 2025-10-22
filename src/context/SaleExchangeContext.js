import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const SaleExchangeContext = createContext();

export const SaleExchangeProvider = ({ children }) => {
  const [saleExchanges, setSaleExchanges] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔽 Dropdown Data States
  const [salesIds, setSalesIds] = useState([]);
  const [exchangeStatuses, setExchangeStatuses] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [exchangeTypes, setExchangeTypes] = useState([]);
  const [refundStatuses, setRefundStatuses] = useState([]);
 const [products] = useState([]); 
 const [saleAdjustments, setSaleAdjustments] = useState({
  discounts: [],
  loyalty: [],
  taxes: []
});
  // ✅ Fetch all Sale Exchanges
  const fetchSaleExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/SaleExchange");
      setSaleExchanges(res.data || []);
    } catch (err) {
      console.error("Failed to fetch SaleExchanges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch by ID
  const fetchSaleExchangeById = useCallback(async (id) => {
    if (!id) return null;
    try {
      const res = await api.get(`/SaleExchange/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch SaleExchange ${id}:`, err);
      return null;
    }
  }, []);
const searchProducts = useCallback(async (query, salesId) => {
  if (!salesId) return [];

  try {
    const res = await api.get(`/Product/SearchProducts?query=${encodeURIComponent(query)}&salesId=${salesId}`);
    return res.data || [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}, []);

// Updated searchProductsInStock with extra parameters
const searchProductsInStock = useCallback(
  async (query, locationId, salesId, originalQuantity, originalProductId, newProductId) => {
    if (!locationId || !salesId) return [];

    try {
      const res = await api.get(
        `/Product/SearchProductsInStock?` +
        `query=${encodeURIComponent(query)}` +
        `&locationId=${locationId}` +
        `&salesId=${salesId}` +
        (originalQuantity ? `&originalQuantity=${originalQuantity}` : "") +
        (originalProductId ? `&originalProductId=${originalProductId}` : "") +
        (newProductId ? `&newProductId=${newProductId}` : "")
      );

      return res.data || [];
    } catch (error) {
      console.error("Error searching products in stock:", error);
      return [];
    }
  },
  []
);
// In your context, modify fetchSaleAdjustments to get comprehensive data
const fetchSaleAdjustments = useCallback(async (salesId) => {
  if (!salesId) return;

  try {
    // You'll need to create a new endpoint that returns all required data
    const res = await api.get(`/SaleExchange/GetExchangeCalculationData?salesId=${salesId}`);
    setSaleAdjustments(res.data || { 
      discounts: [], 
      loyalty: [], 
      taxes: [], 
      originalSaleProducts: [],
      originalSaleTotal: 0 
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching sale adjustments:", error);
    return { discounts: [], loyalty: [], taxes: [], originalSaleProducts: [], originalSaleTotal: 0 };
  }
}, []);
const fetchSalesExchangeItems = useCallback(async (salesExchangeId) => {
  try {
    const res = await api.get(`/SalesExchangeItem/ByExchange/${salesExchangeId}`);
    const items = res.data || [];
    
    // Transform the items for your table
    const tableItems = items.map(item => ({
      salesExchangeItemId: item.salesExchangeItemId,
      originalProductId: item.originalProductId,
      originalProductName: item.originalProductName,
      originalQuantity: item.originalQuantity,
      originalUnitPrice: item.originalUnitPrice,
      newProductId: item.newProductId,
      exchangeProductName: item.exchangeProductName,
      exchangeQuantity: item.exchangeQuantity,
      exchangeUnitPrice: item.exchangeUnitPrice,
      priceDifference: item.priceDifference,
       maxQuantity: item.maxQuantity || 0, // You might need to fetch this separately
      maxExchangeQuantity: item.maxExchangeQuantity || 0 // You might need to fetch this separately
    }));
    
    return tableItems;
  } catch (err) {
    console.error("Failed to fetch SalesExchangeItems:", err);
    return [];
  }
}, []);
 // ✅ Create
const addSaleExchange = useCallback(async (exchange) => {
  try {
    // 🔹 Wrap in array for backend
    const res = await api.post("/SaleExchange", [exchange]);  
    setSaleExchanges((prev) => [...prev, ...res.data]); // spread because backend returns array
    return res.data;
  } catch (err) {
    console.error("Failed to create SaleExchange:", err);
    throw err;
  }
}, []);

// ✅ Create SalesExchangeItem(s)
const addSalesExchangeItems = useCallback(async (salesExchangeId, items) => {
  if (!salesExchangeId || !items || items.length === 0) return;

  try {
    const payload = items.map((p) => ({
      salesExchangeId: salesExchangeId,
      originalProductId: p.originalProductId,
      originalQuantity: p.originalQuantity,
      originalUnitPrice: p.originalUnitPrice,
      newProductId: p.newProductId,
      exchangeQuantity: p.exchangeQuantity,
      exchangeUnitPrice: p.exchangeUnitPrice,
      priceDifference: p.priceDifference,
    }));

    const res = await api.post("/SalesExchangeItem", payload); // backend expects array
    return res.data;
  } catch (err) {
    console.error("Failed to add SalesExchangeItems:", err);
    throw err;
  }
}, []);


  // ✅ Update
// In your SaleExchangeContext.js - Add this function
const updateSaleExchange = useCallback(async (id, updatedExchange) => {
  try {
    const res = await api.put(`/SaleExchange/${id}`, updatedExchange);
    setSaleExchanges((prev) =>
      prev.map((ex) => (ex.salesExchangeId === id ? res.data : ex))
    );
    return res.data;
  } catch (err) {
    console.error(`Failed to update SaleExchange ${id}:`, err);
    throw err;
  }
}, []);

  // ✅ Delete
 // ✅ Enhanced Delete with proper error handling
// ✅ Corrected Delete function in SaleExchangeContext
const deleteSaleExchange = useCallback(async (salesExchangeId) => {
  try {
    // Make API call to delete from backend
    await api.delete(`/SaleExchange/${salesExchangeId}`);
    
    // Update local state by filtering out the deleted item
    setSaleExchanges(prev => prev.filter(ex => ex.salesExchangeId !== salesExchangeId));
    
    return { success: true, message: "Exchange deleted successfully!" };
  } catch (err) {
    console.error(`Failed to delete SaleExchange ${salesExchangeId}:`, err);
    
    // Enhanced error handling
    const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
    throw new Error(`Delete failed: ${errorMessage}`);
  }
}, []);

const updateSalesExchangeItem = useCallback(async (salesExchangeId, updatedItems) => {
  try {
    for (const updatedItem of updatedItems) {
      await api.put(`/SalesExchangeItem/${updatedItem.salesExchangeItemId}`, {
        salesExchangeId,
         originalProductId: updatedItem.originalProductId,
        originalQuantity: updatedItem.originalQuantity,
        originalUnitPrice: updatedItem.originalUnitPrice,
        newProductId: updatedItem.newProductId,
        exchangeQuantity: updatedItem.exchangeQuantity,
        exchangeUnitPrice: updatedItem.exchangeUnitPrice,
        priceDifference: updatedItem.priceDifference
      });
       console.log("✅ SalesExchangeItem updated successfully");
    }
  } catch (err) {
    console.error("❌ Error updating product sale records:", err);
    throw err;
  }
}, []);


// ✅ Delete SalesExchangeItem
const deleteSalesExchangeItem = useCallback(async (salesExchangeItemId) => {
  try {
    await api.delete(`/SalesExchangeItem/${salesExchangeItemId}`);
  } catch (err) {
    console.error(`Failed to delete SalesExchangeItem ${salesExchangeItemId}:`, err);
    throw err;
  }
}, []);
// ✅ PATCH: Update only PaymentStatus
const updatePaymentStatus = useCallback(async (id, newPaymentStatus) => {
  try {
    const res = await api.patch(`/SaleExchange/${id}/payment-status`, {
      paymentStatus: newPaymentStatus,
    });

    // Update local state immediately for a snappy UI
    setSaleExchanges((prev) =>
      prev.map((ex) =>
        ex.salesExchangeId === id
          ? { ...ex, paymentStatus: res.data.paymentStatus }
          : ex
      )
    );

    console.log(`✅ PaymentStatus updated for SaleExchange ${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ Failed to update PaymentStatus for SaleExchange ${id}:`, err);
    throw err;
  }
}, []);


  // 🔽 Fetch Dropdown Data
  const fetchDropdowns = useCallback(async () => {
    try {
      // ⚡ Adjust endpoints according to your backend API
      const [salesRes, exchangeRes, paymentRes, typeRes, refundRes] =
        await Promise.all([
          api.get("/SaleExchange/Sales"), // returns all sales IDs
          api.get("/SaleExchange/ExchangeStatus"), // returns exchange statuses
          api.get("/SaleExchange/PaymentStatus"), // returns payment statuses
          api.get("/SaleExchange/ExchangeType"), // returns exchange types
          api.get("/SaleExchange/RefundStatus"), // returns refund statuses
        ]);

      setSalesIds(salesRes.data || []);
      setExchangeStatuses(exchangeRes.data || []);
      setPaymentStatuses(paymentRes.data || []);
      setExchangeTypes(typeRes.data || []);
      setRefundStatuses(refundRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  }, []);

  return (
    <SaleExchangeContext.Provider
      value={{
        saleExchanges,
        loading,
        fetchSaleExchanges,
        fetchSaleExchangeById,
        addSaleExchange,
   
        deleteSaleExchange,
        updatePaymentStatus,
        // Dropdowns
        salesIds,
        exchangeStatuses,
        paymentStatuses,
        exchangeTypes,
        refundStatuses,
        fetchDropdowns,
        products,
        searchProducts,
        searchProductsInStock,
        fetchSaleAdjustments,
        saleAdjustments,
        addSalesExchangeItems,
        fetchSalesExchangeItems,
        updateSaleExchange,
        updateSalesExchangeItem,
        deleteSalesExchangeItem
      }}
    >
      {children}
    </SaleExchangeContext.Provider>
  );
};

// 🔌 Hook
export const useSaleExchange = () => {
  const context = useContext(SaleExchangeContext);
  if (!context) {
    throw new Error("useSaleExchange must be used within a SaleExchangeProvider");
  }
  return context;
};
