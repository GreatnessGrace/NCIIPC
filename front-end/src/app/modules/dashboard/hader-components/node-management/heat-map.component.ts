import { Component } from '@angular/core';
import * as L from "leaflet";
import { HttpClient } from '@angular/common/http';
import { NodeManagementService } from 'src/app/core/services/node-management.service';
import { MapserviceService } from 'src/app/core/services/mapservice.service';
import * as moment from 'moment';
import { momentDateTimeFormat } from 'src/app/utils/global.constants';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { SharedService } from 'src/app/common/shared.service';
import { dateFilters } from 'src/app/utils/global.constants';
@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.scss']
})
export class HeatMapComponent {
  getEnvData!: Subscription
  getHPDetailsData!: Subscription
  getSecNodesData!: Subscription
  getHoneypotData!: Subscription
  getNodDetailData!: Subscription
  getSectorData!: Subscription
  getOrganisationData!: Subscription

  dataToSend: any;
  dateFilterArray = dateFilters;
  searchloader: boolean = false;
  map: any;
  geojson: any;
  lControls: any;
  geocodeService: any;
  chartMapData: any = []
  chartAllData: any = []
  chartType: any = [];
  assetPath = environment.assetPath;
  private fullMap: any;
  attackData: any = [];
  chipsForm: any = FormGroup;
  allRegionSelected: any;
  regionSelected: any;
  allSectorSelected = false;
  allOrganisationSelected = false;
  regions: any;
  sectors: any;
  organizations: any;
  finalSectorList: any[] = [];
  finalOrganizationList: any;
  dateFilter: any;
  minDate: any;
  maxDate: any = new Date;
  selectedResgion: any[] = [];
  showSector = false;
  showOrganization = false;
  showNodes = false;
  selectedSectorArr: any[] = [];
  selectedOrganizations: any[] = [];
  showDateFilter = false;
  isDisabled = false;
  nodesTotal: any = 0
  honeypotTotal: any = 0
  pieChartData: any = [false]
  chartsDiv: boolean = true
  gethoneypotDeviceType !: Subscription
  getDeployedCategory !: Subscription
  // getDeployedDeviceType !: Subscription

  constructor(
    public http: HttpClient,
    private nodeService: NodeManagementService,
    public mapService: MapserviceService,
    public fb: FormBuilder,
    private restServ: RestService,
    private sharedService: SharedService

  ) { this.initChipsForm(); }

  initChipsForm() {

    this.chipsForm = this.fb.group({
      // node: [, [Validators.required]],
      sector: ['', ],
      region: ['', [Validators.required]],
      organization: ['', [Validators.required]],
      // EndDate: ['', [Validators.required]],
      // StartDate: ['', [Validators.required]],
      // dateFilter: [1, [Validators.required]],
    });
  }
  ngOnInit() {
    this.getDevices();
    this.pieChartData = []
    let endDate = moment().valueOf();
    // if number of days changed then based upon that Data is updated
    let startDate = moment().subtract(7, 'days').valueOf();
    this.nodeService.getStateWiseAttackData(startDate, endDate).subscribe((data: any) => {
      if (data && data.data.length) {
        this.attackData = data.data;
        data.data.forEach((ele: any) => {
          this.circleMark(ele);
        });
      }
    });
    // this.getRegionWise()
    // this.getSectorWise()
    // this.getNodeHardware()
    // this.getNodeStatus()
    // this.getHoneypotHealth()
    // this.getDeployedHPCategory()
    // this.getHoneypotType()

    // this.getNodeDetails();
    // this.getHoneypotStatus();
    // this.getSectorNodes();
    // this.getHoneypot();

    this.getEnvData = forkJoin({
      // regions: this.restServ.get(environment.region, {}, {}),
      regions: this.restServ.get(environment.regionFilterData, {}, {}),
      // sectors: this.restServ.get(environment.getAllSectors, {}, {}),
      sectors: this.restServ.get(environment.sectorFilterData, {}, {}),
      // organisations: this.restServ.get(environment.getAllOrganization, {}, {}),
      organisations: this.restServ.get(environment.organizationFilterData, {}, {}),
    }).subscribe((data) => {
      this.allRegionSelected = true;
      this.allSectorSelected = true;
      this.allOrganisationSelected = true;
      this.sectors = data.sectors.data;
      this.regions = data.regions.data;
      this.organizations = data.organisations.data;
      this.finalSectorList = this.sectors;
      this.finalOrganizationList = this.organizations;

      this.chipsForm.patchValue({
        region: this.regions
      });
      this.chipsForm.patchValue({
        sector: this.sectors
      });
      this.chipsForm.patchValue({
        organization: this.organizations
      });
      this.submitbutton('any');
      this.getDate();
      // this.searchOperation();
    })

  }
  getDate() {
    this.dateFilter = 1
    let { startDate, endDate } = this.sharedService.getStartAndEndDate(this.dateFilter);
    this.minDate = startDate;
    this.maxDate = endDate;
  }
  ngAfterViewInit() {
    this.map = L.map("heat-map", {
      attributionControl: false
    }).setView([23.076090, 81.000], 5);
    L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" + environment.openMapToken, {
      id: 'mapbox/streets-v11',
      // id: 'mapbox/light-v11',
      maxZoom: 19,
      minZoom: 4,
      attribution: "SOS"
    }).addTo(this.map);
    let mapControl: any = L;
    var legend: any = mapControl.control({ position: 'bottomright' });
    legend.onAdd = (map: any) => {
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 250, 500, 1000, 2500, 5000, 10000],
        labels = [];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + this.getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };

    legend.addTo(this.map);
    this.map.whenReady(() => {
      this.mapService.addKashmirBorderLineToMap(this.map, 'grey');
    });
  }

  getColor(d: number) {
    return d > 10000 ? '#800026' :
      d > 5000 ? '#BD0026' :
        d > 2500 ? '#E31A1C' :
          d > 1000 ? '#FC4E2A' :
            d > 500 ? '#FD8D3C' :
              d > 250 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                  '#FFEDA0';
  }

  circleMark(ele: any, addTo = 'map') {
    let lat = ele?.dataValues?.lat;
    let long = ele?.dataValues?.lng;
    let nodeName = ele?.org?.buckets[0]?.key;
    let time = ele?.org?.buckets[0]?.time?.buckets[0].key_as_string;
    let mTime: any = moment(time).utcOffset(time);
    mTime = mTime.format(momentDateTimeFormat);
    const options = {
      radius: 15,
      stroke: true,
      weight: 0.7,
      color: this.getColor(ele.doc_count),
      fillOpacity: 0.25,
      className: 'shadow'
    }
    if (lat & long) {
      const marker = L.circleMarker([lat, long], options)
      marker.on('click', (e) => {
        var popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(`<div class="map-popup"><p>Node: ${nodeName}</p><p>Node ID: ${ele.key}</p><p>Number of attacks: ${ele?.doc_count}</p> <p>Time: ${mTime}</p></div>`)
          .openOn(this.map);
      });
      addTo == 'map' ? marker.addTo(this.map) : marker.addTo(this.fullMap);
    }
  }
  chartToggle(i: any, chartType: string) {
    this.chartType[i] = chartType;
  }

  getHoneypotStatus() {
    this.getHPDetailsData = this.restServ.post(environment.honeypotDetail, { data: this.dataToSend }, {}).subscribe(res => {
      let sumUp = 0
      let sumDown = 0
      for (let prop in res) {
        res[prop].health_status == 'UP' ? sumUp = sumUp + 1 : sumDown = sumDown + 1;
      }
      let dataSet: any = [];
      this.honeypotTotal = "Total Honeypots:" + (sumUp + sumDown)
      dataSet.push({ key: 'Up', doc_count: sumUp })
      dataSet.push({ key: 'Down', doc_count: sumDown });
      let newData: any = [];
      newData.data = dataSet
      newData.message = 'Honeypot Status';
      this.chartAllData.push(newData);
      this.fillAllChartsEmpty();
    })

  }

  getSectorNodes() {
    let url = environment.sectorNodes
    this.getSecNodesData = this.restServ.post(url, { 'field': 'organization_sector.keyword', data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.data && res.data.length) {
        chartDisplayData = res.data.map((x: any) => {
          return { key: x.key, doc_count: x.nodes.value }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Sector Wise Nodes Deployment';
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getHoneypot() {
    let url = environment.sectorNodes
    this.getHoneypotData = this.restServ.post(url, { 'field': 'honeypot.keyword', data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.data && res.data.length) {
        chartDisplayData = res.data.map((x: any) => {
          return { key: x.key, doc_count: x.nodes.value }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Honeypot Wise Nodes Deployment';
      console.log("1--",dataToRender)
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  // Pie  Charts :
  getRegionWise() {
    let url = environment.deployedNodeRegionWise;
  
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
  
      if (res && res.length) {
        chartDisplayData = res.map((item: any) => {
          return { key: item.region, doc_count: item.node_count };
        });
      }
  
      let dataToRender: any = {
        data: chartDisplayData,
        message: 'Region Wise Nodes Deployment'
      };
  // console.log(dataToRender)
      this.chartMapData.push(dataToRender);
      this.fillAllChartsEmpty();
    });
  }
  


  getSectorWise() {
    let url = environment.deployedNodeSectorWise
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.sector, doc_count: x.node_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Sector Wise Nodes Deployment';
      this.chartMapData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getHoneypotType() {
    let url = environment.deployedHoneypotType
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.node_sensor_hp_type, doc_count: x.node_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Deployed Honeypot Type';
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getNodeHardware() {
    let url = environment.deployedNodeHardware
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.node_hardware, doc_count: x.node_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Hardware Wise Nodes Deployment';
      this.chartMapData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getNodeStatus() {
    let url = environment.deployedNodeStatus
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.node_status, doc_count: x.node_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Deployed Nodes Status';
      this.chartMapData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getHoneypotHealth() {
    let url = environment.deployedHoneypotStatus
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.health_status, doc_count: x.honeypot_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Deployed Honeypot Health';
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  getDeployedHPCategory() {
    let url = environment.deployedHoneypotCategory
    this.getHoneypotData = this.restServ.post(url, {  data: this.dataToSend }, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.extracted_value, doc_count: x.honeypot_count }
        });
      }

      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Deployed Honeypot Category';
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

////

  fillAllChartsEmpty() {
    for (var i = 0; i < this.chartAllData.length; i++) {
      if (this.chartAllData[i].message == "Deployed Honeypot Health" ) {
        this.chartType[i] = 'bar'
      }
      else {
        this.chartType[i] = 'pie'
      }

    }
    for (var i = 0; i < this.chartMapData.length; i++) {
      if (this.chartMapData[i].message == "Deployed Nodes Status") {
        this.chartType[i] = 'bar'
      }
      else {
        this.chartType[i] = 'pie'
      }

    } 
  }

  getNodeDetails() {
    this.getNodDetailData = this.restServ.post(environment.nodeDetail, { data: this.dataToSend }, {}).subscribe(res => {
      let sumUp = 0
      let sumDown = 0
      for (let prop in res) {
        res[prop].node_status == 'UP' ? sumUp = sumUp + 1 : sumDown = sumDown + 1
      }
      let dataSet: any = [];
      dataSet.push({ key: 'Up', doc_count: sumUp })
      dataSet.push({ key: 'Down', doc_count: sumDown })
      this.nodesTotal = "Total Nodes: " + (sumUp + sumDown)
      let dataToRender: any = [];
      dataToRender.data = dataSet;
      dataToRender.message = 'Node Status';
      console.log("Data to render" ,dataToRender)
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

  invalidateSize() {
    if (this.fullMap) {
      this.fullMap.remove();
    }
    setTimeout(() => {
      this.initFullMap();
    }, 300);
  }

  initFullMap() {
    this.fullMap = L.map('map-full', {
      // center: [28.644800, 77.216721],
      center: [23.076090, 81.000],
      zoom: 5,
      attributionControl: false
    });

    L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" + environment.openMapToken, {
      id: 'mapbox/streets-v11',
      maxZoom: 19,
      minZoom: 4,
      attribution: "SOS"
    }).addTo(this.fullMap);
    let mapControl: any = L;
    var legend: any = mapControl.control({ position: 'bottomright' });
    legend.onAdd = (map: any) => {
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 250, 500, 1000, 2500, 5000, 10000],
        labels = [];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + this.getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };

    legend.addTo(this.fullMap);
    this.fullMap.whenReady(() => {
      this.mapService.addKashmirBorderLineToMap(this.fullMap, 'grey');
      if (this.attackData && this.attackData.length) {
        this.attackData.forEach((ele: any) => {
          this.circleMark(ele, 'full-map');
        });
      }
    });
  }

  toggleAllSelection(type: string) {

    switch (type) {
      case 'region': {
        if (this.allRegionSelected) {
          this.chipsForm.patchValue({
            region: this.regions,
            sector: '',
            organization: ''
          });
          this.selectedRegions();
        } else {
          this.chipsForm.patchValue({
            region: []
          });
          this.finalSectorList = [];
          this.finalOrganizationList = [];
          this.allSectorSelected = false;
          this.allOrganisationSelected = false;
        }
      }
        break;
      case 'sector': {
        if (this.allSectorSelected) {
          this.chipsForm.patchValue({
            sector: this.finalSectorList,
            organization: ''
          });
          this.selectedSector();
        } else {
          this.chipsForm.patchValue({
            sector: []
          });
          this.finalOrganizationList = [];
          this.allOrganisationSelected = false;
        }
      }
        break;
      case 'organization': {
        if (this.allOrganisationSelected) {
          this.chipsForm.patchValue({
            organization: this.finalOrganizationList
          });
          this.selectedOrganization();
        } else {
          this.chipsForm.patchValue({
            organization: []
          });
        }
      }

    }
  }

  selectedRegions() {
    this.selectedResgion = []
    if (this.chipsForm.value && this.chipsForm.value.region) {
      this.selectedResgion = this.chipsForm.value.region.map((x: any) => {
        return { region: x.key, status: true }
      });
    }
    this.chipsForm.patchValue({
      sector: '',
      organization: ''
    })

    if (this.selectedResgion.length != 0) {
      // this.getSector(this.selectedResgion)
      this.getOrganization({region: this.selectedResgion})
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
    if (this.chipsForm.value && this.chipsForm.value.sector) {
      this.selectedSectorArr = this.chipsForm.value.sector.map((x: any) => {
        return { sector: x.key, status: true }
      });
    }
    let region_sector = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr
    }
    this.chipsForm.patchValue({
      organization: ''
    })
    if (this.selectedSectorArr.length != 0) {
      this.getOrganization(region_sector)
    } else {
      this.finalOrganizationList = []

    }
  }

  getOrganization(sector: any) {
    let url = environment.getOrganization
    this.getOrganisationData = this.restServ.post(url, sector, {}).subscribe(res => {
      this.finalOrganizationList = res.data
      this.showOrganization = true;
    })
  }

  selectedOrganization() {
    this.selectedOrganizations = [];
    if (this.chipsForm.value && this.chipsForm.value.organization) {
      this.selectedOrganizations = this.chipsForm.value.organization.map((x: any) => {
        return { organization: x.organization, status: true }
      });
    }

    let region_sector_organization = {
      region: this.selectedResgion,
      sector: this.selectedSectorArr,
      organization: this.selectedOrganizations
    }

  }
  dateRange(minDate: any, maxDate: any) {
    let { startDate, endDate } = this.sharedService.formatMinMaxDate(minDate, maxDate);
    this.minDate = startDate;
    this.maxDate = endDate;

  }
  onDateFilterChange(e: any) {

    if (e.value == 5) {
      this.showDateFilter = true;
    }
    this.dateFilter = e.value;
    let { startDate, endDate } = this.sharedService.getStartAndEndDate(this.dateFilter);
    this.minDate = startDate;
    this.maxDate = endDate;
  }
  submitbutton(evt: any) {
    // this.isDisabled = true;
    // let chartDisplayData = []
    this.chartAllData = []
    this.chartMapData = []
    this.dataToSend = {
      region: this.chipsForm.value.region.map((e: { key: any; }) => {
        return e.key
      }),
      // sector: this.chipsForm.value.sector.map((e: { key: any; }) => {
      //   return e.key
      // }),
      organizations: this.chipsForm.value.organization.map((e: { key: any; }) => {
        return e.key
      })
    }
    // this.getNodeDetails();
    // this.getHoneypotStatus();
    // this.getSectorNodes();
    // this.getHoneypot();
    // this.deployedDevices();

this.getRegionWise()
this.getSectorWise()
this.getNodeHardware()
this.getNodeStatus()
this.getHoneypotHealth()
this.getDeployedHPCategory()
this.getHoneypotType()
  }
  ngOnDestroy(): void {
    if (this.getEnvData) {
      this.getEnvData.unsubscribe();
    }
    if (this.getHPDetailsData) {
      this.getHPDetailsData.unsubscribe();
    }
    if (this.getSecNodesData) {
      this.getSecNodesData.unsubscribe();
    }
    if (this.getHoneypotData) {
      this.getHoneypotData.unsubscribe();
    }
    if (this.getNodDetailData) {
      this.getNodDetailData.unsubscribe();
    }
    if (this.getSectorData) {
      this.getSectorData.unsubscribe();
    }
    if (this.getOrganisationData) {
      this.getOrganisationData.unsubscribe();
    }
  }


  getDevices() {
    let url = environment.deployedHoneyotDeviceType;
    this.gethoneypotDeviceType = this.restServ.post(url, {}, {}).subscribe(response => {
      if (response?.MQTTBroker?.[0]?.device_count > 0 || response?.database?.[0]?.device_count > 0 || response?.server?.[0]?.device_count > 0 || response?.Printer?.[0]?.device_count > 0 || response?.plc?.[0]?.device_count > 0 || response?.Router?.[0]?.device_count > 0 || response?.IPCamera?.[0]?.device_count > 0) {
        const transformedData: any[] = [];
        Object.keys(response).forEach(category => {
          const categoryData = response[category];
          const categoryEntry: any = {
            category: category,
            value: 0,
            subData: []
          };

          categoryData.forEach((item: { device_name: string, device_count: number }) => {
            categoryEntry.value += item.device_count;
            categoryEntry.subData.push({
              category: item.device_name,
              value: item.device_count
            });
          });


          transformedData.push(categoryEntry);
        });


        let resProf = {
          data: transformedData, message: 'Honeypot Devices'
        }
        this.pieChartData.push(resProf)
      }
      else {
        let resProf = {
          data: [],
          message: 'Honeypot Devices'
        }
        this.pieChartData.push(resProf)
      }
    });
  }

  deployedDevices() {
    let url = environment.deployedHoneypotCategory
    this.getDeployedCategory = this.restServ.post(url, {}, {}).subscribe(res => {
      let chartDisplayData = [];
      if (res && res.length) {
        chartDisplayData = res.map((x: any) => {
          return { key: x.honeypot_category, doc_count: x.category_count }
        });
      }
      let dataToRender: any = [];
      dataToRender.data = chartDisplayData;
      dataToRender.message = 'Deployed Honeypots';
      this.chartAllData.push(dataToRender);
      this.fillAllChartsEmpty();
    })
  }

}