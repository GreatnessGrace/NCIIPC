import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userType : any='';
  constructor(private loginService:LoginService) { 
    this.userType  = this.loginService.getUser().role;
  }

  ngOnInit(): void {

  }

}
