import { Component, ViewChild } from '@angular/core';
import * as L from 'leaflet'
import '@elfalem/leaflet-curve'
import { MapserviceService } from 'src/app/core/services/mapservice.service';
import { RestService } from 'src/app/core/services/rest.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/core/services/notification.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
declare const Messaging: any;

@Component({
  selector: 'app-threat-map',
  templateUrl: './threat-map.component.html',
  styleUrls: ['./threat-map.component.scss']
})

export class ThreatMapComponent {
  getAllNodesData! : Subscription

  private map: any;
  private client: any;
  private destination: any;
  public allNodes: any = [];
  private nodeTemp: string = 'ALL';
  threatData!: MatTableDataSource<any>;
  @ViewChild('sortdashThreat') sortdashThreat!: MatSort;
  attackData: any = [];
  assetPath = environment.assetPath;
  @ViewChild('paginator') paginator!: MatPaginator;
  displayedColumns: string[] = ['timpstamp', 'src_ip', 'src_country', 'dest_ip', 'src_port', 'dest_port', 'node_name', 'att_type'];
  srcCountryFilter =  new FormControl('');
  orgNameFilter = new FormControl('');
  ipFilter = new FormControl('');
  filterValues = {
    src_country: '',
    node_name:'',
    dest_ip:''
  
 };
  private initMap(): void {
    this.map = L.map('threat-map', {
      center: [23.076090, 81.000],
      zoom: 3,
      attributionControl: false
    });

    let mapControls = L;
    mapControls.control.attribution({ prefix: false });
    const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + environment.openMapToken , {
      maxZoom: 18,
      // id: 'mapbox/traffic-night-v2',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      minZoom: 3.5,
      zoomOffset: -1
    });
    tiles.addTo(this.map);
    this.mapService.addKashmirBorderLineToMap(this.map, '#000')
  }


  constructor(
    public mapService: MapserviceService,
    private restServ: RestService,
    private notiServ: NotificationService
  ) { 

    this.getAllNodes();
  }

  ngAfterViewInit(): void {
    this.connectActiveMQ();
    this.initMap();
    this.srcCountryFilter.valueChanges
    .subscribe(
      src_country => {        
        this.filterValues.src_country = src_country;
        this.threatData.filter = JSON.stringify(this.filterValues);
      }
    )
    this.orgNameFilter.valueChanges
    .subscribe(
      node_name => {        
        this.filterValues.node_name = node_name;
        this.threatData.filter = JSON.stringify(this.filterValues);
      }
    )
    this.ipFilter.valueChanges
    .subscribe(
      dest_ip => {        
        this.filterValues.dest_ip = dest_ip;
        this.threatData.filter = JSON.stringify(this.filterValues);
      }
    )
  }

  addAnimatedLine(attackData: any, color: string) {
    let latlngs = [];
    this.circleMark(attackData.node_lat, attackData.node_lng, attackData.node_name, "#FF9966");
    this.circleMark(attackData.lat, attackData.lng, attackData.node_name, "#FF9966");

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
    let pathOptions: any = {
      color: 'red',
      weight: 2,
      lineCap: 'round',
      animate: { duration: 2000, iterations: 1 },
    }
    let curvedPath = L.curve(
      [
        'M', latlng1,
        'Q', midpointLatLng,
        latlng2
      ], pathOptions).addTo(this.map);

    setTimeout(() => { this.removeLine(curvedPath); }, 2000);
    this.attackData.unshift(attackData);
    if (this.attackData.length > 100) {
      this.attackData = this.attackData.slice(0, 100);
    }

    if(this.attackData?.length > 0){

    this.threatData = new MatTableDataSource(this.attackData)
    
    this.threatData.paginator = this.paginator;
    this.threatData.sort = this.sortdashThreat ;
    this.threatData.filterPredicate = this.createFilter();
    this.threatData.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'timpstamp':
          return new Date(item.timpstamp).getTime()
        default:
          return item[property]
      }
    }
    }
  }

  removeLine(el: any) {
    el.removeFrom(this.map);
  }

  circleMark(lat: any, long: any, place: string, color: string) {
    const icon = L.divIcon({
      html: `<div class="ringring"></div><div class="circle"></div>`,
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

  connectActiveMQ() {
    let host = environment.threat_mapIP
    let port = environment.threat_mapPort;// new port added for secure web socket connection - Rohan 14 June 2016
    //var port ='61614'; // enable this port and comment above port if site in not using HTTPS
    let token: any = localStorage.getItem('Token');
    let newStr = token.replace(/-/g, "");
    let tokenId = newStr.slice(-7);
    let clientId = 'IN' + tokenId + Date.now();
    // console.log(clientId, '=================');
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
    // console.log(failure);
this.notiServ.showInfo("You might not see Real time attacks due to some issue!")
  }

  onMessageArrived(message: any) {
    
    let recievedPayload = message.payloadString;
    let payload = JSON.parse(recievedPayload);

    
    if(this.allNodes.includes(parseInt(payload.AttackData[0].node))){
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

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data:any, filter:any): boolean {
      let searchTerms = JSON.parse(filter);

        return data.src_country.toString().toLowerCase().indexOf(searchTerms.src_country) !== -1
      && data.node_name.toString().toLowerCase().indexOf(searchTerms.node_name) !== -1
        && data.dest_ip.toString().toLowerCase().indexOf(searchTerms.dest_ip) !== -1


    }
    return filterFunction;
  }

  getAllNodes(){
    this.getAllNodesData=this.restServ.get(environment.getAllNodes,{},{}).subscribe(res => {
      this.allNodes = res.map((e:any)=>{
        return e.id;
      });
    })
  }

  ngOnDestroy(): void{
    if(this.getAllNodesData){
    this.getAllNodesData.unsubscribe();
    }

  }
}
