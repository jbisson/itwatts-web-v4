<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, computed, useAttrs, reactive, onBeforeUpdate, watch } from 'vue';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { SphericalUtil } from "node-geometry-library";
import { useUserProfile } from "@/stores/user-profile";
import config from "@/config/config.json";
import StravaLocation from "@/components/itwatts/strava/StravaLocation.vue";
import { round } from '@/utils/numbers';
import { rawTimeSecsToFriendlyTime } from '@/utils/string';
import { useI18n } from 'vue-i18n';
import security from '@/security';
import { parseJsonSourceFileConfigFileContent } from 'typescript';

const props = defineProps<{
  userID: any,
  visible: any,
  name: any,
  gender: any,
  userStravaTopSegments: any
  stravaAthleteID: any
}>();
const attrs = useAttrs();
const emit = defineEmits(['update:dialog','handledialog', 'loginRequired'])

const dialog = computed({
  // getter
  get() {
    return props.visible;
  },
  // setter
  set(value) {    
    emit('update:dialog', value);
  }
});

const loading = ref(false);
const segmentType = ref('location');
const gravelSegment = ref(true);
const roadSegment = ref(true);
const myMapRef = ref();
const path = ref();
const centerLocation = ref();
const stravaSegmentsProcessed = reactive([] as any);
const stravaSegmentsSelected = reactive([] as any);
const segmentsOnMap = reactive([] as any);
const dateRange = ref();
const distanceRange = ref([0, 100]);
const powerDialogStartDate = ref();
const powerDialogEndDate = ref();
const filterOptions = ref();
const windDirections = ref();
const userStravaSegmentsStarred = ref();
const userStravaSegmentsActivity = ref();
const locationDialogVisible = ref(false);
const searchAddress = ref();
const segmentOptions = ref('allSegments');
const showHiddenSegments = ref(false);
const reverseCourse = ref(false);
let maxMonths = 0;
const openedMarkerUrl = ref();
const locationStravaSegments = ref();
const activityFile = ref();
stravaSegmentsProcessed.value = [];
stravaSegmentsSelected.value = [];
segmentsOnMap.value = [];
const stravaUserActivity = ref();
const stravaUserActivities = ref();
const infoAlert = ref();
const errorAlert = ref();
const warningAlert = ref();
let hiddenStravaSegments = new Set();
searchAddress.value = `${useUserProfile().search_address} -> ${useUserProfile().search_area_size}km`;

const { t } = useI18n({ useScope: 'global' });

const stravaHeaders: Header[] = reactive([
  { text: t('common.segmentName'), value: "name", sortable: true },  
  { text: 'Dist ance', value: "distance", width: 75, sortable: true },
  { text: t('stravaSegmentComponent.averageGradient'), value: "average_grade", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.elevationDiff'), value: "total_elevation_gain", width: 10, sortable: true },
  { text: 'Nb', value: "athlete_count", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.windDirection'), value: "wind_direction", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.komMName'), value: "kom_m_name", sortable: true },
  { text: t('stravaSegmentComponent.komMTime'), value: "kom_m_time", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.komMSpeed'), value: "kom_m_avg_speed", width: 85, sortable: true },
  { text: t('stravaSegmentComponent.komFName'), value: "kom_f_name", sortable: true },
  { text: t('stravaSegmentComponent.komFTime'), value: "kom_f_time", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.komFSpeed'), value: "kom_f_avg_speed", width: 85, sortable: true },  
  { text: t('stravaSegmentComponent.lastModified'), value: "start_date", width: 100, sortable: true },
  { text: t('stravaSegmentComponent.hisHerTime'), value: "last_modified", width: 100, sortable: true },
  { text: 'Pos ition', value: "rank", width: 10, sortable: true },
  { text: t('stravaSegmentComponent.hisHerTime'), value: "elapsed_time", width: 65, sortable: true },
  { text: t('stravaSegmentComponent.gap'), value: "elapsed_time_vs_kom", width: 65, sortable: true },
  { text: t('actions.actions'), value: "actions", sortable: true },  
]);
 
function loadGraph() {
  console.log(`loadGraph`);
  if (!props.userStravaTopSegments.value) {
    return;
  }
}

function dateRangeChanged() {
  powerDialogStartDate.value = `${Math.floor(2015 + dateRange.value[0] / 12)}-${minTwoDigits((dateRange.value[0]%12)+1)}`;
  powerDialogEndDate.value = `${Math.floor(2015 + dateRange.value[1] / 12)}-${minTwoDigits((dateRange.value[1]%12)+1)}`;  
}

function minTwoDigits(n: any) {
  return (n < 10 ? '0' : '') + n;
}

function openStravaLocationDialog() {
  locationDialogVisible.value = true;
}

function onLocationChanged() {
  console.log('on location changed');
  locationStravaSegments.value = null;

  //console.log(`onLocationChanged: ${obj.location.lat}, ${obj.location.lng} areaSize: ${obj.areaSize} address: ${obj.address}`);
  searchAddress.value = `${useUserProfile().search_address} -> ${useUserProfile().search_area_size}km`;
  onFilterChanged();
  refresh();
}

onFilterChanged();
function onFilterChanged() {
  // console.log('onFilterChanged');
  stravaSegmentsSelected.value = [];
  
  const searchAreaSize = useUserProfile().search_area_size * 1000;
  filterOptions.value = [];  
  
  filterOptions.value.push({
    field: 'start_latlng',
    comparison: (valuesField: any, criterias: any) => {
      if (segmentType.value !== 'location') {
        return true;
      }
      if (!valuesField || valuesField.length !== 2) {
        return true;
      }
      let distance = SphericalUtil.computeDistanceBetween(
        useUserProfile().search_location,
        {lat: valuesField[0], lng: valuesField[1]} 
      );
      if (Math.abs(distance) < searchAreaSize) {
        return true;
      }
      return false;
    },
    criteria: '',
  });
  filterOptions.value.push({
    field: 'wind_direction',
    comparison: (valuesField: any, criterias: any) => {
      if (!criterias || criterias.length === 0) {
        return true;
      }
      if (valuesField) {
        for (const criteria of criterias) {
          for (const value of valuesField) {
            if (value === criteria) {
              return true;
            }
          }
        }
      }
      
      return false;
    },
    criteria: windDirections.value,
  });

  filterOptions.value.push({
    field: 'start_date',
    comparison: (valuesField: any, criterias: any) => {
      if (segmentOptions.value === 'userSegments') {
        return (new Date(valuesField.substring(0, 7)) >= new Date(powerDialogStartDate.value) &&
          new Date(valuesField.substring(0, 7)) <= new Date(powerDialogEndDate.value));
      }
      return true;
    },
    criteria: '',
  });

  filterOptions.value.push({
    field: 'distance',
    comparison: (valueField: any, criterias: any) => {
      if (distanceRange.value && distanceRange.value[0] !== 0 && valueField < distanceRange.value[0] * 1000) {
        return false;
      } else if (distanceRange.value && distanceRange.value[1] !== 100 && valueField > distanceRange.value[1] * 1000) {
        return false;
      }
      return true;
    },
    criteria: '',
  });

  filterOptions.value.push({
    field: 'hidden',
    comparison: (valueField: any, criterias: any) => {
      return showHiddenSegments.value || !valueField;
    },
    criteria: '',
  });

  filterOptions.value.push({
    field: 'hazardous',
    comparison: (valueField: any, criterias: any) => {
      return !valueField;
    },
    criteria: '',
  });
}

async function refreshKom(segment_id: any) {
  let response = await axios.post(`${config.serverApi.publicHostname}/v1/sync/strava-activity-segments-leaderboard`,
  {
    segmentId: segment_id
  },
  {
    withCredentials: true
  });
}

//watch(myMapRef, googleMap => {
  /*if (googleMap) {
    googleMap.$mapPromise.then(map => {
      if (tableItems.length > 0) {
        segmentsOnMap.value = tableItems.map((tableItem: any) => {
          return {
            segment_id: tableItem.id,
            segment_url: `https://www.strava.com/segments/${tableItem.id}`,
            segment_name: tableItem.name,
            segment_distance: tableItem.distance,
            polyline: google.maps.geometry.encoding.decodePath(tableItem.map.polyline),
            strokeOpacity: 0.2
          }
        });
        // console.log(JSON.stringify(segmentsOnMap.value));
      }      
    });
  }*/
//});

async function refresh() {
  console.log('refresh');

  if (!security.isTokenValid([])) {
    return emit('loginRequired');
  }
    
  errorAlert.value = '';
  stravaSegmentsProcessed.value = [];
  stravaSegmentsSelected.value = [];
  hiddenStravaSegments = new Set(useUserProfile().strava_preferences.hidden_segments);

  if (!userStravaSegmentsStarred.value) {
    try {
      loading.value = true;
      const stravaStarredSegmentsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/strava-segments/starred`, {
        withCredentials: true,
      });
      userStravaSegmentsStarred.value = new Map(stravaStarredSegmentsResponse.data.data.map((userStravaSegment: any) => [userStravaSegment.id, userStravaSegment]));  
    } catch (err: any) {
      console.log(`Error occured: ${err} stack: ${err.stack}`);
      errorAlert.value = t('errors.errorOccured', [err]);
    } finally {
      loading.value = false;
    }
  }
  
  if (segmentType.value === 'location') {    
    if (!locationStravaSegments.value) {
      try {
        loading.value = true;
        const locationStravaSegmentsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/strava-segments` +
        `?lat=${useUserProfile().search_location.lat}&lng=${useUserProfile().search_location.lng}&area_size=${useUserProfile().search_area_size * 1000}`, {
          withCredentials: true,
        });
        locationStravaSegments.value = locationStravaSegmentsResponse.data.data;        
      } catch (err: any) {
        console.log(`Error occured: ${err} stack: ${err.stack}`);
        errorAlert.value = t('errors.errorOccured', [err]);
      } finally {
        loading.value = false;
      }
    }
    
    if (locationStravaSegments.value.length > 0) {
      const userStravaTopSegments = new Map(props.userStravaTopSegments.value ? props.userStravaTopSegments.value.map((userStravaTopSegment: any) => [userStravaTopSegment.segment_id, userStravaTopSegment]) : []);  
      for (let i = 0;i < locationStravaSegments.value.length;i++) {
        const stravaSegment =  Object.assign({}, locationStravaSegments.value[i].value);
        processStravaSegment(stravaSegment, locationStravaSegments.value[i], userStravaTopSegments);
        stravaSegmentsProcessed.value.push(stravaSegment);    
      }
    }    
  } else if (segmentType.value === 'strava') {
    if (!stravaUserActivities.value || stravaUserActivity.value) {
      try {
        loading.value = true;

        if (!stravaUserActivities.value) {
          const lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 2);
          const stravaActivityResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users/${props.userID}?fields=strava_activities(activities_detail)&strava_activities(activities.start_date)=>${lastYear.toISOString()}`, {
            withCredentials: true,
          });
          if (stravaActivityResponse.data.strava_activities) {
            userStravaSegmentsActivity.value = stravaActivityResponse.data.strava_activities.activities_detail
            .sort((activityDetail1: any, activityDetail2: any) => 
              (new Date(activityDetail2.start_date).getTime() - 
              new Date(activityDetail1.start_date).getTime()));
            
            stravaUserActivities.value = userStravaSegmentsActivity.value.map((activity_detail: any) => 
              {
                //console.log(JSON.stringify(activity_detail));
                return {
                  text: `${activity_detail.start_date.split('T')[0]} ${activity_detail.name} ${round(activity_detail.distance / 1000, 0)}km`,
                  value: activity_detail.id
                }
              });
          }          
        }
        if (stravaUserActivity.value) {
          const activity = userStravaSegmentsActivity.value.find((activity: any) => activity.id == stravaUserActivity.value);
          let stravaSegments;
          if (reverseCourse.value) {
            //console.log(JSON.stringify(activity));
            const stravaSegmentsResponse = await axios.post(`${config.serverApi.publicHostname}/v1/strava-segments`, {
              polyline: activity.map.polyline,
              reverse_course: reverseCourse.value
            }, {
              withCredentials: true,
            });
            stravaSegments = stravaSegmentsResponse.data.data;            
          } else {
            const activitySegmentIDs = new Map(activity.segment_efforts.map((segmentEffort: any) => [segmentEffort.segment.id, segmentEffort.segment]));
            
            const stravaSegmentsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/strava-segments?` +
              `segment_id=${[...activitySegmentIDs.keys()].toString()}`, {
              withCredentials: true,
            });
            stravaSegments = stravaSegmentsResponse.data.data;
          }
          
          for (let i = 0;i < stravaSegments.length;i++) {
            const stravaSegment =  Object.assign({}, stravaSegments[i].value);
            const userStravaTopSegments = new Map(props.userStravaTopSegments.value.map((userStravaTopSegment: any) => [userStravaTopSegment.segment_id, userStravaTopSegment]));
            
            processStravaSegment(stravaSegment, stravaSegments[i], userStravaTopSegments);            
            stravaSegmentsProcessed.value.push(stravaSegment);    
          }
        }
      } catch (err: any) {
        console.log(`Error occured: ${err} stack: ${err.stack}`);
        errorAlert.value = t('errors.errorOccured', [err]);
      } finally {
        loading.value = false;
      }
    }    
  } else if (segmentType.value === 'gpx') { 
    onActivityFileUploaded();
  }
}

function processStravaSegment(stravaSegment: any, stravaSegmentDb: any, userStravaTopSegments: any) {
  if (stravaSegmentDb.processed) {
      stravaSegment.wind_direction = stravaSegmentDb.processed.wind_direction;
  }
  let foundLeaderboard = false;
  if (stravaSegmentDb.leaderboard_f && 
    stravaSegmentDb.leaderboard_f.top_results && stravaSegmentDb.leaderboard_f.top_results.length > 0) {
    const time = stravaSegmentDb.leaderboard_f.top_results[0].elapsed_time_raw;
    const avgSpeed = stravaSegmentDb.leaderboard_f.top_results[0].avg_speed.split('<')[0];
    
    stravaSegment.kom_f_name = stravaSegmentDb.leaderboard_f.top_results[0].display_name;
    stravaSegment.kom_f_time = time;
    stravaSegment.kom_f_avg_speed = avgSpeed;
    
    const userLeaderboard = stravaSegmentDb.leaderboard_f.top_results.filter((topResults: any) => topResults.athlete_id == props.stravaAthleteID);
    if (userLeaderboard.length === 1) {
      foundLeaderboard = true;
      stravaSegment.rank = userLeaderboard[0].rank;
      stravaSegment.elapsed_time = userLeaderboard[0].elapsed_time_raw;
      stravaSegment.start_date = userLeaderboard[0].start_date_local_raw;
    }
  }
  if (stravaSegment.id === 12524624) {
    //console.log(JSON.stringify(stravaSegmentDb.leaderboard_m));
  }
  
  if (stravaSegmentDb.leaderboard_m && 
    stravaSegmentDb.leaderboard_m.top_results && stravaSegmentDb.leaderboard_m.top_results.length > 0) {    
    const time = stravaSegmentDb.leaderboard_m.top_results[0].elapsed_time_raw;
    const avgSpeed = stravaSegmentDb.leaderboard_m.top_results[0].avg_speed.split('<')[0];

    stravaSegment.kom_m_name = stravaSegmentDb.leaderboard_m.top_results[0].display_name;
    stravaSegment.kom_m_time = time;
    stravaSegment.kom_m_avg_speed = avgSpeed;

    const userLeaderboard = stravaSegmentDb.leaderboard_m.top_results.filter((topResults: any) => topResults.athlete_id == props.stravaAthleteID);
    if (userLeaderboard.length === 1) {
      foundLeaderboard = true;
      stravaSegment.rank = userLeaderboard[0].rank;
      stravaSegment.elapsed_time = userLeaderboard[0].elapsed_time_raw;
      stravaSegment.start_date = userLeaderboard[0].start_date_local_raw;
    }    
  }

  if (!foundLeaderboard && userStravaTopSegments.has(stravaSegment.id)) {      
    const userStravaSegment = userStravaTopSegments.get(stravaSegment.id) as any;
    stravaSegment.rank = userStravaSegment.rank;
    stravaSegment.start_date = userStravaSegment.date;
    stravaSegment.elapsed_time = userStravaSegment.elapsed_time;
  }

  if (stravaSegment.elapsed_time) {
    if (props.gender === 'M') {
      stravaSegment.elapsed_time_vs_kom = stravaSegment.elapsed_time - stravaSegment.kom_m_time;      
    } else {
      stravaSegment.elapsed_time_vs_kom = stravaSegment.elapsed_time - stravaSegment.kom_f_time;
    }
  }

  stravaSegment.distance = parseFloat(stravaSegment.distance);    
  stravaSegment.total_elevation_gain = round(stravaSegment.total_elevation_gain, 1);

  stravaSegment.hidden = hiddenStravaSegments.has(stravaSegment.id) ? true : false;
  stravaSegment.starred = userStravaSegmentsStarred.value.has(stravaSegment.id);
  stravaSegment.last_modified = stravaSegmentDb.last_modified;
}

onBeforeUpdate(() => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  maxMonths = (currentYear - 2015) * 12 + currentMonth;
  dateRange.value = [maxMonths - 12, maxMonths];
  dateRangeChanged();
  onFilterChanged();

  //refresh();
})

async function onActivityFileUploaded() {
  console.log('onActivityFileUploaded');
  errorAlert.value = '';
  stravaSegmentsProcessed.value = [];
  stravaSegmentsSelected.value = [];
  if (activityFile.value && activityFile.value.name.length > 0) {    
    try {
      loading.value = true;

      let response = await axios.post(`${config.serverApi.publicHostname}/v1/route`, {
        file: activityFile.value
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const routePoints = response.data.tracks[0].points;
      response = await axios.post(`${config.serverApi.publicHostname}/v1/strava-segments`, {
          route_points: routePoints,
          reverse_course: reverseCourse.value
        }, {
          withCredentials: true,
      });
      const responseStravaSegements = response.data.data;
      for (let i = 0;i < responseStravaSegements.length;i++) {
        const stravaSegment =  Object.assign({}, responseStravaSegements[i].value);
        const userStravaTopSegments = new Map(props.userStravaTopSegments.value.map((userStravaTopSegment: any) => [userStravaTopSegment.segment_id, userStravaTopSegment]));
        processStravaSegment(stravaSegment, responseStravaSegements[i], userStravaTopSegments);
        //console.log(JSON.stringify(stravaSegment));
        stravaSegmentsProcessed.value.push(stravaSegment);
      }
      
      /*stravaSegmentsProcessed.value.push({
        id: 1,
        name: 'Full Route',
        polyline: routePoints,
        selected: true,
      });*/
    } catch (err: any) {
      console.log(`Error occured in route: ${err} stack: ${err.stack}`);        
      errorAlert.value = t('errors.errorOccured');
    } finally {
      loading.value = false;
    }
  } else {
    segmentsOnMap.value = [];
  }
}

const onUpdateFilter = (items: any) => {
  //console.log(`onUpdateFilter ${items.length}`);
  return;
  if (stravaSegmentsSelected.value.length === 0) {
    const showSegmentOnlySegment = items.find((item: any) => item.showSegmentOnly === true);
    if (showSegmentOnlySegment) {
      segmentsOnMap.value = [
        {
          segment_id: showSegmentOnlySegment.id,
          segment_url: `https://www.strava.com/segments/${showSegmentOnlySegment.id}`,
          segment_name: showSegmentOnlySegment.name,
          segment_distance: showSegmentOnlySegment.distance,
          polyline: showSegmentOnlySegment.polyline ? showSegmentOnlySegment.polyline : '',
          //polyline: showSegmentOnlySegment.polyline ? showSegmentOnlySegment.polyline : google.maps.geometry.encoding.decodePath(showSegmentOnlySegment.map.polyline),
          selected: false,
        } 
      ]
    } else {
      segmentsOnMap.value = items.map((tableItem: any) => {
        return {
          segment_id: tableItem.id,
          segment_url: `https://www.strava.com/segments/${tableItem.id}`,
          segment_name: tableItem.name,
          segment_distance: tableItem.distance,
          polyline: tableItem.polyline ? tableItem.polyline : '',
          //polyline: tableItem.polyline ? tableItem.polyline : google.maps.geometry.encoding.decodePath(tableItem.map.polyline),
          selected: false,
        }
      });
    }

    if (segmentType.value === 'location' && segmentsOnMap.value.length > 0) {
      // console.log(JSON.stringify(segmentsOnMap.value[0]));
      /*centerLocation.value = {
        lat: segmentsOnMap.value[0].polyline[0].lat,
        lng: segmentsOnMap.value[0].polyline[0].lng,
      }*/
    }
  }  
};

function showSegmentOnlyOnMap(segmentId: number, showSegmentOnly: boolean) {
  for (const stravaSegmentProcessed of stravaSegmentsProcessed.value) {
    stravaSegmentProcessed.showSegmentOnly = (stravaSegmentProcessed.id === segmentId && showSegmentOnly) ? true : false;
  }  
}

/*function openMarker(segment: any) {
  if (!segment) {
    return;
  }
  console.log(`items selected: ${segment.segment_id} ${segment.segment_url}`);
  const segmentFull = stravaSegmentsProcessed.value.find((seg: any) => seg.id === segment.segment_id);
  const segmentsOnMapFull = segmentsOnMap.value.find((seg: any) => seg.segment_id === segment.segment_id);
  segmentsOnMapFull.selected = segmentsOnMapFull.selected ? false : true;
  
  //segmentsOnMapFull.strokeOpacity = segmentsOnMapFull.strokeOpacity === 0.2 ? 0.9 : 0.2;
  
  const selectedIndex = stravaSegmentsSelected.value.findIndex((seg: any) => seg.id === segment.segment_id)
  if (selectedIndex === -1) {
    stravaSegmentsSelected.value.push(segmentFull);
  } else {
    stravaSegmentsSelected.value.splice(selectedIndex, 1);    
  }
  
  openedMarkerUrl.value = segment.segment_url;
}*/

/*function getSegmentStrokeOpacity(segment: any) {
  if (segment.selected) {
    return 0.8;
  } else {
    return 0.2;
  }  
}

function getSegmentStrokeColor(segment: any) {
  if (segment.segment_distance < 1000) {
    return '#FF0000';    
  } else if (segment.segment_distance < 5000) {
    return '#0000FF';
  } else {
    return '#00FF00';    
  }  
}*/

async function changeUserSegmentVisibility(segmentId: number, hidden: boolean) {
  
  if (!hidden && hiddenStravaSegments.has(segmentId)) {
    hiddenStravaSegments.delete(segmentId);
  } else {
    hiddenStravaSegments.add(segmentId);
  }

  useUserProfile().strava_preferences.hidden_segments = Array.from(hiddenStravaSegments.values());

  const segmentProcessed = stravaSegmentsProcessed.value.find((segment: any) => segment.id === segmentId);
  segmentProcessed.hidden = hidden;

  try {
    loading.value = true;
    await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`, {
      strava_preferences: {
        hidden_segments: useUserProfile().strava_preferences.hidden_segments
      },
    }, {
      withCredentials: true,
    });
  } catch (err: any) {
    console.log(`Error occured in segment visibility: ${err} stack: ${err.stack}`);        
    errorAlert.value = t('errors.errorOccured');
  } finally {
    loading.value = false;
  }
}

async function onStravaActivityChanged(stravaActivityID: string) {
  const activity = userStravaSegmentsActivity.value.find((activity: any) => activity.id == stravaUserActivity.value);  

  
  //console.log(JSON.stringify(activity.segment_efforts));
  const activitySegmentIDs = new Map(activity.segment_efforts.map((segmentEffort: any) => [segmentEffort.segment.id, segmentEffort.segment]));
    
  try {
    loading.value = true;
    const stravaSegmentsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/strava-segments?` +
    `segment_id=${[...activitySegmentIDs.keys()].toString()}`, {
      withCredentials: true,
    });

    const stravaSegments = stravaSegmentsResponse.data.data;
    for (let i = 0;i < stravaSegments.length;i++) {
      const stravaSegment =  Object.assign({}, stravaSegments[i].value);
      const userStravaTopSegments = new Map(props.userStravaTopSegments.value.map((userStravaTopSegment: any) => [userStravaTopSegment.segment_id, userStravaTopSegment]));
      
      processStravaSegment(stravaSegment, stravaSegments[i], userStravaTopSegments);      
      stravaSegmentsProcessed.value.push(stravaSegment);    
    }    
  } catch (err: any) {
    console.log(`Error occured: ${err} stack: ${err.stack}`);
    errorAlert.value = t('errors.errorOccured', [err]);
  } finally {
    loading.value = false;
  }
}

function changeUserSegmentStarred(segmentId: number, starred: boolean) {  
  axios.put(`${config.serverApi.publicHostname}/v1/strava-segments/${segmentId}/starred`, {
    id: segmentId,
    starred: starred
  }, {
    withCredentials: true,
  })
  .then(response => {
    if (response.status !== 200) {                
      console.log('An error has occured.');
      errorAlert.value = t('errors.errorOccured');
      return;
    }

    const segmentProcessed = stravaSegmentsProcessed.value.find((segment: any) => segment.id === segmentId);
    segmentProcessed.starred = starred;
  }).catch(function (err) {
    console.log(`Error occured: ${err} stack: ${err.stack}`);
    errorAlert.value = t('errors.errorOccured', [err]);
  }); 
}

//watch(() => [], refresh);
refresh();
</script>
<template>
  <v-form>
    <v-dialog v-model="dialog">
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
          <v-card-text>
          <v-row>
            <v-col cols="12">
            <v-alert
              style="white-space: pre-line;"
              density="compact"
              type="info"
              :text="infoAlert"
              v-if="infoAlert"
            ></v-alert>    
            <v-alert
              style="white-space: pre-line;"
              density="compact"
              type="error"
              :text="errorAlert"
              v-if="errorAlert"
            ></v-alert>
            <v-alert
              style="white-space: pre-line;"
              density="compact"
              type="warning"
              :text="warningAlert"
              v-if="warningAlert"
            ></v-alert><br>
            </v-col>      
          </v-row>
            <v-row>
              <v-col class="py-0">              
                <v-radio-group inline v-model="segmentType" :update:modelValue="refresh()">
                  <v-radio :label="t('stravaSegmentComponent.location')" value="location" ></v-radio>
                  <v-radio :label="t('stravaSegmentComponent.stravaActivity')" value="strava"></v-radio>
                  <v-radio :label="t('stravaSegmentComponent.gpxActivityFile')" value="gpx"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row v-if="segmentType === 'gpx'">
              <v-col cols="6" class="py-0">
                <div class="d-flex align-center">
                  <v-file-input :label="t('stravaSegmentComponent.activityGpx')"
                  accept=".gpx"
                  v-model="activityFile"></v-file-input>
                </div>
              </v-col>
            </v-row>
            <v-row v-if="segmentType === 'location'">
              <v-col>
                <v-radio-group inline v-model="segmentOptions">
                  <v-radio :label="t('stravaSegmentComponent.allSegments')" value="allSegments"></v-radio>
                  <v-radio :label="t('stravaSegmentComponent.segmentWithResults')" value="userSegments" ></v-radio>                  
                </v-radio-group>
              </v-col>
            </v-row>            
            <v-row v-if="segmentType === 'location'">
              <v-col>
                <v-btn @click="openStravaLocationDialog()" prepend-icon="mdi-map-marker">{{ searchAddress }}</v-btn>
                <StravaLocation :visible="locationDialogVisible" @handledialog="locationDialogVisible = false" @onLocationChange="onLocationChanged()" :retain-focus="false"></StravaLocation>
              </v-col>
            </v-row>
            <v-row v-if="segmentType === 'strava'">
              <v-col cols="9" md="4">
                <v-autocomplete
                    v-model="stravaUserActivity"
                    :label="t('common.activity')"
                    :items="stravaUserActivities"
                    :item-title="'text'"
                    :item-value="'value'"
                    variant="outlined"
                    @change="refresh()"
                  ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-switch :label="t('stravaSegmentComponent.viewHiddenSegments')" color="primary" v-model="showHiddenSegments"></v-switch>
                <v-switch :label="t('stravaSegmentComponent.reverseCourse')" color="primary" v-model="reverseCourse" v-if="segmentType === 'gpx' || segmentType === 'strava'" @change="refresh()"></v-switch>
              </v-col>            
              <v-col cols="3" class="py-0" v-if="false">
                <v-checkbox
                  v-model="gravelSegment"
                  hide-details
                  color="primary"
                  label="Gravel"
                ></v-checkbox>
                <v-checkbox
                  v-model="roadSegment"
                  hide-details
                  color="primary"
                  label="Route"
                ></v-checkbox>
              </v-col>
            </v-row>
            <v-row v-if="false">
              <v-col cols="1">
                <v-text-field
                    v-model="powerDialogStartDate"
                    density="compact"
                    type="text"
                    variant="outlined"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="2">
                <v-range-slider
                  v-model="dateRange"
                  @update:modelValue="dateRangeChanged"
                  @end="onFilterChanged"
                  :step="1"
                  :max="maxMonths"
                  min="0"
                  strict
                >
                </v-range-slider>
              </v-col>
                <v-col cols="1">
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
              <v-col cols="3" md="1">
                <div class="text-caption">
                    Distance
                  </div>
              </v-col>
              <v-col cols="9" md="3">              
                  <v-range-slider
                    v-model="distanceRange"
                    :step="1"
                    :max="100"
                    :min="0"
                    strict
                    thumb-label="always"
                    @end="onFilterChanged"
                  >
                  </v-range-slider>               
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" >
                <v-chip-group
                  v-model="windDirections"
                  selected-class="text-primary"                
                  filter                
                  multiple
                  @update:modelValue="onFilterChanged"
                >
                <v-chip value="N">N</v-chip>
                <v-chip value="NE">NE</v-chip>
                <v-chip value="E">E</v-chip>
                <v-chip value="SE">SE</v-chip>
                <v-chip value="S">S</v-chip>
                <v-chip value="SW">SW</v-chip>
                <v-chip value="W">W</v-chip>
                <v-chip value="NW">NW</v-chip>
              </v-chip-group>                        
              </v-col>
            </v-row>            
            <v-row>
              <v-col cols="12">
                <v-progress-linear v-if="loading"
                  indeterminate
                  stream
                  color="primary"
                ></v-progress-linear>
                <!--
                <GMapMap
                  ref="myMapRef"
                  :center="centerLocation ? centerLocation : useUserProfile().search_location"
                  :zoom="12 - (useUserProfile().search_area_size / 100) * 4"
                  style="height: 30rem"
                >
                <GMapPolyline
                  v-for="segment in segmentsOnMap.value"
                  :key="segment.segment_id"
                  :path="segment.polyline"
                  @click="openMarker(segment)"
                  :options="{
                    strokeColor: getSegmentStrokeColor(segment),
                    strokeOpacity: getSegmentStrokeOpacity(segment),
                    strokeWeight: 5,
                    icons: [{
                      icon: { 
                        path: 'M 1.5 1 L 1 0 L 1 2 M 0.5 1 L 1 0',
                        fillColor: 'black',
                        strokeColor: 'black',
                        strokeWeight: 2,
                        strokeOpacity: 1
                      },
                      offset: '10px',
                      repeat: '50px'
                    }]}"
                :editable="false"/>
                <GMapCluster
                  :minimumClusterSize="15">
                  <GMapMarker
                    v-for="segment in segmentsOnMap.value"
                    :position="segment.polyline[0]"
                    @click="openMarker(segment)"
                    :icon="'https://developers.google.com/maps/documentation/javascript/examples/full/images/info-i_maps.png'"
                  >                
                  </GMapMarker>
              </GMapCluster>
              </GMapMap>-->
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <EasyDataTable
                  :headers="stravaHeaders"
                  :items="stravaSegmentsSelected.value.length > 0 ? stravaSegmentsSelected.value : stravaSegmentsProcessed.value"
                  :filter-options="filterOptions"
                  :rows-per-page="20"
                  alternating
                  multi-sort
                  @updateFilter="onUpdateFilter"
                  >
                  <template #item-start_date="{ start_date }">
                    {{ start_date ? start_date.split('T')[0] : '' }}
                  </template>
                  <template #item-last_modified="{ last_modified }">
                    {{ last_modified ? last_modified.split('T')[0] : '' }}
                  </template>
                  <template #item-average_grade="{ average_grade }">
                    {{ average_grade }} %
                  </template>
                  <template #item-total_elevation_gain="{ total_elevation_gain }">
                    {{ total_elevation_gain }}m
                  </template>
                  <template #item-distance="{ distance }">
                    {{ (distance / 1000).toFixed(2) }} km
                  </template>
                  <template #item-kom_m_avg_speed="{ kom_m_avg_speed }">
                    {{ kom_m_avg_speed }} km/h
                  </template>
                  <template #item-kom_f_avg_speed="{ kom_f_avg_speed }">
                    {{ kom_f_avg_speed }} km/h
                  </template>
                  <template #item-actions="{ id, actions, hidden, starred, showSegmentOnly }">
                    <div class="d-flex align-center justify-center">
                      <v-btn density="default" @click="changeUserSegmentVisibility(id, true)" icon="mdi-eye-outline" size="x-small" v-if="!hidden"></v-btn>&nbsp;
                      <v-btn density="default" @click="changeUserSegmentVisibility(id, false)" icon="mdi-eye-off" size="x-small" v-if="hidden"></v-btn>&nbsp;
                      <v-btn density="default" @click="changeUserSegmentStarred(id, true)" icon="mdi-star-outline" size="x-small" v-if="!starred"></v-btn>&nbsp;
                      <v-btn density="default" @click="changeUserSegmentStarred(id, false)" icon="mdi-star" size="x-small" v-if="starred"></v-btn>&nbsp;
                      <v-btn density="default" @click="showSegmentOnlyOnMap(id, false)" icon="mdi-map-marker" size="x-small" v-if="showSegmentOnly"></v-btn>&nbsp;
                      <v-btn density="default" @click="showSegmentOnlyOnMap(id, true)" icon="mdi-map-marker-off" size="x-small" v-if="!showSegmentOnly"></v-btn>&nbsp;
                      <v-btn color="primary" @click="refreshKom(id)" icon="mdi-refresh" size="x-small">
                      <!--    <v-tooltip
                          activator="parent"
                          location="start">Rafraichir</v-tooltip>  -->
                          <v-icon color="grey-lighten-1">mdi-refresh</v-icon>
                          
                      </v-btn>
                      </div>
                  </template>
                  <template #item-kom_m_time="{ kom_m_time }">
                    {{ rawTimeSecsToFriendlyTime(kom_m_time) }}
                  </template>
                  <template #item-kom_f_time="{ kom_f_time }">
                    {{ rawTimeSecsToFriendlyTime(kom_f_time) }}
                  </template>
                  <template #item-elapsed_time="{ elapsed_time }">
                    {{ rawTimeSecsToFriendlyTime(elapsed_time) }}
                  </template>
                  <template #item-elapsed_time_vs_kom="{ elapsed_time_vs_kom }">
                    {{ rawTimeSecsToFriendlyTime(elapsed_time_vs_kom) }}
                  </template>
                  <template #item-name="{ name, id, segment_effort_id }">
                    <a :href="'https://www.strava.com/segments/' + id" target="_blank">{{ name }}</a>
                  </template>
                </EasyDataTable>              
              </v-col>
            </v-row>            
          </v-card-text>
          <v-card-actions>          
            <v-btn color="primary" @click="$emit('handledialog')">{{ t('actions.close') }}</v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>
