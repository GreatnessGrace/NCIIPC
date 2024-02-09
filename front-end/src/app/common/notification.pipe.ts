import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notification'
})
export class NotificationPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): unknown {
    let notificationType = '';
    if (args && args.length && args[0] == 'action') {
      switch (value.notification_type) {
        case 'user_node_update':
          notificationType = 'Node ' + value.node_id + ' is assigned to ' + value?.user?.name + ' by ' + value?.admin_user?.name;
          break;
        case 'user_add':
          notificationType = 'User ' + value?.user?.name + ' is waiting for approval';
          break;
        case 'node_down':
          notificationType = 'Node ' + value.node_id  + ' is down.';
          break;
          case 'node_up':
            notificationType = 'Node ' + value.node_id  + ' is up.';
            break;
      }
    } else {
      switch (value) {
        case 'user_node_update':
          notificationType = 'Node assigned';
          break;
        case 'user_add':
          notificationType = 'Pending Approval';
          break;
        case 'node_down':
          notificationType = 'Node Down';
          break;
          case 'node_up':
            notificationType = 'Node Up';
            break;
      }
    }
    return notificationType;
  }

}
