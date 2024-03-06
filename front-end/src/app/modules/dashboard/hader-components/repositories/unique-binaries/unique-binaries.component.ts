import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { ThreatJsonDataComponent } from 'src/app/modules/share/threat-json-data/threat-json-data.component';
import { ViewavComponent } from 'src/app/modules/share/viewav/viewav.component';
import { environment } from 'src/environments/environment';
import { dateFilters } from 'src/app/utils/global.constants';
import { SharedService } from 'src/app/common/shared.service';
import { dateTimeFormat } from 'src/app/utils/global.constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ThreatScoreComponent } from 'src/app/modules/share/threat-score/threat-score.component';
import { HybridReportJsonDataComponent } from 'src/app/modules/share/hybrid-report-json-data/hybrid-report-json-data.component';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-unique-binaries',
  templateUrl: './unique-binaries.component.html',
  styleUrls: ['./unique-binaries.component.scss']
})
export class UniqueBinariesComponent implements OnInit {
  total_binaries: any
  getAllNodesData!: Subscription;
  getUniqueBinFormData!: Subscription;
  getUniBinValData!: Subscription;
  getDownloadFileData !: Subscription
  dropdownList: any = [];
  selectedItems: any = [];
  showUniqueBinaries = true;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  chipsType: any = [];
  constructor(private restServ: RestService, private notiServ: NotificationService, private fb: FormBuilder, public dialog: MatDialog, private sharedService: SharedService,
    private rightClickService: RightClickService) { }
    onRightClick(event: MouseEvent): void {
      this.rightClickService.handleRightClick(event);
    }
  uniqueBinaryForm: any = FormGroup;

  @ViewChild('sortBinarySql') sortBinarySql!: MatSort;
  @ViewChild('paginatorSql') paginatorSql!: MatPaginator;
  // innerDataSource!: MatTableDataSource<any>;
  innerDataSource: any = [];
  @ViewChild('sortBinary') sortBinary!: MatSort;
  @ViewChild('paginator') paginator!: MatPaginator;
  // @ViewChild('innerPaginator') innerPaginator!: MatPaginator;
  allNodes: any;
  selectednode: any;
  selectednode1: any;
  selectedNodes: any[] = [];
  accessNode: any[] = [];
  allNodeSelected = false;
  searchloaderxl: boolean = false;
  expandedElement: boolean = false;
  showEvent = false;
  dateFilterArray = dateFilters;
  dateFormatA = dateTimeFormat;
  finalNodeList: any;
  unclassifiedColumn: boolean = false;
  displayedColumns: any;
  searchloaderxldiv: boolean = false;

  avTable: any
  responseData: any
  // displayedColumnsUnique = [
  //   'id',
  //   'node_id',
  //   'bin_id',
  //   'binmd',
  //   'event_timestamp',
  //   'remote_ip',
  //   'av_class',
  //   'view_av',
  //   'view_json'
  // ];

  displayedColumnsUnique = [
    'id',
    'node_id',
    'bin_id',
    'bin_md5',
    'bin_capture_time',
    'bin_classification',
    'view_av',
    // 'yara_status',
    // 'ml_classification',
    // 'view_data',
    // 'hybrid_report',
    'threat_score',
    'download'
 
  ];

  displayedColumnsUnclassified = [
    'id',
    'node_id',
    'bin_id',
    'binmd',
    'event_timestamp',
    'remote_ip',
    'threat_score',
    'view_json'
  ];

  innerDisplayedColumns = [
    'key'
  ];

  binFilter = new FormControl('');
  mdFilter = new FormControl('');
  avClassFilter = new FormControl('');

  filterValues = {
    bin_id: '',
    md5_hash: '',
    av_class: '',
    ml_classification: '',
    yara_status: '',
    view_av: '',
  };

  binFilt = new FormControl('');
  mdFilterSql = new FormControl('');
  avFilterSql = new FormControl('');
  // avClassFilterSql = new FormControl('');
  yaraFilterSql = new FormControl('');
  mlFilterSql = new FormControl('');
  filterValuesSql = {
    bin_id: '',
    bin_md5: '',
    bin_classification: '',
    // view_av: '',
    yara_status: '',
    ml_classification: ''
  };

  dataSourceSql!: MatTableDataSource<any>;

  dataSource!: MatTableDataSource<any>;

  ngOnInit(): void {
    this.initSignupForm();
    this.getAllNodes();
    this.dropdownList = [];
    this.selectedItems = [];

    this.binFilter.valueChanges
      .subscribe(
        bi_id => {

          this.filterValues.bin_id = bi_id;
          this.dataSource.filter = JSON.stringify(this.filterValues);

        }
      )



    this.mdFilter.valueChanges
      .subscribe(
        md5_hash => {
          this.filterValues.md5_hash = md5_hash;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )

    this.avClassFilter.valueChanges
      .subscribe(
        av_class => {
          this.filterValues.av_class = av_class;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )



    ///////////////////////
    // dataSourceSql!: MatTableDataSource<any>;

    this.binFilt.valueChanges
      .subscribe(
        bin_id => {
          this.filterValuesSql.bin_id = bin_id;
          this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);

        }
      );

    this.mdFilterSql.valueChanges
      .subscribe(
        bin_md5 => {
          this.filterValuesSql.bin_md5 = bin_md5;
          this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);
        }
      );

    this.avFilterSql.valueChanges
      .subscribe(
        bin_classification => {
          this.filterValuesSql.bin_classification = bin_classification;
          this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);
        }
      );

    // this.avClassFilterSql.valueChanges
    //   .subscribe(
    //     view_av => {
    //       this.filterValuesSql.view_av = view_av;
    //       this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);
    //     }
    //   );
    this.yaraFilterSql.valueChanges
      .subscribe(
        yara_status => {
          this.filterValuesSql.yara_status = yara_status;
          this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);
        }
      );

    this.mlFilterSql.valueChanges
      .subscribe(
        ml_classification => {
          this.filterValuesSql.ml_classification = ml_classification;
          this.dataSourceSql.filter = JSON.stringify(this.filterValuesSql);
        }
      );
    // ///////////////////////////////////
  }
  getAllNodes() {

    this.getAllNodesData = this.restServ.get(environment.getAllNodes, {}, {}).subscribe(res => {
      // const dat = res
      // this.dataSource = new MatTableDataSource(dat)

      this.allNodes = res.filter((e: any) => {
        if (e.id != 0) {
          return e;
        }
      })
      // this.allNodes = res;
      this.finalNodeList = this.allNodes;
      this.allNodes = this.finalNodeList.map((e: any, i: any) => {
        return { item_id: i, item_text: e.id }
      })
    })

  }


  initSignupForm() {
    this.uniqueBinaryForm = this.fb.group({
      node_ids: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      binary_type: ['', [Validators.required]],
      date_filter: ['']
    });
  }

  get f() {
    return this.uniqueBinaryForm.controls;
  }

  // in case of elastic search 
  //   onSubmit() {
  //     this.showEvent = false
  //     this.uniqueBinaryForm.value.node_ids = this.accessNode
  //     this.searchloaderxl = true;
  //     if (this.uniqueBinaryForm.invalid) {
  //       this.notiServ.showWarning("please Fill All Fields");
  //       return;
  //     }
  //     let url = environment.uniqueBinary;
  //     if (this.uniqueBinaryForm.value.binary_type == 'unclassified_binary'){
  //       this.unclassifiedColumn = true
  //       this.displayedColumns = this.displayedColumnsUnclassified
  //     }
  //     else{
  //       this.displayedColumns = this.displayedColumnsUnique
  //     }
  //     this.uniqueBinaryForm.get('node_ids').setValue(this.selectedItems);

  //     this.getUniqueBinFormData=this.restServ.post(url, this.uniqueBinaryForm.value, {}).subscribe(res => {
  //       if (res.data?.aggregations?.unique_bins?.buckets?.length == 0) {
  //         this.notiServ.alertNoData("No Data Found")
  //         this.searchloaderxl = false;
  //       }
  //       else {
  //         let data = res.data?.aggregations?.unique_bins?.buckets
  //         this.dataSource = new MatTableDataSource(res.data?.aggregations?.unique_bins?.buckets)
  //  this.dataSource.paginator = this.paginator;
  //  this.dataSource.filterPredicate = this.createFilter();
  //         this.dataSource.sortingDataAccessor = (item, property) => {
  //           switch (property) {
  //             case 'project.name': return item.project.name;
  //             case 'bin_id': return item.top_bin_data.hits.hits[0]._source.bin_id;
  //             case 'binmd': return item.top_bin_data.hits.hits[0]._source.md5_hash;
  //             case 'event_timestamp': return item.top_bin_data.hits.hits[0]._source.event_timestamp;
  //             case 'remote_ip': return item.top_bin_data.hits.hits[0]._source.event_data.remote_ip;
  //             case 'view_av': return item.top_bin_data.hits.hits[0]._source.bin_vt_av_classification_ratio;
  //             case 'av_class': return item.top_bin_data.hits.hits[0]._source.bin_av_class

  //             default: return item[property];
  //           }
  //         };
  //         this.dataSource.sort = this.sortBinary;
  //         const sortState: Sort = { active: 'event_timestamp', direction: 'desc' };
  //         this.sortBinary.active = sortState.active;
  //         this.sortBinary.direction = sortState.direction;
  //         this.sortBinary.sortChange.emit(sortState);
  //         this.showEvent = true;
  //         this.searchloaderxl = false;
  //         for (var i = 0; i < data?.length; i++) {
  //           this.chipsType[i] = 'hide';
  //         }
  //       }

  //     });

  //   }

  onSubmit() {
    this.showEvent = false
    this.uniqueBinaryForm.value.node_ids = this.accessNode
    this.searchloaderxl = true;
    if (this.uniqueBinaryForm.invalid) {
      this.notiServ.showWarning("please Fill All Fields");
      return;
    }
    let url = environment.uniqueBinary;
    this.uniqueBinaryForm.get('node_ids').setValue(this.selectedItems);

    if (this.uniqueBinaryForm.value.binary_type == 'unclassified_binary') {
      this.showUniqueBinaries = false //mysql
      this.unclassifiedColumn = true
      this.displayedColumns = this.displayedColumnsUnclassified
      this.getUniqueBinFormData = this.restServ.post(url, this.uniqueBinaryForm.value, {}).subscribe(res => {
        if (res.data?.aggregations?.unique_bins?.buckets?.length == 0) {
          this.notiServ.alertNoData("No Data Found")
          this.searchloaderxl = false;
        }
        else {
          let data = res.data?.aggregations?.unique_bins?.buckets
          this.dataSource = new MatTableDataSource(res.data?.aggregations?.unique_bins?.buckets)
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = this.createFilter();
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'project.name': return item.project.name;
              case 'bin_id': return item.top_bin_data.hits.hits[0]._source.bin_id;
              case 'binmd': return item.top_bin_data.hits.hits[0]._source.md5_hash;
              case 'event_timestamp': return item.top_bin_data.hits.hits[0]._source.event_timestamp;
              case 'remote_ip': return item.top_bin_data.hits.hits[0]._source.event_data.remote_ip;
              case 'view_av': return item.top_bin_data.hits.hits[0]._source.bin_vt_av_classification_ratio;
              case 'av_class': return item.top_bin_data.hits.hits[0]._source.bin_av_class

              default: return item[property];
            }
          };
          this.dataSource.sort = this.sortBinary;
          const sortState: Sort = { active: 'event_timestamp', direction: 'desc' };
          this.sortBinary.active = sortState.active;
          this.sortBinary.direction = sortState.direction;
          this.sortBinary.sortChange.emit(sortState);
          this.showEvent = true;
          this.searchloaderxl = false;
          for (var i = 0; i < data?.length; i++) {
            this.chipsType[i] = 'hide';
          }
        }

      });
    }
    else {
      // this.displayedColumns = this.displayedColumnsUnique
      //mysql
      this.showEvent = false;
      this.showUniqueBinaries = true
      this.restServ.post(environment.sqlBinaries, this.uniqueBinaryForm.value, {}).subscribe(res => {
        // console.log("res",res)
        this.showEvent = true;
        this.searchloaderxl = false;
        if (res?.length == 0) {
          this.notiServ.alertNoData("No Data Found")
        }
        this.dataSourceSql = new MatTableDataSource(res)
        this.dataSourceSql.paginator = this.paginatorSql
        this.dataSourceSql.sort = this.sortBinarySql
        this.dataSourceSql.filterPredicate = this.createFilterSql();

      })
    }



  }

  // sql_av_report(id: any, md5: any) {

  //   let url = environment.sqlpdfbinary
  //   this.restServ.postpdf(url, { avdata: id, md5 }, {}).subscribe(res => {

  //     let url = window.URL.createObjectURL(res);
  //     let a = document.createElement('a');
  //     document.body.appendChild(a);
  //     a.setAttribute('style', 'display: none');
  //     a.href = url;
  //     // a.download = data.md5_hash + '.pdf';
  //     a.download = md5 + '.pdf';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     a.remove();
  //   })

  // }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {

      let searchTerms = JSON.parse(filter);
      if (searchTerms.av_class != '') {
        return data.top_bin_data.hits.hits[0]._source.bin_id.toString().toLowerCase().indexOf(searchTerms.bin_id) !== -1
          && data.top_bin_data.hits.hits[0]._source.md5_hash.toString().toLowerCase().indexOf(searchTerms.md5_hash) !== -1
          && data.top_bin_data.hits.hits[0]._source.bin_av_class ? data.top_bin_data.hits.hits[0]._source.bin_av_class.toString().toLowerCase().indexOf(searchTerms.av_class) !== -1
          : false
      }
      else {
        return data.top_bin_data.hits.hits[0]._source.bin_id.toString().toLowerCase().indexOf(searchTerms.bin_id) !== -1
          && data.top_bin_data.hits.hits[0]._source.md5_hash.toString().toLowerCase().indexOf(searchTerms.md5_hash) !== -1
      }

    }
    return filterFunction;
  }
  createFilterSql(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      if (searchTerms.ml_classification != '') {
        return data.bin_id.toString().toLowerCase().indexOf(searchTerms.bin_id) !== -1
          && data.bin_md5.toString().toLowerCase().indexOf(searchTerms.bin_md5) !== -1
          && data.bin_classification.toString().toLowerCase().indexOf(searchTerms.bin_classification) !== -1
          && data.yara_status.toString().toLowerCase().indexOf(searchTerms.yara_status) !== -1
          && data.ml_classification ? data.ml_classification.toString().toLowerCase().indexOf(searchTerms.ml_classification) !== -1
          : false
      }
      else {
        return data.bin_id.toString().toLowerCase().indexOf(searchTerms.bin_id) !== -1
          && data.bin_md5.toString().toLowerCase().indexOf(searchTerms.bin_md5) !== -1
          && data.bin_classification.toString().toLowerCase().indexOf(searchTerms.bin_classification) !== -1
          && data.yara_status.toString().toLowerCase().indexOf(searchTerms.yara_status) !== -1
      }
    };

    return filterFunction;
  }


  // createFilterSql(): (data: any, filter: string) => boolean {
  //   let filterFunction = function (data: any, filter: any): boolean {
  //     let searchTerms = JSON.parse(filter);
  //     console.log("data", data);
  //     console.log("data.bin", data.bin_id);

  //     let binIdString = data.bin_id.toString(); 

  //     if (searchTerms.av_class != '') {
  //       return binIdString.toLowerCase().indexOf(searchTerms.bin_id) !== -1
  //         && data.bin_md5.toString().toLowerCase().indexOf(searchTerms.md5_hash) !== -1;
  //     } else {
  //       return binIdString.toLowerCase().indexOf(searchTerms.bin_id) !== -1
  //         && data.md5_hash.toString().toLowerCase().indexOf(searchTerms.md5_hash) !== -1;
  //     }
  //   };

  //   return filterFunction;
  // }


  viewAvdet(bin_id: any) {
    this.restServ.post(environment.sqlAVdetails, { "bin": bin_id }, {}).subscribe(res => {
      let dialogRef = this.dialog.open(ViewavComponent, {
        data: res
      });
      dialogRef.afterClosed().subscribe(res => {
      })
    })


  }
  showJsonData(jsondata: any) {

    let dialogRef = this.dialog.open(ThreatJsonDataComponent, {
      data: { Object: jsondata }
    });
    dialogRef.afterClosed().subscribe(res => {
    })
  }

  getHybridReportData(md5: any) {
    this.restServ.get(environment.getHybridReport, { params: { md5 } }, {}).subscribe(res => {
      if (res.data) {
        let dialogRef = this.dialog.open(HybridReportJsonDataComponent, {
          data: res.data
        });
        dialogRef.afterClosed().subscribe(res => {
        })
      }
      else {
        this.notiServ.alertNoData("No Data Found")
      }
    })

  }

  onDateFilterChange(data: any) {
    let stepNumber = + data;
    if (stepNumber !== 5) {
      let { startDate, endDate } = this.sharedService.getStartAndEndDate(stepNumber);
      this.uniqueBinaryForm.patchValue({
        start_date: startDate,
        end_date: endDate
      });
    } else {
      this.uniqueBinaryForm.patchValue({
        start_date: '',
        end_date: ''
      });
    }
  }

  reset() {
    this.showEvent = false;
    this.uniqueBinaryForm.reset();
  }

  getYaraReport(yara_status: any, bin_md5: any) {
    if (yara_status === 'pending' || yara_status === 'unclassified') {
      this.notiServ.alertNoData("No data found");
    }

    if (yara_status === 'classified') {
      this.restServ.getYaraData(bin_md5).subscribe(
        data => {
          const extractedData = data?.data?.hits?.hits?.[0]?._source;

          if (extractedData) {
            this.responseData = extractedData;
            this.showJsonData(this.responseData);
          } else {
            this.showJsonData('No relevant data found in the response.')
          }
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }

  av_report(data: any) {
    // console.log("-----------",data)
    let url = environment.pdfbinary;
    (this.restServ.postpdf(url, { avdata: data }, {}) as unknown as Observable<any>).subscribe((res: any) => {
        let url = window.URL.createObjectURL(res);
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = data.md5_hash + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    });
}


  getMlClassification(ml_classification: any, md5: any) {
    if (ml_classification === null) {
      this.notiServ.alertNoData("No data found");
    }
    if (ml_classification != null) {
      this.restServ.getMlData(md5).subscribe(
        data => {
          const extractedData = data?.data;

          if (extractedData) {
            this.responseData = extractedData;
            this.showJsonData(this.responseData);
          } else {
            this.showJsonData('No relevant data found in the response.')
          }
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }
  getThreatData(md5: any) {
    this.restServ.post(environment.getThreatScore, { 'data': { "md5_hash.keyword": md5 } }, {}).subscribe(res => {
      let dialogRef = this.dialog.open(ThreatScoreComponent, {
        data: res.data
      });
      dialogRef.afterClosed().subscribe(res => {
      })
    })

  }
//   sql_av_report(id: any, md5: any) {
//     console.log("iam in sqlav");
    
//     let url = environment.sqlpdfbinary;
//     (this.restServ.postpdf(url, { avdata: id, md5 }, {}) as unknown as Observable<any>).subscribe((res: any) => {
//         let url = window.URL.createObjectURL(res);
//         let a = document.createElement('a');
//         document.body.appendChild(a);
//         a.setAttribute('style', 'display: none');
//         a.href = url;
//         a.download = md5 + '.pdf';
//         a.click();
//         window.URL.revokeObjectURL(url);
//         a.remove();
//     });
// }
sql_av_report(id: any, md5: any) {

  let url = environment.sqlpdfbinary

  this.restServ.postpdf(url, { avdata: id, md5 }, {}).subscribe(res => {

    let url = window.URL.createObjectURL(res);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    // a.download = data.md5_hash + '.pdf';
    a.download = md5 + '.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  })

}

  showAdarData(bin_id: any) {
    this.restServ.post(environment.adarLabelData, { bin_id }, {}).subscribe(res => {
      if (res.data === null) {
        this.notiServ.alertNoData("No data found");
      }
      else {
        let dialogRef = this.dialog.open(ThreatJsonDataComponent, {
          data: res
        });
        dialogRef.afterClosed().subscribe(res => {
        })
      }

    })


  }


  nodeAccess() {
    this.accessNode = []
    for (let data of this.selectedNodes) {
      this.accessNode.push(data.id);
    }
  }
  togchip(i: any, chipsType: string, row: any) {
    // console.log('i',i);

    this.chipsType[i] = chipsType;
    if (chipsType == "show") {
      this.expandedElement = true
      let url = environment.binNodes
      this.getUniBinValData = this.restServ.post(url, { "bin_id": row, "end_date": this.uniqueBinaryForm.value.end_date, "node_ids": this.uniqueBinaryForm.value.node_ids }, {}).subscribe(res => {
        // console.log('res',res);
        this.innerDataSource[i] = { data: res.data.aggregations.NAME.buckets };
      })
    }
  }
  //  mysql binaries
  togchipSql(i: any, chipsType: string) {
    // console.log('i',i);

    this.chipsType[i] = chipsType;
    if (chipsType == "show") {
      this.expandedElement = true

    }
  }
  toggleAllSelection() {

    if (this.allNodeSelected) {
      this.selectedNodes = this.finalNodeList;
      this.nodeAccess();
    } else {
      this.selectedNodes = [];
    }

  }

  getBinFiles(evt: any) {

    // console.log('evt',evt);

    Swal.fire({
      title: 'Are you sure, you want to Download Binary file.',
      text: ' It may harm your system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result) => {
      if (result.value) {
        let url = environment.downloadbinary
        this.restServ.post(url, { evt: evt }, {}).subscribe(res => {
          if (res.status == 1) {
            this.downloadFile(res.data, evt)
            this.notiServ.showSuccess(res.message)

          }
          else {
            this.notiServ.showInfo(res.message)
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Canceled', '', 'error');
      }
    });
  }

  downloadFile(dynPath: any, evt: any) {

    this.getDownloadFileData = this.restServ.getFile(dynPath).subscribe((data: any) => {

      let url = window.URL.createObjectURL(data);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = evt;
      a.click();
      a.remove();


    }, (err) => {
      if (err.status == 404) {
        console.log('File Not Found');
      }
    })

  }

  onSelectAll(items: any) {
    this.toggleAllSelection()
  }
  ngOnDestroy(): void {
    if (this.getAllNodesData) {
      this.getAllNodesData.unsubscribe();
    }
    if (this.getUniqueBinFormData) {
      this.getUniqueBinFormData.unsubscribe();
    }
    if (this.getUniBinValData) {
      this.getUniBinValData.unsubscribe();
    }
    if (this.getDownloadFileData) {
      this.getDownloadFileData.unsubscribe()
    }
  }
}
