import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'admin' && password === 'forkd123') {
      localStorage.setItem('adminLoggedIn', 'true');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-dark text-white">
      <div className="bg-[#2A2A2A] p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-6 text-primary">Admin Login</h2>
        <input
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white focus:outline-none"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 mb-6 rounded bg-gray-800 text-white focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-primary py-2 rounded hover:bg-opacity-90 font-semibold"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}