import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit {
  getAllNodesData! : Subscription;
  getRegionData! : Subscription;
  getSecData! : Subscription;
  getOrgData! : Subscription;
  getNodeIdData! : Subscription;
  getNodePermissionData! : Subscription;

  allNodes: any[] = [];
  allSelected = false;
  allSectorSelected = false;
  allOrganisationSelected = false;
  allNodeSelected = false;
  regionList: any[] = [];
  selectedResgion: any[] = [];
  selectedRegionsA: any[] = [];
  finalRegionList: any[] = [];
  finalSectorList: any[] = [];
  selectedSectorArr: any[] = [];
  selectedOrganisations: any[] = [];
  selectedOrganisationsArr: any[] = [];
  selectedNodes: any[] = [];
  selectedSectorA: any[] = [];
  finalOrganizationList: any;
  finalNodeList: any;
  accessNode: any[] = [];
  dataToSend: any;
  spin1: boolean = false;
  spin2: boolean = false;
  spin3: boolean = false;
  constructor(public dialogRef: MatDialogRef<PermissionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private restServ: RestService) {
  }
  ngOnInit(): void {
    let node = this.data.node_ids.map((a: any) => a.node_id);
    this.getRegion();
    this.getAllNodes();
  }


  getAllNodes() {
    this.getAllNodesData  = this.restServ.get(environment.getAllNodes, {}, {}).subscribe(res => {
      if (res && res.length) {
        this.allNodes = res.filter((x: any) => x.id != 0);
      }
    })
  }

  // get region sart
  getRegion() {
    let url = environment.getRegion
    this.getRegionData  = this.restServ.get(url, {}, {}).subscribe(res => {
      this.regionList.push(res['data'])
      this.allSectorSelected = false;
      this.allOrganisationSelected = false;
      this.regionList[0].forEach((element: any, i: any) => {
        element.status = false
        this.finalRegionList.push(element)

      })
    })

  }

  selectedRegions() {

    this.selectedResgion = [];
    for (let data of this.selectedRegionsA) {
      data.key = data.region;
      data.status = true;
      this.selectedResgion.push(data);

    }
    if (this.selectedResgion.length != 0) {
      this.getSector(this.selectedResgion)
    } else {
      this.finalSectorList = []
    }
  }
  // get region end

  // get sector start
  getSector(region: any) {
    this.spin1 = true;
    let url = environment.getSector
    this.getSecData  = this.restServ.post(url, region, {}).subscribe(res => {
      this.finalSectorList = res.data
      this.spin1 = false;
    })

  }

  selectedSector() {

    this.selectedSectorArr = [];
    for (let data of this.selectedSectorA) {
      data.status = true;
      this.selectedSectorArr.push(data);
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
  // get sector end

  // get organization start
  selectedOrganization() {
    this.selectedOrganisationsArr = []
    for (let data of this.selectedOrganisations) {
      data.status = true;
      this.selectedOrganisationsArr.push(data);
    }
    let region_sector_organization = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr,
      organization: this.selectedOrganisationsArr
    }

    if (this.selectedSectorArr.length != 0) {
      this.getdNodeId(region_sector_organization)
    } else {
      this.finalNodeList = []
    }
  }


  getOrganization(sector: any) {
    this.spin2 = true;
    let url = environment.getOrganization
    this.getOrgData  = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalOrganizationList = res.data
      this.spin2 = false;
    })

  }
  // get organization end
  getdNodeId(sector: any) {
    this.spin3 = true;
    let url = environment.getNodeId
    this.getNodeIdData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalNodeList = res.data
      this.spin3 = false;
    })

  }


  nodeAccess() {
    this.accessNode = []
    for (let data of this.selectedNodes) {
      this.accessNode.push(data);
    }

  }

  givePrevillage() {

    // console.log('node',this.accessNode);
    // console.log('getAllNodesData',this.allNodes);
    // return;
    
    if (this.accessNode.length != 0) {
      let node = [];
      if (this.allOrganisationSelected && this.allSectorSelected && this.allSelected && this.allNodes.length ==  this.accessNode.length) {
        node = [{ id: 0 }];
      } else {
        node = this.accessNode;
      }
      this.dataToSend = {

        node_ids: node,
        user_id: this.data.user_id
      }

      let url = environment.nodePermission
      this.getNodePermissionData=this.restServ.post(url, this.dataToSend, {}).subscribe(res => {
        this.dialogRef.close("I am closed!!");
      })
    }
  }
  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }

  toggleAllSelection(type: string) {
    switch (type) {
      case 'region': {
        if (this.allSelected) {
          this.selectedRegionsA = this.regionList[0];
          this.selectedRegions();
        } else {
          this.selectedRegionsA = [];
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
          this.selectedSectorA = this.finalSectorList;
          this.selectedSector();
        } else {
          this.selectedSectorA = [];
          this.finalOrganizationList = [];
          this.finalNodeList = [];
          this.allOrganisationSelected = false;
          this.allNodeSelected = false;
        }
      }
        break;
      case 'organization': {
        if (this.allOrganisationSelected) {
          this.selectedOrganisations = this.finalOrganizationList;
          this.selectedOrganization();
        } else {
          this.selectedOrganisations = [];
          this.finalNodeList = [];
          this.allNodeSelected = false;
        }
      }
        break;
      case 'nodes': {
        if (this.allNodeSelected) {
          this.selectedNodes = this.finalNodeList;
          this.nodeAccess();
        } else {
          this.selectedNodes = [];
        }
      }
    }
  }
  ngOnDestroy(): void{
    if(this.getAllNodesData){
    this.getAllNodesData.unsubscribe();
    }
    if(this.getRegionData){
    this.getRegionData.unsubscribe();
    }
    if(this.getSecData){
    this.getSecData.unsubscribe();
    }
    if(this.getOrgData){
    this.getOrgData.unsubscribe();
    }
    if(this.getNodeIdData){
    this.getNodeIdData.unsubscribe();
    }
    if(this.getNodePermissionData){
    this.getNodePermissionData.unsubscribe();
    }
  } 
}