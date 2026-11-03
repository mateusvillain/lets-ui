import type { Translation } from '../utils/i18n.js';

/**
 * Japanese. Opt-in: nothing registers it until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { ja } from '@lets-ui/components/locales/ja';
 *
 * registerTranslation(ja);
 * ```
 */
export const ja: Translation = {
  $code: 'ja',
  $name: '日本語',
  $dir: 'ltr',

  // Full-width parentheses, as Japanese text writes them.
  'form.optionalText': '（任意）',
  'form.errorText': 'この項目は必須です。',

  'input.showPasswordLabel': 'パスワードを表示',
  'input.hidePasswordLabel': 'パスワードを非表示',
  'input.incrementLabel': '値を増やす',
  'input.decrementLabel': '値を減らす',

  'select.placeholder': '選択してください',

  'radioGroup.errorText': 'いずれかを選択してください。',

  'otpInput.label': '認証コード',
  'otpInput.fieldLabel': '{length}文字中{index}文字目',

  'link.externalLabel': '（新しいタブで開きます）',

  'datePicker.requiredText': '必須',
  'datePicker.badInputText': '有効な日付を入力してください。',
  'datePicker.rangeErrorText': '許可された期間内の日付を入力してください。',
  'datePicker.unavailableDateText': 'この日付は選択できません。',
  'datePicker.rangeOrderText': '終了日は開始日より後の日付にしてください。',
  'datePicker.rangeStartText':
    '開始日を選択しました。終了日を選択してください。',
  'datePicker.selectedDayText': '選択済み',
  'datePicker.rangeStartDayText': '期間の開始',
  'datePicker.inRangeDayText': '期間内',
  'datePicker.rangeEndDayText': '期間の終了',
  'datePicker.unavailableDayText': '選択不可',
  'datePicker.dialogLabel': '日付を選択',
  'datePicker.previousMonthLabel': '前の月',
  'datePicker.nextMonthLabel': '次の月',
  'datePicker.chooseMonthLabel': '月を選択',
  'datePicker.chooseYearLabel': '年を選択',
  'datePicker.previousYearLabel': '前の年',
  'datePicker.nextYearLabel': '次の年',
  'datePicker.previousYearsLabel': '前の年の一覧',
  'datePicker.nextYearsLabel': '次の年の一覧',
  'datePicker.startLabel': '開始日',
  'datePicker.endLabel': '終了日',
  // The format repeats each letter, so 年/月/日 would read 年年年年. Japanese
  // forms write the Latin letters instead: `yyyy / mm / dd`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'y',
};
