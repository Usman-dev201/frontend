import React, { useState, useEffect,useRef } from 'react';
// import { ArrowDownCircle } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { usePurchase } from '../../context/PurchaseContext';
import '../../styles/purchase/Purchase.css';

export default function EditPurchase() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getPurchaseById,
     updatePurchase, 
     suppliers, 
     locations, 
     purchaseStatuses ,
     paymentStatuses , 
     getProductPurchaseRecordsByPurchaseId,
     updateProductPurchaseRecords,
fetchPurchases,
    //  addProductPurchaseRecord ,
     getProductPurchaseDiscountsByPurchaseId,   
     getPurchaseDiscountsByPurchaseId,
  updateProductPurchaseDiscounts, 
  updatePurchaseDiscounts,
     products,
     fetchProducts,
     deleteProductPurchaseRecord,
     taxLocations,
     taxNames,
     getPurchaseTaxRecordsByPurchaseId,
     updatePurchaseTaxes,
     discountCodes,
     discountTypes,
     deleteProductPurchaseDiscount,
     deletePurchaseDiscount,
     deletePurchaseTax,
     addProductPurchaseRecord,
     addProductDiscount,
     addPurchaseDiscounts,
    addPurchaseTaxes,
    updatePurchasePayment,
    getPurchaseReturnsByPurchaseId,
    
    
    } = usePurchase();

    
 const calculateDiscountedPrice = (product, discount) => {
    if (!discount || !discount.discountType) return product.purchasePriceBeforeDiscount;

    const priceBefore = parseFloat(product.purchasePriceBeforeDiscount) || 0;
    
    if (discount.discountType === 'Fixed') {
      const discountAmount = parseFloat(discount.discountAmount) || 0;
      return Math.max(0, priceBefore - discountAmount).toFixed(2);
    } 
    else if (discount.discountType === 'Percentage') {
      const discountPercentage = parseFloat(discount.discountPercentage) || 0;
      const discountAmount = priceBefore * (discountPercentage / 100);
      return Math.max(0, priceBefore - discountAmount).toFixed(2);
    }
    
    return priceBefore;
  };
 const [formData, setFormData] = useState({
  supplierId: '',
  locationId: '',
  date: '',
  amountPaid: '',
  purchaseStatus: 'Pending',
  paymentStatus: 'Unpaid'
});
const [showLocationInfo, setShowLocationInfo] = useState(false);
const [showStatusInfo, setShowStatusInfo] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showTaxTooltip, setShowTaxTooltip] = useState(false);
const [originalFormData, setOriginalFormData] = useState(null);
const [purchaseReturns, setPurchaseReturns] = useState([]);



useEffect(() => {
  const fetchPurchase = async () => {
    const data = await getPurchaseById(id); // id = purchaseId from route
    setFormData(data);
    setOriginalFormData(data);

    // ✅ Fetch approved purchase returns **after we have the purchase ID**
    const returns = await getPurchaseReturnsByPurchaseId(data.purchaseId);
    setPurchaseReturns(returns);
  };
  fetchPurchase();
}, [id, getPurchaseById, getPurchaseReturnsByPurchaseId]);

// Apply all discounts sequentially



const calculateTotalAmount = () => {
  return selectedProducts.reduce((total, product) => {
    const quantity = parseInt(product.quantityPurchased) || 0;
    const priceAfterDiscount = parseFloat(product.purchasePriceAfterDiscount) || 0;
    return total + (quantity * priceAfterDiscount);
  }, 0).toFixed(2);
};

const calculateGrandTotal = () => {
  const subtotal = parseFloat(calculateTotalAmount()) || 0;
  
  // Calculate purchase-level discounts
  let discountAmount = 0;
  purchaseDiscountList.forEach(discount => {
    if (discount.discountType === 'Fixed') {
      discountAmount += parseFloat(discount.discountAmount) || 0;
    } else if (discount.discountType === 'Percentage') {
      const discountPercentage = parseFloat(discount.discountPercentage) || 0;
      discountAmount += subtotal * (discountPercentage / 100);
    }
  });
  
  // Apply discounts to get discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  // Calculate taxes
  let totalTaxAmount = 0;
  taxList.forEach(tax => {
    const taxPercentage = parseFloat(tax.taxPercentage) || 0;
    totalTaxAmount += discountedSubtotal * (taxPercentage / 100);
  });
  
  // Calculate grand total
  const grandTotal = discountedSubtotal + totalTaxAmount;
  
  return grandTotal.toFixed(2);
};

const calculateDiscountAmount = () => {
  const subtotal = parseFloat(calculateTotalAmount()) || 0;
  let discountAmount = 0;
  
  purchaseDiscountList.forEach(discount => {
    if (discount.discountType === 'Fixed') {
      discountAmount += parseFloat(discount.discountAmount) || 0;
    } else if (discount.discountType === 'Percentage') {
      const discountPercentage = parseFloat(discount.discountPercentage) || 0;
      discountAmount += subtotal * (discountPercentage / 100);
    }
  });
  
  return discountAmount.toFixed(2);
};

const calculateTaxAmount =  () => {
  const subtotal = calculateTotalAmount() - calculateDiscountAmount();
  return taxList.reduce((acc, tax) => {
    const percentage = parseFloat(tax.taxPercentage) || 0;
    return acc + (subtotal * percentage) / 100;
  }, 0);
};

const calculatePaymentDue = () => {
  const grandTotal = parseFloat(calculateGrandTotal()) || 0;
  const amountPaid = parseFloat(formData.amountPaid) || 0;

  const totalApprovedReturns = purchaseReturns
    .reduce((sum, pr) => sum + parseFloat(pr.grandTotal || 0), 0);

  const paymentDue = grandTotal - amountPaid - totalApprovedReturns;

  return Math.max(0, paymentDue).toFixed(2);
};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [purchaseDiscountList, setPurchaseDiscountList] = useState([]);
  const [originalPurchaseStatus, setOriginalPurchaseStatus] = useState('');
  const [productDiscounts, setProductDiscounts] = useState([]);
  
  const [currentPurchaseDiscount, setCurrentPurchaseDiscount] = useState({
    id: '',
    discountCode: '',
    discountType: '',
    discountAmount: '',
    discountPercentage: ''
  });

  const [taxList, setTaxList] = useState([]);
  const [currentTax, setCurrentTax] = useState({
    id: '',
    taxName: '',
    location: '',
    taxPercentage: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

useEffect(() => {
  if (currentPurchaseDiscount.discountCode && currentPurchaseDiscount.discountType) {
    const selectedDiscount = discountCodes.find(
      (dc) => dc.discountCode === currentPurchaseDiscount.discountCode
    );

    const newDiscount = {
      purchaseId: parseInt(id),
      discountId: selectedDiscount?.discountId || null,
      discountCode: currentPurchaseDiscount.discountCode,
      discountType: currentPurchaseDiscount.discountType,
      discountAmount: parseFloat(currentPurchaseDiscount.discountAmount) || 0,
      discountPercentage: parseFloat(currentPurchaseDiscount.discountPercentage) || 0,
    };

    // ✅ Prevent duplicate entries
    const alreadyExists = purchaseDiscountList.some(
      (d) =>
        d.discountCode === newDiscount.discountCode &&
        d.discountType === newDiscount.discountType
    );

    if (!alreadyExists) {
      setPurchaseDiscountList((prev) => [...prev, newDiscount]);
    }

    // Reset after adding
    setCurrentPurchaseDiscount({
      id: "",
      discountCode: "",
      discountType: "",
      discountAmount: "",
      discountPercentage: "",
    });
  }
}, [currentPurchaseDiscount, discountCodes, id, purchaseDiscountList]);


  const deleteButtonStyle = {
    padding: '0 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    height: '30px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(220, 53, 69, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content'
  };
const searchInputRef = useRef(null);


useEffect(() => {
  const fetchAndSetPurchase = async () => {
    try {
      const purchase = await getPurchaseById(id);
      setFormData({
        supplierId: purchase.supplierId,
        locationId: purchase.locationId,
        date: purchase.date,
        amountPaid: purchase.amountPaid,
        purchaseStatus: purchase.purchaseStatus,
        paymentStatus: purchase.paymentStatus
      });
setOriginalPurchaseStatus(purchase.purchaseStatus);
      const productRecords = await getProductPurchaseRecordsByPurchaseId(id);
      console.log('Fetched product records:', productRecords);

    
      const enrichedRecords = productRecords.map(record => ({
        lotId: record.loTId,  // ✅ Add this line
        purchaseId: record.purchaseId,
        productId: record.productId,
        productName: record.product?.productName || `ID: ${record.productId}`,
        mfgDate: record.mgfDate,
        expDate: record.expiryDate,
        quantityPurchased: record.quantityPurchased,
        purchasePriceBeforeDiscount: record.purchasePriceBeforeDiscount,
        purchasePriceAfterDiscount: record.purchasePriceAfterDiscount,
        totalAmount: record.totalAmount,
        profitMargin: record.profitMargin,
        unitSellingPrice: record.unitSellingPrice
      }));

      console.log('Enriched product records:', enrichedRecords);
      setSelectedProducts(enrichedRecords);
       const discounts = await getProductPurchaseDiscountsByPurchaseId(id);
     const formattedDiscounts = discounts.map(d => ({
  productPurchaseDiscountId: d.productPurchaseDiscountId,
  productId: d.productId,
   productName: d.productName || 'Unknown Product',   // ✅ no need to look in selectedProducts
  loTId: d.loTId,
  discountId: d.discountId || null,
  discountType: d.discountType,
  discountAmount: d.discountAmount,
  discountPercentage: d.discountPercentage
}));
setProductDiscounts(formattedDiscounts);


       const purchaseDiscounts = await getPurchaseDiscountsByPurchaseId(id);
      const formattedPurchaseDiscounts = purchaseDiscounts.map(d => ({
        purchaseDiscountId: d.purchaseDiscountId,
        purchaseId: d.purchaseId,
        discountId: d.discountId,
        discountCode: d.discount?.discountCode || '', // Get from DiscountRecord
        discountType: d.discountType,
        discountAmount: d.discountAmount,
        discountPercentage: d.discountPercentage
      }));
      setPurchaseDiscountList(formattedPurchaseDiscounts);

      const purchaseTaxes = await getPurchaseTaxRecordsByPurchaseId(id);
console.log('Loaded purchase taxes:', purchaseTaxes);

const enrichedTaxList = purchaseTaxes.map(tax => ({
  id: tax.purchaseTaxId, // for key
purchaseTaxId: tax.purchaseTaxId,
  taxLocationId: tax.taxLocationId.toString(), // ✅ make sure it's string for select
  taxId: tax.taxLocation?.tax?.taxId?.toString() || '',
  taxName: tax.taxLocation?.tax?.taxName || 'Unknown Tax',
  taxPercentage: tax.taxLocation?.taxPercentage || 0
}));

setTaxList(enrichedTaxList);
    } catch (error) {
      console.error('Error loading purchase and products for edit:', error);
      navigate('/purchase/list');
    }
  };

  fetchAndSetPurchase();
},[id, getPurchaseById, 
  getProductPurchaseRecordsByPurchaseId,
   getProductPurchaseDiscountsByPurchaseId,
   getPurchaseDiscountsByPurchaseId, 
   getPurchaseTaxRecordsByPurchaseId,
   
   discountCodes,
    navigate]);

const getTaxNameById = (taxId) => {
  const tax = taxNames.find(t => t.taxId.toString() === taxId.toString());
  return tax ? tax.taxName : 'Unknown';
};


  const handleChange = (e) => {
    const { name, value } = e.target;

     if (name === "purchaseStatus") {
    // ✅ Allow changing freely before submit
    setFormData(prev => ({
      ...prev,
      purchaseStatus: value
    }));
    return;
  }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'location') {
      setTaxList([]);
      setCurrentTax(prev => ({
        ...prev,
        location: value
      }));
    }
  };
  const handlePurchaseDiscountFieldChange = (id, field, value) => {
  setPurchaseDiscountList(prevList =>
    prevList.map(discount =>
      discount.purchaseDiscountId === id
        ? { ...discount, [field]: value }
        : discount
    )
  );
};


   const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    
    if (searchTerm.length >= 2) {
      try {
        await fetchProducts(searchTerm);
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }
  };
const calculateSellingPrice = (purchasePrice, profitMargin) => {
  const price = parseFloat(purchasePrice) || 0;
  const margin = parseFloat(profitMargin) || 0;
  if (margin === 0) return "0.00";
  return (price * (1 + margin / 100)).toFixed(2);
};
  const handleProductSelect = (product) => {
    const exists = selectedProducts.some(p => p.productId === product.productId);

    if (!exists) {
      const newProduct = {
        ...product,
        productId: product.productId,
        productName: product.productName,
        quantityPurchased: product.purchaseQuantity || 1,
        purchasePriceBeforeDiscount: product.purchasePriceBeforeDiscount || 0,
        profitMargin: product.profitMargin || 0,
        unitSellingPrice: product.sellingPrice || 0,
        mfgDate: product.mfgDate || '',
        expDate: product.expDate || '',
        purchasePriceAfterDiscount: product.purchasePriceAfterDiscount || 0,
        totalAmount: (product.purchaseQuantity || 1) * (product.purchasePriceBeforeDiscount || 0)
      };

      setSelectedProducts(prev => [...prev, newProduct]);
      setSearchTerm('');
    } else {
      alert('This product has already been added');
    }
  };
 
const handleDeleteProduct = async (productId) => {
  if (originalPurchaseStatus === "Completed") {
    alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Completed.");
    return;
  }
  if (originalPurchaseStatus === "Cancelled") {
    alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Cancelled.");
    return;
  }

  const productToDelete = selectedProducts.find(product => product.productId === productId);

  if (productToDelete && productToDelete.lotId) {
    try {
      // Delete associated ProductPurchaseDiscounts first
      const productDiscountsToDelete = productDiscounts.filter(
        discount => discount.loTId === productToDelete.lotId || discount.productId === productToDelete.productId
      );
      
      // Delete all associated product discounts
      for (const discount of productDiscountsToDelete) {
        if (discount.productPurchaseDiscountId) {
          await deleteProductPurchaseDiscount(discount.productPurchaseDiscountId);
        }
      }

      // Delete the ProductPurchaseRecord
      await deleteProductPurchaseRecord(productToDelete.lotId);

      // Update state - remove product and its discounts
      setSelectedProducts(prev => prev.filter(product => product.productId !== productId));
      setProductDiscounts(prev => 
        prev.filter(discount => 
          discount.loTId !== productToDelete.lotId && discount.productId !== productToDelete.productId
        )
      );
      
      alert('Product and associated discounts deleted successfully');
    } catch (error) {
      console.error('Failed to delete product and discounts:', error);
      alert('Error deleting product and discounts. Please try again.');
    }
  } else {
    // For products that haven't been saved to the backend yet
    // Remove product and any local discounts associated with it
    setSelectedProducts(prev => prev.filter(product => product.productId !== productId));
    setProductDiscounts(prev => 
      prev.filter(discount => discount.productId !== productId)
    );
    alert('Product removed from the list');
  }
};

  // inside EditPurchase component



 
  // const handleDiscountFieldChange = (id, field, value) => {
  //   setDiscountList(prev => prev.map(discount => 
  //     discount.id === id ? { ...discount, [field]: value } : discount
  //   ));
  // };

  // const deleteDiscount = (id) => {
  //   setDiscountList(prev => prev.filter(discount => discount.id !== id));
  // };
const handleDeletePurchaseDiscount = async (id) => {
   if (originalPurchaseStatus === "Completed") {
  alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Completed.");
  return;
}
if (originalPurchaseStatus === "Cancelled") {
  alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Cancelled.");
  return;
}
  try {
    await deletePurchaseDiscount(id); // ✅ call backend
    setPurchaseDiscountList(prev => prev.filter(discount => discount.purchaseDiscountId !== id)); // ✅ update UI state
     alert('Discounts deleted successfully');
  } catch (error) {
    console.error('Failed to delete purchase discount:', error);
    alert('Failed to delete discount. Please try again.');
  }
};

  const handlePurchaseDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentPurchaseDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  

  

  

  const handleDeletePurchaseTax = async (id) => {
     if (originalPurchaseStatus === "Completed") {
  alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Completed.");
  return;
}
if (originalPurchaseStatus === "Cancelled") {
  alert("⚠️ This Product Record cannot be deleted because the PurchaseStatus is Cancelled.");
  return;
}
  try {
    await deletePurchaseTax(id); // ✅ call backend
    setTaxList(prev => prev.filter(tax => tax.id !== id)); // ✅ update UI
     alert('Taxes deleted successfully');
  } catch (error) {
    console.error('Failed to delete purchase tax:', error);
    alert('Failed to delete tax. Please try again.');
  }
};
 
 const handleSubmit = async (e) => {
  e.preventDefault();


 // ✅ Determine if any payment fields changed
  const paymentFieldsChanged =
    formData.amountPaid !== originalFormData.amountPaid ||
    formData.paymentStatus !== originalFormData.paymentStatus;

  // ✅ Only block updates for Completed/Cancelled if NON-payment fields are changed
  const isCompletedOrCancelled = ["Completed", "Cancelled"].includes(originalPurchaseStatus);

  if (isCompletedOrCancelled && !paymentFieldsChanged) {
    alert(
      `⚠️ This Product Record cannot be updated because the PurchaseStatus is ${originalPurchaseStatus}.`
    );
    setIsSubmitting(false);
    return;
  }

  // ✅ Prepare payloads
  const updatedPurchase = {
    supplierId: parseInt(formData.supplierId),
    locationId: parseInt(formData.locationId),
    date: formData.date,
    amountPaid: parseFloat(formData.amountPaid),
    purchaseStatus: formData.purchaseStatus,
    paymentStatus: formData.paymentStatus,
  };

  try {
    // ✅ If record is Completed/Cancelled → allow payment update only
    if (isCompletedOrCancelled && paymentFieldsChanged) {
      const paymentPayload = {
        amountPaid: parseFloat(formData.amountPaid) || 0,
        paymentStatus: formData.paymentStatus || "Pending",
      };

      console.log("📤 Updating payment details:", paymentPayload);
      await updatePurchasePayment(id, paymentPayload);

      alert("✅ Payment details updated successfully.");
      await fetchPurchases();
      return;
    }

    // ✅ Normal flow for editable purchases
    await updatePurchase(id, updatedPurchase);

    if (["Completed", "Cancelled"].includes(formData.purchaseStatus)) {
      setOriginalPurchaseStatus(formData.purchaseStatus);
    }
    const existingProducts = selectedProducts.filter(p => p.lotId);
    const newProducts = selectedProducts.filter(p => !p.lotId);

    // 2. Prepare updated product purchase records
    const updatedProductRecords = existingProducts.map(p => ({
      lotId: p.lotId, // Use this as primary key
      purchaseId: parseInt(id),
      productId: p.productId,
      mgfDate: p.mfgDate,
      expiryDate: p.expDate,
      quantityPurchased: p.quantityPurchased,
      purchasePriceBeforeDiscount: p.purchasePriceBeforeDiscount,
      purchasePriceAfterDiscount: p.purchasePriceAfterDiscount,
      totalAmount: p.totalAmount,
      profitMargin: p.profitMargin,
      unitSellingPrice: p.unitSellingPrice
    }));

    // 3. Update them in backend
    await updateProductPurchaseRecords(updatedProductRecords);

     if (newProducts.length > 0) {
  const newProductRecords = newProducts.map(product => ({
    purchaseId: parseInt(id), // ✅ Use the current PurchaseRecord ID
    productId: product.productId,
    mgfDate: product.mfgDate || null,
    expiryDate: product.expDate || null,
    quantityPurchased: parseInt(product.quantityPurchased) || 0,
    purchasePriceBeforeDiscount: parseFloat(product.purchasePriceBeforeDiscount) || 0,
    purchasePriceAfterDiscount: parseFloat(product.purchasePriceAfterDiscount) || 0,
    totalAmount: parseFloat(product.totalAmount) || 0,
    profitMargin: parseFloat(product.profitMargin) || 0,
    unitSellingPrice: parseFloat(product.unitSellingPrice) || 0
  }));

  console.log("Adding new products:", newProductRecords);
  try {
    const addedRecords = await addProductPurchaseRecord(newProductRecords);
    console.log("Successfully added new ProductPurchaseRecords:", addedRecords);
    
    // Update local selectedProducts with lotId from backend response
    if (addedRecords && Array.isArray(addedRecords)) {
      const updatedSelectedProducts = selectedProducts.map(p => {
        const added = addedRecords.find(r => r.productId === p.productId && !p.lotId);
        return added ? { ...p, lotId: added.loTId } : p;
      });
      setSelectedProducts(updatedSelectedProducts);
    }
  } catch (err) {
    console.error("❌ Failed to add new ProductPurchaseRecords:", err.response?.data || err);
    alert("Failed to add new products. Check console for details.");
  }
}

    const existingDiscounts = productDiscounts.filter(d => d.productPurchaseDiscountId);
const newDiscounts = productDiscounts.filter(d => !d.productPurchaseDiscountId);


const updatedDiscounts = existingDiscounts.map(d => ({
  productPurchaseDiscountId: d.productPurchaseDiscountId,
   loTId: d.loTId,
  discountId: d.discountId,
  discountType: d.discountType,
  discountAmount: d.discountAmount,
  discountPercentage: d.discountPercentage
}));

// Format new discounts (backend will generate ID)
const addedDiscounts = newDiscounts.map(d => ({
  loTId: d.loTId,
  discountId: d.discountId,
  discountType: d.discountType,
 discountAmount: parseFloat(d.discountAmount) || 0, // Convert to number
    discountPercentage: parseFloat(d.discountPercentage) || 0 // Convert to number
}));


if (updatedDiscounts.length > 0) {
  await updateProductPurchaseDiscounts(updatedDiscounts);
}

// Then add new ones
if (addedDiscounts.length > 0) {
  for (const discount of addedDiscounts) {
    console.log("Adding ProductPurchaseDiscount payload:", discount);
    await addProductDiscount(discount);
  }
}
const existingPurchaseDiscounts = purchaseDiscountList.filter(d => d.purchaseDiscountId);
const newPurchaseDiscounts = purchaseDiscountList.filter(d => !d.purchaseDiscountId);

const updatedPurchaseDiscounts = existingPurchaseDiscounts.map(d => ({
  purchaseDiscountId: d.purchaseDiscountId,
  purchaseId: parseInt(id),
  discountId: d.discountId,
  discountType: d.discountType,
  discountAmount: parseFloat(d.discountAmount),
  discountPercentage: parseFloat(d.discountPercentage)
}));

const addedPurchaseDiscounts = newPurchaseDiscounts.map(d => ({
  purchaseId: parseInt(id),
  discountId: d.discountId,
  discountType: d.discountType,
  discountAmount: parseFloat(d.discountAmount) || 0,
  discountPercentage: parseFloat(d.discountPercentage) || 0
}));

if (updatedPurchaseDiscounts.length > 0) {
  await updatePurchaseDiscounts(updatedPurchaseDiscounts);
}

// 🔹 Add new discounts
if (addedPurchaseDiscounts.length > 0) {
  try {
    console.log("📤 Adding new PurchaseDiscounts:", addedPurchaseDiscounts);
    await addPurchaseDiscounts(addedPurchaseDiscounts); // ✅ Array payload
  } catch (error) {
    console.error("❌ Failed to add purchase discounts:", error);
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors
        .map(err => `${err.propertyName}: ${err.errorMessage}`)
        .join('\n');
      alert(`Failed to add discounts:\n${errorMessages}`);
    } else {
      alert("Failed to add discounts. Please check console for details.");
    }
    throw error;
  }
}

const existingTaxes = taxList.filter(t => t.purchaseTaxId); // already in DB
const newTaxes = taxList.filter(t => !t.purchaseTaxId);     // newly added

// Format existing taxes for update
const updatedTaxRecords = existingTaxes.map(t => ({
  purchaseTaxId: parseInt(t.purchaseTaxId),
  purchaseId: parseInt(id),
  taxLocationId: parseInt(t.taxLocationId)
}));

// Format new taxes for insert
const addedTaxRecords = newTaxes.map(t => ({
  purchaseId: parseInt(id),
  taxLocationId: parseInt(t.taxLocationId)
}));

// 🔄 Update existing taxes
if (updatedTaxRecords.length > 0) {
  await updatePurchaseTaxes(updatedTaxRecords);
}

// ➕ Add new taxes
if (addedTaxRecords.length > 0) {
  try {
    console.log("📤 Adding new PurchaseTaxes:", addedTaxRecords);
    await addPurchaseTaxes(addedTaxRecords); // 🔧 You need this function in context
  } catch (error) {
    console.error("❌ Failed to add purchase taxes:", error);
    alert("Failed to add new purchase taxes.");
    throw error;
  }
}

alert("✅ Purchase record and all related data updated successfully.");
 await fetchPurchases(); 
 } catch (error) {
    console.error("Failed to update purchase:", error);
    setIsSubmitting(false);
  } finally {
    // ✅ Always navigate, even if some updates fail
    navigate('/purchase/list', { state: { refresh: true } });
  }
};



  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container" style={{ padding: '20px' }}>
        <div className="purchase-header" style={{ marginBottom: '30px' }}>
          <h2>Edit Purchase</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Main form section */}
          <div className="form-section" style={sectionStyle}>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="supplier" style={labelStyle}>Supplier</label>
           <select
  id="supplierId"
  name="supplierId"
  value={formData.supplierId}
  onChange={handleChange}
  required
  style={selectStyle}
>
  <option value="">Select Supplier</option>
  {suppliers.map(supplier => (
    <option key={supplier.supplierId} value={supplier.supplierId}>
      {supplier.supplierName}
    </option>
  ))}
</select>
              </div>

              <div style={formGroupStyle}>
  <label htmlFor="location" style={labelStyle}>
    Location{" "}
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* Info Icon */}
      <span
        onMouseEnter={() => setShowLocationInfo(true)}
        onMouseLeave={() => setShowLocationInfo(false)}
        style={{
          marginLeft: "8px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "12px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease"
        }}
      >
        i
      </span>

      {/* Popup */}
      {showLocationInfo && (
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "0",
            zIndex: 10,
            backgroundColor: "#fff",
            color: "#333",
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "13px",
            lineHeight: "1.4",
            width: "240px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            ⚠️ <b>Note:</b> After updating a purchase with status{" "}
            <b>Completed</b> or <b>Cancelled</b>,
          </div>
          <div>you will not be able to update the Location again.</div>

          {/* Tooltip Arrow */}
          <div
            style={{
              position: "absolute",
              top: "-6px",
              left: "12px",
              width: "12px",
              height: "12px",
              backgroundColor: "#fff",
              borderLeft: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              transform: "rotate(45deg)"
            }}
          />
        </div>
      )}
    </span>
  </label>

  <select
    id="locationId"
    name="locationId"
    value={formData.locationId}
    onChange={handleChange}
    className="form-select"
    required
    style={selectStyle}
    disabled={formData.purchaseStatus === 'Completed' || formData.purchaseStatus === 'Cancelled'}
  >
    <option value="">Select Location</option>
    {locations.map(location => (
      <option key={location.locationId} value={location.locationId}>
        {location.locationName}
      </option>
    ))}
  </select>
</div>

              <div style={formGroupStyle}>
                <label htmlFor="date" style={labelStyle}>Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={formRowStyle}>
              {/* <div style={formGroupStyle}>
                <label htmlFor="amountPaid" style={labelStyle}>Amount Paid</label>
                <input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter amount paid"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                />
              </div> */}

              <div style={formGroupStyle}>
  <label htmlFor="purchaseStatus" style={labelStyle}>
    Purchase Status{" "}
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* Info Icon */}
      <span
        onMouseEnter={() => setShowStatusInfo(true)}
        onMouseLeave={() => setShowStatusInfo(false)}
        style={{
          marginLeft: "8px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "12px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease"
        }}
      >
        i
      </span>

      {/* Popup */}
      {showStatusInfo && (
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "0",
            zIndex: 10,
            backgroundColor: "#fff",
            color: "#333",
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "13px",
            lineHeight: "1.4",
            width: "220px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            ⚠️ <b>Note:</b> Once the status is updated to <b>Completed</b>or <b>Cancelled</b>,
          </div>
          <div>you will not be able to update it again.</div>

          {/* Tooltip Arrow */}
          <div
            style={{
              position: "absolute",
              top: "-6px",
              left: "12px",
              width: "12px",
              height: "12px",
              backgroundColor: "#fff",
              borderLeft: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              transform: "rotate(45deg)"
            }}
          />
        </div>
      )}
    </span>
  </label>

  <select
    id="purchaseStatus"
    name="purchaseStatus"
    value={formData.purchaseStatus}
    onChange={handleChange}
    className="form-select"
    required
    disabled={['Completed', 'Cancelled'].includes(originalPurchaseStatus)}
    style={{
      ...selectStyle,
      backgroundColor: ['Completed', 'Cancelled'].includes(originalPurchaseStatus) ? '#e9ecef' : undefined,
      cursor: ['Completed', 'Cancelled'].includes(originalPurchaseStatus) ? 'not-allowed' : 'pointer'
    }}
  >
    <option value="">Select Purchase Status</option>
    {purchaseStatuses.map(status => (
      <option key={status} value={status}>{status}</option>
    ))}
  </select>
</div>

              <div style={formGroupStyle}>
                <label htmlFor="paymentStatus" style={labelStyle}>Payment Status</label>
       <select
  id="paymentStatus"
  name="paymentStatus"
  value={formData.paymentStatus}
  onChange={handleChange}
  className="form-select"
  required
  style={selectStyle}
>
  <option value="">Select Payment Status</option>
  {paymentStatuses.map(status => (
    <option key={status} value={status}>{status}</option>
  ))}
</select>

              </div>
            </div>

        
          </div>

         {/* Products Section */}
          <div className="section-container" style={sectionStyle}>
            <div style={{
              ...sectionHeaderStyle,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px'
            }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>Products</h3>
            </div>

            <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products by name or ID..."
                value={searchTerm}
                onChange={handleSearch}
                style={inputStyles}
                ref={searchInputRef}
              />
              {searchTerm.length >= 2 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {products.length > 0 ? (
                    products.map(product => (
                      <div 
                        key={product.productId}
                        onClick={() => handleProductSelect(product)}
                        style={{
                          padding: '10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        {product.productName} (ID: {product.productId})
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '10px', color: '#666' }}>
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Table */}
            <div className="table-responsive" style={{ overflowX: 'auto', marginBottom: '30px' }}>
              <table className="data-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={tableHeaderStyle}>Product Name</th>
                    <th style={tableHeaderStyle}>Mfg Date</th>
                    <th style={tableHeaderStyle}>Exp Date</th>
                    <th style={tableHeaderStyle}>Quantity Purchase</th>
                    <th style={tableHeaderStyle}>Price Before Discount</th>
                    <th style={tableHeaderStyle}>Price After Discount</th>
                    <th style={tableHeaderStyle}>Total Amount</th>
                     
                      <th style={tableHeaderStyle}>Discount Type</th>
                      <th style={tableHeaderStyle}>Discount Amount</th>
                      <th style={tableHeaderStyle}>Discount Percentage</th>
                    <th style={tableHeaderStyle}>Profit Margin (%)</th>
                    <th style={tableHeaderStyle}>Unit Selling Price</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
          <tbody>
  {selectedProducts.map((product) => {
    // Find existing discount for this product
    const productDiscount = productDiscounts.find(d => 
      d.productId === product.productId || d.loTId === product.lotId
    );
    
    return (
      <tr key={product.productId} style={{ borderBottom: '1px solid #eee' }}>
        <td style={tableCellStyle}>
          {product.productName}
        </td>
        <td style={tableCellStyle}>
          <input
            type="date"
            value={product.mfgDate}
            onChange={(e) => {
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId ? { ...p, mfgDate: e.target.value } : p
                )
              );
            }}
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="date"
            value={product.expDate}
            onChange={(e) => {
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId ? { ...p, expDate: e.target.value } : p
                )
              );
            }}
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.quantityPurchased || 1}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId
                    ? {
                        ...p,
                        quantityPurchased: value === '' ? '' : parseInt(value),
                        totalAmount: (value === '' ? 0 : parseInt(value)) * (p.purchasePriceAfterDiscount || p.purchasePriceBeforeDiscount || 0)
                      }
                    : p
                )
              );
            }}
            min="1"
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.purchasePriceBeforeDiscount || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              const productDiscount = productDiscounts.find(d => d.productId === product.productId);

              // Calculate the price after discount
              const priceAfterDiscount = productDiscount 
                ? calculateDiscountedPrice({ ...product, purchasePriceBeforeDiscount: value }, productDiscount)
                : value;
              
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId 
                    ? { 
                        ...p, 
                        purchasePriceBeforeDiscount: value,
                        purchasePriceAfterDiscount: priceAfterDiscount,
                        totalAmount: p.quantityPurchased * priceAfterDiscount,
                        unitSellingPrice: calculateSellingPrice(priceAfterDiscount, p.profitMargin)
                      } 
                    : p
                )
              );
            }}
            min="0"
            step="0.01"
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.purchasePriceAfterDiscount || ''}
            readOnly
            style={{ ...inputStyle, backgroundColor: '#f8f9fa' }}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.totalAmount || ''}
            readOnly
            style={{ ...inputStyle, backgroundColor: '#f8f9fa' }}
          />
        </td>

       

        {/* ✅ ADD DISCOUNT TYPE DROPDOWN */}
        <td style={tableCellStyle}>
          <select
            value={productDiscount?.discountType || ''}
            onChange={(e) => {
              const discountType = e.target.value;
              setProductDiscounts(prev => {
                const filtered = prev.filter(d => 
                  d.productId !== product.productId && d.loTId !== product.lotId
                );
                
                if (discountType) {
                  const updatedDiscount = {
                    ...productDiscount,
                    productId: product.productId,
                    loTId: product.lotId,
                    discountType: discountType,
                    discountAmount: productDiscount?.discountAmount || 0,
                    discountPercentage: productDiscount?.discountPercentage || 0
                  };
                  
                  // Recalculate price when discount type changes
                  const priceAfterDiscount = calculateDiscountedPrice(product, updatedDiscount);
                  setSelectedProducts(prevProducts =>
                    prevProducts.map(p =>
                      p.productId === product.productId
                        ? {
                            ...p,
                            purchasePriceAfterDiscount: priceAfterDiscount,
                            totalAmount: p.quantityPurchased * priceAfterDiscount,
                            unitSellingPrice: calculateSellingPrice(priceAfterDiscount, p.profitMargin)
                          }
                        : p
                    )
                  );
                  
                  return [...filtered, updatedDiscount];
                }
                return filtered;
              });
            }}
            style={inputStyle}
          >
            <option value="">Select Type</option>
            {discountTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </td>

        {/* ✅ ADD DISCOUNT AMOUNT INPUT */}
        <td style={tableCellStyle}>
          <input
            type="number"
            value={productDiscount?.discountAmount || ''}
            onChange={(e) => {
              const discountAmount = parseFloat(e.target.value) || 0;
              setProductDiscounts(prev => {
                const filtered = prev.filter(d => 
                  d.productId !== product.productId && d.loTId !== product.lotId
                );
                
                const updatedDiscount = {
                  ...productDiscount,
                  productId: product.productId,
                  loTId: product.lotId,
                  discountType: productDiscount?.discountType || 'Fixed',
                  discountAmount: discountAmount,
                  discountPercentage: productDiscount?.discountPercentage || 0
                };
                
                // Recalculate price when discount amount changes
                const priceAfterDiscount = calculateDiscountedPrice(product, updatedDiscount);
                setSelectedProducts(prevProducts =>
                  prevProducts.map(p =>
                    p.productId === product.productId
                      ? {
                          ...p,
                          purchasePriceAfterDiscount: priceAfterDiscount,
                          totalAmount: p.quantityPurchased * priceAfterDiscount,
                          unitSellingPrice: calculateSellingPrice(priceAfterDiscount, p.profitMargin)
                        }
                      : p
                  )
                );
                
                return [...filtered, updatedDiscount];
              });
            }}
            min="0"
            step="0.01"
            style={inputStyle}
            disabled={!productDiscount?.discountType}
          />
        </td>

        {/* ✅ ADD DISCOUNT PERCENTAGE INPUT */}
        <td style={tableCellStyle}>
          <input
            type="number"
            value={productDiscount?.discountPercentage || ''}
            onChange={(e) => {
              const discountPercentage = parseFloat(e.target.value) || 0;
              setProductDiscounts(prev => {
                const filtered = prev.filter(d => 
                  d.productId !== product.productId && d.loTId !== product.lotId
                );
                
                const updatedDiscount = {
                  ...productDiscount,
                  productId: product.productId,
                  loTId: product.lotId,
                  discountType: productDiscount?.discountType || 'Percentage',
                  discountAmount: productDiscount?.discountAmount || 0,
                  discountPercentage: discountPercentage
                };
                
                // Recalculate price when discount percentage changes
                const priceAfterDiscount = calculateDiscountedPrice(product, updatedDiscount);
                setSelectedProducts(prevProducts =>
                  prevProducts.map(p =>
                    p.productId === product.productId
                      ? {
                          ...p,
                          purchasePriceAfterDiscount: priceAfterDiscount,
                          totalAmount: p.quantityPurchased * priceAfterDiscount,
                          unitSellingPrice: calculateSellingPrice(priceAfterDiscount, p.profitMargin)
                        }
                      : p
                  )
                );
                
                return [...filtered, updatedDiscount];
              });
            }}
            min="0"
            max="100"
            step="0.01"
            style={inputStyle}
            disabled={!productDiscount?.discountType}
          />
        </td>

        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.profitMargin || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId 
                    ? { 
                        ...p, 
                        profitMargin: value,
                        unitSellingPrice: calculateSellingPrice(p.purchasePriceAfterDiscount, value)
                      } 
                    : p
                )
              );
            }}
            min="0"
            max="100"
            step="0.01"
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <input
            type="number"
            value={product.unitSellingPrice || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setSelectedProducts(prev =>
                prev.map(p =>
                  p.productId === product.productId ? { ...p, unitSellingPrice: value } : p
                )
              );
            }}
            min="0"
            step="0.01"
            style={inputStyle}
          />
        </td>
        <td style={tableCellStyle}>
          <button
            type="button"  
            onClick={() => handleDeleteProduct(product.productId)}
            className="btn btn-danger btn-sm"
            style={deleteButtonStyle}
          >
            <i className="fas fa-trash-alt"></i>
            Delete
          </button>
          
         
        </td>
      </tr>
    );
  })}
</tbody>
              </table>
            </div>
            </div>

        
           
              {/* Purchase Discounts Section */}
          <div className="section-container" style={sectionStyle}>
            <div style={{
              ...sectionHeaderStyle,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px'
            }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>Purchase Discounts</h3>
            
            </div>

         <div style={formRowStyle}>
    

    {/* Discount Type Dropdown */}
    <select
      name="discountType"
      value={currentPurchaseDiscount.discountType}
      onChange={handlePurchaseDiscountChange}
      style={selectStyle}
    >
      <option value="">Select Discount Type</option>
      {discountTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  </div>
            {/* Purchase Discount Table */}
            <div className="table-responsive" style={{
              overflowX: 'auto',
              width: '100%',
              position: 'relative',
              marginTop: '20px',
              border: '1px solid #dee2e6',
              borderRadius: '4px'
            }}>
              <table className="data-table" style={{
                width: '100%',
                minWidth: '1000px',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f3f5' }}>
                
                    <th style={tableHeaderStyle}>Discount Type</th>
                    <th style={tableHeaderStyle}>Discount Amount</th>
                    <th style={tableHeaderStyle}>Discount Percentage</th>
                    <th style={{
                      ...tableHeaderStyle,
                      width: '120px',
                      textAlign: 'center'
                    }}>Action</th>
                  </tr>
                </thead>
     <tbody>
  {purchaseDiscountList.map((discount) => (
    <tr key={discount.purchaseDiscountId}>
    
      {/* Discount Type Dropdown */}
      <td>
        <select
          value={discount.discountType}
          onChange={(e) =>
            handlePurchaseDiscountFieldChange(discount.purchaseDiscountId, 'discountType', e.target.value)
          }
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            backgroundColor: '#fff',
            fontSize: '14px',
            width: '100%'
          }}
        >
          <option value="">Select Type</option>
          {discountTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </td>

      {/* Discount Amount */}
      <td>
        <input
          type="number"
          value={discount.discountAmount}
          onChange={(e) =>
            handlePurchaseDiscountFieldChange(discount.purchaseDiscountId, 'discountAmount', e.target.value)
          }
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '14px',
            width: '70%'
          }}
        />
      </td>

      {/* Discount Percentage */}
      <td>
        <input
          type="number"
          value={discount.discountPercentage}
          onChange={(e) =>
            handlePurchaseDiscountFieldChange(discount.purchaseDiscountId, 'discountPercentage', e.target.value)
          }
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            fontSize: '14px',
            width: '70%'
          }}
        />
      </td>

      {/* Delete Button */}
      <td style={{ textAlign: 'center' }}>
      <button
  type="button"   // ✅ prevents form submit navigation
  onClick={() => handleDeletePurchaseDiscount(discount.purchaseDiscountId)}
  style={{
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer'
  }}
>
  Delete
</button>

      </td>
    </tr>
  ))}
</tbody>


              </table>
            </div>
          </div>

        {/* Taxes Section */}
<div className="section-container" style={sectionStyle}>
  <div className="section-header" style={{
    ...sectionHeaderStyle,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px'
  }}>
    <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>Taxes</h3>
    
  </div>

  <div className="section-content">
    {/* Tax dropdown always visible */}
<div style={formRowStyle}>
<select
  name="taxLocationId"
  value={currentTax.taxLocationId || ""}
  onChange={(e) => {
    const selectedTaxLocationId = e.target.value;
    const taxLocation = taxLocations.find(
      (tl) => tl.taxLocationId.toString() === selectedTaxLocationId
    );

    if (taxLocation) {
      setCurrentTax({
        taxLocationId: taxLocation.taxLocationId.toString(),
        taxId: taxLocation.taxId.toString(),
        taxName: getTaxNameById(taxLocation.taxId),
        taxPercentage: taxLocation.taxPercentage,
      });

      // Add to taxList only if not already present
      setTaxList((prev) => {
        if (prev.some((t) => t.taxLocationId === taxLocation.taxLocationId.toString())) {
          return prev;
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            taxLocationId: taxLocation.taxLocationId.toString(),
            taxId: taxLocation.taxId.toString(),
            taxName: getTaxNameById(taxLocation.taxId),
            taxPercentage: taxLocation.taxPercentage,
          },
        ];
      });
    }
  }}
  style={selectStyle}
>
  <option value="">Select Tax</option>
  {taxLocations
    .filter((tl) => tl.locationId.toString() === formData.locationId.toString())
    .map((tl) => (
      <option key={tl.taxLocationId} value={tl.taxLocationId}>
        {getTaxNameById(tl.taxId)} ({tl.taxPercentage}%)
      </option>
    ))}
</select>
   {/* Tooltip Icon */}
    <span
      onMouseEnter={() => setShowTaxTooltip(true)}
      onMouseLeave={() => setShowTaxTooltip(false)}
      style={{
        cursor: "pointer",
        width: "18px",
        height: "18px",
        backgroundColor: "#007bff",
        color: "#fff",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        position: "relative"
      }}
    >
      ?
      {/* Tooltip Popup */}
      {showTaxTooltip && (
        <div
          style={{
            position: "absolute",
            top: "26px",
            left: "-60px",
            zIndex: 1000,
            backgroundColor: "#fff",
            color: "#333",
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "13px",
            lineHeight: "1.4",
            width: "240px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)"
          }}
        >
          💡 <b>Info:</b> Select Location first to apply <b>Taxes</b>

          {/* Tooltip Arrow */}
          <div
            style={{
              position: "absolute",
              top: "-6px",
              left: "20px",
              width: "12px",
              height: "12px",
              backgroundColor: "#fff",
              borderLeft: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              transform: "rotate(45deg)"
            }}
          />
        </div>
      )}
    </span>
</div>
{/* Tax Table */}
<div className="table-responsive" style={{
  overflowX: 'auto',
  width: '100%',
  position: 'relative',
  marginBottom: '20px',
  border: '1px solid #dee2e6',
  borderRadius: '4px'
}}>
  <table className="data-table" style={{
    width: '100%',
    minWidth: '1000px',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    fontSize: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <thead>
      <tr style={{ backgroundColor: '#f1f3f5' }}>
        <th style={tableHeaderStyle}>Tax Name</th>
        <th style={tableHeaderStyle}>Action</th>
      </tr>
    </thead>
  <tbody>
  {taxList.map((tax, index) => (
    <tr key={tax.id}>
      <td style={tableCellStyle}>
   <select
  value={tax.taxLocationId?.toString() || ""}
  onChange={(e) => {
    const selectedTaxLocationId = e.target.value;
    const taxLocation = taxLocations.find(
      tl => tl.taxLocationId.toString() === selectedTaxLocationId
    );

    if (taxLocation) {
      const updatedList = [...taxList];
      updatedList[index] = {
        ...updatedList[index],
        taxLocationId: taxLocation.taxLocationId.toString(),
        taxId: taxLocation.taxId.toString(),
        taxName: getTaxNameById(taxLocation.taxId),
        taxPercentage: taxLocation.taxPercentage
      };
      setTaxList(updatedList);
    }
  }}
  style={{
    width: "100%",
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc"
  }}
>
  <option value="">Select Tax</option>
  {(() => {
    if (!formData.locationId) return null;
    
    // Filter and get latest taxes for this location
    const locationTaxes = taxLocations.filter(tl => 
      tl.locationId?.toString() === formData.locationId?.toString()
    );
    
    // Group by taxId and get latest effective date
    const taxMap = new Map();
    
    locationTaxes.forEach(tl => {
      if (!tl.taxId || !tl.effectiveDate) return;
      
      const existing = taxMap.get(tl.taxId);
      
      if (!existing) {
        taxMap.set(tl.taxId, tl);
      } else {
        const currentDate = new Date(tl.effectiveDate);
        const existingDate = new Date(existing.effectiveDate);
        
        if (currentDate > existingDate) {
          taxMap.set(tl.taxId, tl);
        }
      }
    });
    
    const latestTaxes = Array.from(taxMap.values());
    
    return latestTaxes.map(tl => (
      <option key={tl.taxLocationId} value={tl.taxLocationId.toString()}>
        {tl.tax?.taxName || getTaxNameById(tl.taxId)} ({tl.taxPercentage}%)
      </option>
    ));
  })()}
</select>
      </td>

      <td style={tableCellStyle}>
        <button
          type="button"
          onClick={() => handleDeletePurchaseTax(tax.id)}
          className="btn btn-danger btn-sm"
          style={deleteButtonStyle}
        >
          <i className="fas fa-trash-alt"></i> Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  </div>
</div>

      {!isSubmitting && (
   <div className="financial-summary" style={{
  ...sectionStyle,
  marginBottom: '20px',
  backgroundColor: '#f8f9fa'
}}>
  <h3 style={{ marginBottom: '20px', color: '#333' }}>Financial Summary</h3>
  
   <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Subtotal ({selectedProducts.length} items):</span>
      <span>Rs {calculateTotalAmount()}</span>
    </div>
    
    {purchaseDiscountList.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745' }}>
        <span>Discounts:</span>
        <span>-Rs {calculateDiscountAmount()}</span>
      </div>
    )}
    
    {taxList.length > 0 && (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Taxes:</span>
        <span>+Rs {calculateTaxAmount()}</span>
      </div>
    )}
    
    <hr style={{ margin: '10px 0', borderTop: '2px dashed #dee2e6' }} />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em' }}>
      <span>Grand Total:</span>
      <span>Rs {calculateGrandTotal()}</span>
    </div>
  </div>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  }}>
    {/* Amount Paid */}
    <div style={formGroupStyle}>
      <label style={{...labelStyle, fontWeight: '600'}}>Amount Paid</label>
      <input
        type="number"
        name="amountPaid"
        value={formData.amountPaid}
        onChange={handleChange}
        min="0"
        step="0.01"
        style={inputStyle}
      />
    </div>

    {/* Payment Due */}
    <div style={formGroupStyle}>
  <label style={{ ...labelStyle, fontWeight: '600', color: '#dc3545' }}>
    Payment Due
  </label>
  <input
    type="number"
    value={calculatePaymentDue()}
    readOnly
    style={{
      ...inputStyle,
      backgroundColor: '#f8d7da', // light red for warning
      fontWeight: 'bold',
      color: '#721c24', // dark red text
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '5px 10px'
    }}
  />
  {parseFloat(calculatePaymentDue()) > 0 && (
    <small style={{ color: '#721c24', fontWeight: '500' }}>
      ⚠ You still owe some amount after approved returns
    </small>
  )}
</div>

  </div>
</div>)}
    <div className="form-buttons" style={{ 
            display: 'flex', 
            gap: '15px',
            justifyContent: 'flex-end',
            marginTop: '30px'
          }}>
            <button type="submit" className="btn btn-success" style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#28a745',
              color: '#fff',
              cursor: 'pointer',
              height: '40px',
              minWidth: '120px'
            }}>
              <i className="fas fa-save"></i> Update Purchase
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/purchase/list')}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#dc3545',
                color: '#fff',
                cursor: 'pointer',
                height: '40px',
                minWidth: '120px'
              }}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Shared styles
const tableHeaderStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: '600',
  color: '#495057'
};

const tableCellStyle = {
  padding: '12px 15px',
  verticalAlign: 'middle'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
  height: '40px',
  boxSizing: 'border-box'
};
const inputStyles = {
  width: '225%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
  height: '40px',
  boxSizing: 'border-box'
};



const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
  height: '40px',
  backgroundColor: '#fff',
  boxSizing: 'border-box'
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginBottom: '20px'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontWeight: '500',
  fontSize: '14px',
  color: '#333'
};

const sectionStyle = {
  backgroundColor: '#fff',
  padding: '25px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '30px'
};

const sectionHeaderStyle = {
  backgroundColor: '#f8f9fa',
  padding: '15px 25px',
  borderBottom: '1px solid #eee',
  marginBottom: '20px'
}; 

