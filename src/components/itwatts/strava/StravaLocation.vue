<script setup lang="ts">
import leaflet from 'leaflet';
import 'leaflet-control-geocoder';

import { useUserProfile } from "../../../stores/user-profile";
import { ref, onMounted, onUpdated, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import config from "@/config/config.json";


const props = defineProps<{
  visible: any,
}>();

const myMapRef = ref();
const areaSize = ref(useUserProfile().search_area_size);

const emit = defineEmits(['update:dialog', 'handledialog', 'onLocationChange']);
const mapElement = ref();

const dialogVisible = computed({
  // getter
  get() {
    return props.visible;
  },
  // setter
  set(value) {    
    emit('update:dialog', value)    
  }
})

const { t } = useI18n({ useScope: 'global' });
let map;
async function refresh() {
  console.log('refresh location');
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(setCurrentPosition, currentPositionError);  
  } else {
    drawLeaflet(useUserProfile().search_location);
  }
}

onUpdated(() => {
  refresh();
});

function drawLeaflet(location: any) {
  if (mapElement.value && Object.keys(mapElement.value).length == 0) {
    map = leaflet.map(mapElement.value).setView([location.lat, location.lng], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    leaflet.circle([location.lat, location.lng],
      {  radius: areaSize.value * 1000, }).addTo(map);


  }
}
function setCurrentPosition(position: any) {
  useUserProfile().search_location = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  
  console.log(`user location based on browser location: ${position.coords.latitude},${position.coords.longitude}`);
  drawLeaflet(useUserProfile().search_location);

  let geocoder = leaflet.Control.Geocoder.nominatim();
  geocoder.reverse({ lat: position.coords.latitude, lng: position.coords.longitude }, map.options.crs.scale(15)).then(results => {
    
    if (results && results.length > 0 && results[0].properties && results[0].properties.address) {
      useUserProfile().search_location.city = results[0].properties.address.city || '';
      useUserProfile().search_location.state = results[0].properties.address.state || '';
      useUserProfile().search_location.country = results[0].properties.address.country || '';
      // console.log(useUserProfile().search_location);
    } else {
      console.log("No results found");
    }
  });
}

function currentPositionError(error: any) {
  // User has denied location access or other error
}

function onAreaSizeChanged() {
  console.log(`Area size changed to: ${areaSize.value} km`);
  useUserProfile().search_area_size = areaSize.value;
  
  if (map) {
    map.eachLayer(layer => {
      if (layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });
    leaflet.circle([useUserProfile().search_location.lat, useUserProfile().search_location.lng],
    {  radius: areaSize.value * 1000, }).addTo(map);
  }
}
/*watch(myMapRef, googleMap => {
  if (useUserProfile().search_address) {
    searchAddress.value = useUserProfile().search_address;
  } else if (googleMap) {
    googleMap.$mapPromise.then(map => {
      navigator.geolocation.getCurrentPosition(setCurrentPosition, currentPositionError);
    });
  }
});*/

function geocodePosition() {
  /*const geocoder = new google.maps.Geocoder();
  console.log(`Getting geocode for: [${useUserProfile().search_location.lat}, ${useUserProfile().search_location.lon}]`);
  geocoder
    .geocode({ location: useUserProfile().search_location })
    .then((response: any) => {
      if (response.results[0]) {
        console.log('Setting ' + response.results[0].formatted_address);
        searchAddress.value = response.results[0].formatted_address;
        useUserProfile().search_address = response.results[0].formatted_address;        
      } else {
        window.alert("No results found");
      }
    })
    .catch((e: any) => window.alert("Geocoder failed due to: " + e));*/
}

</script>
<template>
  <v-form>
    <v-dialog v-model="dialogVisible" max-width="1000">
      <v-card>
        <v-card-item>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h3">
            {{ t('stravaLocationComponent.searchArea') }}
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
                <v-slider
                  v-model="areaSize"
                  :max="100"
                  :min="1"
                  :step="1"
                  thumb-label="always"
                  @end="onAreaSizeChanged"
                ></v-slider>
                <!--<GMapAutocomplete
                  :placeholder="searchAddress"
                  @place_changed="setPlace"
                  style="font-size: medium"
                  :select-first-on-enter="true"
                  class="text-green"
                  :options="{}"
                >
                </GMapAutocomplete>   -->
                <br><br>
                <!--<GMapMap ref="myMapRef"
                :center="useUserProfile().search_location"
                :zoom="12 - (areaSize / 100) * 4"
                style="height: 30rem"
                >
                <GMapMarker
                  :position="useUserProfile().search_location"
                ></GMapMarker>
                <GMapCircle        
                  :radius="areaSize * 1000"
                  :center="useUserProfile().search_location"
                  :options="{ strokeColor: '#0000FF', strokeOpacity: 0.7, fillColor: '#0000FF', fillOpacity: 0.1, }"                
                />
                </GMapMap>-->
                <div id="map" ref="mapElement" style="height: 500px;"></div>
              </v-col>
            </v-row> 
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="$emit('onLocationChange');$emit('handledialog')">{{ t('actions.close') }}</v-btn>
          </v-card-actions>      
      </v-card>
    </v-dialog>
  </v-form>
</template>
