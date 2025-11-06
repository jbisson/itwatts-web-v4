import { defineStore } from 'pinia';
import config from "../../config/config.json";

// project imports
import axios from 'axios';

export const useClubStore = defineStore('clubs', {    
  state: () => ({
      clubs: [],
      clubsMap: new Map(),
  }),
  getters: {},
  actions: {
    async fetchClubs() {            
      try {
        const response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/clubs`,
          { withCredentials: true });
        this.clubs = response.data.data.map((club: any) => {
          return {
            text: club.displayName,
            value: club.name,
            social_link: club.social_link,
            jersey_path: club.jersey_path,
          };
        });

        this.clubsMap = new Map(
          response.data.data.map((club: any) => [club.name, club])
        );

        this.clubs.sort((club1: any, club2: any) => { return club1.text.localeCompare(club2.text) });              
      } catch (err: any) {                
          console.log(`An error occured fetching clubs: ${err} stack: ${err.stack}`);
      }
    }
  }
});
