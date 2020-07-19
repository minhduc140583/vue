import {SourceType} from './SourceType';

export interface OAuth2Info {
  signInType: SourceType;

  code: string;
  redirectUri: string;
  invitationMail?: string;
}
