import { Component, OnInit , ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SharedService } from 'src/app/common/shared.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-p-cap-binary',
  templateUrl: './p-cap-binary.component.html',
  styleUrls: ['./p-cap-binary.component.scss']
})
export class PCapBinaryComponent implements OnInit {
  getAllBinaryData! : Subscription;
  getBinPcapData! : Subscription
  getDownloadFileData! : Subscription;
getSnort ! : Subscription
  pcapForm: any = FormGroup;
  Binaries: any = [];
  startDate : any;
  endDate : any;
  searchloaderxs = true
  searchloaderxl = true
  showSnort = true
  dataSource!: MatTableDataSource<any>;
  @ViewChild('paginatorEvent') paginatorEvent!: MatPaginator;
  @ViewChild('sort') sort!: MatSort

  displayedColumns= [
    'id',
    'node_id',
    'vul_name',
    'severity',
    'remote_ip',
    'remote_port',
    'local_ip',
    'local_port',
    'protocol',
    'basescore',
    // 'data_version',
    // 'data_format',
    'download'
  ];

  nodeFilter= new FormControl('');
  vulFilter= new FormControl('');
  severityFilter= new FormControl('');
  remoteIPFilter= new FormControl('');
  remotePortFilter= new FormControl('');
  localIPFilter= new FormControl('');
  localPortFilter= new FormControl('');
  basescoreFilter= new FormControl('');
  protocolFilter= new FormControl('');
  data_formatFilter= new FormControl('');
  data_versionFilter= new FormControl('');
  filterValues = {
    node_id: '',
    vul_name:'',
    severity:'',
    remote_port:'',
    remote_ip:'',
    local_port:'',
    local_ip:'',
    protocol:'',
    basescore:'',
    data_format:'',
    data_version:''
  };

  constructor(   private restServ:RestService,
    private fb: FormBuilder,
    public sharedService: SharedService) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllBinary();
    this.getSnortData()

    this.nodeFilter.valueChanges
    .subscribe(
      node_id => {
        this.filterValues.node_id = node_id;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.vulFilter.valueChanges
    .subscribe(
      vul_name => {
        this.filterValues.vul_name = vul_name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.severityFilter.valueChanges
    .subscribe(
      severity => {
        this.filterValues.severity = severity;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.remoteIPFilter.valueChanges
    .subscribe(
      remote_ip => {
        this.filterValues.remote_ip = remote_ip;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.remotePortFilter.valueChanges
    .subscribe(
      remote_port => {
        this.filterValues.remote_port = remote_port;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.localIPFilter.valueChanges
    .subscribe(
      local_ip => {
        this.filterValues.local_ip = local_ip;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.localPortFilter.valueChanges
    .subscribe(
      local_port => {
        this.filterValues.local_port = local_port;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.basescoreFilter.valueChanges
    .subscribe(
      basescore => {
        this.filterValues.basescore = basescore;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.protocolFilter.valueChanges
    .subscribe(
      protocol => {
        this.filterValues.protocol = protocol;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.data_formatFilter.valueChanges
    .subscribe(
      data_format => {
        this.filterValues.data_format = data_format;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )

    this.data_versionFilter.valueChanges
    .subscribe(
      data_version => {
        this.filterValues.data_version = data_version;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )
  }

  initForm(){

    var d = new Date();
    d.setMonth(d.getMonth() - 2);
    this.startDate = d;
    this.endDate = new Date();
    this.pcapForm = this.fb.group({
      start_date: [this.startDate,Validators.required],
      end_date: [this.endDate,Validators.required],
      pcap:[]
    });
  }

  orgValueChange(date:any,type:string){


    if(type == 'start'){
        this.pcapForm.patchValue({'start_date':date.value});
    } else {
      this.pcapForm.get('end_date').setValue(date.value);
      // this.pcapForm.patchValue({['end_date']:date.value});
    }

    this.getAllBinary();
    this.getSnortData()
  }

  getAllBinary(){
    this.searchloaderxs = true
        this.getAllBinaryData=this.restServ.post(environment.getBinary,this.pcapForm.value,{}).subscribe(res=>{
          this.searchloaderxs = false
        this.Binaries = res.data.buckets;
    });
  }

getSnortData(){
  this.searchloaderxl = true
  this.showSnort = true
this.getSnort = this.restServ.post(environment.getSnort,this.pcapForm.value,{}).subscribe(res=>{
  this.searchloaderxl = false
  this.dataSource = new MatTableDataSource(res.data.hits.hits)
  this.dataSource.paginator = this.paginatorEvent;
  this.showSnort = false
  this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'node_id': return item._source.node_id;
      case 'vul_name': return item._source.event_data.vul_name;
      case 'severity': return item._source.event_data.nvd_reference.severity;
      case 'local_ip': return item._source.event_data.local_ip;
      case 'remote_port': return item._source.event_data.remote_port;
      case 'remote_ip': return item._source.event_data.remote_ip;
      case 'local_port': return item._source.event_data.local_port;
      case 'basescore': return item._source.event_data.nvd_reference.basescore ;
      case 'protocol': return item._source.event_data.protocol ;
      case 'data_version': return item._source.event_data.nvd_reference.data_version;
      case 'data_format': return item._source.event_data.nvd_reference.data_format;
      default: return item[property];
    }
  };
  this.dataSource.sort = this.sort;
  this.dataSource.filterPredicate = this.createFilter();
})
}

  getBinaryPcap(event:any){
   var time = this.Binaries.filter((e:any)=>{
      if(e.key == event.target.value){
        return e;
      }
    });

    let date = new Date(time[0].hits.hits.hits[0]._source.event_timestamp);
    let node = time[0].hits.hits.hits[0]._source.node_id;
   
    var month:any = (date.getMonth()+1);

    if(month <= 9){
      month = '0'+month;
    }

    var day:any = date.getUTCDate();
    if(day <= 9){
      day = '0'+day;
    }

    var hours:any = date.getHours();
    if(hours <= 9){
      hours = '0'+hours;
    }

    var minutes:any = date.getMinutes();
    if(minutes <= 9){
      minutes = '0'+minutes;
    }

     var dynPath = '/BB_LOGS/pcap/'+node+'_pcap/pcap/'+date.getFullYear()+'/'+month+'/'+day+'/'+hours+'.'+minutes+'/cdac_hp_1/log';
     var partialPath = '/BB_LOGS/pcap/'+node+'_pcap/pcap/'+date.getFullYear()+'/'+month+'/';
   
     
      let dataToSend = {
        path:dynPath,
        node:node,
        day:day,
        month:month,
        hours:hours,
        minutes:minutes,
        partialPath:partialPath,


      }
    // const filePath = '/BB_LOGS/pcap/61_pcap/pcap/2023/02/01/02.30/cdac_hp_1/';


    this.getBinPcapData = this.restServ.post(environment.getBinaryPcap,dataToSend,{}).subscribe(res=>{

      var dynPath = res.data;
      this.downloadFile(dynPath)
  });
  
  }

  node_pcap(path:any){
this.restServ.post(environment.getNodePcap,{path:path},{}).subscribe(res=>{
      var dynPath = res.data;
      this.downloadFile(dynPath)
  });

  }
  downloadFile(dynPath:any){

    this.getDownloadFileData=this.restServ.getFile(dynPath).subscribe((data: any) => {
   
      let url = window.URL.createObjectURL(data);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = 'log';
      a.click();
      a.remove();
      
    }, (err) => {
      if (err.status == 404) {
        
      }
    })
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data:any, filter:any): boolean {
      let searchTerms = JSON.parse(filter);
      
        return data._source.node_id.toString().toLowerCase().indexOf(searchTerms.node_id.toLowerCase()) !== -1
        && data._source.event_data.vul_name.toString().toLowerCase().indexOf(searchTerms.vul_name.toLowerCase()) !== -1
        && data._source.event_data.nvd_reference.severity.toString().toLowerCase().indexOf(searchTerms.severity.toLowerCase()) !== -1
        && data._source.event_data.remote_port.toString().toLowerCase().indexOf(searchTerms.remote_port.toLowerCase()) !== -1
        && data._source.event_data.remote_ip.toString().toLowerCase().indexOf(searchTerms.remote_ip.toLowerCase()) !== -1
        && data._source.event_data.local_port.toString().toLowerCase().indexOf(searchTerms.local_port.toLowerCase()) !== -1
        && data._source.event_data.local_ip.toString().toLowerCase().indexOf(searchTerms.local_ip.toLowerCase()) !== -1
        && data._source.event_data.protocol.toString().toLowerCase().indexOf(searchTerms.protocol.toLowerCase()) !== -1
        && data._source.event_data.nvd_reference.basescore.toString().toLowerCase().indexOf(searchTerms.basescore.toLowerCase()) !== -1
        && data._source.event_data.nvd_reference.data_format.toString().toLowerCase().indexOf(searchTerms.data_format.toLowerCase()) !== -1
        && data._source.event_data.nvd_reference.data_version.toString().toLowerCase().indexOf(searchTerms.data_version.toLowerCase()) !== -1
    }
    return filterFunction;
  }

  ngOnDestroy(): void{
    if(this.getAllBinaryData){
      this.getAllBinaryData.unsubscribe();
    }
    if(this.getBinPcapData){
      this.getBinPcapData.unsubscribe();
    }
    if(this.getDownloadFileData){
      this.getDownloadFileData.unsubscribe();
    }
    if(this.getSnort){
      this.getSnort.unsubscribe()
    }
  }

}
