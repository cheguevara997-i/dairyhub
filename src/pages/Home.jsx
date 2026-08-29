import Hero from "../components/Hero";
import { Link } from "react-router-dom";

function Home() {

  return (

    <div className="home-page">

      {/* HERO */}

      <Hero />


      {/* OUR DAIRY PRODUCTS */}

      <section className="categories">

        <h2>
          Our Dairy Products
        </h2>

        <p className="categories-subtitle">
          Fresh, quality dairy products made for everyday goodness.
        </p>

        <div className="category-grid">

          {/* MILK */}

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


          {/* CURD */}

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


          {/* PANEER */}

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


          {/* BUTTER */}

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


          {/* GHEE */}

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

        </div>

      </section>


      {/* WHY CHOOSE DAIRYHUB */}

      <section className="why">

        <h2>
          Why Choose DairyHub?
        </h2>

        <div className="why-grid">

          <div>

            <h3>
              🐄 Farm Fresh
            </h3>

            <p>
              Products directly from trusted dairy farms.
            </p>

          </div>

          <div>

            <h3>
              🚚 Fast Delivery
            </h3>

            <p>
              Fresh dairy products delivered to your doorstep.
            </p>

          </div>

          <div>

            <h3>
              ❤️ Healthy
            </h3>

            <p>
              Quality dairy products for your family.
            </p>

          </div>

        </div>

      </section>

    </div>

  );

}

export default Home;