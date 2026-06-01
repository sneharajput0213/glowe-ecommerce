import {Link} from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';    

function Footer(){
    return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-primary italic">Glowé</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium skincare that brings out your natural radiance. Crafted with love and science.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-foreground">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=Cleanser" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Cleansers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Serum" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Serums
                </Link>
              </li>
              <li>
                <Link to="/products?category=Moisturizer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Moisturizers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Sunscreen" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Sunscreen
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="mb-4 text-foreground">Customer Care</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Glowé. All rights reserved. Made with love for your skin.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;