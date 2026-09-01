/**
 * The archive is read by the user's operating system, not by this codebase, so
 * a reader written against the same assumptions as the writer would prove
 * nothing: the entries are parsed back from the central directory — the index
 * every unzip tool actually reads — and the CRCs are checked against it.
 */

import { describe, expect, it } from 'vitest';

import { crc32, zip } from './zip.js';

const bytes = (text) => new TextEncoder().encode(text);

/**
 * Parses an archive the way an extractor does: walks the central directory
 * backwards from the end record, then reads each entry's data at the offset
 * its local header sits at.
 */
async function readZip(blob) {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(buffer.buffer);
  const decoder = new TextDecoder();

  let end = buffer.length - 22;
  while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) end -= 1;
  expect(end).toBeGreaterThanOrEqual(0);

  const count = view.getUint16(end + 10, true);
  let offset = view.getUint32(end + 16, true);
  const entries = {};

  for (let index = 0; index < count; index += 1) {
    expect(view.getUint32(offset, true)).toBe(0x02014b50);

    const crc = view.getUint32(offset + 16, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const local = view.getUint32(offset + 42, true);
    const name = decoder.decode(
      buffer.subarray(offset + 46, offset + 46 + nameLength)
    );

    expect(view.getUint32(local, true)).toBe(0x04034b50);
    const data =
      local +
      30 +
      view.getUint16(local + 26, true) +
      view.getUint16(local + 28, true);

    entries[name] = {
      crc,
      content: decoder.decode(buffer.subarray(data, data + size)),
    };
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

describe('crc32', () => {
  it('matches the check value the spec publishes', () => {
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
  });

  it('is zero for empty input', () => {
    expect(crc32(bytes(''))).toBe(0);
  });
});

describe('zip', () => {
  const files = {
    'foundation.json': '{\n  "a": 1\n}\n',
    'colors.light.json': '{\n  "b": 2\n}\n',
    'colors.dark.json': '{\n  "c": 3\n}\n',
  };

  it('round-trips every file through the central directory', async () => {
    const entries = await readZip(zip(files));

    expect(Object.keys(entries).sort()).toEqual(Object.keys(files).sort());
    for (const [name, content] of Object.entries(files)) {
      expect(entries[name].content).toBe(content);
    }
  });

  it('records a CRC that matches the stored bytes', async () => {
    const entries = await readZip(zip(files));

    for (const [name, content] of Object.entries(files)) {
      expect(entries[name].crc).toBe(crc32(bytes(content)));
    }
  });

  it('preserves non-ASCII content byte for byte', async () => {
    const content = '{ "name": "Crème Brûlée — Ação" }\n';
    const entries = await readZip(zip({ 'foundation.json': content }));

    expect(entries['foundation.json'].content).toBe(content);
    expect(entries['foundation.json'].crc).toBe(crc32(bytes(content)));
  });

  it('writes an archive even with no files', async () => {
    expect(await readZip(zip({}))).toEqual({});
  });
});
