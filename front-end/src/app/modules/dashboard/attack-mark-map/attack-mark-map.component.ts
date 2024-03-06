import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet'
import { MapserviceService } from 'src/app/core/services/mapservice.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DashboardserviceService } from 'src/app/core/services/dashboardservice.service';
import { LoginService } from 'src/app/core/services/login.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { CookiestorageService } from 'src/app/common/cookiestorage.service';
import { RightClickService } from 'src/app/core/services/right-click.service';
declare const Messaging: any;
const iconRetinaUrl = environment.assetPath + '/mapDemo/images/marker-icon.png';
const iconUrl = environment.assetPath + '/mapDemo/images/marker-icon.png';
const shadowUrl = environment.assetPath + '/mapDemo/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-attack-mark-map',
  templateUrl: './attack-mark-map.component.html',
  styleUrls: ['./attack-mark-map.component.scss']
})
export class AttackMarkMapComponent implements OnInit {
  // MQTT
  private client: any;
  private destination: any;
  private nodeTemp: string = 'ALL';

  getAllAttackNodes! : Subscription;
  getSecAttackData! : Subscription;
  payload: any;
  chartAllData: any = []
  beforeDate: any = new Date()
  private map: any;
  private fullMap: any;
  allNodes: any;
  chartType: any;
  assetPath = environment.assetPath;
  userType: any;
  private initMap(): void {
    this.map = L.map('map', {
      center: [23.076090, 81.000],
      zoom: 3,
      attributionControl: false
    });
    const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + environment.openMapToken, {
      maxZoom: 18,
      id: 'mapbox/satellite-streets-v11',
      tileSize: 512,
      // minZoom: 3.43,
      zoomOffset: -1
    });
  //      const tiles = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
  //     maxZoom: 20,
  //     subdomains:['mt0','mt1','mt2','mt3']
  // });
    tiles.addTo(this.map);
    this.map.whenReady(() => {
      this.mapService.addKashmirBorderLineToMap(this.map, '#000');
    });
  }

  initFullMap() {
    this.fullMap = L.map('map-full', {
      // center: [28.644800, 77.216721],
      center: [23.076090, 81.000],
      zoom: 5,
      attributionControl: false
    });

    const tilesFull = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + environment.openMapToken, {
      // maxZoom: 18,
      id: 'mapbox/satellite-streets-v11',
      tileSize: 512,
      minZoom: 2,
      zoomOffset: -1
    });
  //   const tilesFull = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
  //     maxZoom: 20,
  //     subdomains:['mt0','mt1','mt2','mt3']
  // });
    tilesFull.addTo(this.fullMap);
    this.fullMap.whenReady(() => {
      this.mapService.addKashmirBorderLineToMap(this.fullMap, '#000');
    });
    this.mapService.getLiveMap(this.fullMap, this.allNodes)
  }


  constructor(public mapService: MapserviceService, private cookServ:CookiestorageService,private restServ: RestService, public dashboardService: DashboardserviceService,private loginService: LoginService,private notiServ: NotificationService,
    public router: Router) {
      this.userType = this.loginService.getUser().role;
      // console.log("this.userType",this.userType)
      if (this.userType == 'user') {
        this.userType = true; 
      } else {
        this.userType = false;
    
      }
  
    this.getAllNodes();
  }

  submitOnChips() {
    this.dashboardService.filterControl.subscribe(async res => {
      this.chartAllData = []
      if (Object.keys(res).length != 0) {
        this.payload = res;
        this.sectorWise()
      }
      else{
        let res:any = {data:[],message:"State Wise Classification"}
        this.chartAllData.push(res)
      }
     
    })
  }


  sectorWise() {
        let url = environment.orgWiseAttack
        this.getSecAttackData=this.restServ.post(url,this.payload,{}).subscribe(res =>{
    
          const modifiedData = res.data.map((item:any) => {
            const words = item.key.split('-');
            const lastWord = words[words.length - 1];
            return { key: lastWord, doc_count: item.doc_count };
          });
          
          // Reset the data
          res.data = modifiedData;
          
          console.log("res",res)
          this.chartAllData.push(res)
        })
      }

  getAssignNodes() {
    let url = environment.getAllAttackNodes;
    this.getAllAttackNodes=this.restServ.get(url, {}, {}).subscribe(res => {
      this.allNodes = res;
      this.mapService.getLiveMap(this.map, this.allNodes);
    });
  }

  ngOnInit(): void {
    this.chartType= 'pie';
    this.initMap();
    this.submitOnChips();
  }

  invalidateSize() {
    if (this.fullMap) {
      this.fullMap.remove();
    }
    setTimeout(() => {
      this.initFullMap();
    }, 300);
  }

  chartToggle(chartType: string) {
    this.chartType = chartType;
  }
  ngOnDestroy(): void{
    if(this.getAllAttackNodes){
    this.getAllAttackNodes.unsubscribe();
    }
    if(this.getSecAttackData){
    this.getSecAttackData.unsubscribe();
    }

  } 


  // MQTT

  ngAfterViewInit(): void {
    this.connectActiveMQ();
  }
  addAnimatedLine(attackData: any, color: string) {
    let latlngs = [];
    let grades = ["command_execution", "bruteforce", "binary_drop","attack_log", "url_redirection","classified_malware","unclassified_binary"]
    let gcolor = ["#c30101","#ff8503","#feb204","#ffd22b","#e9d700","#f8ed62","#fff9ae"]
    let clr = 1
    for (var i = 0; i < grades.length; i++) {
      clr = 1
      if(attackData.att_type == grades[i]){
        clr = 0
        this.circleMark(attackData.node_lat, attackData.node_lng, attackData.node_name, gcolor[i]);
        this.endcircleMark(attackData.lat, attackData.lng, attackData.src_country,gcolor[i]);
        break;
      }
    }
 if (clr == 1){
    this.circleMark(attackData.node_lat, attackData.node_lng, attackData.node_name, "purple");
    this.endcircleMark(attackData.lat, attackData.lng, attackData.src_country,"purple");
 }
    // this.circleMark(attackData.node_lat, attackData.node_lng, attackData.node_name, "#FF9966");
    // this.circleMark(attackData.lat, attackData.lng, attackData.node_name, "#FF9966");

    let latlng1: any = [attackData.lat, attackData.lng],
      latlng2 = [attackData.node_lat, attackData.node_lng];
    let offsetX = latlng2[1] - latlng1[1],
      offsetY = latlng2[0] - latlng1[0];
    let r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
      theta = Math.atan2(offsetY, offsetX);
    let thetaOffset = (3.14 / 10);
    let r2 = (r / 2) / (Math.cos(thetaOffset)),
      theta2 = +theta + +thetaOffset;
    let test = Math.cos(theta2);
    let midpointX = (r2 * test);
    midpointX = +midpointX + +latlng1[1];
    let test1 = r2 * Math.sin(theta2);
    let midpointY = +test1 + +latlng1[0];
    let midpointLatLng = [midpointY, midpointX];
    latlngs.push(latlng1, midpointLatLng, latlng2);
    let pathOptions: any
    for (var i = 0; i < grades.length; i++) {
      clr = 1
      if(attackData.att_type == grades[i]){
        clr = 0
        pathOptions = {
          color: gcolor[i],
          weight: 2,
          lineCap: gcolor[i],
          animate: { duration: 1000, iterations: 1 }
          // animate: { duration: 2000, iterations: 1 },
        }
        break;
      }
    }
    if(clr == 1){
      pathOptions = {
        color:"purple",
        weight: 2,
        lineCap: "purple",
        animate: { duration: 1000, iterations: 1 }
        // animate: { duration: 2000, iterations: 1 },
      }
    }
    // let pathOptions: any = {
    //   color: 'red',
    //   weight: 2,
    //   lineCap: 'round',
    //   animate: { duration: 2000, iterations: 1 },
    // }
    let curvedPath = L.curve(
      [
        'M', latlng1,
        'Q', midpointLatLng,
        latlng2
      ], pathOptions).addTo(this.map);

    setTimeout(() => { this.removeLine(curvedPath); }, 2000);


  }

  removeLine(el: any) {
    el.removeFrom(this.map);
  }

  circleMark(lat: any, long: any, place: string, color: string) {
    const icon = L.divIcon({
      html: `<div class="ringring" style="border: 3px solid ${color};"></div><div class="circle" style="background-color:${color}"></div>`,
      className: 'ring-container'
    })

    const ll = L.latLng(lat, long)

    const marker = L.marker(ll, {
      icon: icon,
      title: place
    })

    marker.addTo(this.map)

    setTimeout(() => {
      marker.removeFrom(this.map);
    }, 2000);
  }
  endcircleMark(lat: any, long: any,src_country:any,color: string) {
    const icon = L.divIcon({
      html: `<div class="ringring" style="border: 3px solid ${color};"></div><div class="circle" style="background-color:${color}"></div><h2 class="fadeOut">${src_country}</h2>`,
      className: 'ring-container'
    })

    const ll = L.latLng(lat, long)

    const marker = L.marker(ll, {
      icon: icon,
      title: src_country
    })

    marker.addTo(this.map)

    setTimeout(() => {
      marker.removeFrom(this.map);
    }, 2000);
  }
  connectActiveMQ() {
    let host = environment.threatmapIP
    let port = environment.threatmapPort;// new port added for secure web socket connection - Rohan 14 June 2016
    //var port ='61614'; // enable this port and comment above port if site in not using HTTPS
    let token: any = this.cookServ.getToken();
    let newStr = token.replace(/-/g, "");
    let tokenId = newStr.slice(-7);
    let clientId = 'IN' + tokenId + Date.now();
    this.destination = 'NodeAttackData';
    this.client = new Messaging.Client(host, Number(port), clientId);
    this.client.onConnect = this.onConnect.bind(this);
    this.client.onMessageArrived = this.onMessageArrived.bind(this);
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    let options = {
      timeout: 3,
      useSSL: true,
      onSuccess: this.onConnect.bind(this),
      onFailure: this.onFailure.bind(this)
    };
    this.client.connect(options);
  }

  onConnect() {
    console.log("Secure Web Socket Connection Made with Server Successfully");
    this.client.subscribe(this.destination);
    //alert("Connection Made with Server Successfully");
  };

  onFailure(failure: any) {
    this.notiServ.showInfo("You might not see Real time attacks due to some issue!")
    this.getAssignNodes()
  }

  onMessageArrived(message: any) {

    let recievedPayload = message.payloadString;
    let payload = JSON.parse(recievedPayload);


    if (this.allNodes.includes(parseInt(payload.AttackData[0].node))) {
      if (this.nodeTemp != "ALL") {
        if (payload.AttackData[0].node == this.nodeTemp && payload.AttackData.length) {
          setTimeout(() => { this.addAnimatedLine(payload.AttackData[0], "#FF9966"); }, 0);
        }
      } else {
        if (payload.AttackData && payload.AttackData.length) {
          setTimeout(() => { this.addAnimatedLine(payload.AttackData[0], "#FF9966"); }, 0);
        }
      }
    }
  }

  onConnectionLost(responseObject: any) {
    console.log("Connection Lost with MQTT Broker");
    if (responseObject.errorCode !== 0) {
      // debug(client.clientId + ": " + responseObject.errorCode + "\n");
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }

  getAllNodes() {
     this.restServ.get(environment.getAllNodes, {}, {}).subscribe(res => {
      this.allNodes = res.map((e: any) => {
        return e.id;
      });
    })
  }
  
}
