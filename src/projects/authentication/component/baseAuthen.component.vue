<template>
  <div class="authentication">
    <router-view/>
  </div>
</template>
<script lang="ts">
  import Component from 'vue-class-component';
  import {BaseViewComponent} from "../../../core-component/component/BaseViewComponent"

  @Component
  export default class BaseAuthenComponent extends BaseViewComponent {
    created() {
    }
  }
</script>
