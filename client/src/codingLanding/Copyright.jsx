export default function Copyright() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-3">
        <p className="text-sm text-slate-500">
          © {year} <span className="text-slate-800 font-medium">SalamBD</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}
