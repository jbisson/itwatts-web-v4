<script setup lang="ts">
import axios from 'axios';
import { ref, watch, reactive } from "vue";

import ListColumn from '@/components/itwatts/ListColumn.vue';
import config from "@/config/config.json";
import { useRouter } from 'vue-router';
import { uuid } from 'vue-uuid';

const emit = defineEmits(['exportTeam']);

const tab7 = ref(null);
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const team = ref();
const lists = reactive([] as any);
const races = reactive([] as any);
const wtrlLeagueScheduleBody = ref(null);
const loading = ref();

const router = useRouter();
const props = defineProps<{
  swatUsersMapUserId: any,
  formsResultsMapUserId: any
  listName: any,
  team: any,
  }>();

const ridersInTeam = new Set();
const ridersToBeAdded = 
{
    name: 'Coureurs à placer',    
    riders: [
    ]
};

async function refresh() {
  if (!props.swatUsersMapUserId.value || props.swatUsersMapUserId.value.size === 0) {
    console.log(`a ${props.swatUsersMapUserId.value ? props.swatUsersMapUserId.value.size : 0}`);
    return;
  }

  lists.value = [];
  ridersInTeam.clear();
  try {
    const teamList = await axios.get(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}/lists/${props.listName}`, {
      withCredentials: true,
    });
    
    for (const list of teamList.data.value.lists) {
      const listObj = Object.assign({}, list);
      listObj.riders = [];
      lists.value.push(listObj);
      for (const rider of list.riders) {
        const riderUser = props.swatUsersMapUserId.value.get(rider);
        if (!riderUser) {
          console.log('riderUser null for ' + rider + ' with props.swatUsersMapUserId.value' + props.swatUsersMapUserId.value.size);
          return;
        }
        
        const zpProfileCP20Watts = riderUser.zp_profile ? riderUser.zp_profile.profile_stats.w1200 : 0;
        const zpProfileCP20WattKg = riderUser.zp_profile ? riderUser.zp_profile.profile_stats.wkg1200 : 0;
        const zpProfileCat = riderUser.zp_profile ? riderUser.zp_profile.category : 'E';
        
        listObj.riders.push({
          id: riderUser.id,
          name: `${riderUser.first_name} ${riderUser.last_name}`,
          zpProfileCat: zpProfileCat,
          zpProfileCP20Watts: zpProfileCP20Watts,
          zpProfileCP20WattKg: zpProfileCP20WattKg,
        });
        ridersInTeam.add(rider);        
      }
    }
    const riders= Array.from(props.swatUsersMapUserId.value.values());
    for (const rider of riders) {        
      if (!ridersInTeam.has(rider.id)) {
        ridersToBeAdded.riders.push({
          id: rider.id,
          name: `${rider.first_name} ${rider.last_name}`,            
        });
      }
    }

    lists.value.push(ridersToBeAdded);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

async function add() {
  const listObj = {
    id: uuid.v4(),
    name: 'Mentor x',
    riders: []
  }
  lists.value.push(listObj);
}

async function save() {
  const value = {
    lists: [],
  }
  for (const list of lists.value) {
    if (list.name !== 'Coureurs à placer') {
      const listObj = {
        id: list.id,
        name: list.name,
        riders: []
      }

      for (const rider of list.riders) {        
        listObj.riders.push(rider.id);
      }

      value.lists.push(listObj);
    }    
  }
  
  const body = {
    name: props.listName,
    value: value,
  }

  try {
    loading.value = true;
    errorAlert.value = '';
    const response = await axios.put(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}/lists/${props.listName}`,
      body, {
        withCredentials: true,
      });
  } catch (err: any) {
    console.log(`An error has occured: ${err} stack: ${err.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue... Detail: ${err}`;    
  } finally {
    loading.value = false;
  }
}

function loadDefault() {
  refresh();
}

function onDeleteList(listId: string) {
  lists.value = lists.value.filter((list: any) => list.id !== listId);
}

watch(() => [], refresh);
refresh();

</script>
<template>
  <v-row>
    <v-col cols="12">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="info"
        title="Succès"
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>    
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        title="Erreur"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        title="Attention"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <br>
      <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
    </v-col>
  </v-row> 
         
  <v-tabs v-model="tab7"  bg-color="primary">
    <v-tab value="teams">
      <UserIcon stroke-width="1.5" width="20" class="v-icon--start" />
      <div>
        <div>Mentors</div>
      </div>
    </v-tab>
    <v-tab value="option-2" v-for="race in races.value" :key="race.id">                    
      <div class="mx-8">
        <div>{{ race.title }}</div>
        <span class="text-subtitle-2 text-lightText font-weight-medium d-block"
            >{{ race.date }}</span>                      
      </div>
    </v-tab>
  </v-tabs>

  <v-window v-model="tab7" class="bg-lightprimary">
      <v-window-item value="teams">
        <v-card variant="outlined">
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <h2 class="text-h5">Mentors</h2>          
                  <div class="float-right">
                    <v-btn color="primary" flat @click="add">Ajouter</v-btn>&nbsp;                    
                    <v-btn color="primary" flat @click="save">Sauvegarder</v-btn>
                  </div>          
                </v-col>
              </v-row>
            <v-row>
              <v-col cols="12" md="3" sm="6" class="d-flex" v-for="list in lists.value" :key="list.id">
                <ListColumn :column="list" @deleteList="onDeleteList" />
              </v-col>                
            </v-row>
            </v-card-text>
        </v-card>
      </v-window-item>
  </v-window>
</template>
