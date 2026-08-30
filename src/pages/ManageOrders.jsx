import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function ManageOrders() {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================
  // FETCH ALL ORDERS
  // =========================================

  const fetchOrders = async () => {

    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/orders"
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


      alert(
        "Unable to load orders."
      );


    } finally {

      setLoading(false);

    }

  };


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
       * Keep ALL existing order information.
       * Only change the status.
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


      const response = await fetch(
        `https://dairyhub-backend.onrender.com/api/orders/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body:
            JSON.stringify(
              updatedOrder
            )

        }
      );


      if (!response.ok) {

        throw new Error(
          "Failed to update order"
        );

      }


      const savedOrder =
        await response.json();


      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (currentOrder) =>
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
        "Unable to update order status."
      );

    }

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


      <h1>
        Manage Orders
      </h1>


      {loading ? (

        <div className="empty-state">

          <h3>
            Loading orders...
          </h3>

        </div>

      ) : orders.length === 0 ? (

        <div className="empty-state">

          <h3>
            No orders available
          </h3>

        </div>

      ) : (

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

                <div className="order-header">

                  <h3>
                    Order #{order.id}
                  </h3>


                  <span className="order-status">
                    {order.status}
                  </span>

                </div>


                {/* =================================
                    CUSTOMER DETAILS
                ================================= */}

                <div className="admin-order-section">

                  <h4>
                    👤 Customer Details
                  </h4>


                  <p>
                    <strong>
                      Name:
                    </strong>{" "}
                    {order.customerName || "N/A"}
                  </p>


                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {order.customerEmail || "N/A"}
                  </p>


                  <p>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {order.phone || "N/A"}
                  </p>

                </div>


                {/* =================================
                    DELIVERY DETAILS
                ================================= */}

                <div className="admin-order-section">

                  <h4>
                    📍 Delivery Details
                  </h4>


                  <p>
                    <strong>
                      Address:
                    </strong>{" "}
                    {order.address || "N/A"}
                  </p>


                  <p>
                    <strong>
                      City:
                    </strong>{" "}
                    {order.city || "N/A"}
                  </p>


                  <p>
                    <strong>
                      State:
                    </strong>{" "}
                    {order.state || "N/A"}
                  </p>


                  <p>
                    <strong>
                      Pincode:
                    </strong>{" "}
                    {order.pincode || "N/A"}
                  </p>

                </div>


                {/* =================================
                    ORDER ITEMS
                ================================= */}

                <div className="admin-order-section">

                  <h4>
                    🛒 Order Items
                  </h4>


                  {!order.items ||
                  order.items.length === 0 ? (

                    <p className="no-order-items">
                      No item details available.
                    </p>

                  ) : (

                    <div className="admin-order-items">

                      {order.items.map(
                        (item) => (

                          <div
                            className="admin-order-item"
                            key={item.id}
                          >

                            <div>

                              <strong>
                                {item.productName}
                              </strong>

                              <small>
                                ₹{item.price} ×{" "}
                                {item.quantity}
                              </small>

                            </div>


                            <strong>
                              ₹{item.subtotal}
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

                <div className="admin-order-section">

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

                <div className="admin-order-total">

                  <span>
                    Total Amount
                  </span>


                  <strong>
                    ₹{order.totalAmount}
                  </strong>

                </div>


                {/* =================================
                    ORDER DATE
                ================================= */}

                <p className="admin-order-date">

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

                <div className="admin-order-status-control">

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

                    <option value="ORDER_PLACED">
                      Order Placed
                    </option>

                    <option value="PROCESSING">
                      Processing
                    </option>

                    <option value="OUT_FOR_DELIVERY">
                      Out for Delivery
                    </option>

                    <option value="DELIVERED">
                      Delivered
                    </option>

                    <option value="CANCELLED">
                      Cancelled
                    </option>

                  </select>

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