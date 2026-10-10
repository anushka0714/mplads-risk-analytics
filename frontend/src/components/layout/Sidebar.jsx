import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  MapPin,
  FileBarChart,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'projects', label: 'Project Monitoring', icon: ClipboardList, badge: '1,428' },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, badge: '80', badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'geographic', label: 'Geographic Analysis', icon: MapPin, badge: null },
    { id: 'reports', label: 'Reports and Analytics', icon: FileBarChart, badge: null },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, badge: null },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-200">
                <Shield className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-700">
                    MPLADS Platform
                  </div>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    Analytics & Monitoring
                  </div>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop only) */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 items-center justify-center transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (activeTab === 'project-details' && item.id === 'projects');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                    ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                  `}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-600 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Compliance & Nodal Box */}
        <div className="p-3 border-t border-slate-100">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Nodal Portal Sync
                </span>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">v1.2</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ministry of Statistics & Programme Implementation (MoSPI) schema aligned.
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-2" title="MoSPI Aligned System">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
