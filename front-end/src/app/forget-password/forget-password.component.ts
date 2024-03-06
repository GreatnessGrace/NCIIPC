import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators,FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from '../core/services/notification.service';
import { environment } from 'src/environments/environment';
import { RestService } from '../core/services/rest.service'; 
import { RightClickService } from '../core/services/right-click.service';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  assetPath = environment.assetPath;
  forgotGroup: any= FormGroup;
  urlPass: any;
  captchaStatus = false;
  siteKey = environment.recaptchasiteKey;

  constructor(public dialogRef: MatDialogRef<ForgetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notiServ: NotificationService, private restServ: RestService,
    public router: Router, 
    private fb: FormBuilder,
    private rightClickService: RightClickService) 
    {

      this.initSignupForm();
  }


  initSignupForm() {
    this.forgotGroup = this.fb.group({
      email: ['', [Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
      ip: [''],
      capcha_token: [''],
    urlPass : location.origin + environment.recoverUrl

    });
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }

  getUserIp() {
    this.restServ.getUserIp().subscribe(res=>{
     this.forgotGroup?.get('ip')?.setValue(res.ip);
   });
 }
 
  ngOnInit(): void {
    this.urlPass = location.origin + environment.recoverUrl
    this.getUserIp()
  }
  close() {
    this.dialogRef.close("Closed")
  }

  resolved(captchaResponse: string) {
    this.captchaStatus = true;
    this.forgotGroup?.get('capcha_token')?.setValue(captchaResponse);
  }


  sendMail() {



    if (this.forgotGroup.value.email == '') {
      this.notiServ.showError("Please Enter Email");
      return;
    }

    if (!this.captchaStatus) {
      this.notiServ.showInfo("Please verify capcha");
      return;
    }

    if (this.forgotGroup.value) {
      console.log("this.signUpForm.value",this.forgotGroup.value)
      this.dialogRef.close(this.forgotGroup.value)
      // let dataToSend = {
      //   email: this.forgotGroup.value.email,
      //   path: this.urlPass
      // }
      this.restServ.post(environment.forgot,this.forgotGroup.value,{}).subscribe(res=>{
console.log("=====",res)
        if (res.message) {
          this.notiServ.showSuccess("If the email address provided exists in our system, an email will be sent with instructions on how to reset your password.")
          return;
        }
        this.notiServ.showSuccess("An email has been sent to the provided address. Please check your inbox for further instructions")
        this.router.navigate(['/login'])
      })
    }
  }
}
