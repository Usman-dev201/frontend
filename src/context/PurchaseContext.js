import React, { createContext, useContext, useState } from 'react';

const PurchaseContext = createContext();

export function PurchaseProvider({ children }) {
  const [purchases, setPurchases] = useState([
    {
      id: 'PUR001',
      location: 'Warehouse A',
      supplier: 'ABC Suppliers',
      amountPaid: 5000,
      paymentDue: 2000,
      grandTotal: 7000,
      purchaseStatus: 'Completed',
      paymentStatus: 'Partial',
      date: '2024-03-15',
      products: [
        { name: 'Product 1', quantity: 10, price: 500 },
        { name: 'Product 2', quantity: 5, price: 400 }
      ]
    },
    {
      id: 'PUR002',
      location: 'Store 1',
      supplier: 'XYZ Trading',
      amountPaid: 3000,
      paymentDue: 0,
      grandTotal: 3000,
      purchaseStatus: 'Completed',
      paymentStatus: 'Paid',
      date: '2024-03-14',
      products: [
        { name: 'Product 3', quantity: 3, price: 1000 }
      ]
    },
    {
      id: 'PUR003',
      location: 'Warehouse B',
      supplier: 'Global Imports',
      amountPaid: 0,
      paymentDue: 10000,
      grandTotal: 10000,
      purchaseStatus: 'Pending',
      paymentStatus: 'Unpaid',
      date: '2024-03-13',
      products: [
        { name: 'Product 4', quantity: 20, price: 500 }
      ]
    }
  ]);

  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP001',
      name: 'ABC Suppliers',
      contact: 'John Smith',
      email: 'john@abcsuppliers.com',
      phone: '+1 234-567-8901',
      address: '123 Business St, City, Country',
      status: 'Active'
    },
    {
      id: 'SUP002',
      name: 'XYZ Trading',
      contact: 'Sarah Johnson',
      email: 'sarah@xyztrading.com',
      phone: '+1 234-567-8902',
      address: '456 Trade Ave, City, Country',
      status: 'Active'
    }
  ]);

  const [returns, setReturns] = useState([
    {
      id: 'RET001',
      purchaseId: 'PUR001',
      supplier: 'ABC Suppliers',
      returnDate: '2024-03-15',
      reason: 'Damaged Goods',
      amount: 1500,
      status: 'Pending'
    }
  ]);

  const addPurchase = (newPurchase) => {
    const id = `PUR${String(purchases.length + 1).padStart(3, '0')}`;
    const purchase = {
      ...newPurchase,
      id,
      paymentDue: newPurchase.grandTotal - newPurchase.amountPaid
    };
    setPurchases(prev => [...prev, purchase]);
    return id;
  };

  const updatePurchase = (id, updatedPurchase) => {
    setPurchases(prev => prev.map(purchase => 
      purchase.id === id ? { ...purchase, ...updatedPurchase } : purchase
    ));
  };

  const deletePurchase = (id) => {
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
  };

  const getPurchaseById = (id) => {
    return purchases.find(purchase => purchase.id === id);
  };

  const addSupplier = (newSupplier) => {
    const id = `SUP${String(suppliers.length + 1).padStart(3, '0')}`;
    const supplier = { ...newSupplier, id };
    setSuppliers(prev => [...prev, supplier]);
    return id;
  };

  const updateSupplier = (id, updatedSupplier) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier
    ));
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const addReturn = (newReturn) => {
    const id = `RET${String(returns.length + 1).padStart(3, '0')}`;
    const returnItem = { ...newReturn, id };
    setReturns([...returns, returnItem]);
    return id;
  };

  const updateReturn = (id, updatedReturn) => {
    setReturns(returns.map(returnItem => 
      returnItem.id === id ? { ...returnItem, ...updatedReturn } : returnItem
    ));
  };

  const deleteReturn = (id) => {
    setReturns(returns.filter(returnItem => returnItem.id !== id));
  };

  return (
    <PurchaseContext.Provider value={{
      purchases,
      suppliers,
      returns,
      addPurchase,
      updatePurchase,
      deletePurchase,
      getPurchaseById,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addReturn,
      updateReturn,
      deleteReturn
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