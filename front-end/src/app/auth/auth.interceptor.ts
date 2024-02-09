import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { timeout } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NotificationService } from '../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionstorageService } from '../common/sessionstorage.service';
import { LoginService } from '../core/services/login.service';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
@Injectable()
export class AuthInterceptor implements HttpInterceptor {




  constructor(private router: Router,@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number,private notiServ: NotificationService, public dialog: MatDialog,  private sessServ:SessionstorageService, private LoginServ:LoginService) { }

  // const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
   defaultTimeoutInj = 1000;

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {





    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      if (req.headers.get("skip") == 'true'){
        return next.handle(req);
      }
 
      
      var getupTime:any = localStorage.getItem('setupTime');
      let token = this.sessServ.getToken();
       var now:any = new Date().getTime();
      var currentTime:any = new Date();
      
      var sessTime:any = new Date();
      sessTime.setMinutes(sessTime.getMinutes() + 120);
      
      var graceTime:any = new Date(getupTime);
      graceTime.setMinutes(graceTime.getMinutes() + 5);

       
          if(Date.parse(currentTime) > Date.parse(getupTime) && Date.parse(currentTime) < Date.parse(graceTime)){
            this.confirmLogin();
            
          } else if(Date.parse(currentTime) > Date.parse(graceTime)){
            localStorage.clear();    
          } else {
            localStorage.setItem('setupTime', sessTime);
          }
          
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: token
          }
        })
        
      } else{
        // this.LoginServ.logOut();
        this.dialog.closeAll();
        // this.notiServ.showError("Your session Expired due to inactivity.");
        this.router.navigate(['login']);
        this.dialog.closeAll();
      }
   
      const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
      const timeoutValueNumeric = Number(timeoutValue);
  
      return next.handle(req).pipe(timeout(timeoutValueNumeric));
    }
   
    // return next.handle(request);
  // }

  confirmLogin(){
    Swal.fire({
      title: 'Your session is about to expire. Do you want to Continue Session?',
      text: 'If you select yes Session will continue',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I want to continue session.',
      cancelButtonText: 'No, I want to Logout',
    }).then((result) => {
      console.log('result',result);
      
      if (result.value) {
        // console.log('result.value',result.value);
        var sessTime:any = new Date();
      sessTime.setMinutes(sessTime.getMinutes() + 15);
      localStorage.setItem('setupTime', sessTime);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.dialog.closeAll();
        localStorage.clear();
        this.LoginServ.logOut();
        this.router.navigate(['login']);
        this.notiServ.showError("Your session Expired due to inactivity.");
        this.dialog.closeAll();
      }
    });
  }
  
}
