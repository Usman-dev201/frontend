import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios'; 

const DiscountContext = createContext();

export const useDiscount = () => useContext(DiscountContext);

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all discounts
  const fetchDiscounts = async () => {
  setLoading(true);
  try {
    const response = await api.get('/Discount');
    const result = Array.isArray(response.data)
      ? response.data
      : response.data.data || [];
    setDiscounts(result);
  } catch (err) {
    console.error('Failed to fetch discounts', err);
    setError('Failed to load discounts');
  } finally {
    setLoading(false);
  }
};
  // Fetch valid discount statuses
  const fetchStatuses = async () => {
    try {
      const response = await api.get('/Discount/statuses');
      setStatuses(response.data);
    } catch (err) {
      console.error('Failed to fetch discount statuses', err);
    }
  };
  const fetchDiscountTypes = async () => {
    try {
      const response = await api.get('/Discount/discountType');
      setDiscountTypes(response.data);
    } catch (err) {
      console.error('Failed to fetch discount types', err);
    }
  };

  // Add a new discount
  const addDiscount = async (newDiscount) => {
  try {
    const payload = [{
      discountCode: newDiscount.discountCode?.trim(),
      startDate: newDiscount.startDate,
      endDate: newDiscount.endDate,
      discountType: newDiscount.discountType,
      discountAmount: Number(newDiscount.discountAmount) || 0,
      discountPercentage: Number(newDiscount.discountPercentage) || 0,
      status: newDiscount.status
        ? newDiscount.status.charAt(0).toUpperCase() + newDiscount.status.slice(1).toLowerCase()
        : 'Active'
    }];

    const response = await api.post('/Discount', payload);
    setDiscounts([...discounts, ...response.data]);
    return response.data;
  } catch (err) {
    console.error('Failed to add discount', err.response?.data || err);
    throw err;
  }
};


 // Edit an existing discount
const editDiscount = async (id, updatedDiscount) => {
  try {
    const payload = {
      discountCode: updatedDiscount.discountCode?.trim(),
      startDate: updatedDiscount.startDate,
      endDate: updatedDiscount.endDate,
      discountType: updatedDiscount.discountType,
      discountAmount: Number(updatedDiscount.discountAmount) || 0,
      discountPercentage: Number(updatedDiscount.discountPercentage) || 0,
      status: updatedDiscount.status
        ? updatedDiscount.status.charAt(0).toUpperCase() + updatedDiscount.status.slice(1).toLowerCase()
        : 'Active'
    };

    const response = await api.put(`/Discount/${id}`, payload);

    // Update local state
    setDiscounts(prev =>
      prev.map(discount =>
        discount.discountId === id ? { ...discount, ...response.data } : discount
      )
    );
  } catch (error) {
    console.error('Error editing discount:', error.response?.data || error);
    throw error;
  }
};


  // Delete a discount
 const deleteDiscount = async (id) => {
  console.log("Attempting to delete discount with ID:", id); // DEBUG
  try {
    await api.delete(`/Discount/${id}`);
    setDiscounts(discounts.filter(d => d.discountId !== id));
  } catch (err) {
    console.error('Failed to delete discount', err);
    throw err;
  }
};

  // Load discounts and statuses on mount
  useEffect(() => {
    fetchDiscounts();
    fetchStatuses();
    fetchDiscountTypes(); 
  }, []);

  return (
    <DiscountContext.Provider value={{
      discounts,
      statuses,
      loading,
      error,
       discountTypes,
      fetchDiscounts,
      fetchStatuses,
      addDiscount,
      editDiscount,
      deleteDiscount
    }}>
      {children}
    </DiscountContext.Provider>
  );
};
