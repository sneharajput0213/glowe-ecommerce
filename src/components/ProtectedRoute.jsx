import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  if (!userInfo) {
    alert("Please login first");
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;