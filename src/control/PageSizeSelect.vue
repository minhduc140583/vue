<template>
  <select :value="pageSize" :change="onPageSizeChanged">
    <option v-for="pgSize in pageSizes" :key="pgSize" :value="pgSize">{{pgSize}}</option>)
  </select>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator'

    @Component({
        name: 'PageSizeSelect'
    })
    export default class extends Vue {
        @Prop({ required: true }) private pageSizes: number[]
        @Prop({ required: true }) private pageSize: number[]
        @Prop({ required: true }) private onPageSizeChanged: Function
    }
</script>

