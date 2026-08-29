import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:8080/api/users/login",
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


  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleLogin}
      >

        <h2>
          Login to DairyHub
        </h2>


        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        <button
          type="submit"
          disabled={loading}
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