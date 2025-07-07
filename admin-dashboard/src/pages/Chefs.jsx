import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Chefs() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedChefs, setSelectedChefs] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch chefs from DB
  useEffect(() => {
    async function fetchChefs() {
      const { data, error } = await supabase
        .from('Chef')
        .select('id, name, aadhar_number, aadhar, fssai_number, fssai_licence_img, pcc_certificate, decision, rejection_reason');
      if (error) {
        console.error("Supabase error:", error);
        return;
      }
      setRequests(data.filter(c => !c.decision || c.decision === "pending"));
      setApproved(data.filter(c => c.decision === "approved"));
      setDenied(data.filter(c => c.decision === "rejected"));
    }
    fetchChefs();
  }, []);

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  // Checkbox logic
  const handleSelect = (id) => {
    setSelectedChefs(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const list = getList().map(c => c.id);
    setSelectedChefs(selectedChefs.length === list.length ? [] : list);
  };

  // Approve selected
  const handleBulkApprove = async () => {
    for (let id of selectedChefs) {
      await supabase
        .from("Chef")
        .update({
          decision: "approved",
          is_verified: true,
          status: true
        })
        .eq("id", id);
    }
    window.location.reload();
  };

  // Reject selected
  const handleBulkReject = () => setShowReasonPrompt(true);
  const handleSubmitBulkReject = async () => {
    for (let id of selectedChefs) {
      await supabase
        .from("Chef")
        .update({
          decision: "rejected",
          is_verified: false,
          status: false,
          rejection_reason: rejectionReason
        })
        .eq("id", id);
    }
    setShowReasonPrompt(false);
    setRejectionReason("");
    window.location.reload();
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedChefs([]);
  };

  // Utility to display images from bytea (assuming they're stored as URLs; if not, skip img)
  const renderImage = (img) => {
    if (!img) return "-";
    // If img is already a URL, show. If not, you need to convert or use Supabase Storage public URL
    return <img src={img} alt="" className="w-24 h-16 rounded object-cover" />;
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Chefs Management</h1>
        <div className="flex gap-6 mb-6">
          {["requests", "approved", "denied"].map(tab => (
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
        <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
          <table className="min-w-full">
            <thead>
              <tr>
                {activeTab === "requests" && (
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedChefs.length === getList().length && getList().length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Aadhar No.</th>
                <th className="px-3 py-2 text-left">Aadhar (img/data)</th>
                <th className="px-3 py-2 text-left">FSSAI License No.</th>
                <th className="px-3 py-2 text-left">FSSAI License (img)</th>
                <th className="px-3 py-2 text-left">PCC Certificate</th>
                {activeTab === "denied" && <th className="px-3 py-2 text-left">Rejection Reason</th>}
              </tr>
            </thead>
            <tbody>
              {getList().length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "requests" ? 8 : 7} className="text-center py-8 text-gray-400">
                    No chefs in this category.
                  </td>
                </tr>
              ) : (
                getList().map((chef) => (
                  <tr key={chef.id} className="border-t border-[#222] hover:bg-[#232323]">
                    {activeTab === "requests" && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedChefs.includes(chef.id)}
                          onChange={() => handleSelect(chef.id)}
                        />
                      </td>
                    )}
                    <td className="px-3 py-2">{chef.name || "-"}</td>
                    <td className="px-3 py-2">{chef.aadhar_number || "-"}</td>
                    <td className="px-3 py-2">{chef.aadhar || "-"}</td>
                    <td className="px-3 py-2">{chef.fssai_number || "-"}</td>
                    <td className="px-3 py-2">{renderImage(chef.fssai_licence_img)}</td>
                    <td className="px-3 py-2">{renderImage(chef.pcc_certificate)}</td>
                    {activeTab === "denied" && (
                      <td className="px-3 py-2 text-red-400">{chef.rejection_reason || "-"}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Reason prompt modal */}
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
                onChange={e => setRejectionReason(e.target.value)}
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
      </div>
    </div>
  );
}