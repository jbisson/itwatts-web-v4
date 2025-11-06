<script setup lang="ts">
import axios from 'axios';
import { ref, watch, reactive } from "vue";

import CategoryColumnZrl from '@/components/itwatts/CategoryColumnZrl.vue';
import config from "@/config/config.json";
import { useRouter } from 'vue-router';

const emit = defineEmits(['exportTeam']);

const tab7 = ref(null);
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const teams = reactive([] as any);
const races = reactive([] as any);
const wtrlLeagueScheduleBody = ref(null);
const loading = ref();

const router = useRouter();
const props = defineProps<{
  swatUSersMapZpId: any,
  formsResultsMapZpId: any
  }>();

const ridersInTeam = new Set();
const defaultFormName = 'zrl20252026round2_default';
const formName = 'registerZrl20252026Round2';
const ridersToBeAdded = 
{
    name: 'Coureurs à placer',
    cardbg: '',
    riders: [
    ]
};

async function refresh(loadDefault = false) {
  if (!props.swatUSersMapZpId.value || props.swatUSersMapZpId.value.size === 0) {
    console.log(`a ${props.swatUSersMapZpId.value ? props.swatUSersMapZpId.value.size : 0}`);
    return;
  }
  
  teams.value = [];
  ridersInTeam.clear();
  try {
    const leagueScheduleName = loadDefault ? defaultFormName : formName;
    wtrlLeagueScheduleBody.value = (await axios.get(`${config.serverApi.publicHostname}/v1/wtrl-league-schedule/${leagueScheduleName}`, {
      withCredentials: true,
    })).data.value;    
    
    for (const team of wtrlLeagueScheduleBody.value.teams) {
      const teamObj = Object.assign({}, team);
      teamObj.riders = [];      
      teams.value.push(teamObj);
      for (const rider of team.riders) {
        const riderUser = props.swatUSersMapZpId.value.get(rider);
        if (!riderUser) {
          console.log('riderUser null for ' + rider + ' with props.swatUSersMapZpId.value' + props.swatUSersMapZpId.value.size);
          return;
        }
        
        const zpProfileCP20Watts = riderUser.zp_profile ? riderUser.zp_profile.profile_stats.w1200 : 0;
        const zpProfileCP20WattKg = riderUser.zp_profile ? riderUser.zp_profile.profile_stats.wkg1200 : 0;
        const zpProfileCat = riderUser.zp_profile ? riderUser.zp_profile.category : 'E';
        
        let availability = 0;
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).nov4Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).nov11Course.includes('available')) availability++;        
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).nov18Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).nov25Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).dec2Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(riderUser.zp_id).dec9Course.includes('available')) availability++;
        teamObj.riders.push({
          id: riderUser.zp_id,
          name: `${riderUser.first_name} ${riderUser.last_name}`,
          catPreferences: props.formsResultsMapZpId.value.get(riderUser.zp_id).catPreferences,
          catPreference: props.formsResultsMapZpId.value.get(riderUser.zp_id).catPreference,
          dsInterest: props.formsResultsMapZpId.value.get(riderUser.zp_id).dsInterest,
          othersTeamPlayerNames: props.formsResultsMapZpId.value.get(riderUser.zp_id).othersTeamPlayerNames,
          zpProfileCat: zpProfileCat,
          zpProfileCP20Watts: zpProfileCP20Watts,
          zpProfileCP20WattKg: zpProfileCP20WattKg,
          vElo: riderUser.zwift_racing_app_profile ? Math.round(riderUser.zwift_racing_app_profile.race.rating) : 0,
          isCapitain: team.capt === riderUser.zp_id ? true : false,
          nbAvailability: availability,
          preferedTime6h00: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime6h00,
          preferedTime7h00: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime7h00,
          preferedTime8h00: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime8h00,
          preferedTime12h00: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime12h00,
          preferedTime18h30: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime18h30,
          preferedTime19h30: props.formsResultsMapZpId.value.get(riderUser.zp_id).preferedTime19h30,
        });
        ridersInTeam.add(rider);        
      }      
    }
    const riderSortedByElo = Array.from(props.swatUSersMapZpId.value.values());
    riderSortedByElo.sort((a, b) => (b.zwift_racing_app_profile && b.zwift_racing_app_profile.race ? b.zwift_racing_app_profile.race.rating : 0) - (a.zwift_racing_app_profile && a.zwift_racing_app_profile.race ? a.zwift_racing_app_profile.race.rating : 0));
    
    ridersToBeAdded.riders = [];
    for (const user of riderSortedByElo) {
      if (!ridersInTeam.has(user.zp_id)) {
        let availability = 0;
        if (props.formsResultsMapZpId.value.get(user.zp_id).nov4Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(user.zp_id).nov11Course.includes('available')) availability++;        
        if (props.formsResultsMapZpId.value.get(user.zp_id).nov18Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(user.zp_id).nov25Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(user.zp_id).dec2Course.includes('available')) availability++;
        if (props.formsResultsMapZpId.value.get(user.zp_id).dec9Course.includes('available')) availability++;

        const zpProfileCP20Watts = user.zp_profile ? user.zp_profile.profile_stats.w1200 : 0;

        ridersToBeAdded.riders.push(
          {
            id: user.zp_id,
            name: `${user.first_name} ${user.last_name}`,
            catPreferences: props.formsResultsMapZpId.value.get(user.zp_id).catPreferences,
            catPreference: props.formsResultsMapZpId.value.get(user.zp_id).catPreference,
            dsInterest: props.formsResultsMapZpId.value.get(user.zp_id).dsInterest,
            othersTeamPlayerNames: props.formsResultsMapZpId.value.get(user.zp_id).othersTeamPlayerNames,
            zpProfileCP20Watts: zpProfileCP20Watts,
            vElo: user.zwift_racing_app_profile ? Math.round(user.zwift_racing_app_profile.race.rating) : 0,
            isCapitain: false,
            nbAvailability: availability,
            preferedTime6h00: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime6h00,
            preferedTime7h00: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime7h00,
            preferedTime8h00: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime8h00,
            preferedTime12h00: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime12h00,
            preferedTime18h30: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime18h30,
            preferedTime19h30: props.formsResultsMapZpId.value.get(user.zp_id).preferedTime19h30,
          }
        );
      }
    }

    teams.value.push(ridersToBeAdded);
    races.value = wtrlLeagueScheduleBody.value.races;    
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
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
        time: team.time,
        category: team.category,
        riders: []
      }
      for (const rider of team.riders) {
        if (rider.isCapitain) {
          teamObj.capt = rider.id;
        }
        teamObj.riders.push(rider.id);
      }
      value.teams.push(teamObj);      
    }    
  }
  
  const body = {
    name: formName,
    value: JSON.stringify(value),
  }

  try {
    loading.value = true;
    errorAlert.value = '';
    const response = await axios.put(`${config.serverApi.publicHostname}/v1/wtrl-league-schedule/${formName}`,
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

function autoFill() {
  const catARiders = [];
  const catBRiders = [];
  for (const team of teams.value) {
    if (team.name === 'Coureurs à placer') {
      console.log(`team.riders length` + team.riders.length);
      for (const rider of team.riders) {
        if (rider.catPreferences.includes('catA')) {
          catARiders.push(rider);
        } else {
          catBRiders.push(rider);
        }        
      }
      team.riders = [];
    }
  }

  catARiders.sort((a, b) => a.vElo - b.vElo);
  catBRiders.sort((a, b) => a.vElo - b.vElo);

  teams.value[teams.value.length - 1].riders = [];

  for (const team of teams.value) {
    console.log('team: ' + team.name);
    if (team.name !== 'Coureurs à placer') {
      while (team.category === 'A' && team.riders.length <= 7 && catARiders.length > 0) {
        const rider = catARiders.pop();
        team.riders.push(rider);
      }
      while (team.category === 'B' && team.riders.length <= 7 && catBRiders.length > 0) {
        const rider = catBRiders.pop();
        team.riders.push(rider);
      }
    }
  }

  teams.value[teams.value.length - 1].riders = teams.value[teams.value.length - 1].riders.concat(catARiders);
  teams.value[teams.value.length - 1].riders = teams.value[teams.value.length - 1].riders.concat(catBRiders);
}

function onDeleteTeam(teamName: string) {
  teams.value = teams.value.filter((team: any) => team.name !== teamName);
}

function onExportTeam(teamName: string) {
  emit('exportTeam', teams.value.find((team: any) => team.name === teamName));
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
                    <v-btn color="primary" flat @click="autoFill">Auto Populer</v-btn>&nbsp;
                    <v-btn color="primary" flat @click="save">Sauvegarder</v-btn>            
                  </div>          
                </v-col>
              </v-row>
            <v-row>
              <v-col cols="12" md="3" sm="6" class="d-flex" v-for="team in teams.value" :key="team.id">
                <CategoryColumnZrl :column="team" @deleteTeam="onDeleteTeam" @exportTeam="onExportTeam" />
              </v-col>                
            </v-row>
            </v-card-text>
        </v-card>
      </v-window-item>
      <v-window-item value="option-2">
          <v-card variant="outlined">
              <v-card-text>
                <div style="width:100%;aspect-ratio: .56;background: url('/images/itwatts/zrl/2024round3/patrol.png') no-repeat;background-size: contain;color: white">
                  
                  <h1 style="padding-top: 75%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  <h1 style="padding-top: 0%;padding-left: 10%; font-size: 2vw;">Jonathan Bisson</h1>
                  
                </div>            
              </v-card-text>
          </v-card>
      </v-window-item>
      <v-window-item value="option-3">
          <v-card variant="outlined">
              <v-card-text>
                  <p>
                      Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
                      officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.
                  </p>

                  <p class="mt-4">
                      Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
                      officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.
                  </p>
              </v-card-text>
          </v-card>
      </v-window-item>
      <v-window-item value="option-4">
          <v-card variant="outlined">
              <v-card-text>
                  <p>
                      Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
                      officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.
                  </p>

                  <p class="mt-4">
                      Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon
                      officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.
                  </p>
              </v-card-text>
          </v-card>
      </v-window-item>
  </v-window>
</template>
