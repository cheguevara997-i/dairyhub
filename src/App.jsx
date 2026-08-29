import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import DairyInfo from "./pages/DairyInfo";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import MyOrders from "./pages/MyOrders";
import Subscription from "./pages/Subscription";

import MySubscriptions from "./pages/MySubscriptions";

import AdminSubscriptions from "./pages/AdminSubscriptions";

import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./pages/AdminDashboard";
import ManageProducts from "./pages/ManageProducts";
import ManageOrders from "./pages/ManageOrders";
import ManageUsers from "./pages/ManageUsers";

import ForgotPassword from "./pages/ForgotPassword";

import CustomerRoute from "./components/CustomerRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dairy/:type"
          element={<DairyInfo />}
        />

        <Route 
          path="/products" 
          element={<Products />} 
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route element={<CustomerRoute />}>
          <Route
            path="/cart"
            element={<Cart />}
          />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route element={<CustomerRoute />}>

          <Route
            path="/dashboard"
            element={<CustomerDashboard />}
          />

          <Route
            path="/orders"
            element={<MyOrders />}
          />

          <Route
            path="/subscription"
            element={<Subscription />}
          />

          <Route
            path="/my-subscriptions"
            element={<MySubscriptions />}
          />

        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/products"
            element={<ManageProducts />}
          />

          <Route
            path="/admin/orders"
            element={<ManageOrders />}
          />

          <Route
            path="/admin/users"
            element={<ManageUsers />}
          />

          <Route
            path="/admin/subscriptions"
            element={<AdminSubscriptions />}
          />

        </Route>

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;