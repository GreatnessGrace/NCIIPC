import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SignupService } from 'src/app/core/services/signup.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { AESEncryptDecryptService } from 'src/app/common/aesencrypt-decrypt.service';
import { minLengthAsyncValidator } from 'src/app/common/validator';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  getNodeIdData! : Subscription;
  getOrgData! : Subscription;
  getSectorData! : Subscription;
  getRegionListData! : Subscription;
  getAddUserData! : Subscription;

  allNodes: any[] = [];
  signUpForm: any = FormGroup;
  signupSubmitted = false;
  allRegionSelected = false;
  allSectorSelected = false;
  allOrganisationSelected = false;
  allNodeSelected = false;
  regionList: any[] = [];
  selectedResgion: any[] = [];
  finalRegionList: any[] = [];
  finalSectorList: any[] = [];
  selectedSectorArr: any[] = [];
  selectedOrganizations: any[] = [];
  finalOrganizationList: any;
  finalNodeList: any;
  accessNode: any[] = [];
  totalNodes:any
  showSector = false;
  showOrganization = false;
  showNodes = false;
  nameRegexReq = false;
  usernameRegexReq = false;

  constructor(private fb: FormBuilder, private router: Router, private signupService: SignupService,
    private cryptServ: AESEncryptDecryptService, 
 private dialogRef: MatDialog, private toastrService: NotificationService, private restServ: RestService,
    public dialogReff: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit(): void {
    this.initSignupForm();
    this.getRegion();
    this.getAllNodeId();
  }


  counter(i: number) {
    return new Array(i);
  }

  encConfirmPassword(e: any) {

    if (e.target.value.length == 0){
      this.signUpForm.controls['cpassword'].reset()
      document.getElementById("encCpassword")?.setAttribute('type','hidden');
      document.getElementById("cpassword")?.setAttribute('type','password');
    }
else{
      let enc = this.cryptServ.encrypt(this.signUpForm.get('cpassword')?.value);
      this.signUpForm.get('cpassword')?.setValue(enc);

      document.getElementById("cpassword")?.setAttribute('type', 'hidden');
      document.getElementById("encCpassword")?.setAttribute('type', 'password');
      this.signUpForm.get('encCpassword')?.setValue(enc);

    }
  }
  myEncryption(e: any) {

    if (e.target.value.length == 0){
      this.signUpForm.controls['orgPassword'].reset()
      document.getElementById("Password")?.setAttribute('type','hidden');
      document.getElementById("orgPassword")?.setAttribute('type','password');
    }
else{
      let enc = this.cryptServ.encrypt(this.signUpForm.get('orgPassword')?.value);
      this.signUpForm.get('orgPassword')?.setValue(enc);

      document.getElementById("orgPassword")?.setAttribute('type', 'hidden');
      document.getElementById("Password")?.setAttribute('type', 'password');
      this.signUpForm.get('password')?.setValue(enc);

    }
  }

  initSignupForm() {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9 ]+$")]],
      username: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9 ]+$")]],
      password: [''],
      orgPassword: ['', [Validators.required], minLengthAsyncValidator(7)],
      encCpassword: [''],
      cpassword: ['', [Validators.required], minLengthAsyncValidator(7)],
      role: ['', [Validators.required]],
      node: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      region: ['', [Validators.required]],
      user_status: ['active'],
      organization: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]]
    });
  }

  get f() {
    // console.log('this.signUpForm.controls',this.signUpForm.controls);
    
    return this.signUpForm.controls;
  }

  addUser() {
    this.signupSubmitted = true;

    this.nameRegexReq = false;
    this.usernameRegexReq = false;
    this.signupSubmitted = true;

    this.signUpForm.get('name').setValue(this.signUpForm?.value.name.trim());
    let name = this.signUpForm?.value.name.trim();

    this.signUpForm.get('username').setValue(this.signUpForm?.value.username.trim());
    let username = this.signUpForm?.value.username.trim();
    var nameRegex = new RegExp("^[a-zA-Z0-9 ]+$");

    if (!nameRegex.test(name)) {
      this.toastrService.showError("Please Enter Alphanumeric name only");
      this.nameRegexReq = true;
      return;
    }

    if (!nameRegex.test(username)) {
      this.toastrService.showError("Please Enter Alphanumeric username only");
      this.usernameRegexReq = true;
      return;
    }


    // if (this.signUpForm.get('password').value !== this.signUpForm.get('cpassword').value) {
    //   this.toastrService.showError(" Password Doesn't match Confirm Password");
    //   return;
    // }

    if (this.allNodes.length != 0) {
      this.signUpForm.value.node = this.allNodes
    }

    this.getAddUserData = this.restServ.post(environment.addUser, this.signUpForm.value, {}).subscribe(res => {
   
      if (res.status == 1) {
        this.toastrService.showSuccess("User Added Successfully");
        this.dialogRef.closeAll();
      }
      else{
        if(res?.message){
          this.toastrService.showError(res.message)
        }
   else{
    this.toastrService.showError("User Not Registered. Try Again!!!")
   }
        this.signUpForm.reset();
        document.getElementById("Password")?.setAttribute('type', 'hidden');
        document.getElementById("orgPassword")?.setAttribute('type', 'password');
        document.getElementById("encCpassword")?.setAttribute('type', 'hidden');
        document.getElementById("cpassword")?.setAttribute('type', 'password');
      }
    })


  }
  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogReff.close();
    } else {
      this.dialogReff.close("I am closed!!")
    }
  }

  // get region sart
  getRegion() {
    let url = environment.getRegion
    this.getRegionListData = this.restServ.get(url, {}, {}).subscribe(res => {
      this.regionList.push(res['data'])
      this.regionList[0].forEach((element: any, i: any) => {
        element.status = false
        this.finalRegionList.push(element)
      })
    })
  }

  selectedRegions() {
    this.selectedResgion = []
    if (this.signUpForm.value && this.signUpForm.value.region) {
      this.selectedResgion = this.signUpForm.value.region.map((x: any) => {
        return { region: x.region, status: true }
      });
    }

    if (this.selectedResgion.length != 0) {
      this.getSector(this.selectedResgion)
    } else {
      this.finalSectorList = []
    }
  }

  getSector(region: any) {
    let url = environment.getSector
    this.getSectorData = this.restServ.post(url, region, {}).subscribe(res => {
      this.finalSectorList = res.data
      this.showSector = true;
    })
  }

  selectedSector() {
    this.selectedSectorArr = []
    if (this.signUpForm.value && this.signUpForm.value.sector) {
      this.selectedSectorArr = this.signUpForm.value.sector.map((x: any) => {
        return { sector: x.key, status: true }
      });
    }
    let region_sector = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr
    }
    if (this.selectedSectorArr.length != 0) {
      this.getOrganization(region_sector)
    } else {
      this.finalOrganizationList = []
    }
  }

  selectedOrganization() {
    this.selectedOrganizations = [];
    if (this.signUpForm.value && this.signUpForm.value.organization) {
      this.selectedOrganizations = this.signUpForm.value.organization.map((x: any) => {
        return { organization: x.key, status: true }
      });
    }

    let region_sector_organization = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr,
      organization: this.selectedOrganizations
    }


    if (this.selectedSectorArr.length != 0) {
      this.getdNodeId(region_sector_organization)
    } else {
      this.finalNodeList = []
    }
  }


  getOrganization(sector: any) {
    let url = environment.getOrganization
    this.getOrgData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalOrganizationList = res.data
      this.showOrganization = true;
    })
  }
  // get organization end
  getdNodeId(sector: any) {
    let url = environment.getNodeId
    this.getNodeIdData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalNodeList = res.data
      this.showNodes = true;
    })

  }

  getAllNodeId(){
    let url = environment.getNodeAllId
    this.getNodeIdData = this.restServ.post(url,{}, {}).subscribe(res => {
      this.totalNodes = res.data

    })
  }

  // node permission procedure
  nodeAccess() {
    this.accessNode = []
    if (this.signUpForm.value && this.signUpForm.value.node) {
      this.accessNode = this.signUpForm.value.node.map((x: any) => {
        return { id: x.id, status: true }
      });
  
    }

  }

  toggleAllSelection(type: string) {
    switch (type) {
      case 'region': {
        if (this.allRegionSelected) {
          this.signUpForm.patchValue({
            region: this.finalRegionList
          });
          this.selectedRegions();
        } else {
          this.signUpForm.patchValue({
            region: []
          });
          this.finalSectorList = [];
          this.finalOrganizationList = [];
          this.finalNodeList = [];
          this.allSectorSelected = false;
          this.allOrganisationSelected = false;
          this.allNodeSelected = false;
        }
      }
        break;
      case 'sector': {
        if (this.allSectorSelected) {
          this.signUpForm.patchValue({
            sector: this.finalSectorList
          });
          this.selectedSector();
        } else {
          this.signUpForm.patchValue({
            sector: []
          });
          this.finalOrganizationList = [];
          this.finalNodeList = [];
          this.allOrganisationSelected = false;
          this.allNodeSelected = false;
        }
      }
        break;
      case 'organization': {
        if (this.allOrganisationSelected) {
          this.signUpForm.patchValue({
            organization: this.finalOrganizationList
          });
          this.selectedOrganization();
        } else {
          this.signUpForm.patchValue({
            organization: []
          });
          this.finalNodeList = [];
          this.allNodeSelected = false;
        }
      }
        break;
      case 'nodes': {
        this.allNodes = []
        if (this.allNodeSelected) {

          if(this.finalNodeList.length == this.totalNodes[0].count){
            this.allNodes.push({ "id": 0 })
          }
          this.signUpForm.patchValue({
            node: this.finalNodeList
          });
          this.nodeAccess();
        } else {
          this.allNodes = []
          this.signUpForm.patchValue({
            node: []
          });
        }

      }
    }
  }
  ngOnDestroy(): void{
    if(this.getNodeIdData){
    this.getNodeIdData.unsubscribe();
    }
    if(this.getOrgData){
    this.getOrgData.unsubscribe();
    }
    if(this.getSectorData){
    this.getSectorData.unsubscribe();
    }
    if(this.getRegionListData){
    this.getRegionListData.unsubscribe();
    }
    if(this.getAddUserData){
    this.getAddUserData.unsubscribe();
    }
  } 
 
  
}

