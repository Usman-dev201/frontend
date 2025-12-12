import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./ListShippment.css";

export default function ListShipments() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    try {
      const response = await api.get("/Shipping"); // replace with your endpoint
      setShipments(response.data);
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
   
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  
  const handleEdit = (id) => {
    if (!id) return alert("Invalid Shipment ID");
    navigate(`/shipment/edit/${id}`);
  };

  const handleDelete = async (id) => {
 console.log("Deleting shipment with id:", id);

 
  if (!window.confirm("Are you sure you want to delete this shipment?")) return;

  try {
    // Correct backend endpoint
    const response = await api.delete(`/Shipping/${id}`);
    if (response.status === 200) {
      alert("Shipment deleted successfully!");
      fetchShipments(); // refresh list
    } else {
      alert("Failed to delete shipment.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert(`Failed to delete shipment: ${err.response?.data?.message || err.message}`);
  }
};


  // Actions cell
  const ActionCell = ({ shipmentId }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(shipmentId)}>
        <i className="fas fa-edit"></i> Edit
      </button>
      <button className="btn btn-danger" onClick={() => handleDelete(shipmentId)}>
        <i className="fas fa-trash"></i> Delete
      </button>
    </div>
  );

  // Columns
  // Columns
const columnsRef = useRef([
  { header: "Shipment ID", accessorKey: "shippingId" },
  { header: "Order ID", accessorKey: "orderId" },
  { header: "Full Name", accessorFn: (row) => `${row.firstName} ${row.lastName}` },
    { header: "Location", accessorKey: "locationName" }, 
  { header: "Email", accessorKey: "email" },
  { header: "Address", accessorKey: "address" },
  { header: "City", accessorKey: "city" },
  { header: "State", accessorKey: "state" },
  { header: "Billing Address", accessorFn: (row) => row.billingAddress?.address ?? "N/A" },
  { header: "Shipping Cost", accessorKey: "shippingCost" },
  { header: "Total", accessorKey: "total" },
  { header: "Shipping Method", accessorKey: "shippingMethod" },
  { header: "Tracking Number", accessorKey: "trackingNumber" },
  { header: "Shipped Via", accessorKey: "shippedVia" },
  {
  header: "Status",
  accessorKey: "status",
  cell: ({ row }) => {
    const status = row.original.status?.toLowerCase().replace(/ /g, "-");
    return (
      <span className={`status-badge status-${status}`}>
        {row.original.status}
      </span>
    );
  },
}
,
// <-- Added column
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionCell shipmentId={row.original.shippingId} />,
  },
]);


  const columns = columnsRef.current;

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return shipments;

    const query = searchQuery.toLowerCase();
    return shipments.filter(
      (s) =>
        s.shippingMethod?.toLowerCase().includes(query) ||
        s.trackingNumber?.toLowerCase().includes(query) ||
        s.shippedVia?.toLowerCase().includes(query) ||
        s.order?.orderId?.toString().includes(query)
    );
  }, [searchQuery, shipments]);

  // React Table
  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="shipment-page">
      <Topbar />
      <Sidebar />
      <div className="shipment-container">
        {/* Header */}
        <div className="shipment-header">
          <h2>Shipment List</h2>
         
        </div>

        {/* Search & Page Size */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Shipments..."
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
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
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
    </div>
  );
}
