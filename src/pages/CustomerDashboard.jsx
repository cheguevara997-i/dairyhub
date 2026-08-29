import { Link } from "react-router-dom";

function CustomerDashboard() {

  const user =
    JSON.parse(
      localStorage.getItem("dairyhubUser")
    );


  return (

    <div className="dashboard">


      {/* DASHBOARD HEADER */}

      <div className="dashboard-header">

        <div>

          <h1>
            Customer Dashboard
          </h1>

          <p>
            Welcome back to DairyHub 👋
          </p>

        </div>


        <Link
          to="/"
          className="dashboard-home-btn"
        >
          🏠 Home
        </Link>

      </div>


      {/* WELCOME MESSAGE */}

      <p className="dashboard-welcome">
        Hello, {user?.name || "Customer"}! Manage your
        orders, subscriptions and dairy products from here.
      </p>


      {/* DASHBOARD CARDS */}

      <div className="dashboard-grid">


        <Link
          to="/products?from=dashboard"
          className="dashboard-card"
        >
          🛒

          <h3>
            Shop Products
          </h3>
        </Link>


        <Link
          to="/orders"
          className="dashboard-card"
        >

          📦

          <h3>
            My Orders
          </h3>

        </Link>


        <Link
          to="/subscription"
          className="dashboard-card"
        >

          🔄

          <h3>
            Milk Subscription
          </h3>

        </Link>


        <Link
          to="/my-subscriptions"
          className="dashboard-card"
        >

          📋

          <h3>
            My Subscriptions
          </h3>

        </Link>


      </div>

    </div>

  );

}

export default CustomerDashboard;