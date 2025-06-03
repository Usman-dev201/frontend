import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { usePurchase } from '../../context/PurchaseContext';
import '../../styles/purchase/Purchase.css';

export default function AddPurchase() {
  const navigate = useNavigate();
 const { 
  addPurchase,
  suppliers,
  locations,
  purchaseStatuses,
  paymentStatuses,
  fetchProducts,
  products 
} = usePurchase();
  
 
  
 const [formData, setFormData] = useState({
    supplierId: '',
    locationId: '',
    date: new Date().toISOString().split('T')[0],
    amountPaid: '',
    purchaseStatus: 'Pending',
    paymentStatus: 'Unpaid',
    products: []
  });

 const [searchTerm, setSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountList, setDiscountList] = useState([]);
  const [purchaseDiscountList, setPurchaseDiscountList] = useState([]);
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


  // Mock discount codes - replace with your actual discount codes
  const discountCodes = ['DISC10', 'DISC20', 'DISC30', 'BULK15'];
  const discountTypes = ['Percentage', 'Fixed Amount'];

  // Mock tax names - replace with your actual tax data
  const taxNames = ['GST', 'VAT', 'Sales Tax', 'Service Tax'];

  
useEffect(() => {
    if (searchTerm.trim() !== '') {
      fetchProducts(searchTerm);
    }
  }, [searchTerm, fetchProducts]); 
  useEffect(() => {
    // Add discount when both dropdowns are selected
    if (currentDiscount.discountCode && currentDiscount.discountType) {
      const newDiscount = {
        id: Date.now().toString(),
        lotId: '',
        discountCode: currentDiscount.discountCode,
        discountType: currentDiscount.discountType,
        discountAmount: '',
        discountPercentage: ''
      };
      setDiscountList(prev => [...prev, newDiscount]);
      setCurrentDiscount({
        lotId: '',
        discountCode: '',
        discountType: '',
        discountAmount: '',
        discountPercentage: ''
      });
    }
  }, [currentDiscount.discountCode, currentDiscount.discountType]);

  useEffect(() => {
    // Add purchase discount when both dropdowns are selected
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

  useEffect(() => {
    // Add tax when tax name is selected (location is already set from main form)
    if (currentTax.taxName && formData.location) {
      const newTax = {
        id: Date.now().toString(),
        taxName: currentTax.taxName,
        location: formData.location,
        taxPercentage: '',
        effectiveDate: ''
      };
      setTaxList(prev => [...prev, newTax]);
      setCurrentTax(prev => ({
        ...prev,
        taxName: '', // Only reset tax name, keep the location from main form
      }));
    }
  }, [currentTax.taxName, formData.location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset tax list if location changes
    if (name === 'location') {
      setTaxList([]);
      setCurrentTax(prev => ({
        ...prev,
        location: value
      }));
    }
  };

 const handleSearch = async (e) => {
  const searchTerm = e.target.value;
  setSearchTerm(searchTerm);
  
  // Only search if term is at least 2 characters long
  if (searchTerm.length >= 2) {
    try {
      await fetchProducts(searchTerm);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  }
};

 
const handleProductSelect = (product) => {
  // Check if product already exists in availableProducts
  const exists = availableProducts.some(p => p.id === product.productId);
  
  if (!exists) {
    const newProduct = {
      id: product.productId,
      name: product.productName,
      lotId: '', // You can generate this or leave empty
      mfgDate: '',
      expDate: '',
      quantityPurchase: 1, // Default quantity
      priceBeforeDiscount: 0,
      priceAfterDiscount: 0,
      profitMargin: 0,
      unitSellingPrice: 0
    };
    
    setAvailableProducts(prev => [...prev, newProduct]);
    setSelectedProducts(prev => [...prev, newProduct]);
  }
};
  const calculateTotalAmount = (product) => {
    return product.quantityPurchase * product.priceAfterDiscount;
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = availableProducts.map(product => {
      if (product.id === productId) {
        return { ...product, quantityPurchase: Number(quantity) };
      }
      return product;
    });
    setSelectedProducts(updatedProducts.filter(p => p.quantityPurchase > 0));
  };

  const handleDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiscountFieldChange = (id, field, value) => {
    setDiscountList(prev => prev.map(discount => 
      discount.id === id ? { ...discount, [field]: value } : discount
    ));
  };

  const deleteDiscount = (id) => {
    setDiscountList(prev => prev.filter(discount => discount.id !== id));
  };

  const handlePurchaseDiscountChange = (e) => {
    const { name, value } = e.target;
    setCurrentPurchaseDiscount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePurchaseDiscountFieldChange = (id, field, value) => {
    setPurchaseDiscountList(prev => prev.map(discount => 
      discount.id === id ? { ...discount, [field]: value } : discount
    ));
  };

  const deletePurchaseDiscount = (id) => {
    setPurchaseDiscountList(prev => prev.filter(discount => discount.id !== id));
  };

  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setCurrentTax(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const deleteTax = (id) => {
    setTaxList(prev => prev.filter(tax => tax.id !== id));
  };

  const handleTaxFieldChange = (id, field, value) => {
    setTaxList(prev => prev.map(tax => 
      tax.id === id ? { ...tax, [field]: value } : tax
    ));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const productsToSubmit = selectedProducts.map(product => ({
      productId: product.productId,
      quantity: parseFloat(product.quantityPurchase),
      priceBeforeDiscount: parseFloat(product.priceBeforeDiscount),
      priceAfterDiscount: parseFloat(product.priceAfterDiscount),
      profitMargin: parseFloat(product.profitMargin),
      unitSellingPrice: parseFloat(product.unitSellingPrice),
      mfgDate: product.mfgDate,
      expDate: product.expDate,
      discounts: [] // Include if needed
    }));

    const purchaseData = {
      supplierId: formData.supplierId,
      locationId: formData.locationId,
      date: formData.date,
      amountPaid: parseFloat(formData.amountPaid),
      purchaseStatus: formData.purchaseStatus,
      paymentStatus: formData.paymentStatus,
      products: productsToSubmit,
      purchaseDiscounts: [], 
      purchaseTaxes: [] 
    };

    await addPurchase(purchaseData);
    navigate('/purchase/list');
  } catch (error) {
    console.error('Error submitting purchase:', error);
  }
};

  // Add delete product handler
  const handleDeleteProduct = (productId) => {
    setAvailableProducts(prev => prev.filter(product => product.id !== productId));
    setSelectedProducts(prev => prev.filter(product => product.id !== productId));
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
  name="supplier"
  value={formData.supplier}
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
  name="location"
  value={formData.location}
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
              <button
                type="button"
                onClick={() => {
                  const newProduct = {
                    id: Date.now().toString(),
                    name: '',
                    lotId: '',
                    mfgDate: '',
                    expDate: '',
                    quantityPurchase: 0,
                    priceBeforeDiscount: 0,
                    priceAfterDiscount: 0,
                    profitMargin: 0,
                    unitSellingPrice: 0
                  };
                  setAvailableProducts(prev => [...prev, newProduct]);
                }}
                style={{ 
                  ...addButtonStyle, 
                  width: '155px',
                  backgroundColor: '#28a745'
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
                <i className="fas fa-plus" style={{ fontSize: '9px' }}></i>
                Add Purchase Detail
              </button>
            </div>

           <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
  <input
    type="text"
    placeholder="Search products by name or ID..."
    value={searchTerm}
    onChange={handleSearch}
    style={inputStyle}
  />
  
  {/* Search results dropdown */}
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
              borderBottom: '1px solid #eee',
              ':hover': {
                backgroundColor: '#f5f5f5'
              }
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
                      <th style={tableHeaderStyle}>Lot ID</th>
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
  {availableProducts.map((product) => {
    // Find the full product details from the fetched products
    const fullProduct = products.find(p => p.productId === product.id) || {};
    
    return (
      <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
        <td style={tableCellStyle}>
          <input
            type="text"
            value={product.lotId}
            onChange={(e) => {
              const updatedProducts = availableProducts.map(p => 
                p.id === product.id ? { ...p, lotId: e.target.value } : p
              );
              setAvailableProducts(updatedProducts);
            }}
            style={inputStyle}
            placeholder="Enter Lot ID"
          />
        </td>
        <td style={tableCellStyle}>
          {fullProduct.productName || product.name}
        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="date"
                            value={product.mfgDate}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, mfgDate: e.target.value } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="date"
                            value={product.expDate}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, expDate: e.target.value } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            style={inputStyle}
                          />
                        </td>
                     
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={product.quantityPurchase}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            min="0"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={product.priceBeforeDiscount}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, priceBeforeDiscount: parseFloat(e.target.value) || 0 } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            min="0"
                            step="0.01"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={product.priceAfterDiscount}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, priceAfterDiscount: parseFloat(e.target.value) || 0 } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            min="0"
                            step="0.01"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>${calculateTotalAmount(product).toFixed(2)}</td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={product.profitMargin}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, profitMargin: parseFloat(e.target.value) || 0 } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            min="0"
                            max="100"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            type="number"
                            value={product.unitSellingPrice}
                            onChange={(e) => {
                              const updatedProducts = availableProducts.map(p => 
                                p.id === product.id ? { ...p, unitSellingPrice: parseFloat(e.target.value) || 0 } : p
                              );
                              setAvailableProducts(updatedProducts);
                            }}
                            min="0"
                            step="0.01"
                            style={inputStyle}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
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

              {/* Discount Section */}
              <div style={sectionStyle}>
                <div style={{
                  ...sectionHeaderStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: '500' }}>Add Discount</h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentDiscount.discountCode && currentDiscount.discountType) {
                        const newDiscount = {
                          id: Date.now().toString(),
                          lotId: '',
                          discountCode: currentDiscount.discountCode,
                          discountType: currentDiscount.discountType,
                          discountAmount: '',
                          discountPercentage: ''
                        };
                        setDiscountList(prev => [...prev, newDiscount]);
                        setCurrentDiscount({
                          lotId: '',
                          discountCode: '',
                          discountType: '',
                          discountAmount: '',
                          discountPercentage: ''
                        });
                      }
                    }}
                    style={{ 
                      ...addButtonStyle, 
                      width: '120px',
                      backgroundColor: '#28a745'
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
                    <i className="fas fa-plus" style={{ fontSize: '9px' }}></i>
                    Add Discount
                  </button>
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
                      <option key={code} value={code}>{code}</option>
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
                        <th style={tableHeaderStyle}>Lot ID</th>
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
                          <td style={tableCellStyle}>
                            <input
                              type="text"
                              value={discount.lotId}
                              onChange={(e) => handleDiscountFieldChange(discount.id, 'lotId', e.target.value)}
                              style={inputStyle}
                              placeholder="Enter Lot ID"
                            />
                          </td>
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
              <button
                type="button"
                onClick={() => {
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
                }}
                style={{ 
                  ...addButtonStyle, 
                  width: '165px',
                  backgroundColor: '#28a745'
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
                <i className="fas fa-plus" style={{ fontSize: '9px' }}></i>
                Add Purchase Discount
              </button>
            </div>

            <div style={formRowStyle}>
              <select
                name="discountCode"
                value={currentPurchaseDiscount.discountCode}
                onChange={handlePurchaseDiscountChange}
                style={selectStyle}
              >
                <option value="">Select Discount Code</option>
                {discountCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
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
                          onClick={() => deletePurchaseDiscount(discount.id)}
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
              <button
                type="button"
                onClick={() => {
                  if (currentTax.taxName && formData.location) {
                    const newTax = {
                      id: Date.now().toString(),
                      taxName: currentTax.taxName,
                      location: formData.location,
                      taxPercentage: '',
                      effectiveDate: new Date().toISOString().split('T')[0]
                    };
                    setTaxList(prev => [...prev, newTax]);
                    setCurrentTax(prev => ({
                      ...prev,
                      taxName: '',
                    }));
                  }
                }}
                style={{ 
                  ...addButtonStyle, 
                  width: '100px',
                  backgroundColor: '#28a745'
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
                <i className="fas fa-plus" style={{ fontSize: '9px' }}></i>
                Add Tax
              </button>
            </div>

            <div className="section-content">
              {formData.location ? (
                <>
                  <div style={formRowStyle}>
                    <select
                      name="taxName"
                      value={currentTax.taxName}
                      onChange={handleTaxChange}
                      style={selectStyle}
                    >
                      <option value="">Select Tax Name</option>
                      {taxNames.map(tax => (
                        <option key={tax} value={tax}>{tax}</option>
                      ))}
                    </select>

                    <div style={{ visibility: 'hidden' }}></div>
                    <div style={{ visibility: 'hidden' }}></div>
                  </div>

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
                          <th style={tableHeaderStyle}>Location</th>
                          <th style={tableHeaderStyle}>Tax Percentage</th>
                          <th style={tableHeaderStyle}>Effective Date</th>
                          <th style={{
                            ...tableHeaderStyle,
                            width: '120px',
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa'
                          }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxList.map((tax) => (
                          <tr key={tax.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tableCellStyle}>{tax.taxName}</td>
                            <td style={tableCellStyle}>{formData.location}</td>
                            <td style={tableCellStyle}>
                              <input
                                type="number"
                                value={tax.taxPercentage}
                                onChange={(e) => handleTaxFieldChange(tax.id, 'taxPercentage', e.target.value)}
                                style={inputStyle}
                                placeholder="Enter Tax Percentage"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </td>
                            <td style={tableCellStyle}>
                              <input
                                type="date"
                                value={tax.effectiveDate}
                                onChange={(e) => handleTaxFieldChange(tax.id, 'effectiveDate', e.target.value)}
                                style={inputStyle}
                              />
                            </td>
                            <td style={{
                              ...tableCellStyle,
                              width: '120px',
                              textAlign: 'center',
                              backgroundColor: '#fff'
                            }}>
                              <button
                                onClick={() => deleteTax(tax.id)}
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
                </>
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  Please select a location in the main form first to add taxes.
                </div>
              )}
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
              <i className="fas fa-save"></i> Save Purchase
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
// const searchResultsStyle = {
//   position: 'absolute',
//   top: '100%',
//   left: 0,
//   right: 0,
//   backgroundColor: '#fff',
//   border: '1px solid #ddd',
//   borderRadius: '4px',
//   zIndex: 1000,
//   maxHeight: '300px',
//   overflowY: 'auto',
//   boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// };

// const searchResultItemStyle = {
//   padding: '10px',
//   cursor: 'pointer',
//   borderBottom: '1px solid #eee',
//   ':hover': {
//     backgroundColor: '#f5f5f5'
//   }
// };
// Shared styles at the bottom of the file
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

// Update the base button style
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