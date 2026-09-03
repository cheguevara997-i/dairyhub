import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [searchText, setSearchText] = useState("");

  const menuRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("dairyhubUser")
  );


  const closeMenu = () => {
    setMenuOpen(false);
  };


  /* CLOSE MENU WHEN CLICKING OUTSIDE */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }

    };


    if (menuOpen) {

      document.addEventListener(
        "mousedown",
        handleClickOutside
      );

    }


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, [menuOpen]);


  const logout = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );

    setMenuOpen(false);

    window.location.href = "/";

  };


  const handleSearch = (e) => {

    e.preventDefault();

    const search =
      searchText.trim();

    if (!search) {

      return;

    }

    navigate(
      `/products?search=${encodeURIComponent(search)}`
    );

    setMenuOpen(false);

  };


  return (

    <nav className="dairy-navbar">

      {/* LOGO */}

      <Link
        to="/"
        className="dairy-logo"
        onClick={closeMenu}
      >
        <img
          src="/images/dairy.jpg"
          alt="DairyHub Logo"
          className="dairy-logo-image"
        />
      </Link>


      {/* SEARCH */}

      <form
        className="dairy-search"
        onSubmit={handleSearch}
      >

        <span className="dairy-search-icon">
          🔍
        </span>


        <input
          type="text"
          placeholder="Search milk, paneer, ghee..."
          value={searchText}
          onChange={(e) =>
            setSearchText(e.target.value)
          }
        />


        {searchText && (

          <button
            type="button"
            className="dairy-search-clear"
            onClick={() =>
              setSearchText("")
            }
          >
            ×
          </button>

        )}


        <button
          type="submit"
          className="dairy-search-button"
        >
          Search
        </button>

      </form>


      {/* MENU AREA */}

      <div
        className="navbar-menu-wrapper"
        ref={menuRef}
      >

        {/* MENU BUTTON */}

        <button
          className="dairy-menu-button"
          onClick={() =>
            setMenuOpen(
              (previous) => !previous
            )
          }
          aria-label="Open menu"
        >
          ☰
        </button>


        {/* DROPDOWN */}

        {menuOpen && (

          <div className="dairy-menu">

            {/* COMMON */}

            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>


            <Link
              to="/products"
              onClick={closeMenu}
            >
              Products
            </Link>


            {/* CUSTOMER */}

            {user?.role === "CUSTOMER" && (

              <>

                <Link
                  to="/cart"
                  onClick={closeMenu}
                >
                  🛒 Cart
                </Link>


                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

              </>

            )}


            {/* ADMIN */}

            {user?.role === "ADMIN" && (

              <>

                <Link
                  to="/admin"
                  onClick={closeMenu}
                >
                  🛠️ Admin Dashboard
                </Link>


                <Link
                  to="/admin/products"
                  onClick={closeMenu}
                >
                  🥛 Manage Products
                </Link>


                <Link
                  to="/admin/orders"
                  onClick={closeMenu}
                >
                  📦 Manage Orders
                </Link>


                <Link
                  to="/admin/users"
                  onClick={closeMenu}
                >
                  👥 Manage Users
                </Link>


                <Link
                  to="/admin/subscriptions"
                  onClick={closeMenu}
                >
                  🔄 Manage Subscriptions
                </Link>

              </>

            )}


            {/* LOGIN */}

            {!user && (

              <Link
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

            )}


            {/* LOGOUT */}

            {user && (

              <button
                className="dairy-logout"
                onClick={logout}
              >
                Logout
              </button>

            )}

          </div>

        )}

      </div>

    </nav>

  );

}

export default Navbar;