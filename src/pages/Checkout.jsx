import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  Package,
  CheckCircle,
} from "lucide-react";

import {
  getCartItems,
  getCartTotal,
  clearCart,
} from "../utils/cart";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [orderPlaced, setOrderPlaced] =
    useState(false);

  // FORM STATE
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const items = getCartItems();

    setCartItems(items || []);
  }, []);

  const subtotal = Number(getCartTotal()) || 0;
  const shipping = subtotal > 75 ? 0 : 8;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PLACE ORDER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userInfoStr = localStorage.getItem("userInfo");
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

      if (!userInfo) {
        alert("Please login first");
        return;
      }

      const orderData = {
        user: userInfo.id,

        orderItems: cartItems.map((item) => {
          const product = item.product || item;

          return {
            name: product.name,
            image: product.image,
            quantity: item.quantity,
            price: Number(product.price),
            productId: product.id,
          };
        }),

        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },

        paymentMethod: formData.paymentMethod,

        totalPrice: total,
      };

      const token = localStorage.getItem("token");

const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/orders`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Order failed"
        );
      }

      setOrderPlaced(true);

      clearCart();

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // EMPTY CART
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-accent rounded-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>

          <h2 className="text-3xl font-serif text-foreground">
            Your Cart is Empty
          </h2>

          <p className="text-muted-foreground">
            Add some products to your cart
            before checking out.
          </p>

          <Link
            to="/products"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ORDER SUCCESS
  if (orderPlaced) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-card rounded-3xl border border-border p-12 text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>

            <h1 className="text-4xl font-serif text-foreground">
              Order Placed Successfully!
            </h1>

            <p className="text-muted-foreground text-lg">
              Thank you for your purchase.
              Your order has been confirmed
              and will be shipped soon.
            </p>

            <div className="bg-accent/50 rounded-2xl p-6 space-y-2">
              <div className="text-sm text-muted-foreground">
                Order Number
              </div>

              <div className="text-2xl text-primary font-mono">
                #GLW-
                {Math.floor(
                  Math.random() * 100000
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              A confirmation email has been
              sent to {formData.email}
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link
                to="/products"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </Link>

              <Link
                to="/"
                className="bg-card text-foreground px-8 py-4 rounded-full hover:bg-accent transition-colors border border-border"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">

              {/* CONTACT */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary">
                      1
                    </span>
                  </div>

                  <h2 className="text-xl text-foreground">
                    Contact Information
                  </h2>
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* SHIPPING */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>

                  <h2 className="text-xl text-foreground">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                  />

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                  />

                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                  />
                </div>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                />
              </div>

              {/* PAYMENT */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>

                  <h2 className="text-xl text-foreground">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={
                        formData.paymentMethod ===
                        "card"
                      }
                      onChange={
                        handleInputChange
                      }
                    />

                    <span>
                      Credit / Debit Card
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={
                        formData.paymentMethod ===
                        "paypal"
                      }
                      onChange={
                        handleInputChange
                      }
                    />

                    <span>PayPal</span>
                  </label>
                </div>

                {formData.paymentMethod ===
                  "card" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={
                        formData.cardNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                    />

                    <input
                      type="text"
                      name="cardName"
                      placeholder="Name on Card"
                      value={
                        formData.cardName
                      }
                      onChange={
                        handleInputChange
                      }
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={
                          formData.expiryDate
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                      />

                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={formData.cvv}
                        onChange={
                          handleInputChange
                        }
                        className="w-full px-4 py-3 bg-input-background border border-border rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
                <h2 className="text-xl text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map(
                    (item, index) => {
                      const product =
                        item.product || item;

                      return (
                        <div
                          key={
                            product.id ||
                            index
                          }
                          className="flex gap-3"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent">
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="text-sm text-foreground">
                              {product.name}
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Qty:{" "}
                              {item.quantity}
                            </div>

                            <div className="text-sm text-primary">
                              ₹
                              {(
                                Number(
                                  product.price
                                ) *
                                Number(
                                  item.quantity
                                )
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between">
                    <span>Subtotal</span>

                    <span>
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>

                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toFixed(
                            2
                          )}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>

                    <span>
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl">
                  <span>Total</span>

                  <span className="text-primary">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full hover:bg-primary/90 transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}