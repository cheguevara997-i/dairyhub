import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">

      {/* =========================================
          HERO
      ========================================= */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-logo-mark">🐄</div>

          <p className="about-tagline">
            PURE FROM FARM TO HOME
          </p>

          <h1>About DairyHub</h1>

          <p className="about-intro">
            DairyHub is a farm-fresh dairy platform created to make
            quality dairy products easily accessible to customers.
            Our aim is to connect fresh dairy products with homes
            through a simple, convenient and trustworthy online
            experience.
          </p>
        </div>
      </section>


      {/* =========================================
          OUR STORY
      ========================================= */}
      <section className="about-section">
        <div className="about-section-heading">
          <span>🌿</span>
          <div>
            <p className="about-small-title">OUR STORY</p>
            <h2>Our Story</h2>
          </div>
        </div>

        <div className="about-story-card">
          <div className="about-story-icon">
            🐄
          </div>

          <div>
            <p>
              DairyHub began with a simple idea — to bring the
              goodness of fresh dairy products from the farm closer
              to every home.
            </p>

            <p>
              We believe that dairy should be fresh, hygienic,
              nutritious and convenient to purchase.
            </p>
          </div>
        </div>
      </section>


      {/* =========================================
          OUR PRODUCTS
      ========================================= */}
      <section className="about-section about-products-section">
        <div className="about-section-heading centered">
          <span>🥛</span>

          <div>
            <p className="about-small-title">WHAT WE OFFER</p>
            <h2>Our Products</h2>
          </div>
        </div>

        <p className="about-section-description">
          Fresh dairy essentials for your everyday needs.
        </p>

        <div className="about-products-grid">

          <div className="about-product-card">
            <div className="about-product-icon">🥛</div>
            <h3>Milk</h3>
            <p>Fresh and wholesome dairy milk.</p>
          </div>

          <div className="about-product-card">
            <div className="about-product-icon">🥣</div>
            <h3>Curd</h3>
            <p>Fresh and naturally refreshing curd.</p>
          </div>

          <div className="about-product-card">
            <div className="about-product-icon">🧀</div>
            <h3>Paneer</h3>
            <p>Soft and fresh paneer for everyday cooking.</p>
          </div>

          <div className="about-product-card">
            <div className="about-product-icon">🧈</div>
            <h3>Butter</h3>
            <p>Creamy dairy butter made for delicious meals.</p>
          </div>

          <div className="about-product-card">
            <div className="about-product-icon">🫙</div>
            <h3>Ghee</h3>
            <p>Rich and aromatic traditional dairy ghee.</p>
          </div>

        </div>
      </section>


      {/* =========================================
          WHY CHOOSE DAIRYHUB
      ========================================= */}
      <section className="about-section">
        <div className="about-section-heading centered">
          <span>🌱</span>

          <div>
            <p className="about-small-title">THE DAIRYHUB DIFFERENCE</p>
            <h2>Why Choose DairyHub?</h2>
          </div>
        </div>

        <div className="about-benefits-grid">

          <div className="about-benefit-card">
            <div className="about-benefit-icon">🌿</div>
            <h3>Fresh & Natural</h3>
            <p>
              Quality dairy products with a focus on freshness.
            </p>
          </div>

          <div className="about-benefit-card">
            <div className="about-benefit-icon">🐄</div>
            <h3>Farm Fresh</h3>
            <p>
              Products inspired by the goodness of fresh dairy
              farming.
            </p>
          </div>

          <div className="about-benefit-card">
            <div className="about-benefit-icon">🛡️</div>
            <h3>Quality & Hygiene</h3>
            <p>
              We focus on quality and hygienic handling.
            </p>
          </div>

          <div className="about-benefit-card">
            <div className="about-benefit-icon">🚚</div>
            <h3>Convenient Delivery</h3>
            <p>
              Order your favourite dairy products online and have
              them delivered conveniently.
            </p>
          </div>

        </div>
      </section>


      {/* =========================================
          ONLINE EXPERIENCE
      ========================================= */}
      <section className="about-online-section">
        <div className="about-online-content">

          <div className="about-online-icon">
            💻
          </div>

          <div>
            <p className="about-small-title">DIGITAL DAIRY EXPERIENCE</p>

            <h2>DairyHub Online Experience</h2>

            <p>
              DairyHub makes buying dairy products simple through
              an easy-to-use online platform.
            </p>

            <div className="about-online-features">

              <span>✓ Explore dairy products</span>
              <span>✓ View product details</span>
              <span>✓ Add products to cart</span>
              <span>✓ Place orders</span>
              <span>✓ Make payments</span>
              <span>✓ Track orders</span>
              <span>✓ Manage profile</span>
              <span>✓ Manage subscriptions</span>
              <span>✓ Share reviews</span>

            </div>
          </div>

        </div>
      </section>


      {/* =========================================
          CUSTOMER REVIEWS
      ========================================= */}
      <section className="about-section about-reviews-section">

        <div className="about-section-heading centered">
          <span>❤️</span>

          <div>
            <p className="about-small-title">CUSTOMER FEEDBACK</p>
            <h2>What Our Customers Say</h2>
          </div>
        </div>

        <p className="about-section-description">
          Discover ratings and reviews shared by DairyHub customers
          on our product pages.
        </p>

        <Link
          to="/products"
          className="about-secondary-button"
        >
          View Customer Reviews →
        </Link>

      </section>


      {/* =========================================
          HOW DAIRYHUB WORKS
      ========================================= */}
      <section className="about-section about-how-section">

        <div className="about-section-heading centered">
          <span>📦</span>

          <div>
            <p className="about-small-title">SIMPLE & CONVENIENT</p>
            <h2>How DairyHub Works</h2>
          </div>
        </div>

        <div className="about-steps">

          <div className="about-step">
            <div className="about-step-number">01</div>
            <div className="about-step-icon">🔎</div>
            <h3>Explore Products</h3>
          </div>

          <div className="about-step-arrow">→</div>

          <div className="about-step">
            <div className="about-step-number">02</div>
            <div className="about-step-icon">🥛</div>
            <h3>Choose Your Dairy Products</h3>
          </div>

          <div className="about-step-arrow">→</div>

          <div className="about-step">
            <div className="about-step-number">03</div>
            <div className="about-step-icon">🛒</div>
            <h3>Add to Cart</h3>
          </div>

          <div className="about-step-arrow">→</div>

          <div className="about-step">
            <div className="about-step-number">04</div>
            <div className="about-step-icon">💳</div>
            <h3>Place Your Order</h3>
          </div>

          <div className="about-step-arrow">→</div>

          <div className="about-step">
            <div className="about-step-number">05</div>
            <div className="about-step-icon">🚚</div>
            <h3>Get Fresh Dairy Products</h3>
          </div>

        </div>
      </section>


      {/* =========================================
          OUR MISSION
      ========================================= */}
      <section className="about-mission-section">

        <div className="about-mission-card">

          <div className="about-mission-icon">
            ❤️
          </div>

          <p className="about-small-title">
            OUR PURPOSE
          </p>

          <h2>Our Mission</h2>

          <p>
            To make fresh and quality dairy products accessible
            through a simple, reliable and convenient digital
            platform while building trust between dairy producers
            and customers.
          </p>

        </div>

      </section>


      {/* =========================================
          LOCATION
      ========================================= */}
      <section className="about-section">

        <div className="about-contact-grid">

          <div className="about-location-card">

            <div className="about-contact-icon">
              📍
            </div>

            <p className="about-small-title">
              FIND US
            </p>

            <h2>Our Location</h2>

            <div className="about-address">
              <p>Gundugallu Village</p>
              <p>Gundugallu Post</p>
              <p>Gangavaram Mandal</p>
              <p>Chittoor District</p>
              <p>Andhra Pradesh</p>
              <p>517432, India</p>
            </div>

          </div>


          {/* =========================================
              CONTACT
          ========================================= */}
          <div className="about-contact-card">

            <div className="about-contact-icon">
              📞
            </div>

            <p className="about-small-title">
              GET IN TOUCH
            </p>

            <h2>Contact DairyHub</h2>

            <div className="about-contact-details">

              <div>
                <span>📱</span>
                <div>
                  <small>Phone / WhatsApp</small>
                  <strong>9014352033</strong>
                </div>
              </div>

              <div>
                <span>✉️</span>
                <div>
                  <small>Email</small>
                  <strong>
                    thalaribhargav214@gmail.com
                  </strong>
                </div>
              </div>

              <div>
                <span>🌐</span>
                <div>
                  <small>Website</small>
                  <strong>
                    dairyhub-five.vercel.app
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FINAL CTA
      ========================================= */}
      <section className="about-final-cta">

        <div className="about-final-content">

          <p className="about-final-tagline">
            PURE FROM FARM TO HOME
          </p>

          <h2>
            DairyHub 🌿
          </h2>

          <p>
            Fresh dairy goodness, just a few clicks away.
          </p>

          <Link
            to="/products"
            className="about-primary-button"
          >
            Explore Our Products →
          </Link>

        </div>

      </section>

    </div>
  );
}

export default About;