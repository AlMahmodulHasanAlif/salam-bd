// src/pages/Admin/ProfitAdmin.jsx
import React, { useEffect, useRef, useState } from "react";
import useAxiosSecure from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import { getAllOrders } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { TrendingUp, DollarSign, ShoppingBag, BarChart2, Calendar, AlertTriangle } from "lucide-react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isProfitable = (o) => o.status !== "Cancel";

/**
 * For each order item, look up the product's wholesalePrice.
 * profit per item = (sellPrice - wholesalePrice) * quantity
 * If no wholesalePrice found we return null (unknown margin).
 */
const calcOrderProfit = (order, productMap) => {
  const items = order.items || order.products || [];
  if (!items.length) return null;

  let profit = 0;
  let hasWholesale = false;

  items.forEach((item) => {
    const pid = item.productId || item._id;
    const product = pid ? productMap[pid] : null;
    const wholesale = product?.wholesalePrice ?? item.wholesalePrice ?? null;
    const sellPrice = item.price ?? item.unitPrice ?? 0;
    const qty = item.quantity || 1;

    if (wholesale != null) {
      profit += (sellPrice - wholesale) * qty;
      hasWholesale = true;
    }
  });

  return hasWholesale ? profit : null;
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, iconBg, accent }) => (
  <div className={`bg-white rounded-xl border shadow-sm p-6 flex items-center gap-5 border-l-4 ${accent}`}>
    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800 leading-tight">৳{value}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── Bar Chart: daily profit for selected period ──────────────────────────────

const ProfitBarChart = ({ data, labels, title }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Profit (৳)",
            data,
            backgroundColor: data.map((v) => v >= 0 ? "rgba(26,156,110,0.75)" : "rgba(239,68,68,0.7)"),
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 13 } } },
          y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 13 } }, beginAtZero: true },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [data, labels]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <p className="font-semibold text-gray-800 text-base mb-5">{title}</p>
      <div className="relative h-64"><canvas ref={canvasRef} /></div>
    </div>
  );
};

// ─── Donut: revenue vs cost breakdown ────────────────────────────────────────

const RevenueDonut = ({ revenue, cost }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Profit", "Cost"],
        datasets: [{
          data: [Math.max(0, revenue - cost), cost],
          backgroundColor: ["#1a9c6e", "#e5e7eb"],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: { legend: { display: false } },
      },
    });
    return () => chartRef.current?.destroy();
  }, [revenue, cost]);

  const margin = revenue > 0 ? (((revenue - cost) / revenue) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
      <p className="font-semibold text-gray-800 text-base mb-5 self-start">Revenue vs Cost</p>
      <div className="relative h-48 w-48">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-700">{margin}%</span>
          <span className="text-sm text-gray-400">margin</span>
        </div>
      </div>
      <div className="flex gap-6 mt-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#1a9c6e]" />
          <span className="text-gray-500">Profit <b className="text-gray-700">৳{fmt(revenue - cost)}</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gray-200" />
          <span className="text-gray-500">Cost <b className="text-gray-700">৳{fmt(cost)}</b></span>
        </div>
      </div>
    </div>
  );
};

// ─── Top profitable products ──────────────────────────────────────────────────

const TopProducts = ({ orders, productMap }) => {
  const profitByProduct = {};

  orders.filter(isProfitable).forEach((o) => {
    (o.items || o.products || []).forEach((item) => {
      const pid = item.productId || item._id || item.name;
      const product = pid ? productMap[pid] : null;
      const wholesale = product?.wholesalePrice ?? item.wholesalePrice ?? null;
      if (wholesale == null) return;
      const profit = ((item.price ?? 0) - wholesale) * (item.quantity || 1);
      const name = item.name || product?.name || pid || "Unknown";
      profitByProduct[name] = (profitByProduct[name] || 0) + profit;
    });
  });

  const top = Object.entries(profitByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (!top.length)
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="font-semibold text-gray-800 text-base mb-4">Top Profitable Products</p>
        <p className="text-sm text-gray-400 text-center py-8">
          No wholesale price set on products yet.
        </p>
      </div>
    );

  const max = top[0][1];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <p className="font-semibold text-gray-800 text-base mb-5">Top Profitable Products</p>
      <div className="space-y-4">
        {top.map(([name, profit], i) => (
          <div key={name} className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{name}</span>
                <span className="text-sm font-bold text-green-700 ml-2">৳{fmt(profit)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(profit / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── No wholesale price warning ───────────────────────────────────────────────

const NoWholesaleWarning = ({ count }) =>
  count > 0 ? (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-5 py-3 rounded-xl mb-5">
      <AlertTriangle size={16} />
      {count} product{count > 1 ? "s" : ""} have no wholesale price set — their orders are excluded from profit calculations.
    </div>
  ) : null;

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = ["Today", "This Week", "This Month", "This Year", "All Time"];

const ProfitAdmin = () => {
  const axiosSecure        = useAxiosSecure();
  const { user, loading }  = useAuth();
  const [tab, setTab]      = useState("This Month");
  const [orders,   setOrders]   = useState([]);
  const [productMap, setProductMap] = useState({});
  const [noWholesale, setNoWholesale] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      setDataLoading(true);
      Promise.all([getAllOrders(axiosSecure), getProducts()])
        .then(([ordersRes, productsRes]) => {
          const allOrders = ordersRes?.data || [];
          const prods     = productsRes?.data || [];

          // Build id→product map
          const map = {};
          let missing = 0;
          prods.forEach((p) => {
            map[p._id] = p;
            if (!p.wholesalePrice) missing++;
          });

          setOrders(allOrders);
          setProductMap(map);
          setNoWholesale(missing);
        })
        .catch(console.error)
        .finally(() => setDataLoading(false));
    }
  }, [loading, user, axiosSecure]);

  // ── Filter orders by tab ──────────────────────────────────────────────────
  const now = new Date();

  const inRange = (o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    switch (tab) {
      case "Today":
        return d.toDateString() === now.toDateString();
      case "This Week": {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
        return d >= weekAgo;
      }
      case "This Month":
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case "This Year":
        return d.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredOrders = orders.filter((o) => isProfitable(o) && inRange(o));

  // ── Aggregate ─────────────────────────────────────────────────────────────
  let totalRevenue = 0, totalCost = 0, totalProfit = 0, profitableCount = 0;

  filteredOrders.forEach((o) => {
    const rev = o.totalPrice || 0;
    totalRevenue += rev;

    const profit = calcOrderProfit(o, productMap);
    if (profit !== null) {
      totalProfit += profit;
      totalCost   += rev - profit;
      profitableCount++;
    }
  });

  // ── Build bar chart buckets ───────────────────────────────────────────────
  const buildChartData = () => {
    if (tab === "Today") {
      // hourly buckets 0–23
      const hours = Array.from({ length: 24 }, (_, h) => h);
      const buckets = Object.fromEntries(hours.map((h) => [h, 0]));
      filteredOrders.forEach((o) => {
        const h = new Date(o.createdAt).getHours();
        const p = calcOrderProfit(o, productMap);
        if (p !== null) buckets[h] += p;
      });
      return {
        labels: hours.map((h) => `${h}:00`),
        data:   hours.map((h) => Math.round(buckets[h])),
        title:  "Profit by Hour — Today",
      };
    }

    if (tab === "This Week") {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      const buckets = Object.fromEntries(days.map((d) => [d, 0]));
      filteredOrders.forEach((o) => {
        const d = o.createdAt?.slice(0, 10);
        const p = calcOrderProfit(o, productMap);
        if (d && buckets[d] !== undefined && p !== null) buckets[d] += p;
      });
      return {
        labels: days.map((d) => { const [, m, dd] = d.split("-"); return `${m}-${dd}`; }),
        data:   days.map((d) => Math.round(buckets[d])),
        title:  "Daily Profit — This Week",
      };
    }

    if (tab === "This Month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const buckets = Object.fromEntries(days.map((d) => [d, 0]));
      filteredOrders.forEach((o) => {
        const d = new Date(o.createdAt).getDate();
        const p = calcOrderProfit(o, productMap);
        if (p !== null) buckets[d] = (buckets[d] || 0) + p;
      });
      return {
        labels: days.map((d) => String(d)),
        data:   days.map((d) => Math.round(buckets[d])),
        title:  "Daily Profit — This Month",
      };
    }

    if (tab === "This Year") {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const buckets = Object.fromEntries(months.map((m, i) => [i, 0]));
      filteredOrders.forEach((o) => {
        const m = new Date(o.createdAt).getMonth();
        const p = calcOrderProfit(o, productMap);
        if (p !== null) buckets[m] += p;
      });
      return {
        labels: months,
        data:   months.map((_, i) => Math.round(buckets[i])),
        title:  "Monthly Profit — This Year",
      };
    }

    // All Time — yearly
    const years = [...new Set(orders.map((o) => o.createdAt ? new Date(o.createdAt).getFullYear() : null).filter(Boolean))].sort();
    const buckets = Object.fromEntries(years.map((y) => [y, 0]));
    filteredOrders.forEach((o) => {
      const y = new Date(o.createdAt).getFullYear();
      const p = calcOrderProfit(o, productMap);
      if (p !== null) buckets[y] = (buckets[y] || 0) + p;
    });
    return {
      labels: years.map(String),
      data:   years.map((y) => Math.round(buckets[y])),
      title:  "Yearly Profit — All Time",
    };
  };

  const chart = buildChartData();

  if (loading || dataLoading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-600" /> Profit Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">Based on sell price minus wholesale/cost price</p>
        </div>
        {/* Tab switcher */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap
                ${tab === t ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <NoWholesaleWarning count={noWholesale} />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={<DollarSign size={26} className="text-green-600" />}
          iconBg="bg-green-50"
          label="Total Revenue"
          value={fmt(totalRevenue)}
          sub={`${filteredOrders.length} orders`}
          accent="border-green-400"
        />
        <StatCard
          icon={<ShoppingBag size={26} className="text-amber-500" />}
          iconBg="bg-amber-50"
          label="Total Cost"
          value={fmt(totalCost)}
          sub="Wholesale cost"
          accent="border-amber-400"
        />
        <StatCard
          icon={<TrendingUp size={26} className="text-blue-500" />}
          iconBg="bg-blue-50"
          label="Net Profit"
          value={fmt(totalProfit)}
          sub={totalRevenue > 0 ? `${(((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1)}% margin` : "—"}
          accent="border-blue-400"
        />
        <StatCard
          icon={<BarChart2 size={26} className="text-purple-500" />}
          iconBg="bg-purple-50"
          label="Avg Profit / Order"
          value={profitableCount > 0 ? fmt(totalProfit / profitableCount) : "0.00"}
          sub={`${profitableCount} orders with cost data`}
          accent="border-purple-400"
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2">
          <ProfitBarChart data={chart.data} labels={chart.labels} title={chart.title} />
        </div>
        <RevenueDonut revenue={totalRevenue} cost={totalCost} />
      </div>

      {/* ── Top products + summary table ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <TopProducts orders={filteredOrders} productMap={productMap} />

        {/* Period summary table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <p className="font-semibold text-gray-800 text-base mb-5 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" /> Period Summary
          </p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {[
                ["Period",        tab],
                ["Orders",        filteredOrders.length],
                ["Total Revenue", `৳${fmt(totalRevenue)}`],
                ["Total Cost",    `৳${fmt(totalCost)}`],
                ["Net Profit",    `৳${fmt(totalProfit)}`],
                ["Profit Margin", totalRevenue > 0 ? `${(((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(2)}%` : "—"],
                ["Avg Order Value", filteredOrders.length ? `৳${fmt(totalRevenue / filteredOrders.length)}` : "—"],
                ["Avg Profit / Order", profitableCount ? `৳${fmt(totalProfit / profitableCount)}` : "—"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-3 text-gray-400">{label}</td>
                  <td className="py-3 font-semibold text-gray-700 text-right">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitAdmin;