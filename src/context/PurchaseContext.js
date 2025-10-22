// src/context/PurchaseContext.js
import React, { createContext, useContext, useState, useEffect ,} from 'react';
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
  // const [productPurchaseRecords, setProductPurchaseRecords] = useState([]);

  
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
   const response = await api.put(`/PurchaseRecord/${id}`, updatedData);
   
    // Refresh the purchases list to get updated data
    await fetchPurchases();
     return response.data;
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw error; // Make sure to re-throw the error
  }
};
const updatePurchasePayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/PurchaseRecord/${id}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating payment:", error);
    throw error;
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
    const dataArray = Array.isArray(data) ? data : [data];
    // Ensure we're sending an array even for single products
    const payload = dataArray.map(item => ({
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
const getPurchaseReturnsByPurchaseId = async (purchaseId) => {
    try {
        const response = await api.get(`/PurchaseReturn/byPurchase/${purchaseId}`);
        return response.data; // List of purchase returns for this purchase
    } catch (error) {
        console.error("Error fetching purchase returns:", error);
        return [];
    }
};

const getProductPurchaseRecordsByPurchaseId = async (purchaseId) => {
  try {
    const res = await api.get(`/ProductPurchaseRecord/byPurchase/${purchaseId}`);
    return res.data; 
  } catch (error) {
    console.error('Error fetching product purchase records:', error);
    throw error;
  }
};

const getProductPurchaseDiscountsByPurchaseId = async (purchaseId) => {
  try {
    const res = await api.get(`/ProductPurchaseDiscount/byPurchaseId/${purchaseId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch product discounts:", error);
    return [];
  }
};
const getPurchaseDiscountsByPurchaseId = async (purchaseId) => {
  try {
    const res = await api.get(`/PurchaseDiscount/byPurchaseId/${purchaseId}`);
    return res.data;
  } catch (error) {
    // Handle 404 (no discounts found) by returning empty array
    if (error.response?.status === 404) {
      console.log(`No discounts found for purchase ${purchaseId} - returning empty array`);
      return [];
    }
    console.error('Failed to fetch purchase discounts:', error);
    throw error; // Re-throw other errors
  }
};
const updateProductPurchaseRecords = async (records) => {
  try {
    for (const record of records) {
      
      await api.put(`/ProductPurchaseRecord/${record.lotId}`, record); 
    }
  } catch (error) {
    console.error('Error updating ProductPurchaseRecords:', error);
    throw error;
  }
};

  // Delete product purchase record
const deleteProductPurchaseRecord = async (lotId) => {
  try {
    await api.delete(`/ProductPurchaseRecord/${lotId}`);
  } catch (error) {
    console.error('Error deleting product purchase record:', error);
    throw error; 
  }
}
  const addProductPurchaseDiscount = async (data) => {
    try {
      
       console.log("📤 Adding ProductPurchaseDiscount payload:", data);
       console.log('Payload being sent to addProductPurchaseDiscount:', data);

      const res = await api.post('/ProductPurchaseDiscount', data);
      return res.data;
    } catch (error) {
     if (error.response?.data) {
      console.error("Backend validation error details:", error.response.data);
    }
    console.error('Error adding product purchase discount:', error);
    throw error;
    }
  };
  const addProductDiscount = async (data) => {
    try {
      
       console.log("📤 Adding ProductPurchaseDiscount payload:", data);
       console.log('Payload being sent to addProductPurchaseDiscount:', data);

     const res = await api.post('/ProductPurchaseDiscount', [data]);

      return res.data;
    } catch (error) {
     if (error.response?.data) {
      console.error("Backend validation error details:", error.response.data);
    }
    console.error('Error adding product purchase discount:', error);
    throw error;
    }
  };
const updateProductPurchaseDiscounts = async (discounts) => {
  try {
    for (const discount of discounts) {
      const id = discount.productPurchaseDiscountId;

   
      const payload = {
        loTId: discount.loTId,
        discountId: discount.discountId,
        discountType: discount.discountType,
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage
      };

      console.log("📦 Sending update for ID:", id, payload);
      await api.put(`/ProductPurchaseDiscount/${id}`, payload);
    }
  } catch (error) {
    console.error("Error updating product discounts:", error);
    if (error.response?.data?.errors) {
      console.log("🔍 Validation Errors:", error.response.data.errors);
    }
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
    const addPurchaseDiscounts = async (dataArray) => {
  try {
    console.log("📤 Adding PurchaseDiscounts payload:", dataArray);
    
    // Ensure we're sending an array
    const payload = Array.isArray(dataArray) ? dataArray : [dataArray];
    
    const res = await api.post('/PurchaseDiscount', payload);
    return res.data;
  } catch (error) {
    console.error('Error adding purchase discounts:', error);
    
    // Enhanced error logging
    if (error.response?.data) {
      console.error("Backend validation error details:", error.response.data);
      if (error.response.data.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
    }
    
    throw error;
  }
};
  const updatePurchaseDiscounts = async (discounts) => {
  try {
    // Only send if we have discounts
    if (!discounts || discounts.length === 0) {
      console.log('No discounts to update - skipping API call');
      return [];
    }
    
    const res = await api.put('/PurchaseDiscount', discounts);
    return res.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    } else {
      console.error("Error updating purchase discounts:", error);
    }
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
const getPurchaseTaxRecordsByPurchaseId = async (purchaseId) => {
  try {
    const res = await api.get(`/PurchaseTax/byPurchaseId/${purchaseId}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch purchase tax records:', error);
    return [];
  }
};
const updatePurchaseTaxes = async (taxes) => {
  try {
    if (!taxes || taxes.length === 0) {
      console.log('No tax records to update - skipping API call');
      return [];
    }

    const results = [];
    for (const tax of taxes) {
      const response = await api.put(`/PurchaseTax/${tax.purchaseTaxId}`, {
        purchaseId: tax.purchaseId,
        taxLocationId: tax.taxLocationId
      });
      results.push(response.data);
    }

    return results;
  } catch (error) {
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    } else {
      console.error("Error updating purchase taxes:", error);
    }
    throw error;
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

 const addPurchaseTaxes = async (dataArray) => {
    try {
      console.log("📤 Adding PurchaseDiscounts payload:", dataArray);
    
    // Ensure we're sending an array
    const payload = Array.isArray(dataArray) ? dataArray : [dataArray];
      const res = await api.post('/PurchaseTax', payload);
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
      getProductPurchaseRecordsByPurchaseId,
      deleteProductPurchaseRecord,
      addProductPurchaseDiscount,
      deleteProductPurchaseDiscount,
      addPurchaseDiscount,
      deletePurchaseDiscount,
      addPurchaseTax,
      deletePurchaseTax,
      updateProductPurchaseRecords,
      getProductPurchaseDiscountsByPurchaseId,
  updateProductPurchaseDiscounts,
  getPurchaseDiscountsByPurchaseId,
  updatePurchaseDiscounts,
  getPurchaseTaxRecordsByPurchaseId,
  updatePurchaseTaxes,
  addProductDiscount,
  addPurchaseDiscounts,
  addPurchaseTaxes,
  updatePurchasePayment,
  getPurchaseReturnsByPurchaseId
  
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
