import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-by-indicator',
  templateUrl: './search-by-indicator.component.html',
  styleUrls: ['./search-by-indicator.component.scss']
})
export class SearchByIndicatorComponent implements OnInit {
  getIndiFormData!: Subscription

  indicatorForm!: FormGroup;
  formSubmitted = false;
  searchloader: boolean = false;
  showtable:  boolean = false;
  showData = false;
  indicaterData: any;
  display = "none";
  infoData: any;
  textData: any;
  importDta: any;
  indicatorTypes: any = [];
  isImportScreen = false;
  mySvgElement:any;
  totalIndicatorTypes:any
  constructor(
    public fb: FormBuilder,
    private notiServ: NotificationService,
    private restServ: RestService
  ) { }

  @HostListener('window:selectedEvent', ['$event']) onselectedEvent(el: any) {
    this.infoData = el.detail
    this.display = "block";
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.indicatorForm = this.fb.group({
      type: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (!this.indicatorForm.valid) {
      return;
    }

    this.searchloader = true;
    let url = environment.restapi;
    this.indicaterData = [];
    this.getIndiFormData=this.restServ.post(url, this.indicatorForm.value, {}).subscribe(res => {
      //  console.log('res',res);
      
      this.searchloader = false;
      this.showData = true;
   
      if (!res.data) {
        // this.mapServ.getDummyData().subscribe((res: any) => {
        //   this.indicaterData = res;
        //   this.textData = JSON.stringify(this.indicaterData);
        // });
      } else {
       this.indicaterData = res.data;
       this.textData = JSON.stringify(this.indicaterData);
      }
    });
  }

  selectionChange(event: any) {
    if (event && event.target.value) {
      this.indicatorForm.controls['value'].reset();
      this.indicatorForm.controls['value'].clearValidators();

      switch (event.target.value) {
        case 'ip':
          this.indicatorForm.controls['value'].setValidators([
            Validators.pattern(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g)
          ]);
          break;
        case 'hash':
          break;
        case 'url':
          let myreg = /\b([a-z]{3,}\:\/\/[\S]{16,})\b/g
          this.indicatorForm.controls['value'].setValidators([
            Validators.pattern(myreg)]);
          break;
        default:
          break;
      }
      this.indicatorForm.controls['value'].updateValueAndValidity();
    }
    // console.log(event.target.value, this.indicatorForm.controls['value']);
  }

  get f(): { [key: string]: AbstractControl; } {
    return this.indicatorForm.controls;
  }

  initStix(e:any) {
  
     this.mySvgElement = document.getElementById('canvas');

     if(this.mySvgElement.children[0]){
      this.mySvgElement.children[0].remove();
     }
     
    const cfg = {
      iconDir: "assets/jsFiles/stix2viz/stix2viz/icons"
    }
    const visualizer = new (window as any).module.vizInit(this.mySvgElement, cfg);
    if (e == "importedData")
    {
      new (window as any).module.vizStix(this.importDta)
    }
    else{
      new (window as any).module.vizStix(this.indicaterData)
    }
 
  }



  graphView(e:any) {
    this.initStix(e);
  }

  closeModal() {
    this.display = "none";
    this.mySvgElement = '';
    this.mySvgElement.remove();
  }

  download() {

    if(this.textData != ''){
      this.notiServ.showError("No data found");
      return;
    }
    var textFileAsBlob = new Blob([this.textData], {
      type: 'text/plain'
    });
    var downloadLink = document.createElement("a");
    downloadLink.download = 'download.txt';
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = window.webkitURL
        .createObjectURL(textFileAsBlob);
    }

    downloadLink.click();
  }

  searchData() {
    this.showtable = false;
    if (this.importDta) {
      let stixdata = JSON.parse(this.importDta);
      const ip_exp = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/;
      const url_exp = /\b([a-z]{3,}\:\/\/[\S]{16,})\b/;
      const md5_exp = /\b([a-f0-9]{32}|[A-F0-9]{32})\b/;
      const sha1_exp = /\b([a-f0-9]{40}|[A-F0-9]{40})\b/;
      const sha256_exp = /\b([a-f0-9]{64}|[A-F0-9]{64})\b/;
      var listdata: any = [];
      var listtype = [];
      var datad = JSON.stringify(stixdata);
      if (ip_exp.test(datad)) {
        let j: any = datad.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g);
        j = j.toString()
        let arrayname = j.split(',');
        arrayname = [...new Set(arrayname)];
        let updatArr = arrayname.map((x: any) => {
          return { key: 'ip', value: x}
        });
        listdata = listdata.concat(updatArr);
        
      }

      if (md5_exp.test(datad)) {
        var j: any = datad.match(/\b([a-f0-9]{32}|[A-F0-9]{32})\b/g);
        j = j.toString();
        var arrayname = j.split(',');
        arrayname = [...new Set(arrayname)];
        let updatArr = arrayname.map((x: any) => {
          return { key: 'hash', value: x}
        });
        listdata = listdata.concat(updatArr);
      }
      if (sha1_exp.test(datad)) {
        var j: any = datad.match(/\b([a-f0-9]{40}|[A-F0-9]{40})\b/g);
        j = j.toString();
        var arrayname = j.split(',');
        arrayname = [...new Set(arrayname)];
        let updatArr = arrayname.map((x: any) => {
          return { key: 'hash', value: x}
        });
        listdata = listdata.concat(updatArr);
      }

      if (sha256_exp.test(datad)) {
        var j: any = datad.match(/\b([a-f0-9]{64}|[A-F0-9]{64})\b/g);
        j = j.toString();
        var arrayname = j.split(',');
        arrayname = [...new Set(arrayname)];
        let updatArr = arrayname.map((x: any) => {
          return { key: 'hash', value: x}
        });
        listdata = listdata.concat(updatArr);
      }

      this.indicatorTypes = listdata;
      this.totalIndicatorTypes = this.indicatorTypes.length
      this.showtable = true;
    }
  }

  changeView() {
    this.showtable = false;
    this.indicatorTypes ='';
    this.isImportScreen = false;
    this.importDta = '';
    this.textData = ''
  }
  ngOnDestroy(): void{
    if(this.getIndiFormData){
    this.getIndiFormData.unsubscribe();
    }

  }
}
