import {
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import Badge from '../components/common/Badge';
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import FundUtilizationChart from '../components/charts/FundUtilizationChart';
import {
  MACRO_METRICS,
  SECTOR_PROGRESS_DATA,
  FUND_UTILIZATION_TREND,
  DISTRICTS,
  RECENT_ANOMALY_ALERTS
} from '../services/mockData';
import { formatCrores, formatPercent } from '../utils/formatters';

export default function OverviewDashboard({ onSelectProject, onNavigateToTab }) {
  return (
    <div className="space-y-6">
      {/* 1. Governance & Administrative Non-Accusatory Disclaimer */}
      <DisclaimerBanner />

      {/* 2. Six Primary Macro KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Projects */}
        <StatCard
          title="Total Works"
          value={MACRO_METRICS.totalProjects.toLocaleString('en-IN')}
          subtext="Sanctioned across 7 districts"
          icon={Briefcase}
        />

        {/* Completed Projects */}
        <StatCard
          title="Completed"
          value={MACRO_METRICS.completedProjects.toLocaleString('en-IN')}
          subtext={`${((MACRO_METRICS.completedProjects / MACRO_METRICS.totalProjects) * 100).toFixed(1)}% completion rate`}
          icon={CheckCircle2}
          badge="Verified"
          badgeVariant="success"
        />

        {/* Ongoing Projects */}
        <StatCard
          title="Ongoing"
          value={MACRO_METRICS.ongoingProjects.toLocaleString('en-IN')}
          subtext="Under active implementation"
          icon={Clock}
          badge="In Progress"
          badgeVariant="default"
        />

        {/* Total Sanctioned Funds */}
        <StatCard
          title="Sanctioned Funds"
          value={formatCrores(MACRO_METRICS.totalSanctionedCr)}
          subtext="Central allocation allocated"
          icon={IndianRupee}
        />

        {/* Total Expenditure */}
        <StatCard
          title="Total Expenditure"
          value={formatCrores(MACRO_METRICS.totalExpenditureCr)}
          subtext={`${MACRO_METRICS.utilizationRate}% fund absorption`}
          icon={TrendingUp}
        />

        {/* Flagged for Review */}
        <StatCard
          title="Flagged For Review"
          value={MACRO_METRICS.flaggedProjects}
          subtext="Statistical audit triggers"
          icon={AlertOctagon}
          badge="Audit Queue"
          badgeVariant="danger"
          className="border-rose-200/80 bg-rose-50/20"
        />
      </div>

      {/* 3. Two Core Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectProgressChart data={SECTOR_PROGRESS_DATA} />
        <FundUtilizationChart data={FUND_UTILIZATION_TREND} />
      </div>

      {/* 4. District-wise Summary & Recent Anomaly Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District-wise Project Summary Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                District-Wise Utilization Summary
              </h3>
              <p className="text-xs text-slate-500">
                Expenditure absorption and review status across administrative units
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('geographic')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
            >
              View on Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200/60 font-semibold">
                <tr>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-3">Total Works</th>
                  <th className="py-3 px-3">Sanctioned</th>
                  <th className="py-3 px-3">Expended</th>
                  <th className="py-3 px-3">Utilization</th>
                  <th className="py-3 px-3">Review Triggers</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {DISTRICTS.map((dst) => (
                  <tr key={dst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {dst.name}
                    </td>
                    <td className="py-3 px-3">{dst.totalWorks}</td>
                    <td className="py-3 px-3">{formatCrores(dst.sanctionedCr)}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {formatCrores(dst.expenditureCr)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              dst.utilizationRate >= 80
                                ? 'bg-emerald-500'
                                : dst.utilizationRate >= 70
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(dst.utilizationRate, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[11px]">
                          {formatPercent(dst.utilizationRate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {dst.flagsCount > 0 ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dst.flagsCount > 15
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {dst.flagsCount} flags
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigateToTab('projects')}
                        className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-right text-xs">
            <button
              onClick={() => onNavigateToTab('projects')}
              className="text-sky-700 hover:text-sky-900 font-semibold"
            >
              Open Full Project Registry &rarr;
            </button>
          </div>
        </div>

        {/* Recent Anomaly Alerts (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Anomaly Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {RECENT_ANOMALY_ALERTS.length} New
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Latest analytical flags prioritizing nodal field audits
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('anomalies')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
            >
              Full Queue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-3 divide-y divide-slate-100">
            {RECENT_ANOMALY_ALERTS.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="pt-3 first:pt-0 group cursor-pointer"
                onClick={() => onSelectProject && onSelectProject(alert)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800 group-hover:text-sky-600 transition-colors">
                      {alert.workCode}
                    </span>
                    <Badge variant={alert.severity}>
                      {alert.category}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {alert.detectedDate}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                  {alert.workTitle}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                  {alert.triggerDescription}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-600 font-medium">
                    {alert.district} &bull; Progress: {alert.physicalProgress}%
                  </span>
                  <span className="text-sky-600 font-semibold group-hover:underline flex items-center gap-1">
                    Review Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center text-xs">
            <button
              type="button"
              onClick={() => onNavigateToTab('anomalies')}
              className="font-medium text-slate-600 hover:text-sky-700"
            >
              View all 80 flagged items in Anomaly Triage &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
