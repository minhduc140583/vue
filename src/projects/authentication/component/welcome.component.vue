<template>
  <div class='view-container central-full'>
    <form id='welcomeForm' name='welcomeForm' novalidate autocomplete='off'>
      <div>
        <!--<img class='logo' src='assets/images/logo.png'>-->
        <h2>{{resource.brand_name}} Brand name</h2>
        <h3>{{resource.sologon}} sologon</h3>
        <button type='submit' id='btnSignup' name='btnSignup' @click='signup()'>
          {{resource.button_get_started}}
        </button>
        <a id='btnSignin' @click='signin()'>
          {{resource.welcome_signin}}
        </a>
      </div>
    </form>
  </div>

</template>
<script lang="ts">
  import Component from 'vue-class-component';
  import {BaseViewComponent} from "../../../core-component/component/BaseViewComponent"

  @Component
  export default class WelcomeComponent extends BaseViewComponent {

    created() {
      this.supperContructor();
    }
  }
</script>
