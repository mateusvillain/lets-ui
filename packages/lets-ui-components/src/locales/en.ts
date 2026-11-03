/**
 * The built-in English dictionary: the text every component falls back to when
 * neither an attribute nor a registered translation names it.
 *
 * It is also the source of the term keys. A translation is checked against
 * this object, so a key added here is a key every complete translation must
 * carry.
 *
 * Keys shared by several components (`form.*`) hold text that is the same in
 * each of them; the rest are namespaced by the component that reads them.
 * Placeholders such as `{index}` are filled in by the component.
 */
export const en = {
  $code: 'en',
  $name: 'English',

  'form.optionalText': '(optional)',
  'form.errorText': 'This field is required.',

  'input.showPasswordLabel': 'Show password',
  'input.hidePasswordLabel': 'Hide password',
  'input.incrementLabel': 'Increase value',
  'input.decrementLabel': 'Decrease value',

  'select.placeholder': 'Select an option',

  'radioGroup.errorText': 'Select an option.',

  'otpInput.label': 'Verification code',
  'otpInput.fieldLabel': 'Character {index} of {length}',

  'link.externalLabel': '(opens in a new tab)',

  'datePicker.requiredText': 'Required',
  'datePicker.badInputText': 'Enter a valid date.',
  'datePicker.rangeErrorText': 'Enter a date within the allowed period.',
  'datePicker.unavailableDateText': 'This date is unavailable.',
  'datePicker.rangeOrderText': "The end date can't be before the start date.",
  'datePicker.rangeStartText': 'Start date selected. Choose the end date.',
  'datePicker.selectedDayText': 'selected',
  'datePicker.rangeStartDayText': 'start of period',
  'datePicker.inRangeDayText': 'in period',
  'datePicker.rangeEndDayText': 'end of period',
  'datePicker.unavailableDayText': 'unavailable',
  'datePicker.dialogLabel': 'Choose date',
  'datePicker.previousMonthLabel': 'Previous month',
  'datePicker.nextMonthLabel': 'Next month',
  'datePicker.chooseMonthLabel': 'choose month',
  'datePicker.chooseYearLabel': 'choose year',
  'datePicker.previousYearLabel': 'Previous year',
  'datePicker.nextYearLabel': 'Next year',
  'datePicker.previousYearsLabel': 'Previous years',
  'datePicker.nextYearsLabel': 'Next years',
  'datePicker.startLabel': 'Start date',
  'datePicker.endLabel': 'End date',
  // The letter each field of the typed format repeats: `dd / mm / yyyy`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'y',
};
