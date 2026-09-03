import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  "https://dairyhub-backend.onrender.com/api/users";

function ManageUsers() {

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: ""
  });

  const [loading, setLoading] = useState(true);


  // =========================
  // LOAD USERS
  // =========================

  const loadUsers = async () => {

    try {

      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      setUsers(data);

    } catch (error) {

      console.error("Error loading users:", error);

      alert("Failed to load users.");

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadUsers();

  }, []);


  // =========================
  // DELETE USER
  // =========================

  const deleteUser = async (user) => {

    if (user.role === "ADMIN") {

      alert("Admin account cannot be deleted.");

      return;

    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/${user.id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {

        throw new Error("Delete failed");

      }

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => item.id !== user.id
        )
      );

      alert("User deleted successfully.");

    } catch (error) {

      console.error("Delete error:", error);

      alert("Failed to delete user.");

    }

  };


  // =========================
  // OPEN EDIT
  // =========================

  const openEdit = (user) => {

    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "CUSTOMER"
    });

  };


  // =========================
  // SAVE EDIT
  // =========================

  const saveEdit = async (e) => {

    e.preventDefault();

    if (!editForm.name.trim()) {

      alert("Name is required.");

      return;

    }

    try {

      const response = await fetch(
        `${API_URL}/${editingUser.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: editForm.name.trim(),
            phone: editForm.phone.trim() || null,
            role: editForm.role
          })
        }
      );

      if (!response.ok) {

        throw new Error("Update failed");

      }

      const updatedUser = await response.json();

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === updatedUser.id
            ? updatedUser
            : item
        )
      );

      setEditingUser(null);

      alert("User updated successfully.");

    } catch (error) {

      console.error("Update error:", error);

      alert("Failed to update user.");

    }

  };


  // =========================
  // FILTER USERS
  // =========================

  const filteredUsers = users.filter((user) => {

    const search = searchText
      .toLowerCase()
      .trim();

    const matchesSearch =
      !search ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;

  });


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="manage-users-page">

        <div className="manage-users-container">

          <Link
            to="/admin"
            className="back-admin-button"
          >
            ← Back to Admin Dashboard
          </Link>

          <h1>Manage Users</h1>

          <p className="users-loading">
            Loading users...
          </p>

        </div>

      </div>
    );

  }


  return (

    <div className="manage-users-page">

      <div className="manage-users-container">


        {/* BACK BUTTON */}

        <Link
          to="/admin"
          className="back-admin-button"
        >
          ← Back to Admin Dashboard
        </Link>


        {/* TITLE */}

        <div className="manage-users-heading">

          <div>

            <h1>Manage Users</h1>

            <p>
              View, manage and maintain DairyHub users.
            </p>

          </div>

          <div className="user-count">

            Total Users
            <strong>{users.length}</strong>

          </div>

        </div>


        {/* SEARCH + FILTER */}

        <div className="user-controls">

          <div className="user-search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
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
              setRoleFilter(e.target.value)
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


        {/* USER TABLE */}

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Role</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="no-users"
                  >
                    No users found.
                  </td>

                </tr>

              ) : (

                filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      {user.id}
                    </td>

                    <td className="user-name">
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.phone || "N/A"}
                    </td>

                    <td>

                      <span
                        className={
                          user.role === "ADMIN"
                            ? "role-badge admin"
                            : "role-badge customer"
                        }
                      >
                        {user.role}
                      </span>

                    </td>


                    <td>

                      {user.role === "ADMIN" ? (

                        <span className="protected-user">
                          🔒 Protected
                        </span>

                      ) : (

                        <div className="user-actions">

                          <button
                            className="view-user-button"
                            onClick={() =>
                              setSelectedUser(user)
                            }
                          >
                            👁 View
                          </button>

                          <button
                            className="edit-user-button"
                            onClick={() =>
                              openEdit(user)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-user-button"
                            onClick={() =>
                              deleteUser(user)
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* =========================
            VIEW USER MODAL
        ========================= */}

        {selectedUser && (

          <div
            className="user-modal-overlay"
            onClick={() =>
              setSelectedUser(null)
            }
          >

            <div
              className="user-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <h2>
                  👤 User Details
                </h2>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedUser(null)
                  }
                >
                  ×
                </button>

              </div>


              <div className="user-details">

                <div className="detail-row">

                  <span>ID</span>

                  <strong>
                    {selectedUser.id}
                  </strong>

                </div>


                <div className="detail-row">

                  <span>Name</span>

                  <strong>
                    {selectedUser.name}
                  </strong>

                </div>


                <div className="detail-row">

                  <span>Email</span>

                  <strong>
                    {selectedUser.email}
                  </strong>

                </div>


                <div className="detail-row">

                  <span>Phone</span>

                  <strong>
                    {selectedUser.phone || "N/A"}
                  </strong>

                </div>


                <div className="detail-row">

                  <span>Role</span>

                  <strong>
                    {selectedUser.role}
                  </strong>

                </div>

              </div>


              <button
                className="modal-ok-button"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        )}


        {/* =========================
            EDIT USER MODAL
        ========================= */}

        {editingUser && (

          <div
            className="user-modal-overlay"
            onClick={() =>
              setEditingUser(null)
            }
          >

            <div
              className="user-modal edit-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <h2>
                  ✏️ Edit User
                </h2>

                <button
                  className="modal-close"
                  onClick={() =>
                    setEditingUser(null)
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={saveEdit}
                className="edit-user-form"
              >

                <label>
                  Name
                </label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value
                    })
                  }
                />


                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                />


                <label>
                  Phone
                </label>

                <input
                  type="text"
                  value={editForm.phone}
                  placeholder="Enter phone number"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone: e.target.value
                    })
                  }
                />


                <label>
                  Role
                </label>

                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      role: e.target.value
                    })
                  }
                >

                  <option value="CUSTOMER">
                    CUSTOMER
                  </option>

                </select>


                <div className="edit-form-buttons">

                  <button
                    type="button"
                    className="cancel-edit-button"
                    onClick={() =>
                      setEditingUser(null)
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