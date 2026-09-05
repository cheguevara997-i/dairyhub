import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const API_URL =
  "https://dairyhub-backend.onrender.com/api/users";


const PROTECTED_ADMIN_EMAIL =
  "admin@dairyhub.com";


function ManageUsers() {

  const [users, setUsers] =
    useState([]);


  const [searchText, setSearchText] =
    useState("");


  const [roleFilter, setRoleFilter] =
    useState("ALL");


  const [selectedUser, setSelectedUser] =
    useState(null);


  const [editingUser, setEditingUser] =
    useState(null);


  const [editForm, setEditForm] =
    useState({

      name: "",

      phone: "",

      role: ""

    });


  const [loading, setLoading] =
    useState(true);


  const [processingUserId, setProcessingUserId] =
    useState(null);


  // =========================================
  // CHECK ORIGINAL PROTECTED ADMIN
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
  // LOAD USERS
  // =========================================

  const loadUsers = async () => {

    try {

      setLoading(true);


      const response =
        await fetch(
          API_URL
        );


      if (!response.ok) {

        throw new Error(
          "Failed to load users"
        );

      }


      const data =
        await response.json();


      setUsers(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        "Error loading users:",
        error
      );


      alert(
        "Failed to load users."
      );


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
  // DELETE USER
  // =========================================

  const deleteUser = async (
    user
  ) => {

    if (
      isProtectedAdmin(user)
    ) {

      alert(
        "The original DairyHub admin account cannot be deleted."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete ${user.name}?`
      );


    if (!confirmed) {

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
              "DELETE"
          }
        );


      if (!response.ok) {

        const errorMessage =
          await response.text();


        throw new Error(
          errorMessage ||
          "Delete failed"
        );

      }


      setUsers(
        previousUsers =>
          previousUsers.filter(
            item =>
              item.id !== user.id
          )
      );


      alert(
        `${user.name} deleted successfully.`
      );


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );


      alert(
        error.message ||
        "Failed to delete user."
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
    async (e) => {

      e.preventDefault();


      if (
        !editForm.name.trim()
      ) {

        alert(
          "Name is required."
        );

        return;

      }


      /*
       * Original admin cannot be changed
       * to CUSTOMER.
       */

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

              headers: {

                "Content-Type":
                  "application/json"

              },

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


        if (!response.ok) {

          const errorMessage =
            await response.text();


          throw new Error(
            errorMessage ||
            "Update failed"
          );

        }


        const updatedUser =
          await response.json();


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
          "Update error:",
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

  const makeAdmin = async (
    user
  ) => {

    if (
      isProtectedAdmin(user)
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Make ${user.name} an ADMIN?\n\nThis user will receive access to the DairyHub Admin Dashboard.`
      );


    if (!confirmed) {

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

            headers: {

              "Content-Type":
                "application/json"

            },

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


      if (!response.ok) {

        const errorMessage =
          await response.text();


        throw new Error(
          errorMessage ||
          "Unable to make user admin"
        );

      }


      const updatedUser =
        await response.json();


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

  const removeAdmin = async (
    user
  ) => {

    if (
      isProtectedAdmin(user)
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
      role !== "ADMIN"
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Remove ADMIN access from ${user.name}?\n\nThey will become a CUSTOMER again.`
      );


    if (!confirmed) {

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

            headers: {

              "Content-Type":
                "application/json"

            },

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


      if (!response.ok) {

        const errorMessage =
          await response.text();


        throw new Error(
          errorMessage ||
          "Unable to remove admin access"
        );

      }


      const updatedUser =
        await response.json();


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

  const filteredUsers =
    users.filter(
      user => {

        const search =
          searchText
            .toLowerCase()
            .trim();


        const userName =
          user.name
            ?.toLowerCase() || "";


        const userEmail =
          user.email
            ?.toLowerCase() || "";


        const userPhone =
          user.phone
            ?.toLowerCase() || "";


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


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

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


        {/* =====================================
            BACK
        ====================================== */}

        <Link
          to="/admin"
          className="back-admin-button"
        >
          ← Back to Admin Dashboard
        </Link>


        {/* =====================================
            HEADER
        ====================================== */}

        <div
          className="manage-users-heading"
        >

          <div>

            <h1>
              Manage Users
            </h1>


            <p>
              View, manage and maintain
              DairyHub users.
            </p>

          </div>


          <div
            className="user-count"
          >

            Total Users

            <strong>
              {users.length}
            </strong>

          </div>

        </div>


        {/* =====================================
            SEARCH + FILTER
        ====================================== */}

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
              placeholder="Search name, email or phone..."
              value={searchText}
              onChange={(e) =>
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
            value={roleFilter}
            onChange={(e) =>
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


        {/* =====================================
            USERS TABLE
        ====================================== */}

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

              {filteredUsers.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-users"
                  >
                    No users found.
                  </td>

                </tr>

              ) : (

                filteredUsers.map(
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


                        {/* ID */}

                        <td>
                          {user.id}
                        </td>


                        {/* NAME */}

                        <td
                          className="user-name"
                        >
                          {user.name}
                        </td>


                        {/* EMAIL */}

                        <td>
                          {user.email}
                        </td>


                        {/* PHONE */}

                        <td>
                          {user.phone ||
                            "N/A"}
                        </td>


                        {/* ROLE */}

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
                              : "CUSTOMER"}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          {protectedAdmin ? (

                            <span
                              className="protected-user"
                            >
                              🔒 Protected
                            </span>


                          ) : isAdmin ? (

                            /* =================================
                               OTHER / PROMOTED ADMIN
                            ================================== */

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
                              >
                                ✏️ Edit
                              </button>


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
                                🗑 Delete
                              </button>

                            </div>


                          ) : (

                            /* =================================
                               CUSTOMER
                            ================================== */

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
                              >
                                ✏️ Edit
                              </button>


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
                                🗑 Delete
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


        {/* =====================================
            VIEW USER MODAL
        ====================================== */}

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
                    Admin Type
                  </span>

                  <strong>

                    {
                      isProtectedAdmin(
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


        {/* =====================================
            EDIT USER MODAL
        ====================================== */}

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


                {/* NAME */}

                <label>
                  Name
                </label>


                <input
                  type="text"
                  value={
                    editForm.name
                  }
                  onChange={(e) =>
                    setEditForm({

                      ...editForm,

                      name:
                        e.target.value

                    })
                  }
                />


                {/* EMAIL */}

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


                {/* PHONE */}

                <label>
                  Phone
                </label>


                <input
                  type="text"
                  value={
                    editForm.phone
                  }
                  placeholder="Enter phone number"
                  onChange={(e) =>
                    setEditForm({

                      ...editForm,

                      phone:
                        e.target.value

                    })
                  }
                />


                {/* ROLE */}

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
                    onChange={(e) =>
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


                {/* BUTTONS */}

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
                  >
                    Save Changes
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