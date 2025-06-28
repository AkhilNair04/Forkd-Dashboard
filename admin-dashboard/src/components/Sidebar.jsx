import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Users", path: "/users" },
    { name: "Chefs", path: "/chefs" },
    { name: "Riders", path: "/riders" },
    { name: "Complaints", path: "/complaints" },
  ];

  return (
    <div className="w-64 h-screen bg-[#1E1E1E] text-white p-6">
      <h2 className="text-2xl font-bold text-primary mb-8">Admin</h2>
      <ul className="space-y-4 text-lg">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`hover:text-primary transition ${
                location.pathname === item.path ? "text-primary font-semibold" : ""
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
