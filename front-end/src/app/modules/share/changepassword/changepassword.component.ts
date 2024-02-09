import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { AESEncryptDecryptService } from 'src/app/common/aesencrypt-decrypt.service';
import { minLengthAsyncValidator } from 'src/app/common/validator';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent implements OnInit {
  getchangePasswordData! : Subscription;
  changePasswordData: boolean = false;
  showpw:Boolean=true
  showConfpw:Boolean=true
  showOldpw:Boolean=true
  changePasswordForm: any = FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder,private router: Router, private cryptServ:AESEncryptDecryptService, private restServ:RestService,
     private notiService:NotificationService, public dialogRef: MatDialogRef<ChangepasswordComponent>) { 

      this.initSignupForm();

  }
  ngOnInit(): void {
  }

  initSignupForm() {
    this.changePasswordForm = this.fb.group({
      passwordOld:[''],
      oldpass:['',Validators.required],
      password: [''],
      orgPassword: ['', [Validators.required], minLengthAsyncValidator(7)],
      encCpassword:[''],
      cpassword: ['', [Validators.required], minLengthAsyncValidator(7)]

    });
  }

  myOldEncryption(e:any){
    if (e.target.value.length == 0){
      this.changePasswordForm.controls['oldpass'].reset()
      document.getElementById("oldpass")?.setAttribute('type','password');
      document.getElementById("passwordOld")?.setAttribute('type','hidden');
    }
else{
      let enc = this.cryptServ.encrypt(this.changePasswordForm.get('oldpass')?.value);
      this.changePasswordForm.get('oldpass')?.setValue(enc);
       
       document.getElementById("oldpass")?.setAttribute('type','hidden');
       document.getElementById("passwordOld")?.setAttribute('type','password');
      this.changePasswordForm.get('passwordOld')?.setValue(enc);
      this.showOldpw =false
}
  }

  encConfirmPassword(e:any){
    if (e.target.value.length == 0){
      this.changePasswordForm.controls['cpassword'].reset()
      document.getElementById("encCpassword")?.setAttribute('type','hidden');
      document.getElementById("cpassword")?.setAttribute('type','password');
    }
else{
  let enc = this.cryptServ.encrypt(this.changePasswordForm.get('cpassword')?.value);
      this.changePasswordForm.get('cpassword')?.setValue(enc);
       
       document.getElementById("cpassword")?.setAttribute('type','hidden');
       document.getElementById("encCpassword")?.setAttribute('type','password');
      this.changePasswordForm.get('encCpassword')?.setValue(enc);
      this.showConfpw =false
}     
  }
  
  myEncryption(e:any){

    if (e.target.value.length == 0){
      this.changePasswordForm.controls['orgPassword'].reset()
      document.getElementById("Password")?.setAttribute('type','hidden');
      document.getElementById("orgPassword")?.setAttribute('type','password');
    }
else{
      let enc = this.cryptServ.encrypt(this.changePasswordForm.get('orgPassword')?.value);
      this.changePasswordForm.get('orgPassword')?.setValue(enc);
       
       document.getElementById("orgPassword")?.setAttribute('type','hidden');
       document.getElementById("Password")?.setAttribute('type','password');
      this.changePasswordForm.get('password')?.setValue(enc);
      this.showpw =false
}
  }

  get f(){

    return this.changePasswordForm.controls;
  }

  changePassword(){
    this.formSubmitted = true;

    if(this.changePasswordForm.invalid){
      return;
    }

    // if(this.changePasswordForm.get('password').value !== this.changePasswordForm.get('cpassword').value){
    //    this.notiService.showError(" Password Doesn't match Confirm Password");
    //   return;
    // }

    // if(this.changePasswordForm.get('password').value == this.changePasswordForm.get('oldpass').value){
    //    this.notiService.showError(" Password and Current Password shouldn't be same");
    //   return;
    // }

    let url = environment.change_passsword;
    this.getchangePasswordData = this.restServ.post(url,this.changePasswordForm.value,{}).subscribe(res=>{
      if(res.status==1){
        this.dialogRef.close();
        this.notiService.showSuccess(res.message);
        
      }
      else{
        this.notiService.showError(res.message)
    this.changePasswordForm.reset();
    document.getElementById("Password")?.setAttribute('type','hidden');
    document.getElementById("orgPassword")?.setAttribute('type','password');
    document.getElementById("encCpassword")?.setAttribute('type','hidden');
    document.getElementById("cpassword")?.setAttribute('type','password');
    document.getElementById("oldpass")?.setAttribute('type','password');
    document.getElementById("passwordOld")?.setAttribute('type','hidden');
      }
    })
    
  }

  closeButton(type:any|undefined) {
    if(type== 'simple'){
      this.dialogRef.close();
    } else{
    this.dialogRef.close("I am closed!!")
    }
  }
  ngOnDestroy(): void{
    if(this.changePasswordData){
    this.getchangePasswordData.unsubscribe();
    }

  } 

}
