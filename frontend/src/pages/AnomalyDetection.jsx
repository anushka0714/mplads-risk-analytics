import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  ArrowUpRight,
  ClipboardCheck,
  RefreshCw,
  Cpu,
  Info,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import Badge from '../components/common/Badge';
import AnomalyScatterChart from '../components/charts/AnomalyScatterChart';
import { ANOMALY_SCATTER_DATA, getProjectById } from '../services/mockData';
import { loadAnomalyData } from '../services/anomalyService';
import { formatCurrencyLakhs } from '../utils/formatters';

export default function AnomalyDetection({ onSelectProject }) {
  const [alerts, setAlerts] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [metrics, setMetrics] = useState({
    totalEvaluated: 0,
    flaggedCount: 0,
    normalCount: 0,
    pendingReviews: 0,
    modelAlgorithm: 'Isolation Forest (Scikit-Learn)'
  });
  const [dataSource, setDataSource] = useState('');
  const [isDemoData, setIsDemoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load live ML anomaly data on mount
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadAnomalyData();
      setAlerts(result.records);
      setAllRecords(result.allRecords);
      setMetrics(result.metrics);
      setDataSource(result.source);
      setIsDemoData(result.isDemoData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to load anomaly data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, auditStatus: newStatus } : item))
    );
  };

  // Derive dynamic scatter data from all evaluated records
  const scatterData = useMemo(() => {
    if (allRecords && allRecords.length > 0) {
      return allRecords.map((r, idx) => ({
        id: idx + 1,
        workCode: r.workCode,
        progress: r.physicalProgress,
        expenditurePercent: r.financialProgress,
        isAnomaly: r.isFlagged,
        category: r.category
      }));
    }
    return ANOMALY_SCATTER_DATA;
  }, [allRecords]);

  // Extract unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set(alerts.map((a) => a.category).filter(Boolean));
    return Array.from(cats);
  }, [alerts]);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  const handleSelectAuditFile = (item) => {
    if (!onSelectProject) return;
    const basePrj = getProjectById(item.workCode || item.id) || {};
    const enriched = {
      ...basePrj,
      ...item,
      code: item.workCode || basePrj.code || item.id,
      id: item.id || basePrj.id || item.workCode,
      reviewFlag: item.isFlagged !== undefined ? item.isFlagged : true,
      riskLevel: item.severity === 'high' ? 'High Risk' : (item.severity === 'medium' ? 'Medium Risk' : 'Low Risk'),
      anomalyReason: item.triggerDescription || basePrj.anomalyReason,
      flagCategory: item.category || basePrj.flagCategory,
    };
    onSelectProject(enriched);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Anomaly Detection & Audit Review Queue
          </h2>
          <p className="text-xs text-slate-500">
            Unsupervised Isolation Forest algorithm identifies statistical deviations to prioritize human audit verification
          </p>
        </div>

        {/* Refresh / Reload Button */}
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Governance & Neutrality Notice */}
      <DisclaimerBanner />

      {/* Data Source Status Banner */}
      {!loading && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs ${
            isDemoData
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {isDemoData ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {isDemoData ? 'Demo Dataset Mode: ' : 'Live ML Engine Active: '}
              </span>
              <span>{dataSource}</span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-600">
            {isDemoData ? (
              <span className="text-amber-700 italic">Live ML CSV not reached. Showing simulated baseline.</span>
            ) : (
              <span className="text-emerald-700">Evaluated {metrics.totalEvaluated} projects &bull; Flagged {metrics.flaggedCount} for audit</span>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-medium text-slate-600">
            Reading Isolation Forest audit output from <code className="text-slate-800 font-mono">data/flagged_projects.csv</code>...
          </div>
        </div>
      ) : (
        <>
          {/* Anomaly KPI Summary (Empirical counts from actual evaluated data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Flagged for Audit"
              value={metrics.flaggedCount}
              subtext={`${metrics.totalEvaluated > 0 ? ((metrics.flaggedCount / metrics.totalEvaluated) * 100).toFixed(1) : 0}% of ${metrics.totalEvaluated} works evaluated`}
              icon={AlertTriangle}
              badge="Statistical Outliers"
              badgeVariant="danger"
            />

            <StatCard
              title="Pending Desk Review"
              value={metrics.pendingReviews}
              subtext="Awaiting nodal verification"
              icon={ShieldAlert}
              badge="Action Required"
              badgeVariant="default"
            />

            <StatCard
              title="Within Expected Norms"
              value={metrics.normalCount}
              subtext="Consistent progress/spend cluster"
              icon={FileCheck}
              badge="Standard"
              badgeVariant="success"
            />

            <StatCard
              title="Detection Algorithm"
              value="Isolation Forest"
              subtext="Scikit-Learn (Unsupervised)"
              icon={ClipboardCheck}
              badge="ML Engine"
              badgeVariant="default"
            />
          </div>

          {/* Outlier Correlation Scatter Chart */}
          <AnomalyScatterChart
            data={scatterData}
            onSelectPoint={(point) => {
              const matched = alerts.find((a) => a.workCode === point.workCode);
              if (matched) {
                handleSelectAuditFile(matched);
              }
            }}
          />

          {/* Interactive Review Queue */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Administrative Review Queue ({filteredAlerts.length} Flagged Works)
                </h3>
                <p className="text-xs text-slate-500">
                  Prioritized by Isolation Forest statistical anomaly score. Human verification required before action.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High Deviation (Score &ge; 0.75)</option>
                  <option value="medium">Medium Variance (Score &ge; 0.50)</option>
                  <option value="low">Low Divergence (Score &lt; 0.50)</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                >
                  <option value="all">All Anomaly Types</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">No flagged projects match current filters.</p>
                  <p>Try resetting the severity or anomaly type dropdowns.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Work ID & Details</th>
                      <th className="py-3 px-3">Jurisdiction</th>
                      <th className="py-3 px-3">Statistical Category</th>
                      <th className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span>Anomaly Score</span>
                          <span title="Statistical score from Isolation Forest (0.0 normal, 1.0 highest priority)">
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                          </span>
                        </div>
                      </th>
                      <th className="py-3 px-3">Expenditure vs Progress</th>
                      <th className="py-3 px-3">Review Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAlerts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-bold text-sky-700">
                              {item.workCode}
                            </span>
                            <Badge variant={item.severity}>
                              {item.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            {item.workTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {item.triggerDescription}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{item.district}</div>
                          <div className="text-[11px] text-slate-400">{item.constituency}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-medium text-slate-800 text-[11px] block max-w-xs">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Logged {item.detectedDate}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-mono text-sm">
                                {item.anomalyScore.toFixed(3)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({(item.anomalyScore * 100).toFixed(0)}%)
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Isolation Forest
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="text-slate-800 font-medium">
                            Spend: {formatCurrencyLakhs(item.expenditureLakhs)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Physical: <strong className="text-slate-700">{item.physicalProgress}%</strong>
                          </div>
                          {item.progressDiscrepancy !== undefined && item.progressDiscrepancy !== 0 && (
                            <div className="text-[10px] text-amber-600 font-medium">
                              Gap: {item.progressDiscrepancy > 0 ? `+${item.progressDiscrepancy}%` : `${item.progressDiscrepancy}%`}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <select
                            value={item.auditStatus}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                          >
                            <option value="Pending Review">Pending Review</option>
                            <option value="Field Inquiry Assigned">Field Inquiry Assigned</option>
                            <option value="Documentation Follow-up">Documentation Follow-up</option>
                            <option value="Resolved">Reconciled / Cleared</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSelectAuditFile(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition-colors"
                          >
                            Audit File
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer Disclaimer Notice */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="italic">
                Notice: All anomaly indicators represent unsupervised statistical deviations requiring human verification. They do not constitute allegations or findings of corruption.
              </span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">
                Algorithm: Scikit-Learn IsolationForest
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
