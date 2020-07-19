<template>
  <div :class="getTopClass">
    <div class="top-banner">
      <div class="logo-banner-wrapper">
        <img src="@/assets/images/top-banner-logo.png" alt="Logo of The Company"/>
        <img src="@/assets/images/logo-title.png" class="banner-logo-title" alt="Logo of The Company"/>
      </div>
    </div>
    <div class="menu sidebar">
      <nav>
        <side-bar v-bind:features="features"
                  @toggle-sidebar="setToggleSidebar"
                  @toggle-menu="setToggleMenu"
                  v-bind:isToggleSidebar="toggleSidebar" v-bind:isToggleMenu="toggleSidebar"/>
      </nav>
    </div>
    <div class="page-container">
      <div class="page-header">
        <form>
          <div class="search-group">
            <section>
              <button type="button" class="toggle-menu"></button>
              <button type="button" class="toggle-search"></button>
              <button type="button" class="close-search"></button>
            </section>
            <div class="logo-wrapper">
              <img class="logo" src="@/assets/images/logo.png" alt="Logo of The Company"/>
            </div>
            <label class='search-input'>
              <PageSizeSelect :page-size="pageSize" :page-sizes="pageSizes"
                              v-bind:on-page-size-changed="pageSizeChanged"/>
              <input type='text' id='keyword' name='keyword' v-model="keyword" :maxLength="1000"
                     :placeholder="resource.keyword"/>
              <button type='button' :hidden="!keyword || keyword.length === 0" class='btn-remove-text'
                      @click="clearKeyworkOnClick"></button>
              <button type='submit' class='btn-search' @click="searchOnClick"/>
            </label>
            <section>
              <div class='dropdown-menu-profile'>
                <img v-if="user && user.imageURL" id='btnProfile' src="@/assets/images/male.png"
                     @click="toggleProfile"/>
                <i v-if="(!user || !user.imageURL)" class='material-icons' @click="toggleProfile">person</i>
                <ul id='dropdown-basic' :class="getClassProfile + ' dropdown-content-profile'"
                >
                  <li>
                    <label>User Name: {{user && user['userName']}} </label>
                    <br/>
                    <!--                            <label>Role : {userType === 'M' ? 'Maker' : 'Checker'} </label>-->
                  </li>
                  <hr style="margin: 0"/>
                  <li><a class='dropdown-item-profile'
                         @click="signout">{{resource.button_signout}}</a></li>
                </ul>
              </div>
            </section>
          </div>
        </form>
      </div>
      <div class="page-body">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from "vue-property-decorator";
  import SideBar from "./SideBar/index.vue";
  import PageSizeSelect from "../control/PageSizeSelect.vue"
  import Resources from "../resource/Resources"
  import axios from 'axios';
  import {DefaultHttpRequest} from "../core-component/http/DefaultHttpRequest"
  import {httpOptionsService, storage} from "../core-component"

  @Component({
    name: "DefaultWapper",
    components: {
      SideBar,
      PageSizeSelect
    }
  })
  export default class extends Vue {
    private isToggleSidebar = false;
    private isToggleMenu = false;
    private keyword = '';
    private classProfile = '';
    private forms = {};
    private privileges = [];
    protected pageSize = 20;
    protected pageSizes = [10, 20, 40, 60, 100, 200, 400, 10000];
    //TODO PHU resource
    private resource: any = Resources['en'];
    private user: any = {};
    private httpRequest = new DefaultHttpRequest(axios, httpOptionsService);

    created() {
      this.forms = JSON.parse(sessionStorage.getItem('authService'));
      this.privileges = this.forms['privileges'];
      console.log('privileges', this.privileges);
    }

    get toggleSidebar() {
      return this.isToggleSidebar;
    }

    setToggleSidebar(dataToggleSidebar: boolean) {
      this.isToggleSidebar = !dataToggleSidebar;
    }

    get toggleMenu() {
      return this.isToggleMenu;
    }

    setToggleMenu(dataToggleMenu: boolean) {
      this.isToggleMenu = !dataToggleMenu;
    }

    pageSizeChanged = (event: any) => {
    }

    searchOnClick = () => {

    }

    toggleProfile() {
      this.classProfile = this.classProfile === 'show' ? '' : 'show';
    }

    get getClassProfile() {
      return this.classProfile;
    }

    async signout(event: any) {
      event.preventDefault();
      /*
      this.signoutService.signout(GlobalApps.getUserName()).subscribe(success => {
        if (success === true) {
          this.navigate('signin');
        }
      }, this.handleError);
      */
      /* const httpRequest = new DefaultHttpRequest(axios, httpOptionsService);
       try {
           const url = config.authenticationUrl + '/authentication/signout/' + storage.getUserName();
           const success = await httpRequest.get(url);
           if (success) {
               sessionStorage.setItem('authService', null);
               sessionStorage.clear();
               storage.setUser(null);
               this.navigate('');
           }
       } catch (err) {
           this.handleError(err);
       }*/
    }

    clearKeyworkOnClick = () => {
      this.keyword = ''
      console.log(this.keyword)
    }

    get features() {
     return this.privileges;
    }

    get getTopClass() {
      const topClassList = ["sidebar-parent"];
      if (this.isToggleSidebar) {
        topClassList.push("sidebar-off");
      }
      if (this.isToggleMenu) {
        topClassList.push("menu-on");
      }
      /*
              if (isToggleSearch) {
                  topClassList.push('search');
              } */
      return topClassList.join(" ");
    }
  }
</script>
