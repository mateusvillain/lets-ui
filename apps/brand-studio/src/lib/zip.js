/**
 * A ZIP writer for the export.
 *
 * The three token files are small JSON trees, so entries are stored
 * uncompressed: deflate would save a few kilobytes at the cost of a dependency
 * or of `CompressionStream`, and the archive exists to keep the download to a
 * single file, not to make it small.
 */

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const END_SIGNATURE = 0x06054b50;

/* Version 2.0 of the spec, and the flag that marks names as UTF-8. */
const VERSION = 20;
const UTF8_FLAG = 0x800;

const LOCAL_HEADER = 30;
const CENTRAL_HEADER = 46;
const END_RECORD = 22;

const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

/** CRC-32 of a byte sequence, as the ZIP central directory records it. */
export function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * MS-DOS date and time, which is what ZIP stores. Seconds have a two-second
 * resolution and the year is an offset from 1980 — anything earlier cannot be
 * represented, so it is clamped to the epoch.
 */
function dosStamp(date) {
  const year = Math.max(date.getFullYear() - 1980, 0);

  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      (date.getSeconds() >> 1),
    date: (year << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

/**
 * Packs `files` — a name-to-string map — into a ZIP blob. `date` is the
 * modification stamp every entry carries; it is a parameter so an archive can
 * be reproduced byte for byte.
 */
export function zip(files, date = new Date()) {
  const encoder = new TextEncoder();
  const stamp = dosStamp(date);

  const entries = Object.entries(files).map(([name, content]) => {
    const bytes = encoder.encode(content);
    return { name: encoder.encode(name), bytes, crc: crc32(bytes) };
  });

  const centralSize = entries.reduce(
    (total, entry) => total + CENTRAL_HEADER + entry.name.length,
    0
  );
  const centralOffset = entries.reduce(
    (total, entry) =>
      total + LOCAL_HEADER + entry.name.length + entry.bytes.length,
    0
  );

  const buffer = new Uint8Array(centralOffset + centralSize + END_RECORD);
  const view = new DataView(buffer.buffer);
  let offset = 0;

  const u16 = (value) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const u32 = (value) => {
    view.setUint32(offset, value, true);
    offset += 4;
  };
  const raw = (bytes) => {
    buffer.set(bytes, offset);
    offset += bytes.length;
  };

  for (const entry of entries) {
    entry.offset = offset;
    u32(LOCAL_SIGNATURE);
    u16(VERSION);
    u16(UTF8_FLAG);
    u16(0); // stored, not deflated
    u16(stamp.time);
    u16(stamp.date);
    u32(entry.crc);
    u32(entry.bytes.length); // compressed size — the same, being stored
    u32(entry.bytes.length);
    u16(entry.name.length);
    u16(0); // no extra field
    raw(entry.name);
    raw(entry.bytes);
  }

  for (const entry of entries) {
    u32(CENTRAL_SIGNATURE);
    u16(VERSION);
    u16(VERSION);
    u16(UTF8_FLAG);
    u16(0);
    u16(stamp.time);
    u16(stamp.date);
    u32(entry.crc);
    u32(entry.bytes.length);
    u32(entry.bytes.length);
    u16(entry.name.length);
    u16(0); // no extra field
    u16(0); // no comment
    u16(0); // first disk
    u16(0); // internal attributes
    u32(0); // external attributes
    u32(entry.offset);
    raw(entry.name);
  }

  u32(END_SIGNATURE);
  u16(0); // this disk
  u16(0); // disk the central directory starts on
  u16(entries.length);
  u16(entries.length);
  u32(centralSize);
  u32(centralOffset);
  u16(0); // no comment

  return new Blob([buffer], { type: 'application/zip' });
}
