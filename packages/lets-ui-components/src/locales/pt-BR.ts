import type { Translation } from '../utils/i18n.js';

/**
 * Brazilian Portuguese. Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { ptBR } from '@lets-ui/components/locales/pt-BR';
 *
 * registerTranslation(ptBR);
 * ```
 */
export const ptBR: Translation = {
  $code: 'pt-BR',
  $name: 'Português (Brasil)',

  'form.optionalText': '(opcional)',
  'form.errorText': 'Este campo é obrigatório.',

  'input.showPasswordLabel': 'Mostrar senha',
  'input.hidePasswordLabel': 'Ocultar senha',
  'input.incrementLabel': 'Aumentar valor',
  'input.decrementLabel': 'Diminuir valor',

  'select.placeholder': 'Selecione uma opção',

  'radioGroup.errorText': 'Selecione uma opção.',

  'otpInput.label': 'Código de verificação',
  'otpInput.fieldLabel': 'Caractere {index} de {length}',

  'link.externalLabel': '(abre em nova aba)',

  'datePicker.requiredText': 'Obrigatório',
  'datePicker.badInputText': 'Insira uma data válida.',
  'datePicker.rangeErrorText': 'Insira uma data dentro do período permitido.',
  'datePicker.unavailableDateText': 'Esta data não está disponível.',
  'datePicker.rangeOrderText':
    'A data final não pode ser anterior à data inicial.',
  'datePicker.rangeStartText':
    'Data inicial selecionada. Escolha a data final.',
  'datePicker.selectedDayText': 'selecionado',
  'datePicker.rangeStartDayText': 'início do período',
  'datePicker.inRangeDayText': 'no período',
  'datePicker.rangeEndDayText': 'fim do período',
  'datePicker.unavailableDayText': 'indisponível',
  'datePicker.dialogLabel': 'Escolher data',
  'datePicker.previousMonthLabel': 'Mês anterior',
  'datePicker.nextMonthLabel': 'Próximo mês',
  'datePicker.chooseMonthLabel': 'escolher mês',
  'datePicker.chooseYearLabel': 'escolher ano',
  'datePicker.previousYearLabel': 'Ano anterior',
  'datePicker.nextYearLabel': 'Próximo ano',
  'datePicker.previousYearsLabel': 'Anos anteriores',
  'datePicker.nextYearsLabel': 'Próximos anos',
  'datePicker.startLabel': 'Data inicial',
  'datePicker.endLabel': 'Data final',
  // The letter each field of the typed format repeats: `dd / mm / aaaa`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'a',
};
