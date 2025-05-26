import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import '../../styles/purchase/Purchase.css';

export default function EditPurchaseReturn() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    date: '',
    purchaseId: '',
    amountReturn: '',
    paymentDue: '',
    paymentStatus: '',
    refundStatus: '',
    refundReason: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Load return data based on id
  useEffect(() => {
    // This is mock data - replace with actual API call
    const mockData = {
      'RET001': {
        date: '2024-01-15',
        purchaseId: 'PUR001',
        amountReturn: '500',
        paymentDue: '2024-02-15',
        paymentStatus: 'Pending',
        refundStatus: 'Processing',
        refundReason: 'Damaged products',
        products: [
          {
            id: 1,
            name: 'Product 1',
            unitPrice: 100.00,
            quantity: 3,
            total: 300.00
          },
          {
            id: 2,
            name: 'Product 2',
            unitPrice: 150.00,
            quantity: 2,
            total: 300.00
          }
        ]
      },
      'RET002': {
        date: '2024-01-16',
        purchaseId: 'PUR003',
        amountReturn: '750',
        paymentDue: '2024-02-16',
        paymentStatus: 'Paid',
        refundStatus: 'Completed',
        refundReason: 'Wrong items received',
        products: [
          {
            id: 3,
            name: 'Product 3',
            unitPrice: 200.00,
            quantity: 2,
            total: 400.00
          },
          {
            id: 4,
            name: 'Product 4',
            unitPrice: 175.00,
            quantity: 2,
            total: 350.00
          }
        ]
      }
    };

    // Get the return data for the given id
    const returnData = mockData[id];
    if (returnData) {
      setFormData({
        date: returnData.date,
        purchaseId: returnData.purchaseId,
        amountReturn: returnData.amountReturn,
        paymentDue: returnData.paymentDue,
        paymentStatus: returnData.paymentStatus,
        refundStatus: returnData.refundStatus,
        refundReason: returnData.refundReason
      });
      setSelectedProducts(returnData.products);
    } else {
      // Handle case when return is not found
      navigate('/purchase/return');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newQuantity = parseInt(quantity) || 0;
        return {
          ...product,
          quantity: newQuantity,
          total: newQuantity * product.unitPrice
        };
      }
      return product;
    }));
  };

  const handleProductDelete = (productId) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Update form submitted:', { ...formData, products: selectedProducts });
    navigate('/purchase/return');
  };

  // Common styles
  const containerStyle = {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '30px',
    marginBottom: '40px'
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '0'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    height: '45px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header" style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', color: '#2c3e50' }}>Edit Purchase Return</h2>
        </div>

        <div style={containerStyle}>
          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              {[
                { label: 'Date', name: 'date', type: 'date' },
                { label: 'Purchase ID', name: 'purchaseId', type: 'text' },
                { label: 'Amount Return', name: 'amountReturn', type: 'number' },
                { label: 'Payment Due', name: 'paymentDue', type: 'date' },
                {
                  label: 'Payment Status',
                  name: 'paymentStatus',
                  type: 'select',
                  options: [
                    { value: '', label: 'Select Status' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Paid', label: 'Paid' }
                  ]
                },
                {
                  label: 'Refund Status',
                  name: 'refundStatus',
                  type: 'select',
                  options: [
                    { value: '', label: 'Select Status' },
                    { value: 'Processing', label: 'Processing' },
                    { value: 'Completed', label: 'Completed' }
                  ]
                }
              ].map((field) => (
                <div key={field.name} style={formGroupStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    >
                      {field.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}

              {/* Reason for Refund - Full width */}
              <div style={{
                ...formGroupStyle,
                gridColumn: 'span 3',
                marginTop: '10px'
              }}>
                <label style={labelStyle}>Reason for Refund</label>
                <textarea
                  name="refundReason"
                  value={formData.refundReason}
                  onChange={handleChange}
                  required
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div style={{
              marginBottom: '40px'
            }}>
              <div style={{
                position: 'relative',
                maxWidth: '400px'
              }}>
                <i className="fas fa-search" style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666',
                  zIndex: 1
                }}></i>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: '45px',
                    width: '100%',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>
            </div>

            {/* Products Table */}
            <div style={{
              marginBottom: '40px',
              overflowX: 'auto',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8f9fa'
                  }}>
                    {['Product Name', 'Unit Price', 'Quantity Return', 'Total', 'Action'].map((header, index) => (
                      <th key={header} style={{
                        padding: '15px 20px',
                        textAlign: index === 0 ? 'left' : 'center',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '1px solid #e0e0e0',
                        whiteSpace: 'nowrap'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => (
                    <tr key={product.id} style={{
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <td style={{ padding: '15px 20px' }}>{product.name}</td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        ${product.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          style={{
                            ...inputStyle,
                            width: '100px',
                            textAlign: 'center',
                            height: '36px',
                            margin: '0 auto'
                          }}
                        />
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        ${product.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleProductDelete(product.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{
                        padding: '30px',
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <i className="fas fa-save"></i> Update Return
              </button>
              <button
                type="button"
                onClick={() => navigate('/purchase/return')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 