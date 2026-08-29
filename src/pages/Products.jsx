import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import BackButton from "../components/BackButton";

function Products() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

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
          "http://localhost:8080/api/products"
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
     ADD TO CART
  ========================================= */

  const addToCart = (product) => {

    let cart =
      JSON.parse(
        localStorage.getItem(
          "dairyhubCart"
        )
      ) || [];


    const existingProduct =
      cart.find(
        item => item.id === product.id
      );


    if (existingProduct) {

      // Do not allow quantity to exceed stock

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
      Products → Product Details → Back to Products

      Dashboard:
      Dashboard → Shop Products → Product Details
      → Back to Dashboard

      So we pass the source in the URL.
    */

    if (fromDashboard) {

      return `${basePath}?from=dashboard`;

    }

    return basePath;

  };


  return (

    <div className="page">


      {/* BACK BUTTON */}

      <BackButton
        to={backPath}
        text={backText}
      />


      {/* PAGE TITLE */}

      <h1>

        {searchText
          ? `Search Results for "${searchText}"`
          : "Our Products"}

      </h1>


      {/* LOADING */}

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
              No products match
              {" "}
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
            (product) => (

              <div
                className="product-card"
                key={product.id}
              >


                {/* IMAGE */}

                <img
                  src={product.image}
                  alt={product.name}
                />


                {/* NAME */}

                <h3>
                  {product.name}
                </h3>


                {/* DESCRIPTION */}

                <p>
                  {product.description}
                </p>


                {/* PRICE */}

                <h2>
                  ₹{product.price}
                </h2>


                {/* STOCK */}

                <p>
                  Stock: {product.stock}
                </p>


                {/* VIEW DETAILS */}

                <Link
                  to={getProductDetailsPath(
                    product.id
                  )}
                >
                  View Details
                </Link>


                {/* ADD TO CART */}

                <button
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

            )
          )}

        </div>

      )}

    </div>

  );

}

export default Products;