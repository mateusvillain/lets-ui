import type { Translation } from '../utils/i18n.js';

/**
 * Simplified Chinese, as written in mainland China. Taiwan and Hong Kong write
 * Traditional Chinese: see `zhTW`. Opt-in: nothing registers it until the app
 * does.
 *
 * ```js
 * import { registerTranslation } from '@lets-ui/components';
 * import { zhCN } from '@lets-ui/components/locales/zh-CN';
 *
 * registerTranslation(zhCN);
 * ```
 */
export const zhCN: Translation = {
  $code: 'zh-CN',
  $name: '简体中文',
  $dir: 'ltr',

  // Full-width parentheses, as Chinese text writes them.
  'form.optionalText': '（可选）',
  'form.errorText': '此字段为必填项。',

  'input.showPasswordLabel': '显示密码',
  'input.hidePasswordLabel': '隐藏密码',
  'input.incrementLabel': '增加数值',
  'input.decrementLabel': '减少数值',

  'select.placeholder': '请选择',

  'radioGroup.errorText': '请选择一个选项。',

  'otpInput.label': '验证码',
  'otpInput.fieldLabel': '第 {index} 个字符，共 {length} 个',

  'link.externalLabel': '（在新标签页中打开）',

  'datePicker.requiredText': '必填',
  'datePicker.badInputText': '请输入有效的日期。',
  'datePicker.rangeErrorText': '请输入允许范围内的日期。',
  'datePicker.unavailableDateText': '此日期不可用。',
  'datePicker.rangeOrderText': '结束日期不能早于开始日期。',
  'datePicker.rangeStartText': '已选择开始日期。请选择结束日期。',
  'datePicker.selectedDayText': '已选择',
  'datePicker.rangeStartDayText': '范围开始',
  'datePicker.inRangeDayText': '范围内',
  'datePicker.rangeEndDayText': '范围结束',
  'datePicker.unavailableDayText': '不可用',
  'datePicker.dialogLabel': '选择日期',
  'datePicker.previousMonthLabel': '上个月',
  'datePicker.nextMonthLabel': '下个月',
  'datePicker.chooseMonthLabel': '选择月份',
  'datePicker.chooseYearLabel': '选择年份',
  'datePicker.previousYearLabel': '上一年',
  'datePicker.nextYearLabel': '下一年',
  'datePicker.previousYearsLabel': '更早的年份',
  'datePicker.nextYearsLabel': '更晚的年份',
  'datePicker.startLabel': '开始日期',
  'datePicker.endLabel': '结束日期',
  // The format repeats each letter, so 年/月/日 would read 年年年年. Chinese
  // forms write the Latin letters instead: `yyyy / mm / dd`.
  'datePicker.dayLetter': 'd',
  'datePicker.monthLetter': 'm',
  'datePicker.yearLetter': 'y',
};
