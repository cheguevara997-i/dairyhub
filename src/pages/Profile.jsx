import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


// =========================================
// API BASE URL
// =========================================

const API_BASE =
  "https://dairyhub-backend.onrender.com";


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


          // ===================================
          // GET PROFILE
          // ===================================

          const response =
            await fetch(
              `${API_BASE}/api/users/me`,
              {

                method:
                  "GET",

                headers: {

                  Authorization:
                    `Bearer ${savedUser.token}`

                }

              }
            );


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
          // OTHER ERROR
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
              "Unable to load your profile."
            );


            return;

          }


          // ===================================
          // SAVE PROFILE
          // ===================================

          setProfile(
            data
          );


          setName(
            data?.name || ""
          );


          setPhone(
            data?.phone || ""
          );


          // ===================================
          // UPDATE LOCAL STORAGE
          // ===================================
          // Keep existing JWT token because
          // /api/users/me does not return a token.

          localStorage.setItem(
            "dairyhubUser",
            JSON.stringify({

              ...savedUser,

              ...data,

              token:
                savedUser.token

            })
          );


        } catch (error) {

          console.error(
            "Profile loading error:",
            error
          );


          alert(
            "Unable to load your profile. Please try again."
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


      try {

        setSaving(
          true
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
                    phone.trim()

                })

            }
          );


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
        // UPDATE FAILED
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
            "Unable to update your profile."
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
          data?.name || ""
        );


        setPhone(
          data?.phone || ""
        );


        // ===================================
        // UPDATE LOCAL STORAGE
        // ===================================

        localStorage.setItem(
          "dairyhubUser",
          JSON.stringify({

            ...savedUser,

            ...data,

            // Never lose JWT
            token:
              savedUser.token

          })
        );


        setEditing(
          false
        );


        alert(
          "Profile updated successfully."
        );


      } catch (error) {

        console.error(
          "Profile update error:",
          error
        );


        alert(
          "Unable to update your profile. Please try again."
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


      setEditing(
        false
      );

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
          onClick={() => {

            if (
              String(
                profile.role || ""
              ).toUpperCase() === "ADMIN"
            ) {

              navigate(
                "/admin"
              );

            } else {

              navigate(
                "/dashboard"
              );

            }

          }}
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
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >


        {/* ===================================
            PROFILE ICON
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
            {profile.name || "DairyHub User"}
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


          {/* NAME */}

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
                border: "1px solid #ddd"
              }}
            />

          </div>


          {/* EMAIL */}

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


          {/* PHONE */}

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
                border: "1px solid #ddd"
              }}
            />

          </div>


          {/* ROLE */}

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
              Account role can only be managed by DairyHub administration.
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
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "16px"
                }}
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"
                }

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
                  cursor: saving
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