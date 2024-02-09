import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-threat-score',
  templateUrl: './threat-score.component.html',
  styleUrls: ['./threat-score.component.scss']
})
export class ThreatScoreComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<ThreatScoreComponent>,
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
