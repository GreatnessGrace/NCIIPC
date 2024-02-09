import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile-data',
  templateUrl: './profile-data.component.html',
  styleUrls: ['./profile-data.component.scss']
})
export class ProfileDataComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<ProfileDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    dataSource!: MatTableDataSource<any>;
    @ViewChild('devicePaginator') devicePaginator!: MatPaginator;
    @ViewChild('deviceSort') deviceSort!: MatSort;
  
    displayedColumns = [
      'id',
      'profile_name',
      'device_name',
      'device_type',
    ]

  ngOnInit(): void {
    // const responseData = this.data;
    // this.dataSource = new MatTableDataSource(responseData.Object);
    // this.dataSource.paginator = this.devicePaginator;
    // console.log( this.dataSource.paginator);
    
    // this.dataSource.sort = this.deviceSort;
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      return (
        data.device_name?.toString()?.toLowerCase()?.indexOf(searchTerms.device_name?.toLowerCase()) !== -1 &&
        data.device_type?.toString()?.toLowerCase()?.indexOf(searchTerms.device_type?.toLowerCase()) !== -1 
              );
    };

    return filterFunction;
  }

  closeButton(type:any|undefined) {
    if(type== 'simple'){
      this.dialogRef.close();
    } else{
    this.dialogRef.close("I am closed!!")
    }
  }
  ngAfterViewInit(){
    const responseData = this.data;
    this.dataSource = new MatTableDataSource(responseData.Object);
    this.dataSource.paginator = this.devicePaginator;
    console.log( this.dataSource.paginator);
    
    this.dataSource.sort = this.deviceSort;
  }
}
