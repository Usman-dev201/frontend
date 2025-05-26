import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './ListUser.css';

export default function ListUser() {
  const [users] = useState([
    {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '********',
      confirmPassword: '********',
      contactNo: '123-456-7890',
      address: '123 Main St',
      role: 'Admin'
    },
    {
      userId: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: '********',
      confirmPassword: '********',
      contactNo: '987-654-3210',
      address: '456 Oak St',
      role: 'Inventory Manager'
    }
  ]);

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>User Management</h1>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Address</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.userId}>
                    <td>{user.userId}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.contactNo}</td>
                    <td>{user.address}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 