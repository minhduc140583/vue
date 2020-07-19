<template>
    <li v-if="module && module.children && Array.isArray(module.children)" :class="'open' + this.activeWithPath(link, true, features)">
        <a class='menu-item' @click="toggleMenuItem">
          <button type='button' :class="`btn-pin ${isPinnedModules ? 'pinned' : ''}`"
                  @click="pinModulesHandler(index, module.sequence)"/>
          <i class='material-icons'>{{className}}</i><span>{{name }}</span>
          <i class='entity-icon down'/>
        </a>
        <ul class='list-child' v-if="module && module.children && Array.isArray(module.children)">
            <li is="item-link" v-for="(module, index) in featuresChild" :features="features" :key="index" :index="index" v-bind:pinnedModules="[]" :module="module" :isPinnedModules="false"></li>
        </ul>
    </li>
    <li v-else :class="activeWithPath(module.path, false)">
        <router-link :to="module.path">
            <i class='material-icons'>{{className}}</i><span>{{name}}</span>
        </router-link>
    </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Resources from "../../resource/Resources"
import ItemLink from "./ItemLink.vue"
@Component({
    name: 'item-link',
    components: {
        "item-link": ItemLink
    }
})
export default class extends Vue {
    @Prop({ required: true }) private module: any
    @Prop({ required: true }) private features: any
    @Prop({ required: true }) private index: any
    @Prop({ required: false }) private pinnedModules: any;
    @Prop({ required: false, default: false }) private isPinnedModules: boolean

    private resource: any = Resources['en'];
    private className: any = '';
    private link: any;
    private name: any;
    private featuresChild: any;

    get getPinnedModules() {
      return this.pinnedModules
    }

    created() {
        const module = this.module;
        if (module) {
            this.name = (!this.resource[module.resourceKey] || this.resource[module.resourceKey] === '') ? module.name : this.resource[module.resourceKey];
            if (module && module.children && Array.isArray(module.children)) {
                this.className = (!module.icon || module.icon === '') ? 'settings' : module.icon;
                this.link = module.path;
                this.featuresChild = module.children;
            } else {
                this.className = (!module.icon || module.icon === '') ? 'settings' : module.icon;
            }
        }
    }

    activeWithPath = (path: string, isParent: boolean, features ? : any) => {
        const pathName = window.location.pathname;
        if (isParent && features && Array.isArray(features)) {
            const hasChildLink = features.some(item => pathName.startsWith(item['link']));
            return path && pathName.startsWith(path) && hasChildLink ? 'active' : '';
        }
        return path && pathName.startsWith(path) ? 'active' : '';
    }

    pinModulesHandler(index: any, moduleSequence: any) {
      const pinnedModulesTemp = Object.assign([], this.getPinnedModules);
        if (this.features.find((moduleItem: any) => moduleItem && moduleItem['sequence'] === moduleSequence)) {
            const removedModule = this.features.splice(index, 1);
          pinnedModulesTemp.push(removedModule[0]);
            this.features.sort((moduleA: any, moduleB: any) => moduleA.sequence - moduleB.sequence);
        } else {
            if(pinnedModulesTemp.length> 0){
                const removedModule = pinnedModulesTemp.splice(index, 1);
                this.features.push(removedModule[0]);
                this.features.sort((moduleA: any, moduleB: any) => moduleA.sequence - moduleB.sequence);
            }
        }
         this.$emit('setPinnedModules', pinnedModulesTemp)
    }

    toggleMenuItem = (event: any) => {
        let target = event.currentTarget;
        const currentTarget = event.currentTarget;
        const elI = currentTarget.querySelectorAll('.menu-item > i')[1];
        if (elI) {
            if (elI.classList.contains('down')) {
                elI.classList.remove('down');
                elI.classList.add('up');
            } else {
                if (elI.classList.contains('up')) {
                    elI.classList.remove('up');
                    elI.classList.add('down');
                }
            }
        }
        if (currentTarget.nextElementSibling) {
            currentTarget.nextElementSibling.classList.toggle('expanded');
        }
        if (target.nodeName === 'A') {
            target = target.parentElement;
        }
        if (target.nodeName === 'LI') {
            target.classList.toggle('open');
        }
    }
}
</script>
