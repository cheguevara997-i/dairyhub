import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams
} from "react-router-dom";

import BackButton from "../components/BackButton";

function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);


  // Check where the user came from
  const fromFooter =
    searchParams.get("from") === "footer";


  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const response = await fetch(
          `http://localhost:8080/api/products/${id}`
        );


        if (!response.ok) {

          throw new Error(
            "Product not found"
          );

        }


        const data =
          await response.json();


        setProduct(data);


      } catch (error) {

        console.error(
          "Error fetching product:",
          error
        );


        setProduct(null);


      } finally {

        setLoading(false);

      }

    };


    fetchProduct();

  }, [id]);


  // ADD TO CART

  const addToCart = () => {

    const user =
      JSON.parse(
        localStorage.getItem("dairyhubUser")
      );


    if (!user) {

      alert(
        "Please login before adding products to cart."
      );

      navigate("/login");

      return;

    }


    let cart =
      JSON.parse(
        localStorage.getItem("dairyhubCart")
      ) || [];


    const existingProduct =
      cart.find(
        (item) => item.id === product.id
      );


    if (existingProduct) {

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


  // LOADING

  if (loading) {

    return (

      <div className="product-details-page">

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


        <div className="product-loading">

          <h2>
            Loading product...
          </h2>

        </div>

      </div>

    );

  }


  // PRODUCT NOT FOUND

  if (!product) {

    return (

      <div className="product-details-page">

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


        <div className="product-not-found">

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


  return (

    <div className="product-details-page">


      {/* BACK BUTTON */}

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


      <div className="product-details-container">


        {/* PRODUCT IMAGE */}

        <div className="product-details-image-box">

          <img
            className="product-details-image"
            src={product.image}
            alt={product.name}
          />

        </div>


        {/* PRODUCT INFORMATION */}

        <div className="product-details-info">


          <span className="product-category">
            {product.category}
          </span>


          <h1>
            {product.name}
          </h1>


          <h2 className="product-details-price">
            ₹{product.price}
          </h2>


          <p className="product-description">
            {product.description}
          </p>


          <div className="product-info-grid">


            {/* STOCK */}

            <div className="product-info-item">

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


            {/* QUANTITY */}

            {product.quantity && (

              <div className="product-info-item">

                <span>
                  🥛
                </span>

                <div>

                  <small>
                    Quantity
                  </small>

                  <strong>
                    {product.quantity}
                  </strong>

                </div>

              </div>

            )}

          </div>


          {/* ADD TO CART */}

          {product.stock > 0 ? (

            <button
              className="product-add-cart-btn"
              onClick={addToCart}
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

    </div>

  );

}

export default ProductDetails;