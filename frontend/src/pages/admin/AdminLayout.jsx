import { toast } from "sonner";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  ChartNoAxesCombined,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Sellers",
      path: "/admin/sellers",
      icon: Store,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: ChartNoAxesCombined,
    },
    {
      label: "My Profile",
      path: "/admin/profile",
      icon: UserRound,
    },
  ];

  const handleLogout = () => {
  toast("Log out of Glowé?", {
    description: "Are you sure you want to end your session?",
    duration: 10000,

    action: {
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");

        setSidebarOpen(false);

        window.location.replace("/");
      },
    },

    cancel: {
      label: "Stay",
      onClick: () => {},
    },
  });
};

  return (
    <div className="flex min-h-screen bg-[#FAF8F7]">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
        className="fixed left-4 top-4 z-30 rounded-xl border border-[#F0E5E5] bg-white p-3 text-[#B76E79] shadow-sm lg:hidden"
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
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r border-[#F0E5E5] bg-white p-6 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-[#FAF3F4] lg:hidden"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="mb-10">
          <h2 className="font-serif text-3xl italic text-[#D99CA3]">
            Glowé
          </h2>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
            Admin Portal
          </p>
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
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#FBEDEF] text-[#B76E79]"
                      : "text-gray-600 hover:bg-[#FAF3F4] hover:text-[#B76E79]"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-8">
          <div className="border-t border-[#F0E5E5] pt-5">
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

export default AdminLayout;
