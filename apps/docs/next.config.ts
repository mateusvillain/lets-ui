import type { NextConfig } from 'next';
import nextra from 'nextra';

const withNextra = nextra({
  defaultShowCopyCode: true,
});

const nextConfig: NextConfig = {};

export default withNextra(nextConfig);
