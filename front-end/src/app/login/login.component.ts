import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from 'src/app/core/services/login.service';
import { ForgetPasswordComponent } from '../forget-password/forget-password.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { timeout } from 'rxjs/operators';
import { SessionstorageService } from '../common/sessionstorage.service';
import { Subscription } from 'rxjs';
import { AESEncryptDecryptService } from '../common/aesencrypt-decrypt.service';
import { minLengthAsyncValidator } from '../common/validator';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginSubmitted = false;
  loading = false;
  numberofAttemptsleft = 3;
  assetPath = environment.assetPath;
  capchaSubs !: Subscription;
showpw:Boolean=true
  captchaStatus:any = false;
  checkStatus = false;

 siteKey = environment.recaptchasiteKey;


  constructor(private fb: FormBuilder, private router: Router, public dialog: MatDialog,
    public loginService: LoginService, 
    private notiService: NotificationService, 
    private restServ: RestService, 
    private sessServ:SessionstorageService,
    private cryptServ:AESEncryptDecryptService
    ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [''],
      orgPassword: ['', [Validators.required], minLengthAsyncValidator(7)],
      ip: [''],
      capcha_token: [''],
    })
  }

  ngOnInit(): void {
    this.captchaStatus = false;
    this.getUserIp();
  }


  get f() {
    return this.loginForm.controls;
  }

  resolved(captchaResponse: string) {
    this.captchaStatus= true;
    this.loginForm?.get('capcha_token')?.setValue(captchaResponse);
  }

  getUserIp() {
     this.loginService.getUserIp().subscribe(res=>{
      this.loginForm?.get('ip')?.setValue(res.ip);
    });
  }
  login() {

    // if(!this.captchaStatus || this.captchaStatus == false){
    //   this.notiService.showInfo("Please verify capcha");
    //   return  ;
    // }
    this.loginSubmitted = true;
    this.loading = true;
    

   
    this.loginService.login(this.loginForm.value).pipe(timeout(20000)).subscribe(res => {
      if (!res.userType) {
        this.loading = false;
        if (res.message == "Logged Successfully!!") {
          this.sessServ.saveUser(res.user);
          this.sessServ.saveToken(res.accessToken);
          this.sessServ.saveSessTime();
          this.notiService.showSuccess(res.message);
         this.router.navigate(['/dashboard']);
        }
        else {
          this.loading = false;
          this.notiService.showError(res.message)
          this.loginForm.reset()
          document.getElementById("orgPassword")?.setAttribute('type','password');
          document.getElementById("Password")?.setAttribute('type','hidden')
        }
      }

    }, error => {
      // console.log("timeout",error.error.message);
      this.loading = false;
      if(error.error.message){
   
        
        this.notiService.showError(error.error.message)
      } else if(error.error){
       
            if(typeof(error.error) == 'string'){
              this.notiService.showError(error.error);
              this.loginForm.reset()
              document.getElementById("orgPassword")?.setAttribute('type','password');
              document.getElementById("Password")?.setAttribute('type','hidden')
            } else {
              this.notiService.showError("Error in Connecting to Database.");
              this.loginForm.reset()
              document.getElementById("orgPassword")?.setAttribute('type','password');
              document.getElementById("Password")?.setAttribute('type','hidden')
            }
      } else {
      this.notiService.showError("Error in Connecting to Database.");
      this.loginForm.reset()
      document.getElementById("orgPassword")?.setAttribute('type','password');
      document.getElementById("Password")?.setAttribute('type','hidden')
      }
    }

    )
  }



  signup() {
    this.router.navigate(['/signup'])
  }

  ngOnDestroy(): void{
    this.captchaStatus = false;
  }

  forgotPassword() {
    const dialogRef = this.dialog.open(ForgetPasswordComponent, { width: '400px', position: { top: '155px' }, disableClose: true });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  
  myEncryption(e:any){

    if (e.target.value.length == 0){
      this.loginForm.controls['orgPassword'].reset()
      document.getElementById("Password")?.setAttribute('type','hidden');
      document.getElementById("orgPassword")?.setAttribute('type','password');
    }
else{
      let enc = this.cryptServ.encrypt(this.loginForm.get('orgPassword')?.value);
      this.loginForm.get('orgPassword')?.setValue(enc);
       document.getElementById("Password")?.setAttribute('type','password');
       document.getElementById("orgPassword")?.setAttribute('type','hidden')
      this.loginForm.get('password')?.setValue(enc);
    }
  }
}
