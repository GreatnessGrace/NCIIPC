import { Component, OnInit,Inject } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as am5stock from '@amcharts/amcharts5/stock'


@Component({
  selector: 'app-node-health',
  templateUrl: './node-health.component.html',
  styleUrls: ['./node-health.component.scss']
})
export class NodeHealthComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NodeHealthComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any) { } 

    convertedData:any
    startDate:any
    endDate:any
    checkClick = true;
    ngOnInit(): void {
      this.getDateRange()
      this.convertedData = this.data.Object.map((item:any) => {
        const epoch = new Date(item.Date).getTime();
        return { Date: epoch, value: parseFloat(item.value), Volume: parseFloat(item.Volume) };
      });
      var root = am5.Root.new("chartdiv");
      root._logo?.dispose();
      root.setThemes([
        am5themes_Dark.new(root)
      ]);

var stockChart = root.container.children.push(am5stock.StockChart.new(root, {
}));

root.numberFormatter.set("numberFormat", "#,###.00");

var mainPanel = stockChart.panels.push(am5stock.StockPanel.new(root, {
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

var dateAxis = mainPanel.xAxes.push(am5xy.GaplessDateAxis.new(root, {
  baseInterval: {
    timeUnit: "minute",
    count: 1
  },
  renderer: am5xy.AxisRendererX.new(root, {}),
  tooltip: am5.Tooltip.new(root, {})
}));

var valueSeries = mainPanel.series.push(am5xy.LineSeries.new(root, {
  valueXField: "Date",
  valueYField: "Volume",
  calculateAggregates: true,
  xAxis: dateAxis,
  yAxis: valueAxis,
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

var volumeValueAxis = mainPanel.yAxes.push(am5xy.ValueAxis.new(root, {
  numberFormat: "#.#a",
  height: am5.percent(50),
  y: am5.percent(100),
  centerY: am5.percent(100),
  renderer: volumeAxisRenderer
}));

var volumeSeries = mainPanel.series.push(am5xy.ColumnSeries.new(root, {
  // name: "Volume",
  clustered: false,
  valueXField: "Date",
  valueYField: "Volume",
  xAxis: dateAxis,
  yAxis: volumeValueAxis,
}));

volumeSeries.columns.template.setAll({
  strokeOpacity: 0,
  fillOpacity: 0.5
});

volumeSeries.columns.template.adapters.add("fill", function(fill, target) {
  var dataItem = target.dataItem;
  if (dataItem) {
    return stockChart.getVolumeColor(dataItem);
  }
  return fill;
})

stockChart.set("volumeSeries", volumeSeries);
valueLegend.data.setAll([valueSeries]);

mainPanel.set("cursor", am5xy.XYCursor.new(root, {
  yAxis: valueAxis,
  xAxis: dateAxis,
  snapToSeries: [valueSeries],
  snapToSeriesBy: "y!"
}));

var scrollbar = mainPanel.set("scrollbarX", am5xy.XYChartScrollbar.new(root, {
  orientation: "horizontal",
  height: 50
}));
stockChart.toolsContainer.children.push(scrollbar);

var sbDateAxis = scrollbar.chart.xAxes.push(am5xy.GaplessDateAxis.new(root, {
  baseInterval: {
    timeUnit: "minute",
    count: 1
  },
  renderer: am5xy.AxisRendererX.new(root, {})
}));

var sbValueAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, {
  renderer: am5xy.AxisRendererY.new(root, {})
}));

var sbSeries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, {
  valueYField: "Volume",
  valueXField: "Date",
  xAxis: sbDateAxis,
  yAxis: sbValueAxis
}));

sbSeries.fills.template.setAll({
  visible: true,
  fillOpacity: 0.3
});

function getNewSettings(series:any) {
  var newSettings:any = [];
  am5.array.each(["name", "valueYField" , "calculateAggregates", "valueXField", "xAxis", "yAxis", "legendValueText", "stroke", "fill"], function(setting) {
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

valueSeries.events.once("datavalidated", function() {
  periodSelector.selectPeriod({ timeUnit: "hour", count: 1});
});


var cont:any = document.getElementById("chartcontrols")
let toolbar = am5stock.StockToolbar.new(root, {
  container: cont,
  stockChart: stockChart,
  controls: [periodSelector]
});

var data =this.convertedData

    let value = 0;
    let previousValue = 0;
    let color
    let previousColor = {};
    let previousDataObj:any = null;

    const mergedData = data.map((item:any) => {
      value = item.Volume;
  
      if (value > previousValue) {
        color = "#32CD32"
      } 
      else if(value == previousValue){
        color = previousColor
      }
      else {
        color ="#FF0000"
      }
  
      previousValue = value;
  
      const dataObj = {
        Date: item.Date,
        Volume: value,
        color: color,
      };
  
      // Only if the color has changed
      if (color !== previousColor) {
        if (!previousDataObj) {
          previousDataObj = dataObj;
          
        }
        previousDataObj.strokeSettings = { stroke: color };
        previousDataObj.bulletSettings = {fill:color,stroke:color};
      }
      else{
        previousDataObj.bulletSettings = {fill:color,stroke:color};
      }
  
      previousDataObj = dataObj;
      previousColor = color;
  
      return dataObj;
    });
    
valueSeries.strokes.template.setAll({
  templateField: "strokeSettings"
});

valueSeries.bullets.push(function() {
  return am5.Bullet.new(root, {
    locationY: 0,
    sprite: am5.Circle.new(root, {
      radius: 4,
      templateField: "bulletSettings",
      strokeWidth: 2,
    })
  });
});

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

    getClick(e:any){
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
            const twoHoursBefore = new Date(originalDateTime.getTime() - 60 * 60 * 1000);
            this.startDate = this.formatDate(twoHoursBefore)
          }
            break;
          case '2 hours': {
            const twoHoursBefore = new Date(originalDateTime.getTime() - 2*60 * 60 * 1000);
            this.startDate = this.formatDate(twoHoursBefore)
          }
            break;
            case '5 hours':{
              const twoHoursBefore = new Date(originalDateTime.getTime() - 5*60 * 60 * 1000);
              this.startDate = this.formatDate(twoHoursBefore)
            }
            break;
            case '12 hours':{
              const twoHoursBefore = new Date(originalDateTime.getTime() - 12*60 * 60 * 1000);
              this.startDate = this.formatDate(twoHoursBefore)
            }
            break;
            case 'Max':{
              this.startDate = this.data.Object[0].Date
            }
            break;
          }
      }

    }



    onchange(e:any){

      var dateRange :any = document.getElementById("chartdiv")?.children[0]?.children[3]?.children[8].getAttribute("aria-label")

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

   
getDateRange(){
  this.endDate = this.data.Object[this.data.Object.length - 1].Date;
  const givenDateTime = this.endDate
  const [datePart, timePart] = givenDateTime.split(" ");
  const [year, month, day] = datePart.split("-");
  const [hour, minute, second] = timePart.split(":");
  const originalDateTime = new Date(year, month - 1, day, hour, minute, second);
  const oneHourBefore = new Date(originalDateTime.getTime() - 60 * 60 * 1000);
this.startDate = this.formatDate(oneHourBefore)
}
  
formatDate(oneHourBefore:any){
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