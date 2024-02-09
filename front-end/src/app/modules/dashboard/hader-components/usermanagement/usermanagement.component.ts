import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { PermissionComponent } from 'src/app/modules/share/permission/permission.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddUserComponent } from 'src/app/modules/share/add-user/add-user.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RestService } from 'src/app/core/services/rest.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss']
})

export class UsermanagementComponent implements OnInit {
  getEditUserData! : Subscription
  getViewUsersData! : Subscription
  getViewPendUsersData! : Subscription
  getDeleteUserData! : Subscription

  searchloaderxl:boolean = true;
  istable:boolean = true;
  ispentable:boolean = true;
  totalpending_user: any;
  total_user: any;
  user_count: any = 0;
  isShowDiv = true;
  isShowDiv1 = false;
  button_text = 'Pending Requests';
  user:any;
  name='';
  userRole='';
  userStatus='';
  userEmail='';
  userName='';
  selected: any;
  penStatus:any
  displayedColumnsSuperAdmin: string[] =
    [
      'position',
      'name',
      'username',
      'email',
      'role',
      'user_status',
      'button-save',
      'button-permission',
      'button-delete'
      // 'usermenu-button'
    ];

  displayedColumnsAdmin: string[] =
    [
      'position',
      'name',
      'username',
      'email',
      'role',
      'user_status'
    ];

    nameFilter = new FormControl('');
    unameFilter = new FormControl('');
    emailFilter = new FormControl('');
    roleFilter = new FormControl('');
    filterValues = {
      name: '',
      username:'',
      email:'',
      role:''
    };
  dataSource!: MatTableDataSource<any>;
  @ViewChild('paginatorUser') paginatorUser!: MatPaginator;
  @ViewChild('sortUser') sortUser!: MatSort;
  pendingDataSource!: MatTableDataSource<any>;
  @ViewChild('paginatorPending') paginatorPending!: MatPaginator;
  @ViewChild('sortPendingUser') sortPendingUser!: MatSort;

  userType: any;
  displayedColumns: any;
  // @ViewChild(MatSort)
  // sort!: MatSort;
  constructor(private loginService: LoginService, public router: Router, public dialog: MatDialog,
    private notiServ: NotificationService, private restServ: RestService) { }

  ngOnInit(): void {
    this.userType = this.loginService.getUser().role;
    if (this.userType === 'admin') {
      this.userType = true;
      this.displayedColumns = this.displayedColumnsAdmin
    } else {
      this.userType = false;
      this.displayedColumns = this.displayedColumnsSuperAdmin
    }
    this.getUsers();
    this.getPendingUsers();
    
    this.nameFilter.valueChanges
    .subscribe(
      name => {        
        this.filterValues.name = name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_user=this.dataSource.filteredData.length
      }
    )
    this.unameFilter.valueChanges
    .subscribe(
      username => {        
        this.filterValues.username = username;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_user=this.dataSource.filteredData.length
      }
    )
    this.emailFilter.valueChanges
    .subscribe(
      email => {        
        this.filterValues.email = email;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_user=this.dataSource.filteredData.length
      }
    )
    this.roleFilter.valueChanges
    .subscribe(
      role => {        
        this.filterValues.role = role;
        this.dataSource.filter = JSON.stringify(this.filterValues);
        this.total_user=this.dataSource.filteredData.length
      }
    )
  }
  toggleDisplayDiv() {
    this.isShowDiv = !this.isShowDiv;
    this.isShowDiv1 = !this.isShowDiv1;
    if (this.isShowDiv) {
      this.user_count = this.total_user
      this.button_text = 'Pending Approval'
    }
    else {
      if (this.penStatus){
        this.pendAlert()
      }
      else{
        this.user_count = this.totalpending_user
        this.button_text = 'All users'
      }
     
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setValue(evt: any) {
    let dataToSend : any;
      dataToSend = evt;
      let reg = new RegExp("^[a-zA-Z0-9 ]+$")
 let emailReg = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
      if(!reg.test(dataToSend.name) || !reg.test(dataToSend.username) || !emailReg.test(dataToSend.email)){
        this.notiServ.showError("Invalid Pattern")
      }
      else{
        let url = environment.editUser
        this.getEditUserData=this.restServ.post(url,{"data":dataToSend},{}).subscribe(res=>{
          if (res.status == 1 ) {
                this.notiServ.showSuccess(res.message);
                this.getUsers();
                this.getPendingUsers();
              }
              else{
                this.notiServ.showError(res.message)
              }
        },
        (err) => {
            console.log(err)
            this.notiServ.showError(err.error)
          })
      }
  
  }
  
  getChanges(u:any,event:any,type:any){

    let val = event?.target?.value ? event.target.value : event.value;
    this.user = u;
    this.user[type] = val;
    
  }

  permission(evt: any) {
    let dataToSend = {
      user_id: evt.user_id,
      name: evt.name,
      role: evt.role,
      node_ids:evt.node_ids
    } 
    let dialogRef = this.dialog.open(PermissionComponent,{
      data: dataToSend
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.notiServ.showSuccess("Node assigned successfully");
      }
      this.getUsers();
      this.getPendingUsers();

    })
  }

  adduser() {
    let dialogRef = this.dialog.open(AddUserComponent);
    dialogRef.afterClosed().subscribe(res => {
      console.log(res)
      this.getUsers()
    })
  }
 

  getUsers() {
    let url = environment.viewUsers;
    this.getViewUsersData=this.restServ.getnew(url, {}, {}).subscribe(res => {
      this.dataSource = new MatTableDataSource(res.data)
      this.dataSource.paginator = this.paginatorUser;
      this.paginatorUser._intl.itemsPerPageLabel="Show Records/Page";
      this.dataSource.sort = this.sortUser;
      this.dataSource.filterPredicate = this.createFilter();
      this.total_user = this.dataSource.filteredData.length
      this.searchloaderxl = false;
      this.istable = false
      
    }, (err) => {
      console.log(err)
      this.notiServ.showError(err.error)
     
    })
  }
  getPendingUsers() {
    let url = environment.viewPendUsers;
    this.getViewPendUsersData=this.restServ.getnew(url, {}, {}).subscribe(res => {
    
        // console.log("pen",res.data.length)
        if(res.data.length==0){
          this.penStatus = true
        }
       
      this.pendingDataSource = new MatTableDataSource(res.data)
      this.pendingDataSource.paginator = this.paginatorPending;
      this.pendingDataSource.sort = this.sortPendingUser;
      
      this.totalpending_user = this.pendingDataSource.filteredData.length
      this.ispentable = false;
    }, (err) => {
      console.log(err)
      this.notiServ.showError(err.error)
     
    })
  }


  deleteUser(evt: any) {
    let dataToSend : any;
    console.log("evt",evt)
dataToSend = evt;
    
    Swal.fire({
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result:any) => {
      if (result.isConfirmed) {
        let url = environment.deleteUser
        this.getDeleteUserData=this.restServ.post(url,{"data":dataToSend},{}).subscribe(res=>{
          if(res.status == 1){
            this.getUsers();
            this.getPendingUsers();
            Swal.fire('Removed!', 'User removed successfully.', 'success');
          }
          else{
            Swal.fire('Cancelled', 'User not removed', 'error');
          }
        })
       
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'User not removed', 'error');
      }
      
    });

  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data:any, filter:any): boolean {
      let searchTerms = JSON.parse(filter);
      if(searchTerms.role != ''){
        return data.name.toString().toLowerCase().indexOf(searchTerms.name) !== -1
        && data.username.toString().toLowerCase().indexOf(searchTerms.username) !== -1
        && data.email.toString().toLowerCase().indexOf(searchTerms.email) !== -1
        && data.role ? data.role.toString().toLowerCase().indexOf(searchTerms.role) !== -1 : false
      }else{
        return data.name.toString().toLowerCase().indexOf(searchTerms.name) !== -1
        && data.username.toString().toLowerCase().indexOf(searchTerms.username) !== -1
        && data.email.toString().toLowerCase().indexOf(searchTerms.email) !== -1
      }
    }
    return filterFunction;
  }

  pendAlert(){
    this.toggleDisplayDiv()
        this.notiServ.alertNoData("No Data Found")
  }
  ngOnDestroy(): void{
  if(this.getEditUserData){
  this.getEditUserData.unsubscribe();
  }
  if(this.getViewUsersData){
  this.getViewUsersData.unsubscribe();
  }
  if(this.getViewPendUsersData){
  this.getViewPendUsersData.unsubscribe();
  }
  if(this.getDeleteUserData){
  this.getDeleteUserData.unsubscribe();
  }

  }

}