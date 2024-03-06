import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-high-severity',
  templateUrl: './high-severity.component.html',
  styleUrls: ['./high-severity.component.scss']
})
export class HighSeverityComponent {
  getSeveAlertData! : Subscription

  allSelected = false;
  searchloaderxl:boolean = true;
  isShowDiv = true;
  total_alert:any
  displayedColumns: string[] =
  [
    'date_time',
    'alert_type',
    'description',
    'node_id',
    'organization',
    'sector',
    'region',
  ];

  dataSource!: MatTableDataSource<any>;
  @ViewChild('paginatorAlert') paginatorAlert!: MatPaginator;
  @ViewChild('sortAlert') sortAlert!: MatSort;


  eventFilter = new FormControl('');
  alertFilter = new FormControl('');
  nodeFilter = new FormControl('');
  orgFilter = new FormControl('');
  secFilter = new FormControl('');
  regFilter = new FormControl('');
  filterValues = {
    alert_type:'',
    description:'',
    node_id:'',
    organization:'',
    sector:'',
    region:''
   
  };

  constructor( private restServ: RestService, private rightClickService: RightClickService ) { }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit(): void {
    this.getSeverityAlerts()
    this.eventFilter.valueChanges
    .subscribe(
      alert_type => {        
        this.filterValues.alert_type = alert_type;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )
    this.alertFilter.valueChanges
    .subscribe(
      description => {        
        this.filterValues.description = description;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )
    this.nodeFilter.valueChanges
    .subscribe(
      node_id => {        
        this.filterValues.node_id = node_id;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )
    this.orgFilter.valueChanges
    .subscribe(
      organization => {        
        this.filterValues.organization = organization;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )
    this.secFilter.valueChanges
    .subscribe(
      sector => {        
        this.filterValues.sector = sector;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )
    this.regFilter.valueChanges
    .subscribe(
      region => {        
        this.filterValues.region = region;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_alert=this.dataSource.filteredData.length
      }
    )

      }

      getSeverityAlerts(){
          this.getSeveAlertData=this.restServ.get(`${environment.severityAlert}`, {},{}).subscribe(res => {
          this.dataSource = new MatTableDataSource(res)
          this.isShowDiv = false
          this.dataSource.paginator = this.paginatorAlert;
          this.dataSource.sort = this.sortAlert;
          this.total_alert = this.dataSource.filteredData.length
          this.dataSource.filterPredicate = this.createFilter();
          this.searchloaderxl = false;
          // console.log("loginser getUserList", res);
          // return res; 
        });
      }
      createFilter(): (data: any, filter: string) => boolean {
        let filterFunction = function(data:any, filter:any): boolean {
          let searchTerms = JSON.parse(filter);
          if(searchTerms.description != ''){
            return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
            && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
            && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
            && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
            && data.description? data.description.toString().toLowerCase().indexOf(searchTerms.description) !== -1 
            : false
          }
          else if(searchTerms.alert_type != ''){      
              return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
              && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
              && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
              && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
              && data.alert_type? data.alert_type.toString().toLowerCase().indexOf(searchTerms.alert_type) !== -1 
              : false
            }
          
          else{
            return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
            && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
            && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
            && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
          }
        }
        return filterFunction;
      }
      ngOnDestroy(): void{
        if(this.getSeveAlertData)
        this.getSeveAlertData.unsubscribe();
    
      }
}
