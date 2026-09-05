import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const API_BASE =
  "https://dairyhub-backend.onrender.com";


function Footer() {

  const [products, setProducts] =
    useState([]);


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

              /*
               * Keep one representative product
               * for the footer link.
               *
               * The first variant is used only
               * for its product ID.
               */

              productId:
                product.id
            }
          );

        }

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


          /*
           * Group duplicate product variants
           * and show only the first 5 unique
           * products.
           */

          const uniqueProducts =
            groupProducts(
              productList
            );


          setProducts(
            uniqueProducts.slice(
              0,
              5
            )
          );


        } catch (error) {

          console.error(
            "Footer product error:",
            error
          );

        }

      };


    fetchProducts();

  }, []);


  // =========================================
  // PAGE
  // =========================================

  return (

    <footer
      className="footer"
    >

      <div
        className="footer-container"
      >


        {/* ===================================
            ABOUT
        ==================================== */}

        <div
          className="footer-section"
        >

          <h2>
            🥛 DairyHub
          </h2>


          <p>
            Fresh dairy products delivered
            directly to your doorstep.
          </p>

        </div>


        {/* ===================================
            QUICK LINKS
        ==================================== */}

        <div
          className="footer-section"
        >

          <h3>
            Quick Links
          </h3>


          <Link to="/">
            Home
          </Link>


          <Link to="/products">
            Products
          </Link>


          <Link to="/cart">
            🛒 Cart
          </Link>


          <Link to="/subscription">
            🥛 Subscription
          </Link>

        </div>


        {/* ===================================
            DYNAMIC PRODUCTS
        ==================================== */}

        <div
          className="footer-section"
        >

          <h3>
            Products
          </h3>


          {products.length === 0 ? (

            <p>
              No products available
            </p>

          ) : (

            products.map(
              product => (

                <Link
                  key={
                    product.key
                  }
                  to={`/products/${product.productId}?from=footer`}
                  className="footer-product-link"
                >

                  🥛{" "}
                  {product.name}

                </Link>

              )
            )

          )}

        </div>


        {/* ===================================
            CONTACT
        ==================================== */}

        <div
          className="footer-section"
        >

          <h3>
            Contact
          </h3>


          <p>

            📍{" "}

            <a
              href="https://www.google.com/maps/search/?api=1&query=Gundugallu%2C+Gangavaram%2C+Chittoor%2C+Andhra+Pradesh%2C+India"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              Gundugallu, India
            </a>

          </p>


          <p>

            📞{" "}

            <a
              href="tel:+91901435033"
              className="footer-contact-link"
            >
              901435033
            </a>

          </p>


          <p>

            ✉{" "}

            <a
              href="mailto:thalaribhargav214@gmail.com"
              className="footer-contact-link"
            >
              thalaribhargav214@gmail.com
            </a>

          </p>

        </div>

      </div>


      {/* =====================================
          FOOTER BOTTOM
      ====================================== */}

      <div
        className="footer-bottom"
      >

        <p>
          © 2026 DairyHub. All Rights Reserved.
        </p>

      </div>

    </footer>

  );

}


export default Footer;