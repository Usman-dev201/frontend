import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./ShippingAddress.css";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
export default function ListShippingAddress() {
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    shippingAddressId: null,
    city: "",
    state: "",
    country: "Pakistan",
    postalCode: "",
    shippingCost: 0,
  });
const [cities, setCities] = useState([]);

const handleStateChange = async (e) => {
  const selectedState = e.target.value;
  setNewAddress(prev => ({ ...prev, state: selectedState }));

  try {
    const response = await api.get(`/Location/cities?state=${selectedState}`);
    setCities(response.data || []);
  } catch (error) {
    console.error("Failed to load cities", error);
    setCities([]);
  }
};
  const [states, setStates] = useState([]);
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get("/ShippingAddress/states"); // adjust route if needed
        setStates(response.data || []);
      } catch (error) {
        console.error("Failed to load states:", error);
      }
    };
    fetchStates();
  }, []);
  // Fetch shipping addresses
  const fetchShippingAddresses = useCallback(async () => {
    try {
      const response = await api.get("/ShippingAddress");
      setShippingAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      alert("Failed to load shipping addresses.");
    }
  }, []);

  useEffect(() => {
    fetchShippingAddresses();
  }, [fetchShippingAddresses]);

  // Add / Edit modal controls
  const handleAddAddress = () => {
    setIsEditing(false);
    setNewAddress({
      shippingAddressId: null,
      city: "",
      state: "",
      country: "",
      postalCode: "",
      shippingCost: 0,
    });
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/ShippingAddress/${id}`);
      setNewAddress({ ...response.data, country: "Pakistan" });

      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching address details:", error);
      alert("Failed to load shipping address.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewAddress({
      shippingAddressId: null,
      city: "",
      state: "",
      country: "",
      postalCode: "",
      shippingCost: 0,
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Save shipping address
  const handleSaveAddress = async () => {
  if (
  !newAddress.city.trim() ||
  !newAddress.state.trim() ||
 
  !newAddress.postalCode.trim() ||
  newAddress.shippingCost === null || 
  newAddress.shippingCost === undefined || 
  newAddress.shippingCost < 0
) {
  alert("Please fill in all fields.");
  return;
}


    try {
      if (isEditing) {
        await api.put(`/ShippingAddress/${newAddress.shippingAddressId}`, [newAddress]);
        alert("Shipping address updated successfully!");
      } else {
        await api.post("/ShippingAddress", [newAddress]);
        alert("Shipping address added successfully!");
      }

      handleModalClose();
      fetchShippingAddresses();
    } catch (error) {
      console.error("Error saving shipping address:", error);
      alert("Failed to save shipping address.");
    }
  };

  // Delete shipping address
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipping address?")) return;

    try {
      await api.delete(`/ShippingAddress/${id}`);
      setShippingAddresses((prev) => prev.filter((a) => a.shippingAddressId !== id));
      alert("Shipping address deleted successfully!");
    } catch (error) {
      console.error("Error deleting shipping address:", error);
      alert("Failed to delete shipping address.");
    }
  };

  // Action buttons
  const ActionCell = ({ shippingAddressId }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(shippingAddressId)}>
        <i className="fas fa-edit"></i> Edit
      </button>
      <button className="btn btn-danger" onClick={() => handleDelete(shippingAddressId)}>
        <i className="fas fa-trash"></i> Delete
      </button>
    </div>
  );

  // Table columns
  const columnsRef = useRef([
    { header: "ID", accessorKey: "shippingAddressId" },
    { header: "City", accessorKey: "city" },
    { header: "State", accessorKey: "state" },
    { header: "Country", accessorKey: "country" },
    { header: "Postal Code", accessorKey: "postalCode" },
    { header: "Shipping Cost", accessorKey: "shippingCost" },
    { header: "Actions", id: "actions", cell: ({ row }) => <ActionCell shippingAddressId={row.original.shippingAddressId} /> },
  ]);

  const columns = columnsRef.current;

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return shippingAddresses;
    const q = searchQuery.toLowerCase();
    return shippingAddresses.filter(
      (a) =>
        a.city?.toLowerCase().includes(q) ||
        a.state?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        a.postalCode?.toString().includes(q)
    );
  }, [searchQuery, shippingAddresses]);

  // React Table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="account-page">
      <Topbar />
      <Sidebar />

      <div className="account-container">
        <div className="account-header">
          <h2>Shipping Addresses</h2>
          <button className="btn btn-primary" onClick={handleAddAddress}>
            <i className="fas fa-plus"></i> Add Address
          </button>
        </div>

        {/* Search + Pagination Controls */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Shipping Addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="page-size-control">
            <label htmlFor="pageSize">Show</label>
            <select
              id="pageSize"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

               <div className="taxpayablepagination-controls">
  <button
    className="taxpayablepagination-button"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </button>

  <span className="taxpayablepagination-info">
    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
  </span>

  <button
    className="taxpayablepagination-button"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </button>
</div>
</div>
      </div>

      {/* Modal for Add/Edit Shipping Address */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isEditing ? "Edit Shipping Address" : "Add New Shipping Address"}</h3>
            <div className="modal-content">
             <label>State:</label>
<select name="state" value={newAddress.state} onChange={handleStateChange}>
        <option value="">Select State</option>
        {states.map((state, idx) => (
          <option key={idx} value={state}>{state}</option>
        ))}
      </select>

<label>City:</label>
<select name="city" value={newAddress.city} onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}>
  <option value="">Select City</option>
  {cities.map((city, idx) => (
    <option key={idx} value={city}>{city}</option>
  ))}
</select>

 <label>Country:</label>
    <select name="country" value="Pakistan" readOnly>
  <option value="Pakistan">Pakistan</option>
</select>

              <label>Postal Code:</label>
              <input type="text" name="postalCode" value={newAddress.postalCode} onChange={handleInputChange} />

              <label>Shipping Cost:</label>
              <input type="number" name="shippingCost" value={newAddress.shippingCost} onChange={handleInputChange} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveAddress}>
                {isEditing ? "Update" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
