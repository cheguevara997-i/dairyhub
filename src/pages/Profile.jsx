import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =========================================
// API BASE URL
// =========================================

const API_BASE =
  "https://dairyhub-backend.onrender.com";

// =========================================
// PROFILE COMPONENT
// =========================================

function Profile() {

  const navigate = useNavigate();


  // =========================================
  // PROFILE DATA
  // =========================================

  const [profile, setProfile] =
    useState(null);


  // =========================================
  // FORM DATA
  // =========================================

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [gender, setGender] =
    useState("");


  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // =========================================
  // EDIT MODE
  // =========================================

  const [editing, setEditing] =
    useState(false);


  // =========================================
  // GET SAVED USER
  // =========================================

  const getSavedUser = () => {

    try {

      const savedUser =
        localStorage.getItem(
          "dairyhubUser"
        );


      if (!savedUser) {

        return null;

      }


      return JSON.parse(
        savedUser
      );


    } catch (error) {

      console.error(
        "Unable to read saved user:",
        error
      );


      return null;

    }

  };


  // =========================================
  // LOAD PROFILE
  // =========================================

  useEffect(() => {

    const loadProfile =
      async () => {

        const savedUser =
          getSavedUser();


        // =====================================
        // CHECK LOGIN
        // =====================================

        if (
          !savedUser ||
          !savedUser.token
        ) {

          navigate(
            "/login"
          );

          return;

        }


        try {

          setLoading(
            true
          );


          console.log(
            "Loading DairyHub profile..."
          );


          const response =
            await fetch(
              `${API_BASE}/api/users/me`,
              {

                method:
                  "GET",

                headers: {

                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${savedUser.token}`

                }

              }
            );


          console.log(
            "Profile response status:",
            response.status
          );


          const responseText =
            await response.text();


          console.log(
            "Profile response:",
            responseText
          );


          let data =
            null;


          try {

            data =
              responseText
                ? JSON.parse(
                    responseText
                  )
                : null;

          } catch (error) {

            console.error(
              "Invalid JSON response:",
              error
            );

          }


          // ===================================
          // AUTH FAILURE
          // ===================================

          if (
            response.status === 401 ||
            response.status === 403
          ) {

            localStorage.removeItem(
              "dairyhubUser"
            );


            alert(
              "Your session has expired. Please login again."
            );


            navigate(
              "/login"
            );


            return;

          }


          // ===================================
          // API FAILURE
          // ===================================

          if (
            !response.ok
          ) {

            console.error(
              "Profile API error:",
              response.status,
              data
            );


            alert(
              data?.message ||
              `Unable to load profile. Server returned ${response.status}.`
            );


            return;

          }


          // ===================================
          // EMPTY RESPONSE
          // ===================================

          if (
            !data
          ) {

            console.error(
              "Empty profile response."
            );


            alert(
              "The server returned an empty profile response."
            );


            return;

          }


          // ===================================
          // STORE PROFILE
          // ===================================

          setProfile(
            data
          );


          // ===================================
          // FORM VALUES
          // ===================================

          setName(
            data.name || ""
          );


          setPhone(
            data.phone || ""
          );


          setGender(
            data.gender || ""
          );


          // ===================================
          // UPDATE LOCAL STORAGE
          // ===================================

          /*
           * Keep the current JWT token.
           */

          localStorage.setItem(
            "dairyhubUser",
            JSON.stringify({

              ...savedUser,

              ...data,

              token:
                savedUser.token

            })
          );


          console.log(
            "Profile loaded successfully."
          );


        } catch (error) {

          console.error(
            "PROFILE LOADING ERROR:",
            error
          );


          alert(
            `Unable to load your profile.\n\nError: ${error.message}`
          );


        } finally {

          setLoading(
            false
          );

        }

      };


    loadProfile();

  }, [navigate]);


  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave =
    async (e) => {

      e.preventDefault();


      const savedUser =
        getSavedUser();


      // =====================================
      // CHECK LOGIN
      // =====================================

      if (
        !savedUser ||
        !savedUser.token
      ) {

        alert(
          "Your session has expired. Please login again."
        );


        navigate(
          "/login"
        );


        return;

      }


      // =====================================
      // VALIDATE NAME
      // =====================================

      if (
        !name.trim()
      ) {

        alert(
          "Name cannot be empty."
        );


        return;

      }


      // =====================================
      // VALIDATE GENDER
      // =====================================

      if (
        !gender
      ) {

        alert(
          "Please select your gender."
        );


        return;

      }


      try {

        setSaving(
          true
        );


        console.log(
          "Updating DairyHub profile..."
        );


        // ===================================
        // UPDATE PROFILE
        // ===================================

        const response =
          await fetch(
            `${API_BASE}/api/users/me`,
            {

              method:
                "PUT",

              headers: {

                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${savedUser.token}`

              },

              body:
                JSON.stringify({

                  name:
                    name.trim(),

                  phone:
                    phone.trim(),

                  gender:
                    gender

                })

            }
          );


        console.log(
          "Profile update status:",
          response.status
        );


        const responseText =
          await response.text();


        console.log(
          "Profile update response:",
          responseText
        );


        let data =
          null;


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : null;

        } catch (error) {

          console.error(
            "Invalid update JSON:",
            error
          );

        }


        // ===================================
        // AUTH FAILURE
        // ===================================

        if (
          response.status === 401 ||
          response.status === 403
        ) {

          localStorage.removeItem(
            "dairyhubUser"
          );


          alert(
            "Your session has expired. Please login again."
          );


          navigate(
            "/login"
          );


          return;

        }


        // ===================================
        // UPDATE FAILURE
        // ===================================

        if (
          !response.ok
        ) {

          console.error(
            "Profile update API error:",
            response.status,
            data
          );


          alert(
            data?.message ||
            `Unable to update profile. Server returned ${response.status}.`
          );


          return;

        }


        // ===================================
        // EMPTY RESPONSE
        // ===================================

        if (
          !data
        ) {

          alert(
            "Profile was updated, but the server returned no profile data."
          );


          return;

        }


        // ===================================
        // UPDATE STATE
        // ===================================

        setProfile(
          data
        );


        setName(
          data.name || ""
        );


        setPhone(
          data.phone || ""
        );


        setGender(
          data.gender || ""
        );


        // ===================================
        // UPDATE LOCAL STORAGE
        // ===================================

        localStorage.setItem(
          "dairyhubUser",
          JSON.stringify({

            ...savedUser,

            ...data,

            token:
              savedUser.token

          })
        );


        // ===================================
        // EXIT EDIT MODE
        // ===================================

        setEditing(
          false
        );


        alert(
          "Profile updated successfully."
        );


        console.log(
          "Profile updated successfully."
        );


      } catch (error) {

        console.error(
          "PROFILE UPDATE ERROR:",
          error
        );


        alert(
          `Unable to update your profile.\n\nError: ${error.message}`
        );


      } finally {

        setSaving(
          false
        );

      }

    };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const handleCancel =
    () => {

      setName(
        profile?.name || ""
      );


      setPhone(
        profile?.phone || ""
      );


      setGender(
        profile?.gender || ""
      );


      setEditing(
        false
      );

    };


  // =========================================
  // BACK BUTTON
  // =========================================

  const handleBack =
    () => {

      const role =
        String(
          profile?.role || ""
        ).toUpperCase();


      if (
        role === "ADMIN"
      ) {

        navigate(
          "/admin"
        );

      } else {

        navigate(
          "/dashboard"
        );

      }

    };


  // =========================================
  // LOADING PAGE
  // =========================================

  if (
    loading
  ) {

    return (

      <div className="dashboard">

        <div className="dashboard-header">

          <div>

            <h1>
              My Profile
            </h1>


            <p>
              Loading your profile...
            </p>

          </div>

        </div>


        <div className="empty-state">

          <h3>
            Loading profile...
          </h3>

        </div>

      </div>

    );

  }


  // =========================================
  // PROFILE NOT FOUND
  // =========================================

  if (
    !profile
  ) {

    return (

      <div className="dashboard">

        <div className="empty-state">

          <h3>
            Profile unavailable
          </h3>


          <button
            onClick={() =>
              navigate("/")
            }
          >
            Go Home
          </button>

        </div>

      </div>

    );

  }


  // =========================================
  // CHECK ADMIN
  // =========================================

  const isAdmin =
    String(
      profile.role || ""
    ).toUpperCase() ===
    "ADMIN";


  // =========================================
  // MAIN PROFILE
  // =========================================

  return (

    <div className="dashboard">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="dashboard-header">

        <div>

          <h1>
            My Profile
          </h1>


          <p>
            Manage your DairyHub account information.
          </p>

        </div>


        <button
          className="dashboard-home-btn"
          onClick={
            handleBack
          }
        >
          ← Back
        </button>

      </div>


      {/* =====================================
          PROFILE CARD
      ====================================== */}

      <div
        style={{
          maxWidth: "700px",
          margin: "30px auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >


        {/* ===================================
            PROFILE AVATAR
        ==================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px"
          }}
        >

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              margin: "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f1f8e9",
              fontSize: "42px"
            }}
          >
            👤
          </div>


          <h2
            style={{
              margin: "0"
            }}
          >
            {profile.name ||
              "DairyHub User"}
          </h2>


          <p
            style={{
              marginTop: "8px",
              color: "#777"
            }}
          >
            {profile.role}
          </p>

        </div>


        {/* ===================================
            PROFILE FORM
        ==================================== */}

        <form
          onSubmit={
            handleSave
          }
        >


          {/* =================================
              FULL NAME
          ================================== */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600"
              }}
            >
              Full Name
            </label>


            <input
              type="text"
              value={
                name
              }
              disabled={
                !editing
              }
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background:
                  editing
                    ? "#ffffff"
                    : "#f5f5f5"
              }}
            />

          </div>


          {/* =================================
              GENDER
          ================================== */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600"
              }}
            >
              Gender
            </label>


            <select
              value={
                gender
              }
              disabled={
                !editing
              }
              onChange={(e) =>
                setGender(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background:
                  editing
                    ? "#ffffff"
                    : "#f5f5f5",
                cursor:
                  editing
                    ? "pointer"
                    : "not-allowed"
              }}
            >

              <option
                value=""
              >
                Select Gender
              </option>


              <option
                value="Male"
              >
                Male
              </option>


              <option
                value="Female"
              >
                Female
              </option>


              <option
                value="Other"
              >
                Other
              </option>


              <option
                value="Prefer not to say"
              >
                Prefer not to say
              </option>

            </select>

          </div>


          {/* =================================
              EMAIL
          ================================== */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600"
              }}
            >
              Email
            </label>


            <input
              type="email"
              value={
                profile.email || ""
              }
              disabled
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#f5f5f5",
                color: "#777"
              }}
            />


            <small
              style={{
                color: "#777"
              }}
            >
              Email address cannot be changed.
            </small>

          </div>


          {/* =================================
              PHONE
          ================================== */}

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600"
              }}
            >
              Phone Number
            </label>


            <input
              type="tel"
              placeholder="Enter phone number"
              value={
                phone
              }
              disabled={
                !editing
              }
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background:
                  editing
                    ? "#ffffff"
                    : "#f5f5f5"
              }}
            />

          </div>


          {/* =================================
              ROLE
          ================================== */}

          <div
            style={{
              marginBottom: "30px"
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600"
              }}
            >
              Account Role
            </label>


            <input
              type="text"
              value={
                profile.role || ""
              }
              disabled
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#f5f5f5",
                color: "#777"
              }}
            />


            <small
              style={{
                color: "#777"
              }}
            >
              Account role can only be managed by
              DairyHub administration.
            </small>

          </div>


          {/* =================================
              BUTTONS
          ================================== */}

          {!editing ? (

            <button
              type="button"
              onClick={() =>
                setEditing(
                  true
                )
              }
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              ✏️ Edit Profile
            </button>

          ) : (

            <div
              style={{
                display: "flex",
                gap: "12px"
              }}
            >

              <button
                type="submit"
                disabled={
                  saving
                }
                style={{
                  flex: 1,
                  padding: "13px",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px"
                }}
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  handleCancel
                }
                style={{
                  flex: 1,
                  padding: "13px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                  background: "#ffffff"
                }}
              >
                Cancel
              </button>

            </div>

          )}

        </form>

      </div>

    </div>

  );

}

export default Profile;