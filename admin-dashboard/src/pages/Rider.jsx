import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Riders() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch riders from DB
  useEffect(() => {
    async function fetchRiders() {
      const { data, error } = await supabase.from('Rider_Details').select('*');
      if (error) {
        console.error("Supabase error:", error);
        return;
      }
      // No status field in schema, so group by is_active (true=pending, false=approved/denied)
      setRequests(data.filter(r => r.is_active)); // show all active as requests
      setApproved(data.filter(r => r.is_active === false && r.delivery_status === 'approved'));
      setDenied(data.filter(r => r.is_active === false && r.delivery_status === 'denied'));
    }
    fetchRiders();
  }, []);

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  // Example: Approve selected riders (update in Supabase)
  const handleBulkApprove = async () => {
    for (let id of selectedRiders) {
      await supabase
        .from("Rider_Details")
        .update({ is_active: false, delivery_status: 'approved' })
        .eq("id", id);
    }
    // Refresh data
    window.location.reload();
  };

  // Example: Reject selected riders (update in Supabase)
  const handleBulkReject = async () => {
    setShowReasonPrompt(true);
  };

  const handleSubmitBulkReject = async () => {
    for (let id of selectedRiders) {
      await supabase
        .from("Rider_Details")
        .update({ is_active: false, delivery_status: 'denied' })
        .eq("id", id);
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Riders Management</h1>
        <div className="flex gap-6 mb-6">
          {["requests", "approved", "denied"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? "bg-primary text-white" : "bg-gray-800"}`}
              onClick={() => onTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
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
        <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
          <table className="min-w-full">
            <thead>
              <tr>
                {activeTab === "requests" && (
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRiders.length === getList().length && getList().length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Aadhar No.</th>
                <th className="px-3 py-2 text-left">Gov ID</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Rating</th>
                <th className="px-3 py-2 text-left">Profile Pic UID</th>
                {activeTab === "approved" && (
                  <th className="px-3 py-2 text-left">Delivery Status</th>
                )}
                {activeTab === "denied" && (
                  <th className="px-3 py-2 text-left">Delivery Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {getList().length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "requests" ? 8 : 7} className="text-center py-8 text-gray-400">
                    No riders in this category.
                  </td>
                </tr>
              ) : (
                getList().map((rider) => (
                  <tr key={rider.id} className="border-t border-[#222] hover:bg-[#232323]">
                    {activeTab === "requests" && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRiders.includes(rider.id)}
                          onChange={() => handleSelect(rider.id)}
                        />
                      </td>
                    )}
                    <td className="px-3 py-2">{rider.name}</td>
                    <td className="px-3 py-2">{rider.aadharNumber || "-"}</td>
                    <td className="px-3 py-2">{rider.gov_id || "-"}</td>
                    <td className="px-3 py-2">{rider.location_details || "-"}</td>
                    <td className="px-3 py-2">{rider.rating_avg || "-"}</td>
                    <td className="px-3 py-2">{rider.profile_pic_uid || "-"}</td>
                    {(activeTab === "approved" || activeTab === "denied") && (
                      <td className="px-3 py-2">{rider.delivery_status}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <h3 className="text-lg font-semibold text-primary mb-4">Reason for Rejection</h3>
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
      </div>
    </div>
  );
}