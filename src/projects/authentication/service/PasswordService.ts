import {Observable} from 'rxjs';
import {PasswordChange} from '../model/PasswordChange';
import {PasswordReset} from '../model/PasswordReset';

export interface PasswordService {
  changePassword(pass: PasswordChange): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(pass: PasswordReset): Promise<boolean>;
}
