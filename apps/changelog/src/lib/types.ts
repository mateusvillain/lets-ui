export type ReleaseType = 'new' | 'improvement' | 'fix';

export interface Section {
  heading: string;
  kind: 'added' | 'changed' | 'removed' | 'fixed' | null;
  items: string[];
}

export interface Release {
  version: string;
  tag: string;
  slug: string;
  date: string | null;
  markdown: string;
  sections: Section[];
  counts: Record<'added' | 'changed' | 'removed' | 'fixed', number>;
  type: ReleaseType | null;
  title: string;
  description: string;
  highlights: string[];
  fallback?: boolean;
}

export type Locale = 'en' | 'pt';
