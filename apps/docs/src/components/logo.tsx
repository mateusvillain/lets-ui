export function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--lui-border-radius-md)',
          backgroundColor: 'var(--lui-color-primary-background-container)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
          <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.3" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: 'var(--lui-brand-typography-font-family-heading)',
          fontWeight: 600,
          fontSize: '16px',
          letterSpacing: '-0.02em',
          color: 'var(--lui-color-neutral-text-heading)',
        }}
      >
        Let&apos;s UI
      </span>
    </div>
  )
}
