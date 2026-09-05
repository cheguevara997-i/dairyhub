import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";


// =========================================
// API BASE URL
// =========================================
//
// BOTH local development and production use
// the SAME Render backend.
//
// LOCAL:
//
// http://localhost:5173
//        ↓
// https://dairyhub-backend.onrender.com
//        ↓
// Aiven MySQL
//
// PRODUCTION:
//
// https://dairyhub-five.vercel.app
//        ↓
// https://dairyhub-backend.onrender.com
//        ↓
// Aiven MySQL
//

const API_BASE =
  "https://dairyhub-backend.onrender.com";


function AdminDashboard() {

  const navigate = useNavigate();


  // =========================================
  // DASHBOARD STATS
  // =========================================

  const [stats, setStats] = useState({

    products: 0,

    customers: 0,

    orders: 0,

    subscriptions: 0

  });


  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] =
    useState(true);


  // =========================================
  // GET LOGGED-IN USER
  // =========================================

  const getLoggedInUser = () => {

    try {

      const savedUser =
        localStorage.getItem(
          "dairyhubUser"
        );


      if (!savedUser) {

        return null;

      }


      return JSON.parse(
        savedUser
      );


    } catch (error) {

      console.error(
        "Unable to read logged-in user:",
        error
      );


      return null;

    }

  };


  // =========================================
  // GET AUTH TOKEN
  // =========================================

  const getAuthToken = () => {

    const user =
      getLoggedInUser();


    return user?.token || null;

  };


  // =========================================
  // AUTH HEADERS
  // =========================================

  const getAuthHeaders = () => {

    const token =
      getAuthToken();


    return {

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})

    };

  };


  // =========================================
  // HANDLE AUTH FAILURE
  // =========================================

  const handleAuthFailure = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );


    alert(
      "Your admin session is invalid or expired. Please login again."
    );


    navigate(
      "/login"
    );

  };


  // =========================================
  // FETCH JSON SAFELY
  // =========================================

  const fetchJson = async (
    url,
    options = {}
  ) => {

    const response =
      await fetch(
        url,
        options
      );


    const responseText =
      await response.text();


    let data = null;


    try {

      data =
        responseText
          ? JSON.parse(
              responseText
            )
          : null;

    } catch {

      data = null;

    }


    if (!response.ok) {

      const error =
        new Error(

          data?.message ||

          responseText ||

          `Request failed with status ${response.status}`

        );


      error.status =
        response.status;


      throw error;

    }


    return data;

  };


  // =========================================
  // LOAD DASHBOARD DATA
  // =========================================

  useEffect(() => {

    const fetchDashboardData =
      async () => {

        try {

          setLoading(
            true
          );


          // =================================
          // CHECK LOGIN
          // =================================

          const user =
            getLoggedInUser();


          if (!user) {

            handleAuthFailure();

            return;

          }


          // =================================
          // CHECK ROLE
          // =================================

          const role =
            String(
              user.role || ""
            )
              .trim()
              .toUpperCase();


          if (
            role !==
            "ADMIN"
          ) {

            alert(
              "Admin access is required."
            );


            navigate(
              "/dashboard"
            );


            return;

          }


          // =================================
          // CHECK TOKEN
          // =================================

          if (
            !user.token
          ) {

            handleAuthFailure();

            return;

          }


          // =================================
          // AUTH HEADERS
          // =================================

          const headers =
            getAuthHeaders();


          // =================================
          // FETCH ALL DASHBOARD DATA
          // =================================

          const [

            products,

            users,

            orders,

            subscriptions

          ] = await Promise.all([


            // -------------------------------
            // PRODUCTS
            // -------------------------------

            fetchJson(
              `${API_BASE}/api/products`
            ),


            // -------------------------------
            // ACTIVE USERS
            // -------------------------------

            fetchJson(
              `${API_BASE}/api/users/active`,
              {
                method:
                  "GET",

                headers:
                  headers

              }
            ),


            // -------------------------------
            // ORDERS
            // -------------------------------

            fetchJson(
              `${API_BASE}/api/orders`
            ),


            // -------------------------------
            // SUBSCRIPTIONS
            // -------------------------------

            fetchJson(
              `${API_BASE}/api/subscriptions`
            )

          ]);


          // =================================
          // NORMALIZE RESPONSES
          // =================================

          const productList =
            Array.isArray(
              products
            )
              ? products
              : [];


          const userList =
            Array.isArray(
              users
            )
              ? users
              : [];


          const orderList =
            Array.isArray(
              orders
            )
              ? orders
              : [];


          const subscriptionList =
            Array.isArray(
              subscriptions
            )
              ? subscriptions
              : [];


          // =================================
          // COUNT ACTIVE CUSTOMERS
          // =================================

          const customers =
            userList.filter(
              user => {

                const userRole =
                  String(
                    user.role || ""
                  )
                    .trim()
                    .toUpperCase();


                return (

                  userRole ===
                  "CUSTOMER"

                  &&

                  !Boolean(
                    user.deleted
                  )

                );

              }
            );


          // =================================
          // UPDATE STATS
          // =================================

          setStats({

            products:
              productList.length,

            customers:
              customers.length,

            orders:
              orderList.length,

            subscriptions:
              subscriptionList.length

          });


        } catch (error) {

          console.error(
            "Dashboard fetch error:",
            error
          );


          // =================================
          // AUTHORIZATION ERROR
          // =================================

          if (

            error.status ===
            401 ||

            error.status ===
            403

          ) {

            handleAuthFailure();

            return;

          }


          alert(
            error.message ||
            "Unable to load dashboard data."
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    fetchDashboardData();

  }, [navigate]);


  // =========================================
  // LOADING PAGE
  // =========================================

  if (
    loading
  ) {

    return (

      <div
        className="dashboard"
      >

        <h1>
          Admin Dashboard
        </h1>


        <div
          className="empty-state"
        >

          <h3>
            Loading dashboard...
          </h3>

        </div>

      </div>

    );

  }


  // =========================================
  // MAIN PAGE
  // =========================================

  return (

    <div
      className="dashboard"
    >


      {/* =====================================
          HEADER
      ====================================== */}

      <div
        className="dashboard-header"
      >

        <div>

          <h1>
            Admin Dashboard
          </h1>


          <p>
            Manage DairyHub from one place.
          </p>

        </div>


        <Link
          to="/admin/users"
          className="dashboard-primary-btn"
        >
          Manage Users
        </Link>

      </div>


      {/* =====================================
          STATS
      ====================================== */}

      <div
        className="stats-grid"
      >


        {/* PRODUCTS */}

        <div
          className="stat-card"
        >

          <h2>
            {stats.products}
          </h2>


          <p>
            Total Products
          </p>

        </div>


        {/* CUSTOMERS */}

        <div
          className="stat-card"
        >

          <h2>
            {stats.customers}
          </h2>


          <p>
            Total Customers
          </p>

        </div>


        {/* ORDERS */}

        <div
          className="stat-card"
        >

          <h2>
            {stats.orders}
          </h2>


          <p>
            Total Orders
          </p>

        </div>


        {/* SUBSCRIPTIONS */}

        <div
          className="stat-card"
        >

          <h2>
            {stats.subscriptions}
          </h2>


          <p>
            Total Subscriptions
          </p>

        </div>

      </div>


      {/* =====================================
          ADMIN OPTIONS
      ====================================== */}

      <div
        className="dashboard-grid"
      >


        {/* PRODUCTS */}

        <Link
          to="/admin/products"
          className="dashboard-card"
        >

          <div>
            🥛
          </div>


          <h3>
            Manage Products
          </h3>

        </Link>


        {/* ORDERS */}

        <Link
          to="/admin/orders"
          className="dashboard-card"
        >

          <div>
            📦
          </div>


          <h3>
            Manage Orders
          </h3>

        </Link>


        {/* USERS */}

        <Link
          to="/admin/users"
          className="dashboard-card"
        >

          <div>
            👥
          </div>


          <h3>
            Manage Users
          </h3>

        </Link>


        {/* SUBSCRIPTIONS */}

        <Link
          to="/admin/subscriptions"
          className="dashboard-card"
        >

          <div>
            🔄
          </div>


          <h3>
            Manage Subscriptions
          </h3>

        </Link>

      </div>

    </div>

  );

}


export default AdminDashboard;