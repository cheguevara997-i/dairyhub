import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import BackButton from "../components/BackButton";

function Products() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [ratings, setRatings] = useState({});

  const [searchParams] = useSearchParams();


  /* =========================================
     NAVIGATION SOURCE
  ========================================= */

  const fromDashboard =
    searchParams.get("from") === "dashboard";


  /* =========================================
     SEARCH TEXT
  ========================================= */

  const searchText =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() || "";


  /* =========================================
     FETCH PRODUCTS
  ========================================= */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const response = await fetch(
          "https://dairyhub-backend.onrender.com/api/products"
        );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch products"
          );

        }

        const data =
          await response.json();

        setProducts(data);

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);


  /* =========================================
     FETCH PRODUCT RATINGS
  ========================================= */

  useEffect(() => {

    const fetchRatings = async () => {

      if (products.length === 0) {
        return;
      }

      try {

        const ratingResults =
          await Promise.all(

            products.map(async (product) => {

              try {

                const response =
                  await fetch(
                    `http://localhost:8080/api/reviews/product/${product.id}/summary`
                  );

                if (!response.ok) {

                  throw new Error(
                    `Failed to fetch rating for product ${product.id}`
                  );

                }

                const data =
                  await response.json();

                return {
                  productId: product.id,
                  average:
                    Number(data.averageRating) || 0,
                  count:
                    Number(data.reviewCount) || 0
                };

              } catch (error) {

                console.error(
                  `Error fetching rating for product ${product.id}:`,
                  error
                );

                return {
                  productId: product.id,
                  average: 0,
                  count: 0
                };

              }

            })

          );


        const ratingMap = {};

        ratingResults.forEach((item) => {

          ratingMap[item.productId] = {
            average: item.average,
            count: item.count
          };

        });


        setRatings(ratingMap);

      } catch (error) {

        console.error(
          "Error fetching product ratings:",
          error
        );

      }

    };

    fetchRatings();

  }, [products]);


  /* =========================================
     ADD TO CART
  ========================================= */

  const addToCart = (product) => {

    let cart =
      JSON.parse(
        localStorage.getItem("dairyhubCart")
      ) || [];


    const existingProduct =
      cart.find(
        item => item.id === product.id
      );


    if (existingProduct) {

      /*
        Do not allow quantity
        to exceed available stock.
      */

      if (
        existingProduct.quantity >=
        product.stock
      ) {

        alert(
          "You cannot add more than the available stock."
        );

        return;

      }

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


  /* =========================================
     FILTER PRODUCTS
  ========================================= */

  const filteredProducts =
    products.filter((product) => {

      if (!searchText) {

        return true;

      }


      const name =
        product.name
          ?.toLowerCase() || "";


      const category =
        product.category
          ?.toLowerCase() || "";


      const description =
        product.description
          ?.toLowerCase() || "";


      return (
        name.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText)
      );

    });


  /* =========================================
     BACK DESTINATION
  ========================================= */

  const backPath =
    fromDashboard
      ? "/dashboard"
      : "/";


  const backText =
    fromDashboard
      ? "← Back to Dashboard"
      : "← Back to Home";


  /* =========================================
     PRODUCT DETAILS URL
  ========================================= */

  const getProductDetailsPath = (productId) => {

    const basePath =
      `/products/${productId}`;


    /*
      Normal Products page:

      Products
         ↓
      Product Details
         ↓
      Back to Products


      Dashboard:

      Dashboard
         ↓
      Shop Products
         ↓
      Product Details
         ↓
      Back to Dashboard
    */

    if (fromDashboard) {

      return `${basePath}?from=dashboard`;

    }

    return basePath;

  };


  /* =========================================
     PAGE
  ========================================= */

  return (

    <div className="page">


      {/* =====================================
          BACK BUTTON
      ====================================== */}

      <BackButton
        to={backPath}
        text={backText}
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
          LOADING
      ====================================== */}

      {loading ? (

        <div className="empty-state">

          <h3>
            Loading products...
          </h3>

        </div>

      ) : filteredProducts.length === 0 ? (

        /* =====================================
           NO RESULTS
        ===================================== */

        <div className="empty-state">

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

        /* =====================================
           PRODUCT GRID
        ===================================== */

        <div className="product-grid">

          {filteredProducts.map(
            (product) => {

              const productRating =
                ratings[product.id];

              const averageRating =
                productRating?.average || 0;

              const reviewCount =
                productRating?.count || 0;


              return (

                <div
                  className="product-card"
                  key={product.id}
                >


                  {/* ===========================
                      PRODUCT IMAGE
                  ============================ */}

                  <img
                    src={product.image}
                    alt={product.name}
                  />


                  {/* ===========================
                      PRODUCT NAME
                  ============================ */}

                  <h3>
                    {product.name}
                  </h3>


                  {/* ===========================
                      PRODUCT RATING
                  ============================ */}

                  <div className="product-card-rating">

                    {reviewCount > 0 ? (

                      <>

                        <span className="product-rating-stars">
                          ⭐
                        </span>

                        <span className="product-rating-average">
                          {averageRating.toFixed(1)}
                        </span>

                        <span className="product-rating-count">
                          ({reviewCount}{" "}
                          {reviewCount === 1
                            ? "review"
                            : "reviews"}
                          )
                        </span>

                      </>

                    ) : (

                      <span className="product-no-rating">
                        ⭐ No reviews yet
                      </span>

                    )}

                  </div>


                  {/* ===========================
                      PRODUCT DESCRIPTION
                  ============================ */}

                  <p>
                    {product.description}
                  </p>


                  {/* ===========================
                      PRODUCT PRICE
                  ============================ */}

                  <h2>
                    ₹{product.price}
                  </h2>


                  {/* ===========================
                      PRODUCT STOCK
                  ============================ */}

                  <p>
                    Stock: {product.stock}
                  </p>


                  {/* =================================
                      ACTION BUTTONS
                  ================================== */}

                  <div className="product-card-actions">


                    {/* =============================
                        VIEW DETAILS
                    ============================== */}

                    <Link
                      to={getProductDetailsPath(
                        product.id
                      )}
                      className="product-view-btn"
                    >
                      View Details
                    </Link>


                    {/* =============================
                        ADD TO CART
                    ============================== */}

                    <button
                      className="product-add-cart-btn"
                      onClick={() =>
                        addToCart(product)
                      }
                      disabled={
                        product.stock <= 0
                      }
                    >

                      {product.stock > 0
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