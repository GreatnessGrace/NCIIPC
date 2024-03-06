import { Component, OnInit, ViewChild } from '@angular/core';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dateFilters } from 'src/app/utils/global.constants';
import { SharedService } from 'src/app/common/shared.service';
import { DownloadService } from 'src/app/common/download.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'
import { ViewavComponent } from '../../share/viewav/viewav.component';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-india-ips',
  templateUrl: './india-ips.component.html',
  styleUrls: ['./india-ips.component.scss']
})
export class IndiaIpsComponent implements OnInit {
  getCountriesdata!: Subscription
  getIpsLengthData!: Subscription
  getIndiaIpsData!: Subscription



  assetPath = environment.assetPath;
  allIps: any = [];
  cntry: any = 'India';
  allCountries: any = [];
  ipsForm: any = FormGroup;
  searchloader: boolean = false;
  countryIps: boolean = true;
  countryHash: boolean = true;


  dateFilterArray = dateFilters;
  dataSource!: MatTableDataSource<any>;
  @ViewChild('matPaginator') matPaginator!: MatPaginator;
  @ViewChild('sort') sort!: MatSort;

  dataSourceIp!: MatTableDataSource<any>;
  @ViewChild('matPaginatorIp') matPaginatorIp!: MatPaginator;
  @ViewChild('sortIp') sortIp!: MatSort;
  eventFilter = new FormControl('');
  ispFilter = new FormControl('');
  portFilter = new FormControl('');
  portFilterIP = new FormControl('');
  eventFilterIP = new FormControl('');
  ispFilterIP  = new FormControl('');
  total_len: any
  endingIndex: any = 10
  startingIndex: any = 1
  displayedColumns: string[] =
    [
      'key',
      'count',
      'event_timestamp',
      "bin_vt_av_results",
      'remote_port',
      'event_label',
      'ip2location_data',
      'view_av'
    ];

    displayedColumnsIp: string[] =
    [
      'key',
      'count',
      'event_timestamp',
      'remote_port',
      'event_label',
      'ip2location_data'
    ];
  filterValues = {
    event_label: '',
    ip2location_data: '',
    remote_port: ''
  };

  constructor(
    private restServ: RestService,
    private download: DownloadService,
    private fb: FormBuilder,
    private router: Router,
    public sharedService: SharedService,
    public dialog: MatDialog,
    private rightClickService: RightClickService
  ) { }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit(): void {
    this.initSignupForm();
    this.getAllcountries();
    this.eventFilter.valueChanges
      .subscribe(
        event_label => {
          this.filterValues.event_label = event_label;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
      this.eventFilterIP.valueChanges
      .subscribe(
        event_label => {
          this.filterValues.event_label = event_label;
          this.dataSourceIp.filter = JSON.stringify(this.filterValues);
        }
      )
    this.ispFilter.valueChanges
      .subscribe(
        ip2location_data => {
          this.filterValues.ip2location_data = ip2location_data;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
      this.ispFilterIP.valueChanges
      .subscribe(
        ip2location_data => {
          this.filterValues.ip2location_data = ip2location_data;
          this.dataSourceIp.filter = JSON.stringify(this.filterValues);
        }
      )
    this.portFilter.valueChanges
      .subscribe(
        remote_port => {
          this.filterValues.remote_port = remote_port;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )

      this.portFilterIP.valueChanges
      .subscribe(
        remote_port => {
          this.filterValues.remote_port = remote_port;
          this.dataSourceIp.filter = JSON.stringify(this.filterValues);
        }
      )
  }

  getIpDetails(e:any){
    let ip = e.key;
    this.router.navigateByUrl('/dashboard/SearchData?type=ip_address&data='+ip);
    
  }

  getAllcountries(){


    this.getCountriesdata = this.restServ.get(environment.allcountries, {}, {}).subscribe(res => {
      this.allCountries = res;
    });
  }

  initSignupForm() {

    this.ipsForm = this.fb.group({
      country_filter: ['India', [Validators.required]],
      indicator_type: ['ip', [Validators.required]],
      start_date: [''],
      date_filter: [1],
      end_date: [''],

    });


    this.onDateFilterChange(1);
    this.getIndiaIps();
  }

  viewAvdet(data: any) {
    let dialogRef = this.dialog.open(ViewavComponent, {
      data: data
    });
    dialogRef.afterClosed().subscribe(res => {
    })

  }

  getIndiaIps() {
    this.searchloader = true;
    this.ipsForm.value.start = this.startingIndex;
    this.ipsForm.value.end = this.endingIndex;
    if (this.ipsForm.value.indicator_type == "hash") {
      this.countryHash = false
      this.countryIps = true
      this.getIndiaIpsData = this.restServ.post(environment.indiaIPsHash, this.ipsForm.value, {}).subscribe(res => {
        this.allIps = res.data.aggregations.ips.buckets;
        this.searchloader = false;
        this.dataSource = new MatTableDataSource(res.data.aggregations.ips.buckets)
        this.dataSource.paginator = this.matPaginator;
        this.dataSource.filterPredicate = this.createFilter();
        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'project.name': return item.project.name;
            // case 'top_result.hits.hits[0]._source.ip2location_data.isp': return item.top_result.hits.hits[0]._source.ip2location_data.isp;
            case 'event_label': return item.top_result.hits.hits[0]._source.event_data?.remote_port;
            case 'remote_port': return item.top_result.hits.hits[0]._source.event_label;
            case 'ip2location_data': return item.top_result.hits.hits[0]._source.ip2location_data.isp;
            case 'bin_vt_av_results': return item.top_result.hits.hits[0]._source.bin_vt_av_results;
            case 'count': return item.doc_count;
            default: return item[property];
          }
        };
        this.dataSource.sort = this.sort;
      });
    }
    else{
      this.countryHash = true
      this.countryIps = false
      this.getIndiaIpsData = this.restServ.post(environment.indiaIPs, this.ipsForm.value, {}).subscribe(res => {
        this.allIps = res.data.aggregations.ips.buckets;
        this.searchloader = false;
        this.dataSourceIp = new MatTableDataSource(res.data.aggregations.ips.buckets)
        this.dataSourceIp.paginator = this.matPaginatorIp;
        this.dataSourceIp.filterPredicate = this.createFilter();
        this.dataSourceIp.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'project.name': return item.project.name;
            case 'event_label': return item.top_result.hits.hits[0]._source.event_data?.remote_port;
            case 'remote_port': return item.top_result.hits.hits[0]._source.event_label;
            case 'ip2location_data': return item.top_result.hits.hits[0]._source.ip2location_data.isp;
            case 'count': return item.doc_count;
            default: return item[property];
          }
        };
        this.dataSourceIp.sort = this.sortIp;
      });
    }

  }

  onPageChanged(event: any) {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;
    this.startingIndex = pageIndex * pageSize + 1;
    this.endingIndex = this.startingIndex + pageSize - 1;
  
    this.getIndiaIps();
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      if (searchTerms.event_label != '') {
        return data.top_result?.hits?.hits[0]._source.event_label ? data.top_result?.hits?.hits[0]._source.event_label.toString().toLowerCase().indexOf(searchTerms.event_label.toLowerCase()) !== -1 : false

      }
      else if (searchTerms.remote_port != '') {
        return data.top_result.hits.hits[0]._source.event_data?.remote_port ? data.top_result.hits.hits[0]._source.event_data?.remote_port.toString().toLowerCase().indexOf(searchTerms.remote_port.toLowerCase()) !== -1 : false
      }
      else {
        return data.top_result.hits.hits[0]._source.ip2location_data.isp.toString().toLowerCase().indexOf(searchTerms.ip2location_data.toLowerCase()) !== -1
      }
    }
    return filterFunction;
  }

  generateCsv() {

    if (this.ipsForm.value.indicator_type == "hash") {
    this.download.exportCsv("country-hash", "")
    } else {
    this.download.exportCsv("country-ip", "")
    }
  }


  onDateFilterChange(data: any) {
    let stepNumber = + data;
    if (stepNumber !== 5) {
      let { startDate, endDate } = this.sharedService.getStartAndEndDate(stepNumber);
      this.ipsForm.patchValue({
        start_date: startDate,
        end_date: endDate
      });
    } else {
      this.ipsForm.patchValue({
        start_date: '',
        end_date: ''
      });
    }
  }



  onSubmit() {
    this.cntry = this.ipsForm.value.country_filter
    this.getIndiaIps();


  }

  ngOnDestroy(): void {
    if (this.getCountriesdata) {
      this.getCountriesdata.unsubscribe();
    }
    if (this.getIndiaIpsData) {
      this.getIndiaIpsData.unsubscribe();
    }
  }

}
