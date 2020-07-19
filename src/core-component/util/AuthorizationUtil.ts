import {storage} from '../storage';
import {PermissionUtil} from './PermissionUtil';

export class AuthorizationUtil {
  static isAuthenticated(): boolean {
    const user = storage.getUser();
    if (!user) {
      return false;
    } else {
      return true;
    }
  }
  static isAuthorized(path: string): boolean {
    const user = storage.getUser();
    const privileges = user ? user.privileges : null;
    if (!privileges) {
      return false;
    } else {
      return PermissionUtil.hasPrivilege(privileges, path);
    }
  }
}
