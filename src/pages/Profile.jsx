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
  // PAGE STATE
  // =========================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);


  // =========================================
  // PASSWORD
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


      return JSON.parse(savedUser);


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

    const loadProfile = async () => {

      const savedUser =
        getSavedUser();


      if (
        !savedUser ||
        !savedUser.token
      ) {

        navigate("/login");

        return;
      }


      try {

        setLoading(true);


        const response =
          await fetch(
            `${API_BASE}/api/users/me`,
            {
              method: "GET",

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


        let data = null;


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

          navigate("/login");

          return;
        }


        // ===================================
        // API ERROR
        // ===================================

        if (!response.ok) {

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
        // EMPTY RESPONSE
        // ===================================

        if (!data) {

          alert(
            "The server returned an empty profile."
          );

          return;
        }


        // ===================================
        // SET PROFILE
        // ===================================

        setProfile(data);


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
        // UPDATE LOCAL STORAGE
        // ===================================

        localStorage.setItem(
          "dairyhubUser",
          JSON.stringify({
            ...savedUser,
            ...data,
            token: savedUser.token
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

        setLoading(false);

      }
    };


    loadProfile();

  }, [navigate]);


  // =========================================
  // PHOTO CHANGE
  // =========================================

  const handlePhotoChange = (event) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !file.type.startsWith("image/")
    ) {

      alert(
        "Please select a valid image file."
      );

      return;
    }


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


    setPhotoLoading(true);


    const reader =
      new FileReader();


    reader.onload = () => {

      setProfilePhoto(
        reader.result
      );

      setPhotoLoading(false);
    };


    reader.onerror = () => {

      setPhotoLoading(false);

      alert(
        "Unable to read the selected image."
      );
    };


    reader.readAsDataURL(file);
  };


  // =========================================
  // REMOVE PHOTO
  // =========================================

  const removePhoto = () => {

    setProfilePhoto(null);
  };


  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave = async (event) => {

    event.preventDefault();


    const savedUser =
      getSavedUser();


    if (
      !savedUser ||
      !savedUser.token
    ) {

      alert(
        "Your session has expired. Please login again."
      );

      navigate("/login");

      return;
    }


    if (!name.trim()) {

      alert(
        "Full name cannot be empty."
      );

      return;
    }


    if (!gender) {

      alert(
        "Please select your gender."
      );

      return;
    }


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

      setSaving(true);


      const response =
        await fetch(
          `${API_BASE}/api/users/me`,
          {
            method: "PUT",

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


      let data = null;


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

        navigate("/login");

        return;
      }


      // ===================================
      // UPDATE FAILURE
      // ===================================

      if (!response.ok) {

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
      // UPDATE PROFILE
      // ===================================

      setProfile(data);


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


      setEditing(false);


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

      setSaving(false);
    }
  };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const handleCancel = () => {

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

    setEditing(false);
  };


  // =========================================
  // CHANGE PASSWORD
  // =========================================

  const handleChangePassword =
    async (event) => {

      event.preventDefault();


      const savedUser =
        getSavedUser();


      if (
        !savedUser ||
        !savedUser.token
      ) {

        localStorage.removeItem(
          "dairyhubUser"
        );

        navigate("/login");

        return;
      }


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

        setChangingPassword(true);


        const response =
          await fetch(
            `${API_BASE}/api/users/me/password`,
            {
              method: "PUT",

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


        let data = null;


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : null;

        } catch {

          data = null;
        }


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

          navigate("/login");

          return;
        }


        if (!response.ok) {

          alert(
            data?.message ||
            "Unable to change password."
          );

          return;
        }


        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setPasswordOpen(false);


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

        setChangingPassword(false);
      }
    };


  // =========================================
  // DELETE ACCOUNT
  // =========================================

  const handleDeleteAccount =
    async () => {

      const savedUser =
        getSavedUser();


      if (
        !savedUser ||
        !savedUser.token
      ) {

        localStorage.removeItem(
          "dairyhubUser"
        );

        navigate("/login");

        return;
      }


      try {

        setDeletingAccount(true);


        const response =
          await fetch(
            `${API_BASE}/api/users/me`,
            {
              method: "DELETE",

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


        let data = null;


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : null;

        } catch {

          data = null;
        }


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

          navigate("/login");

          return;
        }


        if (!response.ok) {

          alert(
            data?.message ||
            "Unable to delete your account."
          );

          return;
        }


        localStorage.removeItem(
          "dairyhubUser"
        );


        alert(
          data?.message ||
          "Your account has been moved to the Delete Bin."
        );


        window.location.href = "/";


      } catch (error) {

        console.error(
          "DELETE ACCOUNT ERROR:",
          error
        );

        alert(
          `Unable to delete your account.\n\nError: ${error.message}`
        );


      } finally {

        setDeletingAccount(false);

        setDeleteOpen(false);
      }
    };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );

    window.location.href = "/";
  };


  // =========================================
  // BACK TO MAIN HOME PAGE
  // =========================================

  const handleBack = () => {

    navigate("/");
  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9f4",
          padding: "30px"
        }}
      >

        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "18px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)"
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

  if (!profile) {

    return (

      <div
        style={{
          minHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9f4",
          padding: "30px"
        }}
      >

        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "18px",
            textAlign: "center"
          }}
        >

          <h3>
            Profile unavailable
          </h3>


          <button
            type="button"
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
    ).toUpperCase() === "ADMIN";


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

      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto"
        }}
      >

        {/* ===================================
            HEADER
        ==================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "25px"
          }}
        >

          <div>

            <p
              style={{
                margin: "0 0 6px",
                color: "#6b8e23",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "1px"
              }}
            >
              DAIRYHUB ACCOUNT
            </p>


            <h1
              style={{
                margin: "0",
                color: "#263238",
                fontSize: "34px"
              }}
            >
              {isAdmin
                ? "Admin Profile"
                : "My Profile"}
            </h1>


            <p
              style={{
                margin: "8px 0 0",
                color: "#6b7280"
              }}
            >
              {isAdmin
                ? "Manage your DairyHub administrator account."
                : "Manage your DairyHub personal information and account."}
            </p>

          </div>


          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border: "1px solid #d7ded0",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: "700"
            }}
          >
            ← Home
          </button>

        </div>


        {/* ===================================
            PROFILE HEADER CARD
        ==================================== */}

        <section
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "22px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap"
          }}
        >

          {/* PHOTO */}

          <div>

            <div
              style={{
                width: "125px",
                height: "125px",
                borderRadius: "50%",
                overflow: "hidden",
                background: "#edf6e5",
                border: "4px solid #ffffff",
                boxShadow:
                  "0 4px 18px rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >

              {profilePhoto ? (

                <img
                  src={profilePhoto}
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
                    fontSize: "55px"
                  }}
                >
                  👤
                </span>

              )}

            </div>

          </div>


          {/* SUMMARY */}

          <div
            style={{
              flex: 1,
              minWidth: "230px"
            }}
          >

            <h2
              style={{
                margin: "0 0 6px",
                color: "#263238",
                fontSize: "27px"
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
                padding: "7px 14px",
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


          {/* PHOTO CONTROL */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            <label
              style={{
                padding: "10px 15px",
                borderRadius: "9px",
                background:
                  editing
                    ? "#f3f7ef"
                    : "#f2f2f2",
                border:
                  "1px solid #d8e2cf",
                cursor:
                  editing
                    ? "pointer"
                    : "not-allowed",
                fontWeight: "700",
                color:
                  editing
                    ? "#55751d"
                    : "#999"
              }}
            >

              📷 Change Photo

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


            {profilePhoto &&
              editing && (

                <button
                  type="button"
                  onClick={
                    removePhoto
                  }
                  style={{
                    padding: "10px 15px",
                    borderRadius: "9px",
                    background: "#fff5f5",
                    border:
                      "1px solid #efcaca",
                    color: "#b42318",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                >
                  Remove Photo
                </button>

              )}

          </div>

        </section>


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
              Personal Information
            </h2>


            <p
              style={{
                margin: "0",
                color: "#7a7a7a",
                fontSize: "14px"
              }}
            >
              Your DairyHub account information.
            </p>

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

              {/* NAME */}

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
                  value={name}
                  disabled={!editing}
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
                    border:
                      "1px solid #d8ded5",
                    background:
                      editing
                        ? "#ffffff"
                        : "#f7f8f6"
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
                  value={gender}
                  disabled={!editing}
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
                    border:
                      "1px solid #d8ded5",
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
                    border:
                      "1px solid #d8ded5",
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
                  value={phone}
                  placeholder="+91 XXXXXXXXXX"
                  disabled={!editing}
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
                    border:
                      "1px solid #d8ded5",
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
                    border:
                      "1px solid #d8ded5",
                    background: "#f1f3f1",
                    color: "#737b75"
                  }}
                />

              </div>

            </div>


            {/* SAVE / CANCEL */}

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
                  disabled={saving}
                  onClick={
                    handleCancel
                  }
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d2d8cf",
                    background: "#ffffff",
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
            EDIT BUTTON
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
                setEditing(true)
              }
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              ✏️ Edit Profile
            </button>

          </div>

        )}


        {/* ===================================
            CUSTOMER ONLY
        ==================================== */}

        {!isAdmin && (

          <>

            {/* DELIVERY ADDRESS */}

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
                📍 Delivery Address
              </h2>


              <p
                style={{
                  margin: "0 0 22px",
                  color: "#7a7a7a",
                  fontSize: "14px"
                }}
              >
                Your saved delivery information.
              </p>


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
                      fontWeight: "700"
                    }}
                  >
                    Address
                  </label>


                  <textarea
                    rows="3"
                    value={address}
                    disabled={!editing}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    placeholder="House number, street, area..."
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "13px 14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #d8ded5",
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
                      fontWeight: "700"
                    }}
                  >
                    City
                  </label>


                  <input
                    type="text"
                    value={city}
                    disabled={!editing}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "13px 14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #d8ded5",
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
                      fontWeight: "700"
                    }}
                  >
                    State
                  </label>


                  <input
                    type="text"
                    value={state}
                    disabled={!editing}
                    onChange={(e) =>
                      setState(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "13px 14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #d8ded5",
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
                      fontWeight: "700"
                    }}
                  >
                    Pincode
                  </label>


                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={pincode}
                    disabled={!editing}
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
                    placeholder="6-digit pincode"
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      padding: "13px 14px",
                      borderRadius: "10px",
                      border:
                        "1px solid #d8ded5",
                      background:
                        editing
                          ? "#ffffff"
                          : "#f7f8f6"
                    }}
                  />

                </div>

              </div>

            </section>


            {/* MY DAIRYHUB */}

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

                <button
                  type="button"
                  onClick={() =>
                    navigate("/orders")
                  }
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    border:
                      "1px solid #e0e5dd",
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


                  <strong>
                    My Orders
                  </strong>


                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color: "#7a7a7a",
                      fontSize: "13px"
                    }}
                  >
                    View your orders.
                  </p>

                </button>


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
                    border:
                      "1px solid #e0e5dd",
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


                  <strong>
                    My Subscriptions
                  </strong>


                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      color: "#7a7a7a",
                      fontSize: "13px"
                    }}
                  >
                    Manage milk subscriptions.
                  </p>

                </button>

              </div>

            </section>

          </>

        )}


        {/* ===================================
            SECURITY
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
              border:
                "1px solid #e0e5dd",
              background: "#fafcf8",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
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
                border:
                  "1px solid #e2e8df"
              }}
            >

              <div
                style={{
                  display: "grid",
                  gap: "15px"
                }}
              >

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
                    boxSizing:
                      "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d8ded5"
                  }}
                />


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
                    boxSizing:
                      "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d8ded5"
                  }}
                />


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
                    boxSizing:
                      "border-box",
                    padding: "13px 14px",
                    borderRadius: "10px",
                    border:
                      "1px solid #d8ded5"
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
            ADMIN ONLY
        ==================================== */}

        {isAdmin && (

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
              🛠️ Administration
            </h2>


            <p
              style={{
                margin: "0 0 20px",
                color: "#7a7a7a",
                fontSize: "14px"
              }}
            >
              Manage DairyHub from the administrator area.
            </p>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px"
              }}
            >

              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid #e0e5dd",
                  background: "#fafcf8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: "700"
                }}
              >
                🏠 Admin Dashboard
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/users"
                  )
                }
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid #e0e5dd",
                  background: "#fafcf8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: "700"
                }}
              >
                👥 Manage Users
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/products"
                  )
                }
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid #e0e5dd",
                  background: "#fafcf8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: "700"
                }}
              >
                🥛 Manage Products
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid #e0e5dd",
                  background: "#fafcf8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: "700"
                }}
              >
                📦 Manage Orders
              </button>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/subscriptions"
                  )
                }
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    "1px solid #e0e5dd",
                  background: "#fafcf8",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: "700"
                }}
              >
                🔄 Manage Subscriptions
              </button>

            </div>

          </section>

        )}


        {/* ===================================
            CUSTOMER ACCOUNT ACTIONS
        ==================================== */}

        {!isAdmin && (

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
                  border:
                    "1px solid #d8ded5",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "700"
                }}
              >
                🚪 Logout
              </button>


              <button
                type="button"
                onClick={() =>
                  setDeleteOpen(true)
                }
                style={{
                  flex: 1,
                  minWidth: "180px",
                  padding: "13px",
                  borderRadius: "10px",
                  border:
                    "1px solid #efcaca",
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

        )}


        {/* ===================================
            ADMIN ACCOUNT ACTIONS
        ==================================== */}

        {isAdmin && (

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
              Manage your administrator session.
            </p>


            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border:
                  "1px solid #d8ded5",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              🚪 Logout
            </button>

          </section>

        )}

      </div>


      {/* =====================================
          DELETE CONFIRMATION
      ====================================== */}

      {deleteOpen && !isAdmin && (

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
                margin: "0 0 10px"
              }}
            >
              Delete your account?
            </h2>


            <p
              style={{
                color: "#666",
                lineHeight: "1.6",
                margin: "0 0 22px"
              }}
            >
              Your account will be moved to the DairyHub
              Delete Bin and locked.
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
                  setDeleteOpen(false)
                }
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  border:
                    "1px solid #d8ded5",
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