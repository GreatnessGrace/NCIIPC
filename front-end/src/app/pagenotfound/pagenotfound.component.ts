import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent implements OnInit {
  assetPath = environment.assetPath;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  navigation(path?: any) {
    this.router.navigate([`/dashboard/${path}`])
  }
}
