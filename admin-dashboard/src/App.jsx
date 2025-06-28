import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Chefs from './pages/Chefs';
import Rider from './pages/Rider'; // ✅ Singular import

function App() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/chefs" element={isLoggedIn ? <Chefs /> : <Navigate to="/" />} />
        <Route path="/riders" element={isLoggedIn ? <Rider /> : <Navigate to="/" />} /> {/* ✅ Use Rider here */}
      </Routes>
    </Router>
  );
}

export default App;