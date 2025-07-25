import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue';
import { router } from './router';
import { Icon } from '@iconify/vue';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import { fakeBackend } from '@/utils/helpers/fake-backend';
import 'vue3-carousel/dist/carousel.css';
//Mock Api data
import './_mockApis';
import Maska from 'maska';
// print
// import print from 'vue3-print-nb';
// Table
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';
//i18
import { i18n } from './i18n';

//ScrollTop
import VueScrollTo from 'vue-scrollto';
//import  VueGoogleMaps from 'vue-google-maps-community-fork';

//LightBox
import VueEasyLightbox from 'vue-easy-lightbox';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
fakeBackend();
app.use(router);
app.component('EasyDataTable', Vue3EasyDataTable);
app.use(PerfectScrollbar);
app.use(pinia);
app.use(VueTablerIcons);
app.use(i18n);
app.use(Maska);
app.use(VueApexCharts);
app.use(vuetify).mount('#app');
app.component('Icon', Icon);
//ScrollTop Use
//Lightbox
app.use(VueEasyLightbox);

app.use(VueScrollTo, {
    duration: 1000,
    easing: "ease"
});