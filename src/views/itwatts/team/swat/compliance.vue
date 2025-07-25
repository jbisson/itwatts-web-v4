<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
//import BaseCard from "@/components/BaseCard.vue";
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";
import { addUserCompliance } from '@/utils/zp';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatCompliance.pageTitle') });
const dialog = ref(false);
const dialogDiscord = ref(false);
const dialogDiscordMessage = ref();
const dialogDiscordTitle = ref();
const dialogDiscordImgName = ref();
const dialogProgressPourcent = ref();
const usersResult = reactive([] as any);

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatCompliance.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatCompliance.pageTitle'),
    disabled: true,
  },
]);

const loading = ref(false);
const dialogLoading = ref(false);
const errorOccured = ref(false);
const isFormValid = ref();

const dialogTitle = ref();
const dialogUserID = ref();
const dialogDiscordTestUser = ref();
const dialogAdminComments = reactive([] as any);
const dialogDiscordUsers = reactive([] as any);
const dialogDiscordUsersName = reactive([] as any);
const usersNotCompliant = reactive([] as any);

const dialogNewComment = ref();
const dialogAssignedTo = ref();
const searchValue = ref();

const overallHeaders: Header[] = reactive([
  { text: 'Nom', width: 150, value: "name", sortable: true },
  { text: 'Genre', width: 50, value: "gender", sortable: true },
  { text: '% confor mité', width: 50, value: "compliance_percentage", sortable: true },
  { text: 'Discord', width: 50, value: "discord_profile_compliance", sortable: true },
  { text: 'Zwift name', width: 50, value: "zwift_name_compliance", sortable: true },
  { text: 'Zwift 5.W.4.T club status', width: 50, value: "zwift_status_compliance", sortable: true },  
  { text: 'ZP primary team', width: 50, value: "zp_primary_team_name_compliance", sortable: true },
  { text: 'ZP bio', width: 50, value: "zp_bio_compliance", sortable: true },
  { text: 'ZP Poids (nb jours update)', width: 50, value: "zp_nb_days_last_updated_weight_compliance", sortable: true },
  { text: 'ZP dual reco rding', width: 50, value: "zp_dual_compliance", sortable: true },
  { text: 'Zp lien strava', width: 50, value: "zp_strava_compliance", sortable: true },
  { text: 'Lien strava ITWatts', width: 50, value: "strava_url_compliance", sortable: true },  
]);

if (security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])) {
  // overallHeaders.push({ text: 'ZP dernier événement (nb jours)', value: "admin_zp_nb_days_last_event", width: 50, sortable: true });
  overallHeaders.push({ text: 'Actions', value: "admin_comments", width: 95, sortable: true });
  overallHeaders.push({ text: '', value: "admin_action", width: 50, sortable: true });
}

usersResult.value = [];


const rulesRequired = ref([
  (value: any) => !!value || 'Ce champ est obligatoire.',
]);

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  interface ResponseData {
    data: any,
  }

  usersResult.value = [];
  loading.value = true;
  errorOccured.value = false;

  const stats = {
    total: 0,
    discord_profile_compliance: 0,
    zwift_name_compliance: 0,
    zwift_status_compliance: 0,
    zp_primary_team_name_compliance: 0,
    zp_bio_compliance: 0,
    zp_nb_days_last_updated_weight_compliance: 0,
    zp_dual_compliance: 0,
    zp_strava_compliance:0,
    strava_url_compliance: 0,    
  }

  usersNotCompliant.value = {
    discord_profile_compliance: [],
    zwift_name_compliance: [],
    zwift_status_compliance: [],
    zp_primary_team_name_compliance: [],
    zp_bio_compliance: [],
    zp_nb_days_last_updated_weight_compliance: [],
    zp_dual_compliance: [],
    zp_strava_compliance: [],
    strava_url_compliance: [],    
  }

  try {
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_2023_2024&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    for (const user of response.data.data) {
      user.name = `${user.first_name} ${user.last_name}`;

      addUserCompliance(user);

      if (user.roles.includes('SWAT_MEMBER')) {
        usersResult.value.push(user);      

        const userNotCompliant = {
            id: user.id,
            admin_comments: user.admin_comments,
            first_name: user.first_name,
            last_name: user.last_name,
            discord_id: user.discord_id,
          };
        if (useUserProfile().user_id === user.id) {
          dialogDiscordTestUser.value = userNotCompliant;
        }

        if (user.discord_profile_compliance === '✅') {
          stats.discord_profile_compliance += 1;  
        } else {
          usersNotCompliant.value.discord_profile_compliance.push(userNotCompliant)
        }

        if (user.zwift_name_compliance === '✅') {
          stats.zwift_name_compliance += 1;  
        } else {
          usersNotCompliant.value.zwift_name_compliance.push(userNotCompliant)
        }

        if (user.zwift_status_compliance === '✅') {
          stats.zwift_status_compliance += 1;  
        } else {
          usersNotCompliant.value.zwift_status_compliance.push(userNotCompliant)
        }

        if (user.zp_bio_compliance === '✅') {
          stats.zp_bio_compliance += 1;  
        } else {
          usersNotCompliant.value.zp_bio_compliance.push(userNotCompliant)
        }

        if (user.zp_primary_team_name_compliance === '✅') {
          stats.zp_primary_team_name_compliance += 1;  
        } else {
          usersNotCompliant.value.zp_primary_team_name_compliance.push(userNotCompliant)
        }

        if (user.zp_nb_days_last_updated_weight_compliance === '✅') {
          stats.zp_nb_days_last_updated_weight_compliance += 1;  
        } else {
          usersNotCompliant.value.zp_nb_days_last_updated_weight_compliance.push(userNotCompliant)
        }

        if (user.zp_dual_compliance === '✅') {
          stats.zp_dual_compliance += 1;  
        } else {
          usersNotCompliant.value.zp_dual_compliance.push(userNotCompliant)
        }

        if (user.zp_strava_compliance === '✅') {
          stats.zp_strava_compliance += 1;  
        } else {
          usersNotCompliant.value.zp_strava_compliance.push(userNotCompliant)
        }
        

        if (user.strava_url_compliance === '✅') {
          stats.strava_url_compliance += 1;  
        } else {
          usersNotCompliant.value.strava_url_compliance.push(userNotCompliant)
        }
      }
    }

    stats.total += stats.discord_profile_compliance +
      stats.zwift_name_compliance +
      stats.zwift_status_compliance +
      stats.zp_bio_compliance +
      stats.zp_primary_team_name_compliance +
      stats.zp_nb_days_last_updated_weight_compliance + 
      stats.zp_dual_compliance + 
      stats.zp_strava_compliance + 
      stats.strava_url_compliance;
      
    overallHeaders[2].text = `${overallHeaders[2].text}\n${Math.round(((stats.total / 9) / response.data.data.length * 100))}%`;
    overallHeaders[3].text = `${overallHeaders[3].text}\n${Math.round(stats.discord_profile_compliance / response.data.data.length * 100)}%`;
    overallHeaders[4].text = `${overallHeaders[4].text}\n${Math.round(stats.zwift_name_compliance / response.data.data.length * 100)}%`;
    overallHeaders[5].text = `${overallHeaders[5].text}\n${Math.round(stats.zwift_status_compliance / response.data.data.length * 100)}%`;
    overallHeaders[6].text = `${overallHeaders[6].text}\n${Math.round(stats.zp_primary_team_name_compliance / response.data.data.length * 100)}%`;
    overallHeaders[7].text = `${overallHeaders[7].text}\n${Math.round(stats.zp_bio_compliance / response.data.data.length * 100)}%`;
    overallHeaders[8].text = `${overallHeaders[8].text}\n${Math.round(stats.zp_nb_days_last_updated_weight_compliance / response.data.data.length * 100)}%`;
    overallHeaders[9].text = `${overallHeaders[9].text}\n${Math.round(stats.zp_dual_compliance / response.data.data.length * 100)}%`;
    overallHeaders[10].text = `${overallHeaders[10].text}\n${Math.round(stats.zp_strava_compliance / response.data.data.length * 100)}%`;
    overallHeaders[11].text = `${overallHeaders[11].text}\n${Math.round(stats.strava_url_compliance / response.data.data.length * 100)}%`;

  } catch (error: any) {
    errorOccured.value = true;
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${error} stack: ${error.stack}`);
  }
  loading.value = false;
}

watch(() => [], refresh);
refresh();

function dateFormat(date: any) {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDay()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}h`;
}

async function openDiscordDialog(type) {
  if (type === 'zwift_name_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir le tag du ***5.W.4.T*** dans ton identifiant zwift,` +
    ` pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nAjouter ***[5.W.4.T]*** à la fin de ton identifiant Zwift.\n` +
    `Tout ce qui précède le « In-game Team Tag » exigé est à l’entière discrétion du membre; il peut inclure un second « Team tag », une appartenance à une équipe/club IRL, etc...\n` +
    `***Exemple:*** Jo [RPV][5.W.4.T]
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zwift_name.png';
    dialogDiscordTitle.value = `Identifiant Zwift`;
    dialogDiscordUsers.value = usersNotCompliant.value.zwift_name_compliance.filter((user) => user.discord_id);
  } else if (type === 'zwift_status_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir joint le club ***5.W.4.T*** sous companion,` +
    ` pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nJoindre le club 5.W.4.T ici: https://www.zwift.com/clubs/29068f3d-089c-4a38-842e-f67e8a4d52ef/home\n` +
    `\nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zwift_club_companion.png';
    dialogDiscordTitle.value = `Club 5.W.4.T Companion`;
    dialogDiscordUsers.value = usersNotCompliant.value.zwift_status_compliance.filter((user) => user.discord_id);
    
  } else if (type === 'zp_primary_team_name_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir mis le 5.W.4.T comme équipe primaire sous ZwiftPower, ` +
    `pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\n1) S'assurer d'avoir joint l'équipe 5.W.4.T https://zwiftpower.com/team.php?id=19126\n` +
    `2) Cliquer sur "My Teams" et le boutton "Make 5.W.4.T my Primary team".
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zp_primary_team.png';
    dialogDiscordTitle.value = `ZwiftPower équipe primaire`;
    dialogDiscordUsers.value = usersNotCompliant.value.zp_primary_team_name_compliance.filter((user) => user.discord_id);
  } else if (type === 'zp_bio_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas affiché dans ta bio sous ZwiftPower, ` +
    `pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nTappe la commande /zwiftpower-bio-club1 dans un salon Discord et suit les instructions.` +
    `(Une vidéo explicative est disponible pour les étapes ici: https://www.youtube.com/watch?v=IPcfsvifiDg).
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zp_bio.png';
    dialogDiscordTitle.value = `Bio ZwiftPower`;
    dialogDiscordUsers.value = usersNotCompliant.value.zp_bio_compliance.filter((user) => user.discord_id);
  } else if (type === 'zp_nb_days_last_updated_weight_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu n'a pas mis à jour ton poids depuis plus d'un an sous Zwift / ZwiftPower` +
    `, pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nInscrire ton poid à jour dans Zwift companion
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zp_weight.png';
    dialogDiscordTitle.value = `Pesé Zwift`;
    dialogDiscordUsers.value = usersNotCompliant.value.zp_nb_days_last_updated_weight_compliance.filter((user) => user.discord_id);
  } else if (type === 'zp_dual_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir de dual recording dans ton profile ZwiftPower` +
    `, pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nAjouter un dual recording sur ton profile ZwiftPower.
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zp_dual_recording.png';
    dialogDiscordTitle.value = `Dual Recording ZwiftPower`;
    dialogDiscordUsers.value = usersNotCompliant.value.zp_dual_compliance.filter((user) => user.discord_id);
  } else if (type === 'zp_strava_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir lié ton profile strava dans ton profile ZwiftPower` +
    `, pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\n1) Aller dans ton profile ZwiftPower: un dual recording sur ton profile ZwiftPower (https://zwiftpower.com/profile.php).\n` +
    `2) Cliquer sur Settings et puis Strava account.
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/zp_strava.png';
    dialogDiscordTitle.value = `Lien Strava -> ZwiftPower`;
    dialogDiscordUsers.value = usersNotCompliant.value.zp_strava_compliance.filter((user) => user.discord_id);
  } else if (type === 'strava_url_compliance') {
    dialogDiscordMessage.value = `Salut <nom>, il semblerait que tu ne sembles pas avoir un profile Strava associé à ton compte ItWatts.` +
    `, pas de soucis, je suis ici pour t'aider!\n\n` +
    `***Solution:***\nContact Jonathan Bisson pour associer ton compte Strava à ton compte ItWatts.
    \nSi tu as de la difficulté, contact une personne de l'administration 5.W.4.T.
    \nMerci!`;
    dialogDiscordImgName.value = 'conformite/strava_itwatts.png';
    dialogDiscordTitle.value = `Lien Strava -> ITWatts`;
    dialogDiscordUsers.value = usersNotCompliant.value.strava_url_compliance.filter((user) => user.discord_id);
  }

  dialogDiscordUsersName.value = dialogDiscordUsers.value.map((user) => `${user.first_name} ${user.last_name}`);
  dialogProgressPourcent.value = 0;
  dialogDiscord.value = true;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendDiscordMessage(test) {
  const todayDate = new Date();
  const comment = {
    date: todayDate.toISOString(),
    assignedTo: 'ITWatts',
    comment: `ITWatts (initié par ${useUserProfile().first_name} ${useUserProfile().last_name}) ${test ? '*TEST*' : ''} a envoyé un message discord en lien avec sa conformité 5.W.4.T [${dialogDiscordTitle.value}]`
  }
  if (test) {
    dialogDiscordUsers.value = [dialogDiscordTestUser.value];
  }
  try {    
    for (let i = 0;i < dialogDiscordUsers.value.length;i++) {
      dialogProgressPourcent.value = i / dialogDiscordUsers.value.length * 100;
      console.log(`user: ${dialogDiscordUsers.value[i].id} ${dialogDiscordUsers.value[i].first_name} ${dialogDiscordUsers.value[i].admin_comments}`)
      
      const description = dialogDiscordMessage.value.replace('<nom>', dialogDiscordUsers.value[i].first_name);
      let response = await axios.post(`${config.serverApi.publicHostname}/v1/discord/sendMessage`,
      {
        userIDs: [dialogDiscordUsers.value[i].discord_id], // hugues
        //userIDs: ["577332327622115349"], // jo
        messageTitle: `!!! CONFORMITÉ 5.W.4.T !!! [${dialogDiscordTitle.value}]`,
        messageDescription: description,
        messageImgName: dialogDiscordImgName.value
      },
      {
        withCredentials: true
      });
      
      dialogDiscordUsers.value[i].admin_comments.push(comment);
      await axios.patch(`${config.serverApi.publicHostname}/v1/users/${dialogDiscordUsers.value[i].id}`,
      {
        admin_comments: dialogDiscordUsers.value[i].admin_comments
      },
      {
        withCredentials: true
      });
    }

  } catch (error: any) {
    errorOccured.value = true;
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${error} stack: ${error.stack}`);
  }
  dialogDiscord.value = false;
}

async function save() {
  try {
    //const adminComments = [];
    const adminComments = dialogAdminComments.value;
    adminComments.push({
      date: new Date(),
      assignedTo: dialogAssignedTo.value,
      comment: dialogNewComment.value
    });

    const response = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${dialogUserID.value}`,
    {
      admin_comments: adminComments
    },
    {
      withCredentials: true
    });
  } catch (error: any) {
    errorOccured.value = true;
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }
  return dialog.value = false;
}

function editComment(name: any, user_id: any, admin_comments: any) {
  dialogTitle.value = name;
  dialogUserID.value = user_id;
  dialogAdminComments.value = admin_comments;
  dialog.value = true;
}

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        title="Erreur"
        text="Oupss, une erreur est survenue..."
        v-if="errorOccured"
      ></v-alert>
    </v-col>
    <v-col cols="12" sm="12" lg="12">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('swatCompliance.pageTitle') }}</h2>
          </div>
          <v-col cols="3" sm="3" lg="3">
            <v-text-field
              v-model="searchValue"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              placeholder="Recherche"
              hide-details
              density="compact"
            ></v-text-field>
          </v-col>
          <div class="align-center">
            <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
            <EasyDataTable
                :search-field="['name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="usersResult.value"
                alternating>
                <template #item-zwift_name_compliance="{ zwift_name_compliance, zwift_name }">
                  <v-tooltip
                    activator="parent"
                    v-if="zwift_name_compliance === '❌'"
                  >{{ zwift_name || 'Dois joindre le club 5.W.4.T sous companion'}}</v-tooltip>{{ zwift_name_compliance }}
                </template>
                <template #item-discord_profile_compliance="{ discord_profile_compliance }">
                  <v-tooltip
                    activator="parent"
                    v-if="discord_profile_compliance === '❌'"
                  >{{ 'N\'a pas de compte discord'}}</v-tooltip>{{ discord_profile_compliance }}
                </template>
                <template #item-compliance_percentage="{ compliance_percentage }">
                  {{ compliance_percentage }}%
                </template>
                <template #item-zwift_status_compliance="{ zwift_status_compliance, zwift_status }">
                  <v-tooltip
                    activator="parent"
                    v-if="zwift_status_compliance === '❌'"
                  >{{ zwift_status || 'Dois joindre le club 5.W.4.T sous companion'}}</v-tooltip>{{ zwift_status_compliance }}
                </template>
                <template #item-zp_primary_team_name_compliance="{ zp_primary_team_name_compliance, zp_primary_team_name }">
                  <v-tooltip
                    activator="parent"
                    v-if="zp_primary_team_name_compliance === '❌'"
                  >{{ zp_primary_team_name}}</v-tooltip>{{ zp_primary_team_name_compliance }}
                </template>
                <template #item-zp_nb_days_last_updated_weight_compliance="{ zp_nb_days_last_updated_weight_compliance, zp_nb_days_last_updated_weight }">
                  <v-tooltip
                    activator="parent"
                    v-if="zp_nb_days_last_updated_weight_compliance === '❌' && zp_nb_days_last_updated_weight"
                  >{{ zp_nb_days_last_updated_weight}}</v-tooltip>{{ zp_nb_days_last_updated_weight_compliance }}
                </template>
                <template #item-zp_dual_compliance="{ zp_dual_compliance, zp_dual }">
                  <v-tooltip
                    activator="parent"
                    v-if="zp_dual_compliance === '❌' && zp_dual"
                  >{{ zp_dual }}</v-tooltip>{{ zp_dual_compliance }}
                </template>
                <template #item-name="{ name, id, zp_id }">
                  <!-- <a :href="'/itwatts/user/profile/' + id">{{ first_name }} {{ last_name }}</a>-->
                  <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>
                </template>
                <template #item-admin_action="{ first_name, last_name, id, admin_comments }">
                    <v-btn color="primary" @click="editComment(first_name + ' ' + last_name, id, admin_comments)" size="x-small">+</v-btn>
                </template>
                <template #item-admin_comments="{ admin_comments }">
                  {{ admin_comments.length > 0 ? 
                    `${admin_comments[admin_comments.length - 1].assignedTo || '' }` : '' }}<br>
                    {{ admin_comments.length > 0 ? 
                    `${admin_comments[admin_comments.length - 1].date.split('T')[0]}` : '' }}
                </template>
                <template #item-strava_url_compliance="{ strava_url_compliance }">
                  <v-tooltip
                    activator="parent"
                    v-if="strava_url_compliance === '❌'"
                  >{{ 'N\'a pas de compte strava'}}</v-tooltip>{{ strava_url_compliance }}
                </template>             
                <template #header-zwift_name_compliance="zwift_name_compliance">
                  <div>{{ zwift_name_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zwift_name_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zwift_status_compliance="zwift_status_compliance">
                  <div>{{ zwift_status_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zwift_status_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zp_primary_team_name_compliance="zp_primary_team_name_compliance">
                  <div>{{ zp_primary_team_name_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zp_primary_team_name_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zp_bio_compliance="zp_bio_compliance">
                  <div>{{ zp_bio_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zp_bio_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zp_nb_days_last_updated_weight_compliance="zp_nb_days_last_updated_weight_compliance">
                  <div>{{ zp_nb_days_last_updated_weight_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zp_nb_days_last_updated_weight_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zp_dual_compliance="zp_dual_compliance">
                  <div>{{ zp_dual_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zp_dual_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-zp_strava_compliance="zp_strava_compliance">
                  <div>{{ zp_strava_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('zp_strava_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>
                <template #header-strava_url_compliance="strava_url_compliance">
                  <div>{{ strava_url_compliance.text }}
                  <v-btn v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])" color="primary" @click="openDiscordDialog('strava_url_compliance')" size="x-small">ITWatts</v-btn></div>
                </template>                
            </EasyDataTable>
            <v-dialog v-model="dialog" max-width="500">
              <v-card>
                <v-form ref="myform" v-model="isFormValid">   
                  <v-card-text>
                    <h4 class="text-h3 mb-4">{{ dialogTitle }}</h4>
                    <p>
                      <span
                        v-for="(comment,lineNumber) of dialogAdminComments.value" 
                        v-bind:key="lineNumber" >
                        {{ dateFormat(new Date(comment.date)) }} <b>{{ comment.assignedTo }}</b>: {{ comment.comment }}<br/>
                      </span><br>
                      </p>
                      <v-select        
                      :items="['Jo', 'Hugues', 'Noémie', 'Nina', 'Francis', 'Jasmin']"
                      label="Assigné à..."
                      v-model="dialogAssignedTo"
                      :rules="rulesRequired"
                      required
                    ></v-select>
                    <v-textarea outlined name="newComment" v-model="dialogNewComment"  label="Commentaire..." :rules="rulesRequired"></v-textarea>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="save" :disabled="!isFormValid">Sauvegarder</v-btn>
                    <v-btn color="primary" @click="dialog = false">Fermer</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDiscord" max-width="500">
              <v-card>                
                <v-card-text>
                  <v-progress-linear                  
                    v-model="dialogProgressPourcent"
                    v-if="dialogProgressPourcent !== 0"                  
                    color="primary"
                    height="25"                    
                  >
                    <template v-slot:default="{ value }">
                      <strong>{{ Math.ceil(value) }}%</strong>
                    </template>
                  </v-progress-linear>
                  <h4 class="text-h3 mb-4">Confirmer l'envoi de message Discord [{{ dialogDiscordTitle }}]</h4>
                  <h6 class="text-h6 mb-4">Message:</h6>
                  <v-textarea outlined name="newComment" v-model="dialogDiscordMessage"  label=""></v-textarea>
                  <h6 class="text-h6 mb-4">Destinataires ({{ dialogDiscordUsers.value.length }}):</h6>
                  <p>
                    <span
                      v-for="(user,lineNumber) of dialogDiscordUsersName.value" 
                      v-bind:key="lineNumber" >
                      - {{ user }}<br> 
                    </span><br><br>
                  </p>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="sendDiscordMessage" :disabled="dialogProgressPourcent !== 0">Envoyer!</v-btn>
                  <v-btn color="primary" @click="sendDiscordMessage('test')" :disabled="dialogProgressPourcent !== 0">Test!</v-btn>
                  <v-btn color="primary" @click="dialogDiscord = false">Annuler</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
