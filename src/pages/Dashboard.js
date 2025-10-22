import React, { useEffect, useState, useMemo } from 'react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import {
  FaTags, FaFileAlt, FaChartBar, FaShoppingCart,
  FaMoneyBillWave, FaUndo, FaExclamationTriangle
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useProducts } from '../context/ProductContext';
import { usePurchase } from '../context/PurchaseContext';
import api from '../api/axios';
import '../styles/Dashboard.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const { products, loading: productsLoading } = useProducts();
  const { purchases, loading: purchasesLoading } = usePurchase();

  const [returns, setReturns] = useState([]);
  const [sales, setSales] = useState([]);
  const [saleReturns, setSaleReturns] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [salesView, setSalesView] = useState("daily"); // 👈 'daily' | 'weekly' | 'monthly'

  const [loadingReturns, setLoadingReturns] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingSaleReturns, setLoadingSaleReturns] = useState(true);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [discounts, setDiscounts] = useState([]);
const [loadingDiscounts, setLoadingDiscounts] = useState(true);


  // ✅ Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, returnRes, salesRes, saleReturnRes, stockRes, discountRes] = await Promise.all([
          api.get("/Location"),
          api.get("/PurchaseReturn"),
          api.get("/SalesRecord"),
          api.get("/SaleExchange"),
          api.get("/Stock"),
            api.get("/Discount")
        ]);
        setLocations(locRes.data || []);
        setReturns(returnRes.data || []);
        setSales(salesRes.data || []);
        setSaleReturns(saleReturnRes.data || []);
        setStocks(stockRes.data || []);
         setDiscounts(discountRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoadingLocations(false);
        setLoadingReturns(false);
        setLoadingSales(false);
        setLoadingSaleReturns(false);
        setLoadingStocks(false);
          setLoadingDiscounts(false); 
      }
    };
    fetchData();
  }, []);
useEffect(() => {
  if (loadingDiscounts || discounts.length === 0) return;

  const today = new Date();
  const alertThresholdDays = 3; // 🔥 You can customize this

  const upcomingExpiries = discounts.filter(discount => {
    if (!discount.endDate) return false;

    const endDate = new Date(discount.endDate);
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    return discount.status === "Active" && diffDays > 0 && diffDays <= alertThresholdDays;
  });

  if (upcomingExpiries.length > 0) {
upcomingExpiries.forEach(d =>
  toast.warning(`⚠️ Discount "${d.discountCode}" will expire on ${d.endDate}`)
);

   
  }
}, [discounts, loadingDiscounts]);
useEffect(() => {
  if (loadingStocks || stocks.length === 0) return;

  // Filter low stock products
  const lowStockItems = stocks.filter(stock => stock.status === "LowStock");

  if (lowStockItems.length > 0) {
    lowStockItems.forEach(stock => {
      const productName = stock.product?.productName || "Unknown Product";
      const locationName = stock.location?.locationName || "Unknown Location";

      toast.error(`🚨 Low stock alert: "${productName}" at ${locationName}`);
    });
  }
}, [stocks, loadingStocks]);

  // ✅ Filter data by Location
  const filteredPurchases = useMemo(() => {
    if (selectedLocation === "All") return purchases;
    return purchases.filter(p => p.locationId === parseInt(selectedLocation));
  }, [purchases, selectedLocation]);

  const filteredReturns = useMemo(() => {
    if (selectedLocation === "All") return returns;
    return returns.filter(r => r.purchaseRecord?.locationId === parseInt(selectedLocation));
  }, [returns, selectedLocation]);

  const filteredSales = useMemo(() => {
    if (selectedLocation === "All") return sales;
    return sales.filter(s => s.locationId === parseInt(selectedLocation));
  }, [sales, selectedLocation]);

  const filteredSaleReturns = useMemo(() => {
    if (selectedLocation === "All") return saleReturns;
    return saleReturns.filter(r => r.salesRecord?.locationId === parseInt(selectedLocation));
  }, [saleReturns, selectedLocation]);

  const filteredStocks = useMemo(() => {
    if (selectedLocation === "All") return stocks;
    return stocks.filter(s => s.locationId === parseInt(selectedLocation));
  }, [stocks, selectedLocation]);

  const filteredProducts = useMemo(() => {
    if (selectedLocation === "All") return products;
    const productIdsAtLocation = new Set(filteredStocks.map(stock => stock.productId));
    return products.filter(p => productIdsAtLocation.has(p.productId));
  }, [products, filteredStocks, selectedLocation]);

  // ✅ Totals Calculation
  const totalProducts = productsLoading ? null : filteredProducts.length;
  const completedPurchases = filteredPurchases.filter(p => p.purchaseStatus === "Completed");
  const totalPurchases = purchasesLoading ? null : completedPurchases.length;
  const totalPurchaseDue = purchasesLoading
    ? null
    : filteredPurchases.reduce((sum, p) => sum + (p.paymentDue || 0), 0);

  const approvedPurchaseReturns = filteredReturns.filter(r => r.refundStatus === "Approved");
  const totalPurchaseReturns = loadingReturns ? null : approvedPurchaseReturns.length;
// ✅ Expense Calculation (Filtered by Location)
const totalExpense = useMemo(() => {
  if (loadingReturns || purchasesLoading) return null;

  // ✅ Filter Completed Purchases by selected Location
  const completedPurchaseTotal = filteredPurchases
    .filter(p => p.purchaseStatus === "Completed")
    .reduce((sum, p) => sum + (p.grandTotal || 0), 0);

  // ✅ Filter Approved Purchase Returns by selected Location
  const approvedReturnTotal = filteredReturns
    .filter(r => r.refundStatus === "Approved")
    .reduce((sum, r) => sum + (r.grandTotal || 0), 0);

  // ✅ Net Expense = Purchases - Returns
  return completedPurchaseTotal - approvedReturnTotal;
}, [filteredPurchases, filteredReturns, purchasesLoading, loadingReturns]);

  const completedSales = filteredSales.filter(s => s.transactionStatus === "Completed");
  const totalSales = loadingSales
    ? null
    : completedSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

  const approvedSaleReturns = filteredSaleReturns.filter(r => r.exchangeStatus === "Approved");
  const totalSaleReturns = loadingSaleReturns
    ? null
    : approvedSaleReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  const outOfStockProducts = filteredStocks.filter(stock => stock.status === "LowStock");

  // 🧮 Dynamic Sales Graph (Daily / Weekly / Monthly)
  const salesGraphData = useMemo(() => {
    const today = new Date();

    if (salesView === "daily") {
      // Last 30 days
      return Array.from({ length: 30 }, (_, i) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (29 - i));
        const dateString = day.toISOString().split("T")[0];

        const daySales = filteredSales.filter(
          sale => sale.transactionStatus === "Completed" && sale.date === dateString
        );
        const total = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

        return {
          label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          totalSales: total,
        };
      });
    }

    if (salesView === "weekly") {
      // Last 12 weeks
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const start = new Date(today);
        start.setDate(today.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const weekSales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.date);
          return (
            sale.transactionStatus === "Completed" &&
            saleDate >= start &&
            saleDate <= end
          );
        });

        const total = weekSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

        data.push({
          label: `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
          totalSales: total,
        });
      }
      return data;
    }

    if (salesView === "monthly") {
      // Last 12 months
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthSales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.date);
          return (
            sale.transactionStatus === "Completed" &&
            saleDate.getMonth() === month &&
            saleDate.getFullYear() === year
          );
        });

        const total = monthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

        data.push({
          label: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
          totalSales: total,
        });
      }
      return data;
    }

    return [];
  }, [filteredSales, salesView]);

  // ✅ Stats
  const stats = [
    { title: 'Total Products', value: productsLoading ? "Loading..." : totalProducts, icon: <FaTags /> },
    { title: 'Total Purchases', value: purchasesLoading ? "Loading..." : totalPurchases, icon: <FaShoppingCart /> },
    { title: 'Total Purchase Due', value: purchasesLoading ? "Loading..." : `Rs ${totalPurchaseDue.toFixed(2)}`, icon: <FaMoneyBillWave /> },
    { title: 'Total Purchase Returns', value: loadingReturns ? "Loading..." : totalPurchaseReturns, icon: <FaUndo /> },
    { title: 'Total Sales', value: loadingSales ? "Loading..." : `Rs ${totalSales.toFixed(2)}`, icon: <FaFileAlt /> },
    { 
  title: 'Total Expense',
  value: (purchasesLoading || loadingReturns) 
    ? "Loading..." 
    : `Rs ${totalExpense.toFixed(2)}`,
  icon: <FaMoneyBillWave />
},
    { title: 'Total Sale Returns', value: loadingSaleReturns ? "Loading..." : `Rs ${totalSaleReturns.toFixed(2)}`, icon: <FaUndo /> },
  ];

  return (
    <div className="dashboard">
      <Topbar />
      <Sidebar />
      <div className="dashboard-content">
        <h2>Dashboard Overview</h2>

        {/* 🏢 Location Filter */}
        <div className="filter-container">
          <label>Location:</label>
          {loadingLocations ? (
            <p>Loading...</p>
          ) : (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ✅ Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Sales Graph with Toggle */}
        <div className="dashboard-section">
          <div className="graph-header">
            <h3>
              <FaChartBar style={{ marginRight: '8px', color: '#2563eb' }} />
              Sales Overview ({salesView.charAt(0).toUpperCase() + salesView.slice(1)})
            </h3>
            <div className="view-toggle">
              {["daily", "weekly", "monthly"].map((view) => (
                <button
                  key={view}
                  className={`toggle-btn ${salesView === view ? "active" : ""}`}
                  onClick={() => setSalesView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#2563eb"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="Sales (Rs)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Product Stock Alert */}
        <div className="dashboard-section">
          <h3><FaExclamationTriangle style={{ color: '#ef4444', marginRight: '8px' }} /> Product Stock Alert</h3>
          {loadingStocks ? (
            <p>Loading stock data...</p>
          ) : outOfStockProducts.length === 0 ? (
            <p>✅ All products are in stock for selected location.</p>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Location</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockProducts.map((stock, index) => (
                    <tr key={index}>
                      <td>{stock.product?.productName || "N/A"}</td>
                      <td>{stock.location?.locationName || "N/A"}</td>
                      <td>{stock.currentStock}</td>
                      <td><span className="status-badge lowstock">{stock.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
       <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}
