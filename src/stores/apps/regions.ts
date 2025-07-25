import { defineStore } from 'pinia';
import config from "@/config/config.json";

// project imports
import axios from 'axios';

export const useRegionStore = defineStore('Regions', {    
    state: () => ({
        regions: [],
        regionsMap: new Map(),
    }),
    getters: {},
    actions: {
        async fetchRegions() {            
            try {
              const response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/regions`,
                { withCredentials: true });
              this.regions = response.data.data.map((region: any) => {
                return {
                  text: region.displayName,
                  value: region.name
                };
              });

              this.regionsMap = new Map(
                response.data.data.map((region: any) => [region.name, region.displayName])
              );
              
              this.regions.sort((region1: any, region2: any) => { return region1.text.localeCompare(region2.text) });              
            } catch (err: any) {                
              console.log(`An error occured fetching regions: ${err} stack: ${err.stack}`);
            }
        }
    }
});
