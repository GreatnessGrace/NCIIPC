import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-threat-json-data',
  templateUrl: './threat-json-data.component.html',
  styleUrls: ['./threat-json-data.component.scss']
})
export class ThreatJsonDataComponent implements OnInit {
  constructor( public dialogRef: MatDialogRef<ThreatJsonDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }



  ngOnInit(): void {
  }
  
closeButton(type:any|undefined) {
  if(type== 'simple'){
    this.dialogRef.close();
  } else{
  this.dialogRef.close("I am closed!!")
  }
}
  }




