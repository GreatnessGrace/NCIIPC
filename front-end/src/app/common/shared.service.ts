import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  getStartAndEndDate(caseNumber: number) {
    // console.log('caseNumber',caseNumber);
    
    const dateFormat = "YYYY-MM-DD HH:mm:ss";
    const maxdateFormat = "YYYY-MM-DD";
    let startDate = '', endDate = '';
    switch (caseNumber) {
      case 1:
        startDate = moment().subtract(24, 'hour').format(dateFormat);
        endDate = moment().format(dateFormat);
        break;
      case 2:
        startDate = moment().subtract(7, 'days').format(dateFormat);
        endDate = moment().format(dateFormat);
        break;
      case 3:
        startDate = moment().subtract(1, 'month').format(dateFormat);
        endDate = moment().format(dateFormat);
        break;
      case 4:
        startDate = moment().subtract(3, 'month').format(dateFormat);
        endDate = moment().format(dateFormat);
        break;
      case 5:
        startDate = moment().subtract(1, 'month').format(dateFormat);
        endDate = moment().format(dateFormat);
        break;
      default:
    }

    // console.log('startDate',startDate,'endDate',endDate);
    
    return {
      startDate, endDate
    }
  }

  formatMinMaxDate(minDate: any, maxDate: any) {
    const dateFormat = "YYYY-MM-DD";
    let startDate =  moment(minDate, "DD/MM/YYYY").format(dateFormat);
    let endDate = moment(maxDate, "DD/MM/YYYY").format(dateFormat);
    return {
      startDate, endDate
    }
  }

  getGcaptchaSiteKey(){
    const siteKey = '6LeZaHImAAAAAOJaHVFOfRbOY9G8FvDtwGmyQjx2';
    return siteKey;
  }
    getGcaptchaSecretKey(){
      const secretKey = '6LeZaHImAAAAAN5ww1hKnfoCNfDtVgmG782bMW77';
      return secretKey;
  }
}
