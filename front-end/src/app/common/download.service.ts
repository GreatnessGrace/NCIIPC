import { Injectable } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { RestService } from '../core/services/rest.service';
import { NotificationService } from '../core/services/notification.service';




@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  constructor(private restService: RestService, private dialog: MatDialog, private notificationService: NotificationService) { }

  


  trimSpace(keyword: any) {
    return keyword.trim();
  }


  validateUrl(value: string) {
    return /^((?:https):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?)?$/i.test(value);
    //return /^((https):\/\/)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9\-#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/.test(value);
  }

  isValidEmail(email: string) {
    var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return email.match(emailformat);
  }

  isValidMobile(numberStr: string) {
    var regx = /^\d{10}$/;
    if (numberStr.match(regx)) {
      return true;
    } else {
      return false;
    }
  }


  getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  
  createRandomId() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
  }

  createRandomIntegerId() {
    return Math.floor(Math.random() * 1000000)
  }

  initCap(str: string) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }


  autoSaveForm(storyForm:any, saveFn:any) {
    storyForm.valueChanges
      .pipe(
        debounceTime(3000),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        saveFn();
      });
  }

  formatDate(dateString:any) {
    var date = new Date(dateString);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return (month + '-' + day + '-' + year);
  }

  getDaysDiff(startDate:any, endDate:any) {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  prepareDateRangeArr(startDate:any, length:any) {
    var dateRangeArr = [];
    var date = new Date(startDate);
    dateRangeArr.push(this.formatDate(date));
    for (var i = 0; i < length; i++) {
      date.setDate(date.getDate() + 1);
      dateRangeArr.push(this.formatDate(date));
    }
    return dateRangeArr;
  }

  prepareWeekRangeArr(startDate:any, length:any) {
    var weekRangeArr = [];
    var date = new Date(startDate);
    if (length < 6) {
      weekRangeArr.push(this.formatDate(date) + '_' + this.formatDate(date.setDate(date.getDate() + length)))
    } else {
      var weeks = Math.floor(length / 7);
      var days = length % 7;
      for (var i = 0; i < weeks; i++) {
        if (i == 0) {
          weekRangeArr.push(this.formatDate(date) + '_' + this.formatDate(date.setDate(date.getDate() + 6)))
        } else {
          weekRangeArr.push(this.formatDate(date.setDate(date.getDate() + 1)) + '_' + this.formatDate(date.setDate(date.getDate() + 6)))
        }
      }
      if (days) {
        weekRangeArr.push(this.formatDate(date.setDate(date.getDate() + 1)) + '_' + this.formatDate(date.setDate(date.getDate() + days)))
      }
    }
    return weekRangeArr;
  }

  prepareMonthRangeArr(startDate:any, endDate:any) {
    var sdate = this.formatDate(new Date(startDate));
    var edate = this.formatDate(new Date(endDate));
    var start = sdate.split('-');
    var end = edate.split('-');
    var startYear = parseInt(start[2]);
    var endYear = parseInt(end[2]);
    var monthRangeArr = [];

    for (var i = startYear; i <= endYear; i++) {
      var endMonth = i != endYear ? 11 : parseInt(end[0]) - 1;
      var startMon = i === startYear ? parseInt(start[0]) - 1 : 0;
      for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        var month = j;
        monthRangeArr.push(this.monthArr[month]);
      }
    }

    return monthRangeArr;
  }

  groupBy(data:any, groupedBy:any) {
    return data.reduce(function (map:any, obj:any) {
      (map[obj[groupedBy]] = map[obj[groupedBy]] || []).push(obj);
      return map;
    }, {});
  };

  groupByDate(data:any, groupedBy:any) {
    var that = this;
    return data.reduce(function (map:any, obj:any) {
      var groupDate = that.formatDate(obj[groupedBy]);
      (map[groupDate] = map[groupDate] || []).push(obj);
      return map;
    }, {});
  };

  groupByWeek(data:any, groupedBy:any, weekArr:any) {
    var that = this;
    return data.reduce(function (map:any, obj:any) {
      var groupDate = that.formatDate(obj[groupedBy]);
      for (var i = 0; i < weekArr.length; i++) {
        if (new Date(groupDate) >= new Date(weekArr[i].split('_')[0]) && new Date(groupDate) <= new Date(weekArr[i].split('_')[1])) {
          (map[weekArr[i]] = map[weekArr[i]] || []).push(obj);
        }
      }
      return map;
    }, {});
  };

  groupByMonth(data:any, groupedBy:any, monthArr:any) {
    var that = this;
    return data.reduce(function (map:any, obj:any) {
      var groupDate = new Date(obj[groupedBy]);
      for (var i = 0; i < monthArr.length; i++) {
        if (groupDate.getMonth() == that.monthArr.indexOf(monthArr[i])) {
          (map[monthArr[i]] = map[monthArr[i]] || []).push(obj);
        }
      }
      return map;
    }, {});
  };


  exportExcel(tableId:any, type:any): void {
    var fileName = tableId + '_' + type + '.xlsx'
    let element = document.getElementById(tableId);
    if (element) {
      let compare = tableId + 'compare';
      let elementcompare = document.getElementById(compare);
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
  
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      if (elementcompare && elementcompare != undefined) {
        const wsc: XLSX.WorkSheet = XLSX.utils.table_to_sheet(elementcompare);
        XLSX.utils.book_append_sheet(wb, wsc, 'SheetCompare');
      }
      XLSX.writeFile(wb, fileName);

      //var msg = 'Data Exported Successfully';
      this.notificationService.showSuccess('Reports exported successfully');
    } else {
      this.notificationService.showError('No data found');
    }
  }

  exportjson(tableId:any, type:any, showPopup=true,json:any): void {

    var fields = Object.keys(json[0])
    var replacer = function(key:any, value:any) { return value === null ? '' : value } 
    var csv = json.map(function(row:any){
      return fields.map(function(fieldName){
        return JSON.stringify(row[fieldName], replacer)
      }).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    csv = csv.join('\r\n');
  
  }
  exportCsv(tableId:any, type:any, showPopup=true): void {
    let csv = '';
    let table = document.getElementById(tableId);
    if (table) {
      let tr = table.children[0].children[0];

      for (let i = 0; i < tr.children.length; i++) {
        csv += tr.children[i].textContent + ",";
      }
      csv = csv.substring(0, csv.length - 1) + "\n";

      csv = csv.substring(1, csv.length - 1) + "\n";
      let tbody = table.children[1];
      for (let i = 0; i < tbody.children.length; i++) {
        for (let j = 0; j < tbody.children[i].children.length; j++) {
          let coma = tbody.children[i].children[j].textContent?.replace(/,/g, '  ')
          csv+=coma+",";
        }
        csv = csv.substring(0, csv.length - 1) + "\n";
      }
      csv = csv.substring(0, csv.length - 1) + "\n";
      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
      hiddenElement.target = '_blank';
      hiddenElement.download = tableId + '_' + type + '.csv';
      hiddenElement.click();
      // var msg = 'Data Exported Successfully';
      // this.notificationService.showSuccess(msg);
      if (showPopup) {
        this.notificationService.showSuccess('Reports exported successfully');
      }
    } else {
      this.notificationService.showError('No data found');
    }
  }



  cloneObject(object:any) {
    return JSON.parse(JSON.stringify(object));
  }


  isEmpty(data: any) {
    if (typeof (data) == 'string') {
      if (data == "<br>") {
        return true;
      } else {
        data = data.trim();
      }
    }
    if (typeof (data) == 'number' || typeof (data) == 'boolean') {
      return false;
    }
    if (typeof (data) == 'undefined' || data === null) {
      return true;
    }
    if (typeof (data.length) != 'undefined') {
      return data.length == 0;
    }
    var count = 0;
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        count++;
      }
    }
    return count == 0;
  }


  stripHtml(html:any) {
    let tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = html;
    return tmpDiv.textContent || tmpDiv.innerText || "";
  }

  removeInlineStyle(content:any) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = content;
    tmpDiv.querySelectorAll('*').forEach(function (node) {
      node.removeAttribute('style');
      //node.removeAttribute('class');
    });
    return tmpDiv.innerHTML;
  }



  dataURItoBlob(dataURI:any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }


}
