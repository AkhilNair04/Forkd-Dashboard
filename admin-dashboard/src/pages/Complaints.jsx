import { useState } from "react";
import Sidebar from "../components/Sidebar";

const sampleComplaints = {
  users: [
    {
      id: 1,
      ticket: "TCK-1234",
      complainant: "user001",
      accused: "rider002",
      summary: "Rider was late and rude",
      detail: "The rider arrived 45 minutes late and was extremely rude.",
      observation: "Rider seemed unaware of the correct address. Miscommunication occurred.",
      proofImage: "/images/proof1.jpg",
      status: "pending",
    },
  ],
  chefs: [
    {
      id: 2,
      ticket: "TCK-4567",
      complainant: "user002",
      accused: "chef001",
      summary: "Food was stale",
      detail: "Ordered biryani and it seemed spoiled and cold.",
      observation: "Confirmed issue with timestamped image.",
      proofImage: "/images/proof2.jpg",
      status: "pending",
    },
  ],
  riders: [
    {
      id: 3,
      ticket: "TCK-7890",
      complainant: "user003",
      accused: "rider005",
      summary: "Didn’t follow instructions",
      detail: "Rider didn’t deliver to the door despite multiple calls.",
      observation: "Rider unreachable for follow-up.",
      proofImage: "/images/proof3.jpg",
      status: "resolved",
    },
  ],
};

export default function Complaints() {
  const [activeTab, setActiveTab] = useState("users");
  const [subTab, setSubTab] = useState("pending");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionReason, setActionReason] = useState("");

  const complaints = (sampleComplaints[activeTab] || []).filter(
    (c) => c.status === subTab
  );

  const handleAction = (id, action) => {
    if (!actionReason.trim()) return alert("Please provide a reason.");
    alert(`${action.toUpperCase()} action taken on ticket ${id} for reason: ${actionReason}`);
    setSelectedComplaint(null);
    setActionReason("");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Complaints</h1>

        {/* Main Tabs */}
        <div className="flex space-x-4 mb-4">
          {["users", "chefs", "riders"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-primary text-black" : "bg-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setSubTab("pending");
                setSelectedComplaint(null);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Sub Tabs */}
        <div className="flex space-x-4 mb-6">
          {["pending", "resolved"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${
                subTab === tab ? "bg-blue-500 text-white" : "bg-gray-600"
              }`}
              onClick={() => {
                setSubTab(tab);
                setSelectedComplaint(null);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 && <p>No complaints found.</p>}
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-[#1F1F1F] p-4 rounded cursor-pointer hover:bg-[#2A2A2A]"
              onClick={() => setSelectedComplaint(c)}
            >
              <h3 className="font-bold text-lg">{c.ticket} - {c.summary}</h3>
              <p className="text-sm text-gray-400">From: {c.complainant}</p>
              <p className="text-sm text-gray-400">Against: {c.accused}</p>
            </div>
          ))}
        </div>

        {/* Complaint Detail View */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-[#222] p-6 rounded-xl w-[90%] max-w-xl">
              <h2 className="text-xl font-bold text-primary mb-4">Complaint Detail</h2>
              <p><strong>Ticket:</strong> {selectedComplaint.ticket}</p>
              <p><strong>Complainant:</strong> {selectedComplaint.complainant}</p>
              <p><strong>Accused (User ID):</strong> {selectedComplaint.accused}</p>
              <p className="mt-2"><strong>Summary:</strong> {selectedComplaint.summary}</p>
              <p><strong>Details:</strong> {selectedComplaint.detail}</p>
              <p><strong>Service Observation:</strong> {selectedComplaint.observation}</p>
              <img
                src={selectedComplaint.proofImage}
                alt="Proof"
                className="mt-3 rounded w-full max-h-60 object-cover"
              />
              <textarea
                className="w-full mt-4 p-2 rounded bg-gray-800 text-white"
                placeholder="Reason for action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
              <div className="flex justify-between mt-4">
                <button
                  className="bg-green-500 px-4 py-2 rounded"
                  onClick={() => handleAction(selectedComplaint.ticket, "resolved")}
                >
                  Resolve
                </button>
                <button
                  className="bg-red-500 px-4 py-2 rounded"
                  onClick={() => handleAction(selectedComplaint.ticket, "dismissed")}
                >
                  Dismiss
                </button>
                <button
                  className="text-gray-400"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">Response will be sent to complainant.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
