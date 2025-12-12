import { useMemo, useState,useEffect ,useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/POS/Customer.css";
import api from "../../api/axios";

export default function Customers() {
    const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [genders, setGenders] = useState([]);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    contactNo: "",
    address: "",
    gender: "",
    registerationDate: new Date().toISOString().split("T")[0],
    dateOfBirth: new Date().toISOString().split("T")[0],  
    shippingAddress: "",
    creditLimit: 0,
  });
const handleEdit = useCallback((customer) => {
  setFormData({ ...customer });
  setEditingCustomerId(customer.customerId); // track which customer is being edited
  setShowForm(true);
}, []);
const handleDelete = useCallback(async (customerId) => {
  if (window.confirm("Are you sure you want to delete this customer?")) {
    try {
      await api.delete(`/Customer/${customerId}`);
      alert("Customer deleted successfully!");
      fetchCustomers(); // Refresh the table
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Error deleting customer. Check console for details.");
    }
  }
}, []);
  // ✅ Fetch customers on page load
  useEffect(() => {
    fetchGenders();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/Customer");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
const fetchGenders = async () => {
  try {
    const response = await api.get("/Customer/genders");
    setGenders(response.data);
  } catch (error) {
    console.error("Error fetching genders:", error);
  }
};
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editingCustomerId) {
      // ✅ Edit existing customer
      await api.put(`/Customer/${editingCustomerId}`, formData);
      alert("Customer updated successfully!");
    } else {
      // ✅ Add new customer
      await api.post("/Customer", [formData]);
      alert("Customer added successfully!");
    }

    setShowForm(false);
    setEditingCustomerId(null); // reset after save

    // Reset form
    setFormData({
      customerName: "",
      customerEmail: "",
      contactNo: "",
      address: "",
      gender: "",
      registerationDate: new Date().toISOString().split("T")[0],
      dateOfBirth: new Date().toISOString().split("T")[0], 
      shippingAddress: "",
      creditLimit: 0,
    });

    // Refresh list
    fetchCustomers();
  } catch (error) {
    console.error("Failed to save customer:", error);
    alert("Error saving customer. Check console for details.");
  }
};

const columns = useMemo(() => [
  { header: 'ID', accessorKey: 'customerId' },
  { header: 'Customer Name', accessorKey: 'customerName' },
  { header: 'Email', accessorKey: 'customerEmail' },
  { header: 'Phone', accessorKey: 'contactNo' },
  { header: 'Address', accessorKey: 'address' },
  { header: 'Gender', accessorKey: 'gender' },
  { header: 'Registration Date', accessorKey: 'registerationDate' },
  { header: 'Date of Birth', accessorKey: 'dateOfBirth' },   // ✅ Add here

  { header: 'Shipping Address', accessorKey: 'shippingAddress' },
  { header: 'Credit Limit', accessorKey: 'creditLimit' },
  { header: 'Total Orders', accessorKey: 'totalOrders' },
  { header: 'Total Spent', accessorKey: 'totalSpent' },
  {
    header: 'Actions',
    accessorFn: row => row.customerId,
    cell: info => (
      <div style={{ display: "flex", gap: "5px" }}>
        <button className="btn btn-primary" onClick={() => handleEdit(customers.find(c => c.customerId === info.getValue()))}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => handleDelete(info.getValue())}>
          Delete
        </button>
      </div>
    ),
  },
], [customers,handleDelete, handleEdit]);
const filteredCustomers = useMemo(() => {
  if (!searchQuery.trim()) return customers;
  return customers.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [searchQuery, customers]);

const table = useReactTable({
  data: filteredCustomers, // ✅ filtered list
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
  return (
    <div className="customer-page">
      <Topbar />
      <Sidebar />

      <div className="customer-container">
        <div className="customer-header">
          <h2>Customers</h2>
         <button
  className="add-customer-btn"
  onClick={() => {
    setFormData({
      customerName: "",
      customerEmail: "",
      contactNo: "",
      address: "",
      gender: "",
      registerationDate: new Date().toISOString().split("T")[0],
      shippingAddress: "",
      creditLimit: 0,
    });
    setEditingCustomerId(null); // ✅ reset editing mode
    setShowForm(true);
  }}
>
  Add Customer
</button>
        </div>

        {/* ✅ Customer Table */}
   <div className="customer-table-container">
  {/* Entries & Search */}
 <div className="table-controls">
  <div className="search-wrapper">
    <input
      type="text"
      placeholder="Search Customers..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <span className="search-icon"></span>
  </div>

  <div className="page-size-control">
    <label htmlFor="pageSize">Show</label>
    <select
      id="pageSize"
      value={table.getState().pagination.pageSize}
      onChange={e => table.setPageSize(Number(e.target.value))}
    >
      {[5, 10, 25, 50, 100].map(size => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
    <span>entries</span>
  </div>
</div>
  {/* Table */}
  <table className="customer-table">
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>

  {/* Pagination */}
  <div className="pagination-controls">
    <button 
      className="pagination-button"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </button>
    <span className="pagination-info">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </span>
    <button 
      className="pagination-button"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </button>
  </div>
</div>
</div>

      {/* ✅ Add Customer Popup */}
      {showForm && (
        <div className="cusmodal-overlay">
          <div className="cusmodal-content">
            <h3>{editingCustomerId ? "Edit Customer" : "Add Customer"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="cusform-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cusform-group">
                <label>Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cusform-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cusform-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            <div className="cusform-group">
  <label>Gender</label>
  <select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    required
  >
    <option value="">Select</option>
    {genders.map((g, index) => (
      <option key={index} value={g}>
        {g}
      </option>
    ))}
  </select>
</div>
<div className="cusform-group">
  <label>Date of Birth</label>
  <input
    type="date"
    name="dateOfBirth"
    value={formData.dateOfBirth}
    onChange={handleChange}
    required
  />
</div>

              <div className="cusform-group">
                <label>Registration Date</label>
                <input
                  type="date"
                  name="registerationDate"
                  value={formData.registerationDate}
                  onChange={handleChange}
                />
              </div>
              <div className="cusform-group">
                <label>Shipping Address</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="cusform-group">
                <label>Credit Limit</label>
                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleChange}
                />
              </div>

              <div className="cusmodal-footer">
                <button type="submit" className="btn btn-success">
                  Save Customer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
