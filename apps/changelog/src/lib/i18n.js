/**
 * The site's languages and interface strings. English lives at the root and
 * every other locale under its own prefix (`/pt/…`), so each language has
 * stable URLs of its own. Shared by the pages and the timeline script.
 */

export const DEFAULT_LOCALE = 'en';

export const LOCALES = {
  en: {
    lang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
    name: 'English',
    source: 'CHANGELOG.md',
  },
  pt: {
    lang: 'pt-BR',
    ogLocale: 'pt_BR',
    dateLocale: 'pt-BR',
    name: 'Português',
    source: 'CHANGELOG.pt-BR.md',
  },
};

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** `localePath('pt', '/releases/')` → `/pt/releases/`. */
export function localePath(locale, path = '/') {
  const prefix = locale === DEFAULT_LOCALE ? '' : `${locale}/`;
  return `${BASE}${prefix}${path.replace(/^\//, '')}`;
}

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const STRINGS = {
  en: {
    types: { new: 'New', improvement: 'Improvement', fix: 'Fix' },
    skip: 'Skip to content',
    languages: 'Language',
    home: {
      title: "Changelog · What's new in Let's UI",
      description:
        "New components, improvements and fixes in Let's UI, release by release, from the repository's CHANGELOG.md.",
      heading: "What's new in Let's UI",
      subtitle:
        'New components, improvements and fixes in every release of the design system, newest first.',
      filters: 'Filter releases by type',
      all: 'All',
      total: (n, since) =>
        `${count(n, 'release', 'releases')}${since ? ` since ${since}` : ''}`,
      history: 'Release history',
      loadMore: 'Load earlier releases',
      done: "You've reached the beginning of the changelog.",
      archive: 'All releases as a list',
    },
    card: {
      version: 'Version ',
      latest: 'Latest',
      categories: 'Categories',
      type: 'Type: ',
      highlights: 'Highlights',
      readNotes: 'Read full notes',
      readNotesFor: (tag) => ` for ${tag}`,
    },
    release: {
      title: (tag) => `${tag} · Let's UI changelog`,
      description: (tag) => `Release notes for Let's UI ${tag}.`,
      back: 'All releases',
      released: (date) => `Released ${date}`,
      pager: 'Other releases',
      newer: 'Newer',
      older: 'Older',
    },
    archive: {
      title: "All releases · Let's UI changelog",
      description: "Every Let's UI release, from CHANGELOG.md.",
      back: 'Timeline',
      heading: 'All releases',
    },
    timeline: {
      empty: 'No releases of this type.',
      showing: (n, type) =>
        `Showing ${count(n, 'release', 'releases')}${type ? ` of type ${type}` : ''}.`,
      loaded: (n, type, finished) =>
        `${count(
          n,
          `earlier ${type ? `${type} ` : ''}release`,
          `earlier ${type ? `${type} ` : ''}releases`
        )} loaded.${finished ? ' No more releases.' : ''}`,
    },
  },
  pt: {
    types: { new: 'Novo', improvement: 'Melhoria', fix: 'Correção' },
    skip: 'Pular para o conteúdo',
    languages: 'Idioma',
    home: {
      title: "Changelog · Novidades do Let's UI",
      description:
        "Novos componentes, melhorias e correções do Let's UI, versão a versão, a partir do CHANGELOG do repositório.",
      heading: "Novidades do Let's UI",
      subtitle:
        'Novos componentes, melhorias e correções em cada versão do design system, das mais recentes às mais antigas.',
      filters: 'Filtrar versões por tipo',
      all: 'Todas',
      total: (n, since) =>
        `${count(n, 'versão', 'versões')}${since ? ` desde ${since}` : ''}`,
      history: 'Histórico de versões',
      loadMore: 'Carregar versões anteriores',
      done: 'Você chegou ao início do changelog.',
      archive: 'Todas as versões em lista',
    },
    card: {
      version: 'Versão ',
      latest: 'Mais recente',
      categories: 'Categorias',
      type: 'Tipo: ',
      highlights: 'Destaques',
      readNotes: 'Ler notas completas',
      readNotesFor: (tag) => ` da ${tag}`,
    },
    release: {
      title: (tag) => `${tag} · Changelog do Let's UI`,
      description: (tag) => `Notas da versão ${tag} do Let's UI.`,
      back: 'Todas as versões',
      released: (date) => `Lançada em ${date}`,
      untranslated:
        'Estas notas ainda não foram traduzidas e aparecem em inglês.',
      pager: 'Outras versões',
      newer: 'Mais nova',
      older: 'Mais antiga',
    },
    archive: {
      title: "Todas as versões · Changelog do Let's UI",
      description:
        "Todas as versões do Let's UI, a partir do CHANGELOG do repositório.",
      back: 'Linha do tempo',
      heading: 'Todas as versões',
    },
    timeline: {
      empty: 'Nenhuma versão deste tipo.',
      showing: (n, type) =>
        `Mostrando ${count(n, 'versão', 'versões')}${type ? ` do tipo ${type}` : ''}.`,
      loaded: (n, type, finished) =>
        `${count(
          n,
          `versão anterior${type ? ` do tipo ${type}` : ''} carregada`,
          `versões anteriores${type ? ` do tipo ${type}` : ''} carregadas`
        )}.${finished ? ' Não há mais versões.' : ''}`,
    },
  },
};
