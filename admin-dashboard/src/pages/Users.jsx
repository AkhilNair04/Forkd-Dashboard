import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('User_Details').select('*');
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "banned": return "text-red-500";
      case "suspended": return "text-yellow-400";
      default: return "text-green-400";
    }
  };

  // Use DB field for status, or default to active
  const filteredUsers = users.filter((u) => {
    if (searchId && !u.id?.toLowerCase().includes(searchId.toLowerCase())) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return u.status === "active";
    if (statusFilter === "ban") return u.status === "banned";
    if (statusFilter === "suspend") return u.status === "suspended";
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#111] text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Users</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search by User ID"
            className="p-2 rounded bg-gray-800 text-white w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="ban">Banned</option>
            <option value="suspend">Suspended</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-[#1F1F1F] p-4 rounded shadow cursor-pointer hover:ring ring-primary"
              onClick={() => setSelectedUser(user)}
            >
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-400">@{user.username}</p>
              <p className="text-sm">ID: {user.id}</p>
              <p className="text-sm">State: {user.state}</p>
              <p className="text-sm">District: {user.district}</p>
              <p className={`text-sm font-semibold ${statusColor(user.status ?? "active")}`}>Status: {user.status ?? "active"}</p>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] rounded-lg p-6 w-[90%] max-w-lg relative">
              <button
                className="absolute top-3 right-4 text-white text-xl"
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
              <h2 className="text-xl text-center font-semibold mb-2">{selectedUser.name}</h2>
              <p className="text-sm text-center text-gray-400 mb-4">@{selectedUser.username}</p>
              <div className="text-sm space-y-1">
                <p>User ID: {selectedUser.id}</p>
                <p>User Type: {selectedUser.type}</p>
                <p>State: {selectedUser.state}</p>
                <p>District: {selectedUser.district}</p>
                <p>Status: {selectedUser.status ?? "active"}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-primary flex-1 rounded px-4 py-2"
                  onClick={() => navigate(`/chat/${selectedUser.id}`)}
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}