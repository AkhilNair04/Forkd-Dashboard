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

// Haversine formula to calculate distance between two lat/lng coordinates
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Function to estimate delivery time (e.g., 5 minutes per km)
const estimateDeliveryTime = (distance) => {
  const minutesPerKm = 5; // 5 minutes per km
  const estimatedTimeInMinutes = distance * minutesPerKm;
  return new Date(Date.now() + estimatedTimeInMinutes * 60000); // Adding minutes to current time
};

export default function RiderStatus() {
  // States
  const [orders, setOrders] = useState([]); // State for orders
  const [riders, setRiders] = useState([]); // State for available riders

  // Fetch all orders, ordered by order_time (most recent first)
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("Orders")
      .select("order_id, user_id, rider_id, status, items, order_time, delivery_lat, delivery_lng, delivery_address, delivery_notes, expected_delivery_time")
      .order("order_time", { ascending: false }); // Fetch all orders ordered by time, most recent first

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    setOrders(data);
  };

  // Fetch available riders from Supabase
  const fetchRiders = async () => {
    const { data, error } = await supabase
      .from("Rider_Details")
      .select("id, name")
      .eq("is_active", true); // Only fetch active riders

    if (error) {
      console.error("Error fetching riders:", error);
      return [];
    }
    setRiders(data);
  };

  // Run fetchRiders and fetchOrders on component mount
  useEffect(() => {
    fetchRiders();
    fetchOrders();
  }, []);

  // Handle updating the order with selected rider and delivery status
  const handleUpdateOrder = async (orderId, riderId, status, deliveryNotes) => {
    // Find the rider's location (lat, lng)
    const rider = riders.find((rider) => rider.id === riderId);
    const order = orders.find((order) => order.order_id === orderId);

    if (rider && rider.location_lat && rider.location_lng && order) {
      // Calculate the distance between the rider's location and the delivery location
      const distance = calculateDistance(
        rider.location_lat,
        rider.location_lng,
        order.delivery_lat,
        order.delivery_lng
      );

      // Estimate the delivery time based on the distance
      const expectedDeliveryTime = estimateDeliveryTime(distance);

      // Update the order in the database
      const { error } = await supabase
        .from("Orders")
        .update({
          rider_id: riderId,
          status: status,
          delivery_notes: deliveryNotes,
          expected_delivery_time: expectedDeliveryTime, // Set the expected delivery time
        })
        .eq("order_id", orderId);

      if (error) {
        console.error("Error updating order:", error);
      } else {
        // Update the state of the orders in the frontend to reflect the changes
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId
              ? { ...order, rider_id: riderId, status: status, delivery_notes: deliveryNotes, expected_delivery_time: expectedDeliveryTime }
              : order
          )
        );
      }
    }
  };

  return (
    <div className="p-6 bg-[#111] text-white min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-4">Order Management</h1>

      {/* Orders Table */}
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

                {/* Rider dropdown */}
                <td className="px-4 py-2">
                  <select
                    value={order.rider_id || ""}
                    onChange={(e) => handleUpdateOrder(order.order_id, e.target.value, order.status, order.delivery_notes)}
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

                {/* Status dropdown */}
                <td className="px-4 py-2">
                  <select
                    value={order.status || "open"}
                    onChange={(e) => handleUpdateOrder(order.order_id, order.rider_id, e.target.value, order.delivery_notes)}
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    {allStatus.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Delivery Notes dropdown */}
                <td className="px-4 py-2">
                  <select
                    value={order.delivery_notes || "Looking for a delivery partner"}
                    onChange={(e) => handleUpdateOrder(order.order_id, order.rider_id, order.status, e.target.value)}
                    className="bg-gray-800 text-white px-2 py-1 rounded"
                  >
                    {allDeliveryNotes.map((note) => (
                      <option key={note} value={note}>
                        {note}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Expected Delivery Time */}
                <td className="px-4 py-2">
                  {order.expected_delivery_time
                    ? new Date(order.expected_delivery_time).toLocaleString()
                    : "N/A"}
                </td>

                {/* Actions */}
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleUpdateOrder(order.order_id, order.rider_id, order.status, order.delivery_notes)}
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
