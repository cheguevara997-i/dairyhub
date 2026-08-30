import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function MySubscriptions() {

  const user = JSON.parse(
    localStorage.getItem("dairyhubUser")
  );

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  const fetchSubscriptions = async () => {

    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {

      const response = await fetch(
        `https://dairyhub-backend.onrender.com/api/subscriptions/customer/${encodeURIComponent(user.email)}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch subscriptions"
        );
      }

      const data = await response.json();

      setSubscriptions(data);

    } catch (error) {

      console.error(
        "Subscription fetch error:",
        error
      );

      alert(
        "Unable to load subscriptions"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchSubscriptions();

  }, []);


  const updateSubscriptionStatus =
    async (id, action) => {

      try {

        const response = await fetch(
          `https://dairyhub-backend.onrender.com/api/subscriptions/${id}/${action}`,
          {
            method: "PUT"
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to update subscription"
          );
        }

        await fetchSubscriptions();

      } catch (error) {

        console.error(
          "Subscription update error:",
          error
        );

        alert(
          "Unable to update subscription"
        );

      }

    };


  if (loading) {

    return (

      <div className="my-subscriptions-page">

        <div className="loading-subscription">

          <h2>
            Loading subscriptions...
          </h2>

        </div>

      </div>

    );

  }


  return (

    <div className="my-subscriptions-page">

        <BackButton
          to="/dashboard"
          text="← Back to Dashboard"
        />

      <div className="my-subscriptions-header">

        <div>

          <h1>
            🥛 My Subscriptions
          </h1>

          <p>
            Manage your milk delivery subscriptions
          </p>

        </div>

        <div className="subscription-count">

          {subscriptions.length} Subscription
          {subscriptions.length !== 1 ? "s" : ""}

        </div>

      </div>


      {subscriptions.length === 0 ? (

        <div className="subscription-empty-state">

          <div className="empty-icon">
            🥛
          </div>

          <h2>
            No subscriptions found
          </h2>

          <p>
            You haven't subscribed to any milk plan yet.
          </p>

        </div>

      ) : (

        <div className="my-subscriptions-grid">

          {subscriptions.map(
            (subscription) => (

              <div
                className="my-subscription-card"
                key={subscription.id}
              >

                <div className="subscription-card-header">

                  <div>

                    <span className="subscription-label">
                      SUBSCRIPTION
                    </span>

                    <h2>
                      #{subscription.id}
                    </h2>

                  </div>


                  <span
                    className={`status-badge ${subscription.status?.toLowerCase()}`}
                  >
                    {subscription.status}
                  </span>

                </div>


                <div className="subscription-details-grid">

                  <div className="subscription-detail">

                    <span className="detail-icon">
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


                  <div className="subscription-detail">

                    <span className="detail-icon">
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


                  <div className="subscription-detail">

                    <span className="detail-icon">
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


                  <div className="subscription-detail">

                    <span className="detail-icon">
                      🕒
                    </span>

                    <div>

                      <small>
                        Delivery Time
                      </small>

                      <strong>
                        {subscription.deliveryTime}
                      </strong>

                    </div>

                  </div>

                </div>


                <div className="subscription-dates">

                  <div>

                    <span>
                      Start Date
                    </span>

                    <strong>
                      {subscription.startDate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Next Delivery
                    </span>

                    <strong>
                      {subscription.nextDeliveryDate}
                    </strong>

                  </div>

                </div>


                {subscription.status === "ACTIVE" && (

                  <div className="subscription-action-buttons">

                    <button
                      className="pause-button"
                      onClick={() =>
                        updateSubscriptionStatus(
                          subscription.id,
                          "pause"
                        )
                      }
                    >
                      Pause
                    </button>


                    <button
                      className="cancel-button"
                      onClick={() =>
                        updateSubscriptionStatus(
                          subscription.id,
                          "cancel"
                        )
                      }
                    >
                      Cancel
                    </button>

                  </div>

                )}


                {subscription.status === "PAUSED" && (

                  <div className="subscription-action-buttons">

                    <button
                      className="resume-button"
                      onClick={() =>
                        updateSubscriptionStatus(
                          subscription.id,
                          "resume"
                        )
                      }
                    >
                      Resume
                    </button>


                    <button
                      className="cancel-button"
                      onClick={() =>
                        updateSubscriptionStatus(
                          subscription.id,
                          "cancel"
                        )
                      }
                    >
                      Cancel
                    </button>

                  </div>

                )}


                {subscription.status === "CANCELLED" && (

                  <div className="cancelled-subscription-message">

                    This subscription has been cancelled.

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

export default MySubscriptions;