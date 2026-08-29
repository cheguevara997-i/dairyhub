import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";

function Subscription() {

  const navigate = useNavigate();


  const user =
    JSON.parse(
      localStorage.getItem("dairyhubUser")
    );


  const [formData, setFormData] =
    useState({

      milkType: "Cow Milk",

      quantity: "",

      duration: "Monthly",

      deliveryTime: "Morning"

    });


  const [loading, setLoading] =
    useState(false);


  const [paymentInfo, setPaymentInfo] =
    useState(null);


  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };


  // =========================================
  // CREATE RAZORPAY SUBSCRIPTION
  // =========================================

  const createRazorpaySubscription =
    async () => {

      const response =
        await fetch(
          "http://localhost:8080/api/subscription-payment/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                milkType:
                  formData.milkType,

                quantity:
                  formData.quantity,

                duration:
                  formData.duration

              })

          }
        );


      if (!response.ok) {

        throw new Error(
          "Unable to create Razorpay subscription"
        );

      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
          "Unable to create subscription"
        );

      }


      return data;

    };


  // =========================================
  // VERIFY PAYMENT
  // =========================================

  const verifyPayment =
    async (
      paymentResponse
    ) => {

      const response =
        await fetch(
          "http://localhost:8080/api/subscription-payment/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                paymentResponse
              )

          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Subscription payment verification failed"
        );

      }


      return data;

    };


  // =========================================
  // SAVE SUBSCRIPTION IN DAIRYHUB
  // =========================================

  const saveSubscription =
    async (
      paymentResponse,
      razorpayData
    ) => {

      const subscriptionData = {

        customerName:
          user.name,

        customerEmail:
          user.email,

        milkType:
          formData.milkType,

        quantity:
          formData.quantity,

        duration:
          formData.duration,

        deliveryTime:
          formData.deliveryTime,

        status:
          "ACTIVE",

        paymentStatus:
          "PAID",

        razorpayPlanId:
          razorpayData.planId,

        razorpaySubscriptionId:
          paymentResponse
            .razorpay_subscription_id,

        razorpayPaymentId:
          paymentResponse
            .razorpay_payment_id,

        razorpaySignature:
          paymentResponse
            .razorpay_signature

      };


      const response =
        await fetch(
          "http://localhost:8080/api/subscriptions/paid",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                subscriptionData
              )

          }
        );


      if (!response.ok) {

        throw new Error(
          "Unable to save subscription"
        );

      }


      return await response.json();

    };


  // =========================================
  // SUBSCRIBE & PAY
  // =========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (!user) {

        alert(
          "Please login before subscribing."
        );

        navigate("/login");

        return;

      }


      if (
        !formData.quantity.trim()
      ) {

        alert(
          "Please enter the milk quantity."
        );

        return;

      }


      if (
        typeof window.Razorpay ===
        "undefined"
      ) {

        alert(
          "Razorpay could not be loaded. Please refresh the page and try again."
        );

        return;

      }


      setLoading(true);


      try {

        // =================================
        // 1. CREATE RAZORPAY SUBSCRIPTION
        // =================================

        const razorpayData =
          await createRazorpaySubscription();


        // Show payment information
        setPaymentInfo(
          razorpayData
        );


        // =================================
        // 2. OPEN RAZORPAY CHECKOUT
        // =================================

        const options = {

          key:
            razorpayData.key,

          subscription_id:
            razorpayData.subscriptionId,

          name:
            "DairyHub",

          description:
            `${formData.milkType} ${formData.duration} Subscription`,


          prefill: {

            name:
              user.name || "",

            email:
              user.email || "",

            contact:
              user.phone || ""

          },


          theme: {

            color:
              "#2e7d32"

          },


          // =================================
          // PAYMENT SUCCESS
          // =================================

          handler:
            async function(
              paymentResponse
            ) {

              try {

                await verifyPayment(
                  paymentResponse
                );


                await saveSubscription(
                  paymentResponse,
                  razorpayData
                );


                alert(
                  "Subscription payment successful! Your milk subscription is now active."
                );


                setFormData({

                  milkType:
                    "Cow Milk",

                  quantity:
                    "",

                  duration:
                    "Monthly",

                  deliveryTime:
                    "Morning"

                });


                navigate(
                  "/my-subscriptions"
                );


              } catch (error) {

                console.error(
                  "Subscription verification error:",
                  error
                );


                alert(
                  "Payment was completed, but the subscription could not be confirmed. Please contact DairyHub support."
                );

              } finally {

                setLoading(false);

              }

            },


          modal: {

            ondismiss:
              function() {

                setLoading(false);

              }

          }

        };


        const razorpay =
          new window.Razorpay(
            options
          );


        razorpay.on(
          "payment.failed",
          function(response) {

            console.error(
              "Subscription payment failed:",
              response.error
            );


            alert(
              response.error?.description ||
              "Subscription payment failed. Please try again."
            );


            setLoading(false);

          }
        );


        razorpay.open();


      } catch (error) {

        console.error(
          "Subscription payment error:",
          error
        );


        alert(
          error.message ||
          "Unable to start subscription payment."
        );


        setLoading(false);

      }

    };


  return (

    <div className="subscription-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="subscription-header">

        <BackButton
          to="/dashboard"
          text="← Back to Dashboard"
        />


        <span className="subscription-icon">
          🥛
        </span>


        <div>

          <h1>
            Milk Subscription
          </h1>

          <p>
            Create your daily milk delivery plan
          </p>

        </div>

      </div>


      {/* =====================================
          FORM CONTAINER
      ===================================== */}

      <div className="subscription-form-container">

        <h2>
          Create New Subscription
        </h2>


        <p className="subscription-description">

          Choose your milk preferences and delivery schedule.

        </p>


        <form
          className="subscription-form"
          onSubmit={handleSubmit}
        >


          {/* MILK TYPE */}

          <div className="form-group">

            <label>
              Milk Type
            </label>


            <select
              name="milkType"
              value={
                formData.milkType
              }
              onChange={
                handleChange
              }
            >

              <option value="Cow Milk">
                Cow Milk
              </option>

              <option value="Buffalo Milk">
                Buffalo Milk
              </option>

            </select>

          </div>


          {/* QUANTITY */}

          <div className="form-group">

            <label>
              Quantity
            </label>


            <input
              name="quantity"
              type="text"
              placeholder="Example: 2 Litres"
              value={
                formData.quantity
              }
              required
              onChange={
                handleChange
              }
            />

          </div>


          {/* DURATION */}

          <div className="form-group">

            <label>
              Duration
            </label>


            <select
              name="duration"
              value={
                formData.duration
              }
              onChange={
                handleChange
              }
            >

              <option value="Weekly">
                Weekly
              </option>

              <option value="Monthly">
                Monthly
              </option>

            </select>

          </div>


          {/* DELIVERY */}

          <div className="form-group">

            <label>
              Delivery Time
            </label>


            <select
              name="deliveryTime"
              value={
                formData.deliveryTime
              }
              onChange={
                handleChange
              }
            >

              <option value="Morning">
                Morning
              </option>

              <option value="Evening">
                Evening
              </option>

            </select>

          </div>


          {/* =================================
              PAYMENT INFORMATION
          ================================= */}

          <div
            className="form-group subscription-payment-info"
            style={{
              gridColumn: "1 / -1"
            }}
          >

            <label>
              Payment
            </label>


            <div
              style={{
                padding: "15px",
                background: "#f8f9fa",
                border: "1px solid #e5e5e5",
                borderRadius: "8px"
              }}
            >

              <strong>
                💳 Razorpay
              </strong>


              <p
                style={{
                  margin: "6px 0 0",
                  color: "#777",
                  fontSize: "13px"
                }}
              >
                Secure subscription payment
                with Razorpay. Your recurring
                payment authorization is handled
                securely by Razorpay.
              </p>

            </div>

          </div>


          {/* =================================
              PAYMENT PREVIEW
          ================================= */}

          {paymentInfo && (

            <div
              style={{
                gridColumn: "1 / -1",
                padding: "12px",
                background: "#e8f5e9",
                borderRadius: "8px",
                color: "#2e7d32",
                fontSize: "13px"
              }}
            >

              Razorpay subscription created.
              Opening secure payment...

            </div>

          )}


          {/* =================================
              SUBSCRIBE BUTTON
          ================================= */}

          <button
            type="submit"
            className="subscribe-btn"
            disabled={loading}
          >

            {loading
              ? "Opening Payment..."
              : "Subscribe & Pay"
            }

          </button>


        </form>

      </div>

    </div>

  );

}

export default Subscription;