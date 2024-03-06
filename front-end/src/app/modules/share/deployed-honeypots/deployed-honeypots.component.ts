import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { HoneypotHealthComponent } from '../honeypot-health/honeypot-health.component';

@Component({
  selector: 'app-deployed-honeypots',
  templateUrl: './deployed-honeypots.component.html',
  styleUrls: ['./deployed-honeypots.component.scss']
})
export class DeployedHoneypotsComponent implements OnInit {
  getDelteHoneypotData! : Subscription;
  getConfigDetailsData! : Subscription;
  getHoneypotHealthData!:Subscription

  searchloaderxl: boolean = true;
  dataSource!: MatTableDataSource<any>;
  isShowDiv:boolean=true
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
 
  displayedColumns: string[] = [
    'start_date',
    'honeypot_profile',
    'ip_address',
    'service',
    'vulnerabilities',
    'reconfigure',
    'health_status'
  ];

  constructor(public dialogRef: MatDialogRef<DeployedHoneypotsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private restServ:RestService,
    private notiServ: NotificationService,
    public dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.getConfigDetails()
  }

  getConfigDetails(){
    let url = environment.getConfigDetails
    this.getConfigDetailsData = this.restServ.post(url,{node:this.data.Object},{}).subscribe(res=>{
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.searchloaderxl = false;
      this.isShowDiv=false
// console.log("node",res)
    })
// console.log("node",this.data.Object)
  }
  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }

  getHoneypotHealth(u_conf_id: any) {
    let url = environment.getHoneypotHealthConnection
     this.restServ.post(url, {u_conf_id:u_conf_id}, {}).subscribe(res => {
      
      let dialogRef = this.dialog.open(HoneypotHealthComponent, {
        data: { Object: res }
      });
      dialogRef.afterClosed().subscribe(res => {
        if(res){
          // this.getNodeDetail()
        }
      })
    })
    // this.getNodeDetail()
  }
  // getHoneypotHealth(u_conf_id: any){
  //     let url = environment.getHoneypotHealthConnection
  //     this.getHoneypotHealthData = this.restServ.post(url,{u_conf_id:u_conf_id},{}).subscribe(res=>{
  //       let dialogRef = this.dialog.open(HoneypotHealthComponent,{
  //         data: { Object: res}
  //       });
  //       dialogRef.afterClosed().subscribe(res => {
  //          this.getConfigDetails()
  //       })
  //     })
  //     this.getConfigDetails()
  //   }


  reconfigure(evt:any){

    // console.log('evt',evt);
    
    Swal.fire({
      title: 'Are you sure to Reconfigure the honeypot?',
      text: 'It will delete the honeypot first & configuration window will be displayed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result) => {
      if (result.value) {

        this.getDelteHoneypotData = this.restServ.post(environment.delteHoneypot,evt,{}).subscribe((res)=>{
          console.log("resSwal",res)
          if(res.status == 1){
            this.notiServ.showSuccess(res.message);
               this.getConfigDetails()
          }
      else{
        this.notiServ.showError("Something went wrong.Try Again !!! ")
      } 
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Canceled', '', 'error');
      }
    });
  }
  ngOnDestroy(): void{
    if(this.getDelteHoneypotData){
    this.getDelteHoneypotData.unsubscribe();
    }
    if(this.getConfigDetailsData){
    this.getConfigDetailsData.unsubscribe();
    }

  } 
}
