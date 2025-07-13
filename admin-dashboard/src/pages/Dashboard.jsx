import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

const COLORS = ["#F97316", "#10B981", "#3B82F6"];
const flashQuotes = [
  "\u{1F4E6} Orders surging today!",
  "\u{1F6B4}\u200D♂️ Riders are active and delivering!",
  "\u{1F468}\u200D\u{1F373} Chef ratings up 5% this week!",
  "\u26A1 Platform is running smoothly!",
  "\u{1F4C8} Sales showing an upward trend!",
];

function getPrevStats() {
  try {
    const data = localStorage.getItem("dashboardPrevStats");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
function setPrevStats(stats) {
  localStorage.setItem("dashboardPrevStats", JSON.stringify(stats));
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    riders: 0, users: 0, chefs: 0,
    prevRiders: 0, prevUsers: 0, prevChefs: 0
  });
  const [userTypeData, setUserTypeData] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const prev = getPrevStats();
      const [{ count: userCount }, { count: chefCount }, { count: riderCount }] = await Promise.all([
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "active").eq("user_type", "customer"),
        supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "active").eq("user_type", "chef"),
        supabase.from("Rider_Details").select("*", { count: "exact", head: true }).eq("status", "approved"),
      ]);

      setCounts({
        riders: riderCount || 0,
        users: userCount || 0,
        chefs: chefCount || 0,
        prevRiders: prev.riders ?? (riderCount || 0),
        prevUsers: prev.users ?? (userCount || 0),
        prevChefs: prev.chefs ?? (chefCount || 0)
      });

      setUserTypeData([
        { name: "Users", value: userCount || 0 },
        { name: "Chefs", value: chefCount || 0 },
        { name: "Riders", value: riderCount || 0 },
      ]);

      setPrevStats({
        riders: riderCount || 0,
        users: userCount || 0,
        chefs: chefCount || 0,
      });
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % flashQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function getTrend(newVal, oldVal) {
    if (newVal > oldVal) return "up";
    if (newVal < oldVal) return "down";
    return "flat";
  }

  const stats = [
    {
      title: "Active Riders",
      value: counts.riders,
      trend: getTrend(counts.riders, counts.prevRiders),
    },
    {
      title: "Active Users",
      value: counts.users,
      trend: getTrend(counts.users, counts.prevUsers),
    },
    {
      title: "Active Chefs",
      value: counts.chefs,
      trend: getTrend(counts.chefs, counts.prevChefs),
    },
    {
      title: "Orders Today",
      value: 0,
      trend: "flat",
    },
    {
      title: "Transactions Today",
      value: 0,
      trend: "flat",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#111] text-white">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h1>

        <div className="bg-[#1F1F1F] p-4 rounded-xl mb-6 shadow flex justify-between items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="text-white text-lg"
            >
              {flashQuotes[currentQuoteIndex]}
            </motion.div>
          </AnimatePresence>
          <div className="text-sm text-gray-400 text-right min-w-[120px]">
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#1F1F1F] p-5 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-sm text-gray-400">{item.title}</h3>
                <p className="text-2xl font-bold mt-2 text-primary">{item.value}</p>
              </div>
              {item.trend === "up" && <ArrowUpRight className="text-green-500" />}
              {item.trend === "down" && <ArrowDownRight className="text-red-500" />}
              {item.trend === "flat" && <span className="text-gray-400 text-2xl">—</span>}
            </motion.div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl text-black w-full max-w-xl mx-auto">
          <h3 className="mb-2 font-semibold">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
