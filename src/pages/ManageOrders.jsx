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
  // GET LOGGED-IN ADMIN USER
  // =========================================

  const getLoggedInUser = () => {

    try {

      return JSON.parse(
        localStorage.getItem(
          "dairyhubUser"
        )
      );

    } catch {

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

      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})

    };

  };


  // =========================================
  // FETCH ALL ORDERS
  // =========================================

  const fetchOrders = async () => {

    try {

      setLoading(true);


      const token =
        getAuthToken();


      if (!token) {

        throw new Error(
          "Admin login token not found. Please login again."
        );

      }


      const response =
        await fetch(
          `${API_BASE}/api/orders`,
          {

            method:
              "GET",

            headers:
              getAuthHeaders()

          }
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

        if (
          response.status === 401 ||
          response.status === 403
        ) {

          throw new Error(
            "Your admin session is invalid or expired. Please login again."
          );

        }


        throw new Error(
          data?.message ||
          responseText ||
          "Failed to fetch orders."
        );

      }


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
        error.message ||
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
          currentOrder =>
            currentOrder.id ===
            id
        );


      if (!order) {

        return;

      }


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
          order.items || [],

        experienceRating:
          order.experienceRating ?? null,

        experienceFeedback:
          order.experienceFeedback ?? null,

        experienceFeedbackAt:
          order.experienceFeedbackAt ?? null

      };


      const response =
        await fetch(
          `${API_BASE}/api/orders/${id}`,
          {

            method:
              "PUT",

            headers:
              getAuthHeaders(),

            body:
              JSON.stringify(
                updatedOrder
              )

          }
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

        if (
          response.status === 401 ||
          response.status === 403
        ) {

          throw new Error(
            "Your admin session is invalid or expired. Please login again."
          );

        }


        throw new Error(
          data?.message ||
          responseText ||
          "Failed to update order."
        );

      }


      setOrders(
        previousOrders =>
          previousOrders.map(
            currentOrder =>
              currentOrder.id ===
              id
                ? data
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
          currentOrder.id ===
          id
      );


    if (!order) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete Order #${id}?\n\nThis order will be removed from the admin panel and the customer's order history.\n\nThis action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingOrderId(
        id
      );


      const response =
        await fetch(
          `${API_BASE}/api/orders/${id}`,
          {

            method:
              "DELETE",

            headers:
              getAuthHeaders()

          }
        );


      const responseText =
        await response.text();


      if (!response.ok) {

        if (
          response.status === 401 ||
          response.status === 403
        ) {

          throw new Error(
            "Your admin session is invalid or expired. Please login again."
          );

        }


        throw new Error(
          responseText ||
          "Failed to delete order."
        );

      }


      setOrders(
        previousOrders =>
          previousOrders.filter(
            currentOrder =>
              currentOrder.id !==
              id
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

      setDeletingOrderId(
        null
      );

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

        <div className="orders-container">

          {orders.map(
            order => (

              <div
                className="order-card"
                key={
                  order.id
                }
              >

                {/* ORDER HEADER */}

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


                {/* CUSTOMER DETAILS */}

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


                {/* DELIVERY DETAILS */}

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


                {/* ORDER ITEMS */}

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
                        item => (

                          <div
                            className="admin-order-item"
                            key={
                              item.id
                            }
                          >

                            <div>

                              <strong>
                                {item.productName ||
                                  "Product"}
                              </strong>


                              <small>

                                {item.size
                                  ? `${item.size} • `
                                  : ""}

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


                {/* PAYMENT DETAILS */}

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


                {/* ORDER EXPERIENCE FEEDBACK */}

                {order.experienceRating != null && (

                  <div
                    className="admin-order-section"
                  >

                    <h4>
                      ⭐ Customer Experience Feedback
                    </h4>


                    <p>

                      <strong>
                        Rating:
                      </strong>{" "}

                      {order.experienceRating}/5

                    </p>


                    {order.experienceFeedback && (

                      <p>

                        <strong>
                          Feedback:
                        </strong>{" "}

                        {order.experienceFeedback}

                      </p>

                    )}


                    {order.experienceFeedbackAt && (

                      <p>

                        <strong>
                          Submitted:
                        </strong>{" "}

                        {new Date(
                          order.experienceFeedbackAt
                        ).toLocaleString()}

                      </p>

                    )}

                  </div>

                )}


                {/* ORDER TOTAL */}

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


                {/* ORDER DATE */}

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


                {/* UPDATE STATUS */}

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


                {/* DELETE ORDER */}

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