/**
 * Format currency in Indian numbering format (Lakhs and Crores)
 */
export function formatCurrencyLakhs(lakhs) {
  if (lakhs === null || lakhs === undefined) return '₹ 0.00 L';
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return `₹ ${cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  }
  return `₹ ${Number(lakhs).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}

export function formatCrores(crores) {
  if (crores === null || crores === undefined) return '₹ 0.00 Cr';
  return `₹ ${Number(crores).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
}

export function formatPercent(val) {
  if (val === null || val === undefined) return '0.0%';
  return `${Number(val).toFixed(1)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
