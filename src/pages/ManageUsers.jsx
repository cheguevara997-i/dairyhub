import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

function ManageUsers() {

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);


  const fetchUsers = async () => {

    try {

      const response = await fetch(
        "https://dairyhub-backend.onrender.com/api/users"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data);

    } catch (error) {

      console.error(
        "Error fetching users:",
        error
      );

      alert("Unable to load users.");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchUsers();

  }, []);


  const deleteUser = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmDelete) {
      return;
    }


    try {

      const response = await fetch(
        `https://dairyhub-backend.onrender.com/api/users/${id}`,
        {
          method: "DELETE"
        }
      );


      if (!response.ok) {

        const message =
          await response.text();

        throw new Error(
          message || "Failed to delete user"
        );

      }


      setUsers(
        (previousUsers) =>
          previousUsers.filter(
            (user) => user.id !== id
          )
      );


      alert(
        "User deleted successfully!"
      );


    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );

      alert(
        error.message ||
        "Unable to delete user."
      );

    }

  };


  return (

    <div className="admin-page">

      <BackButton
        to="/admin"
        text="← Back to Admin Dashboard"
      />

      <h1>
        Manage Users
      </h1>


      {loading ? (

        <div className="empty-state">

          <h3>
            Loading users...
          </h3>

        </div>

      ) : users.length === 0 ? (

        <div className="empty-state">

          <h3>
            No users found
          </h3>

        </div>

      ) : (

        <div className="users-table-container">

          <table className="users-table">

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

              {users.map((user) => (

                <tr key={user.id}>

                  <td>
                    {user.id}
                  </td>

                  <td>
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
                          ? "role-badge admin-role"
                          : "role-badge customer-role"
                      }
                    >
                      {user.role}
                    </span>

                  </td>

                  <td>

                    {user.role !== "ADMIN" ? (

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteUser(user.id)
                        }
                      >
                        Delete
                      </button>

                    ) : (

                      <span className="protected-user">
                        Protected
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

export default ManageUsers;