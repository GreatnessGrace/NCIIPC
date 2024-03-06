import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/core/services/login.service';
import { RightClickService } from 'src/app/core/services/right-click.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userType : any='';
  message:any;
  constructor(private loginService:LoginService,
    private rightClickService: RightClickService) { 
    this.userType  = this.loginService.getUser().role;
  }

  ngOnInit(): void {

  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
}
