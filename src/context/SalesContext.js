import React, { createContext, useContext, useState ,useCallback} from "react";
import api from "../api/axios";

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [transactionStatuses, setTransactionStatuses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [shippingStatuses, setShippingStatuses] = useState([]);
  const [products, setProducts] = useState([]); 
const [discountCodes, setDiscountCodes] = useState([]);
const [discountTypes, setDiscountTypes] = useState([]);
const [salediscountTypes,  setSaleDiscountTypes] = useState([]);
const [taxes, setTaxes] = useState([]); // all taxes
const [loyaltyPrograms, setLoyaltyPrograms] = useState([]);
const [customerLoyaltyRecords, setCustomerLoyaltyRecords] = useState([]);

const fetchLoyaltyPrograms = useCallback(async () => {
  try {
    const res = await api.get("/LoyaltyProgram"); // your backend API route
    setLoyaltyPrograms(res.data);
  } catch (err) {
    console.error("Failed to fetch loyalty programs", err);
  }
}, []);
const fetchCustomerLoyaltyRecords = useCallback(async (customerId) => {
  if (!customerId) {
    setCustomerLoyaltyRecords([]);
    return;
  }
  
  try {
    console.log("Fetching loyalty records for customer:", customerId); // DEBUG
    const res = await api.get(`/CustomerLoyaltyRecord/ByCustomer/${customerId}`);
    console.log("Loyalty records response:", res.data); // DEBUG
    setCustomerLoyaltyRecords(res.data || []);
  } catch (err) {
    console.error("Failed to fetch customer loyalty records", err);
    setCustomerLoyaltyRecords([]);
  }
}, []);
const fetchDiscountCodes = async () => {
  try {
    const res = await api.get("/Discount/GetDiscountCodes"); // ✅ use new endpoint
    setDiscountCodes(res.data);
  } catch (err) {
    console.error("Error fetching discount codes:", err);
  }
};

// Fetch discount types from ProductSaleDiscount
const fetchDiscountTypes = async () => {
  try {
    const res = await api.get("/ProductSaleDiscount/discountType"); // ✅ new endpoint
    setDiscountTypes(res.data);
  } catch (err) {
    console.error("Error fetching discount types:", err);
  }
};
const fetchSaleDiscountTypes = async () => {
  try {
    const res = await api.get("/SalesDiscount/discountType"); // ✅ new endpoint
     setSaleDiscountTypes(res.data);
  } catch (err) {
    console.error("Error fetching discount types:", err);
  }
};
  // Fetch Sales
  const fetchSales = async () => {
    try {
      const res = await api.get("/SalesRecord");
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };
const fetchTaxes = async (locationId) => {
  if (!locationId) {
    setTaxes([]);
    return;
  }

  try {
    const res = await api.get(`/Tax/ByLocation/${locationId}`);
    setTaxes(res.data || []);
  } catch (err) {
    console.error("Error fetching taxes:", err);
    setTaxes([]);
  }
};
// Add to SalesContext
const fetchSaleById = async (id) => {
  try {
    const res = await api.get(`/SalesRecord/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching sale:", err);
    throw err;
  }
};

const fetchSaleProducts = async (salesId) => {
  try {
    const res = await api.get(`/ProductSaleRecord/BySale/${salesId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching sale products:", err);
    return [];
  }
};

const fetchProductDiscounts = async (salesId) => {
  try {
    const res = await api.get(`/ProductSaleDiscount/BySale/${salesId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching sale discounts:", err);
    return [];
  }
};

const fetchSaleTaxes = async (salesId) => {
  try {
    const res = await api.get(`/SalesTax/BySale/${salesId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching sale taxes:", err);
    return [];
  }
};

const fetchSaleDiscounts = async (salesId) => {
  try {
    const res = await api.get(`/SalesDiscount/BySale/${salesId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching sale discounts:", err);
    return [];
  }
};

// Add to SalesContext after other fetch functions
const fetchSalesCustomerLoyaltyRecords = async (salesId) => {
  try {
     console.log(`🔍 [Frontend API Call] Fetching loyalty records for sale: ${salesId}`);
    
    const res = await api.get(`/SalesCustomerLoyaltyRecord/BySale/${salesId}`);
    return res.data || [];
  } catch (err) {
    console.error("Error fetching sales customer loyalty record:", err);
    return [];
  }
};
  // Fetch dropdowns
 // Fetch all dropdowns in one call
const fetchDropdowns = useCallback(async () => {
  try {
    const [
      custRes,
      locRes,
      transRes,
      payMethRes,
      payStatRes,
      shipStatRes,
      discCodeRes,
      discTypeRes,
      salediscTypeRes,
 
    ] = await Promise.all([
      api.get("/Customer"),
      api.get("/Location"),
      api.get("/SalesRecord/transactionStatuses"),
      api.get("/SalesRecord/paymentMethods"),
      api.get("/SalesRecord/paymentStatuses"),
      api.get("/SalesRecord/shippingStatuses"),
      api.get("/Discount/GetDiscountCodes"),
      api.get("/ProductSaleDiscount/discountType"),
api.get("/SalesDiscount/discountType"),

    ]);

    setCustomers(custRes.data);
    setLocations(locRes.data);
    setTransactionStatuses(transRes.data);
    setPaymentMethods(payMethRes.data);
    setPaymentStatuses(payStatRes.data);
    setShippingStatuses(shipStatRes.data);
    setDiscountCodes(discCodeRes.data);
    setDiscountTypes(discTypeRes.data);
    setSaleDiscountTypes(salediscTypeRes.data);

  } catch (err) {
    console.error("Error fetching dropdowns:", err);
  }
}, []); 

  // Add Sale
const addSale = async (saleData) => {
  try {
    const res = await api.post("/SalesRecord", [saleData]);
    const createdSale = Array.isArray(res.data) ? res.data[0] : res.data; // ✅ extract first
    setSales((prev) => [...prev, createdSale]);
    return createdSale; // return single object with salesId
  } catch (err) {
    console.error("Error adding sale:", err);
    throw err;
  }
};
const searchProducts = async (query) => {
  try {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }
    const res = await api.get(`/Product/search?term=${query}`); // ✅ match backend route
    setProducts(res.data); // store search results
  } catch (err) {
    console.error("Error searching products:", err);
  }
};
const getStockInfo = async (productId, locationId) => {
  try {
    const res = await api.get(
      `/Stock/GetStockInfo?productId=${productId}&locationId=${locationId}`
    );
    return res.data; // { currentStock, quantityAlert }
  } catch (err) {
    console.error("Error fetching stock info:", err);
    return null;
  }
};
const getSellingPrice = async (productId, locationId) => {
  try {
    const res = await api.get(`/SalesRecord/GetSellingPrice?productId=${productId}&locationId=${locationId}`);
    return res.data.sellingPrice || 0;
  } catch (err) {
    console.error("Error fetching selling price:", err);
    return 0;
  }
};
const addProductToSale = async (saleId, product) => {
  try {
    const payload = [
      {
        salesId: saleId,
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        priceAfterDiscount: product.priceAfterDiscount,
        totalAmount: product.totalAmount,
      },
    ];

    const res = await api.post(`/ProductSaleRecord`, payload);
    return Array.isArray(res.data) ? res.data[0] : res.data; // ✅ Return created record
  } catch (err) {
    console.error("Error adding product to sale:", err);
    throw err;
  }
};
const addDiscountToSale = async (productSaleRecordId, discount) => {
//   if (!discount.discountId) {
//   console.error("Cannot add discount: invalid discountId", discount);
//   return false;
// }

  try {
    const payload = [
      {
        productSaleRecordId,
        // discountId: discount.discountId,// if you have backend id
        discountType: discount.discountType,
        discountAmount: discount.discountAmount,
        discountPercentage: discount.discountPercentage
      }
    ];
    await api.post("/ProductSaleDiscount", payload);
    return true;
  } catch (err) {
    console.error("Error adding discount to sale:", err);
    throw err;
  }
};
const addSaleDiscount = async (saleId, saleDiscount) => {
  // Make sure discountId exists
  // if (!saleDiscount.discountId) {
  //   console.error("Cannot add sale discount: invalid discountId");
  //   return false;
  // }

  try {
    const payload = [
      {
        salesId: saleId,
       
        discountType: saleDiscount.discountType || "", // default empty string
        discountAmount: Number(saleDiscount.discountAmount) || 0,
        discountPercentage: Number(saleDiscount.discountPercentage) || 0,
      },
    ];

    console.log("Adding sale discount payload:", payload); // debug

    await api.post("/SalesDiscount", payload); // backend expects array
    return true;
  } catch (err) {
    console.error("Error adding sale discount:", err.response || err);
    throw err;
  }
};
const addSalesTax = async (salesId, taxIds) => {
  if (!salesId || !taxIds || taxIds.length === 0) return false;

  try {
    // Backend expects an array of objects [{ salesId, taxId }]
    const payload = taxIds.map((taxId) => ({
      salesId,
      taxId: Number(taxId),
    }));

    await api.post("/SalesTax", payload);
    return true;
  } catch (err) {
    console.error("Error adding sales tax:", err);
    throw err;
  }
};
const addSalesCustomerLoyaltyRecord = async (salesId, loyaltyData) => {
  try {
    const payload = {
      salesId: Number(salesId),
      loyaltyProgramId: Number(loyaltyData.loyaltyProgramId),
      pointsRedeemed: Number(loyaltyData.pointsRedeemed) || 0,
      loyaltyDiscount: Number(loyaltyData.loyaltyDiscount) || 0
    };

    console.log("Adding SalesCustomerLoyaltyRecord:", payload); // Debug log

    const res = await api.post("/SalesCustomerLoyaltyRecord", [payload]);
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (err) {
    console.error("Error adding sales customer loyalty record:", err);
    throw err;
  }
};


// Update SaleRecord
// Update SaleRecord - Fix the payload structure
const updateSale = async (saleId, saleData) => {
  try {
    // Create the payload that matches your backend schema
    const payload = {
      customerId: Number(saleData.customerId),
      locationId: Number(saleData.locationId),
      date: saleData.date,
      totalAmount: Number(saleData.totalAmount),
      grandTotal: Number(saleData.grandTotal),
      amountPaid: Number(saleData.amountPaid),
      change: Number(saleData.change),
      totalItems: Number(saleData.totalItems),
      transactionStatus: saleData.transactionStatus,
      paymentMethod: saleData.paymentMethod,
      paymentStatus: saleData.paymentStatus,
      shippingStatus: saleData.shippingStatus
    };

    console.log("Updating sale with payload:", payload); // Debug log

    const res = await api.put(`/SalesRecord/${saleId}`, payload);
    
    // Update local state
    setSales(prev => prev.map(s => s.salesId === saleId ? res.data : s));
    return res.data;
  } catch (err) {
    console.error("Error updating sale:", err);
    throw err;
  }
};
// Update ProductSaleRecords
const updateProductSaleRecords = async (salesId, records) => {
  try {
    for (const record of records) {
      await api.put(`/ProductSaleRecord/${record.productSaleRecordId}`, {
        salesId,
        productId: record.productId,
        quantity: record.quantity,
        unitPrice: record.unitPrice,
        priceAfterDiscount: record.priceAfterDiscount,
        totalAmount: record.totalAmount,
      });
    }
    console.log("✅ ProductSaleRecords updated successfully");
  } catch (error) {
    console.error("❌ Error updating product sale records:", error);
    throw error;
  }
};

// Update ProductSaleDiscounts
// Update ProductSaleDiscounts - Fix the payload structure
// Update ProductSaleDiscounts - backend expects single object per PUT
const updateProductSaleDiscounts = async (productDiscounts) => {
  if (!productDiscounts || productDiscounts.length === 0) {
    console.log("No product sale discounts to update.");
    return;
  }

  let errors = [];

  for (const discount of productDiscounts) {
    if (!discount.productSaleDiscountId) {
      console.warn(`Skipping discount update: Missing productSaleDiscountId for discount`, discount);
      continue;
    }

    const payload = {
      productSaleRecordId: Number(discount.productSaleRecordId) || 0,
      discountType: discount.discountType || "",
      discountAmount: Number(discount.discountAmount) || 0,
      discountPercentage: Number(discount.discountPercentage) || 0
    };

    // Remove discountId validation since it's not in the backend payload
    if (!payload.productSaleRecordId) {
      console.warn(`Invalid payload data for discount update, skipping:`, payload);
      continue;
    }

    try {
      console.log(`Updating ProductSaleDiscount ID ${discount.productSaleDiscountId} with payload:`, payload);
      const response = await api.put(`/ProductSaleDiscount/${discount.productSaleDiscountId}`, payload);
      console.log(`Response for discount ID ${discount.productSaleDiscountId}:`, response.data);
    } catch (error) {
      console.error(`Failed to update discount ID ${discount.productSaleDiscountId}:`, error);
      errors.push({ id: discount.productSaleDiscountId, error });
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors.map(e => `ID ${e.id}: ${e.error.message || e.error}`).join("; ");
    throw new Error(`Failed to update some ProductSaleDiscounts: ${errorMessages}`);
  }

  console.log("All ProductSaleDiscounts updated successfully");
};

// Update SalesDiscounts
// Update SalesDiscounts - backend expects single object per PUT
const updateSalesDiscounts = async (saleId, saleDiscounts) => {
  if (!saleDiscounts || saleDiscounts.length === 0) {
    console.log("No sales discounts to update.");
    return;
  }

  let errors = [];

  for (const discount of saleDiscounts) {
    if (!discount.salesDiscountId) {
      console.warn(`Skipping sales discount update: Missing salesDiscountId`, discount);
      continue;
    }

    const payload = {
      salesId: Number(saleId),
      // discountId: Number(discount.discountId) || 0,
      discountType: discount.discountType || "",
      discountAmount: Number(discount.discountAmount) || 0,
      discountPercentage: Number(discount.discountPercentage) || 0
    };

    // if (!payload.discountId) {
    //   console.warn(`Invalid payload data for sales discount update, skipping:`, payload);
    //   continue;
    // }

    try {
      console.log(`Updating SalesDiscount ID ${discount.salesDiscountId} with payload:`, payload);
      const response = await api.put(`/SalesDiscount/${discount.salesDiscountId}`, payload);
      console.log(`Response for sales discount ID ${discount.salesDiscountId}:`, response.data);
    } catch (error) {
      console.error(`Failed to update sales discount ID ${discount.salesDiscountId}:`, error);
      errors.push({ id: discount.salesDiscountId, error });
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors.map(e => `ID ${e.id}: ${e.error.message || e.error}`).join("; ");
    throw new Error(`Failed to update some SalesDiscounts: ${errorMessages}`);
  }

  console.log("All SalesDiscounts updated successfully");
};

// Update SalesTax
const updateSalesTax = async (saleId, taxes) => {
  try {
    // taxes = array of objects { salesTaxId, salesId, taxId }

    for (const tax of taxes) {
      if (!tax.salesTaxId) continue; // skip if not an existing record

      await api.put(`/SalesTax/${tax.salesTaxId}`, {
      
        salesId: saleId,
        taxId: tax.taxId
      });
    }

    console.log("✅ SalesTax records updated");
  } catch (err) {
    console.error("Error updating sales tax:", err);
    throw err;
  }
};
// Update SalesCustomerLoyaltyRecords
const updateSalesCustomerLoyaltyRecords = async (saleId,records) => {
  if (!records || records.length === 0) {
    console.log("No SalesCustomerLoyaltyRecords to update.");
    return;
  }

  let errors = [];

  for (const record of records) {
    if (!record.salesCustomerLoyaltyRecordId) {
      console.warn("Skipping update: Missing salesCustomerLoyaltyRecordId", record);
      continue;
    }

   const payload = {
  salesId: saleId,   // pass down from EditSales
  loyaltyProgramId: Number(record.loyaltyProgramId),
  pointsRedeemed: Number(record.pointsRedeemed) || 0,
  loyaltyDiscount: Number(record.loyaltyDiscount) || 0
};

    try {
      console.log(
        `Updating SalesCustomerLoyaltyRecord ID ${record.salesCustomerLoyaltyRecordId} with payload:`,
        payload
      );
      const response = await api.put(
        `/SalesCustomerLoyaltyRecord/${record.salesCustomerLoyaltyRecordId}`,
        payload
      );
      console.log("Payload being sent to API:", payload);
      console.log("✅ Update response:", response.data);
    } catch (error) {
      console.error(
        `❌ Failed to update SalesCustomerLoyaltyRecord ID ${record.salesCustomerLoyaltyRecordId}:`,
        error
      );
      errors.push({ id: record.salesCustomerLoyaltyRecordId, error });
    }
  }

  if (errors.length > 0) {
    const errorMessages = errors
      .map(e => `ID ${e.id}: ${e.error.message || e.error}`)
      .join("; ");
    throw new Error(
      `Failed to update some SalesCustomerLoyaltyRecords: ${errorMessages}`
    );
  }

  console.log("All SalesCustomerLoyaltyRecords updated successfully");
};

// Add to SalesContext after the existing functions
const deleteSale = async (salesId) => {
  try {
    await api.delete(`/SalesRecord/${salesId}`);
    console.log(`✅ SalesRecord ${salesId} deleted`);

    // Update local state
    setSales((prev) => prev.filter((sale) => sale.salesId !== salesId));

    return true;
  } catch (err) {
    console.error("Error deleting sale:", err);
    throw err;
  }
};
// Delete ProductSaleRecord
const deleteProductSaleRecord = async (productSaleRecordId) => {
  try {
    await api.delete(`/ProductSaleRecord/${productSaleRecordId}`);
    console.log(`✅ ProductSaleRecord ${productSaleRecordId} deleted`);
    return true;
  } catch (err) {
    console.error("Error deleting product sale record:", err);
    throw err;
  }
};

// Delete ProductSaleDiscount
const deleteProductSaleDiscount = async (productSaleDiscountId) => {
  try {
    await api.delete(`/ProductSaleDiscount/${productSaleDiscountId}`);
    console.log(`✅ ProductSaleDiscount ${productSaleDiscountId} deleted`);
    return true;
  } catch (err) {
    console.error("Error deleting product sale discount:", err);
    throw err;
  }
};

// Delete SalesDiscount
const deleteSalesDiscount = async (salesDiscountId) => {
  try {
    await api.delete(`/SalesDiscount/${salesDiscountId}`);
    console.log(`✅ SalesDiscount ${salesDiscountId} deleted`);
    return true;
  } catch (err) {
    console.error("Error deleting sales discount:", err);
    throw err;
  }
};

// Delete SalesTax
const deleteSalesTax = async (salesTaxId) => {
  try {
    await api.delete(`/SalesTax/${salesTaxId}`);
    console.log(`✅ SalesTax ${salesTaxId} deleted`);
    return true;
  } catch (err) {
    console.error("Error deleting sales tax:", err);
    throw err;
  }
};
// Add this function to your SalesContext after other delete functions
const deleteSalesCustomerLoyaltyRecord = async (salesCustomerLoyaltyRecordId) => {
  try {
    await api.delete(`/SalesCustomerLoyaltyRecord/${salesCustomerLoyaltyRecordId}`);
    console.log(`✅ SalesCustomerLoyaltyRecord ${salesCustomerLoyaltyRecordId} deleted`);
    return true;
  } catch (err) {
    console.error("Error deleting sales customer loyalty record:", err);
    throw err;
  }
};
const updateSalePayment = async (id, paymentData) => {
  try {
    const response = await api.patch(`/SalesRecord/${id}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating payment:", error);
    throw error;
  }
};

  return (
    <SalesContext.Provider
      value={{
          sales,
    fetchSales,
    customers,
    locations,
    transactionStatuses,
    paymentMethods,
    paymentStatuses,
    shippingStatuses,
    fetchDropdowns,
    addSale,
    products,
    searchProducts,
    addProductToSale,
    getSellingPrice ,
    getStockInfo,
        discountCodes,
  discountTypes,
  fetchDiscountCodes,
  fetchDiscountTypes,
  addDiscountToSale,
  fetchSaleDiscountTypes,
  salediscountTypes,
  addSaleDiscount,
  taxes,
  fetchTaxes,
  addSalesTax,
     fetchSaleById,
      fetchSaleProducts,
      fetchProductDiscounts,
      fetchSaleTaxes,
      fetchSaleDiscounts,
      updateSale,
updateProductSaleRecords,
updateProductSaleDiscounts,
updateSalesDiscounts,
updateSalesTax,
 deleteProductSaleRecord,
      deleteProductSaleDiscount,
      deleteSalesDiscount,
      deleteSalesTax,
        deleteSale,
         loyaltyPrograms,
      fetchLoyaltyPrograms,
       customerLoyaltyRecords,
      fetchCustomerLoyaltyRecords,
       addSalesCustomerLoyaltyRecord,
       fetchSalesCustomerLoyaltyRecords,
       updateSalesCustomerLoyaltyRecords,
       deleteSalesCustomerLoyaltyRecord,
       updateSalePayment
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => useContext(SalesContext);
