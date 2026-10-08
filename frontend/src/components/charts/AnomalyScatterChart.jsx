import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const p = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
          <span className="font-bold text-slate-800">{p.workCode}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              p.isAnomaly ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {p.isAnomaly ? 'Outlier Flag' : 'Expected Range'}
          </span>
        </div>
        <div className="space-y-1 text-slate-600">
          <div>
            Physical Progress: <strong className="text-slate-900">{p.progress}%</strong>
          </div>
          <div>
            Expenditure Ratio: <strong className="text-slate-900">{p.expenditurePercent}%</strong>
          </div>
          <div className="text-[11px] text-slate-500 italic mt-1">
            {p.category}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function AnomalyScatterChart({ data, onSelectPoint }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Progress vs. Expenditure Correlation
          </h3>
          <p className="text-xs text-slate-500">
            Works diverging significantly from the 1:1 parity baseline indicate statistical reporting anomalies
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            Expected Baseline
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            Review Trigger
          </span>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number"
              dataKey="progress"
              name="Physical Progress"
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Reported Physical Progress (%)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              type="number"
              dataKey="expenditurePercent"
              name="Fund Expenditure"
              unit="%"
              domain={[0, 140]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Fund Expenditure (%)', angle: -90, position: 'insideLeft', offset: 20, fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Parity Line */}
            <ReferenceLine
              segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            <Scatter
              data={data}
              cursor="pointer"
              onClick={(entry) => onSelectPoint && onSelectPoint(entry)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isAnomaly ? '#e11d48' : '#0284c7'}
                  stroke={entry.isAnomaly ? '#ffe4e6' : '#bae6fd'}
                  strokeWidth={entry.isAnomaly ? 3 : 1}
                  r={entry.isAnomaly ? 7 : 4}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
