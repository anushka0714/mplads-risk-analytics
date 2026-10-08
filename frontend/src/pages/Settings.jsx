import { useState } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle,
  Server
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function Settings() {
  const [inactivityDays, setInactivityDays] = useState(120);
  const [costVariancePct, setCostVariancePct] = useState(25);
  const [progressDisbGap, setProgressDisbGap] = useState(40);
  const [apiMode, setApiMode] = useState('mock'); // 'mock' or 'live'
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000/api/v1');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setInactivityDays(120);
    setCostVariancePct(25);
    setProgressDisbGap(40);
    setApiMode('mock');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          System Configuration & Detection Thresholds
        </h2>
        <p className="text-xs text-slate-500">
          Calibrate statistical outlier parameters, audit review triggers, and backend FastAPI integration
        </p>
      </div>

      <DisclaimerBanner compact />

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully. Model thresholds updated for subsequent analytical passes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Anomaly Detection Calibration */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Analytical Model Calibration
              </h3>
              <p className="text-xs text-slate-500">
                Adjust sensitivity parameters that trigger automated audit flags
              </p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Inactivity Threshold */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-800">
                  Timeline Inactivity Trigger (Days)
                </label>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {inactivityDays} Days
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="240"
                step="15"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Flags projects with zero milestone progress entries recorded past this duration post-sanction.
              </p>
            </div>

            {/* Cost Variance */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-800">
                  Cost Escalation Variance Tolerance (%)
                </label>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  +{costVariancePct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={costVariancePct}
                onChange={(e) => setCostVariancePct(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Flags expenditure exceeding initial administrative sanction beyond this percentage threshold.
              </p>
            </div>

            {/* Progress vs Disbursement Gap */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-slate-800">
                  Progress-to-Disbursement Divergence Tolerance (%)
                </label>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {progressDisbGap}% Gap
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={progressDisbGap}
                onChange={(e) => setProgressDisbGap(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Flags cases where fund disbursement exceeds recorded physical completion by more than this margin.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Backend API Architecture Integration */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Backend Architecture & Data Source
              </h3>
              <p className="text-xs text-slate-500">
                Seamlessly toggle between frontend standalone mock data and live Python FastAPI service
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-2">
                Operational Data Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                    apiMode === 'mock'
                      ? 'border-sky-500 bg-sky-50/50 text-sky-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="apiMode"
                    checked={apiMode === 'mock'}
                    onChange={() => setApiMode('mock')}
                    className="mt-0.5 text-sky-600"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Standalone Mock Mode</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Self-contained demonstration datasets with full scheme metrics, zero backend dependency.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                    apiMode === 'live'
                      ? 'border-sky-500 bg-sky-50/50 text-sky-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="apiMode"
                    checked={apiMode === 'live'}
                    onChange={() => setApiMode('live')}
                    className="mt-0.5 text-sky-600"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>FastAPI + PostgreSQL Live</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Connect to backend team member's Python REST API service endpoints.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {apiMode === 'live' && (
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  FastAPI Base URL Endpoint
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000/api/v1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Defaults
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
