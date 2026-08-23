import { LitElement, html, unsafeCSS, nothing } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './empty-state.scss?inline';

const VALID_ALIGNS = ['center', 'left'];
const VALID_ANNOUNCE = ['off', 'polite', 'assertive'];

// `polite` vira `role="status"` e `assertive` vira `role="alert"`. Os dois já
// carregam `aria-live` implícito, então declarar o role basta.
const ANNOUNCE_ROLES: Record<string, string> = {
  polite: 'status',
  assertive: 'alert',
};

export class LuiEmptyState extends LitElement {
  static styles = unsafeCSS(styles);

  /** Alinhamento do bloco inteiro: `center` (padrão) ou `left`. */
  @property() align = 'center';

  /** Título — único conteúdo obrigatório de um Empty State. */
  @property() title = '';

  /**
   * Nível do heading renderizado (1–6). Ajuste conforme a hierarquia do
   * documento em volta: um componente reutilizável não sabe onde foi inserido.
   */
  @property({ attribute: 'title-level' }) titleLevel = '2';

  /** Texto de apoio: explica a causa do vazio ou o próximo passo. */
  @property() description = '';

  /**
   * Anuncia a região quando o Empty State aparece após uma ação do usuário
   * (busca, filtro, exclusão) na mesma navegação. Mantenha `off` quando ele já
   * está presente no carregamento inicial — anunciar aí seria redundante.
   */
  @property() announce = 'off';

  /** Rótulo acessível do grupo de ações, anunciado quando há mais de uma. */
  @property({ attribute: 'actions-label' }) actionsLabel =
    'Empty state actions';

  @state() private _hasCover = false;
  @state() private _hasActions = false;
  @state() private _hasContent = false;

  private _handleSlotChange(
    e: Event,
    key: '_hasCover' | '_hasActions' | '_hasContent'
  ) {
    const slot = e.target as HTMLSlotElement;
    this[key] = slot
      .assignedNodes({ flatten: true })
      .some((node) =>
        node.nodeType === Node.ELEMENT_NODE ? true : !!node.textContent?.trim()
      );
  }

  private get _titleTag(): string {
    const level = parseInt(this.titleLevel, 10);
    return level >= 1 && level <= 6 ? `h${level}` : 'h2';
  }

  render() {
    const align = VALID_ALIGNS.includes(this.align) ? this.align : 'center';
    const announce = VALID_ANNOUNCE.includes(this.announce)
      ? this.announce
      : 'off';
    const tag = this._titleTag;

    return staticHtml`
      <div
        class="empty-state empty-state--align-${align}"
        role="${ifDefined(ANNOUNCE_ROLES[announce])}"
        aria-atomic="${announce === 'off' ? nothing : 'true'}"
      >
        <div
          class="empty-state__cover"
          aria-hidden="true"
          style="${this._hasCover ? '' : 'display:none'}"
        >
          <slot
            name="cover"
            @slotchange="${(e: Event) => this._handleSlotChange(e, '_hasCover')}"
          ></slot>
        </div>

        <div class="empty-state__text">
          <${unsafeStatic(tag)} class="empty-state__title">
            ${this.title}
          </${unsafeStatic(tag)}>
          ${
            this.description
              ? html`<p class="empty-state__description">
                  ${this.description}
                </p>`
              : nothing
          }
          <div style="${this._hasContent ? '' : 'display:none'}">
            <slot
              @slotchange="${(e: Event) => this._handleSlotChange(e, '_hasContent')}"
            ></slot>
          </div>
        </div>

        <div
          class="empty-state__actions"
          role="group"
          aria-label="${this.actionsLabel}"
          style="${this._hasActions ? '' : 'display:none'}"
        >
          <slot
            name="actions"
            @slotchange="${(e: Event) => this._handleSlotChange(e, '_hasActions')}"
          ></slot>
        </div>
      </div>
    `;
  }
}
