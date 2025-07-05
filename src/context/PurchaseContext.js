// src/context/PurchaseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';



 export const PurchaseContext = createContext();  
  
export function PurchaseProvider({ children }) {

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [purchaseStatuses, setPurchaseStatuses] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [taxNames, setTaxNames] = useState([]);
const [discountTypes, setDiscountTypes] = useState([]); 
  const [productDiscounts, setProductDiscounts] = useState([]);
  
const [taxLocations, setTaxLocations] = useState([]);

const fetchTaxLocations = async () => {
  try {
    const res = await api.get('/TaxLocation');
    setTaxLocations(res.data);
  } catch (error) {
    console.error('Error fetching tax locations:', error);
  }
};
const fetchProductDiscountsWithProductName = async () => {
  try {
    const res = await api.get('/ProductPurchaseDiscount/WithProductInfo');
    setProductDiscounts(res.data);
  } catch (error) {
    console.error('Error fetching product discounts with names:', error);
  }
};
  const fetchPurchaseStatuses = async () => {
    try {
      const res = await api.get('/PurchaseRecord/purchaseStatuses');
      setPurchaseStatuses(res.data);
    } catch (error) {
      console.error('Error fetching purchase statuses:', error);
    }
  };

  const fetchPaymentStatuses = async () => {
    try {
      const res = await api.get('/PurchaseRecord/paymentStatuses');
      setPaymentStatuses(res.data);
    } catch (error) {
      console.error('Error fetching payment statuses:', error);
    }
  };
  const fetchSuppliers = async () => {
  try {
    const res = await api.get('/Supplier');
    setSuppliers(res.data);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
  }
};

// Fetch locations
const fetchLocations = async () => {
  
  try {
    const res = await api.get('/Location');
    setLocations(res.data);
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};
const fetchProducts = async (searchTerm = '') => {
  try {
    if (searchTerm.trim() === '') {
      setProducts([]); // or set to some default list if desired
      return;
    }
    const res = await api.get(`/Product/search?term=${searchTerm}&t=${Date.now()}`);
    setProducts(res.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/PurchaseRecord');
      setPurchases(res.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };
 const fetchDiscountCodes = async () => {
    try {
      const res = await api.get('/Discount');
      setDiscountCodes(res.data);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    }
  };

  const fetchDiscountTypes = async () => {
    try {
      const res = await api.get('/ProductPurchaseDiscount/discountType');
      setDiscountTypes(res.data);
    } catch (error) {
      console.error('Error fetching discount types:', error);
    }
  };
   const fetchPurchaseDiscountTypes = async () => {
    try {
      const res = await api.get('/PurchaseDiscount/discountType');
      setDiscountTypes(res.data);
    } catch (error) {
      console.error('Error fetching discount types:', error);
    }
  };


  const fetchTaxNames = async () => {
    try {
      const res = await api.get('/Tax');
      setTaxNames(res.data);
    } catch (error) {
      console.error('Error fetching tax names:', error);
    }
  };

  // Edit purchase
  const updatePurchase = async (id, updatedData) => {
    try {
      await api.put(`/PurchaseRecord/${id}`, updatedData);
      await fetchPurchases();
    } catch (error) {
      console.error('Error updating purchase:', error);
    }
  };

  // Delete purchase
  const deletePurchase = async (id) => {
    try {
      await api.delete(`/PurchaseRecord/${id}`);
      await fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  // Add product purchase record
 const addProductPurchaseRecord = async (data) => {
  try {
    // Ensure we're sending an array even for single products
    const payload = data.map(item => ({
      purchaseId: item.purchaseId,
      productId: item.productId,
      mgfDate: item.mgfDate || null,
      expiryDate: item.expiryDate || null,
      quantityPurchased: item.quantityPurchased,
      purchasePriceBeforeDiscount: item.purchasePriceBeforeDiscount,
      purchasePriceAfterDiscount: item.purchasePriceAfterDiscount,
      totalAmount: item.totalAmount,
      profitMargin: item.profitMargin,
      unitSellingPrice: item.unitSellingPrice
    }));
    const res = await api.post('/ProductPurchaseRecord', payload);
    return res.data;
  } catch (error) {
    console.error('Error adding product purchase record:', error);
     console.error('Validation errors:', error.response?.data?.errors); 
    throw error;
  }
};

  // Delete product purchase record
  const deleteProductPurchaseRecord = async (id) => {
    try {
      await api.delete(`/ProductPurchaseRecord/${id}`);
    } catch (error) {
      console.error('Error deleting product purchase record:', error);
    }
  };

  const addProductPurchaseDiscount = async (data) => {
    try {
      const res = await api.post('/ProductPurchaseDiscount', data);
      return res.data;
    } catch (error) {
      console.error('Error adding product purchase discount:', error);
      throw error;
    }
  };

  // Delete product purchase discount
  const deleteProductPurchaseDiscount = async (id) => {
    try {
      await api.delete(`/ProductPurchaseDiscount/${id}`);
    } catch (error) {
      console.error('Error deleting product purchase discount:', error);
    }
  };

   const addPurchaseDiscount = async (data) => {
    try {
      const res = await api.post('/PurchaseDiscount', data);
      return res.data;
    } catch (error) {
      console.error('Error adding purchase discount:', error);
      throw error;
    }
  };
  // Delete purchase discount
  const deletePurchaseDiscount = async (id) => {
    try {
      await api.delete(`/PurchaseDiscount/${id}`);
    } catch (error) {
      console.error('Error deleting purchase discount:', error);
    }
  };

 const addPurchaseTax = async (data) => {
    try {
      const res = await api.post('/PurchaseTax', data);
      return res.data;
    } catch (error) {
      console.error('Error adding purchase tax:', error);
      throw error;
    }
  };

  // Delete purchase tax
  const deletePurchaseTax = async (id) => {
    try {
      await api.delete(`/PurchaseTax/${id}`);
    } catch (error) {
      console.error('Error deleting purchase tax:', error);
    }
  };

  const getPurchaseById = async (id) => {
  try {
    const res = await api.get(`/PurchaseRecord/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching purchase by ID (${id}):`, error);
    throw error;
  }
};
const addPurchase = async (purchaseData) => {
  try {
     const locationObj = locations.find(l => l.locationId === purchaseData.locationId);
    const supplierObj = suppliers.find(s => s.supplierId === purchaseData.supplierId);

    const payload = [{
      supplierId: purchaseData.supplierId,
      locationId: purchaseData.locationId,
      Location: locationObj || null,      
      Supplier: supplierObj || null,   
     date: new Date(purchaseData.date).toISOString().split('T')[0],
      amountPaid: purchaseData.amountPaid,
      purchaseStatus: purchaseData.purchaseStatus,
      paymentStatus: purchaseData.paymentStatus,
    }];
  console.log("Payload being sent to API:", payload);
    const res = await api.post('/PurchaseRecord', payload);
     return res.data[0]; 
  }catch (error) {
  if (error.response) {
    console.error("Backend error response:", error.response.data);
    console.error("Validation errors:", error.response.data.errors);
  } else {
    console.error("Unknown error:", error);
  }
}
};
 useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchLocations();
    fetchPurchaseStatuses();
    fetchPaymentStatuses();
    fetchProducts();
    fetchDiscountCodes();
    fetchDiscountTypes();
     fetchPurchaseDiscountTypes();
    fetchTaxNames();
    fetchTaxLocations();
  }, []);
   return (
    <PurchaseContext.Provider value={{
      purchases,
      suppliers,
      locations,
      purchaseStatuses,
      paymentStatuses,
      products,
      discountCodes,
      discountTypes,
      taxNames,
      fetchProductDiscountsWithProductName,
      productDiscounts,
      fetchProducts,
      fetchPurchases,
      addPurchase,
      taxLocations,
      updatePurchase,
      deletePurchase,
      getPurchaseById,
      addProductPurchaseRecord,
      deleteProductPurchaseRecord,
      addProductPurchaseDiscount,
      deleteProductPurchaseDiscount,
      addPurchaseDiscount,
      deletePurchaseDiscount,
      addPurchaseTax,
      deletePurchaseTax,
     
    }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
}
