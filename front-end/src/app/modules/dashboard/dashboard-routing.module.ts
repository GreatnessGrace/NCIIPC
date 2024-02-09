import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HoneypotDetailsComponent } from './hader-components/honeypot-details/honeypot-details.component';
import { NodeDetailsComponent } from './hader-components/node-details/node-details.component';
import { UsermanagementComponent } from './hader-components/usermanagement/usermanagement.component';
import { ThreatIntelEventsComponent } from './hader-components/repositories/threat-intel-events/threat-intel-events.component';
import { UniqueBinariesComponent } from './hader-components/repositories/unique-binaries/unique-binaries.component';
import { PCapBinaryComponent } from './hader-components/repositories/p-cap-binary/p-cap-binary.component';
import { SearchByCriteriaComponent } from './hader-components/search/search-by-criteria/search-by-criteria.component';
import { SearchByIndicatorComponent } from './hader-components/search/search-by-indicator/search-by-indicator.component';
import { ReportDownloadComponent } from './hader-components/report-download/report-download.component';
import { ThreatMapComponent } from './hader-components/threat-map/threat-map.component';
import { HeatMapComponent } from './hader-components/node-management/heat-map.component';
import { HighSeverityComponent } from './hader-components/high-severity/high-severity.component';
import { UserSessionComponent } from './hader-components/user-session/user-session.component';
import { IndiaIpsComponent } from './india-ips/india-ips.component';

import { RoleGuard } from 'src/role.guard';
import { HpBlueprintComponent } from './hader-components/honeypot-repo/hp-blueprint/hp-blueprint.component';
import { HpStatsComponent } from './hader-components/honeypot-repo/hp-stats/hp-stats.component';
import { HpConfigComponent } from './hader-components/honeypot-repo/hp-config/hp-config.component';
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  { path: 'honeypotDetails', component: HoneypotDetailsComponent },
  { path: 'nodeDetails', component: NodeDetailsComponent },
  { path: 'usermanagement', canActivate:[RoleGuard], data:{role:'user'}, component: UsermanagementComponent },
  { path: 'SectorEventData', component: ThreatIntelEventsComponent },
  { path: 'malBinaries', component: UniqueBinariesComponent},
  { path: 'PCapBinary', component: PCapBinaryComponent},
  { path: 'SearchData', component: SearchByCriteriaComponent},
  { path: 'searchIndicator', component: SearchByIndicatorComponent},
  { path: 'reportDownload', component: ReportDownloadComponent },
  { path: 'threatMap', component: ThreatMapComponent },
  { path: 'nodeDashbord', component: HeatMapComponent },
  { path: 'highSeverity', component: HighSeverityComponent},
  { path: 'userSession', canActivate:[RoleGuard], data:{role:'user'},component: UserSessionComponent},
  { path: 'indiaips', canActivate:[RoleGuard], data:{role:'user'}, component: IndiaIpsComponent},
  { path: 'honeypotBlueprint', component: HpBlueprintComponent},
  { path: 'honeypotStats', canActivate:[RoleGuard], data:{role:['user']}, component: HpStatsComponent},
  { path:'honeypotConfig', canActivate:[RoleGuard], data:{role:['user', 'admin']}, component: HpConfigComponent},

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }


