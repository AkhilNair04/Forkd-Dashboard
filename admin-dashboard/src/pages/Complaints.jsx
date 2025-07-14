import { useState } from "react";
const dummyData = [
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
    type: "Users",
  },
  {
    id: 6,
    ticket: "U-002",
    complaintee: "user999",
    accusedId: "rider321",
    category: "Riders",
    complaint: "Delivery delayed.",
    observation: "Food delivered 2 hours late.",
    proof: "https://via.placeholder.com/150",
    status: "Resolved",
    type: "Users",
    action: "Resolved",
    response: "Warned the rider. Won't happen again.",
  },
  // Chefs complaints
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
    type: "Chefs",
  },
  {
    id: 7,
    ticket: "C-002",
    complaintee: "user222",
    accusedId: "chef245",
    category: "Chefs",
    complaint: "Unhygienic packaging.",
    observation: "Food box not sealed properly.",
    proof: "https://via.placeholder.com/150",
    status: "Resolved",
    type: "Chefs",
    action: "Dismissed",
    response: "Chef warned, complaint dismissed after review.",
  },
  // Riders complaints
  {
    id: 3,
    ticket: "R-001",
    complaintee: "user789",
    accusedId: "rider999",
    category: "Riders",
    complaint: "Wrong address delivered.",
    observation: "Order given to wrong person.",
    proof: "https://via.placeholder.com/150",
    status: "Pending",
    type: "Riders",
  },
  {
    id: 4,
    ticket: "R-002",
    complaintee: "user431",
    accusedId: "rider124",
    category: "Riders",
    complaint: "Rider demanded extra money.",
    observation: "Rider asked for tips.",
    proof: "https://via.placeholder.com/150",
    status: "Resolved",
    type: "Riders",
    action: "Resolved",
    response: "Strict warning issued to the rider.",
  },
  // Some more
  {
    id: 5,
    ticket: "C-003",
    complaintee: "user001",
    accusedId: "chef007",
    category: "Chefs",
    complaint: "Taste was not good.",
    observation: "Food too spicy.",
    proof: "https://via.placeholder.com/150",
    status: "Pending",
    type: "Chefs",
  },
];

const allTypes = ["Users", "Chefs", "Riders"];
const allStatus = ["Pending", "Resolved"];

export default function Complaints() {
  // Filter checkboxes
  const [typeFilter, setTypeFilter] = useState([...allTypes]);
  const [statusFilter, setStatusFilter] = useState([...allStatus]);

  // Main states
  const [complaints, setComplaints] = useState(dummyData);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(""); // "Resolved" or "Dismissed"
  const [bulkResponse, setBulkResponse] = useState("");

  // --- Filtering ---
  const filtered = complaints.filter(
    (c) => typeFilter.includes(c.type) && statusFilter.includes(c.status)
  );

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
    setComplaints((prev) =>
      prev.map((c) =>
        selectedComplaints.includes(c.id)
          ? {
              ...c,
              status: bulkActionType === "Resolved" ? "Resolved" : "Resolved",
              action: bulkActionType,
              response: bulkResponse,
            }
          : c
      )
    );
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
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: actionType === "Resolved" ? "Resolved" : "Resolved",
              action: actionType,
              response: adminResponse,
            }
          : c
      )
    );
    setSelectedComplaint(null);
    setAdminResponse("");
  };

  // --- UI ---
  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}
      <div className="flex-1 p-6 bg-[#111] text-white">
        <h2 className="text-2xl font-bold text-primary mb-4">Complaints</h2>
        {/* Filter Checkboxes */}
        <div className="mb-4 flex flex-wrap gap-8 items-center">
          <div>
            <span className="font-semibold mr-2">Type:</span>
            {allTypes.map((cat) => (
              <label key={cat} className="mr-4">
                <input
                  type="checkbox"
                  checked={typeFilter.includes(cat)}
                  onChange={() =>
                    setTypeFilter((prev) =>
                      prev.includes(cat)
                        ? prev.filter((x) => x !== cat)
                        : [...prev, cat]
                    )
                  }
                  className="mr-1"
                />
                {cat}
              </label>
            ))}
          </div>
          <div>
            <span className="font-semibold mr-2">Status:</span>
            {allStatus.map((status) => (
              <label key={status} className="mr-4">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(status)}
                  onChange={() =>
                    setStatusFilter((prev) =>
                      prev.includes(status)
                        ? prev.filter((x) => x !== status)
                        : [...prev, status]
                    )
                  }
                  className="mr-1"
                />
                {status}
              </label>
            ))}
          </div>
        </div>
        {/* Bulk Action Buttons */}
        {statusFilter.includes("Pending") && (
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
        {/* Complaints Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
          <table className="min-w-full">
            <thead>
              <tr>
                {statusFilter.includes("Pending") && (
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
                <th className="px-3 py-2 text-left align-middle">Type</th>
                <th className="px-3 py-2 text-left align-middle">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={statusFilter.includes("Pending") ? 6 : 5} className="text-center py-8 text-gray-400">
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
                    {statusFilter.includes("Pending") && (
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
                    <td className="px-3 py-2 align-middle">{comp.type}</td>
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
