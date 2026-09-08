import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const menuRef =
    useRef(null);

  const user =
    JSON.parse(
      localStorage.getItem("dairyhubUser")
    );


  // =========================================
  // CLOSE MENU
  // =========================================

  const closeMenu = () => {

    setMenuOpen(false);

  };


  // =========================================
  // CLOSE MENU OUTSIDE CLICK
  // =========================================

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
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


  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );

    setMenuOpen(false);

    window.location.href = "/";

  };


  // =========================================
  // SEARCH
  // =========================================

  const handleSearch =
    (e) => {

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


      {/* =====================================
          LOGO
      ====================================== */}

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


      {/* =====================================
          SEARCH
      ====================================== */}

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
            setSearchText(
              e.target.value
            )
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


      {/* =====================================
          MENU AREA
      ====================================== */}

      <div
        className="navbar-menu-wrapper"
        ref={menuRef}
      >


        {/* ===================================
            MENU BUTTON
        ==================================== */}

        <button
          className="dairy-menu-button"
          onClick={() =>
            setMenuOpen(
              previous =>
                !previous
            )
          }
          aria-label="Open menu"
        >
          ☰
        </button>


        {/* ===================================
            DROPDOWN MENU
        ==================================== */}

        {menuOpen && (

          <div className="dairy-menu">


            {/* =================================
                HOME
            ================================== */}

            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>


            {/* =================================
                PRODUCTS
            ================================== */}

            <Link
              to="/products"
              onClick={closeMenu}
            >
              Products
            </Link>


            {/* =================================
                ABOUT
            ================================== */}

            <Link
              to="/about"
              onClick={closeMenu}
            >
              About
            </Link>


            {/* =================================
                CUSTOMER
            ================================== */}

            {user?.role === "CUSTOMER" && (

              <>

                {/* CART */}

                <Link
                  to="/cart"
                  onClick={closeMenu}
                >
                  🛒 Cart
                </Link>


                {/* DASHBOARD */}

                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>


                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMenu}
                >
                  👤 My Profile
                </Link>

              </>

            )}


            {/* =================================
                ADMIN
            ================================== */}

            {user?.role === "ADMIN" && (

              <>

                {/* ADMIN DASHBOARD */}

                <Link
                  to="/admin"
                  onClick={closeMenu}
                >
                  🛠️ Admin Dashboard
                </Link>


                {/* ADMIN PROFILE */}

                <Link
                  to="/admin/profile"
                  onClick={closeMenu}
                >
                  👤 My Profile
                </Link>

              </>

            )}


            {/* =================================
                LOGIN
            ================================== */}

            {!user && (

              <Link
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

            )}


            {/* =================================
                LOGOUT
            ================================== */}

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