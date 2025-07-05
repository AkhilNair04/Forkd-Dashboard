import { useState } from "react";
// import Sidebar from "../components/Sidebar"; // Uncomment if you use Sidebar

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
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(""); // "Resolved" or "Dismissed"
  const [bulkResponse, setBulkResponse] = useState("");

  const filtered = complaints[activeTab].filter((c) => c.status === view);

  // --- Row/Checkbox logic ---
  const handleSelect = (id) => {
    setSelectedComplaints((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    const allIds = filtered.map((c) => c.id);
    setSelectedComplaints(selectedComplaints.length === allIds.length ? [] : allIds);
  };

  // --- Bulk Actions ---
  const handleBulkAction = (type) => {
    setBulkActionType(type);
    setShowBulkModal(true);
  };
  const handleSubmitBulkAction = () => {
    if (!bulkResponse.trim()) {
      alert("Please enter a response for the action.");
      return;
    }
    setComplaints((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((c) =>
        selectedComplaints.includes(c.id)
          ? {
              ...c,
              status: "Resolved",
              action: bulkActionType,
              response: bulkResponse,
            }
          : c
      ),
    }));
    setShowBulkModal(false);
    setBulkResponse("");
    setSelectedComplaints([]);
  };

  // --- Individual Action (from details panel) ---
  const handleAction = (id, actionType) => {
    if (!adminResponse.trim()) {
      alert("Please enter a reason for the action.");
      return;
    }
    setComplaints((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((c) =>
        c.id === id
          ? { ...c, status: "Resolved", action: actionType, response: adminResponse }
          : c
      ),
    }));
    setSelectedComplaint(null);
    setAdminResponse("");
  };

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <div className="flex-1 p-6 bg-[#111] text-white">
        <h2 className="text-2xl font-bold text-primary mb-4">Complaints - {activeTab}</h2>
        {/* Tabs for Users, Chefs, Riders */}
        <div className="mb-4 space-x-4">
          {["Users", "Chefs", "Riders"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setSelectedComplaints([]);
              }}
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
              onClick={() => {
                setView(status);
                setSelectedComplaints([]);
              }}
              className={`px-4 py-1 rounded ${view === status ? "bg-primary text-black" : "bg-gray-700"}`}
            >
              {status}
            </button>
          ))}
        </div>
        {/* Bulk Action Buttons */}
        {view === "Pending" && (
          <div className="flex gap-4 mb-4">
            <button
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={selectedComplaints.length === 0}
              onClick={() => handleBulkAction("Resolved")}
            >
              Resolve Selected
            </button>
            <button
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              disabled={selectedComplaints.length === 0}
              onClick={() => handleBulkAction("Dismissed")}
            >
              Dismiss Selected
            </button>
          </div>
        )}
        {/* Complaints Table - Aligned and Clickable */}
        <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
          <table className="min-w-full">
            <thead>
              <tr>
                {view === "Pending" && (
                  <th className="w-10 text-center align-middle px-2 py-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedComplaints.length === filtered.length && filtered.length > 0
                      }
                      onChange={handleSelectAll}
                      className="align-middle"
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left align-middle">Ticket</th>
                <th className="px-3 py-2 text-left align-middle">Complaintee</th>
                <th className="px-3 py-2 text-left align-middle">Accused ID</th>
                <th className="px-3 py-2 text-left align-middle">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={view === "Pending" ? 5 : 4} className="text-center py-8 text-gray-400">
                    No complaints to show.
                  </td>
                </tr>
              ) : (
                filtered.map((comp) => (
                  <tr
                    key={comp.id}
                    className="border-t border-[#222] hover:bg-[#232323] cursor-pointer"
                    onClick={() => setSelectedComplaint(comp)}
                  >
                    {view === "Pending" && (
                      <td
                        className="w-10 text-center align-middle px-2 py-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedComplaints.includes(comp.id)}
                          onChange={() => handleSelect(comp.id)}
                          className="align-middle"
                        />
                      </td>
                    )}
                    <td className="px-3 py-2 align-middle">{comp.ticket}</td>
                    <td className="px-3 py-2 align-middle">{comp.complaintee}</td>
                    <td className="px-3 py-2 align-middle">{comp.accusedId}</td>
                    <td className="px-3 py-2 align-middle">{comp.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Details/Action Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222] p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4 text-primary">Complaint Details</h3>
              <p><strong>Ticket ID:</strong> {selectedComplaint.ticket}</p>
              <p><strong>Complaintee:</strong> {selectedComplaint.complaintee}</p>
              <p><strong>Accused ID:</strong> {selectedComplaint.accusedId}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              <p><strong>Complaint:</strong> {selectedComplaint.complaint}</p>
              <p><strong>Observation:</strong> {selectedComplaint.observation}</p>
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
                  <p><strong>Admin Action:</strong> {selectedComplaint.action}</p>
                  <p><strong>Response:</strong> {selectedComplaint.response}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Bulk Action Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222] p-6 rounded-lg shadow-lg w-full max-w-lg relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => setShowBulkModal(false)}
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4 text-primary">
                {bulkActionType === "Resolved" ? "Resolve" : "Dismiss"} Selected Complaints
              </h3>
              <textarea
                placeholder="Enter response to complaintee(s)..."
                className="w-full mt-2 p-2 bg-gray-800 text-white rounded"
                value={bulkResponse}
                onChange={(e) => setBulkResponse(e.target.value)}
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSubmitBulkAction}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                  disabled={!bulkResponse.trim()}
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}