import { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { DISTRICTS, SECTORS, SECTOR_PROGRESS_DATA } from '../services/mockData';
import { formatCrores } from '../utils/formatters';

export default function ReportsAnalytics() {
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [includeAuditFlags, setIncludeAuditFlags] = useState(true);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState([
    { id: 'REP-2025-01', title: 'Statewide Q4 Comprehensive Fund Utilization Summary', date: '2025-03-25', format: 'PDF', size: '2.4 MB' },
    { id: 'REP-2025-02', title: 'District Sitapur East Anomaly Triage & Outlier Dossier', date: '2025-03-20', format: 'PDF', size: '1.8 MB' },
    { id: 'REP-2025-03', title: 'Rural Roads & Connectivity Physical Progress Ledger', date: '2025-03-15', format: 'XLSX', size: '840 KB' },
  ]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newRep = {
        id: `REP-2025-0${recentReports.length + 1}`,
        title: `Custom Export: ${selectedDistrict === 'all' ? 'All Districts' : selectedDistrict} - ${selectedSector === 'all' ? 'All Sectors' : selectedSector}`,
        date: new Date().toISOString().split('T')[0],
        format: reportFormat.toUpperCase(),
        size: reportFormat === 'pdf' ? '1.5 MB' : '450 KB'
      };
      setRecentReports([newRep, ...recentReports]);
      alert(`Report generated successfully: "${newRep.title}" (${newRep.format})`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Reports & Analytical Exports
        </h2>
        <p className="text-xs text-slate-500">
          Generate official parliamentary scheme dossiers, sector evaluations, and administrative audit summaries
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Grid: Generator Form & Sector Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Generator Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <FileText className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Custom Dossier Builder</h3>
                <p className="text-xs text-slate-500">Filter parameters for formal administrative export</p>
              </div>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Jurisdiction</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="all">All Parliamentary Districts</option>
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Development Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="all">All Functional Sectors</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      reportFormat === 'pdf'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      checked={reportFormat === 'pdf'}
                      onChange={() => setReportFormat('pdf')}
                      className="text-sky-600"
                    />
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>Executive PDF</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      reportFormat === 'xlsx'
                        ? 'border-sky-500 bg-sky-50/50 text-sky-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      checked={reportFormat === 'xlsx'}
                      onChange={() => setReportFormat('xlsx')}
                      className="text-sky-600"
                    />
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Excel / CSV</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeAuditFlags}
                    onChange={(e) => setIncludeAuditFlags(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                  />
                  <span>Append Statistical Anomaly & Audit Trigger Schedule</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Compiling Dossier...' : 'Generate & Download Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Sectoral Breakdown Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sectoral Outlay vs Execution</h3>
              <p className="text-xs text-slate-500">Comparative absorption efficiency across major development verticals</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-3">Total Cost</th>
                  <th className="py-3 px-3">Completed</th>
                  <th className="py-3 px-3">Ongoing</th>
                  <th className="py-3 px-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {SECTOR_PROGRESS_DATA.map((row, idx) => {
                  const total = row.completed + row.ongoing + row.sanctioned;
                  const rate = ((row.completed / total) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.sector}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {formatCrores(row.totalCostCr)}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-medium">
                        {row.completed}
                      </td>
                      <td className="py-3 px-3 text-sky-700 font-medium">
                        {row.ongoing}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="font-semibold text-[11px]">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
            Sectoral data aggregated from official Project Monitoring Unit (PMU) records.
          </div>
        </div>
      </div>

      {/* Generated Reports History */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Recently Compiled Dossiers</h3>
        <div className="divide-y divide-slate-100">
          {recentReports.map((rep) => (
            <div key={rep.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                  {rep.format}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">{rep.title}</h4>
                  <span className="text-[11px] text-slate-400">Generated on {rep.date} &bull; {rep.size}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`Simulated download of ${rep.id} (${rep.format})`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
