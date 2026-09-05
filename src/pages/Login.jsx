import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";


// =========================================
// API BASE URL
// =========================================
//
// BOTH local and deployed frontend versions
// use the SAME Render backend.
//
// Local:
// http://localhost:5173
//        ↓
// https://dairyhub-backend.onrender.com
//        ↓
// Aiven MySQL
//
// Production:
// https://dairyhub-five.vercel.app
//        ↓
// https://dairyhub-backend.onrender.com
//        ↓
// Aiven MySQL
//

const API_BASE =
  "https://dairyhub-backend.onrender.com";


function Login() {

  const navigate = useNavigate();


  // =========================================
  // FORM STATE
  // =========================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");


  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);


  // =========================================
  // NORMAL EMAIL + PASSWORD LOGIN
  // =========================================

  const handleLogin =
    async (e) => {

      e.preventDefault();


      // =======================================
      // BASIC VALIDATION
      // =======================================

      if (
        !email.trim() ||
        !password
      ) {

        alert(
          "Please enter your email and password."
        );

        return;

      }


      setLoading(true);


      try {

        // =====================================
        // LOGIN REQUEST
        // =====================================

        const response =
          await fetch(
            `${API_BASE}/api/users/login`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  email:
                    email.trim()
                      .toLowerCase(),

                  password:
                    password

                })

            }
          );


        // =====================================
        // READ RESPONSE
        // =====================================

        const responseText =
          await response.text();


        let data =
          null;


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : null;

        } catch {

          data =
            null;

        }


        // =====================================
        // LOGIN FAILED
        // =====================================

        if (
          !response.ok
        ) {

          alert(

            data?.message ||

            "Invalid email or password."

          );


          return;

        }


        // =====================================
        // LOGIN SUCCESS
        // =====================================

        const user =
          data;


        if (
          !user
        ) {

          alert(
            "Login failed. Invalid server response."
          );

          return;

        }


        /*
         * Expected backend response:
         *
         * id
         * name
         * email
         * phone
         * role
         * adminManaged
         * deleted
         * token
         *
         * Password is NOT returned.
         */


        if (
          !user.token
        ) {

          console.error(
            "Login succeeded but no token was returned:",
            user
          );


          alert(
            "Login failed because the server did not return an authentication token."
          );


          return;

        }


        // =====================================
        // CHECK LOCKED ACCOUNT
        // =====================================

        if (
          Boolean(
            user.deleted
          )
        ) {

          alert(
            "This account is currently locked."
          );


          return;

        }


        // =====================================
        // SAVE LOGIN SESSION
        // =====================================

        localStorage.setItem(
          "dairyhubUser",
          JSON.stringify(
            user
          )
        );


        console.log(
          "DairyHub login successful:",
          {

            id:
              user.id,

            email:
              user.email,

            role:
              user.role,

            hasToken:
              Boolean(
                user.token
              )

          }
        );


        // =====================================
        // GO TO HOME PAGE
        // =====================================

        navigate(
          "/"
        );

      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        alert(
          "Unable to login. Please try again."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin =
    async (
      credentialResponse
    ) => {

      if (
        !credentialResponse?.credential
      ) {

        alert(
          "Google login failed. No credential received."
        );

        return;

      }


      setGoogleLoading(
        true
      );


      try {

        // =====================================
        // GOOGLE LOGIN REQUEST
        // =====================================

        const response =
          await fetch(
            `${API_BASE}/api/users/google`,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  credential:
                    credentialResponse.credential

                })

            }
          );


        // =====================================
        // READ RESPONSE
        // =====================================

        const responseText =
          await response.text();


        let data =
          null;


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : null;

        } catch {

          data =
            null;

        }


        // =====================================
        // GOOGLE LOGIN FAILED
        // =====================================

        if (
          !response.ok
        ) {

          alert(

            data?.message ||

            "Google account could not be verified."

          );


          return;

        }


        // =====================================
        // GOOGLE LOGIN SUCCESS
        // =====================================

        const user =
          data;


        if (
          !user
        ) {

          alert(
            "Google login failed. Invalid server response."
          );

          return;

        }


        /*
         * Google login must also return
         * the authentication token.
         */

        if (
          !user.token
        ) {

          console.error(
            "Google login succeeded but no token was returned:",
            user
          );


          alert(
            "Google login failed because the server did not return an authentication token."
          );


          return;

        }


        // =====================================
        // CHECK LOCKED ACCOUNT
        // =====================================

        if (
          Boolean(
            user.deleted
          )
        ) {

          alert(
            "This account is currently locked."
          );


          return;

        }


        // =====================================
        // SAVE LOGIN SESSION
        // =====================================

        localStorage.setItem(
          "dairyhubUser",
          JSON.stringify(
            user
          )
        );


        console.log(
          "DairyHub Google login successful:",
          {

            id:
              user.id,

            email:
              user.email,

            role:
              user.role,

            hasToken:
              Boolean(
                user.token
              )

          }
        );


        // =====================================
        // GO TO HOME PAGE
        // =====================================

        navigate(
          "/"
        );

      } catch (error) {

        console.error(
          "Google login error:",
          error
        );


        alert(
          "Unable to login with Google. Please try again."
        );

      } finally {

        setGoogleLoading(
          false
        );

      }

    };


  // =========================================
  // PAGE
  // =========================================

  return (

    <div
      className="auth-container"
    >

      <form
        className="auth-form"
        onSubmit={
          handleLogin
        }
      >

        <h2>
          Login to DairyHub
        </h2>


        {/* ===================================
            GOOGLE LOGIN
        ==================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px"
          }}
        >

          <GoogleLogin

            onSuccess={
              handleGoogleLogin
            }

            onError={() => {

              console.error(
                "Google Login Failed"
              );


              alert(
                "Google login failed. Please try again."
              );

            }}

            text="continue_with"

            theme="outline"

            size="large"

            width="320"

          />

        </div>


        {/* ===================================
            DIVIDER
        ==================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#777"
          }}
        >
          OR
        </div>


        {/* ===================================
            EMAIL
        ==================================== */}

        <input
          type="email"
          placeholder="Email"
          value={
            email
          }
          required
          autoComplete="email"
          onChange={
            (e) =>
              setEmail(
                e.target.value
              )
          }
        />


        {/* ===================================
            PASSWORD
        ==================================== */}

        <input
          type="password"
          placeholder="Password"
          value={
            password
          }
          required
          autoComplete="current-password"
          onChange={
            (e) =>
              setPassword(
                e.target.value
              )
          }
        />


        {/* ===================================
            LOGIN BUTTON
        ==================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            googleLoading
          }
        >

          {loading
            ? "Logging in..."
            : "Login"
          }

        </button>


        {/* ===================================
            LINKS
        ==================================== */}

        <div
          className="auth-links"
        >

          <Link
            to="/forgot-password"
          >
            Forgot Password?
          </Link>


          <p>

            Don't have an account?{" "}

            <Link
              to="/register"
            >
              Register
            </Link>

          </p>

        </div>

      </form>

    </div>

  );

}


export default Login;