<script setup lang="ts">
import { ref, onMounted, computed, reactive, onBeforeUpdate } from 'vue';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useI18n } from 'vue-i18n';
import security from '@/security';

const props = defineProps<{
  userID: any,
  visible: any,
  name: any,
  stravaActivites: any,
}>();

const emit = defineEmits(['update:dialog', 'handledialog', 'loginRequired'])
const powerDialogVisible = computed({
  // getter
  get() {
    return props.visible;
  },
  // setter
  set(value) {    
    emit('update:dialog', value)    
  }
})

const powerDialogData = reactive([] as any);
const rides = reactive([] as any);
const powerDialogDataStravaChart = ref([]);
const powerDialogDataStravaTitle = ref();
const powerDialogRange = ref();
const stravaActivityStartDate = ref(new Date());
const stravaActivityEndDate = ref(new Date());
const powerDialogStartDate = ref();
const powerDialogEndDate = ref();
const powerDialogEffortDuration = ref();
const powerSource = ref('strava');
const includeVirtualRides = ref(true);
const includeIRLRides = ref(true);
const maxMonths = ref();

powerDialogData.value = {
  name: '',
}

const { t } = useI18n({ useScope: 'global' });
const stravaHeaders: Header[] = reactive([
  { text: 'Ride', value: "name", sortable: true },  
  { text: 'Date', value: "start_date", sortable: true },  
  { text: 'Type', value: "type", sortable: true },
  { text: 'Distance', value: "distance", sortable: true },
  { text: 'Best 15secs', value: "peak_power.15", sortable: true },
  { text: 'Best CP1', value: "peak_power.60", sortable: true },
  { text: 'Best CP5', value: "peak_power.300", sortable: true },
  { text: 'Best CP20', value: "peak_power.1200", sortable: true },
  { text: 'Best CP60', value: "peak_power.3600", sortable: true },
]);

const scatterChart = {
  chartOptions: {
    chart: {
      zoom: {
        enabled: true,
        type: "xy",
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tickAmount: 7,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
    },
    tooltip: {
      theme: "dark",
    },
  },
};

function loadGraph(seconds: number) {
  // console.log(`loadGraph: ${seconds}`);
  if (!props.stravaActivites.value) {
    return;
  }
  let peakPower = [...props.stravaActivites.value].sort((ride1, ride2) => ((ride2.peak_power && ride2.peak_power[seconds]) || 0) - ((ride1.peak_power && ride1.peak_power[seconds]) || 0));
  
  let peakPowerVirtual = peakPower.filter((ride) => ride.type === 'VirtualRide' && ride.peak_power && ride.peak_power[seconds] && ride.device_watts);
  let peakPowerIrl = peakPower.filter((ride) => ride.type !== 'VirtualRide' && ride.peak_power && ride.peak_power[seconds] && ride.device_watts);
  
  peakPowerVirtual = peakPowerVirtual.slice(0, 30);
  peakPowerIrl = peakPowerIrl.slice(0, 30);
  const secsToName = new Map();
  secsToName.set(1, '1 Sec');
  secsToName.set(5, '5 Sec');
  secsToName.set(15, '15 Sec');
  secsToName.set(30, '30 Sec');
  secsToName.set(60, '1 Min');
  secsToName.set(120, '2 Mins');
  secsToName.set(240, '4 Mins');
  secsToName.set(300, '5 Mins');
  secsToName.set(600, '10 Mins');
  secsToName.set(720, '12 Mins');
  secsToName.set(1200, '20 Mins');
  secsToName.set(3600, '1 Hrs');
  secsToName.set(7200, '2 Hrs');
  secsToName.set(10800, '3 Hrs');
  powerDialogDataStravaTitle.value = t('powerComponent.bestEffort', [secsToName.get(seconds)]);

  powerDialogDataStravaChart.value = [
    {
      name: t('powerComponent.virtual'),
      data: peakPowerVirtual.map(ride => [new Date(ride.start_date), ride.peak_power && ride.peak_power[seconds], ride.name, ride.id])
    },
    {
      name: t('powerComponent.irl'),
      data: peakPowerIrl.map(ride => [new Date(ride.start_date), ride.peak_power && ride.peak_power[seconds], ride.name, ride.id])
    }
  ]
  powerDialogEffortDuration.value = `${seconds}`;
}

function clickHandler(event: any, chartContext: any, config: any) {
  if (config.seriesIndex > 0) {
    console.log(`SeriesIndex: ${config.seriesIndex} dataPointIndex: ${config.dataPointIndex} value: ${powerDialogDataStravaChart.value[config.seriesIndex].data[config.dataPointIndex]}`);
    window.open(`https://www.strava.com/activities/${powerDialogDataStravaChart.value[config.seriesIndex].data[config.dataPointIndex][3]}`);
  } else if (event.target.innerHTML === t('powerComponent.virtual')) {    
    includeVirtualRides.value = event.target.attributes['data:collapsed'].value == 'true' ? true : false;    
    refresh();
  } else if (event.target.innerHTML === t('powerComponent.irl')) {
    includeIRLRides.value = event.target.attributes['data:collapsed'].value == 'true' ? true : false;
    refresh();
  }  
}

function powerDialogDateRangeChanged() {
  const newStartDate = new Date(new Date(stravaActivityStartDate.value).setMonth(stravaActivityStartDate.value.getMonth() + powerDialogRange.value[0]));
  const newEndDate = new Date(new Date(stravaActivityStartDate.value).setMonth(stravaActivityStartDate.value.getMonth() + powerDialogRange.value[1]));

  powerDialogStartDate.value = `${Math.floor(newStartDate.getFullYear())}-${minTwoDigits(newStartDate.getMonth()+1)}`;
  powerDialogEndDate.value = `${Math.floor(newEndDate.getFullYear())}-${minTwoDigits(newEndDate.getMonth()+1)}`;
}

function powerDialogDateRangeReleased() {
  refresh();
}

function minTwoDigits(n: any) {
  return (n < 10 ? '0' : '') + n;
}

async function refresh() {
  // console.log('refresh');
  if (!security.isTokenValid([])) {
    return emit('loginRequired');
  }

  if (powerSource.value === 'strava') {
    if (!props.stravaActivites || !props.stravaActivites.value) {
      return;
    }

    let strava_rides = [...props.stravaActivites.value];
    strava_rides = strava_rides.filter((ride) => {
      if (includeVirtualRides.value && ride.type === 'VirtualRide') {
        return true;
      } else if (includeIRLRides.value && ride.type !== 'VirtualRide') {
        return true;
      }
      return false;
    });
    strava_rides = strava_rides.filter((ride) => ride.peak_power && ride.peak_power['1']);

    if (!maxMonths.value) {
      stravaActivityStartDate.value = new Date(strava_rides.reduce((oldest, currentObj) => {
        return (currentObj.start_date < oldest.start_date) ? currentObj : oldest;
      }).start_date);
      stravaActivityEndDate.value = new Date(strava_rides.reduce((oldest, currentObj) => {
        return (currentObj.start_date > oldest.start_date) ? currentObj : oldest;
      }).start_date);
      maxMonths.value = (stravaActivityEndDate.value.getFullYear() - stravaActivityStartDate.value.getFullYear()) * 12 +
        (stravaActivityEndDate.value.getMonth() - stravaActivityStartDate.value.getMonth());      
        console.log(maxMonths.value)
      powerDialogRange.value = [0, maxMonths.value];
      powerDialogDateRangeChanged();
    }

    strava_rides = strava_rides.filter((ride) => 
      new Date(ride.start_date.substring(0, 7)) >= new Date(powerDialogStartDate.value) &&
      new Date(ride.start_date.substring(0, 7)) <= new Date(powerDialogEndDate.value)
    );
        
    rides.value = strava_rides;

    if (powerDialogDataStravaChart.value.length === 0) {
      loadGraph(parseInt(powerDialogEffortDuration.value));
    }    
  } else if (powerSource.value === 'zwiftPower') {
    console.log('zwiftPower');
  }
}

onBeforeUpdate(() => {
  maxMonths.value = null;
  rides.value = [];
  powerDialogEffortDuration.value = '1200';
  powerDialogDataStravaChart.value = [];

  refresh();
})

//watch(() => [], refresh);
//refresh();

</script>
<template>
  <v-dialog v-model="powerDialogVisible">
    <v-card>
      <v-card-item>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h3">
            {{ props.name }}
          </div>
          <v-btn            
            icon="mdi-close"
            variant="text"
            @click="$emit('handledialog')">
          </v-btn>
        </v-card-title>
      </v-card-item>
      <v-divider class="border-opacity-50"></v-divider>
      <v-form>
        <v-card-text>
          <v-row>
            <v-col cols="1" class="py-0">
              <v-text-field
                  v-model="powerDialogStartDate"
                  density="compact"
                  type="text"
                  variant="outlined"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="py-0">
              <v-range-slider
                v-model="powerDialogRange"
                @update:modelValue="powerDialogDateRangeChanged"
                @end="powerDialogDateRangeReleased"
                :step="1"
                :max="maxMonths"
                min="0"
                strict
              >
              </v-range-slider>
            </v-col>
              <v-col cols="1" class="py-0">
              <v-text-field
                v-model="powerDialogEndDate"
                density="compact"
                type="text"
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-chip-group
                selected-class="text-primary"
                filter
                mandatory
                v-model="powerSource"
                @click="refresh()"
              >
              <v-chip value="strava">Strava</v-chip>
              <v-chip value="zwiftPower" disabled>Zwift Power</v-chip>
            </v-chip-group>                        
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-chip-group
                selected-class="text-primary"
                filter
                mandatory
                v-model="powerDialogEffortDuration"
              >
              <v-chip value="1" @click="loadGraph(1)">1 Sec</v-chip>
              <v-chip value="5" @click="loadGraph(5)">5 Secs</v-chip>
              <v-chip value="15" @click="loadGraph(15)">15 Secs</v-chip>
              <v-chip value="30" @click="loadGraph(30)">30 Secs</v-chip>
              <v-chip value="60" @click="loadGraph(60)">1 Min</v-chip>
              <v-chip value="120" @click="loadGraph(120)">2 Mins</v-chip>
              <v-chip value="240" @click="loadGraph(240)">4 Mins</v-chip>
              <v-chip value="300" @click="loadGraph(300)">5 Mins</v-chip>
              <v-chip value="600" @click="loadGraph(600)">10 Mins</v-chip>
              <v-chip value="720" @click="loadGraph(720)">12 Mins</v-chip>
              <v-chip value="1200" @click="loadGraph(1200)">20 Mins</v-chip>
              <v-chip value="3600" @click="loadGraph(3600)">1 Hr</v-chip>
              <v-chip value="7200" @click="loadGraph(7200)">2 Hrs</v-chip>
              <v-chip value="10800" @click="loadGraph(10800)">3 Hrs</v-chip>
            </v-chip-group>                        
            </v-col>
          </v-row>                    
          <v-row>
            <v-col cols="12">
              <h4 class="text-h3">{{ powerDialogDataStravaTitle }}</h4>                       
              <apexchart @click="clickHandler"
                type="scatter"
                height="265"
                :options="scatterChart.chartOptions"
                :series="powerDialogDataStravaChart"
              ></apexchart>
              <EasyDataTable                      
                :headers="stravaHeaders"
                :items="rides.value"
                alternating
                >
                <template #item-start_date="{ start_date }">
                  {{ start_date.split('T')[0] }}
                </template>
                <template #item-distance="{ distance }">
                  {{ Math.round(distance / 100) / 10 }}
                </template>
                <template #item-name="{ name, id }">                          
                  <a :href="'https://www.strava.com/activities/' + id" target="_blank">{{ name }}</a>
                </template>
              </EasyDataTable>
            </v-col>
          </v-row> 
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="$emit('handledialog')">{{ t('actions.close') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
