type Status = 'stable' | 'beta' | 'alpha' | 'deprecated' | 'coming-soon'

const labels: Record<Status, string> = {
  stable: 'Stable',
  beta: 'Beta',
  alpha: 'Alpha',
  deprecated: 'Deprecated',
  'coming-soon': 'Coming Soon',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span data-status={status} style={{ fontSize: '0.75em', fontWeight: 500 }}>
      {labels[status]}
    </span>
  )
}
