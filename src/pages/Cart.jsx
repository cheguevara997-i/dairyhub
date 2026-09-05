import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";


// =========================================
// API BASE URL
// =========================================
//
// Both localhost and Vercel use the same
// Render backend.
//

const API_BASE =
  "https://dairyhub-backend.onrender.com";


function Cart() {

  const navigate =
    useNavigate();


  // =========================================
  // CART
  // =========================================

  const [cart, setCart] =
    useState([]);


  // =========================================
  // SELECTED ITEMS
  // =========================================

  const [selectedItems, setSelectedItems] =
    useState([]);


  // =========================================
  // CHECKOUT
  // =========================================

  const [showCheckout, setShowCheckout] =
    useState(false);


  // =========================================
  // ORDER PROCESSING
  // =========================================

  const [placingOrder, setPlacingOrder] =
    useState(false);


  // =========================================
  // CHECKING CART AVAILABILITY
  // =========================================

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);


  // =========================================
  // DELIVERY DETAILS
  // =========================================

  const [addressData, setAddressData] =
    useState({

      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: ""

    });


  // =========================================
  // LOAD CART
  // =========================================

  useEffect(() => {

    try {

      const savedCart =
        JSON.parse(
          localStorage.getItem(
            "dairyhubCart"
          )
        ) || [];


      const safeCart =
        Array.isArray(
          savedCart
        )
          ? savedCart
          : [];


      setCart(
        safeCart
      );


      /*
       * Select all cart items by default.
       *
       * Each product variant has its own
       * database product ID.
       */

      setSelectedItems(
        safeCart.map(
          item =>
            item.id
        )
      );


    } catch (error) {

      console.error(
        "Error loading cart:",
        error
      );


      setCart([]);

      setSelectedItems([]);

    }

  }, []);


  // =========================================
  // CURRENT USER
  // =========================================

  let user =
    null;


  try {

    user =
      JSON.parse(
        localStorage.getItem(
          "dairyhubUser"
        )
      );


  } catch (error) {

    console.error(
      "Unable to read logged-in user:",
      error
    );


    user =
      null;

  }


  // =========================================
  // CHECK PRODUCT AVAILABILITY
  // =========================================

  const isProductAvailable =
    (product) => {

      if (
        !product
      ) {

        return false;

      }


      return (

        Number(
          product.stock
        ) > 0

        &&

        product.available !== false

      );

    };


  // =========================================
  // UPDATE CART QUANTITY
  // =========================================

  const updateQuantity =
    (
      id,
      value
    ) => {

      const updatedCart =
        cart.map(
          item => {

            if (
              item.id !==
              id
            ) {

              return item;

            }


            const currentQuantity =
              Number(
                item.quantity || 1
              );


            const availableStock =
              Number(
                item.stock
              );


            // ---------------------------------
            // PRODUCT MANUALLY DISABLED
            // ---------------------------------

            if (
              item.available === false
              &&
              value > 0
            ) {

              alert(
                "This product is currently out of stock."
              );


              return item;

            }


            // ---------------------------------
            // STOCK = 0
            // ---------------------------------

            if (
              availableStock <= 0
              &&
              value > 0
            ) {

              alert(
                "This product is currently out of stock."
              );


              return item;

            }


            // ---------------------------------
            // NEW QUANTITY
            // ---------------------------------

            const newQuantity =
              Math.max(
                1,
                currentQuantity +
                  value
              );


            // ---------------------------------
            // STOCK LIMIT
            // ---------------------------------

            if (
              availableStock > 0
              &&
              newQuantity >
                availableStock
            ) {

              alert(
                "You cannot add more than the available stock."
              );


              return item;

            }


            return {

              ...item,

              quantity:
                newQuantity

            };

          }
        );


      setCart(
        updatedCart
      );


      localStorage.setItem(
        "dairyhubCart",
        JSON.stringify(
          updatedCart
        )
      );

    };


  // =========================================
  // REMOVE CART ITEM
  // =========================================

  const removeItem =
    (id) => {

      const updatedCart =
        cart.filter(
          item =>
            item.id !==
            id
        );


      setCart(
        updatedCart
      );


      localStorage.setItem(
        "dairyhubCart",
        JSON.stringify(
          updatedCart
        )
      );


      setSelectedItems(
        previous =>
          previous.filter(
            itemId =>
              itemId !==
              id
          )
      );

    };


  // =========================================
  // SELECT / UNSELECT ITEM
  // =========================================

  const toggleItemSelection =
    (id) => {

      setSelectedItems(
        previous => {

          if (
            previous.includes(
              id
            )
          ) {

            return previous.filter(
              itemId =>
                itemId !==
                id
            );

          }


          return [

            ...previous,

            id

          ];

        }
      );

    };


  // =========================================
  // SELECT ALL / UNSELECT ALL
  // =========================================

  const toggleSelectAll =
    () => {

      if (
        selectedItems.length ===
        cart.length
      ) {

        setSelectedItems(
          []
        );

      } else {

        setSelectedItems(
          cart.map(
            item =>
              item.id
          )
        );

      }

    };


  // =========================================
  // SELECTED CART ITEMS
  // =========================================

  const selectedCartItems =
    cart.filter(
      item =>
        selectedItems.includes(
          item.id
        )
    );


  // =========================================
  // SELECTED TOTAL
  // =========================================

  const selectedTotal =
    selectedCartItems.reduce(
      (
        sum,
        item
      ) =>

        sum +

        Number(
          item.price || 0
        ) *

        Number(
          item.quantity || 1
        ),

      0
    );


  // =========================================
  // FULL CART TOTAL
  // =========================================

  const cartTotal =
    cart.reduce(
      (
        sum,
        item
      ) =>

        sum +

        Number(
          item.price || 0
        ) *

        Number(
          item.quantity || 1
        ),

      0
    );


  // =========================================
  // ADDRESS CHANGE
  // =========================================

  const handleAddressChange =
    (e) => {

      setAddressData({

        ...addressData,

        [e.target.name]:
          e.target.value

      });

    };


  // =========================================
  // VERIFY SELECTED ITEMS BEFORE CHECKOUT
  // =========================================

  const validateSelectedProducts =
    async () => {

      try {

        setCheckingAvailability(
          true
        );


        // -------------------------------------
        // FETCH LATEST PRODUCTS
        // -------------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/products`
          );


        if (
          !response.ok
        ) {

          throw new Error(
            "Unable to verify product availability."
          );

        }


        const data =
          await response.json();


        const latestProducts =
          Array.isArray(
            data
          )
            ? data
            : [];


        // -------------------------------------
        // CHECK EACH SELECTED ITEM
        // -------------------------------------

        const unavailableItems =
          [];


        const quantityExceededItems =
          [];


        selectedCartItems.forEach(
          cartItem => {

            const latestProduct =
              latestProducts.find(
                product =>
                  String(
                    product.id
                  ) ===
                  String(
                    cartItem.id
                  )
              );


            // -------------------------------
            // PRODUCT NO LONGER EXISTS
            // -------------------------------

            if (
              !latestProduct
            ) {

              unavailableItems.push(
                cartItem
              );


              return;

            }


            // -------------------------------
            // PRODUCT UNAVAILABLE
            // -------------------------------

            if (
              !isProductAvailable(
                latestProduct
              )
            ) {

              unavailableItems.push({

                ...cartItem,

                latestProduct

              });


              return;

            }


            // -------------------------------
            // QUANTITY EXCEEDS CURRENT STOCK
            // -------------------------------

            if (
              Number(
                cartItem.quantity || 1
              ) >
              Number(
                latestProduct.stock || 0
              )
            ) {

              quantityExceededItems.push({

                ...cartItem,

                latestProduct

              });

            }

          }
        );


        // -------------------------------------
        // HANDLE UNAVAILABLE PRODUCTS
        // -------------------------------------

        if (
          unavailableItems.length > 0
        ) {

          let message =
            "Some selected products are no longer available:\n\n";


          unavailableItems.forEach(
            item => {

              message +=
                `• ${item.name}`;


              if (
                item.size
              ) {

                message +=
                  ` (${item.size})`;

              }


              message +=
                "\n";

            }
          );


          message +=
            "\nPlease remove them from your cart before checkout.";


          alert(
            message
          );


          // -------------------------------
          // UPDATE CART WITH LATEST DATA
          // -------------------------------

          const unavailableIds =
            unavailableItems.map(
              item =>
                item.id
            );


          const refreshedCart =
            cart.map(
              item => {

                const latestProduct =
                  latestProducts.find(
                    product =>
                      String(
                        product.id
                      ) ===
                      String(
                        item.id
                      )
                  );


                if (
                  latestProduct
                ) {

                  return {

                    ...item,

                    stock:
                      latestProduct.stock,

                    available:
                      latestProduct.available

                  };

                }


                return item;

              }
            );


          setCart(
            refreshedCart
          );


          localStorage.setItem(
            "dairyhubCart",
            JSON.stringify(
              refreshedCart
            )
          );


          setSelectedItems(
            previous =>
              previous.filter(
                itemId =>
                  !unavailableIds.includes(
                    itemId
                  )
              )
          );


          return false;

        }


        // -------------------------------------
        // HANDLE STOCK REDUCTION
        // -------------------------------------

        if (
          quantityExceededItems.length > 0
        ) {

          let message =
            "The available stock has changed for:\n\n";


          quantityExceededItems.forEach(
            item => {

              message +=
                `• ${item.name}`;


              if (
                item.size
              ) {

                message +=
                  ` (${item.size})`;

              }


              message +=
                ` — Available: ${item.latestProduct.stock}\n`;

            }
          );


          message +=
            "\nPlease reduce the quantity before checkout.";


          alert(
            message
          );


          // -------------------------------
          // UPDATE CART STOCK VALUES
          // -------------------------------

          const refreshedCart =
            cart.map(
              item => {

                const latestProduct =
                  latestProducts.find(
                    product =>
                      String(
                        product.id
                      ) ===
                      String(
                        item.id
                      )
                  );


                if (
                  latestProduct
                ) {

                  return {

                    ...item,

                    stock:
                      latestProduct.stock,

                    available:
                      latestProduct.available

                  };

                }


                return item;

              }
            );


          setCart(
            refreshedCart
          );


          localStorage.setItem(
            "dairyhubCart",
            JSON.stringify(
              refreshedCart
            )
          );


          return false;

        }


        // -------------------------------------
        // REFRESH CART PRODUCT DATA
        // -------------------------------------

        const refreshedCart =
          cart.map(
            item => {

              const latestProduct =
                latestProducts.find(
                  product =>
                    String(
                      product.id
                    ) ===
                    String(
                      item.id
                    )
                );


              if (
                latestProduct
              ) {

                return {

                  ...item,

                  name:
                    latestProduct.name,

                  price:
                    latestProduct.price,

                  size:
                    latestProduct.size,

                  stock:
                    latestProduct.stock,

                  available:
                    latestProduct.available,

                  image:
                    latestProduct.image,

                  description:
                    latestProduct.description

                };

              }


              return item;

            }
          );


        setCart(
          refreshedCart
        );


        localStorage.setItem(
          "dairyhubCart",
          JSON.stringify(
            refreshedCart
          )
        );


        return true;


      } catch (error) {

        console.error(
          "Product availability check error:",
          error
        );


        alert(
          error.message ||
          "Unable to verify product availability."
        );


        return false;


      } finally {

        setCheckingAvailability(
          false
        );

      }

    };


  // =========================================
  // OPEN CHECKOUT
  // =========================================

  const openCheckout =
    async () => {

      if (
        !user
      ) {

        alert(
          "Please login before placing an order."
        );


        navigate(
          "/login"
        );


        return;

      }


      if (
        cart.length ===
        0
      ) {

        alert(
          "Your cart is empty."
        );


        return;

      }


      if (
        selectedCartItems.length ===
        0
      ) {

        alert(
          "Please select at least one product to continue."
        );


        return;

      }


      // =====================================
      // LATEST AVAILABILITY CHECK
      // =====================================

      const valid =
        await validateSelectedProducts();


      if (
        !valid
      ) {

        return;

      }


      // =====================================
      // OPEN CHECKOUT
      // =====================================

      setAddressData({

        phone:
          user.phone || "",

        address:
          "",

        city:
          "",

        state:
          "",

        pincode:
          ""

      });


      setShowCheckout(
        true
      );

    };


  // =========================================
  // CREATE RAZORPAY ORDER
  // =========================================

  const createPaymentOrder =
    async () => {

      const response =
        await fetch(
          `${API_BASE}/api/payment/create-order`,
          {

            method:
              "POST",

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


      if (
        !response.ok
      ) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Unable to create payment order"
        );

      }


      return await response.json();

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
          `${API_BASE}/api/payment/verify`,
          {

            method:
              "POST",

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


  // =========================================
  // SAVE DAIRYHUB ORDER
  // =========================================

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
          paymentResponse
            .razorpay_order_id,

        razorpayPaymentId:
          paymentResponse
            .razorpay_payment_id,

        razorpaySignature:
          paymentResponse
            .razorpay_signature,


        // ===================================
        // SELECTED ORDER ITEMS
        // ===================================

        items:
          selectedCartItems.map(
            item => ({

              productId:
                item.id,

              productName:
                item.name,

              size:
                item.size ||
                null,

              quantity:
                Number(
                  item.quantity || 1
                ),

              price:
                Number(
                  item.price || 0
                ),

              subtotal:

                Number(
                  item.price || 0
                ) *

                Number(
                  item.quantity || 1
                )

            })
          )

      };


      console.log(
        "Order being sent to Render:",
        order
      );


      const response =
        await fetch(
          `${API_BASE}/api/orders`,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify(
                order
              )

          }
        );


      if (
        !response.ok
      ) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Payment succeeded but order could not be saved"
        );

      }


      return await response.json();

    };


  // =========================================
  // PLACE ORDER / PAYMENT
  // =========================================

  const placeOrder =
    async (e) => {

      e.preventDefault();


      if (
        !user
      ) {

        alert(
          "Please login before placing an order."
        );


        navigate(
          "/login"
        );


        return;

      }


      if (
        selectedCartItems.length ===
        0
      ) {

        alert(
          "Please select at least one product."
        );


        return;

      }


      // =====================================
      // VERIFY AVAILABILITY AGAIN
      // =====================================

      const stillAvailable =
        await validateSelectedProducts();


      if (
        !stillAvailable
      ) {

        return;

      }


      // =====================================
      // DELIVERY VALIDATION
      // =====================================

      if (
        !addressData.phone.trim() ||
        !addressData.address.trim() ||
        !addressData.city.trim() ||
        !addressData.state.trim() ||
        !addressData.pincode.trim()
      ) {

        alert(
          "Please fill all delivery details."
        );


        return;

      }


      if (
        addressData.pincode.length !==
        6
      ) {

        alert(
          "Please enter a valid 6-digit pincode."
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


      setPlacingOrder(
        true
      );


      try {

        // ===================================
        // CREATE RAZORPAY ORDER
        // ===================================

        const razorpayOrder =
          await createPaymentOrder();


        if (
          !razorpayOrder ||
          !razorpayOrder.id
        ) {

          throw new Error(
            "Invalid Razorpay order response."
          );

        }


        // ===================================
        // RAZORPAY OPTIONS
        // ===================================

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
              user.name ||
              "",

            email:
              user.email ||
              "",

            contact:
              addressData.phone ||
              ""

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

                console.log(
                  "Razorpay payment response:",
                  paymentResponse
                );


                // =============================
                // VERIFY PAYMENT
                // =============================

                await verifyPayment(
                  paymentResponse
                );


                // =============================
                // SAVE ORDER
                // =============================

                const savedOrder =
                  await saveDairyHubOrder(
                    paymentResponse
                  );


                // =============================
                // REMOVE PURCHASED ITEMS
                // =============================

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


                setSelectedItems(
                  []
                );


                setShowCheckout(
                  false
                );


                // =============================
                // SUCCESS
                // =============================

                alert(
                  `Payment successful!\nOrder ID: ${savedOrder.id}`
                );


                navigate(
                  "/orders"
                );


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


          // =================================
          // PAYMENT WINDOW CLOSED
          // =================================

          modal: {

            ondismiss:
              function() {

                setPlacingOrder(
                  false
                );

              }

          }

        };


        // ===================================
        // OPEN RAZORPAY
        // ===================================

        const razorpay =
          new window.Razorpay(
            options
          );


        // ===================================
        // PAYMENT FAILED
        // ===================================

        razorpay.on(
          "payment.failed",
          function(
            response
          ) {

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
          error.message ||
          "Unable to start payment. Please try again."
        );


        setPlacingOrder(
          false
        );

      }

    };


  // =========================================
  // EMPTY CART
  // =========================================

  if (
    cart.length ===
    0
  ) {

    return (

      <div
        className="page"
      >

        <BackButton
          to="/products"
          text="← Back to Products"
        />


        <h1>
          My Cart 🛒
        </h1>


        <div
          className="empty-state"
        >

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


  // =========================================
  // MAIN PAGE
  // =========================================

  return (

    <div
      className="page"
    >

      <BackButton
        to="/products"
        text="← Back to Products"
      />


      <h1>
        My Cart 🛒
      </h1>


      {/* =====================================
          SELECT ALL
      ====================================== */}

      <div
        className="cart-selection-header"
      >

        <label>

          <input
            type="checkbox"
            checked={

              cart.length > 0 &&

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
            : ""}

          {" "}
          selected

        </span>

      </div>


      {/* =====================================
          CART ITEMS
      ====================================== */}

      <div
        className="cart-items-section"
      >

        {cart.map(
          item => {

            const itemAvailable =
              isProductAvailable(
                item
              );


            return (

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
                key={
                  item.id
                }
              >

                {/* CHECKBOX */}

                <div
                  className="cart-select-box"
                >

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
                  src={
                    item.image
                  }
                  alt={
                    item.name
                  }
                />


                {/* DETAILS */}

                <div
                  className="cart-item-details"
                >

                  <h3>
                    {item.name}
                  </h3>


                  {/* SIZE */}

                  {item.size && (

                    <p>
                      Size:{" "}
                      {item.size}
                    </p>

                  )}


                  {/* PRICE */}

                  <p>
                    ₹
                    {item.price}
                  </p>


                  {/* STOCK */}

                  <p>
                    Available Stock:{" "}
                    {item.stock}
                  </p>


                  {/* AVAILABILITY */}

                  {itemAvailable ? (

                    <p>
                      ✅ Available
                    </p>

                  ) : (

                    <p
                      className="cart-item-unavailable"
                    >
                      🔴 Out of Stock
                    </p>

                  )}


                  {/* QUANTITY */}

                  <div
                    className="cart-quantity"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                      disabled={
                        Number(
                          item.quantity || 1
                        ) <=
                        1
                      }
                    >
                      -
                    </button>


                    <span>
                      {item.quantity}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                      disabled={

                        !itemAvailable ||

                        Number(
                          item.quantity || 1
                        ) >=
                        Number(
                          item.stock || 0
                        )

                      }
                    >
                      +
                    </button>


                    <button
                      type="button"
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


                  {/* SUBTOTAL */}

                  <p
                    className="cart-item-subtotal"
                  >

                    Subtotal: ₹

                    {
                      Number(
                        item.price || 0
                      ) *

                      Number(
                        item.quantity || 1
                      )
                    }

                  </p>

                </div>

              </div>

            );

          }
        )}

      </div>


      {/* =====================================
          ORDER SUMMARY
      ====================================== */}

      <div
        className="cart-summary"
      >

        <h2>
          Order Summary
        </h2>


        <div
          className="summary-row"
        >

          <span>
            Cart Total
          </span>


          <strong>
            ₹
            {cartTotal}
          </strong>

        </div>


        <div
          className="summary-row"
        >

          <span>
            Selected Items
          </span>


          <strong>
            {selectedItems.length}
          </strong>

        </div>


        <div
          className="summary-row"
        >

          <span>
            Selected Subtotal
          </span>


          <strong>
            ₹
            {selectedTotal}
          </strong>

        </div>


        <div
          className="summary-row"
        >

          <span>
            Delivery
          </span>


          <strong>
            Free
          </strong>

        </div>


        <div
          className="summary-total"
        >

          <span>
            Payable Total
          </span>


          <strong>
            ₹
            {selectedTotal}
          </strong>

        </div>


        <button
          type="button"
          className="btn checkout-open-btn"
          onClick={
            openCheckout
          }
          disabled={

            selectedItems.length ===
            0 ||

            checkingAvailability

          }
        >

          {checkingAvailability

            ? "Checking Availability..."

            : selectedItems.length ===
              0

              ? "Select Products"

              : "Proceed to Checkout"

          }

        </button>

      </div>


      {/* =====================================
          CHECKOUT
      ====================================== */}

      {showCheckout && (

        <div
          className="checkout-container"
        >

          {/* CUSTOMER DETAILS */}

          <div
            className="checkout-section"
          >

            <div
              className="checkout-section-title"
            >

              <span>
                1
              </span>


              <h2>
                Customer Details
              </h2>

            </div>


            <div
              className="customer-details-grid"
            >

              <div
                className="checkout-info-box"
              >

                <small>
                  Name
                </small>


                <strong>
                  {user?.name ||
                    "N/A"}
                </strong>

              </div>


              <div
                className="checkout-info-box"
              >

                <small>
                  Email
                </small>


                <strong>
                  {user?.email ||
                    "N/A"}
                </strong>

              </div>

            </div>

          </div>


          {/* SELECTED PRODUCTS */}

          <div
            className="checkout-section"
          >

            <div
              className="checkout-section-title"
            >

              <span>
                🛒
              </span>


              <h2>
                Products to Purchase
              </h2>

            </div>


            <div
              className="checkout-selected-items"
            >

              {selectedCartItems.map(
                item => (

                  <div
                    className="checkout-selected-item"
                    key={
                      item.id
                    }
                  >

                    <span>

                      {item.name}

                      {item.size
                        ? ` (${item.size})`
                        : ""}

                      {" × "}

                      {item.quantity}

                    </span>


                    <strong>

                      ₹

                      {
                        Number(
                          item.price || 0
                        ) *

                        Number(
                          item.quantity || 1
                        )
                      }

                    </strong>

                  </div>

                )
              )}

            </div>

          </div>


          {/* DELIVERY DETAILS */}

          <div
            className="checkout-section"
          >

            <div
              className="checkout-section-title"
            >

              <span>
                2
              </span>


              <h2>
                Delivery Details
              </h2>

            </div>


            <div
              className="checkout-form"
            >

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

          <div
            className="checkout-section"
          >

            <div
              className="checkout-section-title"
            >

              <span>
                3
              </span>


              <h2>
                Payment
              </h2>

            </div>


            <div
              className="payment-method-box"
            >

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


              <span
                className="secure-payment"
              >
                🔒 Secure Payment
              </span>

            </div>


            <div
              className="checkout-payment-total"
            >

              <span>
                Amount to Pay
              </span>


              <strong>
                ₹
                {selectedTotal}
              </strong>

            </div>

          </div>


          {/* ACTION BUTTONS */}

          <div
            className="checkout-actions"
          >

            <button
              type="button"
              className="btn"
              onClick={() =>
                setShowCheckout(
                  false
                )
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
              onClick={
                placeOrder
              }
              disabled={

                placingOrder ||

                checkingAvailability

              }
            >

              {placingOrder

                ? "Opening Payment..."

                : checkingAvailability

                  ? "Checking Availability..."

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