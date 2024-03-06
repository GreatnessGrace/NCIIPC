import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionstorageService } from './app/common/sessionstorage.service';
import { CookiestorageService } from './app/common/cookiestorage.service';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  loginRole: any;

  constructor(
    private router: Router,
    private localstorage: SessionstorageService,
    private cookServ:CookiestorageService
  ) {}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let url: string = state.url;
      return this.checkUserLogin(next, url);
  }
  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {

    // console.log("route.data['role']",route.data['role']);
    
    // let isLoggedIn = this.localstorage.getUser().role;
    let isLoggedIn = this.cookServ.getUser()?.role;
    
    var size = Object.keys(isLoggedIn).length;
    if (
      !isLoggedIn.user_type &&
      route.data['notLoggedin'] &&
      route.data['notLoggedin'] == 'true'
    ) {
      return true;
    } else if (size > 0) {
      // this.loginRole = this.localstorage.getUser()?.role;
      this.loginRole = this.cookServ.getUser()?.role;
      

//       console.log('User Role:', this.loginRole);
// console.log('Route Data Role:', route.data['role']);
      if (route.data['role'] && route.data['role'].includes(this.loginRole)) {
        this.router.navigate(['/']);
        return false;
        // this.router.navigate(['/login']);
       
      } else {
        return true;
      }
    } else {
      this.router.navigate(['/']);
    }
    return true;
  }
}









