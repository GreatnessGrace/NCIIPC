import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-viewav',
  templateUrl: './viewav.component.html',
  styleUrls: ['./viewav.component.scss']
})
export class ViewavComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<ViewavComponent>,
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
