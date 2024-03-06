import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ThreatJsonDataComponent } from 'src/app/modules/share/threat-json-data/threat-json-data.component';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-search-by-criteria',
  templateUrl: './search-by-criteria.component.html',
  styleUrls: ['./search-by-criteria.component.scss']
})
export class SearchByCriteriaComponent implements OnInit {
  getSearchCriData!: Subscription
  getJsonCriData!: Subscription

  searchloader: boolean = false;
  searchloaderxl: boolean = false;
  showEvent = false;
  showEventJson = false;
  selectedtype: any;
  selectedeventTypeValue: any;
  event_count: any
  eventDataJson: any
  criteriaForm: any = FormGroup;
  criteria_data!: any;
  dataSource!: MatTableDataSource<any>;
  eventJson!: MatTableDataSource<any>;
  @ViewChild('sortJson') sortJson!: MatSort
  @ViewChild('paginatorEvent') paginatorEvent!: MatPaginator;
  @ViewChild('sortCriteria') sortCriteria!: MatSort
  displayedColumns = [
    'key',
    'count',
    'details'
  ];
  displayedColumnsJson: any;
  displayedColumnsData: any = [
    { id: 0, columnVal: 'id', columnName: 'Id' },
    { id: 1, columnVal: 'organization_sector', columnName: 'Organization Sector' },
    { id: 2, columnVal: 'organization_region', columnName: 'Organization Region' },
    { id: 3, columnVal: 'organization', columnName: 'Organization' },
    { id: 4, columnVal: 'event_timestamp', columnName: 'Event Time' },
    { id: 5, columnVal: 'node_id', columnName: 'Node ID' },
    { id: 6, columnVal: 'session_id', columnName: 'Session ID' },
    { id: 7, columnVal: 'remote_ip', columnName: 'Remote IP' },
    { id: 8, columnVal: 'local_ip', columnName: 'Local IP' },
    { id: 9, columnVal: 'target_profile', columnName: 'Target Profile' },
    { id: 10, columnVal: 'honeypot', columnName: 'Honeypot' },
    { id: 11, columnVal: 'organization_state', columnName: 'Organization State' },
    { id: 12, columnVal: 'organization_city', columnName: 'Organization City' },
    { id: 13, columnVal: 'event_label', columnName: 'Event Label' },
    { id: 14, columnVal: 'service', columnName: 'Service' },
    { id: 15, columnVal: 'view_json', columnName: 'View Json' }
  ];

  secFilter = new FormControl('');
  regFilter = new FormControl('');
  orgFilter = new FormControl('');
  nodeFilter = new FormControl('');
  cityFilter = new FormControl('');
  stateFilter = new FormControl('');

  filterValues = {
    organization_sector: '',
    organization_region: '',
    organization: '',
    node_id: '',
    organization_city: '',
    organization_state:''
  };

  constructor(private restServ: RestService, private notiServ: NotificationService,
    private fb: FormBuilder,
    private actRoute: ActivatedRoute,
    public dialog: MatDialog,
    private rightClickService: RightClickService
  ) {
    this.selectedtype = this.actRoute.snapshot.queryParams['type'];
    this.selectedeventTypeValue = this.actRoute.snapshot.queryParams['data'];
    // console.log('this.actRoute.params',this.actRoute.snapshot.queryParams['data']);

  }

  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  
  ngOnInit(): void {
    this.displayedColumnsJson = this.displayedColumnsData.map((x: any) => x.columnVal)
    this.initSignupForm();

    this.secFilter.valueChanges
      .subscribe(
        organization_sector => {
          this.filterValues.organization_sector = organization_sector;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )

    this.regFilter.valueChanges
      .subscribe(
        organization_region => {
          this.filterValues.organization_region = organization_region;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )

    this.orgFilter.valueChanges
      .subscribe(
        organization => {
          this.filterValues.organization = organization;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )

    this.nodeFilter.valueChanges
      .subscribe(
        node_id => {
          this.filterValues.node_id = node_id;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )

    this.cityFilter.valueChanges
      .subscribe(
        organization_city => {
          this.filterValues.organization_city = organization_city;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )

      this.stateFilter.valueChanges
      .subscribe(
        organization_state => {
          this.filterValues.organization_state = organization_state;
          this.eventJson.filter = JSON.stringify(this.filterValues);
        }
      )
  }
  initSignupForm() {
    this.criteriaForm = this.fb.group({
      eventType: ['', [Validators.required]],
      eventTypeValue: ['', [Validators.required]],
    });

    if (this.selectedeventTypeValue != '') {
      this.criteriaForm.patchValue({
        eventType: this.selectedtype,
        eventTypeValue: this.selectedeventTypeValue
      });

      // this.onSubmit();
    }

  }
  get f() {
    return this.criteriaForm.controls;
  }
  onSubmit() {
    this.showEvent = false;
    this.showEventJson = false;
    this.searchloader = true;
    // console.log('sub',this.criteriaForm.value);
    if (this.criteriaForm.invalid) {
      this.notiServ.showWarning("please Fill All Fields");
      return;
    }
    let url = environment.searchCriteria + '/';
    this.getSearchCriData = this.restServ.post(url, this.criteriaForm.value, {}).subscribe(res => {
      this.searchloader = false;
      this.showEvent = true;

      this.criteria_data = res.data;
      this.dataSource = new MatTableDataSource(this.criteria_data.aggregations.event.buckets)
      this.dataSource.sort = this.sortCriteria
    })

  }
  ShowJson(event: any) {
    this.searchloaderxl = true;
    this.event_count = event.doc_count
    this.getJsonCriData = this.restServ.post(environment.jsonCriteria, { 'form': this.criteriaForm.value, 'eventLabel': event.key, 'eventSize': this.event_count }, {}).subscribe(res => {
      this.eventDataJson = res.data.hits.hits;
      this.searchloaderxl = false;
      this.showEventJson = true;
      this.eventJson = new MatTableDataSource(this.eventDataJson)
      this.eventJson.paginator = this.paginatorEvent;
      this.eventJson.filterPredicate = this.createFilter();


      this.eventJson.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'project.name': return item.project.name;
          // //case 'id': return item._source.node_id;
          case 'organization_sector': return item._source.organization_sector;
          case 'event_timestamp': return item._source.event_timestamp;
          case 'organization_region': return item._source.organization_region;
          case 'organization': return item._source.organization;
          case 'node_id': return item._source.node_id;
          case 'honeypot': return item._source.honeypot;
          case 'event_label': return item._source.event_label;
          case 'organization_city': return item._source.organization_city;
          case 'organization_state': return item._source.organization_state;
          case 'session_id': return item._source.event_data.session_id;
          case 'remote_ip': return item._source.event_data.remote_ip;
          case 'local_ip': return item._source.event_data.local_ip;
          case 'target_profile': return item._source.event_data.target_profile;
          case 'service': return item._source.event_data.service;



          default: return item[property];
        }
      };
      this.eventJson.sort = this.sortJson;

    });

  }
  showJsonData(jsondata: any) {

    let dialogRef = this.dialog.open(ThreatJsonDataComponent, {
      data: { Object: jsondata }
    });
    dialogRef.afterClosed().subscribe(res => {

    })
  }

  getAllChecked(e: any) {
    let val = e.target.value;
    let sindex = this.displayedColumnsJson.indexOf(val);
    if (sindex > -1) {
      this.displayedColumnsJson.splice(sindex, 1);
    } else {
      this.displayedColumnsJson.splice(sindex, 0, val);
    }
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);
      return data._source.organization_sector.toString().toLowerCase().indexOf(searchTerms.organization_sector) !== -1
        && data._source.organization_region.toString().toLowerCase().indexOf(searchTerms.organization_region) !== -1
        && data._source.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
        && data._source.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data._source.organization_city.toString().toLowerCase().indexOf(searchTerms.organization_city) !== -1
        && data._source.organization_state.toString().toLowerCase().indexOf(searchTerms.organization_state) !== -1
    }
    return filterFunction;
  }

  ngOnDestroy(): void {
    if (this.getSearchCriData) {
      this.getSearchCriData.unsubscribe();
    }
    if (this.getJsonCriData) {
      this.getJsonCriData.unsubscribe();
    }
  }
}
