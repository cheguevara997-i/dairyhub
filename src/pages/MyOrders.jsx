import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function MyOrders() {

  const navigate = useNavigate();


  // =========================================
  // ORDERS
  // =========================================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);


  // =========================================
  // REVIEW DATA
  // =========================================

  const [reviewsByProduct, setReviewsByProduct] =
    useState({});


  // =========================================
  // REVIEW LOADING
  // =========================================

  const [reviewLoading, setReviewLoading] =
    useState({});


  // =========================================
  // REVIEW SUBMITTING
  // =========================================

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);


  // =========================================
  // REVIEW FORM
  // =========================================

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");


  // =========================================
  // EDIT REVIEW
  // =========================================

  const [editingReview, setEditingReview] =
    useState(null);

  const [editRating, setEditRating] =
    useState(0);

  const [editComment, setEditComment] =
    useState("");

  const [updatingReview, setUpdatingReview] =
    useState(false);


  // =========================================
  // POPUP
  // =========================================

  const [reviewPopup, setReviewPopup] =
    useState(null);


  // =========================================
  // CURRENT USER
  // =========================================

  const getCurrentUser = () => {

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


  const user =
    getCurrentUser();


  // =========================================
  // ORDER TRACKING
  // =========================================

  const orderSteps = [

    {
      key:
        "ORDER_PLACED",

      label:
        "Order Placed",

      description:
        "Your order has been placed successfully."
    },

    {
      key:
        "PROCESSING",

      label:
        "Processing",

      description:
        "Your order is being prepared."
    },

    {
      key:
        "OUT_FOR_DELIVERY",

      label:
        "Out for Delivery",

      description:
        "Your order is on the way."
    },

    {
      key:
        "DELIVERED",

      label:
        "Delivered",

      description:
        "Your order has been delivered."
    }

  ];


  // =========================================
  // NORMALIZE STATUS
  // =========================================

  const normalizeStatus = (
    status
  ) => {

    return (
      status
        ?.toString()
        .trim()
        .toUpperCase() || ""
    );

  };


  // =========================================
  // FETCH CUSTOMER ORDERS
  // =========================================

  useEffect(() => {

    const fetchOrders =
      async () => {

        const currentUser =
          getCurrentUser();


        if (!currentUser?.email) {

          setLoading(false);

          return;

        }


        try {

          const response =
            await fetch(
              `${API_BASE}/api/orders/customer/${encodeURIComponent(
                currentUser.email
              )}`
            );


          if (!response.ok) {

            throw new Error(
              "Failed to fetch customer orders"
            );

          }


          const data =
            await response.json();


          console.log(
            "Customer orders received:",
            data
          );


          setOrders(
            Array.isArray(data)
              ? data
              : []
          );


        } catch (error) {

          console.error(
            "Error fetching customer orders:",
            error
          );


          setOrders([]);

        } finally {

          setLoading(false);

        }

      };


    fetchOrders();

  }, []);


  // =========================================
  // FETCH REVIEWS FOR A PRODUCT
  // =========================================

  const fetchReviewsForProduct =
    async (
      productId
    ) => {

      if (!productId) {

        return;

      }


      const key =
        String(productId);


      setReviewLoading(
        previous => ({
          ...previous,
          [key]: true
        })
      );


      try {

        const response =
          await fetch(
            `${API_BASE}/api/reviews/product/${productId}`
          );


        if (!response.ok) {

          throw new Error(
            "Unable to fetch product reviews"
          );

        }


        const data =
          await response.json();


        const safeReviews =
          Array.isArray(data)
            ? data
            : [];


        const currentUser =
          getCurrentUser();


        const ownReview =
          currentUser
            ? safeReviews.find(
                review =>
                  review.userEmail
                    ?.trim()
                    .toLowerCase() ===
                  currentUser.email
                    ?.trim()
                    .toLowerCase()
              )
            : null;


        setReviewsByProduct(
          previous => ({

            ...previous,

            [key]: {

              reviews:
                safeReviews,

              ownReview:
                ownReview || null

            }

          })
        );


        return {
          reviews:
            safeReviews,

          ownReview:
            ownReview || null

        };


      } catch (error) {

        console.error(
          `Error fetching reviews for product ${productId}:`,
          error
        );


        setReviewsByProduct(
          previous => ({

            ...previous,

            [key]: {

              reviews: [],

              ownReview: null

            }

          })
        );


        return {
          reviews: [],

          ownReview: null

        };

      } finally {

        setReviewLoading(
          previous => ({
            ...previous,
            [key]: false
          })
        );

      }

    };


  // =========================================
  // LOAD REVIEWS FOR DELIVERED PRODUCTS
  // =========================================

  useEffect(() => {

    if (!orders.length) {

      return;

    }


    const deliveredProductIds = new Set();


    orders.forEach(
      order => {

        if (
          normalizeStatus(
            order.status
          ) !== "DELIVERED"
        ) {

          return;

        }


        if (
          !Array.isArray(
            order.items
          )
        ) {

          return;

        }


        order.items.forEach(
          item => {

            if (
              item.productId
            ) {

              deliveredProductIds.add(
                item.productId
              );

            }

          }
        );

      }
    );


    deliveredProductIds.forEach(
      productId => {

        const key =
          String(productId);


        if (
          reviewsByProduct[key]
        ) {

          return;

        }


        fetchReviewsForProduct(
          productId
        );

      }
    );

  }, [orders]);


  // =========================================
  // GET CURRENT STEP
  // =========================================

  const getCurrentStep =
    (status) => {

      const normalizedStatus =
        normalizeStatus(
          status
        );


      return orderSteps.findIndex(
        step =>
          step.key ===
          normalizedStatus
      );

    };


  // =========================================
  // STAR DISPLAY
  // =========================================

  const renderStars =
    (
      currentRating,
      selectable = false,
      selectedRating = 0,
      onSelect = null
    ) => {

      const numericRating =
        Number(
          currentRating
        ) || 0;


      return (

        <div
          className={
            selectable
              ? "my-orders-selectable-stars"
              : "my-orders-stars"
          }
        >

          {[1,2,3,4,5].map(
            star => {

              if (
                selectable
              ) {

                return (

                  <button
                    key={star}
                    type="button"
                    className={
                      star <=
                      selectedRating
                        ? "my-orders-rating-star selected"
                        : "my-orders-rating-star"
                    }
                    onClick={() =>
                      onSelect &&
                      onSelect(
                        star
                      )
                    }
                    aria-label={
                      `${star} star`
                    }
                  >
                    ★
                  </button>

                );

              }


              return (

                <span
                  key={star}
                  className={
                    star <=
                    numericRating
                      ? "my-orders-star active"
                      : "my-orders-star"
                  }
                >
                  ★
                </span>

              );

            }
          )}

        </div>

      );

    };


  // =========================================
  // OPEN REVIEW POPUP
  // =========================================

  const openReviewPopup =
    async (item) => {

      if (!item?.productId) {

        alert(
          "Product information is not available for this order."
        );

        return;

      }


      const key =
        String(
          item.productId
        );


      let reviewData =
        reviewsByProduct[key];


      if (!reviewData) {

        reviewData =
          await fetchReviewsForProduct(
            item.productId
          );

      }


      const ownReview =
        reviewData?.ownReview ||
        reviewsByProduct[key]?.ownReview ||
        null;


      // -------------------------------------
      // EXISTING REVIEW
      // -------------------------------------

      if (ownReview) {

        setEditingReview(
          null
        );

        setReviewPopup({

          item,

          mode:
            "EXISTING",

          review:
            ownReview

        });

        return;

      }


      // -------------------------------------
      // NEW REVIEW
      // -------------------------------------

      setReviewRating(0);

      setReviewComment("");

      setEditingReview(null);


      setReviewPopup({

        item,

        mode:
          "NEW",

        review:
          null

      });

    };


  // =========================================
  // CLOSE POPUP
  // =========================================

  const closeReviewPopup = () => {

    if (reviewSubmitting ||
        updatingReview) {

      return;

    }


    setReviewPopup(
      null
    );


    setReviewRating(0);

    setReviewComment("");

    setEditingReview(null);

    setEditRating(0);

    setEditComment("");

  };


  // =========================================
  // SUBMIT NEW REVIEW
  // =========================================

  const submitReview =
    async () => {

      const currentUser =
        getCurrentUser();


      if (!currentUser) {

        alert(
          "Please login to write a review."
        );

        navigate(
          "/login"
        );

        return;

      }


      if (!reviewPopup?.item) {

        return;

      }


      const item =
        reviewPopup.item;


      if (
        !item.productId
      ) {

        alert(
          "Product information is not available."
        );

        return;

      }


      if (
        reviewRating === 0
      ) {

        alert(
          "Please select a rating."
        );

        return;

      }


      if (
        !reviewComment.trim()
      ) {

        alert(
          "Please write a review."
        );

        return;

      }


      try {

        setReviewSubmitting(
          true
        );


        const response =
          await fetch(
            `${API_BASE}/api/reviews`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  productId:
                    item.productId,

                  productName:
                    item.productName,

                  userEmail:
                    currentUser.email,

                  userName:
                    currentUser.name,

                  rating:
                    reviewRating,

                  comment:
                    reviewComment.trim()

                })

            }
          );


        if (!response.ok) {

          const errorMessage =
            await response.text();


          alert(
            errorMessage ||
            "Unable to submit your review."
          );

          return;

        }


        const newReview =
          await response.json();


        const key =
          String(
            item.productId
          );


        setReviewsByProduct(
          previous => ({

            ...previous,

            [key]: {

              reviews: [
                newReview,
                ...(previous[key]?.reviews || [])
              ],

              ownReview:
                newReview

            }

          })
        );


        setReviewRating(0);

        setReviewComment("");


        /*
         * Keep popup open.
         * Now it displays the customer's
         * own review with Edit/Delete.
         */

        setReviewPopup({

          item,

          mode:
            "EXISTING",

          review:
            newReview

        });


        alert(
          "Your review was submitted successfully!"
        );


      } catch (error) {

        console.error(
          "Review submission error:",
          error
        );


        alert(
          "Something went wrong while submitting your review."
        );

      } finally {

        setReviewSubmitting(
          false
        );

      }

    };


  // =========================================
  // START EDIT
  // =========================================

  const startEditReview =
    (review) => {

      setEditingReview(
        review
      );


      setEditRating(
        Number(
          review.rating
        ) || 0
      );


      setEditComment(
        review.comment || ""
      );

    };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const cancelEdit =
    () => {

      setEditingReview(
        null
      );

      setEditRating(0);

      setEditComment("");

    };


  // =========================================
  // UPDATE REVIEW
  // =========================================

  const updateReview =
    async () => {

      const currentUser =
        getCurrentUser();


      if (!currentUser) {

        alert(
          "Please login."
        );

        return;

      }


      if (!editingReview) {

        return;

      }


      if (
        editRating === 0
      ) {

        alert(
          "Please select a rating."
        );

        return;

      }


      if (
        !editComment.trim()
      ) {

        alert(
          "Please write a review."
        );

        return;

      }


      try {

        setUpdatingReview(
          true
        );


        const response =
          await fetch(
            `${API_BASE}/api/reviews/${editingReview.id}`,
            {

              method:
                "PUT",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  userEmail:
                    currentUser.email,

                  rating:
                    editRating,

                  comment:
                    editComment.trim()

                })

            }
          );


        if (!response.ok) {

          const errorMessage =
            await response.text();


          alert(
            errorMessage ||
            "Unable to update your review."
          );

          return;

        }


        const updatedReview =
          await response.json();


        const key =
          String(
            updatedReview.productId ||
            reviewPopup?.item?.productId
          );


        setReviewsByProduct(
          previous => {

            const current =
              previous[key] || {
                reviews: []
              };


            return {

              ...previous,

              [key]: {

                reviews:
                  current.reviews.map(
                    review =>
                      review.id ===
                      updatedReview.id
                        ? updatedReview
                        : review
                  ),

                ownReview:
                  updatedReview

              }

            };

          }
        );


        setReviewPopup(
          previous =>
            previous
              ? {

                  ...previous,

                  mode:
                    "EXISTING",

                  review:
                    updatedReview

                }
              : previous
        );


        setEditingReview(
          null
        );

        setEditRating(0);

        setEditComment("");


        alert(
          "Your review was updated successfully!"
        );


      } catch (error) {

        console.error(
          "Review update error:",
          error
        );


        alert(
          "Something went wrong while updating your review."
        );

      } finally {

        setUpdatingReview(
          false
        );

      }

    };


  // =========================================
  // DELETE OWN REVIEW
  // =========================================

  const deleteOwnReview =
    async (
      review
    ) => {

      const currentUser =
        getCurrentUser();


      if (!currentUser) {

        return;

      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete your review?"
        );


      if (!confirmed) {

        return;

      }


      try {

        const response =
          await fetch(
            `${API_BASE}/api/reviews/${review.id}/user?userEmail=${encodeURIComponent(
              currentUser.email
            )}`,
            {

              method:
                "DELETE"

            }
          );


        if (!response.ok) {

          const errorMessage =
            await response.text();


          alert(
            errorMessage ||
            "Unable to delete your review."
          );

          return;

        }


        const key =
          String(
            review.productId ||
            reviewPopup?.item?.productId
          );


        setReviewsByProduct(
          previous => {

            const current =
              previous[key] || {
                reviews: []
              };


            return {

              ...previous,

              [key]: {

                reviews:
                  current.reviews.filter(
                    item =>
                      item.id !==
                      review.id
                  ),

                ownReview:
                  null

              }

            };

          }
        );


        /*
         * After deleting, immediately show
         * the NEW review form again.
         */

        setReviewRating(0);

        setReviewComment("");

        setEditingReview(null);

        setEditRating(0);

        setEditComment("");


        setReviewPopup(
          previous =>
            previous
              ? {

                  ...previous,

                  mode:
                    "NEW",

                  review:
                    null

                }
              : previous
        );


        alert(
          "Your review has been deleted."
        );


      } catch (error) {

        console.error(
          "Review deletion error:",
          error
        );


        alert(
          "Something went wrong while deleting your review."
        );

      }

    };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="page">

        <BackButton
          to="/dashboard"
          text="← Back to Dashboard"
        />


        <h1>
          My Orders 📦
        </h1>


        <div className="empty-state">

          <h3>
            Loading your orders...
          </h3>

        </div>

      </div>

    );

  }


  // =========================================
  // MAIN PAGE
  // =========================================

  return (

    <div
      className="page my-orders-page"
    >


      <BackButton
        to="/dashboard"
        text="← Back to Dashboard"
      />


      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div
        className="my-orders-header"
      >

        <div>

          <h1>
            My Orders 📦
          </h1>


          <p>
            Track your orders and review
            products you've received.
          </p>

        </div>


        {orders.length > 0 && (

          <span
            className="order-count-badge"
          >

            {orders.length}{" "}

            {orders.length === 1
              ? "Order"
              : "Orders"}

          </span>

        )}

      </div>


      {/* =====================================
          NOT LOGGED IN
      ====================================== */}

      {!user ? (

        <div
          className="empty-state my-orders-empty"
        >

          <div
            className="empty-state-icon"
          >
            🔐
          </div>


          <h3>
            Please login
          </h3>


          <p>
            Login to view your orders.
          </p>


          <button
            type="button"
            className="orders-shop-btn"
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >
            Login
          </button>

        </div>


      ) : orders.length === 0 ? (

        /* =====================================
           NO ORDERS
        ====================================== */

        <div
          className="empty-state my-orders-empty"
        >

          <div
            className="empty-state-icon"
          >
            📦
          </div>


          <h3>
            No orders yet
          </h3>


          <p>
            You haven't placed any orders yet.
          </p>


          <button
            type="button"
            className="orders-shop-btn"
            onClick={() =>
              navigate(
                "/products"
              )
            }
          >
            Start Shopping
          </button>

        </div>


      ) : (

        /* =====================================
           ORDERS
        ====================================== */

        <div
          className="orders-list"
        >

          {orders.map(
            order => {

              const normalizedStatus =
                normalizeStatus(
                  order.status
                );


              const currentStep =
                getCurrentStep(
                  order.status
                );


              const isDelivered =
                normalizedStatus ===
                "DELIVERED";


              const isCancelled =
                normalizedStatus ===
                "CANCELLED";


              return (

                <article
                  className="customer-order-card"
                  key={order.id}
                >


                  {/* ORDER HEADER */}

                  <div
                    className="customer-order-header"
                  >

                    <div>

                      <span
                        className="order-label"
                      >
                        ORDER
                      </span>


                      <h2>
                        #{order.id}
                      </h2>


                      <p>

                        {order.orderDate
                          ? `Placed on ${new Date(
                              order.orderDate
                            ).toLocaleDateString()}`
                          : "Order date unavailable"
                        }

                      </p>

                    </div>


                    <span
                      className={
                        `customer-order-status ${
                          normalizedStatus
                            .toLowerCase()
                            .replaceAll(
                              "_",
                              "-"
                            )
                        }`
                      }
                    >

                      {normalizedStatus
                        ? normalizedStatus.replaceAll(
                            "_",
                            " "
                          )
                        : "UNKNOWN"
                      }

                    </span>

                  </div>


                  {/* CUSTOMER */}

                  <div
                    className={
                      "customer-order-section " +
                      "customer-info-section"
                    }
                  >

                    <div
                      className="section-title-row"
                    >

                      <h3>
                        👤 Customer
                      </h3>

                    </div>


                    <div
                      className="customer-info-grid"
                    >

                      <div>

                        <span>
                          Name
                        </span>


                        <strong>
                          {order.customerName ||
                            "N/A"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Email
                        </span>


                        <strong>
                          {order.customerEmail ||
                            "N/A"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* ORDERED PRODUCTS */}

                  <div
                    className="customer-order-section"
                  >

                    <div
                      className="section-title-row"
                    >

                      <h3>
                        🛒 Ordered Products
                      </h3>

                    </div>


                    {!order.items ||
                    order.items.length === 0 ? (

                      <div
                        className="order-products-empty"
                      >

                        <span>
                          📦
                        </span>


                        <p>
                          Product details are not
                          available for this order.
                        </p>

                      </div>

                    ) : (

                      <div
                        className="customer-products-list"
                      >

                        {order.items.map(
                          item => {

                            const productId =
                              item.productId;


                            const key =
                              productId
                                ? String(
                                    productId
                                  )
                                : null;


                            const productReviewData =
                              key
                                ? reviewsByProduct[
                                    key
                                  ]
                                : null;


                            const ownReview =
                              productReviewData
                                ?.ownReview ||
                              null;


                            return (

                              <div
                                className="customer-product-wrapper"
                                key={
                                  item.id
                                }
                              >

                                {/* PRODUCT ROW */}

                                <div
                                  className="customer-product-row"
                                >

                                  <div
                                    className="customer-product-main"
                                  >

                                    <div
                                      className="customer-product-icon"
                                    >
                                      🥛
                                    </div>


                                    <div>

                                      <strong>
                                        {item.productName ||
                                          "Product"}
                                      </strong>


                                      <span>
                                        ₹
                                        {item.price}
                                        {" × "}
                                        {item.quantity}
                                      </span>

                                    </div>

                                  </div>


                                  <div
                                    className="customer-product-actions"
                                  >

                                    <strong
                                      className="customer-product-subtotal"
                                    >
                                      ₹
                                      {item.subtotal}
                                    </strong>

                                  </div>

                                </div>


                                {/* =================================
                                    DELIVERED PRODUCT REVIEW AREA
                                ================================== */}

                                {isDelivered &&
                                productId && (

                                  <div
                                    className="my-orders-review-actions"
                                  >

                                    {ownReview ? (

                                      <div
                                        className="order-review-completed"
                                      >

                                        <div>

                                          <strong>
                                            ✓ You reviewed this product
                                          </strong>


                                          <div
                                            className="order-review-mini-stars"
                                          >

                                            {renderStars(
                                              ownReview.rating
                                            )}

                                          </div>


                                          {ownReview.verifiedPurchase && (

                                            <span
                                              className="verified-purchase"
                                            >
                                              ✓ Verified Purchase
                                            </span>

                                          )}

                                        </div>


                                        <div
                                          className="order-review-buttons"
                                        >

                                          <button
                                            type="button"
                                            className="rate-review-btn"
                                            onClick={() =>
                                              openReviewPopup(
                                                item
                                              )
                                            }
                                          >
                                            ✏️ Edit Review
                                          </button>


                                          <button
                                            type="button"
                                            className="delete-review-btn"
                                            onClick={() =>
                                              deleteOwnReview(
                                                ownReview
                                              )
                                            }
                                          >
                                            🗑️ Delete
                                          </button>

                                        </div>

                                      </div>

                                    ) : (

                                      <button
                                        type="button"
                                        className="rate-review-btn large"
                                        onClick={() =>
                                          openReviewPopup(
                                            item
                                          )
                                        }
                                      >
                                        ⭐ Rate & Review
                                      </button>

                                    )}

                                  </div>

                                )}

                              </div>

                            );

                          }
                        )}

                      </div>

                    )}

                  </div>


                  {/* ORDER SUMMARY */}

                  <div
                    className="customer-order-section"
                  >

                    <div
                      className="section-title-row"
                    >

                      <h3>
                        💳 Order Summary
                      </h3>

                    </div>


                    <div
                      className="customer-summary"
                    >

                      <div
                        className="customer-summary-row"
                      >

                        <span>
                          Total Amount
                        </span>


                        <strong>
                          ₹
                          {order.totalAmount}
                        </strong>

                      </div>


                      <div
                        className="customer-summary-row"
                      >

                        <span>
                          Payment Status
                        </span>


                        <span
                          className={
                            `customer-payment-status ${
                              order.paymentStatus
                                ?.toLowerCase() ||
                              ""
                            }`
                          }
                        >
                          {order.paymentStatus ||
                            "PENDING"}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* ORDER TRACKING */}

                  <div
                    className="customer-order-section"
                  >

                    <div
                      className="section-title-row"
                    >

                      <h3>
                        🚚 Order Tracking
                      </h3>

                    </div>


                    {isCancelled ? (

                      <div
                        className="customer-cancelled-order"
                      >

                        <div
                          className="customer-cancelled-icon"
                        >
                          ✕
                        </div>


                        <div>

                          <strong>
                            Order Cancelled
                          </strong>


                          <p>
                            This order has been
                            cancelled.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div
                        className="customer-tracking"
                      >

                        {orderSteps.map(
                          (
                            step,
                            index
                          ) => {

                            const completed =
                              index <=
                              currentStep;


                            const current =
                              index ===
                              currentStep;


                            return (

                              <div
                                className={
                                  `customer-tracking-step ${
                                    completed
                                      ? "completed"
                                      : ""
                                  } ${
                                    current
                                      ? "current"
                                      : ""
                                  }`
                                }
                                key={
                                  step.key
                                }
                              >

                                <div
                                  className="customer-tracking-marker"
                                >

                                  <span>
                                    {completed
                                      ? "✓"
                                      : ""}
                                  </span>


                                  {index <
                                    orderSteps.length -
                                      1 && (

                                    <i
                                      className={
                                        index <
                                        currentStep
                                          ? "completed-line"
                                          : ""
                                      }
                                    />

                                  )}

                                </div>


                                <div
                                  className="customer-tracking-content"
                                >

                                  <strong>
                                    {step.label}
                                  </strong>


                                  <p>

                                    {current
                                      ? step.description
                                      : completed
                                        ? "Completed"
                                        : "Pending"}

                                  </p>

                                </div>

                              </div>

                            );

                          }
                        )}

                      </div>

                    )}

                  </div>


                  {/* DELIVERY DETAILS */}

                  <div
                    className={
                      "customer-order-section " +
                      "delivery-section"
                    }
                  >

                    <div
                      className="section-title-row"
                    >

                      <h3>
                        📍 Delivery Details
                      </h3>

                    </div>


                    <div
                      className="delivery-info-grid"
                    >

                      <div>

                        <span>
                          Phone
                        </span>


                        <strong>
                          {order.phone ||
                            "N/A"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Address
                        </span>


                        <strong>
                          {order.address ||
                            "N/A"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          City
                        </span>


                        <strong>
                          {order.city ||
                            "N/A"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          State
                        </span>


                        <strong>
                          {order.state ||
                            "N/A"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Pincode
                        </span>


                        <strong>
                          {order.pincode ||
                            "N/A"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* DELIVERED BANNER */}

                  {isDelivered && (

                    <div
                      className="delivered-review-banner"
                    >

                      <div
                        className="delivered-review-icon"
                      >
                        ⭐
                      </div>


                      <div
                        className="delivered-review-content"
                      >

                        <strong>
                          Your order has been delivered!
                        </strong>


                        <p>
                          You can rate and review
                          each delivered product
                          above.
                        </p>

                      </div>

                    </div>

                  )}

                </article>

              );

            }
          )}

        </div>

      )}


      {/* =====================================
          REVIEW POPUP
      ====================================== */}

      {reviewPopup && (

        <div
          className="my-orders-review-overlay"
          onMouseDown={event => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeReviewPopup();

            }

          }}
        >

          <div
            className="my-orders-review-modal"
          >


            {/* MODAL HEADER */}

            <div
              className="my-orders-review-modal-header"
            >

              <div>

                <span>
                  DAIRYHUB
                </span>


                <h2>
                  {reviewPopup.mode ===
                  "EXISTING"
                    ? "Your Review"
                    : "Rate & Review"}
                </h2>

              </div>


              <button
                type="button"
                className="my-orders-review-close"
                onClick={
                  closeReviewPopup
                }
                disabled={
                  reviewSubmitting ||
                  updatingReview
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* PRODUCT */}

            <div
              className="my-orders-review-product"
            >

              <div
                className="my-orders-review-product-icon"
              >
                🥛
              </div>


              <div>

                <strong>
                  {
                    reviewPopup.item
                      ?.productName ||
                    "Product"
                  }
                </strong>


                <span>
                  Delivered
                </span>

              </div>

            </div>


            {/* =================================
                EXISTING REVIEW
            ================================== */}

            {reviewPopup.mode ===
            "EXISTING" &&
            reviewPopup.review &&
            !editingReview ? (

              <div
                className="my-orders-existing-review"
              >

                {reviewPopup.review.verifiedPurchase && (

                  <span
                    className="verified-purchase"
                  >
                    ✓ Verified Purchase
                  </span>

                )}


                <div
                  className="my-orders-existing-stars"
                >

                  {renderStars(
                    reviewPopup.review.rating
                  )}

                </div>


                <p>
                  {
                    reviewPopup.review.comment
                  }
                </p>


                <div
                  className="my-orders-modal-actions"
                >

                  <button
                    type="button"
                    className="edit-review-btn"
                    onClick={() =>
                      startEditReview(
                        reviewPopup.review
                      )
                    }
                  >
                    ✏️ Edit Review
                  </button>


                  <button
                    type="button"
                    className="delete-review-btn"
                    onClick={() =>
                      deleteOwnReview(
                        reviewPopup.review
                      )
                    }
                  >
                    🗑️ Delete Review
                  </button>

                </div>

              </div>


            ) : (

              /* =================================
                 NEW REVIEW / EDIT FORM
              ================================== */

              <div
                className="my-orders-review-form"
              >

                <h3>
                  {editingReview
                    ? "Edit Your Review"
                    : "How was your experience?"}
                </h3>


                {!editingReview && (

                  <p>
                    Your order has been delivered.
                    Share your experience with this
                    product.
                  </p>

                )}


                {/* RATING */}

                <div
                  className="my-orders-rating-selector"
                >

                  <span>
                    Your Rating
                  </span>


                  {renderStars(
                    editingReview
                      ? editRating
                      : reviewRating,

                    true,

                    editingReview
                      ? editRating
                      : reviewRating,

                    editingReview
                      ? setEditRating
                      : setReviewRating

                  )}

                </div>


                {/* COMMENT */}

                <textarea
                  className="my-orders-review-textarea"
                  placeholder="Write about your experience..."
                  value={
                    editingReview
                      ? editComment
                      : reviewComment
                  }
                  onChange={event => {

                    if (
                      editingReview
                    ) {

                      setEditComment(
                        event.target.value
                      );

                    } else {

                      setReviewComment(
                        event.target.value
                      );

                    }

                  }}
                  maxLength={1000}
                  disabled={
                    reviewSubmitting ||
                    updatingReview
                  }
                />


                <div
                  className="my-orders-review-count"
                >

                  {editingReview
                    ? editComment.length
                    : reviewComment.length
                  }/1000

                </div>


                {/* ACTIONS */}

                <div
                  className="my-orders-modal-actions"
                >

                  <button
                    type="button"
                    className="submit-review-btn"
                    onClick={
                      editingReview
                        ? updateReview
                        : submitReview
                    }
                    disabled={
                      reviewSubmitting ||
                      updatingReview
                    }
                  >

                    {reviewSubmitting
                      ? "Submitting..."
                      : updatingReview
                        ? "Saving..."
                        : editingReview
                          ? "Save Changes"
                          : "Submit Review"
                    }

                  </button>


                  {editingReview ? (

                    <button
                      type="button"
                      className="cancel-review-btn"
                      onClick={
                        cancelEdit
                      }
                      disabled={
                        updatingReview
                      }
                    >
                      Cancel
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="my-orders-not-now-btn"
                      onClick={
                        closeReviewPopup
                      }
                      disabled={
                        reviewSubmitting
                      }
                    >
                      Not Now
                    </button>

                  )}

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

}


export default MyOrders;