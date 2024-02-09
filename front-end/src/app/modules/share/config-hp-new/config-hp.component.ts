// import { Component, OnInit, Inject, ViewChild } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { environment } from 'src/environments/environment';
// import { RestService } from 'src/app/core/services/rest.service';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MatTableDataSource } from '@angular/material/table';
// import { MatPaginator } from '@angular/material/paginator';
// import { Subscription } from 'rxjs';
// @Component({
//   selector: 'app-config-hp',
//   templateUrl: './config-hp.component.html',
//   styleUrls: ['./config-hp.component.scss']
// })
// export class ConfigHpComponent implements OnInit {
//   searchloader: boolean = false;
//   searchloaderxl: boolean = false;

//   getServiceData! : Subscription;
//   getImageData! : Subscription;
//   getHpProfileConfigData! : Subscription;
//   getHoneypotConfigData! : Subscription;

//   isShowDiv: boolean = true;
//   searchloader_image: boolean = false;
//   hp_type:any
//   hp_profile:any;
//   hp_image:any
//   nodeForm: any = FormGroup;
//   initNodeForm() {
//     this.nodeForm = this.fb.group({
//       node_type: ['', [Validators.required]],
//       node_hw_type: ['', [Validators.required]],
//       hp_type: ['', [Validators.required]],
//       hp_profile: ['', [Validators.required]],
//       hp_image: ['', [Validators.required]],
//     });
//   }
//   displayedColumns: string[] = [
//     'protocol',
//     'port',
//     'name',
//     'description',
//     'vulnerability_name'
  
//   ];
//   dataSource!: MatTableDataSource<any>;
//   @ViewChild(MatPaginator)
//   paginator!: MatPaginator;

//   constructor(public dialogRef: MatDialogRef<ConfigHpComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any, private restServ: RestService,public fb: FormBuilder) { 
//       this.initNodeForm();

//     }

//   ngOnInit(): void {
//     this.getHpType()
//   }

//   getHpType(){
//     let url = environment.honeypotConfig
//     this.getHoneypotConfigData  = this.restServ.get(url,{},{}).subscribe(res=>{
//       this.hp_type = res["data"]
//     })
//   }

//   getHpProfile(key:any){
//     this.isShowDiv = true;
//     this.searchloader = true
//     let url = environment.hpProfileConfig
//     this.getHpProfileConfigData  = this.restServ.post(url,{data:key},{}).subscribe(res=>{
//       this.hp_profile = res["data"]
//       this.searchloader = false
//     })
//   }

//   getImage(key:any){
//     this.searchloader_image = true
//         let url = environment.hp_image
//         this.getImageData  = this.restServ.post(url,{data:key,type:this.nodeForm.value.hp_type.key},{}).subscribe(res=>{
//           this.hp_image = res["data"]
//           this.searchloader_image = false
//         })
//   }

//   getService(key:any){
//     this.searchloaderxl = true
//     let url = environment.hp_service
//     let services: any[] = [];
//     this.getServiceData  = this.restServ.post(url,{data:key,type:this.nodeForm.value.hp_type.key,profile:this.nodeForm.value.hp_profile.key},{}).subscribe(res=>{
      
//     let serv =  res.data.hits.hits[0]._source.hp_profile.filter((e:any)=>{
//       if(e.profile_name == this.nodeForm.value.hp_profile.key){
//         return e;
//       }  
        
//     });


//     if(serv[0].Service.length){
//       services = serv[0].Service;
//     } else{
//     services.push(serv[0].Service);
//     }
      
//     this.dataSource = new MatTableDataSource(services);
//     this.dataSource.paginator = this.paginator;
//       this.searchloaderxl = false
//       this.isShowDiv = false

//     })
//   }

//   closeButton(type: any | undefined) {
//     if (type == 'simple') {
//       this.dialogRef.close();
//     } else {
//       this.dialogRef.close("I am closed!!")
//     }
//   }
//   ngOnDestroy(): void{
//     if(this.getServiceData){
//     this.getServiceData.unsubscribe();
//     }
//     if(this.getImageData){
//     this.getImageData.unsubscribe();
//     }
//     if(this.getHpProfileConfigData){
//     this.getHpProfileConfigData.unsubscribe();
//     }
//     if(this.getHoneypotConfigData){
//     this.getHoneypotConfigData.unsubscribe();
//     }

//   } 
  
// }
