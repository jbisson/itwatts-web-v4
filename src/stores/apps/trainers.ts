import { defineStore } from 'pinia';
import config from '@/config/config.json';

// project imports
import axios from 'axios';

export const useTrainerStore = defineStore('Trainers', {    
    state: () => ({
      trainers: [],
      secondaryTrainers: []
    }),
    persist: true,
    getters: {},
    actions: {
      async fetchTrainers() {            
        try {
          const response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/trainers`,
            { withCredentials: true });
          this.trainers = response.data.data.map((trainer: any) => {
            return {
              text: trainer.displayName,
              value: trainer.name
            };
          });
          this.secondaryTrainers = [...this.trainers];
          this.secondaryTrainers.push({
            text: 'Aucun',
            value: '',
          })
          this.trainers.sort((trainer1: any, trainer2: any) => { return trainer1.text.localeCompare(trainer2.text) });
          this.secondaryTrainers.sort((trainer1: any, trainer2: any) => { return trainer1.text.localeCompare(trainer2.text) });

        } catch (err: any) {                
          console.log(`An error occured fetching trainers: ${err} stack: ${err.stack}`);
        }
      }
    }
});
