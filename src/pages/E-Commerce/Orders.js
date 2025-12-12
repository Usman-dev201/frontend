import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Order.css";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

export default function ListOrders() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
const navigate = useNavigate();

  // ===========================
  // Fetch Orders
  // ===========================
  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/Order"); // GET all orders
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      alert("Error loading orders");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ===========================
  // Columns
  // ===========================
  const columnsRef = useRef([
    { header: "Order ID", accessorKey: "orderId" },
    { header: "Email", accessorKey: "email" },
    { header: "Full Name", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { header: "City", accessorKey: "city" },
    { header: "State", accessorKey: "state" },
    { header: "Country", accessorKey: "country" },
    { header: "Postal Code", accessorKey: "postalCode" },
    { header: "Payment Method", accessorKey: "paymentMethod" },
    { header: "Total (Rs.)", accessorKey: "total" },
    { 
      header: "Actions", 
      cell: ({ row }) => (
        <button 
          className="btn btn-primary"
       onClick={() => navigate(`/ordersummary/${row.original.orderId}`)}
        >
          View
        </button>
      )
    },
  ]);

  const columns = columnsRef.current;

  // ===========================
  // Search Filter
  // ===========================
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();

    return orders.filter(
      (o) =>
        o.email?.toLowerCase().includes(q) ||
        o.firstName?.toLowerCase().includes(q) ||
        o.lastName?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        o.state?.toLowerCase().includes(q) ||
        o.country?.toLowerCase().includes(q) ||
        String(o.orderId).includes(q)
    );
  }, [searchQuery, orders]);

  // ===========================
  // React Table
  // ===========================
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
    <div className="orders-page">
      <Topbar />
      <Sidebar />

      <div className="orders-container">
        <div className="orders-header">
          <h2>Orders</h2>
        </div>

        {/* Search */}
        <div className="table-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="page-size-control">
            <label>Show</label>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 25, 50].map((size) => (
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
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
        <div className="orderpagination-controls">

  <button
    className="orderpagination-button"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </button>

  <span className="orderpagination-info">
    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
  </span>

  <button
    className="orderpagination-button"
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
