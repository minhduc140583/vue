import config from '../../../../config';
import {SigninInfo} from '../../model/SigninInfo';
import {SigninResult} from '../../model/SigninResult';
import {AuthenticationService} from '../AuthenticationService';
import {DefaultHttpRequest} from "../../../../core-component/http/DefaultHttpRequest";

// @Injectable()
export class AuthenticationServiceImpl implements AuthenticationService {
  constructor(private http: DefaultHttpRequest) {
  }

  async authenticate(user: SigninInfo): Promise<SigninResult> {
    const url = config.authenticationServiceUrl + '/authentication/authenticate';
    const result = await this.http.post<SigninResult>(url, user);
    if (result.user && result.user.passwordExpiredTime) {
      result.user.passwordExpiredTime = new Date(result.user.passwordExpiredTime);
    }
    return result;
  }

  authenticateByOAuth2(user: SigninInfo): Promise<SigninResult> {
    const url = config.authenticationServiceUrl + '/oauth2/authenticate';
    return this.http.post<SigninResult>(url, user);
  }
}
