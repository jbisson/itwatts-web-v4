<script setup>
import Icon from '../../vertical-sidebar/Icon.vue';
import NavItem from '../NavItem/ItWattsIndex.vue';
import { useI18n } from 'vue-i18n';

import security from "@/security";
import config from '@/config/config.json';
import { decodeBase64 } from '@/utils/string';

const props = defineProps({ item: Object, level: Number });
const { t } = useI18n({ useScope: 'global' });

function showMenu(item) {
  let tokenValid = false;
  if (item && (item.security || item.hideOnLoggedInUser)) {
    if (item.security && item.security[0] === 'DEV_ONLY') {
      return config.ui.showAllMenus === 'true';
    }

    if (item.security && item.security[0] === 'DEV_ONLY') {
      tokenValid = false;
    } else {
      tokenValid = security.isTokenValid(item.security);
    }
    
    return item.hideOnLoggedInUser ? !security.isLoggedIn() : tokenValid;
  } else {
    return true;
  }  
}

</script>
<template>
    <!---Dropdown  -->
    <a class="navItemLink rounded-pill cursor-pointer navcollapse">
        <!---Icon  -->
        <i class="navIcon">
          <Icon :icon="'solar:' + item.icon" height="18" width="18" :level="level" class="dot" :class="'text-' + item.BgColor"/>
        </i>
        <!---Title  -->
        <span class="mr-auto">{{ item.title.startsWith('menu') ? t(item.title) : item.title}}</span>
        <!---If Caption-->
        <small v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
            {{ t(item.subCaption) }}
        </small>
        <i class="ddIcon ml-2 d-flex align-center"><ChevronDownIcon size="15" /></i>
    </a>
    <!---Sub Item-->
    <ul :class="`ddMenu ddLevel-${level + 1}`">
        <li v-for="(subitem, i) in item.children" :key="i" v-if="item.children" class="navItem">
            <ItWattsIndex :item="subitem" v-if="subitem.children && showMenu(item)" :level="level + 1" />
            <NavItem :item="subitem" :level="level + 1" v-else-if="showMenu(subitem)"></NavItem>
        </li>
    </ul>
    <!---End Item Sub Header -->
</template>
