import { Component, Input } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent {
  chartDisplayId: any;
  @Input() lineChart: any;
  @Input()
  set lineId(value: any) {
    this.chartDisplayId = 'lineDiv' + value + Math.floor((Math.random() * 10) + 1);
  }
  get lineId() {
    return this.chartDisplayId;
  }
  label: any;
  ngAfterViewInit() {


    var that = this;


    let root = am5.Root.new(this.chartDisplayId);

    root._logo?.dispose();
    // root.setThemes([am5themes_Dark.new(root)]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,

      wheelX: "panX",
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      pinchZoomX: true
    }));
    chart.root.dom.style.height = "380px";

    function generateDatas(count: any) {


      let data = [];
      for (var i = 0; i < count.time.buckets.length; ++i) {
        data.push({ date: count.time.buckets[i].key, value: count.time.buckets[i].doc_count });
      }
      return data;
    }


    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.5,
      baseInterval: {
        timeUnit: "hour",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));


    if (this.lineChart.data && this.lineChart.data.length > 0) {
      for (var i = 0; i < this.lineChart.data.length; i++) {

        if (this.lineChart.status == 1) {
          this.label = "Port "
        }
        else {
          this.label = ''
        }
        let series = chart.series.push(am5xy.LineSeries.new(root, {
          name: this.label + this.lineChart.data[i].key,
          xAxis: xAxis,
          yAxis: yAxis,

          valueYField: "value",
          valueXField: "date",
          legendValueText: "{valueY}",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{valueY}"
          })
        }));
        series.strokes.template.setAll({
          strokeWidth: 2,

        });


        let data = generateDatas(this.lineChart.data[i]);
        series.data.setAll(data);
        series.appear();
      }
    }

    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    chart.set("scrollbarY", am5.Scrollbar.new(root, {
      orientation: "vertical"
    }));

    let legend = chart.bottomAxesContainer.children.push(am5.Legend.new(root, {


      paddingTop: 10,
      paddingBottom: 10,
      x: am5.percent(50),
      centerX: am5.percent(50),

      height: 70,
      layout: root.gridLayout,
      verticalScrollbar: am5.Scrollbar.new(root, {
        orientation: "vertical"
      })
    }));


    legend.itemContainers.template.events.on("pointerover", function (e: any) {
      let itemContainer = e.target;


      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries: any) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000)
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3
          });
        }
      })
    })

    legend.itemContainers.template.events.on("pointerout", function (e: any) {
      let itemContainer = e.target;
      let series = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries: any) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 2,
          stroke: chartSeries.get("fill")
        });
      });
    })

    legend.itemContainers.template.set("height", am5.p50);
    legend.data.setAll(chart.series.values);
    chart.appear(100, 0);
  }

}