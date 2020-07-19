export enum Gender {
  Male = 'M',
  Female = 'F',
  Unknown = 'U',
}

export interface SignupInfo {
  username: string;
  password: string;
  email: string;
  contact: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  gender?: Gender;
  dateOfBirth?: Date;
}
