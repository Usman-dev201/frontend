// src/context/PurchaseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';



  const PurchaseContext = createContext();  
  
export function PurchaseProvider({ children }) {

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [purchaseStatuses, setPurchaseStatuses] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [taxNames, setTaxNames] = useState([]);

  
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
      const res = await api.get('/PurchaseRecord/discountType');
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
      const res = await api.post('/ProductPurchaseRecord', data);
      return res.data;
    } catch (error) {
      console.error('Error adding product purchase record:', error);
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

  // Optional: Get purchase by ID (from local state)
  const getPurchaseById = (id) => {
    return purchases.find(p => p.id === id);
  };
 const addPurchase = async (purchaseData) => {
    try {
      // Create the purchase record
      const purchaseRes = await api.post('/PurchaseRecord', {
        supplierId: purchaseData.supplierId,
        locationId: purchaseData.locationId,
        date: purchaseData.date,
        amountPaid: purchaseData.amountPaid,
        purchaseStatus: purchaseData.purchaseStatus,
        paymentStatus: purchaseData.paymentStatus
      });

      const purchaseId = purchaseRes.data.purchaseId;

      // Add product purchase records
      const productPromises = purchaseData.products.map(async (product) => {
        const productRes = await api.post('/ProductPurchaseRecord', {
          purchaseId,
          productId: product.productId,
          quantityPurchased: product.quantity,
          purchasePriceBeforeDiscount: product.priceBeforeDiscount,
          purchasePriceAfterDiscount: product.priceAfterDiscount,
          profitMargin: product.profitMargin,
          unitSellingPrice: product.unitSellingPrice,
          mgfDate: product.mfgDate,
          expiryDate: product.expDate
        });

        // Add product purchase discounts if any
        if (product.discounts && product.discounts.length > 0) {
          const discountPromises = product.discounts.map(discount => 
            api.post('/ProductPurchaseDiscount', {
              lotId: product.lotId,
              discountId: discount.discountId,
              discountType: discount.discountType,
              discountAmount: discount.discountAmount,
              discountPercentage: discount.discountPercentage
            })
          );
          await Promise.all(discountPromises);
        }

        return productRes.data;
      });

      await Promise.all(productPromises);

      // Add purchase discounts if any
      if (purchaseData.purchaseDiscounts && purchaseData.purchaseDiscounts.length > 0) {
        const purchaseDiscountPromises = purchaseData.purchaseDiscounts.map(discount =>
          api.post('/PurchaseDiscount', {
            purchaseId,
            discountId: discount.discountId,
            discountType: discount.discountType,
            discountAmount: discount.discountAmount,
            discountPercentage: discount.discountPercentage
          })
        );
        await Promise.all(purchaseDiscountPromises);
      }

      // Add purchase taxes if any
      if (purchaseData.purchaseTaxes && purchaseData.purchaseTaxes.length > 0) {
        const purchaseTaxPromises = purchaseData.purchaseTaxes.map(tax =>
          api.post('/PurchaseTax', {
            purchaseId,
            taxId: tax.taxId,
            locationId: purchaseData.locationId,
            taxPercentage: tax.taxPercentage,
            effectiveDate: tax.effectiveDate
          })
        );
        await Promise.all(purchaseTaxPromises);
      }

      await fetchPurchases();
      return purchaseRes.data;
    } catch (error) {
      console.error('Error adding purchase:', error);
      throw error;
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
    fetchTaxNames();
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
      fetchProducts,
      fetchPurchases,
      addPurchase,


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
      deletePurchaseTax
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
