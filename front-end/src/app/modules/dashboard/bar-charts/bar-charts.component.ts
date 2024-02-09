import { Component, Input } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

@Component({
  selector: 'app-bar-charts',
  templateUrl: './bar-charts.component.html',
  styleUrls: ['./bar-charts.component.scss']
})
export class BarChartsComponent {
  chartDisplayId: any;
  @Input() chartData: any;
  @Input()
  set chartId(value: any) {
    this.chartDisplayId = 'chartDivData' + value;
  }
  get chartId() {
    return this.chartDisplayId;
  }

  ngAfterViewInit() {
    let root = am5.Root.new(this.chartDisplayId);
    root._logo?.dispose();
    // root.setThemes([am5themes_Dark.new(root)]);
    let chart = root.container.children.push(am5xy.XYChart.new(root, {}));
    let sendData: any = [];
   
    this.chartData.data.forEach((elem: any) => {
      sendData.push({
        value: + elem.doc_count,
        category: elem.key
      })
    });

    let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "category",
      renderer: xRenderer,
      visible: false,
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1
    });

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: yRenderer,
      min: 0
    }));
      
    chart.set("scrollbarY", am5.Scrollbar.new(root, {
      orientation: "vertical"
    }));
    let categories: any = [];
    if (!this.chartData.data || !this.chartData.data.length) {
      categories = [{ category: 10 }, { category: 20 }, { category: 30 }, { category: 40 }];
      sendData = [{ category: 10, value: 0 }, { category: 20, value: 0 }, { category: 30, value: 0 }, { category: 40, value: 0 }]
      var modal = am5.Modal.new(root, {
        content: "No data to display."
      });
      modal.open();
    } else {
      categories = sendData.map((x: any) => {
        return { category: x.category }
      });
    }

    xAxis.data.setAll(categories);
    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          keepTargetHover: true,
          labelText: "{categoryX}: {value}"
        })
      })
    );
    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationX: 0.5,
        locationY: 0.96,
        sprite: am5.Label.new(root, {
          centerY: am5.p50,
          rotation: -90,
          text: "{categoryX}",
          populateText: true
        })
      });
    });
  

    series.columns.template.setAll({
      maxWidth: 50,
      tooltipY: 0,
      tooltipText: "{categoryX}: {value}"
    });

    series.data.setAll(sendData);
    series.appear(1000, 100);
    chart.appear(1000, 100);
  }
}
