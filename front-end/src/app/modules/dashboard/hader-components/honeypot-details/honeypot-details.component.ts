import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-honeypot-details',
  templateUrl: './honeypot-details.component.html',
  styleUrls: ['./honeypot-details.component.scss']
})
export class HoneypotDetailsComponent implements OnInit {
  getHPData! : Subscription
  searchloaderxl:boolean = true;
  isShowDiv:boolean=true
  displayedColumns: string[] = [
    'node_id',
    'organization',
    'sector',
    'region',
    'snapshot_name',
    'honeypot_profile',
    'vm_name',
    'ip_address',
    'health_time',
    'health_status',
  ];
  total_nodes:any

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild('hpSort') hpSort!: MatSort;
  honeypotData: any = [];
  roundfigureValue: any;

  node_idFilter = new FormControl('');
  orgFilter = new FormControl('');
  sectorFilter = new FormControl('');
  regionFilter = new FormControl('');
  hpFilter = new FormControl('');
  hpProfFilter = new FormControl('');
  vmFilter = new FormControl('');
  statusFilter = new FormControl('');
  ipFilter= new FormControl('');
  filterValues = {
    node_id: '',
    organization:'',
    sector:'',
    region:'',
    snapshot_name:'',
    honeypot_profile:'',
    vm_name:'',
    ip_address:'',
    health_status:''
  };
  constructor(private restServ:RestService) {
  }
  ngOnInit(): void {
    this.getHoneypotDetails()
    this.node_idFilter.valueChanges
    .subscribe(
      node_id => {        
        this.filterValues.node_id = node_id;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.orgFilter.valueChanges
    .subscribe(
      organization => {        
        this.filterValues.organization = organization;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.sectorFilter.valueChanges
    .subscribe(
      sector => {        
        this.filterValues.sector = sector;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.regionFilter.valueChanges
    .subscribe(
      region => {        
        this.filterValues.region = region;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.hpFilter.valueChanges
    .subscribe(
      snapshot_name => {        
        this.filterValues.snapshot_name = snapshot_name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.hpProfFilter.valueChanges
    .subscribe(
      honeypot_profile => {        
        this.filterValues.honeypot_profile = honeypot_profile;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.vmFilter.valueChanges
    .subscribe(
      vm_name => {        
        this.filterValues.vm_name = vm_name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.ipFilter.valueChanges
    .subscribe(
      ip_address => {        
        this.filterValues.ip_address = ip_address;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.statusFilter.valueChanges
    .subscribe(
      health_status => {        
        this.filterValues.health_status = health_status;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
  }
  // get full node details
  getHoneypotDetails() {
    // this.nodeManagementServiec.getSectorData().subscribe(res => {
    this. getHPData=this.restServ.get(environment.honeypotDetail,{},{}).subscribe(res => {
      this.honeypotData = res
      this.dataSource = new MatTableDataSource(this.honeypotData);
      this.dataSource.paginator = this.paginator;
      this.total_nodes=this.dataSource.filteredData.length
      this.paginator._intl.itemsPerPageLabel="Show Records/Page";
      this.dataSource.sort = this.hpSort;
      this.dataSource.filterPredicate = this.createFilter();
      this.searchloaderxl = false;
      this.isShowDiv=false
    })
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data:any, filter:any): boolean {
      let searchTerms = JSON.parse(filter);
      if(searchTerms.honeypot_profile != ''){
        return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
        && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
        && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
        && data.snapshot_name.toString().toLowerCase().indexOf(searchTerms.snapshot_name) !== -1
        && data.honeypot_profile ? data.honeypot_profile.toString().toLowerCase().indexOf(searchTerms.honeypot_profile) !== -1
        && data.vm_name.toString().toLowerCase().indexOf(searchTerms.vm_name) !== -1
        && data.health_status.toString().toLowerCase().indexOf(searchTerms.health_status) !== -1
        : false
      }else if (searchTerms.ip_address != ''){
        
        return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
        && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
        && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
        && data.snapshot_name.toString().toLowerCase().indexOf(searchTerms.snapshot_name) !== -1
        && data.ip_address ? data.ip_address.toString().toLowerCase().indexOf(searchTerms.ip_address) !== -1
        && data.vm_name.toString().toLowerCase().indexOf(searchTerms.vm_name) !== -1
        && data.health_status.toString().toLowerCase().indexOf(searchTerms.health_status) !== -1
        : false
      }
      else{
        return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data.organization.toString().toLowerCase().indexOf(searchTerms.organization) !== -1
        && data.sector.toString().toLowerCase().indexOf(searchTerms.sector) !== -1
        && data.region.toString().toLowerCase().indexOf(searchTerms.region) !== -1
        && data.snapshot_name.toString().toLowerCase().indexOf(searchTerms.snapshot_name) !== -1
        && data.vm_name.toString().toLowerCase().indexOf(searchTerms.vm_name) !== -1
        && data.health_status.toString().toLowerCase().indexOf(searchTerms.health_status) !== -1 
      }
    }
    return filterFunction;
  }

  ngOnDestroy(): void{ 
    if(this.getHPData){
    this.getHPData.unsubscribe();
    }
  }
  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }
}