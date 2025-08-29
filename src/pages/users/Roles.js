import React, { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios'; // your axios instance
import './Roles.css';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/Role'); // adjust endpoint
        setRoles(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load roles.');
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Role Management</h1>
          </div>

          {loading ? (
            <p>Loading roles...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role ID</th>
                    <th>Role Name</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.roleId}>
                      <td>{role.roleId}</td>
                      <td>{role.roleName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
