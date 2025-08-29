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
    deleteProductPurchaseDiscount,
    deletePurchaseDiscount,
      deletePurchaseTax,
      
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [purchaseDiscountList, setPurchaseDiscountList] = useState([]);
  const [taxList, setTaxList] = useState([]);

  const [currentDiscount, setCurrentDiscount] = useState({
    productSearch: '',
    productId: '',
    productName: '',
    loTId: '',
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

  const [currentTax, setCurrentTax] = useState({
    id: '',
    taxId: '',
    taxName: '',
    taxLocationId: '',
    taxPercentage: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  
  const getTaxNameById = (taxId) => {
    return taxNames.find(t => t.taxId === taxId)?.taxName || '';
  };

  useEffect(() => {
    if (searchTerm?.trim()) {
      fetchProducts(searchTerm);
    }
  }, [searchTerm, fetchProducts]);

  useEffect(() => {
    if (currentPurchaseDiscount.discountCode && currentPurchaseDiscount.discountType) {
      const newDiscount = {
        id: Date.now().toString(),
        discountCode: currentPurchaseDiscount.discountCode,
        discountType: currentPurchaseDiscount.discountType,
        discountAmount: '',
        discountPercentage: ''
      };
      setPurchaseDiscountList(prev => [...prev, newDiscount]);
      setCurrentPurchaseDiscount({
        id: '',
        discountCode: '',
        discountType: '',
        discountAmount: '',
        discountPercentage: ''
      });
    }
  }, [currentPurchaseDiscount.discountCode, currentPurchaseDiscount.discountType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentDiscount(prev => ({
      ...prev,
      [name]: value
    }));

    setDiscountList(prev => {
      const updated = prev.map(discount =>
        discount.productId === currentDiscount.productId
          ? { ...discount, [name]: value }
          : discount
      );
      return updated;
    });
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
              prevProducts.map(p => 
                p.productId === discount.productId 
                  ? { 
                      ...p, 
                      purchasePriceAfterDiscount: newPriceAfterDiscount,
                      totalAmount: p.quantityPurchased * parseFloat(newPriceAfterDiscount)
                    } 
                  : p
              )
            );
          }
          
          return updatedDiscount;
        }
        return discount;
      });

      return updated;
    });
  };

const deleteDiscount = async (id) => {
  try {
    await deleteProductPurchaseDiscount(id); // call backend API
    setDiscountList(prev => prev.filter(discount => discount.id !== id)); // update UI
  } catch (error) {
    console.error('Failed to delete product purchase discount:', error);
  }
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
      if (purchaseDiscountList.length > 0) {
        const purchaseDiscountsToSubmit = purchaseDiscountList.map(discount => {
          const discountCode = discountCodes.find(d => d.discountCode === discount.discountCode);
          
          return {
            purchaseId: createdPurchase.purchaseId,
            discountId: discountCode?.discountId,
            discountType: discount.discountType,
            discountAmount: parseFloat(discount.discountAmount) || 0,
            discountPercentage: parseFloat(discount.discountPercentage) || 0
          };
        }).filter(item => item.discountId);

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
                <label htmlFor="location" style={labelStyle}>Location</label>
                <select
                  id="location"
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="form-select"
                  required
                  style={selectStyle}
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
                  required
                  style={selectStyle}
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
                    {discountList.map((discount) => (
                      <tr key={discount.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tableCellStyle}>{discount.productName}</td>
                        <td style={tableCellStyle}>{discount.discountCode}</td>
                        <td style={tableCellStyle}>{discount.discountType}</td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={discount.discountAmount}
                            onChange={(e) => handleDiscountFieldChange(discount.id, 'discountAmount', e.target.value)}
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
                            onChange={(e) => handleDiscountFieldChange(discount.id, 'discountPercentage', e.target.value)}
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
  onClick={() => deleteDiscount(discount.id)}
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
                    <tr key={discount.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tableCellStyle}>{discount.discountCode}</td>
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
        <tr key={tax.id} style={{ borderBottom: '1px solid #eee' }}>
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
