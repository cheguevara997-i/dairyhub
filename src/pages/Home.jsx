import React from "react";
import Hero from "../components/Hero";
import { Link } from "react-router-dom";

function Reveal({ children, className = "", delay = 0 }) {
  const [show, setShow] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShow(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`home-reveal ${show ? "home-reveal-show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}


function Home() {

  return (

    <div className="home-page">

      {/* =========================================
          HERO
          ========================================= */}

      <Reveal className="hero-reveal">

        <Hero />

      </Reveal>


      {/* =========================================
          OUR DAIRY PRODUCTS
          ========================================= */}

      <section className="categories">

        <Reveal>

          <h2>
            Our Dairy Products
          </h2>

        </Reveal>


        <Reveal delay={100}>

          <p className="categories-subtitle">
            Fresh, quality dairy products made for
            everyday goodness.
          </p>

        </Reveal>


        <div className="category-grid">

          {/* MILK */}

          <Reveal
            className="product-reveal"
            delay={150}
          >

            <div className="category-card">

              <div className="category-icon">
                🥛
              </div>

              <h3>
                Fresh Milk
              </h3>

              <p>
                Pure farm fresh milk
              </p>

              <span>
                Rich in calcium & protein
              </span>

              <Link
                to="/dairy/milk"
                className="category-click"
              >
                Explore →
              </Link>

            </div>

          </Reveal>


          {/* CURD */}

          <Reveal
            className="product-reveal"
            delay={250}
          >

            <div className="category-card">

              <div className="category-icon">
                🥣
              </div>

              <h3>
                Curd
              </h3>

              <p>
                Fresh and healthy curd
              </p>

              <span>
                Probiotic & naturally refreshing
              </span>

              <Link
                to="/dairy/curd"
                className="category-click"
              >
                Explore →
              </Link>

            </div>

          </Reveal>


          {/* PANEER */}

          <Reveal
            className="product-reveal"
            delay={350}
          >

            <div className="category-card">

              <div className="category-icon">
                🧀
              </div>

              <h3>
                Paneer
              </h3>

              <p>
                Soft and fresh paneer
              </p>

              <span>
                Protein-rich and perfect for meals
              </span>

              <Link
                to="/dairy/paneer"
                className="category-click"
              >
                Explore →
              </Link>

            </div>

          </Reveal>


          {/* BUTTER */}

          <Reveal
            className="product-reveal"
            delay={450}
          >

            <div className="category-card">

              <div className="category-icon">
                🧈
              </div>

              <h3>
                Butter
              </h3>

              <p>
                Natural dairy butter
              </p>

              <span>
                Creamy taste for cooking & breakfast
              </span>

              <Link
                to="/dairy/butter"
                className="category-click"
              >
                Explore →
              </Link>

            </div>

          </Reveal>


          {/* GHEE */}

          <Reveal
            className="product-reveal"
            delay={550}
          >

            <div className="category-card">

              <div className="category-icon">
                🫙
              </div>

              <h3>
                Ghee
              </h3>

              <p>
                Pure traditional ghee
              </p>

              <span>
                Aromatic and ideal for everyday cooking
              </span>

              <Link
                to="/dairy/ghee"
                className="category-click"
              >
                Explore →
              </Link>

            </div>

          </Reveal>

        </div>

      </section>


      {/* =========================================
          WHY CHOOSE DAIRYHUB
          ========================================= */}

      <section className="why">

        <Reveal>

          <h2>
            Why Choose DairyHub?
          </h2>

        </Reveal>


        <div className="why-grid">

          {/* FARM FRESH */}

          <Reveal
            className="why-card-reveal"
            delay={150}
          >

            <div>

              <h3>
                🐄 Farm Fresh
              </h3>

              <p>
                Products directly from trusted dairy
                farms.
              </p>

            </div>

          </Reveal>


          {/* FAST DELIVERY */}

          <Reveal
            className="why-card-reveal"
            delay={300}
          >

            <div>

              <h3>
                🚚 Fast Delivery
              </h3>

              <p>
                Fresh dairy products delivered to your
                doorstep.
              </p>

            </div>

          </Reveal>


          {/* HEALTHY */}

          <Reveal
            className="why-card-reveal"
            delay={450}
          >

            <div>

              <h3>
                ❤️ Healthy
              </h3>

              <p>
                Quality dairy products for your family.
              </p>

            </div>

          </Reveal>

        </div>

      </section>

    </div>

  );

}

export default Home;