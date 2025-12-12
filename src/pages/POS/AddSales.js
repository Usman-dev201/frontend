import React, { useEffect, useState,useRef } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/POS/AddSales.css";
import { useNavigate } from "react-router-dom";
import { useSales } from "../../context/SalesContext";

export default function AddSales() {
  const {
    customers,
    locations,
    transactionStatuses,
    paymentMethods,
    paymentStatuses,
    shippingStatuses,
    fetchDropdowns,
    addSale,
    searchProducts,
    addProductToSale,
     products,
     getSellingPrice,
     getStockInfo,
      discountCodes,        // ✅ add
  discountTypes,        // ✅ add
 addDiscountToSale,
     salediscountTypes,
   addSaleDiscount,
taxes,
fetchTaxes,
addSalesTax,
loyaltyPrograms,
  fetchLoyaltyPrograms,
     customerLoyaltyRecords,
    fetchCustomerLoyaltyRecords ,
    addSalesCustomerLoyaltyRecord,
    addDiscountCoupons,
    fetchSalesReceipt,
    generatePrintableReceipt


  } = useSales();
useEffect(() => {
  fetchLoyaltyPrograms();
  fetchDropdowns();
 
}, [fetchDropdowns,fetchLoyaltyPrograms]);
const previousTotalAmountRef = useRef(0);
const navigate = useNavigate();
  const [form, setForm] = useState({
    customerId: "",
    locationId: "",
    date: new Date().toISOString().split("T")[0],
    
    amountPaid: 0,
  paymentDue: 0,
    transactionStatus: "Pending",
    paymentMethod: "",
    paymentStatus: "Unpaid",
    shippingStatus: "Pending",
   
  });

 useEffect(() => {
    if (form.customerId) {
      fetchCustomerLoyaltyRecords(form.customerId);
    } else {
      // Reset loyalty records when no customer is selected
      fetchCustomerLoyaltyRecords(null);
    }
  }, [form.customerId, fetchCustomerLoyaltyRecords]);


 const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({ ...prev, [name]: value }));

  if (name === "locationId") {
    setSelectedTaxes([]); // Reset to empty array instead of empty string
    fetchTaxes(value);
  }
  
  // If customer changes, fetch their loyalty records
  if (name === "customerId" && value) {
    fetchCustomerLoyaltyRecords(value);
  }
};

const [searchQuery, setSearchQuery] = useState("");
const [productsInTable, setProductsInTable] = useState([]);
const [discountsInTable, setDiscountsInTable] = useState([]);

const [saleDiscountsInTable, setSaleDiscountsInTable] = useState([]);
const [selectedTaxes, setSelectedTaxes] = useState([]);
const [showLocationInfo, setShowLocationInfo] = useState(false);
const [showTransactionInfo, setShowTransactionInfo] = useState(false);
const [showTaxInfo, setShowTaxInfo] = useState(false);
const [loyaltyProgramsInTable, setLoyaltyProgramsInTable] = useState([]);

const [discountCouponsInTable, setDiscountCouponsInTable] = useState([]);

const [receiptData, setReceiptData] = useState(null);
const [showReceiptPreview, setShowReceiptPreview] = useState(false);
const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

const handleCouponChange = (e) => {
  const discountId = e.target.value;
  const selectedCoupon = discountCodes.find(dc => dc.discountId === Number(discountId));

  if (!selectedCoupon) return;

  const alreadyExists = discountCouponsInTable.some(
    c => c.discountId === Number(discountId)
  );

  if (!alreadyExists) {
    setDiscountCouponsInTable(prev => [
      ...prev,
      {
        discountId: selectedCoupon.discountId,
        discountCode: selectedCoupon.discountCode,
        discountType: selectedCoupon.discountType,
        discountAmount: selectedCoupon.discountAmount,
        discountPercentage: selectedCoupon.discountPercentage,
        status: selectedCoupon.status 
      }
    ]);
  } else {
    alert("This discount coupon is already added.");
  }

  setForm(prev => ({ ...prev, discountCouponId: discountId }));
};
const handleDeleteCoupon = (index) => {
  const updated = [...discountCouponsInTable];
  updated.splice(index, 1);
  setDiscountCouponsInTable(updated);
};

  const getAvailableLoyaltyPrograms = () => {
    return loyaltyPrograms.map(lp => {
      // Find customer's record for this loyalty program
      const customerRecord = customerLoyaltyRecords.find(
        record => record.loyaltyProgramId === lp.loyaltyProgramId
      );
      
      return {
        ...lp,
        totalPointsEarned: customerRecord ? customerRecord.totalPointsEarned : 0,
        hasRecord: !!customerRecord
      };
    });
  };

  // Get loyalty programs with points information
  const availableLoyaltyPrograms = getAvailableLoyaltyPrograms();

  // Filter to only show programs where customer has points or all programs if you want
  const filteredLoyaltyPrograms = availableLoyaltyPrograms.filter(
    lp => lp.hasRecord && lp.totalPointsEarned > 0
  );
const handleSearch = async (query) => {
  setSearchQuery(query);
  await searchProducts(query); // context updates context.products
};

const handleAddProduct = async (product) => {
  if (productsInTable.some(p => p.productId === product.productId)) {
    alert(`⚠️ Product "${product.productName}" is already added to the table.`);
    return;
  }
  
  if (!form.locationId) {
    alert("Please select a location first!");
    return;
  }
  
  if (!form.customerId) {
    alert("Please select customer first!");
    return;
  }

  const stockInfo = await getStockInfo(product.productId, form.locationId);
  if (!stockInfo) {
    alert(`⚠️ Stock not found for ${product.productName} at selected location.`);
    return;
  }

  if (stockInfo.currentStock === 0) {
    alert(`⚠️ ${product.productName} is out of stock at this location.`);
    return;
  }

  const price = await getSellingPrice(product.productId, form.locationId);

  // Add product to products table
  setProductsInTable(prev => [
    ...prev,
    {
      ...product,
      quantity: 1,
      unitPrice: price,
      priceAfterDiscount: price,
      totalAmount: price * 1
    }
  ]);

  // Add empty discount entry to discounts table
  setDiscountsInTable(prev => [
    ...prev,
    {
      productId: product.productId,
      // discountCode: "",
      discountType: "",
      discountAmount: 0,
      discountPercentage: 0,
      discountId: null
    }
  ]);

  setSearchQuery("");
};
// 🔧 Helper to recalc product discounts
const applyProductDiscounts = (products, discounts) => {
  return products.map((p) => {
    const discount = discounts.find((d) => d.productId === p.productId);
    
    // If no discount found for this product, return original price
    if (!discount) {
      return {
        ...p,
        priceAfterDiscount: p.unitPrice, // Reset to original price
        totalAmount: p.unitPrice * p.quantity
      };
    }

    let discountedPrice = p.unitPrice;

    if (discount.discountAmount > 0) {
      discountedPrice = Math.max(0, p.unitPrice - discount.discountAmount);
    } else if (discount.discountPercentage > 0) {
      discountedPrice = p.unitPrice - (p.unitPrice * discount.discountPercentage) / 100;
    }

    return {
      ...p,
      priceAfterDiscount: discountedPrice,
      totalAmount: discountedPrice * p.quantity,
    };
  });
};
const handleSaleDiscountChange = (e) => {
  const { name, value } = e.target;

  // Update form state
  setForm(prev => ({ ...prev, [name]: value }));

  // Determine discountCode and discountType
  // const discountCode = name === "saleDiscountCode" ? value : form.saleDiscountCode;
  const discountType = name === "saleDiscountType" ? value : form.saleDiscountType;

  // Ignore if either is empty
  if ( !discountType) return;

  // Get discountId from discountCodes list
  // const discountId = discountCodes.find(dc => dc.discountCode === discountCode)?.discountId || null;

  // Check if this discount combination already exists in table
  const exists = saleDiscountsInTable.some(
    sd =>  sd.discountType === discountType
  );

  if (!exists) {
    // Add new row instead of replacing existing ones
    setSaleDiscountsInTable(prev => [
      ...prev,
      {
        // discountCode,
        discountType,
        discountAmount: 0,
        discountPercentage: 0,
        // discountId
      }
    ]);
  }
};
// 1️⃣ Update handleAddDiscount to only add the product (no discountCode/type yet)

const handleDiscountChange = (index, name, value) => {
  setDiscountsInTable(prev =>
    prev.map((d, i) => {
      if (i !== index) return d; // leave other rows unchanged

      if (name === "discountCode") {
        const selected = discountCodes.find(dc => dc.discountCode === value);
        return {
          ...d,
          discountCode: value,
          discountId: selected ? selected.discountId : null
        };
      } else if (name === "discountType") {
        return {
          ...d,
          discountType: value
        };
      }

      return {
        ...d,
        [name]: value
      };
    })
  );

  // Recalculate product prices
  setProductsInTable(prev => applyProductDiscounts(prev, discountsInTable));
};


const handleProductChange = async (index, value) => {
  const updated = [...productsInTable];
  const newQuantity = Number(value);

  const product = updated[index];

  if (!form.locationId) {
    alert("Please select a location first!");
    return;
  }

  // ✅ Fetch stock from backend
  const stockInfo = await getStockInfo(product.productId, form.locationId);

  if (stockInfo && newQuantity > stockInfo.currentStock) {
    alert(
      `⚠️ Not enough stock! Available: ${stockInfo.currentStock}, Requested: ${newQuantity}`
    );
    return; // prevent updating
  }

  // ✅ Safe to update
  product.quantity = newQuantity;
  product.totalAmount = newQuantity * product.priceAfterDiscount;
  updated[index] = product;

  setProductsInTable(updated);
};
 
const handleDeleteProduct = (index) => {
  const updated = [...productsInTable];
  updated.splice(index, 1);
  setProductsInTable(updated);
};
// ✅ Delete discount

const handleDeleteSaleDiscount = (index) => {
  const updated = [...saleDiscountsInTable];
  updated.splice(index, 1);
  setSaleDiscountsInTable(updated);
};

// Recalculate summary whenever products or amountPaid changes
// Recalculate summary whenever productsInTable or amountPaid changes
const calculateLoyaltyDiscount = (pointsRedeemed, loyaltyProgram, totalAmount) => {
  if (!loyaltyProgram || pointsRedeemed <= 0) return 0;

  // Add safety checks for the required properties
  const { valuePerPoint = 0, discountPercentagePerPoint = 0, redemptionType = '' } = loyaltyProgram;

  if (redemptionType === 'Fixed') {
    // Fixed value per point (e.g., 1 point = Rs 1)
    return pointsRedeemed * valuePerPoint;
  } else if (redemptionType === 'Percentage') {
    // Percentage discount based on points (e.g., 1 point = 0.1% discount)
    const discountPercentage = pointsRedeemed * discountPercentagePerPoint;
    return (totalAmount * discountPercentage) / 100;
  }
  
  return 0;
};

// Update the loyalty program selection handler
const handleLoyaltyProgramSelect = (e) => {
  const selectedProgramId = e.target.value;
  
  if (selectedProgramId) {
    const selectedProgram = loyaltyPrograms.find(
      lp => lp.loyaltyProgramId === Number(selectedProgramId)
    );
    const customerRecord = customerLoyaltyRecords.find(
      record => record.loyaltyProgramId === Number(selectedProgramId)
    );
    
    if (selectedProgram) {
      // Check if this program is already in the table
      const alreadyExists = loyaltyProgramsInTable.some(
        lp => lp.loyaltyProgramId === Number(selectedProgramId)
      );
      
      if (!alreadyExists) {
        // Add new row instead of replacing
        setLoyaltyProgramsInTable(prev => [
          ...prev,
          {
            loyaltyProgramId: selectedProgram.loyaltyProgramId,
            programName: selectedProgram.programName,
            availablePoints: customerRecord?.totalPointsEarned || 0,
            pointsRedeemed: 0,
            loyaltyDiscount: 0,
            redemptionType: selectedProgram.redemptionType,
            valuePerPoint: selectedProgram.valuePerPoint,
            discountPercentagePerPoint: selectedProgram.discountPercentagePerPoint
          }
        ]);
      } else {
        alert("This loyalty program is already added to the table.");
      }
    }
  }
  // Don't clear the form field so user can see their selection
  setForm(prev => ({ ...prev, loyaltyProgramId: selectedProgramId }));
};

// Update the points redeemed change handler
const handlePointsRedeemedChange = (index, points) => {
  const pointsValue = Number(points) || 0;
  const updated = [...loyaltyProgramsInTable];
  const program = updated[index];
  
  if (pointsValue <= program.availablePoints) {
    updated[index].pointsRedeemed = pointsValue;
    updated[index].loyaltyDiscount = calculateLoyaltyDiscount(
      pointsValue, 
      program, 
      form.totalAmount || 0
    );
    setLoyaltyProgramsInTable(updated);
  } else {
    alert(`Cannot redeem more than ${program.availablePoints} points`);
  }
};

useEffect(() => {
  if (loyaltyProgramsInTable.length > 0 && form.totalAmount !== previousTotalAmountRef.current) {
    const hasPointsRedeemed = loyaltyProgramsInTable.some(lp => lp.pointsRedeemed > 0);
    if (hasPointsRedeemed) {
      const updated = loyaltyProgramsInTable.map(lp => ({
        ...lp,
        loyaltyDiscount: lp.pointsRedeemed > 0 
          ? calculateLoyaltyDiscount(lp.pointsRedeemed, lp, form.totalAmount || 0)
          : lp.loyaltyDiscount
      }));
      setLoyaltyProgramsInTable(updated);
    }
    previousTotalAmountRef.current = form.totalAmount;
  }
}, [form.totalAmount, loyaltyProgramsInTable]); // Now we can safely include both
// Update the summary calculation to include loyalty discount
useEffect(() => {
  const totalAmount = productsInTable.reduce(
    (sum, p) => sum + (p.priceAfterDiscount * p.quantity || 0),
    0
  );

  const totalItems = productsInTable.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  // Add sale discounts
  const totalSaleDiscount = saleDiscountsInTable.reduce((sum, sd) => {
    if (sd.discountAmount) return sum + sd.discountAmount;
    if (sd.discountPercentage) return sum + (totalAmount * sd.discountPercentage) / 100;
    return sum;
  }, 0);

  // Add loyalty discount
  const totalLoyaltyDiscount = loyaltyProgramsInTable.reduce(
    (sum, lp) => sum + (lp.loyaltyDiscount || 0), 
    0
  );

  // 🔧 FIX: Calculate tax amount properly
  const taxAmount = selectedTaxes ? (() => {
    const selectedTax = taxes.find(t => t.taxId === Number(selectedTaxes));
    return selectedTax ? (totalAmount * selectedTax.taxPercentage) / 100 : 0;
  })() : 0;

const totalCouponDiscount = discountCouponsInTable.reduce((sum, dc) => {
  if (dc.discountAmount) return sum + dc.discountAmount;
  if (dc.discountPercentage) return sum + (totalAmount * dc.discountPercentage) / 100;
  return sum;
}, 0);

const grandTotal = totalAmount - totalSaleDiscount - totalLoyaltyDiscount - totalCouponDiscount + taxAmount;


  const change = form.amountPaid - grandTotal;
const paymentDue = form.amountPaid < grandTotal ? grandTotal - form.amountPaid : 0;
  setForm(prev => ({
    ...prev,
    totalAmount,
    grandTotal,
    totalItems,
    change: change > 0 ? change : 0,
     paymentDue: paymentDue 
  }));
}, [productsInTable, saleDiscountsInTable, loyaltyProgramsInTable, discountCouponsInTable, form.amountPaid, selectedTaxes, taxes]);

// Function to preview receipt
const handlePreviewReceipt = async (salesId) => {
  try {
    setIsGeneratingReceipt(true);
    const receipt = await fetchSalesReceipt(salesId);
    setReceiptData(receipt);
    setShowReceiptPreview(true);
  } catch (err) {
    console.error("Error fetching receipt:", err);
    alert("Failed to fetch receipt data");
  } finally {
    setIsGeneratingReceipt(false);
  }
};

// Function to print receipt
const handlePrintReceipt = async () => {
  if (!receiptData) return;
  generatePrintableReceipt(receiptData);
};

// Function to close receipt preview
const closeReceiptPreview = () => {
  setShowReceiptPreview(false);
  setReceiptData(null);
};
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ Create the Sale
    const sale = await addSale(form); // returns { salesId, ... }

    const lowStockWarnings = [];

    // 2️⃣ Add products
    for (const product of productsInTable) {
      const createdRecord = await addProductToSale(sale.salesId, product);

      // Check stock if location is set
      if (form.locationId) {
        const stockInfo = await getStockInfo(product.productId, form.locationId);
        if (stockInfo) {
          const { currentStock, quantityAlert } = stockInfo;
          const updatedStock = currentStock - product.quantity;
          if (updatedStock <= quantityAlert) {
            lowStockWarnings.push(
              `⚠️ ${product.productName}: Current stock = ${currentStock}, Sale = ${product.quantity}, Remaining = ${updatedStock}, Alert Level = ${quantityAlert}`
            );
          }
        }
      }

      // Add discount for product if exists
      const discount = discountsInTable.find(d => d.productId === product.productId);
      if (discount) {
        const productSaleRecordId = createdRecord.productSaleRecordId; // ✅ use real ID
        await addDiscountToSale(productSaleRecordId, discount);
      }
    }

    // Show low stock warnings after all products are added (warn only, do not stop execution)
    if (lowStockWarnings.length > 0) {
      alert("Low Stock Warning:\n\n" + lowStockWarnings.join("\n"));
    }

    // 3️⃣ Add Sale Discounts
    for (const sd of saleDiscountsInTable) {
      await addSaleDiscount(sale.salesId, sd);
    }
      // 4️⃣ Add Discount Coupons
    if (discountCouponsInTable && discountCouponsInTable.length > 0) {
      await addDiscountCoupons(sale.salesId, discountCouponsInTable);
    }


    // 4️⃣ Add Loyalty Records
    for (const lp of loyaltyProgramsInTable) {
      if (lp.pointsRedeemed > 0 || lp.loyaltyDiscount > 0) {
        await addSalesCustomerLoyaltyRecord(sale.salesId, {
          loyaltyProgramId: lp.loyaltyProgramId,
          pointsRedeemed: lp.pointsRedeemed,
          loyaltyDiscount: lp.loyaltyDiscount
        });
      }
    }

    // 5️⃣ Add Taxes
    if (selectedTaxes && selectedTaxes.length > 0) {
      const validTaxIds = selectedTaxes
        .filter(taxId => taxId && taxId !== "0" && !isNaN(Number(taxId)))
        .map(taxId => Number(taxId));

      if (validTaxIds.length > 0) {
        await addSalesTax(sale.salesId, validTaxIds);
      }
    }

     const shouldShowReceipt = window.confirm(
      "✅ Sale added successfully!\n\nWould you like to view the receipt?"
    );
    
    if (shouldShowReceipt) {
      await handlePreviewReceipt(sale.salesId);
    } else {
      navigate("/sales/list");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add sale.");
  }
};

  return (
    <div className="sales-page">
      <Topbar />
      <Sidebar />
      <div className="sales-container">
        <div className="sales-header">
          <h2>Add Sales</h2>
        </div>

      <form className="sales-form" onSubmit={handleSubmit}>
  {/* Details Box */}
  <div className="details-box">

    <div className="details-grid">
      <div className="saleform-group">
        <label>Customer</label>
        <select
          name="customerId"
          value={form.customerId}
          onChange={handleChange}
          className="saleform-select"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.customerId} value={c.customerId}>
              {c.customerName}
            </option>
          ))}
        </select>
      </div>

   <div className="saleform-group">
  <label>
    Location{" "}
    <span
      className="info-icon"
      onMouseEnter={() => setShowLocationInfo(true)}
      onMouseLeave={() => setShowLocationInfo(false)}
    >
      ?
    </span>

    {showLocationInfo && (
      <div className="info-popup">
        <div>
    ⚠️ <b>Note:</b> After adding a purchase with status{" "}
            <b>Completed</b> or <b>Cancelled</b>,
          </div>
          <div>you will not be able to update the Location again.</div>
         
      </div>
    )}
  </label>

  <select
    name="locationId"
    value={form.locationId}
    onChange={handleChange}
    className="saleform-select"
  >
    <option value="">Select Location</option>
    {locations.map((l) => (
      <option key={l.locationId} value={l.locationId}>
        {l.locationName}
      </option>
    ))}
  </select>
</div>


      <div className="saleform-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="saleform-input"
        />
      </div>

      <div className="saleform-group">
        <label>
  Transaction Status{" "}
  <span
    className="info-icon"
    onMouseEnter={() => setShowTransactionInfo(true)}
    onMouseLeave={() => setShowTransactionInfo(false)}
  >
    ?
  </span>

  {showTransactionInfo && (
    <div className="info-popup">
      ⚠️ <b>Note:</b> Once set to <b>Completed</b> or <b>Cancelled</b>, the
      transaction cannot be edited.
    </div>
  )}
</label>

        <select
          name="transactionStatus"
          value={form.transactionStatus}
          onChange={handleChange}
          className="saleform-select"
        >
          <option value="">Select Status</option>
          {transactionStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="saleform-group">
        <label>Payment Method</label>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="saleform-select"
        >
          <option value="">Select Payment Method</option>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="saleform-group">
        <label>Payment Status</label>
        <select
          name="paymentStatus"
          value={form.paymentStatus}
          onChange={handleChange}
          className="saleform-select"
        >
          <option value="">Select Payment Status</option>
          {paymentStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="saleform-group">
        <label>Shipping Status</label>
        <select
          name="shippingStatus"
          value={form.shippingStatus}
          onChange={handleChange}
          className="saleform-select"
        >
          <option value="">Select Shipping Status</option>
          {shippingStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>

{/* Product Search & Table */}
<div className="product-box">
  <h3>Products</h3>

  {/* Search bar */}
  <div className="saleform-group">
    <input
      type="text"
      placeholder="Search Product by Name or SKU"
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="saleform-input"
    />
  </div>
 {/* Search Results */}
{products.length > 0 && (
  <ul className="search-results">
    {products.map((p) => (
      <li key={p.productId} onClick={() => handleAddProduct(p)}>
        {p.productName}
      </li>
    ))}
  </ul>
)}
  {/* Product Table */}
  <table className="sale-product-table">
    <thead>
      <tr>
        <th>Product Name</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Price After Discount</th>
        <th>Total Amount</th>
         {/* <th>Discount Code</th> */}
      <th>Discount Type</th>
      <th>Discount Amount</th>
      <th>Discount Percentage</th>
        <th>Action</th>
      </tr>
    </thead>
   <tbody>
  {productsInTable.map((p, index) => {
    // Find the corresponding discount for this product
    const productDiscount = discountsInTable.find(
      d => d.productId === p.productId
    ) || {
      // discountCode: "",
      discountType: "",
      discountAmount: 0,
      discountPercentage: 0,
      discountId: null
    };

    return (
      <tr key={index}>
        <td>{p.productName}</td>
        <td>
          <input
            type="number"
            value={p.quantity}
            onChange={(e) => handleProductChange(index, e.target.value)}
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={p.unitPrice}
            readOnly
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={p.priceAfterDiscount}
            readOnly
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={p.totalAmount}
            readOnly
            className="saleform-input"
          />
        </td>
        {/* <td>
          <select
            value={productDiscount.discountCode || ""}
            onChange={(e) => handleDiscountChange(index, "discountCode", e.target.value)}
            className="form-select"
          >
            <option value="">Select Discount Code</option>
            {discountCodes.map((dc, idx) => (
              <option key={idx} value={dc.discountCode}>{dc.discountCode}</option>
            ))}
          </select>
        </td> */}
        <td>
          <select
            value={productDiscount.discountType || ""}
            onChange={(e) => handleDiscountChange(index, "discountType", e.target.value)}
            className="saleform-select"
          >
            <option value="">Select Discount Type</option>
            {discountTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="number"
            value={productDiscount.discountAmount || 0}
            onChange={(e) => {
              const updated = [...discountsInTable];
              const discountIndex = updated.findIndex(d => d.productId === p.productId);
              
              if (discountIndex !== -1) {
                updated[discountIndex].discountAmount = Number(e.target.value);
                updated[discountIndex].discountPercentage = 0; // reset percentage
                setDiscountsInTable(updated);
                setProductsInTable(prev => applyProductDiscounts(prev, updated));
              }
            }}
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={productDiscount.discountPercentage || 0}
            onChange={(e) => {
              const updated = [...discountsInTable];
              const discountIndex = updated.findIndex(d => d.productId === p.productId);
              
              if (discountIndex !== -1) {
                updated[discountIndex].discountPercentage = Number(e.target.value);
                updated[discountIndex].discountAmount = 0; // reset amount
                setDiscountsInTable(updated);
                setProductsInTable(prev => applyProductDiscounts(prev, updated));
              }
            }}
            className="saleform-input"
          />
        </td>
        <td>
          <button type="button" onClick={() => handleDeleteProduct(index)} className="btn btn-danger">
            Delete
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
  </table>
</div>

{/* Loyalty Program Box */}
<div className="sale-discount-box">
  <h3>Loyalty Program</h3>
  
  {/* Loyalty Program Selection */}
  <div className="details-grid">
  <div className="saleform-group">
    <label>Select Loyalty Program</label>
 <select
        value={form.loyaltyProgramId || ""}
        onChange={handleLoyaltyProgramSelect}
        className="saleform-select"
        disabled={!form.customerId}
      >
        <option value="">
          {form.customerId 
            ? "Select Loyalty Program" 
            : "Select Customer First"
          }
        </option>
        
        {/* Section 1: Programs with available points */}
        {filteredLoyaltyPrograms.length > 0 && (
          <optgroup >
            {filteredLoyaltyPrograms.map((lp) => {
              // const isAlreadyAdded = loyaltyProgramsInTable.some(
              //   tableLp => tableLp.loyaltyProgramId === lp.loyaltyProgramId
              // );
              
              return (
                <option 
                  key={lp.loyaltyProgramId} 
                  value={lp.loyaltyProgramId}
                
                  
                >
                  {lp.programName} - {lp.totalPointsEarned} points available
                {lp.status && ` (${lp.status})`}
                  {lp.redemptionType === 'Fixed' && ` (${lp.valuePerPoint} Rs/point)`}
                  {lp.redemptionType === 'Percentage' && ` (${lp.discountPercentagePerPoint}%/point)`}
               
                </option>
              );
            })}
          </optgroup>
        )}
        
        {/* Section 2: All other programs */}
        {availableLoyaltyPrograms.filter(lp => 
          !filteredLoyaltyPrograms.some(filtered => filtered.loyaltyProgramId === lp.loyaltyProgramId)
        ).length > 0 && (
          <optgroup >
            {availableLoyaltyPrograms
              .filter(lp => 
                !filteredLoyaltyPrograms.some(filtered => filtered.loyaltyProgramId === lp.loyaltyProgramId)
              )
              .map((lp) => {
                const isAlreadyAdded = loyaltyProgramsInTable.some(
                  tableLp => tableLp.loyaltyProgramId === lp.loyaltyProgramId
                );
                
                return (
                  <option 
                    key={lp.loyaltyProgramId} 
                    value={lp.loyaltyProgramId}
                    disabled={isAlreadyAdded || !lp.hasRecord}
                    
                  >
                    {lp.programName}
                    {lp.hasRecord && ` - ${lp.totalPointsEarned} points`}
                    {!lp.hasRecord && " - No points available"}
                      {lp.status && ` (${lp.status})`}
                    {lp.redemptionType === 'Fixed' && lp.hasRecord && ` (${lp.valuePerPoint} Rs/point)`}
                    {lp.redemptionType === 'Percentage' && lp.hasRecord && ` (${lp.discountPercentagePerPoint}%/point)`}
                    {isAlreadyAdded && " - Already Added"}
                  </option>
                );
              })}
          </optgroup>
        )}
        
        {/* Fallback message if no programs available */}
        {form.customerId && availableLoyaltyPrograms.length === 0 && (
          <option value="" disabled>
            No loyalty programs available for this customer
          </option>
        )}
      </select>
      
    
    {form.customerId && filteredLoyaltyPrograms.length === 0 && (
      <small className="text-muted">
        No loyalty programs with points available for this customer
      </small>
    )}
  </div>
</div>

  {/* Loyalty Program Table */}
 <table className="discount-table">
  <thead>
    <tr>
      <th>Loyalty Program</th>
      <th>Available Points</th>
      <th>Points Redeemed</th>
      <th>Loyalty Discount (Rs)</th>
  
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {loyaltyProgramsInTable.map((lp, index) => (
      <tr key={index}>
        <td>{lp.programName}</td>
        <td>{lp.availablePoints}</td>
        <td>
          <input
            type="number"
            value={lp.pointsRedeemed}
            onChange={(e) => handlePointsRedeemedChange(index, e.target.value)}
            max={lp.availablePoints}
            min="0"
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={lp.loyaltyDiscount.toFixed(2)}
            readOnly
            className="saleform-input"
          />
        </td>
     
        <td>
          <button
            type="button"
            onClick={() => {
              setLoyaltyProgramsInTable([]);
              setForm(prev => ({ ...prev, loyaltyProgramId: "" }));
            }}
            className="btn btn-danger"
          >
           Delete
          </button>
        </td>
      </tr>
    ))}
    {loyaltyProgramsInTable.length === 0 && (
      <tr>
        <td colSpan="6" style={{ textAlign: "center", color: "#888" }}>
          No Loyalty Program Selected
        </td>
      </tr>
    )}
  </tbody>
</table>
</div>
{/* Discount Coupon Selection in Box */}
{/* Discount Coupon Selection in Box */}
<div className="sale-discount-box">
  <h3>Discount Coupons</h3>

  <div className="details-grid">
    {/* Select Discount Coupon */}
    <div className="saleform-group">
      <label>Select Discount Coupon</label>
      <select
        name="discountCouponId"
        className="saleform-select"
        value={form.discountCouponId || ""}
        onChange={handleCouponChange}
      >
        <option value="">
          {discountCodes && discountCodes.filter(dc => dc.status === "Active").length > 0
            ? "Select Discount Coupon"
            : "No Active Discount Coupons Available"}
        </option>

        {discountCodes && discountCodes
          .filter(dc => dc.status === "Active") // ✅ only active
          .map((dc) => {
            const discountType = dc.discountAmount > 0
              ? "Fixed"
              : dc.discountPercentage > 0
                ? "Percentage"
                : "None";

            return (
              <option key={dc.discountId} value={dc.discountId}>
                {dc.discountCode}
                {discountType === "Fixed" && ` (${dc.discountAmount} Rs)`}
                {discountType === "Percentage" && ` (${dc.discountPercentage}%)`}
              </option>
            );
          })}
      </select>
    </div>
  </div>

  {/* Discount Coupon Table */}
  <table className="discount-table">
    <thead>
      <tr>
        <th>Discount Code</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {discountCouponsInTable.length > 0 ? (
        discountCouponsInTable
          .filter(dc => dc.status === "Active") // ✅ only active in table
          .map((dc, index) => {
            const discountType = dc.discountAmount > 0
              ? "Fixed"
              : dc.discountPercentage > 0
                ? "Percentage"
                : "None";

            return (
              <tr key={index}>
                <td>
                  {dc.discountCode}
                  {discountType === "Fixed" && ` (${dc.discountAmount} Rs)`}
                  {discountType === "Percentage" && ` (${dc.discountPercentage}%)`}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteCoupon(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })
      ) : (
        <tr>
          <td colSpan="2" style={{ textAlign: "center", color: "#777" }}>
            No Active discount coupon added
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


{/* Sale Discount Box */}
<div className="sale-discount-box">
  <h3>Sale Discount</h3>
  <div className="details-grid">
    {/* Discount Code Dropdown */}
    {/* <div className="form-group">
      <label>Discount Code</label>
      <select
        name="saleDiscountCode"
        value={form.saleDiscountCode || ""}
        onChange={handleSaleDiscountChange } // reuse handler
        className="form-select"
      >
        <option value="">Select Discount Code</option>
        {discountCodes.map((d, index) => (
          <option key={index} value={d.discountCode}>
            {d.discountCode}
          </option>
        ))}
      </select>
    </div> */}

    {/* Discount Type Dropdown */}
    <div className="saleform-group">
      <label>Discount Type</label>
      <select
        name="saleDiscountType"
        value={form.saleDiscountType || ""}
        onChange={handleSaleDiscountChange } // reuse handler
        className="saleform-select"
      >
        <option value="">Select Discount Type</option>
        {salediscountTypes?.map((t, index) => (
          <option key={index} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
 
  </div>
  <table className="discount-table">
  <thead>
    <tr>
      {/* <th>Discount Code</th> */}
      <th>Discount Type</th>
      <th>Discount Amount</th>
      <th>Discount Percentage</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {saleDiscountsInTable.map((sd, index) => (
      <tr key={index}>
        {/* <td>{sd.discountCode}</td> */}
        <td>{sd.discountType}</td>
        <td>
          <input
            type="number"
            value={sd.discountAmount}
            onChange={(e) => {
              const updated = [...saleDiscountsInTable];
              updated[index].discountAmount = Number(e.target.value);
              setSaleDiscountsInTable(updated);
            }}
            className="saleform-input"
          />
        </td>
        <td>
          <input
            type="number"
            value={sd.discountPercentage}
            onChange={(e) => {
              const updated = [...saleDiscountsInTable];
              updated[index].discountPercentage = Number(e.target.value);
              setSaleDiscountsInTable(updated);
            }}
            className="saleform-input"
          />
        </td>
        <td>
          <button
            type="button"
            onClick={() => handleDeleteSaleDiscount(index)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

</div>
{/* Tax Box */}
{/* Tax Box */}
<div className="tax-box">
  <h3>Applicable Taxes</h3>
  <div className="saleform-group">
    <label>
      Tax Name{" "}
      <span
        className="info-icon"
        onMouseEnter={() => setShowTaxInfo(true)}
        onMouseLeave={() => setShowTaxInfo(false)}
      >
        ?
      </span>
      {showTaxInfo && (
        <div className="info-popup">
          💡 You can select multiple taxes for this sale
        </div>
      )}
    </label>
    {/* Enable multiple selection */}
    <select
      name="selectedTax"
      value="" // Keep empty for new selections
      onChange={(e) => {
        const newTaxId = e.target.value;
        if (newTaxId && !selectedTaxes.includes(newTaxId)) {
          setSelectedTaxes(prev => [...prev, newTaxId]);
        }
      }}
      className="saleform-select"
      disabled={!form.locationId}
    >
      <option value="">
        {form.locationId ? "Select Tax to Add" : "Select Location First"}
      </option>
      {taxes.map((t) => (
        <option key={t.taxLocationId} value={t.taxId}>
          {t.taxName} ({t.taxPercentage}%)
        </option>
      ))}
    </select>

    {form.locationId && taxes.length === 0 && (
      <small className="text-muted">No taxes found for this location</small>
    )}
  </div>

  {/* Updated Tax Table for Multiple Taxes */}
  {selectedTaxes.length > 0 && (
    <table className="tax-table">
      <thead>
        <tr>
          <th>Tax Name</th>
          <th>Tax Percentage</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {selectedTaxes.map((taxId) => {
          const tax = taxes.find(t => t.taxId === Number(taxId));
          return tax ? (
            <tr key={tax.taxLocationId}>
              <td>{tax.taxName}</td>
              <td>{tax.taxPercentage}%</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTaxes(prev => prev.filter(id => id !== taxId));
                  }}
                  className="btn btn-danger"
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          ) : null;
        })}
      </tbody>
    </table>
  )}
</div>


  {/* Summary Box for numbers */}
   <div className="summary-box">
          <h3>Sale Summary</h3>
          
          <div className="summary-content">
            <div className="summary-item">
              <span>Subtotal ({form.totalItems || 0} items):</span>
              <span>Rs {form.totalAmount || 0}</span>
            </div>
            
            {saleDiscountsInTable.length > 0 && (
              <div className="summary-item discount">
                <span>Discounts:</span>
                <span>-Rs {saleDiscountsInTable.reduce((sum, sd) => {
                  if (sd.discountAmount) return sum + sd.discountAmount;
                  if (sd.discountPercentage) return sum + (form.totalAmount * sd.discountPercentage) / 100;
                  return sum;
                }, 0)}</span>
              </div>
            )}
              {loyaltyProgramsInTable.length > 0 && (
      <div className="summary-item loyalty-discount">
        <span>Loyalty Discount:</span>
        <span>-Rs {loyaltyProgramsInTable.reduce((sum, lp) => sum + (lp.loyaltyDiscount || 0), 0)}</span>
      </div>
    )}
       {/* Discount Coupons */}
    {discountCouponsInTable.length > 0 && (
      <div className="summary-item discount">
        <span>Coupon Discounts:</span>
        <span>-Rs {discountCouponsInTable.reduce((sum, dc) => {
          if (dc.discountAmount) return sum + dc.discountAmount;
          if (dc.discountPercentage) return sum + (form.totalAmount * dc.discountPercentage) / 100;
          return sum;
        }, 0)}</span>
      </div>
    )}
           {selectedTaxes.length > 0 && (
  <div className="summary-item tax">
    <span>Taxes:</span>
    <span>+Rs {(() => {
      return selectedTaxes.reduce((sum, taxId) => {
        const tax = taxes.find(t => t.taxId === Number(taxId));
        return tax ? sum + (form.totalAmount * tax.taxPercentage) / 100 : sum;
      }, 0);
    })()}</span>
  </div>
)}
            <hr className="summary-divider" />
            
            <div className="summary-item grand-total">
              <span>Grand Total:</span>
              <span>Rs {form.grandTotal || 0}</span>
            </div>
          </div>
          
          <div className="payment-section">
            <div className="payment-group">
              <label>Amount Paid</label>
              <input
                type="number"
                name="amountPaid"
                value={form.amountPaid}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="payment-input"
              />
            </div>

           <div className="payment-group">
  <label className="payment-due-label">Change</label>
  <input
    type="number"
    value={
      (form.amountPaid || 0) > (form.grandTotal || 0)
        ? (form.amountPaid || 0) - (form.grandTotal || 0)
        : 0
    }
    readOnly
    className="payment-input due"
  />
</div>
 <div className="payment-group">
    <label className="payment-due-label">Payment Due</label>
    <input
      type="number"
      value={form.paymentDue || 0}
      readOnly
      className="payment-input due"
    />
  </div>

          </div>
        </div>
  <button type="submit" className="btn btn-primary">
    Add Sale
  </button>
</form>
{/* Receipt Preview Modal */}
{/* Receipt Preview Modal */}
{showReceiptPreview && receiptData && (
  <div className="modal-overlay" onClick={closeReceiptPreview}>
    <div className="modal-content receipt-preview" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Sales Receipt Preview</h3>
        <button onClick={closeReceiptPreview} className="close-btn">&times;</button>
      </div>

      <div className="receipt-content">
        {/* Receipt Header */}
        <div className="receipt-header-preview">
          <h4>YOUR STORE</h4>
          <p className="receipt-title">SALES RECEIPT</p>
        </div>

        {/* Receipt Info */}
        <div className="receipt-info-preview">
          <div className="info-row">
            <span className="info-label">Invoice #:</span>
            <span className="info-value">{receiptData.salesId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span className="info-value">{receiptData.date}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Time:</span>
            <span className="info-value">{receiptData.time}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Customer:</span>
            <span className="info-value">{receiptData.customerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">{receiptData.locationName}</span>
          </div>
        </div>

        <hr className="receipt-divider" />

        {/* Items Table */}
        <div className="receipt-items-section">
          <h4>Items Purchased</h4>
          <table className="receipt-items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>Rs {item.unitPrice.toFixed(2)}</td>
                  <td>Rs {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="receipt-divider" />

        {/* Summary Section */}
        <div className="receipt-summary-preview">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>Rs {receiptData.subtotal.toFixed(2)}</span>
          </div>

          {/* Sales Discounts */}
          {receiptData.saleDiscounts.map((d, index) => (
            <div className="summary-row" key={`sd-${index}`}>
              <span>Sales Discount:</span>
              <span>
                {d.discountType === 'Fixed'
                  ? `-Rs ${d.discountAmount.toFixed(2)}`
                  : `-${d.discountPercentage}%`}
              </span>
            </div>
          ))}

          {/* Discount Coupons */}
          {receiptData.discountCoupons.map((dc, index) => (
            <div className="summary-row" key={`dc-${index}`}>
              <span>Discount Coupon: ({dc.discountCode})</span>
              <span>
                {dc.discountType === 'Fixed'
                  ? `-Rs ${dc.discountAmount.toFixed(2)}`
                  : `-${dc.discountPercentage}%`}
              </span>
            </div>
          ))}

          {/* Loyalty Discount */}
          {receiptData.loyalty && (
            <div className="summary-row">
              <span>Loyalty Discount ({receiptData.loyalty.programName || 'Program'} - Points: {receiptData.loyalty.pointsRedeemed})</span>
              <span>-Rs {receiptData.loyalty.loyaltyDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Sales Taxes */}
          {receiptData.saleTaxes.map((t, index) => (
            <div className="summary-row" key={`tax-${index}`}>
              <span>Sales Tax ({t.taxName} {t.taxPercentage}%):</span>
              <span>+Rs {(receiptData.subtotal * t.taxPercentage / 100).toFixed(2)}</span>
            </div>
          ))}

          <div className="summary-row grand-total">
            <span>Grand Total:</span>
            <span>Rs {receiptData.grandTotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Amount Paid:</span>
            <span>Rs {receiptData.amountPaid.toFixed(2)}</span>
          </div>

          {receiptData.change > 0 && (
            <div className="summary-row">
              <span>Change:</span>
              <span>Rs {receiptData.change.toFixed(2)}</span>
            </div>
          )}

          {receiptData.paymentDue > 0 && (
            <div className="summary-row">
              <span>Payment Due:</span>
              <span>Rs {receiptData.paymentDue.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button
            onClick={handlePrintReceipt}
            className="btn btn-primary"
            disabled={isGeneratingReceipt}
          >
            {isGeneratingReceipt ? 'Generating...' : '🖨️ Print Receipt'}
          </button>
          <button
            onClick={() => {
              closeReceiptPreview();
              navigate("/sales/list");
            }}
            className="btn btn-secondary"
          >
            Back to Sales List
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
