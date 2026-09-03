import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);


  // =========================================
  // NORMAL EMAIL + PASSWORD LOGIN
  // =========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      );


      if (!response.ok) {

        alert("Invalid email or password");

        return;

      }


      const user = await response.json();


      localStorage.setItem(
        "dairyhubUser",
        JSON.stringify(user)
      );


      if (user.role === "ADMIN") {

        navigate("/admin");

      } else {

        navigate("/dashboard");

      }


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to login. Please make sure the backend is running."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin = async (
    credentialResponse
  ) => {

    if (!credentialResponse?.credential) {

      alert(
        "Google login failed. No credential received."
      );

      return;

    }


    setGoogleLoading(true);


    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/users/google",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            credential:
              credentialResponse.credential
          })
        }
      );


      if (!response.ok) {

        alert(
          "Google account could not be verified."
        );

        return;

      }


      const user = await response.json();


      localStorage.setItem(
        "dairyhubUser",
        JSON.stringify(user)
      );


      if (user.role === "ADMIN") {

        navigate("/admin");

      } else {

        navigate("/dashboard");

      }


    } catch (error) {

      console.error(
        "Google login error:",
        error
      );

      alert(
        "Unable to login with Google. Please try again."
      );

    } finally {

      setGoogleLoading(false);

    }

  };


  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleLogin}
      >

        <h2>
          Login to DairyHub
        </h2>


        {/* =========================================
            GOOGLE LOGIN
            ========================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px"
          }}
        >

          <GoogleLogin
            onSuccess={handleGoogleLogin}

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

            width="100%"
          />

        </div>


        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#777"
          }}
        >
          OR
        </div>


        {/* =========================================
            EMAIL
            ========================================= */}

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        {/* =========================================
            PASSWORD
            ========================================= */}

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        {/* =========================================
            NORMAL LOGIN BUTTON
            ========================================= */}

        <button
          type="submit"
          disabled={
            loading || googleLoading
          }
        >

          {loading
            ? "Logging in..."
            : "Login"}

        </button>


        <div className="auth-links">

          <Link to="/forgot-password">
            Forgot Password?
          </Link>


          <p>

            Don't have an account?{" "}

            <Link to="/register">
              Register
            </Link>

          </p>

        </div>

      </form>

    </div>

  );

}

export default Login;