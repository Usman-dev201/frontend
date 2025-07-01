// src/contexts/SupplierContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios'; 

const SupplierContext = createContext();

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
  try {
    const res = await api.get('/Supplier');
    setSuppliers(res.data);
  } catch (error) {
    console.error('Failed to fetch suppliers', error);
  }
};

const addSupplier = async (supplier) => {
  try {
    const res = await api.post('/Supplier', [supplier]);
    console.log('Supplier added:', res.data);
    setSuppliers(prev => [...prev, ...res.data]);
  } catch (error) {
    console.error('Failed to add supplier', error);
  }
};

const updateSupplier = async (supplier) => {
  try {
    await api.put(`/Supplier/${supplier.supplierId}`, [supplier]);
    setSuppliers(prev => prev.map(s => s.supplierId === supplier.supplierId ? supplier : s));
  } catch (error) {
    console.error('Failed to update supplier', error);
  }
};

const deleteSupplier = async (id) => {
  try {
    await api.delete(`/Supplier/${id}`);
    setSuppliers(prev => prev.filter(s => s.supplierId !== id));
  } catch (error) {
    console.error('Failed to delete supplier', error);
  }
};


  return (
    <SupplierContext.Provider value={{
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier
    }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => useContext(SupplierContext);
