import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { usePurchase } from '../../context/PurchaseContext';

import '../../styles/purchase/Purchase.css';

export default function AddPurchase() {
  const navigate = useNavigate();
  const { 
    
    suppliers, 
    locations, 
    purchaseStatuses, 
    paymentStatuses,
    fetchProducts,
    products,
    addPurchase,
    addProductPurchaseRecord,
    addProductPurchaseDiscount,
    addPurchaseDiscount,
    addPurchaseTax,
    taxNames,
    taxLocations,
    discountCodes,
    discountTypes,
    deleteProductPurchaseRecord,

    deletePurchaseDiscount,
      deletePurchaseTax,
      
      
  } = usePurchase();
  const [isPurchaseCompleted] = useState(false);
const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [showStatusInfo, setShowStatusInfo] = useState(false);
const [showProfitInfo, setShowProfitInfo] = useState(false);
const [showTaxTooltip, setShowTaxTooltip] = useState(false);

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

  const searchInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    locationId: '',
    date: new Date().toISOString().split('T')[0],
    amountPaid: '',
    purchaseStatus: 'Pending',
    paymentStatus: 'Unpaid',
  });
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

const calculateTaxAmount = () => {
  const subtotal = parseFloat(calculateTotalAmount()) || 0;
  let discountAmount = parseFloat(calculateDiscountAmount()) || 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  let totalTaxAmount = 0;
  taxList.forEach(tax => {
    const taxPercentage = parseFloat(tax.taxPercentage) || 0;
    totalTaxAmount += discountedSubtotal * (taxPercentage / 100);
  });
  
  return totalTaxAmount.toFixed(2);
};
const calculatePaymentDue = () => {
  const grandTotal = parseFloat(calculateGrandTotal());
  const amountPaid = parseFloat(formData.amountPaid) || 0;
  return Math.max(0, grandTotal - amountPaid).toFixed(2);
};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [purchaseDiscountList, setPurchaseDiscountList] = useState([]);
  const [taxList, setTaxList] = useState([]);


  const [currentPurchaseDiscount, setCurrentPurchaseDiscount] = useState({
    id: '',
    discountCode: '',
    discountType: '',
    discountAmount: '',
    discountPercentage: ''
  });

  const [currentTax, setCurrentTax] = useState({
    id: '',
    taxId: '',
    taxName: '',
    taxLocationId: '',
    taxPercentage: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  
 const getTaxNameById = (taxId) => {
  if (!taxId || !taxNames.length) return '';
  const match = taxNames.find(t => t.taxId.toString() === taxId.toString());
  return match ? match.taxName : '';
};
  useEffect(() => {
    if (searchTerm?.trim()) {
      fetchProducts(searchTerm);
    }
  }, [searchTerm, fetchProducts]);

  useEffect(() => {
    if (currentPurchaseDiscount.discountType) {
      const newDiscount = {
        id: Date.now().toString(),
     
        discountType: currentPurchaseDiscount.discountType,
        discountAmount: '',
        discountPercentage: ''
      };
      setPurchaseDiscountList(prev => [...prev, newDiscount]);
      setCurrentPurchaseDiscount({
        id: '',

        discountType: '',
        discountAmount: '',
        discountPercentage: ''
      });
    }
  }, [ currentPurchaseDiscount.discountType]);

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

    if (name === 'locationId') {
      setTaxList([]);
      setCurrentTax(prev => ({
        ...prev,
        location: value,
        locationName: locations.find(l => l.locationId.toString() === value)?.locationName || ''
      }));
    }
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
      // Initialize an empty discount record for this product
    const newDiscount = {
      id: Date.now().toString(),
      productId: product.productId,
      discountType: '', // Start with empty discount type
      discountAmount: '',
      discountPercentage: ''
    };
    
    setDiscountList(prev => [...prev, newDiscount]);
    setSearchTerm('');
  } else {
    alert('This product has already been added');
  }
  };


const handleDiscountFieldChange = (id, field, value) => {
  setDiscountList(prev => {
    const updated = prev.map(discount => {
      if (discount.id === id) {
        const updatedDiscount = { ...discount, [field]: value };
        
        const product = selectedProducts.find(p => p.productId === discount.productId);
        if (product) {
          const newPriceAfterDiscount = calculateDiscountedPrice(product, updatedDiscount);

          setSelectedProducts(prevProducts => 
            prevProducts.map(p => {
              if (p.productId === discount.productId) {
                let newUnitSellingPrice = p.unitSellingPrice;

                // ✅ Only recalc Selling Price if ProfitMargin > 0
                if (p.profitMargin && p.profitMargin > 0) {
                  newUnitSellingPrice = calculateSellingPrice(newPriceAfterDiscount, p.profitMargin);
                }

                return { 
                  ...p, 
                  purchasePriceAfterDiscount: newPriceAfterDiscount,
                  totalAmount: p.quantityPurchased * parseFloat(newPriceAfterDiscount),
                  unitSellingPrice: newUnitSellingPrice
                };
              }
              return p;
            })
          );
        }
        
        return updatedDiscount;
      }
      return discount;
    });

    return updated;
  });
};



  const handlePurchaseDiscountChange = (e) => {
    const { name, value } = e.target;

    if (name === "discountCode") {
      const selected = discountCodes.find(d => d.discountCode === value);
      setCurrentPurchaseDiscount(prev => ({
        ...prev,
        discountCode: value,
        discountId: selected?.discountId || 0
      }));
    } else {
      setCurrentPurchaseDiscount(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePurchaseDiscountFieldChange = (id, field, value) => {
    setPurchaseDiscountList(prev => prev.map(discount => 
      discount.id === id ? { ...discount, [field]: value } : discount
    ));
  };

  const handleDeletePurchaseDiscount = async (id) => {
  try {
    await deletePurchaseDiscount(id); // Call backend API
    setPurchaseDiscountList(prev => prev.filter(discount => discount.id !== id)); // Update UI state
  } catch (error) {
    console.error('Failed to delete purchase discount:', error);
  }
};

 const deleteTax = async (id) => {
  try {
    await deletePurchaseTax(id); // Delete from backend
    setTaxList(prev => prev.filter(tax => tax.id !== id)); // Update frontend list
  } catch (error) {
    console.error('Failed to delete purchase tax:', error);
  }
};

  const handleDeleteProduct = async (productId) => {
  const productToDelete = selectedProducts.find(product => product.productId === productId);

  if (productToDelete?.productPurchaseRecordId) {
    try {
      await deleteProductPurchaseRecord(productToDelete.productPurchaseRecordId);
    } catch (error) {
      console.error('Failed to delete product purchase record:', error);
    }
  }

  setSelectedProducts(prev => prev.filter(product => product.productId !== productId));
  setDiscountList(prev => prev.filter(discount => discount.productId !== productId));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.supplierId || !formData.locationId) {
        throw new Error('Please select supplier and location');
      }

      if (selectedProducts.length === 0) {
        throw new Error('Please add at least one product');
      }
  for (const product of selectedProducts) {
      if (
        !product.productName ||
        !product.quantityPurchased ||
        !product.purchasePriceBeforeDiscount ||
        !product.purchasePriceAfterDiscount ||
        !product.totalAmount ||
        product.profitMargin === "" || 
        product.unitSellingPrice === "" ||
        !product.mfgDate ||
        !product.expDate
      ) {
        throw new Error(`Please complete all fields for product: ${product.productName || 'Unnamed Product'}`);
      }
    }
      // 1. Create Purchase Record
      const purchaseData = {
        supplierId: parseInt(formData.supplierId),
        locationId: parseInt(formData.locationId),
        date: formData.date,
        amountPaid: parseFloat(formData.amountPaid || 0),
        purchaseStatus: formData.purchaseStatus,
        paymentStatus: formData.paymentStatus,
      };

      const createdPurchase = await addPurchase(purchaseData);

      // 2. Add Product Purchase Records
      const productsToSubmit = selectedProducts.map(product => ({
        purchaseId: createdPurchase.purchaseId,
        productId: product.productId,
        mgfDate: product.mfgDate || null,
        expiryDate: product.expDate || null,
        quantityPurchased: parseInt(product.quantityPurchased) || 0,
        purchasePriceBeforeDiscount: parseFloat(product.purchasePriceBeforeDiscount || 0),
        purchasePriceAfterDiscount: parseFloat(product.purchasePriceAfterDiscount || 0),
        totalAmount: parseFloat(product.totalAmount || 0),
        profitMargin: parseFloat(product.profitMargin || 0),
        unitSellingPrice: parseFloat(product.unitSellingPrice || 0)     
      }));

      const productRecords = await addProductPurchaseRecord(productsToSubmit);

      // 3. Add Product Discounts
      if (discountList.length > 0) {
        const productDiscountsToSubmit = discountList.map(discount => {
          const product = selectedProducts.find(p => p.productId === discount.productId);
          const discountCode = discountCodes.find(d => d.discountCode === discount.discountCode);
          
          return {
            loTId: product?.loTId || productRecords.find(p => p.productId === discount.productId)?.loTId,
            discountId: discountCode?.discountId,
            discountType: discount.discountType,
            discountAmount: parseFloat(discount.discountAmount) || 0,
            discountPercentage: parseFloat(discount.discountPercentage) || 0
          };
        }).filter(item => item.loTId);

        if (productDiscountsToSubmit.length > 0) {
          await addProductPurchaseDiscount(productDiscountsToSubmit);
        }
      }

      // 4. Add Purchase Discounts
    // 4. Add Purchase Discounts
if (purchaseDiscountList.length > 0) {
  const purchaseDiscountsToSubmit = purchaseDiscountList.map(discount => {
    // For purchase-level discounts, we don't need discount codes
    // Just submit the discount details directly
    return {
      purchaseId: createdPurchase.purchaseId,
      discountType: discount.discountType,
      discountAmount: parseFloat(discount.discountAmount) || 0,
      discountPercentage: parseFloat(discount.discountPercentage) || 0
    };
  }).filter(discount => 
    discount.discountType && // Ensure discount type is selected
    (discount.discountAmount > 0 || discount.discountPercentage > 0) // Ensure some discount value is provided
  );

  if (purchaseDiscountsToSubmit.length > 0) {
    await addPurchaseDiscount(purchaseDiscountsToSubmit);
  }
}
      // 5. Add Purchase Taxes
      if (taxList.length > 0) {
        const taxesToSubmit = taxList.map(tax => ({
          purchaseId: createdPurchase.purchaseId,
          taxLocationId: tax.taxLocationId
        }));

        await addPurchaseTax(taxesToSubmit);
      }

      alert('Purchase created successfully!');
     navigate('/purchase/list', { state: { refresh: true } });
    } catch (error) {
      console.error('Error submitting purchase:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Style constants
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

  const deleteButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    height: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    width: '100px',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
  };

 
  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container" style={{ padding: '20px' }}>
        <div className="purchase-header" style={{ marginBottom: '30px' }}>
          <h2>Add New Purchase</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Main form section */}
          <div className="form-section" style={sectionStyle}>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="supplier" style={labelStyle}>Supplier</label>
                <select
                  id="supplier"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="form-select"
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
        ?
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
            ⚠️ <b>Note:</b> After adding a purchase with status{" "}
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
    id="location"
    name="locationId"
    value={formData.locationId}
    onChange={handleChange}
    className="form-select"
    required
    style={selectStyle}
    disabled={isPurchaseCompleted}  // ✅ lock after submit with Completed
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
          width: "18px",   // smaller size
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#007bff", // Blue circle
          color: "#fff", // White text
          fontWeight: "bold",
          fontSize: "12px", // smaller font
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease"
        }}
      >
        ?
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
            ⚠️ <b>Note:</b> Once the status is set to <b>Completed</b> or <b>Cancelled</b>,
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
  required
  style={selectStyle}
  disabled={isPurchaseCompleted} 
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

<th style={{ ...tableHeaderStyle, position: "relative", overflow: "visible" }}>
  Profit Margin (%){" "}
  <span
    onMouseEnter={() => setShowProfitInfo(true)}
    onMouseLeave={() => setShowProfitInfo(false)}
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
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      transition: "all 0.2s ease",
      position: "relative",
      zIndex: 20
    }}
  >
    i
    {showProfitInfo && (
      <div
        style={{
          position: "absolute",
          top: "-130px",            // move popup **above** column
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          backgroundColor: "#fff",
          color: "#222",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid #e1e5e9",
          fontSize: "13px",
          lineHeight: "1.5",
          width: "280px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          fontWeight: "normal",
          textAlign: "left",
          whiteSpace: "normal"
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
          💡 Profit Margin Guide
        </div>
        <div>
          The profit margin % is used to automatically calculate the <b>selling price</b>.
        </div>

        {/* Tooltip Arrow */}
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "12px",
            height: "12px",
            backgroundColor: "#fff",
            borderRight: "1px solid #e1e5e9",
            borderBottom: "1px solid #e1e5e9"
          }}
        />
      </div>
    )}
  </span>
</th>




                    <th style={tableHeaderStyle}>Unit Selling Price</th>
                    <th style={tableHeaderStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => (
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
      const productDiscount = discountList.find(d => d.productId === product.productId);
      
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
                // Recalculate selling price based on discounted price
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
                      
<td style={tableCellStyle}>
  <select
    value={discountList.find(d => d.productId === product.productId)?.discountType || ''}
    onChange={(e) => handleDiscountFieldChange(
      discountList.find(d => d.productId === product.productId)?.id,
      'discountType',
      e.target.value
    )}
    style={selectStyle}
  >
    <option value="">Select Type</option>
    {discountTypes.map(type => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
</td>
<td style={tableCellStyle}>
  <input
    type="number"
    value={discountList.find(d => d.productId === product.productId)?.discountAmount || ''}
    onChange={(e) => handleDiscountFieldChange(
      discountList.find(d => d.productId === product.productId)?.id,
      'discountAmount',
      e.target.value
    )}
    style={inputStyle}
    placeholder="Amount"
    min="0"
    step="0.01"
    disabled={discountList.find(d => d.productId === product.productId)?.discountType !== 'Fixed'}
  />
</td>
<td style={tableCellStyle}>
  <input
    type="number"
    value={discountList.find(d => d.productId === product.productId)?.discountPercentage || ''}
    onChange={(e) => handleDiscountFieldChange(
      discountList.find(d => d.productId === product.productId)?.id,
      'discountPercentage',
      e.target.value
    )}
    style={inputStyle}
    placeholder="Percentage"
    min="0"
    max="100"
    step="0.01"
    disabled={discountList.find(d => d.productId === product.productId)?.discountType !== 'Percentage'}
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
                            const value = parseFloat(e.target.value) || 0 ;
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
    onClick={() => handleDeleteProduct(product.productId)}
    className="btn btn-danger btn-sm"
    style={deleteButtonStyle}
  >
    <i className="fas fa-trash-alt"></i>
    Delete
  </button>
</td>
                    </tr>
                  ))}
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
           

              <select
                name="discountType"
                value={currentPurchaseDiscount.discountType}
                onChange={handlePurchaseDiscountChange}
                style={selectStyle}
              >
                <option value="">Select Discount Type</option>
                {discountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <div style={{ visibility: 'hidden' }}></div>
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
                    <tr key={discount.id} style={{ borderBottom: '1px solid #eee' }}>
                  
                      <td style={tableCellStyle}>{discount.discountType}</td>
                      <td style={tableCellStyle}>
                        <input
                          type="number"
                          value={discount.discountAmount}
                          onChange={(e) => handlePurchaseDiscountFieldChange(discount.id, 'discountAmount', e.target.value)}
                          style={inputStyle}
                          placeholder="Enter Amount"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td style={tableCellStyle}>
                        <input
                          type="number"
                          value={discount.discountPercentage}
                          onChange={(e) => handlePurchaseDiscountFieldChange(discount.id, 'discountPercentage', e.target.value)}
                          style={inputStyle}
                          placeholder="Enter Percentage"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td style={{
                        ...tableCellStyle,
                        width: '120px',
                        textAlign: 'center'
                      }}>
                      <button
                        type="button"
  onClick={() => handleDeletePurchaseDiscount(discount.id)}
  className="btn btn-danger btn-sm"
  style={deleteButtonStyle}
>
  <i className="fas fa-trash-alt"></i>
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
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <select
      name="taxLocationId"
      value={currentTax.taxLocationId}
      onChange={(e) => {
        const selectedTaxLocationId = e.target.value;
        const taxLocation = taxLocations.find(
          tl => tl.taxLocationId.toString() === selectedTaxLocationId
        );

        if (taxLocation) {
          const newTax = {
            id: Date.now().toString(),
            taxLocationId: taxLocation.taxLocationId.toString(),
            taxId: taxLocation.taxId.toString(),
            taxName: getTaxNameById(taxLocation.taxId),
            taxPercentage: taxLocation.taxPercentage
          };

          const isDuplicate = taxList.some(
            t => t.taxLocationId === newTax.taxLocationId
          );

          if (!isDuplicate) {
            setTaxList(prev => [...prev, newTax]);
          }

          setCurrentTax({
            taxLocationId: '',
            taxId: '',
            taxName: ''
          });
        }
      }}
      style={selectStyle}
    >
      <option value="">Select Tax</option>
      {taxLocations
        .filter(tl => tl.locationId.toString() === formData.locationId)
        .map(tl => (
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
      {taxList.map((tax) => (
        <tr key={tax.id} style={{ borderBottom: '1px solid #eee' }}>
          <td style={tableCellStyle}>{tax.taxName}</td>
          <td style={tableCellStyle}>
            <button
              type="button"
              onClick={() => deleteTax(tax.id)}
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
      <label style={{...labelStyle, fontWeight: '600', color: '#dc3545'}}>Payment Due</label>
      <input
        type="number"
        value={calculatePaymentDue()}
        readOnly
        style={{...inputStyle, backgroundColor: '#e9ecef', fontWeight: 'bold', color: '#dc3545'}}
      />
    </div>
  </div>
</div>

       <div className="form-buttons" style={{ 
            display: 'flex', 
            gap: '15px',
            justifyContent: 'flex-end',
            marginTop: '30px'
          }}>
            {error && (
              <div style={{ color: 'red', marginRight: 'auto' }}>
                {error}
              </div>
            )}
            <button 
              type="submit" 
              className="btn btn-success" 
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isSubmitting ? '#dc3545' : '#4299e1 ',
                color: '#fff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                height: '40px',
                minWidth: '120px'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Purchase
                </>
              )}
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
