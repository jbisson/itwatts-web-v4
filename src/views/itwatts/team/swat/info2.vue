<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useCookies } from "vue3-cookies";

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { decodeBase64 } from '@/utils/string';
import { addUserCompliance } from '@/utils/zp';
import { useTeamStore } from '@/stores/apps/teams';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatInfo.pageTitle') });
const team = ref();
const userResult = reactive([] as any);
const loading = ref(false);
const errorOccured = ref(false);

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatInfo.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatInfo.pageTitle'),
    disabled: true,
  },
]);
const userStoreProfile = useUserProfile();

async function refresh() {
  if (!security.isTokenValid([])) {
    console.log('Token not valid.');
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (useTeamStore().myTeams) {
    team.value = useTeamStore().myTeams.find((team: any) => team.name === 'swat');
  } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
    team.value = useTeamStore().teams.find((team: any) => team.name === 'swat');
  }
  
  if (!team.value || !(team.value.managers.includes(useUserProfile().user_id) ||
    team.value.riders.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN']))) {    
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
  
  let hasRoleRequired = false;
  userResult.value = {};
  loading.value = true;
  errorOccured.value = false;

  //if (!userStoreProfile || !userStoreProfile.zp_id) {
  if (true) {
    const { cookies } = useCookies();
    const userCookie = cookies.get('user');
    if (userCookie) {
      const token = JSON.parse(decodeBase64(userCookie.split('.')[1]).toString());
      //const token = VueJwtDecode.decode(userCookie);
      console.log('token: ' + JSON.stringify(token));

      if (token.id) {
        try {
          const response = await axios.get<any>(`${config.serverApi.publicHostname}/v1/users/${token.id}`, {
            withCredentials: true});

            const user = response.data;
            addUserCompliance(user);

            console.log('zp_id: ' + user.zp_id);
            // userStoreProfile.profile.zp_id = response.data.zp_id;
            //console.log('response.data: ' + JSON.stringify(response.data));
          
            userStoreProfile.user_id = user.id;
            userStoreProfile.zp_id = user.zp_id,
            userStoreProfile.first_name = user.first_name,
            userStoreProfile.last_name = user.last_name,
            userStoreProfile.email = user.email;
            //userStoreProfile.profile_url = token.profile_url;
            
            console.log(user.first_name)
            userResult.value = user;            
        } catch (error: any) {
          errorOccured.value = true;
          if (error.response && error.response.status === 401) {
            router.push({ path: '/itwatts/signin' });
          }
          console.log('an error occured: ' + error);
        }
      }   
    }
  }
  loading.value = false;
}

watch(() => [], refresh);
refresh();

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="8" sm="8" lg="8">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h2">Annonces</h2>            
          </div>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/cVwadIjDoWE?si=-Syg4GCDBTGBoMmS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/IPcfsvifiDg?si=o-cr3sajkdUJ-z5g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>          
        </v-card-text>
      </v-card>  
    </v-col> 
  </v-row>
  <v-row>
    <v-col cols="8" sm="8" lg="8">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        title="Erreur"
        text="Oupss, une erreur est survenue..."
        v-if="errorOccured"
      ></v-alert>
      <v-progress-linear v-if="loading"
        indeterminate
        stream
        color="primary"
      ></v-progress-linear>
      <v-card v-if="false">
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h2">Conformité 5.W.4.T</h2>
          </div>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <div class="align-center">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Salut {{ userStoreProfile.first_name }}! Ton taux de conformité 5.W.4.T est de <b>{{ userResult.value.compliance_percentage }}%</b>!<br><br>
              Tous les points ci-dessous sont expliqués en détails dans notre Charte d'équipe: <a href="http://charte.5w4t.com/" target="_blank">http://charte.5w4t.com</a>
            </div>
            
            <br><h2 class="mb-1">{{ userResult.value.discord_profile_compliance }} Discord</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.discord_profile_compliance === '❌'">
              Tu ne sembles pas avoir associé ton compte à un profile Discord.<br><br>
              <b>Solution:</b> Joindre le serveur 5.W.4.T <a href="http://discord.5w4t.com" target="_blank">http://discord.5w4t.com</a> et veuillez contacter Jonathan Bisson lorsque ce sera fait.
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zwift_name_compliance }} Zwift name</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zwift_name_compliance === '❌'">
              Tu ne sembles pas avoir le tag du <b>5.W.4.T</b> dans ton identifiant zwift.<br><br>
              <b>Solution:</b> Ajouter <b>[5.W.4.T]</b> à la fin de ton identifiant Zwift.<br>
              Tout ce qui précède le « In-game Team Tag » exigé est à l’entière discrétion du membre; il peut inclure un second « Team tag », une appartenance à une équipe/club IRL, etc...<br>
              <b>Exemple:</b> Jo [RPV][5.W.4.T]
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zwift_status_compliance }} Zwift 5.W.4.T club status</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zwift_status_compliance === '❌'">
              Tu ne sembles pas avoir joint le club <b>5.W.4.T</b> sous companion.<br><br>
              <b>Solution:</b> Joindre le club 5.W.4.T ici: <a href="https://www.zwift.com/clubs/29068f3d-089c-4a38-842e-f67e8a4d52ef/home" target="_blank">
                https://www.zwift.com/clubs/29068f3d-089c-4a38-842e-f67e8a4d52ef/home</a>
            </div>
            
            <br><h2 class="mb-1">{{ userResult.value.zp_primary_team_name_compliance }} ZwiftPower équipe primaire</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zp_primary_team_name_compliance === '❌'">
              Tu ne sembles pas avoir mis le 5.W.4.T comme équipe primaire sous ZwiftPower.<br><br>
              <b>Solution:</b><br> 1) S'assurer d'avoir joint l'équipe 5.W.4.T
                <a href="https://zwiftpower.com/team.php?id=19126" target="_blank">https://zwiftpower.com/team.php?id=19126</a><br>
                2) Cliquer sur "My Teams" et le boutton "Make 5.W.4.T my Primary team".
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zp_bio_compliance }} ZwiftPower bio</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zp_bio_compliance === '❌'">
              Ton setup Zwift ne sembles pas affiché dans ta bio sous ZwiftPower.<br><br>
              <b>Solution:</b><br> Tappe la commande /zwiftpower-bio-club1 dans un salon Discord et suivez les instructions.
              (Une vidéo explicative est disponible pour les étapes ici: <a href="https://www.youtube.com/watch?v=IPcfsvifiDg" target="_blank">https://www.youtube.com/watch?v=IPcfsvifiDg</a>)
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zp_nb_days_last_updated_weight_compliance }} ZwiftPower dernière pesée (nb jours &lt; 365)</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zp_nb_days_last_updated_weight_compliance === '❌'">
              Ton poid ne sembles pas avoir été mise à jour depuis plus d'un an sous Zwift / ZwiftPower.<br><br>
              <b>Solution:</b><br>Inscrire ton poid à jour dans Zwift companion.
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zp_dual_compliance }} ZwiftPower dual recording</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zp_dual_compliance === '❌'">
              Tu ne sembles pas avoir de dual recording dans ton profile ZwiftPower.<br><br>
              <b>Solution:</b><br>Ajouter un dual recording sur ton profile ZwiftPower. Contacter une personne de l'admin 5.W.4.T si tu as besoin d'aide.
            </div>

            <br><h2 class="mb-1">{{ userResult.value.zp_strava_compliance }} Lien Strava -> ZwiftPower</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.zp_strava_compliance === '❌'">
              Tu ne sembles pas avoir lié ton profile strava dans ton profile ZwiftPower<br><br>
              <b>Solution:</b><br>1) Aller dans ton profile ZwiftPower: un dual recording sur ton profile ZwiftPower (https://zwiftpower.com/profile.php).<br>
              2) Cliquer sur Settings et puis Strava account.
            </div>

            <br><h2 class="mb-1">{{ userResult.value.strava_url_compliance }} Lien Strava -> ITWatts</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3" v-if="userResult.value.strava_url_compliance === '❌'">
              Tu ne sembles pas avoir un profile Strava associé à ton compte ItWatts.<br><br>
              <b>Solution:</b><br>Contact Jonathan Bisson pour associer ton compte Strava à ton compte ItWatts.
            </div>
          </div>
        </v-card-text>
      </v-card>  
    </v-col>  
  </v-row>
  <v-row>
    <v-col cols="8" sm="8" lg="8">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h2">Le saviez-vous?</h2>            
          </div>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            Page facebook du 5.W.4.T : <a href="https://facebook.5w4t.com" target="_blank">https://facebook.5w4t.com</a><br><br>
            Page Instagram du 5.W.4.T : <a href="https://instagram.5w4t.com" target="_blank">https://instagram.5w4t.com</a><br><br>
            Club 5.W.4.T sur strava : <a href="https://strava.5w4t.com" target="_blank">https://strava.5w4t.com</a><br><br>
            Squad 5.W.4.T sous xert : <a href="https://xert.5w4t.com" target="_blank">https://xert.5w4t.com</a>
          </div>          
        </v-card-text>
      </v-card>  
    </v-col> 
  </v-row>
</template>
