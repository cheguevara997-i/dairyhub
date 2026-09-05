import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import BackButton from "../components/BackButton";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function Products() {

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [ratings, setRatings] =
    useState({});

  const [selectedVariants, setSelectedVariants] =
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
  // SEARCH
  // =========================================

  const searchText =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() || "";


  // =========================================
  // GROUP PRODUCTS
  // =========================================

  const groupProducts = (
    productList
  ) => {

    const groups =
      new Map();


    productList.forEach(
      product => {

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


        if (
          !groups.has(key)
        ) {

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

  useEffect(() => {

    const fetchProducts =
      async () => {

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


          setProducts(
            groupProducts(
              productList
            )
          );


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


  // =========================================
  // FETCH RATINGS
  // =========================================

  useEffect(() => {

    const fetchRatings =
      async () => {

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


          const ratingResults =
            await Promise.all(

              variants.map(
                async product => {

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


          ratingResults.forEach(
            item => {

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
            "Error fetching product ratings:",
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
  // GROUP RATING
  // =========================================

  const getGroupRating = (
    group
  ) => {

    let totalReviews =
      0;

    let weightedTotal =
      0;


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
  // FILTER GROUPS
  // =========================================

  const filteredProducts =
    products.filter(
      group => {

        if (
          !searchText
        ) {

          return true;

        }


        return group.variants.some(
          product => {

            const name =
              product.name
                ?.toLowerCase() || "";


            const category =
              product.category
                ?.toLowerCase() || "";


            const description =
              product.description
                ?.toLowerCase() || "";


            const size =
              product.size
                ?.toLowerCase() || "";


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

      }
    );


  // =========================================
  // BACK
  // =========================================

  const backPath =
    fromDashboard
      ? "/dashboard"
      : "/";


  const backText =
    fromDashboard
      ? "← Back to Dashboard"
      : "← Back to Home";


  // =========================================
  // PRODUCT DETAILS URL
  // =========================================

  const getProductDetailsPath =
    (productId) => {

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

  if (loading) {

    return (

      <div className="page">

        <BackButton
          to={backPath}
          text={backText}
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
        to={backPath}
        text={backText}
      />


      <h1>

        {searchText
          ? `Search Results for "${searchText}"`
          : "Our Products"
        }

      </h1>


      {filteredProducts.length === 0 ? (

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

        <div
          className="product-grid"
        >

          {filteredProducts.map(
            group => {

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
                  className="product-card"
                  key={
                    group.key
                  }
                >

                  {/* IMAGE */}

                  <img
                    src={
                      selectedProduct.image
                    }
                    alt={
                      group.name
                    }
                  />


                  {/* NAME */}

                  <h3>
                    {group.name}
                  </h3>


                  {/* RATING */}

                  <div
                    className="product-card-rating"
                  >

                    {reviewCount > 0 ? (

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
                          {reviewCount === 1
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
                    {selectedProduct.description}
                  </p>


                  {/* SIZE */}

                  <div
                    className="product-size-selector"
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

                  <h2>
                    ₹
                    {selectedProduct.price}
                  </h2>


                  {/* STOCK */}

                  <p>
                    {selectedProduct.stock > 0

                      ? `Stock: ${selectedProduct.stock}`

                      : "Out of Stock"

                    }
                  </p>


                  {/* ACTIONS */}

                  <div
                    className="product-card-actions"
                  >

                    <Link
                      to={
                        getProductDetailsPath(
                          selectedProduct.id
                        )
                      }
                      className="product-view-btn"
                    >
                      View Details
                    </Link>


                    <button
                      className="product-add-cart-btn"
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

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default Products;