import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  fiscalYear,
  setFiscalYear,
  searchQuery,
  setSearchQuery,
  children,
  alertCount
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 flex-1 flex flex-col min-h-screen ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Header */}
        <Header
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAlerts={() => setActiveTab('anomalies')}
          alertCount={alertCount}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>
            MPLADS Monitoring and Anomaly Detection Analytics Platform &bull; Developed for Academic & Administrative Demonstration &bull; Powered by React, Vite & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
