import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import TodoList from '@/components/TodoList.vue'
import NormalCounter from 'components/NormalCounter.vue'
import DefaultWapper from '../container/DefaultWapper.vue'
import setupRouter from '../projects/setup/setup-router';
import authenRouter from "../projects/authentication/authen-router";

Vue.use(Router)

export default new Router({
  mode: 'history', // Add this to your router
  routes: [
    authenRouter,
    setupRouter,
    {
      path: '/',
      name: '',
      component: DefaultWapper,
    },
    {
      path: '/todo_list',
      name: 'TodoList',
      component: TodoList
    },
    {
      path: '/normal_counter',
      name: 'NormalCounter',
      component: NormalCounter
    }
  ]
})
