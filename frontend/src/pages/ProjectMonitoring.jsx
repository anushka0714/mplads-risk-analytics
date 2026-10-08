import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import Badge from '../components/common/Badge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { MOCK_PROJECTS, DISTRICTS, SECTORS } from '../services/mockData';
import { formatCurrencyLakhs } from '../utils/formatters';

export default function ProjectMonitoring({ onSelectProject, searchQuery = '' }) {
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  // Combined search term
  const activeSearch = searchQuery || localSearch;

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter((p) => {
      // District filter
      if (districtFilter !== 'all' && p.district !== districtFilter) return false;
      // Sector filter
      if (sectorFilter !== 'all' && p.sector !== sectorFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      // Flag filter
      if (flagFilter === 'flagged' && !p.reviewFlag) return false;
      if (flagFilter === 'clean' && p.reviewFlag) return false;

      // Text search
      if (activeSearch) {
        const query = activeSearch.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(query);
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchDistrict = p.district.toLowerCase().includes(query);
        const matchAgency = p.implementingAgency.toLowerCase().includes(query);
        const matchMp = p.mpName.toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchDistrict && !matchAgency && !matchMp) {
          return false;
        }
      }

      return true;
    });
  }, [districtFilter, sectorFilter, statusFilter, flagFilter, activeSearch]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Project Register & Operational Monitoring
          </h2>
          <p className="text-xs text-slate-500">
            Real-time inspection of sanctioned works, physical milestones, and fund disbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('Simulated export of current filtered project register (CSV/Excel).')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Register
          </button>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search works..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Districts ({DISTRICTS.length})</option>
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Sector Dropdown */}
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Sectors ({SECTORS.length})</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Work Statuses</option>
              <option value="Completed">Completed Works</option>
              <option value="Ongoing">Ongoing Works</option>
              <option value="Stalled">Stalled Works</option>
            </select>
          </div>

          {/* Anomaly Review Filter */}
          <div>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
            >
              <option value="all">All Review States</option>
              <option value="flagged">⚠️ Under Review Only</option>
              <option value="clean">✓ Verified Normal Only</option>
            </select>
          </div>
        </div>

        {/* Results summary pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-800">{filteredProjects.length}</strong> of{' '}
            <span>{MOCK_PROJECTS.length}</span> listed works
          </div>
          {(districtFilter !== 'all' || sectorFilter !== 'all' || statusFilter !== 'all' || flagFilter !== 'all' || activeSearch) && (
            <button
              onClick={() => {
                setDistrictFilter('all');
                setSectorFilter('all');
                setStatusFilter('all');
                setFlagFilter('all');
                setLocalSearch('');
              }}
              className="text-sky-600 hover:text-sky-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Work ID</th>
                <th className="py-3 px-4">Description & Agency</th>
                <th className="py-3 px-3">District & MP</th>
                <th className="py-3 px-3">Sanction</th>
                <th className="py-3 px-3">Expenditure</th>
                <th className="py-3 px-3">Physical Progress</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Audit State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No project records match the current filter selection.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectProject(project)}
                  >
                    {/* Work ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700 whitespace-nowrap">
                      {project.code}
                    </td>

                    {/* Title & Agency */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {project.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {project.implementingAgency}
                      </div>
                    </td>

                    {/* District & MP */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{project.district}</div>
                      <div className="text-[11px] text-slate-400">{project.constituency}</div>
                    </td>

                    {/* Sanction Amount */}
                    <td className="py-3.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrencyLakhs(project.sanctionAmountLakhs)}
                    </td>

                    {/* Expenditure */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrencyLakhs(project.expenditureLakhs)}
                    </td>

                    {/* Physical Progress */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              project.physicalProgress === 100
                                ? 'bg-emerald-500'
                                : project.physicalProgress < 30
                                ? 'bg-amber-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${project.physicalProgress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px]">
                          {project.physicalProgress}%
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge variant={project.status}>
                        {project.status}
                      </Badge>
                    </td>

                    {/* Audit State */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {project.reviewFlag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          Review Flag
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
