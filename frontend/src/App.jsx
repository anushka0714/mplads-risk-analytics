import { useState } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import OverviewDashboard from './pages/OverviewDashboard';
import ProjectMonitoring from './pages/ProjectMonitoring';
import AnomalyDetection from './pages/AnomalyDetection';
import GeographicAnalysis from './pages/GeographicAnalysis';
import ReportsAnalytics from './pages/ReportsAnalytics';
import Settings from './pages/Settings';
import Modal from './components/common/Modal';
import Badge from './components/common/Badge';
import { formatCurrencyLakhs, formatDate } from './utils/formatters';
import { AlertTriangle } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [fiscalYear, setFiscalYear] = useState('FY 2024-25');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drill-down Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProjectDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        alertCount={80}
      >
        {activeTab === 'overview' && (
          <OverviewDashboard
            onSelectProject={handleOpenProjectDetails}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectMonitoring
            onSelectProject={handleOpenProjectDetails}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetection
            onSelectProject={handleOpenProjectDetails}
          />
        )}

        {activeTab === 'geographic' && (
          <GeographicAnalysis
            onNavigateToProjects={() => setActiveTab('projects')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAnalytics />
        )}

        {activeTab === 'settings' && (
          <Settings />
        )}
      </DashboardLayout>

      {/* Slide-over Project Drill-down Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProject?.code || 'Work Dossier'}
        subtitle={selectedProject?.title || 'MPLADS Sanctioned Scheme'}
      >
        {selectedProject && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Status & Risk Badges Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-medium">Status:</span>
                <Badge variant={selectedProject.status}>
                  {selectedProject.status || 'Ongoing'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-medium">Risk Level:</span>
                <Badge variant={selectedProject.riskLevel || (selectedProject.reviewFlag ? 'High Risk' : 'Normal')}>
                  {selectedProject.riskLevel || (selectedProject.reviewFlag ? 'High Risk' : 'Normal')}
                </Badge>
              </div>
            </div>

            {/* Review Flag Notice if flagged */}
            {(selectedProject.reviewFlag || selectedProject.riskLevel === 'High Risk' || selectedProject.riskLevel === 'Medium Risk' || selectedProject.category) && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Administrative Review Trigger: {selectedProject.flagCategory || selectedProject.category || selectedProject.riskLevel}</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  {selectedProject.anomalyReason || selectedProject.flagReason || selectedProject.triggerDescription || 'Automated model identified statistical divergence for verification.'}
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-rose-600">
                  <span>Priority: {selectedProject.riskLevel || selectedProject.flagSeverity || selectedProject.severity || 'Medium'}</span>
                  <span className="italic">Review Notice: Anomaly flags require administrative verification and do not imply fraud.</span>
                </div>
              </div>
            )}

            {/* Administrative & Location Particulars */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Administrative & Location Particulars
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">State</span>
                  <strong className="text-slate-800">{selectedProject.state || 'Madhya Pradesh'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">District Jurisdiction</span>
                  <strong className="text-slate-800">{selectedProject.district}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Constituency</span>
                  <strong className="text-slate-800">{selectedProject.constituency || 'Parliamentary'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Work Type / Sector</span>
                  <strong className="text-slate-800">{selectedProject.workType || selectedProject.sector || 'Rural Infrastructure'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Implementing Agency</span>
                  <strong className="text-slate-800">{selectedProject.implementingAgency || 'District Technical Cell'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Recommending MP</span>
                  <strong className="text-slate-800">{selectedProject.mpName || 'District Parliamentary Office'}</strong>
                </div>
              </div>
            </div>

            {/* Implementation Timeline & Dates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Implementation Timeline & Dates
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Start Date</span>
                  <strong className="text-slate-800 text-xs">
                    {formatDate(selectedProject.startDate || selectedProject.sanctionDate || '2024-02-14')}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Expected Completion</span>
                  <strong className="text-slate-800 text-xs">
                    {formatDate(selectedProject.expectedCompletion || '2024-11-30')}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Financial Year</span>
                  <strong className="text-slate-800 text-xs">
                    {selectedProject.financialYear || 'FY 2024-25'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Financial Ledger
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Sanctioned</span>
                  <strong className="text-slate-800 text-xs">
                    {formatCurrencyLakhs(selectedProject.sanctionAmountLakhs || 30.0)}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Released</span>
                  <strong className="text-slate-800 text-xs">
                    {formatCurrencyLakhs(selectedProject.releasedAmountLakhs || selectedProject.sanctionAmountLakhs || 28.0)}
                  </strong>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-400 block text-[10px]">Expended</span>
                  <strong className="text-sky-700 text-xs">
                    {formatCurrencyLakhs(selectedProject.expenditureLakhs || 25.0)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Physical Milestone Progress */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Physical Execution Index
                </h4>
                <span className="font-bold text-slate-800">
                  {selectedProject.physicalProgress ?? 50}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedProject.physicalProgress === 100
                      ? 'bg-emerald-500'
                      : selectedProject.status === 'Delayed'
                      ? 'bg-amber-500'
                      : selectedProject.status === 'Cancelled'
                      ? 'bg-slate-400'
                      : 'bg-sky-600'
                  }`}
                  style={{ width: `${selectedProject.physicalProgress ?? 50}%` }}
                />
              </div>
            </div>

            {/* Audit Review Actions */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Field Inquiry Assigned for ${selectedProject.code}. Nodal inspection notification dispatched.`);
                  handleCloseModal();
                }}
                className="w-full sm:w-auto flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-center transition-colors shadow-2xs"
              >
                Assign Field Inquiry
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Project ${selectedProject.code} marked as Verified / Normal in audit log.`);
                  handleCloseModal();
                }}
                className="w-full sm:w-auto flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-center transition-colors"
              >
                Mark As Reconciled
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
