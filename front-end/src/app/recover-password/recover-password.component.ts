import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../core/services/notification.service';
import { RestService } from '../core/services/rest.service';
import { Subscription } from 'rxjs';
import { AESEncryptDecryptService } from '../common/aesencrypt-decrypt.service';
import { minLengthAsyncValidator } from '../common/validator';
import { Router } from '@angular/router';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {
  recoverPw!: Subscription
  getIp!: Subscription
  assetPath = environment.assetPath;
  recoverForm: any = FormGroup;
  Invaild: boolean = false;
  cInvaild: boolean = false;
  captchaStatus = false;
  siteKey = environment.recaptchasiteKey;
  showpw: Boolean = true
  showConfpw: Boolean = true

  constructor(private activateRoute: ActivatedRoute,
    private router: Router,
    private notiService: NotificationService,
    private restServ: RestService,
    private cryptServ: AESEncryptDecryptService,
    private fb: FormBuilder,
    private rightClickService: RightClickService) {
    this.initSignupForm();
  }

  initSignupForm() {
    this.recoverForm = this.fb.group({
      otp: new FormControl('', [Validators.required]),
      password: [''],
      newPwd: ['', [Validators.required], minLengthAsyncValidator(7)],
      encCpassword: [''],
      confirmPwd: ['', [Validators.required], minLengthAsyncValidator(7)],
      ip: [''],
      id: '',
      capcha_token: [''],
    });
  }


  ngOnInit(): void {
    this.getUserIp()
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  encConfirmPassword(e: any) {
    this.cInvaild = false;
    if (e.target.value.length == 0) {
      this.recoverForm.controls['confirmPwd'].reset()
      document.getElementById("encCpassword")?.setAttribute('type', 'hidden');
      document.getElementById("confirmPwd")?.setAttribute('type', 'password');
    }
    else {
      let reg = new RegExp(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$%^&*()!#]).*$"
      );

      if (!reg.test(e.target.value)) {
        this.cInvaild = true
      }

      let enc = this.cryptServ.encrypt(this.recoverForm.get('confirmPwd')?.value);
      this.recoverForm.get('confirmPwd')?.setValue(enc);

      document.getElementById("confirmPwd")?.setAttribute('type', 'hidden');
      document.getElementById("encCpassword")?.setAttribute('type', 'password');
      this.recoverForm.get('encCpassword')?.setValue(enc);
      this.showConfpw = false
    }
  }


  myEncryption(e: any) {
    this.Invaild = false;
    if (e.target.value.length == 0) {
      this.recoverForm.controls['orgPassword'].reset()
      document.getElementById("Password")?.setAttribute('type', 'hidden');
      document.getElementById("newPwd")?.setAttribute('type', 'password');
    }
    else {
      let reg = new RegExp(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$%^&*()!#]).*$"
      );

      if (!reg.test(e.target.value)) {
        this.Invaild = true
      }

      let enc = this.cryptServ.encrypt(this.recoverForm.get('newPwd')?.value);
      this.recoverForm.get('newPwd')?.setValue(enc);

      document.getElementById("newPwd")?.setAttribute('type', 'hidden');
      document.getElementById("Password")?.setAttribute('type', 'password');
      this.recoverForm.get('password')?.setValue(enc);
      this.showpw = false
    }
  }


  getUserIp() {
    this.getIp = this.restServ.getUserIp().subscribe(res => {
      this.recoverForm?.get('ip')?.setValue(res.ip);
    });
  }

  resolved(captchaResponse: string) {

    this.captchaStatus = true;
    this.recoverForm?.get('capcha_token')?.setValue(captchaResponse);
  }


  resetPassword() {
    if (!this.captchaStatus) {
      this.notiService.showInfo("Please verify capcha");
      return;
    }

    this.recoverForm.value.id = this.activateRoute.snapshot.url[1].path
    let recoverUrl = '/recoverpassword/' + this.recoverForm.value.id

    this.restServ.post(environment.recoverPassword, this.recoverForm.value, {}).subscribe(res => {
      if (res.status == 1) {
        this.notiService.showSuccess(res.message)
      }
      else {
        this.notiService.showError(res.message)
        this.recoverForm.reset();
        document.getElementById("Password")?.setAttribute('type', 'hidden');
        document.getElementById("newPwd")?.setAttribute('type', 'password');
        document.getElementById("encCpassword")?.setAttribute('type', 'hidden');
        document.getElementById("confirmPwd")?.setAttribute('type', 'password');
        this.router.navigate([recoverUrl])
      }
      this.router.navigate([recoverUrl])
    })
  }

  ngOnDestroy(): void {
    if (this.getIp) {
      this.getIp.unsubscribe()
    }

  }
}
