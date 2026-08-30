import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";

function Cart() {

  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);

  const [showCheckout, setShowCheckout] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [addressData, setAddressData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });


  /* =========================================
     LOAD CART
  ========================================= */

  useEffect(() => {

    const savedCart =
      JSON.parse(
        localStorage.getItem("dairyhubCart")
      ) || [];

    setCart(savedCart);

    // Select all products by default
    setSelectedItems(
      savedCart.map(item => item.id)
    );

  }, []);


  /* =========================================
     CURRENT USER
  ========================================= */

  const user =
    JSON.parse(
      localStorage.getItem("dairyhubUser")
    );


  /* =========================================
     UPDATE QUANTITY
  ========================================= */

  const updateQuantity = (id, value) => {

    const updatedCart =
      cart.map(item => {

        if (item.id === id) {

          return {
            ...item,

            quantity: Math.max(
              1,
              item.quantity + value
            )

          };

        }

        return item;

      });


    setCart(updatedCart);


    localStorage.setItem(
      "dairyhubCart",
      JSON.stringify(updatedCart)
    );

  };


  /* =========================================
     REMOVE ITEM
  ========================================= */

  const removeItem = (id) => {

    const updatedCart =
      cart.filter(
        item => item.id !== id
      );


    setCart(updatedCart);


    localStorage.setItem(
      "dairyhubCart",
      JSON.stringify(updatedCart)
    );


    // Also remove from selected items

    setSelectedItems(
      previous =>
        previous.filter(
          itemId => itemId !== id
        )
    );

  };


  /* =========================================
     SELECT / UNSELECT PRODUCT
  ========================================= */

  const toggleItemSelection = (id) => {

    setSelectedItems(
      previous => {

        if (previous.includes(id)) {

          return previous.filter(
            itemId => itemId !== id
          );

        }


        return [
          ...previous,
          id
        ];

      }
    );

  };


  /* =========================================
     SELECT ALL / UNSELECT ALL
  ========================================= */

  const toggleSelectAll = () => {

    if (
      selectedItems.length ===
      cart.length
    ) {

      setSelectedItems([]);

    } else {

      setSelectedItems(
        cart.map(item => item.id)
      );

    }

  };


  /* =========================================
     SELECTED CART ITEMS
  ========================================= */

  const selectedCartItems =
    cart.filter(
      item =>
        selectedItems.includes(
          item.id
        )
    );


  /* =========================================
     SELECTED TOTAL
  ========================================= */

  const selectedTotal =
    selectedCartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        item.quantity,
      0
    );


  /* =========================================
     FULL CART TOTAL
  ========================================= */

  const cartTotal =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
        item.quantity,
      0
    );


  /* =========================================
     ADDRESS CHANGE
  ========================================= */

  const handleAddressChange = (e) => {

    setAddressData({
      ...addressData,
      [e.target.name]:
        e.target.value
    });

  };


  /* =========================================
     OPEN CHECKOUT
  ========================================= */

  const openCheckout = () => {

    if (!user) {

      alert(
        "Please login before placing an order."
      );

      navigate("/login");

      return;

    }


    if (cart.length === 0) {

      alert(
        "Your cart is empty."
      );

      return;

    }


    if (
      selectedCartItems.length === 0
    ) {

      alert(
        "Please select at least one product to continue."
      );

      return;

    }


    setAddressData({

      phone:
        user.phone || "",

      address: "",

      city: "",

      state: "",

      pincode: ""

    });


    setShowCheckout(true);

  };


  /* =========================================
     CREATE RAZORPAY ORDER
  ========================================= */

  const createPaymentOrder =
    async () => {

      const response =
        await fetch(
          "https://dairyhub-backend.onrender.com/api/payment/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                amount:
                  selectedTotal
              })

          }
        );


      if (!response.ok) {

        throw new Error(
          "Unable to create payment order"
        );

      }


      return await response.json();

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
          "https://dairyhub-backend.onrender.com/api/payment/verify",
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
          "Payment verification failed"
        );

      }


      return data;

    };


  /* =========================================
     SAVE DAIRYHUB ORDER
     ONLY SELECTED ITEMS
  ========================================= */

  const saveDairyHubOrder =
    async (
      paymentResponse
    ) => {

      const order = {

        customerName:
          user.name,

        customerEmail:
          user.email,

        phone:
          addressData.phone,

        address:
          addressData.address,

        city:
          addressData.city,

        state:
          addressData.state,

        pincode:
          addressData.pincode,

        totalAmount:
          selectedTotal,

        status:
          "ORDER_PLACED",

        paymentStatus:
          "PAID",

        razorpayOrderId:
          paymentResponse.razorpay_order_id,

        razorpayPaymentId:
          paymentResponse.razorpay_payment_id,

        razorpaySignature:
          paymentResponse.razorpay_signature,


        /* =====================================
           ONLY SELECTED PRODUCTS
        ===================================== */

        items:
          selectedCartItems.map(
            item => ({

              productId:
                item.id,

              productName:
                item.name,

              quantity:
                item.quantity,

              price:
                Number(item.price),

              subtotal:
                Number(item.price) *
                item.quantity

            })
          )

      };


      console.log(
        "Order being sent:",
        order
      );


      const response =
        await fetch(
          "https://dairyhub-backend.onrender.com/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(order)

          }
        );


      if (!response.ok) {

        throw new Error(
          "Payment succeeded but order could not be saved"
        );

      }


      return await response.json();

    };


  /* =========================================
     PLACE ORDER / PAYMENT
  ========================================= */

  const placeOrder =
    async (e) => {

      e.preventDefault();


      if (!user) {

        alert(
          "Please login before placing an order."
        );

        navigate("/login");

        return;

      }


      if (
        selectedCartItems.length === 0
      ) {

        alert(
          "Please select at least one product."
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


      setPlacingOrder(true);


      try {

        /* CREATE RAZORPAY ORDER */

        const razorpayOrder =
          await createPaymentOrder();


        const options = {

          key:
            razorpayOrder.key,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency,

          name:
            "DairyHub",

          description:
            "DairyHub Order Payment",

          order_id:
            razorpayOrder.id,


          prefill: {

            name:
              user.name || "",

            email:
              user.email || "",

            contact:
              addressData.phone || ""

          },


          theme: {

            color:
              "#2e7d32"

          },


          /* PAYMENT SUCCESS */

          handler:
            async function(
              paymentResponse
            ) {

              try {

                /* VERIFY PAYMENT */

                await verifyPayment(
                  paymentResponse
                );


                /* SAVE ONLY SELECTED ITEMS */

                const savedOrder =
                  await saveDairyHubOrder(
                    paymentResponse
                  );


                /*
                 * Remove only the products
                 * that were purchased.
                 *
                 * Unselected products stay
                 * in the cart.
                 */

                const remainingCart =
                  cart.filter(
                    item =>
                      !selectedItems.includes(
                        item.id
                      )
                  );


                localStorage.setItem(
                  "dairyhubCart",
                  JSON.stringify(
                    remainingCart
                  )
                );


                setCart(
                  remainingCart
                );


                setSelectedItems([]);


                setShowCheckout(
                  false
                );


                alert(
                  `Payment successful!\nOrder ID: ${savedOrder.id}`
                );


                navigate("/orders");


              } catch (error) {

                console.error(
                  "Payment verification/order error:",
                  error
                );


                alert(
                  "Payment was completed, but we could not confirm the order. Please contact DairyHub support."
                );

              } finally {

                setPlacingOrder(
                  false
                );

              }

            },


          /* PAYMENT WINDOW CLOSED */

          modal: {

            ondismiss:
              function() {

                setPlacingOrder(
                  false
                );

              }

          }

        };


        /* OPEN RAZORPAY */

        const razorpay =
          new window.Razorpay(
            options
          );


        /* PAYMENT FAILED */

        razorpay.on(
          "payment.failed",
          function(response) {

            console.error(
              "Razorpay payment failed:",
              response.error
            );


            alert(
              response.error?.description ||
              "Payment failed. Please try again."
            );


            setPlacingOrder(
              false
            );

          }
        );


        razorpay.open();


      } catch (error) {

        console.error(
          "Payment error:",
          error
        );


        alert(
          "Unable to start payment. Please try again."
        );


        setPlacingOrder(
          false
        );

      }

    };


  /* =========================================
     EMPTY CART
  ========================================= */

  if (cart.length === 0) {

    return (

      <div className="page">

        <BackButton
          to="/products"
          text="← Back to Products"
        />


        <h1>
          My Cart 🛒
        </h1>


        <div className="empty-state">

          <h3>
            Your cart is empty
          </h3>

          <p>
            Add some fresh dairy products
            to your cart.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="page">

      <BackButton
        to="/products"
        text="← Back to Products"
      />


      <h1>
        My Cart 🛒
      </h1>


      {/* =====================================
          SELECT ALL
      ===================================== */}

      <div className="cart-selection-header">

        <label>

          <input
            type="checkbox"
            checked={
              selectedItems.length ===
              cart.length
            }
            onChange={
              toggleSelectAll
            }
          />

          <span>
            Select All
          </span>

        </label>


        <span>
          {selectedItems.length}
          {" "}
          item
          {selectedItems.length !== 1
            ? "s"
            : ""}{" "}
          selected
        </span>

      </div>


      {/* =====================================
          CART ITEMS
      ===================================== */}

      <div className="cart-items-section">

        {cart.map(item => (

          <div
            className={
              `cart-item ${
                selectedItems.includes(
                  item.id
                )
                  ? "cart-item-selected"
                  : ""
              }`
            }
            key={item.id}
          >

            {/* CHECKBOX */}

            <div className="cart-select-box">

              <input
                type="checkbox"
                checked={
                  selectedItems.includes(
                    item.id
                  )
                }
                onChange={() =>
                  toggleItemSelection(
                    item.id
                  )
                }
              />

            </div>


            {/* IMAGE */}

            <img
              src={item.image}
              alt={item.name}
            />


            {/* DETAILS */}

            <div className="cart-item-details">

              <h3>
                {item.name}
              </h3>


              <p>
                ₹{item.price}
              </p>


              <div className="cart-quantity">

                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      -1
                    )
                  }
                >
                  -
                </button>


                <span>
                  {item.quantity}
                </span>


                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      1
                    )
                  }
                >
                  +
                </button>


                <button
                  className="remove-cart-btn"
                  onClick={() =>
                    removeItem(
                      item.id
                    )
                  }
                >
                  Remove
                </button>

              </div>


              <p className="cart-item-subtotal">

                Subtotal: ₹
                {Number(item.price) *
                  item.quantity}

              </p>

            </div>

          </div>

        ))}

      </div>


      {/* =====================================
          ORDER SUMMARY
      ===================================== */}

      <div className="cart-summary">

        <h2>
          Order Summary
        </h2>


        <div className="summary-row">

          <span>
            Cart Total
          </span>

          <strong>
            ₹{cartTotal}
          </strong>

        </div>


        <div className="summary-row">

          <span>
            Selected Items
          </span>

          <strong>
            {selectedItems.length}
          </strong>

        </div>


        <div className="summary-row">

          <span>
            Selected Subtotal
          </span>

          <strong>
            ₹{selectedTotal}
          </strong>

        </div>


        <div className="summary-row">

          <span>
            Delivery
          </span>

          <strong>
            Free
          </strong>

        </div>


        <div className="summary-total">

          <span>
            Payable Total
          </span>

          <strong>
            ₹{selectedTotal}
          </strong>

        </div>


        <button
          className="btn checkout-open-btn"
          onClick={openCheckout}
          disabled={
            selectedItems.length === 0
          }
        >
          {selectedItems.length === 0
            ? "Select Products"
            : "Proceed to Checkout"
          }
        </button>

      </div>


      {/* =====================================
          CHECKOUT
      ===================================== */}

      {showCheckout && (

        <div className="checkout-container">


          {/* CUSTOMER DETAILS */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <span>
                1
              </span>

              <h2>
                Customer Details
              </h2>

            </div>


            <div className="customer-details-grid">

              <div className="checkout-info-box">

                <small>
                  Name
                </small>

                <strong>
                  {user?.name || "N/A"}
                </strong>

              </div>


              <div className="checkout-info-box">

                <small>
                  Email
                </small>

                <strong>
                  {user?.email || "N/A"}
                </strong>

              </div>

            </div>

          </div>


          {/* SELECTED PRODUCTS */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <span>
                🛒
              </span>

              <h2>
                Products to Purchase
              </h2>

            </div>


            <div className="checkout-selected-items">

              {selectedCartItems.map(
                item => (

                  <div
                    className="checkout-selected-item"
                    key={item.id}
                  >

                    <span>
                      {item.name} ×{" "}
                      {item.quantity}
                    </span>

                    <strong>
                      ₹
                      {Number(item.price) *
                        item.quantity}
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>


          {/* DELIVERY DETAILS */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <span>
                2
              </span>

              <h2>
                Delivery Details
              </h2>

            </div>


            <div className="checkout-form">

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={
                  addressData.phone
                }
                required
                onChange={
                  handleAddressChange
                }
              />


              <textarea
                name="address"
                placeholder="House / Street Address"
                value={
                  addressData.address
                }
                required
                onChange={
                  handleAddressChange
                }
              />


              <input
                type="text"
                name="city"
                placeholder="City"
                value={
                  addressData.city
                }
                required
                onChange={
                  handleAddressChange
                }
              />


              <input
                type="text"
                name="state"
                placeholder="State"
                value={
                  addressData.state
                }
                required
                onChange={
                  handleAddressChange
                }
              />


              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={
                  addressData.pincode
                }
                required
                maxLength="6"
                onChange={
                  handleAddressChange
                }
              />

            </div>

          </div>


          {/* PAYMENT */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <span>
                3
              </span>

              <h2>
                Payment
              </h2>

            </div>


            <div className="payment-method-box">

              <div>

                <strong>
                  💳 Razorpay
                </strong>

                <p>
                  Pay securely using UPI,
                  cards, net banking or
                  other supported payment methods.
                </p>

              </div>


              <span className="secure-payment">
                🔒 Secure Payment
              </span>

            </div>


            <div className="checkout-payment-total">

              <span>
                Amount to Pay
              </span>

              <strong>
                ₹{selectedTotal}
              </strong>

            </div>

          </div>


          {/* ACTION BUTTONS */}

          <div className="checkout-actions">

            <button
              type="button"
              className="btn"
              onClick={() =>
                setShowCheckout(false)
              }
              disabled={
                placingOrder
              }
            >
              Back
            </button>


            <button
              type="button"
              className="btn"
              onClick={placeOrder}
              disabled={
                placingOrder
              }
            >
              {placingOrder
                ? "Opening Payment..."
                : `Pay ₹${selectedTotal}`
              }
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default Cart;