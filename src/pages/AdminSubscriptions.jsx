import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function AdminSubscriptions() {

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


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

        const response = await fetch(
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


  return (

    <div className="admin-subscriptions-page">

        <BackButton
          to="/admin"
          text="← Back to Admin Dashboard"
        />

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


      {loading ? (

        <div className="admin-subscriptions-empty">

          <h3>
            Loading subscriptions...
          </h3>

        </div>

      ) : subscriptions.length === 0 ? (

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

        <div className="admin-subscriptions-grid">

          {subscriptions.map(
            (subscription) => (

              <div
                className="admin-subscription-card"
                key={subscription.id}
              >

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
                        subscription.status?.toLowerCase()
                      }`
                    }
                  >
                    {subscription.status}
                  </span>

                </div>


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
                      {subscription.customerEmail}
                    </small>

                  </div>

                </div>


                <div className="admin-subscription-details">

                  <div className="admin-detail-item">

                    <span>
                      🥛
                    </span>

                    <div>

                      <small>
                        Milk Type
                      </small>

                      <strong>
                        {subscription.milkType}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-detail-item">

                    <span>
                      📦
                    </span>

                    <div>

                      <small>
                        Quantity
                      </small>

                      <strong>
                        {subscription.quantity}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-detail-item">

                    <span>
                      📅
                    </span>

                    <div>

                      <small>
                        Duration
                      </small>

                      <strong>
                        {subscription.duration}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-detail-item">

                    <span>
                      🕒
                    </span>

                    <div>

                      <small>
                        Delivery
                      </small>

                      <strong>
                        {subscription.deliveryTime}
                      </strong>

                    </div>

                  </div>

                </div>


                <div className="admin-subscription-dates">

                  <div>

                    <span>
                      Start Date
                    </span>

                    <strong>
                      {subscription.startDate ||
                        "N/A"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Next Delivery
                    </span>

                    <strong>
                      {subscription.nextDeliveryDate ||
                        "N/A"}
                    </strong>

                  </div>

                </div>


                {subscription.status !== "CANCELLED" && (

                  <button
                    className="admin-cancel-subscription-btn"
                    onClick={() =>
                      cancelSubscription(
                        subscription.id
                      )
                    }
                  >
                    Cancel Subscription
                  </button>

                )}


                {subscription.status === "CANCELLED" && (

                  <div className="admin-cancelled-message">

                    Subscription Cancelled

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}

export default AdminSubscriptions;