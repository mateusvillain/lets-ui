import type { Translation } from '../utils/i18n.js';

/**
 * Spanish. Registered as `es`, so it serves every regional variant — `es-ES`,
 * `es-MX`, `es-AR` — unless one of them registers a dictionary of its own.
 * Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { es } from '@lets-ui/components/locales/es';
 *
 * registerTranslation(es);
 * ```
 */
export const es: Translation = {
  $code: 'es',
  $name: 'Español',

  'form.optionalText': '(opcional)',
  'form.errorText': 'Este campo es obligatorio.',

  'input.showPasswordLabel': 'Mostrar contraseña',
  'input.hidePasswordLabel': 'Ocultar contraseña',
  'input.incrementLabel': 'Aumentar valor',
  'input.decrementLabel': 'Disminuir valor',

  'select.placeholder': 'Selecciona una opción',

  'radioGroup.errorText': 'Selecciona una opción.',

  'otpInput.label': 'Código de verificación',
  'otpInput.fieldLabel': 'Carácter {index} de {length}',

  'link.externalLabel': '(se abre en una pestaña nueva)',

  'datePicker.requiredText': 'Obligatorio',
  'datePicker.badInputText': 'Introduce una fecha válida.',
  'datePicker.rangeErrorText':
    'Introduce una fecha dentro del período permitido.',
  'datePicker.unavailableDateText': 'Esta fecha no está disponible.',
  'datePicker.rangeOrderText':
    'La fecha final no puede ser anterior a la fecha inicial.',
  'datePicker.rangeStartText':
    'Fecha inicial seleccionada. Elige la fecha final.',
  'datePicker.selectedDayText': 'seleccionado',
  'datePicker.rangeStartDayText': 'inicio del período',
  'datePicker.inRangeDayText': 'en el período',
  'datePicker.rangeEndDayText': 'fin del período',
  'datePicker.unavailableDayText': 'no disponible',
  'datePicker.dialogLabel': 'Elegir fecha',
  'datePicker.previousMonthLabel': 'Mes anterior',
  'datePicker.nextMonthLabel': 'Mes siguiente',
  'datePicker.chooseMonthLabel': 'elegir mes',
  'datePicker.chooseYearLabel': 'elegir año',
  'datePicker.previousYearLabel': 'Año anterior',
  'datePicker.nextYearLabel': 'Año siguiente',
  'datePicker.previousYearsLabel': 'Años anteriores',
  'datePicker.nextYearsLabel': 'Años siguientes',
  'datePicker.startLabel': 'Fecha inicial',
  'datePicker.endLabel': 'Fecha final',
  // The letter each field of the typed format repeats: `dd / mm / aaaa`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'a',
};
