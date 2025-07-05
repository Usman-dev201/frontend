// src/context/TaxContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const TaxContext = createContext();

export const TaxProvider = ({ children }) => {
  const [taxList, setTaxList] = useState([]);

const [loading, setLoading] = useState(false);
const getTaxLocations = async () => {
  const response = await api.get("/TaxLocation"); // adjust endpoint as needed
  return response.data;
};

const addTaxLocation = async (taxLocationData) => {
  try {
    const response = await api.post('/TaxLocation', [taxLocationData]); // Send as an array
    return response.data;
  } catch (error) {
    console.error("Error adding tax location:", error);
    throw error;
  }
};
 const fetchTaxes = async () => {
  try {
    setLoading(true);
    const response = await api.get('/Tax');
    setTaxList(response.data);
  } catch (error) {
    console.error("Error fetching taxes:", error);
  } finally {
    setLoading(false);
  }
};

 
  const addTax = async (taxName) => {
  try {
    setLoading(true);
    console.log("Sending to API:", { taxName }); // Debug log
    
    const response = await api.post('/Tax', [{ taxName }]);
    console.log("API Response:", response.data); // Debug log
    
  if (Array.isArray(response.data)) {
  setTaxList(prev => [...prev, ...response.data]);
} else {
  setTaxList(prev => [...prev, response.data]);
}
    return response.data;
  } catch (error) {
    console.error("Full error details:", error.response?.data);
    await fetchTaxes();
    throw error;
  } finally {
    setLoading(false);
  }
};

  
  const editTax = async (id, taxName) => {
    try {
      const updatedTax = { taxName }; 
      await api.put(`/Tax/${id}`, updatedTax);
      await fetchTaxes();
    } catch (error) {
      console.error("Error updating tax:", error);
    }
  };


  const deleteTax = async (id) => {
    try {
      await api.delete(`/Tax/${id}`);
      await fetchTaxes();
    } catch (error) {
      console.error("Error deleting tax:", error);
    }
  };

  // ✅ Fetch once when component mounts
  useEffect(() => {
    fetchTaxes();
  }, []);

  return (
    <TaxContext.Provider value={{
        taxList,
        addTax,
        editTax,
        deleteTax,
        getTaxLocations,
          addTaxLocation,
        loading,
      }}>
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = () => useContext(TaxContext);
