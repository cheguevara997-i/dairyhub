import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE =
  "https://dairyhub-backend.onrender.com";


const API_URL =
  `${API_BASE}/api/users`;


const PROTECTED_ADMIN_EMAIL =
  "admin@dairyhub.com";


function ManageUsers() {

  // =========================================
  // ACTIVE USERS
  // =========================================

  const [users, setUsers] =
    useState([]);


  // =========================================
  // DELETED USERS / DELETE BIN
  // =========================================

  const [deletedUsers, setDeletedUsers] =
    useState([]);


  // =========================================
  // SEARCH
  // =========================================

  const [searchText, setSearchText] =
    useState("");


  // =========================================
  // ROLE FILTER
  // =========================================

  const [roleFilter, setRoleFilter] =
    useState("ALL");


  // =========================================
  // CURRENT SECTION
  // =========================================

  const [activeSection, setActiveSection] =
    useState("ACTIVE");


  // =========================================
  // VIEW USER
  // =========================================

  const [selectedUser, setSelectedUser] =
    useState(null);


  // =========================================
  // EDIT USER
  // =========================================

  const [editingUser, setEditingUser] =
    useState(null);


  const [editForm, setEditForm] =
    useState({

      name: "",

      phone: "",

      role: "CUSTOMER"

    });


  // =========================================
  // LOADING
  // =========================================

  const [loading, setLoading] =
    useState(true);


  // =========================================
  // PROCESSING USER
  // =========================================

  const [processingUserId, setProcessingUserId] =
    useState(null);


  // =========================================
  // GET LOGGED-IN USER
  // =========================================

  const getLoggedInUser = () => {

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
        "Unable to read dairyhubUser:",
        error
      );


      return null;

    }

  };


  // =========================================
  // GET AUTH TOKEN
  // =========================================

  const getAuthToken = () => {

    const user =
      getLoggedInUser();


    if (!user) {

      return null;

    }


    return user.token || null;

  };


  // =========================================
  // AUTHORIZATION HEADERS
  // =========================================

  const getAuthHeaders = () => {

    const token =
      getAuthToken();


    return {

      "Content-Type":
        "application/json",

      "Accept":
        "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {})

    };

  };


  // =========================================
  // CHECK PROTECTED ADMIN
  // =========================================

  const isProtectedAdmin = (
    user
  ) => {

    return (

      String(
        user?.email || ""
      )
        .trim()
        .toLowerCase() ===
      PROTECTED_ADMIN_EMAIL

    );

  };


  // =========================================
  // CHECK CURRENT ADMIN SESSION
  // =========================================

  const ensureAdminSession = () => {

    const user =
      getLoggedInUser();


    if (!user) {

      return false;

    }


    const role =
      String(
        user.role || ""
      )
        .trim()
        .toUpperCase();


    if (
      role !== "ADMIN"
    ) {

      return false;

    }


    if (
      !user.token
    ) {

      return false;

    }


    return true;

  };


  // =========================================
  // HANDLE AUTHORIZATION ERROR
  // =========================================

  const handleAuthorizationError = (
    response
  ) => {

    return (
      response.status === 401 ||
      response.status === 403
    );

  };


  // =========================================
  // HANDLE INVALID ADMIN SESSION
  // =========================================

  const handleSessionFailure = () => {

    localStorage.removeItem(
      "dairyhubUser"
    );


    alert(
      "Your admin session is invalid or expired. Please login again."
    );


    window.location.href =
      "/login";

  };


  // =========================================
  // LOAD ACTIVE USERS
  // =========================================

  const loadActiveUsers =
    async () => {

      const response =
        await fetch(
          `${API_URL}/active`,
          {

            method:
              "GET",

            headers:
              getAuthHeaders()

          }
        );


      if (
        !response.ok
      ) {

        if (
          handleAuthorizationError(
            response
          )
        ) {

          handleSessionFailure();

          throw new Error(
            "Admin authorization failed."
          );

        }


        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Failed to load active users."
        );

      }


      const data =
        await response.json();


      setUsers(
        Array.isArray(data)
          ? data
          : []
      );

    };


  // =========================================
  // LOAD DELETE BIN
  // =========================================

  const loadDeletedUsers =
    async () => {

      const response =
        await fetch(
          `${API_URL}/deleted`,
          {

            method:
              "GET",

            headers:
              getAuthHeaders()

          }
        );


      if (
        !response.ok
      ) {

        if (
          handleAuthorizationError(
            response
          )
        ) {

          handleSessionFailure();

          throw new Error(
            "Admin authorization failed."
          );

        }


        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          "Failed to load deleted users."
        );

      }


      const data =
        await response.json();


      setDeletedUsers(
        Array.isArray(data)
          ? data
          : []
      );

    };


  // =========================================
  // LOAD USERS
  // =========================================

  const loadUsers =
    async () => {

      try {

        setLoading(true);


        if (
          !ensureAdminSession()
        ) {

          handleSessionFailure();

          return;

        }


        await Promise.all([

          loadActiveUsers(),

          loadDeletedUsers()

        ]);


      } catch (error) {

        console.error(
          "Error loading users:",
          error
        );


        if (
          error.message !==
          "Admin authorization failed."
        ) {

          alert(
            error.message ||
            "Failed to load users."
          );

        }

      } finally {

        setLoading(false);

      }

    };


  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadUsers();

  }, []);


  // =========================================
  // MOVE USER TO DELETE BIN
  // =========================================

  const deleteUser =
    async (
      user
    ) => {

      if (
        isProtectedAdmin(user)
      ) {

        alert(
          "The original DairyHub admin account cannot be deleted or locked."
        );

        return;

      }


      const confirmed =
        window.confirm(

          `Move ${user.name} to the Delete Bin?\n\n` +

          "The account will be locked immediately.\n\n" +

          "The customer's data will be preserved for 30 days."

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingUserId(
          user.id
        );


        const response =
          await fetch(
            `${API_URL}/${user.id}`,
            {

              method:
                "DELETE",

              headers:
                getAuthHeaders()

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Unable to move user to Delete Bin."
          );

        }


        setUsers(
          previousUsers =>
            previousUsers.filter(
              item =>
                item.id !==
                user.id
            )
        );


        await loadDeletedUsers();


        alert(
          `${user.name} has been moved to the Delete Bin.`
        );


      } catch (error) {

        console.error(
          "Delete user error:",
          error
        );


        alert(
          error.message ||
          "Unable to move user to Delete Bin."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // RESTORE USER
  // =========================================

  const restoreUser =
    async (
      user
    ) => {

      const confirmed =
        window.confirm(

          `Restore ${user.name}'s account?\n\n` +

          "The customer will be able to login and use DairyHub again."

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingUserId(
          user.id
        );


        const response =
          await fetch(
            `${API_URL}/${user.id}/restore`,
            {

              method:
                "POST",

              headers:
                getAuthHeaders()

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Unable to restore user."
          );

        }


        setDeletedUsers(
          previousUsers =>
            previousUsers.filter(
              item =>
                item.id !==
                user.id
            )
        );


        await loadActiveUsers();


        alert(
          `${user.name}'s account has been restored successfully.`
        );


      } catch (error) {

        console.error(
          "Restore user error:",
          error
        );


        alert(
          error.message ||
          "Unable to restore user."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // PERMANENT DELETE
  // =========================================

  const permanentlyDeleteUser =
    async (
      user
    ) => {

      const confirmed =
        window.confirm(

          `PERMANENTLY DELETE ${user.name}?\n\n` +

          "WARNING: This permanently removes the account from the database.\n\n" +

          "This action cannot be undone.\n\n" +

          "After deletion, the email can be used to create a new account."

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingUserId(
          user.id
        );


        const response =
          await fetch(
            `${API_URL}/${user.id}/permanent`,
            {

              method:
                "DELETE",

              headers:
                getAuthHeaders()

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Unable to permanently delete user."
          );

        }


        setDeletedUsers(
          previousUsers =>
            previousUsers.filter(
              item =>
                item.id !==
                user.id
            )
        );


        alert(
          `${user.name} has been permanently deleted.`
        );


      } catch (error) {

        console.error(
          "Permanent delete error:",
          error
        );


        alert(
          error.message ||
          "Unable to permanently delete user."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // OPEN EDIT
  // =========================================

  const openEdit = (
    user
  ) => {

    setEditingUser(
      user
    );


    setEditForm({

      name:
        user.name || "",

      phone:
        user.phone || "",

      role:
        user.role || "CUSTOMER"

    });

  };


  // =========================================
  // SAVE EDIT
  // =========================================

  const saveEdit =
    async (
      e
    ) => {

      e.preventDefault();


      if (
        !editForm.name.trim()
      ) {

        alert(
          "Name is required."
        );

        return;

      }


      if (

        isProtectedAdmin(
          editingUser
        ) &&

        editForm.role !==
        "ADMIN"

      ) {

        alert(
          "The original DairyHub admin cannot be demoted."
        );

        return;

      }


      try {

        setProcessingUserId(
          editingUser.id
        );


        const response =
          await fetch(
            `${API_URL}/${editingUser.id}`,
            {

              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({

                  name:
                    editForm.name.trim(),

                  phone:
                    editForm.phone.trim() ||
                    null,

                  role:
                    editForm.role

                })

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Update failed."
          );

        }


        const updatedUser =
          JSON.parse(
            responseText
          );


        setUsers(
          previousUsers =>
            previousUsers.map(
              item =>
                item.id ===
                updatedUser.id
                  ? updatedUser
                  : item
            )
        );


        setEditingUser(
          null
        );


        alert(
          "User updated successfully."
        );


      } catch (error) {

        console.error(
          "Update user error:",
          error
        );


        alert(
          error.message ||
          "Failed to update user."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // MAKE ADMIN
  // =========================================

  const makeAdmin =
    async (
      user
    ) => {

      if (
        isProtectedAdmin(
          user
        )
      ) {

        return;

      }


      const confirmed =
        window.confirm(

          `Make ${user.name} an ADMIN?\n\n` +

          "This user will receive access to the DairyHub Admin Dashboard."

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingUserId(
          user.id
        );


        const response =
          await fetch(
            `${API_URL}/${user.id}`,
            {

              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({

                  name:
                    user.name || "",

                  phone:
                    user.phone || null,

                  role:
                    "ADMIN"

                })

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Unable to make user admin."
          );

        }


        const updatedUser =
          JSON.parse(
            responseText
          );


        setUsers(
          previousUsers =>
            previousUsers.map(
              item =>
                item.id ===
                updatedUser.id
                  ? updatedUser
                  : item
            )
        );


        alert(
          `${user.name} is now an ADMIN.`
        );


      } catch (error) {

        console.error(
          "Make admin error:",
          error
        );


        alert(
          error.message ||
          "Unable to make this user an admin."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // REMOVE ADMIN
  // =========================================

  const removeAdmin =
    async (
      user
    ) => {

      if (
        isProtectedAdmin(
          user
        )
      ) {

        alert(
          "The original DairyHub admin account is protected."
        );

        return;

      }


      const role =
        String(
          user.role || ""
        )
          .trim()
          .toUpperCase();


      if (
        role !==
        "ADMIN"
      ) {

        return;

      }


      const confirmed =
        window.confirm(

          `Remove ADMIN access from ${user.name}?\n\n` +

          "They will become a CUSTOMER again."

        );


      if (
        !confirmed
      ) {

        return;

      }


      try {

        setProcessingUserId(
          user.id
        );


        const response =
          await fetch(
            `${API_URL}/${user.id}`,
            {

              method:
                "PUT",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify({

                  name:
                    user.name || "",

                  phone:
                    user.phone || null,

                  role:
                    "CUSTOMER"

                })

            }
          );


        const responseText =
          await response.text();


        if (
          !response.ok
        ) {

          if (
            handleAuthorizationError(
              response
            )
          ) {

            handleSessionFailure();

            return;

          }


          throw new Error(
            responseText ||
            "Unable to remove admin access."
          );

        }


        const updatedUser =
          JSON.parse(
            responseText
          );


        setUsers(
          previousUsers =>
            previousUsers.map(
              item =>
                item.id ===
                updatedUser.id
                  ? updatedUser
                  : item
            )
        );


        alert(
          `${user.name} is now a CUSTOMER again.`
        );


      } catch (error) {

        console.error(
          "Remove admin error:",
          error
        );


        alert(
          error.message ||
          "Unable to remove admin access."
        );


      } finally {

        setProcessingUserId(
          null
        );

      }

    };


  // =========================================
  // FILTER USERS
  // =========================================

  const filterUsers =
    (
      userList
    ) => {

      return userList.filter(
        user => {

          const search =
            searchText
              .toLowerCase()
              .trim();


          const userName =
            user.name
              ?.toLowerCase() ||
            "";


          const userEmail =
            user.email
              ?.toLowerCase() ||
            "";


          const userPhone =
            String(
              user.phone || ""
            )
              .toLowerCase();


          const matchesSearch =
            !search ||

            userName.includes(
              search
            ) ||

            userEmail.includes(
              search
            ) ||

            userPhone.includes(
              search
            );


          const normalizedRole =
            String(
              user.role || ""
            )
              .trim()
              .toUpperCase();


          const matchesRole =
            roleFilter === "ALL" ||

            normalizedRole ===
            roleFilter;


          return (
            matchesSearch &&
            matchesRole
          );

        }
      );

    };


  const filteredActiveUsers =
    filterUsers(
      users
    );


  const filteredDeletedUsers =
    filterUsers(
      deletedUsers
    );


  // =========================================
  // FORMAT DELETED DATE
  // =========================================

  const formatDeletedDate =
    (
      deletedAt
    ) => {

      if (
        !deletedAt
      ) {

        return "Unknown";

      }


      const date =
        new Date(
          deletedAt
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "Unknown";

      }


      return date.toLocaleString();

    };


  // =========================================
  // DAYS REMAINING
  // =========================================

  const getDaysRemaining =
    (
      deletedAt
    ) => {

      if (
        !deletedAt
      ) {

        return "Unknown";

      }


      const deletedDate =
        new Date(
          deletedAt
        );


      const expiryDate =
        new Date(
          deletedDate
        );


      expiryDate.setDate(
        expiryDate.getDate() +
        30
      );


      const difference =
        expiryDate.getTime() -
        Date.now();


      const days =
        Math.ceil(
          difference /
          (
            1000 *
            60 *
            60 *
            24
          )
        );


      return Math.max(
        0,
        days
      );

    };


  // =========================================
  // LOADING
  // =========================================

  if (
    loading
  ) {

    return (

      <div
        className="manage-users-page"
      >

        <div
          className="manage-users-container"
        >

          <Link
            to="/admin"
            className="back-admin-button"
          >
            ← Back to Admin Dashboard
          </Link>


          <h1>
            Manage Users
          </h1>


          <p
            className="users-loading"
          >
            Loading users...
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div
      className="manage-users-page"
    >

      <div
        className="manage-users-container"
      >

        {/* ===================================
            BACK
        ==================================== */}

        <Link
          to="/admin"
          className="back-admin-button"
        >
          ← Back to Admin Dashboard
        </Link>


        {/* ===================================
            HEADER
        ==================================== */}

        <div
          className="manage-users-heading"
        >

          <div>

            <h1>
              Manage Users
            </h1>


            <p>
              Manage active accounts and
              deleted accounts.
            </p>

          </div>


          <div
            className="user-count"
          >

            {activeSection ===
            "ACTIVE"
              ? "Active Users"
              : "Delete Bin"
            }


            <strong>
              {activeSection ===
              "ACTIVE"
                ? users.length
                : deletedUsers.length
              }
            </strong>

          </div>

        </div>


        {/* ===================================
            SECTION TABS
        ==================================== */}

        <div
          className="user-section-tabs"
        >

          <button
            type="button"
            className={
              activeSection ===
              "ACTIVE"
                ? "user-section-tab active"
                : "user-section-tab"
            }
            onClick={() =>
              setActiveSection(
                "ACTIVE"
              )
            }
          >

            👥 Active Users

            <span>
              {users.length}
            </span>

          </button>


          <button
            type="button"
            className={
              activeSection ===
              "DELETED"
                ? "user-section-tab deleted active"
                : "user-section-tab deleted"
            }
            onClick={() =>
              setActiveSection(
                "DELETED"
              )
            }
          >

            🗑 Delete Bin

            <span>
              {deletedUsers.length}
            </span>

          </button>

        </div>


        {/* ===================================
            SEARCH + FILTER
        ==================================== */}

        <div
          className="user-controls"
        >

          <div
            className="user-search-box"
          >

            <span>
              🔍
            </span>


            <input
              type="text"
              placeholder={
                activeSection ===
                "ACTIVE"
                  ? "Search active users..."
                  : "Search deleted users..."
              }
              value={
                searchText
              }
              onChange={
                (e) =>
                  setSearchText(
                    e.target.value
                  )
              }
            />


            {searchText && (

              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchText("")
                }
              >
                ×
              </button>

            )}

          </div>


          <select
            value={
              roleFilter
            }
            onChange={
              (e) =>
                setRoleFilter(
                  e.target.value
                )
            }
            className="role-filter"
          >

            <option value="ALL">
              All Roles
            </option>


            <option value="CUSTOMER">
              Customers
            </option>


            <option value="ADMIN">
              Admins
            </option>

          </select>

        </div>


        {/* ===================================
            ACTIVE USERS
        ==================================== */}

        {activeSection ===
          "ACTIVE" && (

          <div
            className="users-table-wrapper"
          >

            <table
              className="users-table"
            >

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredActiveUsers.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="no-users"
                    >
                      No active users found.
                    </td>

                  </tr>

                ) : (

                  filteredActiveUsers.map(
                    user => {

                      const normalizedRole =
                        String(
                          user.role || ""
                        )
                          .trim()
                          .toUpperCase();


                      const isAdmin =
                        normalizedRole ===
                        "ADMIN";


                      const protectedAdmin =
                        isProtectedAdmin(
                          user
                        );


                      const isProcessing =
                        processingUserId ===
                        user.id;


                      return (

                        <tr
                          key={
                            user.id
                          }
                        >

                          <td>
                            {user.id}
                          </td>


                          <td
                            className="user-name"
                          >
                            {user.name}
                          </td>


                          <td>
                            {user.email}
                          </td>


                          <td>
                            {user.phone ||
                              "N/A"}
                          </td>


                          <td>

                            <span
                              className={
                                isAdmin
                                  ? "role-badge admin"
                                  : "role-badge customer"
                              }
                            >

                              {isAdmin
                                ? "ADMIN"
                                : "CUSTOMER"
                              }

                            </span>

                          </td>


                          <td>

                            {protectedAdmin ? (

                              <span
                                className="protected-user"
                              >
                                🔒 Protected
                              </span>

                            ) : (

                              <div
                                className="user-actions"
                              >

                                <button
                                  type="button"
                                  className="view-user-button"
                                  onClick={() =>
                                    setSelectedUser(
                                      user
                                    )
                                  }
                                >
                                  👁 View
                                </button>


                                <button
                                  type="button"
                                  className="edit-user-button"
                                  onClick={() =>
                                    openEdit(
                                      user
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                >
                                  ✏️ Edit
                                </button>


                                {isAdmin ? (

                                  <button
                                    type="button"
                                    className="remove-admin-button"
                                    onClick={() =>
                                      removeAdmin(
                                        user
                                      )
                                    }
                                    disabled={
                                      isProcessing
                                    }
                                  >

                                    {isProcessing
                                      ? "Updating..."
                                      : "↩ Remove Admin"
                                    }

                                  </button>

                                ) : (

                                  <button
                                    type="button"
                                    className="make-admin-button"
                                    onClick={() =>
                                      makeAdmin(
                                        user
                                      )
                                    }
                                    disabled={
                                      isProcessing
                                    }
                                  >

                                    {isProcessing
                                      ? "Promoting..."
                                      : "👑 Make Admin"
                                    }

                                  </button>

                                )}


                                <button
                                  type="button"
                                  className="delete-user-button"
                                  onClick={() =>
                                    deleteUser(
                                      user
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                >

                                  {isProcessing
                                    ? "Moving..."
                                    : "🗑 Delete"
                                  }

                                </button>

                              </div>

                            )}

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        )}


        {/* ===================================
            DELETE BIN
        ==================================== */}

        {activeSection ===
          "DELETED" && (

          <div
            className="delete-bin-container"
          >

            <div
              className="delete-bin-info"
            >

              <div>

                <h2>
                  🗑️ Delete Bin
                </h2>


                <p>

                  Deleted accounts are kept for

                  <strong>
                    {" "}30 days
                  </strong>

                  {" "}
                  before automatic permanent deletion.

                </p>

              </div>


              <div
                className="delete-bin-warning"
              >
                🔒 Accounts in the Delete Bin
                cannot login.
              </div>

            </div>


            <div
              className="users-table-wrapper"
            >

              <table
                className="users-table delete-bin-table"
              >

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Deleted At
                    </th>

                    <th>
                      Days Left
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDeletedUsers.length ===
                  0 ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="no-users"
                      >

                        🗑️ Delete Bin is empty.

                      </td>

                    </tr>

                  ) : (

                    filteredDeletedUsers.map(
                      user => {

                        const isProcessing =
                          processingUserId ===
                          user.id;


                        return (

                          <tr
                            key={
                              user.id
                            }
                          >

                            <td>
                              {user.id}
                            </td>


                            <td
                              className="user-name"
                            >
                              {user.name}
                            </td>


                            <td>
                              {user.email}
                            </td>


                            <td>
                              {formatDeletedDate(
                                user.deletedAt
                              )}
                            </td>


                            <td>

                              <span
                                className="delete-days-badge"
                              >

                                {getDaysRemaining(
                                  user.deletedAt
                                )}

                                {" "}
                                days

                              </span>

                            </td>


                            <td>

                              <div
                                className="user-actions"
                              >

                                <button
                                  type="button"
                                  className="view-user-button"
                                  onClick={() =>
                                    setSelectedUser(
                                      user
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                >
                                  👁 View
                                </button>


                                <button
                                  type="button"
                                  className="restore-user-button"
                                  onClick={() =>
                                    restoreUser(
                                      user
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                >

                                  {isProcessing
                                    ? "Restoring..."
                                    : "♻ Restore"
                                  }

                                </button>


                                <button
                                  type="button"
                                  className="permanent-delete-user-button"
                                  onClick={() =>
                                    permanentlyDeleteUser(
                                      user
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                >
                                  🗑 Permanently Delete
                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* ===================================
            VIEW USER MODAL
        ==================================== */}

        {selectedUser && (

          <div
            className="user-modal-overlay"
            onClick={() =>
              setSelectedUser(
                null
              )
            }
          >

            <div
              className="user-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className="modal-header"
              >

                <h2>
                  👤 User Details
                </h2>


                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setSelectedUser(
                      null
                    )
                  }
                >
                  ×
                </button>

              </div>


              <div
                className="user-details"
              >

                <div
                  className="detail-row"
                >

                  <span>
                    ID
                  </span>

                  <strong>
                    {selectedUser.id}
                  </strong>

                </div>


                <div
                  className="detail-row"
                >

                  <span>
                    Name
                  </span>

                  <strong>
                    {selectedUser.name}
                  </strong>

                </div>


                <div
                  className="detail-row"
                >

                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedUser.email}
                  </strong>

                </div>


                <div
                  className="detail-row"
                >

                  <span>
                    Phone
                  </span>

                  <strong>
                    {selectedUser.phone ||
                      "N/A"}
                  </strong>

                </div>


                <div
                  className="detail-row"
                >

                  <span>
                    Role
                  </span>

                  <strong>
                    {selectedUser.role}
                  </strong>

                </div>


                <div
                  className="detail-row"
                >

                  <span>
                    Account Status
                  </span>

                  <strong>

                    {selectedUser.deleted
                      ? "🔒 Deleted / Locked"
                      : "✅ Active"
                    }

                  </strong>

                </div>


                {selectedUser.deleted && (

                  <>

                    <div
                      className="detail-row"
                    >

                      <span>
                        Deleted At
                      </span>

                      <strong>
                        {formatDeletedDate(
                          selectedUser.deletedAt
                        )}
                      </strong>

                    </div>


                    <div
                      className="detail-row"
                    >

                      <span>
                        Delete Bin Time Left
                      </span>

                      <strong>
                        {getDaysRemaining(
                          selectedUser.deletedAt
                        )}{" "}
                        days
                      </strong>

                    </div>

                  </>

                )}


                <div
                  className="detail-row"
                >

                  <span>
                    Admin Type
                  </span>

                  <strong>

                    {isProtectedAdmin(
                      selectedUser
                    )

                      ? "Protected Admin"

                      : String(
                          selectedUser.role ||
                          ""
                        )
                          .trim()
                          .toUpperCase() ===
                        "ADMIN"

                        ? "Promoted Admin"

                        : "Customer"

                    }

                  </strong>

                </div>

              </div>


              <button
                type="button"
                className="modal-ok-button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        )}


        {/* ===================================
            EDIT USER MODAL
        ==================================== */}

        {editingUser && (

          <div
            className="user-modal-overlay"
            onClick={() =>
              setEditingUser(
                null
              )
            }
          >

            <div
              className="user-modal edit-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div
                className="modal-header"
              >

                <h2>
                  ✏️ Edit User
                </h2>


                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setEditingUser(
                      null
                    )
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={
                  saveEdit
                }
                className="edit-user-form"
              >

                <label>
                  Name
                </label>


                <input
                  type="text"
                  value={
                    editForm.name
                  }
                  onChange={
                    (e) =>
                      setEditForm({

                        ...editForm,

                        name:
                          e.target.value

                      })
                  }
                />


                <label>
                  Email
                </label>


                <input
                  type="email"
                  value={
                    editingUser.email
                  }
                  disabled
                />


                <label>
                  Phone
                </label>


                <input
                  type="text"
                  value={
                    editForm.phone
                  }
                  placeholder="Enter phone number"
                  onChange={
                    (e) =>
                      setEditForm({

                        ...editForm,

                        phone:
                          e.target.value

                      })
                  }
                />


                <label>
                  Role
                </label>


                {isProtectedAdmin(
                  editingUser
                ) ? (

                  <input
                    type="text"
                    value="ADMIN"
                    disabled
                  />

                ) : (

                  <select
                    value={
                      editForm.role
                    }
                    onChange={
                      (e) =>
                        setEditForm({

                          ...editForm,

                          role:
                            e.target.value

                        })
                    }
                  >

                    <option value="CUSTOMER">
                      CUSTOMER
                    </option>


                    <option value="ADMIN">
                      ADMIN
                    </option>

                  </select>

                )}


                {editForm.role ===
                  "ADMIN" &&
                !isProtectedAdmin(
                  editingUser
                ) && (

                  <div
                    className="admin-role-warning"
                  >
                    👑 This user will have
                    Admin access.
                  </div>

                )}


                <div
                  className="edit-form-buttons"
                >

                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={() =>
                      setEditingUser(
                        null
                      )
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="save-edit-button"
                    disabled={
                      processingUserId !==
                      null
                    }
                  >

                    {processingUserId ===
                    editingUser?.id
                      ? "Saving..."
                      : "Save Changes"
                    }

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


export default ManageUsers;