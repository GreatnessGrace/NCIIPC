import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { LoginService } from 'src/app/core/services/login.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-hp-config',
  templateUrl: './hp-config.component.html',
  styleUrls: ['./hp-config.component.scss']
})
export class HpConfigComponent implements OnInit {

  configForm: FormGroup;
  isPublic: Boolean = false
  statesArray: any = []
  citiesArray: any = []
  configSubmitted = false;
  ifOther = true
  isSpecialCondition: boolean = false; 

  constructor(private fb: FormBuilder, private restServ: RestService, public loginService: LoginService, private notiserv: NotificationService) {
    this.configForm = this.fb.group({
      email: [this.loginService.getUser().email],
      node_location: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\-\\_\\s]+$")]),
      // mac_address: new FormControl("", [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)]),
      mac_address: new FormControl("", [Validators.required, Validators.pattern(/^([0-9A-Za-z]{2}[:-]){5}([0-9A-Za-z]{2})$/)]),
      node_hardware: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\s]+$")]),
      network_type: new FormControl("Private", [Validators.required, Validators.pattern("^[a-zA-Z\\s]+$")]),
      node_ip: new FormControl("", [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      base_ip: new FormControl("", [Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      port: new FormControl("", [Validators.pattern("^[0-9]+$")]),
      node_sensor_hp_type: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z]+$")]),
      interface: new FormControl("", [Validators.required]),
      virtual_tech: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z ]+$")]),
      lat: new FormControl("", [Validators.required, Validators.pattern(/^[-+]?([0-8]?[0-9]|90)(\.\d+)?$/)]),
      lng: new FormControl("", [Validators.required, Validators.pattern(/^[-+]?([0-9]|[1-9][0-9]|1[0-7][0-9]|180)(\.\d+)?$/)]),
      region: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\-\\_\\s]+$")]),
      sector: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\-\\_\\s]+$")]),
      state: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\-\\_\\s]+$")]),
      city: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z\\-\\_\\s]+$")]),
      otherCity: new FormControl(""),
subnet: new FormControl("", [
  Validators.required,
  Validators.pattern(
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}(\/[0-9]{1,2})?$/
  ),
]),
      netmask: new FormControl("", [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      gateway: new FormControl("", [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      total_hp: new FormControl("", [Validators.required]),
      dns: new FormControl("", [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      ipAddresses: this.fb.array([])
    })

    this.configForm.get('total_hp')?.valueChanges.subscribe((value: any) => {
      this.updateIPAddressesControls(value);
    });

    
  
  }


  ngOnInit(): void {

  }
  ipAddresses(): FormArray {
    return this.configForm.get("ipAddresses") as FormArray
  }

  newIPAddress(): FormGroup {
    return this.fb.group({
      private_ip: new FormControl("", [Validators.required, Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
      mapped_ip: new FormControl("", [Validators.pattern(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)]),
    })
  }

  updateIPAddressesControls(totalHp: number) {


    // Clear any existing controls
    while (this.ipAddresses().length) {
      this.ipAddresses().removeAt(0);
    }

    // Add new controls for 'Private IP' and 'Mapped IP' based on the 'total_hp' value
    for (let i = 0; i < totalHp; i++) {
      this.ipAddresses().push(this.newIPAddress());
    }
  }


  getNWtype(event: any) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue == "Public") {
      this.isPublic = true
      this.isSpecialCondition = selectedValue === 'Public';
     

    }
    else {
      const ipAddressesArray = this.configForm.get('ipAddresses') as FormArray;
      ipAddressesArray.at(0)?.get('mapped_ip')?.setValidators([Validators.required]);
      ipAddressesArray.at(0)?.get('mapped_ip')?.updateValueAndValidity();

      this.isSpecialCondition = false; 

      this.isPublic = false
    }
  }

  checkOther() {

    if (this.configForm.value.city == "other") {
      this.ifOther = false
    }
    else {
      this.ifOther = true
    }
  }
 
  empSubmit(form:any) {
    console.log("Button is Disabled")
  }
  onSubmit(form: any) {
    this.configSubmitted = true;
    if (form.network_type == 'Public') {
      form.base_ip = form.node_ip
for (let i = 0; i < form.ipAddresses.length ; i++){
  form.ipAddresses[i].mapped_ip = form.ipAddresses[i].private_ip
}
    }
    if (form.city == "other") {
      form.city = form.otherCity
    }
    
    this.addCities();

    this.restServ.post(environment.configData, form, {}).subscribe(res => {
      
      if (res.status == 0) {
        this.notiserv.showError(res.msg)
      }
      else {
        this.notiserv.showSuccess(res.msg)
      }
      this.configForm.reset()
    })
  }

  getStates(eve: any) {
    let url = environment.statesList
    this.restServ.post(url, { "eve": eve.target.value }, {}).subscribe(res => {
      res.map((e: any) => {
        this.statesArray.push(e.state_name)
      })
    })
  }

  getCities() {
    let url = environment.citiesList
    this.restServ.post(url, { "eve": this.configForm.value.state }, {}).subscribe(res => {
      res.map((e: any) => {
        this.citiesArray.push(e.city_name)
      })
    })
  }

  addCities() {
    let url = environment.addCity
    this.restServ.post(url, { "state": this.configForm.value.state, "otherCity": this.configForm.value.otherCity }, {}).subscribe(res => {
      res.map((e: any) => {
        this.citiesArray.push(e.city_name)
      })
    })
  }

  get f() {
    return this.configForm.controls;
  }

  get isFormValid(): boolean {
    return this.configForm.valid;
  }


}
