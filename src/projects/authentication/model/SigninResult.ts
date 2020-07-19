import {UserAccount} from '../../../core-component';
import {SigninStatus} from './SigninStatus';

export interface SigninResult {
  user: UserAccount;
  status: SigninStatus;
  message: string;
}
