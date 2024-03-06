import { Component, ViewChild } from '@angular/core';
import { AdminNotificationsService } from '../core/services/admin-notifications.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { RightClickService } from '../core/services/right-click.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  markNoti !: Subscription
  getNoti !: Subscription
  notifications: any = [];
  noificationData = 0;
  currentTime = new Date();
  timeDifferences: any
  dataSource!: MatTableDataSource<any>;
  @ViewChild('notiSort') notiSort!: MatSort;
  @ViewChild('notiPaginator') notiPaginator!: MatPaginator;
  displayedColumns: string[] =
    ['createdAt',
      'notification_type',
      'timeDiff',
      'node_location',
      'node_id',
      'updated_by',
      'action_performed'];
  constructor(
    private adminNotif: AdminNotificationsService, private rightClickService: RightClickService
  ) { }
  onRightClick(event: MouseEvent): void {
    this.rightClickService.handleRightClick(event);
  }
  ngOnInit() {
    this.markNoti = this.adminNotif.markNotificationRead().subscribe((resp: any) => {
      if (resp && resp.data) {
        this.noificationData = 0
      }
    });
    this.getNoti = this.adminNotif.getNotifications().subscribe((resp) => {
      this.notifications = resp.data;
      this.timemap()
    });

  }

  timemap() {
    this.timeDifferences = this.notifications.map((obj: any) => {
      const objTime = new Date(obj.createdAt);
      const difference = this.currentTime.getTime() - objTime.getTime();
      const seconds = Math.floor(difference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      let timeDiff = ''
      if (hours <= 0) {
        timeDiff += `${minutes} min`;

      }
      else if (hours >= 24) {
        timeDiff += `${days} days`
      }
      else {
        timeDiff += `${hours} hour`;
      }
      return { ...obj, timeDiff };
    });
    this.getNotiData()
  }

 
  getNotiData() {
    this.dataSource = new MatTableDataSource(this.timeDifferences);
    this.dataSource.paginator = this.notiPaginator;
    this.dataSource.sort = this.notiSort
  }

  ngOnDestroy(): void {
    if (this.markNoti) {
      this.markNoti.unsubscribe()
    }
    if (this.getNoti) {
      this.getNoti.unsubscribe()
    }
  }
}
