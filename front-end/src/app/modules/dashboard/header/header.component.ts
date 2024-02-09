import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangepasswordComponent } from './../../share/changepassword/changepassword.component';
import { ProfileComponent } from '../../share/profile/profile.component'; 
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { AdminNotificationsService } from 'src/app/core/services/admin-notifications.service';
import { SessionstorageService } from 'src/app/common/sessionstorage.service';

import { Subscription } from 'rxjs';
import { error } from 'console';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  getLogoutData! : Subscription
  notiServCount! : Subscription
logoutCheck : Boolean = false
  userType: any;
  currentComponent: any;
  username:any;
  notificationCount = 0;
  assetPath = environment.assetPath;
  @Input() countData?: number;
  constructor(private router: Router,
    public lazyRouter: ActivatedRoute,
    private loginService: LoginService,
    private notiService:NotificationService,
    public dialog: MatDialog,
    private restServ:RestService,
    private adminService: AdminNotificationsService,
    private sessServ:SessionstorageService
    ) { }

  ngOnInit(): void {
    
    this.userType = this.loginService.getUser().role;
    let currentUrl = this.router.url.split('/')
    let lengthOfUrl = this.router.url.split('/').length

    this.currentComponent = currentUrl[lengthOfUrl-1]
    this.getName()
    this.getNotificationCount();
  }

  navigation(path?: any) {
    this.router.navigate([`/dashboard/${path}`])
  }

  logout() {

    this.logoutCheck = true
    let url = environment.logOut;
  this.restServ.getnew(url,{},{}).subscribe(res => {
        this.sessServ.logout();
        this.notiService.showSuccess(res.message)
      
    },
    (error)=>{
      this.logout()
    }
    
    );

  }

  getName(){
    this.username = this.loginService.getUser().name;
    // console.log('ss',this.username);
  }

  changePassword(){
    // this.router.navigate(['/change-password']);
    let dialogRef = this.dialog.open(ChangepasswordComponent,{
      // data: dataToSend
    } );
    dialogRef.afterClosed().subscribe(res => {
      if(res){
      this.notiService.showSuccess("Password Changed successfully");
      }

    })
  }
  profile(){
    // this.router.navigate(['/change-password']);
    let dialogRef = this.dialog.open(ProfileComponent,{
      // data: dataToSend
    } );
    
  }

  getNotificationCount() {
   this.notiServCount = this.adminService.getNotificationCount().subscribe((resp) => {
      if (resp && resp.count) {
        this.notificationCount = this.countData == 0 ? this.countData : resp.count;
      }
    })
  }

  goToNotification() {
    this.router.navigate([`/notifications`]);
  }

  ngOnDestroy(): void{

    if(this.notiServCount){
      this.notiServCount.unsubscribe();
    }
   

  }
}
