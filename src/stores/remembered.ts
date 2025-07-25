import { defineStore } from "pinia";


export const useRemembered = defineStore('remembered', {  
  state: () => ({    
      admission: {
        started: false,
        step: 1,
      }     
  }),
  persist: true,
  getters: {    
  },
  actions: {
  },
});
