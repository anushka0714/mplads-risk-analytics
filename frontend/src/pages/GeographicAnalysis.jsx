import { useState } from 'react';
import { TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import DistrictMap from '../components/map/DistrictMap';
import StatCard from '../components/common/StatCard';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { DISTRICTS } from '../services/mockData';
import { formatCrores } from '../utils/formatters';

export default function GeographicAnalysis({ onNavigateToProjects }) {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Geographic Analysis & Spatial Distribution
        </h2>
        <p className="text-xs text-slate-500">
          Spatial GIS mapping of fund absorption, work density, and localized review flags across parliamentary districts
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Regional Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monitored Districts"
          value={DISTRICTS.length}
          subtext="Administrative jurisdictions"
          icon={Building2}
          badge="100% Coverage"
          badgeVariant="success"
        />

        <StatCard
          title="Highest Absorption"
          value="Kalyanpur (83.2%)"
          subtext="Top performing fund utilization"
          icon={TrendingUp}
          badge="Leader"
          badgeVariant="success"
        />

        <StatCard
          title="Priority Audit District"
          value="Sitapur East (22 flags)"
          subtext="Highest concentration of model flags"
          icon={AlertTriangle}
          badge="Audit Attention"
          badgeVariant="danger"
        />
      </div>

      {/* Interactive Map Section */}
      <DistrictMap
        districts={DISTRICTS}
        onSelectDistrict={(district) => setSelectedDistrict(district)}
      />

      {/* Selected District Deep Dive Card */}
      {selectedDistrict && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedDistrict.name} District Register
                </h3>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-xs font-semibold">
                  {selectedDistrict.state}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Constituency coordination profile and local development metrics
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToProjects && onNavigateToProjects()}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              Filter Works in {selectedDistrict.name}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium">Total Sanctioned Works</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{selectedDistrict.totalWorks}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium">Sanctioned Outlay</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatCrores(selectedDistrict.sanctionedCr)}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium">Actual Expended</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{formatCrores(selectedDistrict.expenditureCr)}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium">Review Flags Logged</span>
              <div className="text-xl font-bold text-rose-600 mt-1">{selectedDistrict.flagsCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
