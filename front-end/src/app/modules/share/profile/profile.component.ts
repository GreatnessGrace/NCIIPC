import { Component  } from '@angular/core';
import { LoginService } from 'src/app/core/services/login.service';
import { MatDialogRef  } from '@angular/material/dialog';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent {
  getAllNodesData! : Subscription;
  getRegionData! : Subscription;
  getAllSectorsData! : Subscription;
  getAllOrganisationData! : Subscription;

  username:any
  email:any
  role:any
  allNodes:any = [];
  node:any
  region:any = [];
  sector:any = [];
  organization:any = [];
constructor( 
  private loginService: LoginService,
  public dialogReff: MatDialogRef<ProfileComponent>,
  private restServ: RestService){}

ngOnInit(): void {
  this.getName()
  this.getAllNodes();
}
getName(){
  this.username = this.loginService.getUser().name;
  this.email=this.loginService.getUser().email;
  this.role=this.loginService.getUser().role;
}
closeButton(type:any|undefined) {
  if(type== 'simple'){
    this.dialogReff.close();
  } else{
  this.dialogReff.close("I am closed!!")
  }
}
getAllNodes(){
  this.getAllNodesData =this.restServ.get(environment.getAllNodes,{},{}).subscribe(res => {
    this.allNodes = res;
  })
  this.getRegionData =this.restServ.get(environment.region, {}, {}).subscribe(res => {
    this.region = res
  })
  this.getAllSectorsData =this.restServ.get(environment.getAllSectors, {}, {}).subscribe(res => {
    this.sector = res
  })
  this.getAllOrganisationData =this.restServ.get(environment.getAllOrganization, {}, {}).subscribe(res => {
    this.organization = res
  })
}
ngOnDestroy(): void{
  if(this.getAllNodesData){
  this.getAllNodesData.unsubscribe();
  }
  if(this.getRegionData){
  this.getRegionData.unsubscribe();
  }
  if(this.getAllSectorsData){
  this.getAllSectorsData.unsubscribe();
  }
  if(this.getAllOrganisationData){
  this.getAllOrganisationData.unsubscribe();
  }

} 
}
