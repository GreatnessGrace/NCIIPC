import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

    constructor(private sanitized: DomSanitizer) {}
  transform(item: any) {
    // console.log('item',item);
    
    var  type = '↓ &emsp; Down';
    var diff = (new Date().getTime() - new Date(item).getTime());

            if ((diff / (1000 * 60)) > 240) {
               type = ' <button class="btn btn-down">↓ &emsp; Down </button>';
            } 
            // else if ((diff / (1000 * 60)) > 30) {
            //     type = '<span style="color: btn-down">Temporary Down ↓ </span>';
            // } 
            else if ((diff / (1000 * 60)) < 30){
               type = ' <button class="btn btn-up">↑ &emsp; Up </button> ';
            } else {
               type = '<button class="btn btn-down">↓ &emsp; Down </button>  ';
            }

    return this.sanitized.bypassSecurityTrustHtml(type);
  }
}
``