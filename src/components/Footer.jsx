import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Footer() {

  const [products, setProducts] = useState([]);


  useEffect(() => {

    fetch("http://localhost:8080/api/products")
      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();

      })
      .then((data) => {

        setProducts(data.slice(0, 5));

      })
      .catch((error) => {

        console.error(
          "Footer product error:",
          error
        );

      });

  }, []);


  return (

    <footer className="footer">

      <div className="footer-container">


        {/* ABOUT */}

        <div className="footer-section">

          <h2>
            🥛 DairyHub
          </h2>

          <p>
            Fresh dairy products delivered
            directly to your doorstep.
          </p>

        </div>


        {/* QUICK LINKS */}

        <div className="footer-section">

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


        {/* DYNAMIC PRODUCTS */}

        <div className="footer-section">

          <h3>
            Products
          </h3>

          {products.length === 0 ? (

            <p>
              No products available
            </p>

          ) : (

            products.map((product) => (

              <Link
                key={product.id}
                to={`/products/${product.id}?from=footer`}
                className="footer-product-link"
              >
                🥛 {product.name}
              </Link>

            ))

          )}

        </div>


        {/* CONTACT */}

        <div className="footer-section">

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


      <div className="footer-bottom">

        <p>
          © 2026 DairyHub. All Rights Reserved.
        </p>

      </div>

    </footer>

  );

}

export default Footer;