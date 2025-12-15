// src/pages/product/ListProduct.js
import React, { useState, useEffect ,useCallback} from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
import { useProducts } from '../../context/ProductContext';
import '../../styles/ListProduct.css';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function ListProduct() {
  const navigate = useNavigate();
const { products, stocks = [], deleteProduct, loading, getProductDiscounts , discountCodes, addProductDiscount,fetchProducts} = useProducts();

const [searchQuery, setSearchQuery] = useState("");
const [displayedProducts, setDisplayedProducts] = useState(products);
  const [productDiscountsMap, setProductDiscountsMap] = useState({});

  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
const [selectedProductId, setSelectedProductId] = useState(null);
const [selectedDiscountCode, setSelectedDiscountCode] = useState('');

const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = useCallback(async () => {
  setIsRefreshing(true);
  try {
    if (fetchProducts) {
      await fetchProducts();
    }
    // If you have other data to refresh (like stocks, discounts)
    // you might want to call those functions here too
  } catch (error) {
    console.error("Failed to refresh:", error);
  } finally {
    setIsRefreshing(false);
  }
}, [fetchProducts]);

  useEffect(() => {
  if (!searchQuery.trim()) {
    setDisplayedProducts(products); // reset when no search
  } else {
    const query = searchQuery.toLowerCase();
    const sorted = [...products].sort((a, b) => {
      const aMatch = a.productName.toLowerCase().includes(query);
      const bMatch = b.productName.toLowerCase().includes(query);

      // Matches go on top
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
    setDisplayedProducts(sorted);
  }
}, [products, searchQuery]);

  
  useEffect(() => {
    if (products.length === 0) return;

    const fetchDiscounts = async () => {
      const discountsMap = {};

      for (const product of products) {
        const discounts = await getProductDiscounts(product.productId);

        // remove duplicate discount codes
        const uniqueDiscounts = discounts.filter(
          (d, index, self) => self.findIndex(x => x.code === d.code) === index
        );

        discountsMap[product.productId] = uniqueDiscounts;
      }

      setProductDiscountsMap(discountsMap);
    };

    fetchDiscounts();
  }, [products, getProductDiscounts]);

  const maxDiscountCount = Math.max(
    ...Object.values(productDiscountsMap).map(d => d.length),
    0
  );
const handleDownloadExcel = () => {
  const data = displayedProducts.map(product => {
    const stock = stocks.find(s => s.productId === product.productId);
    const discounts = productDiscountsMap[product.productId] || [];

    // Flatten discounts into Discount 1, Discount 2, ...
    const discountFields = {};
    discounts.forEach((d, idx) => {
      discountFields[`Discount ${idx + 1}`] = d.code;
    });

    return {
      ID: product.productId,
      Date: product.date || "N/A",
      ImageUrl: product.imageUrl ? `https://9v75jts3-7020.asse.devtunnels.ms${product.imageUrl}` : "N/A",
      ProductName: product.productName,
      ShortName: product.shortName,
      Location: stock?.location?.locationName || "N/A",
      SKU: product.sku,
      CurrentStock: stock?.currentStock ?? 0,
      PurchasePrice: stock?.purchasePrice ?? 0,
      MarkedPrice: stock?.markedPrice ?? 0,
      SellingPrice: stock?.sellingPrice ?? 0,
      ...discountFields,
      Category: product.category?.categoryName || "N/A",
      Brand: product.brand?.brandName || "N/A",
      Barcode: product.barcode?.barcodeType || "N/A",
      QuantityAlert: product.quantityAlert,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, "Products.xlsx");
};
  // Format price to PKR
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'PKR',
    }).format(price);
  };

  // Navigate to Edit page
const handleEdit = useCallback((product) => {
  navigate(`/product/Edit/${product.productId}`, { state: { product } });
}, [navigate]);

  // Delete product
const handleDelete = useCallback(async (productId) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  }
}, [deleteProduct])

  // Get stock info for product
const getStockByProductId = useCallback((productId) => {
  return stocks.find((stock) => stock.productId === productId);
}, [stocks]);

  // Define table columns
  const columns = React.useMemo(() => [
    { header: 'ID', accessorKey: 'productId' },
    { header: 'Date', accessorKey: 'date' },
    {
      header: 'Image',
      accessorKey: 'imageUrl',
      cell: info => {
        const url = info.getValue();
        const name = info.row.original.productName;
        return url ? (
          <img src={`https://9v75jts3-7020.asse.devtunnels.ms${url}`} alt={name} className="product-image" />
        ) : (
          <div className="no-image">No Image</div>
        );
      }
    },
    { header: 'Product Name', accessorKey: 'productName' },
    { header: 'Short Name', accessorKey: 'shortName' },
    {
      header: 'Location',
      accessorFn: row => getStockByProductId(row.productId)?.location?.locationName || 'N/A'
    },
        {
      header: 'Current Stock',
      cell: info => {
        const product = info.row.original;
        const stock = getStockByProductId(product.productId);
        return (
          <span
            className={`stock-badge ${
              stock?.currentStock <= 0
                ? 'out-of-stock'
                : stock?.currentStock <= product.quantityThreshold
                ? 'low-stock'
                : 'in-stock'
            }`}
          >
            {stock?.currentStock ?? 0}
          </span>
        );
      }
    },
    { header: 'SKU', accessorKey: 'sku' },

    {
      header: 'Purchase Price',
      accessorFn: row => formatPrice(getStockByProductId(row.productId)?.purchasePrice)
    },
    {
      header: 'Marked Price',
      accessorFn: row => formatPrice(getStockByProductId(row.productId)?.markedPrice)
    },
    {
      header: 'Selling Price',
      accessorFn: row => formatPrice(getStockByProductId(row.productId)?.sellingPrice)
    },

    // Dynamic Discount Columns
    ...Array.from({ length: maxDiscountCount }, (_, i) => ({
      header: `Discount ${i + 1}`,
      cell: info => {
        const product = info.row.original;
        const discounts = productDiscountsMap[product.productId] || [];
        return discounts[i] ? (
          <span className="discount-badge">{discounts[i].code}</span>
        ) : 'N/A';
      }
    })),

    { header: 'Category', accessorFn: row => row.category?.categoryName || 'N/A' },
    { header: 'Brand', accessorFn: row => row.brand?.brandName || 'N/A' },
    { header: 'Barcode Type', accessorFn: row => row.barcode?.barcodeType || 'N/A' },
    {
      header: 'Quantity Alert',
      cell: info => {
        const product = info.row.original;
        const stock = getStockByProductId(product.productId);
        return (
          <span
            className={`alert-badge ${
              stock?.currentStock <= product.quantityAlert ? 'alert' : ''
            }`}
          >
            {product.quantityAlert}
          </span>
        );
      }
    },
   {
  header: 'Actions',
  cell: info => {
    const product = info.row.original;
    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn btn-primary"
          onClick={() => handleEdit(product)}
        >
          <i className="fas fa-edit"></i> Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={() => handleDelete(product.productId)}
        >
          <i className="fas fa-trash"></i> Delete
        </button>
      </div>
    );
  }
}

  ], [productDiscountsMap, maxDiscountCount, getStockByProductId, handleEdit, handleDelete]);
  // Create table instance
 const table = useReactTable({
  data: displayedProducts,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  if (loading) {
    return (
      <div className="list-product-page">
        <Topbar />
        <Sidebar />
        <div className="list-product-content">
          <div className="loading-spinner">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-product-page">
      <Topbar />
      <Sidebar />
      <div className="list-product-content">
        {/* Header */}
        <div className="list-product-header">
          <div className="header-title">
            <h2>Product List</h2>
            <button
              className="action-button stock-button"
              onClick={() => navigate('/stock/list')}
            >
              <i className="fas fa-boxes"></i> Stock List
            </button>
    <button
  className={`refresh-circle ${isRefreshing ? 'refreshing' : ''}`}
  onClick={handleRefresh}
  disabled={isRefreshing}
  title="Refresh"
>
  ↻
</button>


          </div>
          <div className="header-actions">
           <button
  className="action-button add-button"
 onClick={() => {
  const productsWithoutDiscount = displayedProducts.filter(
    p => !(productDiscountsMap[p.productId] && productDiscountsMap[p.productId].length > 0)
  );

  if (productsWithoutDiscount.length === 0) {
    alert("All products already have discounts applied.");
    return;
  }

  // If at least one product doesn't have discount, allow popup to open
  setSelectedProductId(null); // <--- means apply globally
  setShowDiscountPopup(true);
}}

>
  <i className="fas fa-plus"></i> Apply Discounts
</button>
            <button
              className="action-button add-button"
              onClick={() => navigate('/product/add')}
            >
              <i className="fas fa-plus"></i> Add Product
            </button>
             <button
    className="action-button download-button"
    onClick={handleDownloadExcel}
  >
    <i className="fas fa-file-excel"></i> Download Excel
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

        {/* Product Table */}
        <div className="products-table-container">
          <table className="products-table">
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
  <div className="pagination">
    <button
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </button>
    <span>
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
      {showDiscountPopup && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Apply Discount</h3>
      
      <div className="form-group">
        <label>Discount Code</label>
        <select
          value={selectedDiscountCode}
          onChange={(e) => setSelectedDiscountCode(e.target.value)}
        >
          <option value="">-- Select Discount Code --</option>
          {discountCodes.map(dc => (
            <option key={dc.discountId} value={dc.discountCode}>
              {dc.discountCode}
            </option>
          ))}
        </select>
      </div>

      <div className="popup-actions">
        <button
          className="save-button"
          onClick={async () => {
            if (!selectedDiscountCode) {
              alert("Please select a discount code.");
              return;
            }
            try {
             if (selectedProductId) {
  // Apply to specific product (if ever used)
  await addProductDiscount(selectedProductId, [{ code: selectedDiscountCode }]);
} else {
  // No productId → apply globally to all products
  await addProductDiscount(null, [{ code: selectedDiscountCode }]);
}
await fetchProducts(); // Refresh product list


              alert("Discount applied successfully!");
              setShowDiscountPopup(false);
              setSelectedDiscountCode('');
            } catch (error) {
              console.error(error);
              alert("Failed to apply discount.");
            }
          }}
        >
          Save
        </button>

        <button
          className="cancel-button"
          onClick={() => {
            setShowDiscountPopup(false);
            setSelectedDiscountCode('');
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
