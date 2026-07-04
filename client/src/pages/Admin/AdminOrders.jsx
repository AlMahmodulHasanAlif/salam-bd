// src/pages/Admin/AdminOrders.jsx
import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import useAxiosSecure from "../../hooks/useAxios";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import logo from "../../assets/sitelogo.png";
import toast from "react-hot-toast";
import {
  Search,
  Download,
  Printer,
  ZoomIn,
  ChevronDown,
  Trash2,
  X,
  Mail,
  MapPin,
} from "lucide-react";

const STATUSES = [
  "all",
  "Pending",
  "Processing",
  "Shipped",
  "Out-For-Delivery",
  "Delivered",
  "Cancel",
];

const STATUS_COLORS = {
  Pending: "bg-orange-400 text-white",
  Processing: "bg-pink-500 text-white",
  Shipped: "bg-purple-500 text-white",
  "Out-For-Delivery": "bg-blue-500 text-white",
  Delivered: "bg-green-500 text-white",
  Cancel: "bg-red-500 text-white",
};

const STATUS_HEX = {
  Pending: "#f97316",
  Processing: "#ec4899",
  Shipped: "#a855f7",
  "Out-For-Delivery": "#3b82f6",
  Delivered: "#22c55e",
  Cancel: "#ef4444",
};

const ORDER_LIMITS = [10, 25, 50, 100];
const METHODS = ["All", "Cash", "Card", "Online"];

const shortInvoice = (id = "") =>
  parseInt(id.slice(-5), 16) % 100000 || id.slice(-5).toUpperCase();

const getVariantLabel = (item) =>
  item.variantLabel ||
  item.selectedVariant?.label ||
  item.selectedVariant?.name ||
  item.selectedVariant?.size ||
  item.selectedVariant?.color ||
  null;

/** Build a one-line address string from shippingInfo */
const buildAddress = (info = {}) => {
  const parts = [
    info.address || info.street,
    info.thana,
    info.district,
    info.city,
    info.zip || info.postcode,
    info.country,
  ].filter(Boolean);
  return parts.join(", ") || null;
};

// ─── Address Popover ──────────────────────────────────────────────────────────
const AddressPopover = ({ address, children }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Flip above if too close to bottom
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < 120
          ? rect.top + window.scrollY - 110
          : rect.bottom + window.scrollY + 6;
      let left = rect.left + window.scrollX;
      // Clamp so it doesn't go off right edge
      if (left + 256 > window.innerWidth - 12) {
        left = window.innerWidth - 268;
      }
      setPos({ top, left });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <div ref={triggerRef} onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      {open &&
        ReactDOM.createPortal(
          <div
            style={{ top: pos.top, left: pos.left }}
            className="absolute z-[9999] w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Full Address
            </p>
            <div className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0 text-green-500" />
              <p className="text-xs text-gray-700 leading-relaxed">{address}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── Invoice Modal ────────────────────────────────────────────────────────────
const InvoiceModal = ({ order, onClose }) => {
  const invoiceRef = useRef(null);
  if (!order) return null;

  const items = order.items || order.products || [];
  const shipping = Number(
    order.shippingInfo?.shippingCharge ??
      order.shippingCost ??
      order.shippingInfo?.shippingCost ??
      0,
  );
  const discount = Number(order.discount ?? 0);
  const statusHex = STATUS_HEX[order.status] || "#6b7280";

  const invoiceHTML = () => `
    <html>
    <head>
      <title>Invoice #${shortInvoice(order._id)} — SalamBD</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',Tahoma,sans-serif;background:#f0ede8;padding:32px;color:#1a1a1a}
        .wrap{background:#fff;border-radius:12px;padding:44px;max-width:760px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
        .brand{text-align:right}
        .brand-name{font-size:20px;font-weight:800;letter-spacing:.08em;color:#1a1a1a}
        .brand-sub{font-size:11px;color:#64748b;line-height:1.8;margin-top:4px}
        .invoice-title{font-size:30px;font-weight:800;letter-spacing:.06em;font-family:Georgia,serif}
        .status-row{display:flex;align-items:center;gap:8px;margin-top:8px}
        .status-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em}
        .status-pill{font-size:11px;font-weight:700;color:#fff;padding:2px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:.04em;background:${statusHex}}
        .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:24px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;margin-bottom:28px}
        .meta-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
        .meta-val{font-size:13px;font-weight:600;color:#1a1a1a}
        .meta-sub{font-size:11px;color:#64748b;line-height:1.7}
        .meta-right{text-align:right}
        table{width:100%;border-collapse:collapse;margin-bottom:28px}
        th{background:#f8fafc;padding:10px 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;text-align:left}
        th:last-child,th:nth-child(3),th:nth-child(4){text-align:right}
        td{padding:12px 14px;font-size:13px;border-bottom:1px solid #f1f5f9}
        td:last-child,td:nth-child(3),td:nth-child(4){text-align:right}
        .variant-pill{display:inline-block;font-size:10px;font-weight:700;color:#ea580c;background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:1px 8px;margin-top:3px}
        .red{color:#ef4444;font-weight:700}
        .footer{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;border-top:2px solid #f1f5f9;padding-top:20px}
        .f-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
        .f-val{font-size:13px;font-weight:600;color:#1a1a1a}
        .total-wrap{text-align:right}
        .total-val{font-size:24px;font-weight:800;color:#ef4444}
        @media print{body{background:white;padding:0}.wrap{border-radius:0;padding:32px}}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="status-row">
              <span class="status-label">STATUS</span>
              <span class="status-pill">${order.status || "—"}</span>
            </div>
          </div>
          <div class="brand">
            <div style="width:36px;height:36px;background:#16a34a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:6px">
              <span style="color:#fff;font-size:18px;font-weight:800">SalamBD</span>
            </div>
            <div class="brand-name"> <img src={logo} alt="" /> </div>
            <div class="brand-sub">
              37 Ma Amena Plaza, (6th floor of Sundarban Courier),<br/>
              falpatti area, Mirpur-10, Dhaka-1216<br/>
              01886699883<br/>
              salambd.contact@gmail.com<br/>
              salambd.com
            </div>
          </div>
        </div>
        <div class="meta">
          <div>
            <div class="meta-label">Date</div>
            <div class="meta-val">${order.createdAt ? new Date(order.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</div>
          </div>
          <div>
            <div class="meta-label">Invoice No</div>
            <div class="meta-val">#${shortInvoice(order._id)}</div>
          </div>
          <div class="meta-right">
            <div class="meta-label">Invoice To</div>
            <div class="meta-val">${order.shippingInfo?.name || order.userEmail || "Guest"}</div>
            <div class="meta-sub">
              ${order.userEmail ? order.userEmail + "<br/>" : ""}
              ${order.shippingInfo?.phone ? order.shippingInfo.phone + "<br/>" : ""}
              ${order.shippingInfo?.address ? order.shippingInfo.address + "<br/>" : ""}
              ${order.shippingInfo?.thana ? "Thana/Upazila: " + order.shippingInfo.thana + "<br/>" : ""}
              ${order.shippingInfo?.district ? "District: " + order.shippingInfo.district : ""}
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr.</th><th>Product Title</th><th>Quantity</th><th>Item Price</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              items.length
                ? items
                    .map((item, i) => {
                      const vLabel = getVariantLabel(item);
                      return `<tr>
                <td style="color:#94a3b8">${i + 1}</td>
                <td style="font-weight:500">
                  ${item.name || item.productName || "Item"}
                  ${vLabel ? `<br/><span class="variant-pill">⬡ ${vLabel}</span>` : ""}
                </td>
                <td style="font-weight:700;text-align:right">${item.quantity || 1}</td>
                <td style="font-weight:700;text-align:right">৳${Number(item.price || 0).toFixed(2)}</td>
                <td class="red" style="text-align:right">৳${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
              </tr>`;
                    })
                    .join("")
                : `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">No items</td></tr>`
            }
          </tbody>
        </table>
        <div class="footer">
          <div><div class="f-label">Payment Method</div><div class="f-val">${order.method || "Cash"}</div></div>
          <div><div class="f-label">Shipping Cost</div><div class="f-val">৳${shipping.toFixed(2)}</div></div>
          <div><div class="f-label">Discount</div><div class="f-val">৳${discount.toFixed(2)}</div></div>
          <div class="total-wrap"><div class="f-label">Total Amount</div><div class="total-val">৳${Number(order.totalPrice || 0).toFixed(2)}</div></div>
        </div>
      </div>
      <script>window.onload=function(){window.print();}</script>
    </body>
    </html>
  `;

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=900,height=800");
    win.document.write(invoiceHTML());
    win.document.close();
  };

  const handleDownload = () => {
    const blob = new Blob([invoiceHTML()], {
      type: "text/html;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${shortInvoice(order._id)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-[#f0ede8] rounded-2xl w-full max-w-3xl my-4 sm:my-6 shadow-2xl">
        {/* Modal top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e0dbd3]">
          <h2 className="font-bold text-gray-600 text-sm tracking-widest uppercase">
            Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-white/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Invoice preview */}
        <div className="p-3 sm:p-6">
          <div
            ref={invoiceRef}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
                <div>
                  <h1
                    style={{
                      fontFamily: "Georgia,serif",
                      fontSize: 24,
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                    }}
                  >
                    INVOICE
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </span>
                    <span
                      style={{ background: statusHex }}
                      className="text-[11px] font-bold text-white px-3 py-0.5 rounded-full uppercase tracking-wide"
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 mb-1">
                    <div className="w-35 rounded-lg flex items-center justify-center shrink-0">
                      <img src={logo} alt="" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    37 Ma Amena Plaza, (6th floor of Sundarban Courier), falpatti
                    area, Mirpur-10, Dhaka-1216
                    <br />
                    01886699883 · salambd.contact@gmail.com
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-t border-b border-gray-100 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Ordered
                  </p>
                  <p className="text-[13px] font-semibold text-gray-800">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Invoice No
                  </p>
                  <p className="text-[13px] font-bold text-gray-800">
                    #{shortInvoice(order._id)}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 sm:text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Invoice To
                  </p>
                  <p className="text-[13px] font-bold text-gray-800">
                    {order.shippingInfo?.name || order.userEmail || "Guest"}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                    {order.userEmail && (
                      <>
                        {order.userEmail}
                        <br />
                      </>
                    )}
                    {order.shippingInfo?.phone && (
                      <>
                        {order.shippingInfo.phone}
                        <br />
                      </>
                    )}
                    {order.shippingInfo?.address && (
                      <>
                        {order.shippingInfo.address}
                        <br />
                      </>
                    )}
                    {order.shippingInfo?.thana && (
                      <>
                        Thana/Upazila: {order.shippingInfo.thana}
                        <br />
                      </>
                    )}
                    {order.shippingInfo?.district && (
                      <>District: {order.shippingInfo.district}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Items table — scrollable on mobile */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse", minWidth: 420 }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Sr.", "Product Title", "Qty", "Price", "Amount"].map(
                        (h, i) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 12px",
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#64748b",
                              textAlign: i >= 2 ? "right" : "left",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, i) => {
                        const vLabel = getVariantLabel(item);
                        return (
                          <tr
                            key={i}
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                          >
                            <td
                              style={{
                                padding: "10px 12px",
                                fontSize: 13,
                                color: "#94a3b8",
                              }}
                            >
                              {i + 1}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: 500,
                              }}
                            >
                              <div>
                                {item.name || item.productName || "Item"}
                              </div>
                              {vLabel && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    marginTop: 3,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: "#ea580c",
                                    background: "#fff7ed",
                                    border: "1px solid #fed7aa",
                                    borderRadius: 20,
                                    padding: "1px 8px",
                                  }}
                                >
                                  ⬡ {vLabel}
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: 700,
                                textAlign: "right",
                              }}
                            >
                              {item.quantity || 1}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: 700,
                                textAlign: "right",
                              }}
                            >
                              ৳{Number(item.price || 0).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#ef4444",
                                textAlign: "right",
                              }}
                            >
                              ৳
                              {(
                                Number(item.price || 0) *
                                Number(item.quantity || 1)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: 20,
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t-2 border-gray-100">
                {[
                  ["Payment", order.method || "Cash"],
                  ["Shipping", `৳${shipping.toFixed(2)}`],
                  ["Discount", `৳${discount.toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-[13px] font-semibold text-gray-800">
                      {val}
                    </p>
                  </div>
                ))}
                <div className="text-right col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Total
                  </p>
                  <p className="text-[22px] font-black text-red-500">
                    ৳{Number(order.totalPrice || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 sm:px-6 py-4 border-t border-[#e0dbd3]">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Download size={15} /> Download Invoice
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toast("Email feature coming soon")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Mail size={15} /> Email
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Printer size={15} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Order Card ────────────────────────────────────────────────────────
const OrderCard = ({ o, onInvoice, onStatusChange, onDelete }) => {
  const orderItems = o.items || o.products || [];
  const address = buildAddress(o.shippingInfo || {});

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Top row: invoice no + status badge + amount */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            #{shortInvoice(o._id)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {o.createdAt
              ? new Date(o.createdAt).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {o.status && (
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
            >
              {o.status}
            </span>
          )}
          <span className="text-sm font-black text-gray-800">
            ৳{o.totalPrice}
          </span>
        </div>
      </div>

      {/* Customer + address */}
      <div className="border-t border-gray-50 pt-2.5 space-y-1">
        <p className="text-sm font-semibold text-gray-700">
          {o.shippingInfo?.name || (o.isGuest ? "Guest" : o.userEmail) || "—"}
        </p>
        {address && (
          <AddressPopover address={address}>
            <p className="flex items-start gap-1 text-[11px] text-gray-400 leading-snug hover:text-green-600 transition-colors">
              <MapPin size={11} className="mt-0.5 shrink-0 text-green-500" />
              <span className="line-clamp-1 underline decoration-dotted underline-offset-2">
                {address}
              </span>
            </p>
          </AddressPopover>
        )}
        {o.shippingInfo?.phone && (
          <p className="text-[11px] text-gray-400">{o.shippingInfo.phone}</p>
        )}
      </div>

      {/* Items */}
      <div className="border-t border-gray-50 pt-2.5 space-y-1.5">
        {orderItems.length > 0 ? (
          orderItems.map((item, idx) => {
            const vLabel = getVariantLabel(item);
            return (
              <div key={idx} className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-700 font-medium leading-snug">
                  {item.name || item.productName || "Item"}{" "}
                  <span className="text-gray-400 font-normal">
                    ×{item.quantity || 1}
                  </span>
                </span>
                {vLabel && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                    ⬡ {vLabel}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <span className="text-xs text-gray-300 italic">No items</span>
        )}
      </div>

      {/* Method + status selector */}
      <div className="border-t border-gray-50 pt-2.5 flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded-lg px-2 py-1 shrink-0">
          {o.method || "Cash"}
        </span>
        <div className="relative flex-1">
          <select
            value={o.status}
            onChange={(e) => onStatusChange(o._id, e.target.value)}
            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none cursor-pointer bg-white focus:border-green-500 pr-7"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out-For-Delivery">Out-For-Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancel">Cancel</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-50 pt-2.5 flex items-center gap-2">
        <button
          onClick={() => onInvoice(o)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl py-2 hover:bg-green-100 transition"
        >
          <ZoomIn size={13} /> View Invoice
        </button>
        <button
          onClick={() => onInvoice(o)}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          title="Print Invoice"
        >
          <Printer size={15} />
        </button>
        <button
          onClick={() => onDelete(o._id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          title="Delete Order"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminOrders = () => {
  const axiosSecure = useAxiosSecure();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("All");
  const [limit, setLimit] = useState(25);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    method: "All",
    startDate: "",
    endDate: "",
  });
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const load = async (s = "all") => {
    setLoading(true);
    try {
      const r = await getAllOrders(axiosSecure, s);
      setOrders(r.data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(axiosSecure, id, status);
      toast.success(`→ ${status}`);
      load(filter);
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this order? This cannot be undone."))
      return;
    try {
      await axiosSecure.delete(`/orders/${id}`);
      toast.success("Order deleted");
      load(filter);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleFilter = () =>
    setPendingFilters({ search, method, startDate, endDate });

  const handleReset = () => {
    setSearch("");
    setMethod("All");
    setStartDate("");
    setEndDate("");
    setLimit(25);
    setFilter("all");
    setPendingFilters({
      search: "",
      method: "All",
      startDate: "",
      endDate: "",
    });
  };

  const filtered = orders
    .filter((o) => {
      const q = pendingFilters.search.toLowerCase();
      if (
        q &&
        !(o.shippingInfo?.name || o.userEmail || "").toLowerCase().includes(q)
      )
        return false;
      if (pendingFilters.method !== "All" && o.method !== pendingFilters.method)
        return false;
      if (
        pendingFilters.startDate &&
        new Date(o.createdAt) < new Date(pendingFilters.startDate)
      )
        return false;
      if (
        pendingFilters.endDate &&
        new Date(o.createdAt) > new Date(pendingFilters.endDate + "T23:59:59")
      )
        return false;
      return true;
    })
    .slice(0, limit);

  const downloadCSV = () => {
    const headers = [
      "Invoice No",
      "Order Time",
      "Customer Name",
      "Address",
      "Method",
      "Amount",
      "Status",
      "Items (with variants)",
    ];
    const rows = filtered.map((o) => {
      const itemsSummary = (o.items || o.products || [])
        .map((item) => {
          const v = getVariantLabel(item);
          return `${item.name || "Item"}${v ? ` [${v}]` : ""} x${item.quantity || 1}`;
        })
        .join(" | ");
      return [
        shortInvoice(o._id),
        o.createdAt
          ? new Date(o.createdAt).toLocaleString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        o.shippingInfo?.name || o.userEmail || "Guest",
        buildAddress(o.shippingInfo || {}) || "",
        o.method || "Cash",
        o.totalPrice,
        o.status,
        itemsSummary,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5">
        {/* Row 1: search + selects + download */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center mb-4">
          <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Customer Name"
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>

          {/* Three selects in a tight row on mobile */}
          <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-3">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-green-500 pr-7 bg-white cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "Status" : s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-green-500 pr-7 bg-white cursor-pointer"
              >
                {ORDER_LIMITS.map((l) => (
                  <option key={l} value={l}>
                    Show {l}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="relative">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-green-500 pr-7 bg-white cursor-pointer"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m === "All" ? "Method" : m}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap w-full sm:w-auto"
          >
            <Download size={14} /> Download CSV
          </button>
        </div>

        {/* Row 2: date filters */}
        <div className="grid grid-cols-2 sm:flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-6 py-2 rounded-lg transition col-span-1"
          >
            Filter
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-200 text-gray-600 font-medium text-sm px-6 py-2 rounded-lg hover:bg-gray-50 transition col-span-1"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* ── Desktop Table (md+) ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                  {[
                    "Invoice No",
                    "Order Time",
                    "Customer",
                    "Address",
                    "Items",
                    "Method",
                    "Amount",
                    "Status",
                    "Action",
                    "Invoice",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`p-4 font-semibold text-xs uppercase tracking-wide${i === 9 ? " text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const orderItems = o.items || o.products || [];
                  const address = buildAddress(o.shippingInfo || {});
                  return (
                    <tr
                      key={o._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-semibold text-gray-700 text-xs">
                        {shortInvoice(o._id)}
                      </td>
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="p-4 font-medium text-gray-700 text-xs max-w-[120px] truncate">
                        {o.shippingInfo?.name ||
                          (o.isGuest ? "Guest" : o.userEmail) ||
                          "—"}
                      </td>

                      {/* Address — click to open popover */}
                      <td className="p-4 max-w-[160px]">
                        {address ? (
                          <AddressPopover address={address}>
                            <div className="flex items-start gap-1 group">
                              <MapPin
                                size={11}
                                className="mt-0.5 shrink-0 text-green-500"
                              />
                              <span className="text-xs text-gray-500 leading-snug line-clamp-2 group-hover:text-green-600 transition-colors underline decoration-dotted underline-offset-2">
                                {address}
                              </span>
                            </div>
                          </AddressPopover>
                        ) : (
                          <span className="text-xs text-gray-300 italic">
                            —
                          </span>
                        )}
                      </td>

                      {/* Items + variant pills */}
                      <td className="p-4 max-w-[200px]">
                        <div className="space-y-1.5">
                          {orderItems.length > 0 ? (
                            orderItems.map((item, idx) => {
                              const vLabel = getVariantLabel(item);
                              return (
                                <div
                                  key={idx}
                                  className="flex flex-col gap-0.5"
                                >
                                  <span className="text-xs text-gray-700 font-medium leading-snug line-clamp-1">
                                    {item.name || item.productName || "Item"}{" "}
                                    <span className="text-gray-400 font-normal">
                                      ×{item.quantity || 1}
                                    </span>
                                  </span>
                                  {vLabel && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                                      ⬡ {vLabel}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-gray-300 italic">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-gray-700 text-xs">
                        {o.method || "Cash"}
                      </td>
                      <td className="p-4 font-bold text-gray-800 text-xs whitespace-nowrap">
                        ৳{o.totalPrice}
                      </td>
                      <td className="p-4">
                        {o.status ? (
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {o.status}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="relative inline-block min-w-[148px]">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleStatus(o._id, e.target.value)
                            }
                            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none cursor-pointer bg-white focus:border-green-500 pr-7"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out-For-Delivery">
                              Out-For-Delivery
                            </option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancel">Cancel</option>
                          </select>
                          <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInvoiceOrder(o)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="View Invoice"
                          >
                            <ZoomIn size={14} />
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(o)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            title="Print Invoice"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(o._id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="text-center py-12 text-gray-400">
                No orders found
              </div>
            )}
          </div>

          {/* ── Mobile Cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <OrderCard
                  key={o._id}
                  o={o}
                  onInvoice={setInvoiceOrder}
                  onStatusChange={handleStatus}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                No orders found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
