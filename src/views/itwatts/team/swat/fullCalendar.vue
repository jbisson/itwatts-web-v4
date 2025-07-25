<script>
import axios from 'axios';
import { defineComponent, watch, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import config from "@/config/config.json";

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();
const d = today.getDate();

const events = reactive([]);

export const INITIAL_EVENTS = [
]

async function refresh() {
  const eventsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/events`, {
      withCredentials: true,
    });
  console.log('done!');
  for (const event of eventsResponse.data.data) {
    events.push({
      id: event.id,
      title: event.name,
      start: event.start,
      end: event.end,
      color: '#615dff',
      allDay: true,
    });
  } 
}

watch(() => [], refresh);
refresh();

export function createEventId() {
  return String(eventGuid++)
}

export default defineComponent({
  components: {
    FullCalendar,
  },
  data() {
    return {
      updateModalShow: false,
      AddModal: false,
      calendarOptions: {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin // needed for dateClick
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth',
        initialEvents: events, // alternatively, use the `events` setting to fetch from a feed
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
      },
      currentEvents: [],
    }
  },
  methods: {
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
    },
    handleDateSelect(selectInfo) {
      this.AddModal = true;
      const title ='Please enter a new title for your event'
      const calendarApi = selectInfo.view.calendar
      calendarApi.unselect() // clear date selection
      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        })
      }
      
    },
    handleEventClick(clickInfo) {
      this.updateModalShow = true;
      // eventClick.clickInfo.event
    },
    handleEvents(events) {
      this.currentEvents = events;
    },
  }
})

</script>

<template>
  <div class='demo-app'>
    <div class='demo-app-main '>
      <FullCalendar class='demo-app-calendar rounded-md' :options='calendarOptions' >
        <template v-slot:eventContent='arg'>
          <div class="text-subtitle-1 pa-1 text-truncate">{{ arg.event.title }}</div>
        </template>
      </FullCalendar>
      <v-dialog v-model="updateModalShow" max-width="500px">
        <v-card>
          <v-card-text>
            <h4 class="text-h4">Update Event</h4>
            <p class="text-subtitle-1 textSecondary my-4">To Edit/Update Event kindly change the title and choose the event
              color and press the update button</p>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="AddModal" max-width="700">
        <v-card>                
          <v-card-text>
            <h3 class="text-h3">Information de l'évènement</h3>
            <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Nom</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                  <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Type</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-radio-group inline hide-details class="ml-n3">
                    <v-radio label="Virtuel (Zwift)" color="primary" value="virtual"></v-radio>
                    <v-radio label="Route" color="primary" value="road"></v-radio>
                    <v-radio label="Gravel" color="primary" value="gravel"></v-radio>
                    <v-radio label="Autres" color="primary" value="other"></v-radio>
                </v-radio-group>
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Type de course</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-radio-group v-model="radioInline" inline hide-details class="ml-n3">
                    <v-radio label="Routier" color="primary" value="road"></v-radio>
                    <v-radio label="Critérium" color="primary" value="criterium"></v-radio>
                    <v-radio label="Contre la montre" color="primary" value="time_trial"></v-radio>
                </v-radio-group>
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Début</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="date" hide-details></v-text-field>
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Fin</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="date" hide-details></v-text-field>
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Lien info</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Lien Tech Guide</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Lien d'enregistrement</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Liens de résultats</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Liens photos</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          <v-row class="align-center mb-3">
              <v-col cols="12" sm="3" class="pb-sm-3 pb-0">
                  <v-label class=" font-weight-medium">Coureurs</v-label>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field color="primary" variant="outlined" type="text" placeholder="John Deo" hide-details />
              </v-col>
          </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="sendDiscordMessage">Sauvegarder</v-btn>            
            <v-btn class="bg-lighterror text-error" @click="AddModal = false">Annuler</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

