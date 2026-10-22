import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import {
  setCartItems,
  setCartLoading,
  setCartError,
} from "../redux/cartSlice";
import {
  setWishlistItems,
  setWishlistLoading,
  setWishlistError,
} from "../redux/wishlistSlice";

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();

  const loadUserData = async () => {
  dispatch(setCartLoading(true));
  dispatch(setWishlistLoading(true));
  dispatch(setCartError(null));
  dispatch(setWishlistError(null));

  try {
    const [cartResponse, wishlistResponse] = await Promise.all([
      api.get("/cart"),
      api.get("/wishlist"),
    ]);

    const cartItems = (cartResponse.data.cart?.items ?? [])
      .filter((item) => item.product)
      .map((item) => ({
        product: {
          ...item.product,
          id: item.product._id,
        },
        quantity: item.quantity,
      }));

    const wishlistItems = (
      wishlistResponse.data.wishlist?.products ?? []
    ).map((product) => ({
      ...product,
      id: product._id,
    }));

    dispatch(setCartItems(cartItems));
    dispatch(setWishlistItems(wishlistItems));
  } catch (error) {
    const message =
      error.response?.data?.message || error.message;

    dispatch(setCartError(message));
    dispatch(setWishlistError(message));

    console.error("Error loading user data:", message);
  } finally {
    dispatch(setCartLoading(false));
    dispatch(setWishlistLoading(false));
  }
};

  if (!isOpen) return null;

  // LOGIN INPUTS
  const handleLoginChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // SIGNUP INPUTS
  const handleSignupChange = (e) => {
    setSignupData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // LOGIN
  
const handleLoginSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const { data } = await api.post("/auth/login", loginData);

    localStorage.setItem(
      "userInfo",
      JSON.stringify(data.user)
    );

    localStorage.setItem("token", data.token);

    // Load customer cart and wishlist only for customers
    if (data.user.role === "customer") {
      await loadUserData();
    }

    alert("Login successful!");

    setLoginData({
      email: "",
      password: "",
    });

    onClose();

    // Redirect according to the logged-in user's role
    if (data.user.role === "seller") {
      window.location.replace("/seller");
    } else if (data.user.role === "admin") {
      window.location.replace("/admin");
    } else {
      window.location.replace("/");
    }

  } catch (error) {
    alert(
      error.response?.data?.message ||
      error.message ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  // SIGNUP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (
      signupData.password !==
      signupData.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/register", {
        name: signupData.fullName,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      await loadUserData();

alert("Account created successfully!");

setSignupData({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

onClose();
window.location.reload();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.message ||
        "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 px-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={22} />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 transition-colors ${
              isLogin
                ? "bg-primary text-primary-foreground"
                : "text-foreground"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 transition-colors ${
              !isLogin
                ? "bg-primary text-primary-foreground"
                : "text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8">

          {/* LOGIN FORM */}
          {isLogin ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-serif text-foreground">
                  Welcome Back
                </h2>

                <p className="text-muted-foreground mt-2">
                  Sign in to your account
                </p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Email Address"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Please Wait..."
                    : "Login"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* SIGNUP FORM */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-serif text-foreground">
                  Create Account
                </h2>

                <p className="text-muted-foreground mt-2">
                  Join the Glowé skincare family
                </p>
              </div>

              <form
                autoComplete="off"
                onSubmit={handleSignupSubmit}
                className="space-y-5"
              >
                <input
                  type="text"
                  name="fullName"
                  autoComplete="off" 
                  value={signupData.fullName}
                  onChange={handleSignupChange}
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="Email Address"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="Confirm Password"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="text-primary text-sm"
                >
                  {showPassword
                    ? "Hide Passwords"
                    : "Show Passwords"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Please Wait..."
                    : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;