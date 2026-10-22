
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  UserRound,
  Store,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    path: "/seller",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Products",
    path: "/seller/products",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/seller/orders",
    icon: ShoppingBag,
  },
  {
    label: "Inventory",
    path: "/seller/inventory",
    icon: Boxes,
  },
  {
    label: "My Profile",
    path: "/seller/profile",
    icon: UserRound,
  },
];

function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    setSidebarOpen(false);

    // Reload to clear in-memory authentication state
    window.location.replace("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open seller navigation"
        aria-expanded={sidebarOpen}
        aria-controls="seller-sidebar"
        className="fixed left-4 top-4 z-30 rounded-xl border border-border bg-card p-3 text-primary shadow-sm lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="seller-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r border-border bg-card p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close seller navigation"
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition hover:bg-accent lg:hidden"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h2 className="font-serif text-xl text-primary">
              Glowé
            </h2>
            <p className="text-xs text-muted-foreground">
              Seller Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`
                }
              >
                <Icon className="h-5 w-5" />

                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-8">
          <div className="border-t border-border pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 px-4 pb-6 pt-20 md:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default SellerLayout;
