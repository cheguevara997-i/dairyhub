import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useParams,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import BackButton from "../components/BackButton";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  // =========================================
  // PRODUCT
  // =========================================

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =========================================
  // REVIEWS
  // =========================================

  const [reviews, setReviews] =
    useState([]);

  const [averageRating, setAverageRating] =
    useState(0);

  const [reviewCount, setReviewCount] =
    useState(0);

  const [reviewLoading, setReviewLoading] =
    useState(true);


  // =========================================
  // RATING BREAKDOWN
  // =========================================

  const [ratingBreakdown, setRatingBreakdown] =
    useState({
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    });


  // =========================================
  // REVIEW ELIGIBILITY
  // =========================================

  const [eligibility, setEligibility] =
    useState(null);


  // =========================================
  // NEW REVIEW
  // =========================================

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);


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
  // REVIEW SECTION REFERENCE
  // =========================================

  const reviewSectionRef =
    useRef(null);


  // =========================================
  // WRITE REVIEW REFERENCE
  // =========================================

  const writeReviewRef =
    useRef(null);


  // =========================================
  // WHERE USER CAME FROM
  // =========================================

  const fromFooter =
    searchParams.get("from") === "footer";


  // =========================================
  // OPEN REVIEW FROM MY ORDERS
  // =========================================

  const shouldOpenReview =
    searchParams.get("review") === "1";


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


  // =========================================
  // FETCH PRODUCT
  // =========================================

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/products/${id}`
          );


        if (!response.ok) {

          throw new Error(
            "Product not found"
          );

        }


        const data =
          await response.json();


        setProduct(data);

      } catch (error) {

        console.error(
          "Error fetching product:",
          error
        );


        setProduct(null);

      } finally {

        setLoading(false);

      }

    };


    fetchProduct();

  }, [id]);


  // =========================================
  // FETCH REVIEWS
  // =========================================

  const fetchReviews = async () => {

    try {

      const response =
        await fetch(
          `${API_BASE}/api/reviews/product/${id}`
        );


      if (!response.ok) {

        throw new Error(
          "Unable to fetch reviews"
        );

      }


      const data =
        await response.json();


      const safeReviews =
        Array.isArray(data)
          ? data
          : [];


      setReviews(
        safeReviews
      );


      // =====================================
      // RATING BREAKDOWN
      // =====================================

      const breakdown = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };


      safeReviews.forEach(
        (review) => {

          const reviewRating =
            Number(
              review.rating
            );


          if (
            reviewRating >= 1 &&
            reviewRating <= 5
          ) {

            breakdown[
              reviewRating
            ] += 1;

          }

        }
      );


      setRatingBreakdown(
        breakdown
      );


    } catch (error) {

      console.error(
        "Error fetching reviews:",
        error
      );


      setReviews([]);

      setRatingBreakdown({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      });

    }

  };


  // =========================================
  // FETCH RATING SUMMARY
  // =========================================

  const fetchRatingSummary =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/reviews/product/${id}/summary`
          );


        if (!response.ok) {

          throw new Error(
            "Unable to fetch rating summary"
          );

        }


        const data =
          await response.json();


        setAverageRating(
          Number(
            data.averageRating
          ) || 0
        );


        setReviewCount(
          Number(
            data.reviewCount
          ) || 0
        );


      } catch (error) {

        console.error(
          "Error fetching rating summary:",
          error
        );


        setAverageRating(0);

        setReviewCount(0);

      }

    };


  // =========================================
  // FETCH ELIGIBILITY
  // =========================================

  const fetchEligibility =
    async () => {

      const user =
        getCurrentUser();


      // =====================================
      // NOT LOGGED IN
      // =====================================

      if (!user) {

        setEligibility({

          canReview: false,

          reason:
            "LOGIN_REQUIRED",

          purchased: false,

          delivered: false

        });

        return;

      }


      // =====================================
      // ADMIN
      // =====================================

      if (
        String(user.role)
          .trim()
          .toUpperCase() ===
        "ADMIN"
      ) {

        setEligibility({

          canReview: false,

          reason:
            "ADMIN",

          purchased: false,

          delivered: false

        });

        return;

      }


      try {

        const response =
          await fetch(
            `${API_BASE}/api/reviews/product/${id}/eligibility?userEmail=${encodeURIComponent(
              user.email
            )}`
          );


        if (!response.ok) {

          throw new Error(
            "Unable to check review eligibility"
          );

        }


        const data =
          await response.json();


        setEligibility(
          data
        );


      } catch (error) {

        console.error(
          "Error checking review eligibility:",
          error
        );


        /*
         * Keep the form available for
         * normal customer reviews.
         */

        setEligibility({

          canReview: true,

          reason:
            "GENERAL_REVIEW",

          purchased: false,

          delivered: false

        });

      }

    };


  // =========================================
  // LOAD REVIEW DATA
  // =========================================

  useEffect(() => {

    const loadReviewData =
      async () => {

        setReviewLoading(true);


        await Promise.all([
          fetchReviews(),
          fetchRatingSummary(),
          fetchEligibility()
        ]);


        setReviewLoading(false);

      };


    loadReviewData();

  }, [id]);


  // =========================================
  // CURRENT USER
  // =========================================

  const currentUser =
    getCurrentUser();


  // =========================================
  // MY REVIEW
  // =========================================

  const myReview =
    currentUser &&
    String(currentUser.role)
      .trim()
      .toUpperCase() !==
      "ADMIN"

      ? reviews.find(
          (review) =>
            review.userEmail
              ?.trim()
              .toLowerCase() ===
            currentUser.email
              ?.trim()
              .toLowerCase()
        )

      : null;


  // =========================================
  // AUTO OPEN REVIEW SECTION
  // ONLY WHEN ?review=1
  // =========================================

  useEffect(() => {

    if (
      !shouldOpenReview ||
      loading ||
      !product
    ) {

      return;

    }


    /*
     * Wait until the review section
     * has been rendered.
     */

    const timer =
      setTimeout(() => {

        // -----------------------------------
        // If customer already reviewed:
        // scroll to their existing review.
        // -----------------------------------

        if (
          myReview &&
          reviewSectionRef.current
        ) {

          reviewSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          return;

        }


        // -----------------------------------
        // New review:
        // scroll directly to write review.
        // -----------------------------------

        if (
          writeReviewRef.current
        ) {

          writeReviewRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

          return;

        }


        // -----------------------------------
        // Fallback:
        // review section.
        // -----------------------------------

        if (
          reviewSectionRef.current
        ) {

          reviewSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }, 500);


    return () =>
      clearTimeout(timer);

  }, [
    shouldOpenReview,
    loading,
    product,
    reviewLoading,
    myReview
  ]);


  // =========================================
  // ADD TO CART
  // =========================================

  const addToCart = () => {

    const user =
      getCurrentUser();


    if (!user) {

      alert(
        "Please login before adding products to cart."
      );


      navigate(
        "/login"
      );


      return;

    }


    let cart =
      JSON.parse(
        localStorage.getItem(
          "dairyhubCart"
        )
      ) || [];


    const existingProduct =
      cart.find(
        (item) =>
          item.id ===
          product.id
      );


    if (existingProduct) {

      existingProduct.quantity += 1;

    } else {

      cart.push({

        ...product,

        quantity: 1

      });

    }


    localStorage.setItem(
      "dairyhubCart",
      JSON.stringify(cart)
    );


    alert(
      `${product.name} added to cart!`
    );

  };


  // =========================================
  // SUBMIT REVIEW
  // =========================================

  const submitReview =
    async () => {

      const user =
        getCurrentUser();


      if (!user) {

        alert(
          "Please login to write a review."
        );


        navigate(
          "/login"
        );


        return;

      }


      if (
        String(user.role)
          .trim()
          .toUpperCase() ===
        "ADMIN"
      ) {

        alert(
          "Admin accounts cannot create customer reviews."
        );


        return;

      }


      if (myReview) {

        alert(
          "You have already reviewed this product. You can edit your existing review."
        );


        return;

      }


      if (rating === 0) {

        alert(
          "Please select a rating."
        );


        return;

      }


      if (!comment.trim()) {

        alert(
          "Please write a review."
        );


        return;

      }


      try {

        setSubmittingReview(
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
                    product.id,

                  productName:
                    product.name,

                  userEmail:
                    user.email,

                  userName:
                    user.name,

                  rating:
                    rating,

                  comment:
                    comment.trim()

                })

            }
          );


        if (!response.ok) {

          const errorMessage =
            await response.text();


          alert(
            errorMessage ||
            "Unable to submit review."
          );


          return;

        }


        const newReview =
          await response.json();


        setReviews(
          (previousReviews) => [
            newReview,
            ...previousReviews
          ]
        );


        setRating(0);

        setComment("");


        await fetchReviews();

        await fetchRatingSummary();

        await fetchEligibility();


        alert(
          "Your review was submitted successfully!"
        );


      } catch (error) {

        console.error(
          "Error submitting review:",
          error
        );


        alert(
          "Something went wrong while submitting your review."
        );


      } finally {

        setSubmittingReview(
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


      setTimeout(() => {

        if (
          reviewSectionRef.current
        ) {

          reviewSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }, 100);

    };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const cancelEdit = () => {

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

      const user =
        getCurrentUser();


      if (!user) {

        alert(
          "Please login."
        );


        return;

      }


      if (!editingReview) {

        return;

      }


      if (
        editRating ===
        0
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
                    user.email,

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
            "Unable to update review."
          );


          return;

        }


        const updatedReview =
          await response.json();


        setReviews(
          (previousReviews) =>
            previousReviews.map(
              (review) =>
                review.id ===
                updatedReview.id
                  ? updatedReview
                  : review
            )
        );


        setEditingReview(
          null
        );

        setEditRating(0);

        setEditComment("");


        await fetchReviews();

        await fetchRatingSummary();

        await fetchEligibility();


        alert(
          "Your review was updated successfully!"
        );


      } catch (error) {

        console.error(
          "Error updating review:",
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
    async (reviewId) => {

      const user =
        getCurrentUser();


      if (!user) {

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
            `${API_BASE}/api/reviews/${reviewId}/user?userEmail=${encodeURIComponent(
              user.email
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
            "Unable to delete review."
          );


          return;

        }


        setReviews(
          (previousReviews) =>
            previousReviews.filter(
              (review) =>
                review.id !==
                reviewId
            )
        );


        setEditingReview(
          null
        );

        setEditRating(0);

        setEditComment("");


        await fetchReviews();

        await fetchRatingSummary();

        await fetchEligibility();


        alert(
          "Your review has been deleted."
        );


      } catch (error) {

        console.error(
          "Error deleting review:",
          error
        );


        alert(
          "Something went wrong while deleting your review."
        );

      }

    };


  // =========================================
  // STAR DISPLAY
  // =========================================

  const renderStars =
    (currentRating) => {

      const numericRating =
        Number(
          currentRating
        ) || 0;


      return (

        <span
          className="review-stars"
        >

          {[1, 2, 3, 4, 5].map(
            (star) => (

              <span
                key={star}
                className={
                  star <= numericRating
                    ? "star active"
                    : "star"
                }
              >
                ★
              </span>

            )
          )}

        </span>

      );

    };


  // =========================================
  // RATING PERCENTAGE
  // =========================================

  const getRatingPercentage =
    (star) => {

      if (
        reviewCount === 0
      ) {

        return 0;

      }


      return Math.round(
        (
          ratingBreakdown[star] /
          reviewCount
        ) * 100
      );

    };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div
        className="product-details-page"
      >

        <BackButton
          to={
            fromFooter
              ? "/"
              : "/products"
          }
          text={
            fromFooter
              ? "← Back to Home"
              : "← Back to Products"
          }
        />


        <div
          className="product-loading"
        >

          <h2>
            Loading product...
          </h2>

        </div>

      </div>

    );

  }


  // =========================================
  // PRODUCT NOT FOUND
  // =========================================

  if (!product) {

    return (

      <div
        className="product-details-page"
      >

        <BackButton
          to={
            fromFooter
              ? "/"
              : "/products"
          }
          text={
            fromFooter
              ? "← Back to Home"
              : "← Back to Products"
          }
        />


        <div
          className="product-not-found"
        >

          <h2>
            Product not found
          </h2>


          <p>
            The product you are looking for
            is not available.
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
      className="product-details-page"
    >


      {/* =====================================
          BACK BUTTON
      ====================================== */}

      <BackButton
        to={
          fromFooter
            ? "/"
            : "/products"
        }
        text={
          fromFooter
            ? "← Back to Home"
            : "← Back to Products"
        }
      />


      {/* =====================================
          PRODUCT DETAILS
      ====================================== */}

      <div
        className="product-details-container"
      >


        {/* IMAGE */}

        <div
          className="product-details-image-box"
        >

          <img
            className="product-details-image"
            src={product.image}
            alt={product.name}
          />

        </div>


        {/* INFORMATION */}

        <div
          className="product-details-info"
        >

          <span
            className="product-category"
          >
            {product.category}
          </span>


          <h1>
            {product.name}
          </h1>


          {/* RATING SUMMARY */}

          <div
            className="product-rating-summary"
          >

            {renderStars(
              Math.round(
                averageRating
              )
            )}


            <strong>
              {averageRating.toFixed(1)}
            </strong>


            <span>

              (
              {reviewCount}
              {" "}
              review
              {reviewCount !== 1
                ? "s"
                : ""}
              )

            </span>

          </div>


          {/* PRICE */}

          <h2
            className="product-details-price"
          >
            ₹{product.price}
          </h2>


          {/* DESCRIPTION */}

          <p
            className="product-description"
          >
            {product.description}
          </p>


          {/* PRODUCT INFORMATION */}

          <div
            className="product-info-grid"
          >

            <div
              className="product-info-item"
            >

              <span>
                📦
              </span>


              <div>

                <small>
                  Available Stock
                </small>


                <strong>
                  {product.stock}
                </strong>

              </div>

            </div>


            {product.quantity && (

              <div
                className="product-info-item"
              >

                <span>
                  🥛
                </span>


                <div>

                  <small>
                    Quantity
                  </small>


                  <strong>
                    {product.quantity}
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* ADD TO CART */}

          {product.stock > 0 ? (

            <button
              className="product-add-cart-btn"
              onClick={
                addToCart
              }
            >
              🛒 Add to Cart
            </button>

          ) : (

            <button
              className="product-add-cart-btn"
              disabled
            >
              Out of Stock
            </button>

          )}

        </div>

      </div>


      {/* =====================================
          CUSTOMER REVIEWS
      ====================================== */}

      <section
        id="customer-reviews"
        ref={
          reviewSectionRef
        }
        className="product-reviews-section"
      >


        {/* =================================
            RATING OVERVIEW
        ================================== */}

        <div
          className="rating-overview-card"
        >

          <div
            className="rating-overview-left"
          >

            <div
              className="rating-big-number"
            >
              {averageRating.toFixed(1)}
            </div>


            <div
              className="rating-big-stars"
            >

              {renderStars(
                Math.round(
                  averageRating
                )
              )}

            </div>


            <p>
              {reviewCount} customer
              {" "}
              review
              {reviewCount !== 1
                ? "s"
                : ""}
            </p>

          </div>


          <div
            className="rating-breakdown"
          >

            {[5, 4, 3, 2, 1].map(
              (star) => (

                <div
                  className="rating-breakdown-row"
                  key={star}
                >

                  <span
                    className="rating-breakdown-label"
                  >
                    {star} ★
                  </span>


                  <div
                    className="rating-breakdown-bar"
                  >

                    <div
                      className="rating-breakdown-fill"
                      style={{
                        width:
                          `${getRatingPercentage(
                            star
                          )}%`
                      }}
                    />

                  </div>


                  <span
                    className="rating-breakdown-count"
                  >
                    {ratingBreakdown[star]}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* =================================
            REVIEWS HEADING
        ================================== */}

        <div
          className="reviews-heading"
        >

          <div>

            <h2>
              Customer Reviews
            </h2>


            <p>

              {reviewCount === 0

                ? "Be the first to share your experience."

                : `${reviewCount} customer review${
                    reviewCount !== 1
                      ? "s"
                      : ""
                  }`

              }

            </p>

          </div>

        </div>


        {/* =================================
            REVIEW AREA
        ================================== */}

        {!currentUser ? (

          /* =================================
             NOT LOGGED IN
          ================================== */

          <div
            className="review-status-card"
          >

            <div
              className="review-status-icon"
            >
              ⭐
            </div>


            <div>

              <h3>
                Have you tried this product?
              </h3>


              <p>
                Login to share your experience.
                You can still read all existing
                reviews below.
              </p>


              <button
                type="button"
                className="submit-review-btn"
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Login to Write a Review
              </button>

            </div>

          </div>


        ) : String(
            currentUser.role
          )
            .trim()
            .toUpperCase() ===
          "ADMIN" ? (

          /* =================================
             ADMIN
          ================================== */

          <div
            className="review-status-card admin-review-notice"
          >

            <div
              className="review-status-icon"
            >
              🛠️
            </div>


            <div>

              <h3>
                Customer Reviews
              </h3>


              <p>
                Admin accounts can manage reviews,
                but cannot create customer reviews.
              </p>

            </div>

          </div>


        ) : myReview ? (

          /* =================================
             YOUR EXISTING REVIEW
          ================================== */

          <div
            className="my-review-card"
          >

            <div
              className="my-review-header"
            >

              <div>

                <h3>
                  Your Review
                </h3>


                {myReview.verifiedPurchase && (

                  <span
                    className="verified-purchase"
                  >
                    ✓ Verified Purchase
                  </span>

                )}

              </div>


              <div
                className="my-review-actions"
              >

                <button
                  type="button"
                  className="edit-review-btn"
                  onClick={() =>
                    startEditReview(
                      myReview
                    )
                  }
                >
                  ✏️ Edit
                </button>


                <button
                  type="button"
                  className="delete-review-btn"
                  onClick={() =>
                    deleteOwnReview(
                      myReview.id
                    )
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </div>


            <div
              className="review-rating"
            >

              {renderStars(
                myReview.rating
              )}

            </div>


            <p
              className="review-text"
            >
              {myReview.comment}
            </p>


            {/* =================================
                EDIT FORM
            ================================== */}

            {editingReview &&
              editingReview.id ===
                myReview.id && (

                <div
                  className="edit-review-form"
                >

                  <div
                    className="edit-review-title"
                  >

                    <strong>
                      Edit Your Review
                    </strong>

                  </div>


                  <div
                    className="rating-selector"
                  >

                    <span>
                      Your Rating:
                    </span>


                    <div
                      className="selectable-stars"
                    >

                      {[1, 2, 3, 4, 5].map(
                        (star) => (

                          <button
                            key={star}
                            type="button"
                            className={
                              star <= editRating
                                ? "rating-star selected"
                                : "rating-star"
                            }
                            onClick={() =>
                              setEditRating(
                                star
                              )
                            }
                            aria-label={
                              `${star} star`
                            }
                          >
                            ★
                          </button>

                        )
                      )}

                    </div>

                  </div>


                  <textarea
                    className="review-comment"
                    value={
                      editComment
                    }
                    onChange={
                      (event) =>
                        setEditComment(
                          event.target.value
                        )
                    }
                    maxLength={1000}
                  />


                  <div
                    className="review-character-count"
                  >
                    {
                      editComment.length
                    }/1000
                  </div>


                  <div
                    className="edit-review-buttons"
                  >

                    <button
                      type="button"
                      className="submit-review-btn"
                      onClick={
                        updateReview
                      }
                      disabled={
                        updatingReview
                      }
                    >

                      {updatingReview
                        ? "Updating..."
                        : "Save Changes"
                      }

                    </button>


                    <button
                      type="button"
                      className="cancel-review-btn"
                      onClick={
                        cancelEdit
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              )}

          </div>


        ) : (

          /* =================================
             NEW REVIEW FORM
          ================================== */

          <div
            ref={
              writeReviewRef
            }
            className="write-review-card"
          >

            <h3>
              ⭐ Write a Review
            </h3>


            {/* DELIVERED */}

            {eligibility?.delivered ? (

              <p
                className="verified-review-message"
              >

                ✅ You purchased and received
                this product.

                Your review will be marked as

                <strong>
                  {" "}
                  Verified Purchase.
                </strong>

              </p>


            ) : eligibility?.purchased ? (

              <p
                className="review-status-message"
              >

                🛒 You purchased this product.

                You can review it now.

                Since the order is not delivered yet,
                it will not receive the Verified Purchase
                badge.

              </p>


            ) : (

              <p>
                Share your experience with this product.
              </p>

            )}


            {/* =================================
                STAR SELECTOR
            ================================== */}

            <div
              className="rating-selector"
            >

              <span>
                Your Rating:
              </span>


              <div
                className="selectable-stars"
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      type="button"
                      className={
                        star <= rating
                          ? "rating-star selected"
                          : "rating-star"
                      }
                      onClick={() =>
                        setRating(
                          star
                        )
                      }
                      aria-label={
                        `${star} star`
                      }
                    >
                      ★
                    </button>

                  )
                )}

              </div>

            </div>


            {/* COMMENT */}

            <textarea
              className="review-comment"
              placeholder="Write your review..."
              value={
                comment
              }
              onChange={
                (event) =>
                  setComment(
                    event.target.value
                  )
              }
              maxLength={1000}
            />


            <div
              className="review-character-count"
            >
              {comment.length}/1000
            </div>


            {/* SUBMIT */}

            <button
              type="button"
              className="submit-review-btn"
              onClick={
                submitReview
              }
              disabled={
                submittingReview
              }
            >

              {submittingReview
                ? "Submitting..."
                : "Submit Review"
              }

            </button>

          </div>

        )}


        {/* =================================
            OTHER CUSTOMER REVIEWS
        ================================== */}

        <div
          className="reviews-list"
        >

          {reviewLoading ? (

            <div
              className="reviews-loading"
            >
              Loading reviews...
            </div>

          ) : reviews
              .filter(
                (review) =>
                  review.id !==
                  myReview?.id
              )
              .length === 0 ? (

            <div
              className="no-reviews"
            >

              <div
                className="no-reviews-icon"
              >
                ⭐
              </div>


              <h3>
                No other reviews yet
              </h3>


              <p>
                Be the first customer to share
                your experience.
              </p>

            </div>

          ) : (

            reviews
              .filter(
                (review) =>
                  review.id !==
                  myReview?.id
              )
              .map(
                (review) => (

                  <div
                    className="review-card"
                    key={
                      review.id
                    }
                  >

                    <div
                      className="review-top"
                    >

                      <div>

                        <h3>
                          {review.userName}
                        </h3>


                        {review.verifiedPurchase && (

                          <span
                            className="verified-purchase"
                          >
                            ✓ Verified Purchase
                          </span>

                        )}

                      </div>


                      <div
                        className="review-date"
                      >

                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString()
                          : ""
                        }

                      </div>

                    </div>


                    <div
                      className="review-rating"
                    >

                      {renderStars(
                        review.rating
                      )}

                    </div>


                    <p
                      className="review-text"
                    >
                      {review.comment}
                    </p>

                  </div>

                )
              )

          )}

        </div>

      </section>

    </div>

  );

}


export default ProductDetails;