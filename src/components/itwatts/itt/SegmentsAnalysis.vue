<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { round } from '@/utils/numbers';
import { rawTimeSecsToFriendlyTime } from '@/utils/string';

const props = defineProps<{
  height: any,
  weight: any,
  power: any,
  visible: any,
  name: any,
  segments: any,
}>();

const emit = defineEmits(['update:dialog', 'handledialog'])
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

const powerDialogStravaRides = reactive([] as any);
const powerDialogSegments = reactive([] as any);
const powerDialogDataStravaChart = ref();
const powerDialogDataStravaTitle = ref();
const powerDialogRange = ref();
const powerDialogStartDate = ref();
const powerDialogEndDate = ref();
const powerDialogEffortDuration = ref();
let maxMonths = 0;

powerDialogStravaRides.value = [];
powerDialogSegments.value = [];

const segmentHeaders: Header[] = reactive([
  { text: 'Segment', value: "reference.name", sortable: true },
  { text: 'Temps (mm:ss.xx)', value: "real.time", sortable: true },
  { text: 'Temps référence (mm:ss.x)', value: "reference.time", sortable: true },
  { text: 'Gain de temps (mm:s)', value: "delta_time", sortable: true },
  { text: 'Vitesse (km/h)', value: "real.speed", sortable: true },
  { text: 'Vitesse (km/h) référence', value: "reference.speed", sortable: true },
  { text: 'Power (watts)', value: "real.power", sortable: true },
  { text: 'Distance (km)', value: "reference.dst", sortable: true },
  { text: 'Surface', value: "reference.srf", sortable: true },
  { text: 'Gradient (%)', value: "reference.grd", sortable: true },  
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

function loadGraph(seconds) {  
  if (!props.segments.value) {
    return;
  }
  let peakPower = [...powerDialogStravaRides.value].sort((ride1, ride2) => ((ride2.peak_power && ride2.peak_power[seconds]) || 0) - ((ride1.peak_power && ride1.peak_power[seconds]) || 0));
  
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
  powerDialogDataStravaTitle.value = `Meilleur effort sur ${secsToName.get(seconds)}`;

  powerDialogDataStravaChart.value = [
    {
        name: `Virtual ${secsToName.get(seconds)}`,
        data: peakPowerVirtual.map(ride => [new Date(ride.start_date), ride.peak_power && ride.peak_power[seconds], ride.name, ride.id])
    },
    {
        name: `IRL ${secsToName.get(seconds)}`,
        data: peakPowerIrl.map(ride => [new Date(ride.start_date), ride.peak_power && ride.peak_power[seconds], ride.name, ride.id])
    }
  ]
  powerDialogEffortDuration.value = `${seconds}`;
}

function clickHandler(event, chartContext, config) {
  console.log(`SeriesIndex: ${config.seriesIndex} dataPointIndex: ${config.dataPointIndex} value: ${powerDialogDataStravaChart.value[config.seriesIndex].data[config.dataPointIndex]}`)
  window.open(`https://www.strava.com/activities/${powerDialogDataStravaChart.value[config.seriesIndex].data[config.dataPointIndex][3]}`);
}

function powerDialogDateRangeChanged() {
  powerDialogStartDate.value = `${Math.floor(2015 + powerDialogRange.value[0] / 12)}-${minTwoDigits((powerDialogRange.value[0]%12)+1)}`;
  powerDialogEndDate.value = `${Math.floor(2015 + powerDialogRange.value[1] / 12)}-${minTwoDigits((powerDialogRange.value[1]%12)+1)}`;  
}

function powerDialogDateRangeReleased() {
  refresh();
}

function minTwoDigits(n: any) {
  return (n < 10 ? '0' : '') + n;
}

function surfaceToText(srf: any) {
  console.log(srf);
  if (srf === 't') return 'Tarmac';
  if (srf === 'd') return 'Dirt';
  if (srf === 'c') return 'Cobbles';
  if (srf === 's') return 'Sand';
  if (srf === 'g') return 'Gravel';
  if (srf === 'b') return 'Brick';
  if (srf === 'w') return 'Wood';
  if (srf === 'i') return 'Ice/Snow';  
}
async function refresh() {
  if (!props.segments) {
    return;
  }
  
  powerDialogSegments.value = [];

  const totalTimeSegment = {
    reference: {
      name: 'Total',
      time_raw: 0,
      time: ''
    },
    real: {
      time_raw: 0,
      time: ''
    },
    delta_time_raw: 0,
    delta_time: '',
  }

  for (let i = 0;i < props.segments.reference.segments.length;i++) {
    const segment = {
      reference: props.segments.reference.segments[i],
      real: props.segments.real ? props.segments.real.segments[i] : '',
      delta_time: props.segments.real ? round((props.segments.reference.segments[i].time_raw - props.segments.real.segments[i].time_raw), 1) : ''
    };

    totalTimeSegment.reference.time_raw += round(props.segments.reference.segments[i].time_raw, 1);
    if (props.segments.real) {
      totalTimeSegment.real.time_raw += props.segments.real.segments[i].time_raw;      
    }
    powerDialogSegments.value.push(segment);
  }

  
  totalTimeSegment.reference.time = rawTimeSecsToFriendlyTime(round(totalTimeSegment.reference.time_raw, 1));
  totalTimeSegment.real.time = rawTimeSecsToFriendlyTime(totalTimeSegment.real.time_raw);
  totalTimeSegment.delta_time = rawTimeSecsToFriendlyTime(round((totalTimeSegment.reference.time_raw - totalTimeSegment.real.time_raw), 1));
  powerDialogSegments.value.push(totalTimeSegment);

  console.log(JSON.stringify(powerDialogSegments.value));
}
onBeforeUpdate(() => {
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
            <v-col cols="12" sm="6" lg="6">
              <h4 class="text-h3">{{ powerDialogDataStravaTitle }}</h4>                       
                <!--<apexchart @click="clickHandler" type="scatter" height="265" :options="scatterChart.chartOptions" :series="powerDialogDataStravaChart"></apexchart>-->
              <h3>Grandeur (cm): </h3>{{ props.height }}
              <h3>Poids (kg): </h3> {{ props.weight }}
              <h3>Power de référence (watts):</h3> {{ props.power }}<br><br>
              <EasyDataTable                      
                :headers="segmentHeaders"
                :items="powerDialogSegments.value"
                alternating
                >
                <template #item-start_date="{ start_date }">
                  {{ start_date.split('T')[0] }}
                </template>
                <template #item-reference="{ reference }">
                  {{ surfaceToText(reference.srf) }}
                </template>
              </EasyDataTable>
            </v-col>
          </v-row> 
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="$emit('handledialog')">Fermer</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
