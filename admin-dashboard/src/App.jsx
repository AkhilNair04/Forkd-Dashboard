import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Chefs from './pages/Chefs';
import Rider from './pages/Rider'; 
import Users from './pages/Users';
import Complaints from './pages/Complaints';
function App() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/chefs" element={isLoggedIn ? <Chefs /> : <Navigate to="/" />} />
        <Route path="/riders" element={isLoggedIn ? <Rider /> : <Navigate to="/" />} /> 
        <Route path="/users" element={isLoggedIn ? <Users /> : <Navigate to="/" />} /> 
        <Route path="/complaints" element={isLoggedIn ? <Complaints /> : <Navigate to="/" />} /> 
      </Routes>
    </Router>
  );
}

export default App;