import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Ensure you're importing supabase client

// Dummy data for the riders (replace with actual Supabase data in your project)
const allStatus = ["Available", "Assigned", "On the Way", "Picking Up", "Delivering", "Delivered"];

export default function RiderStatus() {
  // States
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderStatusFilter, setRiderStatusFilter] = useState(allStatus);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(""); // Assign, suspend, reactivate, etc.
  const [actionReason, setActionReason] = useState("");

  // Fetch available riders from Supabase
  const fetchRiders = async () => {
    const { data, error } = await supabase
      .from("Rider_Details")
      .select("id, name, delivery_status, location_lat, location_lng, is_active")
      .eq("is_active", true); // Only fetch active riders

    if (error) {
      console.error("Error fetching riders:", error);
      return [];
    }
    setRiders(data);
  };

  // Run fetchRiders on component mount
  useEffect(() => {
    fetchRiders();
  }, []);

  // Handle selecting individual riders
  const handleSelect = (id) => {
    setSelectedRiders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Handle selecting all riders
  const handleSelectAll = () => {
    const allIds = riders.map((rider) => rider.id);
    setSelectedRiders(selectedRiders.length === allIds.length ? [] : allIds);
  };

  // Handle rider status change (e.g., when admin updates a rider's status)
  const handleStatusChange = async (riderId, newStatus) => {
    const { error } = await supabase
      .from("Rider_Details")
      .update({ delivery_status: newStatus })
      .eq("id", riderId);

    if (error) {
      console.error("Error updating rider status:", error);
    } else {
      setRiders((prevRiders) =>
        prevRiders.map((rider) =>
          rider.id === riderId ? { ...rider, delivery_status: newStatus } : rider
        )
      );
    }
  };

  // Handle bulk actions (resolve or dismiss for selected riders)
  const handleBulkAction = async (action) => {
    for (let riderId of selectedRiders) {
      await handleStatusChange(riderId, action);
    }
    setSelectedRiders([]);
  };

  return (
    <div className="p-6 bg-[#111] text-white min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-4">Rider Status</h1>

      {/* Filter Section */}
      <div className="mb-4 flex flex-wrap gap-8 items-center">
        <div>
          <span className="font-semibold mr-2">Status:</span>
          {allStatus.map((status) => (
            <label key={status} className="mr-4">
              <input
                type="checkbox"
                checked={riderStatusFilter.includes(status)}
                onChange={() =>
                  setRiderStatusFilter((prev) =>
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

      {/* Bulk Actions */}
      {riderStatusFilter.includes("Available") && (
        <div className="flex gap-4 mb-4">
          <button
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={selectedRiders.length === 0}
            onClick={() => handleBulkAction("Assigned")}
          >
            Assign Selected
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            disabled={selectedRiders.length === 0}
            onClick={() => handleBulkAction("Suspended")}
          >
            Suspend Selected
          </button>
        </div>
      )}

      {/* Riders Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedRiders.length === riders.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riders
              .filter((rider) => riderStatusFilter.includes(rider.delivery_status))
              .map((rider) => (
                <tr key={rider.id} className="border-t border-[#222] hover:bg-[#232323]">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRiders.includes(rider.id)}
                      onChange={() => handleSelect(rider.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{rider.id}</td>
                  <td className="px-4 py-2">{rider.name}</td>
                  <td className="px-4 py-2">
                    {rider.location_lat}, {rider.location_lng}
                  </td>
                  <td className="px-4 py-2">{rider.delivery_status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedRider(rider)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Rider Action Modal */}
      {selectedRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setSelectedRider(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-primary">Update Rider Status</h3>
            <textarea
              placeholder="Enter reason for status change"
              className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleStatusChange(selectedRider.id, "Assigned")}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Assign
              </button>
              <button
                onClick={() => handleStatusChange(selectedRider.id, "On the Way")}
                className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600"
              >
                On the Way
              </button>
              <button
                onClick={() => handleStatusChange(selectedRider.id, "Delivered")}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
