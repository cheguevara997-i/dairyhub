import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const API_URL =
  "https://dairyhub-backend.onrender.com/api/users/register";


function Register() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({

    name: "",
    email: "",
    password: "",
    phone: ""

  });


  const [loading, setLoading] =
    useState(false);


  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value

    });

  };


  // =========================================
  // REGISTER
  // =========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      // =======================================
      // BASIC VALIDATION
      // =======================================

      if (
        !formData.name.trim()
      ) {

        alert(
          "Please enter your name."
        );

        return;

      }


      if (
        !formData.email.trim()
      ) {

        alert(
          "Please enter your email."
        );

        return;

      }


      if (
        !formData.password.trim()
      ) {

        alert(
          "Please enter your password."
        );

        return;

      }


      setLoading(true);


      try {

        const response =
          await fetch(
            API_URL,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"

              },

              body:
                JSON.stringify({

                  name:
                    formData.name.trim(),

                  email:
                    formData.email.trim()
                      .toLowerCase(),

                  password:
                    formData.password,

                  phone:
                    formData.phone.trim() ||
                    null

                })

            }
          );


        // =====================================
        // READ RESPONSE
        // =====================================

        const responseText =
          await response.text();


        let responseData =
          null;


        if (responseText) {

          try {

            responseData =
              JSON.parse(
                responseText
              );

          } catch {

            responseData =
              responseText;

          }

        }


        console.log(
          "Registration response:",
          response.status,
          responseData
        );


        // =====================================
        // ERROR
        // =====================================

        if (!response.ok) {

          let message =
            "Registration failed.";


          if (
            typeof responseData ===
            "string" &&
            responseData.trim()
          ) {

            message =
              responseData;

          } else if (
            responseData?.message
          ) {

            message =
              responseData.message;

          } else if (
            responseData?.error
          ) {

            message =
              responseData.error;

          }


          throw new Error(
            message
          );

        }


        // =====================================
        // SUCCESS
        // =====================================

        console.log(
          "Registered user:",
          responseData
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


        navigate(
          "/login"
        );


      } catch (error) {

        console.error(
          "Registration error:",
          error
        );


        alert(
          error.message ||
          "Unable to register. Please try again."
        );


      } finally {

        setLoading(false);

      }

    };


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={
          handleSubmit
        }
      >

        <h2>
          Create Account
        </h2>


        {/* ===================================
            NAME
        ==================================== */}

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={
            formData.name
          }
          required
          onChange={
            handleChange
          }
        />


        {/* ===================================
            EMAIL
        ==================================== */}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={
            formData.email
          }
          required
          onChange={
            handleChange
          }
        />


        {/* ===================================
            PASSWORD
        ==================================== */}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={
            formData.password
          }
          required
          onChange={
            handleChange
          }
        />


        {/* ===================================
            PHONE
        ==================================== */}

        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="Phone Number"
          value={
            formData.phone
          }
          onChange={
            handleChange
          }
        />


        {/* ===================================
            REGISTER BUTTON
        ==================================== */}

        <button
          type="submit"
          disabled={
            loading
          }
        >

          {loading
            ? "Creating Account..."
            : "Register"
          }

        </button>


        {/* ===================================
            LOGIN LINK
        ==================================== */}

        <div className="auth-links">

          <p>

            Already have an account?{" "}

            <Link
              to="/login"
            >
              Login
            </Link>

          </p>

        </div>

      </form>

    </div>

  );

}


export default Register;