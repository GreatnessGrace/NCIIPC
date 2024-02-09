import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';
import { NotificationComponent } from './notification/notification.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { SignupComponent } from './signup/signup.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AuthGuard } from 'src/auth.guard';

const routes: Routes = [

  {
    path: "", redirectTo: "dashboard",
    pathMatch: "full"
  },
  { path: 'login', component: LoginComponent },
  { path: 'forget', component: ForgetPasswordComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'notifications', component: NotificationComponent },
  { path: 'recoverpassword/:{id} ', component: RecoverPasswordComponent },
  {
    path: "dashboard", 
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },

  { path: '**', pathMatch: 'full', 
  component: PagenotfoundComponent },
  
];

@NgModule({
  // imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    useHash: true 
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

