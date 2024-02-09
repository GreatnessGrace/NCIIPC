import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HeaderModule } from './header/header.module';
import { ChipsComponent } from './chips/chips.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttackMarkMapComponent } from './attack-mark-map/attack-mark-map.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ParentChartComponent } from './parent-chart/parent-chart.component';
import { ChildChartComponent } from './child-chart/child-chart.component';
import { HoneypotDetailsComponent } from './hader-components/honeypot-details/honeypot-details.component';
import { NodeDetailsComponent } from './hader-components/node-details/node-details.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { UsermanagementComponent } from './hader-components/usermanagement/usermanagement.component';
import { ShareModule } from '../share/share.module';
import { MaterialModule } from 'src/app/common/material.nodule';
import { ToastrModule } from 'ngx-toastr';
import { ThreatIntelEventsComponent } from './hader-components/repositories/threat-intel-events/threat-intel-events.component';
import { UniqueBinariesComponent } from './hader-components/repositories/unique-binaries/unique-binaries.component';
import { PCapBinaryComponent } from './hader-components/repositories/p-cap-binary/p-cap-binary.component';
import { SearchByCriteriaComponent } from './hader-components/search/search-by-criteria/search-by-criteria.component';
import { SearchByIndicatorComponent } from './hader-components/search/search-by-indicator/search-by-indicator.component';
import { FilterPipe } from 'src/app/common/filter.pipe';
import { CountryName } from 'src/app/common/countryname.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { ReportDownloadComponent } from './hader-components/report-download/report-download.component';
import { ThreatMapComponent } from './hader-components/threat-map/threat-map.component';
import { BarChartsComponent } from './bar-charts/bar-charts.component';
import { CountUpDirective } from './count-up.directive';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HeatMapComponent } from './hader-components/node-management/heat-map.component';
import { HighSeverityComponent } from './hader-components/high-severity/high-severity.component';
import { UserSessionComponent } from './hader-components/user-session/user-session.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { IndiaIpsComponent } from './india-ips/india-ips.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HpBlueprintComponent } from './hader-components/honeypot-repo/hp-blueprint/hp-blueprint.component';
import { HpStatsComponent } from './hader-components/honeypot-repo/hp-stats/hp-stats.component';
import { ChartComponent } from './chart/chart.component';
import { DoublePieChartComponent } from './double-pie-chart/double-pie-chart.component';
import { HpConfigComponent } from './hader-components/honeypot-repo/hp-config/hp-config.component';
import { TimeGraphComponent } from './time-graph/time-graph.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ChipsComponent,
    AttackMarkMapComponent,
    ParentChartComponent,
    ChildChartComponent,
    HoneypotDetailsComponent,
    NodeDetailsComponent,
    UsermanagementComponent,
    ThreatIntelEventsComponent,
    UniqueBinariesComponent,
    PCapBinaryComponent,
    SearchByCriteriaComponent,
    SearchByIndicatorComponent,
    FilterPipe,
    CountryName,
    ReportDownloadComponent,
    ThreatMapComponent,
    BarChartsComponent,
    CountUpDirective,
    HeatMapComponent,
    HighSeverityComponent,
    UserSessionComponent,
    LineChartComponent,
    IndiaIpsComponent,
    HpBlueprintComponent,
    HpStatsComponent,
    ChartComponent,
    DoublePieChartComponent,
    HpConfigComponent,
    TimeGraphComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    // MatSortModule,
    MaterialModule,
    ShareModule,
    HeaderModule,
    ToastrModule.forRoot({
      positionClass :'toast-top-right',
      preventDuplicates: true,
    }),
    NgMultiSelectDropDownModule.forRoot(),
  ], 
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class DashboardModule { }
