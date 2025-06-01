// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDiscount } from '../../context/DiscountContext'; 
// import './Discount.css';

// const AddDiscount = () => {
//   const navigate = useNavigate();
//   const { addDiscount } = useDiscount();

//   const [discount, setDiscount] = useState({
//     code: '',
//     status: 'Active'
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setDiscount(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

//   const validateForm = () => {
//     if (!discount.code.trim()) {
//       setError('Discount code is required.');
//       return false;
//     }

//     const validStatuses = ['Active', 'Expired'];
//     if (!validStatuses.includes(discount.status)) {
//       setError('Invalid status. Choose either Active or Expired.');
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       await addDiscount(discount);
//       navigate('/discount');
//     } catch (err) {
//       setError('Failed to save discount. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     navigate('/discount');
//   };

//   return (
//     <div className="discount-list-container">
//       <div className="discount-list-header">
//         <h2>Add New Discount</h2>
//       </div>

//       <div className="add-discount-form-container">
//         {error && <div className="error-message">{error}</div>}
//         <form onSubmit={handleSubmit} className="add-discount-form">
//           <div className="form-group">
//             <label htmlFor="code">Discount Code</label>
//             <input
//               type="text"
//               id="code"
//               name="code"
//               value={discount.discountCode}
//               onChange={handleChange}
//               className="discount-input"
//               placeholder="Enter discount code"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="status">Discount Status</label>
//             <select
//               id="status"
//               name="status"
//               value={discount.status}
//               onChange={handleChange}
//               className="discount-select"
//               required
//             >
//               <option value="Active">Active</option>
//               <option value="Expired">Expired</option>
//             </select>
//           </div>

//           <div className="form-buttons">
//             <button 
//               type="submit" 
//               className="submit-btn"
//               disabled={loading}
//             >
//               {loading ? 'Saving...' : 'Save Discount'}
//             </button>
//             <button
//               type="button"
//               className="cancel-btn"
//               onClick={handleCancel}
//               disabled={loading}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddDiscount;
