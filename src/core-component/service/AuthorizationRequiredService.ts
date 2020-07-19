import {storage} from '../storage';

// @Injectable()
export class AuthorizationRequiredService{
  constructor() {

  }

  canActivate(): boolean {
    const user = storage.getUser();
    if (!user) {
      return false;
    } else {
      return true;
    }
  }

  checkSignin(url: string): boolean {
    // this.router.navigate('/signin');
    return false;
  }
}
