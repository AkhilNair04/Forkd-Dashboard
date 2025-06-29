import Sidebar from "../components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// Sample Data
const ordersData = [
  { day: 'Mon', orders: 120 },
  { day: 'Tue', orders: 98 },
  { day: 'Wed', orders: 150 },
  { day: 'Thu', orders: 130 },
  { day: 'Fri', orders: 200 },
  { day: 'Sat', orders: 250 },
  { day: 'Sun', orders: 180 },
];

const transactionsData = [
  { month: 'Jan', value: 3000 },
  { month: 'Feb', value: 4200 },
  { month: 'Mar', value: 3900 },
  { month: 'Apr', value: 5000 },
];

const userTypeData = [
  { name: 'Users', value: 1245 },
  { name: 'Chefs', value: 134 },
  { name: 'Riders', value: 98 },
];

const COLORS = ['#F97316', '#10B981', '#3B82F6'];

export default function Dashboard() {
  const stats = [
    { title: "Total Users", value: 1245 },
    { title: "Active Chefs", value: 134 },
    { title: "Active Riders", value: 98 },
    { title: "Total Orders", value: 5210 },
    { title: "Total Transactions", value: "₹1,12,000" },
  ];

  return (
    <div className="flex min-h-screen">

      <div className="flex-1 bg-[#111] text-white p-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Dashboard Overview</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-[#1F1F1F] p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-sm text-gray-400">{item.title}</h3>
              <p className="text-2xl font-bold mt-2 text-primary">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-[#1F1F1F] p-4 rounded-xl">
            <h3 className="text-white mb-2 font-semibold">Orders This Week</h3>
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

          {/* Line Chart */}
          <div className="bg-[#1F1F1F] p-4 rounded-xl">
            <h3 className="text-white mb-2 font-semibold">Monthly Transactions</h3>
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

          {/* Pie Chart */}
          <div className="bg-[#1F1F1F] p-4 rounded-xl col-span-1 md:col-span-2">
            <h3 className="text-white mb-2 font-semibold">User Distribution</h3>
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