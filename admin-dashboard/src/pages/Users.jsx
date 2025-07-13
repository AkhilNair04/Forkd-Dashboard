import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

async function logUserHistory({ user_id, action, reason = "", duration = null }) {
  const { error } = await supabase.from("User_History").insert({
    user_id,
    action,
    reason,
    duration,
    timestamp: new Date().toISOString(),
  });
  if (error) {
    alert("User_History insert error: " + error.message);
    console.error(error);
  }
}

export default function SuperUsers() {
  const navigate = useNavigate();
  const [superUsers, setSuperUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const { data: users } = await supabase
        .from("user_profiles")
        .select("user_id, full_name, user_type, status, suspended_until");

      const merged = (users || []).map((u) => ({
        id: u.user_id,
        name: u.full_name,
        type: u.user_type || "User",
        status: u.status ?? "active",
        suspended_until: u.suspended_until,
      }));

      setSuperUsers(merged);
    }
    fetchAll();
  }, [refresh]);

  const filtered = superUsers.filter((u) => {
    if (
      search &&
      !String(u.id).toLowerCase().includes(search.toLowerCase()) &&
      !(u.name || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusFilter === "all") return true;
    return (u.status ?? "active") === statusFilter;
  });

  const statusColor = (status) => {
    const s = typeof status === "string" ? status.toLowerCase() : "active";
    if (s === "banned") return "text-red-500";
    if (s === "suspended") return "text-yellow-400";
    if (s === "active") return "text-green-400";
    return "text-white";
  };

  const updateStatus = async (user, newStatus, suspendDays = null, reason = "") => {
    let updates = { status: newStatus };
    let duration = null;

    if (newStatus === "suspended" && suspendDays) {
      const now = new Date();
      const until = new Date(now.getTime() + Number(suspendDays) * 24 * 60 * 60 * 1000);
      updates.suspended_until = until.toISOString();
      updates.suspension_reason = reason;
      updates.ban_reason = null;
      duration = suspendDays;
    } else if (newStatus === "banned") {
      updates.suspended_until = null;
      updates.ban_reason = reason;
      updates.suspension_reason = null;
    } else {
      updates.suspended_until = null;
      updates.suspension_reason = null;
      updates.ban_reason = null;
    }

    await supabase.from("user_profiles").update(updates).eq("user_id", user.id);

    await logUserHistory({
      user_id: user.id,
      action: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      reason,
      duration,
    });

    setRefresh((r) => !r);
  };

  useEffect(() => {
    async function autoReactivate() {
      for (const user of superUsers) {
        if (user.status === "suspended" && user.suspended_until) {
          const now = new Date();
          const until = new Date(user.suspended_until);
          if (now > until) {
            await supabase
              .from("user_profiles")
              .update({
                status: "active",
                suspended_until: null,
                suspension_reason: null,
                ban_reason: null,
              })
              .eq("user_id", user.id);

            await logUserHistory({
              user_id: user.id,
              action: "Auto-reactivated",
              reason: "Suspension expired",
            });
            setRefresh((r) => !r);
          }
        }
      }
    }
    autoReactivate();
  }, [superUsers]);

  const openProfile = async (user) => {
    setSelected(user);
    const { data } = await supabase
      .from("User_History")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false });
    setUserHistory(data || []);
  };

  return (
    <div className="flex min-h-screen bg-[#111] text-white">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Users</h1>
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name or ID"
            className="p-2 rounded bg-gray-800 text-white w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-[#1F1F1F] p-4 rounded shadow cursor-pointer hover:ring ring-primary"
              onClick={() => openProfile(user)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-gray-700 px-2 py-1 rounded">{user.type}</span>
                <span className={`text-xs font-bold ${statusColor(user.status)}`}>
                  {(user.status ?? "").toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm">ID: {user.id}</p>
              {user.status === "suspended" && user.suspended_until && (
                <p className="text-xs text-yellow-400">Until: {new Date(user.suspended_until).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] rounded-lg p-6 w-[90%] max-w-lg relative">
              <button
                className="absolute top-3 right-4 text-white text-xl"
                onClick={() => { setSelected(null); setUserHistory([]); }}
              >
                &times;
              </button>
              <h2 className="text-xl text-center font-semibold mb-2">{selected.name}</h2>
              <div className="text-sm space-y-1">
                <p>User ID: {selected.id}</p>
                <p>Type: {selected.type}</p>
                <p>Status: {selected.status ?? "active"}</p>
                {selected.status === "suspended" && selected.suspended_until && (
                  <p>Suspended Until: {new Date(selected.suspended_until).toLocaleString()}</p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="bg-primary flex-1 rounded px-4 py-2"
                  onClick={() => navigate(`/chat/${selected.id}`)}
                >
                  Chat
                </button>
                {selected.status !== "banned" && (
                  <button
                    className="bg-red-600 flex-1 rounded px-4 py-2"
                    onClick={async () => {
                      const reason = prompt("Reason for ban:");
                      if (reason && reason.trim()) {
                        await updateStatus(selected, "banned", null, reason);
                        setSelected(null);
                        setUserHistory([]);
                      }
                    }}
                  >
                    Ban
                  </button>
                )}
                {selected.status !== "banned" && selected.status !== "suspended" && (
                  <button
                    className="bg-yellow-500 text-black flex-1 rounded px-4 py-2"
                    onClick={async () => {
                      const reason = prompt("Reason for suspension:");
                      if (!reason || !reason.trim()) return;
                      const days = prompt("Duration of suspension (days):");
                      if (!days || isNaN(days) || Number(days) < 1) return;
                      await updateStatus(selected, "suspended", days, reason);
                      setSelected(null);
                      setUserHistory([]);
                    }}
                  >
                    Suspend
                  </button>
                )}
              </div>
              {selected.status !== "active" && (
                <button
                  className="mt-2 w-full bg-green-600 rounded px-4 py-2"
                  onClick={async () => {
                    await updateStatus(selected, "active", null, "Manual Reactivation");
                    setSelected(null);
                    setUserHistory([]);
                  }}
                >
                  Reactivate
                </button>
              )}
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-primary">Admin Action History</h3>
                <ul className="max-h-40 overflow-y-auto divide-y divide-gray-800 text-xs">
                  {userHistory.length === 0 ? (
                    <li className="text-gray-400">No actions yet.</li>
                  ) : (
                    userHistory.map((h) => (
                      <li key={h.id} className="py-1">
                        <span className="font-bold">{h.action}</span>
                        {h.reason && <> — <span className="italic">{h.reason}</span></>}
                        {h.duration && <> ({h.duration} days)</>}
                        <span className="text-gray-400 ml-2">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}