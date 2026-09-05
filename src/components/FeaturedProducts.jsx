import React from "react";
import { Link } from "react-router-dom";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function FeaturedProducts() {

  const [products, setProducts] =
    React.useState([]);

  const [ratings, setRatings] =
    React.useState({});

  const [selectedVariants, setSelectedVariants] =
    React.useState({});

  const [loading, setLoading] =
    React.useState(true);


  // =========================================
  // GROUP PRODUCTS BY NAME + CATEGORY
  // =========================================

  const groupProducts = (productList) => {

    const groups = new Map();


    productList.forEach(
      (product) => {

        const name =
          String(
            product.name || ""
          )
            .trim()
            .toLowerCase();


        const category =
          String(
            product.category || ""
          )
            .trim()
            .toLowerCase();


        const key =
          `${name}__${category}`;


        if (!groups.has(key)) {

          groups.set(
            key,
            {
              key,
              name:
                product.name,
              category:
                product.category,
              variants: []
            }
          );

        }


        groups
          .get(key)
          .variants
          .push(product);

      }
    );


    return Array.from(
      groups.values()
    );

  };


  // =========================================
  // FETCH PRODUCTS
  // =========================================

  React.useEffect(() => {

    const fetchProducts = async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/api/products`
          );


        if (!response.ok) {

          throw new Error(
            "Failed to fetch products"
          );

        }


        const data =
          await response.json();


        const productList =
          Array.isArray(data)
            ? data
            : [];


        const groups =
          groupProducts(
            productList
          );


        /*
         * Show only the first 6
         * UNIQUE products.
         */

        const featuredGroups =
          groups.slice(
            0,
            6
          );


        setProducts(
          featuredGroups
        );


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


  // =========================================
  // FETCH RATINGS FOR ALL VARIANTS
  // =========================================

  React.useEffect(() => {

    const fetchRatings = async () => {

      if (
        products.length === 0
      ) {

        return;

      }


      try {

        const variants =
          products.flatMap(
            group =>
              group.variants
          );


        const results =
          await Promise.all(

            variants.map(
              async (product) => {

                try {

                  const response =
                    await fetch(
                      `${API_BASE}/api/reviews/product/${product.id}/summary`
                    );


                  if (!response.ok) {

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

                    average: 0,

                    count: 0

                  };

                }

              }
            )

          );


        const ratingMap = {};


        results.forEach(
          (item) => {

            ratingMap[
              item.productId
            ] = {

              average:
                item.average,

              count:
                item.count

            };

          }
        );


        setRatings(
          ratingMap
        );


      } catch (error) {

        console.error(
          "Error fetching featured product ratings:",
          error
        );

      }

    };


    fetchRatings();

  }, [products]);


  // =========================================
  // GET SELECTED VARIANT
  // =========================================

  const getSelectedVariant = (
    group
  ) => {

    const selectedId =
      selectedVariants[
        group.key
      ];


    if (
      selectedId
    ) {

      const selected =
        group.variants.find(
          variant =>
            variant.id ===
            selectedId
        );


      if (selected) {

        return selected;

      }

    }


    return group.variants[0];

  };


  // =========================================
  // CHANGE SIZE
  // =========================================

  const handleVariantChange = (
    groupKey,
    variantId
  ) => {

    setSelectedVariants(
      previous => ({

        ...previous,

        [groupKey]:
          Number(
            variantId
          )

      })
    );

  };


  // =========================================
  // AGGREGATED RATING
  // =========================================

  const getGroupRating = (
    group
  ) => {

    let totalReviews = 0;

    let weightedTotal = 0;


    group.variants.forEach(
      variant => {

        const rating =
          ratings[
            variant.id
          ];


        if (!rating) {

          return;

        }


        const count =
          Number(
            rating.count
          ) || 0;


        const average =
          Number(
            rating.average
          ) || 0;


        totalReviews +=
          count;


        weightedTotal +=
          average *
          count;

      }
    );


    if (
      totalReviews === 0
    ) {

      return {

        average: 0,

        count: 0

      };

    }


    return {

      average:
        weightedTotal /
        totalReviews,

      count:
        totalReviews

    };

  };


  // =========================================
  // ADD TO CART
  // =========================================

  const addToCart = (
    product
  ) => {

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


    if (existingProduct) {

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
      JSON.stringify(
        cart
      )
    );


    alert(
      `${product.name} (${product.size || "Size not specified"}) added to cart!`
    );

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <section
        className="featured-products-section"
      >

        <div
          className="featured-products-header"
        >

          <h2>
            Featured Products
          </h2>

          <p>
            Fresh dairy products you’ll love.
          </p>

        </div>


        <div
          className="featured-products-loading"
        >

          <p>
            Loading featured products...
          </p>

        </div>

      </section>

    );

  }


  // =========================================
  // NO PRODUCTS
  // =========================================

  if (
    products.length === 0
  ) {

    return null;

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <section
      className="featured-products-section"
    >

      {/* =====================================
          HEADER
      ====================================== */}

      <div
        className="featured-products-header"
      >

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

      <div
        className="featured-products-grid"
      >

        {products.map(
          (group) => {

            const selectedProduct =
              getSelectedVariant(
                group
              );


            const groupRating =
              getGroupRating(
                group
              );


            const averageRating =
              groupRating.average;


            const reviewCount =
              groupRating.count;


            return (

              <div
                className="featured-product-card"
                key={
                  group.key
                }
              >

                {/* IMAGE */}

                <div
                  className="featured-product-image-wrapper"
                >

                  <img
                    src={
                      selectedProduct.image
                    }
                    alt={
                      group.name
                    }
                    className="featured-product-image"
                  />

                </div>


                {/* CONTENT */}

                <div
                  className="featured-product-content"
                >

                  <h3>
                    {group.name}
                  </h3>


                  {/* RATING */}

                  <div
                    className="featured-product-rating"
                  >

                    {reviewCount > 0 ? (

                      <>

                        <span
                          className="featured-rating-star"
                        >
                          ⭐
                        </span>


                        <span
                          className="featured-rating-average"
                        >
                          {averageRating.toFixed(
                            1
                          )}
                        </span>


                        <span
                          className="featured-rating-count"
                        >
                          (
                          {reviewCount}{" "}
                          {reviewCount === 1
                            ? "review"
                            : "reviews"}
                          )
                        </span>

                      </>

                    ) : (

                      <span
                        className="featured-no-rating"
                      >
                        ⭐ No reviews yet
                      </span>

                    )}

                  </div>


                  {/* DESCRIPTION */}

                  <p
                    className="featured-product-description"
                  >
                    {selectedProduct.description}
                  </p>


                  {/* SIZE */}

                  <div
                    className="featured-product-size"
                  >

                    <label>
                      Size / Quantity
                    </label>


                    <select
                      value={
                        selectedProduct.id
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          group.key,
                          e.target.value
                        )
                      }
                    >

                      {group.variants.map(
                        variant => (

                          <option
                            key={
                              variant.id
                            }
                            value={
                              variant.id
                            }
                          >
                            {variant.size ||
                              "Size not specified"}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  {/* PRICE */}

                  <div
                    className="featured-product-price"
                  >
                    ₹
                    {selectedProduct.price}
                  </div>


                  {/* STOCK */}

                  {selectedProduct.stock > 0 ? (

                    <span
                      className="featured-product-stock"
                    >
                      In Stock
                    </span>

                  ) : (

                    <span
                      className="featured-product-out-stock"
                    >
                      Out of Stock
                    </span>

                  )}


                  {/* ACTIONS */}

                  <div
                    className="featured-product-actions"
                  >

                    <Link
                      to={`/products/${selectedProduct.id}`}
                      className="featured-view-btn"
                    >
                      View Details
                    </Link>


                    <button
                      className="featured-cart-btn"
                      onClick={() =>
                        addToCart(
                          selectedProduct
                        )
                      }
                      disabled={
                        selectedProduct.stock <=
                        0
                      }
                    >

                      {selectedProduct.stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"
                      }

                    </button>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </div>

    </section>

  );

}


export default FeaturedProducts;