import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  FileText,
  MapPin,
  TrendingUp,
  IndianRupee,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Info,
  X,
  FileCheck,
  Share2,
  Send,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { getProjectById, DISTRICTS } from '../services/mockData';
import { formatCurrencyLakhs, formatDate, formatPercent } from '../utils/formatters';

// Clean Leaflet marker icon
const createProjectPin = (hasAnomaly) => {
  const bgColor = hasAnomaly ? 'bg-rose-600' : 'bg-sky-600';
  const ringColor = hasAnomaly ? 'ring-rose-200' : 'ring-sky-200';

  return L.divIcon({
    className: 'custom-project-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full ${bgColor} text-white font-bold text-xs flex items-center justify-center shadow-md ring-4 ${ringColor}">
          ${hasAnomaly ? '!' : '✓'}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function ProjectDetails({
  project: initialProject,
  projectId,
  onBack,
  onNavigateToAnomalies
}) {
  // Modal state for "Review Project" action
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [auditDecision, setAuditDecision] = useState('Field Inquiry Dispatched');
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Resolve project from prop or via identifier lookup
  const project = useMemo(() => {
    if (initialProject && initialProject.code) return initialProject;
    if (projectId) return getProjectById(projectId);
    return null;
  }, [initialProject, projectId]);

  // Show transient notification toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 15. Error / Missing Project State
  if (!project) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Project Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              We could not find an administrative record matching ID{' '}
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {projectId || 'Unknown'}
              </span>
              . The work order may have been decommissioned or the identifier is invalid.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm shadow-sky-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Derived Financial Calculations (Requirement 4)
  const sanctioned = Number(project.sanctionAmountLakhs || 0);
  const released = Number(project.releasedAmountLakhs ?? sanctioned);
  const expenditure = Number(project.expenditureLakhs || 0);
  const remaining = Math.max(0, sanctioned - expenditure);

  // Financial Progress = (Expenditure / Sanctioned Amount) × 100
  const rawFinancialProgress = sanctioned > 0 ? (expenditure / sanctioned) * 100 : 0;
  const financialProgress = Math.round(rawFinancialProgress * 10) / 10;
  // Progress bar visually capped at 100%
  const financialProgressVisual = Math.min(financialProgress, 100);

  // Derived Physical Progress (Requirement 5)
  const physicalProgress = project.physicalProgress ?? 0;
  const totalMilestones = 5;
  const completedMilestones = useMemo(() => {
    if (physicalProgress >= 100) return 5;
    if (physicalProgress >= 75) return 4;
    if (physicalProgress >= 50) return 3;
    if (physicalProgress >= 25) return 2;
    if (physicalProgress > 0) return 1;
    return 0;
  }, [physicalProgress]);

  // Milestone Stages
  const milestonesList = [
    { id: 1, name: 'Administrative Sanction & DPR Approval', status: completedMilestones >= 1 ? 'completed' : 'pending' },
    { id: 2, name: 'Technical Sanction & Tender Award', status: completedMilestones >= 2 ? 'completed' : completedMilestones === 1 ? 'current' : 'pending' },
    { id: 3, name: 'Foundation & Structural Framing Execution', status: completedMilestones >= 3 ? 'completed' : completedMilestones === 2 ? 'current' : 'pending' },
    { id: 4, name: 'Core Infrastructure & Finishing Works', status: completedMilestones >= 4 ? 'completed' : completedMilestones === 3 ? 'current' : 'pending' },
    { id: 5, name: 'Final Inspection & Utilization Certificate Handover', status: completedMilestones >= 5 ? 'completed' : completedMilestones === 4 ? 'current' : 'pending' },
  ];

  // Derived Timeline Stages (Requirement 6)
  const timelineStages = [
    {
      title: 'Project Sanctioned',
      date: formatDate(project.sanctionDate || project.startDate || '2024-02-14'),
      status: 'completed',
      detail: `Administrative order issued: ${formatCurrencyLakhs(sanctioned)} approved.`
    },
    {
      title: 'Funds Released',
      date: formatDate(project.sanctionDate || '2024-03-01'),
      status: released > 0 ? 'completed' : 'upcoming',
      detail: `${formatCurrencyLakhs(released)} released to implementing agency.`
    },
    {
      title: 'Work Started',
      date: formatDate(project.startDate || '2024-03-15'),
      status: project.status === 'Not Started' ? 'upcoming' : 'completed',
      detail: 'Site mobilized and initial ground execution initiated.'
    },
    {
      title: 'Current Progress',
      date: 'Active Assessment',
      status: project.status === 'Completed' ? 'completed' : 'current',
      detail: `Recorded physical index: ${physicalProgress}%. Spend: ${formatPercent(financialProgress)}.`
    },
    {
      title: 'Expected Completion',
      date: formatDate(project.expectedCompletion || '2024-12-31'),
      status: project.status === 'Completed' ? 'completed' : 'upcoming',
      detail: project.status === 'Completed' ? 'Work completed and handed over.' : 'Target deadline for final site verification.'
    }
  ];

  // Anomaly / Risk Information (Requirement 8)
  const hasAnomaly = Boolean(
    project.reviewFlag ||
    project.riskLevel === 'High Risk' ||
    project.riskLevel === 'Medium Risk' ||
    project.anomalyReason ||
    project.flagReason
  );

  const anomalyType =
    project.flagCategory ||
    project.category ||
    (hasAnomaly ? 'Progress-Disbursement Divergence' : null);

  const riskLevel =
    project.riskLevel ||
    (project.reviewFlag ? 'Medium Risk' : 'Normal');

  const anomalyReasonText =
    project.anomalyReason ||
    project.flagReason ||
    project.triggerDescription ||
    'Statistical divergence identified between expenditure velocity and certified ground milestones.';

  // Location Coordinates (Requirement 9)
  const matchedDistrict = DISTRICTS.find(
    (d) => d.name.toLowerCase() === (project.district || '').toLowerCase()
  );
  const locationCoords = matchedDistrict ? [matchedDistrict.lat, matchedDistrict.lng] : [23.85, 78.50];

  // Document checklist (Requirement 10)
  const documents = [
    {
      name: 'Sanction Letter',
      type: 'Administrative Approval (Order)',
      date: project.sanctionDate || '2024-02-14',
      status: 'Available',
      refCode: `AS/${project.code || 'DOC-01'}/24`
    },
    {
      name: 'Project Proposal & Detailed Project Report (DPR)',
      type: 'Technical Appraisal Dossier',
      date: project.startDate || '2024-02-20',
      status: 'Available',
      refCode: `DPR/${project.code || 'DOC-02'}`
    },
    {
      name: 'Utilization Certificate (UC)',
      type: 'Statutory Financial Audit Sign-off',
      date: project.status === 'Completed' ? '2024-11-20' : 'Pending Verification',
      status: project.status === 'Completed' ? 'Available' : 'Pending',
      refCode: project.status === 'Completed' ? `UC/MoSPI/${project.code}` : 'Awaiting Final Spend'
    },
    {
      name: 'Completion Certificate',
      type: 'Technical Handover Sign-off',
      date: project.status === 'Completed' ? formatDate(project.expectedCompletion) : 'Awaiting Execution',
      status: project.status === 'Completed' ? 'Available' : 'Pending',
      refCode: project.status === 'Completed' ? `CC/Nodal/${project.code}` : 'Pending Completion'
    },
    {
      name: 'Quarterly Progress Report (QPR)',
      type: 'Field Inspection Milestone Log',
      date: '2025-01-15',
      status: 'Available',
      refCode: `QPR/Q3/${project.code || 'DOC-05'}`
    }
  ];

  // Days Remaining / Delay KPI indicator (Requirement 11)
  const getDaysStatus = () => {
    if (project.status === 'Completed') return { text: 'Completed', variant: 'success' };
    if (project.status === 'Delayed') return { text: 'Delayed', variant: 'danger' };
    if (project.expectedCompletion) {
      const diffMs = new Date(project.expectedCompletion) - new Date();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { text: 'Delayed', variant: 'danger' };
      return { text: `${diffDays} Days Left`, variant: 'default' };
    }
    return { text: 'In Progress', variant: 'default' };
  };

  const daysStatus = getDaysStatus();

  // Handle Review Modal Submission
  const handleSaveReview = (e) => {
    e.preventDefault();
    setIsReviewModalOpen(false);
    showToast(`Administrative Note logged for ${project.code}. Action assigned: "${auditDecision}".`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. PAGE HEADER & BREADCRUMB */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-4">
        {/* Top Header Row with Navigation and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              Back to Projects
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500">
              Project Details &bull; <span className="font-mono font-semibold text-slate-700">{project.code || project.id}</span>
            </span>
          </div>

          {/* Status & Risk Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.status}>
              {project.status || 'Ongoing'}
            </Badge>

            {hasAnomaly ? (
              <Badge variant={riskLevel}>
                {riskLevel}
              </Badge>
            ) : (
              <Badge variant="normal">
                Normal Risk
              </Badge>
            )}
          </div>
        </div>

        {/* Project Title & Meta Banner */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                {project.code || project.id}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                {project.workType || project.sector || 'MPLADS Scheme'}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.district}, {project.state || 'Madhya Pradesh'}
              </span>
              <span className="text-slate-300">&bull;</span>
              <span>Constituency: <strong className="text-slate-700">{project.constituency || 'Parliamentary'}</strong></span>
              <span className="text-slate-300">&bull;</span>
              <span>Agency: <strong className="text-slate-700">{project.implementingAgency}</strong></span>
            </div>
          </div>

          {/* 12. Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
            {hasAnomaly && (
              <button
                type="button"
                onClick={() => {
                  const anomalyEl = document.getElementById('anomaly-section');
                  if (anomalyEl) {
                    anomalyEl.scrollIntoView({ behavior: 'smooth' });
                  } else if (onNavigateToAnomalies) {
                    onNavigateToAnomalies();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                View Anomaly
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm shadow-sky-200"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Review Project
            </button>
          </div>
        </div>
      </div>

      {/* 11. KEY PERFORMANCE INDICATORS (KPI ROW) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Financial Progress */}
        <StatCard
          title="Financial Progress"
          value={formatPercent(financialProgress)}
          subtext={`Expenditure: ${formatCurrencyLakhs(expenditure)}`}
          icon={TrendingUp}
          badge={financialProgress >= 100 ? 'Fully Spent' : 'Disbursed'}
          badgeVariant={financialProgress >= 100 ? 'success' : 'default'}
        />

        {/* Physical Progress */}
        <StatCard
          title="Physical Progress"
          value={`${physicalProgress}%`}
          subtext={`${completedMilestones} of ${totalMilestones} milestones certified`}
          icon={CheckCircle2}
          badge={project.status}
          badgeVariant={project.status === 'Completed' ? 'success' : project.status === 'Delayed' ? 'danger' : 'default'}
        />

        {/* Amount Utilized */}
        <StatCard
          title="Amount Utilized"
          value={formatCurrencyLakhs(expenditure)}
          subtext={`Sanctioned: ${formatCurrencyLakhs(sanctioned)}`}
          icon={IndianRupee}
          badge={`${formatPercent(sanctioned > 0 ? (expenditure / sanctioned) * 100 : 0)} Absorption`}
          badgeVariant="default"
        />

        {/* Days Remaining / Delay Status */}
        <StatCard
          title="Execution Schedule"
          value={daysStatus.text}
          subtext={`Deadline: ${formatDate(project.expectedCompletion)}`}
          icon={Clock}
          badge={project.status === 'Delayed' ? 'Overdue' : 'On Schedule'}
          badgeVariant={daysStatus.variant}
        />
      </div>

      {/* 8. ANOMALY / RISK INFORMATION CARD */}
      <div id="anomaly-section">
        {hasAnomaly ? (
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 lg:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-rose-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                    Anomaly Detected
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800 uppercase tracking-wider">
                      Audit Trigger
                    </span>
                  </h3>
                  <p className="text-xs text-rose-700">
                    Analytical heuristic flagged statistical divergence for administrative review
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-rose-800">Risk Level:</span>
                <Badge variant={riskLevel}>
                  {riskLevel}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider block">
                  Anomaly Type
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm block">
                  {anomalyType}
                </strong>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider block">
                  Recommended Action
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm block">
                  Review project records and supporting documents.
                </strong>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-rose-200/80 space-y-1 md:col-span-2 lg:col-span-1">
                <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider block">
                  Audit Escalation Priority
                </span>
                <strong className="text-slate-900 text-xs sm:text-sm block">
                  {project.flagSeverity === 'high' ? 'High Priority Field Inspection' : 'Desk Record Reconciliation'}
                </strong>
              </div>
            </div>

            <div className="bg-white/90 p-4 rounded-xl border border-rose-200 text-xs space-y-1.5">
              <span className="font-bold text-rose-950 block text-[11px] uppercase tracking-wider">
                Reason for Flag
              </span>
              <p className="text-slate-700 leading-relaxed">
                {anomalyReasonText}
              </p>
            </div>

            {/* Non-accusatory neutral advisory notice */}
            <div className="p-3 bg-rose-100/60 rounded-xl border border-rose-200/60 text-[11px] text-rose-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Administrative Notice:</strong> Anomaly indicators do not prove fraud, corruption, or misconduct. They identify projects that may require further review by nodal supervisory committees.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-emerald-950 text-sm">
                  No anomaly currently detected for this project.
                </h3>
                <Badge variant="normal">Normal</Badge>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All fund disbursements, physical progress milestones, and statutory reporting intervals align with expected administrative performance ranges. No audit variance flags are active.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TWO-COLUMN GRID: Left Column (Overview & Financials) | Right Column (Physical Progress & Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3. PROJECT OVERVIEW CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                Project Administrative Overview
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {project.financialYear || 'FY 2024-25'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Project ID</span>
                <strong className="font-mono text-slate-900 text-xs sm:text-sm font-bold mt-0.5 block">
                  {project.code || project.id}
                </strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Project Name</span>
                <strong className="text-slate-800 text-xs line-clamp-1 mt-0.5 block" title={project.title}>
                  {project.title}
                </strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">State</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.state || 'Madhya Pradesh'}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">District Jurisdiction</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.district}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Constituency</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.constituency || 'Parliamentary'}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Project Category / Sector</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.workType || project.sector}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Implementing Agency</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.implementingAgency}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommending MP</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.mpName || 'Parliamentary Office'}</strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sanction / Start Date</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">
                  {formatDate(project.startDate || project.sanctionDate)}
                </strong>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Completion Date</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">
                  {formatDate(project.expectedCompletion)}
                </strong>
              </div>
            </div>
          </div>

          {/* 4. FINANCIAL INFORMATION SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-sky-600" />
                Financial Information & Ledger
              </h3>
              <span className="text-xs font-semibold text-slate-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                Progress: {formatPercent(financialProgress)}
              </span>
            </div>

            {/* Financial Ledger Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sanctioned</span>
                <strong className="text-slate-900 text-sm sm:text-base font-bold mt-1 block">
                  {formatCurrencyLakhs(sanctioned)}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Released</span>
                <strong className="text-slate-900 text-sm sm:text-base font-bold mt-1 block">
                  {formatCurrencyLakhs(released)}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Expenditure</span>
                <strong className="text-sky-700 text-sm sm:text-base font-bold mt-1 block">
                  {formatCurrencyLakhs(expenditure)}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Remaining</span>
                <strong className="text-slate-800 text-sm sm:text-base font-bold mt-1 block">
                  {formatCurrencyLakhs(remaining)}
                </strong>
              </div>
            </div>

            {/* Financial Progress Bar (Requirement 4) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  Financial Progress: <strong className="text-slate-900">{financialProgress}%</strong>
                </span>
                <span className="text-slate-400 text-[11px]">
                  Formula: (Expenditure / Sanctioned) &times; 100
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    financialProgress > 100
                      ? 'bg-rose-500'
                      : financialProgress === 100
                      ? 'bg-emerald-500'
                      : 'bg-sky-600'
                  }`}
                  style={{ width: `${financialProgressVisual}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>0%</span>
                <span>50%</span>
                <span>100% {financialProgress > 100 ? `(Exceeded: ${financialProgress}%)` : ''}</span>
              </div>
            </div>
          </div>

          {/* 10. DOCUMENTS / RECORDS SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Project Documents
              </h3>
              <span className="text-xs text-slate-500">
                Administrative Dossier
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Document Title</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {documents.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.refCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {doc.type}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            doc.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (doc.status === 'Available') {
                              showToast(`Displaying digital copy of ${doc.name} (${doc.refCode}).`);
                            } else {
                              showToast(`${doc.name} is currently pending physical submission by agency.`);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            doc.status === 'Available'
                              ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {doc.status === 'Available' ? 'Inspect' : 'Request UC'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          {/* 5. PHYSICAL PROGRESS & MILESTONES */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Physical Progress
              </h3>
              <span className="font-bold text-slate-900 text-sm">
                {physicalProgress}%
              </span>
            </div>

            {/* Progress Bar (capped at 100%) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Execution Milestone Index</span>
                <span className="font-semibold text-slate-800">
                  {completedMilestones} / {totalMilestones} Completed
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    physicalProgress === 100
                      ? 'bg-emerald-500'
                      : project.status === 'Delayed'
                      ? 'bg-amber-500'
                      : 'bg-sky-600'
                  }`}
                  style={{ width: `${Math.min(physicalProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Milestone List */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Verification Milestones
              </span>

              <div className="space-y-2 text-xs">
                {milestonesList.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                      m.status === 'completed'
                        ? 'bg-emerald-50/50 border-emerald-200/70 text-slate-800'
                        : m.status === 'current'
                        ? 'bg-sky-50/60 border-sky-200 text-sky-950 font-medium'
                        : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          m.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : m.status === 'current'
                            ? 'bg-sky-600 text-white ring-2 ring-sky-200'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {m.status === 'completed' ? '✓' : m.id}
                      </div>
                      <span className="truncate">{m.name}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${
                        m.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'current'
                          ? 'bg-sky-100 text-sky-800 animate-pulse'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.status === 'completed' ? 'Verified' : m.status === 'current' ? 'In Execution' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. PROJECT TIMELINE & 7. PROJECT STATUS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Project Timeline & Stages
              </h3>
              <Badge variant={project.status}>
                {project.status}
              </Badge>
            </div>

            {/* Vertical Timeline List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {timelineStages.map((stg, idx) => {
                const isCompleted = stg.status === 'completed';
                const isCurrent = stg.status === 'current';

                return (
                  <div key={idx} className="relative group">
                    {/* Circle Dot Indicator */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`font-semibold text-xs ${
                            isCurrent ? 'text-sky-700' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {stg.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {stg.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {stg.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 7. Current Status Narrative */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Administrative Status
              </span>
              <p className="text-slate-700">
                {project.status === 'Completed'
                  ? 'Works are physically complete and certified. Project dossier awaiting closure.'
                  : project.status === 'Delayed'
                  ? 'Project duration exceeds scheduled timeline. Execution delayed by milestone dependencies.'
                  : project.status === 'Cancelled'
                  ? 'Administrative sanction revoked; unspent balance re-credited to parliamentary head.'
                  : 'Work order is in progress under active technical supervision.'}
              </p>
            </div>
          </div>

          {/* 9. PROJECT LOCATION CARD & MAP */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                Project Location & Spatial Index
              </h3>
              <span className="text-[11px] text-slate-500">
                GIS Coordinate Preview
              </span>
            </div>

            {/* Location Particulars Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">State</span>
                <strong className="text-slate-800">{project.state || 'Madhya Pradesh'}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">District</span>
                <strong className="text-slate-800">{project.district}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Constituency</span>
                <strong className="text-slate-800">{project.constituency || 'Parliamentary'}</strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 block text-[10px]">Jurisdiction Site</span>
                <strong className="text-slate-800 truncate block">{project.title.split(' ')[0]} Ward Site</strong>
              </div>
            </div>

            {/* Mini Map Container */}
            <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 relative z-10">
              <MapContainer
                center={locationCoords}
                zoom={9}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={locationCoords} icon={createProjectPin(hasAnomaly)}>
                  <Popup>
                    <div className="p-1 text-xs font-sans">
                      <strong className="text-slate-900 block">{project.code || project.id}</strong>
                      <span className="text-[11px] text-slate-500">{project.district}</span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Official Oversight Banner */}
      <DisclaimerBanner compact />

      {/* REVIEW PROJECT MODAL (Action Button Dialog) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Administrative Review Record
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {project.code || project.id} &bull; {project.district}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Audit Action / Resolution Category</label>
                <select
                  value={auditDecision}
                  onChange={(e) => setAuditDecision(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="Field Inquiry Dispatched">Assign District Field Inquiry</option>
                  <option value="Documentation Follow-up">Request Utilization Certificate (UC) Follow-up</option>
                  <option value="Mark Verified / Normal">Mark Verified & Reconciled (Clear Flag)</option>
                  <option value="Escalate to Monitoring Committee">Escalate to State Monitoring Committee</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nodal Inspection Notes & Remarks</label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter administrative observations, technical appraisal references, or field inspection team instructions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
                Log entries are permanently timestamped and linked to nodal officer credentials for parliamentary oversight compliance.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                >
                  Save Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
