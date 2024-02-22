import { Component, Input } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { __values } from 'tslib';

@Component({
  selector: 'app-child-chart',
  templateUrl: './child-chart.component.html',
  styleUrls: ['./child-chart.component.scss']
})
export class ChildChartComponent {

  // private root!: am5.Root;
  chartDisplayId: any;
  @Input() chartData: any;
  @Input() 
  set chartId(value: any) {
    this.chartDisplayId = 'chartDiv' + value + Math.floor((Math.random() * 10) + 1);
  }
  get chartId() {
    return this.chartDisplayId;
  }


  constructor() { }

  ngAfterViewInit() {
 
    let root = am5.Root.new(this.chartDisplayId);
    root._logo?.dispose();
    // root.setThemes([am5themes_Dark.new(root)]);

    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50),
        radius: am5.percent(60)
      })
    );

    let series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "category",
      alignLabels: true
    }));
    series.slices.template.setAll({
      // fillOpacity: 0.5,
      stroke: am5.color("#fff"),
      strokeWidth: 2,
      tooltipText: "{category}: {value}"
    });
   
    
    series.labels.template.setAll({
      textType: "circular",
      centerX: 0,
      centerY: 0,
      maxWidth: 150,
      oversizedBehavior: "wrap",
      // text:  "[bold]{valuePercentTotal.formatNumber('0.00')}%[/] ({value})",
    });

    let sendData: any = [];
    if (this.chartData.data && !this.chartData.data.length) {
      this.noDataToDisplay(root, series);
    }

    this.chartData.data.forEach((elem: any) => {
      sendData.push({
        value: elem.doc_count,
        category: elem.key
        
      })
    });
    
    series.data.setAll(sendData);
    series.appear(1000, 100);
  }

  noDataToDisplay(root: any, series: any) {
    var modal = am5.Modal.new(root, {
      content: "No data to display."
    });

    series.events.on("datavalidated", (ev: any) => {
      var series = ev.target;
      if (ev.target.data.length < 1) {  
        // Generate placeholder data
        var placeholder = [];
        for (let i = 0; i < 3; i++) {
          var item: any = {};
          item['category'] = "";
          item['value'] = 1;
          placeholder.push(item)
        }
        series.data.setAll(placeholder);
        
        // Disable ticks/labels
        series.labels.template.set("forceHidden", true);
        series.ticks.template.set("forceHidden", true);
        
        // Show modal
        modal.open();
      }
    });
  }


}
