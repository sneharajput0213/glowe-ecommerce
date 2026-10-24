import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  Package,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    paymentMethod: "payu",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // FETCH CART
  useEffect(() => {
    let isMounted = true;

    const fetchCart = async () => {
      try {
        const { data } = await api.get("/cart");
        const items = data.cart?.items ?? [];

        if (isMounted) {
          setCartItems(items);
        }
      } catch (error) {
        console.error(
          "Error fetching checkout cart:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchCart();

    return () => {
      isMounted = false;
    };
  }, []);

  // VERIFY PAYMENT RETURN
  useEffect(() => {
    let isMounted = true;

    const verifyReturnedPayment = async () => {
      const paymentStatus = searchParams.get("payment");
      const returnedOrderId = searchParams.get("orderId");

      if (paymentStatus === "failure") {
        setOrderPlaced(false);
        setOrderId(returnedOrderId || "");
        setPaymentError(
          "Your payment was unsuccessful. Please check your order before trying again."
        );
        return;
      }

      if (paymentStatus === "refund" && returnedOrderId) {
        setOrderId(returnedOrderId);
        setOrderPlaced(false);
        setPaymentError(
          "Your payment was received, but your order needs attention and a refund may be required. Please contact support."
        );
        return;
      }

      if (paymentStatus !== "success" || !returnedOrderId) {
        return;
      }

      try {
        const { data } = await api.get(
          `/orders/${returnedOrderId}`
        );

        const order = data.order;

        if (!isMounted) return;

        if (
          order?.paymentStatus === "paid" &&
          order?.refundStatus !== "pending"
        ) {
          setOrderId(returnedOrderId);
          setOrderPlaced(true);
          setPaymentError("");
        } else {
          setOrderId(returnedOrderId);
          setOrderPlaced(false);
          setPaymentError(
            order?.refundStatus === "pending"
              ? "Your payment was received, but the order needs attention. Please contact support."
              : "We couldn't confirm your payment. Please check your order status before trying again."
          );
        }
      } catch (error) {
        if (!isMounted) return;

        setOrderId(returnedOrderId);
        setOrderPlaced(false);
        setPaymentError(
          error.response?.data?.message ||
            "Unable to verify your order. Please check your order history."
        );
      }
    };

    verifyReturnedPayment();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // ORDER TOTALS
  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.product || item;

    return (
      sum +
      Number(product.price) * Number(item.quantity)
    );
  }, 0);

  const shipping = subtotal > 0
  ? (subtotal >= 799 ? 0 : 79)
  : 0;

  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
  const { name, value } = e.target;

      if (name === "phone") {
        const digitsOnly = value.replace(/\D/g, "").slice(0, 10);

        setFormData((prev) => ({
          ...prev,
          phone: digitsOnly,
        }));

        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  // PLACE ORDER AND INITIATE PAYU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    try {
      const shippingAddress = {
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.zipCode.trim(),
        country: "India",
      };

      // Step 1: Create the order from the backend cart.
      const { data: orderData } = await api.post(
        "/orders",
        { shippingAddress }
      );

      const newOrderId = orderData.order?._id;

      if (!newOrderId) {
        throw new Error(
          "Order was created, but its ID was not returned. Please check your order history."
        );
      }

      setOrderId(newOrderId);

      // Step 2: Initiate PayU for this order.
      const { data: payment } = await api.post(
        "/payments",
        { orderId: newOrderId }
      );

      if (!payment.action || !payment.paymentData) {
        throw new Error("Unable to start payment.");
      }

      // Step 3: Submit the hosted PayU payment form.
      const paymentForm = document.createElement("form");
      paymentForm.method = "POST";
      paymentForm.action = payment.action;

      Object.entries(payment.paymentData).forEach(
        ([name, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = String(value ?? "");
          paymentForm.appendChild(input);
        }
      );

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Unable to proceed to payment."
      );
    }
  };

  // EMPTY CART
  // Keep the checkout visible when displaying a payment result/error.
  if (
    cartItems.length === 0 &&
    !orderPlaced &&
    !paymentError
  ) {
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
            Add some products to your cart before checking out.
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
              Thank you for your purchase. Your order has been
              confirmed and will be shipped soon.
            </p>

            <div className="bg-accent/50 rounded-2xl p-6 space-y-2">
              <div className="text-sm text-muted-foreground">
                Order Number
              </div>

              <div className="text-2xl text-primary font-mono break-all">
                {orderId}
              </div>
            </div>

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

  // CHECKOUT PAGE
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {paymentError && (
          <div
            role="alert"
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-4">
              {paymentError}
            </div>
          </div>
        )}

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
                    <span className="text-primary">1</span>
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
                  placeholder="10-digit Mobile Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  minLength={10}
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
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

                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payu"
                    checked={formData.paymentMethod === "payu"}
                    onChange={handleInputChange}
                    className="mt-1"
                  />

                  <div>
                    <p className="font-medium text-foreground">
                      Pay securely with PayU
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      Complete your payment securely on PayU's hosted payment page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
                <h2 className="text-xl text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item, index) => {
                    const product = item.product || item;

                    return (
                      <div
                        key={product._id || product.id || index}
                        className="flex gap-3"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="text-sm text-foreground">
                            {product.name}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </div>

                          <div className="text-sm text-primary">
                            ₹
                            {(
                              Number(product.price) *
                              Number(item.quantity)
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 py-4 border-y border-border">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
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
