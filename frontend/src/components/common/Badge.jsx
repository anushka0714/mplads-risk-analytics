/**
 * Standardized status and anomaly risk badge component
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  const styles = {
    // Status variants
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ongoing: 'bg-sky-50 text-sky-700 border-sky-200',
    delayed: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
    sanctioned: 'bg-slate-100 text-slate-700 border-slate-200',
    stalled: 'bg-amber-50 text-amber-700 border-amber-200',
    
    // Risk / Anomaly levels
    normal: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    'low risk': 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    'medium risk': 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    'high risk': 'bg-rose-50 text-rose-700 border-rose-200 font-medium',

    // Severity tags
    high: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    low: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    
    // Administrative audit states
    'pending review': 'bg-rose-50 text-rose-700 border-rose-200',
    'field inquiry assigned': 'bg-amber-50 text-amber-700 border-amber-200',
    'documentation follow-up': 'bg-sky-50 text-sky-700 border-sky-200',
    'resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',

    default: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const key = variant ? String(variant).toLowerCase().trim() : 'default';
  const currentStyle = styles[key] || styles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {children}
    </span>
  );
}
