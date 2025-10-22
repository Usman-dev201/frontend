import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { usePurchase } from '../../context/PurchaseContext';
import '../../styles/purchase/Purchase.css';

export default function ListPurchase() {
  const navigate = useNavigate();
  const { purchases, deletePurchase, suppliers, locations } = usePurchase();
  
  const [searchQuery, setSearchQuery] = useState('');

  const getSupplierName = useCallback(
    (id) => suppliers.find(s => s.supplierId === id)?.supplierName || 'N/A',
    [suppliers]
  );

  const getLocationName = useCallback(
    (id) => locations.find(l => l.locationId === id)?.locationName || 'N/A',
    [locations]
  );

  const handleAddPurchase = useCallback(() => {
    navigate('/purchase/add');
  }, [navigate]);

  const handleEdit = useCallback(
    (id) => navigate(`/purchase/edit/${id}`),
    [navigate]
  );

  const handleDelete = useCallback(
    (id) => {
      const purchaseToDelete = purchases.find(p => p.purchaseId === id);
      if (!purchaseToDelete) return alert('Purchase not found');

      if (['Completed', 'Cancelled'].includes(purchaseToDelete.purchaseStatus)) {
        return alert(`⚠️ This Purchase cannot be deleted because the Purchase Status is ${purchaseToDelete.purchaseStatus}.`);
      }

      if (window.confirm('Are you sure you want to delete this purchase?')) {
        deletePurchase(id);
      }
    },
    [purchases, deletePurchase]
  );

  // Columns definition
  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'purchaseId' },
    { header: 'Date', accessorKey: 'date' },
    { 
      header: 'Supplier',
      accessorFn: row => getSupplierName(row.supplierId),
    },
    { 
      header: 'Location',
      accessorFn: row => getLocationName(row.locationId),
    },
    { header: 'Total Amount', accessorFn: row => `Rs ${row.totalAmount?.toFixed(2) || '0.00'}` },
    { header: 'Grand Total', accessorFn: row => `Rs ${row.grandTotal?.toFixed(2) || '0.00'}` },
    { header: 'Amount Paid', accessorFn: row => `Rs ${row.amountPaid?.toFixed(2) || '0.00'}` },
    { header: 'Payment Due', accessorKey: 'paymentDue' },
    { 
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: info => (
        <span className={`status-badge status-${info.getValue()?.toLowerCase() || 'pending'}`}>
          {info.getValue() || 'Pending'}
        </span>
      ),
    },
    {
      header: 'Purchase Status',
      accessorKey: 'purchaseStatus',
      cell: info => (
        <span className={`status-badge status-${info.getValue()?.toLowerCase() || 'pending'}`}>
          {info.getValue() || 'Pending'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorFn: row => row.purchaseId,
      cell: info => (
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
  ], [getSupplierName, getLocationName, handleEdit, handleDelete]);

  // Filtered data for search with priority for purchaseId & purchaseStatus
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return purchases;

    const query = searchQuery.toLowerCase();
    const priorityMatches = [];
    const otherMatches = [];

    purchases.forEach(p => {
      const matchesPurchaseId = p.purchaseId.toString().includes(query);
      const matchesPurchaseStatus = p.purchaseStatus?.toLowerCase().includes(query);

      const matchesSupplier = getSupplierName(p.supplierId).toLowerCase().includes(query);
      const matchesLocation = getLocationName(p.locationId).toLowerCase().includes(query);

      if (matchesPurchaseId || matchesPurchaseStatus) {
        priorityMatches.push(p);
      } else if (matchesSupplier || matchesLocation) {
        otherMatches.push(p);
      }
    });

    return [...priorityMatches, ...otherMatches];
  }, [searchQuery, purchases, getSupplierName, getLocationName]);

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
          <h2>Purchase List</h2>
          <button className="btn btn-primary" onClick={handleAddPurchase}>
            <i className="fas fa-plus"></i> Add Purchase
          </button>
        </div>

        {/* Search & Page Size */}
        <div className="table-controls">
          <div className="search-barr">
            <input
              type="text"
              placeholder="Search Purchases..."
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
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
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
