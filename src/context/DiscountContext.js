import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios'; 

const DiscountContext = createContext();

export const useDiscount = () => useContext(DiscountContext);

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all discounts
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Discount');
      setDiscounts(response.data);
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

  // Add a new discount
  const addDiscount = async (newDiscount) => {
  try {
    const payload = [{
        discountCode: newDiscount.discountCode,
  status: newDiscount.status.charAt(0).toUpperCase() + newDiscount.status.slice(1).toLowerCase(),
    }];
const response = await api.post('/Discount', payload);
      setDiscounts([...discounts, ...response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to add discount', err);
      throw err;
    }
  };

  // Edit an existing discount
 const editDiscount = async (id, updatedDiscount) => {
  try {
    await api.put(`/Discount/${id}`, updatedDiscount);
    setDiscounts(prev =>
      prev.map(discount =>
        discount.discountId === id
          ? { ...discount, ...updatedDiscount }
          : discount
      )
    );
  } catch (error) {
    console.error('Error editing discount:', error);
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
  }, []);

  return (
    <DiscountContext.Provider value={{
      discounts,
      statuses,
      loading,
      error,
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
