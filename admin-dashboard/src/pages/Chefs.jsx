import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";

// CHOOSE THIS BASED ON YOUR TABLE COLUMN: "status" or "decision"
const STATUS_FIELD = "decision"; // <--- CHANGE if your column is 'status'!

// Helper for logging to Chef_History
async function logChefHistory({ chef_id, action, reason = "", duration = null }) {
  const { error } = await supabase.from("Chef_History").insert({
    chef_id,
    action,
    reason,
    duration,
    timestamp: new Date().toISOString()
  });
  if (error) {
    alert("Chef_History insert error: " + error.message);
    console.error(error);
  }
}

export default function Chefs() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [banned, setBanned] = useState([]);
  const [selectedChefs, setSelectedChefs] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "ban" | "suspend" | "reactivate"
  const [actionReason, setActionReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("");
  const [detailsModal, setDetailsModal] = useState(null);
  const [detailsHistory, setDetailsHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to build status/decision update object
  const statusObj = (value, extra = {}) => ({ [STATUS_FIELD]: value, ...extra });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("Chef").select("*");
      if (error) {
        alert("Supabase fetch error: " + error.message);
        setLoading(false); return;
      }
      setRequests(data.filter(c => !c[STATUS_FIELD] || c[STATUS_FIELD].toLowerCase() === "pending"));
      setApproved(data.filter(c => c[STATUS_FIELD]?.toLowerCase() === "approved"));
      setDenied(data.filter(c => ["rejected", "denied"].includes((c[STATUS_FIELD] || "").toLowerCase())));
      setSuspended(data.filter(c => c[STATUS_FIELD]?.toLowerCase() === "suspended"));
      setBanned(data.filter(c => c[STATUS_FIELD]?.toLowerCase() === "banned"));
      const { data: history } = await supabase
        .from("Chef_History")
        .select("*")
        .order('timestamp', { ascending: false });
      setHistoryTab(history || []);
      setLoading(false);
    })();
  }, []);

  // Approve selected
  const handleBulkApprove = async () => {
    setLoading(true);
    for (let id of selectedChefs) {
      const { error } = await supabase
        .from("Chef")
        .update(statusObj("approved", { is_verified: true }))
        .eq("id", id);
      if (error) alert("Supabase approve error: " + error.message);
      await logChefHistory({ chef_id: id, action: "Approved" });
    }
    window.location.reload();
  };

  // Reject selected (reason modal first)
  const handleBulkReject = () => setShowReasonPrompt(true);

  const handleSubmitBulkReject = async () => {
    setLoading(true);
    for (let id of selectedChefs) {
      const { error } = await supabase
        .from("Chef")
        .update(statusObj("rejected", { is_verified: false, rejection_reason: rejectionReason }))
        .eq("id", id);
      if (error) alert("Supabase reject error: " + error.message);
      await logChefHistory({ chef_id: id, action: "Rejected", reason: rejectionReason });
    }
    setShowReasonPrompt(false);
    setRejectionReason("");
    window.location.reload();
  };

  // Table select helpers
  const handleSelect = (id) => setSelectedChefs((prev) =>
    prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
  );
  const handleSelectAll = () => {
    const list = getList().map((c) => c.id);
    setSelectedChefs(selectedChefs.length === list.length ? [] : list);
  };
  const onTabChange = (tab) => { setActiveTab(tab); setSelectedChefs([]); };
  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    if (activeTab === "suspended") return suspended;
    if (activeTab === "banned") return banned;
    if (activeTab === "history") return [];
    return denied;
  };

  // Ban/Suspend/Reactivate
  const handleRowAction = (chef, type) => {
    setSelectedChefs([chef.id]);
    setActionType(type);
    setActionReason("");
    setSuspendDuration("");
    setShowActionModal(true);
  };
  const handleActionConfirm = async () => {
    setLoading(true);
    const id = selectedChefs[0];
    let error = null;
    if (actionType === "ban") {
      const { error: updateError } = await supabase
        .from("Chef")
        .update(statusObj("banned", { is_verified: false, ban_reason: actionReason }))
        .eq("id", id);
      error = updateError;
      await logChefHistory({ chef_id: id, action: "Banned", reason: actionReason });
    } else if (actionType === "suspend") {
      const until = dayjs().add(Number(suspendDuration), "day").toISOString();
      const { error: updateError } = await supabase
        .from("Chef")
        .update(statusObj("suspended", {
          is_verified: false,
          suspension_reason: actionReason,
          suspension_until: until,
        }))
        .eq("id", id);
      error = updateError;
      await logChefHistory({
        chef_id: id,
        action: `Suspended ${suspendDuration}d`,
        reason: actionReason,
        duration: suspendDuration
      });
    } else if (actionType === "reactivate") {
      const { error: updateError } = await supabase
        .from("Chef")
        .update(statusObj("approved", {
          is_verified: true,
          suspension_reason: null,
          suspension_until: null,
          ban_reason: null,
        }))
        .eq("id", id);
      error = updateError;
      await logChefHistory({ chef_id: id, action: "Reactivated" });
    }
    if (error) {
      alert("Supabase error: " + error.message);
      console.error(error);
    }
    setShowActionModal(false);
    setSelectedChefs([]);
    setActionType("");
    setActionReason("");
    setSuspendDuration("");
    window.location.reload();
  };

  // Return to requests handler
  const handleReturnToRequests = async (chef) => {
    setLoading(true);
    const { error } = await supabase.from("Chef").update(statusObj("pending", {
      is_verified: false,
      rejection_reason: null,
      ban_reason: null,
      suspension_reason: null,
      suspension_until: null,
      aadhar: null,
      fssai_licence_img: null,
      pcc_certificate: null,
    })).eq("id", chef.id);
    await logChefHistory({ chef_id: chef.id, action: "Returned to Requests" });
    if (error) {
      alert("Supabase return error: " + error.message);
      console.error(error);
    }
    window.location.reload();
  };

  // Chef details modal
  const handleRowClick = async (chef) => {
    setDetailsModal(chef);
    const { data } = await supabase.from("Chef_History").select("*").eq("chef_id", chef.id).order('timestamp', { ascending: false });
    setDetailsHistory(data || []);
  };

  const tabList = [
    { key: "requests", label: "Requests" },
    { key: "approved", label: "Approved" },
    { key: "denied", label: "Rejected" },
    { key: "suspended", label: "Suspended" },
    { key: "banned", label: "Banned" },
    { key: "history", label: "Admin History" }
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Chefs Management</h1>
        <div className="flex flex-wrap w-full gap-2 mb-6">
          {tabList.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                activeTab === tab.key ? "bg-primary text-white" : "bg-gray-800"
              }`}
              onClick={() => onTabChange(tab.key)}
            >{tab.label}</button>
          ))}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="text-white text-lg font-semibold">Loading...</div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="flex gap-4 mb-4">
            <button
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={selectedChefs.length === 0}
              onClick={handleBulkApprove}
            >
              Approve Selected
            </button>
            <button
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              disabled={selectedChefs.length === 0}
              onClick={handleBulkReject}
            >
              Reject Selected
            </button>
          </div>
        )}

        {activeTab !== "history" ? (
          <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
            <table className="min-w-full">
              <thead>
                <tr>
                  {activeTab === "requests" && (
                    <th className="px-3 py-2 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedChefs.length === getList().length && getList().length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">Profile Pic</th>}
                  <th className="px-3 py-2 text-left align-middle">Name</th>
                  <th className="px-3 py-2 text-left align-middle">Aadhar No.</th>
                  <th className="px-3 py-2 text-left align-middle">FSSAI License No.</th>
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">Aadhar</th>}
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">FSSAI License</th>}
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">PCC Certificate</th>}
                  {(activeTab !== "requests" && activeTab !== "history") && <th className="px-3 py-2 text-left align-middle">Return</th>}
                  {(activeTab === "approved" ||
                    activeTab === "suspended" ||
                    activeTab === "banned") && <th className="px-14 py-2 text-left align-middle">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {getList().length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "requests" ? 11 : 10}
                      className="text-center py-8 text-gray-400"
                    >
                      No chefs in this category.
                    </td>
                  </tr>
                ) : (
                  getList().map((chef) => (
                    <tr key={chef.id} className="border-t border-[#222] hover:bg-[#232323]">
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedChefs.includes(chef.id)}
                            onChange={() => handleSelect(chef.id)}
                          />
                        </td>
                      )}
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 align-middle">{chef.profile_pic_uid ? <img src={chef.profile_pic_uid} className="w-10 h-10 rounded-full" alt="" /> : "-"}</td>
                      )}
                      <td className="px-3 py-2 align-middle cursor-pointer" onClick={() => handleRowClick(chef)}>{chef.name || "-"}</td>
                      <td className="px-3 py-2 align-middle">{chef.aadhar_number || "-"}</td>
                      <td className="px-3 py-2 align-middle">{chef.fssai_number || "-"}</td>
                      {activeTab === "requests" && (
                        <>
                          <td className="px-3 py-2 align-middle">{chef.aadhar ? <img src={chef.aadhar} className="w-16 h-10 rounded" alt="" /> : "-"}</td>
                          <td className="px-3 py-2 align-middle">{chef.fssai_licence_img ? <img src={chef.fssai_licence_img} className="w-16 h-10 rounded" alt="" /> : "-"}</td>
                          <td className="px-3 py-2 align-middle">{chef.pcc_certificate ? <img src={chef.pcc_certificate} className="w-16 h-10 rounded" alt="" /> : "-"}</td>
                        </>
                      )}
                      {(activeTab !== "requests" && activeTab !== "history") && (
                        <td className="px-3 py-2 align-middle">
                          <button
                            className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-xs"
                            onClick={() => handleReturnToRequests(chef)}
                          >Return</button>
                        </td>
                      )}
                      {(activeTab === "approved" || activeTab === "suspended" || activeTab === "banned") && (
                        <td className="px-3 py-2 flex flex-wrap gap-2 items-center align-middle min-w-[180px]">
                          {chef[STATUS_FIELD]?.toLowerCase() !== "banned" && (
                            <button onClick={() => handleRowAction(chef, "ban")}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm">Ban</button>
                          )}
                          {chef[STATUS_FIELD]?.toLowerCase() !== "suspended" && (
                            <button onClick={() => handleRowAction(chef, "suspend")}
                              className="bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded text-sm">Suspend</button>
                          )}
                          <button onClick={() => handleRowClick(chef)}
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm">Chat</button>
                          {(chef[STATUS_FIELD]?.toLowerCase() === "banned" || chef[STATUS_FIELD]?.toLowerCase() === "suspended") && (
                            <button onClick={() => handleRowAction(chef, "reactivate")}
                              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm">Reactivate</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#1F1F1F] p-4 rounded-lg">
            <h3 className="text-xl mb-2">All Admin Actions</h3>
            <ul className="divide-y divide-[#222]">
              {historyTab.length > 0
                ? historyTab.map(h => (
                  <li key={h.id} className="py-2 text-sm">
                    <b>{h.action}</b> {h.reason ? `— ${h.reason}` : ""}
                    <span className="text-gray-400 ml-2">
                      {h.chef_id} ({dayjs(h.timestamp).format('DD MMM YYYY HH:mm')})
                    </span>
                  </li>
                ))
                : <li className="text-gray-400">No actions found.</li>
              }
            </ul>
          </div>
        )}

        {/* Reject modal */}
        {showReasonPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] p-6 rounded-xl w-[90%] max-w-md text-white relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => {
                  setShowReasonPrompt(false);
                  setSelectedChefs([]);
                  setRejectionReason("");
                }}
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Reason for Rejection
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full p-3 rounded bg-gray-800 text-white resize-none focus:outline-none"
                rows={4}
              />
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                  onClick={() => {
                    setShowReasonPrompt(false);
                    setSelectedChefs([]);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                  onClick={handleSubmitBulkReject}
                  disabled={!rejectionReason.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ban/Suspend/Reactivate modal */}
        {showActionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#232323] p-6 rounded-xl w-[90%] max-w-md text-white relative">
              <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" onClick={() => setShowActionModal(false)}>✕</button>
              <h3 className="text-lg font-semibold mb-4">
                {actionType === "ban" && "Ban Chef"}
                {actionType === "suspend" && "Suspend Chef"}
                {actionType === "reactivate" && "Reactivate Chef"}
              </h3>
              {(actionType === "ban" || actionType === "suspend") && (
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="Enter reason..." className="w-full p-3 rounded bg-gray-800 text-white resize-none focus:outline-none mb-3" rows={3} />
              )}
              {actionType === "suspend" && (
                <input type="number" value={suspendDuration} min={1} onChange={e => setSuspendDuration(e.target.value)} placeholder="Suspension duration (days)" className="w-full p-3 rounded bg-gray-800 text-white mb-3" />
              )}
              <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleActionConfirm}
                disabled={(actionType === "ban" && !actionReason.trim()) || (actionType === "suspend" && (!actionReason.trim() || !suspendDuration))}
              >Confirm</button>
            </div>
          </div>
        )}

        {/* Details + Chat/History modal */}
        {detailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-[#232323] p-6 rounded-xl w-[95vw] max-w-2xl text-white relative">
              <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" onClick={() => setDetailsModal(null)}>✕</button>
              <h2 className="text-2xl font-bold mb-2">{detailsModal.name}'s Profile</h2>
              <div className="flex gap-4 mb-2">
                {detailsModal.profile_pic_uid ? (
                  <img src={detailsModal.profile_pic_uid} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">-</div>
                )}
                <div>
                  <div className="font-bold">Aadhar No:</div>
                  <div>{detailsModal.aadhar_number || "-"}</div>
                  <div className="font-bold">FSSAI License No:</div>
                  <div>{detailsModal.fssai_number || "-"}</div>
                  <div className="font-bold">Status:</div>
                  <div>{detailsModal[STATUS_FIELD] || "-"}</div>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div>
                  <div className="font-bold">Aadhar:</div>
                  {detailsModal.aadhar ? (
                    <img src={detailsModal.aadhar} className="w-32 h-20 rounded mb-2" />
                  ) : "-"}
                  <div className="font-bold">FSSAI License:</div>
                  {detailsModal.fssai_licence_img ? (
                    <img src={detailsModal.fssai_licence_img} className="w-32 h-20 rounded" />
                  ) : "-"}
                  <div className="font-bold">PCC Certificate:</div>
                  {detailsModal.pcc_certificate ? (
                    <img src={detailsModal.pcc_certificate} className="w-32 h-20 rounded" />
                  ) : "-"}
                </div>
              </div>
              <hr className="my-2 border-gray-700" />
              <div>
                <h3 className="font-semibold mb-2">Mock Chat (not functional):</h3>
                <div className="bg-[#181818] rounded p-2 mb-2 h-32 overflow-y-auto text-gray-400">Chat with this chef will appear here.</div>
              </div>
              <hr className="my-2 border-gray-700" />
              <div>
                <h3 className="font-semibold mb-2">Action History:</h3>
                <ul className="max-h-32 overflow-y-auto">
                  {detailsHistory.length > 0 ? detailsHistory.map(h => (
                    <li key={h.id} className="border-b border-[#444] py-1 text-xs">{h.action} - {h.reason} <span className="text-gray-500">({dayjs(h.timestamp).format('DD MMM YYYY HH:mm')})</span></li>
                  )) : <li className="text-gray-400">No actions found.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
