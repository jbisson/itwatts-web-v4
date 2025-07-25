<script setup lang="ts">
import axios from 'axios';
import { ref, watch, reactive } from "vue";

import CategoryColumnTTT from '@/components/itwatts/CategoryColumnTTT.vue';
import config from "@/config/config.json";
import { useRouter } from 'vue-router'

const tab7 = ref(null);

const teams = reactive([] as any);
const races = reactive([] as any);
const wtrlLeagueScheduleBody = ref(null);
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const loading = ref();

const router = useRouter();
const props = defineProps<{
  swatUsersMapZpId: any,
  formsResultsMapZpId: any,
  eventName: any,
  }>();

const ridersInTeam = new Set();

const ridersToBeAdded = 
{
    name: 'Coureurs à placer',    
    riders: [
    ]
};

async function refresh(loadDefault = false) {
  console.log(`refresh loadDefault: ${loadDefault}`);
  teams.value = [];
  loading.value = true;
  ridersInTeam.clear();
  const leagueScheduleName = !props.formsResultsMapZpId.size || loadDefault ? 'registerWTRLTTT_default' : props.eventName;
  try {
    wtrlLeagueScheduleBody.value = (await axios.get(`${config.serverApi.publicHostname}/v1/wtrl-league-schedule/${leagueScheduleName}`, {
      withCredentials: true,
    })).data.value;
    console.log(`wtrlLeagueScheduleBody: ${JSON.stringify(wtrlLeagueScheduleBody.value)}`);
    
    for (const team of wtrlLeagueScheduleBody.value.teams) {
      const teamObj = Object.assign({}, team);
      teamObj.riders = [];
      teams.value.push(teamObj);

      for (const rider of team.riders) {        
        const riderUser = props.swatUsersMapZpId.get(rider);
        if (!riderUser) {
          console.log('riderUser null for ' + rider + ' with props.swatUsersMapZpId.value' + props.swatUsersMapZpId.size);
          return;
        }
        // console.log(JSON.stringify(riderUser.zp_profile.processed));
        const zp1Yr3AvgMaxW1200 = riderUser.zp_profile ? riderUser.zp_profile.processed.zp1Yr3AvgMaxW1200 : 0;
        const zp1Yr3AvgMaxWkg1200 = riderUser.zp_profile ? riderUser.zp_profile.processed.zp1Yr3AvgMaxWkg1200 : 0;
        teamObj.riders.push({
          id: riderUser.zp_id,
          name: `${riderUser.first_name} ${riderUser.last_name}`,
          zp1Yr3AvgMaxW1200: zp1Yr3AvgMaxW1200,
          zp1Yr3AvgMaxWkg1200: zp1Yr3AvgMaxWkg1200,
          isCapitain: team.capt === riderUser.zp_id ? true : false,
          isDS: team.ds === riderUser.zp_id ? true : false,          
          preferredTeam: props.formsResultsMapZpId.get(riderUser.zp_id).preferredTeam,
          preferredTime12h00: props.formsResultsMapZpId.get(riderUser.zp_id).preferredTime12h00,
          preferredTime18h30: props.formsResultsMapZpId.get(riderUser.zp_id).preferredTime18h30,
          preferredTime19h30: props.formsResultsMapZpId.get(riderUser.zp_id).preferredTime19h30,
          needMentor: props.formsResultsMapZpId.get(riderUser.zp_id).needMentor,
          canBeMentor: props.formsResultsMapZpId.get(riderUser.zp_id).canBeMentor,
        });
        //console.log(JSON.stringify(rider));
        ridersInTeam.add(rider);
      }      
    }
    
    const riderSortedByCp20 = Array.from(props.swatUsersMapZpId.values());
    riderSortedByCp20.sort((a, b) => (b.zp_profile && b.zp_profile.processed.zp1Yr3AvgMaxW1200 ? b.zp_profile.processed.zp1Yr3AvgMaxW1200 : 0) - (a.zp_profile && a.zp_profile.processed.zp1Yr3AvgMaxW1200 ? a.zp_profile.processed.zp1Yr3AvgMaxW1200 : 0));
    
    ridersToBeAdded.riders = [];
    for (const user of riderSortedByCp20) {
      if (!ridersInTeam.has(user.zp_id)) {
        const zp1Yr3AvgMaxW1200 = user.zp_profile ? user.zp_profile.processed.zp1Yr3AvgMaxW1200 : 0;
        const zp1Yr3AvgMaxWkg1200 = user.zp_profile ? user.zp_profile.processed.zp1Yr3AvgMaxWkg1200 : 0;

        ridersToBeAdded.riders.push(
          {
            id: user.zp_id,
            name: `${user.first_name} ${user.last_name}`,
            zp1Yr3AvgMaxW1200: zp1Yr3AvgMaxW1200,
            zp1Yr3AvgMaxWkg1200: zp1Yr3AvgMaxWkg1200,
            isCapitain: props.formsResultsMapZpId.get(user.zp_id).capInterest === 'a_lot' ? true : false,
            isDS: props.formsResultsMapZpId.get(user.zp_id).dsInterest === 'a_lot' ? true : false,
            preferredTeam: props.formsResultsMapZpId.get(user.zp_id).preferredTeam,
            preferredTime12h00: props.formsResultsMapZpId.get(user.zp_id).preferredTime12h00,
            preferredTime18h30: props.formsResultsMapZpId.get(user.zp_id).preferredTime18h30,
            preferredTime19h30: props.formsResultsMapZpId.get(user.zp_id).preferredTime19h30,
            needMentor: props.formsResultsMapZpId.get(user.zp_id).needMentor,
            canBeMentor: props.formsResultsMapZpId.get(user.zp_id).canBeMentor,
          }
        );
      }
    }

    teams.value.push(ridersToBeAdded);
    races.value = wtrlLeagueScheduleBody.value.races;    
  } catch (err: any) {
    console.log(`an error occured: ${err} stack: ${err.stack}`);

    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
  } finally {
    loading.value = false;
  }
}

async function save() {
  const value = {
    teams: [],
    races: wtrlLeagueScheduleBody.value.races,
  }
  for (const team of teams.value) {
    if (team.name !== 'Coureurs à placer') {
      const teamObj = {
        name: team.name,
        capt: 0,
        ds: 0,
        category: team.category,
        time: team.time,
        riders: []
      }
      for (const rider of team.riders) {
        if (rider.isCapitain) {
          teamObj.capt = rider.id;
        }
        if (rider.isDS) {
          teamObj.ds = rider.id;
        }
        teamObj.riders.push(rider.id);
      }
      value.teams.push(teamObj);      
    }    
  }
  
  const body = {
    name: props.eventName,
    value: JSON.stringify(value),
  }

  try {
    loading.value = true;
    errorAlert.value = '';
    const response = await axios.put(`${config.serverApi.publicHostname}/v1/wtrl-league-schedule/${props.eventName}`,
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
  refresh(true);
}

function onDeleteTeam(teamName: string) {
  teams.value = teams.value.filter((team: any) => team.name !== teamName);
}

watch(() => props.formsResultsMapZpId.size, (newSerie, oldSerie) => {
  refresh(false);
  }
)

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
        <div>Équipes</div>
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
                  <h2 class="text-h5">Équipes</h2>          
                  <div class="float-right">
                    <v-btn color="primary" flat @click="loadDefault">Ré-initialiser</v-btn>&nbsp;
                    <!--<v-btn color="primary" flat @click="autoFill">Auto Populer</v-btn>&nbsp;-->
                    <!--<v-btn color="primary" flat @click="autoFill">Ajouter équipe</v-btn>&nbsp;-->
                    <v-btn color="primary" flat @click="save">Sauvegarder</v-btn>            
                  </div>          
                </v-col>
              </v-row>
            <v-row>
              <v-col cols="12" md="3" sm="6" class="d-flex" v-for="team in teams.value" :key="team.id">
                <CategoryColumnTTT :column="team" @onSuccess="(msg) => infoAlert = msg" @deleteTeam="onDeleteTeam"/>
              </v-col>                
            </v-row>
            </v-card-text>
        </v-card>
      </v-window-item>
  </v-window>
</template>
