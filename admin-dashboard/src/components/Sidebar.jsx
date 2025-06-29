import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminLoggedIn');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/users', label: 'Users' },
    { path: '/chefs', label: 'Chefs' },
    { path: '/riders', label: 'Riders' },
    { path: '/complaints', label: 'Complaints' },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold text-primary mb-8">Admin</h2>
      <ul className="space-y-4 text-lg">
        {navItems.map(({ path, label }) => (
          <li key={path}>
            <Link
              to={path}
              className={`hover:text-primary ${
                location.pathname === path ? 'text-primary' : 'text-white'
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-400 text-left w-full"
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}