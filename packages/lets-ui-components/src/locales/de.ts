import type { Translation } from '../utils/i18n.js';

/**
 * German. Registered as `de`, so it serves every regional variant — `de-DE`,
 * `de-AT`, `de-CH` — unless one of them registers a dictionary of its own.
 * Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { de } from '@lets-ui/components/locales/de';
 *
 * registerTranslation(de);
 * ```
 */
export const de: Translation = {
  $code: 'de',
  $name: 'Deutsch',
  $dir: 'ltr',

  'form.optionalText': '(optional)',
  'form.errorText': 'Dieses Feld ist erforderlich.',

  'input.showPasswordLabel': 'Passwort anzeigen',
  'input.hidePasswordLabel': 'Passwort verbergen',
  'input.incrementLabel': 'Wert erhöhen',
  'input.decrementLabel': 'Wert verringern',

  'select.placeholder': 'Option auswählen',

  'radioGroup.errorText': 'Wählen Sie eine Option aus.',

  'otpInput.label': 'Bestätigungscode',
  'otpInput.fieldLabel': 'Zeichen {index} von {length}',

  'link.externalLabel': '(öffnet in neuem Tab)',

  'datePicker.requiredText': 'Erforderlich',
  'datePicker.badInputText': 'Geben Sie ein gültiges Datum ein.',
  'datePicker.rangeErrorText':
    'Geben Sie ein Datum im zulässigen Zeitraum ein.',
  'datePicker.unavailableDateText': 'Dieses Datum ist nicht verfügbar.',
  'datePicker.rangeOrderText':
    'Das Enddatum darf nicht vor dem Startdatum liegen.',
  'datePicker.rangeStartText':
    'Startdatum ausgewählt. Wählen Sie das Enddatum.',
  'datePicker.selectedDayText': 'ausgewählt',
  'datePicker.rangeStartDayText': 'Beginn des Zeitraums',
  'datePicker.inRangeDayText': 'im Zeitraum',
  'datePicker.rangeEndDayText': 'Ende des Zeitraums',
  'datePicker.unavailableDayText': 'nicht verfügbar',
  'datePicker.dialogLabel': 'Datum auswählen',
  'datePicker.previousMonthLabel': 'Vorheriger Monat',
  'datePicker.nextMonthLabel': 'Nächster Monat',
  'datePicker.chooseMonthLabel': 'Monat auswählen',
  'datePicker.chooseYearLabel': 'Jahr auswählen',
  'datePicker.previousYearLabel': 'Vorheriges Jahr',
  'datePicker.nextYearLabel': 'Nächstes Jahr',
  'datePicker.previousYearsLabel': 'Vorherige Jahre',
  'datePicker.nextYearsLabel': 'Nächste Jahre',
  'datePicker.startLabel': 'Startdatum',
  'datePicker.endLabel': 'Enddatum',
  // The letter each field of the typed format repeats: `TT.MM.JJJJ`, the
  // capitals German forms use (Tag, Monat, Jahr).
  'datePicker.dayLetter': 'T',
  'datePicker.monthLetter': 'M',
  'datePicker.yearLetter': 'J',
};
