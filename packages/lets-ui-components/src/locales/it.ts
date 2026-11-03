import type { Translation } from '../utils/i18n.js';

/**
 * Italian. Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { it } from '@lets-ui/components/locales/it';
 *
 * registerTranslation(it);
 * ```
 */
export const it: Translation = {
  $code: 'it',
  $name: 'Italiano',
  $dir: 'ltr',

  'form.optionalText': '(facoltativo)',
  'form.errorText': 'Questo campo è obbligatorio.',

  'input.showPasswordLabel': 'Mostra password',
  'input.hidePasswordLabel': 'Nascondi password',
  'input.incrementLabel': 'Aumenta valore',
  'input.decrementLabel': 'Diminuisci valore',

  'select.placeholder': 'Seleziona un’opzione',

  'radioGroup.errorText': 'Seleziona un’opzione.',

  'otpInput.label': 'Codice di verifica',
  'otpInput.fieldLabel': 'Carattere {index} di {length}',

  'link.externalLabel': '(si apre in una nuova scheda)',

  'datePicker.requiredText': 'Obbligatorio',
  'datePicker.badInputText': 'Inserisci una data valida.',
  'datePicker.rangeErrorText':
    'Inserisci una data compresa nel periodo consentito.',
  'datePicker.unavailableDateText': 'Questa data non è disponibile.',
  'datePicker.rangeOrderText':
    'La data di fine non può precedere la data di inizio.',
  'datePicker.rangeStartText':
    'Data di inizio selezionata. Scegli la data di fine.',
  'datePicker.selectedDayText': 'selezionato',
  'datePicker.rangeStartDayText': 'inizio del periodo',
  'datePicker.inRangeDayText': 'nel periodo',
  'datePicker.rangeEndDayText': 'fine del periodo',
  'datePicker.unavailableDayText': 'non disponibile',
  'datePicker.dialogLabel': 'Scegli una data',
  'datePicker.previousMonthLabel': 'Mese precedente',
  'datePicker.nextMonthLabel': 'Mese successivo',
  'datePicker.chooseMonthLabel': 'scegli il mese',
  'datePicker.chooseYearLabel': 'scegli l’anno',
  'datePicker.previousYearLabel': 'Anno precedente',
  'datePicker.nextYearLabel': 'Anno successivo',
  'datePicker.previousYearsLabel': 'Anni precedenti',
  'datePicker.nextYearsLabel': 'Anni successivi',
  'datePicker.startLabel': 'Data di inizio',
  'datePicker.endLabel': 'Data di fine',
  // The letter each field of the typed format repeats: `gg / mm / aaaa`
  // (giorno, mese, anno).
  'datePicker.dayLetter': 'g',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'a',
};
