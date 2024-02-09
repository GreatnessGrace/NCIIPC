import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardserviceService } from 'src/app/core/services/dashboardservice.service';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { LoginService } from 'src/app/core/services/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-parent-chart',
  templateUrl: './parent-chart.component.html',
  styleUrls: ['./parent-chart.component.scss']
})
export class ParentChartComponent implements OnInit {

  getTopPortsData! : Subscription
  getTopAttackerIPsData! : Subscription
  getTopAttackCountryData! : Subscription
  getTopMalwareFamilyData! : Subscription
  getTrendPortsData! : Subscription
  getTopAttacktrendData! : Subscription
  searchloader:Boolean = true
  payload: any;
  clipp: any;
  chartAllData: any = [false]
  lineChartData: any = [false]
  beforeDate: any = new Date();
  chartType: any = [];
  userType: any = '';
  orgHeading:any;

  assetPath = environment.assetPath;
  additionalKeys: any = [
    { color: "red", img: "fa fa-connectdevelop" },
    { color: "green", img: "fa fa-barcode" },
    { color: "yellow", img: "fa fa-compress" },
    { color: "cadetblue", img: "fa fa-file-text-o" },
    { color: "safron", img: "fa fa-arrows" },
    { color: "aquamarine", img: "fa fa-external-link" },
    { color: "red", img: "fa fa-sticky-note-o" },
    { color: "green", img: "fa fa-cloud-download" },
    { color: "yellow", img: "fa fa-bug" },
    { color: "cadetblue", img: "fa fa-files-o" },
    { color: "safron", img: "fa fa-database" }
  ]



  constructor(
    public dashboardService: DashboardserviceService,
    public router: Router,
    private restServ: RestService,
    private loginService: LoginService,
  ) {
    this.userType = this.loginService.getUser().role;
    if (this.userType == 'user') {
      this.userType = true; 
    } else {
      this.userType = false;
  
    }
  }

  ngOnInit(): void {
    this.submitOnChips()
  }

  getRandom() {
    return this.additionalKeys[Math.floor(Math.random() * this.additionalKeys.length)].img;
  }


  submitOnChips() {

    this.dashboardService.filterControl.subscribe(async res => {
     
      this.chartAllData = []
      this.lineChartData = []
      if (Object.keys(res).length != 0) {
        this.payload = res;
        this.orgHeading=this.payload.organization[0].key
      
this.organizationCharts()

      }
      else{
        this.emptyCharts()
      }

    })
  }

  emptyCharts(){
    this.searchloader = false
    this.emptyPort()
    this.emptyIpAttackers()
    this.emptycountryAttackers()
    this.emptymalwareFamilis()
  }
  organizationCharts() {
     this.searchloader = false
    this.ports()
    this.ipAttackers()
    this.countryAttackers()
    this.malwareFamilis()
    this.trendPorts()
    this.trendAttack()
  }

  emptyPort(){
    let res:any = {data:[],message:"Top Targeted Ports"}
    this.chartAllData.push(res)
    this.fillAllChartsEmpty();
  }

  emptyIpAttackers(){
    let res:any = {data:[],message:"Attacker IP's"}
    this.chartAllData.push(res)
    this.fillAllChartsEmpty();
  }

  emptycountryAttackers(){
    let res:any = {data:[],message:"Source of Attack - Country"}
    this.chartAllData.push(res)
    this.fillAllChartsEmpty();
  }
  emptymalwareFamilis(){
    let res:any = {data:[],message:"Top Malware Types"}
    this.chartAllData.push(res)
    this.fillAllChartsEmpty();
  }

  ports() {
    let url = environment.topPorts
    this.getTopPortsData=this.restServ.post(url, this.payload, {}).subscribe(res => {
      this.chartAllData.push(res)
      this.fillAllChartsEmpty();
    })

  }

  ipAttackers() {
    let url = environment.topAttackerIPs
    this.getTopAttackerIPsData=this.restServ.post(url, this.payload, {}).subscribe(res => {
      this.chartAllData.push(res)
      this.fillAllChartsEmpty();
    })
  }

  // Top Attacker Country
  countryAttackers() {
    let url = environment.topAttackCountry
    this.getTopAttackCountryData=this.restServ.post(url, this.payload, {}).subscribe(res => {
      this.chartAllData.push(res)
      this.fillAllChartsEmpty();
    })
  }


  malwareFamilis() {
    let url = environment.topMalwareFamily
    this.getTopMalwareFamilyData=this.restServ.post(url, this.payload, {}).subscribe(res => {
      this.chartAllData.push(res)
      this.fillAllChartsEmpty();
    })
  }

  trendPorts() {
      let url = environment.trendPorts
      this.getTrendPortsData = this.restServ.post(url, this.payload, {}).subscribe(res => {
        if (res.data.length > 0) { this.lineChartData.push(res) }
      })
  
  }

  trendAttack() {
    let url = environment.topAttackTrend
    this.getTopAttacktrendData=this.restServ.post(url, this.payload, {}).subscribe(res => {
      if (res.data.length > 0) { this.lineChartData.push(res) }
    })
  }



  fillAllChartsEmpty() {


    for (var i = 0; i < this.chartAllData.length; i++) {
      if (this.chartAllData[i].data.length < 4 && this.chartAllData[i].data.length > 0 || this.chartAllData[i].message=="Attacker IP's") {
        this.chartType[i] = 'table';
      }
      else if(this.chartAllData[i].message=="Source of Attack - Country"){
        this.chartType[i] = 'bar';
      }
      else {
        this.chartType[i] = 'pie';
      }

    }
  }

  chartToggle(i: any, chartType: string) {
    this.chartType[i] = chartType;
  }
  ngOnDestroy(): void{
    if( this.payload){
    this.getTopPortsData.unsubscribe();
    this.getTopAttackerIPsData.unsubscribe();
    this.getTopAttackCountryData.unsubscribe();
    this.getTopMalwareFamilyData.unsubscribe();
    this.getTrendPortsData.unsubscribe();
    this.getTopAttacktrendData.unsubscribe();

    }
  }
  
}