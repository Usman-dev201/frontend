import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import { useSaleExchange } from "../../context/SaleExchangeContext"; // 👈 new context
import "../../pages/POS/ListSales.css";

export default function ListSaleExchange() {
  const { saleExchanges, fetchSaleExchanges, deleteSaleExchange,fetchSaleExchangeById } = useSaleExchange();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    fetchSaleExchanges(); // load exchanges on page mount
  }, [fetchSaleExchanges]);

  const handleAddExchange = useCallback(() => {
    navigate("/saleexchange/add");
  }, [navigate]);

  const handleEdit = useCallback(
    (id) => {
      try {
        if (!id) throw new Error("Invalid exchange ID for edit");
        navigate(`/salesexchange/edit/${id}`);
      } catch (err) {
        console.error("Navigation error:", err);
        alert("Could not open edit page. Please try again.");
      }
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const exchangeToDelete = saleExchanges.find((r) => r.salesExchangeId === id);

      if (!exchangeToDelete) return alert("Sale Exchange not found");

      

      try {

         const currentSaleExchangeData = await fetchSaleExchangeById(id);
    if (["Approved", "Cancelled"].includes(currentSaleExchangeData.exchangeStatus)) {
      alert(
        `⚠️ This Exchange cannot be updated because the Exchange Status is ${currentSaleExchangeData.exchangeStatus}.`
      );
      return;
    }
        if (window.confirm("Are you sure you want to delete this exchange?")) {
          await deleteSaleExchange(id);
          alert("Exchange deleted successfully!");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert(`Failed to delete exchange: ${err.message}`);
      }
    },
    [deleteSaleExchange, saleExchanges,fetchSaleExchangeById]
  );

  // Status badge utility
  const getStatusBadge = (value, type) => {
    if (!value) return <span className="status-badge status-default">N/A</span>;
    const normalized = value.toLowerCase();

    switch (type) {
      case "exchange":
        if (normalized === "pending")
          return <span className="status-badge status-pending">Pending</span>;
        if (normalized === "approved")
          return <span className="status-badge status-completed">Approved</span>;
        break;

      case "payment":
        if (normalized === "unpaid")
          return <span className="status-badge status-unpaid">Unpaid</span>;
        if (normalized === "paid")
          return <span className="status-badge status-paid">Paid</span>;
        if (normalized === "partial")
          return <span className="status-badge status-partial">Partial</span>;
        break;
           case "exchangeType":
        if (normalized === "return")
          return <span className="status-badge status-unpaid">Return</span>;
        if (normalized === "exchange")
          return <span className="status-badge status-paid">Exchange</span>;
       
        break;

      case "refund":
        if (normalized === "refunded")
          return <span className="status-badge status-completed">Refunded</span>;
        if (normalized === "not refunded")
          return <span className="status-badge status-unpaid">Not Refunded</span>;
        break;

      default:
        return <span className="status-badge status-default">{value}</span>;
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      { header: "Exchange ID", accessorKey: "salesExchangeId" },
      {
        header: "Sales ID",
        accessorFn: (row) => row.salesId || "N/A",
      },
      { header: "Date", accessorKey: "date" },
      {
        header: "Grand Total",
        accessorFn: (row) => `Rs ${row.grandTotal?.toFixed(2) || "0.00"}`,
      },
      {
        header: "Amount Exchanged",
        accessorFn: (row) => `Rs ${row.amountExchanged?.toFixed(2) || "0.00"}`,
      },
      {
        header: "Payment Due",
        accessorFn: (row) => `Rs ${row.paymentDue?.toFixed(2) || "0.00"}`,
      },
      {
        header: "Refund Amount",
        accessorFn: (row) => `Rs ${row.refundAmount?.toFixed(2) || "0.00"}`,
      },
      { header: "Reason", accessorKey: "exchangeReason" },
      {
        header: "Exchange Status",
        accessorKey: "exchangeStatus",
        cell: (info) => getStatusBadge(info.getValue(), "exchange"),
      },
      {
        header: "Payment Status",
        accessorKey: "paymentStatus",
        cell: (info) => getStatusBadge(info.getValue(), "payment"),
      },
       {
        header: "Exchange Type",
        accessorKey: "exchangeType",
        cell: (info) => getStatusBadge(info.getValue(), "exchangeType"),
      },
      {
        header: "Refund Status",
        accessorKey: "refundStatus",
        cell: (info) => getStatusBadge(info.getValue(), "refund"),
      },
      {
        header: "Actions",
        accessorFn: (row) => row.salesExchangeId,
        cell: (info) => (
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => handleEdit(info.getValue())}>
              <i className="fas fa-edit"></i> Edit
            </button>
            <button className="btn btn-danger" onClick={() => handleDelete(info.getValue())}>
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return saleExchanges;
    const query = searchQuery.toLowerCase();
    return saleExchanges.filter(
      (e) =>
        e.salesExchangeId.toString().includes(query) ||
        e.salesId?.toString().includes(query) ||
        e.exchangeReason?.toLowerCase().includes(query) ||
        e.exchangeStatus?.toLowerCase().includes(query) ||
        e.paymentStatus?.toLowerCase().includes(query) ||
        e.refundStatus?.toLowerCase().includes(query)
    );
  }, [searchQuery, saleExchanges]);

  // Table instance
const table = useReactTable({
  data: filteredData,
  columns,
  state: {
    pagination,   // ✅ tell the table to use your pagination state
  },
  onPaginationChange: setPagination, // ✅ update your state when table changes
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  return (
    <div className="sales-page">
      <Topbar />
      <Sidebar />
      <div className="sales-container">
        {/* Header */}
        <div className="sales-header">
          <h2>Sale Returns & Exchanges</h2>
          <button className="btn btn-primary" onClick={handleAddExchange}>
            <i className="fas fa-plus"></i> Add Exchange
          </button>
        </div>

        {/* Search + Page Size */}
        <div className="table-controls">
          <div className="search-barr">
            <input
              type="text"
              placeholder="Search Exchanges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="page-size-control">
            <label htmlFor="pageSize">Show</label>
            <select
              id="pageSize"
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((old) => ({ ...old, pageSize: Number(e.target.value), pageIndex: 0 }))
              }
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
