import type { PropertyDeclaration } from 'lit';

/**
 * Declaração compartilhada da propriedade `name` dos componentes
 * form-associated (`static formAssociated = true` + `setFormValue()`).
 *
 * O `FormData` de um elemento form-associated procura o campo pelo **atributo**
 * `name`, não pela propriedade. Frameworks como o React setam `name` como
 * propriedade sempre que o custom element declara aquele nome — então
 * `<lui-input name="email" />` em React nunca produzia o atributo e o campo
 * sumia do `new FormData(form)` em silêncio. Refletir resolve na origem, sem
 * exigir `ref={(el) => el?.setAttribute('name', ...)}` no consumidor.
 *
 * O converter remove o atributo quando o nome está vazio, em vez de deixar um
 * `name=""` inerte no DOM — campo sem nome não é enviado de qualquer forma.
 */
export const nameProperty: PropertyDeclaration = {
  reflect: true,
  converter: {
    fromAttribute: (value: string | null) => value ?? '',
    toAttribute: (value: unknown) => (value as string) || null,
  },
};
