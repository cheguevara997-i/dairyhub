import React from "react";
import { Link } from "react-router-dom";

function FeaturedProducts() {

  const [products, setProducts] = React.useState([]);
  const [ratings, setRatings] = React.useState({});
  const [loading, setLoading] = React.useState(true);


  /* =========================================
     FETCH PRODUCTS
  ========================================= */

  React.useEffect(() => {

    const fetchProducts = async () => {

      try {

        const response = await fetch(
          "https://dairyhub-backend.onrender.com/api/products"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        /*
          Show only the first 6 products
          as featured products.
        */
        setProducts(data.slice(0, 6));

      } catch (error) {

        console.error(
          "Error fetching featured products:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);


  /* =========================================
     FETCH RATINGS
  ========================================= */

  React.useEffect(() => {

    const fetchRatings = async () => {

      if (products.length === 0) {
        return;
      }

      try {

        const results = await Promise.all(

          products.map(async (product) => {

            try {

              const response = await fetch(
                `http://localhost:8080/api/reviews/product/${product.id}/summary`
              );

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch rating for ${product.id}`
                );
              }

              const data = await response.json();

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

        results.forEach((item) => {

          ratingMap[item.productId] = {
            average: item.average,
            count: item.count
          };

        });


        setRatings(ratingMap);

      } catch (error) {

        console.error(
          "Error fetching featured product ratings:",
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

      if (
        existingProduct.quantity >= product.stock
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
     LOADING
  ========================================= */

  if (loading) {

    return (

      <section className="featured-products-section">

        <div className="featured-products-header">

          <h2>
            Featured Products
          </h2>

          <p>
            Fresh dairy products you’ll love.
          </p>

        </div>


        <div className="featured-products-loading">

          <p>
            Loading featured products...
          </p>

        </div>

      </section>

    );

  }


  /* =========================================
     NO PRODUCTS
  ========================================= */

  if (products.length === 0) {

    return null;

  }


  /* =========================================
     PAGE
  ========================================= */

  return (

    <section className="featured-products-section">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="featured-products-header">

        <div>

          <h2>
            Featured Products
          </h2>

          <p>
            Fresh, quality dairy products made
            for everyday goodness.
          </p>

        </div>


        <Link
          to="/products"
          className="featured-view-all"
        >
          View All Products →
        </Link>

      </div>


      {/* =====================================
          PRODUCT GRID
      ====================================== */}

      <div className="featured-products-grid">

        {products.map((product) => {

          const productRating =
            ratings[product.id];

          const averageRating =
            productRating?.average || 0;

          const reviewCount =
            productRating?.count || 0;


          return (

            <div
              className="featured-product-card"
              key={product.id}
            >


              {/* ==============================
                  IMAGE
              =============================== */}

              <div className="featured-product-image-wrapper">

                <img
                  src={product.image}
                  alt={product.name}
                  className="featured-product-image"
                />

              </div>


              {/* ==============================
                  CONTENT
              =============================== */}

              <div className="featured-product-content">


                <h3>
                  {product.name}
                </h3>


                {/* ============================
                    RATING
                ============================= */}

                <div className="featured-product-rating">

                  {reviewCount > 0 ? (

                    <>

                      <span className="featured-rating-star">
                        ⭐
                      </span>

                      <span className="featured-rating-average">
                        {averageRating.toFixed(1)}
                      </span>

                      <span className="featured-rating-count">
                        ({reviewCount}{" "}
                        {reviewCount === 1
                          ? "review"
                          : "reviews"}
                        )
                      </span>

                    </>

                  ) : (

                    <span className="featured-no-rating">
                      ⭐ No reviews yet
                    </span>

                  )}

                </div>


                {/* ============================
                    DESCRIPTION
                ============================= */}

                <p className="featured-product-description">

                  {product.description}

                </p>


                {/* ============================
                    PRICE
                ============================= */}

                <div className="featured-product-price">

                  ₹{product.price}

                </div>


                {/* ============================
                    STOCK
                ============================= */}

                {product.stock > 0 ? (

                  <span className="featured-product-stock">

                    In Stock

                  </span>

                ) : (

                  <span className="featured-product-out-stock">

                    Out of Stock

                  </span>

                )}


                {/* ============================
                    ACTIONS
                ============================= */}

                <div className="featured-product-actions">


                  <Link
                    to={`/products/${product.id}`}
                    className="featured-view-btn"
                  >
                    View Details
                  </Link>


                  <button
                    className="featured-cart-btn"
                    onClick={() =>
                      addToCart(product)
                    }
                    disabled={
                      product.stock <= 0
                    }
                  >

                    {product.stock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}

                  </button>


                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

}

export default FeaturedProducts;