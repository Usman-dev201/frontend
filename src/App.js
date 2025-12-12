import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { BrandProvider } from "./context/BrandContext";
import { BarcodeProvider } from './context/BarcodeContext';
import { PurchaseProvider } from "./context/PurchaseContext";
import { DiscountProvider } from './context/DiscountContext';
import { TaxProvider } from "./context/TaxContext"; 
import { LocationProvider } from "./context/LocationContext";
import { SupplierProvider } from "./context/SupplierContext"; 
import { SalesProvider } from "./context/SalesContext"; 
import { SaleExchangeProvider } from "./context/SaleExchangeContext";


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
import ManageTax from "./tax/ManageTax";
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
import { PurchaseReturnProvider } from "./context/PurchaseReturnContext";
import Customer from "./pages/POS/Customer";
import { CrmProvider } from "./context/CrmContext";
import AddSales from "./pages/POS/AddSales";
import ListSales from "./pages/POS/ListSales";
import EditSales from "./pages/POS/EditSales"; 
import ListSaleExchange from "./pages/POS/ListSalesExchange";
import AddSaleExchange from "./pages/POS/AddSaleExchange";
import EditSaleExchange from "./pages/POS/EditSaleExchange";
import LoyaltyPrograms from "./pages/CRM/LoyaltyProgram";
import ExpenseCategory from "./pages/Expense/ExpenseCategory";
import {ExpenseProvider} from "./context/ExpenseContext";
import AddExpense  from './pages/Expense/AddExpense';
import ListExpense from './pages/Expense/ListExpense';
import EditExpense from './pages/Expense/EditExpense';
import Accounts from './pages/Accounting/Accounts';
import Assets from './pages/Accounting/Assets';
import Liabilities from './pages/Accounting/Liabilities';
import Revenue from './pages/Accounting/Revenue';
import Expense from './pages/Accounting/Expense';
import BalanceSheetAndIncomeStatement from './pages/Reports/BalanceSheet and IncomeStatment';
import CashFlow from './pages/Reports/CashFlow';
import AccountReceivable from './pages/Reports/AccountReceivable';
import AccountPayable from './pages/Reports/AccountPayable';
import CogsReport from './pages/Reports/CogsReport';
import TaxPayable from './pages/TaxPayable/TaxPayable';
import FeedbackCategory from './pages/CRM/FeedbackCatgeory';
import CustomerFeedback from './pages/CRM/CustomerFeedback';
import ShippingAddress from './pages/E-Commerce/ShippingAddress';
import Order from './pages/E-Commerce/Orders';
import OrderSummary from './pages/E-Commerce/OrderSummary';
import AddShippment from './pages/E-Commerce/AddShippment';
import EditShippment from './pages/E-Commerce/EditShippment';
import ListShipments from './pages/E-Commerce/ListShippment';
import Payment from './pages/E-Commerce/Payment'; 
import Review from './pages/E-Commerce/Review';
import MarketingCampaigns from './pages/CRM/MarketingCampaign';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>  
          <SalesProvider>
             <SaleExchangeProvider>
           
        <PurchaseProvider>
         <PurchaseReturnProvider >
          <ProductProvider>
            <TaxProvider>
            <DiscountProvider> 
            <CategoryProvider>
              <BrandProvider>
                <BarcodeProvider>
                    <LocationProvider>
                       <SupplierProvider>
                         <CrmProvider> 
                          <ExpenseProvider>
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
  path="/tax/manage"
  element={
    <ProtectedRoute>
      <ManageTax />
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
  path="/customers"
  element={
    <ProtectedRoute>
      <Customer />
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
                        <Navigate to="/Login" replace />
                      </ProtectedRoute>
                    }
                  />
  <Route
path="/sales/list"
  element={
    <ProtectedRoute>
      <ListSales />
    </ProtectedRoute>
  }
/>
  
                  <Route
  path="/sales/add"
  element={
    <ProtectedRoute>
      <AddSales />
    </ProtectedRoute>
  }
/>
<Route
  path="/sales/edit/:id"
  element={
    <ProtectedRoute>
      <EditSales />
    </ProtectedRoute>
  }
/>
<Route
path="/saleexchange/list"
  element={
    <ProtectedRoute>
      <ListSaleExchange />
    </ProtectedRoute>
  }
/>
             <Route path="/saleexchange/add/:saleId?" element={<AddSaleExchange />} />

 <Route
  path="/salesexchange/edit/:id"
  element={
    <ProtectedRoute>
      <EditSaleExchange/>
    </ProtectedRoute>
  }
/>    <Route
  path="/crm/loyalty-programs"
  element={ 
    <ProtectedRoute>
      <LoyaltyPrograms/>
    </ProtectedRoute>
  }
/>
<Route
  path="/expense/category"
  element={<ProtectedRoute> 
    <ExpenseCategory/>
    </ProtectedRoute>}
/>
 <Route
                    path="/expense/add"
                    element={
                      <ProtectedRoute>
                        <AddExpense />
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/expense/list"
                    element={
                      <ProtectedRoute>
                        <ListExpense />
                      </ProtectedRoute>
                    }
                  />
                   <Route
  path="/expense/edit/:id"
  element={
    <ProtectedRoute>
      <EditExpense />
    </ProtectedRoute>
  }
/>
      <Route
                    path="/accounting/accounts"
                    element={
                      <ProtectedRoute>
                        <Accounts />
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/accounting/accounts/add"
                    element={
                      <ProtectedRoute>
                        <Accounts />
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/accounting/accounts/edit/"
                    element={
                      <ProtectedRoute>
                        <Accounts />
                      </ProtectedRoute>
                    }
                  />
                     <Route
                    path="/reports/balance-sheet"
                    element={
                      <ProtectedRoute>
                        <BalanceSheetAndIncomeStatement/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/reports/cash-flow"
                    element={
                      <ProtectedRoute>
                        <CashFlow/>
                      </ProtectedRoute>
                    }
                  />
                     <Route
                    path="/reports/accounts-receivable"
                    element={
                      <ProtectedRoute>
                        <AccountReceivable/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports/accounts-payable"
                    element={
                      <ProtectedRoute>
                        <AccountPayable/>
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/reports/cogs"
                    element={
                      <ProtectedRoute>
                        <CogsReport/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/accounting/assets"
                    element={
                      <ProtectedRoute>
                        <Assets/>
                      </ProtectedRoute>
                    }
                  />
                     <Route
                    path="/accounting/liabilities"
                    element={
                      <ProtectedRoute>
                        <Liabilities/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/accounting/revenue"
                    element={
                      <ProtectedRoute>
                        <Revenue/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/accounting/expense"
                    element={
                      <ProtectedRoute>
                        <Expense/>
                      </ProtectedRoute>
                    }
                  />
                      <Route
                    path="/taxpayable"
                    element={
                      <ProtectedRoute>
                        <TaxPayable/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/crm/feedbackcategory"
                    element={
                      <ProtectedRoute>
                        <FeedbackCategory/>
                      </ProtectedRoute>
                    }
                  />
                     <Route
                    path="/crm/customerfeedbacks"
                    element={
                      <ProtectedRoute>
                        <CustomerFeedback/>
                      </ProtectedRoute>
                    }
                  />
   <Route
                    path="/ecommerce/shippingaddresses"
                    element={
                      <ProtectedRoute>
                        <ShippingAddress/>
                      </ProtectedRoute>
                    }
                  />
   <Route
                    path="/ecommerce/orders"
                    element={
                      <ProtectedRoute>
                        <Order/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/ordersummary/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderSummary/>
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/add-shipment/:orderId"
                    element={
                      <ProtectedRoute>
                        <AddShippment/>
                      </ProtectedRoute>
                    }
                  />
                    <Route
                    path="/ecommerce/shipments"
                    element={
                      <ProtectedRoute>
                        <ListShipments/>
                      </ProtectedRoute>
                    }
                  />
                 <Route
  path="/shipment/edit/:shippingId"
  element={
    <ProtectedRoute>
      <EditShippment />
    </ProtectedRoute>
  }
/>

   <Route
                    path="/ecommerce/payments"
                    element={
                      <ProtectedRoute>
                        <Payment/>
                      </ProtectedRoute>
                    }
                  />
  <Route
                    path="/ecommerce/reviews"
                    element={
                      <ProtectedRoute>
                        <Review/>
                      </ProtectedRoute>
                    }
                  />
                   <Route
                    path="/crm/marketingcampaigns"
                    element={
                      <ProtectedRoute>
                        <MarketingCampaigns/>
                      </ProtectedRoute>
                    }
                  />
                  {/* Redirect any unknown routes to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                  
                </Routes>
                 </ExpenseProvider>
                </CrmProvider> 
                </SupplierProvider>
                </LocationProvider>
                </BarcodeProvider>
              </BrandProvider>
            </CategoryProvider>
                </DiscountProvider>
                </TaxProvider>
          </ProductProvider>
          </PurchaseReturnProvider>
        </PurchaseProvider>
    
        </SaleExchangeProvider>
        </SalesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
