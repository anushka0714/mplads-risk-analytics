/**
 * Metric KPI Card with Sky Blue / Slate accents and icon support
 */
export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeVariant = 'default',
  trend,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badgeVariant === 'danger'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : badgeVariant === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
          {trend && (
            <span className="font-medium text-slate-700">
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
