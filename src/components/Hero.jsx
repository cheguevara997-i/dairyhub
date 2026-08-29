import { Link } from "react-router-dom";

function Hero() {

  return (

    <section className="hero">

      <div className="hero-content">

        <p className="hero-tagline">
          PURE • FRESH • HEALTHY
        </p>

        <h1>
          Fresh Dairy Products
          <br />
          Delivered To Your Doorstep
        </h1>

        <p className="hero-description">
          Fresh milk, curd, paneer, butter and ghee
          made with care and delivered fresh to your home.
        </p>

        <Link
          to="/products"
          className="btn"
        >
          Shop Now →
        </Link>

      </div>


      <div className="hero-image-area">

        <img
          src="/images/dairy-hero.jpg"
          alt="Fresh Dairy Products"
          className="hero-main-image"
        />

      </div>

    </section>

  );

}

export default Hero;