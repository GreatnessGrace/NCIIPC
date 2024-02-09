import { trim } from '@amcharts/amcharts5/.internal/core/util/Utils';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'countryname'
})
export class CountryName implements PipeTransform {

    constructor() {}
  transform(item: string) {
    

    var matches = item.substring(0, item.indexOf('('));
    if (matches) {
        var submatch = trim(matches);
    }  else{
        var submatch = item;
    }
   return submatch.replace(/\s+/g, '-');
  }
}
