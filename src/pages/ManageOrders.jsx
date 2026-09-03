import { useEffect, useState } from "react";

import BackButton from "../components/BackButton";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function ManageOrders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingOrderId, setDeletingOrderId] =
    useState(null);


  // =========================================
  // FETCH ALL ORDERS
  // =========================================

  const fetchOrders = async () => {

    try {

      setLoading(true);


      const response =
        await fetch(
          `${API_BASE}/api/orders`
        );


      if (!response.ok) {

        throw new Error(
          "Failed to fetch orders"
        );

      }


      const data =
        await response.json();


      setOrders(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Error fetching orders:",
        error
      );


      alert(
        "Unable to load orders."
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    fetchOrders();

  }, []);


  // =========================================
  // UPDATE ORDER STATUS
  // =========================================

  const updateOrderStatus = async (
    id,
    status
  ) => {

    try {

      const order =
        orders.find(
          (currentOrder) =>
            currentOrder.id === id
        );


      if (!order) {

        return;

      }


      /*
       * Keep all existing order information.
       * Only update status.
       */

      const updatedOrder = {

        customerName:
          order.customerName,

        customerEmail:
          order.customerEmail,

        phone:
          order.phone,

        address:
          order.address,

        city:
          order.city,

        state:
          order.state,

        pincode:
          order.pincode,

        totalAmount:
          order.totalAmount,

        status:
          status,

        paymentStatus:
          order.paymentStatus,

        razorpayOrderId:
          order.razorpayOrderId,

        razorpayPaymentId:
          order.razorpayPaymentId,

        razorpaySignature:
          order.razorpaySignature,

        orderDate:
          order.orderDate,

        items:
          order.items || []

      };


      const response =
        await fetch(
          `${API_BASE}/api/orders/${id}`,
          {

            method:
              "PUT",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                updatedOrder
              )

          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Failed to update order"
        );

      }


      const savedOrder =
        await response.json();


      setOrders(
        previousOrders =>
          previousOrders.map(
            currentOrder =>
              currentOrder.id === id
                ? savedOrder
                : currentOrder
          )
      );


    } catch (error) {

      console.error(
        "Order status update error:",
        error
      );


      alert(
        error.message ||
        "Unable to update order status."
      );

    }

  };


  // =========================================
  // DELETE ORDER
  // =========================================

  const deleteOrder = async (
    id
  ) => {

    const order =
      orders.find(
        currentOrder =>
          currentOrder.id === id
      );


    if (!order) {

      return;

    }


    // =======================================
    // CONFIRMATION
    // =======================================

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete Order #${id}?\n\nThis order will be removed from the admin panel and the customer's order history.\n\nThis action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingOrderId(id);


      const response =
        await fetch(
          `${API_BASE}/api/orders/${id}`,
          {
            method:
              "DELETE"
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Failed to delete order"
        );

      }


      /*
       * Remove the deleted order
       * from the current admin screen
       * immediately.
       */

      setOrders(
        previousOrders =>
          previousOrders.filter(
            currentOrder =>
              currentOrder.id !== id
          )
      );


      alert(
        `Order #${id} deleted successfully.`
      );


    } catch (error) {

      console.error(
        "Delete order error:",
        error
      );


      alert(
        error.message ||
        "Unable to delete order."
      );


    } finally {

      setDeletingOrderId(null);

    }

  };


  // =========================================
  // FORMAT STATUS
  // =========================================

  const formatStatus = (
    status
  ) => {

    if (!status) {

      return "UNKNOWN";

    }


    return status
      .toString()
      .replaceAll(
        "_",
        " "
      );

  };


  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="admin-page">


      {/* =====================================
          BACK
      ====================================== */}

      <BackButton
        to="/admin"
        text="← Back to Admin Dashboard"
      />


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="manage-orders-header">

        <div>

          <span className="admin-page-label">
            DAIRYHUB ADMIN
          </span>


          <h1>
            Manage Orders
          </h1>


          <p>
            Track, update and manage customer orders.
          </p>

        </div>


        <div className="manage-orders-count">

          <strong>
            {orders.length}
          </strong>

          <span>
            Total Orders
          </span>

        </div>

      </div>


      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="empty-state">

          <h3>
            Loading orders...
          </h3>

        </div>


      ) : orders.length === 0 ? (

        /* =====================================
           EMPTY
        ====================================== */

        <div className="empty-state">

          <div className="empty-state-icon">
            📦
          </div>


          <h3>
            No orders available
          </h3>


          <p>
            Customer orders will appear here
            when they place an order.
          </p>

        </div>


      ) : (

        /* =====================================
           ORDERS
        ====================================== */

        <div className="orders-container">

          {orders.map(
            (order) => (

              <div
                className="order-card"
                key={order.id}
              >


                {/* =================================
                    ORDER HEADER
                ================================= */}

                <div
                  className="order-header"
                >

                  <div>

                    <span className="order-label">
                      ORDER
                    </span>


                    <h3>
                      Order #{order.id}
                    </h3>


                    {order.orderDate && (

                      <small>
                        {new Date(
                          order.orderDate
                        ).toLocaleString()}
                      </small>

                    )}

                  </div>


                  <span
                    className={
                      `order-status ${
                        order.status
                          ?.toLowerCase()
                          .replaceAll(
                            "_",
                            "-"
                          ) || ""
                      }`
                    }
                  >

                    {formatStatus(
                      order.status
                    )}

                  </span>

                </div>


                {/* =================================
                    CUSTOMER DETAILS
                ================================= */}

                <div
                  className="admin-order-section"
                >

                  <h4>
                    👤 Customer Details
                  </h4>


                  <p>

                    <strong>
                      Name:
                    </strong>{" "}

                    {order.customerName ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      Email:
                    </strong>{" "}

                    {order.customerEmail ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      Phone:
                    </strong>{" "}

                    {order.phone ||
                      "N/A"}

                  </p>

                </div>


                {/* =================================
                    DELIVERY DETAILS
                ================================= */}

                <div
                  className="admin-order-section"
                >

                  <h4>
                    📍 Delivery Details
                  </h4>


                  <p>

                    <strong>
                      Address:
                    </strong>{" "}

                    {order.address ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      City:
                    </strong>{" "}

                    {order.city ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      State:
                    </strong>{" "}

                    {order.state ||
                      "N/A"}

                  </p>


                  <p>

                    <strong>
                      Pincode:
                    </strong>{" "}

                    {order.pincode ||
                      "N/A"}

                  </p>

                </div>


                {/* =================================
                    ORDER ITEMS
                ================================= */}

                <div
                  className="admin-order-section"
                >

                  <h4>
                    🛒 Order Items
                  </h4>


                  {!order.items ||
                  order.items.length === 0 ? (

                    <p
                      className="no-order-items"
                    >
                      No item details available.
                    </p>

                  ) : (

                    <div
                      className="admin-order-items"
                    >

                      {order.items.map(
                        (item) => (

                          <div
                            className="admin-order-item"
                            key={item.id}
                          >

                            <div>

                              <strong>
                                {item.productName ||
                                  "Product"}
                              </strong>


                              <small>

                                ₹
                                {item.price}
                                {" × "}
                                {item.quantity}

                              </small>

                            </div>


                            <strong>
                              ₹
                              {item.subtotal}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* =================================
                    PAYMENT DETAILS
                ================================= */}

                <div
                  className="admin-order-section"
                >

                  <h4>
                    💳 Payment Details
                  </h4>


                  <p>

                    <strong>
                      Payment Status:
                    </strong>{" "}


                    <span
                      className={
                        order.paymentStatus ===
                        "PAID"

                          ? "payment-paid"

                          : "payment-pending"
                      }
                    >

                      {order.paymentStatus ||
                        "PENDING"}

                    </span>

                  </p>


                  {order.razorpayPaymentId && (

                    <p>

                      <strong>
                        Payment ID:
                      </strong>{" "}

                      {order.razorpayPaymentId}

                    </p>

                  )}

                </div>


                {/* =================================
                    ORDER TOTAL
                ================================= */}

                <div
                  className="admin-order-total"
                >

                  <span>
                    Total Amount
                  </span>


                  <strong>
                    ₹
                    {order.totalAmount}
                  </strong>

                </div>


                {/* =================================
                    ORDER DATE
                ================================= */}

                <p
                  className="admin-order-date"
                >

                  <strong>
                    Order Date:
                  </strong>{" "}


                  {order.orderDate
                    ? new Date(
                        order.orderDate
                      ).toLocaleString()
                    : "N/A"}

                </p>


                {/* =================================
                    UPDATE STATUS
                ================================= */}

                <div
                  className="admin-order-status-control"
                >

                  <label>
                    Update Order Status
                  </label>


                  <select
                    value={
                      order.status ||
                      "ORDER_PLACED"
                    }
                    onChange={(e) =>
                      updateOrderStatus(
                        order.id,
                        e.target.value
                      )
                    }
                  >

                    <option
                      value="ORDER_PLACED"
                    >
                      Order Placed
                    </option>


                    <option
                      value="PROCESSING"
                    >
                      Processing
                    </option>


                    <option
                      value="OUT_FOR_DELIVERY"
                    >
                      Out for Delivery
                    </option>


                    <option
                      value="DELIVERED"
                    >
                      Delivered
                    </option>


                    <option
                      value="CANCELLED"
                    >
                      Cancelled
                    </option>

                  </select>

                </div>


                {/* =================================
                    DELETE ORDER
                ================================= */}

                <div
                  className="admin-order-delete-section"
                >

                  <button
                    type="button"
                    className="admin-delete-order-btn"
                    onClick={() =>
                      deleteOrder(
                        order.id
                      )
                    }
                    disabled={
                      deletingOrderId ===
                      order.id
                    }
                  >

                    {deletingOrderId ===
                    order.id

                      ? "Deleting..."

                      : "🗑️ Delete Order"

                    }

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}


export default ManageOrders;