import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RightClickService } from '../core/services/right-click.service';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  assetPath = environment.assetPath;
  constructor(
    private rightClickService: RightClickService) { }

  ngOnInit(): void {
  }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
}
