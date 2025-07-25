import { defineStore } from "pinia";
import axios from 'axios';

import config from "../config/config.json";

export const useUserProfile = defineStore('userProfile', {  
  persist: true,
  state: () => ({    
      zp_id: 0,
      user_id: '',
      email: '',
      roles: [],
      groups: [],
      profile_url: '',
      first_name: '',
      last_name: '',
      registered: false,
      lang: '',
      login_post_back_page: '',
      login_post_back_page_query: {},
      search_location: { lat: 45.295593084042835, lng: -76.06822600150268 },
      search_area_size: 5,
      search_address: 'Carp, ON, Canada',
      strava_preferences: {
        hidden_segments: [] as any
      },
      primary_team_id: '',
      primary_team: null,
      strava_scope: '',
      zp_preferences: null,
  }),
  getters: {
    //getProfile: (state) => state.profile,
  },
  actions: {
    setProfile(profile: any) {
      //this.profile = profile;
    },
    change(zp_id: any) {
      //this.profile.zp_id = zp_id;
    },
    setPrimaryTeam(teams: any) {
      this.primary_team = teams.find((team: any) => team.id === this.primary_team_id);
    },
    async fetchUserProfile() {
      try {
        const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${this.user_id}`,
          { withCredentials: true });
        const profile = response.data;

        this.email = profile.email;
        this.zp_id = profile.zp_id;
        this.primary_team_id = profile.primary_team_id;
        this.first_name = profile.first_name;
        this.last_name = profile.last_name;
        this.roles = profile.roles;
        this.groups = profile.groups;
        this.zp_preferences = profile.zp_preferences;
        
        if (profile.strava_login) {
          this.strava_scope = profile.strava_login.scope;
        }
        
      } catch (err: any) {                
          console.log(`An error occured fetching userProfile: ${err} stack: ${err.stack}`);
      }
    }
  },
});
