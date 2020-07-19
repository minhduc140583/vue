// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// @ts-ignore
import App from './App'
import router from './router'
import { store } from './store'
import './assets/css/styles.scss'
import './assets/fonts/font-awesome-4.7.0/css/font-awesome.min.css'
import './assets/fonts/material-icon/css/material-icons.css'
import './assets/fonts/Roboto/font.css'
Vue.config.productionTip = false;
import Paginate from 'vuejs-paginate'

Vue.component('paginate', Paginate)
/* eslint-disable no-new */
new Vue({
  el: '#root',
  store,
  router,
  components: { App },
  template: '<App/>'
})
