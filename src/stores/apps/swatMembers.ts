import { defineStore } from 'pinia';

import axios from 'axios';

import config from "@/config/config.json";

export const useSwatMembersStore = defineStore('SwatMembers', {  
  state: () => ({
    members: []
  }),
  getters: {},
  actions: {
    // Fetch followers from action
    async fetchMembers() {
      try {
        const response = await axios.get(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025`,
        {                  
          withCredentials: true
        });
        this.members = response.data.data;
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
  }
});
