<template>
  <div class='view-container central-full'>
    <form id='signinForm' name='signinForm' ref="form" novalidate autocomplete='off'>
      <div>
        <img class='logo' src="@/assets/images/logo.png">
        <h2>{{resource.signin}}</h2>
        <div class='{message: true, alertClass: alertClass }'>
          {{message}}
          <span @click='hideMessage' :hidden='!message || message == ""'></span>
        </div>
        <label>
          {{resource.email}}
          <input type='text' id='username' name='username'
                 v-model='user.username'
                 maxlength='255' required
                 :placeholder='resource.email'>
        </label>
        <label>
          {{resource.password}}
          <input type='password' id='password' name='password'
                 v-model='user.password'
                 maxlength='255' required
                 :placeholder='resource.password'>
        </label>
        <label class='col s12 checkbox-container'>
          <input type='checkbox' id='remember' name='remember' v-model='remember'>
          {{resource.signin_remember_me}}
        </label>
        <button type='submit' id='btnSignin' name='btnSignin' @click='signin($event)'>
          {{resource.button_signin}}
        </button>
        <a id='btnForgotPassword' @click='forgotPassword'>
          {{resource.forgot_password}}
        </a>
        <a id='btnSignup' name='btnSignup' @click='signup($event)'>
          {{resource.button_signup}}
        </a>
      </div>
    </form>
  </div>

</template>c
<script lang="ts">
  import {ui} from 'ui-plus';
  import {SigninInfo} from '../model/SigninInfo';
  import {SigninResult} from '../model/SigninResult';
  import {SigninStatus} from '../model/SigninStatus';
  import {AuthenticationService} from '../service/AuthenticationService';
  import {AuthenticationServiceImpl} from '../service/impl/AuthenticationServiceImpl';
  import {DateUtil} from '../util/DateUtil';
  import Component from 'vue-class-component';
  import {DefaultHttpRequest} from "../../../core-component/http/DefaultHttpRequest";
  import {CookieService} from "../../../core-component/cookie/CookieService";
  import axios from "axios"
  import {httpOptionsService, storage} from "../../../core-component";
  import {DefaultCookieService} from "../../../core-component/cookie/DefaultCookieService";
  import {BaseViewComponent} from "../../../core-component/component/BaseViewComponent"
  import { Base64 } from 'js-base64';
  @Component({
    mixins: [BaseViewComponent]
  })
  export default class SigninComponent extends BaseViewComponent {
    authenticationService: AuthenticationService = new AuthenticationServiceImpl(new DefaultHttpRequest(axios, httpOptionsService));
    cookieService: CookieService = new DefaultCookieService();

    created() {
      this.resource = storage.resource().resource();
      this.supperContructor();
    }

    user: SigninInfo = {
      username: '',
      password: ''
    };

    txtUserName: any;
    txtPassword: any;
    chkRemember: any;
    remember: boolean = false;

    initForm() {
      this.autoInitForm();
      this.txtUserName = ui.getControlFromForm(this.form, 'userName');
      this.txtPassword = ui.getControlFromForm(this.form, 'password');
      this.chkRemember = ui.getControlFromForm(this.form, 'remember');
    }

    initData() {
      const str = this.cookieService.get('data');
      if (str && str.length > 0) {
        try {
          const tmp: any = JSON.parse(Base64.decode(str));
          this.user.username = tmp.username;
          this.user.password = tmp.password;
          this.remember = true;
        } catch (error) {
        }
      }
    }

    forgotPassword() {
      this.navigate('forgot-password');
    }

    signup(event) {
      alert(event)
      event.preventDefault();
      this.navigate('signup');
    }

    signin(event) {
      event.preventDefault();
      this.txtUserName = ui.getControlFromForm(this.form, 'username');
      this.txtPassword = ui.getControlFromForm(this.form, 'password');
      this.chkRemember = ui.getControlFromForm(this.form, 'remember');
      console.log('user', this.txtUserName);
      let valid = true;
      const r = storage.resource();
      if (ui.isEmpty(this.txtUserName)) {
        valid = false;
        const message = r.format('error_required', 'user_name');
        this.showDanger(message);
      } else if (ui.isEmpty(this.txtPassword)) {
        valid = false;
        const message = r.format('error_required', 'password');
        this.showDanger(message);
      }
      if (valid === false) {
        return;
      }


      this.authenticationService.authenticate(this.user).then((result: SigninResult) => {
        const status = result.status;
        debugger;
        // tslint:disable-next-line:triple-equals
        if (status == SigninStatus.Success || status == SigninStatus.SuccessAndReactivated) {
          if (this.chkRemember.checked === true) {
            const data = {
              username: this.txtUserName.value,
              password: this.txtPassword.value
            };
            const expiredDate = DateUtil.addDays(DateUtil.now(), 7);
            debugger;
            this.cookieService.set('data', Base64.encode(JSON.stringify(data)), expiredDate);
          } else {
            this.cookieService.delete('data');
          }
          const expiredDays = DateUtil.dayDiff(result.user.passwordExpiredTime, DateUtil.now());
          if (expiredDays > 0) {
            const message2 = r.value('msg_password_expired_soon', expiredDays);
            storage.toast().showToast(message2);
          }
          // tslint:disable-next-line:triple-equals
          if (status == SigninStatus.Success) {
            storage.setUser(result.user);
            this.navigateToHome();
          } else {
            const message3 = r.value('msg_account_reactivated');
            storage.alert().alertInfo(message3, null, function () {
              storage.setUser(result.user);
              this.navigateToHome();
            });
          }
        } else {
          storage.setUser(null);
          let msg: string;
          switch (status) {
            case SigninStatus.Fail:
              msg = r.value('fail_authentication');
              break;
            case SigninStatus.WrongPassword:
              msg = r.value('fail_wrong_password');
              break;
            case SigninStatus.PasswordExpired:
              msg = r.value('fail_password_expired');
              break;
            case SigninStatus.Suspended:
              msg = r.value('fail_suspended_account');
              break;
            default:
              msg = r.value('fail_authentication');
              break;
          }
          this.showDanger(msg);
        }
      }).catch(this.handleError);
    }
  }
</script>
