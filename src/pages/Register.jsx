import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:8080/api/users/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );


      if (!response.ok) {

        throw new Error(
          "Registration failed"
        );

      }


      const savedUser =
        await response.json();


      console.log(
        "Registered user:",
        savedUser
      );


      alert(
        "Registration successful! Please login."
      );


      setFormData({
        name: "",
        email: "",
        password: "",
        phone: ""
      });


      navigate("/login");


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to register. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h2>Create Account</h2>


        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          required
          onChange={handleChange}
        />


        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          required
          onChange={handleChange}
        />


        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          required
          onChange={handleChange}
        />


        <input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />


        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Creating Account..."
            : "Register"}

        </button>


        <div className="auth-links">

          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </form>

    </div>

  );

}

export default Register;