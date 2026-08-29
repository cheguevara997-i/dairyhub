import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import BackButton from "../components/BackButton";

function AdminDashboard() {

  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    subscriptions: 0
  });

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        const [
          productsResponse,
          usersResponse,
          ordersResponse,
          subscriptionsResponse
        ] = await Promise.all([

          fetch("http://localhost:8080/api/products"),

          fetch("http://localhost:8080/api/users"),

          fetch("http://localhost:8080/api/orders"),

          fetch("http://localhost:8080/api/subscriptions")

        ]);


        const products =
          await productsResponse.json();

        const users =
          await usersResponse.json();

        const orders =
          await ordersResponse.json();

        const subscriptions =
          await subscriptionsResponse.json();


        const customers =
          users.filter(
            user => user.role === "CUSTOMER"
          );


        setStats({

          products: products.length,

          customers: customers.length,

          orders: orders.length,

          subscriptions: subscriptions.length

        });

      } catch (error) {

        console.error(
          "Dashboard fetch error:",
          error
        );

      }

    };


    fetchDashboardData();

  }, []);


  return (

    <div className="dashboard">

      <h1>
        Admin Dashboard
      </h1>


      <div className="stats-grid">

        <div className="stat-card">

          <h2>
            {stats.products}
          </h2>

          <p>
            Total Products
          </p>

        </div>


        <div className="stat-card">

          <h2>
            {stats.customers}
          </h2>

          <p>
            Total Customers
          </p>

        </div>


        <div className="stat-card">

          <h2>
            {stats.orders}
          </h2>

          <p>
            Total Orders
          </p>

        </div>


        <div className="stat-card">

          <h2>
            {stats.subscriptions}
          </h2>

          <p>
            Total Subscriptions
          </p>

        </div>

      </div>


      <div className="dashboard-grid">

        <Link
          to="/admin/products"
          className="dashboard-card"
        >

          🥛

          <h3>
            Manage Products
          </h3>

        </Link>


        <Link
          to="/admin/orders"
          className="dashboard-card"
        >

          📦

          <h3>
            Manage Orders
          </h3>

        </Link>


        <Link
          to="/admin/users"
          className="dashboard-card"
        >

          👥

          <h3>
            Manage Users
          </h3>

        </Link>


        <Link
          to="/admin/subscriptions"
          className="dashboard-card"
        >

          🔄

          <h3>
            Manage Subscriptions
          </h3>

        </Link>

      </div>

    </div>

  );

}

export default AdminDashboard;