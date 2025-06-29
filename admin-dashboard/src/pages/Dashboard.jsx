import Sidebar from "../components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";

// Sample Data
const ordersData = [
  { day: "Mon", orders: 120 },
  { day: "Tue", orders: 98 },
  { day: "Wed", orders: 150 },
  { day: "Thu", orders: 130 },
  { day: "Fri", orders: 200 },
  { day: "Sat", orders: 250 },
  { day: "Sun", orders: 180 },
];

const transactionsData = [
  { month: "Jan", value: 3000 },
  { month: "Feb", value: 4200 },
  { month: "Mar", value: 3900 },
  { month: "Apr", value: 5000 },
];

const expendituresData = [
  { month: "Jan", value: 1800 },
  { month: "Feb", value: 2400 },
  { month: "Mar", value: 2100 },
  { month: "Apr", value: 2700 },
];

const profitData = transactionsData.map((t, i) => ({
  month: t.month,
  value: t.value - expendituresData[i]?.value,
}));

const userTypeData = [
  { name: "Users", value: 1245 },
  { name: "Chefs", value: 134 },
  { name: "Riders", value: 98 },
];

const COLORS = ["#F97316", "#10B981", "#3B82F6"];

const flashQuotes = [
  "📦 Orders surging today!",
  "🚴‍♂️ Riders are active and delivering!",
  "👨‍🍳 Chef ratings up 5% this week!",
  "⚡ Platform is running smoothly!",
  "📈 Sales showing an upward trend!",
];

export default function Dashboard() {
  const stats = [
    { title: "Active Riders", value: 98, trend: "up" },
    { title: "Active Users", value: 1245, trend: "up" },
    { title: "Active Chefs", value: 134, trend: "down" },
    { title: "Orders Today", value: 345, trend: "up" },
    { title: "Transactions Today", value: "₹12,300", trend: "up" },
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % flashQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#111] text-white">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h1>

        {/* Flash Card */}
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

        {/* Summary Cards */}
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
              {item.trend === "up" ? (
                <ArrowUpRight className="text-green-500" />
              ) : (
                <ArrowDownRight className="text-red-500" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders This Week */}
          <div className="bg-white p-4 rounded-xl text-black">
            <h3 className="mb-2 font-semibold">Orders This Week</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Transactions */}
          <div className="bg-white p-4 rounded-xl text-black">
            <h3 className="mb-2 font-semibold">Monthly Transactions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={transactionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Expenditures */}
          <div className="bg-white p-4 rounded-xl text-black">
            <h3 className="mb-2 font-semibold">Monthly Expenditures</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={expendituresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Profit */}
          <div className="bg-white p-4 rounded-xl text-black">
            <h3 className="mb-2 font-semibold">Monthly Profit</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white p-4 rounded-xl col-span-1 md:col-span-2 text-black">
            <h3 className="mb-2 font-semibold">User Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
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
    </div>
  );
}