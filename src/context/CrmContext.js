// src/context/CrmContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios"; // ✅ make sure you have axios instance configured

// Create Context
const CrmContext = createContext();

// Provider Component
export const CrmProvider = ({ children }) => {
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
 const [redemptionTypes, setRedemptionTypes] = useState([]); 
  // ✅ Fetch all loyalty programs
  const fetchLoyaltyPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/LoyaltyProgram"); // adjust backend route
      setLoyaltyPrograms(response.data);
    } catch (error) {
      console.error("Failed to fetch loyalty programs:", error);
    } finally {
      setLoading(false);
    }
  }, []);
 const fetchRedemptionTypes = useCallback(async () => {
    try {
      const response = await api.get("/LoyaltyProgram/RedemptionType"); // 🔹 Adjust to your backend route
      setRedemptionTypes(response.data);
    } catch (error) {
      console.error("Failed to fetch redemption types:", error);
    }
  }, []);
  // ✅ Add new program
  const addLoyaltyProgram = useCallback(async (programData) => {
    try {
      const response = await api.post("/LoyaltyProgram", [programData]);
      setLoyaltyPrograms((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to add loyalty program:", error);
    }
  }, []);

  // ✅ Update program
  const updateLoyaltyProgram = useCallback(async (id, updatedData) => {
    try {
      await api.put(`/LoyaltyProgram/${id}`, updatedData);
      setLoyaltyPrograms((prev) =>
        prev.map((p) =>
          p.loyaltyProgramId === id ? { ...p, ...updatedData } : p
        )
      );
    } catch (error) {
      console.error("Failed to update loyalty program:", error);
    }
  }, []);

  // ✅ Delete program
  const deleteLoyaltyProgram = useCallback(async (id) => {
    try {
      await api.delete(`/LoyaltyProgram/${id}`);
      setLoyaltyPrograms((prev) =>
        prev.filter((p) => p.loyaltyProgramId !== id)
      );
    } catch (error) {
      console.error("Failed to delete loyalty program:", error);
    }
  }, []);

  return (
    <CrmContext.Provider
      value={{
        loyaltyPrograms,
        loading,
        fetchLoyaltyPrograms,
        addLoyaltyProgram,
        updateLoyaltyProgram,
        deleteLoyaltyProgram,
        redemptionTypes,
        fetchRedemptionTypes
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

// ✅ Hook for easier use
export const useLoyaltyPrograms = () => {
  const context = useContext(CrmContext);
  if (!context)
    throw new Error("useLoyaltyPrograms must be used within CrmProvider");
  return context;
};
