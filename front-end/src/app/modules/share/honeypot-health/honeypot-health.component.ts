import { Component, OnInit, Inject } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as am5stock from '@amcharts/amcharts5/stock'


@Component({
  selector: 'app-honeypot-health',
  templateUrl: './honeypot-health.component.html',
  styleUrls: ['./honeypot-health.component.scss']
})
export class HoneypotHealthComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<HoneypotHealthComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any) { }

  convertedData: any
  startDate: any
  endDate: any
  checkClick = true;
    

  ngOnInit(): void {
    this.getDateRange()
    this.convertedData = this.data.Object.map((item: any) => {
      const epoch = new Date(item.Date).getTime();
      return { Date: epoch, value: parseFloat(item.value), Volume: parseFloat(item.Volume) };
    });

    var root = am5.Root.new("chartdiv");
    root._logo?.dispose();
    root.setThemes([
      am5themes_Dark.new(root)
    ]);

    var root1 = am5.Root.new("chartdiv1");
    root1._logo?.dispose();
    root1.setThemes([
      am5themes_Dark.new(root1)
    ]);

    var stockChart = root.container.children.push(am5stock.StockChart.new(root, {
    }));
    var stockChart1 = root1.container.children.push(am5stock.StockChart.new(root1, {
    }));

    root.numberFormatter.set("numberFormat", "#,###.00");
    root1.numberFormatter.set("numberFormat", "#,###.00");

    var mainPanel = stockChart.panels.push(am5stock.StockPanel.new(root, {
      wheelY: "zoomX",
      panX: true,
      panY: true
    }));

    var mainPanel1 = stockChart1.panels.push(am5stock.StockPanel.new(root1, {
      wheelY: "zoomX",
      panX: true,
      panY: true
    }));

    var valueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        pan: "zoom"
      }),
      extraMin: 0.1, // adds some space for for main series
      tooltip: am5.Tooltip.new(root, {}),
      numberFormat: "#,###.00",
      extraTooltipPrecision: 2
    }));
    var valueAxis1 = mainPanel1.yAxes.push(am5xy.ValueAxis.new(root1, {
      renderer: am5xy.AxisRendererY.new(root1, {
        pan: "zoom"
      }),
      extraMin: 0.1, // adds some space for for main series
      tooltip: am5.Tooltip.new(root, {}),
      numberFormat: "#,###.00",
      extraTooltipPrecision: 2
    }));

    var dateAxis = mainPanel.xAxes.push(am5xy.GaplessDateAxis.new(root, {
      baseInterval: {
        timeUnit: "minute",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));
    var dateAxis1 = mainPanel1.xAxes.push(am5xy.GaplessDateAxis.new(root1, {
      baseInterval: {
        timeUnit: "minute",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root1, {}),
      tooltip: am5.Tooltip.new(root1, {})
    }));


    var valueSeries = mainPanel.series.push(am5xy.SmoothedXLineSeries.new(root, {
      valueXField: "Date",
      valueYField: "Volume",
      calculateAggregates: true,
      xAxis: dateAxis,
      yAxis: valueAxis,
      // fill: am5.color("#FF0000"),
      //   stroke: am5.color("#FF0000")
    }));
    var valueSeries1 = mainPanel1.series.push(am5xy.SmoothedXLineSeries.new(root1, {
      valueXField: "Date",
      valueYField: "Volume",
      calculateAggregates: true,
      xAxis: dateAxis1,
      yAxis: valueAxis1,
      // fill: am5.color("#FF0000"),
      //   stroke: am5.color("#FF0000")
    }));


    stockChart.set("stockSeries", valueSeries);

    var valueLegend = mainPanel.plotContainer.children.push(am5stock.StockLegend.new(root, {
      stockChart: stockChart
    }));

    var volumeAxisRenderer = am5xy.AxisRendererY.new(root, {
      inside: true
    });
    stockChart1.set("stockSeries", valueSeries1);

    var valueLegend1 = mainPanel1.plotContainer.children.push(am5stock.StockLegend.new(root1, {
      stockChart: stockChart1
    }));

    var volumeAxisRenderer1 = am5xy.AxisRendererY.new(root1, {
      inside: true
    });

    var volumeValueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
      numberFormat: "#.#a",
      height: am5.percent(50),
      y: am5.percent(100),
      centerY: am5.percent(100),
      renderer: volumeAxisRenderer
    }));
    var volumeValueAxis1 = mainPanel1.yAxes.push(am5xy.ValueAxis.new(root1, {
      numberFormat: "#.#a",
      height: am5.percent(50),
      y: am5.percent(100),
      centerY: am5.percent(100),
      renderer: volumeAxisRenderer1
    }));

    var volumeSeries = mainPanel.series.push(am5xy.ColumnSeries.new(root, {
      // name: "Volume",
      clustered: false,
      valueXField: "Date",
      valueYField: "Volume",
      xAxis: dateAxis,
      yAxis: volumeValueAxis,
    }));
    var volumeSeries1 = mainPanel1.series.push(am5xy.ColumnSeries.new(root1, {
      // name: "Volume",
      clustered: false,
      valueXField: "Date",
      valueYField: "Volume",
      xAxis: dateAxis1,
      yAxis: volumeValueAxis1,
    }));

    volumeSeries.columns.template.setAll({
      strokeOpacity: 0,
      fillOpacity: 0.5
    });
    volumeSeries1.columns.template.setAll({
      strokeOpacity: 0,
      fillOpacity: 0.5
    });

    volumeSeries.columns.template.adapters.add("fill", function (fill, target) {
      var dataItem = target.dataItem;
      if (dataItem) {
        return stockChart.getVolumeColor(dataItem);
      }
      return fill;
    })
    volumeSeries1.columns.template.adapters.add("fill", function (fill, target) {
      var dataItem1 = target.dataItem;
      if (dataItem1) {
        return stockChart.getVolumeColor(dataItem1);
      }
      return fill;
    })

    stockChart.set("volumeSeries", volumeSeries);
    valueLegend.data.setAll([valueSeries]);
    stockChart1.set("volumeSeries", volumeSeries1);
    valueLegend1.data.setAll([valueSeries1]);

    mainPanel.set("cursor", am5xy.XYCursor.new(root, {
      yAxis: valueAxis,
      xAxis: dateAxis,
      snapToSeries: [valueSeries],
      snapToSeriesBy: "y!"
    }));
    mainPanel1.set("cursor", am5xy.XYCursor.new(root1, {
      yAxis: valueAxis1,
      xAxis: dateAxis1,
      snapToSeries: [valueSeries1],
      snapToSeriesBy: "y!"
    }));

    var scrollbar = mainPanel.set("scrollbarX", am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
      height: 50
    }));
    stockChart.toolsContainer.children.push(scrollbar);
    var scrollbar1 = mainPanel1.set("scrollbarX", am5xy.XYChartScrollbar.new(root1, {
      orientation: "horizontal",
      height: 50
    }));
    stockChart1.toolsContainer.children.push(scrollbar1);

    var sbDateAxis = scrollbar.chart.xAxes.push(am5xy.GaplessDateAxis.new(root, {
      baseInterval: {
        timeUnit: "minute",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {})
    }));
    var sbDateAxis1 = scrollbar1.chart.xAxes.push(am5xy.GaplessDateAxis.new(root1, {
      baseInterval: {
        timeUnit: "minute",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root1, {})
    }));

    var sbValueAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));
    var sbValueAxis1 = scrollbar1.chart.yAxes.push(am5xy.ValueAxis.new(root1, {
      renderer: am5xy.AxisRendererY.new(root1, {})
    }));

    var sbSeries = scrollbar.chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      valueYField: "Volume",
      valueXField: "Date",
      xAxis: sbDateAxis,
      yAxis: sbValueAxis
    }));
    var sbSeries1 = scrollbar1.chart.series.push(am5xy.SmoothedXLineSeries.new(root1, {
      valueYField: "Volume",
      valueXField: "Date",
      xAxis: sbDateAxis1,
      yAxis: sbValueAxis1
    }));

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });
    sbSeries1.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3
    });

    function getNewSettings(series: any) {
      var newSettings: any = [];
      am5.array.each(["name", "valueYField", "calculateAggregates", "valueXField", "xAxis", "yAxis", "legendValueText", "stroke", "fill"], function (setting) {
        newSettings[setting] = series.get(setting);
      });
      return newSettings;
    }
    function getNewSettings1(series: any) {
      var newSettings: any = [];
      am5.array.each(["name", "valueYField", "calculateAggregates", "valueXField", "xAxis", "yAxis", "legendValueText", "stroke", "fill"], function (setting) {
        newSettings[setting] = series.get(setting);
      });
      return newSettings;
    }

    let periodSelector = am5stock.PeriodSelector.new(root, {
      stockChart: stockChart,
      periods: [
        { timeUnit: "hour", count: 1, name: "1 hour" },
        { timeUnit: "hour", count: 2, name: "2 hours" },
        { timeUnit: "hour", count: 5, name: "5 hours" },
        { timeUnit: "hour", count: 12, name: "12 hours" },
        { timeUnit: "max", name: "Max" },
      ]
    });
    let periodSelector1 = am5stock.PeriodSelector.new(root1, {
      stockChart: stockChart1,
      periods: [
        { timeUnit: "hour", count: 1, name: "1 hour" },
        { timeUnit: "hour", count: 2, name: "2 hours" },
        { timeUnit: "hour", count: 5, name: "5 hours" },
        { timeUnit: "hour", count: 12, name: "12 hours" },
        { timeUnit: "max", name: "Max" },
      ]
    });

    valueSeries.events.once("datavalidated", function () {
      periodSelector.selectPeriod({ timeUnit: "hour", count: 1 });
    });
    valueSeries1.events.once("datavalidated", function () {
      periodSelector1.selectPeriod({ timeUnit: "hour", count: 1 });
    });


    var cont: any = document.getElementById("chartcontrols")
    let toolbar = am5stock.StockToolbar.new(root, {
      container: cont,
      stockChart: stockChart,
      controls: [periodSelector]
    });
    var cont1: any = document.getElementById("chartcontrols1")
    let toolbar1 = am5stock.StockToolbar.new(root1, {
      container: cont1,
      stockChart: stockChart1,
      controls: [periodSelector1]
    });

    var data = this.convertedData

    let value = 0;
    let previousValue = 0;
    let color
    let previousColor = {};
    let previousDataObj: any = null;

    const mergedData = data.map((item: any) => {
      // value = item.Volume;

      // if (value > previousValue) {
        color = "#32CD32"
      // }
      // else if (value == previousValue) {
      //   color = previousColor
      // }
      // else {
      //   color = "#32CD32"
      // }

      previousValue = value;

      const dataObj = {
        Date: item.Date,
        Volume: item.value,
        color: color,
      };

      // Only if the color has changed
      if (color !== previousColor) {
        if (!previousDataObj) {
          previousDataObj = dataObj;

        }
        previousDataObj.strokeSettings = { stroke: color };
        previousDataObj.bulletSettings = { fill: color, stroke: color };
      }
      else {
        previousDataObj.bulletSettings = { fill: color, stroke: color };
      }

      previousDataObj = dataObj;
      // previousColor = color;

      return dataObj;
    });

    var data1=this.convertedData;
    const mergedData1 = data1.map((item: any) => {
      // value = item.Volume;

      // if (value > previousValue) {
        color = "#32CD32"
      // }
      // else if (value == previousValue) {
      //   color = previousColor
      // }
      // else {
      //   color = "#32CD32"
      // }

      previousValue = value;

      const dataObj1 = {
        Date: item.Date,
        Volume: item.Volume,
        color: color,
      };

      // Only if the color has changed
      if (color !== previousColor) {
        if (!previousDataObj) {
          previousDataObj = dataObj1;

        }
        previousDataObj.strokeSettings1 = { stroke: color };
        previousDataObj.bulletSettings1 = { fill: color, stroke: color };
      }
      else {
        previousDataObj.bulletSettings1 = { fill: color, stroke: color };
      }

      previousDataObj = dataObj1;
      // previousColor = color;

      // previousDataObj = dataObj1;
      // previousColor = color;

      return dataObj1;
    });

    valueSeries.strokes.template.setAll({
      templateField: "strokeSettings"
    });
    valueSeries1.strokes.template.setAll({
      templateField: "strokeSettings1"
    });

    valueSeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 4,
          templateField: "bulletSettings",
          strokeWidth: 2,
        })
      });
    });
    valueSeries1.bullets.push(function () {
      return am5.Bullet.new(root1, {
        locationY: 0,
        sprite: am5.Circle.new(root1, {
          radius: 4,
          templateField: "bulletSettings1",
          strokeWidth: 2,
        })
      });
    });
valueSeries1.data.setAll(mergedData1);
    sbSeries1.data.setAll(mergedData1);
    valueSeries.data.setAll(mergedData);
    sbSeries.data.setAll(mergedData);
    

  }

  closeButton(type: any | undefined) {
    if (type == 'simple') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close("I am closed!!")
    }
  }

  getClick(e: any) {
    this.getDateRange()
    var innerHTML
    const activeElement = document.getElementById("chartcontrols")?.children[0]?.children[1]?.querySelector('.am5stock-active')
    if (activeElement) {
      innerHTML = activeElement.innerHTML;
      const givenDateTime = this.endDate
      const [datePart, timePart] = givenDateTime.split(" ");
      const [year, month, day] = datePart.split("-");
      const [hour, minute, second] = timePart.split(":");
      const originalDateTime = new Date(year, month - 1, day, hour, minute, second);
      switch (innerHTML) {
        case '1 hour': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '2 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (2 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '5 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (5 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '12 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (12 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case 'Max': {
          this.startDate = this.data.Object[0].Date
        }
          break;
      }
    }

  }
  getClick1(e: any) {
    this.getDateRange()
    var innerHTML
    const activeElement = document.getElementById("chartcontrols1")?.children[0]?.children[1]?.querySelector('.am5stock-active')
    if (activeElement) {
      innerHTML = activeElement.innerHTML;
      const givenDateTime = this.endDate
      const [datePart, timePart] = givenDateTime.split(" ");
      const [year, month, day] = datePart.split("-");
      const [hour, minute, second] = timePart.split(":");
      const originalDateTime = new Date(year, month - 1, day, hour, minute, second);
      switch (innerHTML) {
        case '1 hour': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '2 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (2 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '5 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (5 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case '12 hours': {
          const twoHoursBefore = new Date(originalDateTime.getTime() - (12 * 60 * 60 * 1000));
          this.startDate = this.formatDate(twoHoursBefore)
        }
          break;
        case 'Max': {
          this.startDate = this.data.Object[0].Date
        }
          break;
      }
    }

  }

  onchange(e: any) {

    var dateRange: any = document.getElementById("chartdiv")?.children[0]?.children[3]?.children[8].getAttribute("aria-label")
    const dateTimePattern = /(\d{2}:\d{2}) - (\w{3} \d{2}, \d{4})/g;
    const timePattern = /(\d{2}:\d{2})/g;
    const datePattern = /(\w{3} \d{2}, \d{4})/g;

    // Extract the start and end dates and times
    const matches = [...dateRange.matchAll(dateTimePattern)];

    const startDateTimeStr = matches[0][0];
    const startDateStr = startDateTimeStr.match(datePattern)?.[0];
    const startTimeStr = startDateTimeStr.match(timePattern)?.[0];
    const startDate = new Date(startDateStr + " " + startTimeStr);

    const endDateTimeStr = matches[1][0];
    const endDateStr = endDateTimeStr.match(datePattern)?.[0];
    const endTimeStr = endDateTimeStr.match(timePattern)?.[0];
    const endDate = new Date(endDateStr + " " + endTimeStr);

    // Compare dates and assign start and end dates accordingly
    let finalStartDate: Date;
    let finalEndDate: Date;

    if (startDate.getTime() < endDate.getTime()) {
      finalStartDate = startDate;
      finalEndDate = endDate;
    } else {
      finalStartDate = endDate;
      finalEndDate = startDate;
    }

    // Format the start and end dates as "YYYY-MM-DD HH:mm:ss"
    const formattedStartDate = finalStartDate.toISOString().slice(0, 19).replace("T", " ");
    const formattedEndDate = finalEndDate.toISOString().slice(0, 19).replace("T", " ");

    this.startDate = formattedStartDate
    this.endDate = formattedEndDate
  }
  onchange1(e: any) {

    var dateRange: any = document.getElementById("chartdiv1")?.children[0]?.children[3]?.children[8].getAttribute("aria-label")
    const dateTimePattern = /(\d{2}:\d{2}) - (\w{3} \d{2}, \d{4})/g;
    const timePattern = /(\d{2}:\d{2})/g;
    const datePattern = /(\w{3} \d{2}, \d{4})/g;

    // Extract the start and end dates and times
    const matches = [...dateRange.matchAll(dateTimePattern)];

    const startDateTimeStr = matches[0][0];
    const startDateStr = startDateTimeStr.match(datePattern)?.[0];
    const startTimeStr = startDateTimeStr.match(timePattern)?.[0];
    const startDate = new Date(startDateStr + " " + startTimeStr);

    const endDateTimeStr = matches[1][0];
    const endDateStr = endDateTimeStr.match(datePattern)?.[0];
    const endTimeStr = endDateTimeStr.match(timePattern)?.[0];
    const endDate = new Date(endDateStr + " " + endTimeStr);

    // Compare dates and assign start and end dates accordingly
    let finalStartDate: Date;
    let finalEndDate: Date;

    if (startDate.getTime() < endDate.getTime()) {
      finalStartDate = startDate;
      finalEndDate = endDate;
    } else {
      finalStartDate = endDate;
      finalEndDate = startDate;
    }

    // Format the start and end dates as "YYYY-MM-DD HH:mm:ss"
    const formattedStartDate = finalStartDate.toISOString().slice(0, 19).replace("T", " ");
    const formattedEndDate = finalEndDate.toISOString().slice(0, 19).replace("T", " ");

    this.startDate = formattedStartDate
    this.endDate = formattedEndDate
  }


  getDateRange() {
    this.endDate = this.data.Object[this.data.Object.length - 1].Date;
    const givenDateTime = this.endDate
    const [datePart, timePart] = givenDateTime.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");
    const originalDateTime = new Date(year, month - 1, day, hour, minute, second);
    const oneHourBefore = new Date(originalDateTime.getTime() - 60 * 60 * 1000);
    this.startDate = this.formatDate(oneHourBefore)
  }

  formatDate(oneHourBefore: any) {
    const formattedDateTime = `${oneHourBefore.getFullYear()}-${(oneHourBefore.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${oneHourBefore.getDate().toString().padStart(2, "0")} ${oneHourBefore
        .getHours()
        .toString()
        .padStart(2, "0")}:${oneHourBefore.getMinutes().toString().padStart(2, "0")}:${oneHourBefore
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
    return formattedDateTime
  }

}