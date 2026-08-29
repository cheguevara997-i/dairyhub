import { Navigate, Outlet } from "react-router-dom";

function CustomerRoute() {

  const user = JSON.parse(
    localStorage.getItem("dairyhubUser")
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "CUSTOMER") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default CustomerRoute;