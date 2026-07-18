// Lightweight fallback shown while a lazily-loaded route chunk is downloading.
const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-emerald-600 animate-spin" />
  </div>
);

export default RouteFallback;
