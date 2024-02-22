import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { DataService } from 'src/app/common/data.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-config-hp',
  templateUrl: './config-hp.component.html',
  styleUrls: ['./config-hp.component.scss']
})
export class ConfigHpComponent implements OnInit {
  searchloader: boolean = false;
  searchloaderxl: boolean = false;

  getServiceData!: Subscription;
  // getImageData! : Subscription;
  getHpProfileConfigData!: Subscription;
  getHoneypotConfigData!: Subscription;
  isShowDiv: boolean = true;
  isShowService: boolean = false;
  searchloader_image: boolean = false;
  hp_data: any
  hp_type: any = [];
  os_type: any = [];
  os_name: any = [];
  vm_name: any = [];
  vm_type: any = [];
  snapshot_name: any = [];
  hp_services: any = [];
  hp_profile: any;
  hp_image: any
  nodeForm: any = FormGroup;
  image_name: any
  image_type: any
  portid: any;
  nodeData: any;
  imageData: any = [];
  node_hardware:any;
  honeypot_category: any = []

  displayedColumns: string[] = [
    'protocol',
    'port',
    'name',
    'description',
    'vulnerability_name'

  ];

  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(public dialogRef: MatDialogRef<ConfigHpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private dataService: DataService, private route: ActivatedRoute, private restServ: RestService, public fb: FormBuilder, private notiServ: NotificationService) {
    this.initNodeForm();

  }

  ngOnInit(): void {
    this.getHpData();

    this.portid = this.dataService.getNewDataInfo();
    
    this.nodeData = this.portid?.source?._value.port

    this.nodeForm.get('hp_type').setValue(this.nodeData.node_sensor_hp_type)
    console.log(this.nodeData);
    
    if( this.nodeData.node_hardware == 'Server') {
            this.node_hardware = 'desktop';
    }
    else {
      this.node_hardware = this.nodeData.node_hardware;

    }
    // if (this.nodeData.node_hardware == 'raspberry') {
    // } else {
    //   this.node_hardware = 'desktop';
    // }
  }


  initNodeForm() {
    this.nodeForm = this.fb.group({
      hp_type: ['', [Validators.required]],
      os_type: ['', [Validators.required]],
      node_id: [this.data.Object],
      os_ver_type: ['', [Validators.required]],
      vm_type: [''],
      vm_name: ['', [Validators.required]],
      snapshot_id: ['', [Validators.required]],
      honeypot_cat: ['', [Validators.required]],
      device_type: ['', [Validators.required]],
      device_name: ['', [Validators.required]],
      profile: ['', [Validators.required]],
      image: ['', [Validators.required]],
      hp_services: [[], [Validators.required]],
      network_type: ['', [Validators.required]],
      number_of_honeypot: ['', [Validators.required]],
      hp_profile: ['', [Validators.required]],
    });
  }

  getHpData() {
    let url = environment.getHoneypotData
    this.getHoneypotConfigData = this.restServ.post(url, { node_id: this.data.Object }, {}).subscribe(res => {

      this.hp_data = res;

      this.hp_data.map((e: any) => {

        if (!this.hp_type.includes(e.hp_type)) {
          this.hp_type.push(e.hp_type);
        }

        if (!this.os_type.includes(e.os_type)) {
          this.os_type.push(e.os_type);
        }

        if (!this.os_name.includes(e.os_name)) {
          this.os_name.push(e.os_name);
        }

        if (!this.os_name.includes(e.os_name)) {
          this.os_name.push(e.os_name);
        }

        if (!this.vm_name.includes(e.vm_name)) {
          this.vm_name.push({ vm_name: e.vm_name, snapshot_id: e.snapshot_id, vm_type: e.vm_type });
        }

        if (!this.vm_type.includes(e.vm_type)) {
          this.vm_type.push(e.vm_type);
        }

        if (!this.honeypot_category.includes(e.honeypot_category)) {
          this.honeypot_category.push({honeypot_category: e.honeypot_category});
          // console.log("HPCat--",this.honeypot_category)
        }

        if (!this.snapshot_name.includes(e.snapshot_name)) {
          this.snapshot_name.push({ snapshot_name: e.snapshot_name, snapshot_id: e.snapshot_id });
        }

        if (!this.snapshot_name.includes(e.snapshot_name)) {
          this.snapshot_name.push(e.snapshot_name);
        }
      });
      // this.hp_type



    })
  }

  // getHpType(){
  //   let url = environment.honeypotConfig
  //   this.getHoneypotConfigData  = this.restServ.get(url,{},{}).subscribe(res=>{
  //     this.hp_type = res["data"]
  //   })
  // }


  getHpProfile(key: any) {

    let snapshot_id = key;
    // console.log(key);

    let vm_type = key.vm_type;

    this.nodeForm.get('vm_type').setValue(vm_type);
    // this.isShowDiv = true;
    // this.searchloader = true
  }


  // getImage(key:any){
  //   this.searchloader_image = true
  //       let url = environment.hp_image
  //       this.getImageData  = this.restServ.post(url,{data:key,type:this.nodeForm.value.hp_type.key},{}).subscribe(res=>{
  //         this.hp_image = res["data"]
  //         this.searchloader_image = false
  //       })
  // }

  //   getService(key:any){
  // this.searchloaderxl = true
  // let url = environment.hp_service
  // let services: any[] = [];
  // this.getServiceData  = this.restServ.post(url,{data:key,type:this.nodeForm.value.hp_type.key,profile:this.nodeForm.value.hp_profile.key},{}).subscribe(res=>{

  //   let serv =  res.data.hits.hits[0]._source.hp_profile.filter((e:any)=>{
  //     if(e.profile_name == this.nodeForm.value.hp_profile.key){
  //       return e;
  //     }  

  //   });


  //   if(serv[0].Service.length){
  //     services = serv[0].Service;
  //   } else{
  //    services.push(serv[0].Service);
  //   }

  // this.dataSource = new MatTableDataSource(services);
  // this.dataSource.paginator = this.paginator;
  //   this.searchloaderxl = false
  //   this.isShowDiv = false

  // })
  //   }

  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }

  getCategory(evt: any) {
    // console.log(evt);

    if (evt == 'cdac_hp') {
      this.isShowService = true
    }
    // this.getDeviceType(evt)
  }

  type(evt: any) {
    this.getDeviceType(evt);
    this.image_name = [];
    this.hp_image = [];
    this.hp_services=[];
  }

  getDeviceType(category: any) {
    let url = environment.deviceType;
    console.log('Category:', category);
console.log('Hardware:', this.node_hardware);

    this.restServ.post(url, { cat: category , hard: this.node_hardware}, {}).subscribe(
      res => {
        this.image_type = res;
      },
      error => {
        console.error('Error:', error);
      }
    );
    
  }

  // getImageName(evt: any) {
  //   // console.log(evt);
  //   this.nodeForm.get('image').setValue('')
  //   let profile = evt.profile_name;
  //   this.nodeForm.get('profile').setValue(profile)
    
  //   let url = environment.getImageName;
  //   this.restServ.post(url, { name: evt.name, hard: this.node_hardware }, {}).subscribe(res => {
  //     this.hp_image = res;
  //     this.hp_services = [];
  //   });
  // }
  getImageName(evt: any) {
    this.nodeForm.get('image').setValue('');
    let profile = evt.profile_name;
    this.nodeForm.get('profile').setValue(profile);
    
    let url = environment.getImageName;
    this.restServ.post(url, { name: evt.name, hard: this.node_hardware }, {}).subscribe(res => {
        this.hp_image = res;
        this.hp_services = [];
        
        // Extract all profile IDs from the response
        const profiles = res.map((item: { profile: any; }) => item.profile);
        
        // Call the getNodeConfig API with all the profile IDs
        this.callNodeConfigAPI(profiles);
    });
}

callNodeConfigAPI(profiles: number[]) {
    this.restServ.post(environment.getNodeConfig, { profiles: profiles }, {}).subscribe(res => {
        this.hp_services = res;
    });
}




isDuplicate(imageName: string): boolean {

  return this.hp_image.filter((img: { image: string; }) => img.image === imageName).length > 1;
}


  getDeviceName(evt: any) {
    let url = environment.deviceName
    this.restServ.post(url, { type: evt, hard: this.node_hardware }, {}).subscribe(res => {
      this.image_name = res;
      this.hp_image = [];
      this.hp_services=[];
    });
  }


  // getImageDataProfile(e: any) {
  //   this.nodeForm.get('os_type').setValue(e.os_type);
  //   this.nodeForm.get('os_ver_type').setValue(e.os_name);
  //   this.nodeForm.get('vm_type').setValue(e.vm_type);
  //   this.nodeForm.get('vm_name').setValue(e.vm_name);
  //   this.nodeForm.get('hp_profile').setValue(e.profile);
  //   this.restServ.post(environment.getNodeConfig, { profile: e.profile }, {}).subscribe(res => {
  //     this.hp_services = res;
  //     // this.isShowService=true;
  //   });
  // }

  selectAllserv() {
    if (this.nodeForm.get('hp_services').value.length == 0) {
      var id: any = [];
      this.hp_services.map((e: any) => {
        id.push(e);
      });
      this.nodeForm.get('hp_services').setValue(id);
    } else {
      this.nodeForm.get('hp_services').setValue('');
    }
    // console.log(this.nodeForm.value.hp_services);

  }

  get f() {

    return this.nodeForm.controls;
  }
  empConfiguration () {
    console.log(`Button is disabled`);
    
  }
  saveConfiguration() {
    if (!this.nodeForm.invalid) {
      this.searchloaderxl = true
      // console.log(this.nodeForm.value);

      // this.restServ.post(environment.saveHoneypotConfig, this.nodeForm?.value, {}).subscribe(res => {
      //   if (res.status == 1) {
      //     this.searchloaderxl = false;
      //     this.notiServ.showSuccess(res.message);
      //     this.dialogRef.close("success");
      //   }
      //   else {
      //     this.searchloaderxl = false;
      //     this.notiServ.showError("Something went wrong. Try again !!!")
      //   }
      // });
    }
  }

  ngOnDestroy(): void {
    if (this.getServiceData) {
      this.getServiceData.unsubscribe();
    }
    // if(this.getImageData){
    // this.getImageData.unsubscribe();
    // }
    if (this.getHpProfileConfigData) {
      this.getHpProfileConfigData.unsubscribe();
    }
    if (this.getHoneypotConfigData) {
      this.getHoneypotConfigData.unsubscribe();
    }

  }

}
