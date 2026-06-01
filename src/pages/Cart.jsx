import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCartItems, updateCartQuantity, removeFromCart, getCartTotal } from '../utils/cart';

function Cart() {
    const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    setCartItems(getCartItems());
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    updateCartQuantity(productId, newQuantity);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal > 799 ? 0 : 99) : 0;
  const total = subtotal + shipping;

    if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-accent rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-serif text-foreground">Your Cart is Empty</h2>
          <p className="text-muted-foreground">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-foreground mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row gap-6"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product.id}`}
                  className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-accent shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-foreground hover:text-primary transition-colors block mb-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {item.product.category}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-border rounded-full overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-accent transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-accent transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-xl text-primary">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
              <h2 className="text-xl text-foreground">Order Summary</h2>

              <div className="space-y-3 py-4 border-y border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal > 0 && subtotal < 799 && (
                  <div className="text-sm text-primary bg-primary/10 px-4 py-2 rounded-lg">
                    Add ₹{(799 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xl text-foreground">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary text-primary-foreground py-4 rounded-full hover:bg-primary/90 transition-colors inline-flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="block text-center text-primary hover:text-primary/80 transition-colors text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;