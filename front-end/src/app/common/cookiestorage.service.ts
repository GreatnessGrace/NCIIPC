import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getCookie, setCookie } from 'typescript-cookie';

const TOKEN_KEY = 'Token';
const USER_KEY = 'auth-user';
const ROLE_KEY = 'auth-role';
const TAB_KEY = 'tabDetails';
const ENTITY_TAB_KEY = 'entityTabDetails';
const UP_TIME = 'setupTime';
const ATTEMPT_LEFT = 'setupTime';
const FIRE_TOKEN ='firebasetoken';

@Injectable({
  providedIn: 'root'
})
export class CookiestorageService {

  constructor(private router: Router) { }

  signOut(): void {
    window.localStorage.clear();
    this.clearAllCookies();
  }

  public saveToken(token: any) {
    // window.localStorage.removeItem(TOKEN_KEY);
    setCookie(TOKEN_KEY, token);
  }
  public getToken() {
    let token = getCookie(TOKEN_KEY);
    if (token) {
      return token;
    }
    return '';

  }

  public saveUser(user: any): void {
    delete user.token;
    // window.localStorage.removeItem(USER_KEY);
    setCookie(USER_KEY, btoa(JSON.stringify(user)));
  }

  public getUser(): any {
    const user = getCookie(USER_KEY);
    if (user) {
      return JSON.parse(atob(user));
    }
    return {};
  }

  public SessTime(time: any): void {
    // window.localStorage.removeItem(USER_KEY);
    setCookie(UP_TIME, time);
  }

  public saveSessTime(): void {
    var sessTime: any = new Date();
    sessTime.setMinutes(sessTime.getMinutes() + 15);
    setCookie(UP_TIME,sessTime);
  }

  public getSessTime():any {
    const time = getCookie(UP_TIME);
    if (time) {
      return time;
    }
    return {};
  }

  public tokenIntegrity(): void {
    let userName1 = '';
    let userName2 = '';

    const user = getCookie(USER_KEY);
    if (user) {
      const userObj = JSON.parse(atob(user));
      userName1 = userObj.username.toLowerCase();
    }

    let token = getCookie(TOKEN_KEY);
    if (token) {
      try {

        const [header, payload, signature] = token.split('.');

        const decodedPayload = JSON.parse(atob(payload));

        userName2 = decodedPayload.data;
        userName2 = userName2.toLowerCase();
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    if (userName1 != userName2) {
      window.localStorage.clear();
      this.clearAllCookies();
      this.router.navigate(['/login']);
      window.location.reload();
    }
  }

  public logout(): void {
    window.localStorage.clear();
    this.clearAllCookies();
    this.router.navigate(['/login']);
    window.location.reload();
  }

  // public getNumberofAttempts(){
  //   let leftAttempt =  window.localStorage.getItem(ATTEMPT_LEFT);
  //   return leftAttempt ? leftAttempt : 0;
  // }

  // public saveNumberofAttempts(){
  //    window.localStorage.setItem(ATTEMPT_LEFT,btoa('3'));

  // }

  public getSessionExpirationTime(): any {
    let sessionSetupTime =getCookie(ATTEMPT_LEFT);
    if (sessionSetupTime) {
      // console.log("setupTime", sessionSetupTime)
      return sessionSetupTime
    }
    return ''
  }

  public setFireToken(token:any):void{
    setCookie(FIRE_TOKEN,btoa(JSON.stringify(token)));
  }

  public getFireToken(): any {
    const token = getCookie(FIRE_TOKEN);
    if (token) {
      return JSON.parse(atob(token));
    }
    return {};
  }

  public clearAllCookies():any {
    // Get all cookies
    const cookies = document.cookie.split(";");
  
    // Loop through each cookie and delete it
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}
