import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const BarcodeContext = createContext();

export const useBarcode = () => useContext(BarcodeContext);

export const BarcodeProvider = ({ children }) => {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBarcodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Barcode');
      setBarcodes(res.data);
    } catch (err) {
      console.error('Error fetching barcodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBarcode = async (barcodeType) => {
    try {
      await api.post('/Barcode', [{ barcodeType: barcodeType.trim() }]);
      fetchBarcodes();
    } catch (err) {
      console.error('Error adding barcode:', err);
    }
  };

  const updateBarcode = async (id, barcodeType) => {
    try {
      await api.put(`/Barcode/${id}`, { barcodeType: barcodeType.trim() });
      fetchBarcodes();
    } catch (err) {
      console.error('Error updating barcode:', err);
    }
  };

  const deleteBarcode = async (id) => {
    try {
      await api.delete(`/Barcode/${id}`);
      fetchBarcodes();
    } catch (err) {
      console.error('Error deleting barcode:', err);
    }
  };

  useEffect(() => {
    fetchBarcodes();
  }, []);

  return (
    <BarcodeContext.Provider value={{
      barcodes,
      loading,
      fetchBarcodes,
      addBarcode,
      updateBarcode,
      deleteBarcode
    }}>
      {children}
    </BarcodeContext.Provider>
  );
};
