import type { Translation } from '../utils/i18n.js';
import { ptBR } from './pt-BR.js';

/**
 * European Portuguese. Starts from Brazilian Portuguese and lists only what
 * Portugal says differently, so a term added to `ptBR` reaches it too — check
 * here whether Portugal words it otherwise. Opt-in: nothing registers it until
 * the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { ptPT } from '@lets-ui/components/locales/pt-PT';
 *
 * registerTranslation(ptPT);
 * ```
 */
export const ptPT: Translation = {
  ...ptBR,
  $code: 'pt-PT',
  $name: 'Português (Portugal)',

  'input.showPasswordLabel': 'Mostrar palavra-passe',
  'input.hidePasswordLabel': 'Ocultar palavra-passe',

  'otpInput.fieldLabel': 'Carácter {index} de {length}',

  'link.externalLabel': '(abre num novo separador)',

  'datePicker.badInputText': 'Introduza uma data válida.',
  'datePicker.rangeErrorText':
    'Introduza uma data dentro do período permitido.',
  'datePicker.rangeOrderText':
    'A data de fim não pode ser anterior à data de início.',
  'datePicker.rangeStartText':
    'Data de início selecionada. Escolha a data de fim.',
  'datePicker.nextMonthLabel': 'Mês seguinte',
  'datePicker.nextYearLabel': 'Ano seguinte',
  'datePicker.nextYearsLabel': 'Anos seguintes',
  'datePicker.startLabel': 'Data de início',
  'datePicker.endLabel': 'Data de fim',
};
