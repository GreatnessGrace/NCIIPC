import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-hybrid-report-json-data',
  templateUrl: './hybrid-report-json-data.component.html',
  styleUrls: ['./hybrid-report-json-data.component.scss']
})
export class HybridReportJsonDataComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<HybridReportJsonDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {
  }
  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }
}
