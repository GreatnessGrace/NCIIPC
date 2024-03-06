import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
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
import { CookiestorageService } from 'src/app/common/cookiestorage.service';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  getLogoutData! : Subscription
  notiServCount! : Subscription
logoutCheck : Boolean = false
url_bool:Boolean=false;
detail_bool:Boolean=false;
ahp_bool:Boolean=false;
  userType: any;
  currentComponent: any;
  username:any;
  notificationCount = 0;
  adar = environment.adar
  ews = environment.ews
  pae = environment.pae
  enum = environment.enum
  ir = environment.ir
  assetPath = environment.assetPath;
  @Input() countData?: number;
  constructor(private router: Router,
    public lazyRouter: ActivatedRoute,
    private loginService: LoginService,
    private notiService:NotificationService,
    public dialog: MatDialog,
    private restServ:RestService,
    private adminService: AdminNotificationsService,
    private sessServ:SessionstorageService,
    private cookServ:CookiestorageService,
    private cdRef: ChangeDetectorRef,
    private rightClickService: RightClickService

    ) { }

  ngOnInit(): void {
    
    this.userType = this.loginService.getUser().role;
    let currentUrl = this.router.url.split('/')
    let lengthOfUrl = this.router.url.split('/').length

    this.currentComponent = currentUrl[lengthOfUrl-1]
    this.getName()
    this.getNotificationCount();
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  navigation(path?: any) {
    this.router.navigate([`/dashboard/${path}`])
  }

  logout() {

    this.logoutCheck = true
    let url = environment.logOut;
  this.restServ.getnew(url,{},{}).subscribe(res => {
        // this.sessServ.logout();
        this.cookServ.logout();
        this.notiService.showSuccess(res.message)
      
    },
    (error)=>{
      this.logout()
    }
    
    );

  }

  getName(){
    this.username = this.loginService.getUser().name;
  
  }
  toggleurl(i:any){
    this.url_bool=i;
    this.detail_bool=!i;
    this.ahp_bool=!i;
  }

  toggledetail(i:any){
    this.detail_bool=i;
    this.url_bool=!i;
    this.ahp_bool=!i;
  }

  toggleahp(i:any){
    this.ahp_bool=i;
    this.url_bool=!i;
    this.detail_bool=!i;
  }

  toggle(){
    this.ahp_bool=false;
    this.url_bool=false;
    this.detail_bool=false;
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
    dialogRef.afterClosed().subscribe(res=>{
      this.getName();
    })
   
   this.cdRef.detectChanges(); 
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
