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
import { CookiestorageService } from 'src/app/common/cookiestorage.service';
declare const Messaging: any;
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-threat-map',
  templateUrl: './threat-map.component.html',
  styleUrls: ['./threat-map.component.scss']
})

export class ThreatMapComponent {
  getAllNodesData!: Subscription

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
  displayedColumns: string[] =
    ['timpstamp',
      'src_country',
      'src_ip',
      'dest_ip',
      'src_port',
      'dest_port',
      'node_name',
      'att_type'];
  srcCountryFilter = new FormControl('');
  orgNameFilter = new FormControl('');
  ipFilter = new FormControl('');
  filterValues = {
    src_country: '',
    node_name: '',
    dest_ip: ''

  };
  private initMap(): void {
    this.map = L.map('threat-map', {
      center: [23.076090, 81.000],
      zoom: 3,
      attributionControl: false
    });

    let mapControls = L;
    mapControls.control.attribution({ prefix: false });
    const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + environment.openMapToken, {
      maxZoom: 18,
      // id: 'mapbox/traffic-night-v2',
      id: 'mapbox/satellite-streets-v11',
      tileSize: 512,
      minZoom: 3,
      zoomOffset: -1
    });
    tiles.addTo(this.map);
    this.mapService.addKashmirBorderLineToMap(this.map, '#000')
    let mapControl: any = L;
    var legend: any = mapControl.control({ position: 'bottomright' });
    legend.onAdd = (map: any) => {
      var div = L.DomUtil.create('div', 'info legend'),
        grades = ["Command Execution", "Bruteforce", "Binary Drop","Attack Log", "URL Redirection","Classified Malware","Unclassified Binary"],
        gcolor = ["#c30101","#ff8503","#feb204","#ffd22b","#e9d700","#f8ed62","#fff9ae"],
        labels = [];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:'+gcolor[i]+'"></i> ' +
          grades[i] + '<br>';
      }
      return div;
    };
    legend.addTo(this.map);
  }


  constructor(
    public mapService: MapserviceService,
    private restServ: RestService,
    private notiServ: NotificationService,
    private cookServ:CookiestorageService,
    private rightClickService: RightClickService

  ) {

    this.getAllNodes();
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
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
    // console.log("attackData",attackData)
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
    //   animate: { duration: 1000, iterations: 1 }
    //   // animate: { duration: 2000, iterations: 1 },
    // }
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

    if (this.attackData?.length > 0) {

      this.threatData = new MatTableDataSource(this.attackData)

      this.threatData.paginator = this.paginator;
      this.threatData.sort = this.sortdashThreat;
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

  circleMark(lat: any, long: any, place: string,color: string) {
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
    // let token: any = localStorage.getItem('Token');
    let token:any =this.cookServ.getToken();
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
  }

  onMessageArrived(message: any) {

    let recievedPayload = message.payloadString;
    let payload = JSON.parse(recievedPayload);


    if (this.allNodes.includes(parseInt(payload.AttackData[0].node))) {
      if (this.nodeTemp != "ALL") {
        if (payload.AttackData[0].node == this.nodeTemp && payload.AttackData.length) {
          setTimeout(() => { this.addAnimatedLine(payload.AttackData[0], " #87CEEB"); }, 0);
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
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      return data.src_country.toString().toLowerCase().indexOf(searchTerms.src_country.toLowerCase()) !== -1
        && data.node_name.toString().toLowerCase().indexOf(searchTerms.node_name.toLowerCase()) !== -1
        && data.dest_ip.toString().toLowerCase().indexOf(searchTerms.dest_ip.toLowerCase()) !== -1


    }
    return filterFunction;
  }

  getAllNodes() {
    this.getAllNodesData = this.restServ.get(environment.getAllNodes, {}, {}).subscribe(res => {
      this.allNodes = res.map((e: any) => {
        return e.id;
      });
    })
  }

  ngOnDestroy(): void {
    if (this.getAllNodesData) {
      this.getAllNodesData.unsubscribe();
    }

  }
}
