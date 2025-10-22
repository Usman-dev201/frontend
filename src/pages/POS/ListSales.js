import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { useSales } from "../../context/SalesContext";
import "../../pages/POS/ListSales.css";

export default function ListSales() {
  const { sales, fetchSales,  deleteSale } = useSales();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSales(); // load sales on page mount
  }, [fetchSales]);

  const handleAddSale = useCallback(() => {
    navigate("/sales/add");
  }, [navigate]);


  const handleEdit = useCallback(
  (id) => {
    try {
      if (!id) throw new Error("Invalid sale ID for edit");
      navigate(`/sales/edit/${id}`);
    } catch (err) {
      console.error("Navigation error:", err);
      alert("Could not open edit page. Please try again.");
    }
  },
  [navigate]
);

const handleDelete = useCallback(
  
  async (id) => {
    const saleToDelete = sales.find(r => r.salesId === id);

    if (!saleToDelete) return alert('Sale Record not found');

      if (["Completed", "Cancelled"].includes(saleToDelete.transactionStatus)) {
      return alert(`⚠️ This Sale cannot be deleted because the Transaction Status is ${saleToDelete.transactionStatus}.`);
    }

    try {
      if (!id) throw new Error("Invalid sale ID for delete");

      if (window.confirm("Are you sure you want to delete this sale?")) {
        await deleteSale(id);
        alert("Sale deleted successfully!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete sale: ${err.message}`);
    }
  },
  [deleteSale,sales]
);

// Utility functions for styling
const getStatusBadge = (value, type) => {
  if (!value) return <span className="status-badge status-default">N/A</span>;

  const normalized = value.toLowerCase();

  switch (type) {
    case "transaction":
      if (normalized === "pending")
        return <span className="status-badge status-pending">Pending</span>;
      if (normalized === "completed")
        return <span className="status-badge status-completed">Completed</span>;
      if (normalized === "cancelled")
        return <span className="status-badge status-cancelled">Cancelled</span>;
      break;

    case "paymentMethod":
      if (normalized === "cash")
        return <span className="status-badge status-cash">Cash</span>;
      if (normalized === "credit card")
        return <span className="status-badge status-credit">Credit Card</span>;
      if (normalized === "debit card")
        return <span className="status-badge status-debit">Debit Card</span>;
      if (normalized === "mobile payment")
        return <span className="status-badge status-mobile">Mobile Payment</span>;
      break;

    case "payment":
      if (normalized === "unpaid")
        return <span className="status-badge status-unpaid">Unpaid</span>;
      if (normalized === "paid")
        return <span className="status-badge status-paid">Paid</span>;
      if (normalized === "partially paid")
        return <span className="status-badge status-partial">Partially Paid</span>;
      break;

    case "shipping":
      if (normalized === "pending")
        return <span className="status-badge status-pending">Pending</span>;
      if (normalized === "shipped")
        return <span className="status-badge status-shipped">Shipped</span>;
      if (normalized === "delivered")
        return <span className="status-badge status-delivered">Delivered</span>;
      if (normalized === "cancelled")
        return <span className="status-badge status-cancelled">Cancelled</span>;
      break;

    default:
      return <span className="status-badge status-default">{value}</span>;
  }
};
function ActionCell({ saleId, handleEdit, handleDelete, navigate }) {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => setShowOptions((prev) => !prev);

  const handleEditOption = (type) => {
    setShowOptions(false);
    if (type === "edit") {
      handleEdit(saleId);
    } else if (type === "exchange") {
      // Navigate to AddSaleExchange with the saleId as a parameter
      navigate(`/saleexchange/add/${saleId}`);
    }
  };

  return (
    <div className="action-buttons" style={{ position: "relative" }}>
      {/* Edit dropdown */}
      <button className="btn btn-primary" onClick={toggleOptions}>
        <i className="fas fa-edit"></i> Edit
      </button>

      {showOptions && (
        <div className="edit-options-dropdown">
          <button
            className="dropdown-item"
            onClick={() => handleEditOption("edit")}
          >
            Edit Sale Record
          </button>
          <button
            className="dropdown-item"
            onClick={() => handleEditOption("exchange")}
          >
            Sales Exchange
          </button>
        </div>
      )}

      {/* Delete button remains same */}
      <button className="btn btn-danger" onClick={() => handleDelete(saleId)}>
        <i className="fas fa-trash"></i> Delete
      </button>
    </div>
  );
}

  // Columns definition
const columnsRef = React.useRef([
  { header: "Invoice No", accessorKey: "salesId" },
  { header: "Date", accessorKey: "date" },
  { header: "Time", accessorKey: "time" },
  {
    header: "Customer",
    accessorFn: (row) => row.customer?.customerName || row.customerId,
  },
  {
    header: "Location",
    accessorFn: (row) => row.location?.locationName || row.locationId,
  },
  {
    header: "Total Amount",
    accessorFn: (row) => `Rs ${row.totalAmount?.toFixed(2) || "0.00"}`,
  },
  {
    header: "Grand Total",
    accessorFn: (row) => `Rs ${row.grandTotal?.toFixed(2) || "0.00"}`,
  },
  {
    header: "Amount Paid",
    accessorFn: (row) => `Rs ${row.amountPaid?.toFixed(2) || "0.00"}`,
  },
  {
    header: "Change",
    accessorFn: (row) => `Rs ${row.change?.toFixed(2) || "0.00"}`,
  },
  // ✅ Add Payment Due column
  {
    header: "Payment Due",
    accessorFn: (row) => {
      const paymentDue = row.paymentDue || 
        (row.grandTotal && row.amountPaid ? 
          Math.max(0, row.grandTotal - row.amountPaid) : 0);
      return `Rs ${paymentDue.toFixed(2)}`;
    },
    // Optional: Add cell styling for payment due
    cell: (info) => {
      const paymentDue = info.row.original.paymentDue || 
        (info.row.original.grandTotal && info.row.original.amountPaid ? 
          Math.max(0, info.row.original.grandTotal - info.row.original.amountPaid) : 0);
      
      return (
        <span className={paymentDue > 0 ? "payment-due-highlight" : ""}>
          Rs {paymentDue.toFixed(2)}
        </span>
      );
    },
  },
  { header: "Total Items", accessorKey: "totalItems" },
  {
    header: "Transaction Status",
    accessorKey: "transactionStatus",
    cell: (info) => getStatusBadge(info.getValue(), "transaction"),
  },
  {
    header: "Payment Method",
    accessorKey: "paymentMethod",
    cell: (info) => getStatusBadge(info.getValue(), "paymentMethod"),
  },
  {
    header: "Payment Status",
    accessorKey: "paymentStatus",
    cell: (info) => getStatusBadge(info.getValue(), "payment"),
  },
  {
    header: "Shipping Status",
    accessorKey: "shippingStatus",
    cell: (info) => getStatusBadge(info.getValue(), "shipping"),
  },
 {
  header: "Actions",
  id: "actions",
  cell: ({ row }) => {
    const saleId = row.original.salesId;
    return (
      <ActionCell
        saleId={saleId}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        navigate={navigate}
      />
    );
  },
},
]);

const columns = columnsRef.current;




  // Search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sales;

    const query = searchQuery.toLowerCase();
    return sales.filter(
      (s) =>
        s.salesId.toString().includes(query) ||
        s.customer?.customerName?.toLowerCase().includes(query) ||
        s.location?.locationName?.toLowerCase().includes(query) ||
        s.transactionStatus?.toLowerCase().includes(query) ||
        s.paymentStatus?.toLowerCase().includes(query) ||
        s.shippingStatus?.toLowerCase().includes(query)
    );
  }, [searchQuery, sales]);
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
});
  // Table instance
// Table instance with auto reset
const table = useReactTable({
  data: filteredData,
  columns,
  state: {
    pagination,
  },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),   // ✅ important for search + pagination
  getPaginationRowModel: getPaginationRowModel(),
  autoResetPageIndex: false,  // ✅ stops resetting to page 1 on every state change
});
  return (
    <div className="sales-page">
      <Topbar />
      <Sidebar />
      <div className="sales-container">
        {/* Header */}
        <div className="sales-header">
          <h2>Sales List</h2>
          <button className="btn btn-primary" onClick={handleAddSale}>
            <i className="fas fa-plus"></i> Add Sale
          </button>
        </div>

        {/* Search + Page Size */}
        <div className="table-controls">
          <div className="search-barr">
            <input
              type="text"
              placeholder="Search Sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
