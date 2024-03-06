import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { dateTimeFormat } from 'src/app/utils/global.constants';
import { FormControl } from '@angular/forms';
import { DownloadService } from 'src/app/common/download.service';
import { DeployedHoneypotsComponent } from 'src/app/modules/share/deployed-honeypots/deployed-honeypots.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigHpComponent } from 'src/app/modules/share/config-hp/config-hp.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Subscription } from 'rxjs';
import { NodeHealthComponent } from 'src/app/modules/share/node-health/node-health.component';
import { DataService } from 'src/app/common/data.service';
import { ConfigHihpComponent } from 'src/app/modules/share/config-hihp/config-hihp.component';
import { RightClickService } from 'src/app/core/services/right-click.service';


@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent implements OnInit {
  assetPath = environment.assetPath;

  getData! : Subscription
  getNodeHealthData!:Subscription

  searchloaderxl: boolean = true;
  isShowDiv:boolean=true
  total_nodes:any
  show = true;
  dateTimeFormat = dateTimeFormat;
  displayedColumns: string[] = [
    'id',
    'node_id',
    'node_reg_date',
    'node_location',
    'node_sensor_hp_type',
    'base_ip',
    'last_up_time',
    'node_status',
    'available_hp',
    'deploye_hp'
  ];
  node_idFilter = new FormControl('');
  locationFilter = new FormControl('');
  node_ipFilter = new FormControl('');
  statusFilter = new FormControl('');
  sensorFilter = new FormControl('');

  filterValues = {
    node_id: '',
    node_location:'',
    base_ip:'',
    node_status:'',
    node_sensor_hp_type: ''
  };

  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild('nodeSort') nodeSort!: MatSort;
  honeypotData: any = [];

  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  constructor(private restServ: RestService,private download: DownloadService, public dialog: MatDialog, private notiServ: NotificationService,private dataService:DataService,private rightClickService: RightClickService) { }

  ngOnInit(): void {
    // this.nodeMangementService.getNodeDetails().subscribe(res => {
this.getNodeDetail()

    this.node_idFilter.valueChanges
    .subscribe(
      node_id => {        
        this.filterValues.node_id = node_id;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.locationFilter.valueChanges
    .subscribe(
      node_location => {     
        this.filterValues.node_location = node_location;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.node_ipFilter.valueChanges
    .subscribe(
      base_ip => {      
        this.filterValues.base_ip = base_ip;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.statusFilter.valueChanges
    .subscribe(
      node_status => {      
        this.filterValues.node_status = node_status;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_nodes=this.dataSource.filteredData.length
      }
    )
    this.sensorFilter.valueChanges
      .subscribe(
        node_sensor_hp_type => {
          this.filterValues.node_sensor_hp_type = node_sensor_hp_type;
          this.dataSource.filter = JSON.stringify(this.filterValues);
          this.total_nodes = this.dataSource.filteredData.length
        }
      )
  }
  
getNodeDetail(){
  this.getData = this.restServ.get(environment.nodeDetail, {}, {}).subscribe(res => {
    this.honeypotData = res;
    this.dataSource = new MatTableDataSource(this.honeypotData);
    this.total_nodes=this.dataSource.filteredData.length
    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel="Show Records/Page";
    
 this.dataSource.sort = this.nodeSort;
 this.dataSource.filterPredicate = this.createFilter();
    this.searchloaderxl = false;
    this.isShowDiv=false
  })
}
  generateCsv() {
    this.download.exportCsv("node_details", "")
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data:any, filter:any): boolean {
      let searchTerms = JSON.parse(filter);

      
      if(searchTerms.base_ip != ''){
        return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data.node_location.toString().toLowerCase().indexOf(searchTerms.node_location) !== -1
        && data.base_ip? data.base_ip.toString().toLowerCase().indexOf(searchTerms.base_ip) !== -1 
        && data.node_status.toString().toLowerCase().indexOf(searchTerms.node_status) !== -1
        && data.node_sensor_hp_type?.toString().toLowerCase().indexOf(searchTerms.node_sensor_hp_type.toLowerCase()) !== -1
       : false
       
      } else{
        return data.node_id.toString().toLowerCase().indexOf(searchTerms.node_id) !== -1
        && data.node_location.toString().toLowerCase().indexOf(searchTerms.node_location) !== -1
        && data.node_status.toString().toLowerCase().indexOf(searchTerms.node_status) !== -1
        && data.node_sensor_hp_type?.toString().toLowerCase().indexOf(searchTerms.node_sensor_hp_type.toLowerCase()) !== -1
      }
     
        
    }
    return filterFunction;
  }

  showAvailableHp(node: any,available_hp:any,key:any) {
if (available_hp==0){
  this.notiServ.alertNoData("There is no free ip for honeypot. Please delete existing honeypot.")
}
else{
  this.getPortDetails(key);

  if(key.node_sensor_hp_type == 'LIHP') {
    let dialogRef = this.dialog.open(ConfigHpComponent, {
      data: { Object: node }
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.getNodeDetail()
      }
      this.getNodeDetail();
    })
  }
  if(key.node_sensor_hp_type == 'HIHP') {
    let dialogRef = this.dialog.open(ConfigHihpComponent, {
      data: { Object: node }
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res){
        this.getNodeDetail()
      }
      this.getNodeDetail();
    })
  }
  
}
   
  }

  getPortDetails(portValue: any) {
    this.dataService.setNewDataInfo({
      port: portValue,
    });
  }

  showDeployeHp(node: any) {

    let dialogRef = this.dialog.open(DeployedHoneypotsComponent,{
      data: { Object: node}
    });
    dialogRef.afterClosed().subscribe(res => {
      this.getNodeDetail()
    })
  }

  getNodeHealth(node:any){
let url = environment.getNodeHealthConnection
this.getNodeHealthData = this.restServ.post(url,{node:node},{}).subscribe(res=>{
  let dialogRef = this.dialog.open(NodeHealthComponent,{
    data: { Object: res}
  });
  dialogRef.afterClosed().subscribe(res => {
    this.getNodeDetail()
  })
})
this.getNodeDetail()
  }
  ngOnDestroy(): void{
    if(this.getData){
    this.getData.unsubscribe();
    }
    if(this.getNodeHealthData){
      this.getNodeHealthData.unsubscribe()
    }
  }

}
