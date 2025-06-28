import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAction, setSelectedAction] = useState({});
  const [reasons, setReasons] = useState({});
  const [suspendTimers, setSuspendTimers] = useState({});

  useEffect(() => {
    // Simulated data
    const complaintParticipants = [
      { id: 1, name: "Arjun Rao", username: "arjun_rao", ticket: "T001", role: "User", status: "active" },
      { id: 2, name: "Meera Nair", username: "meera_chef", ticket: "T001", role: "Chef", status: "banned" },
      { id: 3, name: "Ravi Kumar", username: "ravi_rider", ticket: "T002", role: "Rider", status: "suspended", suspendUntil: "2025-07-05" }
    ];
    setUsers(complaintParticipants);
  }, []);

  const handleAction = (id, action) => {
    const reason = reasons[id] || "";
    const timer = suspendTimers[id] || null;

    if ((action === "suspend" || action === "ban") && !reason) {
      alert("Please provide a reason for this action.");
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.id === id) {
        let updatedStatus = action;
        if (action === "reactivate") updatedStatus = "active";
        return {
          ...user,
          status: updatedStatus,
          suspendUntil: action === "suspend" ? timer : null,
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setHistory([...history, { id, action, reason, timestamp: new Date().toISOString(), timer }]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.username.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">Users Management</h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or username"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white focus:outline-none"
          />
          <select
            className="bg-gray-800 p-2 rounded"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-[#1F1F1F] p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>{user.name}</strong> (@{user.username})</p>
                  <p>Ticket: {user.ticket}</p>
                  <p>Status: <span className="capitalize">{user.status}</span></p>
                  {user.status === "suspended" && <p className="text-sm text-yellow-500">Suspended until: {user.suspendUntil}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {user.status !== "banned" && user.status !== "suspended" && (
                    <>
                      <select
                        className="bg-gray-700 p-1 rounded"
                        value={selectedAction[user.id] || ""}
                        onChange={e => setSelectedAction({ ...selectedAction, [user.id]: e.target.value })}
                      >
                        <option value="">Select Action</option>
                        <option value="ban">Ban</option>
                        <option value="suspend">Suspend</option>
                      </select>

                      {(selectedAction[user.id] === "ban" || selectedAction[user.id] === "suspend") && (
                        <>
                          <input
                            className="bg-gray-800 p-1 rounded mt-1"
                            placeholder="Reason"
                            value={reasons[user.id] || ""}
                            onChange={e => setReasons({ ...reasons, [user.id]: e.target.value })}
                          />
                          {selectedAction[user.id] === "suspend" && (
                            <input
                              type="date"
                              className="bg-gray-800 p-1 rounded mt-1"
                              onChange={e => setSuspendTimers({ ...suspendTimers, [user.id]: e.target.value })}
                            />
                          )}
                          <button
                            className="bg-red-600 px-3 py-1 rounded mt-2 hover:bg-red-700"
                            onClick={() => handleAction(user.id, selectedAction[user.id])}
                          >
                            Confirm {selectedAction[user.id]}
                          </button>
                        </>
                      )}
                    </>
                  )}
                  {(user.status === "banned" || user.status === "suspended") && (
                    <button
                      className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => handleAction(user.id, "reactivate")}
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-primary">Action History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400">No actions taken yet.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {history.map((entry, idx) => (
                <li key={idx} className="text-gray-300">
                  [{new Date(entry.timestamp).toLocaleString()}] ID {entry.id} - {entry.action.toUpperCase()} - Reason: {entry.reason || "N/A"}
                  {entry.timer && ` - Until: ${entry.timer}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
