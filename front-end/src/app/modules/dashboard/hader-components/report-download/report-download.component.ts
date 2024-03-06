import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table'
import { DownloadService } from 'src/app/common/download.service';
import { SharedService } from 'src/app/common/shared.service';
import { dateFilters } from 'src/app/utils/global.constants';
import { dateFormat } from 'src/app/utils/global.constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormControl } from '@angular/forms';
import { LoginService } from 'src/app/core/services/login.service';
import { Subscription } from 'rxjs';
import { CookiestorageService } from 'src/app/common/cookiestorage.service';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-report-download',
  templateUrl: './report-download.component.html',
  styleUrls: ['./report-download.component.scss']
})
export class ReportDownloadComponent implements OnInit {
  getEventsData!: Subscription
  getOrgValData!: Subscription
  getReportGenData!: Subscription
  getGenCsvData!: Subscription
  getRepDownData!: Subscription

  dropdownList: any = [];
  selectedItems: any = [];
  userType: any;
  userState = false;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  allSelected = false;
  public downloadUrl: any;
  filtrval: boolean = true;
  searchloader: boolean = false;
  searchloaderxs: boolean = false;
  searchloaderxl: boolean = false;
  searchloaderFile: any = [];
  searchloaderJson: boolean = false;
  chkGenJson: boolean = false;
  JsonSectorData: boolean = false;
  JsonOrgData: boolean = false;
  OrgValData: boolean = false;
  ReportGenData: boolean = false;
  GenCsvData: boolean = false;
  RepDownData: boolean = false;
  selectedArray: any = [];

  isDisabled: boolean = false;

  csvDataToDownload: any = [];
  filename: any;
  currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en_US');
  organization: any;
  reportData: any
  jsonData: any
  log_id: any
  dateFormatA: any = dateFormat;

  displayedColumns = [
    'id',
    'organization_type',
    'organization_name',
    'start_date',
    'end_date',
    'generated_date',
    'status',
    'action'
  ];
  dataSource!: MatTableDataSource<any>;
  constructor(private loginService: LoginService,
    private download: DownloadService,
    private restServ: RestService,
    private notiServ: NotificationService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private cookServ:CookiestorageService,
    private rightClickService: RightClickService
    ) {
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  isDropdownDisabled = false;
  assetPath = environment.assetPath;
  dateFilterArray = dateFilters;
  reportDownloadForm: any = FormGroup;

  ngOnInit(): void {


    this.initSignupForm();
    this.dropdownList = [];
    this.selectedItems = [];

    // this.getAllNodes();
    this.getReportList();
    const interval = setInterval(() => this.getReportList(), 60000);
    this.userType = this.loginService.getUser().role;
    this.userDefault()
  }

  userDefault() {
    if (this.userType === 'user') {
      this.userType = true;
      this.reportDownloadForm.patchValue({
        organization_type: "organization.keyword"
      })
      this.userState = !this.userState;
            // Changes suggested by Anil Sir
      // this.isDropdownDisabled = true;
      this.getCriteriatype("organization.keyword")
    } else {
      this.userType = false;
    }

  }

  initSignupForm() {
    const firebasetoken = this.cookServ.getFireToken();
    console.log("firebasetoken : ",firebasetoken);
    //localStorage.getItem('firebasetoken')
    this.reportDownloadForm = this.fb.group({
      organization_type: ['', [Validators.required]],
      organization_typeName: [''],
      organization_name: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      date_filter: [''],
      end_date: ['', [Validators.required]],
      firebasetoken: [firebasetoken],
    });
  }


  getCriteriatype(value: any) {
    this.selectedItems = [];
    this.searchloaderxs = true;
    let url = environment.eventsData + '/' + value
    this.getEventsData = this.restServ.get(url, {}, {}).subscribe(res => {
      this.organization = res.data;
      this.resetFormFields();
      this.searchloaderxs = false;
      this.filtrval = false;

      this.organization = res.data.map((e: any, i: any) => {

        return { item_id: i, item_text: e.key }
      })
      if (this.userType) {
        this.reportDownloadForm.patchValue({
          organization_name: this.organization
        })
      }
    })
  }

  onSubmit() {
    this.searchloader = true;
    this.reportLogGenerate()
  }


  generateJson(row: any, i: any) {
    this.togLoader(i, 'show')
    this.GenCsvData = true
    this.getGenCsvData = this.restServ.post(environment.generateCsvReport, row, {}).subscribe(res => {
      this.togLoader(i, 'hide')
      this.csvDataToDownload = res.data.hits.hits;
      var newData:any = []
      res.data.hits.hits.map((e:any)=>{
newData.push(e._source)
      })
      if (this.csvDataToDownload.length > 0) {
        this.downloadJson(row, newData)

      } else {
        this.notiServ.showInfo("No Data found");
      }

    });

  }

  downloadJson(row: any, res: any) {
    //  this.searchloaderFile = false
    this.filename = row.organisation_type + '.json';
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('download', this.filename);
    var data = JSON.stringify(res);
    var url = "data:text/json;charset=UTF-8," + encodeURIComponent(data);
    this.downloadUrl = url;

    link.setAttribute('href', this.downloadUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  generatePdf(row: any) {
    this.OrgValData = true
    const filePath = '/BB_LOGS/CTMS-Node-Report/';
    let downloadFileUrl = filePath;
    let startDate = row.start_date.slice(0, 10);
    const arrDate = startDate.split("-");
    const newDate = arrDate[0] + "/" + arrDate[1] + "/" + arrDate[2];
    let endDate = row.end_date.slice(0, 10);
    downloadFileUrl += row.organisation_type + '/' + row.organisation_value +
      '/' + newDate + '/' + startDate
      + '-' + endDate + '/' + row.organisation_value + '.pdf';
    this.getOrgValData = this.restServ.getFile(downloadFileUrl).subscribe((data: any) => {
      let url = window.URL.createObjectURL(data);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = row.organisation_value + '.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }, (err) => {
      if (err.status == 404) {
        this.notiServ.showInfo("File Not Found");
      }
    })
  }

  getReportList() {
    let url = environment.reportGenerateList;
    this.ReportGenData = true

    this.restServ.get(url, {}, {}).subscribe(res => {
      this.reportData = res.data;
      this.dataSource = new MatTableDataSource(this.reportData)
      this.searchloaderxl = false;
      for (var i = 0; i < res.data.length; i++) {
        this.searchloaderFile[i] = 'hide';
      }
    })
    this.userDefault()
  }

  generateExcel() {
    this.download.exportExcel("reports", "")
  }

  generateCsv(event: any, i: any) {
    this.togLoader(i, 'show')
    this.GenCsvData = true
    this.getGenCsvData = this.restServ.post(environment.generateCsvReport, event, {}).subscribe(res => {
      this.togLoader(i, 'hide')
      this.csvDataToDownload = res.data.hits.hits;
      if (this.csvDataToDownload.length > 0) {
        var that = this;
        setTimeout(function () {
          that.download.exportCsv("csvreport", "");
        }, 1000);

      } else {
        this.notiServ.showInfo("No Data found");
      }

    });


  }

  reportLogGenerate() {

    let url = environment.reportLogGenerate;
    this.RepDownData = true
    this.getRepDownData = this.restServ.post(url, this.reportDownloadForm.value, {}).subscribe(res => {
      this.reportDownloadForm.reset({
        organization_type: '',
        organization_name: '',
        date_filter: ''
      });
      this.getReportList();
      this.searchloader = false;
      this.log_id = res.id

    })
  }

  onDateFilterChange(data: any) {
    let stepNumber = + data;
    if (stepNumber !== 5) {
      let { startDate, endDate } = this.sharedService.getStartAndEndDate(stepNumber);
      this.reportDownloadForm.patchValue({
        start_date: startDate,
        end_date: endDate
      });
    } else {
      this.reportDownloadForm.patchValue({
        start_date: '',
        end_date: ''
      });
    }
  }
  orgFilter = new FormControl('');
  eventFilter = new FormControl('');
  filterValues = {
    key: '',

  };
  resetFormFields() {
    this.reportDownloadForm.patchValue({
      date_filter: ''
    })
  }

  toggleAllSelection() {
    let org = [];
    if (this.allSelected) {
      this.reportDownloadForm.patchValue({
        organization_name: this.organization
      })
    } else {
      this.reportDownloadForm.patchValue({
        organization_name: []
      })
      this.allSelected = false;
    }
  }

  onSelectAll(items: any) {
  }
  ngOnDestroy(): void {
    if (this.userType === 'user') {
      this.getEventsData.unsubscribe();
    }

    if (this.OrgValData) {
      this.getOrgValData.unsubscribe();
    }

    if (this.GenCsvData) {
      this.getGenCsvData.unsubscribe();
    }
    if (this.RepDownData) {
      this.getRepDownData.unsubscribe();
    }
  }


  togLoader(i: any, loadType: string) {
    this.searchloaderFile[i] = loadType;
  }
}
