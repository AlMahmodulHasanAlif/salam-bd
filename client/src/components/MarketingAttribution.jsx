// Shows which Meta ad drove an order. Shared by the main order invoice and the
// plugin order detail modal, so both read identically.
//
// Falls back to "Direct / Unknown" for orders placed before attribution
// tracking existed, and for visitors who arrived without ad params.

import { Megaphone } from "lucide-react";

// Order matters — this is the display order in the block.
const ROWS = [
  ["Source", "source"],
  ["Campaign", "campaign"],
  ["Ad Set", "adset"],
  ["Ad", "ad"],
  ["Campaign ID", "campaignId"],
  ["Ad Set ID", "adsetId"],
  ["Ad ID", "adId"],
  ["FB Click ID", "fbclid"],
  ["UTM Campaign", "utmCampaign"],
  ["UTM Content", "utmContent"],
];

const MarketingAttribution = ({ attribution }) => {
  const present = ROWS.filter(([, key]) => attribution?.[key]);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Megaphone size={12} /> Marketing Attribution
      </p>

      {present.length === 0 ? (
        <p className="text-[13px] font-semibold text-gray-400 italic">
          Direct / Unknown
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {present.map(([label, key]) => (
            <div key={key} className="flex gap-2 text-[13px] min-w-0">
              <span className="w-24 shrink-0 text-gray-500">{label}</span>
              {/* IDs and click IDs are long and unbreakable — force wrapping
                  so they can't stretch the modal. */}
              <span className="min-w-0 font-medium text-gray-800 break-all">
                {attribution[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketingAttribution;
