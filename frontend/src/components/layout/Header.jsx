import { Menu, Search, Bell, Calendar } from 'lucide-react';

export default function Header({
  activeTab,
  onOpenMobile,
  fiscalYear,
  setFiscalYear,
  searchQuery,
  setSearchQuery,
  onOpenAlerts,
  alertCount = 80
}) {
  const pageTitles = {
    overview: 'Overview Dashboard',
    projects: 'Project Monitoring & Register',
    anomalies: 'Anomaly Detection & Audit Review',
    geographic: 'Geographic Analysis & Spatial Mapping',
    reports: 'Reports and Analytics',
    settings: 'Settings & Model Thresholds',
    'project-details': 'Project Details',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {pageTitles[activeTab] || 'Dashboard'}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>MPLADS Nodal Analytics</span>
            <span>/</span>
            <span className="text-sky-700 font-medium">Monitoring Cell</span>
          </div>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Project Code, District, or MP..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Fiscal Year, Alerts, User Profile */}
      <div className="flex items-center gap-3">
        {/* Fiscal Year Filter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="FY 2024-25">FY 2024-25</option>
            <option value="FY 2023-24">FY 2023-24</option>
            <option value="FY 2022-23">FY 2022-23</option>
            <option value="All Years">All Fiscal Years</option>
          </select>
        </div>

        {/* Anomaly Alerts Notification Button */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={`${alertCount} audit triggers awaiting review`}
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Role Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs border border-sky-200">
            NA
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              Nodal Officer
            </div>
            <div className="text-[10px] text-slate-500">
              State Oversight
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
