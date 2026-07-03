// src/pages/Info/InfoPageLayout.jsx
import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

const InfoPageLayout = ({ title, icon, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header banner */}
      <div className="bg-green-800 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-green-200 hover:text-white text-sm mb-4 transition"
          >
            <ChevronLeft size={16} /> 
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl"></span>
            <h1 className="text-5xl ml-10 lg:ml-50 font-bold">{title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1500px] mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-6 text-gray-700 leading-relaxed text-[15px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Section = ({ title, children }) => (
  <div>
    <h2 className="text-base font-bold text-green-800 mb-2 flex items-center gap-2">
      <span className="w-1 h-5 bg-green-700 rounded-full inline-block" />
      {title}
    </h2>
    <div className="text-gray-600 space-y-2 pl-3">{children}</div>
  </div>
);

export default InfoPageLayout;