import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareRoutingModule } from './share-routing.module';
import { ShareComponent } from './share.component';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { PermissionComponent } from './permission/permission.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddUserComponent } from './add-user/add-user.component';
import { ToastrModule } from 'ngx-toastr';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { ThreatJsonDataComponent } from './threat-json-data/threat-json-data.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ProfileComponent } from './profile/profile.component';
import { ViewavComponent } from './viewav/viewav.component';
import { DeployedHoneypotsComponent } from './deployed-honeypots/deployed-honeypots.component';
import { MaterialModule } from 'src/app/common/material.nodule';
import { ConfigHpComponent } from './config-hp/config-hp.component';
import { NodeHealthComponent } from './node-health/node-health.component';
import { ProfileDataComponent } from './profile-data/profile-data.component';
import { ConfigHihpComponent } from './config-hihp/config-hihp.component';
import { ThreatScoreComponent } from './threat-score/threat-score.component';
import { HybridReportJsonDataComponent } from './hybrid-report-json-data/hybrid-report-json-data.component';


@NgModule({
  declarations: [
    ShareComponent,
    PermissionComponent,
    AddUserComponent,
    ChangepasswordComponent,
    ThreatJsonDataComponent,
    ProfileComponent,
    ViewavComponent,
    DeployedHoneypotsComponent,
    ConfigHpComponent,
    NodeHealthComponent,
    ProfileDataComponent,
    ConfigHihpComponent,
    ThreatScoreComponent,
    HybridReportJsonDataComponent,
  ],
  imports: [
    CommonModule,
    ShareRoutingModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
    MaterialModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    // TreeviewModule.forRoot()
  ],
  providers: [{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 10000 } }]
})
export class ShareModule { }
