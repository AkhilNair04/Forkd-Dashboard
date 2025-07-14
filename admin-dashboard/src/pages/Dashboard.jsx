import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

const COLORS = ["#F97316", "#10B981", "#3B82F6"];
const DEFAULT_COUNTS = {
  riders: 0,
  users: 0,
  chefs: 0,
  prevRiders: 0,
  prevUsers: 0,
  prevChefs: 0
};

function getPrevStats() {
  try {
    const data = localStorage.getItem("dashboardPrevStats");
    return data ? JSON.parse(data) : DEFAULT_COUNTS;
  } catch (error) {
    console.error("Error loading previous stats:", error);
    return DEFAULT_COUNTS;
  }
}

function setPrevStats(stats) {
  try {
    localStorage.setItem("dashboardPrevStats", JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
}

function generateFlashQuote() {
  try {
    const subjects = ["Orders", "Riders", "Chefs", "Sales", "Platform"];
    const verbs = ["surging", "active", "running smoothly", "showing growth", "performing well"];
    const emojis = ["📦", "🚴‍♂️", "👨‍🍳", "⚡", "📈"];
    const i = Math.floor(Math.random() * subjects.length);
    return `${emojis[i]} ${subjects[i]} are ${verbs[i]} today!`;
  } catch {
    return "📊 System statistics are loading...";
  }
}

export default function Dashboard() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [userTypeData, setUserTypeData] = useState([]);
  const [currentQuote, setCurrentQuote] = useState("📊 Loading dashboard...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  let isMounted = true;
  const controller = new AbortController();

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const prev = getPrevStats();

      // Set timeout for the entire operation
      const timeout = setTimeout(() => {
        if (isMounted) {
          setError("Request timeout - taking longer than expected");
          setLoading(false);
        }
      }, 10000);

      try {
        // Define queries first
        const userQuery = supabase
          .from("user_profiles")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("user_type", "customer");

        const chefQuery = supabase
          .from("Chef")
          .select("*", { count: "exact", head: true })
          .eq("decision", "approved");

        const riderQuery = supabase
          .from("Rider_Details")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved");

        // Add individual timeouts to each query
        const results = await Promise.allSettled([
          Promise.race([
            userQuery,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Users query timeout")), 5000))
          ]),
          Promise.race([
            chefQuery,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Chefs query timeout")), 5000))
          ]),
          Promise.race([
            riderQuery,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Riders query timeout")), 5000))
          ])
        ]);

        // Process results
        const userCount = results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0;
        const chefCount = results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0;
        const riderCount = results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0;

        const stats = {
          riders: Number.isInteger(riderCount) ? riderCount : 0,
          users: Number.isInteger(userCount) ? userCount : 0,
          chefs: Number.isInteger(chefCount) ? chefCount : 0,
          prevRiders: Number.isInteger(prev.riders) ? prev.riders : 0,
          prevUsers: Number.isInteger(prev.users) ? prev.users : 0,
          prevChefs: Number.isInteger(prev.chefs) ? prev.chefs : 0,
        };

        if (isMounted) {
          setCounts(stats);
          setUserTypeData([
            { name: "Users", value: stats.users },
            { name: "Chefs", value: stats.chefs },
            { name: "Riders", value: stats.riders },
          ]);
          setPrevStats(stats);
          setCurrentQuote(generateFlashQuote());
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        if (isMounted) {
          setError(fetchError.message || "Failed to fetch data");
          const fallbackStats = getPrevStats();
          setCounts(fallbackStats);
          setUserTypeData([
            { name: "Users", value: fallbackStats.users },
            { name: "Chefs", value: fallbackStats.chefs },
            { name: "Riders", value: fallbackStats.riders },
          ]);
        }
      } finally {
        clearTimeout(timeout);
        if (isMounted) setLoading(false);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      if (isMounted) {
        setError(err.message || "System error");
        setCounts(DEFAULT_COUNTS);
        setUserTypeData([
          { name: "Users", value: 0 },
          { name: "Chefs", value: 0 },
          { name: "Riders", value: 0 },
        ]);
      }
    }
  }

  fetchStats();

  return () => {
    isMounted = false;
    controller.abort();
  };
}, []);

  useEffect(() => {
    let interval;
    try {
      interval = setInterval(() => {
        setCurrentQuote(generateFlashQuote());
      }, 5000);
    } catch (err) {
      console.error("Interval error:", err);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  function getTrend(newVal, oldVal) {
    try {
      if (typeof newVal !== 'number' || typeof oldVal !== 'number') return "flat";
      if (newVal > oldVal) return "up";
      if (newVal < oldVal) return "down";
      return "flat";
    } catch {
      return "flat";
    }
  }

  const stats = [
    {
      title: "Active Riders",
      value: counts.riders.toLocaleString(),
      trend: getTrend(counts.riders, counts.prevRiders),
    },
    {
      title: "Active Users",
      value: counts.users.toLocaleString(),
      trend: getTrend(counts.users, counts.prevUsers),
    },
    {
      title: "Active Chefs",
      value: counts.chefs.toLocaleString(),
      trend: getTrend(counts.chefs, counts.prevChefs),
    },
    {
      title: "Orders Today",
      value: "0",
      trend: "flat",
    },
    {
      title: "Transactions Today",
      value: "0",
      trend: "flat",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#111] text-white items-center justify-center">
        <div className="text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#111] text-white items-center justify-center">
        <div className="text-xl text-red-500">
          {error}
          <div className="text-sm text-gray-400 mt-2">
            Showing cached data if available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#111] text-white">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h1>

        {/* Flash Quote */}
        <div className="bg-[#1F1F1F] p-4 rounded-xl mb-6 shadow flex justify-between items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="text-white text-lg"
            >
              {currentQuote}
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

        {/* Stats Cards */}
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

        {/* Pie Chart with fallback */}
        <div className="bg-[#1F1F1F] p-4 rounded-xl w-full max-w-xl mx-auto">
          <h3 className="mb-2 font-semibold text-white">User Distribution</h3>
          {userTypeData.some(item => item.value > 0) ? (
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
                  labelLine={false}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Count']}
                  contentStyle={{
                    backgroundColor: '#333',
                    borderColor: '#555',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: '#fff',
                    paddingTop: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available for visualization
            </div>
          )}
        </div>
      </div>
    </div>
  );
}