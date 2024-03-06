import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { ThreatJsonDataComponent } from 'src/app/modules/share/threat-json-data/threat-json-data.component';
import { MatDialog } from '@angular/material/dialog';
import { dateFilters } from 'src/app/utils/global.constants';
import { SharedService } from 'src/app/common/shared.service';
import { FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { LoginService } from 'src/app/core/services/login.service';
import { Subscription } from 'rxjs';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-threat-intel-events',
  templateUrl: './threat-intel-events.component.html',
  styleUrls: ['./threat-intel-events.component.scss']
})
export class ThreatIntelEventsComponent implements OnInit {
  getThreatIntelFormData!: Subscription;
  getCriteriaData!: Subscription;
  getAllIpsData!: Subscription;
  getAllOrgIpData!: Subscription;
  getAllNodesData!: Subscription;

  dropdownList: any = [];
  selectedItems: any = [];
  userType: any;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  displayedColumns = [
    'id',
    'key',
    'count',
  ];
  displayedColumnsIpJson = [
    'key',
    'count',
  ];

  displayedColumnsData: any = [
    { id: 0, columnVal: 'id', columnName: 'Id' },
    { id: 1, columnVal: 'organization_region', columnName: 'Organization region' },
    { id: 2, columnVal: 'organization', columnName: 'Organization' },
    { id: 3, columnVal: 'node_id', columnName: 'Node ID' },
    { id: 4, columnVal: 'event_label', columnName: 'Event Label' },
    { id: 5, columnVal: 'session_id', columnName: 'Session ID' },
    { id: 6, columnVal: 'remote_ip', columnName: 'Remote IP' },
    { id: 7, columnVal: 'local_ip', columnName: 'Local IP' },
    { id: 8, columnVal: 'target_profile', columnName: 'Target Profile' },
    { id: 9, columnVal: 'service', columnName: 'Service' },
    { id: 10, columnVal: 'country_long', columnName: 'Country' },
    { id: 11, columnVal: 'latitude', columnName: 'Latitude' },
    { id: 12, columnVal: 'longitude', columnName: 'Longitude' },
    { id: 13, columnVal: 'city', columnName: 'City' },
    { id: 14, columnVal: 'event_timestamp', columnName: 'TimeStamp' },
    { id: 15, columnVal: 'view_json', columnName: 'View Json' }
  ];
  displayedColumnsJson: any;
  allFilterSelected = false;
  selectedArray: any = [];
  constructor(
    private restServ: RestService,
    private loginService: LoginService,
    private notiServ: NotificationService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public sharedService: SharedService,
    private rightClickService: RightClickService) { }
  currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en_US');
  organization: any = [];
  // showLoader = false;
  table_heading: any;
  org_heading: any;
  event_ips: any
  showEvent = false;
  showEventType = false;
  showEventIps: boolean = true;
  allNodes: any = [];
  searchloader: boolean = false;
  searchloaderOrg: boolean = false;
  searchloaderxl: boolean = false;
  searchloaderxl1: boolean = false;
  showEventIpsJson = false;
  orgData!: any;
  overallEventTypes!: any;
  currentOrgName!: string;
  currentOrgEvent!: string;
  startDate!: any;
  endDate!: any;
  eventIpsData!: any;
  eventIpsJson!: any;
  event: any;
  JsonTotalCount: any = 20010;
  dateFilterArray = dateFilters;
  filterOrg: any;
  selectedOrg: any[] = [];
  userState = false;
  dataSource!: MatTableDataSource<any>;
  eventCount!: MatTableDataSource<any>;
  eventJson!: MatTableDataSource<any>;
  IpsJson!: MatTableDataSource<any>;
  @ViewChild('paginatorEvent') paginatorEvent!: MatPaginator;
  @ViewChild('sortEvent') sortEvent!: MatSort
  @ViewChild('paginatorOrg') paginatorOrg!: MatPaginator;
  @ViewChild('sortOrg') sortOrg!: MatSort
  @ViewChild('paginatorJson') paginatorJson!: MatPaginator;
  @ViewChild('sortJson') sortJson!: MatSort
  @ViewChild('paginatorIp') paginatorIp!: MatPaginator;
  @ViewChild('sortIp') sortIp!: MatSort

  ipFilter = new FormControl('');
  Jsonfrom = 1

  threatIntelForm: any = FormGroup;
  isDropdownDisabled = false;

  orgFilter = new FormControl('');
  org2Filter=new FormControl('');
  eventFilter = new FormControl('');
  eventlabelFilter=new FormControl('');
  regFilter = new FormControl('');
  nodeFilter = new FormControl('');
  cityFilter = new FormControl('');
  countryFilter = new FormControl('');


  filterValues = {
    key: '',
  };

  filterVal={
    organization_region: '',
    organization: '',
    node_id: '',
    event_label:'',
    city: '',
    country_long: ''
  };
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit(): void {
    this.displayedColumnsJson = this.displayedColumnsData.map((x: any) => x.columnVal)
    this.initSignupForm();
    this.getAllNodes();
    this.dropdownList = [];
    this.selectedItems = [];
    this.userType = this.loginService.getUser().role;
    if (this.userType === 'user') {
      this.userType = true;
      this.threatIntelForm.patchValue({
        organization_type: "organization.keyword"
      });
      this.userState = !this.userState;
      this.isDropdownDisabled = true;
      this.getCriteriatype("organization.keyword")
    } else {
      this.userType = false;
    }

    this.orgFilter.valueChanges
      .subscribe(
        key => {
          this.filterValues.key = key;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.eventFilter.valueChanges
      .subscribe(
        key => {
          this.filterValues.key = key;
          this.eventCount.filter = JSON.stringify(this.filterValues);
        }
      )
    this.ipFilter.valueChanges
      .subscribe(
        key => {
          this.filterValues.key = key;
          this.IpsJson.filter = JSON.stringify(this.filterValues);
        }
      )
      this.nodeFilter.valueChanges
      .subscribe(
        key => {
          this.filterVal.node_id = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
      this.org2Filter.valueChanges
      .subscribe(
        key => {
          this.filterVal.organization = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
      this.regFilter.valueChanges
      .subscribe(
        key => {
          this.filterVal.organization_region = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
      this.eventlabelFilter.valueChanges
      .subscribe(
        key => {
          this.filterVal.event_label = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
      this.cityFilter.valueChanges
      .subscribe(
        key => {
          this.filterVal.city = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
      this.countryFilter.valueChanges
      .subscribe(
        key => {
          this.filterVal.country_long = key;
          this.eventJson.filter = JSON.stringify(this.filterVal);
        }
      )
  }

  initSignupForm() {
    this.threatIntelForm = this.fb.group({
      organization_type: ['', [Validators.required]],
      organization_typeName: [''],
      organization_name: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      date_filter: [''],
      end_date: ['', [Validators.required]],
    });


  }

  get f() {
    return this.threatIntelForm.controls;
  }

  onSubmit() {
    this.searchloader = true;
    this.table_heading = this.threatIntelForm.value.organization_type;
    let organisationName = '';
    const data = this.threatIntelForm.value.organization_name ? this.threatIntelForm.value.organization_name.map((x: any) => x.key) : [];
    if (data.length) {
      organisationName = data.toString();
    }
    if (this.table_heading == "organization_region.keyword") {
      this.org_heading = "Organisations in " + organisationName + " Region"
    }
    else if (this.table_heading == "organization_sector.keyword") {
      this.org_heading = "Organisations in " + organisationName + " Sector"
    }
    else {
      this.org_heading = "Organisation - " + organisationName
    }

    if (this.threatIntelForm.invalid) {
      this.searchloader = false;
      this.notiServ.showWarning("Please fill all fields before Proceeding");
      return;
    }
    this.startDate = this.threatIntelForm.get('start_date').value;
    this.endDate = this.threatIntelForm.get('end_date').value;

    let url = environment.threatEvents;

    this.getThreatIntelFormData = this.restServ.post(url, { 'form': this.threatIntelForm.value, 'all_nodes': this.allNodes }, {}).subscribe(res => {
      this.searchloader = false;
      this.showEvent = true;
      this.orgData = res.data;

      this.dataSource = new MatTableDataSource(this.orgData.aggregations.organisation.buckets)
      this.dataSource.paginator = this.paginatorOrg;
      this.dataSource.sort = this.sortOrg;
      this.dataSource.filterPredicate = this.createFilter();


    })

  }

  getCriteriatype(value: any) {
    this.organization = [];
    this.selectedItems = [];
    this.searchloaderOrg = true;
    let url = environment.eventsData + '/' + value

    this.getCriteriaData = this.restServ.get(url, {}, {}).subscribe(res => {
      this.allFilterSelected = false;
      this.searchloaderOrg = false;

      this.organization = res.data.map((e: any, i: any) => {
        return { item_id: i, item_text: e.key }
      })
      if (this.userType) {
        this.threatIntelForm.patchValue({
          organization_name: this.organization
        });
      }
    })
  }

  getOrgType(value: number) {
    var getType = " ";
    if (value == 0) {
      getType = "organization_region.keyword";
    } else if (value == 1) {
      getType = "organization_sector.keyword";
    } else {
      getType = "organization.keyword";
    }
    return getType;
  }

  getOrgTypeName(value: number) {
    var getType = " ";
    if (value == 0) {
      getType = "organization_region";
    } else if (value == 1) {
      getType = "organization_sector";
    } else {
      getType = "organization";
    }
    return getType;
  }

  EventType(event: any) {
    this.event = event.key

    this.overallEventTypes = event;
    this.currentOrgName = event.key;

    this.eventCount = new MatTableDataSource(this.overallEventTypes.eventlabel.buckets)
    this.eventCount.paginator = this.paginatorEvent;
    this.eventCount.sort = this.sortEvent;
    this.eventCount.filterPredicate = this.createFilter();
    this.showEventType = true;
  }

  getAllIps(etype: any) {
    this.showEventIps = true;
    this.showEventIpsJson = false;
    this.searchloaderxl = true;
    this.currentOrgEvent = etype.key;
    this.getAllIpsData = this.restServ.post(environment.getAllOrgIps, { 'all_nodes': this.allNodes, 'org_name': this.currentOrgName, 'eventName': etype.key, 'ip_doc_count': etype.doc_count, 'startDate': this.startDate, 'endDate': this.endDate }, {}).subscribe(res => {
      this.searchloaderxl = false
      this.eventIpsData = res.data;
      this.showEventIps = false;

      this.IpsJson = new MatTableDataSource(this.eventIpsData.aggregations.ip_address.buckets)
      this.IpsJson.paginator = this.paginatorIp;
      this.IpsJson.sort = this.sortIp;
      this.IpsJson.filterPredicate = this.createFilter();

    });

  }

  ShowJson(ips: any) {
    this.showEventIpsJson = false;
    this.searchloaderxl1 = true;
    this.event_ips = ips.key;
    this.JsonTotalCount = ips.doc_count;
    this.getAllOrgIpData = this.restServ.post(environment.getAllOrgIpJson, { 'all_nodes': this.allNodes, 'org_name': this.currentOrgName, 'eventName': this.currentOrgEvent, 'event_ip': ips.key, 'json_doc_count': ips.doc_count, 'startDate': this.startDate, 'endDate': this.endDate, 'from': this.Jsonfrom }, {}).subscribe(res => {
      this.eventIpsJson = res.data.hits.hits;
      this.searchloaderxl1 = false;
      this.showEventIpsJson = true;

      this.eventJson = new MatTableDataSource(this.eventIpsJson)
      this.eventJson.paginator = this.paginatorJson;
      this.JsonTotalCount = res.data.hits.total;
      this.eventJson.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'project.name': return item.project.name;
          case 'organization_region': return item._source.organization_region;
          case 'organization': return item._source.organization;
          case 'node_id': return item._source.node_id;
          case 'event_label': return item._source.event_label;
          case 'session_id': return item._source.event_data.session_id;
          case 'remote_ip': return item._source.event_data.remote_ip;
          case 'local_ip': return item._source.event_data.local_ip;
          case 'target_profile': return item._source.event_data.target_profile;
          case 'service': return item._source.event_data.service;
          case 'country_long': return item._source.ip2location_data.country_long;
          case 'latitude': return item._source.ip2location_data.latitude;
          case 'longitude': return item._source.ip2location_data.longitude;
          case 'city': return item._source.ip2location_data.city;
          case 'event_timestamp': return item._source.event_timestamp;
          case 'view_json': return item.doc_count;
          default: return item[property];
        }
      };
      this.eventJson.sort = this.sortJson;
      this.eventJson.filterPredicate = this.makeFilter();

    });

  }
  showJsonData(jsondata: any) {

    let dialogRef = this.dialog.open(ThreatJsonDataComponent, {
      data: { Object: jsondata }
    });
    dialogRef.afterClosed().subscribe(res => {
    })
  }


  getAllNodes() {
    this.getAllNodesData = this.restServ.get(environment.getAllNodes, {}, {}).subscribe(res => {
      var len = res.length
      for (let i = 0; i < len; i++) {
        this.allNodes.push(res[i].id)
      }
    })

  }

  onDateFilterChange(data: any) {
    let stepNumber = + data;
    if (stepNumber !== 5) {
      let { startDate, endDate } = this.sharedService.getStartAndEndDate(stepNumber);
      this.threatIntelForm.patchValue({
        start_date: startDate,
        end_date: endDate
      });
    } else {
      this.threatIntelForm.patchValue({
        start_date: '',
        end_date: ''
      });
    }
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

      return ( data.key.toString().toLowerCase().indexOf(searchTerms.key) !== -1)
    }
    return filterFunction;
  }

  makeFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
if(searchTerms.country_long!= ""){
  // console.log("=======================",searchTerms.country_long , "--------------------",data._source.ip2location_data.country_long)
  return data._source.organization_region.toString().toLowerCase().indexOf(searchTerms.organization_region) !== -1
  && data._source.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
  && data._source.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
  && data._source.event_label.toString().toLowerCase().indexOf(searchTerms.event_label) !== -1
  && data._source.ip2location_data.city.toString().toLowerCase().indexOf(searchTerms.city) !== -1
  && data._source.ip2location_data.country_long ? data._source.ip2location_data.country_long.toString().toLowerCase().indexOf(searchTerms.country_long) !== -1 
  :false
}
   else{
    return data._source.organization_region.toString().toLowerCase().indexOf(searchTerms.organization_region) !== -1
    && data._source.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
    && data._source.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
    && data._source.ip2location_data.city.toString().toLowerCase().indexOf(searchTerms.city) !== -1
    && data._source.event_label.toString().toLowerCase().indexOf(searchTerms.event_label) !== -1
   }  
        // && data._source.city.toString().toLowerCase().indexOf(searchTerms.city) !== -1
        
    }
    return filterFunction;
  }

  toggleAllSelection() {
    let org = [];
    org = this.organization.map((x: any) => {
      return { region: x.key, status: true }
    });

    if (this.allFilterSelected) {
      this.threatIntelForm.patchValue({
        organization_name: this.organization
      });
    } else {
      this.allFilterSelected = false;
      this.threatIntelForm.patchValue({
        organization_name: []
      });
    }
  }


  onSelectAll(items: any) {
    this.allFilterSelected = true;
    this.toggleAllSelection()
  }
  ngOnDestroy(): void {
    if (this.getThreatIntelFormData) {
      this.getThreatIntelFormData.unsubscribe();
    }
    if (this.getCriteriaData) {
      this.getCriteriaData.unsubscribe();
    }
    if (this.getAllIpsData) {
      this.getAllIpsData.unsubscribe();
    }
    if (this.getAllOrgIpData) {
      this.getAllOrgIpData.unsubscribe();
    }
    if (this.getAllNodesData) {
      this.getAllNodesData.unsubscribe();
    }
  }
}
