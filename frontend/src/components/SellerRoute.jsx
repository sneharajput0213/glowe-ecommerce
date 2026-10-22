
import { Navigate } from "react-router-dom";

function SellerRoute({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("userInfo");

  if (!token || !storedUser) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SellerRoute;
