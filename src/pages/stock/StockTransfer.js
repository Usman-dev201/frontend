// src/pages/stock/StockTransfer.js
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
import './StockTransfer.css';

export default function StockTransfer() {
  const navigate = useNavigate();
  const [stockTransfers, setStockTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Fetch stock transfers
  useEffect(() => {
    const fetchStockTransfers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/StockTransfer');
        setStockTransfers(res.data || []);
        setFilteredTransfers(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load stock transfers.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockTransfers();
  }, []);

  // ✅ Search filter
  useEffect(() => {
    const filtered = stockTransfers.filter((transfer) =>
      String(transfer.transferId).includes(searchQuery) ||
      (transfer.fromLocation?.locationName || transfer.fromLocation || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transfer.toLocation?.locationName || transfer.toLocation || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transfer.status || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransfers(filtered);
  }, [searchQuery, stockTransfers]);

  // ✅ Edit handler
  const handleEdit = useCallback(
    (transfer) => {
      navigate(`/stock/transfer/edit/${transfer.transferId}`);
    },
    [navigate]
  );

  // ✅ Delete handler
  const handleDelete = useCallback(
    async (transfer) => {
      if (transfer.status === "Completed" || transfer.status === "Cancelled") {
        alert(`⚠️ This Stock Transfer cannot be deleted because the Status is "${transfer.status}".`);
        return;
      }

      if (window.confirm('Are you sure you want to delete this transfer?')) {
        try {
          await api.delete(`/StockTransfer/${transfer.transferId}`);
          setStockTransfers((prev) =>
            prev.filter((item) => item.transferId !== transfer.transferId)
          );
          setFilteredTransfers((prev) =>
            prev.filter((item) => item.transferId !== transfer.transferId)
          );
          alert(`✅ Stock Transfer ID ${transfer.transferId} deleted successfully.`);
        } catch (err) {
          console.error(err);
          alert('❌ Failed to delete transfer.');
        }
      }
    },
    []
  );

  // ✅ Define columns
  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'transferId' },
    { header: 'Date', accessorKey: 'date' },
    { 
      header: 'From Location', 
      accessorFn: row => row.fromLocation?.locationName || row.fromLocation 
    },
    { 
      header: 'To Location', 
      accessorFn: row => row.toLocation?.locationName || row.toLocation 
    },
    { header: 'Shipping Charges', accessorKey: 'shippingCharges' },
    { header: 'Additional Notes', accessorKey: 'additionalNotes' },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: info => (
        <span className={`status-badge status-${info.getValue()}`}>
          {info.getValue()}
        </span>
      ) 
    },
    { header: 'Total Amount', accessorKey: 'totalAmount' },
    {
      header: 'Actions',
      accessorFn: row => row,
      cell: info => {
        const transfer = info.getValue();
        return (
          <div className="action-buttons-container">
            <button
              type="button"
              className="action-btn edit-btn"
              onClick={() => handleEdit(transfer)}
            >
              <i className="fas fa-edit"></i> Edit
            </button>
            <button
              type="button"
              className="action-btn delete-btn"
              onClick={() => handleDelete(transfer)}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        );
      }
    }
  ], [handleEdit, handleDelete]);

  // ✅ Table instance
  const table = useReactTable({
    data: filteredTransfers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="stock-transfer-page">
      <Topbar />
      <Sidebar />
      <div className="stock-transfer-container">
        <div className="stock-transfer-header">
          <h2>Stock Transfer</h2>
          <button
            className="add-transfer-btn"
            onClick={() => navigate('/stock/transfer/add')}
          >
            <i className="fas fa-plus"></i> Add Stock Transfer
          </button>
        </div>

        {/* ✅ Search bar and page size */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search stock transfers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        {loading ? (
          <p>Loading stock transfers...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="stock-transfer-table-container">
              <table className="stock-transfer-table">
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
                      <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                        No stock transfers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
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
  );
}
