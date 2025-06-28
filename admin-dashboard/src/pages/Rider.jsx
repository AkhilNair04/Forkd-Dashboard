import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dummyRiders = [
  {
    id: 1,
    name: "Rider A",
    age: 28,
    state: "Kerala",
    licenseNumber: "DL123456789",
    licenseImage: "https://via.placeholder.com/100",
  },
  {
    id: 2,
    name: "Rider B",
    age: 32,
    state: "Tamil Nadu",
    licenseNumber: "DL987654321",
    licenseImage: "https://via.placeholder.com/100",
  },
];

export default function Riders() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState(dummyRiders);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const openModal = (rider) => {
    setSelectedRider(rider);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRider(null);
    setShowModal(false);
    setShowReasonPrompt(false);
    setRejectionReason("");
  };

  const handleApprove = (id) => {
    const issuanceId = "INS" + Math.floor(100000 + Math.random() * 900000);
    const rider = requests.find((r) => r.id === id);
    if (rider) {
      const approvedRider = { ...rider, issuanceNumber: issuanceId };
      setApproved([...approved, approvedRider]);
      setRequests(requests.filter((r) => r.id !== id));
      closeModal();
    }
  };

  const handleReject = (id) => {
    const rider = requests.find((r) => r.id === id);
    if (rider) {
      const rejectedRider = { ...rider, reason: rejectionReason };
      setDenied([...denied, rejectedRider]);
      setRequests(requests.filter((r) => r.id !== id));
      closeModal();
    }
  };

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Riders Management</h1>

        <div className="flex gap-6 mb-6">
          {["requests", "approved", "denied"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-primary text-white" : "bg-gray-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {getList().length ? (
            getList().map((rider) => (
              <div
                key={rider.id}
                className="bg-[#1F1F1F] p-4 rounded-xl hover:shadow-lg cursor-pointer"
                onClick={() => openModal(rider)}
              >
                <h3 className="text-xl font-semibold text-primary">{rider.name}</h3>
                <p className="text-sm text-gray-400">Age: {rider.age}</p>
                <p className="text-sm text-gray-400">State: {rider.state}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full">
              No {activeTab === "requests" ? "pending" : activeTab} riders
            </p>
          )}
        </div>

        {showModal && selectedRider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] p-6 rounded-xl w-[90%] max-w-md text-white relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={closeModal}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-primary mb-4">{selectedRider.name}</h2>
              <p className="text-gray-400 mb-2">Age: {selectedRider.age}</p>
              <p className="text-gray-400 mb-2">State: {selectedRider.state}</p>
              <p className="text-gray-400 mb-2">License No: {selectedRider.licenseNumber}</p>
              <img
                src={selectedRider.licenseImage}
                alt="License"
                className="rounded mb-6 max-w-full border"
              />

              {activeTab === "requests" && (
                <div className="flex justify-between">
                  <button
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleApprove(selectedRider.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => setShowReasonPrompt(true)}
                  >
                    Reject
                  </button>
                </div>
              )}

              {activeTab === "approved" && (
                <div className="mt-3 text-sm text-green-400">
                  <p>
                    <strong>Issuance No:</strong> {selectedRider.issuanceNumber}
                  </p>
                  <p>
                    <strong>Insurance Contact:</strong> 1800-INSURE-24
                  </p>
                </div>
              )}

              {activeTab === "denied" && selectedRider.reason && (
                <p className="mt-4 text-red-400">
                  <span className="text-gray-400">Reason:</span> {selectedRider.reason}
                </p>
              )}
            </div>
          </div>
        )}

        {showReasonPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] p-6 rounded-xl w-[90%] max-w-md text-white relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => setShowReasonPrompt(false)}
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
                  onClick={() => setShowReasonPrompt(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => {
                    handleReject(selectedRider.id);
                    setShowReasonPrompt(false);
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
