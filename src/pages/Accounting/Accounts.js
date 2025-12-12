import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";

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
import "./Accounts.css";

export default function ListAccount() {
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountId: null,
    accountName: "",
    accountType: "",
  });



  // ✅ Fetch all accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get("/Account");
      setAccounts(response.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      alert("Failed to load accounts. Please try again.");
    }
  }, []);

  // ✅ Fetch account types
  const fetchAccountTypes = useCallback(async () => {
    try {
      const response = await api.get("/Account/accountTypes");
      setAccountTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching account types:", error);
      alert("Failed to load account types.");
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchAccountTypes();
  }, [fetchAccounts, fetchAccountTypes]);

  // ✅ Add / Edit modal controls
  const handleAddAccount = () => {
    setIsEditing(false);
    setNewAccount({ accountId: null, accountName: "", accountType: "" });
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/Account/${id}`);
      setNewAccount(response.data);
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching account details:", error);
      alert("Failed to load account details.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewAccount({ accountId: null, accountName: "", accountType: "" });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save account (Add or Update)
  const handleSaveAccount = async () => {
    if (!newAccount.accountName.trim() || !newAccount.accountType.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (isEditing) {
        // Update existing account
            await api.put("/Account", [newAccount]);
        alert("Account updated successfully!");
      } else {
        // Add new account
        await api.post("/Account", [newAccount]);
        alert("Account added successfully!");
      }

      handleModalClose();
      fetchAccounts(); // refresh list
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account. Please try again.");
    }
  };

  // ✅ Delete account
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await api.delete(`/Account/${id}`);
      setAccounts((prev) => prev.filter((a) => a.accountId !== id));
      alert("Account deleted successfully!");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  // ✅ Action Buttons
  const ActionCell = ({ accountId }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(accountId)}>
        <i className="fas fa-edit"></i> Edit
      </button>
      <button className="btn btn-danger" onClick={() => handleDelete(accountId)}>
        <i className="fas fa-trash"></i> Delete
      </button>
    </div>
  );

  // ✅ Table Columns
  const columnsRef = useRef([
    {
      header: "Account ID",
      accessorKey: "accountId",
      cell: (info) => <strong>{info.getValue()}</strong>,
    },
    { header: "Account Name", accessorKey: "accountName" },
    { header: "Account Type", accessorKey: "accountType" },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => <ActionCell accountId={row.original.accountId} />,
    },
  ]);
  const columns = columnsRef.current;

  // ✅ Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.accountName?.toLowerCase().includes(q) ||
        a.accountType?.toLowerCase().includes(q) ||
        String(a.accountId).includes(q)
    );
  }, [searchQuery, accounts]);

  // ✅ Table setup
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
    <div className="account-page">
      <Topbar />
      <Sidebar />

      <div className="account-container">
        <div className="account-header">
          <h2>Accounts List</h2>
          <button className="btn btn-primary" onClick={handleAddAccount}>
            <i className="fas fa-plus"></i> Add Account
          </button>
        </div>

        {/* Search + Pagination Controls */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Accounts..."
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

      {/* ✅ Modal Popup for Add/Edit Account */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isEditing ? "Edit Account" : "Add New Account"}</h3>
            <div className="modal-content">
              <label>Account Name:</label>
              <input
                type="text"
                name="accountName"
                value={newAccount.accountName}
                onChange={handleInputChange}
                placeholder="Enter account name"
              />

              <label>Account Type:</label>
              <select
                name="accountType"
                value={newAccount.accountType}
                onChange={handleInputChange}
              >
                <option value="">Select Account Type</option>
                {accountTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveAccount}>
                {isEditing ? "Update" : "Save"}
              </button>
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
