import React, { useEffect, useRef, useState } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import { getAllOrders, getAllUsers } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import {
  ShoppingCart,
  RefreshCw,
  Truck,
  CheckCircle,
  Layers,
  CreditCard,
} from "lucide-react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ─── Helper: exclude cancelled orders from revenue ────────────────────────────
const isProfitable = (o) => o.status !== "Cancel";

// ─── Top Revenue Card ────────────────────────────────────────────────────────
const RevenueCard = ({ label, amount, breakdown, bg, icon }) => (
  <div
    className={`${bg} rounded-xl p-5 text-white flex flex-col items-center text-center gap-2 min-w-0`}
  >
    <div className="opacity-90 mb-1">{icon}</div>
    <p className="text-sm opacity-90 font-medium">{label}</p>
    <p className="text-2xl font-bold truncate w-full text-center">৳{amount}</p>
    {breakdown && (
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs opacity-85 mt-1">
        {breakdown.map((b) => (
          <span key={b.label}>
            {b.label}: ৳{b.value}
          </span>
        ))}
      </div>
    )}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, subValue, iconBg }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-800 leading-tight">
        {value}
        {subValue && (
          <span className="text-base font-semibold text-red-500 ml-1">
            ({subValue})
          </span>
        )}
      </p>
    </div>
  </div>
);

// ─── Line Chart ───────────────────────────────────────────────────────────────
const WeeklySalesChart = ({ orders }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [activeTab, setActiveTab] = useState("sales");

  useEffect(() => {
    if (!canvasRef.current || !orders.length) return;

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const salesByDay = {};
    const ordersByDay = {};
    days.forEach((d) => {
      salesByDay[d] = 0;
      ordersByDay[d] = 0;
    });

    // Only count non-cancelled orders in revenue
    orders.forEach((o) => {
      const day = o.createdAt ? o.createdAt.slice(0, 10) : null;
      if (day && salesByDay[day] !== undefined) {
        if (isProfitable(o)) salesByDay[day] += o.totalPrice || 0;
        ordersByDay[day] += 1; // total order count includes cancelled
      }
    });

    const labels = days.map((d) => {
      const [, m, dd] = d.split("-");
      return `${m}-${dd}`;
    });

    const data =
      activeTab === "sales"
        ? days.map((d) => Math.round(salesByDay[d]))
        : days.map((d) => ordersByDay[d]);

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: activeTab === "sales" ? "Sales (৳)" : "Orders",
            data,
            borderColor: "#1a9c6e",
            backgroundColor: "rgba(26,156,110,0.07)",
            borderWidth: 2,
            pointBackgroundColor: "#1a9c6e",
            pointRadius: 4,
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { size: 10 } },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: { font: { size: 10 } },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [orders, activeTab]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="font-semibold text-gray-800 mb-2 text-sm">Weekly Sales</p>
      <div className="flex gap-4 mb-3">
        {["sales", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs pb-1 capitalize ${
              activeTab === tab
                ? "text-green-700 border-b-2 border-green-700 font-medium"
                : "text-gray-400"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative h-52">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

// ─── Pie Chart ────────────────────────────────────────────────────────────────
const BestSellingChart = ({ products, orders }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Only count items from non-cancelled orders
    const salesCount = {};
    orders.filter(isProfitable).forEach((o) => {
      (o.items || o.products || []).forEach((item) => {
        const name = item.name || item.productName || "Unknown";
        salesCount[name] = (salesCount[name] || 0) + (item.quantity || 1);
      });
    });

    let entries = Object.entries(salesCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!entries.length && products.length) {
      entries = products.slice(0, 4).map((p) => [p.name || p.title || "Product", 1]);
    }
    if (!entries.length) {
      entries = [
        ["Mint", 28],
        ["Head Shoulders Shampoo", 22],
        ["Pantene hair-care", 25],
        ["Dark & Lovely Conditioner", 25],
      ];
    }

    const colors = ["#1a9c6e", "#2b6de6", "#e87c1e", "#3db8e0", "#9b59b6"];
    const labels = entries.map(([name]) => name);
    const data = entries.map(([, val]) => val);

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    return () => chartRef.current?.destroy();
  }, [products, orders]);

  const colors = ["#1a9c6e", "#2b6de6", "#e87c1e", "#3db8e0", "#9b59b6"];

  const salesCount = {};
  orders.filter(isProfitable).forEach((o) => {
    (o.items || o.products || []).forEach((item) => {
      const name = item.name || item.productName || "Unknown";
      salesCount[name] = (salesCount[name] || 0) + (item.quantity || 1);
    });
  });
  let legendItems = Object.entries(salesCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
  if (!legendItems.length && products.length) {
    legendItems = products.slice(0, 4).map((p) => p.name || p.title || "Product");
  }
  if (!legendItems.length) {
    legendItems = ["Mint", "Head Shoulders Shampoo", "Pantene hair-care", "Dark & Lovely Conditioner"];
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="font-semibold text-gray-800 mb-3 text-sm">Best Selling Products</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {legendItems.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: colors[i] }}
            />
            {name}
          </div>
        ))}
      </div>
      <div className="relative h-48">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

// ─── Recent Orders Table ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  "Out-For-Delivery": "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancel: "bg-red-100 text-red-600",
};

const RecentOrders = ({ orders }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
    <p className="font-semibold text-gray-800 mb-4 text-sm">Recent Orders</p>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 text-left border-b border-gray-100">
            <th className="pb-2 font-medium">Order ID</th>
            <th className="pb-2 font-medium">Customer</th>
            <th className="pb-2 font-medium">Total</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${order.status === "Cancel" ? "opacity-50" : ""}`}
            >
              <td className="py-2.5 font-mono">
                #{order._id?.slice(-8).toUpperCase()}
              </td>
              <td className="py-2.5 text-gray-600 max-w-[120px] truncate">
                {order.isGuest ? "Guest" : order.userEmail}
              </td>
              <td className={`py-2.5 font-semibold ${order.status === "Cancel" ? "text-red-400 line-through" : "text-green-700"}`}>
                ৳{order.totalPrice?.toLocaleString()}
              </td>
              <td className="py-2.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-2.5 text-gray-400">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-400">
                No recent orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { user, loading } = useAuth();

  const [stats, setStats] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    thisMonthSales: 0,
    lastMonthSales: 0,
    allTimeSales: 0,
    totalOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    pendingAmount: 0,
    processingOrders: 0,
    deliveredOrders: 0,
  });

  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setDataLoading(true);
      Promise.all([
        getAllOrders(axiosSecure),
        getAllUsers(axiosSecure),
        getProducts(),
      ])
        .then(([ordersRes, , productsRes]) => {
          const orders = ordersRes?.data || [];
          const prods = productsRes?.data || [];

          const now = new Date();
          const todayStr = now.toISOString().slice(0, 10);
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

          let todaySales = 0,
            yesterdaySales = 0,
            thisMonthSales = 0,
            lastMonthSales = 0,
            allTimeSales = 0,
            pendingOrders = 0,
            pendingAmount = 0,
            processingOrders = 0,
            deliveredOrders = 0,
            cancelledOrders = 0;

          orders.forEach((o) => {
            const price = o.totalPrice || 0;
            const date = o.createdAt ? new Date(o.createdAt) : null;
            const dayStr = date ? date.toISOString().slice(0, 10) : "";

            // Count cancelled orders separately — never add to revenue
            if (o.status === "Cancel") {
              cancelledOrders++;
              return; // skip all revenue accumulation
            }

            allTimeSales += price;
            if (dayStr === todayStr) todaySales += price;
            if (dayStr === yesterdayStr) yesterdaySales += price;
            if (
              date &&
              date.getMonth() === thisMonth &&
              date.getFullYear() === thisYear
            )
              thisMonthSales += price;
            if (
              date &&
              date.getMonth() === lastMonthDate.getMonth() &&
              date.getFullYear() === lastMonthDate.getFullYear()
            )
              lastMonthSales += price;

            if (o.status === "Pending") {
              pendingOrders++;
              pendingAmount += price;
            }
            if (o.status === "Processing") processingOrders++;
            if (o.status === "Delivered") deliveredOrders++;
          });

          setStats({
            todaySales,
            yesterdaySales,
            thisMonthSales,
            lastMonthSales,
            allTimeSales,
            totalOrders: orders.length,
            cancelledOrders,
            pendingOrders,
            pendingAmount,
            processingOrders,
            deliveredOrders,
          });

          setAllOrders(orders);
          setProducts(prods);
        })
        .catch((err) => console.error("Admin dashboard error:", err))
        .finally(() => setDataLoading(false));
    }
  }, [loading, user, axiosSecure]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const fmt = (n) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Dashboard Overview</h1>

      {/* ── Top Revenue Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <RevenueCard
          label="Today Orders"
          amount={fmt(stats.todaySales)}
          breakdown={[
            { label: "Cash", value: fmt(stats.todaySales) },
            { label: "Card", value: "0.00" },
            { label: "Credit", value: "0.00" },
          ]}
          bg="bg-[#1a9c6e]"
          icon={<Layers size={28} className="text-white opacity-90" />}
        />
        <RevenueCard
          label="Yesterday Orders"
          amount={fmt(stats.yesterdaySales)}
          breakdown={[
            { label: "Cash", value: fmt(stats.yesterdaySales) },
            { label: "Card", value: "0.00" },
            { label: "Credit", value: "0.00" },
          ]}
          bg="bg-[#e87c1e]"
          icon={<Layers size={28} className="text-white opacity-90" />}
        />
        <RevenueCard
          label="This Month"
          amount={fmt(stats.thisMonthSales)}
          bg="bg-[#2b6de6]"
          icon={<ShoppingCart size={28} className="text-white opacity-90" />}
        />
        <RevenueCard
          label="Last Month"
          amount={fmt(stats.lastMonthSales)}
          bg="bg-[#1a95a8]"
          icon={<CreditCard size={28} className="text-white opacity-90" />}
        />
        <RevenueCard
          label="All-Time Sales"
          amount={fmt(stats.allTimeSales)}
          bg="bg-[#138a50]"
          icon={<CreditCard size={28} className="text-white opacity-90" />}
        />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={<ShoppingCart size={20} className="text-orange-500" />}
          iconBg="bg-orange-50"
          label="Total Orders"
          value={stats.totalOrders}
        />
        <StatCard
          icon={<RefreshCw size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
          label="Orders Pending"
          value={stats.pendingOrders}
          subValue={`৳${fmt(stats.pendingAmount)}`}
        />
        <StatCard
          icon={<Truck size={20} className="text-green-600" />}
          iconBg="bg-green-50"
          label="Orders Processing"
          value={stats.processingOrders}
        />
        <StatCard
          icon={<CheckCircle size={20} className="text-green-600" />}
          iconBg="bg-green-50"
          label="Orders Delivered"
          value={stats.deliveredOrders}
        />
      </div>

      {/* ── Cancelled notice ── */}
      {stats.cancelledOrders > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl mb-4">
          <span className="text-base">⚠️</span>
          {stats.cancelledOrders} cancelled order{stats.cancelledOrders > 1 ? "s" : ""} excluded from all revenue figures.
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeeklySalesChart orders={allOrders} />
        <BestSellingChart products={products} orders={allOrders} />
      </div>

      {/* ── Recent Orders ── */}
      <RecentOrders orders={allOrders.slice(0, 6)} />
    </div>
  );
};

export default AdminDashboard;