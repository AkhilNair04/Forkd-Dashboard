import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const complaints = [
  {
    ticketId: "T001",
    complaintee: {
      id: "user123",
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      district: "Ernakulam",
      state: "Kerala",
      image: "",
      type: "user",
    },
    accused: {
      id: "rider456",
      name: "Ravi Kumar",
      username: "ravik",
      email: "ravi@example.com",
      district: "Chennai",
      state: "Tamil Nadu",
      image: "",
      type: "rider",
    },
    type: "user",
    status: "pending",
    message: "The rider was rude during delivery.",
    observations: "Rider was delayed and showed aggressive behavior.",
    proofs: ["https://via.placeholder.com/150"],
    response: "",
  },
];

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const deriveStatus = (userId) => {
    const last = [...history].reverse().find((h) => h.userId === userId);
    if (!last) return "active";
    if (last.actionType === "reactivate") return "active";
    if (last.actionType === "ban") return "banned";
    if (last.actionType === "suspend") return "suspended";
    return "active";
  };

  const statusColor = (status) => {
    switch (status) {
      case "banned":
        return "text-red-500";
      case "suspended":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  };

  useEffect(() => {
    const complaintUsers = [];
    complaints
      .filter((c) => c.status === "pending")
      .forEach((c) => {
        complaintUsers.push({ ...c.complaintee, ticket: c.ticketId, type: c.type });
        complaintUsers.push({ ...c.accused, ticket: c.ticketId, type: c.type });
      });

    const uniqueUsers = Array.from(
      new Map(complaintUsers.map((u) => [u.id, u])).values()
    ).map((u) => ({ ...u, currentStatus: deriveStatus(u.id) }));

    setUsers(uniqueUsers);
  }, [history]);

  const filteredUsers = users.filter((u) => {
    if (searchId.trim() && !u.id.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return u.currentStatus === "active";
    if (statusFilter === "ban") return u.currentStatus === "banned";
    if (statusFilter === "suspend") return u.currentStatus === "suspended";
    return true;
  });

  const recordAction = (userId, actionType, reason, duration = null) => {
    const now = new Date().toISOString();
    setHistory((prev) => [...prev, { userId, actionType, reason, date: now, duration }]);
  };

  const getUserById = (id) => users.find((u) => u.id === id);

  return (
    <div className="flex min-h-screen bg-[#111] text-white">

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Users</h1>
          <button
            className="px-4 py-2 bg-primary rounded shadow"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "Action History"}
          </button>
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
              <img
                src={user.image || "/default.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full mb-2 object-cover"
              />
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-400">@{user.username}</p>
              <p className="text-sm">ID: {user.id}</p>
              <p className="text-sm">Ticket: {user.ticket}</p>
              <p className="text-sm">State: {user.state}</p>
              <p className="text-sm">District: {user.district}</p>
              <p className={`text-sm font-semibold ${statusColor(user.currentStatus)}`}>Status: {user.currentStatus}</p>
            </div>
          ))}
        </div>

        {showHistory && (
          <div className="mt-10 bg-[#1F1F1F] p-4 rounded max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-3 text-primary">Action History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No actions yet.</p>
            ) : (
              history.map((h, idx) => {
                const user = getUserById(h.userId);
                return (
                  <div
                    key={idx}
                    className="text-sm mb-4 p-2 border-b border-gray-700 cursor-pointer hover:text-primary"
                    onClick={() => setSelectedUser(user)}
                  >
                    <p>
                      <strong className="capitalize">{h.actionType}</strong> — User: {h.userId} — {h.reason} — {new Date(h.date).toLocaleString()} {h.duration && ` (Duration: ${h.duration} days)`}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] rounded-lg p-6 w-[90%] max-w-lg relative">
              <button
                className="absolute top-3 right-4 text-white text-xl"
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
              <img
                src={selectedUser.image || "/default.png"}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover mb-4 mx-auto"
              />
              <h2 className="text-xl text-center font-semibold mb-2">{selectedUser.name}</h2>
              <p className="text-sm text-center text-gray-400 mb-4">@{selectedUser.username}</p>
              <div className="text-sm space-y-1">
                <p>User ID: {selectedUser.id}</p>
                <p>User Type: {selectedUser.type}</p>
                <p>State: {selectedUser.state}</p>
                <p>District: {selectedUser.district}</p>
                <p>Ticket ID: {selectedUser.ticket}</p>
                <p>Status: {selectedUser.currentStatus}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-1">Previous Actions:</h3>
                {history.filter(h => h.userId === selectedUser.id).length === 0 ? (
                  <p className="text-gray-400 text-sm">None</p>
                ) : (
                  history.filter(h => h.userId === selectedUser.id).map((h, idx) => (
                    <p key={idx} className="text-xs mb-1">• {h.actionType} — {h.reason} — {new Date(h.date).toLocaleString()}</p>
                  ))
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-primary flex-1 rounded px-4 py-2"
                  onClick={() => navigate(`/chat/${selectedUser.id}`)}
                >
                  Chat
                </button>
                <button
                  className="bg-red-600 flex-1 rounded px-4 py-2"
                  onClick={() => {
                    const reason = prompt("Reason for ban:");
                    const duration = prompt("Ban duration (days):");
                    if (reason && duration) {
                      recordAction(selectedUser.id, "ban", reason, duration);
                      setSelectedUser(null);
                    }
                  }}
                >
                  Ban
                </button>
                <button
                  className="bg-yellow-500 text-black flex-1 rounded px-4 py-2"
                  onClick={() => {
                    const reason = prompt("Reason for suspension:");
                    const duration = prompt("Duration (days):");
                    if (reason && duration) {
                      recordAction(selectedUser.id, "suspend", reason, duration);
                      setSelectedUser(null);
                    }
                  }}
                >
                  Suspend
                </button>
              </div>
              {selectedUser.currentStatus !== "active" && (
                <button
                  className="mt-2 w-full bg-green-600 rounded px-4 py-2"
                  onClick={() => {
                    recordAction(selectedUser.id, "reactivate", "Account reactivated");
                    setSelectedUser(null);
                  }}
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}