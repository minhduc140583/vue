import {builder} from 'metadata-x';
import {DataType} from 'onecore';
import {MetaModel} from 'onecore';
import {Model} from 'onecore';

export class MetadataUtil {
  private static _cache: any = {};

  public static getMetaModel(model: Model): MetaModel {
    let meta: MetaModel = this._cache[model.name];
    if (!meta) {
      meta = builder.build(model);
      this._cache[model.name] = meta;
    }
    return meta;
  }

  public static createModel(model: Model): any {
    const obj: any = {};
    const meta = this.getMetaModel(model);
    const attrs = meta.attributes;
    for (const attr of attrs) {
      switch (attr.type) {
        case DataType.Array:
          obj[attr.name] = [];
          break;
        case DataType.Bool:
          obj[attr.name] = false;
          break;
        case DataType.DateTime:
          obj[attr.name] = new Date();
          break;
        case DataType.Integer:
        case DataType.Number:
          obj[attr.name] = 0;
          break;
        case DataType.Object:
          if (attr.typeOf) {
            const object = this.createModel(attr.typeOf);
            obj[attr.name] = object;
            break;
          }
          obj[attr.name] = {};
          break;
        case DataType.ObjectId:
          obj[attr.name] = null;
          break;
        case DataType.String:
          obj[attr.name] = '';
          break;
        default:
          obj[attr.name] = '';
          break;
      }
      // attr.type === DataType.Array ? obj[attr.name] = [] : obj[attr.name] = '';
    }
    return obj;
  }
}
