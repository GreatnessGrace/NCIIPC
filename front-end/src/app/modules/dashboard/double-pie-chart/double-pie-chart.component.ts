import { Component, Input, OnInit } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';

@Component({
  selector: 'app-double-pie-chart',
  templateUrl: './double-pie-chart.component.html',
  styleUrls: ['./double-pie-chart.component.scss']
})
export class DoublePieChartComponent {
  chartDisplayId: any;
  @Input() lineChart: any;
  @Input()
  set lineId(value: any) {
    // console.log("chartDisplayId", value)

    this.chartDisplayId = 'lineDiv' + value + Math.floor((Math.random() * 10) + 7);

  }
  get lineId() {
    return this.chartDisplayId;
  }
  constructor() { }

  ngAfterViewInit(): void {
    // console.log("linechart", this.lineChart)

    // Create root element
    var root = am5.Root.new(this.chartDisplayId);

    // Set themes

    // root.setThemes([am5themes_Animated.new(root)]);
    root._logo?.dispose();
    // root.setThemes([am5themes_Dark.new(root)]);

    var container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        layout: root.horizontalLayout
      })
    );

    // Create main chart
    var chart = container.children.push(
      am5percent.PieChart.new(root, {
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    // Create series
    var series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        innerRadius: am5.percent(35),
        radius: am5.percent(80)
      })
    );

    series.labels.template.setAll({
      radius: 40,
      // text: "{category}: {value}" // Display the value
    });
    // series.ticks.template.set("visible", false);
    series.slices.template.set("toggleKey", "none");

    series.slices.template.setAll({
      tooltipText: "{category}: {value}"
    });


    // add events
    series.slices.template.events.on("click", function (e: { target: any; }) {
      selectSlice(e.target);
    });

    // Create sub chart
    var subChart = container.children.push(
      am5percent.PieChart.new(root, {
        // radius: am5.percent(50),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    // Create sub series
    var subSeries = subChart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        layout: root.verticalLayout,
        innerRadius: am5.percent(30),
        radius: am5.percent(60)
      })
    );



    // Set labels template for subSeries
    subSeries.labels.template.setAll({
      radius: 4,
      // text: "{category}: {value}", // Display the value
    });
    subSeries.data.setAll([
      { category: "A", value: 0 },
      { category: "B", value: 0 },
      { category: "C", value: 0 },
      { category: "D", value: 0 },
      { category: "E", value: 0 },
      { category: "F", value: 0 },
      { category: "G", value: 0 }
    ]);

    subSeries.slices.template.setAll({
      // fillOpacity: 0.5,
      stroke: am5.color("#0a0d16"),
      strokeWidth: 2,
      tooltipText: "{category}: {value}"
    });

    // subSeries.slices.template.set("toggleKey", "none");

    var selectedSlice: { get: (arg0: string) => any; };

    series.on("startAngle", function () {
      updateLines();
    });

    container.events.on("boundschanged", function () {
      root.events.once("frameended", function () {
        updateLines();
      })
    });

    function updateLines() {
      if (selectedSlice) {
        var startAngle = selectedSlice.get("startAngle");
        var arc = selectedSlice.get("arc");
        var radius = selectedSlice.get("radius");

        var x00 = radius * am5.math.cos(startAngle);
        var y00 = radius * am5.math.sin(startAngle);

        var x10 = radius * am5.math.cos(startAngle + arc);
        var y10 = radius * am5.math.sin(startAngle + arc);
        // var subRadius = subSeries.slices.getIndex(0).get("radius");
        var subRadius = subSeries?.slices?.getIndex(0)?.get("radius") ?? 0;

        var x01 = 0;
        // var y01 = -subRadius;
        var y01 = -(subRadius ?? 0);

        var x11 = 0;
        var y11 = subRadius;

        var point00 = series.toGlobal({ x: x00, y: y00 });
        var point10 = series.toGlobal({ x: x10, y: y10 });

        var point01 = subSeries.toGlobal({ x: x01, y: y01 });
        var point11 = subSeries.toGlobal({ x: x11, y: y11 });

        line0.set("points", [point00, point01]);
        line1.set("points", [point10, point11]);
      }
    }

    // lines
    var line0 = container.children.push(
      am5.Line.new(root, {
        position: "absolute",
        stroke: root.interfaceColors.get("text"),
        strokeDasharray: [2, 2]
      })
    );
    var line1 = container.children.push(
      am5.Line.new(root, {
        position: "absolute",
        stroke: root.interfaceColors.get("text"),
        strokeDasharray: [2, 2]
      })
    );

    if (this.lineChart.data && !this.lineChart.data.length) {
      this.noDataToDisplay(root, series);
    }
    series.data.setAll(
      this.lineChart.data

    );

    function selectSlice(slice: { dataItem: any; get: (arg0: string) => number; }) {
      selectedSlice = slice;
      var dataItem = slice.dataItem;
      var dataContext = dataItem.dataContext;

      if (dataContext) {
        var i = 0;
        subSeries.data.each(function (dataObject: any) {
          var dataObj = dataContext.subData[i];
          if (dataObj) {
            if (!subSeries.dataItems[i].get("visible")) {
              subSeries.dataItems[i].show();
            }
            subSeries.data.setIndex(i, dataObj);
          }
          else {
            subSeries.dataItems[i].hide();
          }

          i++;
        });
      }

      var middleAngle = slice.get("startAngle") + slice.get("arc") / 2;
      var firstAngle = series.dataItems[0].get("slice").get("startAngle");

      const animatedFirstAngle = firstAngle ?? 0;

      series.animate({
        key: "startAngle",
        // to: firstAngle - middleAngle,
        to: animatedFirstAngle - middleAngle,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic)
      });
      series.animate({
        key: "endAngle",
        // to: firstAngle - middleAngle + 360,
        to: animatedFirstAngle - middleAngle + 360,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic)
      });
    }

    container.appear(1000, 10);

    // series.events.on("datavalidated", function () {
    //   selectSlice(series.slices.getIndex(0));
    // });
    series.events.on("datavalidated", function () {
      const firstSlice = series.slices.getIndex(0);
      if (firstSlice) {
        selectSlice(firstSlice);
      }
    });

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

        series.data.setAll(
          [
            {
              category: "",
              value: 1,
              subData: [
                { category: "", value: 1 },
                { category: "", value: 1 },
                { category: "", value: 1 },
              ]
            }
          ]
        )

        // series.data.setAll(placeholder);

        // Disable ticks/labels
        series.labels.template.set("forceHidden", true);
        series.ticks.template.set("forceHidden", true);

        // Show modal
        modal.open();
      }
    });
  }

}
