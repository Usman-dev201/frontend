import React, { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/POS/AddSaleExchange.css";
import { useSaleExchange } from "../../context/SaleExchangeContext";
import { useNavigate ,useParams} from "react-router-dom"; 
import { FaTrash } from "react-icons/fa";

export default function AddSaleExchange() {
  const {
    addSaleExchange,
    salesIds,
    exchangeStatuses,
    paymentStatuses,
    exchangeTypes,
    refundStatuses,
    fetchDropdowns,
searchProductsInStock,
    searchProducts,
    loading,
      fetchSaleAdjustments,
        saleAdjustments,
        addSalesExchangeItems,
        
  } = useSaleExchange();
  const navigate = useNavigate();
  const { saleId } = useParams();
  const [formData, setFormData] = useState({
    salesId: saleId || "",
     date: new Date().toISOString().split("T")[0],
    exchangeStatus: "Pending",
    paymentStatus: "Unpaid",
    exchangeType: "",
    refundStatus: "",
     exchangeReason: "", 
      grandTotal: "",
  amountExchanged: "",
  paymentDue: "",
  refundAmount: ""
  });
// ✅ State for product search
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]); // store live search results
const [productsInTable, setProductsInTable] = useState([]);
const [showExchangeInfo, setShowExchangeInfo] = useState(false);
const [showGrandTotalInfo, setShowGrandTotalInfo] = useState(false);
const [showAmountExchangeInfo, setShowAmountExchangeInfo] = useState(false);
// Track whether the next product should be added as Exchange Product
const [shownDiscountAlert, setShownDiscountAlert] = useState(false);
const [shownLoyaltyAlert, setShownLoyaltyAlert] = useState(false);
const [shownTaxAlert, setShownTaxAlert] = useState(false);
const [shownCouponAlert, setShownCouponAlert] = useState(false);

const [nextIsExchange, setNextIsExchange] = useState(false);
const [selectedLocationId, setSelectedLocationId] = useState(null);
useEffect(() => {
  if (formData.salesId) {
    fetchSaleAdjustments(formData.salesId);
  }
}, [formData.salesId, fetchSaleAdjustments]);

console.log("Applied Discounts", saleAdjustments.discounts);
console.log("Applied Loyalty", saleAdjustments.loyalty);
console.log("Applied Taxes", saleAdjustments.taxes);
  const handleSalesChange = (e) => {
    const salesId = e.target.value;
    handleChange(e);

    // Find sale record to get location
    const saleRecord = salesIds.find(s => s.salesId === parseInt(salesId));
    if (saleRecord) setSelectedLocationId(saleRecord.locationId);
  };


  useEffect(() => {
    fetchDropdowns(); // load all dropdowns on mount
    
    // If saleId is provided in URL, automatically select it and fetch adjustments
    if (saleId) {
      // Find sale record to get location
      const saleRecord = salesIds.find(s => s.salesId === parseInt(saleId));
      if (saleRecord) {
        setSelectedLocationId(saleRecord.locationId);
        fetchSaleAdjustments(saleId);
      }
    }
  }, [fetchDropdowns, saleId, salesIds, fetchSaleAdjustments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  

const handleSearch = async (query) => {
  setSearchQuery(query);

  if (query.trim().length <= 1) {
    setSearchResults([]);
    return;
  }

  if (!formData.salesId) {
    alert("⚠️ Please select a Sales ID before searching products.");
    return;
  }

  try {
    let results = [];

    if (nextIsExchange && productsInTable.length > 0) {
      const lastOriginal = productsInTable[productsInTable.length - 1];
      const lastOriginalQty = lastOriginal.originalQuantity || 0;

      if (!selectedLocationId) {
        alert("⚠️ Location not found for this sale.");
        return;
      }

      results = await searchProductsInStock(
        query,
        selectedLocationId,
        parseInt(formData.salesId),
        lastOriginalQty,
        lastOriginal.originalProductId,
        null // newProductId will be determined when adding
      );
    } else {
      results = await searchProducts(query, formData.salesId);
    }

    setSearchResults(Array.isArray(results) ? results : []);
  } catch (error) {
    console.error("Search error:", error);
    alert("⚠️ Failed to search products. Please try again.");
    setSearchResults([]);
  }
};

const handleAddProduct = async (product) => {
  const table = Array.isArray(productsInTable) ? productsInTable : [];

  const alreadyAdded = table.some(
    (p) =>
      p.originalProductId === product.productId ||
      p.newProductId === product.productId
  );

  if (alreadyAdded) {
    alert("⚠️ This product is already added.");
    return;
  }

  // 🟢 If next product is Exchange Product
  if (nextIsExchange && table.length > 0) {
    if (!product.currentStock && product.currentStock !== 0) {
      alert(`⚠️ Stock not found for ${product.productName} at selected location.`);
      return;
    }

    if (!product.currentStock || product.currentStock <= 0) {
      alert(`⚠️ ${product.productName} is out of stock at this location.`);
      return;
    }

    const lastOriginal = table[table.length - 1];
    const lastOriginalQty = lastOriginal.originalQuantity || 0;
    const lastOriginalId = lastOriginal.originalProductId;

    try {
      // 🟢 Fetch exchange info (check if discount applies)
      const exchangeData = await searchProductsInStock(
        product.productName || "",
        selectedLocationId,
        parseInt(formData.salesId),
        lastOriginalQty,
        lastOriginalId,
        product.productId
      );

      let exchangeUnitPrice = product.exchangeUnitPrice ?? product.originalUnitPrice ?? 0;

      if (Array.isArray(exchangeData) && exchangeData.length > 0) {
        const exchangeItem = exchangeData[0];
        exchangeUnitPrice = exchangeItem.exchangeUnitPrice ?? exchangeUnitPrice;

        // 🟢 Apply discount alert when applicable
        if (exchangeItem.discountApplied) {
          alert(`✅ Discount applied! Exchange price updated to ${exchangeUnitPrice.toFixed(2)}`);
        }
      }

      setProductsInTable((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const original = updated[lastIndex];

        updated[lastIndex] = {
          ...original,
          newProductId: product.productId,
          exchangeProductName: product.productName,
          exchangeQuantity: 1,
          exchangeUnitPrice,
          priceDifference:
            (1 * exchangeUnitPrice) -
            (original.originalQuantity * (original.originalUnitPrice ?? 0)),
          maxExchangeQuantity: product.currentStock || 0,
          discountAlertShown: false
        };

        return updated;
      });

      setNextIsExchange(false);
      setSearchQuery("");
      setSearchResults([]);
      return;
    } catch (err) {
      console.error("Error applying discount on new product:", err);
      alert("⚠️ Failed to check discount for this product.");
      return;
    }
  }

  // 🟢 Normal (Original) Product Addition
  const originalUnitPrice = product.originalUnitPrice ?? 0;

  setProductsInTable((prev) => {
    const tablePrev = Array.isArray(prev) ? prev : [];
    return [
      ...tablePrev,
      {
        originalProductId: product.productId,
        originalProductName: product.productName,
        originalQuantity: 1,
        originalUnitPrice,
        maxQuantity: product.originalQuantity ?? 0,
        newProductId: null,
        exchangeProductName: "",
        exchangeQuantity: 0,
        exchangeUnitPrice: 0,
        priceDifference: 0 - (1 * originalUnitPrice),
        discountAlertShown: false
      },
    ];
  });

  setSearchQuery("");
  setSearchResults([]);

  setTimeout(() => {
    const addNextAsExchange = window.confirm(
      "Do you want to add the next product as an Exchange Product?"
    );
    setNextIsExchange(addNextAsExchange);
  }, 0);
};

const handleQuantityChange = async (index, field, value) => {
  const qty = parseInt(value) || 0;

  setProductsInTable((prev) => {
    const updated = [...prev];
    const product = { ...updated[index] };

    if (field === "originalQuantity") {
      const maxQty = product.maxQuantity ?? 0;

      if (qty > maxQty) {
        alert(`⚠️ You cannot set quantity more than what was sold (${maxQty})`);
        product.originalQuantity = maxQty; // clamp
      } else {
        product.originalQuantity = qty;
      }
    } else if (field === "exchangeQuantity") {
     const maxStock = product.maxExchangeQuantity ?? Infinity;
 if (qty > maxStock) {
   alert(`⚠️ Not enough stock! Available: ${maxStock}, Requested: ${qty}`);
   product.exchangeQuantity = maxStock; // clamp
 } else {
   product.exchangeQuantity = qty;
 }
    }

    // ✅ Recalculate totals
    const originalTotal = (product.originalQuantity || 0) * (product.originalUnitPrice || 0);
    const exchangeTotal = (product.exchangeQuantity || 0) * (product.exchangeUnitPrice || 0);
    product.priceDifference = exchangeTotal - originalTotal;

    updated[index] = product;
    return updated;
  });

  // 🔹 Optional: re-fetch updated exchange price if needed
  const product = productsInTable[index];
  if (product?.newProductId && formData.salesId && selectedLocationId) {
    try {
      const exchangeData = await searchProductsInStock(
        product.exchangeProductName || "",
        selectedLocationId,
        parseInt(formData.salesId),
        field === "originalQuantity" ? qty : product.originalQuantity,
        product.originalProductId,
        product.newProductId
      );

      if (Array.isArray(exchangeData) && exchangeData.length > 0) {
        const newPrice = exchangeData[0].exchangeUnitPrice ?? 0;
        const discountApplied = exchangeData[0].discountApplied || false;
        setProductsInTable((prev) => {
          const updated = [...prev];
          const p = { ...updated[index] };
          p.exchangeUnitPrice = newPrice;

          const originalTotal = (p.originalQuantity || 0) * (p.originalUnitPrice || 0);
          const exchangeTotal = (p.exchangeQuantity || 0) * (p.exchangeUnitPrice || 0);
          p.priceDifference = exchangeTotal - originalTotal;

          updated[index] = p;
          return updated;
        });
      if (discountApplied) {
  setProductsInTable((prev) => {
    const updated = [...prev];
    const p = { ...updated[index] };

    if (!p.discountAlertShown) {
      alert(`✅ Discount applied! Exchange price updated to ${newPrice.toFixed(2)}`);
      p.discountAlertShown = true; // prevent repeat alerts
    }

    p.exchangeUnitPrice = newPrice;
    const originalTotal = (p.originalQuantity || 0) * (p.originalUnitPrice || 0);
    const exchangeTotal = (p.exchangeQuantity || 0) * (p.exchangeUnitPrice || 0);
    p.priceDifference = exchangeTotal - originalTotal;
    updated[index] = p;
    return updated;
  });
}

      }
    } catch (err) {
      console.error("Error fetching updated exchange price:", err);
    }
  }
};


useEffect(() => {
  if (!productsInTable || productsInTable.length === 0) {
    setFormData(prev => ({
      ...prev,
      grandTotal: 0,
      amountExchanged: 0,
      refundAmount: 0,
      paymentDue: 0
    }));
    return;
  }

  const calculateFinancials = async () => {
    const totalOriginal = productsInTable.reduce(
      (sum, item) => sum + (item.originalQuantity || 0) * (item.originalUnitPrice || 0),
      0
    );

    const totalExchanged = productsInTable.reduce(
      (sum, item) => sum + (item.exchangeQuantity || 0) * (item.exchangeUnitPrice || 0),
      0
    );

    const originalSaleProducts = saleAdjustments.originalSaleProducts || [];
    const originalSaleTotal = saleAdjustments.originalSaleTotal || 0;
 const originalAmountPaid = saleAdjustments.amountPaid || 0;
    const originalPaymentDue = saleAdjustments.originalPaymentDue || 0;

    // 🟢 Compute returned quantities (matching backend logic)
    const returnedQuantities = productsInTable.map(p => ({
      productId: p.originalProductId,
      totalReturned: p.originalQuantity || 0
    }));

    // 🟢 Check if all original products have been fully returned (matching backend)
    const allOriginalsReturned = originalSaleProducts.length > 0 &&
      originalSaleProducts.every(ps => {
        const returned = returnedQuantities.find(rq => rq.productId === ps.productId);
        return returned != null && returned.totalReturned >= ps.quantity;
      });

    const noNewProducts = productsInTable.every(item => !item.newProductId);

    let refundAmount = 0;
    let paymentDue = 0;
        let refundMessage = "";


    // 🟢 CASE A: Full return + no new products (apply all original discounts, taxes, and loyalty)
    if (allOriginalsReturned && noNewProducts) {
      let totalDiscount = 0;
      saleAdjustments.discounts.forEach(d => {
        if (d.discountType === "Fixed") 
          totalDiscount += d.discountAmount;
        else if (d.discountType === "Percentage")
          totalDiscount += originalSaleTotal * (d.discountPercentage / 100); // Use original sale total, not totalOriginal
      });

if (saleAdjustments.discounts.length > 0 && !shownDiscountAlert) {
  const applied = saleAdjustments.discounts.map(d => 
    d.discountType === "Fixed" 
      ? `Fixed - ${d.discountAmount}` 
      : `Percentage - ${d.discountPercentage}%`
  ).join(", ");
  alert(`💸 Sales Discounts applied: ${applied}`);
  setShownDiscountAlert(true);
}
saleAdjustments.discountCoupons.forEach(dc => {
  if (dc.discountType === "Fixed") 
    totalDiscount += dc.discountAmount; 
  else if (dc.discountType === "Percentage") 
    totalDiscount += originalSaleTotal * (dc.discountPercentage / 100);
});

// Show alert ONCE
if (saleAdjustments.discountCoupons.length > 0 && !shownCouponAlert) {
  const appliedCoupons = saleAdjustments.discountCoupons.map(dc =>
    dc.discountType === "Fixed"
      ? `Fixed - ${dc.discountAmount}`
      : `Percentage - ${dc.discountPercentage}%`
  ).join(", ");
  alert(`🎟️ Discount Coupons applied: ${appliedCoupons}`);
  setShownCouponAlert(true);
}

      const totalLoyaltyDiscount = saleAdjustments.loyalty.reduce((sum, l) => sum + l.loyaltyDiscount, 0);

if (totalLoyaltyDiscount > 0 && !shownLoyaltyAlert) {
  alert(`🎁 Loyalty Discount applied: ${totalLoyaltyDiscount.toFixed(2)}`);
  setShownLoyaltyAlert(true);
}

      let totalTax = 0;
      for (const tax of saleAdjustments.taxes) {
        const taxPercentage = tax.taxPercentage || 0;
        totalTax += originalSaleTotal * (taxPercentage / 100); // Use original sale total
      }
if (saleAdjustments.taxes.length > 0 && !shownTaxAlert) {
  const appliedTaxes = saleAdjustments.taxes.map(
    t => `${t.taxPercentage}%`
  ).join(", ");
  alert(`⚖️ Sales Taxes applied: ${appliedTaxes}`);
  setShownTaxAlert(true);
}

         const adjustedRefundAmount = totalOriginal - totalDiscount - totalLoyaltyDiscount + totalTax;
      
      // 🟢 REFUND LOGIC BASED ON ORIGINAL PAYMENT STATUS
      if (originalAmountPaid <= 0) {
        // Sale was unpaid - no refund, just reduce outstanding balance
        refundAmount = 0;
        refundMessage = "This sale was unpaid — refund does not apply; it will just reduce the outstanding balance.";
      } else if (originalPaymentDue > 0) {
        // Sale was partially paid - refund only if return exceeds unpaid balance
        const potentialRefund = Math.max(0, adjustedRefundAmount - originalPaymentDue);
        refundAmount = potentialRefund;
        refundMessage = potentialRefund > 0 
          ? `This sale was partially paid — refund of $${potentialRefund.toFixed(2)} applies (return exceeds unpaid balance).`
          : "This sale was partially paid — refund applies only if the return exceeds unpaid balance.";
      } else {
        // Sale was fully paid - full refund due
        refundAmount = adjustedRefundAmount;
        refundMessage = "This sale was fully paid — refund due from customer.";
      }
      
      paymentDue = 0;

    }
  // 🟢 CASE B: Full return + new products (apply discounts, taxes, loyalty to BOTH sides)
else if (allOriginalsReturned && !noNewProducts) {
  const refundPortion = totalOriginal;   // refund all originals
  const baseAmount = totalExchanged;     // subtotal of new products

  // 🧭 Helper to apply all adjustments (discounts, taxes, loyalty)
  const applyAdjustments = (amount) => {
    let totalDiscount = 0;
    saleAdjustments.discounts.forEach(d => {
      if (d.discountType === "Fixed")
        totalDiscount += d.discountAmount;
      else if (d.discountType === "Percentage")
        totalDiscount += amount * (d.discountPercentage / 100);
    });
  saleAdjustments.discountCoupons.forEach(dc => {
    if (dc.discountType === "Fixed") totalDiscount += dc.discountAmount;
    else if (dc.discountType === "Percentage") totalDiscount += amount * (dc.discountPercentage / 100);
  });

    let totalTax = 0;
    saleAdjustments.taxes.forEach(t => {
      const taxPercentage = t.taxPercentage || 0;
      totalTax += amount * (taxPercentage / 100);
    });

    const totalLoyaltyDiscount = saleAdjustments.loyalty.reduce(
      (sum, l) => sum + l.loyaltyDiscount,
      0
    );

    // Apply all adjustments together
    return amount + totalTax - totalDiscount - totalLoyaltyDiscount;
  };

  // 🧾 Apply adjustments to both refund and new purchase sides
   const refundAdjusted = applyAdjustments(refundPortion);
      const newPurchaseAdjusted = applyAdjustments(baseAmount);

    
  // 🔔 Show alerts once
  if (saleAdjustments.discounts.length > 0 && !shownDiscountAlert) {
    const applied = saleAdjustments.discounts.map(d =>
      d.discountType === "Fixed"
        ? `Fixed - ${d.discountAmount}`
        : `Percentage - ${d.discountPercentage}%`
    ).join(", ");
    alert(`💸 Sales Discounts applied: ${applied}`);
    setShownDiscountAlert(true);
  }
if (saleAdjustments.discountCoupons.length > 0 && !shownCouponAlert) {
  const appliedCoupons = saleAdjustments.discountCoupons.map(dc =>
    dc.discountType === "Fixed"
      ? `Fixed - ${dc.discountAmount}`
      : `Percentage - ${dc.discountPercentage}%`
  ).join(", ");
  alert(`🎟️ Discount Coupons applied: ${appliedCoupons}`);
  setShownCouponAlert(true);
}

  if (saleAdjustments.loyalty.length > 0 && !shownLoyaltyAlert) {
    const totalLoyalty = saleAdjustments.loyalty
      .reduce((sum, l) => sum + l.loyaltyDiscount, 0);
    alert(`🎁 Loyalty Discount applied: ${totalLoyalty.toFixed(2)}`);
    setShownLoyaltyAlert(true);
  }

  if (saleAdjustments.taxes.length > 0 && !shownTaxAlert) {
    const appliedTaxes = saleAdjustments.taxes
      .map(t => `${t.taxPercentage}%`)
      .join(", ");
    alert(`⚖️ Sales Taxes applied: ${appliedTaxes}`);
    setShownTaxAlert(true);
  }

  // 🧮 Compute refund/payment due
  let refundAmount = 0;
  let paymentDue = 0;
  if (refundAdjusted > newPurchaseAdjusted) {
    refundAmount = refundAdjusted - newPurchaseAdjusted;
  } else if (newPurchaseAdjusted > refundAdjusted) {
    paymentDue = newPurchaseAdjusted - refundAdjusted;
  }
 
  // ✅ Update formData here
  setFormData(prev => ({
    ...prev,
    grandTotal: refundAdjusted.toFixed(2),        // refund side total with discounts/taxes
    amountExchanged: newPurchaseAdjusted.toFixed(2), // new products side total
    paymentDue: paymentDue.toFixed(2),
    refundAmount: refundAmount.toFixed(2),

  }));

  return; // 🚀 stop here so the fallback setFormData below doesn't overwrite this
}
    // 🟢 CASE C: Partial return with no new products → don't apply discounts/taxes/loyalty
    else if (!allOriginalsReturned && noNewProducts) {
     const netDifference = totalOriginal - totalExchanged;
      
      if (netDifference > 0) {
        // Refund scenario
        if (originalAmountPaid <= 0) {
          refundAmount = 0;
          refundMessage = "This sale was unpaid — refund does not apply; it will just reduce the outstanding balance.";
        } else if (originalPaymentDue > 0) {
          const potentialRefund = Math.max(0, netDifference - originalPaymentDue);
          refundAmount = potentialRefund;
          refundMessage = potentialRefund > 0 
            ? `This sale was partially paid — refund of $${potentialRefund.toFixed(2)} applies (return exceeds unpaid balance).`
            : "This sale was partially paid — refund applies only if return exceeds unpaid balance.";
        } else {
          refundAmount = netDifference;
          refundMessage = "This purchase was fully paid — refund due from customer.";
        }
        paymentDue = 0;
      } else {
        // Payment due scenario
        refundAmount = 0;
        paymentDue = Math.abs(netDifference);
        refundMessage = "Additional payment required for exchange.";
      }
    }
    // 🟢 CASE D: Partial return + new products (normal calc)
    else {
      refundAmount = totalOriginal > totalExchanged ? totalOriginal - totalExchanged : 0;
  paymentDue = totalExchanged > totalOriginal ? totalExchanged - totalOriginal : 0;
    }

    // Safety checks (matching backend)
    refundAmount = Math.max(0, refundAmount);
    paymentDue = Math.max(0, paymentDue);

    setFormData(prev => ({
      ...prev,
      grandTotal: totalOriginal,
      amountExchanged: totalExchanged,
      refundAmount,
      paymentDue,
      refundMessage

    }));
  };

  calculateFinancials();
  
}, [productsInTable, saleAdjustments,shownDiscountAlert,shownLoyaltyAlert,shownTaxAlert, shownCouponAlert]);

const handleDeleteProduct = (index) => {
  setProductsInTable((prev) => prev.filter((_, i) => i !== index));
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {

     const lowStockWarnings = [];
    
    // Check stock for all exchange products
    for (const product of productsInTable) {
      if (product.newProductId && selectedLocationId) {
        // This is an exchange product, check its stock
        const stockInfo = await searchProductsInStock(
          product.exchangeProductName || "",
          selectedLocationId,
          parseInt(formData.salesId),
          product.originalQuantity || 0,
          product.originalProductId,
          product.newProductId
        );

        if (Array.isArray(stockInfo) && stockInfo.length > 0) {
          const exchangeProduct = stockInfo[0];
          const currentStock = exchangeProduct.currentStock || 0;
          const quantityAlert = exchangeProduct.quantityAlert || 0;
          const exchangeQuantity = product.exchangeQuantity || 0;
          const updatedStock = currentStock - exchangeQuantity;

          if (updatedStock <= quantityAlert) {
            lowStockWarnings.push(
              `⚠️ ${product.exchangeProductName}: Current stock = ${currentStock}, Exchange = ${exchangeQuantity}, Remaining = ${updatedStock}, Alert Level = ${quantityAlert}`
            );
          }
        }
      }
    }

    // Show low stock warnings but allow user to proceed
    if (lowStockWarnings.length > 0) {
      const warningMessage = "LOW STOCK WARNINGS FOR EXCHANGE PRODUCTS:\n\n" + 
        lowStockWarnings.join("\n") + 
        "\n\nDo you want to proceed with the sale exchange?";
      
      const shouldProceed = window.confirm(warningMessage);
      
      if (!shouldProceed) {
        return; // Stop if user cancels
      }
    }

    // Step 1: Add Sale Exchange (header)
    const createdExchanges = await addSaleExchange(formData);
    const createdExchange = Array.isArray(createdExchanges)
      ? createdExchanges[0]
      : createdExchanges;

    // Step 2: Add associated SaleExchangeItems
    if (createdExchange?.salesExchangeId && productsInTable.length > 0) {
      await addSalesExchangeItems(createdExchange.salesExchangeId, productsInTable);
    }

    // Step 3: Reset form
    setFormData({
      salesId: "",
      date: new Date().toISOString().split("T")[0],
      exchangeStatus: "",
      paymentStatus: "",
      exchangeType: "",
      refundStatus: "",
      exchangeReason: "",
      grandTotal: 0,
      amountExchanged: 0,
      paymentDue: 0,
      refundAmount: 0
    });
    setProductsInTable([]); // reset products too
    // Reset alert flags for next sale exchange
setShownDiscountAlert(false);
setShownLoyaltyAlert(false);
setShownTaxAlert(false);


    alert("✅ Sale Exchange Added Successfully!");
    navigate("/saleexchange/list");
  } catch (err) {
    console.error("Failed to add SaleExchange:", err);
    alert("❌ Error adding Sale Exchange!");
  }
};



  return (
    <div className="sale-exchange-page">
      <Topbar />
      <Sidebar />
      <div className="sale-exchange-container">
             <div className="sales-header">
              <h2>Add Sale Exchange</h2>
              </div>

        <div className="sale-exchange-box">
     

          {loading && <p>Loading...</p>}

          <form className="sale-exchange-exsaleform" onSubmit={handleSubmit}>
            {/* Date Field */}
            <div className="exsaleform-group">
              <label htmlFor="exchangeDate">Exchange Date</label>
              <input
                type="date"
                id="exchangeDate"
                name="date"
                value={formData.date}
                onChange={handleChange}
                 className="exsaleform-input"
                required
              />
            </div>

           {/* Sales ID Dropdown */}
<div className="exsaleform-group">
  <label htmlFor="salesId">Invoice No</label>
     <select
        id="salesId"
        name="salesId"
        value={formData.salesId}
        onChange={handleSalesChange}
         className="exsaleform-select"
        required
        disabled={!!saleId} // Disable if saleId comes from URL
      >
        <option value="">Select Invoice No</option>
        {salesIds
          .filter((s) => s.transactionStatus === "Completed")
          .map((s) => (
            <option key={s.salesId} value={s.salesId}>
              {s.salesId}
            </option>
          ))}
      </select>
</div>


            {/* Exchange Status Dropdown */}
             <div className="exsaleform-group">
        <label>
  Exchange Status{" "}
  <span
    className="exchange-info-icon"
    onMouseEnter={() => setShowExchangeInfo(true)}
    onMouseLeave={() => setShowExchangeInfo(false)}
  >
    ?
  </span>

  {showExchangeInfo && (
    <div className="exchange-info-popup">
      ⚠️ <b>Note:</b> Once set to <b>Approved</b> or <b>Cancelled</b>, the
      Exchange cannot be edited.
    </div>
  )}
</label>
            <select
            id="exchangeStatus"
            name="exchangeStatus"
             value={formData.exchangeStatus}
               onChange={handleChange}
                className="exsaleform-select"
             required
            >
            <option value="">Select Status</option>
              {exchangeStatuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
            </option>
            ))}
            </select>
            </div>

            {/* Payment Status Dropdown */}
            <div className="exsaleform-group">
              <label htmlFor="paymentStatus">Payment Status</label>
            <select
            id="paymentStatus"
             name="paymentStatus"
            value={formData.paymentStatus}
             onChange={handleChange}
              className="exsaleform-select"
             required
            >
             <option value="">Select Payment Status</option>
            {paymentStatuses.map((status, index) => (
            <option key={index} value={status}>
            {status}
            </option>
            ))}
            </select>

            </div>

            {/* Exchange Type Dropdown */}
            <div className="exsaleform-group">
              <label htmlFor="exchangeType">Exchange Type</label>
             <select
              id="exchangeType"
              name="exchangeType"
              value={formData.exchangeType}
             onChange={handleChange}
              className="exsaleform-select"
             required
              >
               <option value="">Select Exchange Type</option>
              {exchangeTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
              ))}
            </select>
            </div>

            {/* Refund Status Dropdown */}
            <div className="exsaleform-group">
              <label htmlFor="refundStatus">Refund Status</label>
             <select
              id="refundStatus"
              name="refundStatus"
              value={formData.refundStatus}
            onChange={handleChange}
             className="exsaleform-select"
            required
            >
            <option value="">Select Refund Status</option>
            {refundStatuses.map((status, index) => (
            <option key={index} value={status}>
            {status}
            </option>
            ))}
              </select>
            </div>
            {/* Exchange Reason TextArea */}
            <div className="exsaleform-group">
             <label htmlFor="exchangeReason">Exchange Reason</label>
            <textarea
             id="exchangeReason"
             name="exchangeReason"
               value={formData.exchangeReason}
                onChange={handleChange}
                
              placeholder="Enter reason for exchange"
                className="exsaleform-input"
               rows="4"   // 🔹 Controls height
              required
             />
              </div>
 {/* 🔹 Product Search Box */}
<div className="product-box">
  <h3>Search Returned Products</h3>
  <div className="exsaleform-group" >
    <input
      type="text"
      placeholder="Search Product by Name or SKU"
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="exsaleform-input"
    />

    {/* 🔹 Live Search Results Dropdown */}
    {Array.isArray(searchResults) && searchResults.length > 0 && (
      <ul className="search-results">
      {searchResults.map((p) => (
  <li
    key={p.productId}
    onClick={() => handleAddProduct(p)}
  >
    {p.productName}
  </li>
))}
      </ul>
    )}
  </div>

 {/* 🔹 Selected Products Table (always visible) */}
  {/* Selected Products Table */}
  <div className="table-responsive">
    <table className="exsaleproduct-table">
      <thead>
        <tr>
          <th>Original Product</th>
          <th>Original Quantity</th>
          <th>Original Unit Price</th>
          <th>Exchange Product</th>
          <th>Exchange Quantity</th>
          <th>Exchange Unit Price</th>
          <th>Price Difference</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {productsInTable.length > 0 ? (
          productsInTable.map((p, idx) => (
            <tr key={idx}>
              <td>{p.originalProductName}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={p.originalQuantity}
                  onChange={(e) =>
                    handleQuantityChange(idx, "originalQuantity", e.target.value)
                  }
                  className="table-input"
                />
              </td>
              <td>{p.originalProductName ? p.originalUnitPrice?.toFixed(2) : "-"}</td>
              <td>{p.exchangeProductName || "-"}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={p.exchangeQuantity}
                  onChange={(e) =>
                    handleQuantityChange(idx, "exchangeQuantity", e.target.value)
                  }
                  className="table-input"
                />
              </td>
              <td>{p.exchangeProductName ? p.exchangeUnitPrice?.toFixed(2) : "-"}</td>
              <td>{p.priceDifference?.toFixed(2) || "-"}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(idx)}
                  className="exchange-delete-btn"
                  title="Delete"
                >
                  <FaTrash className="trash-icon" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" style={{ textAlign: "center", color: "#888" }}>
              No products added yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
{/* 🔹 New Box for Financial Fields */}
<div className="sale-exchange-box">
  <h3>Financial Details</h3>
  <div className="sale-exchange-exsaleform">
 {/* Grand Total */}
<div className="exsaleform-group">
  <label>
  Grand Total {" "}
  <span
    className="exchange-info-icon"
    onMouseEnter={() => setShowGrandTotalInfo(true)}
    onMouseLeave={() => setShowGrandTotalInfo(false)}
  >
    ?
  </span>

  {showGrandTotalInfo && (
    <div className="exchange-info-popup">
      ⚠️ <b>Note:</b> Total of  <b>Original</b>  <b>Products</b>
    
    </div>
  )}
</label>
  <input
    type="number"
    step="0.01"
    id="grandTotal"
    name="grandTotal"
    value={formData.grandTotal || ""}
    readOnly
    className="exsaleform-input"
  />
</div>

{/* Amount Exchanged */}
<div className="exsaleform-group">
  <label>
  Exchange Amount{" "}
  <span
    className="exchange-info-icon"
    onMouseEnter={() => setShowAmountExchangeInfo(true)}
    onMouseLeave={() => setShowAmountExchangeInfo(false)}
  >
    ?
  </span>

  {showAmountExchangeInfo && (
    <div className="exchange-info-popup">
      ⚠️ <b>Note:</b> Total of  <b>New</b>  <b>Products</b>
    </div>
  )}
</label>
  <input
    type="number"
    step="0.01"
    id="amountExchanged"
    name="amountExchanged"
    value={formData.amountExchanged || ""}
    readOnly
    className="exsaleform-input"
  />
</div>

{/* Payment Due */}
<div className="exsaleform-group">
  <label htmlFor="paymentDue">Payment Due</label>
  <input
    type="number"
    step="0.01"
    id="paymentDue"
    name="paymentDue"
    value={formData.paymentDue || ""}
    readOnly
    className="exsaleform-input"
  />
</div>

{/* Refund Amount */}
<div className="exsaleform-group">
  <label htmlFor="refundAmount">Refund Amount</label>
  <input
    type="number"
    step="0.01"
    id="refundAmount"
    name="refundAmount"
    value={formData.refundAmount || ""}
    readOnly
    className="exsaleform-input"
  />
  {formData.refundMessage && (
    <div className="refund-message" style={{
      fontSize: "12px",
      color: "#666",
      marginTop: "5px",
      fontStyle: "italic",
      padding: "5px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      borderLeft: "3px solid #007bff"
    }}>
      💡 {formData.refundMessage}
    </div>
  )}
</div>
  </div>
</div>
            {/* Submit Button */}
            <div className="saleform-actions">
              <button type="submit" className="btn-add-exchange">
                Add Exchange
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
