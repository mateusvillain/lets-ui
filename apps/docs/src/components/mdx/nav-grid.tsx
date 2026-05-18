import Link from 'next/link'

export type NavItemStatus = 'stable' | 'beta' | 'alpha' | 'coming-soon'

export interface NavItem {
  title: string
  description: string
  href: string
  status?: NavItemStatus
}

const statusLabels: Partial<Record<NavItemStatus, string>> = {
  beta: 'Beta',
  alpha: 'Alpha',
  'coming-soon': 'Coming Soon',
}

export function NavGrid({ items }: { items: NavItem[] }) {
  return (
    <div className="nav-grid">
      {items.map((item) => {
        const isDisabled = item.status === 'coming-soon'
        const badge = item.status ? statusLabels[item.status] : undefined

        if (isDisabled) {
          return (
            <div key={item.href} className="nav-grid__item" data-status="coming-soon">
              <span className="nav-grid__title">{item.title}</span>
              <span className="nav-grid__description">{item.description}</span>
              {badge && <span className="nav-grid__badge">{badge}</span>}
            </div>
          )
        }

        return (
          <Link key={item.href} href={item.href} className="nav-grid__item" data-status={item.status ?? 'stable'}>
            <span className="nav-grid__title">{item.title}</span>
            <span className="nav-grid__description">{item.description}</span>
            {badge && <span className="nav-grid__badge">{badge}</span>}
          </Link>
        )
      })}
    </div>
  )
}
