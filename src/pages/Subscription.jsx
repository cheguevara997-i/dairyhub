import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";

function Subscription() {

  const navigate = useNavigate();


  /* =========================================
     CURRENT USER
  ========================================= */

  let user = null;

  try {

    user = JSON.parse(
      localStorage.getItem("dairyhubUser")
    );

  } catch (error) {

    console.error(
      "Unable to read logged-in user:",
      error
    );

    user = null;

  }


  /* =========================================
     FORM DATA
  ========================================= */

  const [formData, setFormData] = useState({

    /* =====================================
       CUSTOMER DETAILS
    ===================================== */

    customerName:
      user?.name || "",

    phone:
      user?.phone || "",

    address: "",

    city: "",

    state: "",

    pincode: "",


    /* =====================================
       SUBSCRIPTION DETAILS
    ===================================== */

    milkType:
      "Cow Milk",

    quantity:
      "",

    duration:
      "Monthly",

    deliveryTime:
      "Morning"

  });


  /* =========================================
     LOADING
  ========================================= */

  const [loading, setLoading] =
    useState(false);


  /* =========================================
     PAYMENT INFORMATION
  ========================================= */

  const [paymentInfo, setPaymentInfo] =
    useState(null);


  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };


  /* =========================================
     CREATE RAZORPAY SUBSCRIPTION
  ========================================= */

  const createRazorpaySubscription =
    async () => {

      const response =
        await fetch(
          "https://dairyhub-backend.onrender.com/api/subscription-payment/create",
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

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
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


  /* =========================================
     VERIFY PAYMENT
  ========================================= */

  const verifyPayment =
    async (
      paymentResponse
    ) => {

      const response =
        await fetch(
          "https://dairyhub-backend.onrender.com/api/subscription-payment/verify",
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


  /* =========================================
     SAVE SUBSCRIPTION IN DAIRYHUB
  ========================================= */

  const saveSubscription =
    async (
      paymentResponse,
      razorpayData
    ) => {

      const subscriptionData = {

        /* =====================================
           CUSTOMER DETAILS
        ===================================== */

        customerName:
          formData.customerName,

        customerEmail:
          user.email,

        phone:
          formData.phone,

        address:
          formData.address,

        city:
          formData.city,

        state:
          formData.state,

        pincode:
          formData.pincode,


        /* =====================================
           SUBSCRIPTION DETAILS
        ===================================== */

        milkType:
          formData.milkType,

        quantity:
          formData.quantity,

        duration:
          formData.duration,

        deliveryTime:
          formData.deliveryTime,


        /* =====================================
           STATUS
        ===================================== */

        status:
          "ACTIVE",

        paymentStatus:
          "PAID",


        /* =====================================
           RAZORPAY DETAILS
        ===================================== */

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


      console.log(
        "Subscription being sent to Render:",
        subscriptionData
      );


      const response =
        await fetch(
          "https://dairyhub-backend.onrender.com/api/subscriptions/paid",
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

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          "Unable to save subscription"
        );

      }


      return await response.json();

    };


  /* =========================================
     VALIDATE FORM
  ========================================= */

  const validateForm = () => {


    /* =====================================
       NAME
    ===================================== */

    if (
      !formData.customerName.trim()
    ) {

      alert(
        "Please enter your full name."
      );

      return false;

    }


    /* =====================================
       PHONE
    ===================================== */

    if (
      !formData.phone.trim()
    ) {

      alert(
        "Please enter your phone number."
      );

      return false;

    }


    if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim()
      )
    ) {

      alert(
        "Please enter a valid 10-digit phone number."
      );

      return false;

    }


    /* =====================================
       ADDRESS
    ===================================== */

    if (
      !formData.address.trim()
    ) {

      alert(
        "Please enter your delivery address."
      );

      return false;

    }


    /* =====================================
       CITY
    ===================================== */

    if (
      !formData.city.trim()
    ) {

      alert(
        "Please enter your city."
      );

      return false;

    }


    /* =====================================
       STATE
    ===================================== */

    if (
      !formData.state.trim()
    ) {

      alert(
        "Please enter your state."
      );

      return false;

    }


    /* =====================================
       PINCODE
    ===================================== */

    if (
      !/^[0-9]{6}$/.test(
        formData.pincode.trim()
      )
    ) {

      alert(
        "Please enter a valid 6-digit pincode."
      );

      return false;

    }


    /* =====================================
       QUANTITY
    ===================================== */

    if (
      !formData.quantity.trim()
    ) {

      alert(
        "Please enter the milk quantity."
      );

      return false;

    }


    /* =====================================
       DELIVERY TIME
    ===================================== */

    if (
      !formData.deliveryTime
    ) {

      alert(
        "Please select a delivery time."
      );

      return false;

    }


    return true;

  };


  /* =========================================
     SUBSCRIBE & PAY
  ========================================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      /* =====================================
         LOGIN CHECK
      ===================================== */

      if (!user) {

        alert(
          "Please login before subscribing."
        );

        navigate("/login");

        return;

      }


      /* =====================================
         FORM VALIDATION
      ===================================== */

      if (!validateForm()) {

        return;

      }


      /* =====================================
         RAZORPAY CHECK
      ===================================== */

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


        /* =====================================
           1. CREATE RAZORPAY SUBSCRIPTION
        ===================================== */

        const razorpayData =
          await createRazorpaySubscription();


        setPaymentInfo(
          razorpayData
        );


        /* =====================================
           2. RAZORPAY OPTIONS
        ===================================== */

        const options = {

          key:
            razorpayData.key,

          subscription_id:
            razorpayData.subscriptionId,

          name:
            "DairyHub",

          description:
            `${formData.milkType} ${formData.duration} Subscription`,


          /* ===================================
             CUSTOMER PREFILL
          =================================== */

          prefill: {

            name:
              formData.customerName,

            email:
              user.email || "",

            contact:
              formData.phone || ""

          },


          /* ===================================
             RAZORPAY THEME
          =================================== */

          theme: {

            color:
              "#2e7d32"

          },


          /* ===================================
             PAYMENT SUCCESS
          =================================== */

          handler:
            async function(
              paymentResponse
            ) {

              try {

                console.log(
                  "Razorpay subscription payment response:",
                  paymentResponse
                );


                /* ==============================
                   VERIFY PAYMENT
                ============================== */

                await verifyPayment(
                  paymentResponse
                );


                /* ==============================
                   SAVE SUBSCRIPTION
                ============================== */

                const savedSubscription =
                  await saveSubscription(
                    paymentResponse,
                    razorpayData
                  );


                console.log(
                  "Subscription saved:",
                  savedSubscription
                );


                /* ==============================
                   SUCCESS MESSAGE
                ============================== */

                alert(
                  "Subscription payment successful! Your milk subscription is now active."
                );


                /* ==============================
                   RESET FORM
                ============================== */

                setFormData({

                  customerName:
                    user.name || "",

                  phone:
                    user.phone || "",

                  address: "",

                  city: "",

                  state: "",

                  pincode: "",

                  milkType:
                    "Cow Milk",

                  quantity:
                    "",

                  duration:
                    "Monthly",

                  deliveryTime:
                    "Morning"

                });


                setPaymentInfo(
                  null
                );


                /* ==============================
                   GO TO MY SUBSCRIPTIONS
                ============================== */

                navigate(
                  "/my-subscriptions"
                );


              } catch (error) {

                console.error(
                  "Subscription verification/save error:",
                  error
                );


                alert(
                  "Payment was completed, but the subscription could not be confirmed. Please contact DairyHub support."
                );

              } finally {

                setLoading(false);

              }

            },


          /* ===================================
             PAYMENT MODAL CLOSED
          =================================== */

          modal: {

            ondismiss:
              function() {

                setLoading(false);

              }

          }

        };


        /* =====================================
           CREATE RAZORPAY INSTANCE
        ===================================== */

        const razorpay =
          new window.Razorpay(
            options
          );


        /* =====================================
           PAYMENT FAILED
        ===================================== */

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


        /* =====================================
           OPEN RAZORPAY
        ===================================== */

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


  /* =========================================
     PAGE
  ========================================= */

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
            Set up your daily milk delivery
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

          Enter your delivery details and choose
          your milk preferences.

        </p>


        <form
          className="subscription-form"
          onSubmit={
            handleSubmit
          }
        >


          {/* =================================
              CUSTOMER DETAILS
          ================================= */}

          <div
            className="subscription-section-title"
          >

            👤 Customer Details

          </div>


          {/* =================================
              FULL NAME
          ================================= */}

          <div className="form-group">

            <label>
              Full Name *
            </label>


            <input
              name="customerName"
              type="text"
              placeholder="Enter your full name"
              value={
                formData.customerName
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* =================================
              PHONE
          ================================= */}

          <div className="form-group">

            <label>
              Phone Number *
            </label>


            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength="10"
              placeholder="10-digit phone number"
              value={
                formData.phone
              }
              onChange={
                (e) => {

                  const value =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      );


                  setFormData({

                    ...formData,

                    phone:
                      value

                  });

                }
              }
              required
            />

          </div>


          {/* =================================
              EMAIL
          ================================= */}

          <div className="form-group">

            <label>
              Email
            </label>


            <input
              type="email"
              value={
                user?.email || ""
              }
              readOnly
              className="readonly-input"
            />

          </div>


          {/* =================================
              ADDRESS
          ================================= */}

          <div
            className="form-group subscription-full-width"
          >

            <label>
              Delivery Address *
            </label>


            <textarea
              name="address"
              rows="3"
              placeholder="House / Flat No, Street, Area, Landmark"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* =================================
              CITY
          ================================= */}

          <div className="form-group">

            <label>
              City *
            </label>


            <input
              name="city"
              type="text"
              placeholder="Enter your city"
              value={
                formData.city
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* =================================
              STATE
          ================================= */}

          <div className="form-group">

            <label>
              State *
            </label>


            <input
              name="state"
              type="text"
              placeholder="Enter your state"
              value={
                formData.state
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* =================================
              PINCODE
          ================================= */}

          <div className="form-group">

            <label>
              Pincode *
            </label>


            <input
              name="pincode"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="6-digit pincode"
              value={
                formData.pincode
              }
              onChange={
                (e) => {

                  const value =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      );


                  setFormData({

                    ...formData,

                    pincode:
                      value

                  });

                }
              }
              required
            />

          </div>


          {/* =================================
              SUBSCRIPTION DETAILS
          ================================= */}

          <div
            className="subscription-section-title"
          >

            🥛 Subscription Details

          </div>


          {/* =================================
              MILK TYPE
          ================================= */}

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


          {/* =================================
              QUANTITY
          ================================= */}

          <div className="form-group">

            <label>
              Quantity *
            </label>


            <input
              name="quantity"
              type="text"
              placeholder="Example: 2 Litres"
              value={
                formData.quantity
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* =================================
              DURATION
          ================================= */}

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


          {/* =================================
              DELIVERY TIME
          ================================= */}

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

              <option value="Both">
                Morning &amp; Evening
              </option>

            </select>

          </div>


          {/* =================================
              DELIVERY INFORMATION
          ================================= */}

          <div
            className="subscription-full-width subscription-delivery-note"
          >

            <span>
              🚚
            </span>


            <div>

              <strong>
                Delivery Schedule
              </strong>


              <p>

                {formData.deliveryTime ===
                  "Morning"

                  ? "Your milk will be delivered every morning."

                  : formData.deliveryTime ===
                    "Evening"

                    ? "Your milk will be delivered every evening."

                    : "Your milk will be delivered every morning and evening."
                }

              </p>

            </div>

          </div>


          {/* =================================
              PAYMENT
          ================================= */}

          <div
            className="subscription-section-title"
          >

            💳 Payment

          </div>


          <div
            className="subscription-payment-info"
          >

            <strong>
              Secure Razorpay Payment
            </strong>


            <p>

              Your subscription payment
              authorization is handled securely
              by Razorpay.

            </p>

          </div>


          {/* =================================
              PAYMENT PREVIEW
          ================================= */}

          {paymentInfo && (

            <div
              className="subscription-payment-status"
            >

              Razorpay subscription created.
              Opening secure payment...

            </div>

          )}


          {/* =================================
              SUBMIT
          ================================= */}

          <button
            type="submit"
            className="subscribe-btn"
            disabled={loading}
          >

            {loading
              ? "Opening Payment..."
              : "Continue to Payment"
            }

          </button>


        </form>

      </div>

    </div>

  );

}

export default Subscription;