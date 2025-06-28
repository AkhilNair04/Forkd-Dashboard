import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dummyChefs = [
  {
    id: 1,
    name: "Chef Arya",
    age: 34,
    fssaiLicenseNumber: "FSSAI12345",
    fssaiLicenseImage: "https://via.placeholder.com/300x200.png?text=FSSAI+License",
    pccCertificateImage: "https://via.placeholder.com/300x200.png?text=PCC+Certificate",
  },
  {
    id: 2,
    name: "Chef Ravi",
    age: 40,
    fssaiLicenseNumber: "FSSAI67890",
    fssaiLicenseImage: "https://via.placeholder.com/300x200.png?text=FSSAI+License",
    pccCertificateImage: "https://via.placeholder.com/300x200.png?text=PCC+Certificate",
  },
];

export default function Chefs() {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState(dummyChefs);
  const [approved, setApproved] = useState([]);
  const [denied, setDenied] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const openModal = (chef) => {
    setSelectedChef(chef);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedChef(null);
    setShowModal(false);
    setShowReasonPrompt(false);
    setRejectionReason("");
  };

  const handleApprove = (id) => {
    const chef = requests.find((c) => c.id === id);
    if (chef) {
      setApproved([...approved, chef]);
      setRequests(requests.filter((c) => c.id !== id));
      closeModal();
    }
  };

  const handleReject = (id) => {
    const chef = requests.find((c) => c.id === id);
    if (chef) {
      const rejectedChef = { ...chef, reason: rejectionReason };
      setDenied([...denied, rejectedChef]);
      setRequests(requests.filter((c) => c.id !== id));
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
        <h1 className="text-3xl font-bold text-primary mb-6">Chefs Management</h1>

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
          {getList().map((chef) => (
            <div
              key={chef.id}
              className="bg-[#1F1F1F] p-4 rounded-xl hover:shadow-lg cursor-pointer"
              onClick={() => openModal(chef)}
            >
              <h3 className="text-xl font-semibold text-primary">{chef.name}</h3>
              <p className="text-sm text-gray-400">Age: {chef.age}</p>
            </div>
          ))}
        </div>

        {showModal && selectedChef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F1F1F] p-6 rounded-xl w-[90%] max-w-md text-white relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={closeModal}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-primary mb-4">{selectedChef.name}</h2>
              <p className="text-gray-400 mb-2">Age: {selectedChef.age}</p>
              <p className="text-gray-400 mb-2">FSSAI License No: {selectedChef.fssaiLicenseNumber}</p>
              <img
                src={selectedChef.fssaiLicenseImage}
                alt="FSSAI License"
                className="rounded mt-2 mb-4"
              />
              <p className="text-gray-400 mb-2">PCC Certificate:</p>
              <img
                src={selectedChef.pccCertificateImage}
                alt="PCC Certificate"
                className="rounded mb-6"
              />

              {activeTab === "requests" && (
                <div className="flex justify-between">
                  <button
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleApprove(selectedChef.id)}
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

              {activeTab === "denied" && selectedChef.reason && (
                <p className="mt-4 text-red-400">
                  <span className="text-gray-400">Reason:</span> {selectedChef.reason}
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
                    handleReject(selectedChef.id);
                    setShowReasonPrompt(false);
                  }}
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
