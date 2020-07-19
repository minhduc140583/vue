import {setValue} from "reflectx";
import Component from "vue-class-component";
import {storage} from "../storage";
import {UIService} from "../ui";
import {Locale} from "../locale";
import {BaseViewComponent} from './BaseViewComponent';
@Component
export class BaseComponent extends BaseViewComponent {
  constructor() {
    super();
    this.uiS1 = storage.ui();
    this.currencyOnBlur = this.currencyOnBlur.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);
  }
  private uiS1: UIService;

  protected updateState(event: any) {
    this.updateStateFlat(event, this.getLocale());
  }

  protected updateStateFlat(e: any, locale?: Locale) {
    const ctrl = e.currentTarget;
    let modelName = this.getModelName();
    if (!modelName) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeErrorMessage(ctrl);
    }

    // @ts-ignore
    const ex = this[modelName];
    const dataField = ctrl.getAttribute('data-field');
    const field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox') {
      setValue(ex, field, this.uiS1.getValue(ctrl));
    } else {
      const v = this.uiS1.getValue(ctrl, locale);
      // tslint:disable-next-line:triple-equals
      if (ctrl.value != v) {
        setValue(ex, field, v);
      }
    }
  }

  protected numberOnFocus(event: any) {
    this.uiS1.numberOnFocus(event, this.getLocale());
  }
  protected numberOnBlur(event: any) {
    this.uiS1.numberOnBlur(event, this.getLocale());
  }
  protected currencyOnFocus(event: any) {
    this.uiS1.currencyOnFocus(event, this.getLocale(), this.getCurrencyCode());
  }
  protected currencyOnBlur(event: any) {
    this.uiS1.currencyOnBlur(event, this.getLocale(), this.getCurrencyCode(), this.includingCurrencySymbol());
  }
  protected emailOnBlur = (event: any) => {
    this.uiS1.emailOnBlur(event);
  }
  protected urlOnBlur = (event: any) => {
    this.uiS1.urlOnBlur(event);
  }
  protected phoneOnBlur = (event: any) => {
    this.uiS1.phoneOnBlur(event);
  }
  protected faxOnBlur = (event: any) => {
    this.uiS1.faxOnBlur(event);
  }
  protected requiredOnBlur(event: any) {
    this.uiS1.requiredOnBlur(event);
  }
  protected patternOnBlur(event: any) {
    this.uiS1.patternOnBlur(event);
  }
}
