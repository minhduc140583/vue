import {Locale} from '../locale';
import {storage} from '../storage';
import {UIService} from '../ui';
import {Vue} from "vue-property-decorator";
import {Component} from "vue-property-decorator";

@Component
export class BaseViewComponent extends Vue {

  constructor() {
    super();
    this.uiS0 = storage.ui();
    this.resource = storage.resource().resource();
    // this._url = this.$router.currentRoute.path;
    this.initDateFormat = this.initDateFormat.bind(this);
    this.getDateFormat = this.getDateFormat.bind(this);
    this.getLanguage = this.getLanguage.bind(this);
    this.getLocale = this.getLocale.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.formatCurrency = this.formatCurrency.bind(this);
    this.handleError = this.handleError.bind(this);
    this.alertOnError = this.alertOnError.bind(this);
    this.getMinutesBetween = this.getMinutesBetween.bind(this);
    this.includingCurrencySymbol = this.includingCurrencySymbol.bind(this);
    this.getModelName = this.getModelName.bind(this);
    this.initDateFormat();
  }

  supperContructor() {
    return new BaseViewComponent();
  }

  private uiS0: UIService;
  private _includingCurrencySymbol = false;
  resource: any;
  // @ts-ignore
  dateFormat: string = null;
  // @ts-ignore
  dateTimeFormat: string = null;
  // @ts-ignore
  running: boolean;
  protected _url: string;
  protected form: any;
  message = '';
  alertClass = '';

  public mounted() {
    try {
      this.initForm();
      this.initPermission();
      this.initData();
    } catch (err) {
      console.log('ngOnInit err', err);
      this.handleError(err);
    }
  }

  protected getModelName(): string {
    return 'state';
  }

  initForm() {
    this.autoInitForm();
  }

  protected autoInitForm() {
    // @ts-ignore
    const form: Element = this.$refs.form;
       if (form) {
         this.form = form;
         if (form.getAttribute('date-format') == null) {
           let df = this.dateFormat;
           if (df == null) {
             df = this.getDateFormat();
           }
           this.form.setAttribute('date-format', df);
         }
         const u = this.uiS0;
         setTimeout(() => {
           u.initMaterial(form);
           u.focusFirstControl(form);
         }, 100);
       }
  }

  protected initPermission() {
    console.log('initPermission in base view')
  }

  protected initData() {
    try {
      this.loadData();
    } catch (err) {
      this.handleError(err);
    }
  }

  loadData() {
  }

  refresh() {
    this.loadData();
  }

  getParam(route: any, name: any): any {
    if (!route || !name) {
      return null;
    }
    const param: any = route.history.current.params;
    return param[name];
  }

  protected includingCurrencySymbol(): boolean {
    return this._includingCurrencySymbol;
  }

  protected initDateFormat() {
    if (this.dateFormat == null) {
      const df = this.getDateFormat();
      this.dateFormat = df;
      this.dateTimeFormat = df.toUpperCase() + ' hh:mm:ss';
    }
  }

  protected getDateFormat(): string {
    const user = storage.getUser();
    const localeService = storage.locale();
    if (user) {
      if (user.dateFormat) {
        const x = user.dateFormat;
        return x.toUpperCase();
      } else if (user.language) {
        const locale = localeService.getLocaleOrDefault(user.language);
        const x = locale.dateFormat;
        return x.toUpperCase();
      } else {
        const language = storage.getLanguage();
        const locale = localeService.getLocaleOrDefault(language);
        const x = locale.dateFormat;
        return x.toUpperCase();
      }
    } else {
      const language = storage.getLanguage();
      const locale = localeService.getLocaleOrDefault(language);
      const x = locale.dateFormat;
      return x.toUpperCase();
    }
  }

  protected getCurrencyCode(): string {
    return (this.form ? this.form.getAttribute('currency-code') : null);
  }

  protected getLanguage(): string {
    const user = storage.getUser();
    if (user && user.language) {
      return user.language;
    } else {
      return storage.getLanguage();
    }
  }

  protected getLocale(): Locale {
    const localeService = storage.locale();
    return localeService.getLocaleOrDefault(this.getLanguage());
  }

  /*
    protected formatFax = (value) => {
      return FormatUtil.formatFax(value);
    }

    protected formatPhone = (value) => {
      return FormatUtil.formatPhone(value);
    }
  */
  protected formatCurrency(currency: number, currencyCode?: string, locale?: Locale) {
    if (!currencyCode) {
      currencyCode = this.getCurrencyCode();
    }
    if (!locale) {
      locale = this.getLocale();
    }
    const localeService = storage.locale();
    return localeService.formatCurrency(currency, currencyCode, this.getLocale());
  }

  protected back(e?) {
    if (e)
      e.preventDefault();
    window.history.back();
  }

  protected navigate(stateTo: string, params = null) {
    const objParams = params != null ? '/'.concat(params.join('/')) : '';
    console.log(params)
    console.log(objParams)
    this.$router.push({path: stateTo.concat(objParams)});
  }

  protected requireAuthentication() {
    this.navigate('signin');
  }

  protected navigateToHome() {
    this.navigate('home');
  }

  alertError(msg: string) {
    const resource = this.resource;
    storage.alert().alertError(msg, resource.error);
  }

  showMessage(msg: string) {
    this.alertClass = 'alert alert-success';
    this.message = msg;
  }

  showWarning(msg: string) {
    this.alertClass = 'alert alert-warning';
    this.message = msg;
  }

  showInfo(msg: string) {
    this.alertClass = 'alert alert-info';
    this.message = msg;
  }

  showDanger(msg: string) {
    this.alertClass = 'alert alert-danger';
    this.message = msg;
  }

  hideMessage() {
    this.alertClass = '';
    this.message = '';
  }

  handleError(response: any) {
    console.log('Error in func handle error', response);
    this.running = false;
    storage.loading().hideLoading();

    const r = storage.resource();
    let msg = r.value('error_unauthorized'); // ResourceManager.getString('error_network');

    let minutes = -1;
    const status = response.status;
    if (storage.lastSuccessTime != null) {
      const now = new Date();
      // @ts-ignore
      minutes = this.getMinutesBetween(now, storage.lastSuccessTime);
    }
    if (status === 401) {
      msg = r.value('error_unauthorized');
      minutes = parseFloat(minutes.toFixed(0));
      if (minutes > 0) {
        msg = r.format(r.value('error_timeout'), minutes);
      }
      // @ts-ignore
      storage.signinMessage = msg;
      this.requireAuthentication();
      return;
    } else if (status === 403) {
      msg = r.value('error_forbidden');
      const f = this.form;
      if (f) {
        storage.ui().setReadOnlyForm(f);
      }
    } else if (status === 404) {
      msg = r.value('error_not_found');
    } else if (status === 500) {
      msg = r.value('error_internal');
    } else if (status === 503) {
      msg = r.value('error_service_unavailable');
    }
    const title = r.value('error');
    //TODO phu
    alert(msg + title)
    // storage.alert().alertError(msg, title);
  }

  private getMinutesBetween(date1: Date, date2: Date): number {
    if (typeof (date1) !== typeof (date2)) {
      return -1;
    }
    return Math.abs(date2.getTime() - date1.getTime()) / 60000;
  }

  protected alertOnError(title: string, msg: string, form: any) {
    this.running = false;
    storage.loading().hideLoading();
    if (form) {
      storage.ui().setReadOnlyForm(form);
    }
    storage.alert().alertError(msg, title);
  }
}
