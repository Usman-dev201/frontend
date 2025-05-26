import React, { useState } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import './Roles.css';

export default function Roles() {
  const [roles] = useState([
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'Inventory Manager' },
    { roleId: 3, roleName: 'User' },
    { roleId: 4, roleName: 'Developer' }
  ]);

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Role Management</h1>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role ID</th>
                  <th>Role Name</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.roleId}>
                    <td>{role.roleId}</td>
                    <td>{role.roleName}</td>
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