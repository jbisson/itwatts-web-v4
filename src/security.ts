import { useCookies } from "vue3-cookies";
import { useRouter } from 'vue-router'
import { decodeBase64 } from '@/utils/string';

class Security {
  token: any;

  constructor() {
    const { cookies } = useCookies();
    const userCookie = cookies.get('user');

    if (userCookie) {
      this.token = JSON.parse(decodeBase64(userCookie.split('.')[1]).toString());

      /*if (new Date(this.token.exp * 1000) < new Date()) {
        console.log(`Token expired at: ${new Date(this.token.exp * 1000)}`);
        this.token = null;
        // cookies.remove('user');
        localStorage.clear();
      }*/
    } else {
      localStorage.clear();
    }
  }

  logout() {
    const { cookies } = useCookies();
    cookies.remove('user', '' ,'itwatts.com');
    for (const cookieName of cookies.keys()) {
      cookies.remove(cookieName);
    }
    
    localStorage.clear();
  }

  isLoggedIn() {
    return this.token ? true : false;
  }

  isTokenValid(rolesRequired: Array<String>) {
    let hasRoleRequired = (rolesRequired && rolesRequired.length > 0) ? false : true;
    
    if (this.token) {      
      /*if (new Date(this.token.exp * 1000) < new Date()) {
        const { cookies } = useCookies();
        console.log(`Token expired at: ${new Date(this.token.exp * 1000)}`);
        this.token = null;
        // cookies.remove('user');
        localStorage.clear();
        return false;
      }*/
      
      if (this.token.roles && rolesRequired && rolesRequired.length > 0) {
        for (const roleRequired of rolesRequired) {
          if (this.token.roles.includes(roleRequired)) {
            hasRoleRequired = true;
          }
        }
      }      
    } else {
      return false;
    }  
    
    return hasRoleRequired;
  }
}

export default new Security();

