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




  // Fetch all purchases from backend
  const fetchPurchases = async () => {
    try {
      const res = await api.get('/PurchaseRecord');
      setPurchases(res.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  // Add new purchase
  const addPurchase = async (purchaseData) => {
    try {
      const res = await api.post('/PurchaseRecord', purchaseData);
      await fetchPurchases();
      return res.data;
    } catch (error) {
      console.error('Error adding purchase:', error);
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

  // Add product purchase discount
  const addProductPurchaseDiscount = async (data) => {
    try {
      const res = await api.post('/ProductPurchaseDiscount', data);
      return res.data;
    } catch (error) {
      console.error('Error adding product purchase discount:', error);
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

  // Add purchase discount
  const addPurchaseDiscount = async (data) => {
    try {
      const res = await api.post('/PurchaseDiscount', data);
      return res.data;
    } catch (error) {
      console.error('Error adding purchase discount:', error);
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

  // Add purchase tax
  const addPurchaseTax = async (data) => {
    try {
      const res = await api.post('/PurchaseTax', data);
      return res.data;
    } catch (error) {
      console.error('Error adding purchase tax:', error);
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

  useEffect(() => {
    fetchPurchases();
     fetchSuppliers();
  fetchLocations();
   fetchPurchaseStatuses();
    fetchPaymentStatuses();
  }, []);

  return (
    <PurchaseContext.Provider value={{
      purchases,
       suppliers,
    locations,
     purchaseStatuses,
        paymentStatuses,
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
