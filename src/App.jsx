import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/wishlist"
          element={
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
        }
        />
        <Route
          path="/cart"
          element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
        }
        />
        <Route
          path="/checkout"
          element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
        }
        /> 
        <Route
          path="/my-orders"
          element={
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
        }
        />
        <Route
          path="/profile"
          element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
        }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/add"
          element={
            <AdminRoute>
              <AdminAddProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <AdminRoute>
              <AdminEditProduct />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;