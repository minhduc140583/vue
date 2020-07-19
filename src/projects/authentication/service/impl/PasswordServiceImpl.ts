import config from '../../../../config';
import {PasswordChange} from '../../model/PasswordChange';
import {PasswordReset} from '../../model/PasswordReset';
import {PasswordService} from '../PasswordService';
import {DefaultHttpRequest} from "../../../../core-component/http/DefaultHttpRequest";
import {injectable} from "inversify";

@injectable()
export class PasswordServiceImpl implements PasswordService {
  constructor(private http: DefaultHttpRequest) {
  }

  protected serviceUrl = config.passwordServiceUrl + '/' + 'password';

  changePassword(pass: PasswordChange): Promise<boolean> {
    const url = this.serviceUrl + '/change';
    return this.http.put<boolean>(url, pass);
  }

  forgotPassword(email: string): Promise<boolean> {
    const url = this.serviceUrl + '/forgot';
    return this.http.post<boolean>(url, {email});
  }

  resetPassword(password: PasswordReset): Promise<boolean> {
    const url = this.serviceUrl + '/reset';
    return this.http.post<boolean>(url, password);
  }
}
