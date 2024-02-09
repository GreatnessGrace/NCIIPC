import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DashboardserviceService } from 'src/app/core/services/dashboardservice.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
// import { ChipsDialogComponent } from '../chips-dialog/chips-dialog.component';
import { dateFilters } from 'src/app/utils/global.constants';
import { SharedService } from 'src/app/common/shared.service';
import { Subscription, forkJoin } from 'rxjs';
import { formatDate } from '@angular/common';
import { LoginService } from 'src/app/core/services/login.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
@Component({
  selector: 'app-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit {
  getRegSecOrgData!: Subscription
  getSearchOpeData!: Subscription
  getRegionData!: Subscription
  getAllSectorData!: Subscription
  getAllOrgData!: Subscription
  getSectorData!: Subscription
  getSectorsData!: Subscription
  getNodeIdData!: Subscription

  dropdownList: any = [];
  selectedItems: any = [];
  assetPath = environment.assetPath;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  searchloader: boolean = false;
  searchloaderxs: boolean = false;
  togchips: boolean = false;
  showsearch: boolean = false;
  chipsData: any = [];
  dateFilterArray = dateFilters;
  dateFilter: any;
  chipsForm: any = FormGroup;
  chipsDataDiv: boolean = true;


  allRegionSelected: any;
  img: any = [
    { img: "https://material.angular.io/assets/img/examples/shiba1.jpg" }
  ]

  additionalKeys: any = [
    { color: "red", img: "fa fa-connectdevelop" },
    { color: "green", img: "fa fa-barcode" },
    { color: "yellow", img: "fa fa-compress" },
    { color: "cadetblue", img: "fa fa-file-text-o" },
    { color: "safron", img: "fa fa-arrows" },
    { color: "aquamarine", img: "fa fa-external-link" },
    { color: "red", img: "fa fa-sticky-note-o" },
    { color: "green", img: "fa fa-cloud-download" },
    { color: "yellow", img: "fa fa-bug" },
    { color: "cadetblue", img: "fa fa-files-o" },
    { color: "safron", img: "fa fa-database" },
    { color: "aquamarine", img: "fa fa-sticky-note-o" },
    { color: "red", img: "fa fa-compress" },
  ]
  currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en_US');
  regionSelected: any;
  selectedCar: any;
  regions: any;
  sectors: any;
  organizations: any;
  sectorSelected: any;
  organizationSelected: any;
  minDate: any;
  maxDate: any = new Date;
  isDisabled = false;
  showCommaSeperate = false;
  signupSubmitted = false;
  allSectorSelected = false;
  allOrganisationSelected = false;
  allNodeSelected = false;
  showDateFilter = false;
  regionList: any[] = [];
  selectedResgion: any[] = [];
  finalRegionList: any[] = [];
  finalSectorList: any[] = [];
  selectedSectorArr: any[] = [];
  selectedOrganizations: any[] = [];
  finalOrganizationList: any;
  finalNodeList: any;
  accessNode: any[] = [];
  allNodes: any = [];
  showSector = false;
  showOrganization = false;
  showNodes = false;
  userType: any = [];
  searchloaderReg: Boolean = true
  searchloaderSec: Boolean = true
  searchloaderOrg: Boolean = true
  constructor(public dialog: MatDialog, private dashboardService: DashboardserviceService,
    public fb: FormBuilder, private restServ: RestService, private sharedService: SharedService, private loginService: LoginService) {
    this.initChipsForm();
    this.userType = this.loginService.getUser().role;
  }



  initChipsForm() {
    this.chipsForm = this.fb.group({
      node: [, [Validators.required]],
      sector: ['', [Validators.required]],
      region: ['', [Validators.required]],
      organization: ['', [Validators.required]],
      EndDate: ['', [Validators.required]],
      StartDate: ['', [Validators.required]],
      dateFilter: [1, [Validators.required]],
    });
  }


  ngOnInit(): void {
    this.getRegSecOrgData = forkJoin({
      regions: this.restServ.get(environment.region, {}, {}),
      sectors: this.restServ.get(environment.getAllSectors, {}, {}),
      organisations: this.restServ.get(environment.getAllOrganization, {}, {}),
    }).subscribe((data) => {
      this.searchloaderReg=false
      this.searchloaderSec = false
      this.searchloaderOrg = false
      this.allRegionSelected = true;
      this.allSectorSelected = true;
      this.allOrganisationSelected = true;
      this.sectors = data.sectors.data;
      this.regions = data.regions.data;
      this.organizations = data.organisations.data;
      this.finalSectorList = this.sectors;
      // this.finalOrganizationList =  this.organizations;
      this.finalOrganizationList = this.organizations.map((e: any, i: any) => {
        return { item_id: i, item_text: e.key }
      });


      this.chipsForm.patchValue({
        region: this.regions
      });
      this.chipsForm.patchValue({
        sector: this.sectors
      });
      this.chipsForm.patchValue({
        organization: this.organizations
      });

      this.getDate();
      this.searchOperation();
      this.selectedDefaultRegions();
      this.onSelectAll(this.finalOrganizationList)
    })


    setTimeout(() => {
      this.showCommaSeperate = true;
    }, 6000);

  }
  togsearch() {
    this.showsearch = !this.showsearch;
  }
  togchip() {
    this.togchips = !this.togchips;
  }

  eventChange(evt: string) {
    if (evt === 'region') {
      this.getAllSecoter();
    }
    if (evt === 'sector') {
      this.getAllOrganization();
    }


  }

  submitbutton(evt: any) {
    this.isDisabled = true;
    this.searchOperation(evt);

  }

  dateRange(minDate: any, maxDate: any) {
    let { startDate, endDate } = this.sharedService.formatMinMaxDate(minDate, maxDate);
    this.minDate = startDate;
    this.maxDate = endDate;
  }

  // Filter operation
  searchOperation(evt?: any) {

    this.searchloader = true;
    this.chipsData = [];

    let dataToSend = {
      region: this.chipsForm.value.region,
      sector: this.chipsForm.value.sector,
      organization: this.chipsForm.value.organization,
      minDate: this.minDate,
      maxDate: this.maxDate,
      dateFilter: this.chipsForm.value.dateFilter
    }

    this.getSearchOpeData = this.restServ.post(environment.searchOperation, dataToSend, {}).subscribe(res => {
      let totalCurrent = res.data.scanPorts.current_range.doc_count 
      let totalPrevious = res.data.scanPorts.previous_range.doc_count
      let totalDiffCount = Math.abs(totalPrevious-totalCurrent)
      const differences = res.data.scanPorts.previous_range.event_name_previous.buckets
      .filter((prevBucket:any) => {
        const currentBucket = res.data.scanPorts.current_range.event_name_current.buckets.find((currBucket:any) => currBucket.key === prevBucket.key);
        return currentBucket;
      })
.map((prevBucket: any) => {
        const currentBucket = res.data.scanPorts.current_range.event_name_current.buckets.find((currBucket: any) => currBucket.key === prevBucket.key);
        const previousCount = prevBucket.doc_count;
        const currentCount = currentBucket ? currentBucket.doc_count : 0;
        let difference = currentCount - previousCount;
        const diffPercentage =((Math.abs(difference/previousCount))*100).toFixed(2) + "%";
        var status
        if (difference < 0) {
          status = 'down'
        }
        else {
          status = 'up'
        }

        return {
          key: currentBucket?.key,
          previousCount,
          doc_count :currentCount,
          difference,
          diffPercentage,
          status
        };
      });
// console.log("differences",differences)
      this.chipsDataDiv = true
      this.isDisabled = false;
      var current_data = differences
      this.dashboardService.filterControl.next(dataToSend)
      if (current_data && !current_data.length) {
        this.searchloader = false;
      }

      current_data.forEach((element: any, i: any) => {
        element.color = this.additionalKeys[i].color
        this.chipsData.push(element)
        this.chipsDataDiv = false
        this.searchloader = false;
      })
    })
  }

  // get all regions
  PerticularReson() {

    this.getRegionData = this.restServ.get(environment.region, {}, {}).subscribe(res => {
      this.regions = res["data"]
      this.regionSelected = this.regions[0].key;
    })
  }

  getAllSecoter() {

    this.getAllSectorData = this.restServ.get(environment.getAllSectors, {}, {}).subscribe(res => {
      this.sectors = res["data"];
      this.sectorSelected = this.sectors[0].key;
    })
  }


  // get all organization
  getAllOrganization() {
    this.getAllOrgData = this.restServ.get(environment.getAllOrganization, {}, {}).subscribe(res => {
      this.organizations = res["data"];
      this.organizationSelected = this.organizations[0].key;



    })

  }

  onDateFilterChange(e: any) {

    if (e.value == 5) {
      this.showDateFilter = true;
    }
    else {
      this.showDateFilter = false;
    }
    this.dateFilter = e.value;
    let { startDate, endDate } = this.sharedService.getStartAndEndDate(this.dateFilter);
    this.minDate = startDate;
    this.maxDate = endDate;
  }

  getDate() {
    this.dateFilter = 1;
    let { startDate, endDate } = this.sharedService.getStartAndEndDate(this.dateFilter);
    this.minDate = startDate;
    this.maxDate = endDate;
  }

  selectedDefaultRegions() {
    this.selectedResgion = []
    if (this.chipsForm.value && this.chipsForm.value.region) {

      this.selectedResgion = this.chipsForm.value.region.map((x: any) => {
        return { region: x.key, status: true }
      });
    }
  }

  selectedRegions() {
 
    this.allSectorSelected = false;
    this.selectedResgion = []
    if (this.chipsForm.value && this.chipsForm.value.region) {
      this.selectedResgion = this.chipsForm.value.region.map((x: any) => {
        return { region: x.key, status: true }
      });
    }
    if (this.selectedResgion.length != 0) {
      this.getSector(this.selectedResgion)
    } else {
      this.finalSectorList = []
    }
  }

  getSector(region: any) {
    this.searchloaderSec = true
    this.searchloaderOrg = true
    let url = environment.getSector
    this.getSectorsData = this.restServ.post(url, region, {}).subscribe(res => {
      this.finalSectorList = res.data
      this.showSector = true;
      this.searchloaderSec = false
    })

  }

  getOrganization(sector: any) {

    let url = environment.getOrg
    this.getSectorData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.searchloaderOrg = false
      this.organizations = res["data"];
      this.organizationSelected = this.organizations[0].key;
      this.finalOrganizationList = this.organizations.map((e: any, i: any) => {
        return { item_id: i, item_text: e.key }
      });
    })

  }

  selectedSector() {
    let sectorArray
    this.allOrganisationSelected = false;
    this.selectedSectorArr = []
    if (this.chipsForm.value && this.chipsForm.value.sector) {
      this.selectedSectorArr = this.chipsForm.value.sector.map((x: any) => {
        return { sector: x.key, status: true }
      });
      sectorArray = this.chipsForm.value.sector.map((x: any) => {
        return x.key
      });
    }
    this.getOrganization(sectorArray)
    let region_sector = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr
    }
  }




  toggleAllSelection(type: string) {

    this.selectedItems = [];
    this.finalOrganizationList = this.organizations.map((e: any, i: any) => {
      return { item_id: i, item_text: e.key }
    });
    switch (type) {
      case 'region': {

        if (this.allRegionSelected) {
          this.chipsForm.patchValue({
            region: this.regions
          });

          this.selectedRegions();
        } else {
          this.chipsForm.patchValue({
            region: []
          });
          this.finalSectorList = [];
          this.finalOrganizationList = [];
          this.finalNodeList = [];
          this.allSectorSelected = false;
          this.allOrganisationSelected = false;
          this.allNodeSelected = false;
        }
      }
        break;
      case 'sector': {
        if (this.allSectorSelected) {
          this.chipsForm.patchValue({
            sector: this.finalSectorList
          });
          // this.selectedSector();
        } else {
          this.chipsForm.patchValue({
            sector: []
          });
          this.finalOrganizationList = [];
          this.finalNodeList = [];
          this.allOrganisationSelected = false;
          this.allNodeSelected = false;
        }
      }
        break;
      case 'organization': {
        if (this.allOrganisationSelected) {
          this.chipsForm.patchValue({
            organization: this.finalOrganizationList
          });
          this.selectedOrganization();
        } else {
          this.chipsForm.patchValue({

            organization: []
          });
          this.finalNodeList = [];
          this.allNodeSelected = false;

        }
      }
        break;
      case 'nodes': {
        if (this.allNodeSelected) {
          this.allNodes.push({ "id": 0 })
          this.chipsForm.patchValue({
            node: this.finalNodeList
          });
          this.nodeAccess();
        } else {
          this.allNodes = []
          this.chipsForm.patchValue({
            node: []
          });
        }
      }
    }
  }


  // node permission procedure
  nodeAccess() {
    this.accessNode = []
    if (this.chipsForm.value && this.chipsForm.value.node) {
      this.accessNode = this.chipsForm.value.node.map((x: any) => {
        return { id: x.id, status: true }
      });
    }
  }

  // get organization start
  selectedOrganization() {
    this.selectedOrganizations = [];
    if (this.chipsForm.value && this.chipsForm.value.organization) {
      this.selectedOrganizations = this.chipsForm.value.organization.map((x: any, i: any) => {
        return { item_id: i, item_text: x.key }
      });
    }

    let region_sector_organization = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr,
      organization: this.selectedOrganizations
    }

    if (this.selectedSectorArr.length != 0) {
      this.getdNodeId(region_sector_organization)
    } else {
      this.finalNodeList = []
    }
  }



  getdNodeId(sector: any) {
    let url = environment.getNodeId

    this.getNodeIdData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalNodeList = res.data
      this.showNodes = true;
    })

  }



  onSelectAll(items: any) {
    this.selectedItems = items;
  }
  ngOnDestroy(): void {
    if (this.getRegSecOrgData) {
      this.getRegSecOrgData.unsubscribe();
    }

    if (this.getSearchOpeData) {
      this.getSearchOpeData.unsubscribe();
    }


    if (this.getRegionData) {
      this.getRegionData.unsubscribe();
    }
    if (this.getAllSectorData) {
      this.getAllSectorData.unsubscribe();
    }
    if (this.getAllOrgData) {
      this.getAllOrgData.unsubscribe();
    }
    if (this.getSectorData) {
      this.getSectorData.unsubscribe();
    }
    if (this.getSectorsData) {
      this.getSectorsData.unsubscribe();
    }
    if (this.getNodeIdData) {
      this.getNodeIdData.unsubscribe();
    }
  }
}


