import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./Assets.css"; // Make sure your CSS file is correct

export default function ListLiabilityLedgerEntries() {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchLedgerEntries = useCallback(async () => {
    try {
      const response = await api.get("/LedgerEntry/liabilities");
      setLedgerEntries(response.data || []);
    } catch (error) {
      console.error("Error fetching liability ledger entries:", error);
      alert("Failed to load liability ledger entries.");
    }
  }, []);

  useEffect(() => {
    fetchLedgerEntries();
  }, [fetchLedgerEntries]);

  const columnsRef = useRef([
    { header: "Entry ID", accessorKey: "ledgerEnteryId" },
    { header: "Date", accessorKey: "date" },
    { header: "Debit", accessorKey: "debit" },
    { header: "Credit", accessorKey: "credit" },
    {
      header: "Account Name",
      accessorKey: "account.accountName",
      cell: ({ row }) => row.original.account?.accountName || "",
    },
    {
      header: "Account Type",
      accessorKey: "account.accountType",
      cell: ({ row }) => row.original.account?.accountType || "",
    },
    { header: "Reference Type", accessorKey: "referenceType" },
    { header: "Reference ID", accessorKey: "referenceId" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Location", // ✅ New column
      accessorKey: "location.locationName",
      cell: ({ row }) => row.original.location?.locationName || "",
    }
  ]);

  const columns = columnsRef.current;

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return ledgerEntries;
    const q = searchQuery.toLowerCase();
    return ledgerEntries.filter(
      (l) =>
        l.account?.accountName?.toLowerCase().includes(q) ||
        String(l.ledgerEnteryId).includes(q) ||
        l.referenceType?.toLowerCase().includes(q) ||
        l.location?.locationName?.toLowerCase().includes(q) // 🔹 include location
    );
  }, [searchQuery, ledgerEntries]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="account-page">
      <Topbar />
      <Sidebar />

      <div className="account-container">
        <h2>Liabilities</h2>

        <div className="table-controls">
          <input
            type="text"
            placeholder="Search Ledger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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

          <div className="assetpagination-controls">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>

            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <button
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
