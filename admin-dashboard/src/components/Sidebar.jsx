import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Users" },
    { path: "/chefs", label: "Chefs" },
    { path: "/riders", label: "Riders" },
    { path: "/complaints", label: "Complaints" },
  ];

  return (
    <div className="w-64 bg-[#1E1E1E] text-white p-6">
      <h2 className="text-2xl font-bold text-primary mb-8">Admin</h2>
      <ul className="space-y-4 text-lg">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`hover:text-primary ${
                location.pathname === item.path ? "text-primary" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}