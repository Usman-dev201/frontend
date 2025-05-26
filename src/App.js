import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { BrandProvider } from "./context/BrandContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ListProduct from "./pages/inventory/ListProduct";
import AddProduct from "./pages/inventory/AddProduct";
import EditProduct from "./pages/inventory/EditProduct";
import Categories from "./pages/inventory/Categories";
import Brands from "./pages/inventory/Brands";
import DiscountList from "./pages/discount/DiscountList";
import AddDiscount from "./pages/discount/AddDiscount";
import TaxList from "./tax/TaxList";
import StockList from "./pages/inventory/StockList";
import StockTransfer from "./pages/stock/StockTransfer";
import AddStockTransfer from "./pages/stock/AddStockTransfer";
import EditStockTransfer from "./pages/stock/EditStockTransfer";
import ListPurchase from "./pages/purchase/ListPurchase";
import AddPurchase from "./pages/purchase/AddPurchase";
import EditPurchase from "./pages/purchase/EditPurchase";
import ReturnPurchase from "./pages/purchase/ReturnPurchase";
import AddPurchaseReturn from "./pages/purchase/AddPurchaseReturn";
import EditPurchaseReturn from "./pages/purchase/EditPurchaseReturn";
import Suppliers from "./pages/purchase/Suppliers";
import ListLocation from "./pages/location/ListLocation";
import ListUser from "./pages/users/ListUser";
import Roles from "./pages/users/Roles";
import BarcodeList from "./pages/inventory/BarcodeList";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PurchaseProvider>
          <ProductProvider>
            <CategoryProvider>
              <BrandProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/product/list"
                    element={
                      <ProtectedRoute>
                        <ListProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/product/add"
                    element={
                      <ProtectedRoute>
                        <AddProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/product/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <Categories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/brands"
                    element={
                      <ProtectedRoute>
                        <Brands />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/barcode/list"
                    element={
                      <ProtectedRoute>
                        <BarcodeList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/discount"
                    element={
                      <ProtectedRoute>
                        <DiscountList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/discount/add"
                    element={
                      <ProtectedRoute>
                        <AddDiscount />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tax"
                    element={
                      <ProtectedRoute>
                        <TaxList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock/list"
                    element={
                      <ProtectedRoute>
                        <StockList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock/transfer"
                    element={
                      <ProtectedRoute>
                        <StockTransfer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock/transfer/add"
                    element={
                      <ProtectedRoute>
                        <AddStockTransfer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock/transfer/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditStockTransfer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stock/history"
                    element={
                      <ProtectedRoute>
                        <StockTransfer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/location"
                    element={
                      <ProtectedRoute>
                        <ListLocation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/customers"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/crm/leads"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/list"
                    element={
                      <ProtectedRoute>
                        <ListPurchase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/add"
                    element={
                      <ProtectedRoute>
                        <AddPurchase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditPurchase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/return"
                    element={
                      <ProtectedRoute>
                        <ReturnPurchase />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/return/add"
                    element={
                      <ProtectedRoute>
                        <AddPurchaseReturn />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/return/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditPurchaseReturn />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchase/suppliers"
                    element={
                      <ProtectedRoute>
                        <Suppliers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/list"
                    element={
                      <ProtectedRoute>
                        <ListUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/roles"
                    element={
                      <ProtectedRoute>
                        <Roles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </BrandProvider>
            </CategoryProvider>
          </ProductProvider>
        </PurchaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
