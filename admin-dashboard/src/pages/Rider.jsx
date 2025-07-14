import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Riders() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [banned, setBanned] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("");
  const [detailsModal, setDetailsModal] = useState(null);
  const [detailsHistory, setDetailsHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRiders() {
      const { data, error } = await supabase.from("Rider_Details").select("*");
      if (error) return console.error("Supabase error:", error);

      setRequests(data.filter(r => r.status?.toLowerCase() === "pending"));
      setApproved(data.filter(r => r.status?.toLowerCase() === "approved"));
      setDenied(data.filter(r => r.status?.toLowerCase() === "denied" || r.status?.toLowerCase() === "rejected"));
      setSuspended(data.filter(r => r.status?.toLowerCase() === "suspended"));
      setBanned(data.filter(r => r.status?.toLowerCase() === "banned"));

      const { data: history } = await supabase.from("Rider_History").select("*").order('timestamp', { ascending: false });
      setHistoryTab(history || []);
    }
    fetchRiders();
  }, []);

  // Approve selected
  const handleBulkApprove = async () => {
    for (let id of selectedRiders) {
      await supabase
        .from("Rider_Details")
        .update({
          status: "approved",
          is_active: true,
          delivery_status: "approved",
        })
        .eq("id", id);
      await supabase.from("Rider_History").insert({
        rider_id: id, 
        action: "Approved", 
        reason: "",
        timestamp: new Date().toISOString()
      });
    }
    window.location.reload();
  };

  // Show reject reason modal
  const handleBulkReject = () => setShowReasonPrompt(true);

  // Reject selected
  const handleSubmitBulkReject = async () => {
    for (let id of selectedRiders) {
      await supabase
        .from("Rider_Details")
        .update({
          status: "denied",
          is_active: false,
          delivery_status: "denied",
          rejection_reason: rejectionReason,
        })
        .eq("id", id);
      await supabase.from("Rider_History").insert({
        rider_id: id, 
        action: "Denied", 
        reason: rejectionReason,
        timestamp: new Date().toISOString()
      });
    }
    setShowReasonPrompt(false);
    setRejectionReason("");
    window.location.reload();
  };

  // Checkbox logic
  const handleSelect = (id) => {
    setSelectedRiders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const list = getList().map((r) => r.id);
    setSelectedRiders(selectedRiders.length === list.length ? [] : list);
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRiders([]);
  };

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    if (activeTab === "suspended") return suspended;
    if (activeTab === "banned") return banned;
    if (activeTab === "history") return [];
    return denied;
  };

  // Ban/suspend/reactivate
  const handleRowAction = (rider, type) => {
    setSelectedRiders([rider.id]);
    setActionType(type);
    setActionReason("");
    setSuspendDuration("");
    setShowActionModal(true);
  };

  const handleActionConfirm = async () => {
    const id = selectedRiders[0];
    if (actionType === "ban") {
      await supabase
        .from("Rider_Details")
        .update({ 
          status: "banned", 
          is_active: false, 
          ban_reason: actionReason,
          suspension_reason: null,
          suspension_until: null
        })
        .eq("id", id);
      await supabase.from("Rider_History").insert({
        rider_id: id, 
        action: "Banned", 
        reason: actionReason,
        timestamp: new Date().toISOString()
      });
    } else if (actionType === "suspend") {
      const until = dayjs().add(Number(suspendDuration), "day").toISOString();
      await supabase
        .from("Rider_Details")
        .update({
          status: "suspended",
          is_active: false,
          suspension_reason: actionReason,
          suspension_until: until,
          ban_reason: null
        })
        .eq("id", id);
      await supabase.from("Rider_History").insert({
        rider_id: id,
        action: `Suspended ${suspendDuration}d`,
        reason: actionReason,
        duration: suspendDuration,
        timestamp: new Date().toISOString()
      });
    } else if (actionType === "reactivate") {
      await supabase
        .from("Rider_Details")
        .update({
          status: "approved",
          is_active: true,
          suspension_reason: null,
          suspension_until: null,
          ban_reason: null,
        })
        .eq("id", id);
      await supabase.from("Rider_History").insert({
        rider_id: id, 
        action: "Reactivated", 
        reason: "",
        timestamp: new Date().toISOString()
      });
    }
    setShowActionModal(false);
    setSelectedRiders([]);
    setActionType("");
    setActionReason("");
    setSuspendDuration("");
    window.location.reload();
  };

  // Return to requests handler
  const handleReturnToRequests = async (rider) => {
    await supabase.from("Rider_Details").update({
      status: "pending",
      is_active: false,
      rejection_reason: null,
      ban_reason: null,
      suspension_reason: null,
      suspension_until: null,
      delivery_status: null
    }).eq("id", rider.id);
    await supabase.from("Rider_History").insert({
      rider_id: rider.id, 
      action: "Returned to Requests", 
      reason: "",
      timestamp: new Date().toISOString()
    });
    window.location.reload();
  };

  // Rider details modal
  const handleRowClick = async (rider) => {
    setDetailsModal(rider);
    const { data } = await supabase.from("Rider_History").select("*").eq("rider_id", rider.id).order('timestamp', { ascending: false });
    setDetailsHistory(data || []);
  };

  // Chat navigation
  const handleChatNavigation = (riderId) => {
    navigate(`/chat/${riderId}`);
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
        <h1 className="text-3xl font-bold text-primary mb-6">Riders Management</h1>
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

        {activeTab === "requests" && (
          <div className="flex gap-4 mb-4">
            <button
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={selectedRiders.length === 0}
              onClick={handleBulkApprove}
            >
              Approve Selected
            </button>
            <button
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              disabled={selectedRiders.length === 0}
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
                        checked={selectedRiders.length === getList().length && getList().length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">Profile Pic</th>}
                  <th className="px-3 py-2 text-left align-middle">Name</th>
                  <th className="px-3 py-2 text-left align-middle">Aadhar</th>
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">Aadhar Image</th>}
                  <th className="px-3 py-2 text-left align-middle">License Number</th>
                  {activeTab === "requests" && <th className="px-3 py-2 text-left align-middle">License Image</th>}
                  <th className="px-3 py-2 text-left align-middle">Status</th>
                  {activeTab === "denied" && (
                    <th className="px-3 py-2 text-left align-middle">Rejection Reason</th>
                  )}
                  {activeTab === "suspended" && (
                    <th className="px-3 py-2 text-left align-middle">Suspended Until</th>
                  )}
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
                      No riders in this category.
                    </td>
                  </tr>
                ) : (
                  getList().map((rider) => (
                    <tr key={rider.id} className="border-t border-[#222] hover:bg-[#232323]">
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedRiders.includes(rider.id)}
                            onChange={() => handleSelect(rider.id)}
                          />
                        </td>
                      )}
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 align-middle">
                          {rider.profile_pic_uid ? (
                            <img src={rider.profile_pic_uid} className="w-10 h-10 rounded-full" alt="" />
                          ) : "-"}
                        </td>
                      )}
                      <td className="px-3 py-2 align-middle cursor-pointer" onClick={() => handleRowClick(rider)}>
                        {rider.name || "-"}
                      </td>
                      <td className="px-3 py-2 align-middle">{rider.aadhar || "-"}</td>
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 align-middle">
                          {rider.aadhar_img ? (
                            <img src={rider.aadhar_img} className="w-16 h-10 rounded" alt="" />
                          ) : "-"}
                        </td>
                      )}
                      <td className="px-3 py-2 align-middle">{rider.license_number || "-"}</td>
                      {activeTab === "requests" && (
                        <td className="px-3 py-2 align-middle">
                          {rider.license_image ? (
                            <img src={rider.license_image} className="w-16 h-10 rounded" alt="" />
                          ) : "-"}
                        </td>
                      )}
                      <td className="px-3 py-2 align-middle">{rider.status || "-"}</td>
                      {activeTab === "denied" && (
                        <td className="px-3 py-2 align-middle text-red-400">
                          {rider.rejection_reason || "-"}
                        </td>
                      )}
                      {activeTab === "suspended" && (
                        <td className="px-3 py-2 align-middle text-yellow-400">
                          {rider.suspension_until ? dayjs(rider.suspension_until).format("DD MMM YYYY") : "-"}
                        </td>
                      )}
                      {(activeTab !== "requests" && activeTab !== "history") && (
                        <td className="px-3 py-2 align-middle">
                          <button
                            className="bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded text-xs"
                            onClick={() => handleReturnToRequests(rider)}
                          >
                            Return
                          </button>
                        </td>
                      )}
                      {(activeTab === "approved" || activeTab === "suspended" || activeTab === "banned") && (
                        <td className="px-3 py-2 flex flex-wrap gap-2 items-center align-middle min-w-[180px]">
                          {rider.status !== "banned" && (
                            <button 
                              onClick={() => handleRowAction(rider, "ban")}
                              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                            >
                              Ban
                            </button>
                          )}
                          {rider.status !== "suspended" && (
                            <button 
                              onClick={() => handleRowAction(rider, "suspend")}
                              className="bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded text-sm"
                            >
                              Suspend
                            </button>
                          )}
                          <button 
                            onClick={() => handleChatNavigation(rider.id)}
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                          >
                            Chat
                          </button>
                          {(rider.status === "banned" || rider.status === "suspended") && (
                            <button 
                              onClick={() => handleRowAction(rider, "reactivate")}
                              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-sm"
                            >
                              Reactivate
                            </button>
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
                      {h.rider_id} ({dayjs(h.timestamp).format('DD MMM YYYY HH:mm')})
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
                  setSelectedRiders([]);
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
                    setSelectedRiders([]);
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
                {actionType === "ban" && "Ban Rider"}
                {actionType === "suspend" && "Suspend Rider"}
                {actionType === "reactivate" && "Reactivate Rider"}
              </h3>
              {(actionType === "ban" || actionType === "suspend") && (
                <textarea 
                  value={actionReason} 
                  onChange={e => setActionReason(e.target.value)} 
                  placeholder="Enter reason..." 
                  className="w-full p-3 rounded bg-gray-800 text-white resize-none focus:outline-none mb-3" 
                  rows={3} 
                />
              )}
              {actionType === "suspend" && (
                <input 
                  type="number" 
                  value={suspendDuration} 
                  min={1} 
                  onChange={e => setSuspendDuration(e.target.value)} 
                  placeholder="Suspension duration (days)" 
                  className="w-full p-3 rounded bg-gray-800 text-white mb-3" 
                />
              )}
              <button 
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleActionConfirm}
                disabled={(actionType === "ban" && !actionReason.trim()) || (actionType === "suspend" && (!actionReason.trim() || !suspendDuration))}
              >
                Confirm
              </button>
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
                  <img src={detailsModal.profile_pic_uid} className="w-16 h-16 rounded-full" alt="Profile" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">-</div>
                )}
                <div>
                  <div className="font-bold">Aadhar:</div>
                  <div>{detailsModal.aadhar || "-"}</div>
                  <div className="font-bold">License:</div>
                  <div>{detailsModal.license_number || "-"}</div>
                  <div className="font-bold">Status:</div>
                  <div>{detailsModal.status || "-"}</div>
                  {detailsModal.status === "suspended" && (
                    <>
                      <div className="font-bold">Suspended Until:</div>
                      <div>{dayjs(detailsModal.suspension_until).format("DD MMM YYYY")}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div>
                  <div className="font-bold">Aadhar Image:</div>
                  {detailsModal.aadhar_img ? (
                    <img src={detailsModal.aadhar_img} className="w-32 h-20 rounded mb-2" alt="Aadhar" />
                  ) : "-"}
                  <div className="font-bold">License Image:</div>
                  {detailsModal.license_image ? (
                    <img src={detailsModal.license_image} className="w-32 h-20 rounded" alt="License" />
                  ) : "-"}
                </div>
              </div>
              <hr className="my-2 border-gray-700" />
              <div>
                <h3 className="font-semibold mb-2">Chat:</h3>
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-2"
                  onClick={() => handleChatNavigation(detailsModal.id)}
                >
                  Open Chat
                </button>
              </div>
              <hr className="my-2 border-gray-700" />
              <div>
                <h3 className="font-semibold mb-2">Action History:</h3>
                <ul className="max-h-32 overflow-y-auto">
                  {detailsHistory.length > 0 ? detailsHistory.map(h => (
                    <li key={h.id} className="border-b border-[#444] py-1 text-xs">
                      {h.action} - {h.reason} 
                      <span className="text-gray-500"> ({dayjs(h.timestamp).format('DD MMM YYYY HH:mm')})</span>
                    </li>
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