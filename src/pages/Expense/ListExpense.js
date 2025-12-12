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
import { useExpense } from "../../context/ExpenseContext";
import "../../pages/Expense/ListExpense.css";

export default function ListExpense() {
  // ✅ Always default expenses to [] to prevent undefined crash
  const { expenses = [], fetchExpenses, deleteExpense } = useExpense();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Load expenses once on mount
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddExpense = useCallback(() => {
    navigate("/expense/add");
  }, [navigate]);

  const handleEdit = useCallback(
    (id) => {
      try {
        if (!id) throw new Error("Invalid Expense ID");
        navigate(`/expense/edit/${id}`);
      } catch (err) {
        console.error("Navigation error:", err);
        alert("Could not open edit page. Please try again.");
      }
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      const expenseToDelete = expenses.find((e) => e.expenseId === id);

      if (!expenseToDelete) return alert("Expense record not found.");

      if (window.confirm("Are you sure you want to delete this expense?")) {
        try {
          await deleteExpense(id);
          alert("Expense deleted successfully!");
        } catch (err) {
          console.error("Delete error:", err);
          alert(`Failed to delete expense: ${err.message}`);
        }
      }
    },
    [deleteExpense, expenses]
  );

  // ✅ Payment & Method badges
  const getStatusBadge = (value, type) => {
    if (!value) return <span className="status-badge status-default">N/A</span>;

    const normalized = value.toLowerCase();

    switch (type) {
      case "payment":
        if (normalized === "paid")
          return <span className="status-badge status-paid">Paid</span>;
        if (normalized === "unpaid")
          return <span className="status-badge status-unpaid">Unpaid</span>;
        if (normalized === "partial" || normalized === "partially paid")
          return (
            <span className="status-badge status-partial">Partially Paid</span>
          );
        break;

      case "method":
       if (normalized === "cash")
        return <span className="status-badge status-cash">Cash</span>;
      if (normalized === "credit card")
        return <span className="status-badge status-credit">Credit Card</span>;
      if (normalized === "debit card")
        return <span className="status-badge status-debit">Debit Card</span>;
      if (normalized === "mobile payment")
        return <span className="status-badge status-mobile">Mobile Payment</span>;
      break;

      default:
        return <span className="status-badge status-default">{value}</span>;
    }
  };

  // ✅ Actions cell
 const ActionCell = ({ expenseRecordId }) => (
  <div className="action-buttons">
    <button
      className="btn btn-primary"
      onClick={() => handleEdit(expenseRecordId)}
    >
      <i className="fas fa-edit"></i> Edit
    </button>
    <button
      className="btn btn-danger"
      onClick={() => handleDelete(expenseRecordId)}
    >
      <i className="fas fa-trash"></i> Delete
    </button>
  </div>
);


  // ✅ Columns definition
 const columnsRef = useRef([
  {
    header: "Expense ID",
    accessorKey: "expenseRecordId",
    cell: (info) => (
      <span className="expense-id-cell">{info.getValue()}</span>
    ),
  },
  { header: "Expense Date", accessorKey: "expenseDate" },
  {
    header: "Category",
    accessorFn: (row) => row.expenseCategory?.categoryName || "N/A",
  },
  {
    header: "Sub Category",
    accessorFn: (row) => row.expenseSubCategory?.categoryName || "N/A",
  },
  {
    header: "Location",
    accessorFn: (row) => row.location?.locationName || "N/A",
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
    header: "Payment Due",
    accessorFn: (row) => {
      const paymentDue =
        row.paymentDue ||
        (row.grandTotal && row.amountPaid
          ? Math.max(0, row.grandTotal - row.amountPaid)
          : 0);
      return `Rs ${paymentDue.toFixed(2)}`;
    },
    cell: (info) => {
      const paymentDue =
        info.row.original.paymentDue ||
        (info.row.original.grandTotal && info.row.original.amountPaid
          ? Math.max(
              0,
              info.row.original.grandTotal - info.row.original.amountPaid
            )
          : 0);
      return (
        <span
          className={paymentDue > 0 ? "payment-due-highlight" : ""}
        >{`Rs ${paymentDue.toFixed(2)}`}</span>
      );
    },
  },
  {
    header: "Payment Status",
    accessorKey: "paymentStatus",
    cell: (info) => getStatusBadge(info.getValue(), "payment"),
  },
  {
    header: "Payment Method",
    accessorKey: "paymentMethod",
    cell: (info) => getStatusBadge(info.getValue(), "method"),
  },
  { header: "Expense For", accessorKey: "expenseFor" },
  {
    header: "Actions",
    id: "actions",
  cell: ({ row }) => (
  <ActionCell expenseRecordId={row.original.expenseRecordId} />
),

  },
]);


  const columns = columnsRef.current;

  // ✅ Safe filtering
  const filteredData = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    if (!searchQuery.trim()) return safeExpenses;

    const query = searchQuery.toLowerCase();
    return safeExpenses.filter(
      (e) =>
        e.expenseDate?.toLowerCase().includes(query) ||
        e.expenseCategory?.categoryName?.toLowerCase().includes(query) ||
        e.expenseSubCategory?.categoryName?.toLowerCase().includes(query) ||
        e.location?.locationName?.toLowerCase().includes(query) ||
        e.paymentStatus?.toLowerCase().includes(query) ||
        e.paymentMethod?.toLowerCase().includes(query) ||
        e.expenseFor?.toLowerCase().includes(query)
    );
  }, [searchQuery, expenses]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ React Table setup
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
    <div className="expense-page">
      <Topbar />
      <Sidebar />
      <div className="expense-container">
        {/* Header */}
        <div className="expense-header">
          <h2>Expense List</h2>
          <button className="btn btn-primary" onClick={handleAddExpense}>
            <i className="fas fa-plus"></i> Add Expense
          </button>
        </div>

        {/* Search + Page Size */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Expenses..."
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
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
