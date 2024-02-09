import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ActivatedRoute, ParamMap } from "@angular/router";
import { DataService } from 'src/app/common/data.service';


@Component({
  selector: 'app-config-hihp',
  templateUrl: './config-hihp.component.html',
  styleUrls: ['./config-hihp.component.scss']
})
export class ConfigHihpComponent implements OnInit {
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
  honeypot_name: any = []
  newarr: any = []
  honeypot_category: any = []
  snapshot_id: any = []

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
  hpName: any;

  constructor(public dialogRef: MatDialogRef<ConfigHihpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private dataService: DataService, private route: ActivatedRoute, private restServ: RestService, public fb: FormBuilder, private notiServ: NotificationService) {
    this.initNodeForm();

  }

  ngOnInit(): void {
    this.getHpData();

    this.portid = this.dataService.getNewDataInfo();
    this.nodeData = this.portid?.source?._value.port
    // console.log(this.nodeData);
    // console.log("NodeData",this.nodeData)
    this.nodeForm.get('hp_type').setValue(this.nodeData.node_sensor_hp_type)
    
    if( this.nodeData.node_hardware == 'Server') {
      this.node_hardware = 'desktop';
}
else {
this.node_hardware = this.nodeData.node_hardware;

}
  }


  initNodeForm() {
    this.nodeForm = this.fb.group({
      hp_type: ['', [Validators.required]],
      os_type: ['', [Validators.required]],
      node_id: [this.data.Object],
      os_ver_type: [''],
      vm_type: [''],
      vm_name: ['', [Validators.required]],
      snapshot_id: ['', [Validators.required]],
      honeypot_cat: ['', [Validators.required]],
      device_type: ['', [Validators.required]],
      device_name: ['', [Validators.required]],
      profile: ['', [Validators.required]],
      image: [''],
      hp_services: [[], [Validators.required]],
      network_type: [''],
      number_of_honeypot: ['', [Validators.required]],
      hp_profile: ['', [Validators.required]],
      hp_name: [''],
      
    });
  }

  getHpData() {
    let url = environment.getHoneypotDataHiHp
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

        if (!this.snapshot_name.includes(e.snapshot_name)) {
          this.snapshot_name.push({ snapshot_name: e.snapshot_name, snapshot_id: e.snapshot_id });
        }

        this.nodeForm.get('hp_name').setValue(e.snapshot_name);
      
console.log("HpArrayBefor push<<<bef", this.honeypot_name)
// var newarr:any = []

        // if (!this.newarr.includes(e.honeypot_name)) {
        //   this.newarr.push({honeypot_name: e.honeypot_name});
        //   console.log("HpArrayAfter push>", this.newarr)
        //   console.log("HpArrayAfter push>>>", e.honeypot_name)

        // }
        const trimmedName = e.honeypot_name.trim();
        if (!this.honeypot_name.some((item: { honeypot_name: string; }) => item.honeypot_name.trim() === trimmedName)) {
          this.honeypot_name.push({ honeypot_name: trimmedName });
          // console.log("HpArrayAfter push>", this.newarr);
        }
        
        // console.log("HpArrayAfter push>>>aft", this.newarr)
        if (!this.honeypot_category.find((item: { honeypot_category: any; }) => item.honeypot_category == e.honeypot_category)) {
          this.honeypot_category.push({honeypot_category: e.honeypot_category});
          // console.log("HPCat--",this.honeypot_category)
        }
      });
      // console.log(this.snapshot_name)
      // this.hp_type



    })
  }



  getHpProfile(key: any) {
// console.log(key)
    let snapshot_id = key;

    let vm_type = key.vm_type;

    // this.nodeForm.get('vm_type').setValue(vm_type);
  }


  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }

  getCategory(evt: any) {

    if (evt == 'cdac_hp') {
      this.isShowService = true
    }
  }

  type(evt: any) {
    // console.log('Am',this.snapshot_name)
    this.getDeviceType(evt, this.snapshot_name);
    this.image_name = [];
    this.hp_image = [];
    this.hp_services=[];
  }

  getDeviceType(category: any, snapshot_name: any) {
    let url = environment.deviceTypeHiHp;
    const snapshotIds = snapshot_name.map((snapshot_name: { snapshot_id: any; }) => snapshot_name.snapshot_id);

    // let snapshot_id = snapshot_name.snapshot_id
    // console.log("from getDeviceType",snapshotIds)
    this.restServ.post(url, { cat: category , hard: this.node_hardware, snap_ids: snapshotIds }, {}).subscribe(res => {
      this.image_type = res;
      const evtt = res.map((res: { type: any; }) => res.type);

      // console.log(evtt)
      this.getDeviceName(evtt, snapshotIds);

      // console.log("response---",res)
    });
  }

  getImageName(evt: any) {
    this.nodeForm.get('image').setValue('')
    let profile = evt.profile_name;
    this.nodeForm.get('profile').setValue(profile)
    
    let url = environment.getImageName;
    this.restServ.post(url, { name: evt.name, hard: this.node_hardware }, {}).subscribe(res => {
      this.hp_image = res;
      // console.log("--Response--",res,res.os_type, res.vm_name, res.vm_type)
      this.nodeForm.get('os_type').setValue(res[0].os_type);
      this.nodeForm.get('vm_type').setValue(res[0].vm_type);
      this.nodeForm.get('vm_name').setValue(res[0].vm_name);
      this.nodeForm.get('hp_profile').setValue(res[0].profile);

      // this.hp_services = [];
    });
  }

  getDeviceName(evt: any, snapshot_name: any) {
    // const snapshotIds = snapshot_name.map((snapshot_name: { snapshot_id: any; }) => snapshot_name.snapshot_id);
//     console.log(evt)
// console.log(snapshot_name)
    let url = environment.deviceNameHiHp
    this.restServ.post(url, { type: evt, hard: this.node_hardware, snap_ids: snapshot_name  }, {}).subscribe(res => {
      this.image_name = res;
      this.hp_image = [];
      this.hp_services=[];
      this.getImageDataProfile({snap_ids: snapshot_name})
    });
  }


  getImageDataProfile(e: any) {
    // console.log("am e",e)
    // this.nodeForm.get('os_type').setValue(e.os_type);
    this.nodeForm.get('os_ver_type').setValue(e.os_name);
    // this.nodeForm.get('vm_type').setValue(e.vm_type);
    // this.nodeForm.get('vm_name').setValue(e.vm_name);
    this.restServ.post(environment.getNodeConfigHIHP, e, {}).subscribe(res => {
      this.hp_services = res;
      // console.log("1",this.hp_services)
    });
  }

  

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

  }

  get f() {

    return this.nodeForm.controls;
  }
  empConfiguration () {
    console.log(`Button is disabled`);
    
  }
  saveConfiguration() {
    // if (!this.nodeForm.invalid) {
      this.searchloaderxl = true
// console.log("--value--",this.nodeForm?.value)
      this.restServ.post(environment.saveHoneypotConfigHiHp, this.nodeForm?.value, {}).subscribe(res => {
        if (res.status == 1) {
          this.searchloaderxl = false;
          this.notiServ.showSuccess(res.message);
          this.dialogRef.close("success");
        }
        else {
          this.searchloaderxl = false;
          this.notiServ.showError("Something went wrong. Try again !!!")
        }
      });
    // }
  }

  ngOnDestroy(): void {
    if (this.getServiceData) {
      this.getServiceData.unsubscribe();
    }
    // }
    if (this.getHpProfileConfigData) {
      this.getHpProfileConfigData.unsubscribe();
    }
    if (this.getHoneypotConfigData) {
      this.getHoneypotConfigData.unsubscribe();
    }

  }

}
