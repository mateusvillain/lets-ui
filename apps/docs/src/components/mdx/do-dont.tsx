export function Do({ children }: { children: React.ReactNode }) {
  return (
    <div data-dodont="do">
      <strong>Do</strong>
      {children}
    </div>
  )
}

export function Dont({ children }: { children: React.ReactNode }) {
  return (
    <div data-dodont="dont">
      <strong>Don&apos;t</strong>
      {children}
    </div>
  )
}

export function DoDont({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {children}
    </div>
  )
}
