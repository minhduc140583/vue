import {storage} from '../storage';
import {BaseViewComponent} from './BaseViewComponent';
import {buildId} from './buildId';

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

export class ViewComponent<T, ID> extends BaseViewComponent {
  private service0: ViewService<T, ID>;

  constructor() {
    super();
  }

  Constructor (service0: ViewService<T, ID>) {
    const id = this.getParam(this.$route, 'id')['id'];
    this.setId = this.setId.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.metadata = service0.metadata();
    if (id) {
      this.setId(id);
    }
  }

  private _id: any = null;
  protected metadata: Metadata;

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
      if (!this.service0.metadata()) {
        return null;
      } else {
        return buildId(this.service0.ids(), this.$route);
      }
    }
  }

  async loadData() {
    const id = this.getId();
    if (id != null && id !== '') {
      this.running = true;
      storage.loading().showLoading();
      const obj = await this.service0.load(id);
      this.showModel(obj);
      this.running = false;
      storage.loading().hideLoading();
    }
  }

  protected showModel(model: T) {
    this[this.getModelName()] = model;
  }

  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
}
