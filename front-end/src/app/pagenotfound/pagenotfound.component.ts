import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { RightClickService } from '../core/services/right-click.service';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent implements OnInit {
  assetPath = environment.assetPath;
  constructor(private router: Router, private rightClickService: RightClickService) { }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit(): void {
  }
  navigation(path?: any) {
    this.router.navigate([`/dashboard/${path}`])
  }
}
