import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionstorageService } from './app/common/sessionstorage.service';
import { RestService } from './app/core/services/rest.service';
import { environment } from './environments/environment';
import { CookiestorageService } from './app/common/cookiestorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // loginRole: any;
  constructor(
    private router: Router,
    private localstorage: SessionstorageService,
    private restServ: RestService,
    private cookServ:CookiestorageService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;
    return this.checkUserLogin(next, url);
  }
  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {

    // console.log("route.data['role']",route.data['role']);

    // let isLoggedIn = this.localstorage.getToken();
    let isLoggedIn=this.cookServ.getToken();
    // console.log("==========>>>>>",this.localstorage.getUser().registered)

    // console.log("===>>>",isLoggedIn)
    if (isLoggedIn == undefined || isLoggedIn == null) {
      this.router.navigate(['login']);
      return false;
    }
    /////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////




    var size = Object.keys(isLoggedIn).length;
    // console.log("size-------", size)
    if (size > 0) {
      // console.log(size === 0)
      // console.log("size-------", size)
      // Check if the user's session has expired
      // const sessionExpirationTime = this.localstorage.getSessionExpirationTime();
      // const sessionExpirationTime = new Date(this.localstorage.getSessionExpirationTime()).getTime();
      const sessionExpirationTime = new Date(this.cookServ.getSessionExpirationTime()).getTime();
      // console.log("sessionExpirationTime", sessionExpirationTime)
      const currentTime = new Date().getTime();
      // console.log("currentTime", currentTime)
      // try {
      //   if (currentTime < sessionExpirationTime) {
      //     console.log("Hellio")
      //   }
      // } catch (error) {
      //   console.log(error)
      // }
      // if (sessionExpirationTime && currentTime > sessionExpirationTime) {
      //   console.log("session has expired")
      //   // Session has expired, redirect to login
      //   this.router.navigate(['login']);
      //   return false;
      // }
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {

          if (event.url === '/login' && currentTime < sessionExpirationTime) {
            this.router.navigate(['/dashboard']);
          }
          // if(event.url === '/login' && currentTime > sessionExpirationTime){
          //   this.router.navigate(['/login'])
          // }
        }
      })
      return true;

    } else {
      // console.log("size of isLogged is less than 0")
      this.router.navigate(['login']);
      return false;
    }

  }

  //   checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
  //     // Check if the user is logged in.
  //     let isLoggedIn = this.localstorage.getToken();
  //     // console.log("==========>>>>>",this.localstorage.getUser())


  //     var registrationFormFilled 
  //     // = this.localstorage.getUser().registered;
  //     this.restServ.post(environment.registered,{'user_id':this.localstorage.getUser().user_id},{}).subscribe(res=>{
  //       registrationFormFilled = res.data[0].registered
  //     })

  //     if (!isLoggedIn) {
  //       this.router.navigate(['login']);
  //       return false;
  //     }

  //     if (registrationFormFilled == 0) {
  //       this.router.navigate(['register']);
  //       return false;
  //     }

  //     return true;
  //   }
}

