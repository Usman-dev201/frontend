import React, { useMemo ,useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/StockList.css';

export default function StockList() {
  const navigate = useNavigate();
  const { stocks = [], loading, error } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
const [displayedStocks, setDisplayedStocks] = useState(stocks);
useEffect(() => {
  if (!searchQuery.trim()) {
    setDisplayedStocks(stocks); // no search → show all
  } else {
    const query = searchQuery.toLowerCase();
    const sorted = [...stocks].sort((a, b) => {
      const aMatch = a.product?.productName.toLowerCase().includes(query);
      const bMatch = b.product?.productName.toLowerCase().includes(query);

      // matches go to top
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    setDisplayedStocks(sorted);
  }
}, [searchQuery, stocks]);
  // Format price function to handle currency formatting
  const formatPrice = (price) => {
    if (!price) return 'Rs0.00';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(price);
  };

  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'productId' },
    { header: 'Product Name', accessorFn: row => row.product?.productName },
    { header: 'Location', accessorFn: row => row.location?.locationName },
     { header: 'Current Stock', accessorKey: 'currentStock' },
    { header: 'Purchase Price', accessorFn: row => formatPrice(row.purchasePrice) },
    { header: 'Marked Price', accessorFn: row => formatPrice(row.markedPrice) },
    { header: 'Selling Price', accessorFn: row => formatPrice(row.sellingPrice) },
    { header: 'Stock Value (Purchase)', accessorFn: row => formatPrice(row.currentStockValueByPurPrice) },
    { header: 'Stock Value (Selling)', accessorFn: row => formatPrice(row.currentStockValueBySelPrice) },
    { header: 'Potential Profit', accessorFn: row => formatPrice(row.potentialProfit) },
    { header: 'Total Units Sold', accessorFn: row => row.totalUnitSold || 0 },
    { header: 'Total Units Transferred', accessorFn: row => row.totalUnitTransfered || 0 },
    { header: 'Total Units Adjusted', accessorFn: row => row.totalUnitAdjust || 0 },
    {
      header: 'Stock Status',
      accessorFn: row => row.status,
      cell: info => {
        const status = info.getValue();
        return (
          <span className={`stock-status ${status === 'LowStock' ? 'low-stock' : 'in-stock'}`}>
            {status}
          </span>
        );
      }
    },
  ], []);

  const table = useReactTable({
      data: displayedStocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <div>Loading stock data...</div>;
  if (error) return <div>Error loading stock data: {error.message}</div>;

  return (
    <div className="stock-list-page">
      <Topbar />
      <Sidebar />
      <div className="stock-list-content">
        <div className="stock-list-header">
          <div className="header-title">
            <h2>Stock List</h2>
            <button 
              className="action-button list-product-button"
              onClick={() => navigate('/product/list')}
            >
              <i className="fas fa-list"></i>
              Product List
            </button>
          </div>
        </div>
      <div className="table-controls">
  {/* Search Bar */}
<div className="search-barr">
  <input
    type="text"
    placeholder="Search products..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

  {/* Page size dropdown */}
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

        <div className="stock-table-container">
          
          <table className="stock-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
