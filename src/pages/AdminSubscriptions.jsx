import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function AdminSubscriptions() {

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* =========================================
     FETCH ALL SUBSCRIPTIONS
  ========================================= */

  const fetchSubscriptions = async () => {

    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/subscriptions"
      );

      if (!response.ok) {

        throw new Error(
          "Failed to fetch subscriptions"
        );

      }

      const data =
        await response.json();

      setSubscriptions(data);

    } catch (error) {

      console.error(
        "Subscription fetch error:",
        error
      );

      alert(
        "Unable to load subscriptions."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchSubscriptions();

  }, []);


  /* =========================================
     DELIVERY TIME FORMAT
  ========================================= */

  const formatDeliveryTime = (
    deliveryTime
  ) => {

    if (!deliveryTime) {

      return "N/A";

    }

    const value =
      deliveryTime.toLowerCase();

    if (value === "morning") {

      return "🌅 Morning";

    }

    if (value === "evening") {

      return "🌙 Evening";

    }

    if (value === "both") {

      return "🌅 Morning & Evening";

    }

    return deliveryTime;

  };


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {

    if (!date) {

      return "N/A";

    }

    try {

      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

    } catch {

      return date;

    }

  };


  /* =========================================
     CANCEL SUBSCRIPTION
  ========================================= */

  const cancelSubscription =
    async (id) => {

      const confirmCancel =
        window.confirm(
          "Are you sure you want to cancel this subscription?"
        );

      if (!confirmCancel) {

        return;

      }


      try {

        const response =
          await fetch(
            `https://dairyhub-backend.onrender.com/api/subscriptions/${id}/cancel`,
            {
              method: "PUT"
            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to cancel subscription"
          );

        }


        const updatedSubscription =
          await response.json();


        setSubscriptions(
          (previousSubscriptions) =>
            previousSubscriptions.map(
              (subscription) =>
                subscription.id === id
                  ? updatedSubscription
                  : subscription
            )
        );


        alert(
          "Subscription cancelled successfully!"
        );


      } catch (error) {

        console.error(
          "Cancel subscription error:",
          error
        );

        alert(
          "Unable to cancel subscription."
        );

      }

    };


  /* =========================================
     PAUSE SUBSCRIPTION
  ========================================= */

  const pauseSubscription =
    async (id) => {

      const confirmPause =
        window.confirm(
          "Are you sure you want to pause this subscription?"
        );

      if (!confirmPause) {

        return;

      }


      try {

        const response =
          await fetch(
            `https://dairyhub-backend.onrender.com/api/subscriptions/${id}/pause`,
            {
              method: "PUT"
            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to pause subscription"
          );

        }


        const updatedSubscription =
          await response.json();


        setSubscriptions(
          (previousSubscriptions) =>
            previousSubscriptions.map(
              (subscription) =>
                subscription.id === id
                  ? updatedSubscription
                  : subscription
            )
        );


        alert(
          "Subscription paused successfully!"
        );


      } catch (error) {

        console.error(
          "Pause subscription error:",
          error
        );

        alert(
          "Unable to pause subscription."
        );

      }

    };


  /* =========================================
     RESUME SUBSCRIPTION
  ========================================= */

  const resumeSubscription =
    async (id) => {

      const confirmResume =
        window.confirm(
          "Resume this subscription?"
        );

      if (!confirmResume) {

        return;

      }


      try {

        const response =
          await fetch(
            `https://dairyhub-backend.onrender.com/api/subscriptions/${id}/resume`,
            {
              method: "PUT"
            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to resume subscription"
          );

        }


        const updatedSubscription =
          await response.json();


        setSubscriptions(
          (previousSubscriptions) =>
            previousSubscriptions.map(
              (subscription) =>
                subscription.id === id
                  ? updatedSubscription
                  : subscription
            )
        );


        alert(
          "Subscription resumed successfully!"
        );


      } catch (error) {

        console.error(
          "Resume subscription error:",
          error
        );

        alert(
          "Unable to resume subscription."
        );

      }

    };


  /* =========================================
     DELETE SUBSCRIPTION
  ========================================= */

  const deleteSubscription =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to permanently delete this subscription?"
        );

      if (!confirmDelete) {

        return;

      }


      try {

        const response =
          await fetch(
            `https://dairyhub-backend.onrender.com/api/subscriptions/${id}`,
            {
              method: "DELETE"
            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to delete subscription"
          );

        }


        setSubscriptions(
          (previousSubscriptions) =>
            previousSubscriptions.filter(
              (subscription) =>
                subscription.id !== id
            )
        );


        alert(
          "Subscription deleted successfully!"
        );


      } catch (error) {

        console.error(
          "Delete subscription error:",
          error
        );

        alert(
          "Unable to delete subscription."
        );

      }

    };


  /* =========================================
     PAGE
  ========================================= */

  return (

    <div className="admin-subscriptions-page">


      {/* =====================================
          BACK BUTTON
      ===================================== */}

      <BackButton
        to="/admin"
        text="← Back to Admin Dashboard"
      />


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-subscriptions-header">

        <div>

          <span className="admin-page-label">
            DAIRYHUB ADMIN
          </span>

          <h1>
            Manage Subscriptions
          </h1>

          <p>
            View and manage customer milk subscriptions
          </p>

        </div>


        <div className="admin-subscription-count">

          {subscriptions.length}

          <span>
            Total
          </span>

        </div>

      </div>


      {/* =====================================
          LOADING
      ===================================== */}

      {loading ? (

        <div className="admin-subscriptions-empty">

          <div className="admin-empty-icon">
            ⏳
          </div>

          <h3>
            Loading subscriptions...
          </h3>

        </div>

      ) : subscriptions.length === 0 ? (


        /* =====================================
           EMPTY STATE
        ===================================== */

        <div className="admin-subscriptions-empty">

          <div className="admin-empty-icon">
            🥛
          </div>

          <h3>
            No subscriptions found
          </h3>

          <p>
            Customer subscriptions will appear here.
          </p>

        </div>

      ) : (


        /* =====================================
           SUBSCRIPTIONS
        ===================================== */

        <div className="admin-subscriptions-grid">

          {subscriptions.map(
            (subscription) => (

              <div
                className="admin-subscription-card"
                key={subscription.id}
              >


                {/* =================================
                    CARD HEADER
                ================================= */}

                <div className="admin-subscription-card-header">

                  <div>

                    <span className="subscription-label">
                      SUBSCRIPTION
                    </span>

                    <h2>
                      #{subscription.id}
                    </h2>

                  </div>


                  <span
                    className={
                      `admin-status-badge ${
                        subscription.status
                          ?.toLowerCase()
                      }`
                    }
                  >

                    {subscription.status ||
                      "N/A"}

                  </span>

                </div>


                {/* =================================
                    CUSTOMER DETAILS
                ================================= */}

                <div className="admin-customer-box">

                  <div className="admin-customer-icon">
                    👤
                  </div>


                  <div>

                    <span>
                      Customer
                    </span>


                    <strong>
                      {subscription.customerName ||
                        "N/A"}
                    </strong>


                    <small>
                      ✉️{" "}
                      {subscription.customerEmail ||
                        "N/A"}
                    </small>


                    <small>
                      📞{" "}
                      {subscription.phone ||
                        "N/A"}
                    </small>

                  </div>

                </div>


                {/* =================================
                    DELIVERY DETAILS
                ================================= */}

                <div className="admin-address-box">

                  <div className="admin-address-header">

                    <span>
                      📍
                    </span>

                    <strong>
                      Delivery Details
                    </strong>

                  </div>


                  {/* ADDRESS */}

                  <div className="admin-address-main">

                    <small>
                      Address
                    </small>

                    <p>
                      {subscription.address ||
                        "N/A"}
                    </p>

                  </div>


                  {/* CITY */}

                  <div className="admin-address-location">

                    <div>

                      <small>
                        City
                      </small>

                      <strong>
                        {subscription.city ||
                          "N/A"}
                      </strong>

                    </div>


                    {/* STATE */}

                    <div>

                      <small>
                        State
                      </small>

                      <strong>
                        {subscription.state ||
                          "N/A"}
                      </strong>

                    </div>


                    {/* PINCODE */}

                    <div>

                      <small>
                        Pincode
                      </small>

                      <strong>
                        {subscription.pincode ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =================================
                    SUBSCRIPTION DETAILS
                ================================= */}

                <div className="admin-subscription-details">


                  {/* MILK TYPE */}

                  <div className="admin-detail-item">

                    <span>
                      🥛
                    </span>

                    <div>

                      <small>
                        Milk Type
                      </small>

                      <strong>
                        {subscription.milkType ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>


                  {/* QUANTITY */}

                  <div className="admin-detail-item">

                    <span>
                      📦
                    </span>

                    <div>

                      <small>
                        Quantity
                      </small>

                      <strong>
                        {subscription.quantity ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>


                  {/* DURATION */}

                  <div className="admin-detail-item">

                    <span>
                      📅
                    </span>

                    <div>

                      <small>
                        Duration
                      </small>

                      <strong>
                        {subscription.duration ||
                          "N/A"}
                      </strong>

                    </div>

                  </div>


                  {/* DELIVERY */}

                  <div className="admin-detail-item">

                    <span>
                      🕒
                    </span>

                    <div>

                      <small>
                        Delivery
                      </small>

                      <strong>
                        {formatDeliveryTime(
                          subscription.deliveryTime
                        )}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* =================================
                    PAYMENT DETAILS
                ================================= */}

                <div className="admin-payment-box">

                  <div>

                    <span>
                      💳 Payment Status
                    </span>

                    <strong>
                      {subscription.paymentStatus ||
                        "N/A"}
                    </strong>

                  </div>

                </div>


                {/* =================================
                    DATE DETAILS
                ================================= */}

                <div className="admin-subscription-dates">

                  <div>

                    <span>
                      Start Date
                    </span>

                    <strong>
                      {formatDate(
                        subscription.startDate
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Next Delivery
                    </span>

                    <strong>
                      {formatDate(
                        subscription.nextDeliveryDate
                      )}
                    </strong>

                  </div>

                </div>


                {/* =================================
                    ACTIVE ACTIONS
                ================================= */}

                {subscription.status ===
                  "ACTIVE" && (

                  <div className="admin-subscription-actions">


                    <button
                      className="admin-pause-subscription-btn"
                      onClick={() =>
                        pauseSubscription(
                          subscription.id
                        )
                      }
                    >

                      ⏸ Pause

                    </button>


                    <button
                      className="admin-cancel-subscription-btn"
                      onClick={() =>
                        cancelSubscription(
                          subscription.id
                        )
                      }
                    >

                      Cancel

                    </button>

                  </div>

                )}


                {/* =================================
                    PAUSED ACTIONS
                ================================= */}

                {subscription.status ===
                  "PAUSED" && (

                  <div className="admin-subscription-actions">


                    <button
                      className="admin-resume-subscription-btn"
                      onClick={() =>
                        resumeSubscription(
                          subscription.id
                        )
                      }
                    >

                      ▶ Resume

                    </button>


                    <button
                      className="admin-cancel-subscription-btn"
                      onClick={() =>
                        cancelSubscription(
                          subscription.id
                        )
                      }
                    >

                      Cancel

                    </button>

                  </div>

                )}


                {/* =================================
                    CANCELLED
                ================================= */}

                {subscription.status ===
                  "CANCELLED" && (

                  <div className="admin-cancelled-message">

                    Subscription Cancelled

                  </div>

                )}


                {/* =================================
                    DELETE
                ================================= */}

                <button
                  className="admin-delete-subscription-btn"
                  onClick={() =>
                    deleteSubscription(
                      subscription.id
                    )
                  }
                >

                  🗑 Delete Subscription

                </button>


              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}

export default AdminSubscriptions;