import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DairyInfo() {

  const { type } = useParams();

  const [products, setProducts] = useState([]);

  const dairyData = {

    milk: {
      icon: "🥛",
      title: "Fresh Milk",
      subtitle: "Pure farm fresh milk",
      description:
        "Our fresh milk is collected from trusted dairy sources and carefully handled to maintain its natural freshness, taste and quality. It is a nutritious everyday choice for families.",
      process:
        "Fresh milk is collected and carefully checked for quality before processing and hygienic packaging. It is then kept properly chilled to preserve its freshness until delivery.",
      benefits:
        "Fresh milk is a natural source of calcium, protein and essential nutrients that support everyday health and nutrition.",
      category: "Milk"
    },

    curd: {
      icon: "🥣",
      title: "Fresh Curd",
      subtitle: "Fresh and healthy curd",
      description:
        "Our curd is prepared from fresh quality milk using a carefully controlled fermentation process. It has a smooth texture and refreshing taste that pairs well with everyday meals.",
      process:
        "Fresh milk is heated and prepared under hygienic conditions before natural fermentation is allowed to take place. Once the desired texture and taste are achieved, the curd is chilled and packed.",
      benefits:
        "Curd is a refreshing dairy food that can be enjoyed with meals and is a natural source of calcium and protein.",
      category: "Curd"
    },

    paneer: {
      icon: "🧀",
      title: "Fresh Paneer",
      subtitle: "Soft and fresh paneer",
      description:
        "Our paneer is made from fresh quality milk that is carefully heated and naturally coagulated. The paneer is then pressed and chilled to retain its soft texture and fresh taste.",
      process:
        "Fresh milk is heated and naturally coagulated before the solid portion is separated. It is then gently pressed into shape, chilled and hygienically packed for delivery.",
      benefits:
        "Paneer is a protein-rich dairy food that works well in curries, snacks and many everyday meals.",
      category: "Paneer"
    },

    butter: {
      icon: "🧈",
      title: "Natural Butter",
      subtitle: "Creamy dairy butter",
      description:
        "Our butter is prepared from fresh dairy cream and carefully processed to create a smooth, creamy texture and rich dairy taste.",
      process:
        "Fresh dairy cream is collected and carefully processed until the butter separates naturally. The butter is then cleaned, shaped, chilled and packed while maintaining its quality.",
      benefits:
        "Butter adds a rich and creamy taste to breakfast, cooking and baking.",
      category: "Butter"
    },

    ghee: {
      icon: "🫙",
      title: "Pure Ghee",
      subtitle: "Traditional and aromatic ghee",
      description:
        "Our ghee is traditionally prepared from quality dairy butter and slowly clarified to achieve its rich aroma, smooth texture and authentic taste.",
      process:
        "Quality butter is slowly heated under controlled conditions until the milk solids separate and the pure golden ghee is formed. It is then filtered and hygienically packed.",
      benefits:
        "Ghee is valued for its rich aroma and is commonly used in everyday cooking and traditional dishes.",
      category: "Ghee"
    }

  };


  const currentDairy =
    dairyData[type] || dairyData.milk;


  useEffect(() => {

    fetch("https://dairyhub-backend.onrender.com/api/products")
      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();

      })
      .then((data) => {

        setProducts(data);

      })
      .catch((error) => {

        console.error(
          "Dairy product price error:",
          error
        );

      });

  }, []);


  const categoryProducts =
    products.filter(
      (product) =>
        product.category?.toLowerCase() ===
        currentDairy.category.toLowerCase()
    );


  const lowestPrice =
    categoryProducts.length > 0
      ? Math.min(
          ...categoryProducts.map(
            (product) => Number(product.price)
          )
        )
      : null;


  return (

    <div className="dairy-info-page">

      {/* FALLING PETALS */}

      <div className="falling-petals">

        <span>🌸</span>
        <span>🍃</span>
        <span>🌸</span>
        <span>🍃</span>
        <span>🌼</span>
        <span>🍃</span>
        <span>🌸</span>
        <span>🍃</span>
        <span>🌼</span>
        <span>🌸</span>
        <span>🍃</span>
        <span>🌸</span>

      </div>


      <div className="dairy-info-container">

        {/* BACK */}

        <Link
          to="/"
          className="dairy-back-link"
        >
          ← Back to Home
        </Link>


        {/* HEADER */}

        <div className="dairy-info-header">

          <div className="dairy-info-icon">
            {currentDairy.icon}
          </div>

          <div>

            <span className="dairy-info-category">
              DairyHub
            </span>

            <h1>
              {currentDairy.title}
            </h1>

            <p>
              {currentDairy.subtitle}
            </p>

          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="dairy-info-section">

          <h2>
            About Our {currentDairy.title}
          </h2>

          <p>
            {currentDairy.description}
          </p>

        </div>


        {/* PROCESS */}

        <div className="dairy-info-section">

          <h2>
            Our Process
          </h2>

          <p>
            {currentDairy.process}
          </p>

        </div>


        {/* BENEFITS */}

        <div className="dairy-info-section">

          <h2>
            Why You'll Love It
          </h2>

          <p>
            {currentDairy.benefits}
          </p>

        </div>


        {/* PRICE */}

        <div className="dairy-price-box">

          <div>

            <span>
              Starting Price
            </span>

            <strong>
              {lowestPrice !== null
                ? `₹${lowestPrice}`
                : "Check Products"}
            </strong>

          </div>


          <Link
            to="/products"
            className="dairy-shop-button"
          >
            Shop {currentDairy.title} →
          </Link>

        </div>

      </div>

    </div>

  );

}

export default DairyInfo;