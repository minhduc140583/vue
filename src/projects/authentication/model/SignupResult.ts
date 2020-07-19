import {ErrorMessage} from 'onecore';

export interface SignupResult {
  success: boolean;
  message: string;
  errors: ErrorMessage[];
}
