import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-hp-blueprint',
  templateUrl: './hp-blueprint.component.html',
  styleUrls: ['./hp-blueprint.component.scss']
})
export class HpBlueprintComponent implements OnInit {

  temp: boolean = true;
  newData: any = [];
  serviceData: any = [];
  vulnData: any = [];
  basesys: any;
  type: any;
  fileSelected: boolean = false;
  selectedFileName: string = '';
  selectedFile!: File | null;
  xmlContent!: string | null;
  blueprintForm: FormGroup;
  isshow: any = [];
  isShowService: any[][] = [];
  file: any;
  fileContent: any
  vboxForm: Boolean = false
  nodes: any
  imageDiabled: Boolean = true
  virtualLabel: any = "Docker Image ID"
  searchloaderxl: boolean = false;
  isLoading: boolean = false;
  constructor(private fb: FormBuilder, private restServ: RestService, private notiServ: NotificationService, private rightClickService: RightClickService) 
  {
    this.blueprintForm = this.fb.group({
      vm_type: new FormControl('docker', [Validators.required, Validators.pattern("^[a-zA-Z ]+$")]),
      base_system: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z/ ]+$")]),
      vm_name: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z0-9_]+$")]),
      // imageid: new FormControl(null, [Validators.required]),
      image_name: new FormControl(null, [Validators.pattern("^[a-zA-Z0-9_]+$")]),
      image_tag: new FormControl(null, [Validators.pattern("^[0-9.]+$")]),
      os_type: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z]+$")]),
      os_name: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z0-9_]+$")]),
      node_id: new FormControl(null),
      snap_name: new FormControl(null),
      honeypot_name: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z0-9_]+$")]),
      honeypot_type: new FormControl('LIHP', [Validators.required, Validators.pattern("^[a-zA-Z]+$")]),
      honeypot_detail: new FormControl(''),
      honeypot_cat: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z]+$")]),
      honeypot_profiles: this.fb.array([])
    })
  }

  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }

  ngOnInit(): void {
    
  }
  minimize(hpIndex: any) {
    this.isshow[hpIndex] = true;
  }

  miniservice(hpIndex: any, serviceIndex: any) {
    this.isShowService[hpIndex][serviceIndex] = true;
  }

  maximize(hpIndex: any) {
    this.isshow[hpIndex] = false;
  }

  maxservice(hpIndex: any, serviceIndex: any) {
    this.isShowService[hpIndex][serviceIndex] = false;
  }

  //honeypot profile
  honeypot_profiles(): FormArray {
    return this.blueprintForm.get("honeypot_profiles") as FormArray
  }

  newHoneypot_profiles(): FormGroup {
    return this.fb.group({
      profile_name: new FormControl("", [Validators.required, Validators.pattern("^[a-zA-Z0-9:_-]+$")]),
      service: this.fb.array([])
    })
  }

  addhoneypot_profile() {
    this.honeypot_profiles().push(this.newHoneypot_profiles());
    for (let i = 0; i < this.honeypot_profiles().length; i++) {
      this.isShowService[i] = [];
    }
    if (this.honeypot_profiles().length > 1) {
      this.isshow[this.honeypot_profiles().length - 2] = true;
      // this.isshow=true;
    }
  }

  removehoneypot_profile(i: number) {
    this.honeypot_profiles().removeAt(i);
    if (i > 0) {
      this.isshow[i - 1] = false;
    }
  }
  // service
  service(hpIndex: number): FormArray {
    return this.honeypot_profiles().at(hpIndex).get("service") as FormArray
  }

  newService(): FormGroup {
    return this.fb.group({
      name: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z0-9 _-]+$")]),
      port: new FormControl(null, [Validators.required, Validators.pattern("^[0-9]+$")]),
      version: new FormControl(null, [Validators.pattern("^[a-zA-Z0-9 _.\\-]+$")]),
      protocol: new FormControl(null, [
        Validators.pattern("^[a-zA-Z]+$")]),
      description: new FormControl(null, [Validators.pattern("^[A-Za-z0-9 _,.\\-&]+$")]),
      vulnerability: this.fb.array([]),
    })
  }

  addService(hpindex: number) {
    this.service(hpindex).push(this.newService());
    if (this.service(hpindex).length > 1) {
      this.isShowService[hpindex][this.service(hpindex).length - 2] = true;
    }
  }

  removeService(hpIndex: number, serviceIndex: number) {
    this.service(hpIndex).removeAt(serviceIndex);
    if (serviceIndex > 0) {
      this.isShowService[hpIndex][serviceIndex - 1] = false;
    }
  }

  //vulnerability

  vulnerability(hpIndex: number, serviceIndex: number): FormArray {
    return this.service(hpIndex).at(serviceIndex).get("vulnerability") as FormArray
  }

  newVulnerability(): FormGroup {
    return this.fb.group({
      vulnerability_name: new FormControl(null, [Validators.required, Validators.pattern("^[a-zA-Z0-9-]+$")]),
      vulnerability_description: new FormControl(null, [Validators.required]),
    })
  }

  addVulnerability(hpIndex: number, serviceIndex: number) {
    this.vulnerability(hpIndex, serviceIndex).push(this.newVulnerability());
  }

  removeVulnerability(hpIndex: number, serviceIndex: number, vulIndex: number) {
    this.vulnerability(hpIndex, serviceIndex).removeAt(vulIndex);
  }

  getvmtype(event: any) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue == 'vbox') {
      this.virtualLabel = "Virtual Machine Name"
      this.vboxForm = true
      let url = environment.getHighNode
      this.restServ.get(url, {}, {}).subscribe(res => {
        this.nodes = res.map((e: any) => e.node_id)
      })
    }
    else {
      this.virtualLabel = "Docker Image ID"
      this.vboxForm = false
    }
  }

  // onSubmit(form: any) {

  //   if (form.node_id == null) {
  //     form.node_id = 0
  //   }
  //   if (form.vm_type == 'docker') {
  //     form.snap_name = form.honeypot_name
  //   }
  //   if (form.honeypot_type == 'LIHP') {
  //     form.honeypot_detail = "Low Interaction Honeypot"
  //   }
  //   else {
  //     form.honeypot_detail = "High Interaction Honeypot"
  //   }
  //   let url = environment.blueprintSubmit
  //   this.restServ.post(url, form, {}).subscribe(res => {
  //     if (res.status == 0) {
  //       this.notiServ.showError(res.msg)
  //     }
  //     else {

  //       this.notiServ.showSuccess(res.msg)

       

  //     }
  //   })
  //   this.blueprintForm.reset()
  // }

  empSubmit(form:any){
    console.log("Button is disabled")
  }

  onSubmit(form: any) {
    // Disable the submit button and show loading indicator
    this.isLoading = true;
  
    if (form.node_id == null) {
      form.node_id = 0;
    }
    if (form.vm_type == 'docker') {
      form.snap_name = form.honeypot_name;
    }
    if (form.honeypot_type == 'LIHP') {
      form.honeypot_detail = "Low Interaction Honeypot";
    } else {
      form.honeypot_detail = "High Interaction Honeypot";
    }
  
    let url = environment.blueprintSubmit;
    this.restServ.post(url, form, {}).subscribe(
      (res) => {
        if (res.status == 0) {
          this.notiServ.showError(res.msg);
        } else {
          this.notiServ.showSuccess(res.msg);
        }
      },
      (error) => {
        console.error('Error submitting form:', error);
        this.notiServ.showError('An error occurred while submitting the form.');
      },
      () => {
        // Re-enable the submit button and hide loading indicator
        this.isLoading = false;
  
        // Reset the form after successful submission
        this.blueprintForm.reset();
      }
    );
  }
  

  // imageCheck(event: any) {
  //   const selectedValue = (event.target as HTMLSelectElement).value;

  //   if (selectedValue.length > 4) {
  //     this.restServ.post(environment.imageCheck, { "image": selectedValue }, {}).subscribe(res => {
  //       if (res.status == 0) {
  //         this.notiServ.showError(res.msg)
  //         this.imageDiabled = true
  //       }
  //       else {
  //         this.imageDiabled = false
  //       }

  //     })
  //   }
  // }
  imageCheck(event: any = null, imageName: string = '') {
    let selectedValue = imageName;

    if (event) {
      selectedValue = (event.target as HTMLSelectElement).value;
    }

    if (selectedValue.length > 4) {
      this.restServ.post(environment.imageCheck, { "image": selectedValue }, {}).subscribe(res => {
        if (res.status === 0) {
          this.notiServ.showError(res.msg);
          this.imageDiabled = true;
        } else {
          this.imageDiabled = false;
        }
      });
    }
  }

  getFormControl(arrayName: string, controlName: string, index: number) {
    const formArray = this.blueprintForm.get(arrayName) as FormArray;
    const formGroup = formArray.at(index) as FormGroup;
    return formGroup.get(controlName);
  }

  getServiceFormControl(controlName: string, hpIndex: number, serviceIndex: number) {
    const formGroup = this.service(hpIndex).at(serviceIndex) as FormGroup;
    return formGroup.get(controlName);
  }


  getVulnerabilityFormControl(controlName: string, hpIndex: number, serviceIndex: number, vulIndex: number) {
    const formArray = this.vulnerability(hpIndex, serviceIndex).at(vulIndex) as FormGroup;
    return formArray.get(controlName);
  }

  onChange(event: any) {
    this.file = event.target.files[0];
  }

  // onFileSelected(event: any): void {
  //   this.selectedFile = event.target.files[0];
  // }

  onFileSelected(event: any): void {
    const fileList: FileList | null = event.target.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      this.fileSelected = true;
      this.selectedFileName = fileList[0].name;

      if (file.name.endsWith('.xml')) {
        this.selectedFile = file;
      } else {
        this.selectedFile = null;
        this.fileSelected = false;
        this.selectedFileName = '';

        this.notiServ.showError('Please select an XML file.')
      }
    }
  }
  parseXML(): void {

    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
    for (let i = this.honeypot_profiles().length; i >= 0; i--) {
      this.removehoneypot_profile(i);
    }
    this.newData = [];
    this.serviceData = [];
    this.vulnData = [];
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      const content = fileReader.result as string;
      const parser = new DOMParser();
      this.xmlContent = content;

      const doc = parser.parseFromString(this.xmlContent, 'text/html');

      const Vm_name = doc.querySelector('machine_name');
      const Img_Name = doc.querySelector('image_name');
      const imgpart = Img_Name?.textContent?.split("_");
      this.basesys = imgpart?.[2]
      if (this.basesys === 'rasp') {
        this.basesys = 'raspberry';
      }
      const image_name: any = Img_Name?.textContent
      const vmtype = doc.querySelector('vm_type');
      const OStype = doc.querySelector('os_type');
      const honeytype = doc.querySelector('profile_name');

      if (honeytype) {
        const hpType = honeytype.textContent
        const parts = hpType?.trim().split(':');
        console.log("parts", parts)

       let  detailedProfileName = false;
        if(parts) {
          detailedProfileName = parts.length >= 4;
console.log("1",detailedProfileName)
        }
        console.log("2",detailedProfileName)

        // console.log("Detailed", detailedProfileName)
        // const singleDepth = /:[^:]+:[^:]+:[^:]+:/.test(hpType || '');
        let result = ''
if(detailedProfileName){
  console.log("I am in detailed Profile Name")
  const parts = honeytype.textContent?.split(":") || '';
  result = parts?.[1];
  if (result == "iot") {
    this.type = "IoT";
  }
  else {

    this.type = result?.toUpperCase();
  }
}

else {
  console.log("I am in else")

  const os_name = doc.querySelector('os_name')?.textContent || '';

  if(os_name.startsWith('Win') || os_name.startsWith('win') || os_name.startsWith('WIN') ){
    this.type = 'WINDOWS'
  }
  else if (os_name.startsWith('lin') || os_name.startsWith('Lin') || os_name.startsWith('LIN')){
    this.type = 'LINUX'

  }

}
console.log("type----",this.type)
      }

      const OSname = doc.querySelector('os_name');
      const IMGtag = doc.querySelector('image_tag')
      const snapname = doc.querySelector('snapshot_name')
      const profile = doc.querySelector('php')

///////////////////
if (profile) {
  for (let i = 0; i < profile.children.length; i++) {
    this.addhoneypot_profile();
    this.serviceData = [];

    for (let j = 1; j < profile.children[i].children.length; j++) {
      this.addService(i);

      const serviceElement = profile.children[i].children[j];

      this.vulnData = [];

      for (let k = 0; k < serviceElement.children.length; k++) {
        if (serviceElement.children[k].tagName.toLowerCase() === 'vulnerability') {
          this.addVulnerability(i, j - 1);

          const vulnerabilityElement = serviceElement.children[k];
          // console.log(vulnerabilityElement)
          // console.log(vulnerabilityElement.querySelector('name')?.textContent)

          // console.log(vulnerabilityElement)
          this.vulnData.push({
            vulnerability_name: vulnerabilityElement.querySelector('vulnerability_name')?.textContent || '',
            vulnerability_description: vulnerabilityElement.querySelector('vulnerability_description')?.textContent || '',
          });
        }
      }

      this.serviceData.push({
        name: serviceElement.querySelector('name')?.textContent || '',
        port: serviceElement.querySelector('port')?.textContent || '',
        version: serviceElement.querySelector('version')?.textContent || '',
        protocol: serviceElement.querySelector('protocol')?.textContent || '',
        description: serviceElement.querySelector('description')?.textContent || '',
        vulnerability: this.vulnData,
      });
    }

    this.newData.push({
      profile_name: profile.children[i].children[0].textContent || '',
      service: this.serviceData,
    });
  }
}









///////////////////
      // if (profile) {
      //   for (let i = 0; i < profile?.childElementCount; i++) {
      //     this.addhoneypot_profile();
      //     this.serviceData = [];
      //     for (let j = 1; j < profile?.children[i].childElementCount; j++) {
      //       this.addService(i);
      //       if (profile?.children[i]?.children[j].childElementCount >= 3) {
      //         this.vulnData = [];
      //         for (let k = 3; k < profile?.children[i]?.children[j].childElementCount; k++) {
      //           this.addVulnerability(i, j - 1);
      //           this.vulnData.push({
      //             vulnerability_name: profile?.children[i]?.children[j].children[k].children[0].textContent,
      //             vulnerability_description: profile?.children[i]?.children[j].children[k].children[1].textContent
      //           })
      //         }
      //       }
      //       const serviceElement = profile?.children[i]?.children[j];

      //       await this.serviceData.push({
      //         name: serviceElement?.querySelector('name')?.textContent,
      //         port: serviceElement?.querySelector('port')?.textContent,
      //         version: serviceElement?.querySelector('version')?.textContent,
      //         protocol: serviceElement?.querySelector('protocol')?.textContent || '',
      //         description: serviceElement?.querySelector('description')?.textContent || '',
      //         vulnerability: this.vulnData
      //         // name: profile?.children[i]?.children[j]?.children[0]?.textContent,
      //         // port: profile?.children[i]?.children[j]?.children[1]?.textContent,
      //         // version: profile?.children[i]?.children[j]?.children[2]?.textContent,
      //         // protocol: profile?.children[i]?.children[j]?.children[3]?.textContent || '',
      //         // description: profile?.children[i]?.children[j]?.children[4]?.textContent || '',
      //         // vulnerability: this.vulnData
      //       })
      //     }

      //     this.newData.push({
      //       profile_name: profile?.children[i].children[0].textContent,
      //       service: this.serviceData
      //     })
      //   }

      // }
      if (Vm_name && (vmtype?.textContent === 'docker' || vmtype?.textContent === 'Docker')) {
        this.blueprintForm.setValue({
          vm_type: vmtype?.textContent,
          base_system: this.basesys || "null",
          vm_name: Vm_name?.textContent,
          image_name: Img_Name?.textContent,
          image_tag: IMGtag?.textContent,
          os_type: OStype?.textContent,
          os_name: OSname?.textContent,
          node_id: null,
          snap_name: null,
          honeypot_name: snapname?.textContent,
          honeypot_type: vmtype?.textContent === 'Docker' || vmtype?.textContent === 'docker' ? 'LIHP' : '',
          honeypot_detail: null,
          honeypot_cat: this.type,
          honeypot_profiles: this.newData
        });
        
        this.imageCheck(null, image_name);
      }
      if (Vm_name && vmtype?.textContent === 'vbox') {
        this.virtualLabel = "Virtual Machine Name"
        this.vboxForm = true
        this.imageDiabled =   false
        let url = environment.getHighNode
        this.restServ.get(url, {}, {}).subscribe(res => {
          this.nodes = res.map((e: any) => e.node_id)
        })

        this.blueprintForm.setValue({
          vm_type: vmtype?.textContent,
          base_system: 'desktop',
          vm_name: Vm_name?.textContent,
          image_name: "undefined",
          image_tag: 0,
          os_type: OStype?.textContent,
          os_name: OSname?.textContent,
          node_id: null,
          snap_name: snapname?.textContent,
          honeypot_name: OStype?.textContent,
          honeypot_type: 'HIHP',
          honeypot_detail: null,
          honeypot_cat: this.type,
          honeypot_profiles: this.newData
        });
      // this.imageCheck(null, image_name);
    }
      if (vmtype?.textContent && (vmtype.textContent.toLowerCase() != 'docker')) {
        this.notiServ.showInfo('Please select Node ID')
        if (this.blueprintForm && this.blueprintForm.get('node_id')) {
          this.blueprintForm.get('node_id')?.setValidators([Validators.required]);
          this.blueprintForm.get('node_id')?.updateValueAndValidity();
        }
      }
    };
    fileReader.readAsText(this.selectedFile);
    
  }

}
