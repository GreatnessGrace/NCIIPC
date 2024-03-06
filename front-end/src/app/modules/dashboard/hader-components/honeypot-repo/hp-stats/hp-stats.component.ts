import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { ThreatJsonDataComponent } from 'src/app/modules/share/threat-json-data/threat-json-data.component';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDataComponent } from 'src/app/modules/share/profile-data/profile-data.component';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-hp-stats',
  templateUrl: './hp-stats.component.html',
  styleUrls: ['./hp-stats.component.scss']
})
export class HpStatsComponent implements OnInit {

  selectedProfile: string | null = null;
  node_hardwares: any;

  // Implement this function to get additional data based on the selected profile
  getAdditionalData(profile: string): string {
    console.log("Profile",profile)
    // Logic to retrieve additional data goes here
    return `Additional data for ${profile}`;
  }


  getSnapTotal !: Subscription
  profileImages !: Subscription
  getProfilesTotal !: Subscription
  getIotProfiles !: Subscription
  getVulTotal !: Subscription
  getVulDetail !: Subscription
  getDoubleVulTotal !: Subscription
  getProfilesImages !: Subscription
  getDoubleProtocols !: Subscription
  gettotalVulnerabilities !: Subscription
  getTotalHoneypots !: Subscription
  getprotocolTable !: Subscription
  getImageTable !: Subscription
  getDeviceTable !: Subscription
  gethoneypotDeviceType !: Subscription
  disableClick: boolean = false;
  uniqueDeviceTypes : any
  totalDeviceType: any
  totalDeviceName: any
  uniqueDeviceName: any
  uniqueImg: any
  totalImg: any
  uniqueHp: any
  totalIot: any
  uniqueIot: any
  totalHp: any
  totalWeb: any
  totalScada: any
  totalVul: any
  totalHiHp: any
  uniqueHiHp: any
  totalProtocols: any
  totalPorts: any
  chartAllData: any = [false]
  vulChartData: any = [false]
  profilesChartData: any = [false]
  protocolsChartData: any = [false]
  chartType: any = [];
  chartsDiv: boolean = false
  timegraph: boolean = false
  tableDiv: boolean = true
  chartsDivv: boolean = true
  honeypotDiv: boolean = true
  protocolsDiv: boolean = true
  Div: boolean = true
  imageDiv: boolean = true
  assetPath = environment.assetPath;
  pieChartData: any = [false]
  doublePieChartData: any = [false]
  showDoubleDevicesData: boolean = false;
  doubleDiv: boolean = true

  dataSource!: MatTableDataSource<any>;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('profileSort') profileSort!: MatSort;

  dataSourceVul!: MatTableDataSource<any>;
  @ViewChild('paginatorVul') paginatorVul!: MatPaginator;
  @ViewChild('VulSort') VulSort!: MatSort;

  dataSourceTotalVul!: MatTableDataSource<any>;
  @ViewChild('totalPaginator') totalPaginator!: MatPaginator;
  @ViewChild('totalVulSort') totalVulSort!: MatSort;

  dataSourceProtocols!: MatTableDataSource<any>;
  @ViewChild('protocolsPaginator') protocolsPaginator!: MatPaginator;
  @ViewChild('protocolsSort') protocolsSort!: MatSort;

  dataSourceImages!: MatTableDataSource<any>;
  @ViewChild('imagesPaginator') imagesPaginator!: MatPaginator;
  @ViewChild('imagesSort') imagesSort!: MatSort;

  dataSourceDeviceChips!: MatTableDataSource<any>;
  @ViewChild('devicePaginator') devicePaginator!: MatPaginator;
  @ViewChild('deviceSort') deviceSort!: MatSort;

  dataSourceHoenypots!: MatTableDataSource<any>;
  @ViewChild('honeypotPaginator') honeypotPaginator!: MatPaginator;
  @ViewChild('honeypotSort') honeypotSort!: MatSort;

  displayedColumns = [
    'id',
    // 'snapshot_name',
    // 'node_id',
    'device_type',
    'device_name',
    // 'image_name',
    // 'image_tag',
    // 'vm_name',

  ]

  displayedColumnsVul = [
    'id',
    'vulnerability',
    'vulnerability_description',
    'package_name',
    'port',
    'package_version',
    'vm_name',

  ]

  displayedColumnsTotalVul = [
    'id',
    // 'snapshot_name',
    // 'honeypot_category',
    // 'vulnerability_id',
    'vulnerability',
    'vulnerability_description',
    // 'profile_names'
  ]

  displayedColumnsHoenypots = [
    'id',
    'snapshot_name',
    'honeypot_type',
    'honeypot_category',
    'device_type',
    'device_name',
    'image_name',
    'image_tag',
    'vm_name'
  ]

  displayedColumnsImages = [
    'id',
    'os_name',
    'os_type',
    'image_name',
    'image_tag',
    'vm_name',
    'vm_type',
    'node_hardware',
    'hp_profiles'
  ]

  displayedColumnsProtocols = [
    'id',
    // 'honeypot_name',
    // 'honeypot_category',
    // 'device_type',
    // 'device_name',
    'package_name',
    'port'
  ]

  displayedColumnsDeviceChips = [
    'id',
    'device_type'
  ]

  // totalHoneypotFilter
  snapshotFilter = new FormControl('');
  vmFilter = new FormControl('');
  deviceNameFilter = new FormControl('');
  deviceTypeFilter = new FormControl('');
  typeFilter = new FormControl('');
  categoryFilter = new FormControl('');
  imageFilter = new FormControl('');
  imageTaggFilter = new FormControl('');


  // ProtocolFilter
  protocolFilter = new FormControl('');
  honeypotCategoryFilter = new FormControl('');
  portFilter = new FormControl('');
  deviceFilter = new FormControl('');
  devTypeFilter = new FormControl('');
  honeypotNameFilter = new FormControl('');

  // totalVulFilter
  idFilter = new FormControl('');
  VulnerabilityFilter = new FormControl('');
  snapshotNameFilter = new FormControl('');
  vulHoneypotCategoryFilter = new FormControl('');

  // individualProfileFilter
  deviceNameFilt = new FormControl('');
  deviceTypeFilt = new FormControl('');
  imageNameFilt = new FormControl('');
  imageTagFilt = new FormControl('');
  dockerImageIdFilt = new FormControl('');
  honeypotNameFilt = new FormControl('');

  // vulnerabilityFilter 
  vulFilt = new FormControl('');
  packageNameFilt = new FormControl('');
  portFilt = new FormControl('');
  packageVersionFilt = new FormControl('');
  imageIdFilt = new FormControl('');

  //ImageTableFilter 
  iOsFilter = new FormControl('');
  iVmFilter = new FormControl('');
  iOsTFilter = new FormControl('');
  iVmTFilter = new FormControl('');
  iImFilter = new FormControl('');
  iImTFilter = new FormControl('');
  iNhFilter = new FormControl('');

  // Device Filters
  deviceTypeCFilter = new FormControl('');
  deviceNameCFilter = new FormControl('');

  filterValues = {
    snapshot_name: '',
    vm_name: '',
    device_name: '',
    device_type: '',
    honeypot_type: '',
    honeypot_category: '',
    image_name: '',
    honeypot_name: '',
    package_name: '',
    vulnerability_id: '',
    vulnerability: '',
    image_tag: '',
    port: '',
    package_version: '',

    os_name: '',
    os_type: '',
    vm_type: '',
    node_hardware: ''
  };
  uniqueWeb: any;
  uniqueScada: any;
  uniqueVul: any;
  uniqueProtocols: any;
  constructor(private restServ: RestService, public dialog: MatDialog, private rightClickService: RightClickService) { }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit(): void {
    
    let url = environment.snapCount
    this.getSnapTotal = this.restServ.get(url, {}, {}).subscribe(res => {
      this.totalIot = res.totalIotCount[0].totalCount
      this.uniqueIot = res.totalIotCount[0].distinctCount
      this.totalWeb = res.totalWebCount[0].totalCount
      this.uniqueWeb = res.totalWebCount[0].distinctCount
      this.totalScada = res.totalScadaCount[0].totalCount
      this.uniqueScada = res.totalScadaCount[0].distinctCount
      this.totalVul = res.totalVulCount[0].totalCount
      this.uniqueVul = res.totalVulCount[0].distinctCount
      this.uniqueHp = res.totalHpCount[0].distinctCount
      this.totalHp = res.totalHpCount[0].totalCount
      this.totalHiHp = res.totalHiHpCount[0].totalCount
      this.uniqueHiHp = res.totalHiHpCount[0].distinctCount
      this.totalProtocols = res.totalProtocolsCount[0].totalCount
      this.uniqueProtocols = res.totalProtocolsCount[0].distinctCount

      this.totalImg = res.totalImagesCount[0].totalCount
      this.uniqueImg = res.totalImagesCount[0].distinctCount
      this.totalDeviceName = res.totalDeviceNamesCount[0].totalCount
      this.uniqueDeviceName = res.totalDeviceNamesCount[0].distinctCount
      this.totalDeviceType = res.totalDeviceTypesCount[0].totalCount
      this.uniqueDeviceTypes = res.totalDeviceTypesCount[0].distinctCount
      // this.totalPorts = res.totalPortsCount[0].totalPortsCount

    })
    this.chartAllData = []
    this.vulChartData = []
    this.pieChartData = []
    this.protocolsChartData = []
    this.getProfiles()
    this.getDevicesCount()
    // this.getVul()
    this.getDoubleVul()
    this.getProtocols()
    this.getDevices()

    // honeypotFiltering
    this.snapshotFilter.valueChanges
      .subscribe(
        snapshot_name => {
          this.filterValues.snapshot_name = snapshot_name;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.vmFilter.valueChanges
      .subscribe(
        vm_name => {
          this.filterValues.vm_name = vm_name;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.deviceNameFilter.valueChanges
      .subscribe(
        device_name => {
          this.filterValues.device_name = device_name;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.deviceTypeFilter.valueChanges
      .subscribe(
        device_type => {
          this.filterValues.device_type = device_type;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )

    this.typeFilter.valueChanges
      .subscribe(
        honeypot_type => {
          this.filterValues.honeypot_type = honeypot_type;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.categoryFilter.valueChanges
      .subscribe(
        honeypot_category => {
          this.filterValues.honeypot_category = honeypot_category;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.imageFilter.valueChanges
      .subscribe(
        image_name => {
          this.filterValues.image_name = image_name;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    this.imageTaggFilter.valueChanges
      .subscribe(
        image_tag => {
          this.filterValues.image_tag = image_tag;
          this.dataSourceHoenypots.filter = JSON.stringify(this.filterValues);

        }
      )
    // ProtocolTableFiltering :
    // this.honeypotNameFilter.valueChanges
    //   .subscribe(
    //     honeypot_name => {
    //       this.filterValues.honeypot_name = honeypot_name;
    //       this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
    //     }
    //   )
    // this.honeypotCategoryFilter.valueChanges
    //   .subscribe(
    //     honeypot_category => {
    //       this.filterValues.honeypot_category = honeypot_category;
    //       this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
    //     }
    //   )
    // this.deviceFilter.valueChanges
    //   .subscribe(
    //     device_name => {
    //       this.filterValues.device_name = device_name;
    //       this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
    //     }
    //   )
    // this.devTypeFilter.valueChanges
    //   .subscribe(
    //     device_type => {
    //       this.filterValues.device_type = device_type;
    //       this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
    //     }
    //   )
    this.protocolFilter.valueChanges
      .subscribe(
        package_name => {
          this.filterValues.package_name = package_name;
          this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
        }
      )
    this.portFilter.valueChanges
      .subscribe(
        port => {
          this.filterValues.port = port;
          this.dataSourceProtocols.filter = JSON.stringify(this.filterValues);
        }
      )

    // totalVulnerabilityFilter
    this.idFilter.valueChanges
      .subscribe(
        vulnerability_id => {
          this.filterValues.vulnerability_id = vulnerability_id;
          this.dataSourceTotalVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.VulnerabilityFilter.valueChanges
      .subscribe(
        vulnerability => {
          this.filterValues.vulnerability = vulnerability;
          this.dataSourceTotalVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.snapshotNameFilter.valueChanges
      .subscribe(
        snapshot_name => {
          this.filterValues.snapshot_name = snapshot_name;
          this.dataSourceTotalVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.vulHoneypotCategoryFilter.valueChanges
      .subscribe(
        honeypot_category => {
          this.filterValues.honeypot_category = honeypot_category;
          this.dataSourceTotalVul.filter = JSON.stringify(this.filterValues);
        }
      )

    // individualProfileFiltering
    this.deviceNameFilt.valueChanges
      .subscribe(
        device_name => {
          this.filterValues.device_name = device_name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.deviceTypeFilt.valueChanges
      .subscribe(
        device_type => {
          this.filterValues.device_type = device_type;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.imageNameFilt.valueChanges
      .subscribe(
        image_name => {
          this.filterValues.image_name = image_name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.imageTagFilt.valueChanges
      .subscribe(
        image_tag => {
          this.filterValues.image_tag = image_tag;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.dockerImageIdFilt.valueChanges
      .subscribe(
        vm_name => {
          this.filterValues.vm_name = vm_name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.honeypotNameFilt.valueChanges
      .subscribe(
        snapshot_name => {
          this.filterValues.snapshot_name = snapshot_name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )


    // VulnerabilityFilter
    this.vulFilt.valueChanges
      .subscribe(
        vulnerability => {
          this.filterValues.vulnerability = vulnerability;
          this.dataSourceVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.packageNameFilt.valueChanges
      .subscribe(
        package_name => {
          this.filterValues.package_name = package_name;
          this.dataSourceVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.portFilt.valueChanges
      .subscribe(
        port => {
          this.filterValues.port = port;
          this.dataSourceVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.packageVersionFilt.valueChanges
      .subscribe(
        package_version => {
          this.filterValues.package_version = package_version;
          this.dataSourceVul.filter = JSON.stringify(this.filterValues);
        }
      )
    this.imageIdFilt.valueChanges
      .subscribe(
        vm_name => {
          this.filterValues.vm_name = vm_name;
          this.dataSourceVul.filter = JSON.stringify(this.filterValues);
        }
      )
      // Image Table Filtering
    this.iOsFilter.valueChanges
      .subscribe(
        os_name => {
          this.filterValues.os_name = os_name;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iVmFilter.valueChanges
      .subscribe(
        vm_name => {
          this.filterValues.vm_name = vm_name;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iOsTFilter.valueChanges
      .subscribe(
        os_type => {
          this.filterValues.os_type = os_type;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iVmTFilter.valueChanges
      .subscribe(
        vm_type => {
          this.filterValues.vm_type = vm_type;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iImFilter.valueChanges
      .subscribe(
        image_name => {
          this.filterValues.image_name = image_name;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iImTFilter.valueChanges
      .subscribe(
        image_tag => {
          this.filterValues.image_tag = image_tag;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )
    this.iNhFilter.valueChanges
      .subscribe(
        node_hardware => {
          this.filterValues.node_hardware = node_hardware;
          this.dataSourceImages.filter = JSON.stringify(this.filterValues);
        }
      )

      // Device Filtering
    this.deviceTypeCFilter.valueChanges
      .subscribe(
        device_type => {
          this.filterValues.device_type = device_type;
          this.dataSourceDeviceChips.filter = JSON.stringify(this.filterValues);
        }
      )
    this.deviceNameCFilter.valueChanges
      .subscribe(
        device_name => {
          this.filterValues.device_name = device_name;
          this.dataSourceDeviceChips.filter = JSON.stringify(this.filterValues);
        }
      )


  }

  // getProfiles() {
  //   let url = environment.profileCount
  //   this.getProfilesTotal = this.restServ.get(url, {}, {}).subscribe(res => {
  //     if (res.totalIotCount[0].unique_profile_count > 0 || res.totalWebCount[0].unique_profile_count > 0 || res.totalWebCount[0].unique_profile_count > 0) {
  //       let resProf = {
  //         data: [{ 'key': 'IoT', doc_count: res.totalIotCount[0].unique_profile_count }, { 'key': 'WEB', doc_count: res.totalWebCount[0].unique_profile_count }, { 'key': 'SCADA', doc_count: res.totalScadaCount[0].unique_profile_count }], message: 'Honeypot Profiles'
  //       }
  //       this.chartAllData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Honeypot Profiles'
  //       }
  //       this.chartAllData.push(resProf)
  //     }

  //     this.fillAllChartsEmpty();
  //   })
  // }

getProfiles() {
  let url = environment.profileCount;

  this.getProfilesTotal = this.restServ.get(url, {}, {}).subscribe(res => {
    if (res && res.length > 0) {
      let chartData: { key: any; doc_count: any; }[] = [];

      res.forEach((category: { honeypot_category: any; unique_profile_count: any; }) => {
        let categoryData = {
          'key': category.honeypot_category,
          'doc_count': category.unique_profile_count
        };

        chartData.push(categoryData);
      });

      if (chartData.length > 0) {
        let resProf = {
          data: chartData,
          message: 'Honeypot Profiles'
        };
        this.chartAllData.push(resProf);
      } else {
        let resProf = {
          data: [],
          message: 'Honeypot Profiles'
        };
        this.chartAllData.push(resProf);
      }
    } else {
      let resProf = {
        data: [],
        message: 'Honeypot Profiles'
      };
      this.chartAllData.push(resProf);
    }

    this.fillAllChartsEmpty();
  });
}


getDevicesCount() {
  let url = environment.pieDevices;

  this.getProfilesTotal = this.restServ.get(url, {}, {}).subscribe(res => {
    if (res && res.length > 0) {
      const chartData: { key: any; doc_count: any; }[] = [];

      const categoryCounts = new Map();

      res.forEach((item: { honeypot_category: any; doc_count: any; }) => {
        const category = item.honeypot_category;

        if (categoryCounts.has(category)) {
          categoryCounts.set(category, categoryCounts.get(category) + item.doc_count);
        } else {
          categoryCounts.set(category, item.doc_count);
        }
      });

      categoryCounts.forEach((doc_count, key) => {
        chartData.push({ 'key': key, 'doc_count': doc_count });
      });

      if (chartData.length > 0) {
        let resProf = {
          data: chartData,
          message: 'Honeypot Devices'
        };
        this.chartAllData.push(resProf);
      } else {
        let resProf = {
          data: [],
          message: 'Honeypot Devices'
        };
        this.chartAllData.push(resProf);
      }
    } else {
      let resProf = {
        data: [],
        message: 'Honeypot Devices'
      };
      this.chartAllData.push(resProf);
    }

    this.fillAllChartsEmpty();
  });
}


  // getDevicesCount() {
  //   let url = environment.devices;

  //   this.getProfilesTotal = this.restServ.get(url, {}, {}).subscribe(res => {
  //     if (res.IoT && res.IoT.length > 0 || res.WEB && res.WEB.length > 0 || res.SCADA && res.SCADA.length > 0) {

  //       const totalIoTCount = res.IoT ? res.IoT.reduce((total: any, item: { doc_count: any; }) => total + item.doc_count, 0) : 0;
  //       const totalWebCount = res.WEB ? res.WEB.reduce((total: any, item: { doc_count: any; }) => total + item.doc_count, 0) : 0;
  //       const totalSCADACount = res.SCADA ? res.SCADA.reduce((total: any, item: { doc_count: any; }) => total + item.doc_count, 0) : 0;

  //       let resProf = {
  //         data: [
  //           { 'key': 'IoT', doc_count: totalIoTCount },
  //           { 'key': 'WEB', doc_count: totalWebCount },
  //           { 'key': 'SCADA', doc_count: totalSCADACount }
  //         ],
  //         message: 'Honeypot Devices'
  //       };
  //       this.chartAllData.push(resProf);
  //     } else {
  //       let resProf = {
  //         data: [],
  //         message: 'Honeypot Devices'
  //       };
  //       this.chartAllData.push(resProf);
  //     }

  //     this.fillAllChartsEmpty();
  //   });
  // }
  // getDevicesCount() {
  //   let url = environment.devices
  //   this.getProfilesTotal = this.restServ.get(url, {}, {}).subscribe(res => {
  //     if (res.IoT[0].doc_count > 0 || res.WEB[0].doc_count > 0 || res.SCADA[0].doc_count > 0) {
  //       let resProf = {
  //         data: [{ 'key': 'IoT', doc_count: res.IoT[0].doc_count }, { 'key': 'WEB', doc_count: res.WEB[0].doc_count }, { 'key': 'SCADA', doc_count: res.SCADA[0].doc_count }], message: 'Honeypot Devices'
  //       }
  //       this.chartAllData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Honeypot Devices'
  //       }
  //       this.chartAllData.push(resProf)
  //     }

  //     this.fillAllChartsEmpty();
  //   })
  // }

  

  getVul() {
    let url = environment.vulnerabilityCount
    this.getVulTotal = this.restServ.get(url, {}, {}).subscribe(res => {
      if (res.totalIotCount[0].doc_count > 0 || res.totalWebCount[0].doc_count > 0 || res.totalWebCount[0].doc_count > 0) {
        let resProf = {
          data: [{ 'key': 'IoT', doc_count: res.totalIotCount[0].doc_count }, { 'key': 'WEB', doc_count: res.totalWebCount[0].doc_count }, { 'key': 'SCADA', doc_count: res.totalScadaCount[0].doc_count }], message: 'Top 10 Honeypot Vulnerabilities'
        }
        this.chartAllData.push(resProf)
      }
      else {
        let resProf = {
          data: [],
          message: 'Top 10 Honeypot Vulnerabilities'
        }
        this.chartAllData.push(resProf)
      }
      this.fillAllChartsEmpty();
    })
  }

  getDoubleProfile(cat: any) {
    let url = environment.doubleProfilesDevices;
    this.getDoubleVulTotal = this.restServ.post(url, { cat: cat }, {}).subscribe(response => {
      this.profilesChartData=[];
      if (response && response.length > 0) {
        const transformedData: any[] = [];
  
        const categoryMap = new Map();
  
        response.forEach((item: { device_name: any; device_count: any; device_type: any; }) => {
          const category = item.device_type;
  
          if (categoryMap.has(category)) {
            const existingEntry = categoryMap.get(category);
            existingEntry.value = (existingEntry.value || 0) + (item.device_count || 0);
            existingEntry.subData.push({
              category: item.device_name,
              value: item.device_count || 0
            });
          } else {
            categoryMap.set(category, {
              category: category,
              value: item.device_count || 0,
              subData: [{ category: item.device_name, value: item.device_count || 0 }]
            });
          }
        });
  /////
  categoryMap.forEach(entry => {
    transformedData.push(entry);
  })
        // categoryMap.forEach((entry, deviceType) => {
        //   transformedData.push({
        //     category: deviceType,
        //     subcategories: entry.subData
        //   });
        // });
  
        // console.log(transformedData);
  
        if (transformedData.length > 0) {
          let resProf = {
            data: transformedData,
            message: 'Top 10 Honeypot Devices'
          };
          this.profilesChartData.push(resProf);
        } else {
          let resProf = {
            data: [],
            message: 'Top 10 Honeypot Devices'
          };
          this.profilesChartData.push(resProf);
        }
      } else {
        let resProf = {
          data: [],
          message: 'Top 10 Honeypot Devices'
        };
        this.profilesChartData.push(resProf);
      }
    });
  }
  
  
  
  
  // getDoubleVul() {
  //   let url = environment.doubleVulnerabilities;
  //   this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
  //     if (response.IoT[0]?.doc_count > 0 || response.SCADA[0]?.doc_count > 0 || response.WEB[0]?.doc_count > 0) {
  //       const transformedData: any[] = [];

  //       Object.keys(response).forEach(category => {
  //         const categoryData = response[category];
  //         const categoryEntry: any = {
  //           category: category,
  //           value: 0,
  //           subData: []
  //         };

  //         categoryData.forEach((item: { vulnerability: string, doc_count: number }) => {
  //           categoryEntry.value += item.doc_count;
  //           categoryEntry.subData.push({
  //             category: item.vulnerability,
  //             value: item.doc_count
  //           });
  //         });

  //         transformedData.push(categoryEntry);
  //       });


  //       let resProf = {
  //         data: transformedData, message: 'Top 10  Honeypot Vulnerabilities'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Top 10 Honeypot Vulnerabilities'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //   });
  // }
  getDoubleVul() {
    let url = environment.doubleVulnerabilities;
    this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
      if (Object.keys(response).length > 0) {
        const transformedData: any[] = [];
        
        const categoryMap = new Map();

        response.forEach((item: {
          honeypot_category: any; doc_count: any; vulnerability: any;
        }) => {
          const category = item.honeypot_category;

          if(categoryMap.has(category)) {
            const existingEntry = categoryMap.get(category);
            existingEntry.value += item.doc_count;
            existingEntry.subData.push({
              category: item.vulnerability,
              value: item.doc_count
          });
          } else {
            categoryMap.set(category, {
              category: category,
              value: item.doc_count,
              subData: [{ 
                category: item.vulnerability,
                value: item.doc_count
              }]
            });
          }
        });
        categoryMap.forEach(entry => {
          transformedData.push(entry);
        })

        let resProf = {
          data: transformedData, message: 'Top 10  Honeypot Vulnerabilities'
        }
        console.log("res",resProf)
        this.pieChartData.push(resProf)
      }
      else {
        let resProf = {
          data: [],
          message: 'Top 10 Honeypot Vulnerabilities'
        }
        this.pieChartData.push(resProf)
      }
    });
  }
  

  getProfileImages(vm_name : string) {
    const params = {vm_name}
    // const url = `${environment.profileImage}/${vm_name}`;
    let url = environment.profileImage;
    this.getProfilesImages = this.restServ.get(url, {params}, {}).subscribe(response => {
  //  console.log(response)
   let dialogRef = this.dialog.open(ProfileDataComponent, {
    data: { Object: response,message:"Profiles" }
  });
  dialogRef.afterClosed().subscribe((res: any) => {
  })
    });
  }
  
  // Protocols Chart
  // getProtocolsChart() {
  //   let url = environment.protocolsChart;
  //   this.getDoubleProtocols = this.restServ.get(url, {}, {}).subscribe(response => {
  //     if (Object.keys(response).length > 0) {
  //       const transformedData: any[] = [];
        
  //       const categoryMap = new Map();

  //       response.forEach((item: {
  //         package_name: any; doc_count: any; device_name: any;
  //       }) => {
  //         const category = item.package_name;

  //         if(categoryMap.has(category)) {
  //           const existingEntry = categoryMap.get(category);
  //           existingEntry.value += item.doc_count;
  //           existingEntry.subData.push({
  //             category: item.package_name,
  //             value: item.doc_count
  //         });
  //         } else {
  //           categoryMap.set(category, {
  //             category: category,
  //             value: item.doc_count,
  //             subData: [{ 
  //               category: item.device_name,
  //               value: item.doc_count
  //             }]
  //           });
  //         }
  //       });
  //       categoryMap.forEach(entry => {
  //         transformedData.push(entry);
  //       })

  //       let resProf = {
  //         data: transformedData, message: 'Top 10  Protocols'
  //       }
  //       this.protocolsChartData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Top 10 Protocols'
  //       }
  //       this.protocolsChartData.push(resProf)
  //     }
  //   });
  // }
  getProtocolsChart() {
    let url = environment.protocolsChart;
    this.getDoubleProtocols = this.restServ.get(url, {}, {}).subscribe(response => {
      this.protocolsChartData = [];
      
      if (Object.keys(response).length > 0) {
        const transformedData: any[] = [];
        const categoryMap = new Map();
  
        response.forEach((item: {
          package_name: any; doc_count: any; device_name: any;
        }) => {
          const category = item.package_name;
  
          if (!categoryMap.has(category)) {
            // Track the number of unique package_name entries
            if (categoryMap.size >= 10) {
              return; // Skip processing more entries if we already have 10
            }
            
            categoryMap.set(category, {
              category: category,
              value: item.doc_count,
              subData: [{
                category: item.device_name,
                value: item.doc_count
              }]
            });
          } else {
            const existingEntry = categoryMap.get(category);
            existingEntry.value += item.doc_count;
            const subCategory = existingEntry.subData.find((sub: { category: any; }) => sub.category === item.device_name);
  
            if (subCategory) {
              subCategory.value += item.doc_count;
            } else {
              existingEntry.subData.push({
                category: item.device_name,
                value: item.doc_count
              });
            }
          }
        });
  
        categoryMap.forEach(entry => {
          transformedData.push(entry);
        });
  
        let resProf = {
          data: transformedData,
          message: 'Top 10 Protocols'
        };
        this.protocolsChartData.push(resProf);
      } else {
        let resProf = {
          data: [],
          message: 'Top 10 Protocols'
        };
        this.protocolsChartData.push(resProf);
      }
    });
  }
  
  getVull() {
    let url = environment.doubleDeviceVulnerabilities;
    this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
      if (Object.keys(response).length > 0) {
        const transformedData: any[] = [];
        const categoryMap = new Map();
        let uniqueVulnerabilities = 0; // Track the number of unique vulnerabilities
  
        response.forEach((item: {
          device_name: any; doc_count: any; vulnerability: any;
        }) => {
          const category = item.device_name;
  
          // Check if we've reached the limit of 10 unique vulnerabilities
          if (uniqueVulnerabilities >= 10) {
            return; // Skip processing more entries if we already have 10
          }
  
          if (categoryMap.has(category)) {
            const existingEntry = categoryMap.get(category);
            existingEntry.value += item.doc_count;
            existingEntry.subData.push({
              category: item.vulnerability,
              value: item.doc_count
            });
          } else {
            categoryMap.set(category, {
              category: category,
              value: item.doc_count,
              subData: [{
                category: item.vulnerability,
                value: item.doc_count
              }]
            });
            uniqueVulnerabilities++; // Increment the count of unique vulnerabilities
          }
        });
  
        categoryMap.forEach(entry => {
          transformedData.push(entry);
        });
  
        let resProf = {
          data: transformedData,
          message: 'Top 10 Vulnerabilities'
        };
        this.vulChartData.push(resProf);
      } else {
        let resProf = {
          data: [],
          message: 'Top 10 Vulnerabilities'
        };
        this.vulChartData.push(resProf);
      }
    });
  }
  
  // getprotocols() {
  //   let url = environment.protocols;
  //   this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
  //     if (response.IoT[0]?.doc_count > 0 || response.SCADA[0]?.doc_count > 0 || response.WEB[0]?.doc_count > 0) {
  //       const transformedData: any[] = [];
  //       Object.keys(response).forEach(category => {
  //         const categoryData = response[category];
  //         const categoryEntry: any = {
  //           category: category,
  //           value: 0,
  //           subData: []
  //         };

  //         categoryData.forEach((item: { package_name: string, doc_count: number }) => {
  //           categoryEntry.value += item.doc_count;
  //           categoryEntry.subData.push({
  //             category: item.package_name,
  //             value: item.doc_count
  //           });
  //         });


  //         transformedData.push(categoryEntry);
  //       });


  //       let resProf = {
  //         data: transformedData, message: 'Top 10 Protocols'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Top 10 Protocols'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //   });
  // }

  getProtocols() {
    let url = environment.protocols;
    this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
      if (Object.keys(response).length > 0) {
        const transformedData: any[] = [];
        
        const categoryMap = new Map();

        response.forEach((item: {
          honeypot_category: any; doc_count: any; package_name: any;
        }) => {
          const category = item.honeypot_category;

          if(categoryMap.has(category)) {
            const existingEntry = categoryMap.get(category);
            existingEntry.value += item.doc_count;
            existingEntry.subData.push({
              category: item.package_name,
              value: item.doc_count
          });
          } else {
            categoryMap.set(category, {
              category: category,
              value: item.doc_count,
              subData: [{ 
                category: item.package_name,
                value: item.doc_count
              }]
            });
          }
        });
        categoryMap.forEach(entry => {
          transformedData.push(entry);
        })
  
        if (transformedData.length > 0) {
          let resProf = {
            data: transformedData,
            message: 'Top 10 Protocols'
          };
          this.pieChartData.push(resProf);
        } else {
          let resProf = {
            data: [],
            message: 'Top 10 Protocols'
          };
          this.pieChartData.push(resProf);
        }
      } else {
        let resProf = {
          data: [],
          message: 'Top 10 Protocols'
        };
        this.pieChartData.push(resProf);
      }
    });
  }
  
  

  // getDevices() {
  //   let url = environment.devices;
  //   this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
  //     if (response.IoT[0]?.doc_count > 0 || response.SCADA[0]?.doc_count > 0 || response.WEB[0]?.doc_count > 0) {
  //       const transformedData: any[] = [];
  //       Object.keys(response).forEach(category => {
  //         const categoryData = response[category];
  //         const categoryEntry: any = {
  //           category: category,
  //           value: 0,
  //           subData: []
  //         };

  //         categoryData.forEach((item: { device_type: string, doc_count: number }) => {
  //           categoryEntry.value += item.doc_count;
  //           categoryEntry.subData.push({
  //             category: item.device_type,
  //             value: item.doc_count
  //           });
  //         });


  //         transformedData.push(categoryEntry);
  //       });


  //       let resProf = {
  //         data: transformedData, message: 'Top 10 Honeypot Devices'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //     else {
  //       let resProf = {
  //         data: [],
  //         message: 'Top 10 Honeypot Devices'
  //       }
  //       this.pieChartData.push(resProf)
  //     }
  //   });
  // }

  getDevices() {
    let url = environment.devices;
  
    this.getDoubleVulTotal = this.restServ.get(url, {}, {}).subscribe(response => {
      if (response && response.length > 0) {
        const transformedData: any[] = [];
  
        const categoryMap = new Map();
  
        response.forEach((item: { honeypot_category: any; doc_count: any; device_type: any; }) => {
          const category = item.honeypot_category;
  
          if (categoryMap.has(category)) {
            const existingEntry = categoryMap.get(category);
            existingEntry.value += item.doc_count;
            existingEntry.subData.push({
              category: item.device_type,
              value: item.doc_count
            });
          } else {
            categoryMap.set(category, {
              category: category,
              value: item.doc_count,
              subData: [{ category: item.device_type, value: item.doc_count }]
            });
          }
        });
        categoryMap.forEach(entry => {
          transformedData.push(entry);
        });
  
        if (transformedData.length > 0) {
          let resProf = {
            data: transformedData,
            message: 'Top 10 Honeypot Devices'
          };
          this.pieChartData.push(resProf);
        } else {
          let resProf = {
            data: [],
            message: 'Top 10 Honeypot Devices'
          };
          this.pieChartData.push(resProf);
        }
      } else {
        let resProf = {
          data: [],
          message: 'Top 10 Honeypot Devices'
        };
        this.pieChartData.push(resProf);
      }
    });
  }
  
  
  getDoubleDevices() {
    this.doubleDiv = false;
this.chartsDiv = true;
this.timegraph = true;
this.tableDiv = true
    this.chartsDivv = true
    this.disableClick = true;
    this.protocolsDiv = true
    this.imageDiv = true
    this.honeypotDiv = true
    this.doublePieChartData=[];
    let url = environment.honeyotDeviceType;
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
        this.doublePieChartData.push(resProf)
      
      }
      else {
        let resProf = {
          data: [],
          message: 'Honeypot Devices'
        }
        this.doublePieChartData.push(resProf)
      }
      this.disableClick = false;
    });
  }
  
  fillAllChartsEmpty() {
    for (var i = 0; i < this.chartAllData.length; i++) {
      this.chartType[i] = 'pie';
      // this.chartType[i] = 'double';
    }

  }

  chartToggle(i: any, chartType: string) {
    this.chartType[i] = chartType;
  }

  getMoreDetails(cat: any) {
    this.chartsDiv = true
    this.doubleDiv = true;
    this.timegraph = true;
    this.imageDiv = true

    this.tableDiv = false
    this.chartsDivv = true
    this.honeypotDiv = true
    this.protocolsDiv = true
    let url = environment.getProfiles
    this.getIotProfiles = this.restServ.post(url, { cat: cat }, {}).subscribe(res => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.profileSort
      this.dataSource.filterPredicate = this.createFilter();
    })
    this.getVulDetail == this.restServ.post(environment.getVulnerabilities, { cat: cat }, {}).subscribe(res => {
      this.dataSourceVul = new MatTableDataSource(res);
      this.dataSourceVul.paginator = this.paginatorVul
      this.dataSourceVul.sort = this.VulSort
      this.dataSourceVul.filterPredicate = this.createFilter();

    })
    // if(this.profilesChartData.length === 0){
      this.getDoubleProfile(cat)
      // this.getVull()

    // }
  }

  totalVulnerabilities() {
    this.chartsDiv = true
    this.tableDiv = true
    this.chartsDivv = false
    this.honeypotDiv = true
    this.protocolsDiv = true
    this.timegraph = true;
    this.imageDiv = true

    this.doubleDiv = true;
    let url = environment.totalVulnerabilities
    this.gettotalVulnerabilities = this.restServ.post(url, {}, {}).subscribe(res => {
      this.dataSourceTotalVul = new MatTableDataSource(res);
      this.dataSourceTotalVul.paginator = this.totalPaginator;
      this.dataSourceTotalVul.sort = this.totalVulSort;
      this.dataSourceTotalVul.filterPredicate = this.createFilter();

    })
    if (this.vulChartData.length === 0) {
      this.getVull();
    }


  }

  protocolTable() {
    this.chartsDiv = true
    this.tableDiv = true
    this.chartsDivv = true
    this.timegraph = true;

    this.honeypotDiv = true
    this.protocolsDiv = false
    this.doubleDiv = true;
    let url = environment.protocolTable
    this.getprotocolTable = this.restServ.post(url, {}, {}).subscribe(res => {
      this.dataSourceProtocols = new MatTableDataSource(res);
      this.dataSourceProtocols.paginator = this.protocolsPaginator
      this.dataSourceProtocols.sort = this.protocolsSort
      this.dataSourceProtocols.filterPredicate = this.createFilter();
    })
    // this.getprotocolTable = this.restServ.post(environment.doubleProtocols, {}, {}).subscribe(res => {
    //  console.log(res)
    // })
    this.getProtocolsChart()
  }

  // Device Type & Name Table
  getDevicesTable(param: string) {
    this.chartsDiv = true;
    this.timegraph = true;

    this.tableDiv = true;
    this.chartsDivv = true;
    this.honeypotDiv = true;
    this.protocolsDiv = true;
    this.imageDiv = true;
    this.doubleDiv = false;
  
    let uniqueKey = 'device_name';
    if (param === 'type') {
      uniqueKey = 'device_type';
      this.displayedColumnsDeviceChips = ['id', 'device_type'];
    } else {
      this.displayedColumnsDeviceChips = ['id', 'device_name'];
    }
  
    let url = environment.deviceTable;
    this.getDeviceTable = this.restServ.get(url, {}, {}).subscribe(res => {
      // Get unique values based on the selected key (device_name or device_type)
      const uniqueValues = [...new Set(res.map((item: { [x: string]: any; }) => item[uniqueKey]))];
  
      // Create a new array of objects with only unique values for the selected key
      const uniqueData = uniqueValues.map(value => {
        const item = res.find((obj: { [x: string]: unknown; }) => obj[uniqueKey] === value);
        return item;
      });
  
      this.dataSourceDeviceChips = new MatTableDataSource(uniqueData);
      this.dataSourceDeviceChips.paginator = this.devicePaginator;
      this.dataSourceDeviceChips.sort = this.deviceSort;
      this.dataSourceDeviceChips.filterPredicate = this.createFilter();
    });
  
    this.getDoubleDevices();
  }
  

  // Honeypot Images Table
  getImages() {
    this.chartsDiv = true
    this.timegraph = true;

    this.tableDiv = true
    this.chartsDivv = true
    this.honeypotDiv = true
    this.protocolsDiv = true
    this.imageDiv = false
    this.doubleDiv = true;

    let url = environment.imageTable
    this.getImageTable = this.restServ.post(url, {}, {}).subscribe(res => {
      this.dataSourceImages = new MatTableDataSource(res);
      this.dataSourceImages.paginator = this.imagesPaginator
      this.dataSourceImages.sort = this.imagesSort
      this.dataSourceImages.filterPredicate = this.createFilter();
    })
  }

  getHoneypots(honeypotType?: string) {
    this.chartsDiv = true;
    this.timegraph = true;
    this.imageDiv = true

    this.tableDiv = true;
    this.chartsDivv = true;
    this.honeypotDiv = false;
    this.protocolsDiv = true;
    this.doubleDiv = true;

    let url = environment.getHoneypots;

    const params: any = {};

    if (honeypotType) {
      params.honeypot_type = honeypotType;
    }

    this.getTotalHoneypots = this.restServ.get(url, { params }, {}).subscribe((res) => {
      if(params.honeypot_type = "HIHP"){
        this.displayedColumnsHoenypots = [
          'id',
          'snapshot_name',
          'honeypot_type',
          'honeypot_category',
          'device_type',
          'device_name',
          'vm_name'
        ]
      } 
      this.dataSourceHoenypots = new MatTableDataSource(res);
      this.dataSourceHoenypots.paginator = this.honeypotPaginator;
      this.dataSourceHoenypots.sort = this.honeypotSort;
      this.dataSourceHoenypots.filterPredicate = this.createFilter();
    });

  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      return (
        data.snapshot_name?.toString()?.toLowerCase()?.indexOf(searchTerms.snapshot_name?.toLowerCase()) !== -1 &&
        data.vm_name?.toString()?.toLowerCase()?.indexOf(searchTerms.vm_name?.toLowerCase()) !== -1 &&
        data.device_name?.toString()?.toLowerCase()?.indexOf(searchTerms.device_name?.toLowerCase()) !== -1 &&
        data.device_type?.toString()?.toLowerCase()?.indexOf(searchTerms.device_type?.toLowerCase()) !== -1 &&
        data.honeypot_type?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_type?.toLowerCase()) !== -1 &&
        data.honeypot_category?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_category?.toLowerCase()) !== -1 &&
        data.image_name?.toString()?.toLowerCase()?.indexOf(searchTerms.image_name?.toLowerCase()) !== -1 &&
        data.honeypot_name?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_name?.toLowerCase()) !== -1 &&
        data.package_name?.toString()?.toLowerCase()?.indexOf(searchTerms.package_name?.toLowerCase()) !== -1 &&
        data.vulnerability_id?.toString()?.toLowerCase()?.indexOf(searchTerms.vulnerability_id?.toLowerCase()) !== -1 &&
        data.vulnerability?.toString()?.toLowerCase()?.indexOf(searchTerms.vulnerability?.toLowerCase()) !== -1 &&
        data.package_name?.toString()?.toLowerCase()?.indexOf(searchTerms.package_name?.toLowerCase()) !== -1 &&
        data.image_tag?.toString()?.toLowerCase()?.indexOf(searchTerms.image_tag?.toLowerCase()) !== -1 &&
        data.port?.toString()?.toLowerCase()?.indexOf(searchTerms.port?.toLowerCase()) !== -1 &&
        data.package_version?.toString()?.toLowerCase()?.indexOf(searchTerms.package_version?.toLowerCase()) !== -1 &&
        data.os_name?.toString()?.toLowerCase()?.indexOf(searchTerms.os_name?.toLowerCase()) !== -1 &&
        data.os_type?.toString()?.toLowerCase()?.indexOf(searchTerms.os_type?.toLowerCase()) !== -1 &&
        data.vm_type?.toString()?.toLowerCase()?.indexOf(searchTerms.vm_type?.toLowerCase()) !== -1 &&
        data.node_hardware?.toString()?.toLowerCase()?.indexOf(searchTerms.node_hardware?.toLowerCase()) !== -1        
      );
    };

    return filterFunction;
  }

  // createProtocolFilter(): (data: any, filter: string) => boolean {
  //   let filterFunction = function (data: any, filter: any): boolean {
  //     let searchTerms = JSON.parse(filter);

  //     return (
  //       // 'honeypot_name',
  //       // 'honeypot_category',
  //       // 'device_name',
  //       // 'device_type',
  //       // 'package_name'
  //       data.honeypot_name?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_name?.toLowerCase()) !== -1 &&
  //       data.honeypot_category?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_category?.toLowerCase()) !== -1 &&
  //       data.device_name?.toString()?.toLowerCase()?.indexOf(searchTerms.device_name?.toLowerCase()) !== -1 &&
  //       data.device_type?.toString()?.toLowerCase()?.indexOf(searchTerms.device_type?.toLowerCase()) !== -1 &&
  //       data.honeypot_type?.toString()?.toLowerCase()?.indexOf(searchTerms.honeypot_type?.toLowerCase()) !== -1 &&
  //       data.package_name?.toString()?.toLowerCase()?.indexOf(searchTerms.package_name?.toLowerCase()) !== -1
  //     );
  //   };

  //   return filterFunction;
  // }



  closeButton() {
    this.chartsDiv = false
    this.timegraph = false;
    this.imageDiv = true

    this.tableDiv = true
    this.chartsDivv = true
    this.protocolsDiv = true
    this.doubleDiv = true;

  }
  ngOnDestroy(): void {
    if (this.getSnapTotal) {
      this.getSnapTotal.unsubscribe();
    }
    if (this.getProfilesTotal) {
      this.getProfilesTotal.unsubscribe();
    }
    if (this.getIotProfiles) {
      this.getIotProfiles.unsubscribe()
    }
    if (this.getVulTotal) {
      this.getVulTotal.unsubscribe()
    }
    if (this.getVulDetail) {
      this.getVulDetail.unsubscribe()
    }
  }

}
