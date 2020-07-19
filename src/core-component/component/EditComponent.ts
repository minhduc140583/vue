import {clone} from 'reflectx'
import {MetadataUtil} from '../util/MetadataUtil';
import {UIService} from '../ui';
import {storage} from '../storage';
import {ReflectionUtil} from '../util/ReflectionUtil';
import {formatter} from 'model-formatter';
import {MetaModel} from 'onecore';
import {BaseComponent} from './BaseComponent';
import {buildId} from './buildId';
import {Mixin} from "vue-mixin-decorator";
import { ResourceService } from '../resource';

export interface ErrorMessage {
  field: string;
  code: string;
  message?: string;
}
export enum StatusCode {
  DataNotFound = 0,
  Success = 1,
  Error = 2,
  DuplicateKeyError = 3,
  DataVersionError = 4,
  DataCorruptError = 5,
  ExternalError = 6
}
export interface ResultInfo<T> {
  value: T;
  status: StatusCode;
  message: string;
  errors: ErrorMessage[];
}

export interface Metadata {
  name: string;
  attributes: any;
  source?: string;
}

export interface ViewService<T, ID> {
  metadata(): Metadata;
  ids(): string[];
  all(): Promise<T[]>;
  load(id: ID): Promise<T>;
}

export interface GenericService<T, ID, R> extends ViewService<T, ID> {
  patch(obj: T, body: any): Promise<R>;
  insert(obj: T): Promise<R>;
  update(obj: T): Promise<R>;
  delete?(id: ID): Promise<number>;
}
@Mixin
export class EditComponent<T, ID> extends BaseComponent
{
  protected service: GenericService<T, ID, ResultInfo<T>> | undefined;
  protected permissionBuilder = null
  public Constructor( service: GenericService<T, ID, ResultInfo<T>>, permissionBuilder?, patchable?: boolean) {
    this.uiS3 = storage.ui();
    this.service = service;
    this.permissionBuilder = permissionBuilder;
    this.patchable = patchable;
    const id = this.getParam(this.$router, 'id');
    this.setId = this.setId.bind(this);
    this.alertOnError = this.alertOnError.bind(this);
    this.formatModel = this.formatModel.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.jsonModel = this.jsonModel.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.metadata = service.metadata();
    this.metamodel = MetadataUtil.getMetaModel(this.metadata);
    if (id) {
      this.setId(id);
    }

    const r = storage.resource();
    this.insertSuccessMsg = r.value('msg_save_success');
    this.updateSuccessMsg = r.value('msg_save_success');
    this.createModel = this.createModel.bind(this);
    this.setNewMode = this.setNewMode.bind(this);
    this.isNewMode = this.isNewMode.bind(this);
    this.validate = this.validate.bind(this);
    this.save = this.save.bind(this);
    this.setForm = this.setForm.bind(this);
    this.getForm = this.getForm.bind(this);

    if (patchable !== null && patchable !== undefined) {
      // @ts-ignore
      this.patchable = patchable;
    }
    const metadata = service.metadata();
    if (metadata && this.patchable !== false && this.patchable !== true) {
      setTimeout(() => {
        const meta = MetadataUtil.getMetaModel(metadata);
        if (meta.objectFields && meta.arrayFields && meta.objectFields.length > 0 && meta.arrayFields.length > 0) {
          // @ts-ignore
          this.patchable = false;
        } else {
          // @ts-ignore
          this.patchable = true;
        }
      }, 1000);
    }
  }
  private _id: any = null;
  protected metadata: Metadata | undefined;
  protected metamodel: MetaModel | undefined;
  protected viewable = true;

  private uiS3: UIService | undefined;
  newMode = false;
  setBack = false;
  patchable = null;
  protected orginalModel = null;

  addable: boolean | false | undefined;
  editable: boolean | false | undefined;
  // @ts-ignore
  insertSuccessMsg: string | '' ;
  // @ts-ignore
  updateSuccessMsg: string | '';

  initPermission() {
    if (this.permissionBuilder) {
      // @ts-ignore
      const permission = this.permissionBuilder.buildPermission(storage.getUser(), this._url);
      this.viewable = permission.viewable;
      this.addable = permission.addable;
      this.editable = permission.editable;
    } else {
      this.viewable = true;
      this.addable = true;
      this.editable = true;
    }
  }

  setId(id: any) {
    this._id = id;
  }

  protected getModelName() {
    return (this.metadata ? this.metadata.name : 'model');
  }

  getId(): any {
    console.log('id:', this._id);
    if (this._id) {
      return this._id;
    } else {
      if (!this.service.metadata()) {
        return null;
      } else {
        // return IdBuilder.buildIdByMetadata(this.service0.metadata(), this.route);
        return buildId(this.service.ids(), this.$router);
      }
    }
  }

  async loadData() {
    const id = this.getId();
    if (id && id !== '') {
      if (this.viewable !== true) {
        const r = storage.resource();
        const title = r.value('error_permission');
        const msg = r.value('error_permission_view');
        storage.alert().alertError(msg, title);
        const user = storage.getUser();
        if (user) {
          this.navigateToHome();
        } else {
          this.requireAuthentication();
        }
        return;
      } else {
        try {
          const obj = await this.service.load(id);
          if (!obj) {
            this.handleNotFound(this.getForm());
          } else {
            this.setNewMode(false);
            this.formatModel(obj);
            this.orginalModel = clone(obj);
            this.showModel(obj);
          }
        } catch (err) {
          if (err && err.status === 404) {
            this.handleNotFound(this.getForm());
          } else {
            this.handleError(err);
          }
        }
      }
    } else {
      const obj = this.createModel();
      this.setNewMode(true);
      this.formatModel(obj);
      this.orginalModel = null;
      this.showModel(obj);
    }
  }
  protected handleNotFound(form: any) {
    const r = storage.resource();
    const title = r.value('error');
    const msg = r.value('error_not_found');
    this.alertOnError(title, msg, form);
  }
  protected formatModel(obj: T) {
    // @ts-ignore
    formatter.format(obj, this.metamodel, this.getLocale(), this.getCurrencyCode(), this.includingCurrencySymbol());
  }

  protected showModel(model: T) {
    // @ts-ignore
    this[this.getModelName()] = model;
  }

  getModel(): T {
    const name = this.getModelName();
    // @ts-ignore
    const model = this[name];
    const obj = clone(model);
    this.jsonModel(obj);
    return obj;
  }

  protected jsonModel(obj: T) {
    // @ts-ignore
    formatter.json(obj, this.metamodel, this.getLocale(), this.getCurrencyCode());
  }

  setNewMode(_newMode: boolean) {
    this.newMode = _newMode;
  }
  isNewMode(): boolean {
    return this.newMode;
  }

  protected setForm(form: any) {
    this.form = form;
  }

  protected getForm(): any {
    return this.form;
  }

  protected createModel(): T {
    // @ts-ignore
    const metadata = this.service.metadata();
    if (metadata) {
      const obj = MetadataUtil.createModel(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  newOnClick(event?: any) {
    const obj = this.createModel();
    this.setNewMode(true);
    this.orginalModel = null;
    this.formatModel(obj);
    this.showModel(obj);
    const u = this.uiS3;
    setTimeout(() => {
      if (event) {
        const form = event.target.form;
        // @ts-ignore
        u.removeFormError(form);
      } else {
        const form = this.getForm();
        // @ts-ignore
        u.removeFormError(form);
      }
    }, 100);
  }

  saveOnClick(event?) {
    if (event) {
      event.preventDefault()
      this.setForm(event.target.form);
    }
    const r = storage.resource();
    if (this.isNewMode() === true && this.addable !== true) {
      const title = r.value('error_permission');
      const msg = r.value('error_permission_add');
      storage.alert().alertError(msg, title);
      const user = storage.getUser();
      if (user) {
        this.navigateToHome();
      } else {
        this.requireAuthentication();
      }
      return;
    } else if (this.isNewMode() === false && this.editable !== true) {
      const title = r.value('error_permission');
      const msg = r.value('error_permission_edit');
      storage.alert().alertError(msg, title);
      const user = storage.getUser();
      if (user) {
        this.navigateToHome();
      } else {
        this.requireAuthentication();
      }
      return;
    } else {
      if (this.running === true) {
        return;
      }
      const com = this;
      const obj = com.getModel();
      const diff = ReflectionUtil.diff(this.orginalModel, obj);
      const keys = Object.keys(diff);
      if (this.isNewMode() === false && keys.length === 0) {
        storage.toast().showToast(r.value('msg_no_change'));
      } else {
        com.validate(obj, obj2 => {
          const title = r.value('confirm');
          const confirmMsg = r.value('msg_confirm_save');
          const strYes = r.value('button_yes');
          const strNo = r.value('button_no');
          storage.alert().confirm(confirmMsg, title, () => {
            com.save(obj2, diff);
          }, strNo, strYes);
        });
      }
    }
  }

  validate(obj: T, callback: (obj: T, obj2?: any) => void) {
    // @ts-ignore
    const valid = this.uiS3.validateForm(this.getForm(), this.getLocale());
    if (valid) {
      callback(obj);
    }
  }

  // @ts-ignore
  async save(obj, diff?: any) {
    this.running = true;
    storage.loading().showLoading();
    const com = this;
    if (this.isNewMode() === false) {
      if (this.patchable === true) {
        const body = this.makePatchBodyFromDiff(diff);
        // @ts-ignore
        const result = await this.service.patch(obj, body);
        com.afterUpdate(result);
      } else {
        // @ts-ignore
        const result = await this.service.update(obj);
        com.afterUpdate(result);
      }
    } else {
      // @ts-ignore
      const result = await this.service.insert(obj);
      com.afterInsert(result);
    }
  }

  protected makePatchBodyFromDiff(diff: any): object {
    const body = {};
    for (const item of diff) {
      Object.assign(body, { [item]: diff[item][0] });
    }
    return body;
  }

  protected succeed(result: ResultInfo<T>) {
    const model = result.value;
    this.setNewMode(false);
    if (this.setBack === true) {
      this.formatModel(model);
      this.showModel(model);
    } else {
      const obj = this.getModel();
      const obj3: any = obj;
      if (obj3.rowVersion != null) {
        obj3.rowVersion = obj3.rowVersion + 1;
      } else {
        obj3.rowVersion = 1;
      }
    }
  }
  protected fail(result: ResultInfo<T>) {
    const errors = result.errors;
    const form = this.getForm();
    const u = this.uiS3;
    // @ts-ignore
    const unmappedErrors = u.showFormError(form, errors);
    // @ts-ignore
    u.focusErrorControl(form);
    if (!result.message) {
      if (errors && errors.length === 1) {
        // @ts-ignore
        result.message = errors[0].message;
      } else {
        // @ts-ignore
        result.message = u.buildErrorMessage(unmappedErrors);
      }
    }
    storage.alert().alertError(result.message);
  }
  protected afterInsert(result: ResultInfo<T>) {
    this.running = false;
    storage.loading().hideLoading();
    if (result.status === StatusCode.Success) {
      this.succeed(result);
      storage.toast().showToast(this.insertSuccessMsg);
    } else if (result.status === StatusCode.Error) {
      this.fail(result);
    } else if (result.status === StatusCode.DuplicateKeyError) {
      this.handleDuplicatedIdError(result);
    } else {
      const r = storage.resource();
      const msg = buildMessageFromStatusCode(result.status, r);
      if (msg && msg.length > 0) {
        this.showDanger(result.message);
      } else {
        result.status = StatusCode.Success;
        this.succeed(result);
        storage.toast().showToast(this.insertSuccessMsg);
        this.back();
      }
    }
  }
  protected afterUpdate(result: ResultInfo<T>) {
    this.running = false;
    storage.loading().hideLoading();
    if (result.status === StatusCode.Success) {
      this.succeed(result);
      storage.toast().showToast(this.updateSuccessMsg);
    } else if (result.status === StatusCode.Error) {
      this.fail(result);
    } else {
      const r = storage.resource();
      const msg = buildMessageFromStatusCode(result.status, r);
      if (msg && msg.length > 0) {
        this.showDanger(result.message);
      } else {
        result.status = StatusCode.Success;
        this.succeed(result);
        storage.toast().showToast(this.updateSuccessMsg);
        this.back();
      }
    }
  }
  protected handleDuplicatedIdError(result: ResultInfo<T>) {
    const r = storage.resource();
    const msg = r.value('error_duplicated_id');
    result.message = msg;
    this.showDanger(msg);
  }
  confirm(msg: string, yescallback: (() => void) | undefined, nocallback: (() => void) | undefined) {
    const r = storage.resource();
    const title = r.value('confirm');
    const strLeft = r.value('button_no');
    const strRight = r.value('button_yes');
    storage.alert().confirm(msg, title, yescallback, strLeft, strRight, nocallback);
  }
}

export function buildMessageFromStatusCode(status: StatusCode, r: ResourceService): string {
  if (status === StatusCode.DuplicateKeyError) {
    return r.value('error_duplicated_id');
  } else if (status === StatusCode.DataVersionError) { // Below message for update only, not for add
    return r.value('error_data_version');
  } else if (status === StatusCode.DataCorruptError) {
    return r.value('error_data_corrupt');
  } else {
    return '';
  }
}