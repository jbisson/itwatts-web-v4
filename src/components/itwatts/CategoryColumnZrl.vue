<script setup lang="ts">
import { ref } from 'vue';
import RiderTeamItemCard from './RiderTeamItemCard.vue'
import type { id } from 'vuetify/lib/locale/index.mjs';

const props = defineProps({
    column: Object,
});

const emit = defineEmits(['onSuccess',  'deleteTeam', 'exportTeam']);

// common components
const dialog = ref(false);
const title = ref('');
const subtitle = ref('');
const categorybg = ref('primary')
const columnId = ref(props.column?.id)

function addItemAndClear() {    
  title.value = '',
  subtitle.value = '',
  categorybg.value = 'primary'
}

function assigmentCatBgColor(category: any) {
  if (category === 'A') {
    return 'red';
  } else if (category === 'B') {
    return 'green';
  } else if (category === 'C') {
    return 'primary';
  } else if (category === 'D') {
    return 'yellow';
  }
  return 'primary';
}

function save() {
    emit('onSuccess', 'Les changements ont été enregistré avec succès.');
    return dialog.value = false;
}

</script>

<template>
  <v-card elevation="10" :class="'bg-' + column?.cardbg">
    <div class="pa-5">
      <div class="d-flex align-center justify-space-between">
        <h6 class="text-h6 font-weight-semibold">{{ column.name || column.title }}</h6>
        <div :class="'rounded-sm body-text-1 px-1 py-0 bg-' + assigmentCatBgColor(column?.category)" size="small">
          {{ column?.category }} {{ column.time }}
        </div>
      
      <RouterLink to="" class="px-0" v-if="column.name !== 'Coureurs à placer'">
          <DotsVerticalIcon size="15" />
          <v-menu activator="parent">
            <v-list density="compact">
              <v-list-item value="Edit">
                <v-list-item-title @click="dialog = true">Modifier</v-list-item-title>
                <v-list-item-title @click="emit('deleteTeam', column.name)">Supprimer</v-list-item-title>
                <v-list-item-title @click="emit('exportTeam', column.name)">Export</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </RouterLink>
        <v-dialog v-model="dialog" max-width="500">
          <v-card>
            <v-card-text class="mb-4" >
              <h4 class="text-h6 mb-5">{{ column.name }}</h4>
              <v-text-field v-model="column.name" :value="column.name" hide-details></v-text-field><br>
              <v-select
                v-model="column.category"
                variant="outlined"
                hide-details
                :items="['A', 'B', 'C', 'D']"
                label="Categorie"
              ></v-select><br>
              <v-select
                v-model="column.time"
                variant="outlined"
                hide-details
                :items="['6h00', '7h00', '8h00', 'midi', '18h30', '19h30']"
                label="Heure"
              ></v-select>
              <br><br>
              <v-btn color="primary" variant="flat" @click="save" >Sauvegarder</v-btn>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
      <draggable class="dragArea list-group mt-6" :list="column?.riders" :animation="200" ghost-class="ghost-card"
          group="riders">
        <transition-group>
          <div v-for="rider in column?.riders" :key="rider.id" :rider="rider" class="mt-3 cursor-move">
            <RiderTeamItemCard :rider="rider" />
          </div>
        </transition-group>
      </draggable>
    </div>
  </v-card>
</template>
