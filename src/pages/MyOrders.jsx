import { useEffect, useState } from "react";

import BackButton from "../components/BackButton";

function MyOrders() {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);


  const user =
    JSON.parse(
      localStorage.getItem("dairyhubUser")
    );


  const orderSteps = [

    {
      key: "ORDER_PLACED",
      label: "Order Placed",
      description:
        "Your order has been placed successfully."
    },

    {
      key: "PROCESSING",
      label: "Processing",
      description:
        "Your order is being prepared."
    },

    {
      key: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      description:
        "Your order is on the way."
    },

    {
      key: "DELIVERED",
      label: "Delivered",
      description:
        "Your order has been delivered."
    }

  ];


  /* =========================================
     FETCH CUSTOMER ORDERS
  ========================================= */

  useEffect(() => {

    const fetchOrders = async () => {

      if (!user?.email) {

        setLoading(false);

        return;

      }


      try {

        const response =
          await fetch(
            `http://localhost:8080/api/orders/customer/${encodeURIComponent(
              user.email
            )}`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch orders"
          );

        }


        const data =
          await response.json();


        setOrders(data);


      } catch (error) {

        console.error(
          "Error fetching orders:",
          error
        );


        setOrders([]);


      } finally {

        setLoading(false);

      }

    };


    fetchOrders();

  }, [user?.email]);


  /* =========================================
     CURRENT TRACKING STEP
  ========================================= */

  const getCurrentStep = (status) => {

    return orderSteps.findIndex(
      step =>
        step.key === status
    );

  };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <div className="customer-orders-page">

        <BackButton
          to="/dashboard"
          text="← Back to Dashboard"
        />


        <h1>
          My Orders 📦
        </h1>


        <div className="customer-orders-empty">

          <h3>
            Loading orders...
          </h3>

        </div>

      </div>

    );

  }


  return (

    <div className="customer-orders-page">


      <BackButton
        to="/dashboard"
        text="← Back to Dashboard"
      />


      <h1>
        My Orders 📦
      </h1>


      {/* =====================================
          NOT LOGGED IN
      ===================================== */}

      {!user ? (

        <div className="customer-orders-empty">

          <h3>
            Please login
          </h3>

          <p>
            Please login to view your orders.
          </p>

        </div>

      ) : orders.length === 0 ? (

        /* =====================================
           NO ORDERS
        ===================================== */

        <div className="customer-orders-empty">

          <h3>
            No orders found
          </h3>

          <p>
            You haven't placed any orders yet.
          </p>

        </div>

      ) : (

        /* =====================================
           ORDERS
        ===================================== */

        <div className="customer-orders-list">

          {orders.map((order) => {

            const currentStep =
              getCurrentStep(
                order.status
              );


            return (

              <div
                className="customer-order-card"
                key={order.id}
              >

                {/* =================================
                    ORDER HEADER
                ================================= */}

                <div className="customer-order-header">

                  <div>

                    <span className="customer-order-label">
                      ORDER
                    </span>

                    <h2>
                      #{order.id}
                    </h2>

                  </div>


                  <span className="customer-order-status">
                    {order.status}
                  </span>

                </div>


                {/* =================================
                    CUSTOMER DETAILS
                ================================= */}

                <div className="customer-order-section">

                  <h3>
                    👤 Customer Details
                  </h3>


                  <div className="customer-order-info-grid">

                    <div>

                      <span>
                        Name
                      </span>

                      <strong>
                        {order.customerName ||
                          "N/A"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Email
                      </span>

                      <strong>
                        {order.customerEmail ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =================================
                    ORDER ITEMS
                ================================= */}

                <div className="customer-order-section">

                  <h3>
                    🛒 Ordered Products
                  </h3>


                  {order.items &&
                  order.items.length > 0 ? (

                    <div className="customer-order-items">

                      {order.items.map(
                        (item, index) => (

                          <div
                            className="customer-order-item"
                            key={
                              item.id ||
                              `${order.id}-${index}`
                            }
                          >

                            <div>

                              <strong>
                                {item.productName}
                              </strong>

                              <span>
                                ₹{item.price} ×{" "}
                                {item.quantity}
                              </span>

                            </div>


                            <strong className="customer-order-item-price">

                              ₹
                              {item.subtotal}

                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p className="customer-order-no-items">

                      Product details are not
                      available for this order.

                    </p>

                  )}

                </div>


                {/* =================================
                    ORDER SUMMARY
                ================================= */}

                <div className="customer-order-summary">

                  <div>

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹{order.totalAmount}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Payment Status
                    </span>

                    <strong
                      className={
                        `customer-payment-status ${
                          order.paymentStatus
                            ?.toLowerCase() || ""
                        }`
                      }
                    >
                      {order.paymentStatus ||
                        "PENDING"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Order Date
                    </span>

                    <strong>
                      {order.orderDate
                        ? new Date(
                            order.orderDate
                          ).toLocaleString()
                        : "N/A"}
                    </strong>

                  </div>

                </div>


                {/* =================================
                    ORDER TRACKING
                ================================= */}

                <div className="customer-order-tracking">

                  <h3>
                    🚚 Order Tracking
                  </h3>


                  {order.status ===
                  "CANCELLED" ? (

                    <div className="customer-cancelled-order">

                      <div className="customer-cancelled-dot">
                        ✕
                      </div>


                      <div>

                        <strong>
                          Order Cancelled
                        </strong>

                        <p>
                          This order has been
                          cancelled.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="customer-tracking-list">

                      {orderSteps.map(
                        (step, index) => {

                          const completed =
                            index <=
                            currentStep;


                          const isCurrent =
                            index ===
                            currentStep;


                          return (

                            <div
                              className={
                                `customer-tracking-step ${
                                  completed
                                    ? "completed"
                                    : ""
                                } ${
                                  isCurrent
                                    ? "current"
                                    : ""
                                }`
                              }
                              key={step.key}
                            >

                              <div className="customer-tracking-left">

                                <div className="customer-tracking-dot">

                                  {completed
                                    ? "✓"
                                    : ""}

                                </div>


                                {index <
                                  orderSteps.length -
                                    1 && (

                                  <div
                                    className={
                                      `customer-tracking-line ${
                                        index <
                                        currentStep
                                          ? "completed"
                                          : ""
                                      }`
                                    }
                                  />

                                )}

                              </div>


                              <div className="customer-tracking-content">

                                <strong>
                                  {step.label}
                                </strong>

                                <p>

                                  {isCurrent
                                    ? step.description
                                    : completed
                                    ? "Completed"
                                    : "Pending"}

                                </p>

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  )}

                </div>


                {/* =================================
                    DELIVERY DETAILS
                ================================= */}

                <div className="customer-order-delivery">

                  <h3>
                    📍 Delivery Details
                  </h3>


                  <div className="customer-delivery-grid">

                    <div>

                      <span>
                        Phone
                      </span>

                      <strong>
                        {order.phone ||
                          "N/A"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Address
                      </span>

                      <strong>
                        {order.address ||
                          "N/A"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        City
                      </span>

                      <strong>
                        {order.city ||
                          "N/A"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        State
                      </span>

                      <strong>
                        {order.state ||
                          "N/A"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Pincode
                      </span>

                      <strong>
                        {order.pincode ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}

export default MyOrders;