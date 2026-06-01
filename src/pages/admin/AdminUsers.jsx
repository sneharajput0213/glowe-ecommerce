import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const userInfoStr = localStorage.getItem("userInfo");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
      return;
    }

    if (userInfo.id === id) {
      alert("You cannot delete yourself");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error.message);
    }
  };

  const toggleAdmin = async (id) => {
    if (userInfo.id === id) {
      alert(
        "You cannot remove your own admin access"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/users/${id}/admin`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin status:", error.message);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <h1 className="text-5xl font-serif mb-8">
        User Management
      </h1>

      <div className="bg-white rounded-3xl overflow-hidden border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-6">
                Name
              </th>

              <th className="text-left p-6">
                Email
              </th>

              <th className="text-left p-6">
                Role
              </th>

              <th className="text-left p-6">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b"
              >
                <td className="p-6">
                  {user.name}
                </td>

                <td className="p-6">
                  {user.email}
                </td>

                <td className="p-6">
                  {user.isAdmin ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      User
                    </span>
                  )}
                </td>

                <td className="p-6 flex gap-3">
                  <button
                    onClick={() =>
                      toggleAdmin(user._id)
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-full"
                  >
                    {user.isAdmin
                      ? "Remove Admin"
                      : "Make Admin"}
                  </button>

                  <button
                    onClick={() =>
                      deleteUser(user._id)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}