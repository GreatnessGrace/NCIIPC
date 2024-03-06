import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RestService } from 'src/app/core/services/rest.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RightClickService } from 'src/app/core/services/right-click.service';

@Component({
  selector: 'app-user-session',
  templateUrl: './user-session.component.html',
  styleUrls: ['./user-session.component.scss']
})
export class UserSessionComponent implements OnInit {

  getUserSessionData! : Subscription
  searchloaderxl:boolean = true;
  isShowDiv = true;
  total_logs:any
  displayedColumns: string[] =
  [
    'id',
    'datetime',
    'name',
    'action'
    
  ];

  
  nameFilter = new FormControl('');

 
  filterValues = {
    name:''
  };

  dataSource!: MatTableDataSource<any>;
  @ViewChild('paginatorSession') paginatorSession!: MatPaginator;
  @ViewChild('sortSession') sortSession!: MatSort;

constructor(private restServ: RestService, private rightClickService: RightClickService){}

onRightClick(event: MouseEvent): void {
  this.rightClickService.handleRightClick(event);
}
  ngOnInit(): void {
this.getUserSession()



    this.nameFilter.valueChanges
    .subscribe(
      name => {        
        
        this.filterValues.name = name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )
  }

  getUserSession(){
    this.getUserSessionData=this.restServ.get(`${environment.userSession}`, {},{}).subscribe(res => {
      console.log("==>",res)
      this.dataSource = new MatTableDataSource(res.data)
      this.dataSource.filterPredicate = this.createFilter();
      this.isShowDiv = false
      this.dataSource.paginator = this.paginatorSession;
      this.dataSource.sort = this.sortSession;
      this.total_logs = this.dataSource.filteredData.length
      this.searchloaderxl = false;

      
    });
  }


  createFilter(): (data: any, filter: string) => boolean {

    
    let filterFunction = function(data:any, filter:any): boolean {

      let searchTerms = JSON.parse(filter);
      
      if (searchTerms.name != '' ) {
        return data.user_superadmin[0].name.toString().toLowerCase().indexOf(searchTerms.name) !== -1 
       
      }
      return true;
    };
    return filterFunction;
  }
  ngOnDestroy(): void{
    if(this.getUserSessionData){
    this.getUserSessionData.unsubscribe();
    }
  }
}


