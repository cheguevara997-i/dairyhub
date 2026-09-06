import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useSearchParams
} from "react-router-dom";

import BackButton from "../components/BackButton";


// =========================================
// API BASE URL
// =========================================

const API_BASE =
  "https://dairyhub-backend.onrender.com";


// =========================================
// PRODUCTS PAGE
// =========================================

function Products() {

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [ratings, setRatings] =
    useState({});

  const [searchParams] =
    useSearchParams();


  // =========================================
  // NAVIGATION SOURCE
  // =========================================

  const fromDashboard =
    searchParams.get("from") ===
    "dashboard";


  // =========================================
  // SEARCH TEXT
  // =========================================

  const searchText =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() || "";


  // =========================================
  // FETCH ALL PRODUCTS
  // =========================================

  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          setLoading(
            true
          );


          const response =
            await fetch(
              `${API_BASE}/api/products`
            );


          if (
            !response.ok
          ) {

            throw new Error(
              "Failed to fetch products."
            );

          }


          const data =
            await response.json();


          const productList =
            Array.isArray(data)
              ? data
              : [];


          /*
           * IMPORTANT:
           *
           * Every database product is kept
           * as an individual product.
           *
           * No grouping is performed here.
           *
           * Therefore:
           *
           * Milk 500 ml
           * Milk 1 L
           * Milk 2 L
           *
           * appear as three separate cards.
           */

          setProducts(
            productList
          );


        } catch (error) {

          console.error(
            "Error fetching products:",
            error
          );


          setProducts(
            []
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    fetchProducts();

  }, []);


  // =========================================
  // FETCH RATINGS
  // =========================================

  useEffect(() => {

    const fetchRatings =
      async () => {

        if (
          products.length ===
          0
        ) {

          return;

        }


        try {

          const results =
            await Promise.all(

              products.map(
                async product => {

                  try {

                    const response =
                      await fetch(
                        `${API_BASE}/api/reviews/product/${product.id}/summary`
                      );


                    if (
                      !response.ok
                    ) {

                      throw new Error(
                        `Failed to fetch rating for product ${product.id}`
                      );

                    }


                    const data =
                      await response.json();


                    return {

                      productId:
                        product.id,

                      average:
                        Number(
                          data.averageRating
                        ) || 0,

                      count:
                        Number(
                          data.reviewCount
                        ) || 0

                    };

                  } catch (error) {

                    console.error(
                      `Error fetching rating for product ${product.id}:`,
                      error
                    );


                    return {

                      productId:
                        product.id,

                      average:
                        0,

                      count:
                        0

                    };

                  }

                }
              )

            );


          const ratingMap =
            {};


          results.forEach(
            result => {

              ratingMap[
                result.productId
              ] = {

                average:
                  result.average,

                count:
                  result.count

              };

            }
          );


          setRatings(
            ratingMap
          );


        } catch (error) {

          console.error(
            "Error fetching product ratings:",
            error
          );


        }

      };


    fetchRatings();

  }, [products]);


  // =========================================
  // CHECK PRODUCT AVAILABILITY
  // =========================================

  const isProductAvailable =
    product => {

      if (
        !product
      ) {

        return false;

      }


      return (

        Number(
          product.stock
        ) > 0 &&

        product.available !== false

      );

    };


  // =========================================
  // ADD TO CART
  // =========================================

  const addToCart =
    product => {

      if (
        !product
      ) {

        return;

      }


      /*
       * Keep your existing login requirement.
       */

      let user =
        null;


      try {

        user =
          JSON.parse(
            localStorage.getItem(
              "dairyhubUser"
            )
          );

      } catch {

        user =
          null;

      }


      if (
        !user
      ) {

        alert(
          "Please login before adding products to cart."
        );


        return;

      }


      /*
       * Do not allow unavailable products
       * to be added.
       */

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
        [];


      try {

        const savedCart =
          JSON.parse(
            localStorage.getItem(
              "dairyhubCart"
            )
          );


        cart =
          Array.isArray(
            savedCart
          )
            ? savedCart
            : [];

      } catch {

        cart =
          [];

      }


      /*
       * Product ID is unique for each
       * database product/variant.
       */

      const existingProduct =
        cart.find(
          item =>
            item.id ===
            product.id
        );


      if (
        existingProduct
      ) {

        const currentQuantity =
          Number(
            existingProduct.quantity ||
            1
          );


        const availableStock =
          Number(
            product.stock
          );


        if (
          currentQuantity >=
          availableStock
        ) {

          alert(
            "You cannot add more than the available stock."
          );


          return;

        }


        existingProduct.quantity =
          currentQuantity + 1;


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
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts =
    products.filter(
      product => {

        if (
          !searchText
        ) {

          return true;

        }


        const name =
          String(
            product.name ||
            ""
          )
            .toLowerCase();


        const category =
          String(
            product.category ||
            ""
          )
            .toLowerCase();


        const description =
          String(
            product.description ||
            ""
          )
            .toLowerCase();


        const size =
          String(
            product.size ||
            ""
          )
            .toLowerCase();


        return (

          name.includes(
            searchText
          ) ||

          category.includes(
            searchText
          ) ||

          description.includes(
            searchText
          ) ||

          size.includes(
            searchText
          )

        );

      }
    );


  // =========================================
  // BACK PATH
  // =========================================

  const backPath =
    fromDashboard
      ? "/dashboard"
      : "/";


  // =========================================
  // BACK TEXT
  // =========================================

  const backText =
    fromDashboard
      ? "← Back to Dashboard"
      : "← Back to Home";


  // =========================================
  // PRODUCT DETAILS PATH
  // =========================================

  const getProductDetailsPath =
    productId => {

      const basePath =
        `/products/${productId}`;


      if (
        fromDashboard
      ) {

        return `${basePath}?from=dashboard`;

      }


      return basePath;

    };


  // =========================================
  // LOADING
  // =========================================

  if (
    loading
  ) {

    return (

      <div
        className="page"
      >

        <BackButton
          to={
            backPath
          }
          text={
            backText
          }
        />


        <h1>
          Our Products
        </h1>


        <div
          className="empty-state"
        >

          <h3>
            Loading products...
          </h3>

        </div>

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div
      className="page"
    >

      <BackButton
        to={
          backPath
        }
        text={
          backText
        }
      />


      {/* =====================================
          PAGE TITLE
      ====================================== */}

      <h1>

        {searchText

          ? `Search Results for "${searchText}"`

          : "Our Products"

        }

      </h1>


      {/* =====================================
          NO PRODUCTS
      ====================================== */}

      {filteredProducts.length ===
      0 ? (

        <div
          className="empty-state"
        >

          <h3>
            No products found
          </h3>


          {searchText ? (

            <p>

              No products match{" "}

              "{searchText}".

            </p>

          ) : (

            <p>
              No products are available right now.
            </p>

          )}


          {searchText && (

            <Link
              to={
                fromDashboard
                  ? "/products?from=dashboard"
                  : "/products"
              }
              className="btn"
            >
              View All Products
            </Link>

          )}

        </div>


      ) : (

        /* ===================================
           ALL PRODUCTS
        ==================================== */

        <div
          className="product-grid"
        >

          {filteredProducts.map(
            product => {

              const rating =
                ratings[
                  product.id
                ] || {

                  average:
                    0,

                  count:
                    0

                };


              const averageRating =
                Number(
                  rating.average
                ) || 0;


              const reviewCount =
                Number(
                  rating.count
                ) || 0;


              const available =
                isProductAvailable(
                  product
                );


              return (

                <div
                  className="product-card"
                  key={
                    product.id
                  }
                >

                  {/* IMAGE */}

                  {product.image ? (

                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                    />

                  ) : (

                    <div
                      className="product-image-placeholder"
                    >
                      🥛
                    </div>

                  )}


                  {/* NAME */}

                  <h3>
                    {product.name}
                  </h3>


                  {/* CATEGORY */}

                  {product.category && (

                    <small>
                      {product.category}
                    </small>

                  )}


                  {/* =================================
                      RATING
                  ================================== */}

                  <div
                    className="product-card-rating"
                  >

                    {reviewCount >
                    0 ? (

                      <>

                        <span
                          className="product-rating-stars"
                        >
                          ⭐
                        </span>


                        <span
                          className="product-rating-average"
                        >
                          {averageRating.toFixed(
                            1
                          )}
                        </span>


                        <span
                          className="product-rating-count"
                        >

                          (
                          {reviewCount}{" "}
                          {reviewCount ===
                          1
                            ? "review"
                            : "reviews"}
                          )

                        </span>

                      </>

                    ) : (

                      <span
                        className="product-no-rating"
                      >
                        ⭐ No reviews yet
                      </span>

                    )}

                  </div>


                  {/* DESCRIPTION */}

                  <p>
                    {product.description}
                  </p>


                  {/* =================================
                      SIZE / QUANTITY
                  ================================== */}

                  <div
                    className="product-size-selector"
                  >

                    <label>
                      Size / Quantity
                    </label>


                    <div
                      className="product-size-value"
                    >

                      {product.size ||
                        "Size not specified"}

                    </div>

                  </div>


                  {/* =================================
                      PRICE
                  ================================== */}

                  <h2>
                    ₹
                    {product.price}
                  </h2>


                  {/* =================================
                      STOCK
                  ================================== */}

                  <p>

                    {available

                      ? `Stock: ${
                          product.stock
                        }`

                      : "Out of Stock"

                    }

                  </p>


                  {/* =================================
                      ACTIONS
                  ================================== */}

                  <div
                    className="product-card-actions"
                  >

                    <Link
                      to={
                        getProductDetailsPath(
                          product.id
                        )
                      }
                      className="product-view-btn"
                    >
                      View Details
                    </Link>


                    <button
                      type="button"
                      className="product-add-cart-btn"
                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                      disabled={
                        !available
                      }
                    >

                      {available

                        ? "Add to Cart"

                        : "Out of Stock"

                      }

                    </button>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default Products;