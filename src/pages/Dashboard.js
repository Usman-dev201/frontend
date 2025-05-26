import React from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import TaxListSection from '../components/TaxListSection';
import DiscountListSection from '../components/DiscountListSection';
import '../styles/Dashboard.css';

export default function Dashboard() {
  // Mock data for demonstration
  const stats = [
    { title: 'Total Sales', value: '$24,500', change: '+12%', icon: '💰' },
    { title: 'Total Orders', value: '1,250', change: '+8%', icon: '📦' },
    { title: 'Total Customers', value: '850', change: '+15%', icon: '👥' },
    { title: 'Total Products', value: '320', change: '+5%', icon: '🏷️' },
  ];

  const recentOrders = [
    { id: '#ORD001', customer: 'John Doe', amount: '$120', status: 'Completed' },
    { id: '#ORD002', customer: 'Jane Smith', amount: '$85', status: 'Processing' },
    { id: '#ORD003', customer: 'Mike Johnson', amount: '$250', status: 'Completed' },
    { id: '#ORD004', customer: 'Sarah Wilson', amount: '$95', status: 'Pending' },
  ];

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <h2>Dashboard Overview</h2>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-change positive">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tax List Section */}
        <div className="dashboard-section">
          <TaxListSection />
        </div>

        {/* Discount List Section */}
        <div className="dashboard-section">
          <DiscountListSection />
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <h3>Recent Orders</h3>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-button">
              <span className="action-icon">➕</span>
              Add New Product
            </button>
            <button className="action-button">
              <span className="action-icon">📝</span>
              Create Order
            </button>
            <button className="action-button">
              <span className="action-icon">📊</span>
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
