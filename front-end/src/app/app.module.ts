import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from './common/material.nodule';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor, DEFAULT_TIMEOUT } from './auth/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { SignupComponent } from './signup/signup.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ShareModule } from './modules/share/share.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AutocompleteOffDirective } from './autocomplete-off.directive';
import {MatButtonModule} from '@angular/material/button';
import { NotificationComponent } from './notification/notification.component';
import { HeaderModule } from './modules/dashboard/header/header.module';
import { NotificationPipe } from './common/notification.pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
// import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
// import { RecaptchaModule,RecaptchaFormsModule } from "ng-recaptcha";
import {
  RECAPTCHA_SETTINGS,
  RecaptchaModule,
  RecaptchaSettings,
} from 'ng-recaptcha';
import { FooterComponent } from './footer/footer.component';
import { DataService } from './common/data.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgetPasswordComponent,
    RecoverPasswordComponent,
    SignupComponent,
    AutocompleteOffDirective,
    NotificationComponent,
    NotificationPipe,
    PagenotfoundComponent,
    FooterComponent,
   
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatDialogModule,
    HttpClientModule,
    MatSnackBarModule,
    ShareModule,
    FormsModule, 
    ReactiveFormsModule,
    MaterialModule,
    CommonModule,
    HeaderModule,
    RecaptchaModule,
    MatButtonModule,
    NgxJsonViewerModule,
    ToastrModule.forRoot({
      positionClass :'toast-top-right',
      preventDuplicates: true,
    }),
    NgMultiSelectDropDownModule.forRoot(),
    // TreeviewModule.forRoot()
    //
  ],
  schemas:[NO_ERRORS_SCHEMA], 
  providers: [
    DataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
      
    },
    // [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: 100000 }],
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptchasiteKey,
      } as RecaptchaSettings,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
