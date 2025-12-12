import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import api from "../../api/axios";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "./OrderSummary.css";

export default function OrderSummary() {
  const { orderId } = useParams();
    const navigate = useNavigate(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order by ID
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/Order/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Failed to load order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);
  const handlePrint = () => {
  // Get the order summary content
  const content = document.getElementById("order-summary-content").innerHTML;
  const printWindow = window.open("", "", "height=800,width=1000");
  printWindow.document.write(`
    <html>
      <head>
        <title>Order #${orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; margin-bottom: 20px; }
          .summary-section { margin-bottom: 20px; }
          .summary-section h3 { margin-bottom: 10px; }
          .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-line { display: flex; justify-content: space-between; font-weight: bold; }
          .discount-text { color: green; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>Order not found.</p>;

  const {
    email,
    firstName,
    lastName,
    address,
    phoneNumber,
    postalCode,
    city,
    state,
    orderItems,
    orderDiscountCoupons,
    subTotal,
    total,
    shippingCost,
    paymentMethod,
    billingAddress,
  } = order;

  return (
    <div className="order-summary-page">
         <Topbar />
              <Sidebar />
        <div id="order-summary-content">
      <h2>Order Summary</h2>
      <p className="order-id">Order ID: #{orderId}</p>

      {/* Customer Info */}
      <div className="summary-section">
        <h3>Customer Info</h3>
        <p>Email: {email}</p>
        <p>Name: {firstName} {lastName}</p>
        <p>Shipping Address: {address}</p>
        <p>City: {city}</p>
        <p>State: {state}</p>
        <p>Phone: {phoneNumber}</p>
        <p>Postal Code: {postalCode}</p>
      </div>

      {/* Billing Info */}
      <div className="summary-section">
        <h3>Billing Info</h3>
        <p>Billing Address: {billingAddress?.address}</p>
        <p>City: {billingAddress?.city}</p>
        <p>State: {billingAddress?.state}</p>
        <p>Postal Code: {billingAddress?.postalCode}</p>
        <p>Phone: {billingAddress?.phoneNumber}</p>
        <p>Payment Method: {paymentMethod}</p>
      </div>

      {/* Order Items */}
      <div className="summary-section">
        <h3>Items</h3>
        {orderItems && orderItems.length > 0 ? (
          orderItems.map((item) => (
            <div key={item.orderItemId} className="summary-item">
              <div className="item-info">
                <p className="item-name">{item.productName}</p>
                <p className="item-qty">Qty: {item.quantity}</p>
              </div>
              <p className="item-price">Rs. {item.subTotal}</p>
            </div>
          ))
        ) : (
          <p>No items found in this order.</p>
        )}
      </div>

      {/* Discounts */}
      {orderDiscountCoupons && orderDiscountCoupons.length > 0 && (
        <div className="summary-section">
          <h3>Applied Discounts</h3>
          {orderDiscountCoupons.map((d) => (
            <p key={d.orderDiscountCouponId} className="discount-text">
              {d.discountCode}: {d.discountType === "Fixed" ? `Rs.${d.discountAmount}` : `${d.discountPercentage}%`}
            </p>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="summary-section totals">
        <div className="total-line">
          <span>Subtotal:</span> <span>Rs. {subTotal}</span>
        </div>
        <div className="total-line">
          <span>Shipping:</span> <span>Rs. {shippingCost}</span>
        </div>
        <div className="total-line total">
          <span>Total:</span> <span>Rs. {total}</span>
        </div>
      </div>
      </div>
        {/* ✅ Pack for Shipment Button */}
     {/* ✅ Pack for Shipment Button */}
<div className="summary-section pack-shipment-wrapper">
 <div className="pack-shipment-wrapper">
  <button
    className="pack-shipment-button"
    onClick={() => navigate(`/add-shipment/${orderId}`)}
  >
    Pack for Shipment
  </button>
  <button
    className="pack-shipment-button"
    onClick={handlePrint}
  >
    Print Order
  </button>
</div>


</div>

    </div>
  );
}
