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
      const { data, error } = await supabase.from('chefs').select('*');
      if (data) setRequests(data.filter(c => c.status === "pending"));
      setApproved(data?.filter(c => c.status === "approved") ?? []);
      setDenied(data?.filter(c => c.status === "denied") ?? []);
    }
    fetchChefs();
  }, []);

  const getList = () => {
    if (activeTab === "requests") return requests;
    if (activeTab === "approved") return approved;
    return denied;
  };

  // ...rest logic unchanged, switch from dummy state to DB update/remove on approve/reject

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Chefs Management</h1>
        {/* ...Tab UI and Buttons */}
        <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
          <table className="min-w-full">
            <thead>
              <tr>
                {activeTab === "requests" && (
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedChefs.length === getList().length && getList().length > 0}
                      onChange={() => {/* handle all select logic */}}
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
              {/* Table rows map */}
            </tbody>
          </table>
        </div>
        {/* Reason prompt modal code stays same */}
      </div>
    </div>
  );
}