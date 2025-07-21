import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chefs from "./pages/Chef";      
import Rider from "./pages/Rider";
import Users from "./pages/Users";
import Complaints from "./pages/Complaints";
import RiderStatus from "./pages/rider-status";
import ChatPage from "./pages/Chatpage";   


const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function AppLayout({ children }) {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  return (
    <div className="flex min-h-screen">
      {isLoggedIn && location.pathname !== "/login" && <Sidebar />}
      <div className="flex-1">{children}</div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true"
  );

  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(localStorage.getItem("adminLoggedIn") === "true");
    };
    window.addEventListener("storage", updateLoginState);
    return () => window.removeEventListener("storage", updateLoginState);
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Auth */}
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Core pages */}
          <Route
            path="/chefs"
            element={
              <PrivateRoute>
                <Chefs />
              </PrivateRoute>
            }
          />
          <Route
            path="/riders"
            element={
              <PrivateRoute>
                <Rider />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <PrivateRoute>
                <Complaints />
              </PrivateRoute>
            }
          />
          <Route
            path="/rider-status"
            element={
              <PrivateRoute>
                <RiderStatus />
              </PrivateRoute>
            }
          />

          {/* Chat */}
          <Route
            path="/chat/:id"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* Catch‑alls */}
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
          />
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
