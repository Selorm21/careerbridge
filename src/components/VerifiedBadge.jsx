// src/components/VerifiedBadge.jsx
// Reusable gold "Verified Student" badge.
// Shown when a student's transcript, national ID, and recommendation
// letter have ALL been verified by a university coordinator.

export default function VerifiedBadge({ size = 15, showLabel = true, style = {} }) {
  return (
    <span style={{ ...styles.wrap, ...style }}>
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none" style={styles.svg}>
        <path
          d="M11 0l2.6 1.4 2.9-0.4 1.4 2.6 2.6 1.4-0.4 2.9 1.4 2.6-1.4 2.6 0.4 2.9-2.6 1.4-1.4 2.6-2.9-0.4L11 22l-2.6-1.4-2.9 0.4-1.4-2.6-2.6-1.4 0.4-2.9L0.5 11.5l1.4-2.6-0.4-2.9 2.6-1.4 1.4-2.6 2.9 0.4L11 0z"
          fill="url(#verifiedGoldGradient)"
        />
        <path
          d="M6.5 11.2l2.8 2.8 6-6.4"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient id="verifiedGoldGradient" x1="0" y1="0" x2="22" y2="22">
            <stop offset="0%" stopColor="#F5D77E" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
      </svg>
      {showLabel && <span style={styles.label}>Verified</span>}
    </span>
  )
}

// Helper: given a documents array (as returned from Supabase, each with
// { doc_type, status }), determine whether a student is fully verified.
// A student is "Verified" only once transcript, national_id, and
// recommendation are ALL status === 'verified'.
export function isStudentFullyVerified(docs) {
  const requiredTypes = ['transcript', 'national_id', 'recommendation']
  return requiredTypes.every(
    (type) => docs?.find((d) => d.doc_type === type)?.status === 'verified'
  )
}

const styles = {
  wrap: {
    marginLeft: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#B8860B',
    verticalAlign: 'middle',
  },
  svg: {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
  },
  label: {
    lineHeight: 1,
  },
}