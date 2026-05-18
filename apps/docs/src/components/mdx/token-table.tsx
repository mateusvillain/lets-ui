export interface Token {
  name: string
  value: string
  description?: string
}

export function TokenTable({ tokens }: { tokens: Token[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <td><code>{token.name}</code></td>
            <td><code>{token.value}</code></td>
            <td>{token.description ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
