import { defineStore } from 'pinia';
import config from '@/config/config.json';

// project imports
import axios from 'axios';

export const usePowerSourceStore = defineStore('PowerSources', {    
    persist: true,
    state: () => ({
        powerSources: [],
    }),
    getters: {},
    actions: {
      async fetchPowerSources() {            
        try {
          const response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/power-sources`,
            { withCredentials: true });
          this.powerSources = response.data.data.map((powerSource: any) => {
            return {
              text: powerSource.displayName,
              value: powerSource.name
            };
          });
          
          this.powerSources.sort((powerSource1: any, powerSource2: any) => { return powerSource1.text.localeCompare(powerSource2.text) });              
        } catch (err: any) {                
            console.log(`An error occured fetching power-sources: ${err} stack: ${err.stack}`);
        }
      }
    }
});
