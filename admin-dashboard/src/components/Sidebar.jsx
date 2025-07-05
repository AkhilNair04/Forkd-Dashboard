import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ChefHat,
  Bike,
  AlertOctagon,
  UtensilsCrossed,
  ClipboardList,
  CreditCard,
  BarChart,
  LogOut,
  UserCircle,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminLoggedIn");
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/users", label: "Users", icon: <Users size={18} /> },
    { path: "/chefs", label: "Chefs", icon: <ChefHat size={18} /> },
    { path: "/riders", label: "Riders", icon: <Bike size={18} /> },
    { path: "/complaints", label: "Complaints", icon: <AlertOctagon size={18} /> },

    // { path: "/orders", label: "Orders", icon: <ClipboardList size={18} /> },
    // { path: "/dishes", label: "Dishes", icon: <UtensilsCrossed size={18} /> },
    // { path: "/transactions", label: "Transactions", icon: <CreditCard size={18} /> },
    // { path: "/analytics", label: "Analytics", icon: <BarChart size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] text-white p-6 min-h-screen">
      {/* Logo & Admin */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-primary mb-1">🍴 Fork’d Admin </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <UserCircle size={30} />
        Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <ul className="space-y-4 text-base font-medium">
        {navItems.map(({ path, label, icon }) => (
          <li key={path}>
            <Link
              to={path}
              className={`flex items-center gap-3 hover:text-primary transition ${
                location.pathname === path ? "text-primary" : "text-white"
              }`}
            >
              {icon}
              {label}
            </Link>
          </li>
        ))}

        {/* Logout */}
        <li className="pt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-400 text-left w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}