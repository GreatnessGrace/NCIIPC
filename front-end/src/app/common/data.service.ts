import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getCookie, setCookie } from 'typescript-cookie';

@Injectable()
export class DataService {

  private newDataKey = 'localData';
  private newData = new BehaviorSubject<any>(this.retrieveDataFromLocalStorage());

  constructor() { }

  private retrieveDataFromLocalStorage(): any {
    const storedData = getCookie(this.newDataKey);
    return storedData ? JSON.parse(storedData) : { alert: '' };
    
  }


  private saveDataToLocalStorage(data: any): void {
    setCookie(this.newDataKey, JSON.stringify(data));
  }

  setNewDataInfo(data: any) {
    this.newData.next(data);
    this.saveDataToLocalStorage(data);
  }

  getNewDataInfo() {
    return this.newData.asObservable();
  }
}
