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


// =========================================
// API BASE URL
// =========================================

const API_BASE =
  "https://dairyhub-backend.onrender.com";


function ProductDetails() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();


  // =========================================
  // PRODUCT
  // =========================================

  const [product, setProduct] =
    useState(null);


  const [productVariants, setProductVariants] =
    useState([]);


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
  // NAVIGATION SOURCE
  // =========================================

  const fromFooter =
    searchParams.get("from") === "footer";


  // =========================================
  // OPEN REVIEW FROM MY ORDERS
  // =========================================

  const shouldOpenReview =
    searchParams.get("review") === "1";


  // =========================================
  // GET CURRENT USER
  // =========================================

  const getCurrentUser = () => {

    try {

      const savedUser =
        localStorage.getItem(
          "dairyhubUser"
        );


      if (!savedUser) {

        return null;

      }


      return JSON.parse(
        savedUser
      );


    } catch (error) {

      console.error(
        "Unable to read current user:",
        error
      );


      return null;

    }

  };


  // =========================================
  // GET AUTH TOKEN
  // =========================================

  const getAuthToken = () => {

    const user =
      getCurrentUser();


    return user?.token || null;

  };


  // =========================================
  // REVIEW AUTH HEADERS
  // =========================================

  const getReviewAuthHeaders = () => {

    const token =
      getAuthToken();


    return {

      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})

    };

  };


  // =========================================
  // HANDLE AUTH FAILURE
  // =========================================

  const handleReviewAuthFailure = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );


    alert(
      "Your login session is invalid or expired. Please login again."
    );


    navigate(
      "/login"
    );

  };


  // =========================================
  // FETCH PRODUCT + VARIANTS
  // =========================================

  useEffect(() => {

    const fetchProduct =
      async () => {

        try {

          const response =
            await fetch(
              `${API_BASE}/api/products`
            );


          if (
            !response.ok
          ) {

            throw new Error(
              "Unable to fetch products."
            );

          }


          const data =
            await response.json();


          const allProducts =
            Array.isArray(data)
              ? data
              : [];


          const currentProduct =
            allProducts.find(
              item =>
                String(
                  item.id
                ) ===
                String(id)
            );


          if (
            !currentProduct
          ) {

            throw new Error(
              "Product not found."
            );

          }


          const currentName =
            String(
              currentProduct.name || ""
            )
              .trim()
              .toLowerCase();


          const currentCategory =
            String(
              currentProduct.category || ""
            )
              .trim()
              .toLowerCase();


          const variants =
            allProducts.filter(
              item => {

                const itemName =
                  String(
                    item.name || ""
                  )
                    .trim()
                    .toLowerCase();


                const itemCategory =
                  String(
                    item.category || ""
                  )
                    .trim()
                    .toLowerCase();


                return (

                  itemName ===
                  currentName &&

                  itemCategory ===
                  currentCategory

                );

              }
            );


          setProductVariants(
            variants
          );


          setProduct(
            currentProduct
          );


        } catch (error) {

          console.error(
            "Error fetching product:",
            error
          );


          setProduct(null);

          setProductVariants([]);

        } finally {

          setLoading(false);

        }

      };


    fetchProduct();

  }, [id]);


  // =========================================
  // FETCH REVIEWS
  // =========================================

  const fetchReviews =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/reviews/product/${id}`
          );


        if (
          !response.ok
        ) {

          throw new Error(
            "Unable to fetch reviews."
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


        const breakdown = {

          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0

        };


        safeReviews.forEach(
          review => {

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


        if (
          !response.ok
        ) {

          throw new Error(
            "Unable to fetch rating summary."
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
  // FETCH REVIEW ELIGIBILITY
  // =========================================

  const fetchEligibility =
    async () => {

      const user =
        getCurrentUser();


      // =====================================
      // NOT LOGGED IN
      // =====================================

      if (
        !user
      ) {

        setEligibility({

          canReview:
            false,

          reason:
            "LOGIN_REQUIRED",

          purchased:
            false,

          delivered:
            false

        });


        return;

      }


      // =====================================
      // ADMIN
      // =====================================

      if (
        String(
          user.role || ""
        )
          .trim()
          .toUpperCase() ===
        "ADMIN"
      ) {

        setEligibility({

          canReview:
            false,

          reason:
            "ADMIN",

          purchased:
            false,

          delivered:
            false

        });


        return;

      }


      // =====================================
      // TOKEN REQUIRED
      // =====================================

      if (
        !getAuthToken()
      ) {

        setEligibility({

          canReview:
            false,

          reason:
            "LOGIN_REQUIRED",

          purchased:
            false,

          delivered:
            false

        });


        return;

      }


      try {

        /*
         * IMPORTANT:
         *
         * Your current backend controller still
         * expects userEmail.
         *
         * We send the logged-in email here so the
         * current backend works correctly.
         */

        const response =
          await fetch(
            `${API_BASE}/api/reviews/product/${id}/eligibility?userEmail=${encodeURIComponent(
              user.email
            )}`,
            {

              method:
                "GET",

              headers:
                getReviewAuthHeaders()

            }
          );


        if (
          response.status === 401 ||
          response.status === 403
        ) {

          handleReviewAuthFailure();

          return;

        }


        if (
          !response.ok
        ) {

          const errorText =
            await response.text();


          throw new Error(
            errorText ||
            "Unable to check review eligibility."
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


        setEligibility({

          canReview:
            false,

          reason:
            "ERROR",

          purchased:
            false,

          delivered:
            false

        });

      }

    };


  // =========================================
  // LOAD REVIEW DATA
  // =========================================

  useEffect(() => {

    const loadReviewData =
      async () => {

        setReviewLoading(
          true
        );


        await Promise.all([

          fetchReviews(),

          fetchRatingSummary(),

          fetchEligibility()

        ]);


        setReviewLoading(
          false
        );

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

    String(
      currentUser.role || ""
    )
      .trim()
      .toUpperCase() !==
    "ADMIN"

      ? reviews.find(
          review =>

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
  // =========================================

  useEffect(() => {

    if (
      !shouldOpenReview ||
      loading ||
      !product
    ) {

      return;

    }


    const timer =
      setTimeout(() => {

        if (
          myReview &&
          reviewSectionRef.current
        ) {

          reviewSectionRef.current.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });


          return;

        }


        if (
          eligibility?.canReview &&
          writeReviewRef.current
        ) {

          writeReviewRef.current.scrollIntoView({

            behavior:
              "smooth",

            block:
              "center"

          });


          return;

        }


        if (
          reviewSectionRef.current
        ) {

          reviewSectionRef.current.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

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

    myReview,

    eligibility

  ]);


  // =========================================
  // CHANGE PRODUCT VARIANT
  // =========================================

  const changeProductVariant =
    (event) => {

      const selectedId =
        event.target.value;


      let query =
        "";


      if (
        fromFooter
      ) {

        query =
          "?from=footer";

      }


      navigate(
        `/products/${selectedId}${query}`
      );

    };


  // =========================================
  // CHECK PRODUCT AVAILABILITY
  // =========================================

  const isProductAvailable =
    (currentProduct) => {

      if (
        !currentProduct
      ) {

        return false;

      }


      return (

        Number(
          currentProduct.stock
        ) > 0 &&

        currentProduct.available !== false

      );

    };


  // =========================================
  // ADD TO CART
  // =========================================

  const addToCart =
    () => {

      const user =
        getCurrentUser();


      if (
        !user
      ) {

        alert(
          "Please login before adding products to cart."
        );


        navigate(
          "/login"
        );


        return;

      }


      if (
        !isProductAvailable(
          product
        )
      ) {

        alert(
          "This product is currently out of stock."
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
          item =>
            item.id ===
            product.id
        );


      if (
        existingProduct
      ) {

        if (
          existingProduct.quantity >=
          product.stock
        ) {

          alert(
            "You cannot add more than the available stock."
          );


          return;

        }


        existingProduct.quantity +=
          1;


      } else {

        cart.push({

          ...product,

          quantity:
            1

        });

      }


      localStorage.setItem(
        "dairyhubCart",
        JSON.stringify(
          cart
        )
      );


      alert(

        `${product.name}` +

        `${
          product.size
            ? ` (${product.size})`
            : ""
        } added to cart!`

      );

    };


  // =========================================
  // SUBMIT REVIEW
  // =========================================

  const submitReview =
    async () => {

      const user =
        getCurrentUser();


      if (
        !user
      ) {

        alert(
          "Please login to write a review."
        );


        navigate(
          "/login"
        );


        return;

      }


      if (
        String(
          user.role || ""
        )
          .trim()
          .toUpperCase() ===
        "ADMIN"
      ) {

        alert(
          "Admin accounts cannot create customer reviews."
        );


        return;

      }


      if (
        !getAuthToken()
      ) {

        handleReviewAuthFailure();

        return;

      }


      if (
        !eligibility?.canReview
      ) {

        if (
          eligibility?.reason ===
          "PURCHASE_REQUIRED"
        ) {

          alert(
            "You can review this product only after purchasing it."
          );

        } else if (
          eligibility?.reason ===
          "DELIVERY_REQUIRED"
        ) {

          alert(
            "You can review this product after your order has been delivered."
          );

        } else {

          alert(
            "You are not currently eligible to review this product."
          );

        }


        return;

      }


      if (
        myReview
      ) {

        alert(
          "You have already reviewed this product. You can edit your existing review."
        );


        return;

      }


      if (
        rating === 0
      ) {

        alert(
          "Please select a rating."
        );


        return;

      }


      if (
        !comment.trim()
      ) {

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

              headers:
                getReviewAuthHeaders(),

              body:
                JSON.stringify({

                  productId:
                    product.id,

                  productName:
                    product.name,

                  /*
                   * Current backend controller
                   * still requires userEmail.
                   */

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


        if (
          response.status === 401 ||
          response.status === 403
        ) {

          handleReviewAuthFailure();

          return;

        }


        if (
          !response.ok
        ) {

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
          previousReviews => [

            newReview,

            ...previousReviews

          ]
        );


        setRating(
          0
        );


        setComment(
          ""
        );


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
          error.message ||
          "Something went wrong while submitting your review."
        );


      } finally {

        setSubmittingReview(
          false
        );

      }

    };


  // =========================================
  // START EDIT REVIEW
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

            behavior:
              "smooth",

            block:
              "start"

          });

        }

      }, 100);

    };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const cancelEdit =
    () => {

      setEditingReview(
        null
      );


      setEditRating(
        0
      );


      setEditComment(
        ""
      );

    };


  // =========================================
  // UPDATE REVIEW
  // =========================================

  const updateReview =
    async () => {

      const user =
        getCurrentUser();


      if (
        !user
      ) {

        alert(
          "Please login."
        );


        return;

      }


      if (
        !editingReview
      ) {

        return;

      }


      if (
        !getAuthToken()
      ) {

        handleReviewAuthFailure();

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

              headers:
                getReviewAuthHeaders(),

              body:
                JSON.stringify({

                  /*
                   * Current backend controller
                   * still requires userEmail.
                   */

                  userEmail:
                    user.email,

                  rating:
                    editRating,

                  comment:
                    editComment.trim()

                })

            }
          );


        if (
          response.status === 401 ||
          response.status === 403
        ) {

          handleReviewAuthFailure();

          return;

        }


        if (
          !response.ok
        ) {

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
          previousReviews =>
            previousReviews.map(
              review =>

                review.id ===
                updatedReview.id

                  ? updatedReview

                  : review

            )
        );


        setEditingReview(
          null
        );


        setEditRating(
          0
        );


        setEditComment(
          ""
        );


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
          error.message ||
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
      reviewId
    ) => {

      const user =
        getCurrentUser();


      if (
        !user
      ) {

        return;

      }


      if (
        !getAuthToken()
      ) {

        handleReviewAuthFailure();

        return;

      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete your review?"
        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        /*
         * Current backend controller still
         * requires userEmail.
         */

        const response =
          await fetch(
            `${API_BASE}/api/reviews/${reviewId}/user?userEmail=${encodeURIComponent(
              user.email
            )}`,
            {

              method:
                "DELETE",

              headers:
                getReviewAuthHeaders()

            }
          );


        if (
          response.status === 401 ||
          response.status === 403
        ) {

          handleReviewAuthFailure();

          return;

        }


        if (
          !response.ok
        ) {

          const errorMessage =
            await response.text();


          alert(
            errorMessage ||
            "Unable to delete review."
          );


          return;

        }


        setReviews(
          previousReviews =>
            previousReviews.filter(
              review =>
                review.id !==
                reviewId
            )
        );


        setEditingReview(
          null
        );


        setEditRating(
          0
        );


        setEditComment(
          ""
        );


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
          error.message ||
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
            star => (

              <span
                key={
                  star
                }
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
        reviewCount ===
        0
      ) {

        return 0;

      }


      return Math.round(

        (
          ratingBreakdown[star] /
          reviewCount
        ) *
        100

      );

    };


  // =========================================
  // LOADING
  // =========================================

  if (
    loading
  ) {

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

  if (
    !product
  ) {

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

  const productAvailable =
    isProductAvailable(
      product
    );


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
            src={
              product.image
            }
            alt={
              product.name
            }
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
              {averageRating.toFixed(
                1
              )}
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


          {/* =================================
              SIZE / QUANTITY
          ================================== */}

          {productVariants.length >
            1 && (

            <div
              className="product-details-size-selector"
            >

              <label
                htmlFor="product-size"
              >
                Size / Quantity
              </label>


              <select
                id="product-size"
                value={
                  product.id
                }
                onChange={
                  changeProductVariant
                }
              >

                {productVariants.map(
                  variant => (

                    <option
                      key={
                        variant.id
                      }
                      value={
                        variant.id
                      }
                    >

                      {
                        variant.size ||
                        "Size not specified"
                      }

                    </option>

                  )
                )}

              </select>

            </div>

          )}


          {/* PRICE */}

          <h2
            className="product-details-price"
          >

            ₹
            {product.price}

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

            {/* STOCK */}

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


            {/* SIZE */}

            {product.size && (

              <div
                className="product-info-item"
              >

                <span>
                  🥛
                </span>


                <div>

                  <small>
                    Size / Quantity
                  </small>


                  <strong>
                    {product.size}
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* ADD TO CART */}

          {productAvailable ? (

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
              {averageRating.toFixed(
                1
              )}
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
              star => (

                <div
                  className="rating-breakdown-row"
                  key={
                    star
                  }
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

                    {
                      ratingBreakdown[
                        star
                      ]
                    }

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

              {reviewCount ===
              0

                ? "Be the first to share your experience."

                : `${reviewCount} customer review${
                    reviewCount !==
                    1
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
            currentUser.role || ""
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
                EDIT REVIEW FORM
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
                      star => (

                        <button
                          key={
                            star
                          }
                          type="button"
                          className={
                            star <=
                            editRating
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
                    event =>
                      setEditComment(
                        event.target.value
                      )
                  }
                  maxLength={
                    1000
                  }
                />


                <div
                  className="review-character-count"
                >
                  {editComment.length}/1000
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


        ) : eligibility?.canReview ? (

          /* =================================
             DELIVERED CUSTOMER
             CAN WRITE REVIEW
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
                  star => (

                    <button
                      key={
                        star
                      }
                      type="button"
                      className={
                        star <=
                        rating
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
                event =>
                  setComment(
                    event.target.value
                  )
              }
              maxLength={
                1000
              }
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


        ) : eligibility?.reason ===
          "PURCHASE_REQUIRED" ? (

          /* =================================
             NEVER PURCHASED
          ================================== */

          <div
            className="review-status-card"
          >

            <div
              className="review-status-icon"
            >
              🔒
            </div>


            <div>

              <h3>
                Purchase Required
              </h3>


              <p>
                Purchase this product to share
                your experience.
              </p>

            </div>

          </div>


        ) : eligibility?.reason ===
          "DELIVERY_REQUIRED" ? (

          /* =================================
             PURCHASED BUT NOT DELIVERED
          ================================== */

          <div
            className="review-status-card"
          >

            <div
              className="review-status-icon"
            >
              🚚
            </div>


            <div>

              <h3>
                Review Available After Delivery
              </h3>


              <p>
                You purchased this product.
                Once your order is delivered,
                you can rate and review your
                experience.
              </p>

            </div>

          </div>


        ) : (

          /* =================================
             UNKNOWN / ERROR
          ================================== */

          <div
            className="review-status-card"
          >

            <div
              className="review-status-icon"
            >
              ℹ️
            </div>


            <div>

              <h3>
                Review Unavailable
              </h3>


              <p>
                We could not confirm your review
                eligibility right now. Please try
                again later.
              </p>

            </div>

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
                review =>
                  review.id !==
                  myReview?.id
              )
              .length ===
            0 ? (

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
                review =>
                  review.id !==
                  myReview?.id
              )
              .map(
                review => (

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