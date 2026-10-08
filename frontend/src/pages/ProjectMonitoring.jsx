import { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Download,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  SearchX,
  Info,
  X
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  MOCK_PROJECTS,
  STATES,
  FINANCIAL_YEARS,
  PROJECT_STATUSES
} from '../services/mockData';
import { formatCurrencyLakhs, formatDate } from '../utils/formatters';

export default function ProjectMonitoring({ onSelectProject, searchQuery: externalSearch = '' }) {
  // Filter States
  const [localSearch, setLocalSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [financialYearFilter, setFinancialYearFilter] = useState('all');

  // Fallback modal state in case onSelectProject is not provided
  const [modalProject, setModalProject] = useState(null);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  // Active search query (local input takes precedence or combines with top header search)
  const activeSearch = localSearch || externalSearch;

  // Derive unique states from dataset
  const availableStates = useMemo(() => {
    const stateSet = new Set(MOCK_PROJECTS.map((p) => p.state).filter(Boolean));
    return STATES.length ? STATES : Array.from(stateSet).sort();
  }, []);

  // Dynamically derive districts based on selected state
  const availableDistricts = useMemo(() => {
    let sourceProjects = MOCK_PROJECTS;
    if (stateFilter !== 'all') {
      sourceProjects = MOCK_PROJECTS.filter((p) => p.state === stateFilter);
    }
    const districtSet = new Set(sourceProjects.map((p) => p.district).filter(Boolean));
    return Array.from(districtSet).sort();
  }, [stateFilter]);

  // When state changes, reset district filter if it doesn't belong to the new state
  const handleStateChange = (newState) => {
    setStateFilter(newState);
    if (newState === 'all') {
      setDistrictFilter('all');
    } else {
      const stateDistricts = new Set(
        MOCK_PROJECTS.filter((p) => p.state === newState).map((p) => p.district)
      );
      if (districtFilter !== 'all' && !stateDistricts.has(districtFilter)) {
        setDistrictFilter('all');
      }
    }
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setLocalSearch('');
    setStateFilter('all');
    setDistrictFilter('all');
    setStatusFilter('all');
    setFinancialYearFilter('all');
  };

  const isFiltered =
    activeSearch.trim() !== '' ||
    stateFilter !== 'all' ||
    districtFilter !== 'all' ||
    statusFilter !== 'all' ||
    financialYearFilter !== 'all';

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter((project) => {
      // 1. Text Search (by Project ID or Project Name)
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase().trim();
        const matchCode = (project.code || '').toLowerCase().includes(query);
        const matchTitle = (project.title || '').toLowerCase().includes(query);
        const matchId = (project.id || '').toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchId) {
          return false;
        }
      }

      // 2. State Filter
      if (stateFilter !== 'all' && project.state !== stateFilter) {
        return false;
      }

      // 3. District Filter
      if (districtFilter !== 'all' && project.district !== districtFilter) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      // 5. Financial Year Filter
      if (financialYearFilter !== 'all' && project.financialYear !== financialYearFilter) {
        return false;
      }

      return true;
    });
  }, [activeSearch, stateFilter, districtFilter, statusFilter, financialYearFilter]);

  // KPI Metrics calculated from sample data
  const metrics = useMemo(() => {
    const total = MOCK_PROJECTS.length;
    const completed = MOCK_PROJECTS.filter((p) => p.status === 'Completed').length;
    const ongoing = MOCK_PROJECTS.filter((p) => p.status === 'Ongoing').length;
    const delayed = MOCK_PROJECTS.filter((p) => p.status === 'Delayed').length;
    const flagged = MOCK_PROJECTS.filter(
      (p) => p.riskLevel === 'High Risk' || p.riskLevel === 'Medium Risk' || p.reviewFlag === true
    ).length;

    return { total, completed, ongoing, delayed, flagged };
  }, []);

  // Handle project view action
  const handleViewProject = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    } else {
      setModalProject(project);
      setIsLocalModalOpen(true);
    }
  };

  // Helper for progress bar color
  const getProgressBarColor = (progress, status) => {
    if (status === 'Cancelled') return 'bg-slate-400';
    if (status === 'Completed' || progress === 100) return 'bg-emerald-500';
    if (status === 'Delayed') return 'bg-amber-500';
    if (progress < 30) return 'bg-sky-500';
    return 'bg-sky-600';
  };

  return (
    <div className="space-y-6">
      {/* A. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Project Monitoring
            </h2>
            {/* Demo Data Indicator */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs"
              title="Demonstration dataset: all project records and details are fictional"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor MPLADS project progress, track fund expenditures, and inspect implementation milestones across administrative jurisdictions.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert(`Exporting ${filteredProjects.length} filtered project records as simulated spreadsheet.`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Records
          </button>
        </div>
      </div>

      {/* B. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Projects */}
        <StatCard
          title="Total Projects"
          value={metrics.total.toLocaleString('en-IN')}
          subtext="Sanctioned across states"
          icon={Briefcase}
        />

        {/* Completed */}
        <StatCard
          title="Completed"
          value={metrics.completed.toLocaleString('en-IN')}
          subtext={`${((metrics.completed / metrics.total) * 100).toFixed(0)}% completion rate`}
          icon={CheckCircle2}
          badge="Verified"
          badgeVariant="success"
        />

        {/* Ongoing */}
        <StatCard
          title="Ongoing"
          value={metrics.ongoing.toLocaleString('en-IN')}
          subtext="Under active execution"
          icon={Clock}
          badge="In Progress"
          badgeVariant="default"
        />

        {/* Delayed */}
        <StatCard
          title="Delayed"
          value={metrics.delayed.toLocaleString('en-IN')}
          subtext="Past expected timeline"
          icon={AlertCircle}
          badge="Timeline Drift"
          badgeVariant="warning"
        />

        {/* Flagged */}
        <StatCard
          title="Flagged"
          value={metrics.flagged.toLocaleString('en-IN')}
          subtext="Statistical review triggers"
          icon={AlertTriangle}
          badge="Audit Queue"
          badgeVariant="danger"
          className="border-rose-200/80 bg-rose-50/20"
        />
      </div>

      {/* Non-Accusatory Governance Disclaimer Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800">
            Administrative Review & Risk Classification Policy:
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Risk and anomaly indicators reflect automated statistical models (such as expenditure vs. physical progress variances or timeline milestones) designed to prioritize routine administrative verification. <strong>They do NOT signify fraud, corruption, or wrongdoing.</strong>
          </p>
        </div>
      </div>

      {/* C. Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            Filter & Search Registry
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Search by Project ID or Project Name */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by Project ID or Name..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium cursor-pointer transition-all"
            >
              <option value="all">All States ({availableStates.length})</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 3. District Filter (dynamic based on selected state) */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium cursor-pointer transition-all"
            >
              <option value="all">
                {stateFilter === 'all'
                  ? `All Districts (${availableDistricts.length})`
                  : `All Districts in ${stateFilter}`}
              </option>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Financial Year Filter */}
          <div>
            <select
              value={financialYearFilter}
              onChange={(e) => setFinancialYearFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium cursor-pointer transition-all"
            >
              <option value="all">All Financial Years</option>
              {FINANCIAL_YEARS.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-900 font-semibold">{filteredProjects.length}</strong> of{' '}
            <span>{MOCK_PROJECTS.length}</span> listed works
            {isFiltered && (
              <span className="ml-2 text-sky-700 font-medium">
                (Filtered view)
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sky-600 hover:text-sky-800 font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* D, E, F, G, H. Projects Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Container with Responsive Horizontal Scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            {/* Table Header */}
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th scope="col" className="py-3.5 px-4">Project ID</th>
                <th scope="col" className="py-3.5 px-4 min-w-[200px]">Project Name</th>
                <th scope="col" className="py-3.5 px-3">State</th>
                <th scope="col" className="py-3.5 px-3">District</th>
                <th scope="col" className="py-3.5 px-3">Work Type</th>
                <th scope="col" className="py-3.5 px-3 text-right">Sanctioned</th>
                <th scope="col" className="py-3.5 px-3 text-right">Expenditure</th>
                <th scope="col" className="py-3.5 px-3 min-w-[130px]">Progress</th>
                <th scope="col" className="py-3.5 px-3">Start Date</th>
                <th scope="col" className="py-3.5 px-3">Expected Completion</th>
                <th scope="col" className="py-3.5 px-3">Status</th>
                <th scope="col" className="py-3.5 px-3">Risk / Anomaly</th>
                <th scope="col" className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                /* Empty-State Message */
                <tr>
                  <td colSpan={13} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <SearchX className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        No projects match the current filter selection
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        We couldn't find any records matching your search query or selected filter criteria. Try adjusting your parameters.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleViewProject(project)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* 1. Project ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {project.code || project.id}
                    </td>

                    {/* 2. Project Name */}
                    <td className="py-3.5 px-4 whitespace-normal max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {project.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {project.implementingAgency}
                      </div>
                    </td>

                    {/* 3. State */}
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {project.state || 'Madhya Pradesh'}
                    </td>

                    {/* 4. District */}
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      {project.district}
                    </td>

                    {/* 5. Work Type */}
                    <td className="py-3.5 px-3 text-slate-600 max-w-[150px] truncate" title={project.workType || project.sector}>
                      {project.workType || project.sector}
                    </td>

                    {/* 6. Sanctioned Amount */}
                    <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                      {formatCurrencyLakhs(project.sanctionAmountLakhs)}
                    </td>

                    {/* 7. Expenditure */}
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                      {formatCurrencyLakhs(project.expenditureLakhs)}
                    </td>

                    {/* 8. Progress (Horizontal progress bar and percentage) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                              project.physicalProgress,
                              project.status
                            )}`}
                            style={{ width: `${project.physicalProgress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px] text-slate-800 tabular-nums">
                          {project.physicalProgress}%
                        </span>
                      </div>
                    </td>

                    {/* 9. Start Date */}
                    <td className="py-3.5 px-3 text-slate-600">
                      {formatDate(project.startDate || project.sanctionDate)}
                    </td>

                    {/* 10. Expected Completion */}
                    <td className="py-3.5 px-3 text-slate-600">
                      {formatDate(project.expectedCompletion)}
                    </td>

                    {/* 11. Status Badge */}
                    <td className="py-3.5 px-3">
                      <Badge variant={project.status}>
                        {project.status}
                      </Badge>
                    </td>

                    {/* 12. Risk/Anomaly Badge */}
                    <td className="py-3.5 px-3">
                      <Badge variant={project.riskLevel || (project.reviewFlag ? 'High Risk' : 'Normal')}>
                        {project.riskLevel || (project.reviewFlag ? 'High Risk' : 'Normal')}
                      </Badge>
                    </td>

                    {/* 13. Actions (View Button) */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(project);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standalone Project Details Modal (fallback when onSelectProject is not provided) */}
      {!onSelectProject && (
        <Modal
          isOpen={isLocalModalOpen}
          onClose={() => {
            setIsLocalModalOpen(false);
            setModalProject(null);
          }}
          title={modalProject?.code || 'Project Dossier'}
          subtitle={modalProject?.title || 'MPLADS Sanctioned Scheme'}
        >
          {modalProject && (
            <div className="space-y-5 text-xs text-slate-700">
              {/* Status & Risk Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-[11px]">Status:</span>
                  <Badge variant={modalProject.status}>
                    {modalProject.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-[11px]">Risk Level:</span>
                  <Badge variant={modalProject.riskLevel || 'Normal'}>
                    {modalProject.riskLevel || 'Normal'}
                  </Badge>
                </div>
              </div>

              {/* Anomaly Review Notice */}
              {(modalProject.riskLevel === 'High Risk' || modalProject.riskLevel === 'Medium Risk' || modalProject.reviewFlag) && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Administrative Review Trigger: {modalProject.flagCategory || modalProject.riskLevel}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    {modalProject.anomalyReason || modalProject.flagReason || 'Statistical variance flagged for engineering milestone inspection.'}
                  </p>
                  <p className="text-[10px] text-rose-600 italic">
                    Administrative Note: Indicates project requires further verification. Does not imply fraud or corruption.
                  </p>
                </div>
              )}

              {/* Location & Administrative Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Administrative Particulars & Location
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">State</span>
                    <strong className="text-slate-800">{modalProject.state || 'Madhya Pradesh'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">District Jurisdiction</span>
                    <strong className="text-slate-800">{modalProject.district}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Constituency</span>
                    <strong className="text-slate-800">{modalProject.constituency || 'Parliamentary'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Work Type</span>
                    <strong className="text-slate-800">{modalProject.workType || modalProject.sector}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Implementing Agency</span>
                    <strong className="text-slate-800">{modalProject.implementingAgency}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recommending MP</span>
                    <strong className="text-slate-800">{modalProject.mpName}</strong>
                  </div>
                </div>
              </div>

              {/* Implementation Dates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Implementation Timeline & Dates
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Start Date</span>
                    <strong className="text-slate-800 text-xs">
                      {formatDate(modalProject.startDate || modalProject.sanctionDate)}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Expected Completion</span>
                    <strong className="text-slate-800 text-xs">
                      {formatDate(modalProject.expectedCompletion)}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Financial Year</span>
                    <strong className="text-slate-800 text-xs">
                      {modalProject.financialYear || 'FY 2024-25'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Financial Ledger
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Sanctioned</span>
                    <strong className="text-slate-800 text-xs">
                      {formatCurrencyLakhs(modalProject.sanctionAmountLakhs)}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Released</span>
                    <strong className="text-slate-800 text-xs">
                      {formatCurrencyLakhs(modalProject.releasedAmountLakhs)}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[10px]">Expended</span>
                    <strong className="text-sky-700 text-xs">
                      {formatCurrencyLakhs(modalProject.expenditureLakhs)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Physical Progress */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Physical Progress Index
                  </h4>
                  <span className="font-bold text-slate-800">
                    {modalProject.physicalProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getProgressBarColor(
                      modalProject.physicalProgress,
                      modalProject.status
                    )}`}
                    style={{ width: `${modalProject.physicalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
