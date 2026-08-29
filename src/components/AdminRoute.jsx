import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {

  const user = JSON.parse(
    localStorage.getItem("dairyhubUser")
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;