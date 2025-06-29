import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dummyData = {
  Users: [
    {
      id: 1,
      ticket: "U-001",
      complaintee: "user123",
      accusedId: "rider456",
      category: "Riders",
      complaint: "Rider was rude.",
      observation: "Rider used abusive language.",
      proof: "https://via.placeholder.com/150",
      status: "Pending",
    },
  ],
  Chefs: [
    {
      id: 2,
      ticket: "C-001",
      complaintee: "user456",
      accusedId: "chef123",
      category: "Chefs",
      complaint: "Food was stale.",
      observation: "Reported poor hygiene.",
      proof: "https://via.placeholder.com/150",
      status: "Pending",
    },
  ],
  Riders: [],
};

export default function Complaints() {
  const [activeTab, setActiveTab] = useState("Users");
  const [view, setView] = useState("Pending");
  const [complaints, setComplaints] = useState(dummyData);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");

  const handleAction = (id, actionType) => {
    if (!adminResponse.trim()) {
      alert("Please enter a reason for the action.");
      return;
    }

    const updated = complaints[activeTab].map((c) =>
      c.id === id ? { ...c, status: "Resolved", action: actionType, response: adminResponse } : c
    );
    setComplaints({ ...complaints, [activeTab]: updated });
    setSelectedComplaint(null);
    setAdminResponse("");
  };

  const filtered = complaints[activeTab].filter((c) => c.status === view);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-[#111] text-white">
        <h2 className="text-2xl font-bold text-primary mb-4">Complaints - {activeTab}</h2>

        {/* Tabs for Users, Chefs, Riders */}
        <div className="mb-4 space-x-4">
          {["Users", "Chefs", "Riders"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-1 rounded ${activeTab === cat ? "bg-primary text-black" : "bg-gray-700"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tabs for Pending / Resolved */}
        <div className="mb-4 space-x-4">
          {["Pending", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setView(status)}
              className={`px-4 py-1 rounded ${view === status ? "bg-primary text-black" : "bg-gray-700"}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Complaint list */}
        <ul className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-gray-400">No complaints to show.</p>
          ) : (
            filtered.map((comp) => (
              <li
                key={comp.id}
                className="p-4 bg-[#1F1F1F] rounded shadow cursor-pointer"
                onClick={() => setSelectedComplaint(comp)}
              >
                <p>
                  <strong>Ticket:</strong> {comp.ticket}
                </p>
                <p>
                  <strong>Complaintee:</strong> {comp.complaintee}
                </p>
                <p>
                  <strong>Accused ID:</strong> {comp.accusedId}
                </p>
                <p>
                  <strong>Status:</strong> {comp.status}
                </p>
              </li>
            ))
          )}
        </ul>

        {/* Complaint details panel */}
        {selectedComplaint && (
          <div className="mt-8 p-6 bg-[#222] rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-primary">Complaint Details</h3>
            <p>
              <strong>Ticket ID:</strong> {selectedComplaint.ticket}
            </p>
            <p>
              <strong>Complaintee:</strong> {selectedComplaint.complaintee}
            </p>
            <p>
              <strong>Accused ID:</strong> {selectedComplaint.accusedId}
            </p>
            <p>
              <strong>Category:</strong> {selectedComplaint.category}
            </p>
            <p>
              <strong>Complaint:</strong> {selectedComplaint.complaint}
            </p>
            <p>
              <strong>Service Observation:</strong> {selectedComplaint.observation}
            </p>
            <img src={selectedComplaint.proof} alt="Proof" className="mt-2 rounded w-48" />
            {selectedComplaint.status === "Pending" && (
              <>
                <textarea
                  placeholder="Enter response to complaintee..."
                  className="w-full mt-4 p-2 bg-gray-800 text-white rounded"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleAction(selectedComplaint.id, "Resolved")}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleAction(selectedComplaint.id, "Dismissed")}
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {selectedComplaint.status === "Resolved" && (
              <div className="mt-4">
                <p>
                  <strong>Admin Action:</strong> {selectedComplaint.action}
                </p>
                <p>
                  <strong>Response:</strong> {selectedComplaint.response}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
