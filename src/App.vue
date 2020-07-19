<template>
  <div id="root">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { browser } from 'browser-service';
import Resources from './resource/Resources'
import { DefaultLocaleService } from 'locale-service';
import { uialert } from 'ui-alert';
import { loading } from 'ui-loading';
import { toast } from 'ui-toast';
import { DefaultUIService } from 'ui-plus';
import { storage } from './core-component'
import {CsvUtil, DefaultCsvService} from "../core-web-client"
import * as csv from 'csvtojson';

export default Vue.extend({
  name: 'App',
  created (): void {
    const localeService = new DefaultLocaleService();
    CsvUtil.setCsvService(new DefaultCsvService(csv));
    storage.setResources(Resources);
    storage.setLocaleService(localeService);

    storage.setAlertService(uialert);
    storage.setLoadingService(loading);
    storage.setToastService(toast);
    storage.setUIService(new DefaultUIService());
  }
})
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
