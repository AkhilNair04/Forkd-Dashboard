import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Predefined statuses for delivery notes
const allStatus = ["open", "ongoing", "delivered"];
const allDeliveryNotes = [
  "Looking for a delivery partner",
  "Rider on their way to pick up order",
  "Rider has reached pickup location",
  "Rider has picked up your order",
  "Rider is on the way to deliver your order",
  "Rider has successfully delivered your order",
];

export default function RiderStatus() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);

  // Fetch all orders, ordered by order_time (most recent first)
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("Orders")
      .select(
        "order_id, user_id, rider_id, status, items, order_time, delivery_lat, delivery_lng, delivery_address, delivery_notes, expected_delivery_time"
      )
      .order("order_time", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }
    setOrders(data);
  };

  // Fetch available riders from Supabase
  const fetchRiders = async () => {
    const { data, error } = await supabase
      .from("Rider_Details")
      .select("id, name")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching riders:", error);
      return;
    }
    setRiders(data);
  };

  useEffect(() => {
    fetchRiders();
    fetchOrders();
  }, []);

  const handleUpdateOrder = async (orderId, riderId, status, deliveryNotes) => {
    let expectedDeliveryTime = null;

    if (status === "ongoing" && riderId) {
      const randomMinutes = Math.floor(Math.random() * 21) + 10; // 10–30 mins
      expectedDeliveryTime = new Date(Date.now() + randomMinutes * 60000).toISOString();
    }

    const { error } = await supabase
      .from("Orders")
      .update({
        rider_id: riderId || null,
        status,
        delivery_notes: deliveryNotes,
        expected_delivery_time: expectedDeliveryTime,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (error) {
      console.error("Error updating order:", error.message);
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                rider_id: riderId,
                status,
                delivery_notes: deliveryNotes,
                expected_delivery_time: expectedDeliveryTime,
              }
            : order
        )
      );
    }
  };

  return (
    <div className="p-6 bg-[#111] text-white min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-4">Order Management</h1>

      <div className="overflow-x-auto rounded-lg shadow bg-[#1F1F1F]">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">User ID</th>
              <th className="px-4 py-2 text-left">Delivery Address</th>
              <th className="px-4 py-2 text-left">Assigned Rider</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Delivery Notes</th>
              <th className="px-4 py-2 text-left">Expected Delivery Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-t border-[#222] hover:bg-[#232323]">
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">{order.user_id}</td>
                <td className="px-4 py-2">{order.delivery_address}</td>

                <td className="px-4 py-2">
                  <select
                    value={order.rider_id || ""}
                    onChange={(e) =>
                      handleUpdateOrder(
                        order.order_id,
                        e.target.value,
                        order.status,
                        order.delivery_notes
                      )
                    }
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    <option value="">Select Rider</option>
                    {riders.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-2">
                  <select
                    value={order.status || "open"}
                    onChange={(e) =>
                      handleUpdateOrder(
                        order.order_id,
                        order.rider_id,
                        e.target.value,
                        order.delivery_notes
                      )
                    }
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    {allStatus.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-2">
                  <select
                    value={order.delivery_notes || allDeliveryNotes[0]}
                    onChange={(e) =>
                      handleUpdateOrder(
                        order.order_id,
                        order.rider_id,
                        order.status,
                        e.target.value
                      )
                    }
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    {allDeliveryNotes.map((note) => (
                      <option key={note} value={note}>
                        {note}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-2">
                  {order.expected_delivery_time
                    ? new Date(order.expected_delivery_time).toLocaleString()
                    : "N/A"}
                </td>

                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      handleUpdateOrder(
                        order.order_id,
                        order.rider_id,
                        order.status,
                        order.delivery_notes
                      )
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Update Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
