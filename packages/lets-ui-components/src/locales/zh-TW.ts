import type { Translation } from '../utils/i18n.js';

/**
 * Traditional Chinese, with the vocabulary of Taiwan (`分頁`, `選填`). Mainland
 * China writes Simplified Chinese: see `zhCN`. Opt-in: nothing registers it
 * until the app does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { zhTW } from '@lets-ui/components/locales/zh-TW';
 *
 * registerTranslation(zhTW);
 * ```
 */
export const zhTW: Translation = {
  $code: 'zh-TW',
  $name: '繁體中文（台灣）',

  // Full-width parentheses, as Chinese text writes them.
  'form.optionalText': '（選填）',
  'form.errorText': '此欄位為必填。',

  'input.showPasswordLabel': '顯示密碼',
  'input.hidePasswordLabel': '隱藏密碼',
  'input.incrementLabel': '增加數值',
  'input.decrementLabel': '減少數值',

  'select.placeholder': '請選擇',

  'radioGroup.errorText': '請選擇一個選項。',

  'otpInput.label': '驗證碼',
  'otpInput.fieldLabel': '第 {index} 個字元，共 {length} 個',

  'link.externalLabel': '（在新分頁中開啟）',

  'datePicker.requiredText': '必填',
  'datePicker.badInputText': '請輸入有效的日期。',
  'datePicker.rangeErrorText': '請輸入允許範圍內的日期。',
  'datePicker.unavailableDateText': '此日期無法選擇。',
  'datePicker.rangeOrderText': '結束日期不能早於開始日期。',
  'datePicker.rangeStartText': '已選取開始日期。請選擇結束日期。',
  'datePicker.selectedDayText': '已選取',
  'datePicker.rangeStartDayText': '範圍開始',
  'datePicker.inRangeDayText': '範圍內',
  'datePicker.rangeEndDayText': '範圍結束',
  'datePicker.unavailableDayText': '無法選擇',
  'datePicker.dialogLabel': '選擇日期',
  'datePicker.previousMonthLabel': '上個月',
  'datePicker.nextMonthLabel': '下個月',
  'datePicker.chooseMonthLabel': '選擇月份',
  'datePicker.chooseYearLabel': '選擇年份',
  'datePicker.previousYearLabel': '上一年',
  'datePicker.nextYearLabel': '下一年',
  'datePicker.previousYearsLabel': '較早的年份',
  'datePicker.nextYearsLabel': '較晚的年份',
  'datePicker.startLabel': '開始日期',
  'datePicker.endLabel': '結束日期',
  // The format repeats each letter, so 年/月/日 would read 年年年年. Forms in
  // Taiwan write the Latin letters instead: `yyyy / mm / dd`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'y',
};
