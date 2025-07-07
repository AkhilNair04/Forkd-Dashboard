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
      const { data, error } = await supabase
        .from("Rider_Details")
        .select("id, name, aadhar, gov_id, license_number, license_image, status, rejection_reason");
      if (error) {
        console.error("Supabase error:", error);
        return;
      }
      setRequests(data.filter((r) => r.status?.toLowerCase() === "pending"));
      setApproved(data.filter((r) => r.status?.toLowerCase() === "approved"));
      setDenied(data.filter((r) => r.status?.toLowerCase() === "denied"));
    }
    fetchRiders();
  }, []);

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

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
    }
    window.location.reload();
  };

  // Show reason modal for reject
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
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-primary text-white" : "bg-gray-800"
              }`}
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
                  <th className="px-3 py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={selectedRiders.length === getList().length && getList().length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Aadhar</th>
                <th className="px-3 py-2 text-left">Gov ID</th>
                <th className="px-3 py-2 text-left">License Number</th>
                <th className="px-3 py-2 text-left">License Image</th>
                <th className="px-3 py-2 text-left">Status</th>
                {activeTab === "denied" && (
                  <th className="px-3 py-2 text-left">Rejection Reason</th>
                )}
              </tr>
            </thead>
            <tbody>
              {getList().length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "requests" ? 8 : 7}
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
                    <td className="px-3 py-2">{rider.name || "-"}</td>
                    <td className="px-3 py-2">{rider.aadhar || "-"}</td>
                    <td className="px-3 py-2">{rider.gov_id || "-"}</td>
                    <td className="px-3 py-2">{rider.license_number || "-"}</td>
                    <td className="px-3 py-2">
                      {rider.license_image ? (
                        <img
                          src={rider.license_image}
                          alt="License"
                          className="w-24 h-16 rounded object-cover"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2">{rider.status || "-"}</td>
                    {activeTab === "denied" && (
                      <td className="px-3 py-2 text-red-400">{rider.rejection_reason || "-"}</td>
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
      </div>
    </div>
  );
}
