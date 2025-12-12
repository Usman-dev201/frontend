// src/context/ExpenseContext.js
import React, { createContext, useState, useEffect , useContext} from "react";
import api from "../api/axios";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]); 
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [taxes, setTaxes] = useState([]); // dynamic taxes based on location
const [expenses, setExpenses] = useState([]);
// 🔹 Fetch all expenses
const fetchExpenses = async () => {
  try {
    const res = await api.get("/ExpenseRecord");
    setExpenses(res.data || []);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    setExpenses([]);
  }
};
  const addExpense = async (expenseData) => {
    try {
      const res = await api.post("/ExpenseRecord", expenseData);
      // ✅ Append to state
      setExpenses((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  };

// 🔹 Delete expense by ID
const deleteExpense = async (id) => {
  try {
    await api.delete(`/ExpenseRecord/${id}`);
    setExpenses((prev) => prev.filter((e) => e.expenseId !== id));
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};
// 🔹 Add after addExpense()
const addExpenseTaxes = async (expenseId, selectedTaxes) => {
  try {
    if (!selectedTaxes || selectedTaxes.length === 0) return;

    // Format payload according to your backend structure
    const payload = selectedTaxes.map((tax) => ({
      expenseRecordId: expenseId,
      taxId: tax.taxId,
    }));

    await api.post("/ExpenseTax", payload); // adjust endpoint if needed
  } catch (error) {
    console.error("Error adding expense taxes:", error);
    throw error;
  }
};
// 🔹 Update an existing expense
// 🔹 Update existing expense record
const updateExpense = async (id, expenseData) => {
  try {
    const res = await api.put(`/ExpenseRecord/${id}`, expenseData);
    // ✅ Update local state
    setExpenses((prev) =>
      prev.map((exp) => (exp.expenseRecordId === id ? res.data : exp))
    );
    return res.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

// 🟢 DELETE an ExpenseTax by ID
const deleteExpenseTax = async (expenseTaxId) => {
  try {
    await api.delete(`/ExpenseTax/${expenseTaxId}`);
    console.log(`ExpenseTax ${expenseTaxId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting expense tax:", error);
    throw error;
  }
};


const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/ExpenseRecord/${id}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching expense by ID:", err);
    throw err;
  }
};

  const fetchExpenseData = async () => {
    try {
      const [
        categoryRes,
        locationRes,
        paymentStatusRes,
        paymentMethodRes,
      ] = await Promise.all([
        api.get("/ExpenseCategory"),
        api.get("/Location"),
        api.get("/ExpenseRecord/paymentStatuses"),
        api.get("/ExpenseRecord/paymentMethods"),
      ]);

      const allCategories = categoryRes.data || [];
      const parentCats = allCategories.filter((cat) => cat.parentCategoryId === null);

      setExpenseCategories(allCategories);
      setParentCategories(parentCats);
      setLocations(locationRes.data || []);
      setPaymentStatuses(paymentStatusRes.data || []);
      setPaymentMethods(paymentMethodRes.data || []);
    } catch (error) {
      console.error("Error fetching expense data:", error);
    }
  };

  // 🔹 Fetch taxes by location
  const fetchTaxesByLocation = async (locationId) => {
    if (!locationId) {
      setTaxes([]);
      return;
    }
    try {
      const response = await api.get(`/Tax/GetTaxesByLocation/${locationId}`);
      setTaxes(response.data || []);
    } catch (error) {
      console.error("Error fetching taxes for location:", error);
      setTaxes([]);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, []);

  useEffect(() => {
    if (selectedParentId) {
      const subs = expenseCategories.filter(
        (cat) => cat.parentCategoryId === selectedParentId
      );
      setFilteredSubCategories(subs);
    } else {
      setFilteredSubCategories([]);
    }
  }, [selectedParentId, expenseCategories]);

  return (
    <ExpenseContext.Provider
      value={{
        parentCategories,
        filteredSubCategories,
        setSelectedParentId,
        locations,
        paymentStatuses,
        paymentMethods,
        taxes,
        fetchTaxesByLocation, // ✅ Expose new method
         expenses,          // ✅ add this
    fetchExpenses,     // ✅ add this
    deleteExpense,     // ✅ add this
    addExpense,        // ✅ add this
    addExpenseTaxes,   // ✅ add this
    getExpenseById,    // ✅ add this
    updateExpense,     // ✅ add this
    deleteExpenseTax,  // ✅ add this
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
export const useExpense = () => {
  return useContext(ExpenseContext);
};