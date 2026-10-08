/**
 * Standardized status and anomaly risk badge component
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  const styles = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ongoing: 'bg-sky-50 text-sky-700 border-sky-200',
    sanctioned: 'bg-slate-100 text-slate-700 border-slate-200',
    stalled: 'bg-amber-50 text-amber-700 border-amber-200',
    
    // Severity tags
    high: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    low: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    
    // Administrative audit states
    'Pending Review': 'bg-rose-50 text-rose-700 border-rose-200',
    'Field Inquiry Assigned': 'bg-amber-50 text-amber-700 border-amber-200',
    'Documentation Follow-up': 'bg-sky-50 text-sky-700 border-sky-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',

    default: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const currentStyle = styles[variant] || styles[variant.toLowerCase()] || styles.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
