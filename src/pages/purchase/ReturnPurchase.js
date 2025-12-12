// src/pages/purchase/ReturnPurchase.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';
import '../../styles/purchase/Purchase.css';

export default function ReturnPurchase() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch purchase returns on page load
  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get("/PurchaseReturn");
      setReturns(res.data || []);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReturn = useCallback(() => {
    navigate('/purchase/return/add');
  }, [navigate]);

  const handleEdit = useCallback((id) => {
    if (id) navigate(`/purchase/return/edit/${id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (id) => {
    const returnToDelete = returns.find(r => r.purchaseReturnId === id);

    if (!returnToDelete) return alert('Purchase Return not found');

    if (["Approved", "Cancelled"].includes(returnToDelete.refundStatus)) {
      return alert(`⚠️ This Purchase Return cannot be deleted because the Refund Status is ${returnToDelete.refundStatus}.`);
    }

    if (window.confirm(`Are you sure you want to delete return ID ${id}?`)) {
      try {
        await api.delete(`/PurchaseReturn/${id}`);
        setReturns((prev) => prev.filter((ret) => ret.purchaseReturnId !== id));
        alert("Purchase Return deleted successfully ✅");
      } catch (err) {
        console.error("Failed to delete return:", err.response?.data || err.message);
        alert("Failed to delete return. Please try again.");
      }
    }
  }, [returns]);

  // Define columns
  const columns = useMemo(() => [
    { header: 'Return ID', accessorKey: 'purchaseReturnId' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Purchase ID', accessorKey: 'purchaseId' },
    {
      header: 'Grand Total',
      accessorFn: row => `Rs${row.grandTotal?.toFixed(2) || "0.00"}`
    },
    {
      header: 'Amount Returned',
      accessorFn: row => `Rs${row.amountReturned?.toFixed(2) || "0.00"}`
    },
    { header: 'Payment Due', accessorKey: 'paymentDue' },
    {
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: info => (
        <span className={`status-badge status-${info.getValue()?.toLowerCase()}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      header: 'Refund Status',
      accessorKey: 'refundStatus',
      cell: info => (
        <span className={`status-badge status-${info.getValue()?.toLowerCase()}`}>
          {info.getValue()}
        </span>
      ),
    },
    { header: 'Reason for Refund', accessorKey: 'reasonforRefund' },
    {
      header: 'Actions',
      accessorFn: row => row.purchaseReturnId,
      cell: info => (
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => handleEdit(info.getValue())}
          >
            <i className="fas fa-edit"></i> Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(info.getValue())}
          >
            <i className="fas fa-trash"></i> Delete
          </button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  // Filtered data for search with priority for purchaseReturnId & refundStatus
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return returns;

    const query = searchQuery.toLowerCase();
    const priorityMatches = [];
    const otherMatches = [];

    returns.forEach(r => {
      const matchesReturnId = r.purchaseReturnId.toString().includes(query);
      const matchesRefundStatus = r.refundStatus?.toLowerCase().includes(query);
      const matchesPurchaseId = r.purchaseId.toString().includes(query);

      if (matchesReturnId || matchesRefundStatus || matchesPurchaseId) {
        priorityMatches.push(r);
      } else {
        otherMatches.push(r);
      }
    });

    return [...priorityMatches, ...otherMatches];
  }, [searchQuery, returns]);

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="purchase-page">
      <Topbar />
      <Sidebar />
      <div className="purchase-container">
        <div className="purchase-header">
          <h2>Purchase Return List</h2>
          <button className="btn btn-primary" onClick={handleAddReturn}>
            <i className="fas fa-plus"></i> Add Purchase Return
          </button>
        </div>

        {/* Search & Page Size */}
        <div className="table-controls">
          <div className="search-barr">
            <input
              type="text"
              placeholder="Search PurchaseReturns..."
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

        <div className="table-container">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading returns...</p>
          ) : (
            <>
              <table className="data-table">
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
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                        No purchase returns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
