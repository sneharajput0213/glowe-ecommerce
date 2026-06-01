import React, {
  useState,
  useEffect,
} from "react";

import { Link } from "react-router-dom";

import {
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";

import { testimonials } from "../data/products";

import ProductCard from "../components/ProductCard";

function Home() {
  const [email, setEmail] =
    useState("");

  const [products, setProducts] =
    useState([]);

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          const response =
            await fetch(
              "http://localhost:5000/api/products"
            );

          const data =
            await response.json();

          setProducts(data);
        } catch (error) {
          console.log(error);
        }
      };

    fetchProducts();
  }, []);

  const featuredProducts =
    products.slice(0, 4);

  const categories = [
    {
      name: "Cleanser",
      image:
        "https://images.unsplash.com/photo-1765887986673-953fccf56464?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      link: "/products?category=Cleanser",
    },
    {
      name: "Serum",
      image:
        "https://images.unsplash.com/photo-1745159338135-39f6b462b382?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      link: "/products?category=Serum",
    },
    {
      name: "Moisturizer",
      image:
        "https://images.unsplash.com/photo-1667242003558-e42942d2b911?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      link: "/products?category=Moisturizer",
    },
    {
      name: "Sunscreen",
      image:
        "https://images.unsplash.com/photo-1594332322527-08753d4473c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      link: "/products?category=Sunscreen",
    },
  ];

  const handleNewsletterSubmit = (
    e
  ) => {
    e.preventDefault();

    alert(
      "Thank you for subscribing!"
    );

    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent via-secondary/30 to-background py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                <span>
                  New Collection Available
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-serif text-foreground leading-tight">
                Discover Your
                <span className="text-primary italic block mt-2">
                  Natural Glow
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Premium skincare products
                formulated with love and
                science. Experience the
                radiance you deserve with
                our luxurious collection.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors inline-flex items-center space-x-2 shadow-lg"
                >
                  <span>Shop Now</span>

                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#categories"
                  className="bg-card text-foreground px-8 py-4 rounded-full hover:bg-accent transition-colors border border-border"
                >
                  Explore Categories
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1752398760609-e4be4e766ecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                  alt="Glowé Skincare"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl shadow-xl border border-border max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Star className="w-6 h-6 text-primary" />
                  </div>

                  <div>
                    <div className="text-2xl text-primary">
                      4.8/5
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Trusted by 10k+
                      customers
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl font-serif text-foreground">
            Best Sellers
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our most loved products that
            deliver visible results
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {featuredProducts.map(
            (product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            )
          )}

        </div>

        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span>
              View All Products
            </span>

            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="py-20 bg-accent/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12 space-y-3">
            <h2 className="text-4xl font-serif text-foreground">
              Shop by Category
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect products
              for your skincare routine
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {categories.map(
              (category) => (
                <Link
                  key={category.name}
                  to={category.link}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent flex items-end">
                    <div className="p-6 w-full">
                      <h3 className="text-2xl text-white group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              )
            )}

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl font-serif text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real results from real people
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card p-8 rounded-2xl shadow-sm border border-border space-y-4"
            >
              <div className="flex items-center space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center space-x-3 pt-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent to-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-serif text-foreground">
            Join Our Glow Community
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Subscribe to receive exclusive offers, skincare tips, and be the first to know about new launches
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 bg-input-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </form>
          <p className="text-sm text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;