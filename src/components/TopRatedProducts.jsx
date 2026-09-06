import React from "react";

const API_BASE =
  "https://dairyhub-backend.onrender.com";

const VISIBLE_COUNT = 1;


function TopRatedProducts() {

  const [reviews, setReviews] =
    React.useState([]);

  const [loading, setLoading] =
    React.useState(true);

  const [currentIndex, setCurrentIndex] =
    React.useState(0);


  // =========================================
  // FETCH TOP CUSTOMER REVIEWS
  // =========================================

  React.useEffect(() => {

    const fetchTopReviews =
      async () => {

        try {

          setLoading(true);


          // -----------------------------------
          // GET ALL PRODUCTS
          // -----------------------------------

          const productsResponse =
            await fetch(
              `${API_BASE}/api/products`
            );


          if (
            !productsResponse.ok
          ) {

            throw new Error(
              "Unable to fetch products."
            );

          }


          const productData =
            await productsResponse.json();


          const products =
            Array.isArray(
              productData
            )
              ? productData
              : [];


          // -----------------------------------
          // FETCH REVIEWS FOR ALL PRODUCTS
          // -----------------------------------

          const reviewResults =
            await Promise.all(

              products.map(
                async product => {

                  try {

                    const response =
                      await fetch(
                        `${API_BASE}/api/reviews/product/${product.id}`
                      );


                    if (
                      !response.ok
                    ) {

                      return [];

                    }


                    const data =
                      await response.json();


                    if (
                      !Array.isArray(
                        data
                      )
                    ) {

                      return [];

                    }


                    return data.map(
                      review => ({

                        ...review,

                        productName:
                          product.name,

                        productSize:
                          product.size

                      })
                    );

                  } catch {

                    return [];

                  }

                }
              )

            );


          // -----------------------------------
          // COMBINE ALL REVIEWS
          // -----------------------------------

          const allReviews =
            reviewResults.flat();


          // -----------------------------------
          // ONLY VALID REVIEWS
          // -----------------------------------

          const validReviews =
            allReviews.filter(
              review => {

                const rating =
                  Number(
                    review.rating
                  ) || 0;


                return (

                  rating >= 1 &&

                  rating <= 5 &&

                  review.comment &&
                  review.comment.trim()

                );

              }
            );


          // -----------------------------------
          // SORT HIGHEST RATING FIRST
          // -----------------------------------

          validReviews.sort(
            (
              first,
              second
            ) => {

              const firstRating =
                Number(
                  first.rating
                ) || 0;


              const secondRating =
                Number(
                  second.rating
                ) || 0;


              // Highest rating first

              if (
                secondRating !==
                firstRating
              ) {

                return (
                  secondRating -
                  firstRating
                );

              }


              // Newest review first
              const firstDate =
                new Date(
                  first.createdAt ||
                  0
                ).getTime();


              const secondDate =
                new Date(
                  second.createdAt ||
                  0
                ).getTime();


              return (
                secondDate -
                firstDate
              );

            }
          );


          /*
           * Keep the best customer reviews.
           *
           * The section is about customer
           * ratings, not products.
           */

          setReviews(
            validReviews.slice(
              0,
              10
            )
          );


          setCurrentIndex(
            0
          );


        } catch (error) {

          console.error(
            "Error fetching customer ratings:",
            error
          );


          setReviews(
            []
          );

        } finally {

          setLoading(false);

        }

      };


    fetchTopReviews();

  }, []);


  // =========================================
  // AUTO SLIDE
  // =========================================

  React.useEffect(() => {

    if (
      reviews.length <=
      VISIBLE_COUNT
    ) {

      return;

    }


    const interval =
      setInterval(() => {

        setCurrentIndex(
          previousIndex => {

            if (
              previousIndex >=
              reviews.length - 1
            ) {

              return 0;

            }


            return previousIndex + 1;

          }
        );

      }, 4000);


    return () =>
      clearInterval(
        interval
      );

  }, [
    reviews.length
  ]);


  // =========================================
  // PREVIOUS
  // =========================================

  const showPrevious =
    () => {

      if (
        reviews.length <=
        1
      ) {

        return;

      }


      setCurrentIndex(
        previousIndex => {

          if (
            previousIndex <=
            0
          ) {

            return (
              reviews.length -
              1
            );

          }


          return (
            previousIndex - 1
          );

        }
      );

    };


  // =========================================
  // NEXT
  // =========================================

  const showNext =
    () => {

      if (
        reviews.length <=
        1
      ) {

        return;

      }


      setCurrentIndex(
        previousIndex => {

          if (
            previousIndex >=
            reviews.length - 1
          ) {

            return 0;

          }


          return (
            previousIndex + 1
          );

        }
      );

    };


  // =========================================
  // STAR DISPLAY
  // =========================================

  const renderStars =
    rating => {

      const numericRating =
        Number(
          rating
        ) || 0;


      return (

        <div
          className="customer-rating-stars"
        >

          {[1, 2, 3, 4, 5].map(
            star => (

              <span
                key={
                  star
                }
                className={
                  star <=
                  numericRating
                    ? "customer-rating-star active"
                    : "customer-rating-star"
                }
              >
                ★
              </span>

            )
          )}

        </div>

      );

    };


  // =========================================
  // LOADING
  // =========================================

  if (
    loading
  ) {

    return (

      <section
        className="customer-ratings-section"
      >

        <div
          className="customer-ratings-header"
        >

          <span>
            CUSTOMER VOICE
          </span>


          <h2>
            ⭐ What Our Customers Say
          </h2>


          <p>
            Real experiences from DairyHub customers.
          </p>

        </div>


        <div
          className="customer-ratings-loading"
        >
          Loading customer reviews...
        </div>

      </section>

    );

  }


  // =========================================
  // NO REVIEWS
  // =========================================

  if (
    reviews.length ===
    0
  ) {

    return null;

  }


  // =========================================
  // MAIN SECTION
  // =========================================

  return (

    <section
      className="customer-ratings-section"
    >

      {/* =====================================
          HEADER
      ====================================== */}

      <div
        className="customer-ratings-header"
      >

        <span>
          CUSTOMER VOICE
        </span>


        <h2>
          ⭐ What Our Customers Say
        </h2>


        <p>
          Real experiences from DairyHub customers.
        </p>

      </div>


      {/* =====================================
          REVIEW CAROUSEL
      ====================================== */}

      <div
        className="customer-ratings-carousel"
      >

        <div
          className="customer-ratings-viewport"
        >

          <div
            className="customer-ratings-track"
            style={{
              transform:
                `translateX(-${
                  currentIndex *
                  100
                }%)`
            }}
          >

            {reviews.map(
              review => (

                <article
                  className="customer-rating-card"
                  key={
                    review.id
                  }
                >

                  {/* STARS */}

                  {renderStars(
                    review.rating
                  )}


                  {/* RATING */}

                  <div
                    className="customer-rating-value"
                  >

                    {Number(
                      review.rating
                    ).toFixed(1)}

                    <span>
                      / 5
                    </span>

                  </div>


                  {/* REVIEW */}

                  <p
                    className="customer-rating-comment"
                  >
                    "{review.comment}"
                  </p>


                  {/* CUSTOMER */}

                  <div
                    className="customer-rating-customer"
                  >

                    <strong>
                      {review.userName ||
                        "DairyHub Customer"}
                    </strong>


                    {review.verifiedPurchase && (

                      <span>
                        ✓ Verified Purchase
                      </span>

                    )}

                  </div>


                  {/* DATE */}

                  {review.createdAt && (

                    <small
                      className="customer-rating-date"
                    >

                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}

                    </small>

                  )}

                </article>

            ))}

          </div>

        </div>


        {/* ===================================
            CONTROLS
        ==================================== */}

        {reviews.length >
          1 && (

          <div
            className="customer-ratings-controls"
          >

            <button
              type="button"
              onClick={
                showPrevious
              }
              aria-label="Previous customer review"
            >
              ←
            </button>


            <div
              className="customer-ratings-dots"
            >

              {reviews.map(
                (
                  _,
                  index
                ) => (

                  <button
                    key={
                      index
                    }
                    type="button"
                    className={
                      index ===
                      currentIndex
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentIndex(
                        index
                      )
                    }
                    aria-label={
                      `Show review ${index + 1}`
                    }
                  />

                )
              )}

            </div>


            <button
              type="button"
              onClick={
                showNext
              }
              aria-label="Next customer review"
            >
              →
            </button>

          </div>

        )}

      </div>

    </section>

  );

}


export default TopRatedProducts;