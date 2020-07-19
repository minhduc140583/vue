export enum SigninStatus {
  Success = 0,
  SuccessAndReactivated = 1,
  Fail = 2,
  WrongPassword = 3,
  AccessTimeLocked = 4,
  PasswordExpired = 5,
  Locked = 6,
  Suspended = 7,
  Disabled = 8,
  SystemError = 9,
}
