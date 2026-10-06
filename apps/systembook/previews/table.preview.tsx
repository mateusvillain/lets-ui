import type { PreviewConfig } from '@systembook/schema';
import { Stretch } from './demo';
import { elementProps } from './element';

const ROWS = [
  { name: 'Ana Souza', status: 'Completed', variant: 'success' },
  { name: 'Bruno Lima', status: 'In Progress', variant: 'caution' },
  { name: 'Carla Dias', status: 'Canceled', variant: 'danger' },
];

// The native <table> is the slotted content; lui-table only adds the
// scrolling region and the visual chrome around it.
export function Preview(props: Record<string, unknown>) {
  return (
    <Stretch>
      <lui-table {...elementProps(props)}>
        <table>
          <caption>Deployments</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>
                  <lui-tag label={row.status} variant={row.variant} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </lui-table>
    </Stretch>
  );
}

export default {
  component: 'Table',
  variants: [
    { id: 'default', label: 'Default', props: {} },
    { id: 'bordered', label: 'Bordered', props: { bordered: true } },
  ],
  controls: [
    {
      kind: 'boolean',
      propName: 'bordered',
      label: 'Bordered',
      defaultValue: false,
    },
  ],
} satisfies PreviewConfig;
