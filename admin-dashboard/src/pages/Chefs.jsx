import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dummyChefs = [
  {
    id: 1,
    name: "Chef Arya",
    fssaiLicenseNumber: "FSSAI12345",
    fssaiLicenseImage: "https://via.placeholder.com/300x200.png?text=FSSAI+License",
    pccCertificateImage: "https://via.placeholder.com/300x200.png?text=PCC+Certificate",
    aadharNumber: "1234-5678-9012",
    aadharImage: "https://via.placeholder.com/300x200.png?text=Aadhar+Card",
    profilePic: "https://randomuser.me/api/portraits/women/31.jpg",
  },
  {
    id: 2,
    name: "Chef Ravi",
    fssaiLicenseNumber: "FSSAI67890",
    fssaiLicenseImage: "https://via.placeholder.com/300x200.png?text=FSSAI+License",
    pccCertificateImage: "https://via.placeholder.com/300x200.png?text=PCC+Certificate",
    aadharNumber: "4321-8765-2109",
    aadharImage: "https://via.placeholder.com/300x200.png?text=Aadhar+Card",
    profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

export default function Chefs() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState(dummyChefs);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedChefs, setSelectedChefs] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  const handleSelect = (id) => {
    setSelectedChefs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = getList().map((chef) => chef.id);
    setSelectedChefs(
      selectedChefs.length === allIds.length ? [] : allIds
    );
  };

  const handleApprove = (id) => {
    const chef = requests.find((c) => c.id === id);
    if (chef) {
      setApproved([...approved, chef]);
      setRequests(requests.filter((c) => c.id !== id));
      setSelectedChefs(selectedChefs.filter((cid) => cid !== id));
    }
  };

  const handleReject = (id, reason = "") => {
    const chef = requests.find((c) => c.id === id);
    if (chef) {
      const rejectedChef = { ...chef, reason };
      setDenied([...denied, rejectedChef]);
      setRequests(requests.filter((c) => c.id !== id));
      setSelectedChefs(selectedChefs.filter((cid) => cid !== id));
    }
  };

  const handleBulkApprove = () => {
    selectedChefs.forEach(handleApprove);
    setSelectedChefs([]);
  };

  const handleBulkReject = () => {
    setShowReasonPrompt(true);
  };

  const handleSubmitBulkReject = () => {
    selectedChefs.forEach((id) => handleReject(id, rejectionReason));
    setShowReasonPrompt(false);
    setRejectionReason("");
    setSelectedChefs([]);
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedChefs([]);
  };

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Chefs Management</h1>
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
                <th className="px-3 py-2 text-left">Profile Pic</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Aadhar No.</th>
                <th className="px-3 py-2 text-left">Aadhar Image</th>
                <th className="px-3 py-2 text-left">FSSAI License No.</th>
                <th className="px-3 py-2 text-left">FSSAI License</th>
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
                    <td className="px-3 py-2">
                      <img src={chef.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                    </td>
                    <td className="px-3 py-2">{chef.name}</td>
                    <td className="px-3 py-2">{chef.aadharNumber}</td>
                    <td className="px-3 py-2">
                      <img src={chef.aadharImage} alt="Aadhar" className="w-24 h-16 rounded object-cover" />
                    </td>
                    <td className="px-3 py-2">{chef.fssaiLicenseNumber}</td>
                    <td className="px-3 py-2">
                      <img src={chef.fssaiLicenseImage} alt="FSSAI License" className="w-24 h-16 rounded object-cover" />
                    </td>
                    <td className="px-3 py-2">
                      <img src={chef.pccCertificateImage} alt="PCC Certificate" className="w-24 h-16 rounded object-cover" />
                    </td>
                    {activeTab === "denied" && (
                      <td className="px-3 py-2 text-red-400">{chef.reason}</td>
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
                  setSelectedChefs([]);
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
                    setSelectedChefs([]);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => {
                    handleSubmitBulkReject();
                    setShowReasonPrompt(false);
                    setRejectionReason("");
                  }}
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