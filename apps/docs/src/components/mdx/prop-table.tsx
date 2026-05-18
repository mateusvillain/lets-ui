export interface Prop {
  name: string
  type: string
  default?: string
  description: string
  required?: boolean
}

export function PropTable({ props }: { props: Prop[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name}>
            <td><code>{prop.name}{prop.required ? '*' : ''}</code></td>
            <td><code>{prop.type}</code></td>
            <td>{prop.default ? <code>{prop.default}</code> : '—'}</td>
            <td>{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
