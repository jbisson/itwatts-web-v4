import { defineStore } from 'pinia';
import axios from 'axios';

import config from '@/config/config.json';

export const useTeamStore = defineStore('Teams', {    
    persist: true,
    state: () => ({
      myTeams: [] as any,
      teams: [] as any,
      teamsFetched: false,
      myTeamFetched: false,
    }),
    getters: {},
    actions: {
      async fetchMyTeams(forced = false) {
        if (this.myTeamFetched && !forced) {
          return;
        }
        try {
          const response = await axios.get(`${config.serverApi.publicHostname}/v1/teams/me`,
            { withCredentials: true });
          this.myTeams = response.data.data;
          this.myTeams.sort((team1: any, team2: any) => { return team1.display_name.localeCompare(team2.display_name) });
          this.myTeamFetched = true;
        } catch (err: any) {                
            console.log(`An error occured fetching teams: ${err} stack: ${err.stack}`);
        }
      },
      async fetchTeams(forced = false) {        
        if (this.teamsFetched && !forced) {
          return;
        }
        
        try {
          const response = await axios.get(`${config.serverApi.publicHostname}/v1/teams`,
            { withCredentials: true });
          this.teams = response.data.data;          
          this.teams.sort((team1: any, team2: any) => { return team1.display_name.localeCompare(team2.display_name) });
          this.teamsFetched = true;
        } catch (err: any) {                
            console.log(`An error occured fetching teams: ${err} stack: ${err.stack}`);
        }
      }
    }
});