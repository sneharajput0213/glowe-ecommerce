import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
} from "lucide-react";

import {
  addToCart,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../utils/cart";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] =
    useState(false);
  const [addedToCart, setAddedToCart] =
    useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        const data = await response.json();

        setProduct(data);

        setIsWishlisted(
          isInWishlist(data._id)
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);

    setAddedToCart(true);

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }

    setIsWishlisted(!isWishlisted);

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h2 className="text-2xl">
          Loading Product...
        </h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">
            Product not found
          </h2>

          <Link
            to="/products"
            className="text-primary"
          >
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm text-muted-foreground">
          <Link to="/">Home</Link>

          <span>/</span>

          <Link to="/products">
            Products
          </Link>

          <span>/</span>

          <span>{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Image */}
          <div>
            <div className="aspect-square rounded-3xl overflow-hidden border">

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />

            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">

            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full">
              {product.category}
            </div>

            <h1 className="text-4xl font-serif">
              {product.name}
            </h1>

            <p className="text-4xl text-primary">
              ₹{product.price}
            </p>

            <p className="text-muted-foreground">
              {product.description}
            </p>

            <div>
              <h3 className="font-medium mb-2">
                Brand
              </h3>

              <p>{product.brand}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">
                Stock Available
              </h3>

              <p>
                {product.countInStock}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">
                Quantity
              </h3>

              <div className="flex items-center border rounded-full w-fit">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="px-4 py-2"
                >
                  <Minus size={18} />
                </button>

                <span className="px-6">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(
                      quantity + 1
                    )
                  }
                  className="px-4 py-2"
                >
                  <Plus size={18} />
                </button>

              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white py-4 rounded-full flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={
                  handleToggleWishlist
                }
                className="border rounded-full px-5"
              >
                <Heart
                  className={
                    isWishlisted
                      ? "fill-primary text-primary"
                      : ""
                  }
                />
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}