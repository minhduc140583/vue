import {Locale} from './locale';

export interface ErrorMessage {
  field: string;
  code: string;
  message?: string;
}

export interface UIService {
  getValue(ctrl: any, locale?: Locale, currencyCode?: string): string|number|boolean;
  focusFirstControl(form: any): void;
  focusErrorControl(form: any): void;
  bindToForm(form: any, obj: any): void;
  decodeFromForm(form: any, locale: Locale, currencyCode: string): any;
  setReadOnlyForm(form: any): void;
  getAllDataFields(form: any): any[];

  validateForm(form: any, locale: Locale, focusFirst?: boolean, scroll?: boolean): boolean;
  removeFormError(form: any): void;
  removeErrorMessage(ctrl: any): void;
  showFormError(form: any, errors: ErrorMessage[], focusFirst?: boolean): ErrorMessage[];
  buildErrorMessage(errors: ErrorMessage[]): string;

  initMaterial(form: any): void;
  numberOnFocus(event: any, locale: Locale): void;
  numberOnBlur(event: any, locale: Locale): void;
  percentageOnFocus(event: any, locale: Locale): void;
  currencyOnFocus(event: any, locale: Locale, currencyCode: string): void;
  currencyOnBlur(event: any, locale: Locale, currencyCode: string, includingCurrencySymbol: boolean): void;
  emailOnBlur(event: any): void;
  urlOnBlur(event: any): void;
  phoneOnBlur(event: any): void;
  faxOnBlur(event: any): void;
  requiredOnBlur(event: any): void;
  patternOnBlur(event: any): void;
}
