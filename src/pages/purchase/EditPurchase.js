import React, { useState, useEffect,useRef } from 'react';
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
// const [existingProducts, setExistingProducts] = useState([]);
// const [newProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [purchaseDiscountList, setPurchaseDiscountList] = useState([]);
  const [originalPurchaseStatus, setOriginalPurchaseStatus] = useState('');
  const [productDiscounts, setProductDiscounts] = useState([]);
  const [currentDiscount, setCurrentDiscount] = useState({
    lotId: '',
    discountCode: '',
    discountType: '',
    discountAmount: '',
    discountPercentage: ''
  });
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
      setProductDiscounts(discounts);
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
  taxLocationId: tax.taxLocationId,
  taxName: tax.taxLocation?.tax?.taxName || 'Unknown Tax'
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
    navigate]);
const getTaxNameById = (taxId) => {
  const tax = taxNames.find(t => t.taxId.toString() === taxId.toString());
  return tax ? tax.taxName : 'Unknown';
};
  const handleChange = (e) => {
    const { name, value } = e.target;
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
  

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleDiscountFieldChange = (id, field, value) => {
  //   setDiscountList(prev => prev.map(discount => 
  //     discount.id === id ? { ...discount, [field]: value } : discount
  //   ));
  // };

  // const deleteDiscount = (id) => {
  //   setDiscountList(prev => prev.filter(discount => discount.id !== id));
  // };
const handleDeletePurchaseDiscount = async (id) => {
  try {
    await deletePurchaseDiscount(id); // Call backend API
    setPurchaseDiscountList(prev => prev.filter(discount => discount.id !== id)); // Update UI state
  } catch (error) {
    console.error('Failed to delete purchase discount:', error);
  }
};
  const handlePurchaseDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentPurchaseDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  const deletePurchaseDiscount = (id) => {
    setPurchaseDiscountList(prev => prev.filter(discount => discount.id !== id));
  };

  

  

  const deleteTax = (id) => {
    setTaxList(prev => prev.filter(tax => tax.id !== id));
  };
 
 const handleSubmit = async (e) => {
  e.preventDefault();

  const updatedPurchase = {
    supplierId: parseInt(formData.supplierId),
    locationId: parseInt(formData.locationId),
    date: formData.date,
    amountPaid: parseFloat(formData.amountPaid),
    purchaseStatus: formData.purchaseStatus,
    paymentStatus: formData.paymentStatus
  };

  try {
    // 1. Update the PurchaseRecord
    await updatePurchase(id, updatedPurchase);
 if (['Completed', 'Cancelled'].includes(formData.purchaseStatus)) {
      setOriginalPurchaseStatus(formData.purchaseStatus);
    }
    // 2. Prepare updated product purchase records
    const updatedProductRecords = selectedProducts.map(p => ({
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
const updatedDiscounts = productDiscounts.map(d => ({
  productPurchaseDiscountId: d.productPurchaseDiscountId, // ✅ Primary key
  loTId: d.loTId,
  discountId: d.discountId,
  discountType: d.discountType,
  discountAmount: d.discountAmount,
  discountPercentage: d.discountPercentage
}));

await updateProductPurchaseDiscounts(updatedDiscounts);
const updatedPurchaseDiscounts = purchaseDiscountList.map(d => ({
  purchaseDiscountId: d.purchaseDiscountId,
  purchaseId: parseInt(id),
  discountId: d.discountId,
  discountType: d.discountType,
  discountAmount: parseFloat(d.discountAmount),
  discountPercentage: parseFloat(d.discountPercentage)
}));
await updatePurchaseDiscounts(updatedPurchaseDiscounts);

const updatedTaxRecords = taxList.map(t => ({
  purchaseTaxId: parseInt(t.purchaseTaxId), // You must store this when loading existing taxes
  purchaseId: parseInt(id),
  taxLocationId: parseInt(t.taxLocationId)
}));

await updatePurchaseTaxes(updatedTaxRecords);
    navigate('/purchase/list');
  } catch (error) {
    console.error("Failed to update purchase:", error);
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
                <label htmlFor="location" style={labelStyle}>Location</label>
       <select
  id="locationId"
  name="locationId"
  value={formData.locationId}
  disabled 
  style={{ ...selectStyle, backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
>
  {locations
    .filter(loc => loc.locationId === parseInt(formData.locationId))
    .map(loc => (
      <option key={loc.locationId} value={loc.locationId}>
        {loc.locationName}
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
              <div style={formGroupStyle}>
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
              </div>

              <div style={formGroupStyle}>
                <label htmlFor="purchaseStatus" style={labelStyle}>Purchase Status</label>
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

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #eee'
            }}>
              <button
                type="button"
                onClick={() => {
                  // Add your purchase logic here
                }}
                style={{ 
                  ...addButtonStyle, 
                  width: '130px',
                  backgroundColor: '#28a745',
                  height: '36px',
                  fontSize: '12px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(40, 167, 69, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(40, 167, 69, 0.2)';
                }}
              >
                <i className="fas fa-plus" style={{ fontSize: '10px' }}></i>
                Add Purchase
              </button>
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
                style={inputStyle}
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
                    <th style={tableHeaderStyle}>Profit Margin (%)</th>
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
                            
                            setSelectedProducts(prev =>
                              prev.map(p =>
                                p.productId === product.productId 
                                  ? { 
                                      ...p, 
                                      purchasePriceBeforeDiscount: value,
                                      purchasePriceAfterDiscount: productDiscount 
                                        ? calculateDiscountedPrice({ ...p, purchasePriceBeforeDiscount: value }, productDiscount)
                                        : value,
                                      totalAmount: p.quantityPurchased * (productDiscount 
                                        ? calculateDiscountedPrice({ ...p, purchasePriceBeforeDiscount: value }, productDiscount)
                                        : value)
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
                        <input
                          type="number"
                          value={product.profitMargin || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0 ;
                            setSelectedProducts(prev =>
                              prev.map(p =>
                                p.productId === product.productId ? { ...p, profitMargin: value } : p
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

        
            {/* Discount Section */}
            <div style={sectionStyle}>
              <div style={{
                ...sectionHeaderStyle,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: '500' }}>Add Discount</h4>
              
              </div>

              {/* Product Search Bar */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <input
                  id="discount-search"
                  type="text"
                  placeholder="Search products to apply discount..."
                  value={currentDiscount.productSearch}
                  onChange={(e) => {
                    setCurrentDiscount(prev => ({
                      ...prev,
                      productSearch: e.target.value
                    }));
                  }}
                  style={inputStyle}
                />
                {currentDiscount.productSearch && (
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
                    {selectedProducts
                      .filter(product => 
                        product.productName.toLowerCase().includes(currentDiscount.productSearch.toLowerCase()) ||
                        product.productId.toString().includes(currentDiscount.productSearch)
                      )
                      .map(product => (
                        <div 
                          key={product.productId}
                          onClick={() => {
                            const alreadyAdded = discountList.find(d => d.productId === product.productId);
                            if (alreadyAdded) {
                              alert("This product is already in the discount table.");
                              return;
                            }

                            const newDiscount = {
                              id: Date.now(),
                              productId: product.productId,
                              productName: product.productName,
                              loTId: product.loTId,             
                              discountCode: '',
                              discountType: '',
                              discountAmount: '',
                              discountPercentage: ''
                            };

                            setDiscountList(prev => [...prev, newDiscount]);

                            setCurrentDiscount({
                              productSearch: '',
                              productId: product.productId,
                              productName: product.productName,
                              loTId: product.loTId,
                              discountCode: '',
                              discountType: '',
                              discountAmount: '',
                              discountPercentage: ''
                            });
                          }}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            backgroundColor: currentDiscount.productId === product.productId ? '#f0f0f0' : '#fff'
                          }}
                        >
                          {product.productName} (ID: {product.productId})
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
              <div style={formRowStyle}>
                <select
                  name="discountCode"
                  value={currentDiscount.discountCode}
                  onChange={handleDiscountChange}
                  style={selectStyle}
                >
                  <option value="">Select Discount Code</option>
                  {discountCodes.map(code => (
                    <option key={code.discountId} value={code.discountCode}>
                      {code.discountCode} ({code.status})
                    </option>
                  ))}
                </select>

                <select
                  name="discountType"
                  value={currentDiscount.discountType}
                  onChange={handleDiscountChange}
                  style={selectStyle}
                >
                  <option value="">Select Discount Type</option>
                  {discountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <div style={{ visibility: 'hidden' }}></div>
              </div>

              {/* Discount Table */}
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
                  minWidth: '1200px',
                  borderCollapse: 'collapse',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                      <th style={tableHeaderStyle}>Product Name</th>
                      <th style={tableHeaderStyle}>Discount Code</th>
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
  {productDiscounts.map((d, index) => {
    // Find the corresponding product
    const product = selectedProducts.find(p => p.lotId === d.loTId);
    
    return (
      <tr key={index}>
        <td>{d.productName}</td>
        <td>{d.discountCode}</td>
        
        {/* Discount Type */}
        <td>
          <select
            style={selectCellStyle}
            value={d.discountType}
            onChange={(e) => {
              const newVal = [...productDiscounts];
              newVal[index] = { ...newVal[index], discountType: e.target.value };
              setProductDiscounts(newVal);
              
              // Recalculate price after discount
              if (product) {
                setSelectedProducts(prev => 
                  prev.map(p => 
                    p.lotId === d.loTId 
                      ? { 
                          ...p, 
                          purchasePriceAfterDiscount: calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          ),
                          totalAmount: p.quantityPurchased * calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          )
                        } 
                      : p
                  )
                );
              }
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
            style={inputCellStyle}
            placeholder="Enter Amount"
            min="0"
            step="1"
            value={d.discountAmount}
            onChange={(e) => {
              const newVal = [...productDiscounts];
              newVal[index] = { 
                ...newVal[index], 
                discountAmount: parseFloat(e.target.value) || 0 
              };
              setProductDiscounts(newVal);
              
              // Recalculate price after discount
              if (product) {
                setSelectedProducts(prev => 
                  prev.map(p => 
                    p.lotId === d.loTId 
                      ? { 
                          ...p, 
                          purchasePriceAfterDiscount: calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          ),
                          totalAmount: p.quantityPurchased * calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          )
                        } 
                      : p
                  )
                );
              }
            }}
          />
        </td>

        {/* Discount Percentage */}
        <td>
          <input
            type="number"
            style={inputCellStyle}
            placeholder="Enter Percentage"
            min="0"
            max="100"
            value={d.discountPercentage}
            onChange={(e) => {
              const newVal = [...productDiscounts];
              newVal[index] = { 
                ...newVal[index], 
                discountPercentage: parseFloat(e.target.value) || 0 
              };
              setProductDiscounts(newVal);
              
              // Recalculate price after discount
              if (product) {
                setSelectedProducts(prev => 
                  prev.map(p => 
                    p.lotId === d.loTId 
                      ? { 
                          ...p, 
                          purchasePriceAfterDiscount: calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          ),
                          totalAmount: p.quantityPurchased * calculateDiscountedPrice(
                            p, 
                            newVal[index]
                          )
                        } 
                      : p
                  )
                );
              }
            }}
          />
        </td>
        
        <td>
          <button
            onClick={() => {
              // Remove discount and reset price
              const newDiscounts = productDiscounts.filter((_, i) => i !== index);
              setProductDiscounts(newDiscounts);
              
              if (product) {
                setSelectedProducts(prev =>
                  prev.map(p =>
                    p.lotId === d.loTId
                      ? {
                          ...p,
                          purchasePriceAfterDiscount: p.purchasePriceBeforeDiscount,
                          totalAmount: p.quantityPurchased * p.purchasePriceBeforeDiscount
                        }
                      : p
                  )
                );
              }
            }}
            className="btn btn-danger btn-sm"
            style={deleteButtonStyle}
          >
            <i className="fas fa-trash-alt"></i> Delete
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
              <select
                id="purchase-discount-code"
                name="discountCode"
                value={currentPurchaseDiscount.discountCode}
                onChange={handlePurchaseDiscountChange}
                style={selectStyle}
              >
                <option value="">Select Discount Code</option>
                {discountCodes.map(code => (
                  <option key={code.discountId} value={code.discountCode}>
                    {code.discountCode} ({code.status})
                  </option>
                ))}
              </select>

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
                    <th style={tableHeaderStyle}>Discount Code</th>
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
      {/* Discount Code */}
      <td>{discountCodes.find(dc => dc.discountId === discount.discountId)?.discountCode || 'N/A'}</td>

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

      // Reset dropdown
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
    <tr key={tax.id}>
      <td style={tableCellStyle}>{tax.taxName}</td>
      <td style={tableCellStyle}>
        <button
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
                backgroundColor: '#6c757d',
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

  const addButtonStyle = {
    padding: '0 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#28a745',
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
    boxShadow: '0 1px 3px rgba(40, 167, 69, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content'
  };
const inputCellStyle = {
  width: '150px',
  padding: '8px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box'
};

const selectCellStyle = {
  ...inputCellStyle,
  backgroundColor: '#fff'
};