import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
@Injectable({
  providedIn: 'root'
})
export class RightClickService {

  constructor(private notiserv : NotificationService) { }
  handleRightClick(event: MouseEvent): void {
    event.preventDefault();
    // this.notiserv.tinyAlert("Right-click is disabled")
  // alert("Right-click is disabled")
  }
}
