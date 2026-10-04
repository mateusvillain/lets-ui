import '../../../../../packages/lets-ui-tokens/dist/letsui.tokens.css';
import '../../../../../packages/styles/dist/letsui.css';
import '../../index.js';

export default {
  title: 'Navigation/Pagination',
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0 } },
    compactSiblingCount: { control: { type: 'number', min: 0 } },
    ariaLabel: { control: 'text' },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
    pageLabel: { control: 'text' },
    statusLabel: { control: 'text' },
  },
};

const Template = ({
  currentPage,
  totalPages,
  siblingCount,
  compactSiblingCount,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageLabel,
  statusLabel,
}) => `
  <lui-pagination
    current-page="${currentPage}"
    total-pages="${totalPages}"
    sibling-count="${siblingCount}"
    compact-sibling-count="${compactSiblingCount}"
    aria-label="${ariaLabel}"
    previous-label="${previousLabel}"
    next-label="${nextLabel}"
    page-label="${pageLabel}"
    status-label="${statusLabel}"
  ></lui-pagination>
`;

export const Default = Template.bind({});
Default.args = {
  currentPage: 8,
  totalPages: 20,
  siblingCount: 1,
  compactSiblingCount: 0,
  ariaLabel: 'Pagination',
  previousLabel: 'Previous page',
  nextLabel: 'Next page',
  pageLabel: 'Page',
  statusLabel: 'Page {current} of {total}',
};

export const FewPages = () => `
  <lui-pagination current-page="3" total-pages="5"></lui-pagination>
`;
FewPages.storyName = 'Poucas páginas';
FewPages.parameters = { controls: { disable: true } };

export const ManyPages = () => `
  <lui-pagination current-page="1" total-pages="20"></lui-pagination>
`;
ManyPages.storyName = 'Muitas páginas';
ManyPages.parameters = { controls: { disable: true } };

export const Truncation = () => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <lui-pagination current-page="1" total-pages="20"></lui-pagination>
    <lui-pagination current-page="8" total-pages="20"></lui-pagination>
    <lui-pagination current-page="20" total-pages="20"></lui-pagination>
  </div>
`;
Truncation.storyName = 'Truncamento com reticências';
Truncation.parameters = { controls: { disable: true } };

export const SiblingCount = () => `
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <lui-pagination current-page="10" total-pages="20" sibling-count="0"></lui-pagination>
    <lui-pagination current-page="10" total-pages="20" sibling-count="1"></lui-pagination>
    <lui-pagination current-page="10" total-pages="20" sibling-count="2"></lui-pagination>
  </div>
`;
SiblingCount.storyName = 'Quantidade de vizinhas';
SiblingCount.parameters = { controls: { disable: true } };

export const PageChangeEvent = () => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
  wrapper.innerHTML = `
    <lui-pagination current-page="1" total-pages="10"></lui-pagination>
    <p>Página atual: <output>1</output></p>
  `;
  const output = wrapper.querySelector('output');
  wrapper.addEventListener('lui-page-change', (e) => {
    output.textContent = e.detail.page;
  });
  return wrapper;
};
PageChangeEvent.storyName = 'Evento lui-page-change';
PageChangeEvent.parameters = { controls: { disable: true } };

export const CSSClass = () => `
  <nav class="pagination" aria-label="Pagination">
    <ul class="pagination__list">
      <li>
        <a class="pagination__item pagination__item--direction" href="?page=7" aria-label="Previous page">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M11.589 4.558a.625.625 0 0 1 .884.884L7.915 10l4.558 4.558a.625.625 0 0 1-.884.884l-5-5a.625.625 0 0 1 0-.884l5-5Z" />
          </svg>
        </a>
      </li>
      <li><a class="pagination__item" href="?page=1">1</a></li>
      <li aria-hidden="true"><span class="pagination__ellipsis">…</span></li>
      <li><a class="pagination__item" href="?page=7">7</a></li>
      <li><a class="pagination__item" href="?page=8" aria-current="page">8</a></li>
      <li><a class="pagination__item" href="?page=9">9</a></li>
      <li aria-hidden="true"><span class="pagination__ellipsis">…</span></li>
      <li><a class="pagination__item" href="?page=20">20</a></li>
      <li>
        <a class="pagination__item pagination__item--direction" href="?page=9" aria-label="Next page">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M8.411 4.558a.625.625 0 0 0-.884.884L12.085 10l-4.558 4.558a.625.625 0 0 0 .884.884l5-5a.625.625 0 0 0 0-.884l-5-5Z" />
          </svg>
        </a>
      </li>
    </ul>
  </nav>
`;
CSSClass.storyName = 'Classe CSS (sem Web Component)';
CSSClass.parameters = { controls: { disable: true } };
