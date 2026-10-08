import { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  ArrowUpRight,
  ClipboardCheck
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import Badge from '../components/common/Badge';
import AnomalyScatterChart from '../components/charts/AnomalyScatterChart';
import {
  RECENT_ANOMALY_ALERTS,
  ANOMALY_SCATTER_DATA,
  MACRO_METRICS
} from '../services/mockData';
import { formatCurrencyLakhs } from '../utils/formatters';

export default function AnomalyDetection({ onSelectProject }) {
  const [alerts, setAlerts] = useState(RECENT_ANOMALY_ALERTS);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleStatusChange = (id, newStatus) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, auditStatus: newStatus } : item))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Anomaly Detection & Audit Review Queue
        </h2>
        <p className="text-xs text-slate-500">
          Machine learning algorithms identify statistical deviations and milestone variances to prioritize administrative verification
        </p>
      </div>

      {/* Governance & Neutrality Notice */}
      <DisclaimerBanner />

      {/* Anomaly KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Detected Anomalies"
          value={MACRO_METRICS.flaggedProjects}
          subtext="Statistical outliers identified"
          icon={AlertTriangle}
          badge="High Sensitivity"
          badgeVariant="danger"
        />

        <StatCard
          title="Pending Nodal Review"
          value={MACRO_METRICS.pendingAuditReviews}
          subtext="Awaiting desk/field inspection"
          icon={ShieldAlert}
          badge="Action Required"
          badgeVariant="default"
        />

        <StatCard
          title="Reconciled & Cleared"
          value={MACRO_METRICS.resolvedAnomalies}
          subtext="Verified normal with documented UC"
          icon={FileCheck}
          badge="Resolved"
          badgeVariant="success"
        />

        <StatCard
          title="Model Sensitivity"
          value="95.4%"
          subtext="Trained on historical fund flows"
          icon={ClipboardCheck}
          badge="Isolation Forest"
          badgeVariant="default"
        />
      </div>

      {/* Outlier Correlation Scatter Chart */}
      <AnomalyScatterChart
        data={ANOMALY_SCATTER_DATA}
        onSelectPoint={(point) => {
          const matched = alerts.find((a) => a.workCode === point.workCode);
          if (matched && onSelectProject) {
            onSelectProject(matched);
          }
        }}
      />

      {/* Interactive Review Queue */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Administrative Review Queue
            </h3>
            <p className="text-xs text-slate-500">
              Audit queue sorted by model confidence and deviation severity
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High Deviation</option>
              <option value="medium">Medium Variance</option>
              <option value="low">Low Divergence</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Anomaly Types</option>
              <option value="Progress-Disbursement Divergence">Progress-Disbursement Gap</option>
              <option value="Timeline Inactivity > 150 Days">Timeline Inactivity</option>
              <option value="Unrevised Cost Variance">Cost Variance</option>
              <option value="Delayed Utilization Certificate">Delayed UC</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Work ID & Details</th>
                <th className="py-3 px-3">Jurisdiction</th>
                <th className="py-3 px-3">Flag Category</th>
                <th className="py-3 px-3">Confidence</th>
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
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 font-mono">
                        {(item.modelConfidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-slate-400">score</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-slate-800 font-medium">
                      Spend: {formatCurrencyLakhs(item.expenditureLakhs)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Physical: <strong className="text-slate-700">{item.physicalProgress}%</strong>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <select
                      value={item.auditStatus}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                      onClick={() => onSelectProject(item)}
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
        </div>
      </div>
    </div>
  );
}
