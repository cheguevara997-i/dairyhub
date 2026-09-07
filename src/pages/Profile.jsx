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
  // PROFILE
  // =========================================

  const [profile, setProfile] =
    useState(null);


  // =========================================
  // PERSONAL INFORMATION
  // =========================================

  const [name, setName] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [phone, setPhone] =
    useState("");


  // =========================================
  // PROFILE PHOTO
  // =========================================

  const [profilePhoto, setProfilePhoto] =
    useState(null);


  const [photoLoading, setPhotoLoading] =
    useState(false);


  // =========================================
  // DELIVERY ADDRESS
  // =========================================

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");


  // =========================================
  // PAGE LOADING
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
  // PASSWORD SECTION
  // =========================================

  const [passwordOpen, setPasswordOpen] =
    useState(false);


  const [currentPassword, setCurrentPassword] =
    useState("");


  const [newPassword, setNewPassword] =
    useState("");


  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [changingPassword, setChangingPassword] =
    useState(false);


  // =========================================
  // DELETE ACCOUNT
  // =========================================

  const [deleteOpen, setDeleteOpen] =
    useState(false);


  const [deletingAccount, setDeletingAccount] =
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

          } catch (error) {

            console.error(
              "Invalid profile response:",
              error
            );

          }


          // ===================================
          // SESSION EXPIRED
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
          // API ERROR
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


          if (
            !data
          ) {

            alert(
              "The server returned an empty profile."
            );


            return;

          }


          // ===================================
          // SAVE PROFILE
          // ===================================

          setProfile(
            data
          );


          // ===================================
          // PERSONAL INFORMATION
          // ===================================

          setName(
            data.name || ""
          );


          setGender(
            data.gender || ""
          );


          setPhone(
            data.phone || ""
          );


          // ===================================
          // PROFILE PHOTO
          // ===================================

          setProfilePhoto(
            data.profilePhoto || null
          );


          // ===================================
          // ADDRESS
          // ===================================

          setAddress(
            data.address || ""
          );


          setCity(
            data.city || ""
          );


          setState(
            data.state || ""
          );


          setPincode(
            data.pincode || ""
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
  // PROFILE PHOTO SELECT
  // =========================================

  const handlePhotoChange =
    (e) => {

      const file =
        e.target.files?.[0];


      if (
        !file
      ) {

        return;

      }


      // =====================================
      // FILE TYPE
      // =====================================

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select a valid image file."
        );

        return;

      }


      // =====================================
      // FILE SIZE
      // =====================================

      const maxSize =
        2 * 1024 * 1024;


      if (
        file.size > maxSize
      ) {

        alert(
          "Profile photo must be 2 MB or smaller."
        );

        return;

      }


      setPhotoLoading(
        true
      );


      const reader =
        new FileReader();


      reader.onload =
        () => {

          setProfilePhoto(
            reader.result
          );


          setPhotoLoading(
            false
          );

        };


      reader.onerror =
        () => {

          setPhotoLoading(
            false
          );


          alert(
            "Unable to read the selected image."
          );

        };


      reader.readAsDataURL(
        file
      );

    };


  // =========================================
  // REMOVE PHOTO
  // =========================================

  const removePhoto =
    () => {

      setProfilePhoto(
        null
      );

    };


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
      // NAME VALIDATION
      // =====================================

      if (
        !name.trim()
      ) {

        alert(
          "Full name cannot be empty."
        );


        return;

      }


      // =====================================
      // GENDER VALIDATION
      // =====================================

      if (
        !gender
      ) {

        alert(
          "Please select your gender."
        );


        return;

      }


      // =====================================
      // PINCODE VALIDATION
      // =====================================

      if (
        pincode.trim() &&
        !/^\d{6}$/.test(
          pincode.trim()
        )
      ) {

        alert(
          "Pincode must contain exactly 6 digits."
        );


        return;

      }


      try {

        setSaving(
          true
        );


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

                  gender:
                    gender,

                  phone:
                    phone.trim(),

                  profilePhoto:
                    profilePhoto || "",

                  address:
                    address.trim(),

                  city:
                    city.trim(),

                  state:
                    state.trim(),

                  pincode:
                    pincode.trim()

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

        } catch (error) {

          console.error(
            "Invalid profile update response:",
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
            "Profile update error:",
            response.status,
            data
          );


          alert(
            data?.message ||
            "Unable to update profile."
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


        setGender(
          data.gender || ""
        );


        setPhone(
          data.phone || ""
        );


        setProfilePhoto(
          data.profilePhoto || null
        );


        setAddress(
          data.address || ""
        );


        setCity(
          data.city || ""
        );


        setState(
          data.state || ""
        );


        setPincode(
          data.pincode || ""
        );


        // ===================================
        // UPDATE SESSION
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


        setEditing(
          false
        );


        alert(
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


      setGender(
        profile?.gender || ""
      );


      setPhone(
        profile?.phone || ""
      );


      setProfilePhoto(
        profile?.profilePhoto || null
      );


      setAddress(
        profile?.address || ""
      );


      setCity(
        profile?.city || ""
      );


      setState(
        profile?.state || ""
      );


      setPincode(
        profile?.pincode || ""
      );


      setEditing(
        false
      );

    };


  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const handleChangePassword =
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
      // VALIDATION
      // =====================================

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        alert(
          "Please fill all password fields."
        );


        return;

      }


      if (
        newPassword.length < 8
      ) {

        alert(
          "New password must contain at least 8 characters."
        );


        return;

      }


      if (
        newPassword !==
        confirmPassword
      ) {

        alert(
          "New password and confirm password do not match."
        );


        return;

      }


      try {

        setChangingPassword(
          true
        );


        const response =
          await fetch(
            `${API_BASE}/api/users/me/password`,
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

                  currentPassword:
                    currentPassword,

                  newPassword:
                    newPassword

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
        // CHANGE FAILED
        // ===================================

        if (
          !response.ok
        ) {

          alert(
            data?.message ||
            "Unable to change password."
          );


          return;

        }


        // ===================================
        // RESET FORM
        // ===================================

        setCurrentPassword(
          ""
        );


        setNewPassword(
          ""
        );


        setConfirmPassword(
          ""
        );


        setPasswordOpen(
          false
        );


        alert(
          data?.message ||
          "Password changed successfully."
        );


      } catch (error) {

        console.error(
          "CHANGE PASSWORD ERROR:",
          error
        );


        alert(
          `Unable to change password.\n\nError: ${error.message}`
        );


      } finally {

        setChangingPassword(
          false
        );

      }

    };


  // =========================================
  // DELETE MY ACCOUNT
  // =========================================

  const handleDeleteAccount =
    async () => {

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


      try {

        setDeletingAccount(
          true
        );


        const response =
          await fetch(
            `${API_BASE}/api/users/me`,
            {

              method:
                "DELETE",

              headers: {

                Accept:
                  "application/json",

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
        // DELETE FAILURE
        // ===================================

        if (
          !response.ok
        ) {

          alert(
            data?.message ||
            "Unable to delete your account."
          );


          return;

        }


        // ===================================
        // LOGOUT AFTER DELETE
        // ===================================

        localStorage.removeItem(
          "dairyhubUser"
        );


        alert(
          data?.message ||
          "Your account has been moved to the Delete Bin."
        );


        window.location.href =
          "/";


      } catch (error) {

        console.error(
          "DELETE ACCOUNT ERROR:",
          error
        );


        alert(
          `Unable to delete your account.\n\nError: ${error.message}`
        );


      } finally {

        setDeletingAccount(
          false
        );

        setDeleteOpen(
          false
        );

      }

    };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout =
    () => {

      localStorage.removeItem(
        "dairyhubUser"
      );


      window.location.href =
        "/";

    };


  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {

    navigate("/");

  };


  // =========================================
  // LOADING PAGE
  // =========================================

  if (
    loading
  ) {

    return (

      <div
        className="dashboard"
        style={{
          minHeight: "70vh"
        }}
      >

        <div
          className="empty-state"
          style={{
            marginTop: "50px"
          }}
        >

          <h3>
            Loading your profile...
          </h3>

        </div>

      </div>

    );

  }


  // =========================================
  // PROFILE UNAVAILABLE
  // =========================================

  if (
    !profile
  ) {

    return (

      <div
        className="dashboard"
        style={{
          minHeight: "70vh"
        }}
      >

        <div
          className="empty-state"
        >

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
  // ROLE
  // =========================================

  const isAdmin =
    String(
      profile.role || ""
    ).toUpperCase() ===
    "ADMIN";


  // =========================================
  // PROFILE PHOTO
  // =========================================

  const photoSource =
    profilePhoto ||
    null;


  // =========================================
  // MAIN PAGE
  // =========================================

  return (

    <div
      style={{
        minHeight: "75vh",
        background: "#f7f9f4",
        padding: "35px 20px 60px",
        boxSizing: "border-box"
      }}
    >


      {/* =====================================
          PAGE CONTAINER
      ====================================== */}

      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto"
        }}
      >


        {/* ===================================
            TOP HEADER
        ==================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap"
          }}
        >

          <div>

            <p
              style={{
                margin: "0 0 6px",
                color: "#6b8e23",
                fontWeight: "700",
                fontSize: "14px",
                letterSpacing: "0.5px"
              }}
            >
              ACCOUNT
            </p>


            <h1
              style={{
                margin: "0",
                color: "#263238",
                fontSize: "34px"
              }}
            >
              My Profile
            </h1>


            <p
              style={{
                margin: "8px 0 0",
                color: "#6b7280"
              }}
            >
              Manage your DairyHub account and preferences.
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleBack
            }
            style={{
              border: "1px solid #d7ded0",
              background: "#ffffff",
              padding: "11px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            ← Back
          </button>

        </div>


        {/* ===================================
            PROFILE HERO
        ==================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >


          {/* PROFILE PHOTO */}

          <div
            style={{
              position: "relative",
              flexShrink: 0
            }}
          >

            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#edf6e5",
                border: "4px solid #ffffff",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >

              {photoSource ? (

                <img
                  src={photoSource}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />

              ) : (

                <span
                  style={{
                    fontSize: "52px"
                  }}
                >
                  👤
                </span>

              )}

            </div>

          </div>


          {/* PROFILE SUMMARY */}

          <div
            style={{
              flex: 1,
              minWidth: "220px"
            }}
          >

            <h2
              style={{
                margin: "0 0 6px",
                color: "#263238",
                fontSize: "28px"
              }}
            >
              {profile.name ||
                "DairyHub User"}
            </h2>


            <p
              style={{
                margin: "0 0 12px",
                color: "#6b7280"
              }}
            >
              {profile.email}
            </p>


            <span
              style={{
                display: "inline-block",
                padding: "7px 13px",
                borderRadius: "20px",
                background: "#edf6e5",
                color: "#55751d",
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              {profile.role}
            </span>

          </div>


          {/* PHOTO BUTTON */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >

            <label
              style={{
                display: "inline-block",
                padding: "10px 15px",
                borderRadius: "9px",
                background: "#f3f7ef",
                border: "1px solid #d8e2cf",
                cursor: editing
                  ? "pointer"
                  : "not-allowed",
                fontWeight: "600",
                color: editing
                  ? "#55751d"
                  : "#999",
                opacity: photoLoading
                  ? 0.6
                  : 1
              }}
            >

              {photoLoading
                ? "Reading..."
                : "📷 Change Photo"}

              <input
                type="file"
                accept="image/*"
                disabled={
                  !editing ||
                  photoLoading
                }
                onChange={
                  handlePhotoChange
                }
                style={{
                  display: "none"
                }}
              />

            </label>


            {profilePhoto && editing && (

              <button
                type="button"
                onClick={
                  removePhoto
                }
                style={{
                  padding: "10px 15px",
                  borderRadius: "9px",
                  background: "#fff5f5",
                  border: "1px solid #f0cccc",
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "#b42318"
                }}
              >
                Remove
              </button>

            )}

          </div>

        </div>


        {/* ===================================
            PERSONAL INFORMATION
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px"
            }}
          >

            <div>

              <h2
                style={{
                  margin: "0 0 5px",
                  fontSize: "22px",
                  color: "#263238"
                }}
              >
                Personal Information
              </h2>


              <p
                style={{
                  margin: "0",
                  color: "#7a7a7a",
                  fontSize: "14px"
                }}
              >
                Your basic DairyHub account information.
              </p>

            </div>

          </div>


          <form
            onSubmit={
              handleSave
            }
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px"
              }}
            >


              {/* FULL NAME */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#374151"
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
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background:
                      editing
                        ? "#ffffff"
                        : "#f7f8f6",
                    outline: "none"
                  }}
                />

              </div>


              {/* GENDER */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#374151"
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
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background:
                      editing
                        ? "#ffffff"
                        : "#f7f8f6",
                    cursor:
                      editing
                        ? "pointer"
                        : "not-allowed"
                  }}
                >

                  <option value="">
                    Select Gender
                  </option>


                  <option value="Male">
                    Male
                  </option>


                  <option value="Female">
                    Female
                  </option>


                  <option value="Other">
                    Other
                  </option>


                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>

                </select>

              </div>


              {/* EMAIL */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#374151"
                  }}
                >
                  Email Address
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
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background: "#f1f3f1",
                    color: "#737b75"
                  }}
                />


                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#8a8f8a"
                  }}
                >
                  🔒 Email cannot be changed.
                </small>

              </div>


              {/* PHONE */}

              <div>

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#374151"
                  }}
                >
                  Phone Number
                </label>


                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
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
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background:
                      editing
                        ? "#ffffff"
                        : "#f7f8f6"
                  }}
                />

              </div>


              {/* ROLE */}

              <div
                style={{
                  gridColumn:
                    "1 / -1"
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "700",
                    color: "#374151"
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
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background: "#f1f3f1",
                    color: "#737b75"
                  }}
                />


                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#8a8f8a"
                  }}
                >
                  🔒 Your account role is controlled by DairyHub.
                </small>

              </div>

            </div>


            {/* PERSONAL SAVE BUTTONS */}

            {editing && (

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "25px",
                  flexWrap: "wrap"
                }}
              >

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    handleCancel
                  }
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1px solid #d2d8cf",
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "700"
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving ||
                    photoLoading
                  }
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    cursor:
                      saving ||
                      photoLoading
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "700"
                  }}
                >

                  {saving
                    ? "Saving..."
                    : "Save Profile"}

                </button>

              </div>

            )}

          </form>

        </section>


        {/* ===================================
            EDIT PROFILE BUTTON
        ==================================== */}

        {!editing && (

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "22px"
            }}
          >

            <button
              type="button"
              onClick={() =>
                setEditing(
                  true
                )
              }
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px"
              }}
            >
              ✏️ Edit Profile
            </button>

          </div>

        )}


        {/* ===================================
            DELIVERY ADDRESS
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)"
          }}
        >

          <div
            style={{
              marginBottom: "22px"
            }}
          >

            <h2
              style={{
                margin: "0 0 5px",
                fontSize: "22px",
                color: "#263238"
              }}
            >
              📍 Delivery Address
            </h2>


            <p
              style={{
                margin: "0",
                color: "#7a7a7a",
                fontSize: "14px"
              }}
            >
              Keep your delivery details ready for DairyHub orders.
            </p>

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px"
            }}
          >

            {/* ADDRESS */}

            <div
              style={{
                gridColumn:
                  "1 / -1"
              }}
            >

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#374151"
                }}
              >
                Address
              </label>


              <textarea
                rows="3"
                value={
                  address
                }
                disabled={
                  !editing
                }
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                placeholder="House number, street, area..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8ded5",
                  resize: "vertical",
                  background:
                    editing
                      ? "#ffffff"
                      : "#f7f8f6"
                }}
              />

            </div>


            {/* CITY */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#374151"
                }}
              >
                City
              </label>


              <input
                type="text"
                value={
                  city
                }
                disabled={
                  !editing
                }
                onChange={(e) =>
                  setCity(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8ded5",
                  background:
                    editing
                      ? "#ffffff"
                      : "#f7f8f6"
                }}
              />

            </div>


            {/* STATE */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#374151"
                }}
              >
                State
              </label>


              <input
                type="text"
                value={
                  state
                }
                disabled={
                  !editing
                }
                onChange={(e) =>
                  setState(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8ded5",
                  background:
                    editing
                      ? "#ffffff"
                      : "#f7f8f6"
                }}
              />

            </div>


            {/* PINCODE */}

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#374151"
                }}
              >
                Pincode
              </label>


              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="6-digit pincode"
                value={
                  pincode
                }
                disabled={
                  !editing
                }
                onChange={(e) =>
                  setPincode(
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        6
                      )
                  )
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d8ded5",
                  background:
                    editing
                      ? "#ffffff"
                      : "#f7f8f6"
                }}
              />

            </div>

          </div>

        </section>


        {/* ===================================
            ACCOUNT & SECURITY
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)"
          }}
        >

          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "22px",
              color: "#263238"
            }}
          >
            🔐 Account & Security
          </h2>


          <p
            style={{
              margin: "0 0 20px",
              color: "#7a7a7a",
              fontSize: "14px"
            }}
          >
            Manage your account security.
          </p>


          {/* CHANGE PASSWORD BUTTON */}

          <button
            type="button"
            onClick={() =>
              setPasswordOpen(
                previous =>
                  !previous
              )
            }
            style={{
              width: "100%",
              padding: "17px",
              borderRadius: "12px",
              border: "1px solid #e0e5dd",
              background: "#fafcf8",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "15px",
              fontWeight: "700"
            }}
          >

            <span>
              🔑 Change Password
            </span>


            <span>
              {passwordOpen
                ? "▲"
                : "→"}
            </span>

          </button>


          {/* PASSWORD FORM */}

          {passwordOpen && (

            <form
              onSubmit={
                handleChangePassword
              }
              style={{
                marginTop: "18px",
                padding: "20px",
                borderRadius: "12px",
                background: "#f8faf7",
                border: "1px solid #e2e8df"
              }}
            >

              <div
                style={{
                  display: "grid",
                  gap: "15px"
                }}
              >

                {/* CURRENT PASSWORD */}

                <input
                  type="password"
                  placeholder="Current password"
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background: "#ffffff"
                  }}
                />


                {/* NEW PASSWORD */}

                <input
                  type="password"
                  placeholder="New password (minimum 8 characters)"
                  value={
                    newPassword
                  }
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background: "#ffffff"
                  }}
                />


                {/* CONFIRM PASSWORD */}

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d8ded5",
                    background: "#ffffff"
                  }}
                />


                <button
                  type="submit"
                  disabled={
                    changingPassword
                  }
                  style={{
                    padding: "12px",
                    border: "none",
                    borderRadius: "10px",
                    cursor:
                      changingPassword
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "700"
                  }}
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>

              </div>

            </form>

          )}

        </section>


        {/* ===================================
            MY DAIRYHUB
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)"
          }}
        >

          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "22px",
              color: "#263238"
            }}
          >
            🥛 My DairyHub
          </h2>


          <p
            style={{
              margin: "0 0 20px",
              color: "#7a7a7a",
              fontSize: "14px"
            }}
          >
            Quickly access your DairyHub activity.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px"
            }}
          >

            {/* ORDERS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/orders"
                )
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e0e5dd",
                background: "#fafcf8",
                cursor: "pointer",
                textAlign: "left"
              }}
            >

              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "10px"
                }}
              >
                📦
              </div>


              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "16px"
                }}
              >
                My Orders
              </strong>


              <span
                style={{
                  color: "#7a7a7a",
                  fontSize: "13px"
                }}
              >
                View your previous and current orders.
              </span>

            </button>


            {/* SUBSCRIPTIONS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/my-subscriptions"
                )
              }
              style={{
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid #e0e5dd",
                background: "#fafcf8",
                cursor: "pointer",
                textAlign: "left"
              }}
            >

              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "10px"
                }}
              >
                🔄
              </div>


              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "16px"
                }}
              >
                My Subscriptions
              </strong>


              <span
                style={{
                  color: "#7a7a7a",
                  fontSize: "13px"
                }}
              >
                Manage your milk subscriptions.
              </span>

            </button>

          </div>

        </section>


        {/* ===================================
            ACCOUNT ACTIONS
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)"
          }}
        >

          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "22px",
              color: "#263238"
            }}
          >
            ⚙️ Account
          </h2>


          <p
            style={{
              margin: "0 0 20px",
              color: "#7a7a7a",
              fontSize: "14px"
            }}
          >
            Manage your DairyHub account.
          </p>


          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >

            {/* LOGOUT */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #d8ded5",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              🚪 Logout
            </button>


            {/* DELETE */}

            <button
              type="button"
              onClick={() =>
                setDeleteOpen(
                  true
                )
              }
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #efcaca",
                background: "#fff7f7",
                color: "#b42318",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              ⚠️ Delete My Account
            </button>

          </div>

        </section>

      </div>


      {/* =====================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {deleteOpen && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.2)"
            }}
          >

            <div
              style={{
                fontSize: "42px",
                marginBottom: "10px"
              }}
            >
              ⚠️
            </div>


            <h2
              style={{
                margin: "0 0 10px",
                color: "#263238"
              }}
            >
              Delete your account?
            </h2>


            <p
              style={{
                margin: "0 0 15px",
                color: "#666",
                lineHeight: "1.6"
              }}
            >
              Your account will be moved to the DairyHub
              Delete Bin and locked. It will remain there
              according to DairyHub's existing retention policy.
            </p>


            <p
              style={{
                margin: "0 0 24px",
                fontWeight: "700",
                color: "#b42318"
              }}
            >
              You will be logged out immediately.
            </p>


            <div
              style={{
                display: "flex",
                gap: "12px"
              }}
            >

              <button
                type="button"
                disabled={
                  deletingAccount
                }
                onClick={() =>
                  setDeleteOpen(
                    false
                  )
                }
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid #d8ded5",
                  background: "#ffffff",
                  cursor:
                    deletingAccount
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700"
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  deletingAccount
                }
                onClick={
                  handleDeleteAccount
                }
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#b42318",
                  color: "#ffffff",
                  cursor:
                    deletingAccount
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "700"
                }}
              >
                {deletingAccount
                  ? "Deleting..."
                  : "Yes, Delete Account"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Profile;