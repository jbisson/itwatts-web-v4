<script setup lang="ts">
import { useUserProfile } from "../../../stores/user-profile";
import { ref, onMounted, onUpdated, computed, watch } from 'vue';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { SphericalUtil } from "node-geometry-library";

import config from "@/config/config.json";
import leaflet from "leaflet";

const props = defineProps<{
  visible: any,
}>();

const myMapRef = ref();
const areaSize = ref(useUserProfile().search_area_size);
const searchAddress = ref('Recherche...');

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

async function refresh() {
  console.log('refresh location');
  if (mapElement.value && Object.keys(mapElement.value).length == 0) {
    const map = leaflet.map(mapElement.value).setView([useUserProfile().search_location.lat, useUserProfile().search_location.lng], 13);

    leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    leaflet.circle([useUserProfile().search_location.lat, useUserProfile().search_location.lng], {  radius: areaSize.value * 1000, }).addTo(map);
  }  
}

onUpdated(() => {
  refresh();
});

function setPlace(place: any) {
  if (!place.geometry) {
    return;
  }

  searchAddress.value = place.formatted_address;
  useUserProfile().search_location = {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng()
  };
  useUserProfile().search_address = place.formatted_address;
  useUserProfile().search_area_size = areaSize.value;

  console.log(`search_location for ${searchAddress.value} is : [${useUserProfile().search_location.lat},${useUserProfile().search_location.lng}]`);
}

function setCurrentPosition(position: any) {
  useUserProfile().search_location = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  
  console.log(`user location based on browser location: ${position.coords.latitude},${position.coords.longitude}`);
  geocodePosition();
}

function currentPositionError(error: any) {
  console.log(error);
}

function onAreaSizeChanged() {
  useUserProfile().search_area_size = areaSize.value;
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
  console.log(`Getting geocode for: [${useUserProfile().search_location.lat}, ${useUserProfile().search_location.lng}]`);
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
  <v-dialog v-model="dialogVisible" max-width="1000">
    <v-card>
      <v-card-item>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h3">
          Zone de recherche
        </div>
        <v-divider></v-divider>
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
          <v-btn color="primary" @click="$emit('onLocationChange');$emit('handledialog')">Fermer</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
