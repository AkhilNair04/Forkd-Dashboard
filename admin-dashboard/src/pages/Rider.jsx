import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dummyRiders = [
  {
    id: 1,
    name: "Rider A",
    state: "Kerala",
    licenseNumber: "DL123456789",
    licenseImage: "https://via.placeholder.com/100",
    aadharNumber: "4567-1234-7890",
    aadharImage: "https://via.placeholder.com/300x200.png?text=Aadhar+Card",
    profilePic: "https://randomuser.me/api/portraits/men/21.jpg",
  },
  {
    id: 2,
    name: "Rider B",
    state: "Tamil Nadu",
    licenseNumber: "DL987654321",
    licenseImage: "https://via.placeholder.com/100",
    aadharNumber: "7654-4321-0987",
    aadharImage: "https://via.placeholder.com/300x200.png?text=Aadhar+Card",
    profilePic: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

export default function Riders() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState(dummyRiders);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  const handleSelect = (id) => {
    setSelectedRiders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = getList().map((rider) => rider.id);
    setSelectedRiders(
      selectedRiders.length === allIds.length ? [] : allIds
    );
  };

  const handleApprove = (id) => {
    const issuanceId = "INS" + Math.floor(100000 + Math.random() * 900000);
    const rider = requests.find((r) => r.id === id);
    if (rider) {
      const approvedRider = { ...rider, issuanceNumber: issuanceId };
      setApproved([...approved, approvedRider]);
      setRequests(requests.filter((r) => r.id !== id));
      setSelectedRiders(selectedRiders.filter((rid) => rid !== id));
    }
  };

  const handleReject = (id, reason = "") => {
    const rider = requests.find((r) => r.id === id);
    if (rider) {
      const rejectedRider = { ...rider, reason };
      setDenied([...denied, rejectedRider]);
      setRequests(requests.filter((r) => r.id !== id));
      setSelectedRiders(selectedRiders.filter((rid) => rid !== id));
    }
  };

  const handleBulkApprove = () => {
    selectedRiders.forEach(handleApprove);
    setSelectedRiders([]);
  };

  const handleBulkReject = () => {
    setShowReasonPrompt(true);
  };

  const handleSubmitBulkReject = () => {
    selectedRiders.forEach((id) => handleReject(id, rejectionReason));
    setShowReasonPrompt(false);
    setRejectionReason("");
    setSelectedRiders([]);
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRiders([]);
  };

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
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
                <th className="px-3 py-2 text-left">Profile Pic</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">State</th>
                <th className="px-3 py-2 text-left">Aadhar No.</th>
                <th className="px-3 py-2 text-left">Aadhar Image</th>
                <th className="px-3 py-2 text-left">License No.</th>
                <th className="px-3 py-2 text-left">License Image</th>
                {activeTab === "approved" && (
                  <th className="px-3 py-2 text-left">Issuance No.</th>
                )}
                {activeTab === "denied" && (
                  <th className="px-3 py-2 text-left">Rejection Reason</th>
                )}
              </tr>
            </thead>
            <tbody>
              {getList().length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "requests" ? 9 : 8} className="text-center py-8 text-gray-400">
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
                    <td className="px-3 py-2">
                      <img src={rider.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                    </td>
                    <td className="px-3 py-2">{rider.name}</td>
                    <td className="px-3 py-2">{rider.state}</td>
                    <td className="px-3 py-2">{rider.aadharNumber}</td>
                    <td className="px-3 py-2">
                      <img src={rider.aadharImage} alt="Aadhar" className="w-24 h-16 rounded object-cover" />
                    </td>
                    <td className="px-3 py-2">{rider.licenseNumber}</td>
                    <td className="px-3 py-2">
                      <img src={rider.licenseImage} alt="License" className="w-24 h-16 rounded object-cover" />
                    </td>
                    {activeTab === "approved" && (
                      <td className="px-3 py-2 text-green-400">{rider.issuanceNumber}</td>
                    )}
                    {activeTab === "denied" && (
                      <td className="px-3 py-2 text-red-400">{rider.reason}</td>
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