export function ColorSwatch({ token, label }: { token: string; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--lui-border-radius-sm)',
          backgroundColor: `var(${token})`,
          border: 'var(--lui-border-width-1) solid var(--lui-color-neutral-border-subtle)',
          flexShrink: 0,
        }}
      />
      <div>
        <code style={{ fontSize: '0.875em' }}>{token}</code>
        {label && <p style={{ margin: 0, fontSize: '0.8em' }}>{label}</p>}
      </div>
    </div>
  )
}
