import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


import Navbar from "./components/Navbar";

import Footer from "./components/Footer";


import DairyInfo from "./pages/DairyInfo";

import Home from "./pages/Home";

import Products from "./pages/Products";

import ProductDetails from "./pages/ProductDetails";

import About from "./pages/About";

import Cart from "./pages/Cart";

import Login from "./pages/Login";

import Register from "./pages/Register";

import CustomerDashboard
  from "./pages/CustomerDashboard";

import MyOrders
  from "./pages/MyOrders";

import Subscription
  from "./pages/Subscription";

import MySubscriptions
  from "./pages/MySubscriptions";

import AdminSubscriptions
  from "./pages/AdminSubscriptions";


import AdminRoute
  from "./components/AdminRoute";


import CustomerRoute
  from "./components/CustomerRoute";


import AdminDashboard
  from "./pages/AdminDashboard";

import ManageProducts
  from "./pages/ManageProducts";

import ManageOrders
  from "./pages/ManageOrders";

import ManageUsers
  from "./pages/ManageUsers";


import ForgotPassword
  from "./pages/ForgotPassword";


import Profile
  from "./pages/Profile";


function App() {

  return (

    <BrowserRouter>


      {/* =====================================
          NAVBAR
      ====================================== */}

      <Navbar />


      {/* =====================================
          ROUTES
      ====================================== */}

      <Routes>


        {/* ===================================
            PUBLIC ROUTES
        ==================================== */}


        {/* HOME */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        {/* DAIRY INFORMATION */}

        <Route
          path="/dairy/:type"
          element={
            <DairyInfo />
          }
        />


        {/* PRODUCTS */}

        <Route
          path="/products"
          element={
            <Products />
          }
        />


        {/* PRODUCT DETAILS */}

        <Route
          path="/products/:id"
          element={
            <ProductDetails />
          }
        />


        {/* ===================================
            ABOUT DAIRYHUB
        ==================================== */}

        <Route
          path="/about"
          element={
            <About />
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        {/* ===================================
            CUSTOMER PROTECTED ROUTES
        ==================================== */}

        <Route
          element={
            <CustomerRoute />
          }
        >


          {/* CART */}

          <Route
            path="/cart"
            element={
              <Cart />
            }
          />


          {/* CUSTOMER DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <CustomerDashboard />
            }
          />


          {/* ORDERS */}

          <Route
            path="/orders"
            element={
              <MyOrders />
            }
          />


          {/* SUBSCRIPTION */}

          <Route
            path="/subscription"
            element={
              <Subscription />
            }
          />


          {/* MY SUBSCRIPTIONS */}

          <Route
            path="/my-subscriptions"
            element={
              <MySubscriptions />
            }
          />


          {/* =================================
              CUSTOMER PROFILE
          ================================== */}

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />


        </Route>


        {/* ===================================
            ADMIN PROTECTED ROUTES
        ==================================== */}

        <Route
          element={
            <AdminRoute />
          }
        >


          {/* ADMIN DASHBOARD */}

          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />


          {/* ADMIN PRODUCTS */}

          <Route
            path="/admin/products"
            element={
              <ManageProducts />
            }
          />


          {/* ADMIN ORDERS */}

          <Route
            path="/admin/orders"
            element={
              <ManageOrders />
            }
          />


          {/* ADMIN USERS */}

          <Route
            path="/admin/users"
            element={
              <ManageUsers />
            }
          />


          {/* ADMIN SUBSCRIPTIONS */}

          <Route
            path="/admin/subscriptions"
            element={
              <AdminSubscriptions />
            }
          />


          {/* =================================
              ADMIN PROFILE
          ================================== */}

          <Route
            path="/admin/profile"
            element={
              <Profile />
            }
          />


        </Route>


      </Routes>


      {/* =====================================
          FOOTER
      ====================================== */}

      <Footer />


    </BrowserRouter>

  );

}


export default App;