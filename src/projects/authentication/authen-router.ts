import {RouteConfig} from 'vue-router'
import WelcomeComponent from './component/welcome.component.vue';
import SigninComponent from './component/signin.component.vue';
import BaseAuthenComponent from './component/baseAuthen.component.vue';

const authenRouter: RouteConfig = {
  path: '/',
  component: BaseAuthenComponent,
  children: [
    {path: 'welcome', component: WelcomeComponent, name: 'welcome', meta: { title: 'Welcome',noCache: true}},
    {path: 'signin', component: SigninComponent, name: 'Login', meta: { title: '',noCache: true}},
  ]
}

export default authenRouter
