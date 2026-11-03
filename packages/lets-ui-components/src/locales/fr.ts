import type { Translation } from '../utils/i18n.js';

/**
 * French. Registered as `fr`, so it serves every regional variant — `fr-FR`,
 * `fr-CA`, `fr-BE` — unless one of them registers a dictionary of its own.
 * Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { fr } from '@lets-ui/components/locales/fr';
 *
 * registerTranslation(fr);
 * ```
 */
export const fr: Translation = {
  $code: 'fr',
  $name: 'Français',

  'form.optionalText': '(facultatif)',
  'form.errorText': 'Ce champ est obligatoire.',

  'input.showPasswordLabel': 'Afficher le mot de passe',
  'input.hidePasswordLabel': 'Masquer le mot de passe',
  'input.incrementLabel': 'Augmenter la valeur',
  'input.decrementLabel': 'Diminuer la valeur',

  'select.placeholder': 'Sélectionnez une option',

  'radioGroup.errorText': 'Sélectionnez une option.',

  'otpInput.label': 'Code de vérification',
  'otpInput.fieldLabel': 'Caractère {index} sur {length}',

  'link.externalLabel': '(s’ouvre dans un nouvel onglet)',

  'datePicker.requiredText': 'Obligatoire',
  'datePicker.badInputText': 'Saisissez une date valide.',
  'datePicker.rangeErrorText':
    'Saisissez une date comprise dans la période autorisée.',
  'datePicker.unavailableDateText': 'Cette date n’est pas disponible.',
  'datePicker.rangeOrderText':
    'La date de fin ne peut pas précéder la date de début.',
  'datePicker.rangeStartText':
    'Date de début sélectionnée. Choisissez la date de fin.',
  'datePicker.selectedDayText': 'sélectionné',
  'datePicker.rangeStartDayText': 'début de la période',
  'datePicker.inRangeDayText': 'dans la période',
  'datePicker.rangeEndDayText': 'fin de la période',
  'datePicker.unavailableDayText': 'indisponible',
  'datePicker.dialogLabel': 'Choisir une date',
  'datePicker.previousMonthLabel': 'Mois précédent',
  'datePicker.nextMonthLabel': 'Mois suivant',
  'datePicker.chooseMonthLabel': 'choisir le mois',
  'datePicker.chooseYearLabel': 'choisir l’année',
  'datePicker.previousYearLabel': 'Année précédente',
  'datePicker.nextYearLabel': 'Année suivante',
  'datePicker.previousYearsLabel': 'Années précédentes',
  'datePicker.nextYearsLabel': 'Années suivantes',
  'datePicker.startLabel': 'Date de début',
  'datePicker.endLabel': 'Date de fin',
  // The letter each field of the typed format repeats: `jj / mm / aaaa`.
  'datePicker.dayLetter': 'j',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'a',
};
